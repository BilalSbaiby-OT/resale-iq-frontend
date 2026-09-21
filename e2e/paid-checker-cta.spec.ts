import { expect, test, type Page } from "@playwright/test"

/**
 * Founder report 2026-09-21: a Pro user still saw “subscribe to plan” after
 * a check on /tools. UnlockPanel on /verdict was already auth-aware; the
 * public FreeChecker was not.
 *
 * Anonymous / free must still see GuestCheckout. operator (Starter) and
 * power (Pro) must see Verdict + Manage subscription, never Stripe.
 */

async function checkItem(page: Page, q: string) {
  await page.goto("/tools")
  await page.getByLabel(/Item to check/i).fill(q)
  const response = page.waitForResponse((r) => r.url().includes("/api/verdict"))
  await page.getByRole("button", { name: /Check this item/i }).click()
  await response
}

async function login(page: Page, email: string) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in/i }).click()
  await page.waitForURL(/\/verdict/, { timeout: 20_000 })
}

test("anonymous checker still offers Starter checkout after a real check", async ({ page }) => {
  await checkItem(page, "Nike Air Force 1")
  await expect(page.getByTestId("riq-guest-unlock-bar")).toBeVisible()
  await expect(page.getByTestId("riq-guest-unlock-bar")).toContainText(/with a plan/i)
  await expect(page.getByRole("button", { name: /Starter €19/i })).toBeVisible()
  await expect(page.getByTestId("riq-paid-session-bar")).toHaveCount(0)
})

test("Pro session never sees subscribe/unlock-with-a-plan after a check", async ({ page }) => {
  await login(page, "pro@example.com")
  await checkItem(page, "Nike Air Force 1")
  await expect(page.getByTestId("riq-paid-session-bar")).toBeVisible()
  await expect(page.getByTestId("riq-paid-session-bar")).toContainText(/You're on Pro/i)
  await expect(page.getByTestId("riq-paid-verdict-cta")).toBeVisible()
  await expect(page.getByTestId("riq-paid-manage")).toHaveAttribute("href", "/account")
  await expect(page.getByTestId("riq-guest-unlock-bar")).toHaveCount(0)
  await expect(page.getByRole("button", { name: /Starter €19/i })).toHaveCount(0)
  await expect(page.getByText(/with a plan/i)).toHaveCount(0)
})

test("Starter session also skips GuestCheckout after a check", async ({ page }) => {
  await login(page, "alice@example.com")
  await checkItem(page, "Nike Air Force 1")
  await expect(page.getByTestId("riq-paid-session-bar")).toBeVisible()
  await expect(page.getByTestId("riq-paid-session-bar")).toContainText(/You're on Starter/i)
  await expect(page.getByTestId("riq-guest-unlock-bar")).toHaveCount(0)
})

test("PricingSection does not push checkout at a Pro session", async ({ page }) => {
  await login(page, "pro@example.com")
  await page.goto("/pricing")
  await expect(page.getByTestId("riq-pricing-cta-power")).toHaveAttribute("data-cta-kind", "current")
  await expect(page.getByTestId("riq-pricing-cta-power")).toHaveText(/Current plan/i)
  await expect(page.getByTestId("riq-pricing-cta-operator")).toHaveAttribute("data-cta-kind", "manage")
  await expect(page.getByTestId("riq-pricing-cta-operator")).toHaveText(/Manage subscription/i)
  await expect(page.getByRole("button", { name: /Start for €19/i })).toHaveCount(0)
  await expect(page.getByRole("button", { name: /Start for €49/i })).toHaveCount(0)
  await expect(page.getByTestId("riq-cold-cta-ladder")).toHaveCount(0)
})

test("logged-out /pricing still sells Starter and Pro checkout", async ({ page }) => {
  await page.goto("/pricing")
  await expect(page.getByTestId("riq-pricing-cta-operator")).toHaveText(/Start for €19/i)
  await expect(page.getByTestId("riq-pricing-cta-power")).toHaveText(/Start for €49/i)
})
