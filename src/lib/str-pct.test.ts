/**
 * Boundary regression for the sell-through formatter.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping — no runner
 * dependency, so this stays runnable in CI and in the container build).
 *
 * The bug being pinned: a real non-zero rate printing as "0%". The live
 * production numbers in the 0.1–0.4% band (see src/lib/str-pct.ts for the
 * four models measured 2026-09-05) are the reason this file exists, so they
 * are asserted directly rather than only at the synthetic boundaries.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { formatStrPct, STR_PCT_FLOOR } from "./str-pct.ts"

test("a zero rate never prints as 0% — it prints the bound", () => {
  assert.equal(formatStrPct(0), "<0.1%")
})

test("0.19% (Adidas Samba, live) prints as 0.2%, never 0%", () => {
  assert.equal(formatStrPct(0.19), "0.2%")
})

test("1% and 100% keep whole numbers whole", () => {
  assert.equal(formatStrPct(1), "1%")
  assert.equal(formatStrPct(100), "100%")
})

test("every live sub-1% rate stays non-zero on screen", () => {
  // sold / (sold + active) * 100, production 2026-09-05.
  const live: Array<[string, number, string]> = [
    ["Adidas Samba", 0.1898, "0.2%"],
    ["Nike Air Force 1", 0.3758, "0.4%"],
    ["New Balance 9060", 0.386, "0.4%"],
    ["Levi's 501", 0.1038, "0.1%"],
    ["New Balance 530", 0.555, "0.6%"],
  ]
  for (const [model, rate, expected] of live) {
    const shown = formatStrPct(rate)
    assert.equal(shown, expected, `${model}: ${rate}% rendered ${shown}`)
    assert.notEqual(shown, "0%", `${model} must never render as 0%`)
  }
})

test("below the precision floor prints the bound, not a rounded digit", () => {
  assert.equal(formatStrPct(0.09), "<0.1%")
  assert.equal(formatStrPct(0.0001), "<0.1%")
  assert.equal(formatStrPct(STR_PCT_FLOOR), "0.1%") // the floor itself is printable
})

test("above the floor, one decimal and no invented precision", () => {
  assert.equal(formatStrPct(0.55), "0.6%")
  assert.equal(formatStrPct(8.6923), "8.7%")
  assert.equal(formatStrPct(88.44), "88.4%")
})

test("null is not zero — an absent rate has no string", () => {
  assert.equal(formatStrPct(null), null)
  assert.equal(formatStrPct(undefined), null)
  assert.equal(formatStrPct(Number.NaN), null)
  assert.equal(formatStrPct(Number.POSITIVE_INFINITY), null)
})
