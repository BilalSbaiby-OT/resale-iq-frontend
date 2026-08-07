"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * First-party pageview tracking.
 *
 * Nothing measured site traffic before this, so there was no way to tell which
 * of the ~150 SEO pages earned anything. This posts to our own backend instead
 * of loading a third-party tracker: no external script, no cookie, no consent
 * banner, and the data stays in our database.
 *
 * Deliberately silent — a failed beacon must never surface to a visitor or
 * block navigation.
 */
export function PageviewTracker() {
  const pathname = usePathname()
  // React runs effects twice in dev StrictMode, and a repeated pathname would
  // otherwise double-count. Track the last path actually sent.
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return
    lastSent.current = pathname

    const body = JSON.stringify({
      path: pathname,
      // document.referrer is the previous page; the backend keeps only the host.
      referrer: typeof document !== "undefined" ? document.referrer : "",
    })

    // keepalive lets the request survive the page being navigated away from.
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the page */
    })
  }, [pathname])

  return null
}
