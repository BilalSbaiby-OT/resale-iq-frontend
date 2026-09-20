/**
 * First-click checkout must never wait on /stripe/plans.
 * Empty plans used to make resolvePriceId() return undefined → /register.
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { FALLBACK_PRICE_IDS, resolvePriceId, TIERS } from "./pricing.ts"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

test("fallback price ids match live Starter/Pro prefixes", () => {
  assert.equal(FALLBACK_PRICE_IDS.__OPERATOR__, "price_1U0psg1Mvj7CL8HQ58vsNbPF")
  assert.equal(FALLBACK_PRICE_IDS.__POWER__, "price_1U0psh1Mvj7CL8HQd4eK0kVM")
})

test("resolvePriceId uses fallback when plans have not loaded", () => {
  const starter = TIERS.find(t => t.id === "operator")?.priceId
  const pro = TIERS.find(t => t.id === "power")?.priceId
  assert.equal(resolvePriceId(starter, []), FALLBACK_PRICE_IDS.__OPERATOR__)
  assert.equal(resolvePriceId(pro, []), FALLBACK_PRICE_IDS.__POWER__)
  assert.equal(resolvePriceId(undefined, []), undefined)
})

test("resolvePriceId prefers live /stripe/plans over the fallback", () => {
  const starter = TIERS.find(t => t.id === "operator")?.priceId
  const live = "price_LIVE_OPERATOR_OVERRIDE"
  assert.equal(resolvePriceId(starter, [{ id: "operator", price_id: live }]), live)
})

test("createCheckout cancel_url is /pricing not /account", () => {
  const src = readFileSync(join(root, "lib/api.ts"), "utf8")
  assert.match(src, /\/pricing\?checkout=cancelled/)
  assert.doesNotMatch(src, /cancel_url: `\$\{window\.location\.origin\}\/account\?checkout=cancelled`/)
})

test("pricing first paint seeds sell-through and fills TRACKED", () => {
  const src = readFileSync(join(root, "components/landing/pricing-section.tsx"), "utf8")
  assert.match(src, /seedSellThrough/)
  assert.match(src, /useSellThroughLabel\(seedSellThrough\)/)
  assert.match(src, /starterTrust\.replace\("\{\{TRACKED\}\}", tracked\)/)
  assert.doesNotMatch(src, /starterTrust\.replace\("\{\{TRACKED\}\}", ""\)/)
})
