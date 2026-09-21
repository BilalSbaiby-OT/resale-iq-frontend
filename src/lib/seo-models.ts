/**
 * Programmatic model-page catalogue. STRUCTURE only.
 *
 * Numbers never live here. Live BUY/WATCH/SKIP + buy-below come from
 * getTeaserVerdict() for the three free-sample queries. Brand demand comes
 * from market-numbers.ts. A frozen A13 board is how we chose WHICH models
 * to publish — not what to print as a figure.
 *
 * Scale lock: named models on /flip/{brand}/model/{slug} plus glossary and
 * brand hubs. Insufficient warehouse data is an em-dash, never an invented
 * sold_7d. Do not add doorway clones (Samba OG vs Samba, AF1 Low vs AF1).
 * Each row carries a unique `angle` so pages are not thin silhouette swaps.
 */
import raw from "../data/seo-models.json" with { type: "json" }
import brandsRaw from "../data/seo-brands.json" with { type: "json" }
import type { FaqItem } from "./faq-schema"
import type { BrandFigures } from "./market-numbers"
import type { HeroVerdict } from "./hero-verdict"
import { articleSocialMeta } from "./flip-category-meta.ts"
import { isUsableVerdict } from "./usable-verdict.ts"

export { isUsableVerdict }

function fmtCount(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("en-GB") : "—"
}

function fmtEur(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? `€${Math.round(n)}` : "—"
}

export interface SeoModel {
  brand: string
  brandSlug: string
  model: string
  slug: string
  query: string
  category: string
  freeCheck: boolean
  /** One-sentence silhouette ID. Must be unique — this is the anti-doorway. */
  angle: string
}

const parsed = (raw as { models: SeoModel[] }).models

export const SEO_MODELS: SeoModel[] = parsed

export const FREE_CHECK_QUERIES = SEO_MODELS.filter((m) => m.freeCheck).map((m) => m.query)

/** Brands that now have named model pages. Same template as every /flip/{brand}. */
export const SCALE_HUB_SLUGS = [
  "adidas",
  "nike",
  "new-balance",
  "levis",
  "jordan",
  "asics",
  "salomon",
  "converse",
  "dr-martens",
  "puma",
  "carhartt",
  "the-north-face",
  "patagonia",
  "stone-island",
  "fred-perry",
] as const

/** @deprecated week-1 name; same list minus the five scale hubs. Prefer SCALE_HUB_SLUGS. */
export const WEEK1_HUB_SLUGS = SCALE_HUB_SLUGS.slice(0, 10)

export function modelPath(m: SeoModel): string {
  return `/flip/${m.brandSlug}/model/${m.slug}`
}

export function getSeoModel(brandSlug: string, slug: string): SeoModel | undefined {
  return SEO_MODELS.find((m) => m.brandSlug === brandSlug && m.slug === slug)
}

export function modelsForBrand(brandSlug: string): SeoModel[] {
  return SEO_MODELS.filter((m) => m.brandSlug === brandSlug)
}

export function siblingModels(m: SeoModel): SeoModel[] {
  return modelsForBrand(m.brandSlug).filter((x) => x.slug !== m.slug)
}

export function brandHasCategory(brandSlug: string, category: string): boolean {
  const b = (brandsRaw as { brands: { slug: string; categories?: { category: string }[] }[] }).brands
    .find((row) => row.slug === brandSlug)
  return Boolean(b?.categories?.some((c) => c.category === category))
}

export function generateModelStaticParams() {
  return SEO_MODELS.map((m) => ({ brand: m.brandSlug, slug: m.slug }))
}

/** Answer-first, number-free <title>. Live figures age in the SERP. */
export function modelPageTitle(m: SeoModel): string {
  return `Should I buy ${m.query} to resell? — Resale IQ`
}

export function modelPageDescription(opts: {
  model: SeoModel
  sold: number | null | undefined
  avg: number | null | undefined
  live: HeroVerdict | null
}): string {
  const { model: m, sold, avg, live } = opts
  if (m.freeCheck && isUsableVerdict(live)) {
    return (
      `Should you buy ${m.query} to resell? ${live!.verdict}. ` +
      `Most to pay after fees: ${fmtBuyBelow(live!.buy_below)}. ` +
      `Other models Starter €19/mo.`
    )
  }
  const soldLabel = typeof sold === "number" && Number.isFinite(sold) ? sold.toLocaleString("en-GB") : null
  const avgLabel = typeof avg === "number" && Number.isFinite(avg) && avg > 0 ? `€${Math.round(avg)}` : null
  if (m.freeCheck) {
    return (
      `Should you buy ${m.query} to resell? Free sample: BUY, WATCH or SKIP and buy-below on /tools. ` +
      `Other models Starter €19/mo. ES/FR/DE/IT/PT.`
    )
  }
  if (soldLabel) {
    return (
      `${m.query}: named ${m.category.toLowerCase()} model. ${m.brand} has about ${soldLabel} watched departures a week` +
      (avgLabel ? ` at ${avgLabel}.` : ".") +
      ` BUY/WATCH/SKIP is Starter €19/mo.`
    )
  }
  return (
    `Should you buy ${m.query} to resell? ${m.brand} demand is public on /data. ` +
    `Item-level BUY, WATCH or SKIP is Starter €19/mo. Not a free check.`
  )
}

