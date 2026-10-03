import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { basisCopy, basisNote, basisOfRows, isLiveAsk, methodologyFaqFor, methodologyNoteFor, normalizeBasis, proofStripNote, rangeLabelFor } from "./price-basis.ts"
import { honestCopy } from "./honest-output.ts"
import { methodologyCopy } from "./methodology-copy.ts"
import { UI_STRINGS } from "./ui-strings.ts"

const LOCALES = ["en", "es", "fr", "de", "it", "pt"] as const
const SOLD = /\bsold\b|vendu|verkauft|se revend|vendid|vendut|vendid/i

test("normalizeBasis: unknown/missing is departed, never invents live_ask", () => {
  assert.equal(normalizeBasis(undefined), "departed")
  assert.equal(normalizeBasis(null), "departed")
  assert.equal(normalizeBasis("sold"), "departed")
  assert.equal(normalizeBasis("departed"), "departed")
  assert.equal(normalizeBasis("active_asking"), "active_asking")
  assert.equal(normalizeBasis("live_ask"), "live_ask")
  assert.equal(isLiveAsk("live_ask"), true)
  assert.equal(isLiveAsk("departed"), false)
})

test("HonestNumbers note + range label: departed keeps current copy, live_ask is asking-price wording", () => {
  for (const loc of LOCALES) {
    const c = honestCopy[loc]
    // departed: no note, label untouched
    assert.equal(basisNote("departed", loc, c.askingNote), null, loc)
    assert.equal(rangeLabelFor("departed", loc, c.rangeLabel), c.rangeLabel, loc)
    // active_asking: the E1 note, untouched
    assert.equal(basisNote("active_asking", loc, c.askingNote), c.askingNote, loc)
    assert.equal(rangeLabelFor("active_asking", loc, c.rangeLabel), c.rangeLabel, loc)
    // live_ask
    assert.equal(basisNote("live_ask", loc, c.askingNote), basisCopy[loc].liveAskNote, loc)
    assert.notEqual(rangeLabelFor("live_ask", loc, c.rangeLabel), c.rangeLabel, loc)
    for (const t of [basisCopy[loc].liveAskNote, basisCopy[loc].liveAskRangeLabel, basisCopy[loc].methodologyFaq, basisCopy[loc].methodologyNote]) {
      assert.ok(t.trim().length > 10, loc)
      assert.doesNotMatch(t, SOLD, `${loc}: ${t}`)
      assert.doesNotMatch(t, /left the shelf|departure|dej[oó] el escaparate|quitt[eé] l'[eé]tal|Regal verlassen|lasciato lo scaffale|saiu da prateleira/i, `${loc} live_ask copy must not describe departures`)
    }
    // The note carries no counts or window.
    assert.doesNotMatch(basisCopy[loc].liveAskNote + basisCopy[loc].liveAskRangeLabel, /\d/, loc)
  }
  assert.equal(basisCopy.en.liveAskNote, "Based on current asking prices for this model on Vinted (lower third of the market)")
  assert.match(rangeLabelFor("live_ask", "en", "Typical resale price"), /typical range/i)
})

test("methodology: departed returns the original FAQ text byte-for-byte; live_ask swaps in the asking-price text", () => {
  for (const loc of LOCALES) {
    const original = methodologyCopy[loc].faq2_a
    assert.equal(methodologyFaqFor("departed", loc, original), original, loc)
    assert.equal(methodologyFaqFor(undefined, loc, original), original, loc)
    assert.equal(methodologyNoteFor("departed", loc), null, loc)
    const live = methodologyFaqFor("live_ask", loc, original)
    assert.notEqual(live, original, loc)
    assert.equal(methodologyNoteFor("live_ask", loc), basisCopy[loc].methodologyNote, loc)
    // figure parity with the departed answer: the 0.70 multiplier and the 30% margin survive
    assert.ok(live.includes("0.70") && live.includes("30%"), loc)
  }
})

test("proof strip subtitle: departed unchanged, live_ask says asking prices, neither says sold", () => {
  assert.equal(proofStripNote("departed"), "Buy price → resale price → margin. These are watched departures — listings that left the shelf — not confirmed sales.")
  const live = proofStripNote("live_ask")
  assert.match(live, /current asking prices/)
  assert.doesNotMatch(live, /left the shelf|departures/)
  assert.doesNotMatch(live, /\bsold\b/i)
})

test("basisOfRows: any live_ask row flips the footnote; missing honest = departed", () => {
  assert.equal(basisOfRows(null), "departed")
  assert.equal(basisOfRows([{ honest: null }, {}]), "departed")
  assert.equal(basisOfRows([{ honest: { basis: "departed" } }]), "departed")
  assert.equal(basisOfRows([{ honest: { basis: "departed" } }, { honest: { basis: "live_ask" } }]), "live_ask")
})

test("buy-list footnote: both English keys exist with 5 translations and the same placeholders", () => {
  const dep = "Buy below = most you should pay, for ~30% margin before fees. Exit = average asking price at departure. Tap an item to check it."
  const live = "Buy below = most you should pay, for ~30% margin before fees. Exit = typical resale price, based on current asking prices for this model on Vinted. Tap an item to check it."
  for (const k of [dep, live]) assert.equal(UI_STRINGS[k]?.length, 5, k)
  for (const v of UI_STRINGS[live]) assert.doesNotMatch(v, SOLD, v)
  const src = readFileSync(new URL("../components/dashboard/weekly-buy-list.tsx", import.meta.url), "utf8")
  assert.ok(src.includes(dep) && src.includes(live) && src.includes("basisOfRows"))
})

test("every surface that names the price basis reads it through price-basis.ts", () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8")
  const hn = read("../components/ui/honest-numbers.tsx")
  assert.match(hn, /basisNote\(honest\.basis/)
  assert.match(hn, /rangeLabelFor\(honest\.basis/)
  assert.doesNotMatch(hn, /basis === "active_asking"/)
  const ps = read("../components/blog-proof-strip.tsx")
  assert.match(ps, /proofStripNote\(/)
  const meth = read("../app/methodology/page.tsx")
  assert.match(meth, /getTypicalPriceBasis/)
  assert.match(meth, /methodologyFaqFor\(/)
  assert.match(meth, /methodologyNoteFor\(/)
})
