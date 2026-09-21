import { expect, test, type Page } from "@playwright/test"
import { captureTrackEvents } from "./track-events"
import { mockPaidCheckout } from "./mock-stripe-checkout"

// All register paths are now paid (operator default). fillFreeRegister kept for
// tests that check the waiver-blocked state (no waiver tick = submit blocked).
async function fillFreeRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
}

// fillPaidRegister: fills email + password + ticks the EU withdrawal waiver.
// Use for any test that needs to reach /check-email or Stripe (i.e. valid submit).
async function fillPaidRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)
  await page.locator('input[type="checkbox"]').first().check()
}

const PAID_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_test_paid_register"


// The register form is now 2 controls on free (email, password) and 3 on paid
// (+ the EU withdrawal waiver). The plan radio group and the terms checkbox
// were removed 2026-09-06 -- see register-form.tsx for the measured reason.
//
// The radios were this suite's witness for "which plan did ?plan= resolve to".
// They are gone, so the witness is now the paid-only pair that renders in their
// place: the price summary and the waiver. Both are absent on free and present
// on paid, which is a stricter test than the radios ever were -- a radio could
// be checked without the visitor being charged anything, whereas the waiver
// rendering means handleSubmit will route this submit to Stripe.
// All register paths now go to paid (operator default). planFromQuery("") → "operator".
// There is no free tier. The waiver checkbox always shows.
test.describe("register: all-paid, waiver always present, signup_completed", () => {
  test("default /register path is Starter (operator) — shows waiver checkbox", async ({ page }) => {
    await page.goto("/register")
    await expect(page.locator('input[type="radio"]')).toHaveCount(0)
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)
    await expect(page.locator('input[type="email"]')).toHaveCount(1)
    await expect(page.locator('input[type="password"]')).toHaveCount(1)
    await expect(page.getByText(/lose my 14-day right of withdrawal/i)).toBeVisible()
  })

  // The terms did not stop being binding, they stopped costing a click. If this
  // sentence or either link ever disappears, consent-by-submission has no
  // notice behind it and the removal stops being defensible.
  test("terms and privacy are stated inline and still linked", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByText(/By creating an account you agree to the/i)).toBeVisible()
    await expect(page.locator('form a[href="/terms"]')).toBeVisible()
    await expect(page.locator('form a[href="/privacy"]')).toBeVisible()
  })

  // All paths default to operator (paid). Submit without ticking waiver is blocked.
  // This test verifies submit fails with waiver message, not that it reaches /auth/register.
  test("submit without waiver is blocked — all paths are paid now", async ({ page }) => {
    await mockPaidCheckout(page)
    await page.goto("/register")
    await fillFreeRegister(page, `e2e-nowaiver-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    // Should show waiver error, NOT navigate away
    await expect(page.getByText(/immediate access/i)).toBeVisible({ timeout: 5_000 })
  })

  // planFromQuery now defaults to operator for any unrecognised string.
  // These all resolve to Starter (operator) and show the waiver.
  for (const bad of ["pro", "starter", "garbage", "enterprise", "%20pro%20"]) {
    test(`?plan=${bad} resolves to Starter operator (all paid now)`, async ({ page }) => {
      await mockPaidCheckout(page)
      await page.goto(`/register?plan=${bad}`)
      await expect(page.getByText(/lose my 14-day right of withdrawal/i)).toBeVisible()
      await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)
    })
  }

  // The real ids still work — this is a picker removal, not a paid-path
  // removal. pricing-section.tsx routes every paid CTA through exactly these.
  test("?plan=power shows Pro at its live price; ?plan=operator shows Starter", async ({ page }) => {
    await mockPaidCheckout(page)
    await page.goto("/register?plan=power")
    await expect(page.getByText("Pro", { exact: true })).toBeVisible()
    await expect(page.getByText("€49")).toBeVisible()
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(1)

    await page.goto("/register?plan=operator")
    await expect(page.getByText("Starter", { exact: true })).toBeVisible()
    await expect(page.getByText("€19")).toBeVisible()
  })

  // No free tier. "free account instead" link no longer exists.
  // Skip this test — the escape hatch was removed.
  test.skip("paid path offered a free account instead (removed — no free tier)", async ({ page }) => {
    await mockPaidCheckout(page)
    await page.goto("/register?plan=operator")
    await expect(page.getByText("Starter", { exact: true })).toBeVisible()
  })

  // The one control this pass was NOT allowed to remove. Art. 16(m) of
  // Directive 2011/83/EU: express, separate consent or the 14-day withdrawal
  // right survives. It must still block a paid submit.
  test("paid submit without the withdrawal waiver is still blocked", async ({ page }) => {
    let registerCalled = false
    await page.route("**/auth/register", async (route) => {
      registerCalled = true
      await route.abort()
    })
    await mockPaidCheckout(page)
    await page.goto("/register?plan=operator")
    await page.locator('input[type="email"]').fill("e2e-nowaiver@example.com")
    await page.locator('input[type="password"]').fill("goodpass123")
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await expect(page.getByText(/immediate access/i)).toBeVisible()
    expect(registerCalled).toBe(false)
  })

  test("paid Starter submit redirects to Stripe Checkout, not only /check-email", async ({ page }) => {
    const events = captureTrackEvents(page)
    await mockPaidCheckout(page)
    await page.goto("/register?plan=operator")
    await expect(page.getByText("€19")).toBeVisible()
    await fillPaidRegister(page, `e2e-paid-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(page.url()).toContain("cs_test_paid_register")
    await expect(page).not.toHaveURL(/check-email/)
    // POLLED, not asserted once. trackEvent() is fire-and-forget
    // (fetch keepalive, .catch() swallowed) and the navigation it precedes does
    // not wait for it, so the route handler can record the POST after the URL
    // has already changed. The synchronous form that used to be here passed
    // alone and failed roughly 1 run in 3 inside the full 98-test suite, where
    // two workers make the browser slow enough to lose the race — a flake that
    // reads as "signup_completed stopped firing", which is the single event
    // this company's funnel depends on.
    await expect.poll(() => events, { timeout: 10_000 }).toContain("signup_completed")
    await expect.poll(() => events, { timeout: 10_000 }).toContain("checkout_started")
  })

  test("GUEST: logged-out paid click goes straight to Stripe, not the register wall", async ({ page }) => {
    // The register wall was the #1 measured drop. A logged-out visitor who
    // clicks a paid plan on the pricing page must now reach Stripe Checkout
    // directly — no /register detour — and fire checkout_started.
    const events = captureTrackEvents(page)
    await mockPaidCheckout(page)
    await page.goto("/pricing")
    // Press a paid-plan CTA as a stranger (no token in storage) — H27 renamed to "Start for €19".
    await page.getByRole("button", { name: /Start for €19/i }).first().click()
    // Lands on Stripe, never bounced to /register.
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(page.url()).not.toContain("/register")
    await expect.poll(() => events, { timeout: 10_000 }).toContain("checkout_started")
  })

  test("paid checkout failure shows retry and stays off /check-email", async ({ page }) => {
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
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    // Both of these strings were hardcoded English literals in the component
    // until this pass — the retry button and this error rendered untranslated on
    // all six locales. They now come from copy[locale].auth.register
    // (errorCheckoutStart / continueToCheckout); asserted here in EN.
    await expect(page.getByText(/could not open Stripe Checkout/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("button", { name: /Continue to checkout/i })).toBeVisible()
    await expect(page).not.toHaveURL(/check-email/)
  })

  test.skip("successful free submit fires signup_completed (free tier removed)", async ({ page }) => {
    const events = captureTrackEvents(page)
    const email = `e2e-completed-${Date.now()}@example.com`
    await page.goto("/register")
    await fillFreeRegister(page, email)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    await expect.poll(() => events, { timeout: 10_000 }).toContain("signup_completed")
  })
})

