/**
 * O3 (2026-10-03) — honest output: lead with numbers, verdict second.
 *
 * The backend (engine/honest_output.py) sends `honest` on a verdict body:
 * typical resale price = p25-p75 of the asking prices of listings that left
 * Vinted behind the model, a max-buy price (avg x 0.70, whole euros), and a
 * `signal_strength` 1|2|3 (<20 / 20-49 / 50+ comparables).
 *
 * Founder override 2026-10-03: the UI shows NO count for any caller (no
 * "N listings", no departure counts, no "Based on N") and NO "LOW DATA" label.
 * Evidence is shown only as the three-dot Signal strength meter. The verdict is
 * the computed BUY/WATCH/SKIP, untouched. Counts / windows / low_data may still
 * arrive for paid API callers; this module deliberately has no type for them,
 * so nothing here can render them.
 *
 * `basis` says where the typical price comes from (departed | active_asking |
 * live_ask); see price-basis.ts. Copy that describes it must be basis-aware.
 *
 * Wording rule: never "sold" / confirmed sales. "Typical resale price",
 * "Max buy price", "current asking prices".
 *
 * Plain .ts with one type-only import so node:test can load it.
 */
import type { Locale } from "./i18n.ts"
import type { PriceBasis } from "./price-basis.ts"

export type SignalStrength = 1 | 2 | 3

export type HonestOutput = {
  basis: PriceBasis
  // HONEST_RANGE_PUBLIC off omits the range for anonymous / free callers.
  range_low_eur?: number | null
  range_high_eur?: number | null
  max_buy_eur: number | null
  margin_pct: number
  signal_strength?: SignalStrength | number | null
  verdict_display?: string | null
  confidence?: string | null
}

type HonestCopy = {
  rangeLabel: string
  maxBuyLabel: string
  margin: (pct: number) => string
  signalLabel: string
  /** Accessible label of the meter: "Signal strength: weak". */
  signalAria: Record<SignalStrength, string>
  /** E1 provisional price: priced off live asking prices, not departures. */
  askingNote: string
}

export const honestCopy: Record<Locale, HonestCopy> = {
  en: {
    rangeLabel: "Typical resale price",
    maxBuyLabel: "Max buy price",
    margin: (p) => `for ~${p}% margin before fees`,
    signalLabel: "Signal strength",
    signalAria: { 1: "Signal strength: weak", 2: "Signal strength: medium", 3: "Signal strength: strong" },
    askingNote: "Based on current asking prices",
  },
  fr: {
    rangeLabel: "Prix de revente typique",
    maxBuyLabel: "Prix d'achat maximum",
    margin: (p) => `pour ~${p} % de marge avant frais`,
    signalLabel: "Fiabilité du signal",
    signalAria: { 1: "Fiabilité du signal : faible", 2: "Fiabilité du signal : moyenne", 3: "Fiabilité du signal : forte" },
    askingNote: "Basé sur les prix demandés actuels",
  },
  es: {
    rangeLabel: "Precio de reventa típico",
    maxBuyLabel: "Precio máximo de compra",
    margin: (p) => `para ~${p} % de margen antes de comisiones`,
    signalLabel: "Fuerza de la señal",
    signalAria: { 1: "Fuerza de la señal: débil", 2: "Fuerza de la señal: media", 3: "Fuerza de la señal: fuerte" },
    askingNote: "Basado en los precios pedidos actuales",
  },
  de: {
    rangeLabel: "Typischer Wiederverkaufspreis",
    maxBuyLabel: "Maximaler Einkaufspreis",
    margin: (p) => `für ~${p} % Marge vor Gebühren`,
    signalLabel: "Signalstärke",
    signalAria: { 1: "Signalstärke: schwach", 2: "Signalstärke: mittel", 3: "Signalstärke: stark" },
    askingNote: "Basiert auf aktuellen Angebotspreisen",
  },
  it: {
    rangeLabel: "Prezzo di rivendita tipico",
    maxBuyLabel: "Prezzo massimo di acquisto",
    margin: (p) => `per un margine di ~${p}% prima delle commissioni`,
    signalLabel: "Forza del segnale",
    signalAria: { 1: "Forza del segnale: debole", 2: "Forza del segnale: media", 3: "Forza del segnale: forte" },
    askingNote: "Basato sui prezzi richiesti attuali",
  },
  pt: {
    rangeLabel: "Preço de revenda típico",
    maxBuyLabel: "Preço máximo de compra",
    margin: (p) => `para ~${p}% de margem antes de comissões`,
    signalLabel: "Força do sinal",
    signalAria: { 1: "Força do sinal: fraco", 2: "Força do sinal: médio", 3: "Força do sinal: forte" },
    askingNote: "Com base nos preços pedidos atuais",
  },
}

/** 1 | 2 | 3, or null when the backend sent nothing usable. */
export function signalStrength(h: HonestOutput | null | undefined): SignalStrength | null {
  const s = h?.signal_strength
  return s === 1 || s === 2 || s === 3 ? s : null
}

/** "●○○" / "●●○" / "●●●". */
export function signalDots(s: SignalStrength): string {
  return "●".repeat(s) + "○".repeat(3 - s)
}

/** "€42–€58", or null when there is no range to show. */
export function rangeText(h: HonestOutput | null | undefined): string | null {
  if (!h || h.range_low_eur == null || h.range_high_eur == null) return null
  return `€${h.range_low_eur}–€${h.range_high_eur}`
}

/** Worth rendering at all: a number to lead with, or a signal-strength meter. */
export function hasHonestContent(h: HonestOutput | null | undefined): h is HonestOutput {
  return !!h && (rangeText(h) !== null || h.max_buy_eur != null || signalStrength(h) !== null)
}
