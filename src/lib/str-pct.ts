/**
 * THE ONE SELL-THROUGH FORMATTER. Every percentage labelled "sell-through"
 * on any surface goes through `formatStrPct` and nowhere else.
 *
 * WHY THIS EXISTS
 * A real, non-zero sell-through rate was rendering as "0%".
 *
 * Sell-through is a share of the universe we watched — watched departures /
 * (watched departures + still listed) — so on a model with a deep supply side
 * it is legitimately a fraction of one percent. Measured against production
 * on 2026-09-05, 4 of the 24 models with a publishable rate sit under 0.5%:
 *
 *   Adidas Samba      43 sold / 22,607 active = 0.1898%
 *   Nike Air Force 1  69 sold / 18,293 active = 0.3758%
 *   New Balance 9060 137 sold / 35,358 active = 0.3860%
 *   Levi's 501        47 sold / 45,238 active = 0.1038%
 *
 * `Math.round`/`toFixed(0)` turns every one of those into "0%", which tells a
 * reseller there is NO demand for an item that had 43 departures in a week.
 * That is the opposite of what the data says, on the numbers our own catalogue
 * most often produces — not an edge case.
 *
 * THE RULE, and why it is honest at both ends:
 *  - Below the precision we actually have (0.1pp), print the BOUND, not a
 *    rounded digit: "<0.1%". True for 0.09 and true for 0.0001, and it never
 *    claims the rate is zero.
 *  - At or above it, one decimal — the same precision the backend computes
 *    (engine/sufficiency.py `honest_sell_through` rounds to 1dp). Printing
 *    more would invent precision; printing less re-creates the bug.
 *  - Whole numbers lose the empty decimal: "1%", "100%", not "1.0%".
 *
 * A published rate is NEVER an observed zero. The backend only publishes one
 * when watched sales >= MIN_STR_OBSERVED (30) and active listings > 0
 * (engine/sufficiency.py `customer_str_pct`), so the true share is strictly
 * positive and a 0 arriving here is rounding, not an absence of demand.
 * "<0.1%" is true of it either way, which is why this rule needs no
 * special case for it.
 *
 * NULL IS NOT ZERO. A withheld or unmeasured rate returns `null` and callers
 * render the gated / not-measured state (src/lib/locked-fields.ts) — never a
 * "0%", never a dash pretending to be a number.
 */

/** Smallest share we have the precision to state as a digit, in percentage points. */
export const STR_PCT_FLOOR = 0.1

/**
 * A sell-through rate (already in percentage points: 0.19 means 0.19%) as the
 * string to put on screen, or `null` when there is no rate to show.
 */
export function formatStrPct(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  if (value < STR_PCT_FLOOR) return `<${STR_PCT_FLOOR}%`
  const oneDecimal = Math.round(value * 10) / 10
  return Number.isInteger(oneDecimal) ? `${oneDecimal}%` : `${oneDecimal.toFixed(1)}%`
}

/**
 * Re-run a backend sell-through STRING ("0%", "0.2%", already "<0.1%")
 * through `formatStrPct`. Dashboard `/verdict` used to print the raw API
 * string; if the backend ever rounded a Samba-class rate to "0%" that
 * surface would show the same lie the public checker already refuses.
 *
 * Unparseable copy (already a bound, or a sentence) is passed through —
 * inventing a number from it would be worse than showing what arrived.
 */
export function formatStrPctString(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  const m = trimmed.match(/^(-?[\d.]+)\s*%$/)
  if (!m) return trimmed
  return formatStrPct(Number(m[1])) ?? trimmed
}
