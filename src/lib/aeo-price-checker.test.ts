/**
 * AEO-PRICE-CHECKER-001 — Content deepen on /tools/vinted-price-checker.
 * Title / H1 locked. FAQ JSON-LD matches visible FAQs. No /register.
 * Free one-item check on the tools hub; sell-through/sizes on a plan.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { faqAnswerIsClean, faqPageJsonLd } from "./faq-schema.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

function intentSlice(src: string): string {
  const start = src.indexOf('slug: "vinted-price-checker"')
  const end = src.indexOf('slug: "vinted-sourcing-tool"')
  assert.ok(start >= 0 && end > start, "missing vinted-price-checker intent")
  return src.slice(start, end)
}

const intents = read("data/search-intents.ts")
const page = read("app/tools/[slug]/page.tsx")
const checker = intentSlice(intents)

test("price-checker title and H1 stay owned by the existing page", () => {
  assert.match(checker, /title: "Vinted Price Checker — What Any Item Really Sells For"/)
  assert.match(checker, /h1: "Vinted Price Checker"/)
  assert.match(checker, /Vinted price checker from/)
  assert.doesNotMatch(checker, /Typical Departure Price/)
})

test("price-checker body walks departure → buy-below → BUY/WATCH/SKIP", () => {
  assert.match(checker, /h: "From departure price to BUY, WATCH or SKIP"/)
  assert.match(checker, /Asking prices are hopes/)
  assert.match(checker, /0\.95 × 0\.70/)
  assert.match(checker, /BUY, WATCH or SKIP against that number/)
  assert.match(checker, /one-item check is free on the tools hub/)
  assert.match(checker, /Sell-through and sizes stay on a plan/)
  assert.doesNotMatch(checker, /no anonymous/)
  assert.doesNotMatch(checker, /There is no free/)
  assert.doesNotMatch(checker, /\/register/)
})

test("price-checker FAQs match Content and do not deny the free checker", () => {
  assert.match(checker, /q: "What does a Vinted price checker do\?"/)
  assert.match(checker, /q: "What is a buy-below price\?"/)
  assert.match(checker, /q: "Why departure prices\?"/)
  assert.match(checker, /q: "Is the Vinted price checker free\?"/)
  const faq = checker.slice(checker.indexOf("faq:"))
  assert.match(faq, /0\.95 × 0\.70/)
  assert.match(faq, /Yes\. You can run a one-item check on the tools hub/)
  assert.match(faq, /Sell-through and sizes stay on a plan/)
  assert.doesNotMatch(faq, /no anonymous/)
  assert.doesNotMatch(faq, /There is no anonymous/)
  assert.doesNotMatch(faq, /utm_/)
  assert.doesNotMatch(faq, /\/register/)
  const answers = [
    "A Vinted price checker estimates what an item is worth from listings that recently left the shelf, not from asking prices. Resale IQ returns a buy-below price and a BUY, WATCH or SKIP call across Spain, France, Germany, Italy and Portugal.",
    "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70. The 0.95 covers the 5% platform deduction we model for Vinted, and the 0.70 targets about a 30% margin.",
    "Asking prices are hopes. A departure price is the last ask when a comparable listing disappeared, which is the closest public proxy for what buyers paid. We do not see a receipt, so treat it as the closest honest proxy, not a confirmed sale price.",
    "Yes. You can run a one-item check on the tools hub (/tools) with no account. Sell-through and sizes stay on a plan. Weekly brand volumes and average departure prices stay public on /data.",
  ]
  for (const a of answers) {
    assert.equal(faqAnswerIsClean(a), true, a)
  }
  const schema = faqPageJsonLd([
    { q: "What does a Vinted price checker do?", a: answers[0] },
    { q: "What is a buy-below price?", a: answers[1] },
    { q: "Why departure prices?", a: answers[2] },
    { q: "Is the Vinted price checker free?", a: answers[3] },
  ])
  assert.equal(schema["@type"], "FAQPage")
  assert.equal(schema.mainEntity.length, 4)
  assert.equal(schema.mainEntity[3].name, "Is the Vinted price checker free?")
  assert.equal(schema.mainEntity[3].acceptedAnswer.text, answers[3])
})

test("tools slug page renders deepen + FAQ from the same intent", () => {
  assert.match(page, /i\.faq\.map/)
  assert.match(page, /"@type": "FAQPage"/)
  assert.match(page, /i\.deepen/)
  assert.match(page, /AEO_PRICE_CHECKER_CTA/)
  assert.match(page, /PRICE_CHECKER_MONEY_HREF/)
  assert.match(page, /Get the numbers →/)
  assert.doesNotMatch(page, /register\?/)
})

test("price-checker paid CTA is Get the numbers with aeo_price_checker_001", () => {
  assert.match(
    intents,
    /AEO_PRICE_CHECKER_CTA =\s*"\/pricing\?utm_source=tools&utm_medium=organic&utm_campaign=aeo_price_checker_001"/,
  )
  const money = read("lib/money-cta.ts")
  assert.match(money, /PRICE_CHECKER_MONEY_HREF = googleSearchTestPricingHref\("price_checker"\)/)
})

test("lede no longer claims the paywall is the only next step", () => {
  assert.match(checker, /Type a brand and model below to run a one-item check/)
  assert.match(checker, /Sell-through and sizes stay on a plan/)
  assert.doesNotMatch(checker, /paywall is the next step/)
  assert.doesNotMatch(checker, /hidden free number/)
  assert.doesNotMatch(checker, /There is no anonymous/)
})
