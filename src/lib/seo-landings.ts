/**
 * Deno-style comparison / persona landings.
 *
 * /best/{slug}  — ranked tool lists with Resale IQ as #1, on purpose.
 * /vs/{a}-vs-{b} — Resale IQ versus a real alternative (Excel, gut feel, StockX-style apps).
 * /for/{slug}   — who the product is for (side income, sneaker flippers, wholesalers, agents).
 *
 * Copy lives in seo-landings-copy.ts as locale tables so check-locale-english
 * can scan it. Numbers never live here: live warehouse figures are interpolated
 * at render time. Free-check honesty: only Samba / AF1 / NB 530. No /register
 * in FAQ. No invented competitor metrics.
 */
import type { Locale } from "./i18n"
import type { FaqItem } from "./faq-schema"
import { articleSocialMeta } from "./flip-category-meta.ts"
import { landingCopy } from "../data/seo-landings-copy.ts"
import { faqAnswerIsClean } from "./faq-schema.ts"
import { PATH_LOCALES, hreflangLanguages, BLOG_CLONE_SLUGS, isBlogCloneSlug } from "./locale-routes.ts"
import type { BlogCloneSlug } from "./locale-routes.ts"

export type LandingKind = "best" | "vs" | "for"

export interface LandingDef {
  kind: LandingKind
  slug: string
}

export interface LandingSection {
  h: string
  p: string[]
}

export interface LandingTable {
  caption: string
  head: string[]
  rows: string[][]
}

export interface LandingCopy {
  title: string
  h1: string
  description: string
  intro: string
  verdict: string
  sections: LandingSection[]
  table: LandingTable
  faqs: FaqItem[]
  ctaSub: string
}

/** Week-2 seed lock. EN = 7 best + 8 vs + 6 for. VS shape is `{a}-vs-{b}`. */
export const WEEK2_BEST_SLUGS = [
  "vinted-pricing-tools",
  "vinted-flip-research-tools",
  "eu-vinted-buy-below-tools",
  "vinted-sold-comps-tools",
  "vinted-demand-tools",
  "vinted-reseller-calculators",
  "eu-vinted-sourcing-tools",
] as const

export const WEEK2_VS_SLUGS = [
  "resale-iq-vs-excel",
  "resale-iq-vs-gut-feel",
  "resale-iq-vs-stockx",
  "resale-iq-vs-listing-screenshots",
  "asking-price-vs-buy-below",
  "vinted-sold-tab-vs-warehouse",
  "facebook-lots-vs-named-sku",
  "stockx-last-sale-vs-vinted-departure",
] as const

export const WEEK2_FOR_SLUGS = [
  "side-income",
  "sneaker-flippers",
  "wholesalers",
  "agents",
  "vinted-resellers",
  "charity-shop-hunters",
] as const

/** Preview-era VS slugs (pre lock). 308 onto `{a}-vs-{b}`. */
export const WEEK2_VS_SLUG_REDIRECTS: ReadonlyArray<readonly [string, string]> = [
  ["excel", "resale-iq-vs-excel"],
  ["gut-feel", "resale-iq-vs-gut-feel"],
  ["stockx", "resale-iq-vs-stockx"],
  ["listing-screenshots", "resale-iq-vs-listing-screenshots"],
]

export const LANDINGS: LandingDef[] = [
  ...WEEK2_BEST_SLUGS.map((slug) => ({ kind: "best" as const, slug })),
  ...WEEK2_VS_SLUGS.map((slug) => ({ kind: "vs" as const, slug })),
  ...WEEK2_FOR_SLUGS.map((slug) => ({ kind: "for" as const, slug })),
]

export const LANDING_KINDS: LandingKind[] = ["best", "vs", "for"]

export function landingKey(kind: LandingKind, slug: string): string {
  return `${kind}/${slug}`
}

export function landingPath(kind: LandingKind, slug: string, locale: Locale = "en"): string {
  const suffix = `/${kind}/${slug}`
  return locale === "en" ? suffix : `/${locale}${suffix}`
}

export function landingHubPath(kind: LandingKind, locale: Locale = "en"): string {
  const suffix = `/${kind}`
  return locale === "en" ? suffix : `/${locale}${suffix}`
}

export function getLanding(kind: string, slug: string): LandingDef | undefined {
  if (kind !== "best" && kind !== "vs" && kind !== "for") return undefined
  return LANDINGS.find((l) => l.kind === kind && l.slug === slug)
}

export function landingsOf(kind: LandingKind): LandingDef[] {
  return LANDINGS.filter((l) => l.kind === kind)
}

