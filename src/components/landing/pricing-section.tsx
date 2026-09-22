"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { TIERS, resolvePriceId } from "@/lib/pricing"
import { PaybackCalculator } from "./payback-calculator"
import { getPlans, createCheckout } from "@/lib/api"
import { getToken } from "@/lib/utils"
import {
  CHECKOUT_COUNTRIES,
  countryFromLocale,
  readStoredCountry,
  storeCountry,
  type CheckoutCountry,
  type CheckoutPlan,
} from "@/lib/checkout"
import { trackEvent } from "@/lib/analytics"
import { copy, type Locale, type FaqItem } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { LlmEyebrow } from "./llm-eyebrow"
import { useTrackedLabel } from "@/lib/use-tracked-label"
import { useSellThroughLabel } from "@/lib/use-sell-through-label"
import { useAuthStore } from "@/lib/auth-store"
import { pricingCtaKind } from "@/lib/pricing-cta-state"
import { isPaidPlan } from "@/lib/entitlement"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { AW26_REPORT_URL } from "@/lib/hard-paywall"

// TIERS (lib/pricing.ts) stays the structural + English source of truth —
// paywall.tsx (the authenticated, post-quota-depletion upsell) still reads
// it directly and is out of scope for this pass. Here, on the marketing
// homepage, each tier's display text is overridden per locale from
// copy[locale].tiers, keyed by Tier.id. Falls back to the English TIERS
// text for any locale/id the dictionary does not cover, so a partial
// dictionary degrades to English rather than to `undefined`.
// EX-PRICING-OFFER: Starter (€19) leads as the paid outcome. Free forever
// must not lead. TIERS itself stays high→low because paywall.tsx (the authed
// upsell) reads that array directly and wants Pro first; only this marketing
// surface reorders, and only for display.
const DISPLAY_ORDER: Record<string, number> = { operator: 0, power: 1, free: 2 }

