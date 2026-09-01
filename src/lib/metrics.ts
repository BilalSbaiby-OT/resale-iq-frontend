/**
 * Customer-facing metric names. Definitions match demand-intel/engine/metrics.py.
 * Do not invent "median" / "LIVE" / "profit" labels on a screen that is showing
 * a mean, a snapshot, or a constructed 30% gap.
 */
export const METRIC = {
  avgSold: "Avg at exit",
  medianSold: "Median at exit",
  buyBelow: "Buy-below",
  sellThrough: "Sell-through",
  targetNet: "Target net",
  listingsTracked: "Listings tracked",
  confidence: "Confidence",
} as const
