/**
 * Pins the frontend honesty bugs this audit repaired, as source contracts.
 * Run: npm run test:unit
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { FREE_SAMPLES } from "./free-samples.ts"
import { support } from "./support-copy.ts"
import { TRIAL_LIMITS_SENTENCE, TRIAL_LIMITS_SENTENCE_BY_LOCALE } from "./trial-copy.ts"
import type { Locale } from "./i18n.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (rel: string) => readFileSync(join(root, rel), "utf8")

test("trial-copy names all three free models, including Fred Perry Polo", () => {
  for (const model of FREE_SAMPLES) {
    assert.match(TRIAL_LIMITS_SENTENCE, new RegExp(model))
  }
  const locales: Locale[] = ["en", "fr", "es", "de", "it", "pt"]
  for (const locale of locales) {
    assert.match(TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale], /Fred Perry Polo/)
    assert.match(TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale], /Adidas Samba/)
    assert.match(TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale], /Nike Air Force 1/)
  }
})

test("support FAQ names all three free models and the 7-day trial, in every locale", () => {
  const src = read("lib/support-copy.ts")
  assert.match(src, /three models/)
  assert.doesNotMatch(src, /Yes for two models/)
  // The sentence is built from the one list, so assert on the rendered copy.
  for (const locale of ["en", "fr", "es", "de", "it", "pt"] as const) {
    const answer = support(locale).faq("x").find((f) => /free|gratuit|gratis|kostenlos|gratuito|grátis/i.test(f[0]))
    assert.ok(answer, `${locale} support FAQ must have the free plan or trial question`)
    for (const model of FREE_SAMPLES) assert.ok(answer[1].includes(model), `${locale} support FAQ omits ${model}`)
    assert.match(answer[1], /\b7\b/, `${locale} support FAQ must mention the 7-day trial`)
  }
})

test("brand rankings never label sold_7d as sample size n", () => {
  const src = read("app/(dashboard)/brands/page.tsx")
  assert.doesNotMatch(src, /n \{b\.sold_7d/)
  assert.doesNotMatch(src, /· n \{/)
})

test("watchlist gates on locked_fields, not locked boolean alone", () => {
  const src = read("app/(dashboard)/watchlist/page.tsx")
  assert.match(src, /isFieldLocked\(d\.locked_fields, "max_buy_price"\)/)
  assert.doesNotMatch(src, /setLocked\(d\.locked\)/)
})

test("live market pulse does not coerce null sold_7d to 0", () => {
  const src = read("components/landing/live-market-pulse.tsx")
  assert.doesNotMatch(src, /sold_7d \?\? 0/)
})

test("trends do not rank withheld opportunity_score as 0", () => {
  const src = read("app/(dashboard)/trends/page.tsx")
  assert.doesNotMatch(src, /opportunity_score \?\? 0/)
})

test("extension does not substitute sold_7d for comparable n", () => {
  const content = read("../extension/content.js")
  assert.doesNotMatch(content, /d\.n \?\? d\.sold_7d/)
  assert.match(content, /const n = d\.n \?\? null/)
})

test("extension treats HTTP 402 as paywall, not an outage", () => {
  const bg = read("../extension/background.js")
  const content = read("../extension/content.js")
  assert.match(bg, /status === 402/)
  assert.match(bg, /paywall: true/)
  assert.match(content, /res\?\.paywall/)
  assert.match(content, /resaleiq\.dev\/pricing/)
})

test("tools lede models the 5% seller fee, not a buyer-side fee", () => {
  const src = read("data/search-intents.ts")
  assert.match(src, /5% seller fee/)
  assert.doesNotMatch(src, /buyer-side fee we model/)
})

test("authenticated verdict formats sell-through through formatStrPctString", () => {
  const src = read("app/(dashboard)/verdict/verdict-content.tsx")
  assert.match(src, /formatStrPctString\(result\.sell_through_rate\)/)
})

test("methodology inline tokens are <code>, not a block <pre> inside <p>", () => {
  const src = read("app/methodology/page.tsx")
  assert.match(src, /<Code inline>sold_observed=1/)
  assert.match(src, /<Code inline>sold_at/)
  assert.match(src, /function Code\(\{ children, inline \}/)
})
