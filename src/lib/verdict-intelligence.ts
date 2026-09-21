/**
 * Paid / Pro verdict chrome must not go blank when buy_below, STR or sizes
 * are null. STR is withheld while discovery is noisy — that is not "no
 * product insight". Reconstructs / proxies are shown only when the API
 * actually sent them. Never invent a figure; null is not 0.
 */
export type ReconstructedSignals = {
  reconstructed_buy_below?: number | null
  reconstructed_sell_avg?: number | null
  reconstructed_n?: number | null
  proxy_buy_below?: number | null
  proxy_sell_avg?: number | null
  active_comps?: number | null
  comps_n?: number | null
  reconstructed?: {
    buy_below?: number | null
    sell_avg?: number | null
    n?: number | null
    note?: string | null
  } | null
  estimates?: {
    buy_below?: number | null
    sell_avg?: number | null
    n?: number | null
  } | null
}

export type SignalBag = ReconstructedSignals & {
  buy_below?: number | null
  sell_avg?: number | null
  sell_median?: number | null
  sold_7d?: number | null
  active_listings?: number | null
  n?: number | null
  sell_through_rate?: string | null
  opportunity_score?: number | null
  reasons?: string[] | null
  confidence_note?: string | null
  message?: string | null
  top_sizes?: string[] | null
  momentum?: string | null
}

export type MetricKind = "measured" | "reconstructed"

export type CollectedMetric = {
  id:
    | "buy_below"
    | "sell_avg"
    | "sold_7d"
    | "active_listings"
    | "n"
    | "comps"
    | "opportunity"
  kind: MetricKind
  numeric: number
}

export function finiteNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

function firstFinite(values: unknown[]): number | null {
  for (const v of values) {
    const n = finiteNum(v)
    if (n != null) return n
  }
  return null
}

export function collectVerdictMetrics(r: SignalBag): CollectedMetric[] {
  const rows: CollectedMetric[] = []

  const buy = finiteNum(r.buy_below)
  const buyRe = firstFinite([
    r.reconstructed_buy_below,
    r.proxy_buy_below,
    r.reconstructed?.buy_below,
    r.estimates?.buy_below,
  ])
  if (buy != null) rows.push({ id: "buy_below", kind: "measured", numeric: buy })
  else if (buyRe != null) rows.push({ id: "buy_below", kind: "reconstructed", numeric: buyRe })

  const sell = firstFinite([r.sell_median, r.sell_avg])
  const sellRe = firstFinite([
    r.reconstructed_sell_avg,
    r.proxy_sell_avg,
    r.reconstructed?.sell_avg,
    r.estimates?.sell_avg,
  ])
  if (sell != null) rows.push({ id: "sell_avg", kind: "measured", numeric: sell })
  else if (sellRe != null) rows.push({ id: "sell_avg", kind: "reconstructed", numeric: sellRe })

  const sold = finiteNum(r.sold_7d)
  if (sold != null) rows.push({ id: "sold_7d", kind: "measured", numeric: sold })

  const listed = finiteNum(r.active_listings)
  if (listed != null) rows.push({ id: "active_listings", kind: "measured", numeric: listed })

  const n = finiteNum(r.n)
  const nRe = firstFinite([r.reconstructed_n, r.reconstructed?.n, r.estimates?.n])
  if (n != null) rows.push({ id: "n", kind: "measured", numeric: n })
  else if (nRe != null) rows.push({ id: "n", kind: "reconstructed", numeric: nRe })

  const comps = firstFinite([r.active_comps, r.comps_n])
  if (comps != null && comps !== n) {
    rows.push({ id: "comps", kind: "measured", numeric: comps })
  }

  const opp = finiteNum(r.opportunity_score)
  if (opp != null) rows.push({ id: "opportunity", kind: "measured", numeric: opp })

  return rows
}

export function hasVerdictIntelligence(r: SignalBag): boolean {
  if (collectVerdictMetrics(r).length > 0) return true
  if (r.reasons && r.reasons.length > 0) return true
  if (typeof r.confidence_note === "string" && r.confidence_note.trim()) return true
  if (r.top_sizes && r.top_sizes.length > 0) return true
  if (typeof r.message === "string" && r.message.trim()) return true
  if (typeof r.momentum === "string" && r.momentum.trim()) return true
  if (typeof r.sell_through_rate === "string" && r.sell_through_rate.trim()) return true
  return false
}

export function reconstructedNote(r: SignalBag): string | null {
  const n = r.reconstructed?.note
  return typeof n === "string" && n.trim() ? n.trim() : null
}

export function measuredBuyAndSell(r: SignalBag): { buy: number; sell: number } | null {
  const buy = finiteNum(r.buy_below)
  const sell = finiteNum(r.sell_avg)
  if (buy == null || sell == null) return null
  return { buy, sell }
}
