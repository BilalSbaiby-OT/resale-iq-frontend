/**
 * Programmatic SEO data for the /buy route family.
 *
 * Source: market_stats table (Vinted DE/FR/ES/IT/PT), aggregated 30-day windows.
 * Threshold: sold_30d >= 3 real departures per pair.
 * Generated: 2026-09-22. Refresh via scripts/refresh-buy-data.mjs.
 *
 * Rule: every number on these pages must come from this file or the live
 * market-snapshot API. No fabrication, no supply-as-demand confusion.
 */
import raw from "@/data/buy-data.json"

export interface BuyCategory {
  category: string
  slug: string
  /** Estimated 30-day departures (avg across available market_stats snapshots) */
  sold_30d: number
  /** Average price at departure in EUR */
  avg_price_eur: number | null
  /** Median price at departure in EUR */
  median_price_eur: number | null
  /**
   * Buy-below: the most a reseller should pay and still hit a ~45% gross margin
   * after platform fees. Derived as avg_price_eur * 0.55.
   * This is an aggregate estimate — individual item condition + size affect this.
   */
  buy_below: number | null
  /** Average days on shelf before departure */
  avg_days_to_sell: number | null
  /** Active listings count (supply side) */
  active_listings: number | null
  /** Demand signal from demand_index: STRONG BUY / BUY / MONITOR / AVOID */
  signal: string | null
  /** Signal confidence 0–100 */
  confidence: number | null
}

export interface BuyBrand {
  brand: string
  slug: string
  /** Estimated total 30-day departures across all categories */
  sold_30d: number
  /** Blended avg price across categories */
  avg_price_eur: number
  /** 3 highest-volume categories */
  top_categories: string[]
  /** All tracked categories with full stats */
  categories: BuyCategory[]
}

export interface BuyData {
  generated_at: string
  source: string
  threshold: string
  total_pairs: number
  total_brands: number
  brands: BuyBrand[]
}

export const BUY_DATA = raw as BuyData

/**
 * Batch 1 rollout — top 20 pairs by 30-day sold volume (all ≥189/mo).
 *
 * WHY: Google Search Console shows 2/3 of our existing /flip/* programmatic
 * pages are not indexed despite sitemap inclusion. Root cause: thin pages +
 * no path from indexed pages to the generated leaves. We publish batch 1
 * (top-evidence pages only), build real link paths from indexed pages, then
 * inspect with GSC URL Inspection API after 2-3 weeks. If indexed → scale to
 * all 231 pairs. If "Discovered not indexed" → template is still too thin.
 *
 * Upgrade path: expand this set and update the sitemap filter to scale.
 */
export const BUY_BATCH1_SLUGS = new Set<string>([
  "stone-island/hoodies",
  "fred-perry/shirts",
  "patagonia/jackets",
  "new-balance/sneakers",
  "patagonia/bags",
  "stone-island/jackets",
  "balenciaga/sneakers",
  "fred-perry/t-shirts",
  "the-north-face/jackets",
  "patagonia/hoodies",
  "gucci/bags",
  "diesel/jeans",
  "fred-perry/hoodies",
  "stone-island/shirts",
  "off-white/shirts",
  "gucci/caps",
  "patagonia/t-shirts",
  "stone-island/t-shirts",
  "nike/sneakers",
  "patagonia/caps",
])

/** Only the batch-1 pairs — used by generateStaticParams and sitemap */
export const BUY_BATCH1_PAIRS: Array<{ brand: BuyBrand; cat: BuyCategory }> = (() => {
  const result: Array<{ brand: BuyBrand; cat: BuyCategory }> = []
  for (const brand of BUY_DATA.brands) {
    for (const cat of brand.categories) {
      if (BUY_BATCH1_SLUGS.has(`${brand.slug}/${cat.slug}`)) {
        result.push({ brand, cat })
      }
    }
  }
  return result.sort((a, b) => b.cat.sold_30d - a.cat.sold_30d)
})()

export const catSlug = (c: string) =>
  c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

/** All distinct categories across the dataset, sorted by total volume */
export const BUY_CATEGORIES: string[] = (() => {
  const vol = new Map<string, number>()
  for (const b of BUY_DATA.brands) {
    for (const c of b.categories) {
      vol.set(c.category, (vol.get(c.category) ?? 0) + c.sold_30d)
    }
  }
  return [...vol.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
})()

/** Lookup a brand by slug */
export function getBuyBrand(slug: string): BuyBrand | undefined {
  return BUY_DATA.brands.find((b) => b.slug === slug)
}

/** Lookup a brand+category pair */
export function getBuyPair(
  brandSlug: string,
  categorySlug: string,
): { brand: BuyBrand; cat: BuyCategory } | undefined {
  const brand = getBuyBrand(brandSlug)
  if (!brand) return undefined
  const cat = brand.categories.find((c) => c.slug === categorySlug || catSlug(c.category) === categorySlug)
  if (!cat) return undefined
  return { brand, cat }
}

/** Format EUR: €52 or €52.50 */
export function fmtEurBuy(n: number | null): string {
  if (n == null) return "—"
  return `€${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`
}

/** Format count: 1,234 */
export function fmtCountBuy(n: number | null): string {
  if (n == null) return "—"
  return n.toLocaleString("en-GB")
}

/** Signal display label + colour */
export function signalDisplay(signal: string | null): {
  label: string
  color: string
  bgColor: string
} {
  switch (signal) {
    case "STRONG BUY":
      return { label: "STRONG BUY", color: "#06090c", bgColor: "#34C759" }
    case "BUY":
      return { label: "BUY", color: "#06090c", bgColor: "#5AC8FA" }
    case "MONITOR":
      return { label: "MONITOR", color: "#06090c", bgColor: "#FF9500" }
    case "AVOID":
      return { label: "AVOID", color: "#eef1f7", bgColor: "#FF3B30" }
    default:
      return { label: "—", color: "#5b6b8c", bgColor: "transparent" }
  }
}
