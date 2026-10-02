"use client"
import { useEffect, useState } from "react"
import { getVariant, type AbExperiment } from "@/lib/ab"
import { trackEvent } from "@/lib/analytics"

/** "A" on the server and first paint; the sticky assignment after mount. Logs one exposure per browser+experiment. */
export function useAbVariant(exp: AbExperiment): "A" | "B" {
  const [v, setV] = useState<"A" | "B">("A")
  useEffect(() => {
    const assigned = getVariant(exp)
    setV(assigned)
    try {
      const k = `riq_ab_seen_${exp}`
      if (!window.localStorage.getItem(k)) {
        window.localStorage.setItem(k, "1")
        trackEvent("ab_exposure")
      }
    } catch { /* storage blocked: skip exposure, assignment stays A */ }
  }, [exp])
  return v
}
