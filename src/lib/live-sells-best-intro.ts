import type { MarketNumbers } from "./market-numbers.ts"
import { departureDisplay, departureIsPrintable } from "./departure-display.ts"

/**
 * Live 2-sentence opening for /blog/what-sells-best-on-vinted.
 *
 * WHY: the post's `intro` field was a hand-written sentence pinned to
 * "23 September 2026" — every day after that the visible date and the
 * numbers next to it went stale while the rest of the site (homepage,
 * /data, /blog index H164) reads getMarketNumbers() live. Audit
 * 2026-09-29 flagged this as the one big landing page whose headline
 * claim does not move with the data feeding it.
 *
 * This is intentionally its OWN small aggregation (category totals from
 * BrandFigures.categories, top brand/category pair) — not a copy of the
 * /blog index H164 paragraph (src/app/blog/page.tsx liveSellingParagraph),
 * which lists top BRANDS. This lists the top CATEGORY and the single top
 * brand/category PAIR, matching the specific claim this post makes.
 * Different aggregation, different shape — see check:dupes ALLOW list
 * rationale in scripts/check-duplicate-logic.mjs if this ever collides.
 *
 * Never fabricates: returns null when the live snapshot has no usable
 * category data, and the caller keeps the original static intro.
 */
export interface LiveSellsBestIntro {
  /** Two-sentence answer, ready to render as-is. */
  text: string
  /** ISO timestamp of the snapshot this was computed from. */
  updatedAtIso: string
  /** Human label, e.g. "2026-09-29 11:00 UTC" — same stamp /data shows. */
  updatedLabel: string
}

export function liveSellsBestIntro(market: MarketNumbers): LiveSellsBestIntro | null {
  if (!market.updatedAt || !market.stamp) return null

  type Pair = { brand: string; category: string; sold_7d: number; avg_price_eur: number | null }
  const pairs: Pair[] = []
  const byCategory = new Map<string, number>()

  for (const name of market.brandNames) {
    const f = market.get(name)
    if (!f) continue
    for (const c of f.categories) {
      if (c.sold_7d == null || c.sold_7d <= 0) continue
      pairs.push({ brand: name, category: c.category, sold_7d: c.sold_7d, avg_price_eur: c.avg_price_eur })
      byCategory.set(c.category, (byCategory.get(c.category) ?? 0) + c.sold_7d)
    }
  }

  if (pairs.length === 0 || byCategory.size === 0) return null

  const categoriesRanked = [...byCategory.entries()].sort((a, b) => b[1] - a[1])
  const [topCategory, topCategorySold] = categoriesRanked[0]
  const second = categoriesRanked[1]

  const topPair = [...pairs].sort((a, b) => b.sold_7d - a.sold_7d)[0]
  // Display floor: never lead a sentence with a count that is not printable.
  if (!departureIsPrintable(topCategorySold) || !departureIsPrintable(topPair.sold_7d)) return null

  const date = new Date(market.updatedAt).toISOString().slice(0, 10)
  const brandCount = market.brandCount

  const sentence1 =
    `As of ${date}, ${topCategory} is the busiest category on Vinted across the 5 EU markets Resale IQ tracks ` +
    `(Spain, France, Germany, Italy, Portugal): ${departureDisplay(topCategorySold).text} watched departures ` +
    `in the trailing 7 days across ${brandCount} brands with published weekly data` +
    (second && departureIsPrintable(second[1]) ? ` — ahead of ${second[0]} (${departureDisplay(second[1]).text}).` : ".")

  // No count for the pair (founder decision 2026-10-02): it is named and priced.
  const sentence2 =
    `The single busiest brand/category pair is ${topPair.brand} ${topPair.category}` +
    (topPair.avg_price_eur != null ? `, averaging €${Math.round(topPair.avg_price_eur)} at departure.` : ".")

  return {
    text: `${sentence1} ${sentence2}`,
    updatedAtIso: market.updatedAt,
    updatedLabel: market.stamp,
  }
}
