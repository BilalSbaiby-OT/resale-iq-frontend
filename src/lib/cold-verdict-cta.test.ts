import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
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

test("JWT plan covers /auth/me holes — paid token hides the €19 CTA", () => {
  assert.equal(coldVerdictCtaKind(undefined, "power"), "paid")
  assert.equal(coldVerdictCtaKind(null, "operator"), "paid")
  assert.equal(coldVerdictCtaKind("free", "power"), "paid")
  assert.equal(coldVerdictCtaKind(undefined, "free"), "upgrade")
})

test("cold /verdict and AppShell consult JWT plan, not only user.plan", () => {
  const verdict = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../app/(dashboard)/verdict/verdict-content.tsx"),
    "utf8",
  )
  const shell = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../components/layout/app-shell.tsx"),
    "utf8",
  )
  assert.match(verdict, /coldVerdictCtaKind\(user\?\.plan, getPlanFromToken\(\)\)/)
  assert.match(verdict, /isPaid=\{paidCold\}/)
  assert.match(shell, /isPaidPlan\(user\) \|\| isPaidPlanId\(getPlanFromToken\(\)\)/)
  assert.match(shell, /!isPaid && \(/)
})
