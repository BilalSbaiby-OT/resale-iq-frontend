import type { Page } from "@playwright/test"

/**
 * Shared Stripe fixtures for the register/checkout specs.
 *
 * Extracted because signup-verify.spec.ts and checkout-price-integrity.spec.ts
 * both stand up the same /stripe/plans payload. Two copies of the tier→price_id
 * table is exactly the duplication that makes a crossed mapping survive a fix:
 * you correct the file you are looking at and the other one keeps lying.
 */

/** Tier → Stripe price id, as /stripe/plans reports it. */
export const TEST_PRICE_ID = {
  operator: "price_operator_test",
  power: "price_power_test",
} as const

/** Tier → monthly EUR. Mirrors live Stripe: Starter €19, Pro €49. */
export const TEST_PRICE_EUR = { operator: 19, power: 49 } as const

export const PAID_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_test_paid_register"

/** The single source of truth for what /stripe/plans returns under test. */
export async function mockStripePlans(page: Page) {
  await page.route("**/stripe/plans", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        publishable_key: null,
        stripe_enabled: true,
        plans: [
          { id: "operator", price_eur: TEST_PRICE_EUR.operator, price_id: TEST_PRICE_ID.operator },
          { id: "power", price_eur: TEST_PRICE_EUR.power, price_id: TEST_PRICE_ID.power },
          { id: "free", price_eur: 0 },
        ],
      }),
    })
  })
}

/** Stand in for the hosted Stripe page so a redirect can be asserted offline. */
export async function mockStripeCheckoutPage(page: Page) {
  await page.route("https://checkout.stripe.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>stripe checkout</body></html>" })
  })
}

/**
 * Mock POST /stripe/checkout. Returns the array that collects every price_id
 * the app actually put on the wire, so a caller can assert the charged tier is
 * the chosen one.
 */
export async function mockStripeCheckout(page: Page, checkoutUrl = PAID_CHECKOUT_URL): Promise<string[]> {
  const sentPriceIds: string[] = []
  await page.route("**/stripe/checkout", async (route) => {
    try {
      const body = route.request().postDataJSON() as { price_id?: string } | null
      if (body?.price_id) sentPriceIds.push(body.price_id)
    } catch {
      // why: a malformed body must surface as an empty capture (and a failed
      // assertion), never as a silently passing test
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ checkout_url: checkoutUrl }),
    })
  })
  return sentPriceIds
}

/** Full happy path: plans + checkout + the hosted page. */
export async function mockPaidCheckout(page: Page, checkoutUrl = PAID_CHECKOUT_URL): Promise<string[]> {
  await mockStripePlans(page)
  const sent = await mockStripeCheckout(page, checkoutUrl)
  await mockStripeCheckoutPage(page)
  return sent
}
