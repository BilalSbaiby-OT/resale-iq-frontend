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
 * tab. This version answers it as a break-even instead: how few bad buys the
 * tool has to prevent before it has paid for itself. Same arithmetic, but it
 * frames the reader as someone about to get better rather than someone
 * currently failing — and it lands in items, the unit they actually think in,
 * rather than a percentage they have to translate.
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
  // Break-even expressed in items, which is the unit a reseller actually
  // thinks in. Rounded UP so the claim is never flattering: at €15 an item,
  // 19/15 = 1.27 becomes "2 items", not "1".
  const breakEvenItems = Math.max(1, Math.ceil(STARTER / Math.max(avgBuyPrice, 1)))
  const spendPerMonth = itemsPerMonth * avgBuyPrice
  const costAsPctOfSpend = spendPerMonth > 0 ? (STARTER / spendPerMonth) * 100 : 0

  return (
    <div style={{
      maxWidth: 720, margin: "0 auto 44px", background: "#12151d",
      border: "1px solid #1c2333", borderRadius: 16, padding: "26px 24px",
    }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#eef1f7", marginBottom: 6 }}>
        How many bad buys would it have to catch?
      </div>
      <p style={{ fontSize: 14, color: "#8b99b8", lineHeight: 1.6, marginBottom: 20 }}>
        Move the sliders to your own numbers.
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

      {/* ONE number, stated in the unit the reader thinks in — items, not
          percentages. The earlier version led with "you have covered 79% of
          it", which is ambiguous (79% of what?) and made the reader do the
          translation themselves. Break-even in bad buys needs no explaining. */}
      <div style={{
        background: "#0f1720", border: "1px solid #1c3327", borderRadius: 12,
        padding: "22px 20px", textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#8b99b8", marginBottom: 6 }}>
          At that average, Starter costs the same as
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#22c55e", lineHeight: 1.1, letterSpacing: "-1px" }}>
          {breakEvenItems} bad {breakEvenItems === 1 ? "item" : "items"}
        </div>
        <div style={{ fontSize: 13, color: "#8b99b8", marginTop: 6 }}>
          a month. That&apos;s it.
        </div>

        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: "1px solid #1c2333",
          fontSize: 13.5, color: "#a9b6d0", lineHeight: 1.7,
        }}>
          You put roughly <strong style={{ color: "#eef1f7" }}>€{spendPerMonth.toLocaleString()}</strong> into
          stock each month. Starter is <strong style={{ color: "#eef1f7" }}>€{STARTER}</strong> of that —
          about <strong style={{ color: "#22c55e" }}>{costAsPctOfSpend.toFixed(1)}%</strong>.
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#5b6b8c", lineHeight: 1.6, marginTop: 14 }}>
        Deliberately conservative: it counts only the money you spent on an item you avoid, ignoring
        the shipping, the listing time and the shelf space it would have taken. This is arithmetic on
        your own figures — we do not claim a hit rate, because we have not measured one yet and would
        rather say so than invent it. See{" "}
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
        aria-valuetext={display}
        className="riq-range"
      />
    </div>
  )
}