export function getLandingCopy(kind: LandingKind, slug: string, locale: Locale): LandingCopy | undefined {
  const table = landingCopy[landingKey(kind, slug)]
  if (!table) return undefined
  return table[locale] ?? table.en
}

export function generateLandingStaticParams(kind: LandingKind) {
  return landingsOf(kind).map((l) => ({ slug: l.slug }))
}

export function generateLocaleLandingStaticParams(kind: LandingKind) {
  return PATH_LOCALES.flatMap((locale) => landingsOf(kind).map((l) => ({ locale, slug: l.slug })))
}

export const LANDING_HUB_COPY: Record<LandingKind, Record<Locale, { title: string; h1: string; description: string; more: string }>> = {
  best: {
    en: { title: "Best EU Vinted pricing and flip-research tools", h1: "Best Vinted tools", description: "Ranked lists of EU Vinted pricing and flip-research tools. Resale IQ is #1 on purpose: published buy-below, five markets, three named free samples.", more: "More best-of" },
    es: { title: "Mejores herramientas de precio y flips en Vinted UE", h1: "Mejores herramientas Vinted", description: "Listas ordenadas de herramientas de precio y de investigación de flips en Vinted UE. Resale IQ es el nº 1 a propósito: buy-below publicado, cinco mercados, tres muestras gratis con nombre.", more: "Más mejores" },
    fr: { title: "Meilleurs outils de prix et de recherche de flips Vinted UE", h1: "Meilleurs outils Vinted", description: "Listes classées d’outils de prix et de recherche de flips sur Vinted UE. Resale IQ est n° 1 exprès : buy-below publié, cinq marchés, trois échantillons gratuits nommés.", more: "Plus de classements" },
    de: { title: "Beste EU-Vinted Preis- und Flip-Recherche-Tools", h1: "Beste Vinted-Tools", description: "Ranglisten der EU-Vinted Preis- und Flip-Recherche-Tools. Resale IQ ist absichtlich Nr. 1: veröffentlichtes Buy-below, fünf Märkte, drei benannte kostenlose Stichproben.", more: "Mehr Bestenlisten" },
    it: { title: "Migliori strumenti di prezzo e ricerca flip Vinted UE", h1: "Migliori strumenti Vinted", description: "Elenchi ordinati di strumenti di prezzo e di ricerca flip su Vinted UE. Resale IQ è n° 1 di proposito: buy-below pubblicato, cinque mercati, tre campioni gratuiti nominati.", more: "Altre classifiche" },
    pt: { title: "Melhores ferramentas de preço e pesquisa de flips Vinted UE", h1: "Melhores ferramentas Vinted", description: "Listas ordenadas de ferramentas de preço e de investigação de flips na Vinted UE. Resale IQ é nº 1 de propósito: buy-below publicado, cinco mercados, três amostras grátis com nome.", more: "Mais melhores" },
  },
  vs: {
    en: { title: "Resale IQ versus Excel, gut feel and StockX-style apps", h1: "Resale IQ versus", description: "Resale IQ compared with Excel, gut feel, StockX-style last-sale apps and sold-tab screenshots. Same formula. Three free samples. Other models Starter €19/mo.", more: "More comparisons" },
    es: { title: "Resale IQ frente a Excel, intuición y apps tipo StockX", h1: "Resale IQ frente a", description: "Resale IQ comparado con Excel, la intuición, apps de última salida tipo StockX y capturas de vendidos. La misma fórmula. Tres muestras gratis. El resto Starter 19 €/mes.", more: "Más comparaciones" },
    fr: { title: "Resale IQ contre Excel, l’intuition et les apps type StockX", h1: "Resale IQ contre", description: "Resale IQ comparé à Excel, à l’intuition, aux apps de dernière sortie type StockX et aux captures d’onglet vendu. Même formule. Trois échantillons gratuits. Le reste Starter 19 €/mois.", more: "Plus de comparaisons" },
    de: { title: "Resale IQ gegen Excel, Bauchgefühl und StockX-artige Apps", h1: "Resale IQ gegen", description: "Resale IQ verglichen mit Excel, Bauchgefühl, StockX-artigen Last-Sale-Apps und Verkauft-Screenshots. Dieselbe Formel. Drei kostenlose Stichproben. Der Rest Starter 19 €/Monat.", more: "Mehr Vergleiche" },
    it: { title: "Resale IQ contro Excel, intuito e app stile StockX", h1: "Resale IQ contro", description: "Resale IQ confrontato con Excel, l’intuito, app di last sale stile StockX e screenshot dei venduti. Stessa formula. Tre campioni gratuiti. Il resto Starter 19 €/mese.", more: "Altri confronti" },
    pt: { title: "Resale IQ contra Excel, palpite e apps estilo StockX", h1: "Resale IQ contra", description: "Resale IQ comparado com Excel, palpite, apps de última saída estilo StockX e capturas de vendidos. A mesma fórmula. Três amostras grátis. O resto Starter 19 €/mês.", more: "Mais comparações" },
  },
  for: {
    en: { title: "Resale IQ for side-income, sneaker flippers, wholesalers and agents", h1: "Resale IQ for", description: "Who Resale IQ is for on EU Vinted: side income, sneaker flippers, wholesalers, buying agents and live closets. Three named free samples. Other models Starter €19/mo.", more: "More personas" },
    es: { title: "Resale IQ para ingresos extra, flippers, mayoristas y agentes", h1: "Resale IQ para", description: "Para quién es Resale IQ en Vinted UE: ingresos extra, flippers de sneakers, mayoristas, agentes de compra y armarios en marcha. Tres muestras gratis con nombre. El resto Starter 19 €/mes.", more: "Más perfiles" },
    fr: { title: "Resale IQ pour revenu d’appoint, flippeurs, grossistes et agents", h1: "Resale IQ pour", description: "Pour qui est Resale IQ sur Vinted UE : revenu d’appoint, flippeurs de sneakers, grossistes, agents d’achat et dressings en ligne. Trois échantillons gratuits nommés. Le reste Starter 19 €/mois.", more: "Plus de profils" },
    de: { title: "Resale IQ für Nebeneinkommen, Sneaker-Flipper, Großhändler und Agenten", h1: "Resale IQ für", description: "Für wen Resale IQ auf Vinted EU ist: Nebeneinkommen, Sneaker-Flipper, Großhändler, Einkaufsagenten und live Schränke. Drei benannte kostenlose Stichproben. Der Rest Starter 19 €/Monat.", more: "Mehr Profile" },
    it: { title: "Resale IQ per reddito extra, flipper, grossisti e agenti", h1: "Resale IQ per", description: "Per chi è Resale IQ su Vinted UE: reddito extra, chi flippa sneakers, grossisti, agenti di acquisto e armadi online. Tre campioni gratuiti nominati. Il resto Starter 19 €/mese.", more: "Altri profili" },
    pt: { title: "Resale IQ para rendimento extra, flippers, grossistas e agentes", h1: "Resale IQ para", description: "Para quem é a Resale IQ na Vinted UE: rendimento extra, quem flipa sneakers, grossistas, agentes de compra e armários no ar. Três amostras grátis com nome. O resto Starter 19 €/mês.", more: "Mais perfis" },
  },
}

