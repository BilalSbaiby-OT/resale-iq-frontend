import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { pricingCtaKind } from "./pricing-cta-state.ts"
import type { User } from "../types/index.ts"

const SECTION_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../components/landing/pricing-section.tsx"),
  "utf8",
)

const power: User = { id: 1, email: "pro@x", plan: "power" }
const starter: User = { id: 1, email: "st@x", plan: "operator" }
const free: User = { id: 1, email: "f@x", plan: "free" }

test("anonymous and free still checkout", () => {
  assert.equal(pricingCtaKind(null, "operator"), "checkout")
  assert.equal(pricingCtaKind(free, "operator"), "checkout")
  assert.equal(pricingCtaKind(free, "power"), "checkout")
})

test("Pro sees current-plan on Pro and manage on Starter — never checkout", () => {
  assert.equal(pricingCtaKind(power, "power"), "current")
  assert.equal(pricingCtaKind(power, "operator"), "manage")
})

test("Starter sees current-plan on Starter and manage on Pro — never checkout", () => {
  assert.equal(pricingCtaKind(starter, "operator"), "current")
  assert.equal(pricingCtaKind(starter, "power"), "manage")
})

test("PricingSection reads the session and does not checkout paid users", () => {
  assert.match(SECTION_SRC, /pricingCtaKind/)
  assert.match(SECTION_SRC, /useAuthStore/)
  assert.match(SECTION_SRC, /isPaidPlan\(user\)/)
  assert.match(SECTION_SRC, /currentPlanCta/)
  assert.match(SECTION_SRC, /manageSubscriptionCta/)
  assert.match(SECTION_SRC, /canonicalPath\(locale, "\/account"\)/)
})
