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

export function trackEvent(event: FunnelEvent, path?: string) {
  if (typeof window === "undefined") return
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: path || window.location.pathname || "/",
        referrer: document.referrer || "",
        event,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* analytics must never break the page */
  }
}
