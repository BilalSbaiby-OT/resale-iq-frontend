/**
 * Homepage "Selling this week" rows.
 *
 * One grain per row: a brand's highest-volume CATEGORY, with that category's
 * sold count AND that category's average price. Pairing category volume with
 * the brand-level mean (New Balance sneakers 197/wk at the brand €21 instead
 * of the sneakers €41) is the specific lie this module exists to end.
 */
export interface ProofCategory {
  category: string
  sold_7d: number | null
  avg_price_eur: number | null
}

export interface ProofBrand {
  avg_price_eur: number | null
  categories: ProofCategory[]
}

export interface ProofRow {
  brand: string
  category: string
  sold: number
  avg: number | null
}

export function buildSellingThisWeekRows(
  brands: { name: string; data: ProofBrand }[],
  limit = 3,
): ProofRow[] {
  const rows: ProofRow[] = []
  for (const { name, data } of brands) {
    let top: ProofCategory | null = null
    for (const c of data.categories) {
      if (typeof c.sold_7d !== "number" || !Number.isFinite(c.sold_7d) || c.sold_7d <= 0) continue
      if (!top || (top.sold_7d ?? 0) < c.sold_7d) top = c
    }
    if (!top || top.sold_7d == null) continue
    rows.push({
      brand: name,
      category: top.category,
      sold: top.sold_7d,
      avg: top.avg_price_eur,
    })
  }
  return rows.sort((a, b) => b.sold - a.sold).slice(0, limit)
}
