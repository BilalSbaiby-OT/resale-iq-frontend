import { test } from "node:test"
import assert from "node:assert/strict"
import { apiSignalsUntracked, checkerFace, queryCoverageKind } from "./query-coverage.ts"

test("free samples, catalog brands, and off-catalog queries classify without invented API fields", () => {
  assert.equal(queryCoverageKind("Adidas Samba"), "free_sample")
  assert.equal(queryCoverageKind("nike air force 1"), "free_sample")
  assert.equal(queryCoverageKind("New Balance 530"), "free_sample")
  assert.equal(queryCoverageKind("Nike Dunk"), "catalog")
  assert.equal(queryCoverageKind("Gucci"), "catalog")
  assert.equal(queryCoverageKind("Levi's 501"), "catalog")
  assert.equal(queryCoverageKind("unknownxyz123"), "untracked")
  assert.equal(queryCoverageKind("Balenciaga phone charger"), "catalog")
})

test("Miu Miu is untracked until BE coverage_class — never the Should I buy wall", () => {
  assert.equal(queryCoverageKind("Miu Miu"), "untracked")
  assert.equal(checkerFace({ verdict: "PAYWALL", query: "Miu Miu" }), "coverage")
  assert.equal(checkerFace({ verdict: "PAYWALL", query: "miumiu bag" }), "coverage")
})

test("API unknown/untracked (once BE sends it) beats PAYWALL", () => {
  assert.equal(apiSignalsUntracked({ verdict: "UNKNOWN" }), true)
  assert.equal(apiSignalsUntracked({ reason: "untracked" }), true)
  assert.equal(apiSignalsUntracked({ coverage: "not_in_catalog" }), true)
  assert.equal(apiSignalsUntracked({ coverage_class: "low_demand" }), true)
  assert.equal(apiSignalsUntracked({ verdict: "PAYWALL" }), false)
  assert.equal(
    checkerFace({ verdict: "PAYWALL", query: "Gucci", apiBody: { reason: "untracked" } }),
    "coverage",
  )
})

test("today: untracked 402 is coverage; catalog 402 stays paywall", () => {
  assert.equal(
    checkerFace({ verdict: "PAYWALL", query: "unknownxyz123" }),
    "coverage",
  )
  assert.equal(
    checkerFace({ verdict: "PAYWALL", query: "a random thrift find" }),
    "coverage",
  )
  assert.equal(
    checkerFace({ verdict: "PAYWALL", query: "Nike Dunk" }),
    "paywall",
  )
  assert.equal(
    checkerFace({ verdict: "PAYWALL", query: "Gucci Marmont" }),
    "paywall",
  )
})
