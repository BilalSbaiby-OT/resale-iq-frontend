/**
 * The buy-below multiplier, in one place.
 *
 * buy_below = average asking price at departure × 0.70 — the 0.70 is 70% of the
 * typical resale price. There is NO fee factor: Vinted charges private sellers no
 * selling fee in ES / FR / DE / IT / PT (the percentage charge on Vinted's fee
 * card is the buyer's Buyer Protection fee, paid on top of the item price). Mirrors
 * engine/insight.buy_below_from_avg on the API.
 *
 * Only for DISPLAY-ONLY placeholders (a blurred, locked number). Anything a
 * visitor can act on reads the API's own buy_below — never this.
 */
export const BUY_BELOW_MULTIPLIER = 0.7

export function buyBelowFromAvg(avg: number): number {
  return avg * BUY_BELOW_MULTIPLIER
}
