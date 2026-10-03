/**
 * PricingTryInput — "Try your own item" client input below the sample verdict.
 *
 * WHY: The PricingVerdictDemo (H105) shows a static Nike AF1 sample, which
 * proves the product format but doesn't connect to the visitor's OWN items.
 * A visitor sourcing Stone Island or Carhartt sees AF1 data and thinks "nice,
 * but does it work for mine?" — and the page has no answer.
 *
 * This closes that gap: a text input lets them type their item, then routes to
 * /tools?q=X&src=pricing_try. The paywall fires there with their exact item
 * named in the context copy, converting the abstract "maybe it works" into
 * "I can see my item is in-universe — I just need to unlock it."
 *
 * HOW IT WORKS:
 *  - Pure navigation on submit — no API call, no JS dependency, no spinner.
 *  - /tools auto-runs the query via its useEffect on ?q= (already built).
 *  - HardPaywallCard at /tools carries the item name into checkout copy.
 *  - src=pricing_try is a funnel source for analytics.
 *
 * H114 CRO: Added "free live samples" chips — AF1/Samba/Fred Perry Polo are the 3
 * public sample queries that return FULL verdicts with no account required.
 * The pricing page never surfaced them — visitors had no way to experience
 * a real verdict before the paywall. These chips make the free path
 * discoverable at the exact moment of "does it actually work?"
 * Plausible.io pattern: trial access before payment proves value;
 * Beehiiv: free tier shows the product, then ask to upgrade.
 * ResaleIQ equivalent: free sample queries are the "trial" — they just
 * weren't labelled or linked at the purchase decision point.
 * CRO #4 (objection: does it work?) + #7 (trust before CTA) + #12
 * (demonstration → conviction → ask). Revenue 2026-09-23. H114.
 *
 * H118 CRO: Free sample chips now fetch the verdict INLINE — no page
 * navigation, no context switch. Plausible.io shows a live product demo on
 * the pricing page; ResaleIQ routed visitors away to /tools. With inline
 * fetch, the visitor clicks "Nike Air Force 1" and a real verdict appears
 * below the input while they stay on /pricing. They see the product working,
 * look down and see the plan cards — conviction before ask.
 * Custom items still route to /tools so the HardPaywallCard shows their item
 * name in checkout copy (no change to that path).
 * CRO #3 (message match) + #4 (does it work?) + #7 (trust before CTA)
 * + #12 (demonstration → conviction → ask). Revenue 2026-09-28. H118.
 *
 * CRO principles:
 *  #3 (message match): visitor's own item in the paywall headline.
 *  #4 (objection: does it work for MY items?): they try and find out.
 *  #7 (trust before CTA): free live verdict = product proves itself.
 *  #8 (specificity): live data for their item, not a generic claim.
 *  #12 (conversion momentum): demo → personalized → paywall → checkout.
 *
 * Revenue 2026-09-23. H108 / H114.
 */
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, TrendingDown, Minus, Lock } from "lucide-react"
import { canonicalPath } from "@/lib/locale-routes"
import type { Locale } from "@/lib/i18n"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { buyBelowFromAvg } from "@/lib/buy-below"
import { FREE_SAMPLE_CHIPS } from "@/lib/free-samples"
import { ExitSurvey } from "@/components/ui/exit-survey"
import { getPlanFromToken } from "@/lib/utils"
import { flowParam, typedFlow } from "@/lib/verdict-flow"

type VerdictType = "BUY" | "WATCH" | "SKIP"

interface InlineVerdict {
  verdict: VerdictType
  buy_below: number | null
  sell_avg: number | null
  demand_note: string | null
  product: string
  confidence: string | null
}

