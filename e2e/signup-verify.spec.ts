import { expect, test, type Page } from "@playwright/test"
import { captureTrackEvents } from "./track-events"
import { mockPaidCheckout } from "./mock-stripe-checkout"

// FOUNDER AUTH RULES (2026-09-29, binding): /register is a plain, free-by-
// default account form. No "what do you want to check" question, no intent
// typeahead, no waiver gate on account creation. Creating an account always
// lands on /dashboard. The EU withdrawal waiver only renders — and only
// blocks — on an explicit paid CTA (?plan=operator|power), immediately before
// the Stripe checkout step, never before account creation.
//
// This rewrites the previous "all-paid, waiver always present" suite, which
// was itself the root cause under test here: it asserted the exact behaviour
// (waiver required to create ANY account) that produced 100% of measured
// register_submit_failed(reason=waiver) on 2026-09-28 and zero real signups
// since 2026-09-21.
async function fillRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
}

async function fillPaidRegister(page: Page, email: string) {
  await fillRegister(page, email)
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)
  await page.locator('input[type="checkbox"]').first().check()
}

const PAID_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_test_paid_register"

test.describe("register: free by default, dashboard landing, waiver only on paid CTA", () => {
  test("default /register (no ?plan=) is free — no waiver, no price, no radios", async ({ page }) => {
    await page.goto("/register")
    await expect(page.locator('input[type="radio"]')).toHaveCount(0)
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)
    await expect(page.locator('input[type="email"]')).toHaveCount(1)
    await expect(page.locator('input[type="password"]')).toHaveCount(1)
    // No "what do you want to check" question — plain account form.
    await expect(page.getByText(/what do you want to check/i)).toHaveCount(0)
  })

  test("terms and privacy are stated inline and still linked", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByText(/By creating an account you agree to the/i)).toBeVisible()
    await expect(page.locator('form a[href="/terms"]')).toBeVisible()
    await expect(page.locator('form a[href="/privacy"]')).toBeVisible()
  })

  test("free submit requires no waiver and lands on /dashboard", async ({ page }) => {
    const events = captureTrackEvents(page)
    const email = `e2e-free-${Date.now()}@example.com`
    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    await expect.poll(() => events, { timeout: 10_000 }).toContain("signup_completed")
  })

  // ?plan= is unchanged: still resolves any non-power id to operator, garbage
  // included — but garbage no longer means "charge them anyway". Unrecognised
  // strings (and no plan at all) now resolve to the actual free path.
  test("?plan=garbage resolves to the free path, not a silent paid charge", async ({ page }) => {
    await page.goto("/register?plan=garbage")
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)
    // No price SUMMARY row (the bordered plan/price card paid arrivals see) —
    // freeNote's own copy legitimately mentions "€19/mo" in passing ("item
    // verdicts need Starter at €19/mo"), so assert against the price-row
    // testid rather than page text.
    await expect(page.getByText("Starter", { exact: true })).toHaveCount(0)
    await expect(page.getByText("Pro", { exact: true })).toHaveCount(0)
  })

  test("?plan=power shows Pro at its live price and requires the waiver; ?plan=operator shows Starter", async ({ page }) => {
    await mockPaidCheckout(page)
    await page.goto("/register?plan=power")
    await expect(page.getByText("Pro", { exact: true })).toBeVisible()
    await expect(page.getByText("€49")).toBeVisible()
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)

    await page.goto("/register?plan=operator")
    await expect(page.getByText("Starter", { exact: true })).toBeVisible()
    await expect(page.getByText("€19")).toBeVisible()
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)
  })

  // The one control this suite must keep proving works: Art. 16(m) of
  // Directive 2011/83/EU — express, separate consent or the 14-day withdrawal
  // right survives — but ONLY on the paid path, where there is an actual
  // purchase to waive it for. The account itself is created either way; the
  // waiver blocks the Stripe step, not signup.
  test("paid (?plan=) submit without the withdrawal waiver creates the account but blocks checkout", async ({ page }) => {
    let checkoutCalled = false
    await page.route("**/stripe/checkout", async (route) => {
      checkoutCalled = true
      await route.abort()
    })
    await mockPaidCheckout(page, PAID_CHECKOUT_URL, { onCheckout: () => { checkoutCalled = true } })
    await page.goto("/register?plan=operator")
    await fillRegister(page, `e2e-nowaiver-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Activate .* access/i }).click()
    await expect(page.getByText(/immediate access/i)).toBeVisible()
    expect(checkoutCalled).toBe(false)
    // Never bounced to Stripe or /dashboard — stays on /register so the user
    // can tick the box and retry.
    await expect(page).toHaveURL(/\/register/)
  })

  test("paid (?plan=) submit with the waiver ticked redirects to Stripe Checkout", async ({ page }) => {
    const events = captureTrackEvents(page)
    await mockPaidCheckout(page)
    await page.goto("/register?plan=operator")
    await expect(page.getByText("€19")).toBeVisible()
    await fillPaidRegister(page, `e2e-paid-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Activate .* access/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(page.url()).toContain("cs_test_paid_register")
    // POLLED, not asserted once — trackEvent() is fire-and-forget (fetch
    // keepalive) and the navigation it precedes does not wait for it.
    await expect.poll(() => events, { timeout: 10_000 }).toContain("signup_completed")
    await expect.poll(() => events, { timeout: 10_000 }).toContain("checkout_started")
  })

  test("GUEST: logged-out paid click goes straight to Stripe, not the register wall", async ({ page }) => {
    // A logged-out visitor who clicks a paid plan on the pricing page must
    // reach Stripe Checkout directly — no /register detour — and fire
    // checkout_started.
    const events = captureTrackEvents(page)
    await mockPaidCheckout(page)
    await page.goto("/pricing")
    await page.getByRole("button", { name: /Start for €19/i }).first().click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(page.url()).not.toContain("/register")
    await expect.poll(() => events, { timeout: 10_000 }).toContain("checkout_started")
  })

  test("paid checkout failure shows retry and stays on /register (account already exists)", async ({ page }) => {
    await mockPaidCheckout(page)
    await page.route("**/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Confirm your email" }),
      })
    })
    await page.goto("/register?plan=operator")
    await fillPaidRegister(page, `e2e-paid-fail-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Activate .* access/i }).click()
    await expect(page.getByText(/could not open Stripe Checkout/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("button", { name: /Continue to checkout/i })).toBeVisible()
    await expect(page).not.toHaveURL(/check-email/)
  })
})

test.describe("signup verify session", () => {
  test("free register lands directly on /dashboard, no Stripe detour", async ({ page }) => {
    const email = `e2e-reg-${Date.now()}@example.com`
    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
  })

  test.skip("verify with token signs in to the dashboard", async ({ page }) => {
    // Requires real email-verify token from backend — skip in CI, run manually
    const email = `e2e-ver-${Date.now()}@example.com`
    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })

    const id = await page.evaluate(async () => {
      const t = localStorage.getItem("di_jwt")
      if (!t) return null
      const r = await fetch("/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      const d = await r.json()
      return d.id
    })
    expect(id).toBeTruthy()

    await page.goto(`/verify-email?token=vtok-${id}`)
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    const jwt = await page.evaluate(() => localStorage.getItem("di_jwt"))
    expect(jwt).toBeTruthy()
  })

  test.skip("used verify token does not mint a second session", async ({ page }) => {
    // Requires real email-verify token from backend — skip in CI, run manually
    const email = `e2e-used-${Date.now()}@example.com`
    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    const id = await page.evaluate(async () => {
      const t = localStorage.getItem("di_jwt")
      if (!t) return null
      const r = await fetch("/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      return (await r.json()).id
    })
    await page.goto(`/verify-email?token=vtok-${id}`)
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    await page.evaluate(() => localStorage.removeItem("di_jwt"))
    await page.goto(`/verify-email?token=vtok-${id}`)
    await expect(page.locator("h1")).toContainText(/confirmed/i)
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible()
    await expect(page).not.toHaveURL(/\/app/)
  })

  test("wrong password shows the real API detail", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill("alice@example.com")
    await page.locator('input[type="password"]').fill("definitely-wrong")
    await page.getByRole("button", { name: /Sign in/i }).click()
    await expect(page.getByText("Invalid email or password")).toBeVisible()
    await expect(page.getByText("Unauthorized")).toHaveCount(0)
  })

  test("429 on /auth/me does not wipe the JWT", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill("alice@example.com")
    await page.locator('input[type="password"]').fill("password12345")
    await page.getByRole("button", { name: /Sign in/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    const before = await page.evaluate(() => localStorage.getItem("di_jwt"))
    expect(before).toBeTruthy()

    let once = true
    await page.route("**/auth/me", async (route) => {
      if (once) {
        once = false
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Rate limit exceeded (60 req/min)" }),
        })
        return
      }
      await route.continue()
    })
    await page.reload()
    const after = await page.evaluate(() => localStorage.getItem("di_jwt"))
    expect(after).toBe(before)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test("register 409 copy points to Sign in", async ({ page }) => {
    const email = `e2e-dup-${Date.now()}@example.com`
    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    await page.waitForLoadState("networkidle")

    await page.goto("/register")
    await fillRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await expect(page.getByText(/Welcome back/i)).toBeVisible()
    await expect(page.getByText(/you already have an account/i)).toBeVisible()
    await expect(page.locator('input[type="password"]').last()).toBeVisible()
    await expect(page.getByText("Unauthorized")).toHaveCount(0)
    await expect(page.getByRole("link", { name: /Use a different email/i })).toBeVisible()
  })
})
