/**
 * O3 honest output: numbers first, LOW DATA under 20 comparables, never "sold".
 * Run: npm run test:unit
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { basisText, hasHonestContent, honestCopy, isLowData, lowDataNoteText, rangeText, type HonestOutput } from "./honest-output.ts"

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

// Backend switches (HONEST_COUNTS_PUBLIC / HONEST_RANGE_PUBLIC) OMIT keys for anon/free callers.
const anon: HonestOutput = {
  basis: "departed", range_low_eur: 21, range_high_eur: 39, max_buy_eur: 21, margin_pct: 30,
  low_data: false, verdict_display: "BUY",
}

test("counts withheld: range still renders, no count sentence, nothing 'undefined'", () => {
  assert.equal(rangeText(anon), "€21 – €39")
  assert.equal(basisText(anon, "en"), null)
  assert.equal(hasHonestContent(anon), true)
})

test("range withheld, count public: count line renders without a range", () => {
  const h: HonestOutput = { ...anon, range_low_eur: undefined, range_high_eur: undefined, n: 47, window_days: 7 }
  assert.equal(rangeText(h), null)
  assert.equal(basisText(h, "en"), "Based on 47 listings that left Vinted in the last 7 days")
})

test("everything withheld but max buy / LOW DATA: still content; truly empty is not", () => {
  const maxOnly: HonestOutput = { basis: "departed", max_buy_eur: 21, margin_pct: 30, low_data: false, verdict_display: "BUY" }
  assert.equal(hasHonestContent(maxOnly), true)
  const lowOnly: HonestOutput = { basis: "departed", max_buy_eur: null, margin_pct: 30, low_data: true, verdict_display: "LOW_DATA" }
  assert.equal(hasHonestContent(lowOnly), true)
  assert.equal(isLowData(lowOnly), true)
  const empty: HonestOutput = { basis: "departed", max_buy_eur: null, margin_pct: 30, low_data: false, verdict_display: "WATCH" }
  assert.equal(hasHonestContent(empty), false)
})

test("LOW DATA note with the count withheld never prints a number or 'undefined', in all six locales", () => {
  const lowOnly: HonestOutput = { basis: "departed", max_buy_eur: null, margin_pct: 30, low_data: true, verdict_display: "LOW_DATA" }
  for (const loc of ["en", "fr", "es", "de", "it", "pt"] as const) {
    const note = lowDataNoteText(lowOnly, loc)
    assert.ok(note.length > 10, loc)
    assert.doesNotMatch(note, /undefined|NaN|\d/, loc)
    assert.doesNotMatch(note, /\bsold\b|\bvendid|\bvendu|\bverkauft/i, loc)
  }
  assert.equal(lowDataNoteText({ ...lowOnly, n: 12 }, "en"), "Only 12 comparable listings: too few for a call.")
})
