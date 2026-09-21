/**
 * EX-HOMEPAGE-CONV — free chips match the anon allowlist, FAQ does not
 * promise free checks for 402 models, market table names its cut, Samba
 * buy-below uses the same whole-euro rounding as the checker.
 */
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { FREE_MODELS } from "./working-models.ts"
import { copy } from "./i18n.ts"
import { formatHomeCite } from "./teaser-verdict.ts"
import { brandStripNames, BRAND_MARK_SRC } from "./brand-marks.ts"
import type { HeroVerdict } from "./hero-verdict.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("FREE_MODELS is Samba + Air Force 1 + NB 530, never Levi's 501 or NB 550", () => {
  assert.deepEqual([...FREE_MODELS], ["Adidas Samba", "Nike Air Force 1", "New Balance 530"])
})

test("hero chips and rescue chips use FREE_MODELS, not paywalled SKUs", () => {
  const checker = read("components/tools/free-checker.tsx")
  assert.match(checker, /const TRY_EXAMPLES = FREE_MODELS/)
  assert.match(checker, /examples=\{TRY_EXAMPLES\}/)
  assert.match(checker, /examples=\{FREE_MODELS\}/)
  assert.doesNotMatch(checker, /\["New Balance 530", "Levi's 501", "New Balance 550"\]/)
  assert.match(checker, /riq-free-scope/)
  assert.match(checker, /heroFreeScope/)
  const scopeAt = checker.indexOf("data-testid=\"riq-free-scope\"")
  const chipsAt = checker.indexOf("testId=\"riq-hero-try-chips\"")
  assert.ok(scopeAt > 0 && chipsAt > scopeAt, "Free: line must sit above the chips, next to the CTA")
})

test("above-fold free scope names the chips that remain", () => {
  assert.equal(
    copy.en.heroFreeScope,
    "Free: Samba + Air Force 1 + NB 530. Other models €19/mo.",
  )
  assert.match(copy.en.heroFreeScope, /Samba/)
  assert.match(copy.en.heroFreeScope, /Air Force 1/)
  assert.match(copy.en.heroFreeScope, /NB 530/)
  assert.doesNotMatch(copy.en.heroFreeScope, /501/)
  assert.doesNotMatch(copy.en.heroFreeScope, /550/)
  for (const locale of ["fr", "es", "de", "it", "pt"] as const) {
    assert.match(copy[locale].heroFreeScope, /Samba/)
    assert.match(copy[locale].heroFreeScope, /NB 530/)
    assert.doesNotMatch(copy[locale].heroFreeScope, /501/)
    assert.doesNotMatch(copy[locale].heroFreeScope, /550/)
  }
})

test("market pulse reports shown-of-total and links /data", () => {
  const pulse = read("components/landing/live-market-pulse.tsx")
  assert.match(pulse, /riq-market-showing/)
  assert.match(pulse, /t\.showing\(rows\.length, brands\)/)
  assert.match(pulse, /canonicalPath\(locale, "\/data"\)/)
  assert.match(pulse, /t\.seeAll/)
  assert.equal(copy.en.marketPulse.showing(6, 28), "Showing 6 of 28 brands")
  assert.equal(copy.en.marketPulse.seeAll, "See all on /data")
})

test("homepage Samba cite uses checker whole-euro rounding", () => {
  const samba: HeroVerdict = {
    verdict: "WATCH",
    product: "Adidas Samba",
    buy_below: 24.35,
  }
  const cite = formatHomeCite("Adidas Samba", samba)
  assert.ok(cite)
  assert.match(cite!, /€24(?!\.\d)/)
  assert.doesNotMatch(cite!, /€24\.35/)
})

test("English homepage example and cite are Samba, not a second SKU", () => {
  const page = read("app/page.tsx")
  assert.match(page, /const example = samba \?\? hero\.result/)
  assert.match(page, /heroResult=\{example\}/)
  assert.doesNotMatch(page, /heroResult=\{hero\.result\}/)
})

test("brand strip is local SVG marks, never text names or a CDN", () => {
  const strip = read("components/landing/brand-strip.tsx")
  const marks = read("lib/brand-marks.ts")
  assert.doesNotMatch(strip, /cdn\.simpleicons/)
  assert.doesNotMatch(marks, /cdn\.simpleicons/)
  assert.doesNotMatch(marks, /hugo\.svg|"hugo"/)
  assert.match(strip, /<img/)
  assert.match(strip, /brand-marks\//)
  assert.doesNotMatch(strip, /riq-brand-name/)
  assert.doesNotMatch(strip, /\{name\}<\/li>/)
  assert.equal(brandStripNames(["Patagonia", "Balenciaga", "Fred Perry", "Stone Island", "New Balance"]).includes("Patagonia"), false)
  assert.ok(brandStripNames(["Patagonia", "New Balance"]).includes("New Balance"))
  const filled = brandStripNames(["Fred Perry", "Stone Island", "Patagonia"])
  assert.equal(filled.length, Object.keys(BRAND_MARK_SRC).length)
  assert.ok(filled.includes("Nike"))
  assert.ok(filled.includes("Adidas"))
  for (const file of Object.values(BRAND_MARK_SRC)) {
    assert.ok(existsSync(join(root, "..", "public", file.replace(/^\//, ""))), file)
  }
})

test("hero checker is a centered column, shot not beside it", () => {
  const landing = read("components/landing/landing-content.tsx")
  const css = read("app/globals.css")
  assert.match(landing, /riq-hero-checker/)
  assert.match(css, /\.riq-hero-checker/)
  assert.match(css, /align-items:\s*center/)
  assert.doesNotMatch(css, /grid-template-columns:\s*1fr 0\.95fr/)
})
