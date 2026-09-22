import Link from "next/link"
import type { Metadata } from "next"
import { PricingSection } from "@/components/landing/pricing-section"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"
import { OG_IMAGES } from "@/lib/og-image"
import { listingsTrackedLabel, sellThroughWeeklyLabel } from "@/lib/stats"
import { getPublicBuyList } from "@/lib/ssr-buy-list"
import { SsrBuyListTeaser } from "@/components/landing/ssr-buy-list-teaser"

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
  const [seedTracked, seedSellThrough, buyList] = await Promise.all([
    listingsTrackedLabel(),
    sellThroughWeeklyLabel(),
    getPublicBuyList(5).catch((err) => {
      // Never let a buy-list outage break the page people pay on.
      console.error("[pricing] buy-list fetch failed:", err)
      return null
    }),
  ])
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px 0" }}>
        {/* "Resale IQ" is the wordmark, not a translatable string — same call
            /methodology and /support already make on this link. */}
        <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none" }}>
          ← Resale IQ
        </Link>
      </div>
      {buyList && buyList.length > 0 && (
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "20px 24px 0" }}>
          <SsrBuyListTeaser items={buyList} locale={locale} />
        </div>
      )}
      <PricingSection locale={locale} headingLevel={1} seedTracked={seedTracked} seedSellThrough={seedSellThrough} />
    </div>
  )
}

export default PricingPage
