/**
 * The Organization/SoftwareApplication JSON-LD strings, in all six locales.
 *
 * WHY THIS FILE EXISTS
 * src/app/layout.tsx already resolved the request locale and already set
 * `lang` and the JSON-LD `inLanguage` from it — so /es correctly announced
 * itself as Spanish and then shipped a block of English underneath:
 *
 *   "inLanguage":"es" ... "description":"No account: 10 checks a day. Sign up:
 *   keep the 10 a day, plus 7 days of full Starter access..."
 *
 * That is the single largest run of untranslated English on every non-English
 * page. It is invisible in a browser, which is exactly why it survived — it is
 * read by Google, ChatGPT and Perplexity, i.e. by the systems deciding whether
 * to recommend this product to a Spanish reseller, in a language that tells
 * them the page is Spanish.
 *
 * The strings here are not new translations. Each one is composed from copy
 * this repo had already translated and shipped — TRIAL_LIMITS_SENTENCE_BY_LOCALE
 * for the free rung, and the tier taglines and heroBody in i18n.ts for the rest
 * — so the structured data and the visible page now make the same claims in the
 * same words. If a claim changes on the page, change it here too; two
 * descriptions of one product that disagree is the defect this file is
 * preventing, not one it should introduce.
 *
 * Tier names (Free / Starter / Pro) are deliberately NOT here. They stay
 * English in every locale, the same rule i18n.ts:273 documents for the pricing
 * page, and they live at the `name` field in layout.tsx next to the price.
 */
import type { Locale } from "./i18n"
import { TRIAL_LIMITS_SENTENCE_BY_LOCALE } from "./trial-copy"

type StructuredDataCopy = {
  /** Org description. Takes the live tracked-listings label, never a literal. */
  description: (tracked: string) => string
  offerFree: string
  offerStarter: string
  offerPro: string
}

/**
 * "No card required." — the reassurance that closes the free rung.
 *
 * Exported, like STRUCTURED_DATA_COPY below, so scripts/check-locale-english.mjs
 * can reach it. A module-private copy table is a table no guard can read, and
 * these strings are new translations — exactly the ones most worth policing.
 */
export const NO_CARD: Record<Locale, string> = {
  en: "No card required.",
  es: "Sin tarjeta.",
  fr: "Sans carte bancaire.",
  de: "Keine Karte erforderlich.",
  it: "Senza carta.",
  pt: "Sem cartão.",
}

export const STRUCTURED_DATA_COPY: Record<Locale, Omit<StructuredDataCopy, "offerFree">> = {
  en: {
    description: tracked =>
      `Resale IQ is demand intelligence for people who buy second-hand to resell. It analyses ${tracked} unique listings across 5 EU markets and answers what sells, what it is worth, and whether to buy — BUY/WATCH/SKIP, buy-below price and best sizes. Vinted is the first marketplace it covers.`,
    offerStarter: "Unlimited verdicts and every product signal unblurred.",
    offerPro: "Adds Live Finder, Order Planner, Price Compare and REST API access.",
  },
  es: {
    description: tracked =>
      `Resale IQ es inteligencia de demanda para quien compra de segunda mano para revender. Analiza ${tracked} anuncios únicos en 5 mercados de la UE y responde qué se vende, a qué se revende y si conviene comprar — veredicto COMPRA/OBSERVA/DESCARTA, precio máximo de compra y las mejores tallas. Vinted es el primer marketplace que cubre.`,
    offerStarter: "Veredictos ilimitados y todas las señales del producto sin difuminar.",
    offerPro: "Añade Live Finder, Order Planner, Price Compare y acceso a la API REST.",
  },
  fr: {
    description: tracked =>
      `Resale IQ, c'est l'intelligence de la demande pour ceux qui achètent d'occasion pour revendre. L'outil analyse ${tracked} annonces uniques sur 5 marchés de l'UE et dit ce qui se vend, à quel prix, et s'il faut acheter — verdict ACHETER/SURVEILLER/ÉCARTER, prix d'achat max et meilleures tailles. Vinted est le premier marketplace couvert.`,
    offerStarter: "Verdicts illimités et tous les signaux produit affichés en clair.",
    offerPro: "Ajoute Live Finder, Order Planner, Price Compare et l'accès à l'API REST.",
  },
  de: {
    description: tracked =>
      `Resale IQ ist Nachfrage-Intelligenz für alle, die Second-Hand kaufen, um weiterzuverkaufen. Das Tool analysiert ${tracked} eindeutige Inserate in 5 EU-Märkten und sagt, was sich verkauft, was es wert ist, und ob du kaufen solltest — KAUFEN/BEOBACHTEN/VERWERFEN, Kaufobergrenze und beste Größen. Vinted ist der erste abgedeckte Marktplatz.`,
    offerStarter: "Unbegrenzte Urteile und jedes Produktsignal unverpixelt.",
    offerPro: "Ergänzt Live Finder, Order Planner, Price Compare und den Zugang zur REST-API.",
  },
  it: {
    description: tracked =>
      `Resale IQ è intelligence sulla domanda per chi compra usato per rivendere. Analizza ${tracked} inserzioni uniche su 5 mercati dell'UE e dice cosa si vende, a quanto si rivende e se conviene comprare — verdetto COMPRA/OSSERVA/SCARTA, prezzo massimo di acquisto e taglie migliori. Vinted è il primo marketplace coperto.`,
    offerStarter: "Verdetti illimitati e ogni segnale di prodotto senza sfocatura.",
    offerPro: "Aggiunge Live Finder, Order Planner, Price Compare e l'accesso all'API REST.",
  },
  pt: {
    description: tracked =>
      `A Resale IQ é inteligência de procura para quem compra em segunda mão para revender. Analisa ${tracked} anúncios únicos em 5 mercados da UE e diz o que vende, a que se revende e se deve comprar — veredicto COMPRAR/OBSERVAR/DESCARTAR, preço máximo de compra e melhores tamanhos. A Vinted é o primeiro marketplace coberto.`,
    offerStarter: "Veredictos ilimitados e todos os sinais do produto sem desfoque.",
    offerPro: "Acrescenta Live Finder, Order Planner, Price Compare e acesso à API REST.",
  },
}

export function structuredDataCopy(locale: Locale): StructuredDataCopy {
  const base = STRUCTURED_DATA_COPY[locale] ?? STRUCTURED_DATA_COPY.en
  return {
    ...base,
    // Composed rather than restated: the free rung's terms are already written
    // and translated in one place, and this is the second place that describes
    // them. Deriving it means they cannot drift apart.
    offerFree: `${TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale] ?? TRIAL_LIMITS_SENTENCE_BY_LOCALE.en} ${NO_CARD[locale] ?? NO_CARD.en}`,
  }
}
