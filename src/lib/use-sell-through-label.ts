"use client";
/**
 * Client-side hook: fetches the live sell-through (watched departures) figure from the
 * market-snapshot endpoint and returns a formatted label ("877/wk").
 * 
 * Similar to useTrackedLabel but for weekly watched departures across all brands.
 */
import { useEffect, useState } from "react"
import { formatSellThrough } from "@/lib/format-sell-through"

export function useSellThroughLabel(): string {
  const [sellThrough, setSellThrough] = useState("—")
  useEffect(() => {
    let live = true
    fetch("/api/public/market-snapshot")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        // Sum up all sold_7d values across brands to get total weekly watched departures
        const total = d?.brands?.reduce((sum: number, brand: { sold_7d: number | null }) => sum + (brand?.sold_7d || 0), 0) || 0
        if (live && typeof total === "number" && total > 0) {
          setSellThrough(formatSellThrough(total))
        }
      })
      .catch(() => {})
    return () => { live = false }
  }, [])
  return sellThrough
}