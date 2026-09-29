import { test } from "node:test"
import assert from "node:assert/strict"
import { itemDisplayName } from "./item-display-name.ts"

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
