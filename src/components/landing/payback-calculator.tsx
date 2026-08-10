"use client"
import { useState } from "react"
import Link from "next/link"

/**
 * Answers the only question that decides a purchase: "will this make me more
 * than it costs?"
 *
 * TONE RULE — this must be encouraging, never alarming. The tempting version
 * computes "you are wasting €X a month on dead stock", which is a guess about
 * the reader's competence, reads as an accusation, and makes people close the
 * tab. This version computes the same arithmetic from the other end: what ONE
 * avoided mistake is worth. Same maths, and it frames the reader as someone
 * about to get better rather than someone currently failing.
 *
 * HONESTY RULE — no invented statistics. We do NOT claim a hit rate, a typical
 * saving, or "users report X". The prediction ledger has scored zero outcomes
 * so far, so any such figure would be fabricated. Everything here is the
 * reader's own numbers put through arithmetic they can check in their head.
 */
export function PaybackCalculator() {
  const [itemsPerMonth, setItems] = useState(20)
  const [avgBuyPrice, setAvgBuy] = useState(15)

  const STARTER = 19
  // One item bought that never sells: the buy price is gone. That is the
  // smallest, most conservative unit of value the product can deliver — no
  // margin assumptions, no sell-through assumptions, nothing to dispute.
  const oneMistake = avgBuyPrice
  const monthsCovered = oneMistake / STARTER
  const spendPerMonth = itemsPerMonth * avgBuyPrice
  const costAsPctOfSpend = spendPerMonth > 0 ? (STARTER / spendPerMonth) * 100 : 0

  return (
    <div style={{
      maxWidth: 720, margin: "0 auto 44px", background: "#12151d",
      border: "1px solid #1c2333", borderRadius: 16, padding: "26px 24px",
    }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>
        Will it pay for itself?
      </div>
      <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6, marginBottom: 20 }}>
        Your numbers, not ours. Move the sliders.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 22 }}>
        <Slider
          label="Items you buy a month" value={itemsPerMonth} min={5} max={200} step={5}
          onChange={setItems} display={`${itemsPerMonth}`}
        />
        <Slider
          label="What you pay per item, on average" value={avgBuyPrice} min={5} max={120} step={1}
          onChange={setAvgBuy} display={`€${avgBuyPrice}`}
        />
      </div>

      <div style={{
        background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12,
        padding: "18px 20px",
      }}>
        <div style={{ fontSize: 15, color: "#c3cde0", lineHeight: 1.7 }}>
          You put about <strong style={{ color: "#eef1f7" }}>€{spendPerMonth.toLocaleString()}</strong> into stock
          each month. Starter is <strong style={{ color: "#eef1f7" }}>€{STARTER}</strong> — around{" "}
          <strong style={{ color: "#22c55e" }}>{costAsPctOfSpend.toFixed(1)}%</strong> of what you are
          already spending.
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1c2333", fontSize: 15, color: "#c3cde0", lineHeight: 1.7 }}>
          Skip <strong style={{ color: "#eef1f7" }}>one</strong> item at €{avgBuyPrice} that would not have
          sold, and you have covered{" "}
          <strong style={{ color: "#22c55e" }}>
            {monthsCovered >= 1
              ? `${monthsCovered.toFixed(monthsCovered >= 10 ? 0 : 1)} month${monthsCovered >= 2 ? "s" : ""}`
              : `${Math.round(monthsCovered * 100)}%`}
          </strong>{" "}
          {monthsCovered >= 1 ? "of it." : "of it — two covers the month."}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#5b6b8c", lineHeight: 1.6, marginTop: 14 }}>
        Deliberately conservative: this counts only the buy price of an item you avoid, and ignores
        the shipping, the listing time and the shelf space it would have taken. It is arithmetic on
        your own figures — we do not claim a hit rate, because we have not measured one yet and
        would rather say so than invent it. See{" "}
        <Link href="/methodology" style={{ color: "#22c55e", textDecoration: "none" }}>methodology</Link>.
      </p>
    </div>
  )
}

function Slider({
  label, value, min, max, step, onChange, display,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (n: number) => void; display: string
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <label htmlFor={label} style={{ fontSize: 12.5, color: "#8b99b8" }}>{label}</label>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#eef1f7" }}>{display}</span>
      </div>
      <input
        id={label} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#22c55e", cursor: "pointer" }}
      />
    </div>
  )
}
