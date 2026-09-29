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
import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Minus, Lock } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"

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

/**
 * H169 CRO: "Check YOUR item" inline bridge on homepage hero inline verdict card.
 *
 * RESEARCH (patterns confirmed in H159, fetched/applied 2026-09-29):
 *  - Plausible.io: show the product working for visitor's specific need before ask.
 *  - Fathom: full trial before payment request.
 *  - Beehiiv: free tier proves value; ask comes after personalized experience.
 *
 * THE GAP: HeroFreeChips lets visitors see a verdict for Adidas Samba (AF1/NB530).
 * The conviction chain STOPS there — the only next action is a generic checkout CTA.
 * There's no bridge from "I saw their data" to "does it work for MY items?".
 *
 * VerdictUpsellCta (blog 130/7d + /tools 10/7d) got this fix in H159.
 * The homepage chip path (52/7d) was the remaining gap.
 *
 * FIX: add "Now check YOUR item" mini input below the existing CTA.
 *  - 402 → inline nudge: "We hold N data points on [item] — unlock it below"
 *    + GuestCheckoutButton("Unlock [item] buy-below — €19/mo →") pre-filled.
 *  - 200 (free sample) / error → navigate to /tools for full verdict.
 *
 * CONVICTION CHAIN (Plausible/Beehiiv pattern):
 * Free chip (Samba) → see verdict → "check YOUR item" → personalized paywall
 * → "Unlock [their item] — €19/mo" → Stripe with item + email pre-filled.
 *
 * Anti-repeat: last 3 ticks = email-capture-input, faq-objection-handling,
 * refund-guarantee. This = personalization-bridge (different surface, different
 * mechanism, CRO #3/#9/#12 vs #6/#4/#4).
 *
 * Traffic: homepage 52/7d.
 * CRO #3 (message match: their item named in the ask)
 * + #9 (friction: inline paywall removes /tools hop)
 * + #12 (conviction momentum: sample → personalize → ask).
 * Revenue 2026-09-29. H169.
 */

/** Mini inline verdict card — shown on the homepage when a chip is clicked.
 *
 * H155 CRO: three gaps vs HeroInlineVerdictCard's first ship (H139):
 * 1. QUERY-SPECIFIC CTA LABEL (CRO #3): "Unlock Adidas Samba buy-below — €19/mo"
 *    vs generic "Unlock all items". Mirrors H154 (VerdictUpsellCta).
 * 2. REAL LOCKED BUY-LIST ROWS (CRO #7/#8/#4): real item names with blurred
 *    prices replace abstract field-name chips. Mirrors H150 (/pricing card).
 *    Falls back to field chips when no buyListPreview available.
 * 3. EMAIL PREFILL (CRO #6/#9): reads riq_capture_email so homepage visitors
 *    who already typed email on /pricing or blog skip Stripe email field.
 * Revenue 2026-09-29. H155.
 */
