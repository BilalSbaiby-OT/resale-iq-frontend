import { expect, test } from "@playwright/test"

/**
 * Rendered-page copy guard for the translated storefront (/, /pricing, /tools in
 * es/fr/de/it/pt) before paid traffic lands on it.
 *
 *  1. No leftover English UI strings on the translated pages (the set below was
 *     found on live /fr and /es on 2026-10-03: buy-list unlock label, free-sample
 *     line, trial/refund lines, pricing matrix, FAQ chrome, tools proof strip).
 *  2. No profit/margin promise on any locale (en included) — the max buy price is
 *     "70% of the typical resale price", never "~30% margin".
 *
 * Source-level twin of (2): src/lib/copy-no-profit-promise.test.ts.
 */
const TRANSLATED = ["es", "fr", "de", "it", "pt"] as const
const PAGES = ["", "/pricing", "/tools"]

const ENGLISH_LEFTOVERS = [
  "Unlock the rest",
  "Full weekly list",
  "Free samples",
  "free samples, no account",
  "card required",
  "€0 today",
  "30-day refund",
  "See plans",
  "cancel anytime",
  "Instant access",
  "Buy prices",
  "pre-fills Stripe",
  "What the verdict shows",
  "Try a live verdict",
  "Know the most to pay",
  "Common questions",
  "Honest answers",
  "Not ready to subscribe",
  "Plans from",
  "5 EU markets",
  "Start my 7-day free trial",
  "best finds to look for",
  "Get the numbers",
  "A worked example",
  "Typical resale price",
  "Example verdict",
  "Your own brand",
  "subscriber only",
  "unlocked with Starter",
  "Check your own item",
]

const PROFIT_PROMISE = [
  /30\s?%\s?(?:de |di )?(?:gross |net |target )?(?:margin|marge|margen|margine|margem|Marge)\b/i,
  /(?:marge|margen|margine|margem|Marge)\s+(?:de|del|di|von)\s+(?:(?:cerca|circa|etwa|environ)\s+)?~?\s?(?:il\s+)?30/i,
  /~\s?30\s?%/,
  /and still profit/i,
  /margin before fees/i,
]

async function visibleText(page: import("@playwright/test").Page): Promise<string> {
  // /tools lists the five search-intent pages (/tools/<slug>) with English titles and
  // descriptions on purpose — those pages are English-only (src/data/search-intents.ts).
  await page.evaluate(() => document.querySelectorAll('a[href^="/tools/"]').forEach((a) => a.remove()))
  const body = await page.locator("body").innerText()
  const attrs = await page.evaluate(() =>
    [...document.querySelectorAll("[aria-label],[placeholder],[title],[alt]")]
      .map((el) => ["aria-label", "placeholder", "title", "alt"].map((a) => el.getAttribute(a) ?? "").join(" "))
      .join(" "),
  )
  const meta = await page.evaluate(() =>
    [...document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[property="og:title"]')]
      .map((m) => m.getAttribute("content") ?? "")
      .join(" "),
  )
  const ld = await page.evaluate(() =>
    [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? "").join(" "),
  )
  return `${await page.title()} ${meta} ${attrs} ${body} ${ld}`
}

for (const loc of TRANSLATED) {
  for (const path of PAGES) {
    test(`/${loc}${path}: no leftover English UI strings`, async ({ page }) => {
      const res = await page.goto(`/${loc}${path}`, { waitUntil: "domcontentloaded" })
      expect(res?.ok()).toBeTruthy()
      await page.waitForTimeout(600)
      const text = await visibleText(page)
      const found = ENGLISH_LEFTOVERS.filter((s) => text.toLowerCase().includes(s.toLowerCase()))
      expect(found, `English leftovers on /${loc}${path}`).toEqual([])
    })
  }
}

for (const loc of ["", ...TRANSLATED.map((l) => `/${l}`)]) {
  for (const path of PAGES) {
    test(`${loc || "/en"}${path}: no profit/margin promise`, async ({ page }) => {
      const res = await page.goto(`${loc}${path}` || "/", { waitUntil: "domcontentloaded" })
      expect(res?.ok()).toBeTruthy()
      await page.waitForTimeout(600)
      const text = await visibleText(page)
      for (const re of PROFIT_PROMISE) expect(text, `${re} on ${loc}${path}`).not.toMatch(re)
    })
  }
}
