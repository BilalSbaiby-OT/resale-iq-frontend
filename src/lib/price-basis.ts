/**
 * Price basis of the "typical resale price" (backend engine/honest_output.py,
 * flag TYPICAL_PRICE_SOURCE).
 *
 *   departed       default. p25-p75 of the ASKING prices of listings that left
 *                  Vinted behind the model. Current copy stays exactly as it was.
 *   active_asking  E1 provisional: priced off what is being asked right now.
 *   live_ask       TRP flip: de-duplicated LIVE asking prices, typical price =
 *                  lower third of the market, range = "typical range". The
 *                  backend sends price_window "live" and no window_days.
 *
 * Every surface that describes where the typical price comes from reads the
 * basis from the payload (honest.basis) and calls into this file; no surface
 * hard-codes "listings that left" for a number that may be live-ask. Wording
 * rule: asking prices, never "sold".
 *
 * Plain .ts with type-only imports so node:test can load it.
 */
import type { Locale } from "./i18n.ts"
import { N_ } from "./ui-translate.ts"

export type PriceBasis = "departed" | "active_asking" | "live_ask"

/** Unknown / missing basis is the default (departed): never invent a new basis. */
export function normalizeBasis(v: unknown): PriceBasis {
  return v === "live_ask" || v === "active_asking" ? v : "departed"
}

/** True when the typical price is built from current asking prices. */
export function isLiveAsk(v: unknown): boolean {
  return normalizeBasis(v) === "live_ask"
}

/** Basis of a list of rows that each may carry `honest.basis`: live_ask if any row says so. */
export function basisOfRows(rows: ReadonlyArray<{ honest?: { basis?: unknown } | null }> | null | undefined): PriceBasis {
  return (rows ?? []).some((r) => isLiveAsk(r?.honest?.basis)) ? "live_ask" : "departed"
}

type BasisCopy = {
  /** Footnote under the typical resale price. */
  liveAskNote: string
  /** Range label when the range is the live-ask typical range. */
  liveAskRangeLabel: string
  /** /methodology: the buy-below FAQ answer + the sentence under "Buy-below price". */
  methodologyFaq: string
  methodologyNote: string
}

