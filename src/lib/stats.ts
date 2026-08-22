/**
 * The live dataset size, fetched once per hour and shared by every page.
 *
 * WHY THIS EXISTS
 * "500,000+" was hardcoded in 35 places. It was true when someone typed it and
 * then never moved again, so by the time anyone checked it understated the real
 * figure by about 45% — while the dashboard, reading COUNT(*), overstated by
 * 3.1x. A number that describes a growing dataset cannot be a string literal.
 *
 * The API returns COUNT(DISTINCT external_id): the five Vinted domains are one
 * catalogue, so counting rows would overstate by roughly 3x.
 */

/**
 * Rounded DOWN to the nearest 10k, so the claim stays true between refreshes
 * and as the number grows. Rounding up would make the site briefly overstate,
 * which is the whole failure being fixed.
 */
export function floorTo10k(n: number): string {
  return (Math.floor(n / 10_000) * 10_000).toLocaleString("en-GB")
}

export async function getListingsTracked(): Promise<number | null> {
  // Same warehouse and same 15-minute revalidate as /data. A second fetch of
  // the same endpoint at 3600s was how the homepage and /data could disagree.
  const { getMarketNumbers } = await import("./market-numbers")
  const n = (await getMarketNumbers()).listingsTracked
  return typeof n === "number" && n > 0 ? n : null
}

/**
 * The phrase pages render inside a sentence, e.g. "1,960,000+".
 *
 * Floored, because prose reads badly with six significant figures and a "+"
 * stays true as the number grows. If the warehouse has no number, return "—"
 * — never a hardcoded guess. Unknown is not 900,000.
 */
export async function listingsTrackedLabel(): Promise<string> {
  const n = await getListingsTracked()
  return n ? `${floorTo10k(n)}+` : "—"
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
 * The EXACT count, for places where the number stands alone.
 *
 * A rounded figure sits still for days and reads like marketing. The precise
 * one moves with every scrape and says something a rounded number cannot:
 * that we actually counted, and counted items rather than rows. It is also the
 * harder claim to make — anyone can write "500,000+".
 */
export async function listingsTrackedExact(): Promise<string | null> {
  const n = await getListingsTracked()
  return n ? n.toLocaleString("en-GB") : null
}
