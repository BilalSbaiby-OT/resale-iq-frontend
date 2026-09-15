"use client"
/**
 * Client-side hook: fetches the live listings-tracked figure from the
 * market-snapshot endpoint and returns a formatted label ("5,970,000+").
 *
 * Extracted from paywall.tsx and hard-paywall-card.tsx — a single source
 * so "two places to be wrong" doesn't happen again.
 */
import { useEffect, useState } from "react"
import { floorTo10k } from "@/lib/floor-to-10k"

export function useTrackedLabel(): string {
  const [tracked, setTracked] = useState("…")
  useEffect(() => {
    let live = true
    fetch("/api/public/market-snapshot")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const n = d?.listings_tracked
        if (live && typeof n === "number" && n > 0) setTracked(`${floorTo10k(n)}+`)
      })
      .catch(() => {})
    return () => { live = false }
  }, [])
  return tracked
}
