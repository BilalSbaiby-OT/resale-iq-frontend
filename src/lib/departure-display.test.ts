/**
 * Founder decisions 2026-10-02, pinned:
 *  - a watched departure is never "sold" / "sales" — it is a listing that left
 *    the shelf in our tracked sample (each locale's existing departure phrase);
 *  - display floor: hide < 5, "fewer than 10" for 5-9, digits from 10;
 *  - never pair a tiny departure count with a huge listing count;
 *  - /buy loses "actually sold", "confirmed departures", days-to-sell and the
 *    45% margin; /partners loses the "confirmed sold transactions" card and the
 *    frozen "Sold / 30d" table.
 *
 * Run: npm run test:unit  (node --test, native TS type-stripping).
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DEPARTURE_DISPLAY_FLOOR,
  DEPARTURE_PUBLISH_FLOOR,
  departureCountUnit,
  departureDisplay,
  departureEvidenceNote,
  departureHiddenNote,
  departureIsPrintable,
  departureLabel,
  departurePairPrintable,
  departureSupportsConclusion,
  departureUnit,
} from "./departure-display.ts"
import { copy, type Locale } from "./i18n.ts"
import { watchedSampleNote } from "./watched-sample.ts"
import { localizeConfidenceNote, localizeDemandNote } from "./verdict-words.ts"
import { verdictCopy } from "./verdict-copy.ts"
import { brandNarrative } from "./flip-narrative.ts"
import { buildWeeklyBrief } from "./weekly-brief.ts"
import { modelPageDescription, SEO_MODELS } from "./seo-models.ts"
import { dataChrome } from "../data/seo-data-copy.ts"
import { methodologyCopy } from "./methodology-copy.ts"
import type { MarketNumbers, BrandFigures } from "./market-numbers.ts"
import type { BrandSeo } from "./seo-categories.ts"

const LOCALES: Locale[] = ["en", "es", "fr", "de", "it", "pt"]
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

/** The word family for a SALE, per locale. A departure label must contain none of it. */
const SOLD_WORDS = /\b(sold|sales?|sells?|vendid[oa]s?|ventas?|vendus?|vendues?|ventes?|verkauft|verk[aä]ufe?|venduti|vendute|vendite?|vendas?)\b/i

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name)) out.push(p)
  }
  return out
}

// ---------------------------------------------------------------------------
// The display floor
// ---------------------------------------------------------------------------

test("floors are 5 (publish) and 10 (display)", () => {
  assert.equal(DEPARTURE_PUBLISH_FLOOR, 5)
  assert.equal(DEPARTURE_DISPLAY_FLOOR, 10)
})

test("under 5 is hidden as an em-dash, never a zero", () => {
  for (const n of [0, 1, 4, null, undefined, Number.NaN, -3]) {
    const d = departureDisplay(n as number)
    assert.equal(d.kind, "hidden", String(n))
    assert.equal(d.text, "—", String(n))
    assert.equal(d.value, null)
  }
})

test("5 to 9 prints the bound, localised, never the digit", () => {
  assert.equal(departureDisplay(5).text, "Fewer than 10")
  assert.equal(departureDisplay(9).text, "Fewer than 10")
  assert.equal(departureDisplay(7, "en", { compact: true }).text, "<10")
  assert.equal(departureDisplay(7, "es").text, "Menos de 10")
  assert.equal(departureDisplay(7, "fr").text, "Moins de 10")
  assert.equal(departureDisplay(7, "de").text, "Weniger als 10")
  assert.equal(departureDisplay(7, "it").text, "Meno di 10")
  assert.equal(departureDisplay(7, "pt").text, "Menos de 10")
  for (const l of LOCALES) assert.doesNotMatch(departureDisplay(7, l).text, /\b7\b/, l)
})

test("10 and over prints digits", () => {
  assert.deepEqual(departureDisplay(10), { kind: "number", text: "10", value: 10 })
  assert.equal(departureDisplay(1285).text, "1,285")
  assert.equal(departureIsPrintable(9), false)
  assert.equal(departureIsPrintable(10), true)
})

