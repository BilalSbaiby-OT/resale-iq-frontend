/**
 * /compare (Price across Vinted sites) — pure helpers over the
 * /api/compare/prices payload (backend origin/main 34d3a9c).
 *
 * Per site and pooled the API returns a TRUE median with p25/p75 over listings
 * de-duplicated by external_id (the same item appears on several Vinted
 * domains at the same price). Sites with too few recent listings come back
 * `insufficient: true` with null numbers: we render "not enough recent
 * listings", never a number. Founder rule: no counts in copy, so `n_unique`
 * is deliberately not exposed here. Median, not mean. Asking prices, never
 * "sold".
 *
 * Plain .ts, no imports, so node:test can load it.
 */
export type CompareSiteStats = {
  median_price?: number | null
  p25_price?: number | null
  p75_price?: number | null
  avg_price?: number | null
  insufficient?: boolean | null
  share_also_on_other_sites?: number | null
}

export type CompareFigures =
  | { kind: "ok"; median: number; low: number | null; high: number | null }
  | { kind: "insufficient" }

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)

/** Median + typical range, or "insufficient" (explicit flag OR no median to show). */
export function compareFigures(s: CompareSiteStats | null | undefined): CompareFigures {
  if (!s || s.insufficient === true) return { kind: "insufficient" }
  // Pre-34d3a9c payloads had no p25/p75/insufficient: fall back to avg only
  // when there is no median at all.
  const median = isNum(s.median_price) && s.median_price > 0 ? s.median_price : isNum(s.avg_price) && s.avg_price > 0 && s.insufficient === undefined ? s.avg_price : null
  if (median === null) return { kind: "insufficient" }
  const low = isNum(s.p25_price) ? s.p25_price : null
  const high = isNum(s.p75_price) ? s.p75_price : null
  // A range that collapses or inverts says nothing: show the median alone.
  if (low !== null && high !== null && low <= high) return { kind: "ok", median, low, high }
  return { kind: "ok", median, low: null, high: null }
}

/** Whole percent (0-100) of listings also seen on another site, or null when absent/invalid. */
export function alsoOnOtherSitesPct(share: number | null | undefined): number | null {
  if (!isNum(share) || share < 0 || share > 1) return null
  return Math.round(share * 100)
}
