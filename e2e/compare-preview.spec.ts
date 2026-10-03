import { expect, test, type Page } from "@playwright/test"

/**
 * /compare — non-Pro example + sites-with-data preview (shown in the paywall,
 * before the upgrade ask), generic-query nudge with chips (Pro), 1-word hint.
 * The backend fields (sample endpoint, 402 preview, reason/suggestions) may be
 * absent: every one of them must degrade to "nothing extra".
 */
const as = (page: Page, token: string) => page.addInitScript((t) => localStorage.setItem("di_jwt", t), token)
const FREE = "tok-900" // free@example.com
const PRO = "tok-3" // pro@example.com (power)

const item = (id: number, p: number) => ({
  id, title: `Adidas Samba ${id}`, price: p, price_eur: p, currency: "EUR", size: "42", brand: "Adidas",
  url: `https://www.vinted.es/items/${id}`, photo: null, country: "es", seller: null,
  favourite_count: 0, view_count: 0, source: "tracked_index", seen_at: "2026-10-01 09:00:00",
})
const SAMPLE = {
  query: "Adidas Samba", label: "Adidas Samba", markets_searched: 5, markets_with_results: 2, markets_unpriced: [],
  source: "tracked_index", min_n: 15, window_days: 7,
  pooled: { median_price: 32, p25_price: 20, p75_price: 55, n_unique: 658, share_also_on_other_sites: 0.35, insufficient: false },
  by_country: {
    es: { country: "Spain", median_price: 27, p25_price: 18, p75_price: 49, n_unique: 145, share_also_on_other_sites: 0.4, insufficient: false, items: [item(1, 70)] },
    fr: { country: "France", median_price: null, p25_price: null, p75_price: null, n_unique: 6, share_also_on_other_sites: 0.5, insufficient: true, items: [] },
  },
}
const PREVIEW_402 = {
  detail: { message: "Pro required", preview: {
    sites_with_data: { es: true, fr: true, de: false, it: false, pt: false },
    suggestions: [{ label: "Zara blazer oversize", query: "Zara blazer oversize" }, { label: "Zara Trafaluc", query: "Zara Trafaluc" }],
  } },
}

test.describe("non-Pro", () => {
  test("real example shown before the upgrade ask; own query gets sites-with-data + chips, no prices; chip re-checks", async ({ page }) => {
    await as(page, FREE)
    await page.route("**/api/public/compare/sample", (r) => r.fulfill({ json: SAMPLE }))
    const asked: string[] = []
    await page.route("**/api/compare/prices*", (r) => { asked.push(new URL(r.request().url()).searchParams.get("q") || ""); return r.fulfill({ status: 402, json: PREVIEW_402 }) })
    await page.goto("/compare")
    const sample = page.getByTestId("compare-sample")
    await expect(sample).toContainText("Example: Adidas Samba, live data")
    await expect(page.getByTestId("compare-pooled-median")).toHaveText("€32")
    await expect(sample.getByRole("button", { name: /seen on vinted\.es/ })).toContainText("€27")
    await expect(sample.getByRole("button", { name: /seen on vinted\.fr/ })).not.toContainText("€")
    await expect(page.getByText(/658|\b145\b/)).toHaveCount(0)
    // example sits above the upgrade ask
    const sampleY = (await sample.boundingBox())!.y
    const ctaY = (await page.getByText(/then €\d+\/month after your/).first().boundingBox())!.y
    expect(sampleY).toBeLessThan(ctaY)
    // own query: only which sites have data + chips, then the Pro line
    await page.getByTestId("compare-preview").locator("input").fill("Zara blazer")
    await page.keyboard.press("Enter")
    const sites = page.getByTestId("compare-sites-with-data")
    await expect(sites).toContainText("Data available on:")
    await expect(sites).toContainText("vinted.es ✓")
    await expect(sites).toContainText("vinted.fr ✓")
    await expect(sites).not.toContainText("vinted.de")
    const res = page.getByTestId("compare-preview-result")
    await expect(res).not.toContainText("€")
    await expect(res).toContainText("Typical prices for your own search are on Pro.")
    await page.getByTestId("compare-preview-chips").getByRole("button", { name: "Zara Trafaluc" }).click()
    await expect.poll(() => asked).toEqual(["Zara blazer", "Zara Trafaluc"])
    await expect(page.getByText(/\bsold\b/i)).toHaveCount(0)
  })

  test("degrades: no sample (404) and a plain 402 -> no example, no preview lines, upgrade ask intact", async ({ page }) => {
    await as(page, FREE)
    await page.route("**/api/public/compare/sample", (r) => r.fulfill({ status: 404, json: { detail: "not found" } }))
    await page.route("**/api/compare/prices*", (r) => r.fulfill({ status: 402, json: { detail: "Pro required" } }))
    await page.goto("/compare")
    await expect(page.getByText("This is a Pro feature")).toBeVisible()
    await expect(page.getByTestId("compare-sample")).toHaveCount(0)
    await page.getByTestId("compare-preview").locator("input").fill("Zara blazer")
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("compare-preview").getByRole("button", { name: "Check" })).toBeEnabled()
    await expect(page.getByTestId("compare-preview-result")).toHaveCount(0)
    await expect(page.getByText(/then €\d+\/month after your/).first()).toBeVisible()
  })
})

