import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Partner programme — Resale IQ",
  description:
    "Resale IQ pays 30% recurring commission and gives creators a free Pro account plus a personalised weekly buy-list they can publish as their own content.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Partner programme — Resale IQ",
    description:
      "30% recurring commission, free Pro account, and a weekly buy-list data-drop for reselling creators.",
    type: "website",
    url: "/partners",
  },
  robots: { index: true, follow: true },
}

/**
 * /partners — affiliate and creator-partner landing page.
 *
 * Data figures are VERIFIED against the live production DB before publish.
 * Source:
 *   listings total    → SELECT COUNT(*) FROM listings          → 13,371,381
 *   sold listings     → SELECT COUNT(*) FROM listings WHERE sold_at IS NOT NULL → 1,121,053
 *   tracked brands    → SELECT COUNT(DISTINCT brand) FROM demand_index → 55
 *   model rows live   → SELECT COUNT(*) FROM model_signals WHERE sold_30d > 0 → 141
 * (queried 2026-09-22 against production DB via docker exec)
 *
 * No social proof, no partner count, no invented testimonials — we have ZERO partners.
 * Commission paid only on money actually received from Stripe.
 */

// Verified real departures from the live DB (model_signals, sold_30d):
const EXAMPLE_BRANDS = [
  { brand: "New Balance", category: "Sneakers", sold30d: 1235, avgEur: 38.51 },
  { brand: "Balenciaga", category: "Other", sold30d: 891, avgEur: 290.0 },
  { brand: "Ralph Lauren", category: "Polo / casual", sold30d: 825, avgEur: 23.88 },
  { brand: "Patagonia", category: "Jackets", sold30d: 202, avgEur: 45.87 },
]

const STAT_CARDS = [
  { value: "13.4M", label: "listings tracked across 5 EU markets" },
  { value: "1.1M", label: "confirmed sold transactions in the DB" },
  { value: "55", label: "brands with active demand signals" },
  { value: "141", label: "brand + model pairs with live 30-day data" },
]

