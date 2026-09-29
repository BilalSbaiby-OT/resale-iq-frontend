import Link from "next/link"
import type { Metadata } from "next"
import { PricingSection } from "@/components/landing/pricing-section"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"
import { OG_IMAGES } from "@/lib/og-image"
import { listingsTrackedLabel, sellThroughWeeklyLabel } from "@/lib/stats"
import { getPublicBuyList } from "@/lib/ssr-buy-list"
import { SsrBuyListTeaser } from "@/components/landing/ssr-buy-list-teaser"
import { LiveMarketPulse } from "@/components/landing/live-market-pulse"
import { BrandStrip } from "@/components/landing/brand-strip"
import { getMarketNumbers } from "@/lib/market-numbers"
import { PricingVerdictDemo } from "@/components/landing/pricing-verdict-demo"
import { PricingTryInput } from "@/components/landing/pricing-try-input"
import { RoiExampleCard } from "@/components/landing/roi-example-card"
import { PricingStickyCta } from "@/components/landing/pricing-sticky-cta"
import { TrustBlock } from "@/components/landing/trust-block"

/**
 * /pricing is a REAL page, not the "/#pricing" anchor it used to 307 to.
 *
 * Three reasons the anchor could not stay, in the order they cost us money:
 *
 * 1. MEASURABLE. `pricing_view` is a funnel step between landing_view and
 *    checkout_started (src/lib/analytics.ts). On an anchor it fired only when
 *    the browser happened to arrive with the fragment intact, and it shared a
 *    pageview with landing_view — so "how many people looked at the price"
 *    was never a number we could actually read. A path is one row per visit.
 * 2. LANDABLE. An ad or a bio link points somewhere; "/#pricing" drops a
 *    visitor at the top of a full marketing page and asks them to find the
 *    prices, which is a scroll they did not agree to.
 * 3. SHAREABLE. A URL someone pastes into a forum should open the thing they
 *    are talking about. "resaleiq.dev/pricing" now does.
 *
 * The section itself is IMPORTED, not copied — PricingSection is the single
 * source of tier content, live Stripe price ids and the checkout branch. The
 * only difference here is density: `compact` is off, so it gets the roomy
 * scale, and the section heading is the document's h1.
 */
// Same string for <title>, og:title and twitter:title. Root layout pins
// homepage social tags; a child that sets only `title` (or a shorter
// openGraph title) still shares as the generic homepage on X/Slack.
const TITLE = `${copy.en.pricingSection.metaTitle} — Resale IQ`
const DESCRIPTION = copy.en.pricingSection.metaDescription

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing", languages: hreflangLanguages("/pricing") },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/pricing", images: OG_IMAGES },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: OG_IMAGES },
}

