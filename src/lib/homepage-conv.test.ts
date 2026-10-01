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
import { brandStripNames, brandStripMoreCount, BRAND_MARK_SRC } from "./brand-marks.ts"
import type { HeroVerdict } from "./hero-verdict.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("FREE_MODELS leads with a BUY model and never exposes paywalled SKUs", () => {
  // The guard that matters is that no PAYWALLED sku reaches a free chip —
  // Levi's 501 and NB 550 402 for anonymous visitors. New Balance 530 was
  // moved fully behind the paywall (402) on 2026-09-29 and New Balance
  // FuelCell, while still 200-ing anonymously, only returns a brand-average
  // BRAND_CATEGORIES fallback (buy_below null) — neither is a usable free
  // sample, so neither belongs in FREE_MODELS even though the backend
  // technically lets the query through.
  //
  // The durable invariant is NOT a specific name, it is: every chip must
  // be a model that actually returns a priced verdict, because for most
  // visitors it is the only verdict they will ever see. Assert that
  // property, plus the paywall guard, rather than freezing a ranking that
  // depends on live data.
  // Keep this list in sync with _PUBLIC_SAMPLE_QUERIES in api/routes.py —
  // a chip must be a SUBSET of that frozenset, or it will 402 — but do not
  // assume every member of that frozenset belongs here.
  assert.equal(FREE_MODELS.length, 3)
  assert.equal(FREE_MODELS[0], "Fred Perry Polo")
  assert.ok(
    !FREE_MODELS.includes("New Balance FuelCell" as never),
    "FuelCell verdicts BRAND_CATEGORIES with buy_below null — it must not be a free-sample chip",
  )
  assert.ok(
    !FREE_MODELS.includes("New Balance 530" as never),
    "New Balance 530 is HARD_PAYWALL (402) for anonymous visitors as of 2026-09-29",
  )
  for (const expected of ["Fred Perry Polo", "Nike Air Force 1", "Adidas Samba"]) {
    assert.ok(FREE_MODELS.includes(expected as never), `${expected} missing from FREE_MODELS`)
  }
  for (const paywalled of ["Levi's 501", "New Balance 550", "New Balance 530"]) {
    assert.ok(!FREE_MODELS.includes(paywalled as never), `${paywalled} must never be a free chip`)
  }
})

test("hero chips and rescue chips use FREE_MODELS, not paywalled SKUs", () => {
  const checker = read("components/tools/free-checker.tsx")
  assert.match(checker, /const TRY_EXAMPLES = FREE_MODELS/)
  assert.match(checker, /examples=\{TRY_EXAMPLES\}/)
  assert.match(checker, /examples=\{FREE_MODELS\}/)
  assert.doesNotMatch(checker, /\["New Balance 530", "Levi's 501", "New Balance 550"\]/)
  assert.match(checker, /riq-free-scope/)
  assert.match(checker, /heroFreeScope/)
  // riq-hero-try-chips now lives in hero-free-chips.tsx (analytics-tracked chip row),
  // not inside free-checker.tsx. The durable invariant: the chips file carries the
  // testid so the smoke test can find them, and the scope/Free: line is above it.
  const heroChips = read("components/landing/hero-free-chips.tsx")
  assert.match(heroChips, /riq-hero-try-chips/)
  assert.match(heroChips, /hero_cta_click/)
  // H179: the free-sample card must not re-sell a buy-below the visitor already saw.
  assert.match(heroChips, /riq-hero-free-line/)
  assert.match(heroChips, /riq-hero-sample-line/)
  assert.doesNotMatch(heroChips, /Unlock \$\{truncated\} buy-below/)
  assert.doesNotMatch(heroChips, /Enter your email to unlock/)
})

