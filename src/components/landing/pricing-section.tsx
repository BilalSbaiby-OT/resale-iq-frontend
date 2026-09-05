"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { PaybackCalculator } from "./payback-calculator"
import { getPlans, createCheckout } from "@/lib/api"
import { getToken } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics"
import { TRIAL_LIMITS_SENTENCE_BY_LOCALE } from "@/lib/trial-copy"
import { copy, type Locale } from "@/lib/i18n"

// TIERS (lib/pricing.ts) stays the structural + English source of truth —
// paywall.tsx (the authenticated, post-quota-depletion upsell) still reads
// it directly and is out of scope for this pass. Here, on the marketing
// homepage, each tier's display text is overridden per locale from
// copy[locale].tiers, keyed by Tier.id. Falls back to the English TIERS
// text for any locale/id the dictionary does not cover, so a partial
// dictionary degrades to English rather than to `undefined`.
function localizedTiers(locale: Locale) {
  const dict = copy[locale].tiers as Record<string, {
    tagline: string; cta: string; stepUp?: string; stepUpWhy?: string; ceiling?: string; features: readonly string[]
  }>
  return TIERS.map((tier) => {
    const l = dict[tier.id]
    return l ? { ...tier, ...l } : tier
  })
}

export function PricingSection({ locale = "en", compact = false }: { locale?: Locale; compact?: boolean }) {
  const router = useRouter()
  const t = copy[locale].pricingSection
  const tiers = localizedTiers(locale)
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const choose = async (tierId: string, placeholder?: string) => {
    // Free rung: no Stripe involved, just get them an account.
    if (tierId === "free") { router.push("/register?plan=free"); return }
    if (!placeholder) return
    if (!getToken()) { router.push(`/register?plan=${tierId === "power" ? "power" : "operator"}`); return }
    setBusy(tierId)
    try {
      const priceId = resolvePriceId(placeholder, plans)
      if (!priceId) { router.push("/register"); return }
      const { checkout_url } = await createCheckout(priceId)
      trackEvent("checkout_started")
      window.location.href = checkout_url
    } catch { router.push("/register") } finally { setBusy(null) }
  }

  return (
    <section id="pricing" className="riq-pricing" style={{ padding: compact ? "36px 20px 56px" : "72px 24px", maxWidth: compact ? 720 : 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: compact ? 24 : 44 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", color: "var(--color-buy)", textTransform: "uppercase" }}>{copy[locale].pricing}</div>
        <h2 style={{ fontSize: compact ? 22 : 34, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 8, letterSpacing: "-0.4px" }}>{t.heading}</h2>
        <p style={{ fontSize: compact ? 13 : 15, color: "var(--color-text-secondary)", marginTop: 8 }}>{TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale]}</p>
      </div>

      {/* 3 tiers. At 1080px wide with a 260px minimum this resolved to 3
          columns, orphaning Free alone on a second row, left-aligned against a
          full-width row above — it read as a mistake. Widened the section and
          dropped the minimum so all sit on one row at desktop, and added
          justifyContent so any wrapped row centres instead of hanging left. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))",
        gap: 18, alignItems: "stretch", justifyContent: "center",
      }}>
        {/* One card shape for every tier. The recommended tier is marked by its
            FILLED CTA and nothing else — previously it also carried a green
            border, a green drop-shadow, a green gradient background, a floating
            "MOST POPULAR" pill and green feature ticks, which is five signals
            for one idea and the multi-green this pass exists to remove.

            The pill is gone on a truth basis, not a taste one: Resale IQ has 0
            paying customers and EUR 0.00 MRR, so no tier is the most popular
            and the badge stated a fact we have not measured. Same standard the
            payback calculator already holds itself to two blocks down ("we do
            not claim a hit rate, because we have not measured one"). The
            pricingSection.mostPopular key stays translated in all six locales
            for when the claim is earned. */}
        {tiers.map(tier => (
          <div key={tier.id} style={{
            position: "relative",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 16, padding: "28px 24px",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>{tier.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 4, minHeight: 34 }}>{tier.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "18px 0 4px" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-1px" }}>
                {tier.free ? "€0" : `€${tier.price}`}
              </span>
              <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{tier.free ? t.forever : t.perMonth}</span>
            </div>
            {/* Per-day price. A monthly figure is compared against other
                subscriptions; a daily one is compared against a coffee, and
                against the margin on a single flip. Same number, honest framing. */}
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 14, minHeight: 17 }}>
              {tier.free ? t.noCardRequired : t.perDay((tier.price / 30).toFixed(2))}
            </div>
            <button onClick={() => choose(tier.id, tier.priceId)} disabled={busy === tier.id} style={{
              width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: tier.highlight ? "none" : "1px solid var(--color-border-2)",
              background: tier.highlight ? "var(--color-buy)" : "var(--color-bg-4)",
              color: tier.highlight ? "var(--color-on-buy)" : "var(--color-text-primary)",
              transition: "opacity .15s",
            }}>{busy === tier.id ? "…" : tier.cta}</button>
            {/* stepUp / ceiling keep every word — only their boxes are gone.
                Both were tinted, bordered panels stacked inside an already
                bordered card; spacing and weight carry the same hierarchy
                without three nested rectangles. */}
            {tier.stepUp && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 5 }}>{tier.stepUp}</div>
                {tier.stepUpWhy && (
                  <div style={{ fontSize: 12, color: "var(--color-text-body)", lineHeight: 1.55 }}>{tier.stepUpWhy}</div>
                )}
              </div>
            )}
            {tier.ceiling && (
              <div style={{ marginTop: 18, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>{t.whereItStops} </span>{tier.ceiling}
              </div>
            )}
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 11 }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Check size={15} color="var(--color-text-muted)" strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "var(--color-text-body)", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-muted)", marginTop: 26 }}>
        {t.footer}
      </p>

      {/* Moved BELOW the tiers (was between the heading and the prices).
          Measured at 390px: the calculator is 758px — a full phone viewport of
          sliders standing between "Know what to pay" and the first price. A
          visitor who came to see the price had to scroll past an interactive
          widget to reach one. It is a good argument FOR the price, so it now
          runs after the prices it argues about, not in front of them.

          locale: this block rendered in English on all five translated
          homepages. starterPrice: taken from TIERS rather than the
          calculator's own constant, so the break-even sum can never quote a
          price the cards above it have stopped charging. */}
      <PaybackCalculator
        locale={locale}
        starterPrice={TIERS.find((x) => x.id === "operator")?.price ?? 19}
      />
    </section>
  )
}