test("a conclusion needs n >= 30", () => {
  assert.equal(departureSupportsConclusion(29), false)
  assert.equal(departureSupportsConclusion(30), true)
  assert.equal(departureSupportsConclusion(null), false)
})

// ---------------------------------------------------------------------------
// Wording: never "sold", in any locale
// ---------------------------------------------------------------------------

test("every departure label, unit and note is free of sale words in all six locales", () => {
  for (const l of LOCALES) {
    for (const win of ["7d", "30d"] as const) {
      const parts = [
        departureLabel(88, win, l),
        departureLabel(88, win, l, { sample: true }),
        departureLabel(7, win, l, { sample: true }),
        departureUnit(win, l),
        departureCountUnit("88", win, l),
        departureEvidenceNote(88, l),
        departureHiddenNote(l),
      ].filter((x): x is string => x != null)
      for (const p of parts) assert.doesNotMatch(p, SOLD_WORDS, `${l} ${win}: ${p}`)
    }
  }
})

test("labels carry the locale's existing departure phrase", () => {
  assert.equal(departureLabel(88, "7d"), "88 left the shelf this week")
  assert.equal(departureLabel(88, "7d", "en", { sample: true }), "88 left the shelf in our sample this week")
  assert.equal(departureLabel(88, "30d", "en", { sample: true }), "88 left the shelf over 30 days in our sample")
  assert.equal(departureLabel(7, "7d"), "Fewer than 10 left the shelf this week")
  assert.equal(departureLabel(3, "7d"), null)
  assert.match(departureLabel(88, "7d", "es")!, /dejaron el escaparate/)
  assert.match(departureLabel(88, "7d", "fr")!, /ont quitté l'étal/)
  assert.match(departureLabel(88, "7d", "de")!, /das Regal verlassen/)
  assert.match(departureLabel(88, "7d", "it")!, /hanno lasciato lo scaffale/)
  assert.match(departureLabel(88, "7d", "pt")!, /saíram da prateleira/)
  assert.equal(departureUnit("7d", "en"), "Left the shelf / 7d")
  assert.equal(departureCountUnit("88", "30d", "en"), "88 left the shelf / 30d")
  assert.equal(departureUnit("7d", "es"), "Salidas observadas / 7d")
  assert.equal(departureUnit("7d", "fr"), "Départs observés / 7j")
  assert.equal(departureUnit("7d", "de"), "Beobachtete Abgänge / 7T")
  assert.equal(departureUnit("7d", "it"), "Uscite osservate / 7g")
  assert.equal(departureUnit("7d", "pt"), "Saídas observadas / 7d")
})

test("the i18n checker and verdict dictionaries use the lexicon's unit label", () => {
  for (const l of LOCALES) {
    assert.equal(copy[l].checker.leftShelf, departureUnit("7d", l), `checker.leftShelf ${l}`)
    assert.equal(verdictCopy[l].leftShelf, departureUnit("7d", l), `verdictCopy.leftShelf ${l}`)
    assert.equal(copy[l].checker.leftShelfCount("88"), departureCountUnit("88", "7d", l), `checker.leftShelfCount ${l}`)
    assert.equal(verdictCopy[l].leftShelfCount("88"), departureCountUnit("88", "7d", l), `verdictCopy.leftShelfCount ${l}`)
  }
})

test("the /data column heads and 'observed' copy never call a departure sold, in any locale", () => {
  for (const l of LOCALES) {
    const t = dataChrome[l]
    for (const key of ["soldCol", "colSold", "brandH2", "observedTitle", "observedP", "provenance", "ledeBefore"] as const) {
      assert.doesNotMatch(t[key], SOLD_WORDS, `${l}.${key}: ${t[key]}`)
    }
  }
})

test("the methodology sentence is grammatical: g_leftshelf is a verb phrase and g_disappear no longer infers a sale", () => {
  assert.equal(methodologyCopy.es.g_leftshelf, "dejaron el escaparate")
  assert.equal(methodologyCopy.fr.g_leftshelf, "ont quitté l'étal")
  assert.equal(methodologyCopy.de.g_leftshelf, "das Regal verlassen haben")
  assert.equal(methodologyCopy.it.g_leftshelf, "hanno lasciato lo scaffale")
  assert.equal(methodologyCopy.pt.g_leftshelf, "saíram da prateleira")
  for (const l of LOCALES) {
    assert.doesNotMatch(methodologyCopy[l].g_disappear, /infer|inferimos|déduisons|leiten.*ab|deduciamo|inferimos/i, l)
  }
  assert.match(methodologyCopy.en.g_disappear, /record its last asking price as the departure price/)
})

// ---------------------------------------------------------------------------
// Never pair a tiny departure count with a huge listing count
// ---------------------------------------------------------------------------

test("32 departures against 256,145 still listed is not a printable pair", () => {
  assert.equal(departurePairPrintable(32, 256_145), false)
  assert.equal(departurePairPrintable(7, 100), false) // too few departures to compare
  assert.equal(departurePairPrintable(120, 300), true)
  assert.equal(departurePairPrintable(30, 15_000), true) // exactly 500 : 1
  assert.equal(departurePairPrintable(30, 15_001), false)
  assert.equal(departurePairPrintable(null, 300), false)
  assert.equal(departurePairPrintable(120, null), false)
})

test("watchedSampleNote prints the pair only when it is honest, and never 'supply glut' otherwise", () => {
  const glut = watchedSampleNote(32, 256_145, "SKIP", "en")!
  assert.doesNotMatch(glut, /256/)
  assert.doesNotMatch(glut, /glut/i)
  assert.doesNotMatch(glut, /vs/)
  assert.match(glut, /32 left the shelf in our sample this week/)

  const honest = watchedSampleNote(120, 300, "BUY", "en")!
  assert.equal(honest, "In the listings we watched, 120 left the shelf vs 300 still listed.")
  const honestSkip = watchedSampleNote(120, 300, "SKIP", "en")!
  assert.match(honestSkip, /supply glut in our sample/)

  assert.equal(watchedSampleNote(7, 5_000, "WATCH", "en"), "Fewer than 10 left the shelf in our sample this week.")
  assert.equal(watchedSampleNote(3, 5_000, "SKIP", "en"), departureHiddenNote("en"))
  assert.equal(watchedSampleNote(null, 5_000, "SKIP", "en"), null)
  assert.match(watchedSampleNote(120, 300, "BUY", "fr")!, /120 ont quitté l'étal contre 300/)
  assert.match(watchedSampleNote(120, 300, "BUY", "es")!, /120 dejaron el escaparate frente a 300/)
  assert.match(watchedSampleNote(120, 300, "BUY", "de")!, /120 das Regal verlassen/)
  assert.match(watchedSampleNote(120, 300, "BUY", "it")!, /120 hanno lasciato lo scaffale contro 300/)
  assert.match(watchedSampleNote(120, 300, "BUY", "pt")!, /120 saíram da prateleira contra 300/)
})

// ---------------------------------------------------------------------------
// Backend prose is rebuilt from the count, in the lexicon's words
// ---------------------------------------------------------------------------

test("the backend's English 30-day demand note is rebuilt from its count, translated and floored", () => {
  assert.equal(
    localizeDemandNote("371 sold in 30 days (30-day window; fewer than 30 watched departures this week)", "en"),
    "371 left the shelf over 30 days in our sample.",
  )
  assert.equal(
    localizeDemandNote("1,285 departures in 30d (7-day figure recovering from a Sep 14-22 outage)", "en"),
    "1,285 left the shelf over 30 days in our sample.",
  )
  assert.equal(localizeDemandNote("88 left the shelf in 30 days", "en"), "88 left the shelf over 30 days in our sample.")
  assert.match(localizeDemandNote("371 sold in 30 days", "fr")!, /371 ont quitté l'étal en 30 jours dans notre échantillon/)
  assert.match(localizeDemandNote("371 sold in 30 days", "de")!, /371 haben innerhalb von 30 Tagen in unserer Stichprobe das Regal verlassen/)
  assert.equal(localizeDemandNote("7 sold in 30 days", "en"), "Fewer than 10 left the shelf over 30 days in our sample.")
  assert.equal(localizeDemandNote("3 sold in 30 days", "en"), null)
  assert.equal(localizeDemandNote("Something we cannot parse", "en"), null)
  assert.equal(localizeDemandNote(null, "en"), null)
  for (const l of LOCALES) assert.doesNotMatch(localizeDemandNote("371 sold in 30 days", l)!, SOLD_WORDS, l)
})

test("'Sold prices are widely spread' is shown as departure prices in every locale, whichever spelling the backend sends", () => {
  for (const spelling of [
    "Sold prices are widely spread — treat the average as a range, not a point",
    "Departure prices are widely spread — treat the average as a range, not a point",
  ]) {
    for (const l of LOCALES) {
      const out = localizeConfidenceNote(spelling, l)!
      assert.doesNotMatch(out, /\b(sold|vendid|vendu|verkauf|venduti|vendas?)/i, `${l}: ${out}`)
    }
  }
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "en")!, /^Departure prices are widely spread/)
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "es")!, /precios de salida/)
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "fr")!, /prix au départ/)
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "de")!, /Abgangspreise/)
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "it")!, /prezzi all'uscita/)
  assert.match(localizeConfidenceNote("Sold prices are widely spread - x", "pt")!, /preços à saída/)
})

