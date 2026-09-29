"use client"
/**
 * HeroFreeChips — free sample chips with inline verdict fetch.
 *
 * H139 CRO: chips previously navigated to /tools (a full page load away).
 * Visitor clicked "Adidas Samba" → left the homepage → landed on /tools →
 * no pricing context, no trust signals, no ROI card — just a single verdict
 * and a checkout button with no surrounding conviction copy. Result: 0 paid
 * conversions from home chip clicks.
 *
 * /pricing already does inline fetch for its chips since H118 (the same
 * PricingTryInput pattern) — pricing visitors click a chip and the verdict
 * appears BELOW while they stay on the page with plan cards + trust signals
 * in view. That's the correct pattern.
 *
 * This migrates homepage chips to the same inline model:
 *  - Click chip → fetch /api/verdict inline → verdict card appears below
 *  - Visitor stays on homepage; trust block, ROI card, objection row visible
 *  - Checkout CTA appears at peak conviction (right after seeing the verdict)
 *  - Navigation fallback preserved: Link inside the inline card goes to /tools
 *    for visitors who want to explore further
 *
 * Free-model chips (AF1/Samba/NB530) always return full verdicts to anon —
 * no paywall needed here. The checkout CTA below the inline result is the
 * conversion ask.
 *
 * CRO #9 (friction: removes one navigation hop from highest-intent action)
 * + #12 (momentum: verdict appears in context with plans & trust signals)
 * + #7 (trust before CTA: verdict IS the trust; plans + ROI already on page).
 * Revenue 2026-09-29. H139.
 */
import { useState } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"

const SAMPLES = ["Adidas Samba", "Nike Air Force 1", "New Balance 530"] as const

type VerdictType = "BUY" | "WATCH" | "SKIP" | "STRONG BUY"

interface InlineVerdict {
  verdict: VerdictType
  buy_below: number | null
  sell_avg: number | null
  demand_note: string | null
  product: string
}

function verdictColor(v: VerdictType): string {
  if (v === "BUY" || v === "STRONG BUY") return "#34C759"
  if (v === "SKIP") return "#FF3B30"
  return "#FFD60A"
}

function VerdictMomentumIcon({ v }: { v: VerdictType }) {
  if (v === "BUY" || v === "STRONG BUY") return <TrendingUp size={13} color="#34C759" />
  if (v === "SKIP") return <TrendingDown size={13} color="#FF3B30" />
  return <Minus size={13} color="#FFD60A" />
}

