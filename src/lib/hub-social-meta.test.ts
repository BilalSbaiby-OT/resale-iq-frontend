/**
 * EX-OG-HUBS / EX-CATEGORY-AEO — hub social titles must match the document
 * title. Root layout pins homepage og:title / twitter:title; a child `title`
 * alone does not override those tags.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { copy, type Locale } from "./i18n.ts"
import { methodologyCopy } from "./methodology-copy.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("/data sets matching title, og:title, twitter:title and descriptions", () => {
  const src = read("app/data/page.tsx")
  assert.match(src, /const TITLE = "Weekly Brand Volumes on Vinted — What Sells Best in 2026"/)
  assert.match(
    src,
    /Weekly Vinted brand volumes: watched departures and average asking prices at departure across Spain, France, Germany, Italy and Portugal/,
  )
  assert.match(src, /title: TITLE/)
  assert.match(src, /description: DESCRIPTION/)
  assert.match(src, /openGraph: \{ title: TITLE, description: DESCRIPTION, type: "website"/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title: TITLE, description: DESCRIPTION/,
  )
})

test("/flip sets twitter title/description to the same strings as title + og", () => {
  const src = read("app/flip/page.tsx")
  assert.match(src, /openGraph: \{ title, description, type: "website"/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description/)
})

test("/tools hub pins og/twitter titles to the document title", () => {
  const src = read("app/tools/page.tsx")
  assert.match(src, /const TITLE = "Know what sells. Check the model before you buy — Resale IQ"/)
  assert.match(src, /title: TITLE/)
  assert.match(src, /openGraph: \{ title: TITLE, description, type: "website"/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title: TITLE, description/)
})

test("/tools child pages pin og/twitter titles to the suffixed document title", () => {
  const src = read("app/tools/[slug]/page.tsx")
  assert.match(src, /const title = `\$\{i\.title\} — Resale IQ`/)
  assert.match(src, /openGraph: \{ title, description: i\.description, type: "website"/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description: i\.description/)
})

test("blog generateMetadata uses one string for title, og and twitter", () => {
  const src = read("app/blog/[slug]/page.tsx")
  assert.match(src, /const seoTitle = p\.seoTitle \?\? `\$\{p\.title\} — Resale IQ`/)
  assert.match(src, /openGraph: \{ title: seoTitle, description: p\.description, type: "article" \}/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title: seoTitle, description: p\.description \}/,
  )
  assert.doesNotMatch(src, /const ogTitle/)
  assert.doesNotMatch(src, /p\.seoTitle \?\? p\.title/)
})

test("locale pricing uses one string for title, og and twitter", () => {
  const src = read("app/[locale]/pricing/page.tsx")
  assert.match(src, /const title = `\$\{t\.metaTitle\} — Resale IQ`/)
  assert.match(src, /openGraph: \{ title, description: t\.metaDescription, type: "website"/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title, description: t\.metaDescription/,
  )
})

test("/pricing pins og/twitter to the document title (EX-PRICING-CTR)", () => {
  const src = read("app/pricing/page.tsx")
  assert.match(src, /const TITLE = `\$\{copy\.en\.pricingSection\.metaTitle\} — Resale IQ`/)
  assert.match(src, /title: TITLE/)
  assert.match(src, /openGraph: \{ title: TITLE, description: DESCRIPTION, type: "website"/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title: TITLE, description: DESCRIPTION/,
  )
})

test("locale methodology sets twitter to the same title as the document", () => {
  const src = read("app/[locale]/methodology/page.tsx")
  assert.match(src, /const title = `\$\{t\.text0\} — Resale IQ`/)
  assert.match(src, /openGraph: \{ title, description, type: "article" \}/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description \}/)
})

test("pricing titles are money-intent and capped in every locale (EX-PRICING-CTR)", () => {
  const locales: Locale[] = ["en", "fr", "es", "de", "it", "pt"]
  for (const locale of locales) {
    const t = copy[locale].pricingSection
    const title = `${t.metaTitle} — Resale IQ`
    assert.ok(title.length <= 60, `${locale} title ${title.length}: ${title}`)
    assert.ok(
      t.metaDescription.length <= 155,
      `${locale} meta ${t.metaDescription.length}: ${t.metaDescription}`,
    )
    assert.match(t.metaTitle, /Starter/)
    assert.match(t.metaTitle, /Pro/)
    assert.match(t.metaTitle, /19/)
    assert.match(t.metaTitle, /49/)
    assert.doesNotMatch(title, /what each plan costs|ce que coûte|cuánto cuesta|was jeder Tarif|quanto costa|quanto custa/i)
    assert.doesNotMatch(t.metaTitle, /Free|Gratuit|Gratis|Kostenlos/i)
    assert.doesNotMatch(t.metaDescription, /7 days unlimited|essai gratuit|prueba gratis/i)
  }
  assert.match(copy.en.pricingSection.metaTitle, /What sells/)
  assert.match(copy.en.pricingSection.metaDescription, /demand/)
})

test("/methodology uses an AEO title and matching og/twitter (EX-PRICING-CTR)", () => {
  const src = read("app/methodology/page.tsx")
  assert.match(src, /const TITLE = "How Buy-Below and Every Number Are Calculated — Resale IQ"/)
  assert.ok("How Buy-Below and Every Number Are Calculated — Resale IQ".length <= 60)
  assert.match(src, /title: TITLE/)
  assert.match(src, /openGraph: \{ title: TITLE, description: DESCRIPTION, type: "article" \}/)
  assert.match(
    src,
    /twitter: \{ card: "summary_large_image", title: TITLE, description: DESCRIPTION \}/,
  )
  assert.doesNotMatch(src, /Methodology — how Resale IQ calculates/)
})

test("locale methodology titles stay AEO and capped with brand suffix", () => {
  const locales: Locale[] = ["en", "fr", "es", "de", "it", "pt"]
  for (const locale of locales) {
    const title = `${methodologyCopy[locale].text0} — Resale IQ`
    assert.ok(title.length <= 60, `${locale} methodology title ${title.length}: ${title}`)
    assert.match(methodologyCopy[locale].text0, /calcul|berechnet|calcolato/i)
  }
})

// EX-CATEGORY-AEO — same homepage-twitter leak /data and /flip already closed.
test("/category hub sets twitter title/description to the same strings as title + og", () => {
  const src = read("app/category/page.tsx")
  assert.match(src, /What Sells Best on Vinted by Category/)
  assert.match(src, /openGraph: \{ title, description, type: "website"/)
  assert.match(src, /twitter: \{ card: "summary_large_image", title, description/)
})

test("/category slug pages pin social titles via articleSocialMeta", () => {
  const src = read("app/category/[category]/page.tsx")
  assert.match(src, /articleSocialMeta\(/)
  assert.match(src, /categoryLeafTitle\(/)
})

test("homepage layout owns answer-first title + matching og/twitter (EX-HOMEPAGE-AEO)", () => {
  const layout = read("app/layout.tsx")
  const titleMatch = layout.match(/const TITLE = "([^"]+)"/)
  assert.ok(titleMatch)
  const title = titleMatch[1]
  assert.equal(title, "Know what sells before you buy — Resale IQ")
  assert.ok(title.length <= 60)
  assert.match(title, /Resale IQ/)
  assert.match(title, /what sells/)
  assert.doesNotMatch(title, /Know what to pay/)
  assert.match(
    layout,
    /What sells, what it is worth, whether to buy\. \$\{tracked\} listings across Spain, France, Germany, Italy and Portugal\./,
  )
  assert.match(layout, /openGraph: \{[\s\S]*title: TITLE/)
  assert.match(layout, /twitter: \{[\s\S]*title: TITLE/)
  const home = read("app/page.tsx")
  assert.doesNotMatch(home, /openGraph:/)
  assert.doesNotMatch(home, /twitter:/)
  // Conversion H1 stays on the landing copy, not the document title.
  const i18n = read("lib/i18n.ts")
  assert.match(i18n, /heroHeadline: "Know the buy-below price before you source\."/)
})

test("layout Organization + SoftwareApplication JSON-LD stays valid", () => {
  const layout = read("app/layout.tsx")
  assert.match(layout, /"@type": \["Organization", "SoftwareApplication"\]/)
  assert.match(layout, /name: "Resale IQ"/)
  assert.match(layout, /url: "https:\/\/resaleiq\.dev"/)
  assert.match(layout, /applicationCategory: "BusinessApplication"/)
  assert.match(layout, /areaServed: \["ES", "FR", "DE", "IT", "PT"\]/)
  assert.match(layout, /isAccessibleForFree: false/)
  assert.match(layout, /\{ "@type": "Offer", name: "Starter", price: "19", priceCurrency: "EUR"/)
  assert.match(layout, /\{ "@type": "Offer", name: "Pro", price: "49", priceCurrency: "EUR"/)
  assert.match(layout, /structuredDataCopy\(locale\)/)
  const orgStart = layout.indexOf("const orgJsonLd")
  assert.ok(orgStart >= 0)
  const start = layout.indexOf("return {", orgStart)
  const emitted = layout.slice(start, layout.indexOf("export default", start))
  assert.doesNotMatch(emitted, /sell_through|featureList/)
})
