/**
 * EX-FAQ-SCHEMA-HUBS — valid FAQPage JSON-LD, no invented stats,
 * no /register, no UTM inside schema answers.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { faqPageJsonLd, faqAnswerIsClean, definedTermJsonLd } from "./faq-schema.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("faqPageJsonLd emits a parseable FAQPage with Question/Answer pairs", () => {
  const items = [
    { q: "What sells best on Vinted?", a: "Among tracked brands, volume and ticket size rarely sit together." },
    { q: "What is a watched departure?", a: "A listing we watched leave the shelf, not a confirmed sale receipt." },
  ]
  const schema = faqPageJsonLd(items)
  assert.equal(schema["@context"], "https://schema.org")
  assert.equal(schema["@type"], "FAQPage")
  assert.equal(schema.mainEntity.length, 2)
  assert.equal(schema.mainEntity[0]["@type"], "Question")
  assert.equal(schema.mainEntity[0].name, items[0].q)
  assert.equal(schema.mainEntity[0].acceptedAnswer["@type"], "Answer")
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, items[0].a)
  const parsed = JSON.parse(JSON.stringify(schema))
  assert.equal(parsed["@type"], "FAQPage")
})

test("faq answers reject /register and UTM query strings", () => {
  assert.equal(faqAnswerIsClean("See https://resaleiq.dev/data"), true)
  assert.equal(faqAnswerIsClean("See https://resaleiq.dev/flip"), true)
  assert.equal(faqAnswerIsClean("See https://resaleiq.dev/pricing"), true)
  assert.equal(faqAnswerIsClean("Sign up at /register"), false)
  assert.equal(faqAnswerIsClean("https://resaleiq.dev/data?utm_source=blog"), false)
})

test("/flip hub builds FAQPage from the same items it renders", () => {
  const src = read("app/flip/page.tsx")
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /What sells best on Vinted\?/)
  assert.match(src, /How often does this data update\?/)
  assert.match(src, /What is a watched departure\?/)
  assert.match(src, /How do I use this ranking for buy-below\?/)
  assert.match(src, /How do you rank what sells best\?/)
  assert.match(src, /How we rank what sells best/)
  assert.match(src, /definedTermJsonLd/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /utm_/)
})

test("/data keeps Dataset schema and adds FAQPage", () => {
  const src = read("app/data/page.tsx")
  assert.match(src, /"@type": "Dataset"/)
  assert.match(src, /faqPageJsonLd\(faqs\)/)
  assert.match(src, /<HubFaq items=\{faqs\}/)
  assert.match(src, /Which Vinted markets does this table cover\?/)
  assert.match(src, /How do I read this table\?/)
  assert.match(src, /ES\/FR\/DE\/IT\/PT/)
  assert.match(src, /What is a watched departure\?/)
  assert.match(src, /definedTermJsonLd/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /utm_/)
})

test("definedTermJsonLd emits a parseable DefinedTerm", () => {
  const schema = definedTermJsonLd({
    name: "Buy-below price",
    description: "The most you can pay and still keep a healthy margin after fees.",
    url: "https://resaleiq.dev/blog/buy-below-price-explained",
  })
  assert.equal(schema["@type"], "DefinedTerm")
  assert.equal(schema.name, "Buy-below price")
  assert.equal(schema.url, "https://resaleiq.dev/blog/buy-below-price-explained")
  assert.doesNotMatch(schema.description, /utm_/)
  assert.doesNotMatch(schema.description, /\/register/)
})

test("what-sells-best FAQ cites absolute /data and /flip with no UTM", () => {
  const posts = read("data/blog-posts.ts")
  const start = posts.indexOf('slug: "what-sells-best-on-vinted"')
  const end = posts.indexOf('slug: "how-to-price-items-on-vinted"')
  assert.ok(start >= 0 && end > start)
  const post = posts.slice(start, end)
  const faq = post.slice(post.indexOf("faq:"))
  assert.match(faq, /https:\/\/resaleiq\.dev\/data/)
  assert.match(faq, /https:\/\/resaleiq\.dev\/flip/)
  assert.doesNotMatch(faq, /utm_/)
  assert.doesNotMatch(faq, /\/register/)
  assert.match(faq, /Hoodies/)
  assert.match(faq, /watched departures/)
  assert.match(faq, /Spain, France, Germany, Italy and Portugal/)
})

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

test("/manual hub ships FAQPage + HubFaq with no /register", () => {
  const src = read("app/manual/page.tsx")
  assert.match(src, /faqPageJsonLd\(MANUAL_HUB_FAQS\)/)
  assert.match(src, /<HubFaq items=\{MANUAL_HUB_FAQS\}/)
  assert.match(src, /What is the Vinted Reselling Manual\?/)
  assert.match(src, /Who is the Vinted Reselling Manual for\?/)
  assert.match(src, /Is the Vinted Reselling Manual free\?/)
  assert.match(src, /How does the manual tie to buy-below and the market data\?/)
  assert.match(src, /Which Vinted markets does this manual cover\?/)
  assert.match(src, /How to Resell on Vinted — The Vinted Reselling Manual/)
  assert.match(src, /https:\/\/resaleiq\.dev\/data/)
  assert.match(src, /https:\/\/resaleiq\.dev\/pricing/)
  assert.match(src, /https:\/\/resaleiq\.dev\/manual\/the-buy-below-price/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /utm_/)
})

test("blog post renderer prints definedTerm above the intro", () => {
  const src = read("app/blog/[slug]/page.tsx")
  const term = src.indexOf("p.definedTerm")
  const intro = src.indexOf("renderRichText(p.intro)")
  assert.ok(term >= 0 && intro > term)
  assert.match(src, /definedTermJsonLd/)
  assert.match(src, /p\.definedTerm\.name/)
})
