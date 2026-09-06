import { test, expect } from "@playwright/test"
import { loginAs } from "./app-session"

/**
 * THE LOGGED-IN APP IN SPANISH, AT PHONE AND DESKTOP WIDTH.
 *
 * These surfaces are client-rendered and behind auth, so `curl` proves nothing
 * about them — the English strings this suite guards were live on production
 * for days underneath an HTML response that looked fine. Everything here is
 * asserted against the RENDERED DOM of a logged-in session.
 *
 * The locale reaches these routes via the `NEXT_LOCALE` cookie, which
 * `src/proxy.ts` reads back for every `APP_LOCALE_PREFIXES` path (both
 * `/dashboard` and `/deals` are in that list) and re-stamps as
 * `x-resaleiq-locale`. The root layout turns that into `<LocaleProvider>`.
 * Setting the cookie is therefore exactly what a customer using the sidebar
 * language control does.
 */

const VIEWPORTS = [
  { name: "390", width: 390, height: 844 },
  { name: "1280", width: 1280, height: 900 },
]


for (const vp of VIEWPORTS) {
  test.describe(`es @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test("Deal Scanner renders no English chrome", async ({ page }) => {
      await loginAs(page, "es")
      await page.goto("/deals")
      await expect(page.getByTestId("riq-deal-card").first()).toBeVisible({ timeout: 30_000 })
      const body = await page.locator("main").innerText()

      // The exact strings the founder screenshotted at 02:04.
      for (const english of [
        "Deal Scanner", "Find live deals", "Buy Below", "BUY BELOW",
        "Sell-through", "All Categories", "All Brands",
        "Search model or brand", "Avg at exit", "Listed now", "Target net",
      ]) {
        expect(body, `English orphan still rendered: ${english}`).not.toContain(english)
      }
      // Momentum chips were the raw API enum.
      expect(body).not.toContain("RISING")
      expect(body).not.toContain("HOT")

      // And the Spanish that must be there instead.
      expect(body).toContain("Compra por debajo de")
      expect(body).toContain("Media a la salida")
      expect(body).toContain("Subiendo")
      expect(body).toContain("Zapatillas")   // category, not "Sneakers"
      expect(body).toContain("Buscar anuncios ahora")
    })

    test("Panel renders no English chrome", async ({ page }) => {
      await loginAs(page, "es")
      await page.goto("/dashboard")
      await expect(page.getByText("Zapatillas").first()).toBeVisible({ timeout: 30_000 })
      const body = await page.locator("main").innerText()

      expect(body).not.toContain("Sneakers")
      expect(body).not.toContain("Quick one.")
      expect(body).not.toContain("Not now")
      // The retired abbreviation, in either spelling.
      expect(body).not.toContain("STR")
    })

    test("one language control, not two", async ({ page }) => {
      await loginAs(page, "es")
      await page.goto("/dashboard")
      // The panel used to mount its own switcher on top of the sidebar's.
      await expect(page.getByTestId("riq-locale-switcher")).toHaveCount(1)
    })
  })

  test.describe(`en @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test("English is unchanged and the truth rules hold", async ({ page }) => {
      await loginAs(page, "en")
      await page.goto("/deals")
      await expect(page.getByTestId("riq-deal-card").first()).toBeVisible({ timeout: 30_000 })
      const body = await page.locator("main").innerText()

      expect(body).toContain("Buy below")
      expect(body).toContain("Rising")

      // PART 3, and the two ends of the rule in src/lib/str-pct.ts.
      // Adidas Samba's real production rate is 43/22,607 = 0.1898%. It is
      // ABOVE the 0.1pp floor, so one decimal is the honest rendering: "0.2%".
      expect(body).toContain("0.2%")
      // Levi's 501 sits below the floor, where we do not have the precision to
      // state a digit. It must print the BOUND, which is true of 0.09 and of
      // 0.0001 alike, and never claim the rate is zero.
      expect(body).toContain("<0.1%")
      // Neither may collapse to "about 0%" — a real rate rounded to nothing
      // tells a reseller there is no demand for an item that had 47 departures
      // in a week, which is the opposite of what the data says.
      expect(body).not.toMatch(/(^|[^.\d])0%/)
      expect(body).not.toContain("0.0%")

      // A provisional ranking still says it is provisional.
      expect(body).toContain("sell-through sample is still thin")
    })
  })
}

test("gated buy-below reads as gated, never a bare em-dash", async ({ page }) => {
  await page.route("**/api/deals**", async (route) => {
    // What production actually returns for a withheld money field: `locked`
    // is the constant false, and only `locked_fields` tells the truth.
    // See src/lib/locked-fields.ts for the production curl.
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        deals: [{
          brand: "Adidas", model: "Samba OG", category: "Sneakers",
          sold_7d: 43, sold_30d: 180, avg_price_eur: 78, max_buy_price: null,
          str_pct: null, active_listings: 22607, opportunity_score: null,
          momentum_label: "RISING", months_supply: null, speed_score: null,
          size_velocity: [], top_sizes: [], data_quality_score: 0.9,
          est_profit_eur: null, profit_margin_pct: null,
          sell_speed: "Fast", risk_level: "Low", sourcing_links: [],
        }],
        count: 1, locked: false, locked_fields: ["max_buy_price"],
      }),
    })
  })
  await loginAs(page, "en")
  await page.goto("/deals")
  await expect(page.getByTestId("riq-locked-buy")).toBeVisible({ timeout: 30_000 })
  // It is a route out, not a dead dash.
  await expect(page.getByTestId("riq-locked-buy")).toHaveAttribute("href", "/account")
})
