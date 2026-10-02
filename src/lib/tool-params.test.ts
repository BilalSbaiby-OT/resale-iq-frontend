import { test } from "node:test"
import assert from "node:assert/strict"
import { computeProfit, resolveQuery, VINTED_FEE_PCT } from "./tool-params.ts"
import { matchTeaserQuery } from "./teaser-verdict.ts"
import { CHECK_VINTED_ITEM_FORM_HTML, CHECK_VINTED_PRICE_FORM_HTML, CALCULATE_VINTED_PROFIT_FORM_HTML } from "./webmcp-tools.ts"

test("resolveQuery accepts q and the WebMCP alias query", () => {
  assert.equal(resolveQuery({ q: "Nike Air Force 1" }), "Nike Air Force 1")
  assert.equal(resolveQuery({ query: "Nike Air Force 1" }), "Nike Air Force 1")
  assert.equal(resolveQuery({ q: "Adidas Samba", query: "x" }), "Adidas Samba")
  assert.equal(resolveQuery({ q: "  ", query: "Fred Perry Polo" }), "Fred Perry Polo")
  assert.equal(resolveQuery({ query: ["Nike Air Force 1", "b"] }), "Nike Air Force 1")
  assert.equal(resolveQuery({}), undefined)
})

test("query alias reaches the free-sample matcher; paid models stay unmatched", () => {
  assert.equal(matchTeaserQuery(resolveQuery({ query: "nike air force 1" })), "Nike Air Force 1")
  assert.equal(matchTeaserQuery(resolveQuery({ query: "Stone Island Hoodie" })), null)
})

test("computeProfit: 20 buy / 45 sell = +25.00 (Vinted charges private sellers no selling fee); bad input = null", () => {
  const r = computeProfit("20", "45")
  assert.ok(r)
  assert.equal(VINTED_FEE_PCT, 0)
  assert.equal(r.net.toFixed(2), "25.00")
  assert.equal(computeProfit("20,5", "45")?.buy, 20.5)
  assert.equal(computeProfit("0", "45"), null)
  assert.equal(computeProfit(undefined, "45"), null)
})

test("hidden WebMCP forms declare a GET action that renders the result", () => {
  assert.match(CHECK_VINTED_ITEM_FORM_HTML, /action="\/tools" method="get"/)
  assert.match(CHECK_VINTED_PRICE_FORM_HTML, /action="\/tools\/vinted-price-checker" method="get"/)
  assert.match(CALCULATE_VINTED_PROFIT_FORM_HTML, /action="\/tools\/vinted-profit-calculator" method="get"/)
})
