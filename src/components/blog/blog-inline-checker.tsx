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
 *
 * C197 — above-fold checkout button on mobile:
 *  On a 390px screen the proof strip + checker form + lock/chips + offer box
 *  totals ~525px before the GuestCheckoutButton — below the fold on every
 *  mobile device. Visitors who land from ChatGPT see a paywall result but
 *  must scroll to reach the buy button. This renders a compact checkout CTA
 *  ABOVE the full checker when the SSR result is already a PAYWALL, so the
 *  conversion action is visible on first paint without scrolling.
 *  Only shown for SSR PAYWALL (initialResult.verdict === "PAYWALL") — free
 *  results and loading states do not show it.
 */
import { useEffect } from "react"
import { FreeChecker } from "@/components/tools/free-checker"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
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

  const isSSRPaywall = initialResult?.verdict === "PAYWALL"

  return (
    <div
      id="riq-blog-checker"
      data-testid="riq-blog-inline-checker"
      style={{ marginBottom: 28 }}
    >
      {/* C197: Above-fold checkout button — only on SSR PAYWALL.
          On 390px mobile the full HardPaywallCard is below fold (~525px
          before the CTA). This compact bar is the first thing the visitor
          sees when the data is ready on first paint, before any scrolling.
          Positioned before FreeChecker so it renders at the top of the
          checker container, above the query/lock UI. */}
      {isSSRPaywall && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          data-testid="riq-blog-above-fold-cta"
          onClick={() => trackEvent("checkout_from_blog")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            background: "rgba(52,199,89,.08)",
            border: "1px solid rgba(52,199,89,.22)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.45 }}>
            Your {preflightQuery} verdict is ready.
          </span>
          <GuestCheckoutButton
            locale={locale}
            label={`Unlock ${preflightQuery} — €19/mo →`}
            src="blog_above_fold"
            query={preflightQuery}
          />
        </div>
      )}
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
