import { test } from "node:test"
import assert from "node:assert/strict"
import { canFindLiveDeals, canOpenDealScanner, liveDealsEmptyText } from "./live-deals-gate.ts"

test("Find live deals is Pro (power) only", () => {
  assert.equal(canFindLiveDeals("power"), true)
  assert.equal(canFindLiveDeals("operator"), false)
  assert.equal(canFindLiveDeals("free"), false)
  assert.equal(canFindLiveDeals(null), false)
})

test("Deal Scanner is hidden for guests; open for Starter, Pro, and trial", () => {
  assert.equal(canOpenDealScanner(null), false)
  assert.equal(canOpenDealScanner(undefined), false)
  assert.equal(canOpenDealScanner({ plan: "free" }), false)
  assert.equal(canOpenDealScanner({ plan: "free", trial_active: false }), false)
  assert.equal(canOpenDealScanner({ plan: "free", trial_active: true }), true)
  assert.equal(canOpenDealScanner({ plan: "operator" }), true)
  assert.equal(canOpenDealScanner({ plan: "power" }), true)
})

test("empty live-deals surface prefers API reason over a blank card", () => {
  const fallback = "No listings that match this brand and model under buy-below right now."
  assert.equal(
    liveDealsEmptyText({ error: "", reason: "model_too_vague", fallback }),
    "model_too_vague",
  )
  assert.equal(
    liveDealsEmptyText({ error: "Live search failed", reason: "timeout", fallback }),
    "Live search failed",
  )
  assert.equal(
    liveDealsEmptyText({ error: null, reason: "   ", fallback }),
    fallback,
  )
  assert.equal(
    liveDealsEmptyText({ error: null, reason: null, fallback }),
    fallback,
  )
})
