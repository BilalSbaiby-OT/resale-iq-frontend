/**
 * EX-FLIP-CATEGORY-META — programmatic <title> / og / twitter for the
 * /flip/{brand}, /flip/{brand}/{cat} and /category/{cat} leaves.
 *
 * Titles are answer-first demand/money intent. They never carry a live
 * figure: a number in <title> ages in the SERP. Metas may cite warehouse
 * watched-departures / avg-at-departure when the snapshot has them.
 *
 * Root layout pins homepage og:title / twitter:title. A child `title`
 * alone does not override those tags — every caller must set both.
 *
 * Count/euro formatting matches `fmtCount` / `fmtEur` in market-numbers
 * (null → never a digit). Kept local so node --test can load this file
 * without resolving the warehouse module.
 *
 * A count below the display floor (departure-display.ts: 10) is never put in
 * a meta description — countLabel() returns null and the caller falls back to
 * its count-free sentence. "Leads with N" additionally needs n >= 30.
 */
import { departureIsPrintable, departureSupportsConclusion } from "./departure-display.ts"

function countLabel(n: number | null | undefined): string | null {
  return departureIsPrintable(n) ? n.toLocaleString("en-GB") : null
}

function eurLabel(n: number | null | undefined): string | null {
  return typeof n === "number" && Number.isFinite(n) && n > 0
    ? `€${Math.round(n)}`
    : null
}

export const META_SUFFIX = " — Resale IQ"

/**
 * The /flip hub. Number-free title: the page used to say "32 brands ranked"
 * (the length of a frozen JSON export) while six of the 32 rendered an em-dash,
 * and a live count in a <title> flaps in the SERP anyway. The count lives in
 * the description and the body, where it is computed from the rows shown.
 */
export function flipHubTitle(): string {
  return "What sells best on Vinted in 2026? Brands ranked"
}

/**
 * `rankedCount` = brands in the table that have a live weekly figure, i.e. the
 * rows the page actually ranks. It is not the tracked set and not the number of
 * /flip pages. null / 0 drops the number from the sentence.
 */
export function flipHubDescription(rankedCount: number | null): string {
  const ranked = rankedCount != null && rankedCount > 0 ? `${rankedCount} brands ranked` : "brands ranked"
  return (
    `What sells best on Vinted in 2026: ${ranked} by weekly watched ` +
    `departures across 5 EU markets, average prices at departure, and the categories that move.`
  )
}

export function flipBrandTitle(brand: string): string {
  return `${brand} on Vinted: weekly departures${META_SUFFIX}`
}

export function flipBrandCategoryTitle(brand: string, category: string): string {
  return `${brand} ${category.toLowerCase()}: demand & buy-below${META_SUFFIX}`
}

export function categoryLeafTitle(category: string): string {
  return `Do ${category.toLowerCase()} sell on Vinted? Category demand${META_SUFFIX}`
}

export function flipBrandDescription(opts: {
  brand: string
  sold: number | null | undefined
  avg: number | null | undefined
}): string {
  const { brand, avg } = opts
  // Leads with the price answer and prints no count: a small count in a SERP
  // snippet reads as "this brand barely sells" (founder decision 2026-10-02).
  const avgLabel = eurLabel(avg)
  if (avgLabel) {
    return (
      `${brand} resells for about ${avgLabel} on average at departure across 5 EU Vinted markets. ` +
      `Then check buy-below on the exact model.`
    )
  }
  return (
    `${brand} on Vinted across ES/FR/DE/IT/PT: average asking price at departure ` +
    `and the buy-below on the exact model.`
  )
}

export function flipBrandCategoryDescription(opts: {
  brand: string
  category: string
  tracked: string
}): string {
  const { brand, category, tracked } = opts
  const lower = category.toLowerCase()
  if (tracked && tracked !== "—") {
    return (
      `${brand} ${lower}: watched departures from ${tracked} listing records across 5 EU Vinted markets. ` +
      `Demand first — then buy-below on the exact item.`
    )
  }
  return (
    `${brand} ${lower} on Vinted: watched departures and demand across ES/FR/DE/IT/PT. ` +
    `Buy-below is the most you can pay and still keep a healthy margin.`
  )
}

/**
 * "26 brands ranked" / "1 brand ranked" / "Brands ranked" (none). `n` must be
 * the number of brands the page really ranks — those with a live figure for the
 * category — never a count of brand pages from the frozen JSON, which includes
 * brands that render an em-dash and printed "1 brands ranked" for coats.
 */
export function rankedBrandsLabel(n: number): string {
  if (n === 1) return "1 brand ranked"
  return n > 1 ? `${n} brands ranked` : "Brands ranked"
}

/** "the 26 brands ranked on this page" — for prose; drops the number when none are ranked. */
export function rankedBrandsPhrase(n: number): string {
  if (n === 1) return "the one brand ranked on this page"
  return n > 1 ? `the ${n} brands ranked on this page` : "the brands ranked on this page"
}

export function categoryLeafDescription(opts: {
  category: string
  /** Brands with a live weekly figure in this category (see rankedBrandsLabel). */
  brandCount: number
  topBrand: string | null
  topSold: number | null | undefined
}): string {
  const lower = opts.category.toLowerCase()
  // No count in the snippet (founder decision 2026-10-02): the leader is named,
  // the number is not.
  const ranked = rankedBrandsLabel(opts.brandCount)
  if (opts.topBrand && departureSupportsConclusion(opts.topSold)) {
    return (
      `Do ${lower} sell? ${ranked} by watched departures on Vinted across 5 EU markets. ` +
      `${opts.topBrand} leads — then check buy-below.`
    )
  }
  return (
    `Do ${lower} sell on Vinted? ${ranked} by watched departures across 5 EU markets. ` +
    `Category demand first — then buy-below on a specific item.`
  )
}

/** Same string for <title>, og:title and twitter:title. */
export function articleSocialMeta(
  title: string,
  description: string,
  canonical: string,
) {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "article" as const },
    twitter: { card: "summary_large_image" as const, title, description },
  }
}