// ---------------------------------------------------------------------------
// Prose that quotes a count obeys the floor
// ---------------------------------------------------------------------------

const brandSeo = (sold: number, cats: Array<[string, number, number]>): BrandSeo => ({
  brand: "Zara",
  slug: "zara",
  sold_7d: sold,
  avg_price_eur: 36,
  top_categories: cats.map((c) => c[0]),
  categories: cats.map(([category, sold_7d, avg]) => ({ category, sold_7d, avg_price_eur: avg })),
  models_tracked: 3,
})

test("the brand narrative never narrates a category under 10 and never prints a digit under the floor", () => {
  const thin = brandNarrative(brandSeo(44, [["Jeans", 7, 63], ["Bags", 5, 20], ["Hoodies", 2, 30]])).join(" ")
  assert.doesNotMatch(thin, /\b(7|5|2)\b watched/)
  assert.match(thin, /Zara/)
  const noCount = brandNarrative(brandSeo(3, [["Jeans", 1, 63]])).join(" ")
  assert.match(noCount, /too few listings left the shelf this week to report a count/)
  assert.doesNotMatch(noCount, /\b3\b/)
  // Volume leader (jeans) and value leader (bags) differ, so the "which flip is this" paragraph runs.
  const ranked = brandNarrative(brandSeo(120, [["Jeans", 60, 63], ["Bags", 30, 200]])).join(" ")
  assert.match(ranked, /highest-volume category is jeans/)
  // Below 30 the same paragraph says "most-watched", not "highest-volume".
  const unranked = brandNarrative(brandSeo(30, [["Jeans", 14, 63], ["Bags", 12, 200]])).join(" ")
  assert.match(unranked, /most-watched category is jeans/)
  assert.doesNotMatch(unranked, /highest-volume/)
  // Volume leader is also the value leader: below 30 it must not "lead on volume".
  const same = brandNarrative(brandSeo(30, [["Jeans", 14, 63], ["Bags", 12, 20]])).join(" ")
  assert.doesNotMatch(same, /leads on volume/)
  assert.match(same, /had the most watched departures/)
})

