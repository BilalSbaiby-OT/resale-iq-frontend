/**
 * First-check seed for a brand-new account.
 *
 * Founder rule 2026-09-29: signup and login land on /dashboard, never
 * /verdict. The dashboard chips concatenate brand + model, so the live
 * buy-list row "Fred Perry" / "Fred Perry Polo" becomes the query
 * "Fred Perry Fred Perry Polo" — not a public sample, so the click can
 * miss the free verdict. This module picks a query that is both on the
 * live public buy-list and in FREE_MODELS (always a priced verdict),
 * and stashes it for the dashboard one-button seed.
 *
 * Brand-level snapshot volume is not used. A hot brand must not choose
 * the model.
 */

import { itemDisplayName } from "./item-display-name.ts"
import { FREE_MODELS } from "./working-models.ts"

export const FIRST_CHECK_SEED_KEY = "riq_first_check_seed"
export const SIGNUP_PENDING_KEY = "riq_signup_pending"

export type BuyListSeedRow = {
  brand?: string | null
  model?: string | null
  locked?: boolean
}

const FREE_SET = new Map<string, string>(
  FREE_MODELS.map(q => [q.toLowerCase(), q]),
)

/**
 * First unlocked buy-list row whose display name is a public free sample.
 * Locked rows are skipped — they have no price on the public list.
 * Anything not in FREE_MODELS is skipped (Stone Island Hoodie is the
 * paywall probe; it must not be a new account's only guaranteed answer).
 * No match → FREE_MODELS[0], which is itself a live priced sample.
 */
export function pickFirstCheckQuery(items: readonly BuyListSeedRow[]): string {
  for (const row of items) {
    if (row.locked === true) continue
    const name = itemDisplayName(row.brand, row.model)
    const canonical = FREE_SET.get(name.toLowerCase())
    if (canonical) return canonical
  }
  return FREE_MODELS[0]
}

export async function fetchFirstCheckQuery(
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  try {
    const signal = typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(2500)
      : undefined
    const r = await fetchImpl("/api/public/buy-list?limit=8", { signal })
    if (!r.ok) return FREE_MODELS[0]
    const d = await r.json() as { items?: BuyListSeedRow[]; results?: BuyListSeedRow[] }
    const items = d.items ?? d.results ?? []
    return pickFirstCheckQuery(items)
  } catch {
    // why: a snapshot miss must not block account creation. FREE_MODELS[0]
    // is the documented priced public sample, not an invented query.
    return FREE_MODELS[0]
  }
}

// C(tony)SeedLocalStorage: seed moved to localStorage so verified users who
// close and reopen the browser still see the first-run CTA on /dashboard
// (sessionStorage is per-tab and per-session — a user who verifies, closes
// their laptop, returns the next day is still JWT-authed but their seed was
// gone, leaving 11/25 verified accounts with 0 verdicts and a blank dashboard).
// TTL extended from 30min to 24h for the same reason: verifying at 10pm and
// returning at 8am was also a miss. The read/write API is unchanged — callers
// (register-form, verify-email, login-form, AppShell) need no update.
const SEED_TTL_MS = 24 * 60 * 60 * 1000 // 24h

export function writeFirstCheckSeed(query: string): void {
  try {
    localStorage.setItem(FIRST_CHECK_SEED_KEY, JSON.stringify({ q: query, ts: Date.now() }))
  } catch {
    // why: private mode / storage quota. Signup still lands on /dashboard.
  }
}

export function readFirstCheckSeed(): string | null {
  try {
    const raw = localStorage.getItem(FIRST_CHECK_SEED_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { q?: string; ts?: number }
    if (!parsed.q || typeof parsed.q !== "string") return null
    if (parsed.ts && Date.now() - parsed.ts > SEED_TTL_MS) {
      localStorage.removeItem(FIRST_CHECK_SEED_KEY)
      return null
    }
    const canonical = FREE_SET.get(parsed.q.toLowerCase())
    return canonical ?? null
  } catch {
    // why: a corrupt seed must not throw on the dashboard. Hide the card.
    return null
  }
}

export function clearFirstCheckSeed(): void {
  try { localStorage.removeItem(FIRST_CHECK_SEED_KEY) } catch { /* why: private mode — nothing to clear */ }
}

export function markSignupPending(): void {
  try { sessionStorage.setItem(SIGNUP_PENDING_KEY, "1") } catch { /* why: private mode — Google return just lands on /dashboard */ }
}

export function consumeSignupPending(): boolean {
  try {
    const v = sessionStorage.getItem(SIGNUP_PENDING_KEY)
    sessionStorage.removeItem(SIGNUP_PENDING_KEY)
    return v === "1"
  } catch {
    // why: private mode cannot tell a new Google signup from a return visit. Do not seed.
    return false
  }
}
