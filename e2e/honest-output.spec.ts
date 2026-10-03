import { expect, test } from "@playwright/test"

/**
 * O3 (founder override 2026-10-03) — honest output on the verdict card:
 * Typical resale price (p25-p75) and Max buy price lead; the BUY/WATCH/SKIP
 * verdict is shown exactly as computed; evidence is the Signal strength meter
 * (●○○ / ●●○ / ●●●), never a count, never a LOW DATA label, never "sold".
 * The backend is intercepted: this pins what the FRONTEND renders from `honest`.
 */
const honest = (over: Record<string, unknown> = {}) => ({
  basis: "departed", range_low_eur: 42, range_high_eur: 58, p25_price_eur: 41.6, p75_price_eur: 57.7,
  max_buy_eur: 35, margin_pct: 30, signal_strength: 3, verdict_display: "BUY", confidence: "MEDIUM", ...over,
})

async function check(page: import("@playwright/test").Page, body: Record<string, unknown>) {
  await page.route("**/api/verdict**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) }))
  await page.goto("/tools")
  await page.getByLabel(/Item to check/i).fill("Adidas Samba")
  await page.getByRole("button", { name: /Check this item/i }).click()
}

const noCountsNoLowData = async (page: import("@playwright/test").Page) => {
  const card = page.getByTestId("riq-honest-numbers")
  await expect(card).not.toContainText(/LOW DATA/i)
  await expect(page.getByText(/LOW DATA/i)).toHaveCount(0)
  await expect(card).not.toContainText(/\d+\s+(listings|comparable|departures)|Based on \d|last \d+ days|undefined|NaN|null/i)
  await expect(card).not.toContainText(/\bsold\b/i)
}

test("strong model: range + max buy lead, ●●● meter, verdict follows, no counts", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "MEDIUM",
    buy_below: 35.2, sell_avg: 50.4, honest: honest(),
  })
  const card = page.getByTestId("riq-honest-numbers")
  await expect(card).toBeVisible()
  await expect(card).toContainText("Typical resale price")
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€42–€58")
  await expect(card).toContainText("Max buy price")
  await expect(page.getByTestId("riq-honest-maxbuy")).toHaveText("€35")
  await expect(card).toContainText("= 70% of the typical resale price")
  const meter = card.getByRole("img", { name: "Signal strength: strong" })
  await expect(meter).toBeVisible()
  await expect(meter).toHaveText("Signal strength●●●")
  await noCountsNoLowData(page)
  // numbers first: the block sits above the verdict word in the DOM
  const above = await page.evaluate(() => {
    const n = document.querySelector('[data-testid="riq-honest-numbers"]')!
    const v = Array.from(document.querySelectorAll("span")).find((s) => s.textContent?.trim() === "BUY")
    return !!v && !!(n.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING)
  })
  expect(above).toBe(true)
})

test("weak model (<20 comparables): ●○○ meter, verdict still BUY, range shown, no LOW DATA", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "LOW",
    buy_below: 35.2, sell_avg: 50.4, honest: honest({ signal_strength: 1, confidence: "LOW" }),
  })
  const card = page.getByTestId("riq-honest-numbers")
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€42–€58")
  await expect(card.getByRole("img", { name: "Signal strength: weak" })).toHaveText("Signal strength●○○")
  await expect(page.getByText("BUY", { exact: true }).first()).toBeVisible()
  await noCountsNoLowData(page)
})

test("medium model: ●●○", async ({ page }) => {
  await check(page, {
    verdict: "WATCH", product: "Adidas Samba", category: "Sneakers",
    buy_below: 35.2, sell_avg: 50.4, honest: honest({ signal_strength: 2, verdict_display: "WATCH" }),
  })
  await expect(page.getByRole("img", { name: "Signal strength: medium" }).first()).toHaveText("Signal strength●●○")
  await expect(page.getByText("WATCH", { exact: true }).first()).toBeVisible()
})

test("a body without the block renders exactly as before", async ({ page }) => {
  await check(page, { verdict: "WATCH", product: "Adidas Samba", category: "Sneakers", buy_below: 21.4, sell_avg: 30.6 })
  await expect(page.getByTestId("riq-honest-numbers")).toHaveCount(0)
  await expect(page.getByText("WATCH", { exact: true }).first()).toBeVisible()
})

