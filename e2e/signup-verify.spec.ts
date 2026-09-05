import { expect, test, type Page } from "@playwright/test"

async function fillFreeRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
  await page.locator('input[type="checkbox"]').first().check()
}

async function fillPaidRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
  await page.locator('input[type="checkbox"]').first().check()
  await page.locator('input[type="checkbox"]').nth(1).check()
}

const PAID_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_test_paid_register"

async function mockPaidCheckout(page: Page, checkoutUrl = PAID_CHECKOUT_URL) {
  await page.route("**/stripe/plans", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        publishable_key: null,
        stripe_enabled: true,
        plans: [
          { id: "operator", price_eur: 19, price_id: "price_operator_test" },
          { id: "power", price_eur: 49, price_id: "price_power_test" },
          { id: "free", price_eur: 0 },
        ],
      }),
    })
  })
  await page.route("**/stripe/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkout_url: checkoutUrl }),
    })
  })
  await page.route("https://checkout.stripe.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stripe checkout</body></html>",
    })
  })
}

test.describe("register leak — free default, TOS gate, signup_completed", () => {
  test("unspecified plan defaults to free and does not show the waiver", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByRole("radio", { name: /Free/i })).toBeChecked()
    await expect(page.getByRole("radio", { name: /Pro/i })).not.toBeChecked()
    await expect(page.getByText(/lose my 14-day right of withdrawal/i)).toHaveCount(0)
    const radios = page.locator('input[type="radio"]')
    await expect(radios).toHaveCount(3)
    await expect(radios.nth(0)).toBeChecked()
  })

  test("?plan=pro selects Pro (alias of power)", async ({ page }) => {
    await page.goto("/register?plan=pro")
    await expect(page.getByRole("radio", { name: /Pro/i })).toBeChecked()
    await expect(page.getByRole("radio", { name: /Free/i })).not.toBeChecked()
    await expect(page.getByText(/lose my 14-day right of withdrawal/i)).toBeVisible()
  })

  test("?plan=starter selects Starter (alias of operator)", async ({ page }) => {
    await page.goto("/register?plan=starter")
    // Accessible name is the whole label (title + description). Free's copy also
    // contains "Starter", so match the radio that *starts* with Starter.
    const radios = page.locator('input[type="radio"]')
    await expect(radios).toHaveCount(3)
    await expect(radios.nth(1)).toBeChecked()
    await expect(radios.nth(0)).not.toBeChecked()
  })

  test("?plan=garbage stays Free", async ({ page }) => {
    await page.goto("/register?plan=garbage")
    await expect(page.getByRole("radio", { name: /Free/i })).toBeChecked()
    await expect(page.getByRole("radio", { name: /Pro/i })).not.toBeChecked()
  })

  test("paid Starter submit redirects to Stripe Checkout, not only /check-email", async ({ page }) => {
    const events: string[] = []
    await page.route("**/api/track", async (route) => {
      try {
        const body = route.request().postDataJSON() as { event?: string } | null
        if (body?.event) events.push(body.event)
      } catch {
        // why: a malformed track body must not fail the checkout path under test
      }
      await route.fulfill({ status: 204, body: "" })
    })
    await mockPaidCheckout(page)
    await page.goto("/register?plan=operator")
    const radios = page.locator('input[type="radio"]')
    await expect(radios.nth(1)).toBeChecked()
    await fillPaidRegister(page, `e2e-paid-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(page.url()).toContain("cs_test_paid_register")
    await expect(page).not.toHaveURL(/check-email/)
    expect(events).toContain("signup_completed")
    expect(events).toContain("checkout_started")
  })

  test("paid checkout failure shows retry and stays off /check-email", async ({ page }) => {
    await page.route("**/stripe/plans", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          publishable_key: null,
          stripe_enabled: true,
          plans: [
            { id: "operator", price_eur: 19, price_id: "price_operator_test" },
            { id: "power", price_eur: 49, price_id: "price_power_test" },
          ],
        }),
      })
    })
    await page.route("**/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Confirm your email" }),
      })
    })
    await page.goto("/register?plan=operator")
    await fillPaidRegister(page, `e2e-paid-fail-${Date.now()}@example.com`)
    await page.getByRole("button", { name: /Create account/i }).click()
    await expect(page.getByText(/Could not start Stripe checkout/i)).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole("button", { name: /Continue to checkout/i })).toBeVisible()
    await expect(page).not.toHaveURL(/check-email/)
  })

  test("submit without TOS shows error and does not call register", async ({ page }) => {
    let registerCalled = false
    await page.route("**/auth/register", async (route) => {
      registerCalled = true
      await route.abort()
    })
    await page.goto("/register")
    await page.locator('input[type="email"]').fill("leak-tos@example.com")
    await page.locator('input[type="password"]').fill("goodpass123")
    await page.getByRole("button", { name: /Create account/i }).click()
    await expect(page.getByText(/Please accept the Terms of Service/i)).toBeVisible()
    expect(registerCalled).toBe(false)
  })

  test("successful free submit fires signup_completed", async ({ page }) => {
    const events: string[] = []
    await page.route("**/api/track", async (route) => {
      try {
        const body = route.request().postDataJSON() as { event?: string } | null
        if (body?.event) events.push(body.event)
      } catch {
        // why: a malformed track body must not fail the signup path under test
      }
      await route.fulfill({ status: 204, body: "" })
    })
    const email = `e2e-completed-${Date.now()}@example.com`
    await page.goto("/register")
    await fillFreeRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    expect(events).toContain("signup_completed")
  })
})

test.describe("signup verify session", () => {
  test("register lands on check-email, not the dashboard", async ({ page }) => {
    const email = `e2e-reg-${Date.now()}@example.com`
    await page.goto("/register?plan=free")
    await fillFreeRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/\/check-email/, { timeout: 20_000 })
    await expect(page.locator("h1")).toContainText(/Check your email/i)
    await expect(page).not.toHaveURL(/\/app/)
  })

  test("verify with token signs in to the dashboard", async ({ page }) => {
    const email = `e2e-ver-${Date.now()}@example.com`
    await page.goto("/register?plan=free")
    await fillFreeRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
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
    await expect(page.getByRole("link", { name: "Check" })).toBeVisible({ timeout: 20_000 })
    const jwt = await page.evaluate(() => localStorage.getItem("di_jwt"))
    expect(jwt).toBeTruthy()
  })

  test("used verify token does not mint a second session", async ({ page }) => {
    const email = `e2e-used-${Date.now()}@example.com`
    await page.goto("/register?plan=free")
    await fillFreeRegister(page, email)
    await page.getByRole("button", { name: /Create account/i }).click()
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
      await page.goto("/register?plan=free")
      await fillFreeRegister(page, email)
      await page.getByRole("button", { name: /Create account/i }).click()
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
