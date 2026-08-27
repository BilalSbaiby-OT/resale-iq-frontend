#!/usr/bin/env node
/**
 * Fails if the homepage proof band can pair category volume with a brand mean.
 *
 * Reimplements the grain rule next to a grep that the live component actually
 * imports buildSellingThisWeekRows — a duplicated algorithm that the component
 * never called would pass this file and still ship the 2026-08-22 bug
 * (New Balance sneakers 197/wk · avg €21, sneakers mean €41).
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import assert from "node:assert/strict"

const ROOT = new URL("..", import.meta.url).pathname

function buildSellingThisWeekRows(brands, limit = 3) {
  const rows = []
  for (const { name, data } of brands) {
    let top = null
    for (const c of data.categories) {
      if (typeof c.sold_7d !== "number" || !Number.isFinite(c.sold_7d)) continue
      if (!top || (top.sold_7d ?? 0) < c.sold_7d) top = c
    }
    if (!top || top.sold_7d == null) continue
    rows.push({
      brand: name,
      category: top.category,
      sold: top.sold_7d,
      avg: top.avg_price_eur,
    })
  }
  return rows.sort((a, b) => b.sold - a.sold).slice(0, limit)
}

const fixture = [
  {
    name: "New Balance",
    data: {
      avg_price_eur: 21,
      categories: [
        { category: "Sneakers", sold_7d: 197, avg_price_eur: 41 },
        { category: "Tracksuits", sold_7d: 7, avg_price_eur: 11 },
      ],
    },
  },
  {
    name: "Fred Perry",
    data: {
      avg_price_eur: 24,
      categories: [
        { category: "Shirts", sold_7d: 166, avg_price_eur: 16 },
        { category: "T-Shirts", sold_7d: 50, avg_price_eur: 11 },
      ],
    },
  },
  {
    name: "Patagonia",
    data: {
      avg_price_eur: 31,
      categories: [
        { category: "Jackets", sold_7d: 108, avg_price_eur: 48 },
        { category: "Bags", sold_7d: 98, avg_price_eur: 25 },
      ],
    },
  },
]

const rows = buildSellingThisWeekRows(fixture, 3)
assert.equal(rows[0].brand, "New Balance")
assert.equal(rows[0].category, "Sneakers")
assert.equal(rows[0].sold, 197)
assert.equal(rows[0].avg, 41, "must use category avg, not brand avg 21")
assert.equal(rows[1].avg, 16, "Fred Perry shirts are €16, not brand €24")

const ts = readFileSync(join(ROOT, "src/lib/market-proof.ts"), "utf8")
assert.match(ts, /top\.avg_price_eur/)
assert.doesNotMatch(ts, /data\.avg_price_eur/)

const component = readFileSync(join(ROOT, "src/components/landing/live-market-proof.tsx"), "utf8")
assert.match(component, /buildSellingThisWeekRows/)
assert.doesNotMatch(component, /avg: b\.avg_price_eur/)

const libAlgo = ts.includes("top.avg_price_eur")
assert.equal(libAlgo, true)

console.log("✓ market-proof grain: category sold pairs with category avg")
