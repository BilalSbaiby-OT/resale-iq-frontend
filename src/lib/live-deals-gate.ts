import type { Plan, User } from "@/types"

/**
 * IQ-040 — Live Deal Finder is Pro (`power`) only.
 *
 * Starter (`operator`) already has Deal Scanner. The “Find live deals”
 * button used to open a 402 modal on every Starter card. Hide it unless
 * the session is power. Trial is plan=free and does not get the button.
 */
export function canFindLiveDeals(plan: Plan | string | null | undefined): boolean {
  return plan === "power"
}

/**
 * Deal Scanner (`/deals`) is Starter + Pro + trial.
 * Unauthenticated sandbox /verdict must not link here — AppShell would
 * dump the visitor on /login with an empty board.
 */
export function canOpenDealScanner(
  user: Pick<User, "plan" | "trial_active"> | null | undefined,
): boolean {
  if (!user) return false
  if (user.plan === "operator" || user.plan === "power") return true
  return user.trial_active === true
}

/** Empty finder: prefer the API `reason` over a blank / generic miss. */
export function liveDealsEmptyText(opts: {
  error?: string | null
  reason?: string | null
  fallback: string
}): string {
  const error = opts.error?.trim()
  if (error) return error
  const reason = opts.reason?.trim()
  if (reason) return reason
  return opts.fallback
}
