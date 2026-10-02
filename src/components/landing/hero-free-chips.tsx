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
 * Free-model chips (AF1/Samba/Fred Perry Polo) always return full verdicts to anon —
 * no paywall needed here. The checkout CTA below the inline result is the
 * conversion ask.
 *
 * CRO #9 (friction: removes one navigation hop from highest-intent action)
 * + #12 (momentum: verdict appears in context with plans & trust signals)
 * + #7 (trust before CTA: verdict IS the trust; plans + ROI already on page).
 * Revenue 2026-09-29. H139.
 */
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus, Lock } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { CustomQueryInput } from "@/components/ui/custom-query-input"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { localizeDemandNote } from "@/lib/verdict-words"
import { buyBelowFromAvg } from "@/lib/buy-below"

// 2026-09-29: New Balance 530 replaced with Fred Perry Polo (NB530 verdicts
// SKIP live with buy_below=null — see src/lib/working-models.ts for the
// measurement). Keep in sync with FREE_MODELS / api/routes.py _PUBLIC_SAMPLE_QUERIES.
const SAMPLES = ["Adidas Samba", "Nike Air Force 1", "Fred Perry Polo"] as const

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
 * THE GAP: HeroFreeChips lets visitors see a verdict for Adidas Samba (AF1/Fred Perry Polo).
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
  // H179: this card only renders a public sample. The visitor already has the
  // buy-below on screen. Do not sell that number back to them.
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
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{result.product}</span>
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
            <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
              Buy below
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: col, letterSpacing: "-0.4px" }}>
              €{result.buy_below.toFixed(0)}
            </div>
          </div>
        )}
        {result.sell_avg != null && (
          <div>
            <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>
              Avg resale
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.4px" }}>
              €{result.sell_avg.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* Demand note */}
      {localizeDemandNote(result.demand_note, locale) && (
        <p style={{ fontSize: 11.5, color: "var(--color-text-secondary)", margin: "0 0 9px", lineHeight: 1.5 }}>
          {localizeDemandNote(result.demand_note, locale)}
        </p>
      )}

      {/* H155 CRO: real locked buy-list rows — mirrors H150 (/pricing InlineVerdictCard).
          Before: 4 abstract field-name chips ("Sell-through rate", "Top sizes"…) with blur.
          After: up to 3 real buy-list item names with blurred buy-below prices.
          Makes the ask concrete: "these specific items are in there, priced, waiting."
          Falls back to field-name chips when no buyListPreview. CRO #8 + #4 + #7. */}
      {buyListPreview && buyListPreview.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, border: "1px solid var(--color-border-2)", borderRadius: 9, padding: "8px 10px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Also in your buy list
          </span>
          {buyListPreview.filter(it => it.brand).slice(0, 3).map((it, i) => (
            <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-body)", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
              </span>
              <span aria-hidden style={{ filter: "blur(4px)", color: "var(--color-text-primary)", fontSize: 12, fontWeight: 700, flexShrink: 0, userSelect: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                <Lock size={9} />
                {it.avg_price_eur != null ? `€${Math.round(buyBelowFromAvg(it.avg_price_eur))}` : "€••"}
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
                border: "1px solid var(--color-border-2)",
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

      {/* H179 CRO: free-vs-paid line at the moment of proof.
          RESEARCH (fetched 2026-09-29):
          - Keepa free shows the price graph with no account; paid is Product Finder
            / Buy Box, not "pay to see this graph" (increoscale.com/blog/keepa-japanese-safety-guide,
            revenuegeeks.com/software/keepa/pricing).
          - Linear free is a real product (250 issues); paid removes the cap
            (linear.app/pricing). The line is visible, not a re-ask for the free feature.
          - Beehiiv Launch is $0 and a working product; paid is "everything on Launch +"
            (beehiiv.com/pricing).
          - Plausible: full product before the plan ask; the upgrade page recommends
            from usage you already generated (plausible.io/docs/subscription-plans,
            plausible.io/docs/trial). No card on the trial.
          - Fathom: 7-day full trial, then pay; no free plan, and they say why
            (usefathom.com/pricing, usefathom.com/docs/start/trials).
          GAP: this card showed the sample buy-below, then the primary button said
          "Unlock {that item} buy-below — €19/mo". That re-sells a number the visitor
          already has, and buries "check YOUR item" under the ask. Samples are exempt
          from the wall (api/routes.py _is_public_sample_query); the first non-sample
          check is still free (_claim_first_free_verdict). HARD_PAYWALL stays on.
          ORDER: line → check your item (prove coverage) → checkout for every item.
          Surface: homepage 52/7d. CRO #1 #4 #10 #12.
          Revenue 2026-09-29. H179. */}
      <p
        data-testid="riq-hero-sample-line"
        style={{ fontSize: 12, color: "var(--color-text-body)", margin: "0 0 8px", lineHeight: 1.5 }}
      >
        You already have this sample&apos;s number. Your first check on any other item is free. After that, Starter is €19/mo.
      </p>

      <CustomQueryInput
        value={customQ}
        onChange={setCustomQ}
        onSubmit={handleCustomSubmit}
        loading={customLoading}
        buttonPadding="7px 11px"
        paywallQuery={customPaywallQuery}
        paywallN={customPaywallN}
        paywallTestId="riq-hero-custom-paywall"
        locale={locale}
        ctaSrc="hero_custom_paywall"
        customerEmail={email}
      />

      {!email && (
        <input
          type="email"
          placeholder="Email for checkout (optional)"
          aria-label="Email for checkout, optional"
          onChange={e => handleEmailChange(e.target.value)}
          style={{
            width: "100%",
            background: "var(--color-bg-2)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-2)",
            borderRadius: 9,
            padding: "9px 13px",
            fontSize: 13,
            outline: "none",
            marginTop: 10,
            boxSizing: "border-box",
          }}
        />
      )}
      <div style={{ marginTop: 8 }}>
        <GuestCheckoutButton
          locale={locale}
          src="hero_inline_verdict_cta"
          query={query}
          customerEmail={email || undefined}
        />
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
      </div>
      <p
        data-testid="riq-hero-free-line"
        style={{
          fontSize: 12,
          color: "var(--color-text-dim)",
          margin: "8px 0 0",
          textAlign: "center",
          maxWidth: 440,
          lineHeight: 1.45,
        }}
      >
        These 3 stay free, no account. Any other item: first check free, then Starter €19/mo.
      </p>

      {/* Inline verdict — appears below chips when a chip is clicked */}
      {inlineResult && (
        <HeroInlineVerdictCard result={inlineResult} query={activeChip ?? ""} locale={locale} buyListPreview={buyListPreview} capturedEmail={capturedEmail || undefined} onEmailCapture={(e) => setCapturedEmail(e)} />
      )}
    </div>
  )
}
