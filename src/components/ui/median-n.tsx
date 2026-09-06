"use client"

import { METRIC } from "@/lib/metrics"
import { useLocale } from "@/components/i18n/locale-provider"
import { appCopy } from "@/lib/app-copy"
import { formatCount } from "@/lib/verdict-words"

/**
 * Sold price + sample size. A thin n cannot look like a certain price.
 * Null is an em-dash — `Math.round(null)` is 0, which is the landmine.
 *
 * Default label is Avg sold: the warehouse stores a mean. Pass kind="median"
 * only when the value is actually a median.
 *
 * TWO ENGLISH LEAKS FIXED. The `title` tooltip ("Sample size — watched
 * departures behind this mean") was an English literal on a component that
 * renders on every authenticated surface, and the count was formatted with a
 * hardcoded `toLocaleString("en-GB")` — so a Spanish card showed "n 22,607"
 * where Spanish writes "n 22.607". Both now follow the reader's locale.
 */
export function SoldSamplePrice({
  price,
  n,
  kind = "avg",
  nKind = "watched",
  className,
}: {
  price: number | null | undefined
  n: number | null | undefined
  kind?: "avg" | "median"
  /**
   * WHICH COUNT `n` IS. Callers pass two genuinely different quantities into
   * this slot, and the tooltip used to call both of them "watched departures":
   *
   *   "watched"    — sold_7d, every watched departure in the window. The deal
   *                  board and the watchlist pass this.
   *   "comparable" — comparable_n, the fenced subset of clean comps the price
   *                  and the confidence band are computed from. /verdict passes
   *                  this, inches from a sample sentence quoting sold_7d:
   *                  Adidas Samba renders "43 left the shelf" and "n 20" on one
   *                  card. Two true numbers — only the shared label made them
   *                  look like one number contradicting itself.
   */
  nKind?: "watched" | "comparable"
  className?: string
}) {
  const locale = useLocale()
  const tip = appCopy[locale].tip
  const shown =
    typeof price === "number" && Number.isFinite(price)
      ? `€${Math.round(price)}`
      : "—"
  const sample =
    typeof n === "number" && Number.isFinite(n) && n > 0
      ? `n ${formatCount(Math.round(n), locale)}`
      : null
  const title = kind === "median"
    ? (nKind === "comparable" ? tip.sampleMedianComparable : tip.sampleMedianWatched)
    : (nKind === "comparable" ? tip.sampleAvgComparable : tip.sampleAvgWatched)
  return (
    <span className={className} title={title}>
      {shown}
      {sample ? (
        <span
          style={{ color: "var(--color-text-muted)", fontWeight: 500, fontSize: "0.72em", marginLeft: 4 }}
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
  nKind?: "watched" | "comparable"
  className?: string
}) {
  return (
    <SoldSamplePrice
      price={props.median}
      n={props.n}
      kind="avg"
      nKind={props.nKind}
      className={props.className}
    />
  )
}

export const AVG_SOLD_LABEL = METRIC.avgSold
