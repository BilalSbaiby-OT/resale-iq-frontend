"use client"
/**
 * Client-side hook: fetches the live listing-records figure from the
 * market-snapshot endpoint and returns the headline label ("14M+").
 * Same source (total_listing_records) and same format (floorToMillion) as the
 * server helper listingRecordsHeadline() in stats.ts, so the seeded first paint
 * and the refreshed value can never disagree.
 *
 * Extracted from paywall.tsx and hard-paywall-card.tsx — a single source
 * so "two places to be wrong" doesn't happen again.
 *
 * `seed` is the SSR-fetched value passed down from the server component.
 * When provided it is used as the initial state so the first paint shows a
 * real number instead of "…". The client-side fetch still runs to keep the
 * label fresh across navigation without a hard reload.
 */
import { useEffect, useState } from "react"
import { floorToMillion } from "@/lib/floor-to-10k"

export function useTrackedLabel(seed?: string): string {
  const [tracked, setTracked] = useState(seed ?? "…")
  useEffect(() => {
    let live = true
    fetch("/api/public/market-snapshot")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const n = d?.total_listing_records
        if (live && typeof n === "number" && n > 0) setTracked(floorToMillion(n))
      })
      .catch(() => {})
    return () => { live = false }
  }, [])
  return tracked
}
