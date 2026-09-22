import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const SRC = readFileSync("src/components/landing/home-buy-list.tsx", "utf8")

// The homepage buy list is the product's front door. Two defects shipped here
// together and inverted the one signal the page exists to sell:
//
//   1. deriveVerdict() accepted only ["BUY","WATCH","SKIP"], so a real
//      "STRONG BUY" from the API fell through to a price-spread heuristic.
//   2. That heuristic INVENTED a verdict from price dispersion and presented
//      it as our demand signal.
//
// Live result: the API returned STRONG BUY for all three free rows and the
// page rendered WATCH / WATCH / SKIP.

test("STRONG BUY is an accepted verdict, not relabelled", () => {
  assert.match(SRC, /"STRONG BUY",\s*"BUY",\s*"WATCH",\s*"SKIP"/)
})

test("no fabricated verdict: price spread never becomes a signal", () => {
  // The heuristic keyed off (median - p25) / median and returned BUY/WATCH/SKIP.
  assert.doesNotMatch(SRC, /const spread\s*=/)
  assert.doesNotMatch(SRC, /spread >= 0\.45/)
  assert.doesNotMatch(SRC, /if \(spread/)
})

test("STRONG BUY renders green, never the grey SKIP fallback", () => {
  // Missing from VERDICT_COLOR, "STRONG BUY" hits the ?? "#8E8E93" default —
  // our strongest signal painted in the SKIP colour.
  assert.match(SRC, /"STRONG BUY":\s*"#30D158"/)
  assert.match(SRC, /"STRONG BUY":\s*"rgba\(48,209,88/)
})
