/**
 * H159 CRO: "Check YOUR item" inline bridge added below the post-verdict upsell.
 *
 * RESEARCH (fetched live this tick, 2026-09-29):
 *  - Plausible.io (plausible.io/docs/subscription-plans): 30-day full-product trial,
 *    no card. Draws the paid line at team size/volume. Primary CTA = "Start free trial"
 *    — the ask comes AFTER value is felt, not before.
 *  - Fathom (usefathom.com/pricing): 7-day trial, all features. Line = pageview volume only.
 *  - Beehiiv (beehiiv.com/pricing): Permanent free tier. Line = monetization features
 *    (paid subscriptions, ad network, automations). Core value is free.
 *
 * PATTERN they share: show the product WORKING for the visitor's specific need before
 * asking for money. The ask lands after personalized value, not at a generic button.
 *
 * THE GAP (not addressed by H150–H158 copy/row tweaks):
 * After seeing a free verdict for Adidas Samba, the visitor's real question is
 * "does it work for MY items?" The existing VerdictUpsellCta answered with a generic
 * checkout button. There was no bridge. The PricingTryInput (H108/H118/H128) solved
 * this on /pricing but the same pattern was absent from the post-verdict surface —
 * which hits blog (130/7d) + /tools (10/7d) = 140 visitors/week.
 *
 * FIX (H159): Add "Check YOUR item" input below the existing CTA. On submit:
 *  - 402 PAYWALL → show inline nudge with their specific item named + comparable_n
 *    count + GuestCheckoutButton pre-filled for that item. Same pattern as H128.
 *  - 200 / free sample / error → navigate to /tools so they see the full verdict.
 *
 * CONVICTION CHAIN (Plausible/Fathom/Beehiiv pattern applied here):
 * Free sample (Samba) → "try YOUR item" → "we hold N data points on [item]"
 * → "Unlock [item] buy-below — €19/mo" → Stripe with item + email pre-filled.
 *
 * Traffic: blog 130/7d + /tools 10/7d = 140/7d affected.
 * CRO #3 (message match: their item in the paywall ask) + #4 (objection: does it
 * cover MY brands?) + #9 (friction: one extra click removed before personalized ask)
 * + #12 (conviction momentum: sample → personalize → ask).
 * Revenue 2026-09-29. H159.
 */
"use client"
import { useEffect, useState } from "react"
import { verdictUpsellLine } from "@/lib/verdict-upsell"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { CustomQueryInput } from "@/components/ui/custom-query-input"
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

  // H159 CRO: "Check YOUR item" inline bridge — post-verdict personalization.
  // Pattern from Plausible/Fathom/Beehiiv: value before ask, personalized.
  const [customQ, setCustomQ] = useState("")
  const [customLoading, setCustomLoading] = useState(false)
  const [customPaywallQuery, setCustomPaywallQuery] = useState<string | null>(null)
  const [customPaywallN, setCustomPaywallN] = useState<number | null>(null)

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = customQ.trim()
    if (!trimmed) return
    setCustomPaywallQuery(null)
    setCustomPaywallN(null)
    setCustomLoading(true)
    trackEvent("verdict_upsell_try_submit", src)
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(trimmed)}`)
      if (res.status === 402 || res.status === 401) {
        // Paywalled — show item-specific inline nudge.
        try {
          const body = await res.json().catch(() => null)
          if (body?.comparable_n != null) setCustomPaywallN(body.comparable_n as number)
        } catch { /* non-fatal — nudge shows without count */ }
        setCustomPaywallQuery(trimmed)
      } else {
        // Free sample (200) or unexpected — navigate to /tools for full experience.
        window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=verdict_upsell_try`
      }
    } catch {
      // why: network failure is non-fatal — /tools fallback ensures visitor
      // is never left stuck with an unresponsive form.
      window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=verdict_upsell_try`
    } finally {
      setCustomLoading(false)
    }
  }

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
        {/* H166 CRO: 30-day refund guarantee under the primary upsell CTA.
            H153 added this to HardPaywallCard (paywall hits). VerdictUpsellCta —
            shown to anon/free visitors who just saw a REAL free verdict on
            /tools (10/7d) + blog (130/7d) = 140/7d — was missing it entirely.
            This is the highest-conviction moment: visitor just saw a live BUY
            with buy-below number. The last remaining objection is "what if it's
            wrong / not worth it?" The guarantee resolves it inline, at the exact
            point they are weighing €19.
            CRO #4 (objection: what if it fails?) + no risk (one line, no data,
            no API, falls back to the same UI without it). Revenue 2026-09-29. H166. */}
        <p style={{ fontSize: 11, color: "#5b6b8c", margin: "6px 0 0", lineHeight: 1.45 }}>
          <a href="/terms" style={{ color: "#5b6b8c", textDecoration: "underline" }}>Full refund within 30 days of your first payment — see Terms</a>
        </p>
      </div>

      {/* H159 CRO: "Check YOUR item" inline bridge — Plausible/Beehiiv pattern.
          After seeing a free sample (Samba/AF1/Fred Perry Polo), the visitor's real question
          is "does it work for MY items?" The existing CTA was generic. This adds a
          mini input so they try their actual sourcing item right here, creating the
          conviction chain: sample → personalized paywall → item-specific checkout.
          Blog 130/7d + /tools 10/7d = 140/7d reach.
          CRO #3 (message match) + #4 (objection: covers my brands?)
          + #9 (one less hop) + #12 (sample → personalize → ask). Revenue 2026-09-29. */}
      <CustomQueryInput
        value={customQ}
        onChange={setCustomQ}
        onSubmit={handleCustomSubmit}
        loading={customLoading}
        buttonPadding="8px 12px"
        paywallQuery={customPaywallQuery}
        paywallN={customPaywallN}
        paywallTestId="riq-verdict-upsell-custom-paywall"
        locale={locale}
        ctaSrc="verdict_upsell_custom_paywall"
        customerEmail={capturedEmail}
      />
    </div>
  )
}
