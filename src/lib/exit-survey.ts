/**
 * One-question exit survey: "What stopped you?" (O2, 2026-10-03).
 *
 * Shown inline on the Stripe-cancel return (/pricing?checkout=cancelled) and
 * on the PAYWALL / LIMIT_REACHED results. POSTs to /api/feedback/exit, which
 * validates the same closed enums (api/routes.py EXIT_SURVEY_*) and answers
 * 204. No email is ever sent from this flow.
 *
 * Plain .ts with no imports so node:test can load it.
 */
export const EXIT_SURVEY_CONTEXTS = ["checkout_cancel", "paywall", "limit", "cancel_intent"] as const
export type ExitSurveyContext = (typeof EXIT_SURVEY_CONTEXTS)[number]

export const EXIT_SURVEY_REASONS = [
  "too_expensive",
  "dont_trust",
  "not_covered",
  "seller_not_buyer",
  "just_looking",
  "other",
] as const
export type ExitSurveyReason = (typeof EXIT_SURVEY_REASONS)[number]

export const EXIT_FREE_TEXT_MAX = 500
export const EXIT_QUERY_MAX = 200

/** localStorage key: one per context, so each context is asked at most once. */
export function exitSurveySeenKey(context: ExitSurveyContext): string {
  return `riq_exit_survey_${context}`
}

type StorageLike = Pick<Storage, "getItem" | "setItem">

/** True when this visitor has already been shown (or answered) this context. */
export function exitSurveySeen(storage: StorageLike | null | undefined, context: ExitSurveyContext): boolean {
  if (!storage) return false
  try {
    return storage.getItem(exitSurveySeenKey(context)) !== null
  } catch {
    // why: private mode / blocked storage. Showing the card again is the safe
    // failure — the alternative is never asking this visitor anything.
    return false
  }
}

export function markExitSurveySeen(storage: StorageLike | null | undefined, context: ExitSurveyContext): void {
  if (!storage) return
  try {
    storage.setItem(exitSurveySeenKey(context), String(Date.now()))
  } catch {
    // why: private mode / quota. Worst case the card can show once more.
  }
}

export type ExitSurveyPayload = {
  context: ExitSurveyContext
  reason: ExitSurveyReason
  free_text?: string
  query?: string
  locale?: string
}

/** The request body. Text is trimmed and capped to what the backend accepts (422 otherwise). */
export function buildExitSurveyPayload(a: {
  context: ExitSurveyContext
  reason: ExitSurveyReason
  freeText?: string
  query?: string
  locale?: string
}): ExitSurveyPayload {
  const body: ExitSurveyPayload = { context: a.context, reason: a.reason }
  const text = (a.freeText ?? "").trim().slice(0, EXIT_FREE_TEXT_MAX)
  // cancel_intent has a comment box beside the chips, so its text is kept for
  // any reason; the other contexts only show a box after tapping "other".
  if ((a.reason === "other" || a.context === "cancel_intent") && text) body.free_text = text
  const q = (a.query ?? "").trim().slice(0, EXIT_QUERY_MAX)
  if (q) body.query = q
  if (a.locale) body.locale = a.locale
  return body
}
