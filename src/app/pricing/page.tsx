import Link from "next/link"
import type { Metadata } from "next"
import { PricingSection } from "@/components/landing/pricing-section"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath, hreflangLanguages } from "@/lib/locale-routes"
import { OG_IMAGES } from "@/lib/og-image"
import { listingsTrackedLabel } from "@/lib/stats"

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
  const seedTracked = await listingsTrackedLabel()
  return (
    <div className="riq-public-page" style={{ background: "var(--color-bg)", color: "var(--color-text-body)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px 0" }}>
        {/* "Resale IQ" is the wordmark, not a translatable string — same call
            /methodology and /support already make on this link. */}
        <Link href={canonicalPath(locale)} style={{ color: "var(--color-text-secondary)", fontSize: 13, textDecoration: "none" }}>
          ← Resale IQ
        </Link>
      </div>
      <PricingSection locale={locale} headingLevel={1} seedTracked={seedTracked} />
    </div>
  )
}

export default PricingPage
