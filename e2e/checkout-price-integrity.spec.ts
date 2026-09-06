import { expect, test, type Page } from "@playwright/test"
import { TEST_PRICE_ID, TEST_PRICE_EUR, mockPaidCheckout } from "./helpers/stripe-mocks"

/**
 * The tier the visitor CHOSE must be the tier Stripe CHARGES.
 *
 * Why this file exists, and why asserting "we reached checkout.stripe.com" is
 * not enough: signup-verify.spec.ts already proves a paid register redirects to
 * Stripe rather than stranding on /check-email. It never inspects WHICH price
 * went in the POST body. So this one-character mutation in register-form.tsx —
 *
 *   const placeholder = paidPlan === "power" ? "__POWER__" : "__OPERATOR__"
 *                    →  paidPlan === "power" ? "__OPERATOR__" : "__POWER__"
 *
 * — ships a site where every Starter buyer lands on a €49 checkout, and the
 * entire existing suite stays green. Measured against that exact mutation on
 * 2026-09-06: all 14 signup-verify tests passed, only this file failed.
 *
 * A checkout that opens on the wrong price is worse than one that fails: the
 * failure is visible, the overcharge is a chargeback and a refund request from
 * the first customer this company ever gets. Verified against production the
 * same day (EN+ES, Starter €19 / Pro €49); this locks that result in.
 *
 * The mapping under test runs through the real component: plan id in the URL →
 * radio selection → placeholder → resolvePriceId() against the /stripe/plans
 * payload → price_id on the wire.
 */

async function submitPaidRegister(page: Page, email: string) {
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill("goodpass123")
  await page.locator('input[type="checkbox"]').first().check()
  await page.locator('input[type="checkbox"]').nth(1).check()
  await page.getByRole("button", { name: /Create account/i }).click()
}

test.describe("checkout price integrity — chosen tier == charged price", () => {
  for (const [plan, label] of [["operator", "Starter"], ["power", "Pro"]] as const) {
    test(`${label} (?plan=${plan}) checks out on the ${label} price id, not the other tier`, async ({ page }) => {
      const sent = await mockPaidCheckout(page)
      await page.goto(`/register?plan=${plan}`)

      // The amount shown next to the selected radio must be the amount that
      // tier's price id bills — displayed price and charged price cannot drift.
      await expect(page.getByText(`€${TEST_PRICE_EUR[plan]}`).first()).toBeVisible()

      await submitPaidRegister(page, `e2e-price-${plan}-${Date.now()}@example.com`)
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })

      expect(sent).toEqual([TEST_PRICE_ID[plan]])
      const other = plan === "operator" ? "power" : "operator"
      expect(sent).not.toContain(TEST_PRICE_ID[other])
    })
  }

  test("a free register never opens a paid checkout", async ({ page }) => {
    const sent = await mockPaidCheckout(page)
    await page.goto("/register?plan=free")
    await page.locator('input[type="email"]').fill(`e2e-price-free-${Date.now()}@example.com`)
    await page.locator('input[type="password"]').fill("goodpass123")
    await page.locator('input[type="checkbox"]').first().check()
    await page.getByRole("button", { name: /Create account/i }).click()
    await page.waitForURL(/check-email/, { timeout: 20_000 })
    expect(sent).toEqual([])
  })
})
