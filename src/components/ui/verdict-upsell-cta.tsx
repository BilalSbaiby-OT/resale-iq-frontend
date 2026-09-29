"use client"
import { useEffect, useState } from "react"
import { verdictUpsellLine } from "@/lib/verdict-upsell"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"

/**
 * VerdictUpsellCta — the ONE paid block shown directly under a free verdict
 * result for anon/free users (Revenue sprint 2026-09-28).
 *
 * Rendered on: /tools + blog inline checker (both share FreeChecker's "card"
 * variant) and /verdict (verdict-content.tsx, logged-out/free branch).
 * Deliberately NOT rendered on the homepage hero — E-13/#59 (e2e/smoke.spec.ts,
 * e2e/public-result-face.spec.ts) is a standing rule that the hero fold carries
 * no second CTA beside the Check button; callers must gate that themselves
 * (checkerUnlockBranch already returns "checkout" for both hero and card, so
 * the hero exclusion has to happen at the call site, not in this component).
 *
 * H154 CRO: two changes vs the original:
 *
 * 1. QUERY-SPECIFIC CTA LABEL (CRO #3 message-match + #10 CTA discipline):
 *    After seeing a verdict for "Stone Island Hoodie", the CTA previously read
 *    "Unlock the full buy list" — the user doesn't know what the buy list is;
 *    they came to know if they should BUY this item. The label now reads
 *    "Unlock Stone Island Hoodie buy-below — €19/mo" — mirrors their intent,
 *    names exactly what they get. Falls back to the generic label when no query.
 *
 * 2. EMAIL PREFILL from riq_capture_email (CRO #6 cognitive load):
 *    The sticky bar (H142), blog footer (H146) and paywall card (H122/H107) all
 *    pre-fill Stripe email from localStorage. VerdictUpsellCta — the CTA shown
 *    immediately after seeing a verdict — was the one remaining gap. Visitors
 *    who typed their email on the homepage or blog had to type it again at Stripe
 *    via this path. useEffect read (same pattern as every other pre-fill) closes it.
 *
 * Paid users must never see this — callers gate on isPaidPlan/checkerUnlockBranch
 * before rendering; this component does not re-check plan itself so it stays a
 * dumb, testable presentational piece (same pattern as GuestCheckoutButton).
 */
export function VerdictUpsellCta({
  locale,
  buyBelow,
  sellAvg,
  query,
  src,
  annualHref,
}: {
  locale: Locale
  buyBelow?: number | null
  sellAvg?: number | null
  /** Item query, forwarded to GuestCheckoutButton so /billing/success can pre-fill it. */
  query?: string
  /** analytics src= tag, also used as the verdict_upsell_click variant. */
  src: string
  /** Where the "or €190/year" link goes — /pricing#pricing-plans with the
   *  yearly toggle pre-selected (pricing-section.tsx reads ?billing=yearly). */
  annualHref: string
}) {
  const line = verdictUpsellLine({ buy_below: buyBelow, sell_avg: sellAvg })

  // H154 CRO: pre-fill Stripe email from localStorage — same pattern as
  // BlogStickyBar (H142), BlogFooterCta (H146), HardPaywallCard (H107/H122).
  // VerdictUpsellCta was the last checkout-entry surface missing this write path.
  // Direct /tools visitors with a captured email from homepage/blog skip the
  // Stripe email field entirely; their last friction is removed at the
  // highest-intent moment (right after seeing their verdict).
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  // H154 CRO: query-specific label — names exactly what the visitor is about to
  // get. "Unlock the full buy list" was too abstract immediately post-verdict;
  // the visitor knows their item, not what the "buy list" is. Truncate at 28 chars
  // so the button stays single-line on 375px screens.
  const ctaLabel = (() => {
    const q = query?.trim()
    if (!q) return "Unlock the full buy list — €19/mo"
    const truncated = q.length > 28 ? `${q.slice(0, 25)}…` : q
    return `Unlock ${truncated} buy-below — €19/mo`
  })()

  return (
    <div
      data-testid="riq-verdict-upsell"
      style={{
        marginTop: 12,
        padding: "14px 16px",
        background: "rgba(52,199,89,.06)",
        border: "1px solid rgba(52,199,89,.18)",
        borderRadius: 10,
      }}
    >
      {line && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#eef1f7", margin: "0 0 10px", lineHeight: 1.5 }}>
          {line}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
        <span onClick={() => trackEvent("verdict_upsell_click", src)}>
          <GuestCheckoutButton
            locale={locale}
            label={ctaLabel}
            src={src}
            query={query}
            customerEmail={capturedEmail || undefined}
          />
        </span>
        <a
          href={annualHref}
          data-testid="riq-verdict-upsell-annual"
          onClick={() => trackEvent("verdict_upsell_click", `${src}_annual`)}
          style={{ fontSize: 12, color: "#8b99b8", textDecoration: "underline" }}
        >
          or €190/year (2 months free)
        </a>
      </div>
    </div>
  )
}
