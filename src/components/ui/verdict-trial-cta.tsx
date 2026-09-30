"use client"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"

/**
 * VerdictTrialCta — ONE direct trial CTA under a verdict that has a real
 * buy-below, for anyone who is not on a paid plan (caller gates on plan; this
 * stays presentational, like VerdictUpsellCta).
 *
 * Why it exists: the logged-out faces already end in a trial button, but a
 * logged-in FREE account (the two live trials-in-waiting) got either a quiet
 * "Unlock this item" or "See Starter" -> /account, and a brand-average verdict
 * on /verdict got nothing under it. Those are the moments of value with no ask.
 *
 * Reuses the single-source trial button (GuestCheckoutButton -> useGuestCheckout
 * -> createCheckout): email is prefilled from the session / riq_capture_email,
 * the label + "€0 today, then €19 on <date>, card required" disclosure come
 * from lib/trial-cta.ts. Nothing is redeclared here.
 *
 * Analytics: reuses the existing `verdict_upsell_click` funnel event (defined
 * for "the paid CTA directly under a free verdict"); `src` is the placement tag
 * and rides on the event path, so no new event or backend change is needed.
 *
 * Never on the homepage hero (E-13/#59). Never rendered for HARD_PAYWALL
 * refusals, UNKNOWN / INSUFFICIENT_DATA / OVERSUPPLIED (no number to sell).
 */
export function VerdictTrialCta({
  locale,
  query,
  src,
}: {
  locale: Locale
  /** Item the visitor just checked — saved as riq_intent_query before Stripe. */
  query?: string
  /** placement tag: checkout src= and the verdict_upsell_click path. */
  src: string
}) {
  return (
    <div
      data-testid="riq-verdict-trial-cta"
      style={{
        marginTop: 14,
        padding: "14px 16px",
        background: "rgba(52,199,89,.06)",
        border: "1px solid rgba(52,199,89,.18)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#eef1f7", lineHeight: 1.5 }}>
        Want the full buy list — every item with its max price?
      </p>
      <span onClick={() => trackEvent("verdict_upsell_click", src)}>
        <GuestCheckoutButton locale={locale} src={src} query={query} />
      </span>
    </div>
  )
}
