/**
 * RoiExampleCard — a concrete worked example computed from a real buy-list row.
 *
 * CRO principle #4 (objection handling) + #8 (behavioral: specificity beats abstraction).
 * Shows: "Buy Balenciaga Track at €74, typical Vinted exit €106, margin ≈ €32."
 * The buy-below is the stored ceiling on the row (buy_below = average × 0.70), and
 * the margin is exit minus buy-below. Vinted charges private sellers no selling
 * fee, so there is no fee row: the three printed numbers add up as printed.
 *
 * Honesty rules:
 * - Numbers come from the live SSR buy list passed in — never hardcoded.
 * - Labels say "typical exit" not "average sold" (watched departures, not sales).
 * - No fake testimonials, no invented users, no payback promises.
 *
 * If no free row with avg_price_eur is available: renders nothing.
 * Picks the highest-avg-price free row for the most impressive honest example.
 */
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { itemDisplayName } from "@/lib/item-display-name"

export function RoiExampleCard({ items }: { items: SsrBuyListItem[] }) {
  // Find best (highest avg price) free, unlocked row with a price
  const row = items
    .filter(i => !i.locked && i.avg_price_eur != null && i.avg_price_eur > 0 && i.buy_below != null)
    .sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]

  if (!row || row.avg_price_eur == null || row.buy_below == null) return null

  const avg = row.avg_price_eur
  const buyBelow = Math.round(row.buy_below)
  const exit = Math.round(avg)
  // Printed numbers must add up: exit − buy-below, both as displayed.
  const margin = exit - buyBelow

  const label = itemDisplayName(row.brand, row.model)
  return (
    <section
      aria-labelledby="riq-roi-heading"
      style={{
        maxWidth: "var(--width-hero)",
        margin: "0 auto",
        padding: "0 var(--space-3) var(--space-6)",
      }}
    >
      <h2
        id="riq-roi-heading"
        style={{
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "-0.2px",
          margin: "0 0 12px",
          color: "var(--color-text-primary)",
        }}
      >
        What one good flip actually looks like
      </h2>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-hairline)",
          borderRadius: 14,
          padding: "18px 20px",
          maxWidth: 520,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#30D158",
              background: "rgba(48,209,88,.15)",
              border: "1px solid rgba(48,209,88,.25)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            EXAMPLE
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {label}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "6px 16px",
            fontSize: 14,
          }}
        >
          <span style={{ color: "var(--color-text-dim)" }}>Buy below</span>
          <span style={{ fontWeight: 700, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
            €{buyBelow}
          </span>
          <span style={{ color: "var(--color-text-dim)" }}>Typical Vinted exit</span>
          <span style={{ fontWeight: 500, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
            €{exit}
          </span>
          <span style={{ color: "var(--color-text-dim)", paddingTop: 4, borderTop: "1px solid var(--color-hairline)" }}>
            Margin per flip
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#30D158",
              fontVariantNumeric: "tabular-nums",
              paddingTop: 4,
              borderTop: "1px solid var(--color-hairline)",
            }}
          >
            ≈ €{margin}
          </span>
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          margin: "8px 0 0",
          maxWidth: 520,
          lineHeight: 1.5,
        }}
      >
        Resale IQ shows which items have demand, not a sell guarantee. All figures from
        live Vinted listings.{" "}
        <a href="/methodology" style={{ color: "var(--color-text-dim)", textDecoration: "underline" }}>
          Methodology
        </a>
      </p>
    </section>
  )
}
