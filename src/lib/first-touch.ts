/**
 * First-touch attribution for signups, trials and checkouts.
 *
 * WHY A SECOND STORE next to `riq_attribution_v2` (analytics.ts): that one
 * feeds /api/track pageviews and expires after 30 days. This one is the
 * account-level record: it is sent with register, Google sign-in start and
 * checkout creation, so every user and every Stripe session can be tied to the
 * visit that earned it — utm_*, referrer host, landing path, first-seen time.
 *
 * Rules:
 *  - FIRST touch is never overwritten for 90 days — EXCEPT a "weak" first touch
 *    (no UTM, no external referrer: a typed URL or bookmark). That carries no
 *    information, so the first later touch that DOES carry some replaces it;
 *    otherwise one direct visit would hide the TikTok link clicked a day later.
 *  - LAST touch is updated on every touch that carries information.
 *  - Stored: our own campaign slugs, the referring HOST (never the full URL),
 *    our own landing path. No click ids (gclid/ttclid) are stored or sent —
 *    they only decide source=google/cpc or tiktok/paid. No identifier of the
 *    person, no query strings, no email.
 *  - Legal basis: see ATTR_REPORT.md. Same first-party, no-cookie localStorage
 *    model the site already uses for riq_attribution_v2 / riq_landing_path.
 */
import { channelFromReferrer } from "./analytics.ts"

export const FT_KEY = "riq_ft"
export const FT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

export type TouchMethod = "utm" | "referrer" | "direct"

export type Touch = {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
  /** Referring HOST only (e.g. "chatgpt.com"). */
  referrer?: string
  /** Pathname of the page the touch landed on (no query string). */
  landing?: string
  method: TouchMethod
  /** ISO timestamp the touch was first seen. */
  ts: string
}

export type FirstTouchRecord = { v: 1; first: Touch; last: Touch }

/** Flat fields sent on register / Google start / checkout. All optional. */
export type FirstTouchFields = Partial<
  Record<
    | "ft_source" | "ft_medium" | "ft_campaign" | "ft_content" | "ft_term"
    | "ft_referrer" | "ft_landing" | "ft_at" | "ft_method"
    | "lt_source" | "lt_medium" | "lt_campaign",
    string
  >
>

const cap = (v: string | null | undefined, n = 120) => (v || "").trim().slice(0, n) || undefined

function hostOf(referrer: string | undefined, currentHost: string | undefined): string | undefined {
  if (!referrer) return undefined
  try {
    const bare = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "")
    const self = (currentHost || "").toLowerCase().replace(/^www\./, "")
    if (!bare || (self && (bare === self || bare.endsWith("." + self)))) return undefined
    return bare.slice(0, 120)
  } catch {
    // why: malformed referrer URL — no host to record, the touch is just direct.
    return undefined
  }
}

/** Build the touch for the CURRENT page load. Pure given window/document. */
export function currentTouch(now: number = Date.now()): Touch {
  const w = window
  const params = new URLSearchParams(w.location.search)
  const t: Touch = { method: "direct", ts: new Date(now).toISOString() }
  t.landing = cap(w.location.pathname, 300)

  const utm = (k: string) => cap(params.get(k))
  t.source = utm("utm_source")
  t.medium = utm("utm_medium")
  t.campaign = utm("utm_campaign")
  t.content = utm("utm_content")
  t.term = utm("utm_term")

  // Internal money-page links carry ?src=<surface>; that is navigation inside
  // our own site, never an acquisition channel. Ignored on purpose.

  // Ad click ids decide the channel when the link was auto-tagged without UTMs.
  if (!t.source) {
    if (params.get("gclid") || params.get("gbraid") || params.get("wbraid")) {
      t.source = "google"; t.medium = t.medium || "cpc"
    } else if (params.get("ttclid")) {
      t.source = "tiktok"; t.medium = t.medium || "paid"
    }
  }

  const refHost = hostOf(typeof document === "undefined" ? "" : document.referrer, w.location.hostname)
  if (refHost) t.referrer = refHost

  if (t.source) {
    t.method = "utm"
  } else if (refHost) {
    const ch = channelFromReferrer(document.referrer, w.location.hostname)
    if (ch) {
      t.source = ch.utm_source; t.medium = ch.utm_medium
      t.method = "referrer"
    }
  }
  for (const k of ["source", "medium", "campaign", "content", "term", "referrer"] as const) {
    if (t[k] === undefined) delete t[k]
  }
  return t
}

const isStrong = (t: Touch) => t.method !== "direct"

function read(storage: Storage, now: number): FirstTouchRecord | null {
  try {
    const raw = storage.getItem(FT_KEY)
    if (!raw) return null
    const r = JSON.parse(raw) as FirstTouchRecord
    if (!r || r.v !== 1 || !r.first || !r.last) return null
    const at = Date.parse(r.first.ts)
    if (!Number.isFinite(at) || now - at > FT_MAX_AGE_MS) {
      storage.removeItem(FT_KEY)
      return null
    }
    return r
  } catch {
    // why: corrupt/blocked storage — treat as no record; attribution must never throw.
    return null
  }
}

/** Call on every page load (PageviewTracker). Never throws. */
export function captureFirstTouch(now: number = Date.now()): FirstTouchRecord | null {
  if (typeof window === "undefined") return null
  try {
    const storage = window.localStorage
    const touch = currentTouch(now)
    const existing = read(storage, now)
    let next: FirstTouchRecord
    if (!existing) {
      next = { v: 1, first: touch, last: touch }
    } else if (!isStrong(existing.first) && isStrong(touch)) {
      // Weak first touch upgraded by the first informative one.
      next = { v: 1, first: touch, last: touch }
    } else if (isStrong(touch)) {
      next = { v: 1, first: existing.first, last: touch }
    } else {
      return existing // nothing new; first touch is never overwritten
    }
    storage.setItem(FT_KEY, JSON.stringify(next))
    return next
  } catch {
    // why: private mode / quota — attribution is never worth an error.
    return null
  }
}

export function getFirstTouch(now: number = Date.now()): FirstTouchRecord | null {
  if (typeof window === "undefined") return null
  try {
    return read(window.localStorage, now)
  } catch {
    // why: storage blocked — no first touch to read.
    return null
  }
}

/** Flat, length-capped fields for a request body. {} when nothing is stored. */
export function firstTouchFields(now: number = Date.now()): FirstTouchFields {
  const r = getFirstTouch(now)
  if (!r) return {}
  const f: FirstTouchFields = {
    ft_source: r.first.source, ft_medium: r.first.medium, ft_campaign: r.first.campaign,
    ft_content: r.first.content, ft_term: r.first.term, ft_referrer: r.first.referrer,
    ft_landing: r.first.landing, ft_at: r.first.ts, ft_method: r.first.method,
    lt_source: r.last.source, lt_medium: r.last.medium, lt_campaign: r.last.campaign,
  }
  for (const k of Object.keys(f) as (keyof FirstTouchFields)[]) if (!f[k]) delete f[k]
  return f
}

/** Query string (no leading "?") for GET /auth/google/login. */
export function firstTouchQuery(now: number = Date.now()): string {
  const f = firstTouchFields(now)
  return new URLSearchParams(f as Record<string, string>).toString()
}
