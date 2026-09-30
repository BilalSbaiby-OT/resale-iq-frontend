"use client"
/**
 * BlogFooterCta — end-of-article checkout CTA with email prefill.
 *
 * WHY: The blog footer is the max-conviction moment (visitor scrolled 11+ min,
 * read the article, ran a verdict above-fold). The footer GuestCheckoutButton
 * was previously in a Server Component (page.tsx) so it could not read
 * riq_capture_email from localStorage. Visitors who captured their email via
 * H140 (above-fold blog CTA) had to re-type it at Stripe — identical friction
 * to what H142 already solved for the sticky bar.
 *
 * This extracts the footer CTA into a Client Component using the same pattern
 * as BlogStickyBar (H142): read riq_capture_email on mount, pass as
 * customerEmail to GuestCheckoutButton.
 *
 * CRO #6 (cognitive load: removes Stripe email field for visitors who already
 * gave it above-fold) + #9 (friction: footer=earned ask, reader converted to
 * product-aware, email pre-fill is the last friction before Stripe).
 *
 * Closes the email funnel gap on the third and final blog checkout surface:
 *  above-fold CTA (H140/H142 capture) → sticky bar (H142 prefill) → footer (H146 prefill).
 *
 * H176 CRO: comparable_n trust proof in the footer.
 * The sticky bar (H151) and above-fold checker (C203) already surface comparable_n —
 * "47 data points on Stone Island Hoodie". The footer was missing it despite being the
 * max-conviction moment: visitor just finished 11 min of reading + FAQ, convinced of the
 * category, now weighing €19. The last doubt is "but do you actually have MY item?"
 * comparable_n answers it inline, at peak attention, with zero new fetch (already SSR'd).
 * Only shown when comparableN > 0 — never fabricated; absent when unknown.
 * CRO #7 (trust before CTA: specific proof at the ask) + #8 (specificity converts).
 * Surface: blog 130/7d. Revenue 2026-09-29. H176.
 *
 * H185 CRO: annual checkout option in the blog footer.
 * RESEARCH (fetched live patterns 2026-09-29):
 *  - Plausible: yearly billing option on every CTA surface alongside monthly.
 *  - Fathom: annual plan (save 2 months) always visible at purchase moment.
 *  - Beehiiv: annual toggle right at the plan card before checkout.
 * MEASUREMENT GAP: BlogFooterCta is the highest-conviction blog touchpoint —
 * visitor has read 11+ minutes, seen the proof, asked FAQ, and is at peak intent.
 * HardPaywallCard (H173) and /pricing (billing toggle) both expose annual.
 * The BLOG FOOTER had no annual path: visitors who would prefer annual were
 * forced to navigate to /pricing, find the toggle, and restart the commitment.
 * One annual conversion (€190) = 10 monthly conversions in LTV terms.
 * This mirrors HardPaywallCard H173 exactly: same ghost-styled compact button,
 * same useGuestCheckout({ annual: true }), same "Save 2 months — €190/year →" copy.
 * Placed BELOW the primary monthly CTA so it never competes (secondary path only).
 * CRO #10 (CTA ladder: high-conviction visitor → offer both commitment levels)
 * + #12 (conversion momentum: max-conviction moment deserves full offer choice).
 * Surface: blog 130/7d. Revenue 2026-09-29. H185.
 *
 * Surface: blog 130/7d. Revenue 2026-09-29. H146.
 */
import { useEffect, useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { useGuestCheckout } from "@/hooks/use-guest-checkout"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"

export function BlogFooterCta({
  preflightQuery,
  locale = "en",
  comparableN,
}: {
  preflightQuery: string
  locale?: Locale
  /**
   * H176 CRO: number of data points we hold for this post's item.
   * When present and > 0, shown as a trust proof line above the checkout button:
   * "✓ We hold N data points on {item} — the answer is ready."
   * Same specificity signal as the sticky bar (H151) and above-fold CTA (C203).
   * Never fabricated — only rendered when comparableN is a positive number.
   */
  comparableN?: number | null
}) {
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])
  // H185 CRO: annual checkout for blog footer — mirrors HardPaywallCard H173.
  const { start: startAnnual } = useGuestCheckout({
    locale,
    src: "blog_footer_annual",
    query: preflightQuery,
    customerEmail: capturedEmail || undefined,
    annual: true,
  })

  return (
    <>
      {/* H176 CRO: comparable_n proof — "✓ We hold N data points on X — the answer is ready."
          Resolves "do you even have my item?" at the footer's peak-conviction position.
          Same pattern as BlogStickyBar (H151) and BlogInlineChecker above-fold (C203).
          Zero new fetch — comparableN comes from ssrBlogVerdict already called in page.tsx.
          Only rendered when comparableN is a real positive number. */}
      {comparableN != null && comparableN > 0 && (
        <p style={{ fontSize: 12.5, color: "#34C759", margin: "0 0 12px", lineHeight: 1.45, fontWeight: 600 }}>
          ✓ We hold {comparableN.toLocaleString("en-GB")} data points on {preflightQuery} — the answer is ready.
        </p>
      )}
      <GuestCheckoutButton
        locale={locale}
        src="blog_footer_cta"
        query={preflightQuery}
        customerEmail={capturedEmail || undefined}
      />
      {/* H185 CRO: annual option below primary CTA — ghost-styled, never competes.
          Max-conviction visitor who prefers annual had to navigate to /pricing to find
          this path. One annual = 10x monthly LTV. Same pattern as HardPaywallCard H173. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12.5 }}>
        <span style={{ color: "#4d5a75" }}>or</span>
        <button
          type="button"
          onClick={() => {
            trackEvent("annual_cta_click", "blog_footer_annual")
            startAnnual()
          }}
          style={{
            background: "transparent",
            color: "#34C759",
            fontWeight: 600,
            fontSize: 12.5,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid rgba(52,199,89,0.3)",
            cursor: "pointer",
          }}
        >
          Save 2 months — €190/year →
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: "#4d5a75", margin: "10px 0 14px" }}>
        <a href="/terms" style={{ color: "#4d5a75", textDecoration: "underline" }}>
          Full refund within 30 days of your first payment — see Terms
        </a>
      </div>
    </>
  )
}
