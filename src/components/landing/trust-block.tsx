/**
 * TrustBlock — honest proof signals, placed below the buy list and above
 * the pricing CTA.
 *
 * CRO #4 (objection handling: "can I trust this?") + #7 (trust before CTA).
 * Every item here is either a real live figure from the API or a structural
 * fact about how the product works. Nothing is fabricated.
 *
 * Honesty rules applied:
 * - "watched departures, not sold prices" — always stated, never buried.
 * - Data freshness: the snapshot_at timestamp from getMarketNumbers.
 * - No fake review count, no fake user count, no invented logos.
 * - "Cancel anytime" — supported by terms (paid through end of period).
 * - No "30-day money-back guarantee" — terms don't promise one; omitted.
 *   (Recommendation: add a no-questions refund clause to /terms before
 *    reintroducing this line anywhere on the site.)
 * - Stripe Secure — true; checkout goes to Stripe.
 * - EU markets covered — factually correct (ES, FR, DE, IT, PT).
 */
import type { MarketNumbers } from "@/lib/market-numbers"

function TrustItem({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode
  label: string
  sub?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>
          {label}
        </span>
      </div>
      {sub && (
        <span style={{ fontSize: 11.5, color: "var(--color-text-dim)", lineHeight: 1.4, paddingLeft: 22 }}>
          {sub}
        </span>
      )}
    </div>
  )
}

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6.5" stroke="#34C759" strokeWidth="1.5" />
    <path d="M4.5 7.5l2 2 4-4" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconLock = () => (
  <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden="true">
    <rect x="1" y="6" width="11" height="8" rx="2.5" stroke="#34C759" strokeWidth="1.5" />
    <path d="M4 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#34C759" strokeWidth="1.5" />
  </svg>
)

const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6.5" stroke="#34C759" strokeWidth="1.5" />
    <path d="M7.5 4v3.5l2 1.5" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const IconGlobe = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6.5" stroke="#34C759" strokeWidth="1.5" />
    <path d="M7.5 1C7.5 1 5 4 5 7.5s2.5 6.5 2.5 6.5M7.5 1c0 0 2.5 3 2.5 6.5S7.5 14 7.5 14M1 7.5h13" stroke="#34C759" strokeWidth="1.3" />
  </svg>
)

export function TrustBlock({ market }: { market: MarketNumbers }) {
  // Format data freshness — show "updated X min ago" if snapshot_at is available,
  // otherwise fall back to a generic freshness statement.
  let freshnessLabel = "Refreshed regularly"
  if (market.updatedAt) {
    const minsAgo = Math.round((Date.now() - new Date(market.updatedAt).getTime()) / 60000)
    if (minsAgo < 60) {
      freshnessLabel = `Updated ${minsAgo} min ago`
    } else if (minsAgo < 1440) {
      freshnessLabel = `Updated ${Math.round(minsAgo / 60)}h ago`
    } else {
      freshnessLabel = `Updated ${Math.round(minsAgo / 1440)}d ago`
    }
  } else if (market.stamp) {
    freshnessLabel = `Data: ${market.stamp}`
  }

  return (
    <section
      aria-label="Trust and data signals"
      style={{
        maxWidth: "var(--width-hero)",
        margin: "0 auto",
        padding: "0 var(--space-3) var(--space-5)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "14px 20px",
        }}
      >
        <TrustItem
          icon={<IconClock />}
          label={freshnessLabel}
          sub="Watched departures, not sold prices — items that left the shelf."
        />
        <TrustItem
          icon={<IconGlobe />}
          label="5 EU markets"
          sub="Vinted ES · FR · DE · IT · PT — across 28+ brands."
        />
        <TrustItem
          icon={<IconLock />}
          label="Stripe secure checkout"
          sub="Cancel anytime — no contracts, no lock-in."
        />
        <TrustItem
          icon={<IconCheck />}
          label="Transparent methodology"
          sub={
            <a href="/methodology" style={{ color: "var(--color-text-dim)", textDecoration: "underline" }}>
              How we compute buy-below prices →
            </a>
          }
        />
      </div>
    </section>
  )
}