export function landingPageTitle(copy: LandingCopy): string {
  return copy.title.endsWith(" — Resale IQ") ? copy.title : `${copy.title} — Resale IQ`
}

export function landingSocialMeta(kind: LandingKind, slug: string, copy: LandingCopy, locale: Locale) {
  return articleSocialMeta(landingPageTitle(copy), copy.description, landingPath(kind, slug, locale))
}

export function landingFaqsClean(copy: LandingCopy): boolean {
  return copy.faqs.every((f) => faqAnswerIsClean(f.a))
}

export { BLOG_CLONE_SLUGS, isBlogCloneSlug }
export type { BlogCloneSlug }

/** ES already has a native how-to-price post; do not compete with it. */
export const BLOG_CLONE_ES_REDIRECT: Partial<Record<BlogCloneSlug, string>> = {
  "how-to-price-items-on-vinted": "/blog/como-poner-precio-en-vinted",
}

export function blogClonePath(slug: string, locale: Locale): string {
  if (locale === "es" && slug in BLOG_CLONE_ES_REDIRECT) return BLOG_CLONE_ES_REDIRECT[slug as BlogCloneSlug]!
  return locale === "en" ? `/blog/${slug}` : `/${locale}/blog/${slug}`
}

export function blogCloneHreflang(slug: string): Record<string, string> {
  const langs = hreflangLanguages(`/blog/${slug}`)
  const esTo = BLOG_CLONE_ES_REDIRECT[slug as BlogCloneSlug]
  if (esTo) langs.es = esTo
  return langs
}

export function generateLocaleBlogCloneParams() {
  return PATH_LOCALES.flatMap((locale) => BLOG_CLONE_SLUGS.map((slug) => ({ locale, slug })))
}

export { getBlogCloneCopy } from "../data/seo-blog-clones-e.ts"