test("above-fold free scope must not promise paywalled SKUs", () => {
  // Rewritten 2026-09-22. This used to pin the exact string "Free: Samba +
  // Air Force 1 + NB 530", which became FALSE when every visitor started
  // getting one free verdict on ANY model (api/routes.py
  // _claim_first_free_verdict). Naming three models undersold the offer and
  // told most visitors their item was not covered.
  //
  // The assertion that MATTERS is preserved and is the reason this test
  // exists: Levi's 501 and NB 550 are paywalled, so they must never be
  // advertised as free in any locale.
  assert.match(copy.en.heroFreeScope, /first/i)
  assert.match(copy.en.heroFreeScope, /free/i)
  assert.doesNotMatch(copy.en.heroFreeScope, /501/)
  assert.doesNotMatch(copy.en.heroFreeScope, /550/)
  for (const locale of ["fr", "es", "de", "it", "pt"] as const) {
    assert.ok(copy[locale].heroFreeScope.length > 0)
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
  assert.match(marks, /brand-marks\//)
  assert.doesNotMatch(strip, /riq-brand-name/)
  assert.doesNotMatch(strip, /\{name\}<\/li>/)
  assert.doesNotMatch(strip, /These are the brands we watch/)
  assert.match(strip, /riq-brand-more/)
  assert.match(strip, /canonicalPath\(locale, "\/data"\)/)
  assert.match(strip, /brandStripMoreCount/)
  assert.equal(brandStripNames(["Patagonia", "Balenciaga", "Fred Perry", "Stone Island", "New Balance"]).includes("Patagonia"), false)
  assert.ok(brandStripNames(["Patagonia", "New Balance"]).includes("New Balance"))
  const filled = brandStripNames(["Fred Perry", "Stone Island", "Patagonia"])
  assert.equal(filled.length, Object.keys(BRAND_MARK_SRC).length)
  assert.ok(filled.includes("Nike"))
  assert.ok(filled.includes("Adidas"))
  assert.equal(brandStripMoreCount(9, 28), 19)
  assert.equal(brandStripMoreCount(9, 9), 0)
  assert.equal(brandStripMoreCount(9, 2), 0)
  assert.equal(copy.en.brandStripMore(19), "+19 more")
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

test("homepage hero is one H1 + one subline, Samba essay not in the fold", () => {
  const landing = read("components/landing/landing-content.tsx")
  assert.doesNotMatch(landing, /t\.heroAudience/)
  assert.doesNotMatch(landing, /t\.heroFrom/)
  assert.doesNotMatch(landing, /t\.heroTrust/)
  assert.match(landing, /t\.heroHeadline/)
  assert.match(landing, /t\.heroSub/)
  assert.match(landing, /riq-sr-only/)
  assert.match(landing, /riq-home-teaser-cite/)
  assert.match(landing, /brandsTracked \?\? market\.brandCount/)
  // Positioning (2026-09-22): the hero sells the RANKED BUY LIST — "what
  // inventory should I buy this week" — not a per-item price lookup. The old
  // copy promised "type any model, get BUY/WATCH/SKIP", which the verdict logs
  // showed we answer with WATCH/UNKNOWN almost every time: 4 trial users ran 22
  // searches and received ZERO BUY verdicts, then declined to pay. Assert the
  // demand framing, and assert the per-item promise is NOT being made.
  // 2026-09-30: hero sub trimmed for the text-diet pass (~65% homepage word
  // cut, founder ask "too much text"). Assert intent (ranked list, Vinted,
  // leaving the shelf, no "Type any") rather than freezing exact prose —
  // the exact-equal pin from the earlier redesign is gone on purpose.
  assert.match(
    copy.en.heroSub,
    /Reselling intelligence for resellers/,
  )
  assert.match(copy.en.heroSub, /5 EU markets/)
  assert.doesNotMatch(copy.en.heroSub, /Type any/)
})

test("landing teaches three steps and honest coverage, and does not ship heroHonesty", () => {
  const landing = read("components/landing/landing-content.tsx")
  assert.match(landing, /riq-how-to/)
  assert.match(landing, /riq-coverage-line/)
  assert.match(landing, /t\.howToHeading/)
  assert.match(landing, /t\.howToCoverage/)
  assert.doesNotMatch(landing, /heroHonesty/)
  assert.equal(copy.en.howToSteps.length, 3)
  assert.match(copy.en.howToCoverage, /28\+/)
  assert.match(copy.en.howToCoverage, /Samba/)
  assert.match(copy.de.howToCoverage, /Vinted/)
  assert.doesNotMatch(copy.de.howToCoverage, /\bfree\b/i)
  assert.doesNotMatch(copy.de.heroSub, /\bBUY\b/)
  assert.match(copy.de.heroSub, /Wiederverkäufer/)
})

test("homepage buy-list footer checks first and does not open Stripe", () => {
  const landing = read("components/landing/landing-content.tsx")
  const teaser = read("components/landing/ssr-buy-list-teaser.tsx")
  assert.match(landing, /showPrice=\{false\}/)
  assert.match(landing, /<PricingSection/)
  assert.doesNotMatch(teaser, /Get buy-below prices/)
  assert.doesNotMatch(teaser, /src="ssr_buy_list"(?!_)/)
  assert.match(teaser, /data-testid="riq-home-see-plans"/)
  assert.match(teaser, /href="#pricing"/)
  assert.match(teaser, /href="#check"/)
})

test("highlighted plan card collects email in compact mode too", () => {
  const pricing = read("components/landing/pricing-section.tsx")
  assert.match(pricing, /tier\.highlight && !isPaidPlan\(user\)/)
  assert.doesNotMatch(pricing, /tier\.highlight && !compact && !isPaidPlan\(user\)/)
  assert.match(pricing, /data-testid="riq-pricing-card-email"/)
  assert.match(pricing, /riq_capture_email/)
})
