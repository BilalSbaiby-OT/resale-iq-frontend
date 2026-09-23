/**
 * PricingVerdictDemo — SSR-rendered real sample verdict on /pricing.
 *
 * WHY: 44 of 50 humans who viewed /pricing had NEVER seen a verdict (measured
 * 2026-09-22). The ask (€19/mo) lands before the value. Plausible.io converts
 * by letting you look at YOUR real data before asking for money; we can do the
 * same with a live server-fetched sample verdict embedded directly on the
 * pricing page, between the buy-list and the plan cards.
 *
 * WHAT: Fetch the Nike AF1 free-sample verdict server-side, render the actual
 * data fields in the same visual language as the paid verdict card — verdict
 * badge, buy-below price, sell avg, demand note, sell-through, confidence.
 * Shows exactly what a subscriber sees, on first paint, no JS, no spinner.
 *
 * RULES:
 *  - Only ever use a free sample query (AF1/Samba/NB530) — these are public
 *    by design (_is_public_sample_query), never behind the wall.
 *  - If the fetch fails, returns null → caller skips the section cleanly.
 *  - No fabricated numbers. Every figure is from the live API response.
 *  - Locked fields (sell_through_rate, top_sizes, etc.) are shown as blurred
 *    chips to prove depth WITHOUT leaking paid data. Same FOMO pattern as H82.
 *  - revalidate: 3600 (ISR hourly) — numbers stay current without per-visit cost.
 *
 * CRO principles served:
 *  #2 (single core desire): "this is what you buy" is clearer than a feature list.
 *  #4 (objection: is it worth it?): real number answers better than copy.
 *  #7 (trust before CTA): live data proof before the plan cards.
 *  #8 (specificity): "buy below €31" is more convincing than "know what to pay".
 *  #12 (conversion momentum): demonstration → value understood → ask.
 *
 * Revenue 2026-09-23.
 */

import type { Locale } from "@/lib/i18n"

interface SampleVerdict {
  verdict: string
  product: string
  category: string
  buy_below: number | null
  sell_avg: number | null
  sold_30d_evidence: number | null
  demand_note: string | null
  confidence: string | null
  confidence_note: string | null
  provisional: boolean | null
}

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

async function fetchSampleVerdict(): Promise<SampleVerdict | null> {
  // Nike AF1 is a canonical free sample (api/routes.py _is_public_sample_query).
  // Full data is returned to anon callers by design — not a paywall breach.
  try {
    // H110 CRO: 5-second timeout guards against slow backend hanging /pricing SSR.
    const pvc = new AbortController()
    const pvTimeout = setTimeout(() => pvc.abort(), 5_000)
    let r: Response
    try {
      r = await fetch(
        `${backendUrl()}/api/verdict?q=${encodeURIComponent("Nike Air Force 1")}`,
        { next: { revalidate: 3600 }, signal: pvc.signal }
      )
    } finally {
      clearTimeout(pvTimeout)
    }
    if (!r.ok) return null
    const d = (await r.json()) as Record<string, unknown>
    if (!d.verdict || d.verdict === "UNKNOWN" || d.verdict === "BRAND_CATEGORIES") return null
    return {
      verdict: String(d.verdict),
      product: String(d.product ?? "Nike Air Force 1"),
      category: String(d.category ?? "Sneakers"),
      buy_below: typeof d.buy_below === "number" ? d.buy_below : null,
      sell_avg: typeof d.sell_avg === "number" ? d.sell_avg : null,
      sold_30d_evidence: typeof d.sold_30d_evidence === "number" ? d.sold_30d_evidence : null,
      demand_note: typeof d.demand_note === "string" ? d.demand_note : null,
      confidence: typeof d.confidence === "string" ? d.confidence : null,
      confidence_note: typeof d.confidence_note === "string" ? d.confidence_note : null,
      provisional: typeof d.provisional === "boolean" ? d.provisional : null,
    }
  } catch (err) {
    // why: PricingVerdictDemo is a best-effort enhancement — /pricing must render
    // even when the backend is down. Null return means the section is skipped
    // cleanly and PricingSection still appears. Same pattern as ssr-blog-verdict.ts.
    console.warn("[pricing-verdict-demo] sample fetch failed, section skipped:", err instanceof Error ? err.message : String(err))
    return null
  }
}

