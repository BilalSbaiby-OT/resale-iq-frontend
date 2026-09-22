/**
 * THE WAREHOUSE. Every "sold this week / average price / models tracked" figure
 * on the site comes from here, and from nowhere else.
 *
 * WHY THIS EXISTS
 * There were two sources of the same numbers and they disagreed:
 *
 *   live   /api/public/market-snapshot  — current, recomputed continuously
 *   static src/data/seo-brands.json     — a build-time export, frozen forever
 *
 * `/flip/[brand]` (156 pages) read ONLY the static file, so its numbers — in the
 * <title>, the meta description, the FAQ JSON-LD and the table — were fixed at
 * whenever someone last ran the export. `/flip/[brand]/[category]` and
 * `/category/[category]` fetched live but fell back to the frozen figure with
 * `??` the moment a brand was missing, silently serving a stale number that
 * looked live. That is the same failure as the hardcoded "500,000+" that
 * src/lib/stats.ts exists to prevent, one level down.
 *
 * THE SPLIT, and it is deliberate:
 *   static JSON  ->  STRUCTURE ONLY. Which brands and categories exist, and
 *                    their slugs. Routes must be stable at build time, and a
 *                    route that appears or vanishes with the market would break
 *                    the sitemap contract.
 *   this module  ->  EVERY NUMBER. Live, with the last-good snapshot behind it.
 *
 * A figure we cannot currently get back is `null`. It is NOT the old number, and
 * it is NOT zero — callers render an em-dash or drop the sentence. Serving a
 * frozen number as though it were current is the specific dishonesty being
 * removed here, so re-introducing a `?? staticValue` anywhere downstream undoes
 * the whole change.
 */
import { readLastGood, writeLastGood, isUsable, utcStamp } from "./last-good-snapshot"

export interface CategoryFigures {
  category: string
  sold_7d: number | null
  avg_price_eur: number | null
}

export interface BrandFigures {
  sold_7d: number | null
  avg_price_eur: number | null
  models_tracked: number | null
  top_categories: string[]
  categories: CategoryFigures[]
}

export interface MarketNumbers {
  /** Keyed by brand NAME exactly as the snapshot spells it ("Pull&Bear"). */
  byBrand: Record<string, BrandFigures>
  /** Snapshot brand order — the same order /data publishes. */
  brandNames: string[]
  /** `2026-08-21 09:28 UTC` — the snapshot's own time, never the render's. */
  stamp: string | null
  /** ISO stamp from the snapshot, for age checks (P0-8). */
  updatedAt: string | null
  listingsTracked: number | null
  /**
   * COUNT(*) of listing rows across ES, FR, DE, IT and PT — the larger figure
   * from `total_listing_records`. A garment listed in several markets counts
   * once per market, so this is listing records, not distinct items.
   * Use `listingsTracked` when you need the deduplicated item count.
   * Null when the backend has not yet exposed the field or it is unavailable.
   */
  totalListingRecords: number | null
  /** Sum of per-brand sold_7d. Null if no brand has a finite sold count. */
  sold7dTotal: number | null
  brandCount: number
  brandsTracked: number | null
  publishFloorSold7d: number | null
  sold7dKind: string | null
  provenance: Record<string, unknown> | null
  /** True when serving the last-good cache because live was unavailable. */
  stale: boolean
  /** Null when this brand is absent from the snapshot — never a stale stand-in. */
  get(brand: string): BrandFigures | null
}

