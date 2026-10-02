/**
 * The /pricing payback calculator defaults and the FAQ that quotes them must
 * agree, in every locale, in the visible FAQ AND the FAQPage JSON-LD (both read
 * copy[locale].pricingSection.faq). Before this test nothing pinned them: the
 * defaults were two inline useState literals and the FAQ prose was typed by hand.
 *
 * Founder decision 2026-10-02: default = 60 items x EUR 20 = EUR 1,200 a month.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  PAYBACK_DEFAULT_AVG_BUY_EUR,
  PAYBACK_DEFAULT_ITEMS_PER_MONTH,
  breakEvenItems,
  monthlySpend,
} from "./payback-defaults.ts"
import { copy } from "./i18n.ts"
import { TIERS } from "./pricing.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const LOCALES = ["en", "es", "fr", "de", "it", "pt"] as const
// Every way a locale writes a thousands separator: normal, no-break, narrow no-break space.
const norm = (s: string) => s.replace(/[  ]/g, " ")
const STARTER = TIERS.find((t) => t.id === "operator")!.price

test("defaults are a volume buyer: 60 items x EUR 20 = EUR 1,200 a month", () => {
  assert.equal(PAYBACK_DEFAULT_ITEMS_PER_MONTH, 60)
  assert.equal(PAYBACK_DEFAULT_AVG_BUY_EUR, 20)
  assert.equal(monthlySpend(PAYBACK_DEFAULT_ITEMS_PER_MONTH, PAYBACK_DEFAULT_AVG_BUY_EUR), 1200)
  assert.ok(monthlySpend(PAYBACK_DEFAULT_ITEMS_PER_MONTH, PAYBACK_DEFAULT_AVG_BUY_EUR) >= 1000)
})

test("both defaults sit on the existing slider grid and bounds (no slider change needed)", () => {
  const src = readFileSync(join(root, "components/landing/payback-calculator.tsx"), "utf8")
  assert.match(src, /min=\{5\} max=\{200\} step=\{5\}/)
  assert.match(src, /min=\{5\} max=\{120\} step=\{1\}/)
  assert.equal(PAYBACK_DEFAULT_ITEMS_PER_MONTH % 5, 0)
  assert.ok(PAYBACK_DEFAULT_ITEMS_PER_MONTH >= 5 && PAYBACK_DEFAULT_ITEMS_PER_MONTH <= 200)
  assert.ok(PAYBACK_DEFAULT_AVG_BUY_EUR >= 5 && PAYBACK_DEFAULT_AVG_BUY_EUR <= 120)
})

test("the calculator reads the shared defaults, not inline literals", () => {
  const src = readFileSync(join(root, "components/landing/payback-calculator.tsx"), "utf8")
  assert.match(src, /useState\(PAYBACK_DEFAULT_ITEMS_PER_MONTH\)/)
  assert.match(src, /useState\(PAYBACK_DEFAULT_AVG_BUY_EUR\)/)
  assert.doesNotMatch(src, /useState\(20\)/)
  assert.doesNotMatch(src, /useState\(15\)/)
})

test("break-even rounds UP so the claim is never flattering", () => {
  assert.equal(breakEvenItems(19, 20), 1) // 0.95 -> 1: the default reads "1 bad item"
  assert.equal(breakEvenItems(19, 15), 2) // 1.27 -> 2, not 1
  assert.equal(breakEvenItems(49, 20), 3)
  assert.equal(breakEvenItems(19, 0), 19) // price floor of 1: never divides by zero
})

test("the 'Is it worth EUR 19 a month?' FAQ quotes the calculator defaults in every locale", () => {
  const breakEven = breakEvenItems(STARTER, PAYBACK_DEFAULT_AVG_BUY_EUR)
  for (const locale of LOCALES) {
    const faq = copy[locale].pricingSection.faq.find((f) => /calc|rechner/i.test(f.a) && f.q.includes("€19"))
    assert.ok(faq, `${locale} pricing FAQ must carry the calculator-grounded "worth €19" answer`)
    const a = norm(faq.a)
    assert.ok(a.includes(String(PAYBACK_DEFAULT_ITEMS_PER_MONTH)), `${locale} FAQ omits the default item count ${PAYBACK_DEFAULT_ITEMS_PER_MONTH}`)
    assert.ok(/\b20\b/.test(a), `${locale} FAQ omits the default price ${PAYBACK_DEFAULT_AVG_BUY_EUR}`)
    // The total, formatted the way the calculator prints it in this locale.
    const spend = norm((monthlySpend(PAYBACK_DEFAULT_ITEMS_PER_MONTH, PAYBACK_DEFAULT_AVG_BUY_EUR)).toLocaleString(locale))
    assert.ok(a.includes(spend), `${locale} FAQ must print the monthly stock as "${spend}" (what the calculator shows): ${a}`)
    assert.ok(new RegExp(`\\b${breakEven}\\b`).test(a), `${locale} FAQ omits the break-even of ${breakEven}`)
    // The old defaults must be gone.
    assert.ok(!/\b20 (items|articles|artículos|Artikel|articoli|artigos)\b/i.test(a), `${locale} FAQ still quotes the old 20 items`)
    assert.ok(!/\b15 ?€/.test(a), `${locale} FAQ still quotes the old EUR 15 average`)
    // Honesty: it is arithmetic, never a promised saving or a hit rate.
    assert.ok(!/\b(guarantee|garantie|garantía|garantiert|garanzia|garantia)\b/i.test(a), `${locale} FAQ must not promise a saving`)
  }
})
