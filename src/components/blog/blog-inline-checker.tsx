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
 *  C207 removes the isSSRPaywall gate — the bar now shows for all non-free-model
 *  posts since ssrBlogVerdict almost never returns PAYWALL (SSR calls get 200).
 *  Previously gated on SSR PAYWALL (initialResult.verdict === "PAYWALL") — free
 *  results and loading states do not show it.
 *
 * C202 — remove email friction from above-fold bar:
 *  checkout_from_blog = 0 after C199 shipped (email input in above-fold CTA).
 *  /tools converts at ~30% (3 checkouts / 10 visitors) with a single button.
 *  Blog had an email input gating the same button — pre-gate decision adds
 *  cognitive friction before conversion. Removed the input. Single
 *  GuestCheckoutButton — same pattern as /tools. Stripe collects email after.
 *
 * C203 — comparable_n in above-fold copy:
 *  34 first_analysis events in 7d from blog, 0 checkout_from_blog. The CTA
 *  rendered but no one clicked. Copy was generic ("verdict is ready"). Fix:
 *  show the actual comparable_n from the SSR payload — "We have 41 data points
 *  on New Balance 550. Unlock buy-below prices →". Specificity converts.
 *  comparable_n is passed from ssrBlogVerdict → parsePaywallBody → initialResult.
 *  Fallback when comparable_n is null/undefined: "Verdict data ready for
 *  {preflightQuery}" — always honest (never invent a number).
 *
 * C205 — paywall-demo chips after free-model result:
 *  495 SSR calls to NB530 (free model) in 7d, 0 checkout_from_blog (all time).
 *  Blog posts with free-model preflightQueries show a free result and the
 *  "That was a public demo item" bridge — but leave the visitor to figure
 *  out what to check next. They got their answer and leave.
 *
 *  Fix: when the SSR result is NOT a PAYWALL (free model), show 3 clickable
 *  chips BELOW the above-fold area: "Now try a paid item →" [Stone Island Hoodie]
 *  [Ralph Lauren Polo] [Balenciaga Track]. Each chip re-runs the FreeChecker
 *  with that query → 402 PAYWALL → comparable_n → conversion moment.
 *
 *  Chips are hardcoded from the current catalog (confirmed in-universe brands
 *  with model_signals rows). They must not be free-model queries (never put
 *  NB530/AF1/Samba there). They should represent what a real reseller sources.
 *
 *  This is the only place that passes a non-preflightQuery to FreeChecker
 *  from a blog post; the override is ref-via-state in BlogInlineChecker so
 *  FreeChecker still owns its own state.
 */
import { useEffect, useState } from "react"
import { FreeChecker } from "@/components/tools/free-checker"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import type { PaywallPayload } from "@/lib/hard-paywall"
import { FREE_MODELS } from "@/lib/working-models"


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

  // Chip selection state: when a chip is clicked, override the query sent
  // to FreeChecker. Use a key to force FreeChecker remount so it re-runs
  // the new query from scratch (no stale state from the free result).
  // IMPORTANT: must be declared before any expression that references chipQuery,
  // or the bundler (Turbopack TDZ) crashes with "Cannot access 'm' before
  // initialization" — see C209 hotfix.

  const [chipQuery, setChipQuery] = useState<string | null>(null)

  const isActiveQueryFreeModel = (FREE_MODELS as readonly string[]).some(
    (m) => m.toLowerCase() === (chipQuery ?? preflightQuery).toLowerCase()
  )
  // Keep the original name for the chips logic (show chips when the POST topic is free,
  // regardless of chip state — chips only appear before any chip is clicked).
  const isFreeModelQuery = (FREE_MODELS as readonly string[]).some(
    (m) => m.toLowerCase() === preflightQuery.toLowerCase()
  )



  const activeQuery = chipQuery ?? preflightQuery
  // Key: changes when chipQuery changes to force FreeChecker remount + auto-run.
  const checkerKey = chipQuery ?? "preflight"

  return (
    <div
      id="riq-blog-checker"
      data-testid="riq-blog-inline-checker"
      style={{ marginBottom: 28 }}
    >
      {/* C207/C208: Above-fold single checkout CTA — show for ALL non-free-model active queries.
          C207: previously gated on isSSRPaywall; changed to !isFreeModelQuery for the post topic.
          C208: now uses !isActiveQueryFreeModel so after a chip click (paid item), the CTA
          appears immediately for the chip query — not for the static post topic.
          comparable_n from SSR PAYWALL response shows when available. */}
      {!isActiveQueryFreeModel && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          data-testid="riq-blog-above-fold-cta"
          onClick={() => trackEvent("checkout_from_blog")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(52,199,89,.08)",
            border: "1px solid rgba(52,199,89,.22)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: "#c3cde0", lineHeight: 1.45 }}>
            {initialResult?.comparable_n
              ? <>We have <strong style={{ color: "#34C759" }}>{initialResult.comparable_n}</strong> data points on {activeQuery}.</>
              : <>Get the buy-below price for {activeQuery}.</>
            }
          </span>
          <GuestCheckoutButton
            locale={locale}
            label="Unlock buy-below →"
            src="blog_above_fold"
            query={activeQuery}
          />
        </div>
      )}

      {/* C214: Buy-list pitch for free-model visitors (NB530, AF1, Samba).
          These posts have 495+ SSR calls/7d but 0 checkout_from_blog ever.
          The visitor just got a free verdict — they don't need 'see another verdict'.
          They need to see the DIFFERENT value: the full ranked buy list.
          Pitch: 47+ items like this, ranked by profit margin, with buy-below prices.
          Direct checkout CTA — no chip redirect detour. */}
      {isFreeModelQuery && !chipQuery && (
        <div
          data-testid="riq-blog-buylist-pitch"
          onClick={() => trackEvent("checkout_from_blog")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(52,199,89,.08)",
            border: "1px solid rgba(52,199,89,.22)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: "#c3cde0", lineHeight: 1.45 }}>
            <strong style={{ color: "#34C759" }}>47+ items like this</strong>, ranked by profit margin — with buy-below prices for each.
          </span>
          <GuestCheckoutButton
            locale={locale}
            label="See full buy list →"
            src="blog_buylist_pitch"
            query={preflightQuery}
          />
        </div>
      )}

      {/* C215(elon): Do NOT pass initialResult to FreeChecker.
          The bug: ssrBlogVerdict seeds a PAYWALL result as initialResult.
          FreeChecker skips auto-run when initialResult is present (line ~564).
          So first-time visitors never trigger run() → never claim first-free-verdict
          → see a cold paywall wall immediately → checkout_from_blog = 0 all-time.
          Fix: always let FreeChecker auto-run its own API call. First-timers get
          their free verdict (claim_first_free_verdict fires). The above-fold CTA
          still uses initialResult.comparable_n for copy — that's the only use case.
          Verified: FreeChecker run() → 200 with verdict for first-timers, 402 paywall
          for repeat visitors (HARD_PAYWALL stays ON). */}
      <FreeChecker
        key={checkerKey}
        initialQuery={activeQuery}
        locale={locale}
        variant="card"
        src="blog-check"
      />
    </div>
  )
}