function backendUrl(): string {
  // Read inside the function so a Coolify image that did not bake BACKEND_URL
  // still picks up the runtime env. Module-scope process.env is inlined at build.
  return process.env.BACKEND_URL || "http://localhost:8080"
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

/** Sale prices. 0 is a hole, not a market — same rule as the public snapshot. */
function price(v: unknown): number | null {
  const n = num(v)
  return n != null && n > 0 ? n : null
}

interface RawCategory {
  category?: string
  sold_7d?: unknown
  avg_price_eur?: unknown
}

interface RawBrand {
  brand?: string
  sold_7d?: unknown
  avg_price_eur?: unknown
  models_tracked?: unknown
  top_categories?: unknown
  categories?: unknown
}

function shape(raw: RawBrand): BrandFigures {
  const cats = Array.isArray(raw.categories) ? (raw.categories as RawCategory[]) : []
  return {
    sold_7d: num(raw.sold_7d),
    avg_price_eur: price(raw.avg_price_eur),
    models_tracked: num(raw.models_tracked),
    top_categories: Array.isArray(raw.top_categories)
      ? (raw.top_categories as string[]).filter(c => typeof c === "string")
      : [],
    categories: cats
      .filter(c => typeof c.category === "string" && c.category)
      .map(c => ({
        category: c.category as string,
        sold_7d: num(c.sold_7d),
        avg_price_eur: price(c.avg_price_eur),
      })),
  }
}

/**
 * Every published figure, live where possible and last-good otherwise.
 *
 * Revalidates on the same 15-minute cadence as /data so the two pages cannot
 * show different numbers for the same brand at the same moment — which is the
 * kind of drift this module exists to end.
 */
export async function getMarketNumbers(): Promise<MarketNumbers> {
  let snap: unknown = null
  let stale = false

  try {
    const r = await fetch(`${backendUrl()}/api/public/market-snapshot`, {
      cache: "no-store",
    })
    if (r.ok) snap = await r.json()
  } catch {
    // fall through to the cache
  }

  if (isUsable(snap)) {
    await writeLastGood(snap)
  } else {
    snap = await readLastGood()
    stale = snap !== null
  }

  const byBrand: Record<string, BrandFigures> = {}
  const raw = snap as {
    brands?: RawBrand[]
    updated_at?: string
    listings_tracked?: unknown
    total_listing_records?: unknown
    brand_count?: unknown
    brands_tracked?: unknown
    publish_floor_sold_7d?: unknown
    sold_7d_kind?: unknown
    provenance?: unknown
  } | null
  const brands = raw?.brands ?? []
  const brandNames: string[] = []
  for (const b of brands) {
    if (typeof b?.brand === "string") {
      byBrand[b.brand] = shape(b)
      brandNames.push(b.brand)
    }
  }

  const listingsTracked = num(raw?.listings_tracked)
  const totalListingRecords = num(raw?.total_listing_records)
  let sold7dTotal: number | null = null
  for (const name of brandNames) {
    const n = byBrand[name]?.sold_7d
    if (n != null) sold7dTotal = (sold7dTotal ?? 0) + n
  }

  return {
    byBrand,
    brandNames,
    stamp: utcStamp(raw?.updated_at),
    updatedAt: typeof raw?.updated_at === "string" ? raw.updated_at : null,
    listingsTracked,
    totalListingRecords,
    sold7dTotal,
    brandCount: typeof raw?.brand_count === "number" ? raw.brand_count : brandNames.length,
    brandsTracked: typeof raw?.brands_tracked === "number" ? raw.brands_tracked : null,
    publishFloorSold7d:
      typeof raw?.publish_floor_sold_7d === "number" ? raw.publish_floor_sold_7d : null,
    sold7dKind: typeof raw?.sold_7d_kind === "string" ? raw.sold_7d_kind : null,
    provenance:
      raw?.provenance && typeof raw.provenance === "object"
        ? (raw.provenance as Record<string, unknown>)
        : null,
    stale,
    get(brand: string) {
      return byBrand[brand] ?? null
    },
  }
}

/** Per-category figure for one brand, or null. Never falls back to a stale one. */
export function categoryFigure(
  figures: BrandFigures | null,
  category: string
): CategoryFigures | null {
  if (!figures) return null
  return figures.categories.find(c => c.category === category) ?? null
}

/** Never print null as 0. Math.round(null) is 0 — that is the landmine. */
export function fmtCount(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("en-GB") : "—"
}

export function fmtEur(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? `€${Math.round(n)}` : "—"
}
