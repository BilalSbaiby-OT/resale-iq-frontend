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

/**
 * Two densities, one component. `compact` is the strip embedded in the landing
 * page (landing-content.tsx); the roomy default is the standalone /pricing
 * route (src/app/pricing/page.tsx, src/app/[locale]/pricing/page.tsx), which is
 * the only place this section is the whole page and can afford the type scale.
 *
 * Deliberately a prop and not a second component: tier content, the Stripe
 * price-id resolution and the checkout branch have exactly one home. A fork
 * would be two places to change a price, which is how a page ends up quoting a
 * number we have stopped charging.
 */
type Scale = {
  padY: string; maxWidth: number; headMargin: number; headSize: number
  gap: number; cardPad: string; tierName: number; tagline: number
  taglineMin: number; perDay: number; body: number; featureGap: number
  blockGap: number
}
const ROOMY: Scale = {
  padY: "80px 24px", maxWidth: 1040, headMargin: 48, headSize: 40,
  gap: 24, cardPad: "24px", tierName: 20, tagline: 15,
  taglineMin: 44, perDay: 13, body: 14.5, featureGap: 12, blockGap: 24,
}
const COMPACT: Scale = {
  padY: "36px 20px 56px", maxWidth: 720, headMargin: 24, headSize: 22,
  gap: 16, cardPad: "20px", tierName: 15, tagline: 12.5,
  taglineMin: 34, perDay: 12, body: 12.5, featureGap: 11, blockGap: 18,
}

