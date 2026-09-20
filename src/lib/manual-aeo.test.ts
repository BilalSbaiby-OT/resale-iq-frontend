/**
 * EX-MANUAL-AEO — hub + chapter FAQ packs, citeable buy-below lead,
 * soft-title sharpen. Authenticity CTR (body_fake) must stay put.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { faqAnswerIsClean } from "./faq-schema.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

function chapterSlice(src: string, slug: string, nextSlug?: string): string {
  const start = src.indexOf(`slug: "${slug}"`)
  const end = nextSlug ? src.indexOf(`slug: "${nextSlug}"`) : src.length
  assert.ok(start >= 0, `missing slug ${slug}`)
  assert.ok(end > start, `could not bound ${slug}`)
  return src.slice(start, end)
}

function faqBlock(chunk: string): string {
  const start = chunk.indexOf("faq:")
  assert.ok(start >= 0, "chapter has no faq:")
  return chunk.slice(start)
}

function faqCount(chunk: string): number {
  return (faqBlock(chunk).match(/q:\s*"/g) || []).length
}

const manual1 = read("data/manual.ts")
const manual2 = read("data/manual-2.ts")
const chapterPage = read("app/manual/[chapter]/page.tsx")

const EXPANDED = [
  { file: manual1, slug: "what-actually-makes-money", next: "the-buy-below-price" },
  { file: manual1, slug: "the-buy-below-price", next: "sell-through-vs-volume" },
  { file: manual1, slug: "sell-through-vs-volume", next: "the-cost-of-time" },
  { file: manual1, slug: "the-cost-of-time", next: "where-to-source" },
  { file: manual1, slug: "where-to-source", next: "reading-a-listing" },
  { file: manual1, slug: "reading-a-listing", next: "sizes-and-dead-stock" },
  { file: manual1, slug: "sizes-and-dead-stock", next: "condition-and-authenticity" },
  { file: manual2, slug: "pricing-your-listing", next: "photos-and-titles" },
  { file: manual2, slug: "photos-and-titles", next: "vinted-mechanics" },
  { file: manual2, slug: "vinted-mechanics", next: "cross-border-markets" },
  { file: manual2, slug: "cross-border-markets", next: "inventory-and-cashflow" },
  { file: manual2, slug: "inventory-and-cashflow", next: "metrics-that-matter" },
  { file: manual2, slug: "metrics-that-matter", next: "scaling-past-the-hobby" },
  { file: manual2, slug: "scaling-past-the-hobby", next: "tax-and-the-rules" },
  { file: manual2, slug: "tax-and-the-rules" },
] as const

test("expanded chapters ship 3–5 FAQ answers with no /register or UTM", () => {
  assert.ok(EXPANDED.length >= 5, "need ≥5 newly packed chapters")
  for (const row of EXPANDED) {
    const chunk = chapterSlice(row.file, row.slug, "next" in row ? row.next : undefined)
    const n = faqCount(chunk)
    assert.ok(n >= 3 && n <= 5, `${row.slug} has ${n} FAQs, want 3–5`)
    assert.ok(faqAnswerIsClean(faqBlock(chunk)), `${row.slug} FAQ is not clean`)
    assert.doesNotMatch(faqBlock(chunk), /\/register/)
    assert.doesNotMatch(faqBlock(chunk), /[?&]utm_/)
  }
})

test("buy-below chapter matches the blog twin definition lead", () => {
  const chunk = chapterSlice(manual1, "the-buy-below-price", "sell-through-vs-volume")
  assert.match(chunk, /name: "What is a buy-below price\?"/)
  assert.match(
    chunk,
    /A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees/,
  )
  assert.match(chunk, /average asking price at departure × 0\.95 × 0\.70/)
  assert.match(chunk, /departure-price input reflects watched listings leaving the shelf/)
  assert.match(chunk, /0\.95 models a 5% platform deduction/)
  assert.match(chunk, /0\.70 targets roughly a 30% margin/)
  assert.match(chunk, /sourcing ceiling, not a promised profit/)
  assert.match(chunk, /q: "What is a buy-below price\?"/)
  assert.match(chunk, /seoTitle: "What Is a Buy-Below Price on Vinted\? — The Vinted Reselling Manual"/)
  assert.match(chunk, /title: "How to work out the most you can pay"/)
  assert.doesNotMatch(chunk, /\/register/)
})

test("chapter renderer prints definedTerm above the intro and uses faqPageJsonLd", () => {
  const term = chapterPage.indexOf("c.definedTerm")
  const intro = chapterPage.indexOf("{c.intro}")
  assert.ok(term >= 0 && intro > term)
  assert.match(chapterPage, /definedTermJsonLd/)
  assert.match(chapterPage, /faqPageJsonLd\(c\.faq\)/)
  assert.match(chapterPage, /c\.seoTitle/)
})

test("authenticity chapter CTR (body_fake) keeps mid-CTA and a short 2026 title", () => {
  const chunk = chapterSlice(manual1, "condition-and-authenticity")
  assert.match(chunk, /title: "How to Spot Fake Items on Vinted in 2026 — Checks That Matter"/)
  assert.match(chunk, /seoTitle: "How to Spot Fake Items on Vinted .2026."/)
  assert.match(
    chunk,
    /Spot fakes and over-grades before you buy\. Condition moves price more than brand/,
  )
  assert.match(chunk, /body_fake_20260913/)
  assert.match(
    chunk,
    /href: "\/pricing\?utm_source=organic&utm_medium=blog&utm_campaign=body_fake_20260913&utm_content=mid_cta"/,
  )
  assert.equal(faqCount(chunk), 2)
})

test("soft chapter seoTitles keep the Manual suffix", () => {
  const titles = [
    chapterSlice(manual1, "where-to-source", "reading-a-listing"),
    chapterSlice(manual1, "sizes-and-dead-stock", "condition-and-authenticity"),
    chapterSlice(manual2, "pricing-your-listing", "photos-and-titles"),
    chapterSlice(manual2, "photos-and-titles", "vinted-mechanics"),
    chapterSlice(manual2, "vinted-mechanics", "cross-border-markets"),
    chapterSlice(manual2, "inventory-and-cashflow", "metrics-that-matter"),
    chapterSlice(manual2, "scaling-past-the-hobby", "tax-and-the-rules"),
    chapterSlice(manual2, "tax-and-the-rules"),
  ]
  for (const chunk of titles) {
    assert.match(chunk, /seoTitle: ".* — The Vinted Reselling Manual"/)
  }
})
