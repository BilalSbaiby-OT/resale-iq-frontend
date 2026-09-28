/**
 * RoiExampleCard — a concrete worked example computed from a real buy-list row.
 *
 * CRO principle #4 (objection handling) + #8 (behavioral: specificity beats abstraction).
 * Shows: "Buy Balenciaga Track at €71, typical Vinted exit €106, after 5% fee = ~€30 profit."
 * The formula (avg × 0.665 = buy_below) is the same one SsrBuyListTeaser uses.
 *
 * Honesty rules:
 * - Numbers come from the live SSR buy list passed in — never hardcoded.
 * - Labels say "typical exit" not "average sold" (watched departures, not sales).
 * - "1 good flip covers your Starter month" is shown only when the computed margin
 *   is ≥ €19 (the subscription cost) from the real data row.
 * - No fake testimonials, no invented users.
 *
 * If no free row with avg_price_eur is available: renders nothing.
 * Picks the highest-avg-price free row for the most impressive honest example.
 */
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"

export function RoiExampleCard({ items }: { items: SsrBuyListItem[] }) {
  // Find best (highest avg price) free, unlocked row with a price
  const row = items
    .filter(i => !i.locked && i.avg_price_eur != null && i.avg_price_eur > 0)
    .sort((a, b) => (b.avg_price_eur ?? 0) - (a.avg_price_eur ?? 0))[0]

  if (!row || row.avg_price_eur == null) return null

  const avg = row.avg_price_eur
  const buyBelow = Math.round(avg * 0.665)
  const fee = +(avg * 0.05).toFixed(2)
  const margin = +(avg - buyBelow - fee).toFixed(0)
  // Only show "covers the month" if the margin genuinely exceeds Starter price
  const coversMonth = margin >= 19

  const label = [row.brand, row.model].filter(Boolean).join(" ")
  const demand =
    row.sold_30d_evidence != null
      ? `${row.sold_30d_evidence.toLocaleString()} watched departures in 30 days`
      : row.sold_7d != null
        ? `${row.sold_7d} watched departures last week`
        : null

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
          border: "1px solid rgba(255,255,255,.08)",
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
            €{Math.round(avg)}
          </span>
          <span style={{ color: "var(--color-text-dim)" }}>Vinted fee (5%)</span>
          <span style={{ fontWeight: 500, color: "var(--color-text-dim)", fontVariantNumeric: "tabular-nums" }}>
            −€{fee.toFixed(0)}
          </span>
          <span style={{ color: "var(--color-text-dim)", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            Margin per flip
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#30D158",
              fontVariantNumeric: "tabular-nums",
              paddingTop: 4,
              borderTop: "1px solid rgba(255,255,255,.06)",
            }}
          >
            ≈ €{margin}
          </span>
        </div>
        {demand && (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-dim)",
              margin: "10px 0 0",
              lineHeight: 1.4,
            }}
          >
            {demand} — watched departures, not confirmed sales.
          </p>
        )}
        {coversMonth && (
          <p
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "10px 0 0",
              lineHeight: 1.4,
            }}
          >
            One flip like this covers your entire Starter month (€19).
          </p>
        )}
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
