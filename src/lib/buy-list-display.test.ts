import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { buyBelowLabel, targetLabel, soldThisWeekLabel, BUY_LIST_UNLOCK_LABEL } from "./buy-list-display.ts"
import { itemDisplayName } from "./item-display-name.ts"

test("buy below label is the real rounded ceiling, never a formula", () => {
  assert.equal(buyBelowLabel(41.25), "entry ≤ €41")
  assert.equal(buyBelowLabel(8.18), "entry ≤ €8")
  assert.equal(buyBelowLabel(null), null)
  assert.equal(buyBelowLabel(undefined), null)
})

test("unlock label is the one shared CTA", () => {
  assert.equal(BUY_LIST_UNLOCK_LABEL, "Unlock the rest — €19/mo")
})

test("a hoodie row keeps its brand and does not double a brand already in the model", () => {
  assert.equal(itemDisplayName("Stone Island", "Hoodie"), "Stone Island Hoodie")
  assert.equal(itemDisplayName("Fred Perry", "Fred Perry Polo"), "Fred Perry Polo")
  assert.notEqual(itemDisplayName("Stone Island", "Hoodie"), "Hoodie")
})

test("buy-list surfaces use the real price, the shared CTA, and itemDisplayName", () => {
  for (const f of [
    "src/components/blog-proof-strip.tsx",
    "src/components/landing/ssr-buy-list-teaser.tsx",
  ]) {
    const src = readFileSync(f, "utf8")
    assert.match(src, /buyBelowLabel/, f)
    assert.match(src, /itemDisplayName/, f)
    assert.match(src, /BUY_LIST_UNLOCK_LABEL/, f)
    assert.doesNotMatch(src, /0\.665/, f)
    assert.doesNotMatch(src, /item\.brand\}\{item\.model/, f)
  }
})

test("row wording is plain signal words in every locale, no jargon, no stray space", () => {
  assert.equal(soldThisWeekLabel(88), "sold 88 this week")
  assert.equal(targetLabel(55.6), "target ~€56")
  assert.equal(buyBelowLabel(37.2, "fr"), "entrée ≤ €37")
  for (const l of ["en", "fr", "es", "de", "it", "pt"] as const) {
    const all = [soldThisWeekLabel(88, l), targetLabel(56, l), buyBelowLabel(37, l)!].join(" ")
    assert.doesNotMatch(all, /departure|exit|wk|buy below/i, l)
    assert.doesNotMatch(all, /~ /, l)
  }
})