export const basisCopy: Record<Locale, BasisCopy> = {
  en: {
    liveAskNote: "Based on current asking prices for this model on Vinted (lower third of the market)",
    liveAskRangeLabel: "Typical resale price · typical range",
    methodologyFaq: "The typical resale price is based on current asking prices for this model on Vinted (the lower third of the market, with each listing counted once across the Vinted sites we track), multiplied by 0.70. There is no fee step: Vinted charges private sellers no selling fee. These are asking prices; we do not observe the price an item finally changes hands at.",
    methodologyNote: "Typical resale price: based on current asking prices for this model on Vinted (lower third of the market). The range shown is the typical range.",
  },
  es: {
    liveAskNote: "Basado en los precios pedidos actuales de este modelo en Vinted (tercio inferior del mercado)",
    liveAskRangeLabel: "Precio de reventa típico · rango típico",
    methodologyFaq: "El precio de reventa típico se basa en los precios pedidos actuales de este modelo en Vinted (el tercio inferior del mercado, contando cada anuncio una sola vez entre los sitios de Vinted que seguimos), multiplicado por 0.70. No hay ningún paso de comisiones: Vinted no cobra comisión de venta a los vendedores particulares. Son precios pedidos; no observamos el precio al que un artículo cambia finalmente de manos.",
    methodologyNote: "Precio de reventa típico: basado en los precios pedidos actuales de este modelo en Vinted (tercio inferior del mercado). El rango mostrado es el rango típico.",
  },
  fr: {
    liveAskNote: "Basé sur les prix demandés actuels de ce modèle sur Vinted (tiers inférieur du marché)",
    liveAskRangeLabel: "Prix de revente typique · fourchette typique",
    methodologyFaq: "Le prix de revente typique repose sur les prix demandés actuels de ce modèle sur Vinted (le tiers inférieur du marché, chaque annonce n'étant comptée qu'une fois sur les sites Vinted que nous suivons), multiplié par 0.70. Il n'y a aucune étape de frais : Vinted ne prélève aucun frais de vente aux vendeurs particuliers. Ce sont des prix demandés ; nous n'observons pas le prix auquel un article change finalement de mains.",
    methodologyNote: "Prix de revente typique : basé sur les prix demandés actuels de ce modèle sur Vinted (tiers inférieur du marché). La fourchette affichée est la fourchette typique.",
  },
  de: {
    liveAskNote: "Basiert auf aktuellen Angebotspreisen für dieses Modell auf Vinted (unteres Marktdrittel)",
    liveAskRangeLabel: "Typischer Wiederverkaufspreis · typische Spanne",
    methodologyFaq: "Der typische Wiederverkaufspreis basiert auf aktuellen Angebotspreisen für dieses Modell auf Vinted (das untere Marktdrittel, wobei jedes Inserat über die von uns erfassten Vinted-Seiten hinweg nur einmal zählt), multipliziert mit 0.70. Einen Gebührenschritt gibt es nicht: Vinted erhebt von privaten Verkäufern keine Verkaufsgebühr. Es sind Angebotspreise; den Preis, zu dem ein Artikel am Ende den Besitzer wechselt, beobachten wir nicht.",
    methodologyNote: "Typischer Wiederverkaufspreis: basiert auf aktuellen Angebotspreisen für dieses Modell auf Vinted (unteres Marktdrittel). Die angezeigte Spanne ist die typische Spanne.",
  },
  it: {
    liveAskNote: "Basato sui prezzi richiesti attuali per questo modello su Vinted (terzo inferiore del mercato)",
    liveAskRangeLabel: "Prezzo di rivendita tipico · fascia tipica",
    methodologyFaq: "Il prezzo di rivendita tipico si basa sui prezzi richiesti attuali per questo modello su Vinted (il terzo inferiore del mercato, con ogni inserzione contata una sola volta tra i siti Vinted che monitoriamo), moltiplicato per 0.70. Non c'è nessun passaggio di commissioni: Vinted non applica commissioni di vendita ai venditori privati. Sono prezzi richiesti; non osserviamo il prezzo a cui un articolo cambia infine di mano.",
    methodologyNote: "Prezzo di rivendita tipico: basato sui prezzi richiesti attuali per questo modello su Vinted (terzo inferiore del mercato). La fascia mostrata è la fascia tipica.",
  },
  pt: {
    liveAskNote: "Com base nos preços pedidos atuais deste modelo no Vinted (terço inferior do mercado)",
    liveAskRangeLabel: "Preço de revenda típico · intervalo típico",
    methodologyFaq: "O preço de revenda típico baseia-se nos preços pedidos atuais deste modelo no Vinted (o terço inferior do mercado, contando cada anúncio uma só vez entre os sites da Vinted que acompanhamos), multiplicado por 0.70. Não há nenhum passo de taxas: a Vinted não cobra comissão de venda a vendedores particulares. São preços pedidos; não observamos o preço a que um artigo acaba por mudar de mãos.",
    methodologyNote: "Preço de revenda típico: com base nos preços pedidos atuais deste modelo no Vinted (terço inferior do mercado). O intervalo apresentado é o intervalo típico.",
  },
}

/** Footnote under the typical resale price, or null when the basis needs none. */
export function basisNote(basis: unknown, locale: Locale, askingNote: string): string | null {
  const b = normalizeBasis(basis)
  if (b === "live_ask") return (basisCopy[locale] ?? basisCopy.en).liveAskNote
  if (b === "active_asking") return askingNote
  return null
}

/** Range label: live-ask says "typical range"; other bases keep their label. */
export function rangeLabelFor(basis: unknown, locale: Locale, defaultLabel: string): string {
  return isLiveAsk(basis) ? (basisCopy[locale] ?? basisCopy.en).liveAskRangeLabel : defaultLabel
}

/** /methodology buy-below FAQ answer: departed text untouched, live-ask text swapped in. */
export function methodologyFaqFor(basis: unknown, locale: Locale, departedText: string): string {
  return isLiveAsk(basis) ? (basisCopy[locale] ?? basisCopy.en).methodologyFaq : departedText
}

/** Extra sentence under "Buy-below price" (live-ask only; null keeps the page byte-identical). */
export function methodologyNoteFor(basis: unknown, locale: Locale): string | null {
  return isLiveAsk(basis) ? (basisCopy[locale] ?? basisCopy.en).methodologyNote : null
}

/** Proof strip subtitle (English source; render through tx()). */
export function proofStripNote(basis: unknown): string {
  return isLiveAsk(basis)
    ? N_("Buy price → typical resale price. Resale prices are based on current asking prices for each model on Vinted (lower third of the market) — not confirmed sales.")
    : N_("Buy price → typical resale price. These are watched departures — listings that left the shelf — not confirmed sales.")
}
