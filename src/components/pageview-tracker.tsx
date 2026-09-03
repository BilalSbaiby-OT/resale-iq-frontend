"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { captureAttribution, captureLandingPath, trackEvent, trackPageview, type FunnelEvent } from "@/lib/analytics"

const PATH_EVENTS: Record<string, FunnelEvent> = {
  "/": "landing_view",
  "/register": "signup_started",
}

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
    if (typeof window !== "undefined" && window.location.hash === "#pricing") {
      trackEvent("pricing_view", pathname)
    }
  }, [pathname])

  return null
}
