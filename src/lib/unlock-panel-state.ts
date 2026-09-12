import type { VerdictResult } from "@/types"

/**
 * WHICH post-verdict panel branch to render — decided in ONE pure place so it
 * is unit-testable and can never again key off a globally-blank data field.
 *
 * THE BUG THIS FIXES (founder-reported 2026-09-11):
 * A PAYING Pro user saw "Create a free account" on a provisional verdict.
 * Root cause: the panel decided "anonymous" from `unlocks_remaining === undefined`.
 * But per src/types VerdictResult, `unlocks_remaining` is "Absent for anonymous
 * callers AND paid plans" — so every paid customer looked anonymous and got the
 * register wall for an account they already have (and pay for).
 *
 * THE RULE: anonymity is an AUTH fact, not a data fact. Decide it from whether
 * the caller holds a session token (`isAuthenticated`), never from a field the
 * backend also blanks for paid plans or while data is maturing.
 *
 * Branches:
 *  - "hidden"   — the deep fields are present; nothing to unlock, render nothing.
 *  - "register" — genuinely logged out. Get an account (the free door).
 *  - "verify"   — logged in, email not confirmed. A one-click step, not a paywall.
 *  - "entitled" — logged in with NO free-unlock quota field, i.e. a paid/entitled
 *                 account whose deep numbers are simply still maturing. NEVER a
 *                 wall — they already have access.
 *  - "unlock"   — free account with monthly unlocks left. Quiet unlock button.
 *  - "upgrade"  — free account that has spent the monthly allowance. Make the case.
 */
export type UnlockPanelBranch =
  | "hidden"
  | "register"
  | "verify"
  | "entitled"
  | "unlock"
  | "upgrade"

export function unlockPanelBranch(
  result: Pick<VerdictResult, "sell_through_rate" | "unlocks_remaining" | "verification_required">,
  isAuthenticated: boolean,
): UnlockPanelBranch {
  // Present deep fields → nothing to unlock. (Mirrors free-checker.tsx.)
  const deepFieldsMissing = result.sell_through_rate == null
  if (!deepFieldsMissing) return "hidden"

  // Anonymity is an AUTH fact. A logged-out visitor gets the free-account door.
  if (!isAuthenticated) return "register"

  // Logged in from here on.
  if (result.verification_required === true) return "verify"

  // Logged in with no free-unlock quota field = paid / otherwise-entitled.
  // The numbers are just maturing; do NOT show any wall.
  if (result.unlocks_remaining === undefined) return "entitled"

  // Free account: quota-driven.
  return result.unlocks_remaining === 0 ? "upgrade" : "unlock"
}
