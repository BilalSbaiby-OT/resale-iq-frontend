/** Shared buy-list row labels. One place so the blog strip and the SSR teaser
 *  cannot drift into a second price formula or a second unlock sentence. */

export const BUY_LIST_UNLOCK_LABEL = "Unlock the rest — €19/mo"

import type { Locale } from "./i18n"

/** Plain signal words for buy-list rows: entry = max price to pay, target =
 *  typical resale price, sold = watched departures this week. */
const ROW_WORDS: Record<Locale, { entry: string; target: string; sold: (n: string) => string; sold30: (n: string) => string }> = {
  en: { entry: "entry ≤", target: "target ~", sold: n => `sold ${n} this week`, sold30: n => `${n} sold/30 days` },
  fr: { entry: "entrée ≤", target: "cible ~", sold: n => `${n} vendus cette semaine`, sold30: n => `${n} vendus/30 j` },
  es: { entry: "entrada ≤", target: "objetivo ~", sold: n => `${n} vendidos esta semana`, sold30: n => `${n} vendidos/30 d` },
  de: { entry: "Einstieg ≤", target: "Ziel ~", sold: n => `${n} diese Woche verkauft`, sold30: n => `${n} verkauft/30 T.` },
  it: { entry: "ingresso ≤", target: "obiettivo ~", sold: n => `${n} venduti questa settimana`, sold30: n => `${n} venduti/30 g` },
  pt: { entry: "entrada ≤", target: "alvo ~", sold: n => `${n} vendidos esta semana`, sold30: n => `${n} vendidos/30 d` },
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

export function soldThisWeekLabel(n: number, locale: Locale = "en"): string {
  return ROW_WORDS[locale].sold(n.toLocaleString("en-GB"))
}

export function sold30Label(n: number, locale: Locale = "en"): string {
  return ROW_WORDS[locale].sold30(n.toLocaleString("en-GB"))
}