function localizedTiers(locale: Locale) {
  const dict = copy[locale].tiers as Record<string, {
    tagline: string; cta: string; stepUp?: string; stepUpWhy?: string; ceiling?: string; features: readonly string[]
  }>
  return TIERS
    .map((tier) => {
      const l = dict[tier.id]
      const mapped = l ? { ...tier, ...l } : { ...tier }
      // Filled CTA is Starter (€19), not Pro. Checkout ids are unchanged.
      return { ...mapped, highlight: mapped.id === "operator" }
    })
    .sort((a, b) => (DISPLAY_ORDER[a.id] ?? 99) - (DISPLAY_ORDER[b.id] ?? 99))
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
  seedTracked,
  seedSellThrough,
}: {
  locale?: Locale
  compact?: boolean
  /** h1 on the standalone /pricing route, h2 when embedded under the landing
   *  page's own h1. One h1 per document; the copy is identical either way. */
  headingLevel?: 1 | 2
  /**
   * H53 CRO: SSR-resolved tracked-listings count (e.g. "5,830,000+").
   * When provided, useTrackedLabel initialises with this value so the trust
   * signal below the Starter CTA is visible on first paint without waiting
   * for the client-side fetch. CRO Principle #7 (trust before CTA).
   * Revenue 2026-09-16.
   */
  seedTracked?: string
  /** SSR-resolved weekly watched-departures label (e.g. "65/wk").
   *  Fixes the em-dash rendered on /pricing first paint. Revenue 2026-09-21. */
  seedSellThrough?: string
}) {
  const router = useRouter()
  const t = copy[locale].pricingSection
  const { user, checkAuth } = useAuthStore()
  const tiers = localizedTiers(locale)
  const paidTiers = tiers.filter((tier) => !tier.free)
  const s = compact ? COMPACT : ROOMY
  const Heading = (headingLevel === 1 ? "h1" : "h2") as "h1" | "h2"
  const [plans, setPlans] = useState<{ id: string; price_id?: string }[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  // H13 CRO: message-match eyebrow on standalone /pricing — Revenue 2026-09-15.
  // Only shown when !compact (the standalone /pricing route) and ?src= is llm/perplexity/chatgpt.
  // Mirrors the mechanism already live on landing-content.tsx (H2) — CRO principle #3.
  const searchParams = useSearchParams()
  const srcParam = searchParams?.get("src") ?? null
  const llmSrc = (!compact && (srcParam === "perplexity" || srcParam === "chatgpt" || srcParam === "llm")) ? srcParam : null
  // H20 CRO: message-match for ?src=data visitors (arrived from /data public brand page).
  // They've already seen departure counts and averages — bridge directly to item-level verdicts.
  // CRO Principle #3 (message match). Revenue 2026-09-15.
  const dataSrc = (!compact && srcParam === "data")
  // plansReady settled true when the plans fetch resolved OR failed. It was
  // used to gate paid CTA enablement while Stripe price_ids were loading. That
  // gate caused the "click but no convert" funnel leak (CRO #10): buttons
  // appeared disabled (cursor:wait, opacity:0.6) even after plans loaded, and
  // the gate itself added no safety — choose() already guards the no-price-id
  // case by routing to /register. Removed; paid CTAs are always clickable now.
  // H26 CRO: live tracked count for starterTrust — CRO #7/#8. Revenue 2026-09-15.
  // H53 CRO: seed from SSR so first paint shows the real number, never "…".
  //          When seedTracked is passed from the server component, useTrackedLabel
  //          initialises with it; client-side fetch still runs to stay fresh.
  const tracked = useTrackedLabel(seedTracked)
  const sellThrough = useSellThroughLabel(seedSellThrough)
  const checkoutCancelled = searchParams?.get("checkout") === "cancelled"
  const [country, setCountry] = useState<CheckoutCountry | "">(() =>
    readStoredCountry() ?? countryFromLocale(locale) ?? "")

  useEffect(() => {
    getPlans()
      .then(d => setPlans(d.plans))
      .catch(() => {})
  }, [])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  const choose = async (tierId: string, placeholder?: string) => {
    // Paying customers already have a Stripe customer — send them to /account
    // (portal), never through Checkout again (founder, 2026-09-21).
    if (isPaidPlan(user)) {
      router.push(canonicalPath(locale, "/account"))
      return
    }
    // HARD_PAYWALL: the Free card is public /data, not a free item-check plan.
    if (tierId === "free") { router.push("/data"); return }
    if (!placeholder) return
    if (!getToken()) {
      const plan = tierId === "power" ? "power" : "operator"
      // GUEST CHECKOUT (2026-09-09): a logged-out visitor who clicks a paid
      // plan now goes STRAIGHT TO STRIPE, no /register wall first. That wall
      // was the single biggest measured drop — 81% abandoned /register, 0
      // logged-out visitors ever reached checkout_started. The backend accepts
      // an unauthenticated /stripe/checkout and provisions the account from the
      // Stripe-verified payer email at /billing/success (verify-session). We
      // keep the checkout_intent_guest signal, and now checkout_started is
      // finally reachable for strangers.
      const here = typeof window !== "undefined" ? window.location.pathname : "/pricing"
      trackEvent("checkout_intent_guest", `${here}?plan=${plan}`)
      setBusy(tierId)
      try {
        const priceId = resolvePriceId(placeholder, plans)
        if (!priceId) { router.push(`/register?plan=${plan}`); return }
        const { checkout_url } = await createCheckout(priceId, {
          plan: plan as CheckoutPlan,
          country: country || undefined,
        })
        trackEvent("checkout_started")
        window.location.href = checkout_url
      } catch (e) {
        // why: guest checkout can fail for benign, non-actionable reasons
        // (Stripe hiccup, plans not yet loaded). Rather than leave a stranger
        // on a dead button, fall back to the register path — which still
        // reaches Stripe via the authed flow. Logged so the fallback is not
        // invisible if it starts happening often.
        console.warn("[pricing] guest checkout failed, falling back to /register:", e)
        router.push(`/register?plan=${plan}`)
      } finally {
        setBusy(null)
      }
      return
    }
    setBusy(tierId)
    try {
      const priceId = resolvePriceId(placeholder, plans)
      if (!priceId) { router.push("/register"); return }
      const { checkout_url } = await createCheckout(priceId, {
        plan: (tierId === "power" ? "power" : "operator") as CheckoutPlan,
        country: country || undefined,
      })
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
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.4px", color: "var(--color-text-muted)" }}>{copy[locale].pricing}</div>
        {/* H13 CRO: LLM-referral message-match eyebrow. Revenue 2026-09-15.
            Only rendered on standalone /pricing (!compact) when ?src=perplexity|chatgpt|llm.
            Mirrors H2 on landing-content.tsx — CRO principle #3 (message match). */}
        {llmSrc && <LlmEyebrow src={llmSrc} margin="10px 0 0" />}
        {/* H20 CRO: /data → /pricing message-match eyebrow. Revenue 2026-09-15.
            Visitor just saw public brand departure averages — acknowledge that and bridge
            to what the paid tier adds (item-level BUY/WATCH/SKIP). CRO Principle #3. */}
        {dataSrc && (
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.6px", color: "var(--color-text-muted)", margin: "10px 0 0", lineHeight: 1.4, textTransform: "uppercase" }}>
            📊 You've seen the brand averages — this is the item-level verdict
          </p>
        )}
        <Heading style={{ fontSize: s.headSize, fontWeight: 700, color: "var(--color-text-primary)", marginTop: 12, letterSpacing: "-0.6px", lineHeight: 1.15 }}>{t.heading}</Heading>
        <p style={{ fontSize: compact ? 13 : 17, color: "var(--color-text-secondary)", marginTop: 12, lineHeight: 1.55, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>{t.subhead}</p>
      </div>

      {checkoutCancelled && (
        <p
          data-testid="riq-checkout-cancelled"
          role="status"
          style={{
            textAlign: "center",
            fontSize: 13.5,
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
            maxWidth: 640,
            margin: "0 auto 24px",
            padding: "12px 16px",
            border: "1px solid var(--color-border-ui)",
            borderRadius: 12,
            background: "var(--color-surface)",
          }}
        >
          {t.checkoutCancelled}
        </p>
      )}

      {/* H19 CRO: Objection #1 ("works for me?") — scope/coverage note above plan cards.
          Shown ONLY on standalone /pricing (!compact). Answers before price is seen.
          CRO Principle #4 (proof next to objection) + #7 (trust before CTA). Revenue 2026-09-15. */}
      {!compact && (
        <p
          data-testid="riq-scope-note"
          style={{
            textAlign: "center",
            fontSize: 13.5,
            color: "var(--color-text-muted)",
            lineHeight: 1.55,
            maxWidth: 640,
            margin: "-16px auto 32px",
          }}
        >
          {t.scopeNote}
        </p>
      )}

      {!compact && (
        <div
          data-testid="riq-billing-country"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            margin: "-8px auto 28px",
            maxWidth: 360,
          }}
        >
          <label htmlFor="riq-vat-country" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
            {t.countryLabel}
          </label>
          <select
            id="riq-vat-country"
            value={country}
            onChange={(e) => {
              const next = e.target.value
              if (next === "") { setCountry(""); return }
              setCountry(next as CheckoutCountry)
              storeCountry(next as CheckoutCountry)
            }}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 12,
              border: "1px solid var(--color-border-2)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              fontSize: 14,
              padding: "10px 12px",
            }}
          >
            <option value="">—</option>
            {CHECKOUT_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.native}</option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.45, textAlign: "center", margin: 0 }}>
            {t.countryHint}
          </p>
        </div>
      )}

      {/* H55 CRO: PROOF BEFORE PRICE — static "try it free" banner above cards.
          Guaranteed visible on every /pricing load regardless of buy-list API.
          3 pre-filled brand queries → /tools so the visitor experiences a real
          verdict before the payment ask. Static copy = zero API dependency.
          CRO #3 (message match) + #7 (trust before CTA). Revenue 2026-09-22. */}
      {!compact && (
        <div
          data-testid="riq-try-free-banner"
          style={{
            maxWidth: 640,
            margin: "0 auto 36px",
            background: "var(--color-surface)",
            border: "1px solid rgba(48,209,88,.25)",
            borderRadius: 14,
            padding: "18px 20px",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: "#30D158", margin: "0 0 4px", letterSpacing: "0.02em" }}>
            Try a live verdict before you buy — no account needed
          </p>
          <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>
            These run against real data right now. See the BUY / WATCH / SKIP and the buy-below price for free.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Nike Air Force 1", q: "Nike+Air+Force+1" },
              { label: "Adidas Samba", q: "Adidas+Samba" },
              { label: "New Balance 530", q: "New+Balance+530" },
            ].map(({ label, q }) => (
              <Link
                key={q}
                href={`/tools?q=${q}&src=pricing-try-free`}
                data-testid="riq-try-free-query"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#EEF1F7",
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border-2)",
                  borderRadius: 8,
                  padding: "8px 14px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Conversion lock: Starter + Pro only in the card row. Free is a
          one-line public-data link below so it cannot compete with Starter €19. */}
      <div className="riq-pricing-grid" style={{ gap: s.gap }}>
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
        {paidTiers.map(tier => (
          <div key={tier.id} style={{
            position: "relative",
            background: tier.highlight ? "var(--color-surface-elevated)" : "var(--color-surface)",
            border: tier.highlight ? "1px solid var(--color-border-2)" : "1px solid var(--color-border-ui)",
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
            <button
              onClick={() => choose(tier.id, tier.priceId)}
              disabled={busy === tier.id}
              data-testid={`riq-pricing-cta-${tier.id}`}
              data-cta-kind={pricingCtaKind(user, tier.id)}
              style={{
              width: "100%", minHeight: 44, padding: "12px 0", borderRadius: 12,
              fontSize: 13.5, fontWeight: 700, cursor: (busy === tier.id) ? "wait" : "pointer",
              border: tier.highlight ? "none" : "1px solid var(--color-border-2)",
              background: tier.highlight ? "var(--color-buy)" : "transparent",
              color: tier.highlight ? "var(--color-on-buy)" : "var(--color-text-primary)",
              opacity: 1,
              transition: "opacity .18s, border-color .18s",
            }}>{busy === tier.id ? "…" : (
              pricingCtaKind(user, tier.id) === "current" ? t.currentPlanCta
              : pricingCtaKind(user, tier.id) === "manage" ? t.manageSubscriptionCta
              : tier.cta
            )}</button>
            {/* H-CRO-UNDER-CTA: "instant access · cancel anytime" at decision moment.
                CRO #4 (objection #4: what if it fails) + #7 (trust before CTA).
                Answers the Stripe-page abandonment fear: lock-in + delayed access.
                Revenue 2026-09-21. */}
            {tier.highlight && (
              <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--color-text-muted)", margin: "8px 0 0", lineHeight: 1.4 }}>
                Instant access · cancel anytime
              </p>
            )}
            {tier.id === "operator" && (
              <>
                {/* H-SOCIAL-BF-PROOF: live tracked count as primary trust signal.
                    Revenue 2026-09-19. */}
                <p
                  data-testid="riq-listings-tracked"
                  style={{
                    margin: "16px 0 4px",
                    fontSize: compact ? 11 : 12,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    textAlign: "center",
                    letterSpacing: "0.3px",
                  }}
                >
                  {tracked} live listings watched
                </p>
                {/* Watched departures / week — seeded SSR so first paint never shows em-dash.
                    Only shown when sellThrough resolved to a real number ("65/wk").
                    Revenue 2026-09-21 (em-dash fix). */}
                {sellThrough && sellThrough !== "—" && (
                  <p
                    data-testid="riq-sell-through"
                    style={{
                      margin: "0 0 4px",
                      fontSize: compact ? 11 : 12,
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    {sellThrough} watched departures / week
                  </p>
                )}
                <p
                  data-testid="riq-starter-trust"
                  style={{
                    margin: "0 0 8px",
                    fontSize: compact ? 11 : 12,
                    lineHeight: 1.45,
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                  }}
                >
                  {t.starterTrust.replace("{{TRACKED}}", tracked)}
                </p>
              </>
            )}
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
      {/* Cold-traffic CTA under the cards: guest Stripe, not /register.
          CRO #10: product-aware → starts payment immediately.
          Rendered as a text link (no background) so it does NOT add a second
          filled accent to the section — smoke.spec.ts asserts exactly one. */}
      {!compact && !isPaidPlan(user) && (
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, lineHeight: 1.5 }}>
          <GuestCheckoutButton locale={locale} label={t.coldCtaLadder} src="pricing-cold-cta" asLink />
        </p>
      )}
      {/* AW26 one-off report secondary CTA — EUR49, no account, no subscription.
          Not ready to commit monthly? One purchase, full picture.
          Revenue 2026-09-21. */}
      {!compact && !isPaidPlan(user) && (
        <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
          <span style={{ color: "var(--color-text-muted)" }}>Not ready to subscribe? </span>
          <a
            href={AW26_REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="riq-aw26-pricing-cta"
            style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}
          >
            Get the AW26 Vinted Demand Report — €49 one-off →
          </a>
        </p>
      )}
      <p style={{ textAlign: "center", marginTop: compact ? 20 : 8, fontSize: compact ? 13 : 14, lineHeight: 1.5 }}>
        <Link
          href={canonicalPath(locale, "/data")}
          data-testid="riq-public-data-line"
          style={{ color: "var(--color-text-muted)", fontWeight: 500, textDecoration: "none" }}
        >
          {t.publicDataLine}
        </Link>
      </p>
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

      {/* Objection-handling row (CRO #4). Standalone /pricing only — the compact
          strip on the homepage already sits under a full page of proof, so the
          same six questions there would be noise. Native <details> is the whole
          accordion: keyboard-operable and open-by-search with no JS to ship, and
          the answers are honest-data proof (aggregates, watched departures,
          UNKNOWN) placed next to the doubt they resolve, never a testimonial we
          cannot back with 0 customers. Also emitted as FAQPage JSON-LD, which is
          the schema AI answer engines cite — the one channel that has produced a
          signup. */}
      {!compact && (
        <div style={{ maxWidth: 760, margin: "56px auto 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.4px", textAlign: "center", marginBottom: 24 }}>{t.faqHeading}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(t.faq as unknown as FaqItem[]).map((item) => (
              <details key={item.q} style={{ border: "1px solid var(--color-border-ui)", borderRadius: 12, background: "var(--color-surface)", padding: "0 16px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", padding: "14px 0", fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  {item.q}
                  <span aria-hidden style={{ color: "var(--color-text-muted)", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ fontSize: 14.5, color: "var(--color-text-body)", lineHeight: 1.6, margin: "0 0 10px", paddingRight: 28 }}>{item.a}</p>
                {/* H48 CRO: FAQ live-demo CTA — "works for me?" answer drops visitor into /tools.
                    Only the first FAQ item carries this link. LLM-cited FAQ can now route
                    directly to a live product moment. CRO #10 (CTA commitment ladder) + #3
                    (message match: LLM cites FAQ → user lands in the product). Revenue 2026-09-15. */}
                {item.cta && (
                  <p style={{ margin: "0 0 16px", paddingRight: 28 }}>
                    <a
                      href={item.cta.href}
                      data-testid="riq-faq-live-cta"
                      style={{ fontSize: 14, fontWeight: 600, color: "var(--color-buy)", textDecoration: "none" }}
                    >{item.cta.text}</a>
                  </p>
                )}
              </details>
            ))}
          </div>
          {/* H49 CRO: acceptedAnswer url — AI answer engines that follow FAQPage schema can
              surface the direct link in citations without requiring the user to open the page.
              url is a valid schema.org/Thing property inherited by Answer. Only emitted when
              the item carries a cta.href (currently the works-for-me entry). Absolute URL.
              faq-schema.ts rule: absolute resaleiq.dev URLs are fine; UTM tags are not.
              src=faq-works is not a UTM tag. Zero visible UI change. Revenue 2026-09-15. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: (t.faq as unknown as FaqItem[]).map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: item.a,
                    ...(item.cta ? { url: `https://resaleiq.dev${item.cta.href}` } : {}),
                  },
                })),
              }),
            }}
          />
        </div>
      )}
    </section>
  )
}
