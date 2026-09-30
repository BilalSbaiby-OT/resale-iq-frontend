import type { VerdictResult } from "@/types"
import { unlockPanelBranch } from "./unlock-panel-state.ts"

/**
 * Should /verdict render the direct trial CTA (VerdictTrialCta) under this result?
 *
 * Yes for every verdict that carries a real price and an unpaid viewer, EXCEPT
 * where another block on the same card already IS the trial button:
 *  - UnlockPanel "register" branch (logged-out): has GuestCheckoutButton.
 *  - "verify" branch: their next step is confirming email, not Stripe.
 *  - paid / "entitled": never sell to a customer.
 * Verdicts with no number to sell (UNKNOWN, INSUFFICIENT_DATA, OVERSUPPLIED,
 * BRAND_CATEGORIES, LIMIT_REACHED) never get it — they own their own face.
 */
const PRICED = new Set(["BUY", "WATCH", "SKIP"])

export function verdictTrialCtaVisible(opts: {
  result: Pick<VerdictResult, "verdict" | "sell_through_rate" | "unlocks_remaining" | "verification_required">
  isPaid: boolean
  isAuthenticated: boolean
}): boolean {
  const v = opts.result.verdict
  if (opts.isPaid || !v) return false
  if (v === "BRAND_AVERAGE") return true
  if (!PRICED.has(v)) return false
  const branch = unlockPanelBranch(opts.result, opts.isAuthenticated, opts.isPaid)
  return branch === "unlock" || branch === "upgrade"
}
