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
    "Does Adidas sell on Vinted? Weekly departures — Resale IQ",
  )
  assert.equal(
    flipBrandCategoryTitle("Adidas", "Sneakers"),
    "Adidas sneakers on Vinted: demand & buy-below — Resale IQ",
  )
  assert.equal(
    categoryLeafTitle("Sneakers"),
    "Do sneakers sell on Vinted? Category demand — Resale IQ",
  )
})

test("every brand and category title is number-free and branded", () => {
  for (const b of BRANDS) {
    const title = flipBrandTitle(b.brand)
    assert.match(title, / — Resale IQ$/)
    assert.match(title, /Vinted/)
    assert.match(title, /departures/i)
    assert.doesNotMatch(title, /\d/)
    for (const c of b.categories || []) {
      const leaf = flipBrandCategoryTitle(b.brand, c.category)
      assert.match(leaf, / — Resale IQ$/)
      assert.match(leaf, /demand & buy-below/)
      assert.doesNotMatch(leaf, /\d/)
    }
  }
  for (const c of CATEGORIES) {
    const title = categoryLeafTitle(c)
    assert.equal(
      title,
      `Do ${c.toLowerCase()} sell on Vinted? Category demand — Resale IQ`,
    )
    assert.doesNotMatch(title, /\d/)
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
  const meta = src.slice(src.indexOf("export async function generateMetadata"), src.indexOf("export default"))
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

test("/category/[category] generateMetadata uses the helper; FAQPage stays", () => {
  const src = read("app/category/[category]/page.tsx")
  assert.match(src, /categoryLeafTitle\(/)
  assert.match(src, /categoryLeafDescription\(/)
  assert.match(src, /articleSocialMeta\(/)
  assert.match(src, /"@type": "FAQPage"/)
  assert.match(src, /Which brand sells the most/)
  assert.match(src, /How many \$\{lower\} sell on Vinted each week/)
  assert.doesNotMatch(src, /twitter:/)
})

test("leaf H1s and tables stay on page data — titles only change metadata", () => {
  const brand = read("app/flip/[brand]/page.tsx")
  assert.match(brand, /Is \{b\.brand\} worth reselling on Vinted in 2026\?/)
  assert.match(brand, /Left shelf per week/)
  assert.match(brand, /fmtCount\(sold\)/)

  const pair = read("app/flip/[brand]/[category]/page.tsx")
  assert.match(pair, /Are \{b\.brand\} \{catName\} worth reselling on Vinted\?/)
  assert.match(pair, /fmtCount\(catSold\)/)

  const cat = read("app/category/[category]/page.tsx")
  assert.match(cat, /Best brands for reselling \{lower\} on Vinted/)
  assert.match(cat, /fmtCount\(total\)/)
  assert.match(cat, /fmtCount\(e\.sold_7d\)/)
})
