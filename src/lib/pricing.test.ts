import { test } from "node:test"
import assert from "node:assert/strict"
import { resolvePriceId, resolveAnnualPriceId, tierPriceEur, BAKED_PRICE_IDS, BAKED_ANNUAL_PRICE_IDS, TIERS } from "./pricing.ts"

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

// ── Annual prices (2026-09-28 sprint): Starter €190/yr, Pro €490/yr ────────

test("empty plans still returns baked annual Starter/Pro ids", () => {
  assert.equal(resolveAnnualPriceId("__OPERATOR_ANNUAL__", []), BAKED_ANNUAL_PRICE_IDS.operator)
  assert.equal(resolveAnnualPriceId("__POWER_ANNUAL__", []), BAKED_ANNUAL_PRICE_IDS.power)
})

test("live /stripe/plans annual ids win over baked fallback", () => {
  const plans = [{ id: "operator", price_id_annual: "price_ANNUAL_NEW" }]
  assert.equal(resolveAnnualPriceId("__OPERATOR_ANNUAL__", plans), "price_ANNUAL_NEW")
})

test("unknown placeholder stays undefined for annual too", () => {
  assert.equal(resolveAnnualPriceId("nope", []), undefined)
  assert.equal(resolveAnnualPriceId(undefined, []), undefined)
})

test("TIERS carry the annual price alongside the monthly one", () => {
  const starter = TIERS.find((t) => t.id === "operator")
  const pro = TIERS.find((t) => t.id === "power")
  assert.equal(starter?.priceAnnual, 190)
  assert.equal(pro?.priceAnnual, 490)
  assert.equal(starter?.priceIdAnnual, "__OPERATOR_ANNUAL__")
  assert.equal(pro?.priceIdAnnual, "__POWER_ANNUAL__")
})

test("tierPriceEur returns the monthly price by default and the annual total when yearly", () => {
  const starter = TIERS.find((t) => t.id === "operator")!
  assert.equal(tierPriceEur(starter, "monthly"), 19)
  assert.equal(tierPriceEur(starter, "yearly"), 190)
})

test("tierPriceEur falls back to price*12 when a tier has no priceAnnual (defensive, no tier lacks one today)", () => {
  assert.equal(tierPriceEur({ price: 10 }, "yearly"), 120)
})
