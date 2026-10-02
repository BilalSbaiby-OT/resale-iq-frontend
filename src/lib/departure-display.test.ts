/**
 * Founder decisions 2026-10-02, pinned:
 *  - a watched departure is never "sold" / "sales" — it is a listing that left
 *    the shelf in our tracked sample (each locale's existing departure phrase);
 *  - display floor: hide < 5, "fewer than 10" for 5-9, digits from 10;
 *  - no per-product and no per-brand-x-category surface prints a departure
 *    count at all (second founder decision, same day): only brand-level and
 *    category-level aggregates do, and /data keeps its brand table;
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
  departureDisplay,
  departureIsPrintable,
  departureSupportsConclusion,
} from "./departure-display.ts"
import { type Locale } from "./i18n.ts"
import { localizeConfidenceNote } from "./verdict-words.ts"
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
// Backend prose is re-said in the lexicon's words, and carries no count
// ---------------------------------------------------------------------------

test("the backend's confidence notes are re-said WITHOUT the per-item count", () => {
  for (const l of LOCALES) {
    for (const note of ["Only 20 comparable departures", "Only 11 watched departures", "162 comparables in the sample"]) {
      const out = localizeConfidenceNote(note, l)!
      assert.doesNotMatch(out, /\d/, `${l}: ${out}`)
    }
  }
  assert.equal(localizeConfidenceNote("Only 20 comparable departures", "en"), "Thin comparable data behind this call")
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
  assert.match(noCount, /average price at departure of €36/)
  assert.doesNotMatch(noCount, /\b3\b/)
  // Volume leader (jeans) and value leader (bags) differ, so the "which flip is this" paragraph runs.
  const ranked = brandNarrative(brandSeo(120, [["Jeans", 60, 63], ["Bags", 30, 200]])).join(" ")
  assert.match(ranked, /highest-volume category is jeans/)
  // No per-category count is ever printed (founder decision 2026-10-02).
  assert.doesNotMatch(ranked, /\b60\b|\b30 (watched|left)/)
  // Below 30 the same paragraph says "most-watched", not "highest-volume".
  const unranked = brandNarrative(brandSeo(30, [["Jeans", 14, 63], ["Bags", 12, 200]])).join(" ")
  assert.match(unranked, /most-watched category is jeans/)
  assert.doesNotMatch(unranked, /highest-volume/)
  // Volume leader is also the value leader: below 30 it must not "lead on volume".
  const same = brandNarrative(brandSeo(30, [["Jeans", 14, 63], ["Bags", 12, 20]])).join(" ")
  assert.doesNotMatch(same, /leads on volume/)
  assert.match(same, /is the category we watched most/)
})

test("model page descriptions quote only a brand-level count that can carry a conclusion", () => {
  const gazelle = SEO_MODELS.find((m) => !m.freeCheck)!
  assert.match(modelPageDescription({ model: gazelle, sold: 809, avg: 42, live: null }), /about 809 watched departures a week/)
  assert.doesNotMatch(modelPageDescription({ model: gazelle, sold: 7, avg: 42, live: null }), /watched departures a week/)
  assert.doesNotMatch(modelPageDescription({ model: gazelle, sold: 20, avg: 42, live: null }), /watched departures a week/)
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
  // The hub leads with the price: no per-pair departure count.
  const hub = read("src/app/buy/page.tsx")
  assert.doesNotMatch(hub, /fmtDeparturesBuy\(c\.sold_30d\)/)
  assert.doesNotMatch(hub, /left the shelf \/ 30d/)
  assert.match(hub, /avg price at departure/)
})

test("/partners has no 'confirmed sold transactions' card and no frozen Sold / 30d table", () => {
  const src = read("src/app/partners/page.tsx")
  assert.doesNotMatch(src, /confirmed sold transactions/i)
  assert.doesNotMatch(src, /<span[^>]*>Sold \/ 30d<\/span>/)
  assert.doesNotMatch(src, /EXAMPLE_BRANDS/)
  assert.doesNotMatch(src, /1\.1M/)
  assert.match(src, /href="\/data"/)
})

test("brand-level and category-level surfaces that still print a count go through the lexicon", () => {
  for (const rel of [
    "src/app/data/page.tsx",
    "src/app/flip/page.tsx",
    "src/app/flip/[brand]/page.tsx",
    "src/app/category/page.tsx",
    "src/app/category/[category]/page.tsx",
    "src/components/landing/live-market-pulse.tsx",
  ]) {
    const src = read(rel)
    assert.match(src, /departure-display/, rel)
    assert.doesNotMatch(src, /fmtCount\((?:r|e|c|b|a|row|top|sold|catSold)\.?(?:sold_7d)?\)/, rel)
    assert.doesNotMatch(src, /dep\/7d|departures\/7d/, rel)
  }
})

test("no per-product or per-brand-x-category surface prints a departure count (founder decision 2026-10-02)", () => {
  for (const rel of [
    "src/app/flip/[brand]/[category]/page.tsx",
    "src/app/flip/[brand]/model/[slug]/page.tsx",
    "src/app/buy/[brand]/[category]/page.tsx",
    "src/components/landing/home-buy-list.tsx",
    "src/components/landing/ssr-buy-list-teaser.tsx",
    "src/components/landing/roi-example-card.tsx",
    "src/components/landing/pricing-verdict-demo.tsx",
    "src/components/blog-proof-strip.tsx",
    "src/components/dashboard/weekly-buy-list.tsx",
    "src/components/auth/auth-form-parts.tsx",
    "src/components/auth/checkout-interstitial-card.tsx",
    "src/app/(auth)/check-email/check-email-content.tsx",
    "src/app/(auth)/verify-email/verify-email-content.tsx",
    "src/app/(dashboard)/billing/success/page.tsx",
    "src/app/(dashboard)/verdict/verdict-content.tsx",
    "src/components/tools/free-checker.tsx",
    "src/components/blog/blog-index-free-checker.tsx",
    "src/components/landing/hero-free-chips.tsx",
    "src/components/landing/pricing-try-input.tsx",
  ]) {
    const src = read(rel)
    assert.doesNotMatch(src, /from "@\/lib\/departure-display"|from "\.\/departure-display/, rel)
    assert.doesNotMatch(src, /fmtDeparturesBuy|leftShelfCount|t\.leftShelf\b|localizeDemandNote|watchedSampleNote/, rel)
  }
  // The category pages keep the category-wide total but print no per-brand count.
  const cat = read("src/app/category/[category]/page.tsx")
  assert.doesNotMatch(cat, /departureDisplay\(e\.sold_7d/)
  const flipBrand = read("src/app/flip/[brand]/page.tsx")
  assert.doesNotMatch(flipBrand, /departureDisplay\(c\.sold_7d/)
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
