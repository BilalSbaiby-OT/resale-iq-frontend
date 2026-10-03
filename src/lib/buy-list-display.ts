/** Shared buy-list row labels. One place so the blog strip and the SSR teaser
 *  cannot drift into a second price formula or a second unlock sentence.
 *  Founder decision 2026-10-02: a buy-list row carries NO departure count. It
 *  leads with the price answer (entry = max price to pay, target = resale price). */

import type { Locale } from "./i18n"
import { N_ } from "./ui-translate.ts"

/** English source; render with tx(BUY_LIST_UNLOCK_LABEL). */
export const BUY_LIST_UNLOCK_LABEL = N_("Unlock the rest — €19/mo")

/** Plain signal words for buy-list rows: entry = max price to pay, target =
 *  typical resale price. */
const ROW_WORDS: Record<Locale, { entry: string; target: string }> = {
  en: { entry: "entry ≤", target: "target ~" },
  fr: { entry: "entrée ≤", target: "cible ~" },
  es: { entry: "entrada ≤", target: "objetivo ~" },
  de: { entry: "Einstieg ≤", target: "Ziel ~" },
  it: { entry: "ingresso ≤", target: "obiettivo ~" },
  pt: { entry: "entrada ≤", target: "alvo ~" },
}

/** Real stored ceiling, rounded to the euro the row prints. Null stays null —
 *  never avg × 0.70. A missing number is not a price. */
export function buyBelowLabel(buyBelow: number | null | undefined, locale: Locale = "en"): string | null {
  if (typeof buyBelow !== "number" || !Number.isFinite(buyBelow)) return null
  return `${ROW_WORDS[locale].entry} €${Math.round(buyBelow)}`
}

/** Typical resale price, no stray space after the tilde. */
export function targetLabel(avg: number, locale: Locale = "en"): string {
  return `${ROW_WORDS[locale].target}€${Math.round(avg)}`
}