/** Mini inline verdict card — shown on the homepage when a chip is clicked. */
function HeroInlineVerdictCard({
  result,
  query,
  locale,
}: {
  result: InlineVerdict
  query: string
  locale: Locale
}) {
  const col = verdictColor(result.verdict)
  return (
    <div
      data-testid="riq-hero-inline-verdict"
      style={{
        marginTop: 14,
        maxWidth: 400,
        background: "var(--color-surface)",
        border: `1px solid ${col}40`,
        borderRadius: 12,
        padding: "13px 15px",
        textAlign: "left",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#eef1f7" }}>{result.product}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11.5,
            fontWeight: 800,
            color: col,
            border: `1px solid ${col}55`,
            borderRadius: 6,
            padding: "2px 8px",
            letterSpacing: "0.04em",
          }}
        >
          <VerdictMomentumIcon v={result.verdict} />
          {result.verdict}
        </span>
      </div>

      {/* Key numbers */}
      <div style={{ display: "flex", gap: 18, marginBottom: 8 }}>
        {result.buy_below != null && (
          <div>
            <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
              Buy below
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: col, letterSpacing: "-0.4px" }}>
              €{result.buy_below.toFixed(0)}
            </div>
          </div>
        )}
        {result.sell_avg != null && (
          <div>
            <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
              Avg resale
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.4px" }}>
              €{result.sell_avg.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* Demand note */}
      {result.demand_note && (
        <p style={{ fontSize: 11.5, color: "#8b99b8", margin: "0 0 9px", lineHeight: 1.5 }}>
          {result.demand_note}
        </p>
      )}

      {/* Locked field teaser */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {["Sell-through rate", "Top sizes", "Market trend", "Opportunity score"].map((f) => (
          <span
            key={f}
            style={{
              fontSize: 10.5,
              color: "#4a5970",
              border: "1px solid #1e2d45",
              borderRadius: 5,
              padding: "2px 6px",
              filter: "blur(2px)",
              userSelect: "none",
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Pitch */}
      <p style={{ fontSize: 11.5, color: "#5b6b8c", margin: "0 0 8px", lineHeight: 1.5 }}>
        Unlock sell-through, top sizes & all brands for{" "}
        <strong style={{ color: "#eef1f7" }}>€19/mo</strong>
      </p>

      {/* Checkout CTA — peak conviction: visitor just saw a live verdict */}
      <GuestCheckoutButton
        locale={locale}
        label="Unlock all items — €19/mo →"
        src="hero_inline_verdict_cta"
        query={query}
      />

      {/* Explore link — doesn't break momentum but gives a path for the curious */}
      <p style={{ margin: "7px 0 0", textAlign: "center" }}>
        <Link
          href={canonicalPath(locale, `/tools?q=${encodeURIComponent(query)}&src=hero_chip_explore`)}
          style={{ fontSize: 11, color: "#5b6b8c", textDecoration: "underline" }}
        >
          Explore on /tools →
        </Link>
      </p>
    </div>
  )
}

export function HeroFreeChips({ locale }: { locale: Locale }) {
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [inlineResult, setInlineResult] = useState<InlineVerdict | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchInlineVerdict(query: string) {
    setActiveChip(query)
    setInlineResult(null)
    setLoading(true)
    trackEvent(
      "hero_cta_click",
      `/hero_cta/free_chip/${query.toLowerCase().replace(/ /g, "_")}`,
    )
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.verdict && data.verdict !== "PAYWALL" && data.verdict !== "UNKNOWN") {
          setInlineResult({
            verdict: (data.verdict as VerdictType) ?? "WATCH",
            buy_below: data.buy_below ?? null,
            sell_avg: data.sell_avg ?? null,
            demand_note: data.demand_note ?? null,
            product: data.product ?? query,
          })
          return
        }
      }
    } catch (err) {
      // why: network failure on a homepage chip fetch is non-fatal — the fallback
      // navigation below sends the visitor to /tools so they are never left stuck.
      // Log at warn to keep the failure visible in server logs without alarming users.
      console.warn("[hero-chips] inline fetch failed:", err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
    // Fetch failed or returned PAYWALL (shouldn't happen for free models) — fall back
    // to navigation so the visitor is never left stuck.
    window.location.href = canonicalPath(locale, `/tools?q=${encodeURIComponent(query)}&src=home_free_sample`)
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 8,
      }}
    >
      <div
        data-testid="riq-hero-try-chips"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--color-text-dim)", whiteSpace: "nowrap" }}>
          Try free:
        </span>
        {SAMPLES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => fetchInlineVerdict(q)}
            style={{
              fontSize: 12,
              color: activeChip === q ? "#000" : "#34C759",
              background: activeChip === q ? "#34C759" : "transparent",
              border: "1px solid rgba(52,199,89,.35)",
              borderRadius: 6,
              padding: "3px 9px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {loading && activeChip === q ? "…" : q}
          </button>
        ))}
        <span style={{ fontSize: 11, color: "var(--color-text-dim)", whiteSpace: "nowrap" }}>
          — no account needed
        </span>
      </div>

      {/* Inline verdict — appears below chips when a chip is clicked */}
      {inlineResult && (
        <HeroInlineVerdictCard result={inlineResult} query={activeChip ?? ""} locale={locale} />
      )}
    </div>
  )
}
