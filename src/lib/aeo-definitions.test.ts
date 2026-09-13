/**
 * EX-AEO-DEFINITIONS — citeable H2 + paragraph leads on ranking pages.
 * Titles, metas and H1s stay frozen. No invented stats. No /register.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

function postSlice(src: string, slug: string, nextSlug?: string): string {
  const start = src.indexOf(`slug: "${slug}"`)
  const end = nextSlug ? src.indexOf(`slug: "${nextSlug}"`) : src.length
  assert.ok(start >= 0, `missing slug ${slug}`)
  assert.ok(end > start, `could not bound ${slug}`)
  return src.slice(start, end)
}

test("buy-below-price-explained ships a Buy-below price lead and FAQ", () => {
  const post = postSlice(read("data/blog-posts.ts"), "buy-below-price-explained")
  assert.match(post, /title: "Buy-Below Price: The One Number That Decides Your Profit"/)
  assert.match(post, /What a buy-below price is, how to calculate it/)
  assert.match(post, /name: "Buy-below price"/)
  assert.match(
    post,
    /Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees/,
  )
  assert.match(post, /average asking price at departure × 0\.95 × 0\.70/)
  assert.match(post, /q: "What is a buy-below price\?"/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /Start free/i)
})

test("sell-through post ships an answer-first Sell-through rate lead and FAQ", () => {
  const post = postSlice(
    read("data/blog-posts.ts"),
    "what-is-a-good-sell-through-rate",
    "how-to-find-items-to-flip-on-vinted",
  )
  assert.match(post, /title: "What Is a Good Sell-Through Rate for Reselling\?"/)
  assert.match(post, /seoTitle: "Good Sell-Through Is Weekly — Here's the Floor — Resale IQ"/)
  assert.match(post, /name: "Sell-through rate"/)
  assert.match(
    post,
    /Sell-through rate is the share of listings that sold in a period: watched departures divided by those departures plus items still listed/,
  )
  assert.match(post, /not weekly turns, which can exceed 100%/)
  assert.match(post, /q: "What is a sell-through rate\?"/)
  assert.doesNotMatch(post, /register\?plan=/)
  assert.doesNotMatch(post, /Start free/i)
})

test("what-sells-best ships a Watched departure lead with hub links", () => {
  const post = postSlice(
    read("data/blog-posts.ts"),
    "what-sells-best-on-vinted",
    "how-to-price-items-on-vinted",
  )
  assert.match(post, /title: "What Sells Best on Vinted in 2026 \(Data-Backed\)"/)
  assert.match(post, /name: "Watched departure"/)
  assert.match(post, /A watched departure is a listing we watched leave the shelf/)
  assert.match(post, /not a confirmed sale receipt/)
  assert.match(post, /ilinkHref\("data"\)/)
  assert.match(post, /ilinkHref\("flip"\)/)
  assert.match(post, /q: "What is a watched departure\?"/)
  assert.match(post, /https:\/\/resaleiq\.dev\/data/)
  assert.match(post, /https:\/\/resaleiq\.dev\/flip/)
  assert.doesNotMatch(post, /Start free/i)
  const faq = post.slice(post.indexOf("faq:"))
  assert.doesNotMatch(faq, /utm_/)
  assert.doesNotMatch(faq, /\/register/)
})

test("blog post renderer prints definedTerm above the intro", () => {
  const src = read("app/blog/[slug]/page.tsx")
  const term = src.indexOf("p.definedTerm")
  const intro = src.indexOf("renderRichText(p.intro)")
  assert.ok(term >= 0 && intro > term)
  assert.match(src, /definedTermJsonLd/)
  assert.match(src, /p\.definedTerm\.name/)
})

test("/data and /flip publish matching visible + FAQ definitions", () => {
  const data = read("app/data/page.tsx")
  assert.match(data, /What is a watched departure\?/)
  assert.match(data, /listing we watched leave the shelf/)
  assert.match(data, /not a confirmed sale receipt/)
  assert.match(data, /definedTermJsonLd/)

  const flip = read("app/flip/page.tsx")
  assert.match(flip, /How we rank what sells best/)
  assert.match(flip, /rank the tracked brands by watched departures/)
  assert.match(flip, /How do you rank what sells best\?/)
  assert.match(flip, /definedTermJsonLd/)
  assert.doesNotMatch(flip, /utm_/)
  assert.doesNotMatch(data, /utm_/)
})
