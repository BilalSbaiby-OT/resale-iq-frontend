import { test } from "node:test"
import assert from "node:assert/strict"
import { verdictUpsellLine } from "./verdict-upsell.ts"

/**
 * verdictUpsellLine — the ONE real per-item line shown directly under a free
 * verdict result for anon/free users. Must be computed from the verdict's own
 * fields only (never invented), and must be omitted (not zero-filled) when
 * either field is missing — the founder's never-manufacture-numbers rule.
 */

test("both buy_below and sell_avg present — full margin line", () => {
  const line = verdictUpsellLine({ buy_below: 25.61, sell_avg: 38.5 })
  assert.equal(line, "Buy below €26 · typical exit €39 → ~€13 margin")
})

test("margin never goes negative when sell_avg < buy_below (data noise)", () => {
  const line = verdictUpsellLine({ buy_below: 40, sell_avg: 35 })
  assert.equal(line, "Buy below €40 · typical exit €35")
})

test("buy_below missing — omit the line entirely, never invent a number", () => {
  assert.equal(verdictUpsellLine({ buy_below: null, sell_avg: 38.5 }), null)
})

test("sell_avg missing — omit the line entirely", () => {
  assert.equal(verdictUpsellLine({ buy_below: 25.61, sell_avg: undefined }), null)
})

test("both missing — omit", () => {
  assert.equal(verdictUpsellLine({ buy_below: null, sell_avg: null }), null)
})

test("rounds to whole euros, matching the rest of the site's money() formatting", () => {
  const line = verdictUpsellLine({ buy_below: 19.4, sell_avg: 29.6 })
  assert.equal(line, "Buy below €19 · typical exit €30 → ~€11 margin")
})