test("model page descriptions use the floor", () => {
  const gazelle = SEO_MODELS.find((m) => !m.freeCheck)!
  assert.match(modelPageDescription({ model: gazelle, sold: 809, avg: 42, live: null }), /about 809 watched departures a week/)
  assert.match(modelPageDescription({ model: gazelle, sold: 7, avg: 42, live: null }), /fewer than 10 watched departures a week/)
  assert.doesNotMatch(modelPageDescription({ model: gazelle, sold: 3, avg: 42, live: null }), /watched departures a week/)
})

function mkMarket(brands: Array<[string, number, number]>): MarketNumbers {
  const byBrand: Record<string, BrandFigures> = {}
  const brandNames: string[] = []
  for (const [name, sold, avg] of brands) {
    byBrand[name] = { sold_7d: sold, avg_price_eur: avg, models_tracked: null, top_categories: [], categories: [] }
    brandNames.push(name)
  }
  return {
    byBrand, brandNames, stamp: "2026-10-02 10:00", updatedAt: "2026-10-02 10:00", listingsTracked: 1, totalListingRecords: null,
    sold7dTotal: null, brandCount: brandNames.length, brandsTracked: brandNames.length, publishFloorSold7d: 5,
    sold7dKind: "observed_transitions", provenance: null, stale: false, get: (b: string) => byBrand[b] ?? null,
  }
}

