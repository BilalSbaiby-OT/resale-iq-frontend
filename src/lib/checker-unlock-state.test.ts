import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { checkerUnlockBranch, checkerRefusalIsPaid } from "./checker-unlock-state.ts"
import type { User } from "../types/index.ts"

const CHECKER_SRC = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../components/tools/free-checker.tsx"),
  "utf8",
)

const power: User = { id: 1, email: "pro@x", plan: "power" }
const starter: User = { id: 1, email: "st@x", plan: "operator" }
const free: User = { id: 1, email: "f@x", plan: "free" }
const trial: User = { id: 1, email: "t@x", plan: "free", trial_active: true, trial_ends_at: "2026-09-28T00:00:00Z" }

test("Pro session never sees the guest checkout bar after a real check", () => {
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "BUY", user: power }),
    "paid",
  )
  assert.notEqual(
    checkerUnlockBranch({ isExample: false, verdict: "BUY", user: power }),
    "checkout",
  )
})

test("Starter (operator) is paid, same as Pro", () => {
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "WATCH", user: starter }),
    "paid",
  )
})

test("JWT plan covers the window before /auth/me hydrates", () => {
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "SKIP", tokenPlan: "power" }),
    "paid",
  )
})

test("anonymous and free still get the upgrade checkout bar", () => {
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "BUY" }),
    "checkout",
  )
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "BUY", user: free }),
    "checkout",
  )
  assert.equal(
    checkerUnlockBranch({ isExample: false, verdict: "BUY", user: trial }),
    "checkout",
  )
})

test("seeded example never shows a post-check bar", () => {
  assert.equal(
    checkerUnlockBranch({ isExample: true, verdict: "BUY", user: power }),
    "hidden",
  )
  assert.equal(
    checkerUnlockBranch({ isExample: true, verdict: "BUY" }),
    "hidden",
  )
})

test("verdicts with their own face do not also get the unlock bar", () => {
  for (const verdict of ["UNKNOWN", "INSUFFICIENT_DATA", "LIMIT_REACHED", "PAYWALL", "BRAND_CATEGORIES"]) {
    assert.equal(
      checkerUnlockBranch({ isExample: false, verdict }),
      "hidden",
      verdict,
    )
  }
})

test("PAYWALL / LIMIT_REACHED for a paid session is not a Stripe door", () => {
  assert.equal(checkerRefusalIsPaid({ verdict: "PAYWALL", user: power }), true)
  assert.equal(checkerRefusalIsPaid({ verdict: "LIMIT_REACHED", user: starter }), true)
  assert.equal(checkerRefusalIsPaid({ verdict: "PAYWALL" }), false)
  assert.equal(checkerRefusalIsPaid({ verdict: "BUY", user: power }), false)
})

test("FreeChecker wires the branch helper and does not always render GuestCheckout", () => {
  assert.match(CHECKER_SRC, /checkerUnlockBranch/)
  assert.match(CHECKER_SRC, /useAuthStore/)
  assert.match(CHECKER_SRC, /riq-paid-session-bar/)
  assert.match(CHECKER_SRC, /barBranch === "checkout"/)
  assert.match(CHECKER_SRC, /GuestCheckoutButton/)
  assert.match(CHECKER_SRC, /Authorization: `Bearer \$\{token\}`/)
  assert.doesNotMatch(CHECKER_SRC, /subscribe to plan/i)
})
