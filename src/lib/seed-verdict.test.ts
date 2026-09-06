/**
 * The seed gate for the signed-in first screen.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping.)
 *
 * This exists because the failure it guards against is silent. If the backend
 * ever hands back a verdict with no buy_below — an INSUFFICIENT_DATA row that
 * slipped the shape check, a gated payload, a partial outage — the example card
 * would still render, and it would render the buy-below tile as "—". The whole
 * argument the card is making is that this product answers with a number, so
 * the degraded version does not argue for the product; it argues against it,
 * on the first screen a new account ever sees.
 *
 * The fallback is the plain empty state, which is what the page did before and
 * is not a regression.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { seedWorthShowing } from "./seed-verdict.ts"

// The live production row, read from inside the backend container 2026-09-06:
// {"verdict":"WATCH","product":"New Balance 530","buy_below":26.79,
//  "sell_avg":40.29,"sold_7d":497,"active_listings":102385}
const LIVE = {
  verdict: "WATCH",
  product: "New Balance 530",
  category: "Sneakers",
  confidence: "HIGH",
  buy_below: 26.79,
  sell_avg: 40.29,
  sold_7d: 497,
  active_listings: 102385,
}

test("the live production seed is shown", () => {
  assert.equal(seedWorthShowing(LIVE), LIVE)
})

test("no seed at all is not a seed", () => {
  assert.equal(seedWorthShowing(null), null)
  assert.equal(seedWorthShowing(undefined), null)
})

test("a verdict with no buy-below is dropped, not rendered with a dash", () => {
  assert.equal(seedWorthShowing({ ...LIVE, buy_below: null }), null)
  const { buy_below: _absent, ...noPrice } = LIVE
  void _absent
  assert.equal(seedWorthShowing(noPrice), null)
})

// A free-tier price is a real price. The guard is `!= null`, so it must not
// quietly become falsy-testing the day someone "simplifies" it — a €0 buy-below
// is a data problem worth showing, not a missing field.
test("a zero buy-below is a number, and a number is shown", () => {
  const zero = { ...LIVE, buy_below: 0 }
  assert.equal(seedWorthShowing(zero), zero)
})
