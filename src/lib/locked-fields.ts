/**
 * Which fields did the server withhold, and why the flag is not the answer.
 *
 * The API sends BOTH `locked` (a boolean) and `locked_fields` (a list of the
 * field names it omitted). Only the list is trustworthy.
 *
 * `locked` has been the constant `false` on every branch since W1's fix
 * (2026-09-01, demand-intel 5019fa0) stopped the backend redacting fields from
 * free logged-in accounts — `_gate()` returns `"locked": False` everywhere and
 * never returns True any more. Live proof, production, 2026-09-05:
 *
 *   curl -s "https://resaleiq.dev/api/verdict?q=Adidas%20Samba"
 *   → "locked": false,
 *     "locked_fields": ["sell_through_rate","top_sizes","size_velocity",
 *                       "opportunity_score","reasons","months_supply"]
 *
 * Six fields withheld, and the flag that is supposed to say so reads false.
 * Anything branching on `locked` therefore takes the "not gated" path and then
 * finds the value missing anyway, which is how the verdict hero ended up
 * printing a bare "—" over the sell-through slot: not "this is behind a plan"
 * but "this product is broken".
 *
 * `unlock-panel.tsx` already documented this exact trap and worked around it by
 * asking whether the deep field is present. That works, but it cannot tell a
 * withheld field from one the catalogue genuinely never computed — and those
 * two need different words on screen. `locked_fields` distinguishes them, so
 * prefer it and fall back to presence only where the list is unavailable.
 *
 * ABSENT, NOT BLURRED: a gated value is not in the payload at all. There is
 * nothing in the DOM to un-blur and nothing to reveal with CSS. Never "fix" a
 * lock affordance by rendering a real value behind a filter.
 */

/** The gated members of a verdict payload, mirroring api/routes.py `_gate()`. */
export type LockedField =
  | "sell_through_rate"
  | "top_sizes"
  | "size_velocity"
  | "opportunity_score"
  | "reasons"
  | "months_supply"
  | "str_pct"
  | "data_quality"
  | "buy_below"
  | "sell_avg"
  | "sell_median"
  // /api/deals and /api/trends gate the per-model money fields under these
  // names rather than the verdict payload's (`max_buy_price` is the deal-board
  // spelling of `buy_below`). See the TrendsSummary.locked_fields note in
  // src/types/index.ts.
  | "max_buy_price"

/**
 * True when the server explicitly said it withheld `field`.
 *
 * Deliberately narrow: an absent or empty `locked_fields` means "the server did
 * not tell us this was gated", which is NOT the same as "it is not gated" — but
 * claiming a lock we cannot evidence would be its own lie. Callers that must
 * cope with an older payload pass a presence check as `fallback` below.
 */
export function isFieldLocked(
  lockedFields: string[] | null | undefined,
  field: LockedField,
): boolean {
  return Array.isArray(lockedFields) && lockedFields.includes(field)
}

/**
 * The rendering decision for one field, in one call.
 *
 * Three outcomes, because there are three genuinely different truths and the
 * screen must not collapse them:
 *  - "value"  — we have it, show it.
 *  - "locked" — the server withheld it; show a lock and a way to unlock it.
 *  - "absent" — nobody withheld anything, we simply do not have the number
 *               (thin sample). A lock here would be a lie, so callers show
 *               their own honest "not measured" copy instead.
 */
export function fieldState<T>(
  value: T | null | undefined,
  lockedFields: string[] | null | undefined,
  field: LockedField,
): "value" | "locked" | "absent" {
  if (value != null) return "value"
  return isFieldLocked(lockedFields, field) ? "locked" : "absent"
}
