import { test } from "node:test"
import assert from "node:assert/strict"
import { isPaidPlanId } from "./entitlement.ts"
import { coldVerdictCtaKind } from "./cold-verdict-cta.ts"

test("operator and power are paid plans; free/trial/absent are not", () => {
  assert.equal(isPaidPlanId("operator"), true)
  assert.equal(isPaidPlanId("power"), true)
  assert.equal(isPaidPlanId("free"), false)
  assert.equal(isPaidPlanId(null), false)
  assert.equal(isPaidPlanId(undefined), false)
})

test("cold /verdict sells Starter only when the session is not operator/power", () => {
  assert.equal(coldVerdictCtaKind("operator"), "paid")
  assert.equal(coldVerdictCtaKind("power"), "paid")
  assert.equal(coldVerdictCtaKind("free"), "upgrade")
  assert.equal(coldVerdictCtaKind(undefined), "upgrade")
})
