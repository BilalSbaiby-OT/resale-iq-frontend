/**
 * O3 (2026-10-03) — honest output: lead with numbers, verdict second.
 *
 * The backend (engine/honest_output.py) sends `honest` on a verdict body:
 * typical resale range = p25-p75 of the departed listings' asking prices
 * behind the model, the count and window behind it, and a max-buy price (avg x
 * 0.70, whole euros). Under 20 comparables the verdict is shown as LOW DATA,
 * never as BUY/WATCH/SKIP.
 *
 * Wording rule: "listings that left Vinted". Never "sold" — a departure can be
 * a delisting, an edit or a reservation (see i18n.ts header).
 *
 * Plain .ts with one type-only import so node:test can load it.
 */
import type { Locale } from "./i18n.ts"

export type HonestOutput = {
  basis: "departed" | "active_asking"
  // The visibility switches on the backend (HONEST_COUNTS_PUBLIC /
  // HONEST_RANGE_PUBLIC) OMIT range_*, p25/p75, n, window_days and price_window
  // for anonymous / free callers. Every one of them can be absent; nothing
  // below may print or divide by an absent value.
  range_low_eur?: number | null
  range_high_eur?: number | null
  p25_price_eur?: number | null
  p75_price_eur?: number | null
  price_window?: "7d" | "30d" | null
  n?: number
  window_days?: 7 | 30 | null
  max_buy_eur: number | null
  margin_pct: number
  low_data: boolean
  verdict_display: string | null
  confidence?: string | null
}

type HonestCopy = {
  rangeLabel: string
  departed: (n: number, days: number) => string
  active: (n: number) => string
  maxBuyLabel: string
  margin: (pct: number) => string
  lowData: string
  lowDataNote: (n: number) => string
  /** Same sentence when the count is withheld from this caller. */
  lowDataNoteNoCount: string
}

export const honestCopy: Record<Locale, HonestCopy> = {
  en: {
    rangeLabel: "Typical resale range",
    departed: (n, d) => `Based on ${n} listings that left Vinted in the last ${d} days`,
    active: (n) => `Based on ${n} live asking prices, not listings that left Vinted`,
    maxBuyLabel: "Max buy price",
    margin: (p) => `for ~${p}% gross margin before fees`,
    lowData: "LOW DATA",
    lowDataNote: (n) => `Only ${n} comparable listings: too few for a call.`,
    lowDataNoteNoCount: "Too few comparable listings for a call.",
  },
  fr: {
    rangeLabel: "Fourchette de revente typique",
    departed: (n, d) => `Basé sur ${n} annonces parties de Vinted ces ${d} derniers jours`,
    active: (n) => `Basé sur ${n} prix demandés en ligne, pas sur des annonces parties de Vinted`,
    maxBuyLabel: "Prix d'achat maximum",
    margin: (p) => `pour ~${p} % de marge brute avant frais`,
    lowData: "PEU DE DONNÉES",
    lowDataNote: (n) => `Seulement ${n} annonces comparables : trop peu pour un avis.`,
    lowDataNoteNoCount: "Trop peu d'annonces comparables pour un avis.",
  },
  es: {
    rangeLabel: "Rango de reventa típico",
    departed: (n, d) => `Basado en ${n} anuncios que salieron de Vinted en los últimos ${d} días`,
    active: (n) => `Basado en ${n} precios pedidos ahora, no en anuncios que salieron de Vinted`,
    maxBuyLabel: "Precio máximo de compra",
    margin: (p) => `para ~${p} % de margen bruto antes de comisiones`,
    lowData: "POCOS DATOS",
    lowDataNote: (n) => `Solo ${n} anuncios comparables: muy pocos para dar una señal.`,
    lowDataNoteNoCount: "Muy pocos anuncios comparables para dar una señal.",
  },
  de: {
    rangeLabel: "Typische Wiederverkaufsspanne",
    departed: (n, d) => `Basiert auf ${n} Anzeigen, die in den letzten ${d} Tagen von Vinted verschwunden sind`,
    active: (n) => `Basiert auf ${n} aktuellen Angebotspreisen, nicht auf von Vinted verschwundenen Anzeigen`,
    maxBuyLabel: "Maximaler Einkaufspreis",
    margin: (p) => `für ~${p} % Bruttomarge vor Gebühren`,
    lowData: "ZU WENIG DATEN",
    lowDataNote: (n) => `Nur ${n} vergleichbare Anzeigen: zu wenig für eine Einschätzung.`,
    lowDataNoteNoCount: "Zu wenige vergleichbare Anzeigen für eine Einschätzung.",
  },
  it: {
    rangeLabel: "Intervallo di rivendita tipico",
    departed: (n, d) => `Basato su ${n} annunci usciti da Vinted negli ultimi ${d} giorni`,
    active: (n) => `Basato su ${n} prezzi richiesti ora, non su annunci usciti da Vinted`,
    maxBuyLabel: "Prezzo massimo di acquisto",
    margin: (p) => `per un margine lordo di ~${p}% prima delle commissioni`,
    lowData: "POCHI DATI",
    lowDataNote: (n) => `Solo ${n} annunci comparabili: troppo pochi per un giudizio.`,
    lowDataNoteNoCount: "Troppo pochi annunci comparabili per un giudizio.",
  },
  pt: {
    rangeLabel: "Intervalo de revenda típico",
    departed: (n, d) => `Com base em ${n} anúncios que saíram do Vinted nos últimos ${d} dias`,
    active: (n) => `Com base em ${n} preços pedidos agora, não em anúncios que saíram do Vinted`,
    maxBuyLabel: "Preço máximo de compra",
    margin: (p) => `para ~${p}% de margem bruta antes de comissões`,
    lowData: "POUCOS DADOS",
    lowDataNote: (n) => `Apenas ${n} anúncios comparáveis: poucos para uma indicação.`,
    lowDataNoteNoCount: "Poucos anúncios comparáveis para uma indicação.",
  },
}

/** True when the card must show LOW DATA instead of a BUY/WATCH/SKIP call. */
export function isLowData(h: HonestOutput | null | undefined): boolean {
  return !!h && h.low_data && h.verdict_display === "LOW_DATA"
}

/** "€21 – €39", or null when there is no range to show. */
export function rangeText(h: HonestOutput | null | undefined): string | null {
  if (!h || h.range_low_eur == null || h.range_high_eur == null) return null
  return `€${h.range_low_eur} – €${h.range_high_eur}`
}

/** The count + window sentence under the range. */
export function basisText(h: HonestOutput, locale: Locale): string | null {
  const c = honestCopy[locale]
  const n = typeof h.n === "number" ? h.n : 0
  if (h.basis === "active_asking") return n > 0 ? c.active(n) : null
  if (n > 0 && h.window_days) return c.departed(n, h.window_days)
  return null
}

/** The LOW DATA reason line; never prints a count the caller was not sent. */
export function lowDataNoteText(h: HonestOutput, locale: Locale): string {
  const c = honestCopy[locale] ?? honestCopy.en
  return typeof h.n === "number" && h.n >= 0 ? c.lowDataNote(h.n) : c.lowDataNoteNoCount
}

/** Worth rendering at all: some number to lead with, or a LOW DATA flag. */
export function hasHonestContent(h: HonestOutput | null | undefined): h is HonestOutput {
  return !!h && (rangeText(h) !== null || h.max_buy_eur != null || isLowData(h))
}
