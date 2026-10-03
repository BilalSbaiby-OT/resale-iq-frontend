/**
 * O3 honest output (founder override 2026-10-03): numbers first, Signal
 * strength meter instead of counts, no LOW DATA label, never "sold".
 * Run: npm run test:unit
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { hasHonestContent, honestCopy, rangeText, signalDots, signalStrength, type HonestOutput } from "./honest-output.ts"

const LOCALES = ["en", "fr", "es", "de", "it", "pt"] as const

const base: HonestOutput = {
  basis: "departed", range_low_eur: 42, range_high_eur: 58,
  max_buy_eur: 35, margin_pct: 30, signal_strength: 3, verdict_display: "BUY",
}

test("range is whole-euro p25-p75, e.g. €42–€58", () => {
  assert.equal(rangeText(base), "€42–€58")
  assert.equal(rangeText({ ...base, range_low_eur: undefined }), null)
  assert.equal(rangeText(null), null)
})

test("signal strength 1|2|3 maps to ●○○ / ●●○ / ●●●; anything else is no meter", () => {
  assert.equal(signalDots(1), "●○○")
  assert.equal(signalDots(2), "●●○")
  assert.equal(signalDots(3), "●●●")
  assert.equal(signalStrength({ ...base, signal_strength: 2 }), 2)
  for (const bad of [0, 4, null, undefined, 2.5]) assert.equal(signalStrength({ ...base, signal_strength: bad as never }), null)
  assert.equal(signalStrength(null), null)
})

test("nothing invented: empty block renders nothing; a meter alone is content", () => {
  const empty: HonestOutput = { basis: "departed", max_buy_eur: null, margin_pct: 30, verdict_display: "WATCH" }
  assert.equal(hasHonestContent(empty), false)
  assert.equal(hasHonestContent(null), false)
  assert.equal(hasHonestContent({ ...empty, signal_strength: 1 }), true)
  assert.equal(hasHonestContent({ ...empty, max_buy_eur: 35 }), true)
})

test("all six locales: label, margin footnote, 3 accessible meter labels, no count, no sales wording", () => {
  assert.deepEqual(Object.keys(honestCopy).sort(), ["de", "en", "es", "fr", "it", "pt"])
  for (const loc of LOCALES) {
    const c = honestCopy[loc]
    const aria = [c.signalAria[1], c.signalAria[2], c.signalAria[3]]
    assert.equal(new Set(aria).size, 3, loc)
    for (const a of aria) assert.ok(a.startsWith(c.signalLabel), loc)
    const all = [c.rangeLabel, c.maxBuyLabel, c.margin(30), c.signalLabel, ...aria, c.askingNote].join(" | ")
    assert.doesNotMatch(all, /\bsold\b|\bvendid|\bvendu|\bverkauft|\bvenduto|ventes? conclues?/i, loc)
    assert.doesNotMatch(all, /LOW DATA|PEU DE DONN|POCOS DATOS|ZU WENIG|POCHI DATI|POUCOS DADOS/i, loc)
    assert.doesNotMatch(c.askingNote + c.rangeLabel + c.maxBuyLabel, /\d/, loc)
    assert.ok(c.margin(30).includes("30"), loc)
    assert.doesNotMatch(c.margin(30), /brut|gross|bruto|lordo/i, loc)
  }
  assert.equal(honestCopy.en.rangeLabel, "Typical resale price")
  assert.equal(honestCopy.en.maxBuyLabel, "Max buy price")
  assert.equal(honestCopy.en.margin(30), "for ~30% margin before fees")
  assert.equal(honestCopy.en.signalAria[1], "Signal strength: weak")
  assert.equal(honestCopy.en.signalAria[2], "Signal strength: medium")
  assert.equal(honestCopy.en.signalAria[3], "Signal strength: strong")
})

test("source guard: the honest module and component cannot render a count or LOW DATA", () => {
  for (const f of ["./honest-output.ts", "../components/ui/honest-numbers.tsx"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8")
    // strip comments: the header explains what is NOT shown
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
    assert.doesNotMatch(code, /LOW[ _]DATA|low_data|lowData|\.n\b|window_days|price_window|Based on \$\{/, f)
  }
})