/** Inline paywall nudge — shown when a custom-item fetch returns 402 (PAYWALL). */
function CustomItemPaywallCard({ query, locale, capturedEmail: initialEmail, onEmailCapture, comparableN, buyListPreview }: { query: string; locale: Locale; capturedEmail?: string; onEmailCapture?: (email: string) => void; comparableN?: number | null; buyListPreview?: SsrBuyListItem[] | null }) {
  const [email, setEmail] = useState(initialEmail ?? "")
  const handleEmailChange = (v: string) => {
    setEmail(v)
    if (v.trim()) {
      try { localStorage.setItem("riq_capture_email", v.trim()) } catch { /* private mode */ }
      onEmailCapture?.(v.trim())
    }
  }
  return (
    <div
      data-testid="riq-pricing-custom-paywall"
      style={{
        marginTop: 14,
        maxWidth: 480,
        background: "var(--color-surface)",
        border: "1px solid rgba(52,199,89,.3)",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      {/* Personalised headline — CRO #3 message-match */}
      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 6px", lineHeight: 1.4 }}>
        We have data on <strong style={{ color: "#34C759" }}>{query}</strong> — unlock it below
      </p>
      {/* H135 CRO: comparable_n specificity — same trust signal as HardPaywallCard.
          "We have data" is a claim. "We hold 109 data points" is proof.
          The 402 body already returns comparable_n; this surfaces it on /pricing inline
          paywall, where it was previously discarded. CRO #8 (specificity) + #7 (trust).
          Revenue 2026-09-28. */}
      {comparableN != null && comparableN > 0 ? (
        <p style={{ fontSize: 12.5, color: "#34C759", margin: "0 0 10px", lineHeight: 1.45, fontWeight: 600 }}>
          ✓ We have data on this item — the answer is ready.
        </p>
      ) : (
        <p style={{ fontSize: 12.5, color: "#8b99b8", margin: "0 0 12px", lineHeight: 1.5 }}>
          BUY / WATCH / SKIP verdict + exact buy-below price · Starter €19/mo
        </p>
      )}
      {/* H158 CRO: real locked buy-list rows in CustomItemPaywallCard — same pattern as
          InlineVerdictCard (H150). Before: 4 abstract chip names ("Buy-below price", "Top sizes")
          — meaningless to a reseller who doesn't know what the buy list is yet. After: real
          brand/model names with blurred buy-below prices, proving the catalog has concrete items.
          The visitor typed THEIR item and hit the paywall; showing 3 other real catalog items
          (priced, waiting) makes the unlock ask concrete, not abstract.
          Falls back to field-name chips only when buyListPreview is unavailable.
          CRO #8 (specificity: real items > abstract labels)
          + #4 (objection: "will it work for MY items?" — real names answer it)
          + #7 (trust before CTA: concrete rows > invented UI widgets).
          Revenue 2026-09-29. H158. */}
      {buyListPreview && buyListPreview.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, border: "1px solid #1e2d45", borderRadius: 9, padding: "9px 11px" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8b99b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Also in your buy list
          </span>
          {buyListPreview.filter(it => it.brand).slice(0, 3).map((it, i) => (
            <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: "#c3cde0", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
              </span>
              <span aria-hidden style={{ filter: "blur(4px)", color: "var(--color-text-primary)", fontSize: 12.5, fontWeight: 700, flexShrink: 0, userSelect: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Lock size={10} />
                {it.avg_price_eur != null ? `€${Math.round(buyBelowFromAvg(it.avg_price_eur))}` : "€••"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {["Buy-below price", "Sell-through rate", "Top sizes", "Demand trend"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: 11,
                color: "#4a5970",
                border: "1px solid #1e2d45",
                borderRadius: 6,
                padding: "3px 7px",
                filter: "blur(2px)",
                userSelect: "none",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
      {/* Email capture before checkout — same pattern as H122/H126 */}
      {!email && (
        <input
          type="email"
          placeholder="Enter your email to unlock →"
          onChange={e => handleEmailChange(e.target.value)}
          style={{
            width: "100%",
            background: "var(--color-bg-2)",
            color: "var(--color-text-primary)",
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
      <GuestCheckoutButton
        locale={locale}
        src="pricing_custom_paywall"
        query={query}
        customerEmail={email || undefined}
      />
      <p style={{ fontSize: 11.5, color: "#5b6b8c", margin: "8px 0 0" }}>
        <a href="/terms" style={{ color: "#5b6b8c", textDecoration: "underline" }}>Full refund within 30 days of your first payment — see Terms</a>
      </p>
      <ExitSurvey context="paywall" locale={locale} query={query} />
    </div>
  )
}

function verdictColor(v: VerdictType): string {
  if (v === "BUY") return "#34C759"
  if (v === "SKIP") return "#FF3B30"
  return "#FFD60A"
}

function VerdictMomentumIcon({ v }: { v: VerdictType }) {
  if (v === "BUY") return <TrendingUp size={14} color="#34C759" />
  if (v === "SKIP") return <TrendingDown size={14} color="#FF3B30" />
  return <Minus size={14} color="#FFD60A" />
}

/** Mini inline verdict card — shown when a free sample chip is clicked. */
function InlineVerdictCard({ result, query, locale, capturedEmail: initialEmail, onEmailCapture, buyListPreview }: { result: InlineVerdict; query: string; locale: Locale; capturedEmail?: string; onEmailCapture?: (email: string) => void; buyListPreview?: SsrBuyListItem[] | null }) {
  const [email, setEmail] = useState(initialEmail ?? "")
  const handleEmailChange = (v: string) => {
    setEmail(v)
    if (v.trim()) {
      try { localStorage.setItem("riq_capture_email", v.trim()) } catch { /* private mode */ }
      onEmailCapture?.(v.trim())
    }
  }
  const capturedEmail = email
  const col = verdictColor(result.verdict)
  return (
    <div
      data-testid="riq-pricing-inline-verdict"
      style={{
        marginTop: 14,
        maxWidth: 480,
        background: "var(--color-surface)",
        border: `1px solid ${col}40`,
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{result.product}</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            fontWeight: 800,
            color: col,
            border: `1px solid ${col}55`,
            borderRadius: 7,
            padding: "3px 9px",
            letterSpacing: "0.04em",
          }}
        >
          <VerdictMomentumIcon v={result.verdict} />
          {result.verdict}
        </span>
      </div>

      {/* Key numbers */}
      <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
        {result.buy_below != null && (
          <div>
            <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
              Buy below
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: col, letterSpacing: "-0.4px" }}>
              €{result.buy_below.toFixed(0)}
            </div>
          </div>
        )}
        {result.sell_avg != null && (
          <div>
            <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
              Avg resale
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.4px" }}>
              €{result.sell_avg.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* H150 CRO: replace hardcoded fake-field chips with real locked buy-list items.
          Before: 4 blurred chips ("Sell-through rate", "Top sizes", …) — fake field
          names that mean nothing to a reseller and weren't connected to real data.
          After: up to 3 real buy-list item names with blurred buy-below prices, same
          pattern as HardPaywallCard.lockedRows (C228). Makes the ask concrete:
          "this specific item is in there, priced, waiting" vs abstract column headers.
          Falls back to field-name chips only when no buyListPreview is available.
          CRO #8 (behavioral: specificity — real items convert, abstract labels don't)
          + #4 (objection: "will it work for MY items?" — real catalog names answer it)
          + #7 (trust before CTA: concrete rows > made-up UI widgets).
          Revenue 2026-09-29. H150. */}
      {buyListPreview && buyListPreview.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, border: "1px solid #1e2d45", borderRadius: 9, padding: "9px 11px" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8b99b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Also in your buy list
          </span>
          {buyListPreview.filter(it => it.brand).slice(0, 3).map((it, i) => (
            <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 12.5, color: "#c3cde0", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
              </span>
              <span aria-hidden style={{ filter: "blur(4px)", color: "var(--color-text-primary)", fontSize: 12.5, fontWeight: 700, flexShrink: 0, userSelect: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Lock size={10} />
                {it.avg_price_eur != null ? `€${Math.round(buyBelowFromAvg(it.avg_price_eur))}` : "€••"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {["Sell-through rate", "Top sizes", "Market trends", "Opportunity score"].map((f) => (
            <span
              key={f}
              style={{
                fontSize: 11,
                color: "#4a5970",
                border: "1px solid #1e2d45",
                borderRadius: 6,
                padding: "3px 7px",
                filter: "blur(2px)",
                userSelect: "none",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* H125 CRO: direct checkout at peak conviction — visitor just saw a full live verdict.
          Before: anchor scrolled them away from the proof moment. After: GuestCheckoutButton
          fires Stripe directly from the inline verdict. Email pre-filled from riq_capture_email.
          CRO #12 (momentum: demo → earned checkout, no detour) + #10 (solution-aware → commit).
          Revenue 2026-09-28. */}
      {/* H126 CRO: email capture on inline verdict card — peak conviction moment.
          H122 added email capture to HardPaywallCard but InlineVerdictCard was
          missed. A visitor who lands on /pricing fresh, clicks a free sample chip,
          sees the verdict, and clicks checkout hits Stripe with no email pre-filled
          (same "23 of 25 sessions had no email" problem). One field here closes
          the gap and persists to riq_capture_email so all downstream checkout
          paths (GuestCheckoutButton, registered flow) pre-fill Stripe.
          CRO #6 (remove first Stripe friction) + #12 (momentum: don't break
          conviction with a cold form). Revenue 2026-09-28. */}
      {!capturedEmail && (
        <input
          type="email"
          placeholder="Enter your email to unlock →"
          onChange={e => handleEmailChange(e.target.value)}
          style={{
            width: "100%",
            background: "var(--color-bg-2)",
            color: "var(--color-text-primary)",
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
      <p style={{ fontSize: 12, color: "#5b6b8c", margin: "0 0 8px", lineHeight: 1.5 }}>
        Unlock sell-through, top sizes & all items for <strong style={{ color: "var(--color-text-primary)" }}>€19/mo</strong>
      </p>
      {/* H156 CRO: query-specific CTA label on /pricing inline verdict card.
          Before: "Unlock all items — €19/mo →" — generic, no message match.
          After: "Unlock Nike Air Force 1 buy-below — €19/mo →" — names the
          exact item the visitor just saw a verdict for. Same pattern proven
          in H154 (VerdictUpsellCta) and H155 (HeroInlineVerdictCard).
          Peak conviction moment: visitor just saw buy_below + verdict for
          their chip — the CTA should mirror it, not reset to abstract copy.
          CRO #3 (message match: their item in the ask) + #10 (CTA discipline:
          solution-aware → commit-framed label).
          Revenue 2026-09-29. H156. */}
      <GuestCheckoutButton
        locale={locale}
        src="inline_verdict_cta"
        query={query}
        customerEmail={capturedEmail}
      />
    </div>
  )
}

export function PricingTryInput({ locale, buyListPreview }: { locale: Locale; buyListPreview?: import("@/lib/ssr-buy-list").SsrBuyListItem[] | null }) {
  const [q, setQ] = useState("")
  const router = useRouter()

  // H118: inline verdict state for free sample chips
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [inlineResult, setInlineResult] = useState<InlineVerdict | null>(null)
  const [loading, setLoading] = useState(false)
  // H128 CRO: inline custom paywall — submitted custom item returns 402 inline.
  const [customPaywallQuery, setCustomPaywallQuery] = useState<string | null>(null)
  const [customPaywallComparableN, setCustomPaywallComparableN] = useState<number | null>(null)
  const [customLoading, setCustomLoading] = useState(false)
  // H125 CRO: read captured email for GuestCheckoutButton pre-fill in InlineVerdictCard.
  // Same pattern as HardPaywallCard H122 — read at mount to avoid SSR mismatch.
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  async function fetchInlineVerdict(query: string) {
    setActiveChip(query)
    setInlineResult(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(query)}${flowParam("sample_button")}`)
      if (res.ok) {
        const data = await res.json()
        setInlineResult({
          verdict: (data.verdict as VerdictType) ?? "WATCH",
          buy_below: data.buy_below ?? null,
          sell_avg: data.sell_avg ?? null,
          demand_note: data.demand_note ?? null,
          product: data.product ?? query,
          confidence: data.confidence ?? null,
        })
      }
    } catch {
      // why: fetch failure is non-fatal — the chip stays highlighted and the
      // visitor can still type their item and route to /tools. No data beats
      // no product, and a console.error on a pricing page would be noisy on
      // every slow mobile connection. The lack of result speaks for itself.
      setInlineResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (!trimmed) return
    // H128 CRO: fetch inline instead of routing to /tools.
    // Free samples return a verdict (show it inline). Paid items return 402 PAYWALL —
    // show CustomItemPaywallCard in place so the visitor stays on /pricing next to the
    // plan cards, at the highest conviction moment. Before this, every custom submit
    // navigated away to /tools → paywall → "Back to pricing" (3 clicks to checkout).
    // Now: type item → submit → personalized nudge appears inline → one click to Stripe.
    // CRO #9 (momentum: every section guides action) + #12 (demo → personalized → ask).
    // Revenue 2026-09-28. H128.
    setCustomPaywallQuery(null)
    setCustomPaywallComparableN(null)
    setInlineResult(null)
    setActiveChip(null)
    setCustomLoading(true)
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(trimmed)}${flowParam(typedFlow(trimmed, getPlanFromToken()))}`)
      if (res.status === 402 || res.status === 401) {
        // Paywalled item — show custom nudge inline, no navigation.
        // H135 CRO: parse 402 body to extract comparable_n for specificity signal.
        // Before: body discarded, CustomItemPaywallCard shows "We have data" (claim).
        // After: "We hold 109 data points" (proof). CRO #8 + #7. Revenue 2026-09-28.
        try {
          const body = await res.json().catch(() => null)
          if (body?.comparable_n != null) setCustomPaywallComparableN(body.comparable_n as number)
        } catch { /* non-fatal — comparableN stays null */ }
        setCustomPaywallQuery(trimmed)
      } else if (res.ok) {
        const data = await res.json()
        if (data.verdict && data.verdict !== "PAYWALL") {
          // Free sample returned full verdict — show it inline.
          setActiveChip(trimmed)
          setInlineResult({
            verdict: (data.verdict as VerdictType) ?? "WATCH",
            buy_below: data.buy_below ?? null,
            sell_avg: data.sell_avg ?? null,
            demand_note: data.demand_note ?? null,
            product: data.product ?? trimmed,
            confidence: data.confidence ?? null,
          })
        } else {
          // PAYWALL verdict in 200 body (some backends return 200+PAYWALL).
          setCustomPaywallQuery(trimmed)
        }
      } else {
        // Unexpected error — fall back to navigation so the user isn't stuck.
        router.push(canonicalPath(locale, `/tools?q=${encodeURIComponent(trimmed)}&src=pricing_try`))
      }
    } catch (err) {
      // why: network error on a pricing-page fetch is non-fatal — the visitor
      // is routed to /tools as a fallback so they aren't left without a path.
      // Logging at warn preserves debuggability without alarming users.
      console.warn("[pricing-try] inline fetch failed, falling back to /tools:", err instanceof Error ? err.message : String(err))
      router.push(canonicalPath(locale, `/tools?q=${encodeURIComponent(trimmed)}&src=pricing_try`))
    } finally {
      setCustomLoading(false)
    }
  }

  return (
    <div
      id="pricing-try"
      data-testid="riq-pricing-try-input"
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "0 24px 28px",
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "#8b99b8",
          margin: "0 0 10px",
          fontWeight: 500,
        }}
      >
        Check your own item — type any brand + garment:
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          maxWidth: 480,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 10,
            padding: "0 12px",
          }}
        >
          <Search size={14} color="#5b6b8c" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Stone Island Hoodie"
            autoComplete="off"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--color-text-primary)",
              padding: "10px 0",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!q.trim() || customLoading}
          style={{
            background: "#30D158",
            color: "#000",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: 14,
            fontWeight: 700,
            cursor: (q.trim() && !customLoading) ? "pointer" : "not-allowed",
            opacity: (q.trim() && !customLoading) ? 1 : 0.45,
            whiteSpace: "nowrap",
          }}
        >
          {customLoading ? "…" : "Check it →"}
        </button>
      </form>

      {/* H118 CRO: free live sample chips — inline fetch, no nav away.
          Previously: click chip → navigate to /tools → load page → see verdict.
          Now: click chip → fetch inline → verdict appears below input in ~1s.
          Plausible.io pattern: live demo on the pricing page itself, zero friction.
          The visitor experiences the product without a redirect, looks down and
          sees plan cards on the same page — momentum intact.
          Full verdict (AF1/Samba/Fred Perry Polo are public sample queries, no auth required).
          src=pricing_free_sample still used when navigating for non-sample queries. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "#5b6b8c", whiteSpace: "nowrap" }}>
          Or try a free sample:
        </span>
        {FREE_SAMPLE_CHIPS.map(({ label, q: sampleQ }) => (
          <button
            key={sampleQ}
            type="button"
            onClick={() => fetchInlineVerdict(sampleQ)}
            style={{
              fontSize: 12,
              color: activeChip === sampleQ ? "#000" : "#34C759",
              background: activeChip === sampleQ ? "#34C759" : "transparent",
              border: "1px solid rgba(52,199,89,.35)",
              borderRadius: 6,
              padding: "3px 9px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 600,
              lineHeight: 1.6,
            }}
          >
            {loading && activeChip === sampleQ ? "…" : label}
          </button>
        ))}
        <span style={{ fontSize: 11.5, color: "#4a5970", whiteSpace: "nowrap" }}>
          — no account required
        </span>
      </div>

      {/* Inline verdict result */}
      {inlineResult && <InlineVerdictCard result={inlineResult} query={activeChip ?? ""} locale={locale} capturedEmail={capturedEmail || undefined} onEmailCapture={(e) => setCapturedEmail(e)} buyListPreview={buyListPreview} />}
      {/* H128 CRO: inline custom paywall — stays on /pricing for personalized upsell.
          Before: custom submit → /tools → paywall → "Back to pricing" (3 hops).
          Now: submit → fetch → 402 → CustomItemPaywallCard inline → one click to Stripe.
          Keeps visitor at highest conviction moment (they chose to type their item).
          CRO #9 (momentum) + #12 (demonstration → personalized → ask). Revenue 2026-09-28. */}
      {customPaywallQuery && <CustomItemPaywallCard query={customPaywallQuery} locale={locale} capturedEmail={capturedEmail || undefined} onEmailCapture={(e) => setCapturedEmail(e)} comparableN={customPaywallComparableN} buyListPreview={buyListPreview} />}
    </div>
  )
}
