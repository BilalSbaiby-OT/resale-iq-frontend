/**
 * Pace tiers for the /buy surfaces: "Moving fast" / "Steady" / "Slow".
 *
 * WHY: /buy used to print 30-day departure totals (through a display floor).
 * Founder no-counts rule: no raw departure counts in copy. A tier says what a
 * reseller needs (does this move quickly relative to the rest of what we
 * track?) without printing a number that reads as "only N sold".
 *
 * RULE (rank-based, computed at GENERATION time by scripts/refresh-buy-data.mjs
 * and stored in src/data/buy-data.json; pages only read the stored tier):
 *   rank the items of one list by departures per day over the tracked window
 *   (sold_30d / window days; the window is the same for every row so the order
 *   equals the order by sold_30d). Top third = fast, middle third = steady,
 *   bottom third = slow. Rows with the same value always get the same tier
 *   (the tier of the best rank in the tie group), so a tie never splits.
 * Three lists are ranked separately, each against its own peers:
 *   brand x category pairs (cat.tier), brands (brand.tier), categories
 *   (data.category_tiers, by total across brands).
 *
 * The raw number stays in the JSON only for sorting; no page prints it.
 * Client-safe: no node:fs, no imports beyond the Locale type.
 */
import type { Locale } from "./i18n"

export type BuyTier = "fast" | "steady" | "slow"

/** Departures are counted over this many days (the export is a 30-day window). */
export const BUY_WINDOW_DAYS = 30

/** Natural wording per locale. Never "sold" / "vendu" / "verkauft" / "se revend". */
export const BUY_TIER_LABELS: Record<Locale, Record<BuyTier, string>> = {
  en: { fast: "Moving fast", steady: "Steady", slow: "Slow" },
  fr: { fast: "Part vite", steady: "Régulier", slow: "Lent" },
  de: { fast: "Geht schnell", steady: "Stetig", slow: "Langsam" },
  es: { fast: "Se mueve rápido", steady: "Constante", slow: "Lento" },
  it: { fast: "Va via veloce", steady: "Costante", slow: "Lento" },
  pt: { fast: "Sai rápido", steady: "Constante", slow: "Lento" },
}

export function buyTierLabel(tier: BuyTier | null | undefined, locale: Locale = "en"): string {
  return tier ? BUY_TIER_LABELS[locale][tier] : "—"
}

/** Accent per tier for the small chip (green / amber / grey, matches signalDisplay). */
export function buyTierColors(tier: BuyTier | null | undefined): { color: string; bgColor: string } {
  switch (tier) {
    case "fast":
      return { color: "#06090c", bgColor: "#34C759" }
    case "steady":
      return { color: "#06090c", bgColor: "#FF9500" }
    case "slow":
      return { color: "#c3cde0", bgColor: "#2a3550" }
    default:
      return { color: "#5b6b8c", bgColor: "transparent" }
  }
}

/**
 * Tier for each item of ONE list, by departures per day. Returns tiers in the
 * input order. Non-finite / negative values rank last (slow). Empty -> [].
 */
export function assignBuyTiers(departures: ReadonlyArray<number | null | undefined>): BuyTier[] {
  const n = departures.length
  const perDay = departures.map((d) => (typeof d === "number" && Number.isFinite(d) && d > 0 ? d / BUY_WINDOW_DAYS : 0))
  const order = perDay.map((_, i) => i).sort((a, b) => perDay[b] - perDay[a] || a - b)
  const fastEnd = Math.ceil(n / 3)
  const steadyEnd = Math.ceil((2 * n) / 3)
  const out: BuyTier[] = new Array(n)
  let groupTier: BuyTier = "fast"
  for (let rank = 0; rank < n; rank++) {
    const i = order[rank]
    // A tie group takes the tier of its first (best) rank.
    if (rank === 0 || perDay[i] !== perDay[order[rank - 1]]) {
      groupTier = rank < fastEnd ? "fast" : rank < steadyEnd ? "steady" : "slow"
    }
    out[i] = groupTier
  }
  return out
}

interface TierableCategory {
  category: string
  sold_30d: number
  tier?: BuyTier
}
interface TierableBrand {
  sold_30d: number
  tier?: BuyTier
  categories: TierableCategory[]
}
export interface TierableData {
  brands: TierableBrand[]
  category_tiers?: Record<string, BuyTier>
}

/**
 * Stamp tiers into the export (mutates and returns `data`): cat.tier on every
 * brand x category pair, brand.tier on every brand, category_tiers by category
 * name (ranked on the total across brands). Idempotent.
 */
export function applyBuyTiers<T extends TierableData>(data: T): T & TierableData {
  const pairs = data.brands.flatMap((b) => b.categories)
  assignBuyTiers(pairs.map((c) => c.sold_30d)).forEach((t, i) => {
    pairs[i].tier = t
  })
  assignBuyTiers(data.brands.map((b) => b.sold_30d)).forEach((t, i) => {
    data.brands[i].tier = t
  })
  const totals = new Map<string, number>()
  for (const c of pairs) totals.set(c.category, (totals.get(c.category) ?? 0) + c.sold_30d)
  const names = [...totals.keys()]
  const tiers = assignBuyTiers(names.map((k) => totals.get(k)!))
  data.category_tiers = Object.fromEntries(names.map((k, i) => [k, tiers[i]]))
  return data
}
