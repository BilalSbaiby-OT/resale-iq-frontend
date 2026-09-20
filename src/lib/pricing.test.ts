import { test } from "node:test"
import assert from "node:assert/strict"
import { resolvePriceId, BAKED_PRICE_IDS } from "./pricing.ts"

test("empty plans still returns baked Starter/Pro ids — first click must not hit /register", () => {
  assert.equal(resolvePriceId("__OPERATOR__", []), BAKED_PRICE_IDS.operator)
  assert.equal(resolvePriceId("__POWER__", []), BAKED_PRICE_IDS.power)
})

test("live /stripe/plans ids win over baked fallback", () => {
  const plans = [{ id: "operator", price_id: "price_NEW" }]
  assert.equal(resolvePriceId("__OPERATOR__", plans), "price_NEW")
})

test("unknown placeholder stays undefined", () => {
  assert.equal(resolvePriceId("nope", []), undefined)
  assert.equal(resolvePriceId(undefined, []), undefined)
})