test.describe("Pro", () => {
  test("generic_query -> nudge + chips, no table; chip runs that query and shows results", async ({ page }) => {
    await as(page, PRO)
    const asked: string[] = []
    await page.route("**/api/compare/prices*", (r) => {
      const q = new URL(r.request().url()).searchParams.get("q") || ""
      asked.push(q)
      if (q === "Adidas Samba") return r.fulfill({ json: SAMPLE })
      return r.fulfill({ json: { query: q, reason: "generic_query", markets_searched: 5, markets_with_results: 0, markets_unpriced: [], pooled: null, by_country: {},
        suggestions: [{ label: "Adidas Samba", query: "Adidas Samba" }, { label: "Nike Air Force 1", query: "Nike Air Force 1" }] } })
    })
    await page.goto("/compare")
    await page.locator("input[placeholder*='e.g.']").fill("vintage")
    await page.keyboard.press("Enter")
    const nudge = page.getByTestId("compare-nudge")
    await expect(nudge).toContainText("too broad")
    await expect(nudge).toContainText("Try a brand + model, e.g. Adidas Samba, Nike Air Force 1")
    await expect(page.getByTestId("compare-pooled")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /seen on vinted/ })).toHaveCount(0)
    await nudge.getByRole("button", { name: "Adidas Samba" }).click()
    await expect(page.getByTestId("compare-pooled-median")).toHaveText("€32")
    await expect(page.getByTestId("compare-nudge")).toHaveCount(0)
    expect(asked).toEqual(["vintage", "Adidas Samba"])
    await expect(page.locator("input[placeholder*='e.g.']")).toHaveValue("Adidas Samba")
  })

  test("no site with data and no suggestions from the backend -> nudge with built-in example chips (no empty table)", async ({ page }) => {
    await as(page, PRO)
    await page.route("**/api/compare/prices*", (r) => r.fulfill({ json: { query: "zzz", markets_searched: 5, markets_with_results: 0, markets_unpriced: [],
      pooled: { median_price: null, insufficient: true }, by_country: { es: { country: "Spain", median_price: null, insufficient: true, items: [] } } } }))
    await page.goto("/compare")
    await page.locator("input[placeholder*='e.g.']").fill("zzz qqq")
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("compare-nudge")).toContainText("Not enough recent listings for that search yet.")
    await expect(page.getByTestId("compare-nudge").getByRole("button", { name: "Nike Air Force 1" })).toBeVisible()
    await expect(page.getByRole("button", { name: /seen on vinted/ })).toHaveCount(0)
  })

  test("brand-only result: pooled card shown, plus 'narrow it down' chips", async ({ page }) => {
    await as(page, PRO)
    await page.route("**/api/compare/prices*", (r) => r.fulfill({ json: { ...SAMPLE, query: "Adidas", suggestions: [{ label: "Adidas Samba", query: "Adidas Samba" }] } }))
    await page.goto("/compare")
    await page.locator("input[placeholder*='e.g.']").fill("Adidas")
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("compare-pooled-median")).toHaveText("€32")
    await expect(page.getByText("Narrow it down with a model:")).toBeVisible()
    await expect(page.getByTestId("compare-chips").getByRole("button", { name: "Adidas Samba" })).toBeVisible()
  })

  test("1-word generic input shows the hint + chips before submit; a brand or brand+model does not; chip runs the query", async ({ page }) => {
    await as(page, PRO)
    const asked: string[] = []
    await page.route("**/api/compare/prices*", (r) => { asked.push(new URL(r.request().url()).searchParams.get("q") || ""); return r.fulfill({ json: SAMPLE }) })
    await page.goto("/compare")
    const input = page.locator("input[placeholder*='e.g.']")
    await input.fill("Tout")
    const hint = page.getByTestId("compare-generic-hint")
    await expect(hint).toContainText("Try a brand + model, e.g. Adidas Samba, Nike Air Force 1")
    await input.fill("nike")
    await expect(hint).toHaveCount(0)
    await input.fill("veste")
    await expect(hint).toBeVisible()
    await input.fill("veste Carhartt")
    await expect(hint).toHaveCount(0)
    await input.fill("veste")
    await hint.getByRole("button", { name: "Nike Air Force 1" }).click()
    await expect(page.getByTestId("compare-pooled-median")).toBeVisible()
    expect(asked).toEqual(["Nike Air Force 1"])
    await expect(hint).toHaveCount(0)
  })

  test("old backend payload (no reason/suggestions) still renders as before: no nudge, no chips", async ({ page }) => {
    await as(page, PRO)
    await page.route("**/api/compare/prices*", (r) => r.fulfill({ json: SAMPLE }))
    await page.goto("/compare")
    await page.locator("input[placeholder*='e.g.']").fill("Adidas Samba")
    await page.keyboard.press("Enter")
    await expect(page.getByTestId("compare-pooled-median")).toHaveText("€32")
    await expect(page.getByTestId("compare-nudge")).toHaveCount(0)
    await expect(page.getByTestId("compare-chips")).toHaveCount(0)
  })
})
