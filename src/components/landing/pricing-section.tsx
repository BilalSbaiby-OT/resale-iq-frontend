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

export function PricingSection({ locale = "en" }: { locale?: Locale }) {
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
    <section id="pricing" style={{ padding: "72px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "var(--color-buy)", textTransform: "uppercase" }}>{copy[locale].pricing}</div>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "var(--color-text-primary)", marginTop: 10, letterSpacing: "-0.6px" }}>{t.heading}</h2>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", marginTop: 10 }}>{TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale]}</p>
      </div>

      <PaybackCalculator />

      {/* 4 tiers. At 1080px wide with a 260px minimum this resolved to 3
          columns, orphaning Free alone on a second row, left-aligned against a
          full-width row above — it read as a mistake. Widened the section and
          dropped the minimum so all four sit on one row at desktop, and added
          justifyContent so any wrapped row centres instead of hanging left. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))",
        gap: 18, alignItems: "stretch", justifyContent: "center",
      }}>
        {tiers.map(tier => (
          <div key={tier.id} style={{
            position: "relative",
            background: tier.highlight ? "linear-gradient(180deg,#141a24,#10141c)" : "#12151d",
            border: `1px solid ${tier.highlight ? "#22c55e" : "#1c2333"}`,
            borderRadius: 16, padding: "28px 24px",
            boxShadow: tier.highlight ? "0 12px 40px rgba(34,197,94,.12)" : "none",
          }}>
            {tier.highlight && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#06090c", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px", padding: "4px 14px", borderRadius: 20 }}>{t.mostPopular}</div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: "#eef1f7" }}>{tier.name}</div>
            <div style={{ fontSize: 12.5, color: "#8b99b8", marginTop: 4, minHeight: 34 }}>{tier.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "18px 0 4px" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "#eef1f7", letterSpacing: "-1px" }}>
                {tier.free ? "€0" : `€${tier.price}`}
              </span>
              <span style={{ fontSize: 14, color: "#5b6b8c" }}>{tier.free ? t.forever : t.perMonth}</span>
            </div>
            {/* Per-day price. A monthly figure is compared against other
                subscriptions; a daily one is compared against a coffee, and
                against the margin on a single flip. Same number, honest framing. */}
            <div style={{ fontSize: 12, color: "#5b6b8c", marginBottom: 14, minHeight: 17 }}>
              {tier.free ? t.noCardRequired : t.perDay((tier.price / 30).toFixed(2))}
            </div>
            <button onClick={() => choose(tier.id, tier.priceId)} disabled={busy === tier.id} style={{
              width: "100%", padding: "11px 0", borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: tier.highlight ? "none" : "1px solid #263147",
              background: tier.highlight ? "#22c55e" : "#1a2030",
              color: tier.highlight ? "#06090c" : "#eef1f7", transition: "opacity .15s",
            }}>{busy === tier.id ? "…" : tier.cta}</button>
            {tier.stepUp && (
              <div style={{ marginBottom: 16, background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#22c55e", marginBottom: 5 }}>{tier.stepUp}</div>
                {tier.stepUpWhy && (
                  <div style={{ fontSize: 12, color: "#a9b6d0", lineHeight: 1.55 }}>{tier.stepUpWhy}</div>
                )}
              </div>
            )}
            {tier.ceiling && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #1c2333", fontSize: 12, color: "#5b6b8c", lineHeight: 1.5 }}>
                <span style={{ color: "#8b99b8", fontWeight: 600 }}>{t.whereItStops} </span>{tier.ceiling}
              </div>
            )}
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 11 }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <Check size={15} color={tier.highlight ? "#22c55e" : "#5b6b8c"} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "#c3cde0", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#4d5a75", marginTop: 26 }}>
        {t.footer}
      </p>
    </section>
  )
}
