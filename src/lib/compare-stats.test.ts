import { test } from "node:test"
import assert from "node:assert/strict"
import { alsoOnOtherSitesPct, compareFigures, compareView, comparePreviewFromBody, isGenericCompareInput, normalizeSuggestions } from "./compare-stats.ts"
import { UI_STRINGS } from "./ui-strings.ts"
import { readFileSync } from "node:fs"

test("sufficient site: median + p25/p75 range", () => {
  assert.deepEqual(compareFigures({ median_price: 32, p25_price: 20, p75_price: 55, insufficient: false }), { kind: "ok", median: 32, low: 20, high: 55 })
})

test("insufficient flag wins: no number even if a stale median is present", () => {
  assert.deepEqual(compareFigures({ insufficient: true, median_price: 40, avg_price: 41 }), { kind: "insufficient" })
  assert.deepEqual(compareFigures({ insufficient: true, median_price: null, p25_price: null, p75_price: null }), { kind: "insufficient" })
  assert.deepEqual(compareFigures(null), { kind: "insufficient" })
})

test("the mean is never shown when the API says the site is insufficient or has a null median", () => {
  assert.deepEqual(compareFigures({ insufficient: false, median_price: null, avg_price: 90 }), { kind: "insufficient" })
})

test("old payload without insufficient/p25/p75 falls back to avg only when no median", () => {
  assert.deepEqual(compareFigures({ median_price: 80, avg_price: 90 }), { kind: "ok", median: 80, low: null, high: null })
  assert.deepEqual(compareFigures({ avg_price: 90 }), { kind: "ok", median: 90, low: null, high: null })
})

test("inverted or half-missing range is dropped, median kept", () => {
  assert.deepEqual(compareFigures({ median_price: 30, p25_price: 50, p75_price: 20 }), { kind: "ok", median: 30, low: null, high: null })
  assert.deepEqual(compareFigures({ median_price: 30, p25_price: 20 }), { kind: "ok", median: 30, low: null, high: null })
})

test("share-also percentage", () => {
  assert.equal(alsoOnOtherSitesPct(0.35), 35)
  assert.equal(alsoOnOtherSitesPct(0.814), 81)
  assert.equal(alsoOnOtherSitesPct(0), 0)
  assert.equal(alsoOnOtherSitesPct(null), null)
  assert.equal(alsoOnOtherSitesPct(undefined), null)
  assert.equal(alsoOnOtherSitesPct(35), null)
})

test("compare page copy: all 6 locales, no sold wording, no counts, no mean, no cheapest framing", () => {
  // The rows/pooled card moved to the shared component (page + non-Pro example use it).
  const page = readFileSync(new URL("../app/(dashboard)/compare/page.tsx", import.meta.url), "utf8")
    + readFileSync(new URL("../components/compare/compare-results.tsx", import.meta.url), "utf8")
  assert.doesNotMatch(page, /n_unique|n_rows_seen|avg_price|cheapest_market|most_expensive_market/)
  const keys = [
    "Typical asking price across the Vinted sites we track", "Typical range {0}", "seen on {0}",
    "Not enough recent listings", "Not enough recent listings for a typical price",
    "{0}% of these listings also appear on other Vinted sites", "{0}% also on other Vinted sites",
    "Median asking price among listings seen on this site",
  ]
  for (const k of keys) {
    assert.ok(page.includes(`"${k}"`), `page uses ${k}`)
    const row = UI_STRINGS[k]
    assert.equal(row?.length, 5, k)
    for (const v of row) {
      assert.ok(v.trim().length > 0, k)
      assert.doesNotMatch(v, /\bvendu|verkauft|vendid|vendut|se revend|sold\b/i, v)
    }
    assert.ok(!/\{0\}/.test(k) || row.every((v) => v.includes("{0}")), `placeholder parity ${k}`)
  }
})

const OK = { median_price: 30, p25_price: 20, p75_price: 40, insufficient: false }
const BAD = { median_price: null, insufficient: true }

test("compareView: generic_query reason -> nudge with the backend chips", () => {
  const v = compareView({ reason: "generic_query", suggestions: [{ label: "Adidas Samba", query: "Adidas Samba" }], by_country: {}, pooled: null })
  assert.deepEqual(v, { mode: "nudge", why: "generic", suggestions: [{ label: "Adidas Samba", query: "Adidas Samba" }] })
})

