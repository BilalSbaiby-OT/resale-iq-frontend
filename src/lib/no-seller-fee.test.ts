import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { BUY_BELOW_MULTIPLIER, buyBelowFromAvg } from "./buy-below.ts"
import { copy, type Locale } from "./i18n.ts"
import { VINTED_FEE_PCT, computeProfit } from "./tool-params.ts"

// Founder decision 2026-10-02: Vinted charges private sellers no selling fee
// (help article 373), so buy_below = average asking price at departure x 0.70
// and the free calculator is plain arithmetic. These tests pin that, in every
// place the old 0.95 / "5% seller fee" used to live.

const here = dirname(fileURLToPath(import.meta.url))
const src = (rel: string) => readFileSync(join(here, "..", rel), "utf8")

test("buy-below multiplier is 0.70 and carries no fee factor", () => {
  assert.equal(BUY_BELOW_MULTIPLIER, 0.7)
  assert.equal(buyBelowFromAvg(100), 70)
  assert.equal(buyBelowFromAvg(92.22).toFixed(2), "64.55")
  assert.equal(VINTED_FEE_PCT, 0)
})

test("display-only buy-below placeholders read the shared multiplier, not a literal", () => {
  const files = [
    "components/landing/pricing-try-input.tsx",
    "components/landing/hero-free-chips.tsx",
    "components/blog/blog-index-free-checker.tsx",
    "components/ui/hard-paywall-card.tsx",
    "app/(auth)/check-email/check-email-content.tsx",
    "components/ui/live-deals-modal.tsx",
    "app/(dashboard)/calculator/page.tsx",
    "components/landing/roi-example-card.tsx",
  ]
  for (const f of files) {
    const text = src(f)
    assert.doesNotMatch(text, /0\.665/, `${f} still hard-codes 0.665`)
    assert.doesNotMatch(text, /\*\s*0\.95\b/, `${f} still multiplies by 0.95`)
    assert.doesNotMatch(text, /\*\s*0\.05\b/, `${f} still computes a 5% fee`)
  }
  assert.doesNotMatch(src("components/landing/roi-example-card.tsx"), /Vinted fee/)
})

test("free calculator copy is true Vinted arithmetic in every locale", () => {
  const locales: Locale[] = ["en", "es", "fr", "de", "it", "pt"]
  for (const l of locales) {
    const t = copy[l].toolsPage.calc
    assert.doesNotMatch(t.netLabel, /5 ?%/, `${l} netLabel`)
    assert.doesNotMatch(t.pageSubtitle, /5 ?%/, `${l} pageSubtitle`)
    assert.equal(t.breakdown.length, 2, `${l} breakdown takes sale and buy only`)
    const line = t.breakdown("€45.00", "€20.00")
    assert.ok(line.includes("€45.00") && line.includes("€20.00"), `${l} breakdown shows both prices`)
    assert.doesNotMatch(line, /5 ?%/, `${l} breakdown`)
  }
  assert.equal(computeProfit("20", "45")?.net, 25)
})

test("buy-data.json buy_below is avg x 0.70 (within the rounding of the stored average)", () => {
  const raw = JSON.parse(src("data/buy-data.json")) as {
    formula: string
    brands: { categories: { avg_price_eur: number | null; buy_below: number | null }[] }[]
  }
  assert.doesNotMatch(raw.formula, /0\.95/)
  assert.match(raw.formula, /0\.70/)
  let checked = 0
  for (const b of raw.brands) {
    for (const c of b.categories) {
      if (c.avg_price_eur == null || c.buy_below == null) continue
      // avg_price_eur is stored rounded to whole euros; buy_below came from the unrounded mean.
      assert.ok(Math.abs(c.buy_below - c.avg_price_eur * 0.7) <= 0.36, `${c.avg_price_eur} -> ${c.buy_below}`)
      checked++
    }
  }
  assert.ok(checked > 100)
})

test("no public copy builds a Vinted seller fee or the 0.95 factor into buy-below", () => {
  const banned =
    /\b5 ?% (?:platform|seller|combined)[- ]?(?:fee|deduction)|seller protection fee|× 0[.,]95|0[.,]95 ×|\b5 ?% seller|~5 ?% (?:de )?(?:fee|comisi|commission|Gebühr|commissione|taxa|frais)/i
  const roots = ["data", "lib"]
  for (const root of roots) {
    for (const f of readdirSync(join(here, "..", root))) {
      if (!f.endsWith(".ts") || f.endsWith(".test.ts")) continue
      const text = src(`${root}/${f}`)
      const m = banned.exec(text)
      assert.equal(m, null, `${root}/${f}: ${m?.[0]}`)
    }
  }
})
