import type { Plan } from "@/types"
import { isPaidPlanId } from "./entitlement.ts"

/**
 * IQ-060 — cold `/verdict` CTA.
 *
 * UnlockPanel already refuses to sell Starter to entitled sessions
 * (`unlock-panel-state.ts`). The idle screen (no result) did not: it always
 * rendered “See plans → €19/mo”. Paid plan is `operator` (Starter) or
 * `power` (Pro). Trial stays on the upgrade path — `user.plan` is still
 * `free` until they pay.
 *
 * Plan membership is `isPaidPlanId` in entitlement.ts — do not restate
 * operator/power here.
 *
 * `/auth/me` can 429/5xx while the JWT still carries `plan`. Either source
 * is enough to hide See plans / Start for €19.
 */
export type ColdVerdictCta = "upgrade" | "paid"

export function coldVerdictCtaKind(
  plan: Plan | string | null | undefined,
  tokenPlan?: string | null,
): ColdVerdictCta {
  return isPaidPlanId(plan) || isPaidPlanId(tokenPlan) ? "paid" : "upgrade"
}
