"use client"

/**
 * First-party funnel events. Same /api/track endpoint as pageviews.
 * Never throws. Never blocks navigation.
 */
export type FunnelEvent =
  | "landing_view"
  | "signup_started"
  | "signup_completed"
  | "first_analysis"
  | "analysis_completed"
  | "verdict_seen"
  | "watchlist_added"
  | "deal_opened"
  | "pricing_view"
  | "checkout_started"
  | "analysis_failed"
  | "register_form_focused"
  | "register_submit_attempted"
  | "register_submit_failed"

/** Client-side reasons for register_submit_failed. Encoded into path so the
 *  existing /api/track sink stores them (TrackEvent has no extra column). */
export type RegisterFailReason =
  // "tos" lived here until the terms checkbox was removed. Dropped rather than
  // kept-for-decoding because there is nothing to decode: production has ZERO
  // register_submit_failed rows of any reason, ever — no row in `pageviews`
  // has a path containing "reason=" (read 2026-09-06). Which is also the
  // measured reason the checkbox was safe to remove: in the 4 non-bot submit
  // attempts on record, it blocked none of them.
  | "waiver"
  | "password_length"
  | "conflict"
  | "network"
  | "generic"

export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

const KEY = "riq_attribution"
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const

/**
 * FIRST TOUCH WINS.
 *
 * If someone arrives from a reel, bookmarks the site, and signs up three days
 * later from a direct visit, the reel earned that user. Overwriting on the last
 * visit would credit "direct" for everything and quietly make the whole
 * attribution loop useless — every piece of content would look worthless.
 *
 * So we store the first UTM set we ever see and never overwrite it.
 */
export function captureAttribution(): Attribution {
  if (typeof window === "undefined") return {}
  try {
    const existing = window.localStorage.getItem(KEY)
    if (existing) return JSON.parse(existing) as Attribution

    const params = new URLSearchParams(window.location.search)
    const found: Attribution = {}
    for (const f of FIELDS) {
      const v = params.get(f)
      // Cap length: these are our own campaign slugs, not user input, but the
      // column is bounded and a junk querystring should not reach the database.
      if (v) found[f] = v.slice(0, 120)
    }
    if (!Object.keys(found).length) return {}

    window.localStorage.setItem(KEY, JSON.stringify(found))
    return found
  } catch {
    // Private mode, disabled storage, quota. Attribution is never worth an error.
    return {}
  }
}

const LANDING_PATH_KEY = "riq_landing_path"

/**
 * FIRST TOUCH WINS, same rule as captureAttribution above — the first page of
 * the session is the one that earned the visit, not whatever page they
 * happen to be on when they finally register.
 */
export function captureLandingPath(): void {
  if (typeof window === "undefined") return
  try {
    if (window.localStorage.getItem(LANDING_PATH_KEY)) return
    window.localStorage.setItem(LANDING_PATH_KEY, window.location.pathname.slice(0, 300))
  } catch {
    // Private mode, disabled storage, quota. Attribution is never worth an error.
  }
}

/** The first page this visitor's session landed on, if we captured one. */
export function getLandingPath(): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return window.localStorage.getItem(LANDING_PATH_KEY) || undefined
  } catch {
    return undefined
  }
}

/** What we know about where this visitor came from. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Attribution) : {}
  } catch {
    return {}
  }
}

function send(body: Record<string, unknown>) {
  if (typeof window === "undefined") return
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never break the page */
  }
}

export function trackEvent(
  event: FunnelEvent,
  path?: string,
  extra?: { reason?: RegisterFailReason },
) {
  if (typeof window === "undefined") return
  let outPath = path || window.location.pathname || "/"
  // reason is stored on path, not as a body field: the track sink's Pydantic
  // model only persists event/path/utm_*, and extra JSON keys are dropped.
  if (extra?.reason) {
    const join = outPath.includes("?") ? "&" : "?"
    outPath = `${outPath}${join}reason=${extra.reason}`
  }
  send({
    path: outPath,
    referrer: document.referrer || "",
    event,
    ...captureAttribution(),
  })
}

export function trackPageview(path: string) {
  send({
    path,
    referrer: typeof document !== "undefined" ? document.referrer : "",
    ...captureAttribution(),
  })
}