test("compareView: no priced site and no priced pooled figure -> nudge, never a thin table", () => {
  assert.equal(compareView({ by_country: { es: BAD, fr: BAD }, pooled: BAD }).mode, "nudge")
  assert.equal(compareView({ by_country: {} }).mode, "nudge")
  assert.equal(compareView(null).mode, "nudge")
})

test("compareView: priced result stays results; brand-only suggestions ride along; absent fields degrade", () => {
  assert.deepEqual(compareView({ by_country: { es: OK }, pooled: OK }), { mode: "results", suggestions: [] })
  assert.equal(compareView({ by_country: {}, pooled: OK, suggestions: [{ label: "a", query: "Nike Air Force 1" }] }).suggestions.length, 1)
})

test("normalizeSuggestions: label falls back to query, junk and dupes dropped, capped at 6", () => {
  assert.deepEqual(normalizeSuggestions([{ query: " Nike Dunk " }, { label: "x", query: "nike dunk" }, { label: "no query" }, 5, null, "Levi's 501"]), [
    { label: "Nike Dunk", query: "Nike Dunk" },
    { label: "Levi's 501", query: "Levi's 501" },
  ])
  assert.equal(normalizeSuggestions(Array.from({ length: 20 }, (_, i) => ({ query: `q${i}` }))).length, 6)
  assert.deepEqual(normalizeSuggestions(undefined), [])
})

test("comparePreviewFromBody: finds the preview in preview / detail.preview / detail, ordered sites, no prices read", () => {
  const p = { sites_with_data: { fr: true, es: true, de: false, it: false }, suggestions: [{ label: "Adidas Samba", query: "Adidas Samba" }], median_price: 99 }
  for (const body of [{ preview: p }, { detail: { message: "pro", preview: p } }, { detail: p }, p]) {
    const r = comparePreviewFromBody(body)
    assert.deepEqual(r?.sites, ["es", "fr"])
    assert.equal(r?.suggestions.length, 1)
    assert.ok(!JSON.stringify(r).includes("99"))
  }
})

test("comparePreviewFromBody: old 402 body (no preview) -> null", () => {
  assert.equal(comparePreviewFromBody({ detail: "Pro required" }), null)
  assert.equal(comparePreviewFromBody({ detail: { message: "subscription required" } }), null)
  assert.equal(comparePreviewFromBody(undefined), null)
  assert.equal(comparePreviewFromBody("x"), null)
})

test("isGenericCompareInput: 1-word generic in all locales yes; brand, brand+model, empty no", () => {
  for (const q of ["Tout", "vintage", "veste", "Jacke", "Chaqueta", "scarpe", "casaco", "shoes", " Pullover ", "véstido"]) assert.equal(isGenericCompareInput(q), true, q)
  for (const q of ["nike", "Nike Air Force 1", "veste Carhartt", "Adidas Samba", "", "  ", null, undefined]) assert.equal(isGenericCompareInput(q as string), false, String(q))
})

test("page + components: no counts, no sold wording, no n_unique", () => {
  for (const f of ["../app/(dashboard)/compare/page.tsx", "../components/compare/compare-results.tsx", "../components/compare/compare-pro-preview.tsx"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8")
    assert.ok(!/n_unique|\bsold\b|vendu|verkauft|se revend/i.test(src), f)
  }
})

test("wiring: paywall renders the preview only for /compare; sample endpoint is the public one", () => {
  const pw = readFileSync(new URL("../components/layout/paywall.tsx", import.meta.url), "utf8")
  assert.match(pw, /pro && pathname\?\.startsWith\("\/compare"\) && <CompareProPreview \/>/)
  const api = readFileSync(new URL("./api.ts", import.meta.url), "utf8")
  assert.match(api, /\/api\/public\/compare\/sample/)
})

test("every new compare string has all 5 translations", () => {
  for (const k of ["Example: {0}, live data", "Try a brand + model, e.g. {0}", "That search is too broad for a useful comparison.", "Not enough recent listings for that search yet.", "Narrow it down with a model:", "Data available on:", "Check which Vinted sites have data for your search", "Typical prices for your own search are on Pro."]) {
    const row = UI_STRINGS[k]
    assert.ok(row && row.length === 5 && row.every((t) => t && t !== k), k)
  }
})
