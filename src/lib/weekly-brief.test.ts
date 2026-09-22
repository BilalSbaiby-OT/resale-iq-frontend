/**
 * Honesty + shape regression for the dated weekly brief (EXP-4).
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping).
 *
 * These tests pin the rules that make the brief safe to publish and citable:
 *  - the date is the SNAPSHOT's date, never the render time;
 *  - it counts "watched" departures, never "sold";
 *  - it is aggregates only (no per-model buy-below leaks);
 *  - null/empty snapshots produce null, never a fabricated "this week".
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { buildWeeklyBrief, briefSentence } from "./weekly-brief.ts"
import type { MarketNumbers, BrandFigures } from "./market-numbers.ts"

function fig(sold_7d: number | null, avg: number | null): BrandFigures {
  return { sold_7d, avg_price_eur: avg, models_tracked: null, top_categories: [], categories: [] }
}

function mkMarket(
  brands: Array<[string, number | null, number | null]>,
  updatedAt: string | null,
  stale = false,
): MarketNumbers {
  const byBrand: Record<string, BrandFigures> = {}
  const brandNames: string[] = []
  for (const [name, sold, avg] of brands) {
    byBrand[name] = fig(sold, avg)
    brandNames.push(name)
  }
  return {
    byBrand,
    brandNames,
    stamp: updatedAt,
    updatedAt,
    listingsTracked: 5488136,
    totalListingRecords: null,
    sold7dTotal: null,
    brandCount: brandNames.length,
    brandsTracked: brandNames.length,
    publishFloorSold7d: 5,
    sold7dKind: "observed_transitions",
    provenance: null,
    stale,
    get(brand: string) {
      return byBrand[brand] ?? null
    },
  }
}

// Live-shaped fixture (2026-09-10 snapshot magnitudes, real ordering).
const LIVE = mkMarket(
  [
    ["Fred Perry", 1125, 18],
    ["Stone Island", 969, 63],
    ["Patagonia", 956, 35],
    ["Balenciaga", 459, 118],
    ["Gucci", 246, 208],
  ],
  "2026-09-10 13:27:34",
)

test("date label is the snapshot's own date, not the render time", () => {
  const b = buildWeeklyBrief(LIVE)!
  assert.equal(b.dateISO, "2026-09-10")
  assert.equal(b.dateLabel, "10 September 2026")
})

test("top movers are the most-active brands by watched departures, ordered", () => {
  const b = buildWeeklyBrief(LIVE)!
  assert.deepEqual(b.topMovers.map((m) => m.brand), ["Fred Perry", "Stone Island", "Patagonia"])
  assert.equal(b.topMovers[0].sold_7d, 1125)
})

test("priciest is ordered by average price at departure, ignoring zero/absent prices", () => {
  const b = buildWeeklyBrief(LIVE)!
  assert.equal(b.priciest[0].brand, "Gucci")
  assert.equal(b.priciest[0].avg_price_eur, 208)
})

test("total watched is the sum across every published brand", () => {
  const b = buildWeeklyBrief(LIVE)!
  assert.equal(b.totalWatched, 1125 + 969 + 956 + 459 + 246)
})

test("the sentence says 'watched', never 'sold', and carries the date + aggregate", () => {
  const s = briefSentence(buildWeeklyBrief(LIVE)!)
  assert.match(s, /watched/)
  assert.doesNotMatch(s, /\bsold\b/i)
  assert.match(s, /10 September 2026/)
  assert.match(s, /3,755 items/) // the live total, en-GB grouped
  assert.match(s, /Fred Perry \(1,125\)/)
})

test("a brand with no price is still counted in departures but never invents a price", () => {
  const m = mkMarket([["Nike", 208, null], ["Adidas", 100, 40]], "2026-09-10 13:27:34")
  const b = buildWeeklyBrief(m)!
  assert.equal(b.totalWatched, 308)
  assert.equal(b.topMovers[0].brand, "Nike")
  // Nike has no price, so it cannot lead the priciest list.
  assert.equal(b.priciest[0].brand, "Adidas")
})

test("no date means no brief — never a dateless 'this week'", () => {
  assert.equal(buildWeeklyBrief(mkMarket([["Nike", 208, 68]], null)), null)
})

test("an empty snapshot means no brief, never fabricated numbers", () => {
  assert.equal(buildWeeklyBrief(mkMarket([], "2026-09-10 13:27:34")), null)
})

test("brands with a null sold count are dropped, not treated as zero", () => {
  const m = mkMarket([["Ghost", null, 50], ["Nike", 208, 68]], "2026-09-10 13:27:34")
  const b = buildWeeklyBrief(m)!
  assert.equal(b.brandCount, 1)
  assert.equal(b.totalWatched, 208)
})

test("stale flag rides through so the surface can label a cached brief", () => {
  const b = buildWeeklyBrief(mkMarket([["Nike", 208, 68]], "2026-09-10 13:27:34", true))!
  assert.equal(b.stale, true)
})
