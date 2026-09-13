/**
 * EX-FAQ-SCHEMA-HUBS — valid FAQPage JSON-LD, no invented stats,
 * no /register, no UTM inside schema answers.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { faqPageJsonLd, faqAnswerIsClean } from "./faq-schema.ts"

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
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /utm_/)
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
