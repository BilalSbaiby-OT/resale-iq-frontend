import { expect, test, type Page } from "@playwright/test"
import { mockPaidCheckout } from "./mock-stripe-checkout"
import { captureTrack } from "./track-events"

/**
 * Direct trial CTA under every unpaid verdict on /verdict (2026-09-30).
 * Logged-out already ends in UnlockPanel's trial button (must stay ONE);
 * logged-in FREE accounts and brand-average answers had none. Paid: never.
 */

async function asUser(page: Page, token: string | null) {
  if (token) await page.addInitScript((t) => localStorage.setItem("di_jwt", t), token)
}

test("free account sees exactly one trial CTA under a priced verdict; click -> checkout with email prefilled + event", async ({ page }) => {
  const bodies: Record<string, unknown>[] = []
  await mockPaidCheckout(page, undefined, { onCheckout: (b) => bodies.push(b) })
  const track = captureTrack(page)
  await asUser(page, "tok-900") // free@example.com, plan free
  await page.goto("/verdict?q=Nike%20Air%20Force%201")
  const cta = page.getByTestId("riq-verdict-trial-cta")
  await expect(cta).toBeVisible({ timeout: 30_000 })
  await expect(cta.getByRole("button", { name: /7-day free trial/i })).toHaveCount(1)
  await expect(cta).toContainText(/€0 today/i)
  await cta.getByRole("button", { name: /7-day free trial/i }).click()
  await expect.poll(() => bodies.length).toBeGreaterThan(0)
  expect(bodies[0].customer_email).toBe("free@example.com")
  expect(track.events).toContain("verdict_upsell_click")
  expect(track.payloads.find((p) => p.event === "verdict_upsell_click")?.path).toContain("verdict_page_trial")
})

test("brand-average verdict (no other CTA) gets one trial CTA when logged out", async ({ page }) => {
  await asUser(page, null)
  await page.goto("/verdict?q=carhartt%20jackets")
  // AppShell may bounce anonymous visitors; in that case there is no verdict face at all.
  const cta = page.getByTestId("riq-verdict-trial-cta")
  if (page.url().includes("/verdict")) {
    await expect(page.getByText(/BUY BELOW/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(cta).toHaveCount(1)
    await expect(cta.getByRole("button", { name: /7-day free trial/i })).toHaveCount(1)
  }
})

test("logged-out priced verdict keeps a single trial button (UnlockPanel), no duplicate", async ({ page }) => {
  await asUser(page, null)
  await page.goto("/verdict?q=Nike%20Air%20Force%201")
  if (page.url().includes("/verdict")) {
    await expect(page.getByText(/BUY BELOW/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId("riq-verdict-trial-cta")).toHaveCount(0)
    // the one under the result is UnlockPanel's (the AppShell login bar has its own, unrelated)
    await expect(page.getByTestId("riq-unlock-register").getByRole("button", { name: /7-day free trial/i })).toHaveCount(1)
  }
})

test("paid Starter and Pro never see the trial CTA", async ({ page }) => {
  for (const token of ["tok-1", "tok-3"]) {
    await asUser(page, token)
    await page.goto("/verdict?q=Nike%20Air%20Force%201")
    await expect(page.getByText(/BUY BELOW/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId("riq-verdict-trial-cta")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /7-day free trial/i })).toHaveCount(0)
    await page.evaluate(() => localStorage.clear())
  }
})
