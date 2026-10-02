/**
 * EX-FLIP-CATEGORY-META — answer-first titles, no invented figures,
 * og/twitter match <title> on the three programmatic leaves.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  flipBrandTitle,
  flipBrandCategoryTitle,
  categoryLeafTitle,
  flipBrandDescription,
  flipBrandCategoryDescription,
  categoryLeafDescription,
  articleSocialMeta,
} from "./flip-category-meta.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const seo = JSON.parse(readFileSync(join(root, "data/seo-brands.json"), "utf8")) as {
  brands: { brand: string; categories?: { category: string }[] }[]
}
const BRANDS = seo.brands
const CATEGORIES = [...new Set(BRANDS.flatMap((b) => (b.categories || []).map((c) => c.category)))]

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("sample titles match the EX-FLIP-CATEGORY-META examples", () => {
  assert.equal(
    flipBrandTitle("Adidas"),
    "Adidas on Vinted: weekly departures — Resale IQ",
  )
  assert.equal(
    flipBrandCategoryTitle("Adidas", "Sneakers"),
    "Adidas sneakers: demand & buy-below — Resale IQ",
  )
  assert.equal(
    categoryLeafTitle("Sneakers"),
    "Do sneakers sell on Vinted? Category demand — Resale IQ",
  )
})

// EX-META-LENGTH-CAP (2026-09-29): title <=60 incl. suffix must hold for
// every real brand/category in the catalogue, not just short samples —
// "The North Face tracksuits" was the worst offender at 67 chars before this.
test("every brand and category title is number-free, branded, and <=60 chars", () => {
  for (const b of BRANDS) {
    const title = flipBrandTitle(b.brand)
    assert.match(title, / — Resale IQ$/)
    assert.match(title, /Vinted/)
    assert.match(title, /departures/i)
    assert.doesNotMatch(title, /\d/)
    assert.ok(title.length <= 60, `${b.brand} title ${title.length}: ${title}`)
    for (const c of b.categories || []) {
      const leaf = flipBrandCategoryTitle(b.brand, c.category)
      assert.match(leaf, / — Resale IQ$/)
      assert.match(leaf, /demand & buy-below/)
      assert.doesNotMatch(leaf, /\d/)
      assert.ok(leaf.length <= 60, `${b.brand} ${c.category} title ${leaf.length}: ${leaf}`)
    }
  }
  for (const c of CATEGORIES) {
    const title = categoryLeafTitle(c)
    assert.equal(
      title,
      `Do ${c.toLowerCase()} sell on Vinted? Category demand — Resale IQ`,
    )
    assert.doesNotMatch(title, /\d/)
    assert.ok(title.length <= 60, `${c} title ${title.length}: ${title}`)
  }
})

test("metas may cite live warehouse figures and never invent a fallback count", () => {
  const withLive = flipBrandDescription({ brand: "Adidas", sold: 809, avg: 42 })
  assert.match(withLive, /809/)
  assert.match(withLive, /watched departures/)
  assert.match(withLive, /buy-below/)
  assert.ok(withLive.length <= 155)

  const withheld = flipBrandDescription({ brand: "Adidas", sold: null, avg: null })
  assert.doesNotMatch(withheld, /\d/)
  assert.match(withheld, /watched departures/)
  assert.match(withheld, /buy-below/)
  assert.ok(withheld.length <= 155)

  const pair = flipBrandCategoryDescription({
    brand: "Adidas",
    category: "Sneakers",
    tracked: "{{TRACKED}}",
  })
  assert.match(pair, /watched departures/)
  assert.match(pair, /buy-below/)
  assert.match(pair, /\{\{TRACKED\}\}/)
  assert.ok(pair.length <= 155)

  const pairDash = flipBrandCategoryDescription({
    brand: "Adidas",
    category: "Sneakers",
    tracked: "—",
  })
  assert.doesNotMatch(pairDash, /\d/)
  assert.match(pairDash, /[Bb]uy-below/)

  const cat = categoryLeafDescription({
    category: "Sneakers",
    brandCount: 12,
    topBrand: "Adidas",
    topSold: 809,
  })
  assert.match(cat, /watched departures/)
  assert.match(cat, /buy-below/)
  assert.match(cat, /Adidas leads with 809/)
  assert.ok(cat.length <= 155)

  const catEmpty = categoryLeafDescription({
    category: "Sneakers",
    brandCount: 12,
    topBrand: null,
    topSold: null,
  })
  assert.doesNotMatch(catEmpty, /leads with/)
  assert.match(catEmpty, /buy-below/)
})

test("articleSocialMeta pins the same string on title, og and twitter", () => {
  const title = flipBrandTitle("Nike")
  const description = flipBrandDescription({ brand: "Nike", sold: null, avg: null })
  const meta = articleSocialMeta(title, description, "/flip/nike")
  assert.equal(meta.title, title)
  assert.equal(meta.openGraph.title, title)
  assert.equal(meta.twitter.title, title)
  assert.equal(meta.openGraph.description, description)
  assert.equal(meta.twitter.description, description)
  assert.equal(meta.twitter.card, "summary_large_image")
  assert.equal(meta.alternates.canonical, "/flip/nike")
})

test("/flip/[brand] generateMetadata uses the helper and matching social tags", () => {
  const src = read("app/flip/[brand]/page.tsx")
  const meta = src.slice(src.indexOf("async function generateMetadataRaw"), src.indexOf("export default"))
  assert.match(meta, /flipBrandTitle\(/)
  assert.match(meta, /flipBrandDescription\(/)
  assert.match(meta, /articleSocialMeta\(/)
  assert.doesNotMatch(meta, /left shelf/)
  assert.doesNotMatch(meta, /twitter:/)
})

test("/flip/[brand]/[category] generateMetadata uses the helper and matching social tags", () => {
  const src = read("app/flip/[brand]/[category]/page.tsx")
  assert.match(src, /flipBrandCategoryTitle\(/)
  assert.match(src, /flipBrandCategoryDescription\(/)
  assert.match(src, /articleSocialMeta\(/)
  assert.doesNotMatch(src, /twitter:/)
})

// EX-CALVIN-KLEIN-DUP (2026-09-29): next.config.ts used to 308-redirect every
// /flip/calvin-klein/:path* to the /flip hub even though calvin-klein is a
// live brand in seo-brands.json with its own generated pages — so every
// /flip/calvin-klein/<category> page served the HUB's title+description
// (redirect fires before generateMetadata runs). Removing the stale redirect
// entry fixes it at the source; this guards the regression.
test("next.config.ts no longer redirects live calvin-klein brand/category pages to the /flip hub", () => {
  const cfg = read("../next.config.ts")
  assert.doesNotMatch(cfg, /"\/flip\/calvin-klein"/)
  assert.doesNotMatch(cfg, /"\/flip\/calvin-klein\/:path\*"/)
  // The three genuinely zero-model brands (never had real pages) still redirect.
  assert.match(cfg, /"\/flip\/bershka"/)
  assert.match(cfg, /"\/flip\/mango"/)
  assert.match(cfg, /"\/flip\/pull-bear"/)
})

test("/category/[category] generateMetadata uses the helper; FAQPage stays", () => {
  const src = read("app/category/[category]/page.tsx")
  assert.match(src, /categoryLeafTitle\(/)
  assert.match(src, /categoryLeafDescription\(/)
  assert.match(src, /articleSocialMeta\(/)
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /Which brand sells the most/)
  // The count question names what we actually count: listings that left the shelf.
  assert.match(src, /How many \$\{lower\} leave the shelf on Vinted each week/)
  assert.doesNotMatch(src, /How many \$\{lower\} sell on Vinted each week/)
  assert.doesNotMatch(src, /twitter:/)
})

test("leaf H1s and tables stay on page data — titles only change metadata", () => {
  const brand = read("app/flip/[brand]/page.tsx")
  assert.match(brand, /Is \{b\.brand\} worth reselling on Vinted in 2026\?/)
  assert.match(brand, /Left the shelf per week/)
  // Every departure count goes through the display floor, never a raw fmtCount.
  assert.match(brand, /departureDisplay\(sold\)/)
  assert.match(brand, /soldShown\.text/)
  assert.doesNotMatch(brand, /fmtCount\(sold\)/)

  const pair = read("app/flip/[brand]/[category]/page.tsx")
  assert.match(pair, /Are \{b\.brand\} \{catName\} worth reselling on Vinted\?/)
  assert.match(pair, /departureDisplay\(catSold\)/)
  assert.match(pair, /catShown\.text/)
  assert.doesNotMatch(pair, /fmtCount\(catSold\)/)
  // The category's own average price, never the brand-wide one under a category count.
  assert.match(pair, /catRow\?\.avg_price_eur/)

  const cat = read("app/category/[category]/page.tsx")
  assert.match(cat, /Best brands for reselling \{lower\} on Vinted/)
  assert.match(cat, /departureDisplay\(total > 0 \? total : null\)/)
  assert.match(cat, /departureDisplay\(e\.sold_7d, "en", \{ compact: true \}\)/)
  assert.doesNotMatch(cat, /fmtCount\(e\.sold_7d\)/)
})

test("meta descriptions never print a departure count below the display floor", () => {
  // 7 is under the 10 floor: the count-free sentence is used, so no digit reaches the SERP.
  const thin = flipBrandDescription({ brand: "Zara", sold: 7, avg: 36 })
  assert.doesNotMatch(thin, /\d/)
  assert.match(thin, /watched departures/)
  const hidden = flipBrandDescription({ brand: "Zara", sold: 3, avg: 36 })
  assert.doesNotMatch(hidden, /\d/)
  // "Leads with N" is a ranking claim: it needs n >= 30, so 12 falls back.
  const lead = categoryLeafDescription({ category: "Jeans", brandCount: 9, topBrand: "Diesel", topSold: 12 })
  assert.doesNotMatch(lead, /leads with/)
  assert.doesNotMatch(lead, /\b12\b/)
  const ok = categoryLeafDescription({ category: "Jeans", brandCount: 9, topBrand: "Diesel", topSold: 44 })
  assert.match(ok, /Diesel leads with 44/)
})
