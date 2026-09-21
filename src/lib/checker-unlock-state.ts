import { isPaidPlan, isPaidPlanId } from "./entitlement.ts"
import type { User } from "../types/index.ts"

/**
 * WHICH post-check bar to render on the public FreeChecker.
 *
 * THE BUG THIS FIXES (founder-reported 2026-09-21):
 * A paying Pro user ran a check on /tools and was told to "subscribe to plan"
 * / unlock "with a plan". Root cause: the result bar always rendered
 * GuestCheckoutButton + unlock copy. Anonymity and plan are AUTH facts.
 * Port the UnlockPanel pattern (unlock-panel-state.ts): decide from the
 * session, never from a missing data field.
 *
 * Branches:
 *  - "hidden"   — example seed, or a verdict that has its own branch
 *                 (UNKNOWN / INSUFFICIENT_DATA / LIMIT_REACHED / PAYWALL /
 *                 BRAND_CATEGORIES). Those faces already own their CTA.
 *  - "paid"     — signed-in Starter (operator) or Pro (power). NEVER checkout.
 *  - "checkout" — anonymous or free (including trial). Keep the upgrade path.
 */
export type CheckerUnlockBranch = "hidden" | "checkout" | "paid"

const OWN_CTA_VERDICTS = new Set([
  "UNKNOWN",
  "INSUFFICIENT_DATA",
  "LIMIT_REACHED",
  "PAYWALL",
  "BRAND_CATEGORIES",
])

export function checkerUnlockBranch(opts: {
  isExample: boolean
  verdict?: string | null
  user?: User | null
  /** JWT `plan` claim, used when /auth/me has not hydrated yet. */
  tokenPlan?: string | null
}): CheckerUnlockBranch {
  if (opts.isExample) return "hidden"
  if (!opts.verdict || OWN_CTA_VERDICTS.has(opts.verdict)) return "hidden"
  if (isPaidPlan(opts.user) || isPaidPlanId(opts.tokenPlan)) return "paid"
  return "checkout"
}

/**
 * Paid users who somehow land on PAYWALL / LIMIT_REACHED (anon fetch, stale
 * JWT) must not be sent to Stripe. Those faces otherwise always checkout.
 */
export function checkerRefusalIsPaid(opts: {
  verdict?: string | null
  user?: User | null
  tokenPlan?: string | null
}): boolean {
  if (opts.verdict !== "PAYWALL" && opts.verdict !== "LIMIT_REACHED") return false
  return isPaidPlan(opts.user) || isPaidPlanId(opts.tokenPlan)
}
