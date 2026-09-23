import type { Locale } from "./i18n"

/**
 * The words a stranger reads off a verdict card, in their own language.
 *
 * WHY THIS FILE EXISTS. Live on production /es, 2026-09-05, mobile 390px, cold
 * homepage: "BUY", "Sneakers · Confianza MEDIUM", "Only 11 watched departures".
 * Three English orphans inside an otherwise fully-translated Spanish page. Each
 * came from a different place and each was deliberate at the time:
 *
 *  - the VERDICT WORD: free-checker.tsx fell through to `res.verdict`, the raw
 *    API enum. verdict-copy.ts still carries the old note that "BUY/WATCH/SKIP
 *    stay English product terms". That convention is withdrawn — a verdict is
 *    the one word the whole product exists to say, and saying it in a language
 *    the reader did not choose is the loudest possible place to leak English.
 *    Plan names (Free/Starter/Pro) DO stay as brand tokens; that split is the
 *    point, not an inconsistency.
 *  - the CONFIDENCE BAND: rendered as `${t.confidenceLabel} ${res.confidence}`,
 *    so the label translated and the value did not — "Confianza MEDIUM".
 *  - the CATEGORY: catalogue taxonomy, previously left English on purpose (see
 *    the BRAND_CATEGORIES comment in i18n.ts). That reasoning holds for a list
 *    of garment words a user is about to retype into the search box; it does
 *    not hold for a single category sitting mid-sentence in a Spanish verdict
 *    line. Translated here, left alone there.
 *
 * All six locales in one table, deliberately: a per-locale dictionary is where
 * the fifth locale gets forgotten. If you add a key, the type makes you fill
 * every column.
 */

export type VerdictWord = "BUY" | "WATCH" | "SKIP"

/** BUY / WATCH / SKIP as a decision, not a database constant. */
const VERDICT_WORDS: Record<Locale, Record<VerdictWord, string>> = {
  en: { BUY: "BUY", WATCH: "WATCH", SKIP: "SKIP" },
  es: { BUY: "COMPRA", WATCH: "OBSERVA", SKIP: "DESCARTA" },
  fr: { BUY: "ACHETER", WATCH: "SURVEILLER", SKIP: "ÉCARTER" },
  de: { BUY: "KAUFEN", WATCH: "BEOBACHTEN", SKIP: "VERWERFEN" },
  it: { BUY: "COMPRA", WATCH: "OSSERVA", SKIP: "SCARTA" },
  pt: { BUY: "COMPRAR", WATCH: "OBSERVAR", SKIP: "DESCARTAR" },
}