export default function PartnersPage() {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text-body)",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ── Nav breadcrumb ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 0" }}>
        <Link
          href="/"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Resale IQ
        </Link>
      </div>

      {/* ── Hero ── */}
      <section
        style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 0" }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-buy)",
            marginBottom: 12,
          }}
        >
          Partner programme
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "var(--color-text-primary)",
            marginBottom: 20,
          }}
        >
          Weekly resale data nobody else has — yours to publish
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--color-text-body)",
            marginBottom: 32,
          }}
        >
          Resale IQ tracks 13.4 million active listings across Spain, France,
          Germany, Italy and Portugal. We can tell you which brands are selling
          in the last 30 days, the average selling price, and the buy‑below
          number that makes a flip profitable. If you make content for resellers,
          that data is your next video.
        </p>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="mailto:support@resaleiq.dev?subject=Creator%20Partner%20application&body=Tell%20us%20about%20your%20channel%20and%20audience."
            style={{
              display: "inline-block",
              background: "var(--color-buy)",
              color: "var(--color-on-buy)",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 22px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Apply as Creator Partner →
          </a>
          <a
            href="#affiliate"
            style={{
              display: "inline-block",
              background: "transparent",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              fontSize: 14,
              padding: "12px 22px",
              borderRadius: 10,
              border: "1px solid var(--color-border-2)",
              textDecoration: "none",
            }}
          >
            Affiliate programme ↓
          </a>
        </div>
      </section>

      {/* ── Dataset proof ── */}
      <section
        style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 24px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-2)",
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: 4,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 8,
          }}
        >
          Figures verified against production DB, September 2026.
        </p>
      </section>

      {/* ── Live data sample ── */}
      <section
        style={{ maxWidth: 720, margin: "48px auto 0", padding: "0 24px" }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 4,
          }}
        >
          What the data looks like
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            marginBottom: 16,
          }}
        >
          Real 30-day departure counts from the live database — the exact
          table a Creator Partner gets each week.
        </p>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto auto",
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-border)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <span>Brand</span>
            <span>Category</span>
            <span style={{ textAlign: "right" }}>Sold / 30d</span>
            <span style={{ textAlign: "right", paddingLeft: 16 }}>Avg price</span>
          </div>
          {EXAMPLE_BRANDS.map((row, i) => (
            <div
              key={row.brand + row.category}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr auto auto",
                padding: "12px 16px",
                borderBottom:
                  i < EXAMPLE_BRANDS.length - 1
                    ? "1px solid var(--color-border)"
                    : undefined,
                fontSize: 14,
              }}
            >
              <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                {row.brand}
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                {row.category}
              </span>
              <span
                style={{
                  color: "var(--color-buy)",
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                {row.sold30d.toLocaleString()}
              </span>
              <span
                style={{
                  color: "var(--color-text-primary)",
                  textAlign: "right",
                  paddingLeft: 16,
                }}
              >
                €{row.avgEur}
              </span>
            </div>
          ))}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--color-text-muted)",
            marginTop: 8,
          }}
        >
          * 30-day sold count across ES/FR/DE/IT/PT Vinted. Source: resaleiq.dev production DB.
        </p>
      </section>

      {/* ── Tier 2: Creator Partner ── */}
      <section
        style={{ maxWidth: 720, margin: "56px auto 0", padding: "0 24px" }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-buy)",
            borderRadius: 16,
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(52,199,89,0.12)",
              color: "var(--color-buy)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            Tier 2 — Creator Partner
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 12,
            }}
          >
            You get the data. You own the content.
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--color-text-body)",
              marginBottom: 20,
            }}
          >
            Creator Partners get everything in the Affiliate tier plus:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                icon: "📊",
                title: "Free Pro account (€49/mo value)",
                desc: "Unlimited item checks, Deal Scanner, Order Planner — everything unlocked.",
              },
              {
                icon: "📬",
                title: "Weekly personalised buy-list",
                desc: "Each week we send you the top-moving brand/category pairs in your niche with real buy-below prices. Publish it as your own content — TikTok, YouTube, Discord, Reddit.",
              },
              {
                icon: "🔓",
                title: "Early data access",
                desc: "New brand coverage and market signals before they go live to paying users.",
              },
              {
                icon: "💰",
                title: "30% recurring commission for 12 months",
                desc: "Every subscriber you refer pays you 30% of their monthly fee for up to 12 months. Commission is paid only on money Stripe actually receives — no chargebacks, no partial months.",
              },
            ].map((item) => (
              <li
                key={item.title}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                  {item.icon}
                </span>
                <div>
                  <strong
                    style={{
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {item.title}
                  </strong>
                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      margin: "2px 0 0",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-text-primary)" }}>
              Who this is for:
            </strong>{" "}
            TikTok / YouTube creators, Discord server owners, Reddit contributors,
            or newsletter writers who already talk to resellers. You bring the
            audience; we bring the numbers nobody else publishes.
          </p>
          <a
            href="mailto:support@resaleiq.dev?subject=Creator%20Partner%20application&body=Name%3A%0AChannel%20URL%3A%0AAudience%20size%20(approx)%3A%0ANiche%20(e.g.%20streetwear%2C%20outdoor%2C%20vintage)%3A%0ANote%3A"
            style={{
              display: "inline-block",
              background: "var(--color-buy)",
              color: "var(--color-on-buy)",
              fontWeight: 700,
              fontSize: 14,
              padding: "13px 24px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Apply — email support@resaleiq.dev →
          </a>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginTop: 10,
            }}
          >
            We review every application personally. No automated rejection.
          </p>
        </div>
      </section>

      {/* ── Tier 1: Affiliate ── */}
      <section
        id="affiliate"
        style={{ maxWidth: 720, margin: "40px auto 0", padding: "0 24px" }}
      >
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
            borderRadius: 16,
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "rgba(10,132,255,0.12)",
              color: "var(--color-blue)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            Tier 1 — Affiliate
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 12,
            }}
          >
            Share your link, earn recurring commission
          </h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              "30% recurring commission on every subscription you refer",
              "12-month attribution window per subscriber",
              "60-day cookie window — your link is credited even if they don't subscribe immediately",
              "Minimum payout threshold: €25",
              "Commission is paid only on money Stripe actually receives",
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 14,
                  color: "var(--color-text-body)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "var(--color-buy)", flexShrink: 0, fontWeight: 700 }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-secondary)",
              marginBottom: 20,
              padding: "12px 16px",
              background: "var(--color-bg-4)",
              borderRadius: 8,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "var(--color-text-primary)" }}>
              Honest numbers:
            </strong>{" "}
            Resale IQ Starter is €19/mo. Your 30% = €5.70/subscriber/month. We
            have 0 paying customers today. If you have an audience of active
            resellers who need data, the Creator Partner tier will work much
            better for you — data-driven content converts better than a raw
            referral link.
          </p>
          <a
            href="mailto:support@resaleiq.dev?subject=Affiliate%20programme%20application"
            style={{
              display: "inline-block",
              background: "transparent",
              color: "var(--color-blue)",
              fontWeight: 600,
              fontSize: 14,
              padding: "11px 20px",
              borderRadius: 10,
              border: "1px solid var(--color-blue)",
              textDecoration: "none",
            }}
          >
            Apply — email support@resaleiq.dev
          </a>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{ maxWidth: 720, margin: "56px auto 0", padding: "0 24px" }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 20,
          }}
        >
          How attribution works
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          {[
            {
              n: "1",
              title: "You get a unique link",
              desc: "resaleiq.dev/?ref=YOURCODE — yours once approved.",
            },
            {
              n: "2",
              title: "Visitor clicks your link",
              desc: "A first-party cookie (riq_ref) is set in their browser for 60 days.",
            },
            {
              n: "3",
              title: "They subscribe",
              desc: "The ref code is passed into the Stripe checkout session. The payment is attributed to you in our system.",
            },
            {
              n: "4",
              title: "You earn 30% for 12 months",
              desc: "Commission accrues every billing cycle on money Stripe actually receives. Payouts via bank transfer once you hit €25.",
            },
          ].map((step, i) => (
            <div
              key={step.n}
              style={{
                display: "flex",
                gap: 16,
                paddingBottom: i < 3 ? 24 : 0,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--color-bg-4)",
                  border: "1px solid var(--color-border-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                {step.n}
              </div>
              <div style={{ paddingTop: 4 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {step.title}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        style={{ maxWidth: 720, margin: "56px auto 0", padding: "0 24px" }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 20,
          }}
        >
          Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              q: "How many partners do you have?",
              a: "None yet. This programme launches now. Being early means your link has zero competition from other partners.",
            },
            {
              q: "Do I need to be a paying subscriber?",
              a: "Creator Partners get a free Pro account. Affiliates don't need to subscribe — you just need an audience.",
            },
            {
              q: "When do I get paid?",
              a: "Commission accrues once a referred subscriber's payment clears in Stripe. Payouts are manual bank transfers when your balance hits €25. We're a small company — payouts happen monthly.",
            },
            {
              q: "What markets does Resale IQ cover?",
              a: "Vinted in Spain, France, Germany, Italy, and Portugal. We track sold prices, listing velocity, and buy-below prices across all five.",
            },
            {
              q: "Can I use my affiliate link in paid ads?",
              a: "No. You may use your link in organic content only — YouTube, TikTok, Discord, Reddit, newsletters. Paid traffic to affiliate links is not permitted and will result in account termination.",
            },
          ].map((item) => (
            <div
              key={item.q}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 6,
                }}
              >
                {item.q}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        style={{
          maxWidth: 720,
          margin: "64px auto 0",
          padding: "0 24px 80px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            marginBottom: 12,
          }}
        >
          Ready to partner?
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "var(--color-text-secondary)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Email us at{" "}
          <a
            href="mailto:support@resaleiq.dev"
            style={{ color: "var(--color-buy)", textDecoration: "none" }}
          >
            support@resaleiq.dev
          </a>{" "}
          with your channel URL and niche. We review every application personally.
        </p>
        <a
          href="mailto:support@resaleiq.dev?subject=Creator%20Partner%20application&body=Name%3A%0AChannel%20URL%3A%0AAudience%20size%20(approx)%3A%0ANiche%20(e.g.%20streetwear%2C%20outdoor%2C%20vintage)%3A%0ANote%3A"
          style={{
            display: "inline-block",
            background: "var(--color-buy)",
            color: "var(--color-on-buy)",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          Apply as Creator Partner →
        </a>
      </section>
    </div>
  )
}