const VERDICT_COLOR: Record<string, string> = {
  BUY: "#30D158",
  WATCH: "#FF9F0A",
  SKIP: "#FF453A",
  OVERSUPPLIED: "#FF453A",
  PROVISIONAL: "#FF9F0A",
  PROVISIONAL_PRICE: "#FF9F0A",
  BRAND_AVERAGE: "#8b99b8",
}
const VERDICT_BG: Record<string, string> = {
  BUY: "rgba(48,209,88,.15)",
  WATCH: "rgba(255,159,10,.15)",
  SKIP: "rgba(255,69,58,.12)",
  OVERSUPPLIED: "rgba(255,69,58,.12)",
  PROVISIONAL: "rgba(255,159,10,.15)",
  PROVISIONAL_PRICE: "rgba(255,159,10,.15)",
  BRAND_AVERAGE: "rgba(139,153,184,.12)",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PricingVerdictDemo({ locale: _locale }: { locale: Locale }) {
  const v = await fetchSampleVerdict()
  if (!v || !v.buy_below) return null

  const verdictLabel =
    v.verdict === "PROVISIONAL" || v.verdict === "PROVISIONAL_PRICE"
      ? "WATCH"
      : v.verdict
  const color = VERDICT_COLOR[verdictLabel] ?? "#8b99b8"
  const bg = VERDICT_BG[verdictLabel] ?? "rgba(139,153,184,.12)"

  return (
    <div
      data-testid="riq-pricing-verdict-demo"
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "0 24px 20px",
      }}
    >
      {/* Section label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".12em",
          color: "#6a7d9a",
          textTransform: "uppercase",
          margin: "0 0 10px",
        }}
      >
        Example verdict — what you see as a subscriber
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-ui)",
          borderRadius: 14,
          padding: "18px 20px",
        }}
      >
        {/* Product header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".08em",
              color,
              background: bg,
              padding: "5px 9px",
              borderRadius: 6,
            }}
          >
            {verdictLabel}
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {v.product}
          </span>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {v.category}
          </span>
        </div>

        {/* Core numbers — 2-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          {v.buy_below != null && (
            <div
              style={{
                background: "rgba(48,209,88,.06)",
                border: "1px solid rgba(48,209,88,.18)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: 11, color: "#6a7d9a", marginBottom: 3, fontWeight: 600 }}>
                BUY BELOW
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#30D158", letterSpacing: "-0.5px" }}>
                €{v.buy_below.toFixed(0)}
              </div>
            </div>
          )}
          {v.sell_avg != null && (
            <div
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid var(--color-border-ui)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <div style={{ fontSize: 11, color: "#6a7d9a", marginBottom: 3, fontWeight: 600 }}>
                SELL AVG
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>
                €{v.sell_avg.toFixed(0)}
              </div>
            </div>
          )}
        </div>

        {/* Demand note */}
        {v.sold_30d_evidence != null && (
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>
            {v.demand_note ?? `${v.sold_30d_evidence.toLocaleString("en-GB")} watched departures in 30 days`}
          </p>
        )}

        {/* Locked fields — blurred to show depth without leaking paid data */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Sell-through rate", "Top sizes", "Size velocity", "Opportunity score"].map((f) => (
            <span
              key={f}
              aria-label={`${f} — subscriber only`}
              style={{
                fontSize: 12,
                color: "#4a5a7a",
                background: "rgba(255,255,255,.04)",
                border: "1px solid #1e2a3a",
                borderRadius: 6,
                padding: "4px 8px",
                filter: "blur(3px)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {f}
            </span>
          ))}
          <span
            style={{
              fontSize: 12,
              color: "#6a7d9a",
              padding: "4px 0",
              alignSelf: "center",
            }}
          >
            + more — unlocked with Starter
          </span>
        </div>
      </div>
    </div>
  )
}
