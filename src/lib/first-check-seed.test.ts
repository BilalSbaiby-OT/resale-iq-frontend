import { test } from "node:test"
import assert from "node:assert/strict"
import { pickFirstCheckQuery } from "./first-check-seed.ts"
import { FREE_SAMPLES, FREE_SAMPLE_DEMO } from "./free-samples.ts"

test("picks the first unlocked public sample, not the hotter paywalled row", () => {
  // Live shape 2026-09-29: Stone Island Hoodie is unlocked on the public
  // buy-list but is the paywall probe. Fred Perry Polo is the first
  // FREE_SAMPLES hit. Do not concatenate brand + model.
  const q = pickFirstCheckQuery([
    { brand: "Stone Island", model: "Hoodie", locked: false },
    { brand: "Fred Perry", model: "Fred Perry Polo", locked: false },
    { brand: "Nike", model: "Air Force 1", locked: false },
  ])
  assert.equal(q, "Fred Perry Polo")
  assert.ok((FREE_SAMPLES as readonly string[]).includes(q))
})

test("skips a locked free sample and uses the next unlocked one", () => {
  assert.equal(pickFirstCheckQuery([
    { brand: "Fred Perry", model: "Fred Perry Polo", locked: true },
    { brand: "Adidas", model: "Samba", locked: false },
  ]), "Adidas Samba")
})

test("empty or non-sample lists fall back to the documented free sample", () => {
  assert.equal(pickFirstCheckQuery([]), FREE_SAMPLE_DEMO)
  assert.equal(pickFirstCheckQuery([
    { brand: "Stone Island", model: "Hoodie", locked: false },
    { brand: "Balenciaga", model: "Track", locked: true },
  ]), FREE_SAMPLE_DEMO)
})

test("canonical spelling wins over a lowercased live name", () => {
  assert.equal(pickFirstCheckQuery([
    { brand: "Nike", model: "air force 1", locked: false },
  ]), "Nike Air Force 1")
})