export function modelSocialMeta(
  m: SeoModel,
  description: string,
) {
  return articleSocialMeta(modelPageTitle(m), description, modelPath(m))
}

export function fmtBuyBelow(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? `€${n.toFixed(2)}` : "—"
}

export function liveAnswerLead(query: string, r: HeroVerdict | null): string | null {
  if (!isUsableVerdict(r)) return null
  return `Should you buy ${query} to resell? ${r.verdict}. Most to pay after fees: ${fmtBuyBelow(r.buy_below)}.`
}

/**
 * Unique on-page prose from live BRAND figures + sibling names. Never a
 * model-level invented sold_7d. Null brand figures drop the count sentence.
 */
export function modelDemandParagraphs(
  m: SeoModel,
  brand: BrandFigures | null,
  siblings: SeoModel[],
): string[] {
  const paras: string[] = []
  const sold = brand?.sold_7d ?? null
  const avg = brand?.avg_price_eur ?? null
  const cat = m.category.toLowerCase()

  paras.push(
    `${m.query} is a named ${cat} model, not a ${m.brand} brand average. ` +
      `${m.angle} ` +
      `Know what sells — then decide whether to buy this one. ` +
      `A brand figure mixes every silhouette; the buy-below that matters is this model's own watched departures.`,
  )

  if (sold != null) {
    paras.push(
      `${m.brand} as a brand has about ${fmtCount(sold)} watched departures a week across Spain, France, Germany, Italy and Portugal` +
        (avg != null ? `, at an average asking price at departure of ${fmtEur(avg)}` : "") +
        `. That is brand demand, public on /data. It is not the ${m.model} ceiling and it is not a sell-through rate.`,
    )
  } else {
    paras.push(
      `${m.brand} is tracked across Spain, France, Germany, Italy and Portugal. ` +
        `Live weekly brand volume is not on this snapshot — check /data rather than treating a missing cell as zero.`,
    )
  }

  if (m.freeCheck) {
    paras.push(
      `${m.query} is a free sample: BUY, WATCH or SKIP and the buy-below render on this page when the live check returns. ` +
        `Other models, including the rest of ${m.brand}, need Starter at €19 a month. Weekly brand volumes stay public.`,
    )
  } else {
    paras.push(
      `${m.query} is not a free check. Adidas Samba, Nike Air Force 1 and New Balance 530 are the free sample. ` +
        `This model's BUY, WATCH or SKIP and buy-below start at Starter €19 a month. ` +
        `Do not treat the ${m.brand} average as the ${m.model} number.`,
    )
  }

  if (siblings.length) {
    const names = siblings.map((s) => s.query + (s.freeCheck ? " (free sample)" : "")).join(", ")
    paras.push(`Other ${m.brand} models on this site: ${names}.`)
  }

  return paras
}

export function modelFaqs(opts: {
  model: SeoModel
  live: HeroVerdict | null
  sold: number | null
  avg: number | null
}): FaqItem[] {
  const { model: m, live, sold, avg } = opts
  const buyBelowDef =
    "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. " +
    "Resale IQ models it as average asking price at departure × 0.95 × 0.70. " +
    "It is a sourcing ceiling, not a promised profit. Method: https://resaleiq.dev/glossary/buy-below-market"

  const shouldBuy = m.freeCheck && isUsableVerdict(live)
    ? `Should you buy ${m.query} to resell? ${live!.verdict}. Most to pay after fees: ${fmtBuyBelow(live!.buy_below)}. Tracked markets are Spain, France, Germany, Italy and Portugal — not the UK.`
    : m.freeCheck
      ? `Should you buy ${m.query} to resell? This model is a free sample on https://resaleiq.dev/tools — BUY, WATCH or SKIP and buy-below when the live check returns. Other models need Starter at €19 a month.`
      : `Should you buy ${m.query} to resell? Item-level BUY, WATCH or SKIP and the buy-below for this model start at Starter €19 a month at https://resaleiq.dev/pricing. ${m.brand} weekly demand stays public at https://resaleiq.dev/data and https://resaleiq.dev/flip/${m.brandSlug}. This page is not a free check.`

  const freeQ = m.freeCheck
    ? {
        q: `Is the ${m.query} check free?`,
        a:
          `Yes for this model: Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP on /tools with no account. ` +
          `Weekly brand volumes stay public at https://resaleiq.dev/data. Other item-level checks start at Starter €19 a month.`,
      }
    : {
        q: `Is the ${m.query} check free?`,
        a:
          `No. ${m.query} needs Starter at €19 a month. The free sample is Adidas Samba, Nike Air Force 1 and New Balance 530 on /tools. ` +
          `${m.brand} weekly volumes stay public at https://resaleiq.dev/data.`,
      }

  const demandA =
    sold != null
      ? `${m.brand} has about ${fmtCount(sold)} watched departures a week` +
        (avg != null ? ` at an average of ${fmtEur(avg)}` : "") +
        `. A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. Brand table: https://resaleiq.dev/data. Definition: https://resaleiq.dev/glossary/vinted-demand`
      : `${m.brand} weekly demand is on https://resaleiq.dev/data when the snapshot has a row. A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. Definition: https://resaleiq.dev/glossary/vinted-demand`

  return [
    { q: `Should I buy ${m.query} to resell?`, a: shouldBuy },
    freeQ,
    { q: "What is a buy-below price?", a: buyBelowDef },
    { q: `How much ${m.brand} demand is there on Vinted?`, a: demandA },
    {
      q: "Which Vinted markets does this cover?",
      a: "Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). Figures do not cover the UK or other Vinted domains. Check a model on https://resaleiq.dev/tools. Plans: https://resaleiq.dev/pricing.",
    },
  ]
}

