/**
 * Programmatic SEO data for the /buy route family.
 *
 * Source: market_stats table (Vinted DE/FR/ES/IT/PT), aggregated 30-day windows.
 * Threshold: sold_30d >= 3 real departures per pair.
 * Generated: 2026-09-22. Refresh via scripts/refresh-buy-data.mjs.
 *
 * Rule: every number on these pages must come from this file or the live
 * market-snapshot API. No fabrication, no supply-as-demand confusion.
 *
 * WORDING: `sold_30d` is a count of listings we WATCHED LEAVE THE SHELF in the
 * 30 days to `generated_at` — a watched departure, never a confirmed sale and
 * never "sold". Days-to-sell is not published (the engine withholds it
 * product-wide); `avg_days_to_sell` stays in the export but no page prints it.
 * Counts go through fmtDeparturesBuy() so the display floor applies here too.
 */
import raw from "@/data/buy-data.json"
import { departureDisplay } from "./departure-display.ts"

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
   * Buy-below: the most a reseller should pay and still hit a 30% gross margin.
   * Formula: avg_price_eur × 0.70 (no fee factor: Vinted charges private sellers
   * no selling fee). Same formula as engine/insight.buy_below_from_avg and
   * /api/verdict buy_below; BUY_BELOW_MULTIPLIER in lib/buy-below.ts.
   * avg_price_eur here is the average SOLD price from market_stats (30-day window).
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

/** A 30-day watched-departure count through the display floor (—, "Fewer than 10", digits). */
export function fmtDeparturesBuy(n: number | null): string {
  return departureDisplay(n).text
}

const BUY_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/**
 * "22 September 2026" — the export date. Every sentence that prints a 30-day
 * count says "in the 30 days to <this>", because the export is a dated
 * snapshot, not a live figure.
 */
export function buyDataDate(): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(BUY_DATA.generated_at)
  if (!m) return BUY_DATA.generated_at
  return `${Number(m[3])} ${BUY_MONTHS[Number(m[2]) - 1]} ${m[1]}`
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
