import { expect, test } from "@playwright/test"
import { mockPaidCheckout } from "./mock-stripe-checkout"

const PAID_CHECKOUT_URL = "https://checkout.stripe.com/c/pay/cs_test_branding"

test.describe("checkout branding + first check", () => {
  test("/pricing sends Resale IQ product copy and VAT country", async ({ page }) => {
    const posts: Record<string, unknown>[] = []
    await mockPaidCheckout(page, PAID_CHECKOUT_URL, {
      onCheckout: (body) => posts.push(body),
    })
    await page.goto("/es/pricing")
    await expect(page.getByTestId("riq-billing-country")).toBeVisible()
    await expect(page.locator("#riq-vat-country")).toHaveValue("ES")
    await page.locator("section.riq-pricing button").first().click()
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 20_000 })
    expect(posts.length).toBeGreaterThan(0)
    const body = posts[0]
    expect(body.display_name).toBe("Resale IQ")
    expect(body.product_name).toBe("Resale IQ Starter")
    expect(String(body.product_description)).toMatch(/buy-below/i)
    expect(body.country).toBe("ES")
    expect(String(body.cancel_url)).toMatch(/\/es\/pricing\?checkout=cancelled/)
    expect(JSON.stringify(body)).not.toMatch(/Demand Intel/i)
  })

  test("/billing/success forces a first-check CTA and does not auto-eject", async ({ page }) => {
    await page.route("**/stripe/verify-session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ paid: true, plan: "operator" }),
      })
    })
    await page.goto("/billing/success?session_id=cs_test_ok")
    const cta = page.getByTestId("riq-billing-first-check")
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute("href", "/verdict?q=Nike%20Air%20Force%201")
    await expect(page.getByText(/Welcome to Starter/i)).toBeVisible()
    expect(page.url()).toMatch(/\/billing\/success/)
  })
})
