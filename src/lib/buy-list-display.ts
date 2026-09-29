/** Shared buy-list row labels. One place so the blog strip and the SSR teaser
 *  cannot drift into a second price formula or a second unlock sentence. */

export const BUY_LIST_UNLOCK_LABEL = "Unlock the rest — €19/mo"

/** Real stored ceiling, rounded to the euro the row prints. Null stays null —
 *  never avg × 0.665. A missing number is not a price. */
export function buyBelowLabel(buyBelow: number | null | undefined): string | null {
  if (typeof buyBelow !== "number" || !Number.isFinite(buyBelow)) return null
  return `buy below €${Math.round(buyBelow)}`
}
