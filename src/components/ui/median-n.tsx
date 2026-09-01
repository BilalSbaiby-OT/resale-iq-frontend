"use client"

import { METRIC } from "@/lib/metrics"

/**
 * Sold price + sample size. A thin n cannot look like a certain price.
 * Null is an em-dash — `Math.round(null)` is 0, which is the landmine.
 *
 * Default label is Avg sold: the warehouse stores a mean. Pass kind="median"
 * only when the value is actually a median.
 */
export function SoldSamplePrice({
  price,
  n,
  kind = "avg",
  className,
}: {
  price: number | null | undefined
  n: number | null | undefined
  kind?: "avg" | "median"
  className?: string
}) {
  const shown =
    typeof price === "number" && Number.isFinite(price)
      ? `€${Math.round(price)}`
      : "—"
  const sample =
    typeof n === "number" && Number.isFinite(n) && n > 0
      ? `n ${Math.round(n).toLocaleString("en-GB")}`
      : null
  const title = kind === "median"
    ? "Sample size of watched departures behind this median"
    : "Sample size of watched departures behind this mean"
  return (
    <span className={className} title={title}>
      {shown}
      {sample ? (
        <span
          style={{ color: "#5b6b8c", fontWeight: 500, fontSize: "0.72em", marginLeft: 4 }}
        >
          · {sample}
        </span>
      ) : null}
    </span>
  )
}

/** @deprecated Use SoldSamplePrice. Kept so older imports still typecheck during the rename. */
export function MedianN(props: {
  median: number | null | undefined
  n: number | null | undefined
  className?: string
}) {
  return <SoldSamplePrice price={props.median} n={props.n} kind="avg" className={props.className} />
}

export const AVG_SOLD_LABEL = METRIC.avgSold
