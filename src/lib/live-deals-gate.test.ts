import { test } from "node:test"
import assert from "node:assert/strict"
import { canFindLiveDeals, liveDealsEmptyText } from "./live-deals-gate.ts"

test("Find live deals is Pro (power) only", () => {
  assert.equal(canFindLiveDeals("power"), true)
  assert.equal(canFindLiveDeals("operator"), false)
  assert.equal(canFindLiveDeals("free"), false)
  assert.equal(canFindLiveDeals(null), false)
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