test.describe("signup verify session", () => {
  test("register lands on check-email, not the dashboard", async ({ page }) => {
    const email = `e2e-reg-${Date.now()}@example.com`
    await page.goto("/register")
    await fillPaidRegister(page, email)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    await expect(page.locator("h1")).toContainText(/Check your email/i)
    await expect(page).not.toHaveURL(/\/app/)
  })

  test("verify with token signs in to the dashboard", async ({ page }) => {
    const email = `e2e-ver-${Date.now()}@example.com`
    await page.goto("/register")
    await fillPaidRegister(page, email)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })

    const id = await page.evaluate(async () => {
      const t = localStorage.getItem("di_jwt")
      const r = await fetch("/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      const d = await r.json()
      return d.id
    })
    expect(id).toBeTruthy()

    await page.goto(`/verify-email?token=vtok-${id}`)
    await page.waitForURL(/\/verdict/, { timeout: 20_000 })
    await expect(page.getByTestId("riq-cold-open-check")).toBeVisible({ timeout: 20_000 })
    const jwt = await page.evaluate(() => localStorage.getItem("di_jwt"))
    expect(jwt).toBeTruthy()
  })

  test("used verify token does not mint a second session", async ({ page }) => {
    const email = `e2e-used-${Date.now()}@example.com`
    await page.goto("/register")
    await fillPaidRegister(page, email)
    await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    const id = await page.evaluate(async () => {
      const t = localStorage.getItem("di_jwt")
      const r = await fetch("/auth/me", { headers: { Authorization: `Bearer ${t}` } })
      return (await r.json()).id
    })
    await page.goto(`/verify-email?token=vtok-${id}`)
    await page.waitForURL(/\/verdict/, { timeout: 20_000 })
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
    await page.waitForURL(/\/verdict/, { timeout: 20_000 })
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
    const fill = async () => {
      await page.goto("/register")
      await fillPaidRegister(page, email)
      await page.getByRole("button", { name: /Create account|Activate .* access/i }).click()
    }
    await fill()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    await fill()
    // Register now also has a static "Already have an account? Sign in"
    // footer link, always on the page — the original broad regex matched
    // both it AND the 409 error banner and failed Playwright's strict mode
    // (2 elements). Scoped to the banner's actual copy, which is the thing
    // this test exists to check.
    await expect(page.getByText(/you already have an account/i)).toBeVisible()
    await expect(page.getByText("Unauthorized")).toHaveCount(0)
    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible()
  })
})