export function PricingSection({
  locale = "en",
  compact = false,
  headingLevel = 2,
}: {
  locale?: Locale
  compact?: boolean
  /** h1 on the standalone /pricing route, h2 when embedded under the landing
   *  page's own h1. One h1 per document; the copy is identical either way. */
  headingLevel?: 1 | 2
}) {
  const router = useRouter()
  const t = copy[locale].pricingSection
  const tiers = localizedTiers(locale)
  const s = compact ? COMPACT : ROOMY
  const Heading = (headingLevel === 1 ? "h1" : "h2") as "h1" | "h2"
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => { getPlans().then(d => setPlans(d.plans)).catch(() => {}) }, [])

  const choose = async (tierId: string, placeholder?: string) => {
    // Free rung: no Stripe involved, just get them an account.
    if (tierId === "free") { router.push("/register?plan=free"); return }
    if (!placeholder) return
    if (!getToken()) {
      const plan = tierId === "power" ? "power" : "operator"
      // BEFORE the redirect, and before the `return` that used to end the
      // function here. This branch is the only path by which a logged-out
      // visitor can press a paid button, and it left no trace: `checkout_started`
      // on line ~95 is unreachable without a token, so every stranger who
      // wanted to buy and gave up at the register wall was invisible. Production
      // 2026-09-06: 8 distinct visitors reached `pricing_view`, 0 logged-out
      // visitors ever reached `checkout_started`.
      //
      // The plan rides on the path because /api/track persists no extra body
      // fields (api/routes.py:3682) — same encoding the register failure
      // reasons already use in trackEvent. It is the tier a stranger actually
      // pressed, which is the closest thing to a willingness-to-pay signal this
      // company has had since the single unprompted EUR 49 checkout on
      // 2026-08-28.
      const here = typeof window !== "undefined" ? window.location.pathname : "/pricing"
      trackEvent("checkout_intent_guest", `${here}?plan=${plan}`)
      router.push(`/register?plan=${plan}`)
      return
    }
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
    <section id="pricing" className="riq-pricing" style={{ padding: s.padY, maxWidth: s.maxWidth, margin: "0 auto" }}>
      {/* The eyebrow was the section's second accent-coloured element after the
          filled CTA. On the standalone page that made two things compete to be
          the one green thing; muted here, the CTA is alone again. */}
      <div style={{ textAlign: "center", marginBottom: s.headMargin }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.2px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{copy[locale].pricing}</div>
        <Heading style={{ fontSize: s.headSize, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 12, letterSpacing: "-0.6px", lineHeight: 1.15 }}>{t.heading}</Heading>
        <p style={{ fontSize: compact ? 13 : 17, color: "var(--color-text-secondary)", marginTop: 12, lineHeight: 1.55, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>{TRIAL_LIMITS_SENTENCE_BY_LOCALE[locale]}</p>
      </div>

      {/* 3 tiers. At 1080px wide with a 260px minimum this resolved to 3
          columns, orphaning Free alone on a second row, left-aligned against a
          full-width row above — it read as a mistake. Widened the section and
          dropped the minimum so all sit on one row at desktop, and added
          justifyContent so any wrapped row centres instead of hanging left. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))",
        gap: s.gap, alignItems: "stretch", justifyContent: "center",
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
            borderRadius: 16, padding: s.cardPad,
          }}>
            <div style={{ fontSize: s.tierName, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.2px" }}>{tier.name}</div>
            <div style={{ fontSize: s.tagline, color: "var(--color-text-secondary)", marginTop: 6, minHeight: s.taglineMin, lineHeight: 1.45 }}>{tier.tagline}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: `${s.blockGap}px 0 4px` }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-1px" }}>
                {tier.free ? "€0" : `€${tier.price}`}
              </span>
              <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{tier.free ? t.forever : t.perMonth}</span>
            </div>
            {/* Per-day price. A monthly figure is compared against other
                subscriptions; a daily one is compared against a coffee, and
                against the margin on a single flip. Same number, honest framing. */}
            <div style={{ fontSize: s.perDay, color: "var(--color-text-muted)", marginBottom: 16, minHeight: 17 }}>
              {tier.free ? t.noCardRequired : t.perDay((tier.price / 30).toFixed(2))}
            </div>
            {/* ONE filled accent CTA per view. The other two are ghosts — a
                hairline and label on the card's own background, not a second
                and third filled rectangle. When every tier's button is filled,
                the eye has no primary to find and the recommendation the card
                layout is making stops being legible.
                44px minimum: this is the tap target on a phone. */}
            <button onClick={() => choose(tier.id, tier.priceId)} disabled={busy === tier.id} style={{
              width: "100%", minHeight: 44, padding: "12px 0", borderRadius: 12,
              fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              border: tier.highlight ? "none" : "1px solid var(--color-border-2)",
              background: tier.highlight ? "var(--color-buy)" : "transparent",
              color: tier.highlight ? "var(--color-on-buy)" : "var(--color-text-primary)",
              transition: "opacity .18s, border-color .18s",
            }}>{busy === tier.id ? "…" : tier.cta}</button>
            {/* stepUp / ceiling keep every word — only their boxes are gone.
                Both were tinted, bordered panels stacked inside an already
                bordered card; spacing and weight carry the same hierarchy
                without three nested rectangles. */}
            {tier.stepUp && (
              <div style={{ marginTop: s.blockGap }}>
                <div style={{ fontSize: s.body, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>{tier.stepUp}</div>
                {tier.stepUpWhy && (
                  <div style={{ fontSize: s.body, color: "var(--color-text-body)", lineHeight: 1.6 }}>{tier.stepUpWhy}</div>
                )}
              </div>
            )}
            {tier.ceiling && (
              <div style={{ marginTop: s.blockGap, fontSize: s.perDay, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                <span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>{t.whereItStops} </span>{tier.ceiling}
              </div>
            )}
            {/* A hairline, not a third nested box: it separates the argument
                for the tier from the list of what is in it without drawing
                another rectangle inside an already bordered card. */}
            <div style={{ marginTop: s.blockGap, paddingTop: s.blockGap, borderTop: "1px solid var(--color-border-ui)", display: "flex", flexDirection: "column", gap: s.featureGap }}>
              {tier.features.map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Check size={15} color="var(--color-text-muted)" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: s.body, color: "var(--color-text-body)", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-muted)", marginTop: 32, lineHeight: 1.6, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}>
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
