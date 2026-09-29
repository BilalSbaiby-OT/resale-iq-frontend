"use client"
import Link from "next/link"
import { Lock, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { copy, type Locale } from "@/lib/i18n"
import { verdictWord } from "@/lib/verdict-words"
import { canonicalPath } from "@/lib/locale-routes"
import { operatorPrice, type PaywallPlan } from "@/lib/hard-paywall"
import { useTrackedLabel } from "@/lib/use-tracked-label"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { Aw26ReportCta } from "@/components/ui/aw26-report-cta"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"

/**
 * The conversion face for HARD_PAYWALL=1: anon/unpaid /api/verdict is 402.
 * Guest checkout goes straight to Stripe (same path as /pricing) — the
 * register wall was the #1 measured drop.
 *
 * H24: optional `query` prop personalizes the headline to the item the visitor
 * searched (CRO principle #3 message-match). Falls back to generic headline
 * when no query is provided (e.g. dashboard paywall). Revenue 2026-09-15.
 *
 * 2026-09-21 (Revenue sprint): added inline offer — price, feature bullets,
 * BUY button — so 93% of users who hit the paywall and never navigate to
 * /pricing see the offer IN PLACE. Added comparable_n teaser ("we hold N
 * data points on this item") to answer the "do they have my data?" objection.
 * Added AW26 one-off report as secondary CTA for visitors who won't subscribe.
 */
export function HardPaywallCard({
  locale,
  plans,
  query,
  comparableN,
  fromPricing,
  lockedRows,
}: {
  locale: Locale
  plans?: PaywallPlan[]
  query?: string
  /** Teaser from the 402 body — number of comparables we hold for this item. */
  comparableN?: number | null
  /**
   * H127 CRO: When true, the visitor just came from /pricing (src=pricing_try)
   * and already knows what the plans are. Replace the redundant "See plans →"
   * link with a "← Back to pricing" anchor that returns them to #pricing-plans
   * (already seen). This removes one dead navigation branch and adds one
   * high-intent re-engagement path. Revenue 2026-09-28.
   */
  fromPricing?: boolean
  /**
   * C228(elon): 2-3 real catalog rows shown LOCKED (blurred price) inline in
   * the paywall card itself. Hypothesis: "unlock buy list" is too abstract —
   * the reader just got a single verdict and has no idea what's actually IN
   * the buy list. Showing real brand/model names with a blurred price makes
   * the ask concrete ("this specific thing, behind this specific blur") instead
   * of an abstract subscription pitch. Surface: /blog* 130/7d,
   * checkout_from_blog=0 all-time despite C225/C226/C227. Never fabricated —
   * rows come straight from the same SSR buy-list fetch already used elsewhere.
   */
  lockedRows?: SsrBuyListItem[] | null
}) {
  const t = copy[locale].checker
  const price = operatorPrice(plans)
  const tracked = useTrackedLabel()
  // H107 CRO: read captured email from localStorage so Stripe checkout is pre-filled.
  // H98/H102/H104 wired this for homepage/blog-index/pricing-plan-cards; HardPaywallCard
  // (the /tools paywall — highest-frequency checkout entry point) was the remaining gap.
  // riq_capture_email is written by HomepageEmailCta and BlogIndexCheckoutCta.
  // Reading in useEffect (client-only) avoids SSR mismatch. Revenue 2026-09-23.
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])
  // H122 CRO: inline email input on the paywall card for direct /tools traffic.
  // A visitor who arrives at /tools directly has never typed their email on homepage
  // or blog — so riq_capture_email is empty and Stripe gets no prefill. This adds a
  // single email field ABOVE the checkout button, persisting to riq_capture_email so
  // every checkout path (GuestCheckoutButton + registered flow) pre-fills Stripe.
  // CRO principle #6 (cognitive load) — removes the first thing they must type on Stripe.
  // Revenue 2026-09-28.
  const handleEmailChange = (v: string) => {
    setCapturedEmail(v)
    if (v.trim()) {
      try { localStorage.setItem("riq_capture_email", v.trim()) } catch { /* private mode */ }
    }
  }
  const headline = query?.trim()
    ? t.paywallHeadlineForItem(query.trim())
    : t.paywallHeadline
  const bodyText = (() => {
    const resolved = tracked
    if (query?.trim() && t.paywallBodyForItem) {
      return t.paywallBodyForItem(query.trim(), resolved)
    }
    return t.paywallBody.replace("{{TRACKED}}", resolved)
  })()

  return (
    <div data-testid="riq-hard-paywall">
      {/* Locked verdict chips — shows we HAVE an answer, it's behind the gate */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lock size={15} style={{ color: "#34C759" }} aria-hidden />
        <span style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7" }}>{headline}</span>
      </div>
      <div
        data-testid="riq-paywall-locked-verdicts"
        style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}
      >
        {(["BUY", "WATCH", "SKIP"] as const).map((v) => (
          <span
            key={v}
            style={{
              opacity: 0.4,
              border: "1px solid #263147",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#eef1f7",
            }}
          >
            {verdictWord(v, locale) ?? v}
          </span>
        ))}
      </div>

      {/* C228(elon): 2-3 real locked catalog rows — the reader just got ONE
          verdict; show them what else is in the buy list they'd unlock.
          Brand/model visible, price blurred (CSS filter, not text removed) so
          the ask is concrete: "this specific item is in there, priced,
          waiting" instead of an abstract "unlock buy list" pitch. */}
      {lockedRows && lockedRows.length > 0 && (
        <div
          data-testid="riq-paywall-locked-rows"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
            border: "1px solid #263147",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8b99b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            In your unlocked buy list
          </span>
          {lockedRows.slice(0, 3).map((it, i) => (
            <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#c3cde0", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.brand}{it.model ? ` ${it.model}` : ""}
              </span>
              <span
                aria-hidden
                style={{
                  filter: "blur(4px)",
                  color: "#eef1f7",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {it.avg_price_eur != null ? `€${Math.round(it.avg_price_eur * 0.665)}` : "€••"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Evidence teaser — "we hold N data points on this item". Not a paid field. */}
      {comparableN != null && comparableN > 0 && (
        <p style={{ fontSize: 12.5, color: "#34C759", marginBottom: 10, lineHeight: 1.45, fontWeight: 600 }}>
          ✓ We hold {comparableN.toLocaleString("en-GB")} data points on this item — the answer is ready.
        </p>
      )}

      {/* ── Inline offer — price + what you get + primary CTA ────────────────
          93% of users who hit the paywall never reach /pricing. Show the offer
          here so they don't have to navigate. CRO 2026-09-21. */}
      <div
        style={{
          background: "rgba(52,199,89,.07)",
          border: "1px solid rgba(52,199,89,.2)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>
            €{price}
          </span>
          <span style={{ fontSize: 13, color: "#8b99b8" }}>/month · cancel anytime</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {[
            "BUY / WATCH / SKIP verdict + exact buy-below price",
            "Unlimited checks — every item in our catalog",
            "Sell-through rate, demand, top sizes, market trends",
            "Instant access · cancel anytime",
          ].map((f) => (
            <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Check size={13} color="#34C759" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
        {/* H122 CRO: email capture on the paywall card — prefills Stripe for direct /tools visitors.
            Visitors arriving via /tools directly have never typed their email on homepage/blog,
            so riq_capture_email is empty. One field here closes the gap; value persists so
            GuestCheckoutButton below always sends customer_email to the backend. */}
        {!capturedEmail && (
          <input
            type="email"
            placeholder="Enter your email to continue →"
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
              marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
        )}
        <GuestCheckoutButton locale={locale} label={t.paywallCta(price)} src="paywall_card" query={query} customerEmail={capturedEmail || undefined} />
        {/* H153 CRO: guarantee badge immediately below CTA.
            The 30-day refund guarantee existed as near-invisible fine-print (#4d5a75)
            buried below Aw26ReportCta and text blocks. Plausible places "no credit card
            required" directly under the CTA button — the doubt resolves at the exact
            moment the finger is on the button. Moving it here costs zero layout and
            answers objection #4 ("what if it fails?") at the right instant.
            CRO #4 (objection handling next to the doubt) + #7 (trust before CTA)
            + #12 (conviction → earned CTA → instant re-assurance = no hesitation).
            Surface: /tools 10/7d, /pricing 12/7d, blog paywall hits.
            Revenue 2026-09-29. H153. */}
        <div
          data-testid="riq-paywall-guarantee-inline"
          style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9, fontSize: 12, color: "rgba(52,199,89,0.75)" }}
        >
          <Check size={12} color="rgba(52,199,89,0.75)" strokeWidth={2.5} aria-hidden />
          <span>30-day money-back guarantee · instant access · cancel anytime</span>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 8 }}>{bodyText}</p>
      <p style={{ fontSize: 12.5, color: "#8b99b8", lineHeight: 1.55, marginBottom: 14 }}>
        {t.paywallCatalogNote}
      </p>

      {/* ── Secondary CTA: one-off AW26 report for non-subscribers ───────────
          EUR49, no account, no subscription. Single source: Aw26ReportCta.
          Revenue 2026-09-21. */}
      <Aw26ReportCta />

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <Link
          href={`${canonicalPath(locale, "/login")}${query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
          style={{ color: "#8fa3c4", fontSize: 13 }}
        >
          {t.paywallLogin}
        </Link>
        {fromPricing ? (
          /* H127 CRO: visitor came from /pricing — they already saw the plans.
             "See plans" is a dead loop. Replace with a return anchor that puts
             them back at #pricing-plans, one click from checkout.
             Revenue 2026-09-28. */
          <Link
            href={`${canonicalPath(locale, "/pricing")}#pricing-plans`}
            data-testid="riq-paywall-back-to-pricing"
            style={{ color: "#8fa3c4", fontSize: 13 }}
          >
            ← Back to pricing
          </Link>
        ) : (
          <Link
            href={`${canonicalPath(locale, "/pricing")}?src=paywall${query?.trim() ? `&item=${encodeURIComponent(query.trim())}` : ""}`}
            data-testid="riq-paywall-see-plans"
            style={{ color: "#8fa3c4", fontSize: 13 }}
          >
            {t.seePlans}
          </Link>
        )}
      </div>

      {/* Fine-print refund line */}
      <div
        data-testid="riq-paywall-guarantee"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, fontSize: 11.5, color: "#4d5a75" }}
      >
        <a href="/terms" style={{ color: "#4d5a75", textDecoration: "underline" }}>Full refund within 30 days of your first payment — see Terms</a>
      </div>
    </div>
  )
}
