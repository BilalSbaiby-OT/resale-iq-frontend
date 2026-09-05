"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { captureAttribution, captureLandingPath, trackEvent, trackPageview, type FunnelEvent } from "@/lib/analytics"

const PATH_EVENTS: Record<string, FunnelEvent> = {
  "/": "landing_view",
  "/register": "signup_started",
}

/** "/pricing" and its five locale siblings ("/es/pricing", ...). The whole
 *  reason /pricing stopped being a "/#pricing" redirect is that a fragment is
 *  not countable — it only reached this file when the browser preserved the
 *  hash, and it shared its pageview with landing_view. A path fires once per
 *  visit, from an ad or a shared link, with nothing to preserve. */
const PRICING_PATH = /^\/(?:[a-z]{2}\/)?pricing\/?$/

export function PageviewTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    // usePathname() returns the path WITHOUT the query string, so every
    // ?utm_content=... we put on a tracked link used to be dropped before it
    // ever left the browser. Read the real URL instead.
    const search = typeof window !== "undefined" ? window.location.search : ""
    const full = pathname + search
    if (lastSent.current === full) return
    lastSent.current = full

    // Store the campaign that brought them here before anything else runs, so
    // it survives even if this is the only page they ever load.
    captureAttribution()
    captureLandingPath()

    trackPageview(full)

    const ev = PATH_EVENTS[pathname]
    if (ev) trackEvent(ev, pathname)
    // The anchor still counts — the landing page keeps its embedded pricing
    // strip and people still reach it by clicking a "#pricing" CTA — but the
    // route is now the primary, reliable witness.
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    if (PRICING_PATH.test(pathname) || hash === "#pricing") {
      trackEvent("pricing_view", pathname)
    }
  }, [pathname])

  return null
}
