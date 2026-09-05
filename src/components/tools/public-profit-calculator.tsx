"use client"
import { useState, type FormEvent } from "react"

/**
 * Public Vinted profit calculator. Visitor supplies both prices; we only
 * apply the published ~5% Vinted seller-side fee already stated on this
 * page's FAQ and in /methodology. Never calls /api/calc — that endpoint
 * is paid (402 for anon) because it returns observed market sell prices.
 *
 * Contract: Calculate with a filled buy price always shows a result OR a
 * visible validation error. Never a silent return.
 */
const VINTED_FEE_PCT = 0.05

function parseMoney(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(",", "."))
  if (!Number.isFinite(n) || n < 0.01) return null
  return n
}

function money(n: number): string {
  const sign = n < 0 ? "−" : ""
  return `${sign}€${Math.abs(n).toFixed(2)}`
}

export function PublicProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState<null | {
    buy: number
    sell: number
    fee: number
    net: number
  }>(null)

  const onCalculate = (e: FormEvent) => {
    e.preventDefault()
    const buy = parseMoney(buyPrice)
    const sell = parseMoney(sellPrice)
    if (buy == null) {
      setResult(null)
      setError("Enter a buy price greater than 0.")
      return
    }
    if (sell == null) {
      setResult(null)
      setError("Enter an expected sale price greater than 0.")
      return
    }
    const fee = sell * VINTED_FEE_PCT
    const net = sell - fee - buy
    setError("")
    setResult({ buy, sell, fee, net })
  }

  return (
    <form
      onSubmit={onCalculate}
      style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 20 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div>
          <label htmlFor="riq-calc-buy" style={{ fontSize: 12, color: "#8b99b8", display: "block", marginBottom: 6 }}>
            Buy price (€)
          </label>
          <input
            id="riq-calc-buy"
            name="buy_price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="45"
            style={{ width: "100%", boxSizing: "border-box", background: "#0f1218", border: "1px solid #232c42", borderRadius: 10, padding: "13px 15px", color: "#eef1f7", fontSize: 14.5, outline: "none" }}
          />
        </div>
        <div>
          <label htmlFor="riq-calc-sell" style={{ fontSize: 12, color: "#8b99b8", display: "block", marginBottom: 6 }}>
            Expected sale price (€)
          </label>
          <input
            id="riq-calc-sell"
            name="sell_price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="70"
            style={{ width: "100%", boxSizing: "border-box", background: "#0f1218", border: "1px solid #232c42", borderRadius: 10, padding: "13px 15px", color: "#eef1f7", fontSize: 14.5, outline: "none" }}
          />
        </div>
      </div>
      <button
        type="submit"
        style={{ width: "100%", background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, border: "none", borderRadius: 10, padding: "13px 22px", cursor: "pointer" }}
      >
        Calculate
      </button>

      {error && (
        <p id="riq-calc-error" role="alert" style={{ color: "#ef4444", fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          {error}
        </p>
      )}

      {result && (
        <div
          data-testid="riq-calc-result"
          style={{ marginTop: 18, borderTop: "1px solid #1c2333", paddingTop: 18 }}
        >
          <div style={{ fontSize: 12.5, color: "#8b99b8", marginBottom: 6 }}>
            Net after Vinted 5% fee
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: result.net >= 0 ? "#22c55e" : "#ef4444",
              letterSpacing: "-0.6px",
              lineHeight: 1.1,
            }}
          >
            {result.net >= 0 ? "+" : ""}{money(result.net)}
          </div>
          <div style={{ fontSize: 13, color: "#a9b6d0", marginTop: 10, lineHeight: 1.6 }}>
            Sale {money(result.sell)} − fee {money(result.fee)} − buy {money(result.buy)}.
            Arithmetic on your figures — the 5% is the published Vinted seller-side rate, not a hit-rate claim.
          </div>
        </div>
      )}
    </form>
  )
}
