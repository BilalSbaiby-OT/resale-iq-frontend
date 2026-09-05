"use client"
import { useState, type FormEvent } from "react"
import { copy, type Locale } from "@/lib/i18n"

/**
 * Public Vinted profit calculator. Visitor supplies both prices; we only
 * apply the published ~5% Vinted seller-side fee already stated on this
 * page's FAQ and in /methodology. Never calls /api/calc — that endpoint
 * is paid (402 for anon) because it returns observed market sell prices.
 *
 * Contract: Calculate with a filled buy price always shows a result OR a
 * visible validation error. Never a silent return.
 *
 * Colours are the app's existing @theme tokens (src/app/globals.css), not
 * literals: the accent here is one button plus the payoff figure, and both
 * have to move with the palette rather than pinning a hex to this file.
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

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--color-bg-2)",
  border: "1px solid var(--color-border-2)",
  borderRadius: 10,
  padding: "13px 15px",
  color: "var(--color-text-primary)",
  fontSize: 15,
  outline: "none",
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--color-text-secondary)",
  display: "block",
  marginBottom: 7,
}

export function PublicProfitCalculator({ locale = "en" }: { locale?: Locale }) {
  const t = copy[locale].toolsPage.calc
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
      setError(t.errBuy)
      return
    }
    if (sell == null) {
      setResult(null)
      setError(t.errSell)
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
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-ui)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 18 }}>
        <div>
          <label htmlFor="riq-calc-buy" style={labelStyle}>
            {t.buyLabel}
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
            style={fieldStyle}
          />
        </div>
        <div>
          <label htmlFor="riq-calc-sell" style={labelStyle}>
            {t.sellLabel}
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
            style={fieldStyle}
          />
        </div>
      </div>
      {/* The one accent on this view. /tools/<slug>'s "See plans" is a text
          link precisely so this button is the only filled thing on the page. */}
      <button
        type="submit"
        style={{
          width: "100%",
          background: "var(--color-buy)",
          color: "var(--color-on-buy)",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 10,
          padding: "14px 22px",
          cursor: "pointer",
        }}
      >
        {t.submit}
      </button>

      {error && (
        <p id="riq-calc-error" role="alert" style={{ color: "var(--color-skip)", fontSize: 13.5, marginTop: 14, marginBottom: 0 }}>
          {error}
        </p>
      )}

      {result && (
        <div
          data-testid="riq-calc-result"
          style={{ marginTop: 24, borderTop: "1px solid var(--color-border-ui)", paddingTop: 24 }}
        >
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            {t.netLabel}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: result.net >= 0 ? "var(--color-buy)" : "var(--color-skip)",
              letterSpacing: "-1px",
              lineHeight: 1.05,
            }}
          >
            {result.net >= 0 ? "+" : ""}{money(result.net)}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginTop: 14, lineHeight: 1.65 }}>
            {t.breakdown(money(result.sell), money(result.fee), money(result.buy))}
          </div>
        </div>
      )}
    </form>
  )
}
