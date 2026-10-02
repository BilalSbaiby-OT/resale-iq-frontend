"use client"
import { useEffect, useState } from "react"
import { useGuestCheckout } from "@/hooks/use-guest-checkout"
import type { Locale } from "@/lib/i18n"
import { trialCtaLabel, trialLine, trialCardLine, firstChargeDate } from "@/lib/trial-cta"
import { TIERS } from "@/lib/pricing"
import { useAbVariant } from "@/hooks/use-ab-variant"
import { AB_CTA_LABEL_B } from "@/lib/ab-copy"

/**
 * GuestCheckoutButton — shared green "start Starter checkout" button.
 *
 * Extracted because HardPaywallCard and LimitReachedUpgrade (H47) both
 * need the same button shape/styles/disabled logic with different label text.
 * Keeping it in one place means one place to break.
 *
 * The label is the card-required 7-day trial CTA from ONE place (lib/trial-cta.ts
 * -> copy[locale].trial.cta[CTA_VARIANT]); call sites no longer hardcode labels,
 * so a copy variant swaps in a single spot. Founder decision 2026-09-30.
 */
export function GuestCheckoutButton({
  locale,
  src,
  query,
  customerEmail,
  asLink = false,
  annual = false,
}: {
  locale: Locale
  /** Deprecated/ignored: the label is always the trial CTA (single source). */
  label?: string
  /** analytics tag for useGuestCheckout src= */
  src?: string
  /** Item query the visitor was checking — passed to useGuestCheckout to
   *  save as riq_intent_query before redirect (C196). */
  query?: string
  /** Email to pre-fill on Stripe checkout — from a preceding email-capture
   *  form (H93). Passed through to useGuestCheckout. */
  customerEmail?: string
  /** render as text link style (transparent bg) instead of filled green button */
  asLink?: boolean
  /** yearly Starter price in the disclosure line (checkout itself is driven by the hook). */
  annual?: boolean
}) {
  const { ready, busy, start } = useGuestCheckout({ locale, src, query, customerEmail, annual })
  const ab = useAbVariant("cta_label")
  const [date, setDate] = useState<string | null>(null)
  useEffect(() => { setDate(firstChargeDate(locale)) }, [locale])
  const starter = TIERS.find((x) => x.id === "operator")
  const price = annual ? (starter?.priceAnnual ?? 190) : (starter?.price ?? 19)
  const button = (
    <button
      type="button"
      onClick={start}
      disabled={!ready || busy}
      style={asLink ? {
        background: "transparent",
        color: "var(--color-text-secondary)",
        fontWeight: 500,
        fontSize: 14,
        padding: "4px 0",
        border: "none",
        cursor: ready && !busy ? "pointer" : "wait",
        textDecoration: "underline",
      } : {
        background: "#34C759",
        color: "#06090c",
        fontWeight: 700,
        fontSize: 13.5,
        padding: "10px 18px",
        borderRadius: 9,
        border: "none",
        cursor: ready && !busy ? "pointer" : "wait",
      }}
    >
      {ab === "B" ? AB_CTA_LABEL_B[locale] : trialCtaLabel(locale)}
    </button>
  )
  if (asLink) return button
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, maxWidth: 360 }}>
      {button}
      <span style={{ fontSize: 11.5, lineHeight: 1.4, textAlign: "center", color: "var(--color-text-muted)" }}>
        {trialLine(locale, price, annual ? "year" : "month", date)} {trialCardLine(locale)}
      </span>
    </span>
  )
}
