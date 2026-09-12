import { test } from "node:test"
import assert from "node:assert/strict"
import { parsePaywallBody, operatorPrice } from "./hard-paywall.ts"

const LIVE_402 = {
  verdict: "PAYWALL",
  locked: true,
  message: "A Resale IQ subscription is required to check items.",
  upgrade_url: "/register",
  plans: [
    { tier: "operator", label: "Starter", price_eur: 19 },
    { tier: "power", label: "Pro", price_eur: 49 },
  ],
}

test("200 with a full verdict is not a paywall", () => {
  assert.equal(
    parsePaywallBody(200, { verdict: "SKIP", buy_below: 32.01, sell_avg: 48.14 }),
    null,
  )
})

test("live 402 body parses; no teaser fields copied", () => {
  const wall = parsePaywallBody(402, { ...LIVE_402, buy_below: 32.01, sell_avg: 48.14 })
  assert.ok(wall)
  assert.equal(wall.verdict, "PAYWALL")
  assert.equal(wall.locked, true)
  assert.equal(wall.plans[0].price_eur, 19)
  assert.equal("buy_below" in wall, false)
  assert.equal("sell_avg" in wall, false)
})

test("402 with empty/garbage body still returns PAYWALL with default prices", () => {
  const wall = parsePaywallBody(402, null)
  assert.ok(wall)
  assert.equal(wall.verdict, "PAYWALL")
  assert.equal(operatorPrice(wall.plans), 19)
})

test("operatorPrice reads the 402 plan list, defaults to 19", () => {
  assert.equal(operatorPrice(LIVE_402.plans), 19)
  assert.equal(operatorPrice([]), 19)
  assert.equal(operatorPrice(undefined), 19)
})
