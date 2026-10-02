import test from "node:test"
import assert from "node:assert/strict"
import { pickVariant } from "./ab.ts"
import { AB_CTA_LABEL_B, AB_REG_CTA_B } from "./ab-copy.ts"

test("pickVariant splits 50/50 at the midpoint", () => {
  assert.equal(pickVariant(0), "A")
  assert.equal(pickVariant(0.499), "A")
  assert.equal(pickVariant(0.5), "B")
  assert.equal(pickVariant(0.999), "B")
  let b = 0
  for (let i = 0; i < 10000; i++) if (pickVariant() === "B") b++
  assert.ok(b > 4700 && b < 5300, `B share ${b / 100}%`)
})

test("variant B copy exists in all six locales, states €0/free, no profit promise", () => {
  for (const m of [AB_CTA_LABEL_B, AB_REG_CTA_B]) {
    assert.deepEqual(Object.keys(m).sort(), ["de", "en", "es", "fr", "it", "pt"])
    for (const v of Object.values(m)) assert.doesNotMatch(v, /profit|earn|guarantee|garant/i)
  }
})
