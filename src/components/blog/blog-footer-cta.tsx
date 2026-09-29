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
 * Surface: blog 130/7d. Revenue 2026-09-29. H146.
 */
import { useEffect, useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

export function BlogFooterCta({
  preflightQuery,
  locale = "en",
}: {
  preflightQuery: string
  locale?: Locale
}) {
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  return (
    <>
      <GuestCheckoutButton
        locale={locale}
        label={`Unlock ${preflightQuery} buy-below — €19/mo →`}
        src="blog_footer_cta"
        query={preflightQuery}
        customerEmail={capturedEmail || undefined}
      />
      <div style={{ fontSize: 11.5, color: "#4d5a75", margin: "10px 0 14px" }}>
        <a href="/terms" style={{ color: "#4d5a75", textDecoration: "underline" }}>
          Full refund within 30 days of your first payment — see Terms
        </a>
      </div>
    </>
  )
}
