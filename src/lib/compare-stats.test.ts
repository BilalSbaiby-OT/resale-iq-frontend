import { test } from "node:test"
import assert from "node:assert/strict"
import { alsoOnOtherSitesPct, compareFigures } from "./compare-stats.ts"
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
  const page = readFileSync(new URL("../app/(dashboard)/compare/page.tsx", import.meta.url), "utf8")
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
