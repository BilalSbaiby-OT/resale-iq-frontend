import { test } from "node:test"
import assert from "node:assert/strict"
import { TOOLS_LANDING_COPY, FR_TOOL_INTENTS } from "./tools-landing-copy.ts"
import { verdictUpsellLine } from "./verdict-upsell.ts"
import { rangeText } from "./honest-output.ts"
import { readFileSync } from "node:fs"
import { TOOLS_HUB_BODY, toolsHub } from "./tools-hub-aeo.ts"
import { formatTeaserCite } from "./teaser-verdict.ts"

/**
 * French TikTok ad landing (/fr/tools, 2026-10-03). A stranger from an ad must
 * not meet English, a euro-margin promise or an English-style price.
 */
const walk = (o: unknown, out: string[] = []): string[] => {
  if (typeof o === "string") out.push(o)
  else if (typeof o === "function") out.push((o as (a: string, b: string) => string)("21 €", "30 €"))
  else if (o && typeof o === "object") for (const v of Object.values(o)) walk(v, out)
  return out
}

test("every locale fills every landing string", () => {
  for (const l of ["en", "fr", "es", "de", "it", "pt"] as const) {
    const all = walk(TOOLS_LANDING_COPY[l])
    assert.ok(all.length >= 14, l)
    for (const s of all) assert.ok(s.trim().length > 0, `${l}: empty string`)
  }
})

test("non-English landing copy: no English leftovers, no margin promise", () => {
  for (const l of ["fr", "es", "de", "it", "pt"] as const) {
    for (const s of walk(TOOLS_LANDING_COPY[l])) {
      assert.doesNotMatch(s, /\b(BUY|WATCH|SKIP|margin|flip|Unlock|Typical|Get free|cancel anytime)\b/, `${l}: ${s}`)
      assert.doesNotMatch(s, /€\d/, `${l}: euro-first price in ${s}`)
    }
  }
})

test("fr uses the founder vocabulary and never says confirmed sales", () => {
  const fr = [...walk(TOOLS_LANDING_COPY.fr), formatTeaserCite("Adidas Samba", { verdict: "BUY", product: "Adidas Samba", buy_below: 21, sell_avg: 30 } as never, "fr")].join("\n")
  assert.match(fr, /Prix d'achat max/)
  assert.match(fr, /revente typique/)
  assert.doesNotMatch(fr, /ventes? confirmées?/i)
  assert.doesNotMatch(fr, /30\s?%/)
})

test("verdictUpsellLine: English unchanged, French drops the euro margin", () => {
  assert.equal(verdictUpsellLine({ buy_below: 21.4, sell_avg: 30.2 }), "Buy below €21 · typical exit €30 → ~€9 margin")
  const fr = verdictUpsellLine({ buy_below: 21.4, sell_avg: 30.2 }, "fr")
  assert.equal(fr, "Prix d'achat max 21\u00A0€ · revente typique 30\u00A0€")
  assert.doesNotMatch(fr!, /marge|margin|~/)
  assert.equal(verdictUpsellLine({ buy_below: null, sell_avg: 30 }, "fr"), null)
})

test("rangeText: euro-first in English, number-first with a non-breaking space elsewhere", () => {
  const h = { range_low_eur: 30, range_high_eur: 40 }
  assert.equal(rangeText(h as never), "€30–€40")
  assert.equal(rangeText(h as never, "fr"), "30–40\u00A0€")
})

test("French tools hub text speaks ACHETER / SURVEILLER / ÉCARTER", () => {
  const fr = toolsHub("fr")
  const text = [fr.body, fr.term, ...fr.faqs.flatMap((f) => [f.q, f.a])].join("\n")
  assert.doesNotMatch(text, /\b(BUY|WATCH|SKIP)\b/)
  assert.match(fr.body, /ACHETER, SURVEILLER ou ÉCARTER/)
  assert.match(fr.body, /prix d'achat max/)
  assert.notEqual(fr.body, TOOLS_HUB_BODY)
})

test("every search-intent slug has a French card", () => {
  // search-intents.ts imports through the "@/" alias, which node:test cannot resolve: read the slugs from source.
  const slugs = [...readFileSync("src/data/search-intents.ts", "utf8").matchAll(/^\s+slug: "([a-z-]+)"/gm)].map((m) => m[1])
  assert.ok(slugs.length >= 5)
  assert.deepEqual(Object.keys(FR_TOOL_INTENTS).sort(), slugs.sort())
})
