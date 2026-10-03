/**
 * O3 honest output: numbers first, LOW DATA under 20 comparables, never "sold".
 * Run: npm run test:unit
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { basisText, hasHonestContent, honestCopy, isLowData, rangeText, type HonestOutput } from "./honest-output.ts"

const base: HonestOutput = {
  basis: "departed", range_low_eur: 21, range_high_eur: 39, n: 47, window_days: 7,
  max_buy_eur: 21, margin_pct: 30, low_data: false, verdict_display: "BUY",
}

test("range and basis lead with the numbers", () => {
  assert.equal(rangeText(base), "€21 – €39")
  assert.equal(basisText(base, "en"), "Based on 47 listings that left Vinted in the last 7 days")
  assert.equal(basisText({ ...base, window_days: 30 }, "en"), "Based on 47 listings that left Vinted in the last 30 days")
})

test("no range, no count -> nothing invented", () => {
  const empty: HonestOutput = { ...base, range_low_eur: null, range_high_eur: null, n: 0, window_days: null, max_buy_eur: null }
  assert.equal(rangeText(empty), null)
  assert.equal(basisText(empty, "en"), null)
  assert.equal(hasHonestContent(empty), false)
  assert.equal(hasHonestContent(null), false)
  assert.equal(hasHonestContent(undefined), false)
})

test("LOW DATA only when the backend says so", () => {
  assert.equal(isLowData(base), false)
  assert.equal(isLowData({ ...base, n: 12, low_data: true, verdict_display: "LOW_DATA" }), true)
  assert.equal(isLowData({ ...base, low_data: true, verdict_display: "BRAND_AVERAGE" }), false)
  assert.equal(isLowData(null), false)
})

test("active-asking basis never claims listings left Vinted", () => {
  const e1: HonestOutput = { ...base, basis: "active_asking", window_days: null, n: 14, low_data: true, verdict_display: "LOW_DATA" }
  const en = basisText(e1, "en")!
  assert.match(en, /live asking prices/)
  assert.match(en, /not listings that left Vinted/)
  assert.doesNotMatch(en, /in the last/)
})

test("all six locales: complete, no 'sold', margin from the payload", () => {
  assert.deepEqual(Object.keys(honestCopy).sort(), ["de", "en", "es", "fr", "it", "pt"])
  for (const [loc, c] of Object.entries(honestCopy)) {
    const all = [c.rangeLabel, c.departed(5, 7), c.active(5), c.maxBuyLabel, c.margin(30), c.lowData, c.lowDataNote(5)].join(" | ")
    assert.doesNotMatch(all, /\bsold\b|\bvendid|\bvendu|\bverkauft/i, loc)
    assert.ok(c.margin(30).includes("30"), loc)
    assert.ok(c.departed(47, 30).includes("47") && c.departed(47, 30).includes("30"), loc)
  }
  assert.equal(honestCopy.en.margin(30), "for ~30% gross margin before fees")
  assert.equal(honestCopy.en.lowData, "LOW DATA")
})
