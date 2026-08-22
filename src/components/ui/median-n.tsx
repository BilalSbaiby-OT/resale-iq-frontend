"use client"

/**
 * Median sold + sample size. A thin n cannot look like a certain price.
 * Null is an em-dash — `Math.round(null)` is 0, which is the landmine.
 */
export function MedianN({
  median,
  n,
  className,
}: {
  median: number | null | undefined
  n: number | null | undefined
  className?: string
}) {
  const price =
    typeof median === "number" && Number.isFinite(median)
      ? `€${Math.round(median)}`
      : "—"
  const sample =
    typeof n === "number" && Number.isFinite(n) && n > 0
      ? `n ${Math.round(n).toLocaleString("en-GB")}`
      : null
  return (
    <span className={className}>
      {price}
      {sample ? (
        <span
          title="Sample size of sold listings behind this median"
          style={{ color: "#5b6b8c", fontWeight: 500, fontSize: "0.72em", marginLeft: 4 }}
        >
          · {sample}
        </span>
      ) : null}
    </span>
  )
}