// `locale` defaults to "en" so this un-prefixed route is the English page;
// src/app/[locale]/pricing/page.tsx imports this same function and passes the
// path locale — the same split MethodologyPage and SupportPage already use.
export async function PricingPage({ locale = "en" }: { locale?: Locale } = {}) {
  // H53 CRO: resolve the tracked count server-side so first paint shows a real
  // number under the Starter CTA instead of "…". Same revalidation window as the
  // homepage (15-minute market-numbers cache), so the figure is never stale by
  // more than one render cycle. CRO Principle #7 (trust before CTA).
  // Revenue 2026-09-16.
  //
  // 2026-09-22 — PROOF BEFORE PRICE. Measured over 14d (browser-confirmed,
  // non-bot): 44 of 50 humans who viewed pricing had NEVER seen a verdict, and
  // 5 of 7 who started checkout hadn't either. Stripe agrees — 23 of 25
  // sessions had no email typed. People were being asked to pay before they
  // had experienced the product once. 8 of those 44 LANDED here first, so the
  // homepage buy list never had a chance to do its job.
  // The buy list is fetched server-side and rendered ABOVE the price cards so
  // the answer arrives before the ask. Free/unlocked rows only — the teaser's
  // job is to prove value, not to sell twice on the same screen.
  const [seedTracked, seedSellThrough, buyList, market] = await Promise.all([
    listingsTrackedLabel(),
    sellThroughWeeklyLabel(),
    getPublicBuyList(8).catch((err) => {
      // Never let a buy-list outage break the page people pay on.
      console.error("[pricing] buy-list fetch failed:", err)
      return null
    }),
    getMarketNumbers().catch(() => null),
  ])
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px 0" }}>
        {/* H134 CRO: nav row with "skip to plans" anchor for product-aware visitors.
            /pricing has 5+ screens of proof before the plan cards. A visitor who is
            already convinced — they clicked /pricing from the nav, they know what the
            product is — must scroll the full page to reach the checkout button. This
            is CRO #12 (conversion momentum) + #9 (friction: convinced visitors blocked
            by proof they don't need). The anchor link names the price so the commitment
            is set before clicking — CRO #10 (CTA discipline: solution-aware visitor).
            Placed in the existing top nav row beside the back link; zero extra layout.
            Revenue 2026-09-28. H134. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {/* "Resale IQ" is the wordmark, not a translatable string — same call
              /methodology and /support already make on this link. */}
          <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", minHeight: 44 }}>
            ← Resale IQ
          </Link>
          <a
            href="#pricing-plans"
            data-testid="riq-pricing-skip-to-plans"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#34C759",
              textDecoration: "none",
              border: "1px solid rgba(52,199,89,.3)",
              borderRadius: 7,
              padding: "5px 12px",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              minHeight: 32,
            }}
          >
            Plans from €19/mo ↓
          </a>
        </div>
      </div>
      {/* H157 CRO: above-fold orienting headline on /pricing — CRO #1 (clarity < 5s).
          8 of 44 /pricing visitors arrived here FIRST — never saw the homepage,
          never read a blog post, never saw the buy list on landing. Those visitors
          landed on proof-before-context: a locked buy list with no headline explaining
          why any of it matters. The first screen must answer "what is this / who for /
          why care" before proof lands. The headline is the frame the proof sits in.
          Tight, outcome-first: 1 line + 1 subhead. No bloat, no feature dump.
          Revenue 2026-09-29. H157. */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 24px 0" }}>
        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
          }}
        >
          Know exactly what to buy for resale — and what to pay.
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--color-text-secondary)",
            margin: 0,
            lineHeight: 1.55,
            maxWidth: 560,
          }}
        >
          Resale IQ tracks demand, sell-through rates, and buy-below prices across secondhand markets — so every buying decision is backed by data.
        </p>
      </div>

      {buyList && buyList.length > 0 && (
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 24px 0" }}>
          {/* H66 CRO: rowSrc makes each buy-list row a link to /tools with the
              item pre-filled. Visitor clicks "Stone Island Hoodies BUY ↓€70" →
              /tools auto-runs their query → paywall fires → PricingEyebrow
              shows "this is real, unlock it for €19". CRO #4 (do they have my
              item?) + #8 (specificity). Revenue 2026-09-23. */}
          <SsrBuyListTeaser items={buyList} locale={locale} rowSrc="pricing-row" showLockedFomo showPrice ctaScrollTo="pricing-plans" />
        </div>
      )}
      {/* H85 CRO: live market pulse on /pricing — objection-killing proof at the
          moment of purchase decision. Homepage visitors already see the pulse and
          trust the data; pricing visitors had NO equivalent credibility signal.
          52 people hit Stripe, 0 paid — the gap is conviction, not price.
          Showing real brand velocity + avg prices resolves "is this real data?"
          before the plan cards, so the ask lands on an already-convinced visitor.
          CRO #7 (trust before CTA) + #8 (specificity: exact sold counts, not a
          vague "thousands of brands" claim). Revenue 2026-09-23. */}
      {market && (
        <LiveMarketPulse locale={locale} market={market} />
      )}
      {/* H91 CRO: brand strip on /pricing — visual proof of coverage scope.
          Objection "will it work for what I sell?" (CRO #4) fires at the moment
          of purchase decision. Homepage already shows logos and converts at a
          higher rate than pricing. Pricing visitors had zero visual proof the
          catalog matched their brands — they saw a pulse table and immediately
          hit plan cards. Brand logos answer the coverage question silently,
          in <1 second of scan time, before they have to ask.
          market already fetched above (H85); zero extra requests.
          CRO #4 (objection: does it cover my items?) + #7 (trust before CTA).
          Revenue 2026-09-23. */}
      {market && (
        <BrandStrip
          names={market.brandNames}
          total={market.brandsTracked ?? market.brandCount}
          locale={locale}
        />
      )}
      {/* H105 CRO: inline sample verdict between proof and price cards.
          44/50 pricing visitors had NEVER seen a verdict (measured 2026-09-22).
          The ask lands before the value. This fetches the Nike AF1 free-sample
          verdict SSR and renders it inline — exactly what a subscriber sees —
          so the visitor understands the product before the price cards appear.
          Plausible.io pattern: show your own real data BEFORE asking for money.
          locked_fields (sell_through, top_sizes etc.) shown as blurred chips
          — proves depth without leaking paid data (H82 FOMO pattern).
          CRO #2 (demonstrate the one outcome) + #4 (objection: worth it?)
          + #7 (trust: real numbers) + #8 (specificity: €31 not "know what to pay")
          + #12 (demonstration → conviction → ask).
          Revenue 2026-09-23. */}
      <PricingVerdictDemo locale={locale} />
      {/* H108 CRO: "Try your own item" input below the static verdict demo.
          The demo (H105) shows AF1 data — proves the format but not coverage.
          Visitor sourcing Stone Island or Carhartt thinks "does it cover mine?"
          and the page had no answer. This input routes to /tools?q=X&src=pricing_try;
          /tools auto-runs the query and fires the paywall with the item named.
          44/50 /pricing visitors never saw a verdict — this lets them check their
          own item without leaving into an unknown page, maintaining momentum.
          CRO #3 (message match: their item) + #4 (objection: works for mine?)
          + #12 (demo→personalized→paywall→checkout). Revenue 2026-09-23. */}
      <PricingTryInput locale={locale} buyListPreview={buyList} />
      {/* H136 CRO: ROI worked example on /pricing — conviction before ask.
          44/50 /pricing visitors never saw a verdict. The Starter ask lands cold.
          This card shows "Buy X at €Y, sell at €Z, margin ~€W — one flip covers €19/mo"
          from a real live buy-list row (honest, sourced from SSR buyList already fetched).
          Objection: "is it worth it?" answered with a specific real example, not a claim.
          RoiExampleCard renders nothing when no suitable row is available, so this is
          zero-risk; buyList already fetched above (re-used, no extra request).
          CRO #4 (objection: worth it?) + #8 (specificity: real numbers, not "save money")
          + #12 (demonstration → conviction → ask). Revenue 2026-09-29. H136. */}
      {buyList && buyList.length > 0 && (
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <RoiExampleCard items={buyList} />
        </div>
      )}
      {/* H163 CRO: TrustBlock directly above the plan cards on /pricing — objection
          handling at the exact purchase decision moment.
          Homepage has this block and converts better. Pricing visitors — already at
          the highest-intent point in the funnel — had zero trust signals before the
          plan cards: no "Cancel anytime", no "Stripe secure checkout", no "5 EU markets",
          no data freshness label. Those objections ("can I trust this?", "what if it
          doesn't work for me?") fire hardest right before payment.
          market already fetched (H85 above); zero extra requests.
          CRO #4 (objection: worth it? works for me?) + #7 (trust before CTA)
          + #12 (conviction → earned ask, not cold ask).
          Revenue 2026-09-29. H163. */}
      {market && <TrustBlock market={market} />}
      <div id="pricing-plans">
        <PricingSection locale={locale} headingLevel={1} seedTracked={seedTracked} seedSellThrough={seedSellThrough} />
      </div>
      {/* H152 CRO: sticky bottom CTA on /pricing — appears during proof scroll,
          disappears when #pricing-plans is visible. A visitor convinced at
          PricingVerdictDemo or PricingTryInput had no persistent CTA — they had to
          scroll all the way down or back up to reach the plan cards. This bar
          surfaces a one-tap scroll anchor throughout the proof section.
          CRO #9 (friction: convinced visitor can act without scroll gymnastics)
          + #10 (solution-aware → anchor to plans, not cold Stripe)
          + #12 (momentum: proof → earned CTA, no interrupt).
          Revenue 2026-09-29. H152. */}
      <PricingStickyCta locale={locale} />
    </div>
  )
}

export default PricingPage
