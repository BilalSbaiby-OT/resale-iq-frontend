/**
 * ONE place that decides how a watched-departure count is PRINTED, and what it
 * is called, in every language.
 *
 * WHAT THE NUMBER IS
 * `sold_7d` / `sold_30d` in the warehouse are listings our shelf detector
 * watched go from active to gone. They are NOT confirmed sales: a departure can
 * be a delisting, an edit, a reservation or a relist, and the detector only
 * re-reads a top slice of each shelf, so the count is a lower bound taken from a
 * sample. Founder decision 2026-10-02: they are never called "sold" or "sales";
 * they are listings that left the shelf in our tracked sample.
 *
 * THE DISPLAY FLOOR (founder decision, applied once, here)
 *   n < 5        hidden  — "—", never a zero, never a sentence built on it
 *   5 <= n < 10  band    — "Fewer than 10"
 *   n >= 10      digits
 * Why: at n = 5 a Poisson count is +-45%, and on this board 44% of the
 * brand x category rows sit below 5. Printing "1" under a "Left the shelf"
 * header reads as "this category does not move", which the data cannot say.
 *
 * Client-safe on purpose (no node:fs, no market-numbers import): free-checker,
 * home-buy-list and the dashboard all render in the browser.
 *
 * WHERE IT IS USED (founder decision 2026-10-02): brand-level and category-level
 * aggregates only (/data, /flip index, category totals, the weekly brief). No
 * per-product and no per-brand-x-category surface prints a departure count; the
 * label / unit / sample-sentence helpers that fed those surfaces are gone.
 */
import type { Locale } from "./i18n"

/** Below this a count is not published at all. Mirrors the backend's brand-level
 *  publish floor (`publish_floor_sold_7d`); the backend does not apply it to
 *  brand x category rows, so the frontend does. */
export const DEPARTURE_PUBLISH_FLOOR = 5

/** From here the digits are printed. Between the two floors we print the bound. */
export const DEPARTURE_DISPLAY_FLOOR = 10

/** Below this no sentence may CONCLUDE anything from the count ("moves serious
 *  volume", "real demand", a ranking by average price). Same 30 as the engine's
 *  MIN_STR_OBSERVED and the company's n >= 30 rule for published findings. */
export const DEPARTURE_CONCLUSION_FLOOR = 30

export type DepartureDisplay =
  | { kind: "number"; text: string; value: number }
  | { kind: "band"; text: string; value: null }
  | { kind: "hidden"; text: string; value: null }

interface Words {
  /** "Fewer than 10". */
  fewer: (n: number) => string
}

const NUMBER_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
}

const WORDS: Record<Locale, Words> = {
  en: { fewer: n => `Fewer than ${n}` },
  es: { fewer: n => `Menos de ${n}` },
  fr: { fewer: n => `Moins de ${n}` },
  de: { fewer: n => `Weniger als ${n}` },
  it: { fewer: n => `Meno di ${n}` },
  pt: { fewer: n => `Menos de ${n}` },
}

function isCount(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0
}

/**
 * What to print in a table cell or stat: digits, a bound, or an em-dash.
 * `compact` prints the bound as "<10" for tight rows ("<10/wk"); the default is
 * the localised sentence form ("Fewer than 10").
 */
export function departureDisplay(
  n: number | null | undefined,
  locale: Locale = "en",
  opts: { compact?: boolean } = {},
): DepartureDisplay {
  if (!isCount(n) || n < DEPARTURE_PUBLISH_FLOOR) return { kind: "hidden", text: "—", value: null }
  if (n < DEPARTURE_DISPLAY_FLOOR) {
    const text = opts.compact ? `<${DEPARTURE_DISPLAY_FLOOR}` : WORDS[locale].fewer(DEPARTURE_DISPLAY_FLOOR)
    return { kind: "band", text, value: null }
  }
  return { kind: "number", text: n.toLocaleString(NUMBER_LOCALE[locale]), value: n }
}

/** True when the count may be PRINTED as digits (>= the display floor). */
export function departureIsPrintable(n: number | null | undefined): n is number {
  return isCount(n) && n >= DEPARTURE_DISPLAY_FLOOR
}

/** True when a sentence may draw a conclusion from the count (>= 30). */
export function departureSupportsConclusion(n: number | null | undefined): n is number {
  return isCount(n) && n >= DEPARTURE_CONCLUSION_FLOOR
}
