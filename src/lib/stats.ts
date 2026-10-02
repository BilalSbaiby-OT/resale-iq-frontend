/**
 * The live dataset size, fetched once per hour and shared by every page.
 *
 * WHY THIS EXISTS
 * "500,000+" was hardcoded in 35 places. It was true when someone typed it and
 * then never moved again, so by the time anyone checked it understated the real
 * figure by about 45% — while the dashboard, reading COUNT(*), overstated by
 * 3.1x. A number that describes a growing dataset cannot be a string literal.
 *
 * TWO COUNTS, BOTH REAL, NEVER INTERCHANGEABLE (2026-10-02 founder decision)
 *   listing records  COUNT(*) FROM listings — one row per listing per Vinted
 *                    domain. THE HEADLINE: "14M+ listing records", floored to
 *                    the whole million, computed in ONE place
 *                    (listingRecordsHeadline below) and used on every surface.
 *   distinct items   COUNT(DISTINCT external_id) — each item once, however many
 *                    domains carry it (about 2.3x smaller). Published EXACTLY,
 *                    and only, on /data, /methodology and the /pricing market
 *                    pulse, always labelled "distinct items". It is NOT the
 *                    headline and must not be called "listings" or "unique
 *                    listings" in prose: the noun after the headline is
 *                    "listing records" (src/lib/listing-records-noun.ts).
 * Earlier this file argued COUNT(*) was a 3x "overcount". It is an overcount of
 * ITEMS and an exact count of RECORDS; the defect was the noun, not the number.
 */

import { floorTo10k, floorToMillion } from "./floor-to-10k"
export { floorTo10k, floorToMillion }

/**
 * The DISTINCT-item count (COUNT(DISTINCT external_id)). Not the headline —
 * use it only where the exact distinct figure is published (/data,
 * /methodology, the /pricing pulse) or as the stated basis next to the records.
 */
export async function getListingsTracked(): Promise<number | null> {
  // Same warehouse and same 15-minute revalidate as /data. A second fetch of
  // the same endpoint at 3600s was how the homepage and /data could disagree.
  const { getMarketNumbers } = await import("./market-numbers")
  const n = (await getMarketNumbers()).listingsTracked
  return typeof n === "number" && n > 0 ? n : null
}

/**
 * THE headline: "14M+", the listing-records count floored to the whole
 * million. Every page, meta description, JSON-LD block, llms.txt line and
 * {{TRACKED}} data-module token renders this one string — the sentence around it
 * says "listing records", never plain "listings" (listing-records-noun.ts).
 *
 * If the warehouse has no records figure, return "—" — never a hardcoded guess
 * and never the distinct count under the records label. Unknown is not 14M.
 */
export async function listingRecordsHeadline(): Promise<string> {
  const n = await getListingRecords()
  return n ? floorToMillion(n) : "—"
}

/**
 * The phrase pages render inside a sentence, e.g. "14M+". Kept under its
 * original name because ~45 server components and every {{TRACKED}} data
 * module already call it; it is now simply the records headline above. The name
 * is historical — it no longer returns the distinct count.
 */
export async function listingsTrackedLabel(): Promise<string> {
  return listingRecordsHeadline()
}

/**
 * Weekly watched-departures total for pricing trust lines.
 * Same warehouse as listingsTrackedLabel. Unknown renders as "—", never a guess.
 * Revenue 2026-09-21 (fixes the em-dash on /pricing).
 */
export async function sellThroughWeeklyLabel(): Promise<string> {
  const { formatSellThrough } = await import("./format-sell-through")
  const { getMarketNumbers } = await import("./market-numbers")
  return formatSellThrough((await getMarketNumbers()).sold7dTotal)
}

/**
 * Sentinel for prose that lives in a static data module.
 *
 * `src/data/*.ts` are plain exported constants — they are evaluated at import
 * time and cannot await anything, which is precisely why 34 copies of a literal
 * "900,000+" survived the first migration to this file and went on drifting.
 * The modules now write TRACKED where the figure belongs and every render site
 * passes the value through `fillTracked`, so the literal has nowhere left to
 * hide. `tests/tracked-figure.test.ts` fails the build if one reappears.
 */
export const TRACKED = "{{TRACKED}}"

/**
 * Deep-substitutes TRACKED through any JSON-ish structure, returning a new one.
 *
 * Deep rather than top-level because the figure appears inside nested FAQ
 * answers and section bodies; a shallow replace would silently leave those
 * showing the raw sentinel to customers.
 */
export function fillTracked<T>(value: T, tracked: string): T {
  if (typeof value === "string") {
    return value.split(TRACKED).join(tracked) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map(v => fillTracked(v, tracked)) as unknown as T
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => [k, fillTracked(v, tracked)]),
    ) as unknown as T
  }
  return value
}

/**
 * The EXACT distinct-item count, for the places that publish it (/data,
 * /methodology, the /pricing pulse). Label it "distinct items".
 *
 * The precise figure moves with every scrape and says something a rounded
 * number cannot: that we actually counted, and counted items rather than rows.
 */
export async function listingsTrackedExact(): Promise<string | null> {
  const n = await getListingsTracked()
  return n ? n.toLocaleString("en-GB") : null
}

/**
 * The total listing-records count (COUNT(*) across ES, FR, DE, IT, PT) —
 * the larger figure from `total_listing_records` in the snapshot.
 * A garment listed in several markets counts once per market, so this counts
 * records, not distinct items; `getListingsTracked()` is the distinct count.
 * Returns null if the field is absent/unavailable, so callers fall back gracefully.
 */
export async function getListingRecords(): Promise<number | null> {
  const { getMarketNumbers } = await import("./market-numbers")
  const n = (await getMarketNumbers()).totalListingRecords
  return typeof n === "number" && n > 0 ? n : null
}

/**
 * Distinct-item count, formatted for inline use as the stated basis.
 * Returns null when unavailable.
 */
export async function listingsTrackedInlineLabel(): Promise<string | null> {
  const n = await getListingsTracked()
  return n ? n.toLocaleString("en-GB") : null
}
