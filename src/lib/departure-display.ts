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
 * WORDING: each locale uses the phrase the methodology page already uses for
 * the same event — noun "watched departures" (salidas observadas, départs
 * observés, beobachtete Abgänge, uscite osservate, saídas observadas) and verb
 * "left the shelf" (dejaron el escaparate, ont quitté l'étal, haben das Regal
 * verlassen, hanno lasciato lo scaffale, saíram da prateleira). Do not add a
 * second verb for the same event.
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

/** A "N left the shelf vs M still listed" pair is only honest when the two
 *  numbers are on the same footing. The widest ratio the company has published
 *  at brand x category granularity is 409.6 : 1; beyond 500 : 1 the pair says
 *  "supply glut" about what is really the detector reading a slice of a shelf. */
export const MAX_LISTED_PER_DEPARTURE = 500

export type DepartureWindow = "7d" | "30d"

export type DepartureDisplay =
  | { kind: "number"; text: string; value: number }
  | { kind: "band"; text: string; value: null }
  | { kind: "hidden"; text: string; value: null }

interface Words {
  /** "watched departures" — the noun, for prose. */
  noun: string
  /** Column / stat labels. */
  unit7: string
  unit30: string
  /** "Fewer than 10". */
  fewer: (n: number) => string
  /** "Too few watched to report a count." — said INSTEAD of a number below the publish floor. */
  few: string
  /** Full clause: "<count> left the shelf in our sample this week". */
  line: (count: string, win: DepartureWindow, sample: boolean) => string
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
  en: {
    noun: "watched departures",
    unit7: "Left the shelf / 7d",
    unit30: "Left the shelf / 30d",
    fewer: n => `Fewer than ${n}`,
    few: "Too few watched to report a count.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} left the shelf${s ? " in our sample" : ""} this week`
        : `${c} left the shelf ${s ? "over 30 days in our sample" : "in 30 days"}`,
  },
  es: {
    noun: "salidas observadas",
    unit7: "Salidas observadas / 7d",
    unit30: "Salidas observadas / 30d",
    fewer: n => `Menos de ${n}`,
    few: "Muy pocas observadas para dar una cifra.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} dejaron el escaparate${s ? " en nuestra muestra" : ""} esta semana`
        : `${c} dejaron el escaparate ${s ? "durante 30 días en nuestra muestra" : "en 30 días"}`,
  },
  fr: {
    noun: "départs observés",
    unit7: "Départs observés / 7j",
    unit30: "Départs observés / 30j",
    fewer: n => `Moins de ${n}`,
    few: "Trop peu observés pour donner un chiffre.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} ont quitté l'étal${s ? " dans notre échantillon" : ""} cette semaine`
        : `${c} ont quitté l'étal en 30 jours${s ? " dans notre échantillon" : ""}`,
  },
  de: {
    noun: "beobachtete Abgänge",
    unit7: "Beobachtete Abgänge / 7T",
    unit30: "Beobachtete Abgänge / 30T",
    fewer: n => `Weniger als ${n}`,
    few: "Zu wenige beobachtet, um eine Zahl zu nennen.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} haben${s ? " in unserer Stichprobe" : ""} diese Woche das Regal verlassen`
        : `${c} haben ${s ? "innerhalb von 30 Tagen in unserer Stichprobe" : "in 30 Tagen"} das Regal verlassen`,
  },
  it: {
    noun: "uscite osservate",
    unit7: "Uscite osservate / 7g",
    unit30: "Uscite osservate / 30g",
    fewer: n => `Meno di ${n}`,
    few: "Troppo poche osservate per dare un numero.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} hanno lasciato lo scaffale${s ? " nel nostro campione" : ""} questa settimana`
        : `${c} hanno lasciato lo scaffale in 30 giorni${s ? " nel nostro campione" : ""}`,
  },
  pt: {
    noun: "saídas observadas",
    unit7: "Saídas observadas / 7d",
    unit30: "Saídas observadas / 30d",
    fewer: n => `Menos de ${n}`,
    few: "Poucas observadas para dar um número.",
    line: (c, w, s) =>
      w === "7d"
        ? `${c} saíram da prateleira${s ? " na nossa amostra" : ""} esta semana`
        : `${c} saíram da prateleira em 30 dias${s ? " na nossa amostra" : ""}`,
  },
}

function isCount(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0
}

/** The noun phrase for prose, e.g. "watched departures". */
export function departureNoun(locale: Locale = "en"): string {
  return WORDS[locale].noun
}

/** Column / stat label for a 7-day or 30-day departure count. */
export function departureUnit(win: DepartureWindow, locale: Locale = "en"): string {
  return win === "7d" ? WORDS[locale].unit7 : WORDS[locale].unit30
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

/**
 * "88 left the shelf this week" / "Fewer than 10 left the shelf this week" /
 * null below the publish floor (callers drop the clause rather than print a 0).
 * `sample: true` adds "in our sample" — use it in prose; row labels are compact.
 */
export function departureLabel(
  n: number | null | undefined,
  win: DepartureWindow,
  locale: Locale = "en",
  opts: { sample?: boolean } = {},
): string | null {
  const d = departureDisplay(n, locale)
  if (d.kind === "hidden") return null
  return WORDS[locale].line(d.text, win, opts.sample === true)
}

/** The unit in running text: "left the shelf / 7d" (first letter lower-cased). */
export function departureUnitInline(win: DepartureWindow, locale: Locale = "en"): string {
  const unit = departureUnit(win, locale)
  return `${unit.charAt(0).toLowerCase()}${unit.slice(1)}`
}

/** "88 left the shelf / 7d" — a pre-formatted count plus the unit, for tight rows. */
export function departureCountUnit(count: string, win: DepartureWindow, locale: Locale = "en"): string {
  return `${count} ${departureUnitInline(win, locale)}`
}

/**
 * The 30-day evidence sentence for a model admitted on 30-day departures:
 * "88 left the shelf over 30 days in our sample." / null below the publish
 * floor. Built from the NUMBER (sold_30d_evidence), never from the backend's
 * English prose, so it is translated, floored and worded like everything else.
 */
export function departureEvidenceNote(n: number | null | undefined, locale: Locale = "en"): string | null {
  const line = departureLabel(n, "30d", locale, { sample: true })
  return line ? `${line}.` : null
}

/** The sentence said INSTEAD of a number when the count is below the publish floor. */
export function departureHiddenNote(locale: Locale = "en"): string {
  return WORDS[locale].few
}

/**
 * May "N left the shelf vs M still listed" be printed? Only when the count is
 * big enough to carry a conclusion AND the two numbers are within the widest
 * ratio we have ever published. Otherwise print the departure line alone.
 */
export function departurePairPrintable(
  departures: number | null | undefined,
  listed: number | null | undefined,
): boolean {
  if (!departureSupportsConclusion(departures)) return false
  if (typeof listed !== "number" || !Number.isFinite(listed) || listed < 0) return false
  return listed <= departures * MAX_LISTED_PER_DEPARTURE
}