// Anonymous / free callers: the backend OMITS n, window_days, price_window and
// low_data, and (HONEST_RANGE_PUBLIC off) the range too. Nothing may break.
const anonHonest = (over: Record<string, unknown> = {}) => ({
  basis: "departed", range_low_eur: 42, range_high_eur: 58, p25_price_eur: 41.6, p75_price_eur: 57.7,
  max_buy_eur: 35, margin_pct: 30, signal_strength: 1, verdict_display: "BUY", confidence: "MEDIUM", ...over,
})

test("anon payload (no counts, no low_data): range, max buy, meter render; nothing leaks", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Nike Air Force 1", category: "Sneakers", confidence: "MEDIUM",
    buy_below: 35.2, sell_avg: 50.4, honest: anonHonest(),
  })
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€42–€58")
  await expect(page.getByTestId("riq-honest-maxbuy")).toHaveText("€35")
  await expect(page.getByRole("img", { name: "Signal strength: weak" }).first()).toBeVisible()
  await noCountsNoLowData(page)
})

test("even if a paid-style payload carries n / window / low_data, the UI renders none of it", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Nike Air Force 1", category: "Sneakers", confidence: "LOW",
    buy_below: 35.2, sell_avg: 50.4,
    honest: anonHonest({ n: 12, window_days: 30, price_window: "30d", low_data: true, verdict_display: "BUY" }),
  })
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€42–€58")
  await noCountsNoLowData(page)
  await expect(page.getByText("12", { exact: true })).toHaveCount(0)
  await expect(page.getByText("BUY", { exact: true }).first()).toBeVisible()
})

test("range withheld: max buy + meter still render, no empty range box", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Nike Air Force 1", category: "Sneakers", buy_below: 35.2, sell_avg: 50.4,
    honest: anonHonest({ range_low_eur: undefined, range_high_eur: undefined, p25_price_eur: undefined, p75_price_eur: undefined }),
  })
  await expect(page.getByTestId("riq-honest-range")).toHaveCount(0)
  await expect(page.getByTestId("riq-honest-maxbuy")).toHaveText("€35")
  await expect(page.getByRole("img", { name: "Signal strength: weak" }).first()).toBeVisible()
  await noCountsNoLowData(page)
})

test("nothing to show: no honest box at all", async ({ page }) => {
  await check(page, {
    verdict: "WATCH", product: "Nike Air Force 1", category: "Sneakers", buy_below: 21.4, sell_avg: 30.6,
    honest: anonHonest({ range_low_eur: undefined, range_high_eur: undefined, max_buy_eur: null, signal_strength: undefined, verdict_display: "WATCH" }),
  })
  await expect(page.getByTestId("riq-honest-numbers")).toHaveCount(0)
})

test("basis departed: no basis footnote, label unchanged", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "MEDIUM",
    buy_below: 35.2, sell_avg: 50.4, honest: honest(),
  })
  const card = page.getByTestId("riq-honest-numbers")
  await expect(card).toHaveAttribute("data-basis", "departed")
  await expect(card).toContainText("Typical resale price")
  await expect(page.getByTestId("riq-honest-asking-note")).toHaveCount(0)
})

test("basis live_ask: asking-price footnote + typical range label, no window, never sold", async ({ page }) => {
  await check(page, {
    verdict: "BUY", product: "Adidas Samba", category: "Sneakers", confidence: "MEDIUM",
    buy_below: 35.2, sell_avg: 50.4, honest: honest({ basis: "live_ask", price_window: undefined, window_days: null }),
  })
  const card = page.getByTestId("riq-honest-numbers")
  await expect(card).toHaveAttribute("data-basis", "live_ask")
  await expect(card).toContainText("Typical resale price · typical range")
  await expect(page.getByTestId("riq-honest-range")).toHaveText("€42–€58")
  await expect(page.getByTestId("riq-honest-asking-note")).toHaveText("Based on current asking prices for this model on Vinted (lower third of the market)")
  await expect(card).not.toContainText(/left the shelf|departed|departure/i)
  await noCountsNoLowData(page)
})
