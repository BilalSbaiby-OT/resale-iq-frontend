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
 */
export type ColdVerdictCta = "upgrade" | "paid"

export function coldVerdictCtaKind(plan: Plan | null | undefined): ColdVerdictCta {
  return isPaidPlanId(plan) ? "paid" : "upgrade"
}