/** HIGH / MEDIUM / LOW — the value beside an already-translated label. */
const CONFIDENCE_BANDS: Record<Locale, Record<string, string>> = {
  en: { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW" },
  es: { HIGH: "ALTA", MEDIUM: "MEDIA", LOW: "BAJA" },
  fr: { HIGH: "ÉLEVÉE", MEDIUM: "MOYENNE", LOW: "FAIBLE" },
  de: { HIGH: "HOCH", MEDIUM: "MITTEL", LOW: "NIEDRIG" },
  it: { HIGH: "ALTA", MEDIUM: "MEDIA", LOW: "BASSA" },
  pt: { HIGH: "ALTA", MEDIUM: "MÉDIA", LOW: "BAIXA" },
}

/**
 * The catalogue's category vocabulary. Enumerated from production
 * 2026-09-05 — `SELECT DISTINCT category` over `model_signals` (Bags, Hoodies,
 * Jackets, Jeans, Other, Shirts, Sneakers, T-Shirts) unioned with
 * `market_stats` (adds Caps, Coats, Tracksuits). An unknown category falls
 * through to the English original rather than disappearing.
 */
const CATEGORIES: Record<Locale, Record<string, string>> = {
  en: {},
  es: {
    Bags: "Bolsos", Caps: "Gorras", Coats: "Abrigos", Hoodies: "Sudaderas",
    Jackets: "Chaquetas", Jeans: "Vaqueros", Other: "Otros", Shirts: "Camisas",
    Sneakers: "Zapatillas", "T-Shirts": "Camisetas", Tracksuits: "Chándales",
  },
  fr: {
    Bags: "Sacs", Caps: "Casquettes", Coats: "Manteaux", Hoodies: "Sweats à capuche",
    Jackets: "Vestes", Jeans: "Jeans", Other: "Autres", Shirts: "Chemises",
    Sneakers: "Sneakers", "T-Shirts": "T-shirts", Tracksuits: "Survêtements",
  },
  de: {
    Bags: "Taschen", Caps: "Caps", Coats: "Mäntel", Hoodies: "Hoodies",
    Jackets: "Jacken", Jeans: "Jeans", Other: "Sonstiges", Shirts: "Hemden",
    Sneakers: "Sneaker", "T-Shirts": "T-Shirts", Tracksuits: "Trainingsanzüge",
  },
  it: {
    Bags: "Borse", Caps: "Cappellini", Coats: "Cappotti", Hoodies: "Felpe con cappuccio",
    Jackets: "Giacche", Jeans: "Jeans", Other: "Altro", Shirts: "Camicie",
    Sneakers: "Sneakers", "T-Shirts": "T-shirt", Tracksuits: "Tute",
  },
  pt: {
    Bags: "Malas", Caps: "Bonés", Coats: "Casacos compridos", Hoodies: "Camisolas com capuz",
    Jackets: "Casacos", Jeans: "Jeans", Other: "Outros", Shirts: "Camisas",
    Sneakers: "Ténis", "T-Shirts": "T-shirts", Tracksuits: "Fatos de treino",
  },
}

/**
 * `confidence_note` is backend-owned English prose (api/routes.py
 * `_verdict_confidence`). Same problem, same remedy already used for
 * LIMIT_REACHED and UNKNOWN in free-checker.tsx: do not translate the prose,
 * recognise which of the four notes it is and render our own sentence.
 *
 * ON THE WORDING CHANGE. The backend calls this count "watched departures".
 * ON THE TWO SPELLINGS THE MATCHER ACCEPTS. The count is `comparable_n`, not
 * a departure count, and demand-intel #32 (`0e93e99`) renamed the note from
 * "Only N watched departures" to "Only N comparable departures" for exactly
 * that reason — it sat beside a `sold_7d` tile and the shared noun made two
 * true numbers read as one contradicting itself (Air Force 1 Low: 11 and 20).
 *
 * Both spellings are matched deliberately. The frontend and the backend deploy
 * separately, and the hero additionally serves a 30-minute last-good disk cache
 * that can hold a payload written by the previous backend build. Matching only
 * the new wording would silently drop a locale back to English prose for the
 * length of a rollout, which is the failure this file exists to remove.
 */
const NOTES: Record<Locale, {
  fewComparables: (n: string) => string
  sampleComparables: (n: string) => string
  noComparables: string
  stale: string
  dispersed: string
}> = {
  en: {
    fewComparables: (n) => `Only ${n} comparable departures behind this call`,
    sampleComparables: (n) => `Priced from ${n} comparable listings — not from shelf departures`,
    noComparables: "Too few comparable departures behind this call",
    stale: "Market snapshot is more than 48 hours old",
    dispersed: "Sold prices are widely spread — treat the average as a range, not a point",
  },
  es: {
    fewComparables: (n) => `Solo ${n} salidas comparables detrás de esta decisión`,
    sampleComparables: (n) => `Calculado con ${n} anuncios comparables — no con salidas del catálogo`,
    noComparables: "Muy pocas salidas comparables detrás de esta decisión",
    stale: "La foto del mercado tiene más de 48 horas",
    dispersed: "Los precios de venta están muy dispersos — trata la media como un rango, no como un punto",
  },
  fr: {
    fewComparables: (n) => `Seulement ${n} départs comparables derrière cette décision`,
    sampleComparables: (n) => `Calculé à partir de ${n} annonces comparables — pas de départs du catalogue`,
    noComparables: "Trop peu de départs comparables derrière cette décision",
    stale: "L'instantané du marché date de plus de 48 heures",
    dispersed: "Les prix de vente sont très dispersés — traitez la moyenne comme une fourchette, pas comme un point",
  },
  de: {
    fewComparables: (n) => `Nur ${n} vergleichbare Abgänge hinter dieser Einschätzung`,
    sampleComparables: (n) => `Berechnet aus ${n} vergleichbaren Anzeigen — nicht aus Abgängen`,
    noComparables: "Zu wenige vergleichbare Abgänge hinter dieser Einschätzung",
    stale: "Die Marktaufnahme ist älter als 48 Stunden",
    dispersed: "Die Verkaufspreise streuen stark — lies den Mittelwert als Spanne, nicht als Punkt",
  },
  it: {
    fewComparables: (n) => `Solo ${n} uscite comparabili dietro questa decisione`,
    sampleComparables: (n) => `Calcolato su ${n} annunci comparabili — non su uscite dal catalogo`,
    noComparables: "Troppo poche uscite comparabili dietro questa decisione",
    stale: "L'istantanea di mercato ha più di 48 ore",
    dispersed: "I prezzi di vendita sono molto dispersi — leggi la media come un intervallo, non come un punto",
  },
  pt: {
    fewComparables: (n) => `Apenas ${n} saídas comparáveis por trás desta decisão`,
    sampleComparables: (n) => `Calculado a partir de ${n} anúncios comparáveis — não de saídas do catálogo`,
    noComparables: "Poucas saídas comparáveis por trás desta decisão",
    stale: "O retrato do mercado tem mais de 48 horas",
    dispersed: "Os preços de venda estão muito dispersos — trata a média como um intervalo, não como um ponto",
  },
}

/**
 * Exported because a thousands separator is part of the translation. `1,234`
 * is wrong in five of our six locales (es/de/it/pt group with ".", fr with a
 * narrow space), and `median-n.tsx` had `toLocaleString("en-GB")` hardcoded —
 * printing an English-formatted count under a Spanish label. One map, not two:
 * a second copy of this table is exactly the drift this file's own docblock
 * warns about.
 */
export const NUMBER_LOCALE: Record<Locale, string> = {
  en: "en-GB", fr: "fr-FR", es: "es-ES", de: "de-DE", it: "it-IT", pt: "pt-PT",
}

/** A count in `locale`'s digit grouping. */
export function formatCount(n: number, locale: Locale): string {
  return n.toLocaleString(NUMBER_LOCALE[locale])
}

/** BUY/WATCH/SKIP in `locale`. Any other verdict string is returned untouched —
 *  BRAND_AVERAGE, LIMIT_REACHED and friends have their own branches upstream.
 *
 *  PROVISIONAL_PRICE and PROVISIONAL are confidence-qualified WATCHes:
 *  the backend has price data but sell-through evidence is still maturing.
 *  They translate the same as WATCH so a visitor reads "WATCH" (amber) instead
 *  of the raw enum "PROVISIONAL_PRICE" (grey), which read as an error state.
 *  Measured: 379 PROVISIONAL_PRICE + 74 PROVISIONAL in 7 days — the dominant
 *  anon verdict — rendering grey/unreadable while 0 converted. 2026-09-23. */
export function verdictWord(verdict: string | undefined, locale: Locale): string | null {
  if (!verdict) return null
  // Normalise confidence-qualified variants to their base verdict before lookup.
  const normalised =
    verdict === "PROVISIONAL_PRICE" || verdict === "PROVISIONAL" ? "WATCH" : verdict
  const table = VERDICT_WORDS[locale]
  return (table as Record<string, string>)[normalised] ?? null
}

/** HIGH/MEDIUM/LOW in `locale`; unknown bands pass through unchanged. */
export function confidenceBand(band: string | undefined, locale: Locale): string | null {
  if (!band) return null
  return CONFIDENCE_BANDS[locale][band] ?? band
}

/** A catalogue category in `locale`; unknown categories pass through unchanged. */
export function categoryName(category: string | undefined | null, locale: Locale): string | null {
  if (!category) return null
  return CATEGORIES[locale][category] ?? category
}

/**
 * Translate one of the five backend confidence notes.
 *
 * Returns the ORIGINAL string when nothing matches: a note we do not recognise
 * is still a true statement about the data, and dropping it silently would hide
 * evidence to make a card look tidier. English leaking is the smaller failure.
 */
export function localizeConfidenceNote(
  note: string | null | undefined,
  locale: Locale,
): string | null {
  if (!note) return null
  const t = NOTES[locale]
  // `comparable` is what the backend sends today (#32); `watched` is the
  // pre-#32 spelling that a last-good cache entry or a mid-rollout backend can
  // still produce. See the NOTES docblock.
  // A backend count arrives English-grouped ("1,234"); regroup it for the
  // locale, and fall back to the raw digits if it will not parse.
  const regroup = (raw: string) => {
    const parsed = Number(raw.replace(/[,.\s]/g, ""))
    return Number.isFinite(parsed) ? parsed.toLocaleString(NUMBER_LOCALE[locale]) : raw.trim()
  }

  const few = note.match(/^Only\s+([\d,.\s]+)\s+(?:comparable|watched) departures$/i)
  if (few) return t.fewComparables(regroup(few[1]))

  // The sample-size note (backend, #56 era): the count beside the price is the
  // comparable sample, not the departure count. It reached production
  // untranslated because it postdates the four patterns above and the fallback
  // below returns the English verbatim — so /es rendered "162 comparables in
  // the sample" under a Spanish label.
  const sample = note.match(/^([\d,.\s]+)\s+comparables? in the sample\b.*$/i)
  if (sample) return t.sampleComparables(regroup(sample[1]))
  if (/^Too few (?:comparable|watched) departures$/i.test(note)) return t.noComparables
  if (/^Market snapshot is more than 48 hours old$/i.test(note)) return t.stale
  if (/^Sold prices are widely spread/i.test(note)) return t.dispersed
  return note
}
