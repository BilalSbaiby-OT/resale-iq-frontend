"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { trackEvent, type FunnelEvent } from "@/lib/analytics"

const PATH_EVENTS: Record<string, FunnelEvent> = {
  "/": "landing_view",
  "/register": "signup_started",
}

export function PageviewTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return
    lastSent.current = pathname

    const body = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    })

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {})

    const ev = PATH_EVENTS[pathname]
    if (ev) trackEvent(ev, pathname)
    if (typeof window !== "undefined" && window.location.hash === "#pricing") {
      trackEvent("pricing_view", pathname)
    }
  }, [pathname])

  return null
}
