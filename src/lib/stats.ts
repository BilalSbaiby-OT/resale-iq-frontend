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
const API = process.env.BACKEND_URL || "http://localhost:8080";

/**
 * Rounded DOWN to the nearest 10k, so the claim stays true between refreshes
 * and as the number grows. Rounding up would make the site briefly overstate,
 * which is the whole failure being fixed.
 */
export function floorTo10k(n: number): string {
  return (Math.floor(n / 10_000) * 10_000).toLocaleString("en-GB")
}

export async function getListingsTracked(): Promise<number | null> {
  try {
    const r = await fetch(`${API}/api/public/market-snapshot`, {
      // Hourly. The scraper adds ~16k rows per run, so a fresher cadence would
      // cost requests without changing a figure rounded to 10k.
      next: { revalidate: 3600 },
    })
    if (!r.ok) return null
    const n = (await r.json())?.listings_tracked
    return typeof n === "number" && n > 0 ? n : null
  } catch {
    return null
  }
}

/**
 * The phrase pages render inside a sentence, e.g. "900,000+".
 *
 * Floored, because prose reads badly with six significant figures and a "+"
 * stays true as the number grows. Falls back to the last measured floor if the
 * API is unreachable — never to a guess above it.
 */
export async function listingsTrackedLabel(): Promise<string> {
  const n = await getListingsTracked()
  return n ? `${floorTo10k(n)}+` : "900,000+"
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
