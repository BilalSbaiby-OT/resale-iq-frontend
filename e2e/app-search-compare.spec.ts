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

test("Price across Vinted sites: pooled median first, per-site range, insufficient site shows no number, no counts", async ({ page }) => {
  await login(page)
  await page.route("**/api/compare/prices*", r => r.fulfill({ json: {
    query: "Adidas Samba", markets_searched: 5, markets_with_results: 2, markets_unpriced: [],
    cheapest_market: null, most_expensive_market: null,
    source: "tracked_index", min_n: 15, window_days: 7,
    pooled: { median_price: 32, p25_price: 20, p75_price: 55, avg_price: 41, n_unique: 658, share_also_on_other_sites: 0.35, insufficient: false },
    by_country: {
      es: { country: "Spain", avg_price: 90, min_price: 5, max_price: 300, median_price: 27, p25_price: 18, p75_price: 49, n_unique: 145, count: 145, share_also_on_other_sites: 0.4, insufficient: false,
        items: [item(1, "Adidas Samba OG", 70), item(2, "Adidas Samba Wales Bonner", 110)] },
      fr: { country: "France", avg_price: null, min_price: null, max_price: null, median_price: null, p25_price: null, p75_price: null, n_unique: 6, count: 6, share_also_on_other_sites: 0.5, insufficient: true, items: [] },
    },
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
  // pooled headline leads: median 32 (not mean 41), typical range, share-also
  const pooled = page.getByTestId("compare-pooled")
  await expect(pooled).toContainText("Typical asking price across the Vinted sites we track")
  await expect(page.getByTestId("compare-pooled-median")).toHaveText("€32")
  await expect(pooled).toContainText("Typical range €20–€55")
  await expect(pooled).toContainText("35% of these listings also appear on other Vinted sites")
  await expect(pooled).not.toContainText("41")
  // per-site row: "seen on vinted.es", median 27 + p25-p75, never the mean 90 or min/max
  const es = page.getByRole("button", { name: /seen on vinted\.es/ })
  await expect(es).toContainText("€27")
  await expect(es).toContainText("€18 – €49")
  await expect(es).not.toContainText("90")
  await expect(es).not.toContainText("€300")
  // insufficient site: words, no number
  const fr = page.getByRole("button", { name: /seen on vinted\.fr/ })
  await expect(fr).toContainText("Not enough recent listings")
  await expect(fr).not.toContainText("€")
  // no counts anywhere in copy
  await expect(page.getByText(/658|\b145\b/)).toHaveCount(0)
  await es.click()
  await expect(page.getByText("Adidas Samba OG")).toBeVisible()
  await expect(page.getByText("Unknown seller")).toHaveCount(0)
})