/** Guard: every catalogue row must point at a brand that already has a /flip hub. */
export function modelsPointAtKnownBrands(): boolean {
  const slugs = new Set((brandsRaw as { brands: { slug: string }[] }).brands.map((b) => b.slug))
  return SEO_MODELS.every((m) => slugs.has(m.brandSlug))
}

/**
 * Visible HubFaq + FAQPage on /flip/{brand}. Same strings. No /register.
 * No UTM. Free-check honesty is per-brand: only Adidas/Nike/NB hubs that
 * actually list a teaser model may say yes.
 */
export function brandHubFaqs(opts: {
  brand: string
  brandSlug: string
  sold: number | null
  avg: number | null
  freeModels: SeoModel[]
}): FaqItem[] {
  const { brand, brandSlug, sold, avg, freeModels } = opts
  const worth =
    sold != null
      ? `${brand} has roughly ${fmtCount(sold)} watched departures per week across Spain, France, Germany, Italy and Portugal` +
        (avg != null ? `, at an average asking price at departure of ${fmtEur(avg)}.` : ".") +
        ` Whether it is profitable depends on the named model and the price you source it at. Weekly table: https://resaleiq.dev/data. Definition: https://resaleiq.dev/glossary/vinted-demand`
      : `${brand} is tracked across Spain, France, Germany, Italy and Portugal. Live weekly volume is on https://resaleiq.dev/data when this snapshot has a row. Whether it is profitable depends on the named model and the price you source it at. Definition: https://resaleiq.dev/glossary/vinted-demand`

  const velocity =
    sold != null
      ? `This week ${brand} shows about ${fmtCount(sold)} watched departures` +
        (avg != null ? ` at ${fmtEur(avg)} average asking price at departure` : "") +
        `. That is brand demand — not a sell-through rate and not a buy-below. Full ranking: https://resaleiq.dev/data. Sell-through definition: https://resaleiq.dev/glossary/vinted-sell-through`
      : `${brand} weekly velocity is listed on https://resaleiq.dev/data when the snapshot has a row. An em-dash means missing, not zero. Definition: https://resaleiq.dev/glossary/vinted-demand`

  const freeA = freeModels.length
    ? `Yes for ${freeModels.map((m) => m.query).join(", ")}: BUY, WATCH or SKIP and buy-below on https://resaleiq.dev/tools with no account. Other ${brand} models need Starter at €19 a month at https://resaleiq.dev/pricing.`
    : `No. ${brand} weekly volumes stay public at https://resaleiq.dev/data. Item-level BUY, WATCH or SKIP starts at Starter €19 a month at https://resaleiq.dev/pricing. The free sample is Adidas Samba, Nike Air Force 1 and New Balance 530 on https://resaleiq.dev/tools.`

  return [
    { q: `Is ${brand} worth reselling on Vinted?`, a: worth },
    { q: `How much ${brand} demand is there this week?`, a: velocity },
    { q: `Is the ${brand} check free?`, a: freeA },
    {
      q: "What is a buy-below price?",
      a:
        "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. " +
        "Resale IQ models it as average asking price at departure × 0.95 × 0.70. " +
        "It is a sourcing ceiling, not a promised profit. Method: https://resaleiq.dev/glossary/buy-below-market",
    },
    {
      q: "Which Vinted markets does this cover?",
      a:
        `Spain, France, Germany, Italy and Portugal (ES/FR/DE/IT/PT). Figures do not cover the UK or other Vinted domains. Brand table: https://resaleiq.dev/data. Named models: https://resaleiq.dev/flip/${brandSlug}. Plans: https://resaleiq.dev/pricing.`,
    },
  ]
}
