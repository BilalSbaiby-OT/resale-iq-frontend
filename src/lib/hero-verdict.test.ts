import { test } from "node:test"
import assert from "node:assert/strict"
import { HERO_QUERY } from "./hero-verdict.ts"
import { isFreeSample } from "./free-samples.ts"
import { basisFromBuyList, type SsrBuyListItem } from "./ssr-buy-list.ts"

const row = (price_basis?: SsrBuyListItem["price_basis"]): SsrBuyListItem => ({
  brand: "Nike", model: "Air Force 1", category: "Sneakers", verdict: "WATCH",
  sold_7d: null, sold_30d_evidence: null, avg_price_eur: 30, buy_below: 20, locked: false, price_basis,
})

test("server-side hero/seed query is an anonymously-allowed free sample (anything else 402s PAYWALL)", () => {
  assert.ok(isFreeSample(HERO_QUERY), `${HERO_QUERY} is not in FREE_SAMPLES`)
})

test("hero/seed is Adidas Samba (BUY with a max buy live 2026-10-04; Fred Perry Polo is SKIP, no max buy)", () => {
  assert.equal(HERO_QUERY, "Adidas Samba")
})

test("typical-price basis comes from the buy-list rows, defaulting to departed", () => {
  assert.equal(basisFromBuyList([row("live_ask"), row("live_ask")]), "live_ask")
  assert.equal(basisFromBuyList([row(), row("live_ask")]), "live_ask")
  assert.equal(basisFromBuyList([row("departed")]), "departed")
  assert.equal(basisFromBuyList([]), "departed")
  assert.equal(basisFromBuyList(null), "departed")
})
