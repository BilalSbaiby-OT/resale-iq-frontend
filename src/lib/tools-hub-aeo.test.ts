/**
 * EX-TOOLS-MONEY-CTA + AEO — primary google_search_test doors,
 * citeable buy-below lead, FAQPage that admits the free one-item checker.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { faqAnswerIsClean } from "./faq-schema.ts"
import {
  BUY_BELOW_TERM,
  BUY_BELOW_TERM_NAME,
  TOOLS_HUB_BODY,
  TOOLS_HUB_DEFINED_TERM,
  TOOLS_HUB_FAQS,
} from "./tools-hub-aeo.ts"
import {
  CATEGORY_MONEY_HREF,
  GOOGLE_SEARCH_TEST_CAMPAIGN,
  MONEY_CTA_LABEL,
  MONEY_CTA_SUBLINE,
  PRICE_CHECKER_MONEY_HREF,
  PROFIT_CALC_MONEY_HREF,
  TOOLS_FAQ_CTA_HREF,
  TOOLS_MONEY_HREF,
} from "./money-cta.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("tools FAQ answers match the live free-checker boundary", () => {
  assert.equal(TOOLS_HUB_FAQS.length, 5)
  assert.equal(TOOLS_HUB_FAQS[0].q, "What is a buy-below price?")
  assert.equal(TOOLS_HUB_FAQS[1].q, "How does ResaleIQ show demand?")
  assert.equal(TOOLS_HUB_FAQS[2].q, "Who is ResaleIQ for?")
  assert.equal(TOOLS_HUB_FAQS[3].q, "Is the Vinted price checker free?")
  assert.equal(TOOLS_HUB_FAQS[4].q, "What does the Starter plan unlock beyond the free check?")
  for (const f of TOOLS_HUB_FAQS) {
    assert.equal(faqAnswerIsClean(f.a), true, f.q)
  }
  const answers = TOOLS_HUB_FAQS.map((f) => f.a).join("\n")
  assert.match(answers, /free one-item check|one-item price checker is free/)
  assert.match(answers, /watched departures/)
  assert.match(answers, /Spain, France, Germany, Italy and Portugal/)
  assert.match(answers, /do not cover the UK/)
  assert.match(answers, /Starter is €19/)
  assert.match(TOOLS_HUB_FAQS[3].a, /^Yes\./)
  assert.doesNotMatch(answers, /no free item-check/i)
  assert.doesNotMatch(answers, /\/register/)
  assert.doesNotMatch(answers, /[?&]utm_/)
})

test("citeable buy-below lead mentions the free one-item checker", () => {
  assert.equal(BUY_BELOW_TERM_NAME, "Buy-below price")
  assert.match(BUY_BELOW_TERM, /average asking price at departure × 0\.95 × 0\.70/)
  assert.match(BUY_BELOW_TERM, /free one-item checker/)
  assert.match(BUY_BELOW_TERM, /BUY, WATCH or SKIP/)
  assert.match(TOOLS_HUB_BODY, /free one-item check/)
  assert.match(TOOLS_HUB_BODY, /not the UK/)
  assert.doesNotMatch(BUY_BELOW_TERM, /no free item-check/i)
  assert.doesNotMatch(TOOLS_HUB_BODY, /no free item-check/i)
  assert.equal(TOOLS_HUB_DEFINED_TERM.description, BUY_BELOW_TERM)
  assert.equal(TOOLS_HUB_DEFINED_TERM.url, "https://resaleiq.dev/tools")
})

test("money CTA hrefs pin the google_search_test campaign", () => {
  assert.equal(MONEY_CTA_LABEL, "Get the numbers")
  assert.equal(MONEY_CTA_SUBLINE, "Buy-below + demand before cash sticks.")
  assert.equal(
    TOOLS_MONEY_HREF,
    `/pricing?utm_source=google&utm_medium=cpc&utm_campaign=${GOOGLE_SEARCH_TEST_CAMPAIGN}&utm_content=tools`,
  )
  assert.equal(
    CATEGORY_MONEY_HREF,
    `/pricing?utm_source=google&utm_medium=cpc&utm_campaign=${GOOGLE_SEARCH_TEST_CAMPAIGN}&utm_content=category`,
  )
  assert.equal(
    TOOLS_FAQ_CTA_HREF,
    "/pricing?utm_source=tools&utm_medium=organic&utm_campaign=aeo_tools_faq_001",
  )
  assert.match(PROFIT_CALC_MONEY_HREF, /utm_content=profit_calc/)
  assert.match(PRICE_CHECKER_MONEY_HREF, /utm_content=price_checker/)
})

test("/tools hub renders FAQPage, DefinedTerm, and both paid doors", () => {
  const src = read("app/tools/page.tsx")
  assert.match(src, /faqPageJsonLd\(TOOLS_HUB_FAQS\)/)
  assert.match(src, /definedTermJsonLd\(TOOLS_HUB_DEFINED_TERM\)/)
  assert.match(src, /<HubFaq items=\{TOOLS_HUB_FAQS\}/)
  assert.match(src, /<MoneyCta href=\{TOOLS_MONEY_HREF\}/)
  assert.match(src, /TOOLS_FAQ_CTA_HREF/)
  assert.match(src, /BUY_BELOW_TERM/)
  assert.match(src, /TOOLS_HUB_BODY/)
  assert.match(src, /FreeChecker/)
  assert.doesNotMatch(src, /\/register/)
  assert.doesNotMatch(src, /no free item-check/i)
})

test("/category hub primary door is the google_search_test MoneyCta", () => {
  const src = read("app/category/page.tsx")
  assert.match(src, /<MoneyCta href=\{CATEGORY_MONEY_HREF\}/)
  assert.match(src, /CATEGORY_INDEX_SECONDARY_HREF/)
  assert.match(src, /src=category-check/)
  assert.doesNotMatch(src, /\/register/)
})
