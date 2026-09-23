"use client"
/**
 * BlogInlineChecker — the FreeChecker embedded inline in a blog post.
 *
 * WHY: Before, the blog→answer flow was:
 *   1. read proof strip  2. scroll 11 min  3. click CTA  4. land on /tools
 *   5. type  6. wait  → verdict
 * Now: the checker renders directly under the proof strip with the post's
 * own topic pre-filled and auto-running. Zero redirects, zero typing.
 *
 * With SSR prefetch (ssr-blog-verdict.ts): the HardPaywallCard renders on
 * first HTML paint — no spinner, no client-side delay before the paywall.
 * comparable_n shows automatically once C189 backend is live.
 *
 * Visitor lands from ChatGPT on /blog/nike-sneakers-price-guide-eu-vinted →
 * sees "WATCH – Nike Samba" live data → sees the inline checker already
 * showing their result → hits the paywall CTA with context (not a cold ask).
 *
 * Rules:
 *  - Only renders when a preflightQuery is provided.
 *  - Uses src="blog-check" so the paid CTA is message-matched to the item.
 *  - Zero hardcoded numbers — the FreeChecker fetches everything live.
 *
 * Analytics note (C193):
 *  When initialResult is a PAYWALL payload (C191 SSR prefetch), the
 *  FreeChecker never calls run() → trackEvent("first_analysis") is silently
 *  dropped → blog visits are invisible in the funnel. This component fires
 *  the event on mount for SSR-seeded PAYWALL visits so checkout_from_blog
 *  is measurable instead of perpetually 0.
 */
import { useEffect } from "react"
import { FreeChecker } from "@/components/tools/free-checker"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import type { PaywallPayload } from "@/lib/hard-paywall"

export function BlogInlineChecker({
  preflightQuery,
  locale = "en",
  initialResult,
}: {
  preflightQuery: string
  locale?: Locale
  /** SSR-prefetched verdict — renders HardPaywallCard on first paint, no spinner. */
  initialResult?: PaywallPayload | null
}) {
  // C193: SSR-seeded PAYWALL visits skip run() inside FreeChecker so
  // first_analysis is never fired. Fire it here on mount so blog paywall
  // impressions appear in the funnel and checkout_from_blog can be measured.
  useEffect(() => {
    if (initialResult?.verdict === "PAYWALL") {
      trackEvent("first_analysis")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      id="riq-blog-checker"
      data-testid="riq-blog-inline-checker"
      style={{ marginBottom: 28 }}
    >
      <FreeChecker
        initialQuery={preflightQuery}
        initialResult={initialResult ?? undefined}
        locale={locale}
        variant="card"
        src="blog-check"
      />
    </div>
  )
}
