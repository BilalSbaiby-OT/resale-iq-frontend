import { isPaidPlan, isPaidPlanId } from "./entitlement.ts"
import type { User } from "../types/index.ts"

/**
 * Which label/action a /pricing card button should use.
 *
 * Paying customers must not be pushed through Checkout again — that is the
 * "Start for €19" bug on a Pro session (founder, 2026-09-21). Free, trial,
 * and logged-out visitors still get the checkout CTA.
 *
 *  - "checkout" — anonymous / free / trial
 *  - "current"  — this card IS their paid plan
 *  - "manage"   — they are paid on the other tier; portal via /account
 */
export type PricingCtaKind = "checkout" | "current" | "manage"

export function pricingCtaKind(
  user: User | null | undefined,
  tierId: string,
  tokenPlan?: string | null,
): PricingCtaKind {
  const plan = user?.plan ?? (isPaidPlanId(tokenPlan) ? tokenPlan : null)
  if (!isPaidPlan(user) && !isPaidPlanId(plan)) return "checkout"
  return plan === tierId ? "current" : "manage"
}
