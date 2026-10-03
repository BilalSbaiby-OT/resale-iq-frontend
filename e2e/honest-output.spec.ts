import { expect, test } from "@playwright/test"

/**
 * O3 — honest output on the verdict card: the typical resale range, the count
 * and window behind it, and the max buy price come BEFORE the verdict; under
 * 20 comparables the verdict reads LOW DATA and never BUY. The backend is
 * intercepted: this pins what the FRONTEND renders from `honest`.
 */
const honest = (over: Record<string, unknown> = {}) => ({
  basis: "departed", range_low_eur: 21, range_high_eur: 39, p25_price_eur: 21.4, p75_price_eur: 38.6,
  price_window: "7d", n: 47, window_days: 7, max_buy_eur: 21, margin_pct: 30,
  low_data: false, verdict_display: "BUY", confidence: "MEDIUM", ...over,
})

async function check(page: import("@playwright/test").Page, body: Record<string, unknown>) {
  await page.route("**/api/verdict**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }))
  await page.goto("/tools")
  await page.getByLabel(/Item to check/i).fill("Adidas Samba")
  await page.getByRole("button", { name: /Check this item/i }).click()
}

test("numbers lead, verdict follows, wording says 'left Vinted' not 'sold'", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "MEDIUM",
    buy_below: 21.4, sell_avg: 30.6, honest: honest(),
  })
  const card = page.getByTestId("riq-honest-numbers")
  await expect(card).toBeVisible()
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€21 – €39")
  await expect(page.getByTestId("riq-honest-basis")).toHaveText("Based on 47 listings that left Vinted in the last 7 days")
  await expect(page.getByTestId("riq-honest-maxbuy")).toHaveText("€21")
  await expect(card).toContainText("for ~30% gross margin before fees")
  await expect(card).not.toContainText(/\bsold\b/i)
  // numbers first: the block sits above the verdict word in the DOM
  const above = await page.evaluate(() => {
    const n = document.querySelector('[data-testid="riq-honest-numbers"]')!
    const v = Array.from(document.querySelectorAll("span")).find((s) => s.textContent?.trim() === "BUY")
    return !!v && !!(n.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(above).toBe(true)
})

test("under 20 comparables: LOW DATA, never BUY, range still shown", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "LOW",
    buy_below: 21.4, sell_avg: 30.6,
    honest: honest({ n: 12, low_data: true, verdict_display: "LOW_DATA", window_days: 30, price_window: "30d" }),
  })
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€21 – €39")
  await expect(page.getByTestId("riq-honest-basis")).toContainText("last 30 days")
  await expect(page.getByTestId("riq-honest-lowdata-note")).toContainText("Only 12 comparable listings")
  await expect(page.getByText("LOW DATA", { exact: true })).toBeVisible()
  await expect(page.getByText("BUY", { exact: true })).toHaveCount(0)
})

test("a body without the block renders exactly as before", async ({ page }) => {
  await check(page, { verdict: "WATCH", product: "Adidas Samba", category: "Sneakers", buy_below: 21.4, sell_avg: 30.6 })
  await expect(page.getByTestId("riq-honest-numbers")).toHaveCount(0)
  await expect(page.getByText("WATCH", { exact: true }).first()).toBeVisible()
})
