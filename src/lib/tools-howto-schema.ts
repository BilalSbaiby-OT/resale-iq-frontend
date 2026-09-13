/**
 * HowTo JSON-LD for the two money tools (EX-TOOLS-HOWTO).
 *
 * Steps are the visible UI labels and on-page copy already on
 * /tools/vinted-price-checker and /tools/vinted-profit-calculator.
 * Do not invent tools, supplies, times, or extra steps. FAQPage stays.
 *
 * Schema text is plain. No /register. No UTM. Absolute https://resaleiq.dev
 * URLs only on the HowTo itself (the tool URL).
 */

import type { HowToJsonLd, HowToStepJsonLd } from "./howto-schema"

const SITE = "https://resaleiq.dev"

/** Exact English UI labels from `copy.en` — locked by tools-howto-schema.test.ts. */
const CHECK_THIS_ITEM = "Check this item"
const BUY_LABEL = "Buy price (€)"
const SELL_LABEL = "Expected sale price (€)"
const CALCULATE = "Calculate"
const NET_LABEL = "Net after Vinted 5% fee"
const FEE_DISCLAIMER =
  "Arithmetic on your figures — the 5% is the published Vinted seller-side rate, not a hit-rate claim."

export const TOOL_HOWTO_SLUGS = [
  "vinted-price-checker",
  "vinted-profit-calculator",
] as const

export type ToolHowToIntent = {
  slug: string
  title: string
  description: string
  lede: string
  faq: { q: string; a: string }[]
}

export type ToolHowToStep = { name: string; text: string }

/** FAQ question already on the page — reused as the visible HowTo heading. */
export function toolHowToHeading(intent: ToolHowToIntent): string | null {
  if (intent.slug === "vinted-price-checker") {
    return faqQuestion(intent, "How do I check the price of an item on Vinted?")
  }
  if (intent.slug === "vinted-profit-calculator") {
    return faqQuestion(intent, "How do I calculate profit on Vinted?")
  }
  return null
}

export function toolHowToSteps(intent: ToolHowToIntent): ToolHowToStep[] | null {
  if (intent.slug === "vinted-price-checker") return priceCheckerSteps(intent)
  if (intent.slug === "vinted-profit-calculator") return profitCalculatorSteps(intent)
  return null
}

/**
 * Build HowTo JSON-LD from a tool intent, or null when the slug is not a
 * money tool / the on-page copy no longer yields at least two real steps.
 */
export function toolsHowToJsonLd(intent: ToolHowToIntent): HowToJsonLd | null {
  const raw = toolHowToSteps(intent)
  if (!raw || raw.length < 2) return null

  const step: HowToStepJsonLd[] = raw.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  }))

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: intent.title,
    description: intent.description,
    inLanguage: "en",
    url: `${SITE}/tools/${intent.slug}`,
    step,
  }
}

function faqQuestion(intent: ToolHowToIntent, q: string): string | null {
  return intent.faq.some((f) => f.q === q) ? q : null
}

function faqAnswer(intent: ToolHowToIntent, q: string): string | null {
  return intent.faq.find((f) => f.q === q)?.a ?? null
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function priceCheckerSteps(intent: ToolHowToIntent): ToolHowToStep[] | null {
  const typeLine = "Type a brand and model below to start a check"
  const typeFull =
    "Type a brand and model below to start a check; the paywall is the next step, not a hidden free number."
  if (!intent.lede.includes(typeFull)) return null

  const how = faqAnswer(intent, "How do I check the price of an item on Vinted?")
  if (!how) return null
  const parts = sentences(how)
  if (parts.length < 2) return null
  if (!parts[1].includes("typical departure price plus a buy-below price")) return null

  return [
    { name: typeLine, text: typeFull },
    { name: CHECK_THIS_ITEM, text: parts[0] },
    {
      name: "Typical departure price plus a buy-below price",
      text: parts[1],
    },
  ]
}

function profitCalculatorSteps(intent: ToolHowToIntent): ToolHowToStep[] | null {
  const margin = "Know your true margin before you buy."
  const calcLine = "Resale IQ calculates net profit after platform fees"
  if (!intent.lede.startsWith(margin)) return null
  if (!intent.lede.includes(calcLine)) return null

  const how = faqAnswer(intent, "How do I calculate profit on Vinted?")
  if (!how) return null
  const parts = sentences(how)
  const feeStep = parts[0]
  const remain = parts.find((s) => s.startsWith("What remains is your gross profit."))
  if (!feeStep || !remain) return null

  return [
    { name: BUY_LABEL, text: margin },
    { name: SELL_LABEL, text: feeStep },
    { name: CALCULATE, text: `${calcLine}.` },
    { name: NET_LABEL, text: `${remain} ${FEE_DISCLAIMER}` },
  ]
}
