import type { Page } from "@playwright/test"

/** Shared Stripe Checkout intercept — one copy for register + branding specs. */
export async function mockPaidCheckout(
  page: Page,
  checkoutUrl = "https://checkout.stripe.com/c/pay/cs_test_paid_register",
  opts?: { onCheckout?: (body: Record<string, unknown>) => void },
) {
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
    if (opts?.onCheckout) {
      try { opts.onCheckout(JSON.parse(route.request().postData() || "{}")) }
      catch { opts.onCheckout({}) }
    }
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
