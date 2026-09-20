/**
 * EX-PRICING-OFFER — locked Bilal flips hero on /pricing and /es/pricing.
 * Title/meta stay money-intent (EX-PRICING-CTR). Checkout ids stay on TIERS.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import assert from "node:assert/strict"
import { copy } from "./i18n.ts"
import { TIERS } from "./pricing.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8")
}

test("EN pricing hero is demand OS, not Know-what-to-pay", () => {
  const t = copy.en.pricingSection
  assert.equal(t.heading, "Know what sells. Decide whether to buy.")
  assert.match(t.subhead, /BUY \/ WATCH \/ SKIP/)
  assert.match(t.subhead, /€19/)
  assert.match(t.subhead, /Starter/)
  assert.doesNotMatch(t.heading, /Know what to pay/i)
  assert.doesNotMatch(t.subhead, /Know what to pay/i)
})

test("ES pricing hero is an accurate mirror of demand OS", () => {
  const t = copy.es.pricingSection
  assert.equal(t.heading, "Sabe qué se vende. Decide si compras.")
  assert.match(t.subhead, /BUY \/ WATCH \/ SKIP/)
  assert.match(t.subhead, /19 €/)
  assert.match(t.subhead, /Starter/)
  assert.doesNotMatch(t.heading, /Sabe qué pagar/i)
  assert.doesNotMatch(t.subhead, /Sabe qué pagar/i)
})

test("money-intent titles stay Starter €19 / Pro €49 (EX-PRICING-CTR)", () => {
  assert.match(copy.en.pricingSection.metaTitle, /Starter €19 \/ Pro €49/)
  assert.match(copy.es.pricingSection.metaTitle, /Starter 19 € \/ Pro 49 €/)
})

test("marketing ladder leads with Starter and highlights operator, not Free", () => {
  const src = read("components/landing/pricing-section.tsx")
  assert.match(src, /DISPLAY_ORDER: Record<string, number> = \{ operator: 0, power: 1, free: 2 \}/)
  assert.match(src, /highlight: mapped\.id === "operator"/)
  assert.match(src, /paidTiers = tiers\.filter\(\(tier\) => !tier\.free\)/)
  assert.match(src, /riq-public-data-line/)
  assert.match(src, /riq-starter-trust/)
  assert.doesNotMatch(src, /free: 0, operator: 1/)
})

test("Starter trust line and public-data demote are in EN + ES copy", () => {
  assert.match(copy.en.pricingSection.starterTrust, /\{\{TRACKED\}\}/)
  assert.match(copy.en.pricingSection.starterTrust, /cancel anytime/)
  assert.match(copy.en.pricingSection.starterTrust, /~2s/)
  assert.match(copy.es.pricingSection.starterTrust, /\{\{TRACKED\}\}/)
  assert.match(copy.es.pricingSection.starterTrust, /cancela cuando quieras/)
  assert.match(copy.en.pricingSection.publicDataLine, /Public data only \(not item checks\)/)
  assert.match(copy.es.pricingSection.publicDataLine, /Solo datos públicos \(no comprobaciones de artículos\)/)
  assert.doesNotMatch(copy.en.pricingSection.publicDataLine, /Start free/i)
  assert.doesNotMatch(copy.es.tiers.free.cta, /Start free|Empieza gratis/i)
})

test("homepage H1 is demand OS, not Know-what-to-pay", () => {
  assert.equal(copy.en.heroHeadline, "Know what sells. Decide whether to buy.")
  assert.match(copy.en.heroSub, /BUY \/ WATCH \/ SKIP/)
  assert.match(copy.en.heroSub, /€19/)
  assert.doesNotMatch(copy.en.heroHeadline, /Know what to pay/i)
  assert.doesNotMatch(copy.en.heroSub, /Know what to pay/i)
})

test("Stripe Starter/Pro placeholders are unchanged", () => {
  const starter = TIERS.find((t) => t.id === "operator")
  const pro = TIERS.find((t) => t.id === "power")
  assert.equal(starter?.priceId, "__OPERATOR__")
  assert.equal(pro?.priceId, "__POWER__")
  assert.equal(starter?.price, 19)
  assert.equal(pro?.price, 49)
})
