"use client"
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
 * Content:
 *  - The real per-item margin line, computed from the verdict's own
 *    buy_below/sell_avg fields (verdictUpsellLine — never invents a number;
 *    omitted when either field is missing).
 *  - One primary CTA straight to Stripe checkout (guest checkout, no
 *    /register detour — GuestCheckoutButton already does this).
 *  - One small secondary link for the annual price (2 months free).
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
            label="Unlock the full buy list — €19/mo"
            src={src}
            query={query}
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
