import { test } from "node:test"
import assert from "node:assert/strict"
import { collapseDoubledModelQuery, itemDisplayName } from "./item-display-name.ts"

test("does not repeat the brand when the model already starts with it", () => {
  assert.equal(itemDisplayName("Fred Perry", "Fred Perry Polo"), "Fred Perry Polo")
  assert.equal(itemDisplayName("Balenciaga", "balenciaga track"), "balenciaga track")
})

test("prefixes the brand when the model does not contain it", () => {
  assert.equal(itemDisplayName("Nike", "Air Force 1"), "Nike Air Force 1")
})

test("handles missing parts", () => {
  assert.equal(itemDisplayName("Stone Island", null), "Stone Island")
  assert.equal(itemDisplayName(undefined, "Samba"), "Samba")
})

test("collapses a doubled brand prefix and leaves a real query alone", () => {
  // Live 2026-09-29: "Fred Perry Fred Perry Polo" → 402 paywall, tracked.
  // The free sample is the collapsed string.
  assert.equal(collapseDoubledModelQuery("Fred Perry Fred Perry Polo"), "Fred Perry Polo")
  assert.equal(collapseDoubledModelQuery("Nike Nike Air Force 1"), "Nike Air Force 1")
  assert.equal(collapseDoubledModelQuery("Stone Island Stone Island Hoodie"), "Stone Island Hoodie")
  assert.equal(collapseDoubledModelQuery("Nike Air Force 1"), "Nike Air Force 1")
  assert.equal(collapseDoubledModelQuery("Adidas Samba"), "Adidas Samba")
  assert.equal(collapseDoubledModelQuery("  fred perry   Fred Perry Polo  "), "Fred Perry Polo")
  assert.equal(collapseDoubledModelQuery(""), "")
})
