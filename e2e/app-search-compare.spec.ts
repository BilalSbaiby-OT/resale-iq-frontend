import { expect, test } from "@playwright/test"

/**
 * Live Search / Price across Vinted sites in the logged-in app. Vinted blocks our server IP, so the
 * backend serves recently-seen listings flagged source="tracked_index". The UI must show
 * the listings AND say they are not a live lookup (never imply live), and never render
 * "Unknown seller" for rows that carry no seller.
 */
async function login(page: import("@playwright/test").Page) {
  await page.goto("/login")
  await page.locator('input[type="email"]').fill("pro@example.com")
  await page.locator('input[type="password"]').fill("password12345")
  await page.getByRole("button", { name: /Sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}
const item = (id: number, title: string, p: number) => ({
  id, title, price: p, price_eur: p, currency: "EUR", size: "42", brand: "Adidas",
  url: `https://www.vinted.es/items/${id}`, photo: null, country: "es", seller: null,
  favourite_count: 0, view_count: 0, source: "tracked_index", seen_at: "2026-10-01 09:00:00",
})

test("Live Search shows tracked-index rows with a not-live note", async ({ page }) => {
  await login(page)
  await page.route("**/api/search/vinted*", r => r.fulfill({ json: {
    query: "Adidas Samba", market: "es", country: "Spain", count: 2, source: "tracked_index",
    items: [item(1, "Adidas Samba OG", 70), item(2, "Adidas Samba Wales Bonner", 110)],
  } }))
  await page.goto("/search")
  await page.locator("input[placeholder*='e.g.']").fill("Adidas Samba")
  await page.keyboard.press("Enter")
  await expect(page.getByText("Adidas Samba OG")).toBeVisible()
  await expect(page.getByText(/recently seen on Vinted.*not a live lookup/)).toBeVisible()
})

test("Price across Vinted sites: median, no cheapest/priciest framing, no 'Unknown seller'", async ({ page }) => {
  await login(page)
  await page.route("**/api/compare/prices*", r => r.fulfill({ json: {
    query: "Adidas Samba", markets_searched: 1, markets_with_results: 1, markets_unpriced: [],
    cheapest_market: { country: "Spain", tld: "es", avg_price: 90 },
    most_expensive_market: { country: "Spain", tld: "es", avg_price: 90 },
    source: "tracked_index",
    by_country: { es: { country: "Spain", avg_price: 90, min_price: 70, max_price: 110, median_price: 80, count: 2,
      items: [item(1, "Adidas Samba OG", 70), item(2, "Adidas Samba Wales Bonner", 110)] } },
  } }))
  await page.goto("/compare")
  await page.locator("input[placeholder*='e.g.']").fill("Adidas Samba")
  await page.keyboard.press("Enter")
  await expect(page.getByText(/Prices come from listings recently seen/)).toBeVisible()
  await expect(page.getByText("Compare typical asking prices for the same search across the Vinted sites we track")).toBeVisible()
  await expect(page.getByText(/CHEAPEST|PRICIEST|Cheapest|Most expensive|26[- ]markets?|arbitrage/)).toHaveCount(0)
  // 5 tracked sites only, no other markets
  await expect(page.getByRole("button", { name: "vinted.nl" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "vinted.pt" })).toHaveCount(1)
  // median (80), not mean (90), is the headline figure
  const row = page.getByRole("button", { name: /vinted\.es.*Median of the newest/ })
  await expect(row).toContainText("80")
  await expect(row).not.toContainText("90")
  await row.click()
  await expect(page.getByText("Adidas Samba OG")).toBeVisible()
  await expect(page.getByText("Unknown seller")).toHaveCount(0)
})
