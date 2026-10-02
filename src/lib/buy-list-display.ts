/** Shared buy-list row labels. One place so the blog strip and the SSR teaser
 *  cannot drift into a second price formula or a second unlock sentence. */

export const BUY_LIST_UNLOCK_LABEL = "Unlock the rest — €19/mo"

import type { Locale } from "./i18n"
import { departureLabel } from "./departure-display.ts"

/** Plain signal words for buy-list rows: entry = max price to pay, target =
 *  typical resale price. The departure count is worded and floored by
 *  departure-display.ts — one lexicon, one display floor. */
const ROW_WORDS: Record<Locale, { entry: string; target: string }> = {
  en: { entry: "entry ≤", target: "target ~" },
  fr: { entry: "entrée ≤", target: "cible ~" },
  es: { entry: "entrada ≤", target: "objetivo ~" },
  de: { entry: "Einstieg ≤", target: "Ziel ~" },
  it: { entry: "ingresso ≤", target: "obiettivo ~" },
  pt: { entry: "entrada ≤", target: "alvo ~" },
}

/** Real stored ceiling, rounded to the euro the row prints. Null stays null —
 *  never avg × 0.665. A missing number is not a price. */
export function buyBelowLabel(buyBelow: number | null | undefined, locale: Locale = "en"): string | null {
  if (typeof buyBelow !== "number" || !Number.isFinite(buyBelow)) return null
  return `${ROW_WORDS[locale].entry} €${Math.round(buyBelow)}`
}

/** Typical resale price, no stray space after the tilde. */
export function targetLabel(avg: number, locale: Locale = "en"): string {
  return `${ROW_WORDS[locale].target}€${Math.round(avg)}`
}

/** "88 left the shelf this week" / "Fewer than 10 left the shelf this week" / null under 5. */
export function leftShelfWeekLabel(n: number | null | undefined, locale: Locale = "en"): string | null {
  return departureLabel(n, "7d", locale)
}

/** Same, over 30 days. A list must use ONE window: never print this beside a weekly label. */
export function leftShelf30Label(n: number | null | undefined, locale: Locale = "en"): string | null {
  return departureLabel(n, "30d", locale)
}
