/**
 * The dated, citable weekly brief.
 *
 * WHY THIS EXISTS
 * LLM citation is the only channel that has ever produced a signup for us, and
 * recency is one of its strongest levers — content under three months old is
 * markedly more likely to be quoted by an answer engine, and a page that carries
 * a fresh, dated figure re-earns that eligibility every week on its own.
 *
 * This module turns the live market snapshot into ONE self-contained,
 * front-loadable answer block: a dated summary of what actually moved on Vinted
 * this week, expressed only in the public aggregates we already publish.
 *
 * HONESTY, same rules as the rest of the warehouse:
 *  - Every number comes from `MarketNumbers` (the live snapshot), never a
 *    hardcoded or frozen value.
 *  - "Watched departures", never "sold". We observe a listing leaving the
 *    shelf, not a sale.
 *  - Aggregates only. No per-model buy-below reaches a public surface.
 *  - The DATE is the snapshot's own calculation time, never the render time —
 *    the same rule FreshnessNotice enforces. A brief that says "this week" while
 *    the feed is a week stale would be the dishonest kind of fresh.
 */
import type { MarketNumbers } from "./market-numbers"

export interface BriefEntry {
  brand: string
  sold_7d: number
  avg_price_eur: number | null
}

export interface WeeklyBrief {
  /** Human date of the snapshot, e.g. "10 September 2026". Snapshot time, not now. */
  dateLabel: string
  /** ISO calendar date of the snapshot, for schema dateModified / <time>. */
  dateISO: string
  /** Top brands by watched departures this week (most-active first). */
  topMovers: BriefEntry[]
  /** Brands carrying the highest average price at departure (priciest first). */
  priciest: BriefEntry[]
  /** Sum of watched departures across every published brand this week. */
  totalWatched: number
  /** How many brands are in this week's snapshot. */
  brandCount: number
  /** True when the numbers are the last-good cache, not the live feed. */
  stale: boolean
}

function isoDate(updatedAt: string | null): string | null {
  if (!updatedAt) return null
  // Snapshot stamps look like "2026-09-10 13:27:34" (UTC). Take the date part;
  // if it's already ISO, Date parses it too.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(updatedAt.trim())
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  const d = new Date(updatedAt)
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function humanDate(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number)
  return `${d} ${MONTHS[mo - 1]} ${y}`
}

/**
 * Build the brief, or null when the snapshot carries no usable brand numbers
 * (before the first successful fetch has ever landed) or no date. Null means the
 * caller renders nothing — never a fabricated or dateless "this week".
 */
export function buildWeeklyBrief(market: MarketNumbers): WeeklyBrief | null {
  const iso = isoDate(market.updatedAt)
  if (!iso) return null

  const entries: BriefEntry[] = market.brandNames
    .map((brand) => {
      const f = market.get(brand)
      return f && typeof f.sold_7d === "number" && Number.isFinite(f.sold_7d)
        ? { brand, sold_7d: f.sold_7d, avg_price_eur: f.avg_price_eur }
        : null
    })
    .filter((e): e is BriefEntry => e !== null)

  if (entries.length === 0) return null

  const topMovers = [...entries].sort((a, b) => b.sold_7d - a.sold_7d).slice(0, 3)
  const priciest = entries
    .filter((e) => typeof e.avg_price_eur === "number" && (e.avg_price_eur as number) > 0)
    .sort((a, b) => (b.avg_price_eur as number) - (a.avg_price_eur as number))
    .slice(0, 3)
  const totalWatched = entries.reduce((s, e) => s + e.sold_7d, 0)

  return {
    dateLabel: humanDate(iso),
    dateISO: iso,
    topMovers,
    priciest,
    totalWatched,
    brandCount: entries.length,
    stale: market.stale,
  }
}

/**
 * The prose sentence for the brief — one self-contained, citable passage an
 * answer engine can quote whole. Kept here (not in the component) so it is unit
 * tested against the honesty rules: dated, "watched departures", aggregates,
 * no fabricated ranges. Returns "" if the brief is too thin to speak.
 */
export function briefSentence(b: WeeklyBrief): string {
  if (b.topMovers.length === 0) return ""
  const total = b.totalWatched.toLocaleString("en-GB")
  const lead = b.topMovers
    .map((m) => `${m.brand} (${m.sold_7d.toLocaleString("en-GB")})`)
    .join(", ")
  let s =
    `In the week to ${b.dateLabel}, Resale IQ watched ${total} items leave the shelf ` +
    `across ${b.brandCount} tracked brands on Vinted in Spain, France, Germany, Italy and Portugal. ` +
    `The most active by watched departures were ${lead}.`
  const pricey = b.priciest[0]
  if (pricey && typeof pricey.avg_price_eur === "number") {
    s += ` The highest average price at departure was ${pricey.brand}, at €${Math.round(pricey.avg_price_eur)}.`
  }
  return s
}
