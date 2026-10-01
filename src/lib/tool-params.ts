/**
 * Query-string handling shared by /tools and /tools/[slug].
 * WebMCP declarative forms name the field `query` (and `buy_price` /
 * `sell_price` for the calculator); human deep links and llms.txt use `q`.
 * Both must land on the same server-rendered result.
 */
export const VINTED_FEE_PCT = 0.05

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

export type ProfitResult = { buy: number; sell: number; fee: number; net: number }

export function computeProfit(buyRaw: string | undefined, sellRaw: string | undefined): ProfitResult | null {
  const buy = parseMoney(buyRaw)
  const sell = parseMoney(sellRaw)
  if (buy == null || sell == null) return null
  const fee = sell * VINTED_FEE_PCT
  return { buy, sell, fee, net: sell - fee - buy }
}
