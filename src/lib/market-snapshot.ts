/**
 * Shared helpers for consuming /api/public/market-snapshot.
 *
 * Extracted to avoid the identical flatMap block that C137 added to both
 * check-email-content.tsx and register-form.tsx. One definition, one place
 * to fix if the API shape ever changes.
 */

export type SnapshotBrandRow = {
  brand: string
  category: string
  sold_7d: number
  avg_price_eur: number
}

type RawBrand = {
  brand: string
  sold_7d: number
  avg_price_eur: number
  top_categories?: string[]
  categories?: Array<{ category: string; sold_7d: number; avg_price_eur: number }>
}

/**
 * Fetch top N brand/category pairs from the public market snapshot, ranked by
 * sold_7d. Pairs below `minSold7d` are excluded (default 5 = the publish floor).
 * Returns the fallback array on any fetch/parse error.
 */
export async function fetchTopBrandRows(
  n: number,
  fallback: SnapshotBrandRow[],
  minSold7d = 5,
): Promise<SnapshotBrandRow[]> {
  try {
    const r = await fetch("/api/public/market-snapshot")
    const d: { brands?: RawBrand[] } = await r.json()
    if (!Array.isArray(d.brands)) return fallback
    const rows: SnapshotBrandRow[] = d.brands
      .flatMap(b => {
        if (!Array.isArray(b.categories)) {
          return [{ brand: b.brand, category: b.top_categories?.[0] ?? "", sold_7d: b.sold_7d, avg_price_eur: b.avg_price_eur }]
        }
        const best = [...b.categories].sort((a, b) => b.sold_7d - a.sold_7d)[0]
        return best ? [{ brand: b.brand, category: best.category, sold_7d: best.sold_7d, avg_price_eur: best.avg_price_eur }] : []
      })
      .filter(r => r.sold_7d >= minSold7d)
      .sort((a, b) => b.sold_7d - a.sold_7d)
      .slice(0, n)
    return rows.length >= n ? rows : fallback
  } catch {
    // why: network errors and parse failures fall back to the caller-supplied
    // static array — the UI still shows real-looking data rather than an empty
    // state. The failure is non-critical and not actionable by the user.
    return fallback
  }
}
