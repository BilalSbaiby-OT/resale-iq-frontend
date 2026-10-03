import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * /buy prints pace tiers (Moving fast / Steady / Slow), never a departure count.
 * Fetches the real server-rendered HTML of every /buy page family — body, meta
 * description, OG tags, JSON-LD — and asserts no digit sits next to
 * "departures" / "listings left the shelf", no "Fewer than N" band, and no
 * leftover count label. Source of the page set: the same buy-data.json the
 * pages render (batch-1 brands + leaves, every category, the hub).
 */
const data = JSON.parse(readFileSync(join(process.cwd(), "src/data/buy-data.json"), "utf8"))
const BATCH1 = [
  "stone-island/hoodies", "fred-perry/shirts", "patagonia/jackets", "new-balance/sneakers", "patagonia/bags",
  "stone-island/jackets", "balenciaga/sneakers", "fred-perry/t-shirts", "the-north-face/jackets", "patagonia/hoodies",
  "gucci/bags", "diesel/jeans", "fred-perry/hoodies", "stone-island/shirts", "off-white/shirts", "gucci/caps",
  "patagonia/t-shirts", "stone-island/t-shirts", "nike/sneakers", "patagonia/caps",
]
const slug = (c: string) => c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const categories = [...new Set<string>(data.brands.flatMap((b: any) => b.categories.map((c: any) => c.category)))]
const brandSlugs = [...new Set(BATCH1.map((s) => s.split("/")[0]))]
const paths = ["/buy", ...categories.map((c) => `/buy/category/${slug(c)}`), ...brandSlugs.map((b) => `/buy/${b}`), ...BATCH1.map((s) => `/buy/${s}`)]

const BANNED: Array<[string, RegExp]> = [
  ["digits before departures", /\d[\d,.]*\+?\s+(?:watched\s+)?departures/i],
  ["digits before 'listings left the shelf'", /\d[\d,.]*\+?\s+(?:[A-Za-z&'.-]+\s+){0,3}listings\s+(?:left|leave) the shelf/i],
  ["digits after 'left the shelf /'", /left the shelf\s*\/\s*\d/i],
  ["Fewer than N band", /Fewer than \d/i],
  ["threshold string", /sold_30d|\(30-day departures\)/],
  ["'sold' word", /\bsold\b(?!_)/i],
]

test.describe("/buy shows tiers, not departure counts", () => {
  test.setTimeout(240_000)
  for (const path of paths) {
    test(path, async ({ request }) => {
      const res = await request.get(path, { timeout: 90_000 })
      expect(res.status(), path).toBe(200)
      const html = await res.text()
      for (const [name, re] of BANNED) {
        const m = re.exec(html)
        expect(m, `${path}: ${name}: ${m ? html.slice(Math.max(0, m.index - 60), m.index + 100) : ""}`).toBeNull()
      }
    })
  }

  test("tier labels reach the screen on hub, brand, category and leaf", async ({ request }) => {
    const tier = /Moving fast|Steady|Slow/
    for (const p of ["/buy", "/buy/category/shirts", "/buy/fred-perry", "/buy/fred-perry/shirts"]) {
      const html = await (await request.get(p, { timeout: 90_000 })).text()
      expect(html, p).toMatch(tier)
    }
  })
})
