/**
 * Google OAuth2 utilities for the frontend.
 *
 * The button and hook call GET /auth/google/status first. When the backend
 * returns { enabled: false } (no credentials configured), the button is
 * HIDDEN — it never renders a broken or error-producing element.
 *
 * The happy-path flow:
 *   1. Browser navigates to /auth/google/login (backend redirects to Google)
 *   2. Google redirects back to /auth/google/callback (backend handles it)
 *   3. Backend redirects to /login?google_token=<JWT>
 *   4. The /login page reads the token, stores it in localStorage as di_jwt,
 *      and routes the user to /verdict — identical to password login.
 *
 * Error-path (google_error=<reason> query param on /login):
 *   access_denied    — user declined
 *   invalid_state    — possible CSRF attempt; user just retries
 *   token_invalid    — ID token verification failed (Google internal error)
 *   rate_limited     — too many accounts from this IP
 *   account_disabled — the existing account is banned
 *   not_configured   — creds were removed mid-session (shouldn't happen)
 *   server_error     — unexpected backend error
 */

export type GoogleOAuthStatus = { enabled: boolean }

/** Cache the status for the page lifetime so the button does not flicker
 *  on re-renders (the API call is a single fast read with no auth). */
let _statusCache: GoogleOAuthStatus | null = null

export async function getGoogleOAuthStatus(): Promise<GoogleOAuthStatus> {
  if (_statusCache !== null) return _statusCache
  try {
    const res = await fetch("/auth/google/status", { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    _statusCache = (await res.json()) as GoogleOAuthStatus
    return _statusCache
  } catch {
    // why: on any fetch failure (network error, 5xx, JSON parse) we fall back
    // to {enabled: false} so the Google button is simply hidden rather than
    // crashing or showing a broken state. This is a best-effort status probe,
    // not a security gate — the real guard is the backend 503 on /auth/google/login.
    _statusCache = { enabled: false }
    return _statusCache
  }
}

/** Map the google_error query param to a human-readable sentence. */
export function googleErrorMessage(code: string | null): string | null {
  if (!code) return null
  const map: Record<string, string> = {
    access_denied:    "Google sign-in was cancelled.",
    invalid_state:    "Session expired — please try again.",
    token_invalid:    "Google could not verify your identity. Please try again.",
    rate_limited:     "Too many sign-up attempts. Try again in a few minutes.",
    account_disabled: "This account has been disabled.",
    not_configured:   "Google Sign-In is not available right now.",
    server_error:     "Something went wrong. Please try again.",
    no_code:          "Google sign-in was cancelled.",
    missing_claims:   "Google did not return your email. Try a different account.",
    email_not_verified: "Your Google account email is not verified.",
    account_conflict:   "Another Google account is already linked to this email.",
  }
  return map[code] ?? "Google sign-in failed. Please try again."
}