function HeroInlineVerdictCard({
  result,
  query,
  locale,
  buyListPreview,
  capturedEmail: initialEmail,
  onEmailCapture,
}: {
  result: InlineVerdict
  query: string
  locale: Locale
  buyListPreview?: SsrBuyListItem[] | null
  capturedEmail?: string
  onEmailCapture?: (email: string) => void
}) {
  const [email, setEmail] = useState(initialEmail ?? "")
  const handleEmailChange = (v: string) => {
    setEmail(v)
    if (v.trim()) {
      try { localStorage.setItem("riq_capture_email", v.trim()) } catch { /* private mode */ }
      onEmailCapture?.(v.trim())
    }
  }
  // H169 CRO: "Check YOUR item" bridge state — mirrors H159 (VerdictUpsellCta).
  const [customQ, setCustomQ] = useState("")
  const [customLoading, setCustomLoading] = useState(false)
  const [customPaywallQuery, setCustomPaywallQuery] = useState<string | null>(null)
  const [customPaywallN, setCustomPaywallN] = useState<number | null>(null)

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = customQ.trim()
    if (!trimmed) return
    setCustomPaywallQuery(null)
    setCustomPaywallN(null)
    setCustomLoading(true)
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(trimmed)}`)
      if (res.status === 402 || res.status === 401) {
        // Paywalled — show item-specific inline nudge.
        try {
          const body = await res.json().catch(() => null)
          if (body?.comparable_n != null) setCustomPaywallN(body.comparable_n as number)
        } catch { /* non-fatal — nudge shows without count */ }
        setCustomPaywallQuery(trimmed)
      } else {
        // Free sample (200) or unexpected — navigate to /tools so they see the full verdict.
        window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=hero_chip_try`
      }
    } catch {
      // why: network failure is non-fatal — /tools fallback ensures visitor is never stuck.
      window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=hero_chip_try`
    } finally {
      setCustomLoading(false)
    }
  }

  const col = verdictColor(result.verdict)
  // H155: query-specific CTA label (mirrors H154 VerdictUpsellCta)
  const ctaLabel = (() => {
    const q = query.trim()
    if (!q) return "Unlock all items — €19/mo →"
    const truncated = q.length > 28 ? `${q.slice(0, 25)}…` : q
    return `Unlock ${truncated} buy-below — €19/mo →`
  })()
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

      {/* H155 CRO: real locked buy-list rows — mirrors H150 (/pricing InlineVerdictCard).
          Before: 4 abstract field-name chips ("Sell-through rate", "Top sizes"…) with blur.
          After: up to 3 real buy-list item names with blurred buy-below prices.
          Makes the ask concrete: "these specific items are in there, priced, waiting."
          Falls back to field-name chips when no buyListPreview. CRO #8 + #4 + #7. */}
      {buyListPreview && buyListPreview.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, border: "1px solid #1e2d45", borderRadius: 9, padding: "8px 10px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#8b99b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Also in your buy list
          </span>
          {buyListPreview.filter(it => it.brand).slice(0, 3).map((it, i) => (
            <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#c3cde0", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
              </span>
              <span aria-hidden style={{ filter: "blur(4px)", color: "#eef1f7", fontSize: 12, fontWeight: 700, flexShrink: 0, userSelect: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                <Lock size={9} />
                {it.avg_price_eur != null ? `€${Math.round(it.avg_price_eur * 0.665)}` : "€••"}
              </span>
            </div>
          ))}
        </div>
      ) : (
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
      )}

      {/* Pitch */}
      <p style={{ fontSize: 11.5, color: "#5b6b8c", margin: "0 0 8px", lineHeight: 1.5 }}>
        Unlock sell-through, top sizes & all brands for{" "}
        <strong style={{ color: "#eef1f7" }}>€19/mo</strong>
      </p>

      {/* H168 CRO: email capture input on homepage hero inline verdict — peak conviction.
          H155 added email PRE-FILL from localStorage but had NO input for first-time visitors.
          23/25 Stripe sessions had no email typed (measured 2026-09-22). The /pricing
          InlineVerdictCard got this fix in H126 — the homepage chip was missed.
          Homepage has 52 visitors/7d (4× /pricing). Same mechanism: show input when no
          email captured yet, persist to localStorage, pre-fill downstream Stripe checkout.
          CRO #6 (remove Stripe friction) + #9 (momentum: don't break conviction).
          Revenue 2026-09-29. H168. */}
      {!email && (
        <input
          type="email"
          placeholder="Enter your email to unlock →"
          onChange={e => handleEmailChange(e.target.value)}
          style={{
            width: "100%",
            background: "#0d1117",
            color: "#eef1f7",
            border: "1.5px solid rgba(52,199,89,.35)",
            borderRadius: 9,
            padding: "9px 13px",
            fontSize: 13.5,
            outline: "none",
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        />
      )}
      {/* H155 CRO: query-specific label + email prefill — mirrors H154 (VerdictUpsellCta). */}
      <GuestCheckoutButton
        locale={locale}
        label={ctaLabel}
        src="hero_inline_verdict_cta"
        query={query}
        customerEmail={email || undefined}
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

      {/* H169 CRO: "Check YOUR item" inline bridge — same conviction chain as H159.
          After seeing a free sample, the visitor's real question is "does it work for
          MY items?" This adds a mini input so they try their specific item right here,
          on the homepage where trust signals, ROI card, and objection row are in view.
          402 → inline personalized nudge → one-click Stripe with their item pre-filled.
          200 → /tools for full verdict. Network error → /tools fallback (never stuck).
          CRO #3 (message match: their item in the ask) + #9 (removes /tools navigation
          hop) + #12 (conviction momentum: sample → personalize → ask).
          Revenue 2026-09-29. H169. */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <p style={{ fontSize: 12, color: "#8b99b8", margin: "0 0 7px", lineHeight: 1.5, fontWeight: 500 }}>
          Now check YOUR item:
        </p>
        <form
          onSubmit={handleCustomSubmit}
          style={{ display: "flex", gap: 7, maxWidth: 360 }}
        >
          <input
            type="text"
            value={customQ}
            onChange={e => setCustomQ(e.target.value)}
            placeholder="e.g. Stone Island Hoodie"
            autoComplete="off"
            style={{
              flex: 1,
              background: "#0d1117",
              color: "#eef1f7",
              border: "1px solid rgba(52,199,89,.25)",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 13,
              outline: "none",
              minWidth: 0,
            }}
          />
          <button
            type="submit"
            disabled={!customQ.trim() || customLoading}
            style={{
              background: "rgba(52,199,89,.12)",
              color: "#34C759",
              border: "1px solid rgba(52,199,89,.3)",
              borderRadius: 8,
              padding: "7px 11px",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: (customQ.trim() && !customLoading) ? "pointer" : "not-allowed",
              opacity: (customQ.trim() && !customLoading) ? 1 : 0.5,
              whiteSpace: "nowrap",
            }}
          >
            {customLoading ? "…" : "Check →"}
          </button>
        </form>

        {/* Inline personalized paywall — fires when their custom item returns 402 */}
        {customPaywallQuery && (
          <div
            data-testid="riq-hero-custom-paywall"
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "var(--color-surface)",
              border: "1px solid rgba(52,199,89,.3)",
              borderRadius: 9,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: "#eef1f7", margin: "0 0 4px", lineHeight: 1.4 }}>
              We have data on{" "}
              <strong style={{ color: "#34C759" }}>{customPaywallQuery}</strong>{" "}
              — unlock it below
            </p>
            {customPaywallN != null && customPaywallN > 0 && (
              <p style={{ fontSize: 12, color: "#34C759", margin: "0 0 8px", fontWeight: 600, lineHeight: 1.45 }}>
                ✓ {customPaywallN.toLocaleString("en-GB")} data points on this item — the answer is ready.
              </p>
            )}
            <GuestCheckoutButton
              locale={locale}
              label={`Unlock ${customPaywallQuery} buy-below — €19/mo →`}
              src="hero_custom_paywall"
              query={customPaywallQuery}
              customerEmail={email || undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function HeroFreeChips({ locale, buyListPreview }: { locale: Locale; buyListPreview?: SsrBuyListItem[] | null }) {
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [inlineResult, setInlineResult] = useState<InlineVerdict | null>(null)
  const [loading, setLoading] = useState(false)
  // H155 CRO: pre-fill Stripe email from localStorage — same pattern as
  // VerdictUpsellCta (H154), BlogStickyBar (H142), HardPaywallCard (H107).
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

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
        <HeroInlineVerdictCard result={inlineResult} query={activeChip ?? ""} locale={locale} buyListPreview={buyListPreview} capturedEmail={capturedEmail || undefined} onEmailCapture={(e) => setCapturedEmail(e)} />
      )}
    </div>
  )
}
