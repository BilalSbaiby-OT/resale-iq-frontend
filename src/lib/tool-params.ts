/**
 * Query-string handling shared by /tools and /tools/[slug].
 * WebMCP declarative forms name the field `query` (and `buy_price` /
 * `sell_price` for the calculator); human deep links and llms.txt use `q`.
 * Both must land on the same server-rendered result.
 */
/**
 * Vinted's selling fee for private sellers in ES / FR / DE / IT / PT: none
 * (Vinted help article 373, "Is selling on Vinted free?"). The percentage charge on
 * Vinted's fee card is the BUYER's Buyer Protection fee, added at checkout on top of
 * the item price and never deducted from the seller's payout. Kept as a
 * constant so the free calculator stays true to Vinted's published policy if
 * it ever changes.
 */
export const VINTED_FEE_PCT = 0

type Param = string | string[] | undefined

function first(v: Param): string | undefined {
  const s = Array.isArray(v) ? v[0] : v
  return typeof s === "string" && s.trim() ? s : undefined
}

/** `q` wins, `query` is the WebMCP alias. */
export function resolveQuery(sp: { q?: Param; query?: Param }): string | undefined {
  return first(sp.q) ?? first(sp.query)
}

export function parseMoney(raw: string | undefined): number | null {
  if (raw == null) return null
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0.01) return null
  return n
}

export type ProfitResult = { buy: number; sell: number; net: number }

/** Net profit on the visitor's own figures: what the seller receives minus what they paid. */
export function netProfit(sell: number, buy: number): number {
  return sell - sell * VINTED_FEE_PCT - buy
}

export function computeProfit(buyRaw: string | undefined, sellRaw: string | undefined): ProfitResult | null {
  const buy = parseMoney(buyRaw)
  const sell = parseMoney(sellRaw)
  if (buy == null || sell == null) return null
  return { buy, sell, net: netProfit(sell, buy) }
}
