import { test } from "node:test"
import assert from "node:assert/strict"
import {
  collectVerdictMetrics,
  finiteNum,
  hasVerdictIntelligence,
  measuredBuyAndSell,
  reconstructedNote,
} from "./verdict-intelligence.ts"

test("null is not 0 — missing money fields produce no metric rows", () => {
  assert.equal(finiteNum(null), null)
  assert.equal(finiteNum(undefined), null)
  assert.equal(finiteNum(Number.NaN), null)
  assert.deepEqual(collectVerdictMetrics({}), [])
  assert.equal(hasVerdictIntelligence({}), false)
  assert.equal(hasVerdictIntelligence({ buy_below: null, sell_through_rate: null, top_sizes: [] }), false)
})

test("shelf counts render when buy_below and STR are withheld", () => {
  const rows = collectVerdictMetrics({
    buy_below: null,
    sell_through_rate: null,
    sold_7d: 14,
    active_listings: 33,
    n: 9,
  })
  assert.deepEqual(
    rows.map((r) => r.id),
    ["sold_7d", "active_listings", "n"],
  )
  assert.equal(hasVerdictIntelligence({ sold_7d: 14 }), true)
})

test("reconstructed / proxy fields fill the gap only when measured is absent", () => {
  const recon = collectVerdictMetrics({
    reconstructed_buy_below: 41.2,
    proxy_sell_avg: 62,
    active_comps: 18,
  })
  assert.deepEqual(recon, [
    { id: "buy_below", kind: "reconstructed", numeric: 41.2 },
    { id: "sell_avg", kind: "reconstructed", numeric: 62 },
    { id: "comps", kind: "measured", numeric: 18 },
  ])

  const nested = collectVerdictMetrics({
    reconstructed: { buy_below: 10, sell_avg: 20, n: 4, note: "from active comps" },
  })
  assert.equal(nested.find((r) => r.id === "buy_below")?.kind, "reconstructed")
  assert.equal(reconstructedNote({ reconstructed: { note: "from active comps" } }), "from active comps")

  const measuredWins = collectVerdictMetrics({
    buy_below: 26.59,
    reconstructed_buy_below: 99,
    sell_avg: 39.98,
  })
  assert.deepEqual(measuredWins.find((r) => r.id === "buy_below"), {
    id: "buy_below",
    kind: "measured",
    numeric: 26.59,
  })
})

test("target net only from measured buy_below × sell_avg", () => {
  assert.equal(measuredBuyAndSell({ reconstructed_buy_below: 10, sell_avg: 20 }), null)
  assert.deepEqual(measuredBuyAndSell({ buy_below: 10, sell_avg: 20 }), { buy: 10, sell: 20 })
})

test("reasons / note / sizes count as intelligence without inventing numbers", () => {
  assert.equal(hasVerdictIntelligence({ reasons: ["Shelf is moving"] }), true)
  assert.equal(hasVerdictIntelligence({ confidence_note: "Only 9 comparable departures" }), true)
  assert.equal(hasVerdictIntelligence({ top_sizes: ["42"] }), true)
})
