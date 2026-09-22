/**
 * Referral code capture and retrieval.
 *
 * Any page hit with ?ref=CODE stores the code in a first-party cookie
 * (riq_ref, 60-day window) so it survives navigation to /pricing and into
 * Stripe checkout.
 *
 * Design rules:
 * - Never clobbers the existing visitor-identity cookie (riq_vid) — this
 *   file does not touch it.
 * - Never throws — analytics and checkout must never fail because of this.
 * - First touch wins for 60 days; a new ?ref= overwrites (a visitor who
 *   clicked two affiliate links in the same session should credit the last
 *   one they clicked, not the first).
 * - Cookie is SameSite=Lax, no HttpOnly (must be readable in JS), Secure on
 *   HTTPS. Path=/ so it is visible everywhere on the domain.
 * - ref codes are alphanumeric+hyphen, max 64 chars; anything else is
 *   silently dropped.
 */

export const REF_COOKIE = "riq_ref"
/** 60 days in seconds */
export const REF_COOKIE_MAX_AGE = 60 * 24 * 60 * 60

const REF_CODE_RE = /^[a-zA-Z0-9_-]{1,64}$/

/** Exported for unit tests. Returns true iff s is a valid affiliate ref code. */
export function isValidCode(s: string | null | undefined): s is string {
  return !!s && REF_CODE_RE.test(s)
}

/**
 * Read ?ref= from the current URL and write it to the riq_ref cookie.
 * Call on every page load (PageviewTracker already runs on every pathname).
 * Safe to call SSR (returns early when window is undefined).
 */
export function captureReferral(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return
  try {
    const ref = new URLSearchParams(window.location.search).get("ref")
    if (!isValidCode(ref)) return
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = [
      `${REF_COOKIE}=${encodeURIComponent(ref)}`,
      `Max-Age=${REF_COOKIE_MAX_AGE}`,
      "Path=/",
      "SameSite=Lax",
      secure,
    ]
      .filter(Boolean)
      .join("; ")
  } catch {
    // why: Private mode or cookie policy blocks document.cookie — referral
    // capture is never worth surfacing as an error to the user.
  }
}

/**
 * Read the stored referral code from the riq_ref cookie.
 * Returns null when no valid code is present.
 * Safe to call SSR (returns null).
 */
export function readReferral(): string | null {
  if (typeof document === "undefined") return null
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${REF_COOKIE}=([^;]*)`)
    )
    if (!match) return null
    const decoded = decodeURIComponent(match[1])
    return isValidCode(decoded) ? decoded : null
  } catch {
    // why: document.cookie parsing can throw in hardened browsers (e.g.
    // total cookie protection); returning null is the safe fallback.
    return null
  }
}