test("a thin brand cannot top the 'highest average price' ranking", () => {
  const b = buildWeeklyBrief(mkMarket([["Gucci", 6, 208], ["Zara", 44, 36], ["Nike", 90, 40]]))!
  assert.deepEqual(b.priciest.map((m) => m.brand), ["Nike", "Zara"])
})

// ---------------------------------------------------------------------------
// The /buy family and /partners
// ---------------------------------------------------------------------------

test("/buy pages make none of the claims the founder removed", () => {
  const files = walk(join(root, "src/app/buy"))
  assert.ok(files.length >= 4, "buy family not found")
  for (const f of files) {
    const src = readFileSync(f, "utf8")
    const rel = f.slice(root.length + 1)
    assert.doesNotMatch(src, /actually sold|actually sell|actually left the shelf/i, rel)
    // "not confirmed sales" is the honest negation and stays; a positive claim goes.
    assert.doesNotMatch(src, /confirmed departures|(?<!not )confirmed (sales|sold)/i, rel)
    assert.doesNotMatch(src, /real sold|sold[- ]through data|sold data/i, rel)
    assert.doesNotMatch(src, /45% gross margin|~45%/, rel)
    assert.doesNotMatch(src, /sell in about|days to sell|avg days to sell|d to sell/i, rel)
    assert.doesNotMatch(src, /\bsold \/ ?30d|\} sold\b/, rel)
  }
  // Only watched departures: every count goes through the floor.
  const hub = read("src/app/buy/page.tsx")
  assert.match(hub, /fmtDeparturesBuy\(c\.sold_30d\)/)
  assert.match(hub, /left the shelf \/ 30d/)
})

test("/partners has no 'confirmed sold transactions' card and no frozen Sold / 30d table", () => {
  const src = read("src/app/partners/page.tsx")
  assert.doesNotMatch(src, /confirmed sold transactions/i)
  assert.doesNotMatch(src, /<span[^>]*>Sold \/ 30d<\/span>/)
  assert.doesNotMatch(src, /EXAMPLE_BRANDS/)
  assert.doesNotMatch(src, /1\.1M/)
  assert.match(src, /href="\/data"/)
})

test("public surfaces never print a raw departure count: they go through the lexicon", () => {
  for (const rel of [
    "src/app/data/page.tsx",
    "src/app/flip/page.tsx",
    "src/app/flip/[brand]/page.tsx",
    "src/app/flip/[brand]/[category]/page.tsx",
    "src/app/category/page.tsx",
    "src/app/category/[category]/page.tsx",
    "src/components/landing/home-buy-list.tsx",
    "src/components/landing/live-market-pulse.tsx",
    "src/components/auth/intent-typeahead.tsx",
    "src/components/auth/auth-form-parts.tsx",
  ]) {
    const src = read(rel)
    assert.match(src, /departure-display/, rel)
    assert.doesNotMatch(src, /fmtCount\((?:r|e|c|b|a|row|top|sold|catSold)\.?(?:sold_7d)?\)/, rel)
    assert.doesNotMatch(src, /dep\/7d|departures\/7d/, rel)
  }
})

test("the frozen fallback fixtures no longer carry departure counts", () => {
  for (const rel of [
    "src/app/(auth)/forgot-password/forgot-password-content.tsx",
    "src/app/(auth)/check-email/check-email-content.tsx",
    "src/app/(auth)/verify-email/verify-email-content.tsx",
    "src/app/(dashboard)/billing/success/page.tsx",
    "src/app/(dashboard)/verdict/verdict-content.tsx",
  ]) {
    const src = read(rel)
    assert.doesNotMatch(src, /sold_7d: (102|383|27|44|129|126|312)\b/, rel)
  }
})
