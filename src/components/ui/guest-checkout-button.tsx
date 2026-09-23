"use client"
import { useGuestCheckout } from "@/hooks/use-guest-checkout"
import type { Locale } from "@/lib/i18n"

/**
 * GuestCheckoutButton — shared green "start Starter checkout" button.
 *
 * Extracted because HardPaywallCard and LimitReachedUpgrade (H47) both
 * need the same button shape/styles/disabled logic with different label text.
 * Keeping it in one place means one place to break.
 *
 * Rendered label text is caller-supplied so the two surfaces can say different
 * things ("Get Starter — €19/mo →" vs "Start — €19/mo") without forking the component.
 */
export function GuestCheckoutButton({
  locale,
  label,
  src,
  query,
  asLink = false,
}: {
  locale: Locale
  label: string
  /** analytics tag for useGuestCheckout src= */
  src?: string
  /** Item query the visitor was checking — passed to useGuestCheckout to
   *  save as riq_intent_query before redirect (C196). */
  query?: string
  /** render as text link style (transparent bg) instead of filled green button */
  asLink?: boolean
}) {
  const { ready, busy, start } = useGuestCheckout({ locale, src, query })
  return (
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
      {label}
    </button>
  )
}
