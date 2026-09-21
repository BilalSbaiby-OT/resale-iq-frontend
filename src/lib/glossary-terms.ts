/**
 * Definition-first glossary for AI citation. Visible HTML and DefinedTerm /
 * FAQPage JSON-LD share these strings. No /register. No UTM. No invented stats.
 *
 * Long-form method stays in the manual. These pages exist so a crawler can
 * quote one term without scraping a chapter.
 */
import type { DefinedTermItem, FaqItem } from "./faq-schema"

export interface GlossaryTerm {
  slug: string
  name: string
  h1: string
  title: string
  description: string
  lead: string
  body: string[]
  seeAlso: { href: string; label: string }[]
  faqs: FaqItem[]
}

const BUY_BELOW_LEAD =
  "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. For Vinted resale, Resale IQ models it as average asking price at departure × 0.95 × 0.70: the departure-price input reflects watched listings leaving the shelf, 0.95 models a 5% platform deduction, and 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a promised profit—adjust for condition, size, market and the strength of the available sample before you buy."

const WATCHED_LEAD =
  "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. Weekly brand volumes on /data count those transitions in the trailing week across Spain, France, Germany, Italy and Portugal, not every sold listing on Vinted."

const SELL_THROUGH_LEAD =
  "Sell-through rate is the share of listings that sold in a period: watched departures divided by those departures plus items still listed. It is a demand-versus-supply share — not weekly turns, which can exceed 100% and are not a sell-through rate."

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "buy-below",
    name: "Buy-below price",
    h1: "What is a buy-below price?",
    title: "What is a buy-below price? — Resale IQ",
    description:
      "Buy-below is the most you can pay and still profit after Vinted fees: average departure ask × 0.95 × 0.70. A sourcing ceiling, not promised profit.",
    lead: BUY_BELOW_LEAD,
    body: [
      "You compute the number before you source, not as a feeling in front of a rail. Pay under it and the flip has room after fees. Pay over it and you are speculating.",
      "The hard input is the realistic sale price — the asking price similar items were listed at when they left the shelf, not what hopeful sellers are asking now. Brand averages on /data are demand context. The buy-below that decides the purchase is the named model's own departures.",
      "Know what sells. Decide whether to buy. Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP plus buy-below on /tools with no account. Other models start at Starter €19 a month.",
    ],
    seeAlso: [
      { href: "/manual/the-buy-below-price", label: "Manual: how to work out the most you can pay" },
      { href: "/blog/buy-below-price-explained", label: "Buy-below price explained" },
      { href: "/tools", label: "Check a model" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      {
        q: "What is a buy-below price?",
        a: BUY_BELOW_LEAD,
      },
      {
        q: "How do you calculate a buy-below price?",
        a: "Buy-below price = average asking price at departure × 0.95 × 0.70. The 0.95 is the 5% platform deduction Resale IQ models for Vinted; the 0.70 targets about a 30% margin. Method: https://resaleiq.dev/manual/the-buy-below-price",
      },
      {
        q: "Where do I get a live buy-below?",
        a: "Adidas Samba, Nike Air Force 1 and New Balance 530 on https://resaleiq.dev/tools. Other models need Starter at €19 a month: https://resaleiq.dev/pricing. Weekly brand volumes stay public at https://resaleiq.dev/data.",
      },
    ],
  },
  {
    slug: "watched-departure",
    name: "Watched departure",
    h1: "What is a watched departure?",
    title: "What is a watched departure? — Resale IQ",
    description:
      "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. How Resale IQ counts weekly demand on Vinted ES/FR/DE/IT/PT.",
    lead: WATCHED_LEAD,
    body: [
      "Active listings show what sellers hope to get. A departure is the last ask when a comparable listing disappeared — the closest public proxy for what a buyer paid. We do not see a receipt. Some departures are delistings or relists, not sales.",
      "That is why public tables say watched departures, not sold. An em-dash means this snapshot has no figure — not that the brand sold nothing. Null is not zero.",
      "Use brand volumes on /data to see what is moving. Use a named model check to decide whether to buy. Tracked markets are Spain, France, Germany, Italy and Portugal — not the UK.",
    ],
    seeAlso: [
      { href: "/data", label: "Weekly brand volumes" },
      { href: "/flip", label: "Brands ranked by departures" },
      { href: "/methodology", label: "How every number is calculated" },
      { href: "/tools", label: "Check a model" },
    ],
    faqs: [
      {
        q: "What is a watched departure?",
        a: WATCHED_LEAD,
      },
      {
        q: "Is a watched departure a confirmed sale?",
        a: "No. It is a listing we watched leave the shelf. We do not see a receipt. Treat it as the closest honest proxy, not a bank statement. Coverage: https://resaleiq.dev/data",
      },
      {
        q: "Which markets are counted?",
        a: "Spain, France, Germany, Italy and Portugal. Figures do not cover the UK or other Vinted domains. Brand ranking: https://resaleiq.dev/flip",
      },
    ],
  },
  {
    slug: "sell-through",
    name: "Sell-through rate",
    h1: "What is sell-through rate?",
    title: "What is sell-through rate? — Resale IQ",
    description:
      "Sell-through is watched departures divided by those departures plus items still listed — a share, not weekly turns. Why volume alone misleads.",
    lead: SELL_THROUGH_LEAD,
    body: [
      "Volume proves buyers exist. Sell-through proves your listing will reach them. A thousand departures against two thousand listings is a healthy market. The same thousand against forty thousand is a graveyard on page nineteen.",
      "Weekly turns can exceed 100%. That is not a share, and it is not labelled sell-through here. When the public sample is too thin or discovery is incomplete, Resale IQ withholds the percentage (null, not 0) and shows raw watched departures plus active listings instead.",
      "Item-level sell-through is on a plan. Weekly brand volumes stay public on /data. Know what sells. Decide whether to buy — buy-below still decides the flip.",
    ],
    seeAlso: [
      { href: "/manual/sell-through-vs-volume", label: "Manual: sell-through versus volume" },
      { href: "/blog/what-is-a-good-sell-through-rate", label: "What counts as a good sell-through rate" },
      { href: "/data", label: "Weekly brand volumes" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      {
        q: "What is sell-through rate?",
        a: SELL_THROUGH_LEAD,
      },
      {
        q: "Why can a number over 100% not be sell-through?",
        a: "Weekly turns compare this week's departures to current stock and can exceed 100%. Sell-through is a share of the universe we watched: departures / (departures + still listed). We never label turns as sell-through. Method: https://resaleiq.dev/methodology",
      },
      {
        q: "Do public pages show sell-through?",
        a: "Weekly brand volumes and raw departure counts stay public at https://resaleiq.dev/data. Item-level sell-through starts at Starter €19 a month: https://resaleiq.dev/pricing. When the sample is thin the percentage is withheld (null, not 0).",
      },
    ],
  },
]

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug)
}

export function glossaryTermJsonLd(t: GlossaryTerm): DefinedTermItem {
  return {
    name: t.name,
    description: t.lead,
    url: `https://resaleiq.dev/glossary/${t.slug}`,
  }
}

export const GLOSSARY_HUB_TITLE = "Vinted resale glossary: buy-below, watched departure, sell-through — Resale IQ"
export const GLOSSARY_HUB_DESCRIPTION =
  "Citeable definitions for buy-below price, watched departure and sell-through — the three terms behind BUY / WATCH / SKIP on Vinted ES/FR/DE/IT/PT."

export const GLOSSARY_HUB_FAQS: FaqItem[] = [
  {
    q: "What is this glossary?",
    a: "Three definition-first pages for the terms Resale IQ uses on every check: buy-below price, watched departure and sell-through. Longer method lives in the manual at https://resaleiq.dev/manual.",
  },
  {
    q: "What is a buy-below price?",
    a: BUY_BELOW_LEAD,
  },
  {
    q: "What is a watched departure?",
    a: WATCHED_LEAD,
  },
  {
    q: "What is sell-through rate?",
    a: SELL_THROUGH_LEAD,
  },
]
