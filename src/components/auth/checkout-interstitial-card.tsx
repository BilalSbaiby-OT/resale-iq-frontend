"use client"
/**
 * C(tony)CheckoutInterstitialCard — shared "You're about to unlock X" panel.
 *
 * Shown in two places:
 *   1. register-form.tsx: email/password new-signup path
 *   2. login-form.tsx: Google OAuth new-signup path
 *
 * In both cases the account is already created and a Stripe checkout_url is
 * ready. This card confirms the item + demand numbers before the hard Stripe
 * navigation, replacing the cold-jump that caused 95%+ checkout abandonment.
 * Pattern: Stripe's own checkout ("You're buying X"), Linear plan-confirm.
 *
 * Props:
 *   intent      — item string the user typed (may be empty)
 *   demandMatch — live demand row for the intent (may be null)
 *   planLabel   — plan display name, e.g. "Starter" (may be null → omit plan row)
 *   planPrice   — price in euros (may be null → show "…")
 *   onContinue  — called when user clicks "Continue to payment →"
 */
import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { queryCoverageKind } from "@/lib/query-coverage"
import type { Locale } from "@/lib/i18n"
import { trialCtaLabel, trialLine, firstChargeDate } from "@/lib/trial-cta"
import { useT } from "@/components/i18n/locale-provider"

export interface DemandMatchLike {
  sold_7d: number
  avg_price_eur?: number
}

export interface CheckoutInterstitialCardProps {
  intent: string
  demandMatch: DemandMatchLike | null
  planLabel?: string | null
  planPrice?: number | null
  locale?: Locale
  onContinue: () => void
}

export function CheckoutInterstitialCard({
  intent,
  demandMatch,
  planLabel,
  planPrice,
  locale = "en",
  onContinue,
}: CheckoutInterstitialCardProps) {
  const tx = useT()
  const [chargeDate, setChargeDate] = useState<string | null>(null)
  useEffect(() => { setChargeDate(firstChargeDate(locale)) }, [locale])
  const trimmed = intent.trim()
  const hasNamedItem = trimmed && (demandMatch || queryCoverageKind(trimmed) !== "untracked")

  return (
    <div className="py-2">
      <div className="flex justify-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[var(--color-buy)]/15 flex items-center justify-center">
          <Check size={20} className="text-[var(--color-buy)]" />
        </div>
      </div>
      <h2 className="text-[18px] font-bold text-center mb-1">
        {hasNamedItem
          ? <>{tx("Your {0} verdict is ready ✓", [trimmed])}</>
          : <>{tx("Account created ✓")}</>}
      </h2>
      <p className="text-[13px] text-[var(--color-text-secondary)] text-center mb-5">{tx("One step away — unlock it below.")}</p>

      {/* What they're about to unlock */}
      <div className="rounded-xl border border-[var(--color-buy)]/30 bg-[var(--color-buy)]/5 px-4 py-3 mb-4">
        <p className="text-[12px] text-[var(--color-text-muted)] mb-1 uppercase tracking-wide font-semibold">{tx("You're unlocking")}</p>
        {hasNamedItem ? (
          <>
            <p className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">
              {trimmed} verdict
            </p>
            {demandMatch && (
              <p className="text-[12px] text-[var(--color-text-secondary)]">
                {demandMatch.sold_7d}{" "}{tx("watched departures this week")}{demandMatch.avg_price_eur ? ` · avg €${demandMatch.avg_price_eur}` : ""}
                {" — "}<span className="font-semibold text-[var(--color-buy)]">{tx("buy-below price unlocking now")}</span>
              </p>
            )}
          </>
        ) : (
          <p className="text-[15px] font-bold text-[var(--color-text-primary)]">{tx("Full demand intelligence — check any brand")}</p>
        )}
      </div>

      {/* Plan summary — only when caller provides plan info */}
      {planLabel != null && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-2)] bg-[var(--color-bg-4)] px-3 py-2.5 mb-5">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{planLabel}</span>
          <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
            {planPrice != null ? `€${planPrice}/mo` : "…"}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="w-full bg-[var(--color-buy)] text-[var(--color-on-buy)] font-bold text-[14px] py-3.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        {trialCtaLabel(locale)}
      </button>
      {planPrice != null && (
        <p className="text-[11.5px] text-[var(--color-text-secondary)] text-center mt-2">
          {trialLine(locale, planPrice, "month", chargeDate)}
        </p>
      )}
      <p className="text-[11.5px] text-[var(--color-text-muted)] text-center mt-3">{tx("🔒 Secure checkout via Stripe")}</p>
    </div>
  )
}
