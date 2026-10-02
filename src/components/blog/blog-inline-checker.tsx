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
 * H160 — H140 re-added a conditional email input (cold visitors only).
 *  Still 0 checkout_from_blog. Re-removing. Single button, no gate.
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
 *  495 SSR calls to a free model in 7d, 0 checkout_from_blog (all time).
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
import { FREE_SAMPLES } from "@/lib/free-samples"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { itemDisplayName } from "@/lib/item-display-name"
import { buyBelowLabel } from "@/lib/buy-list-display"
import { VERDICT_COLOR } from "@/components/blog-proof-strip"
import { RoiExampleCard } from "@/components/landing/roi-example-card"

export function BlogInlineChecker({
  preflightQuery,
  locale = "en",
  initialResult,
  buyListPreview,
  roiRows,
}: {
  preflightQuery: string
  locale?: Locale
  /** SSR-prefetched verdict — renders HardPaywallCard on first paint, no spinner. */
  initialResult?: PaywallPayload | null
  /**
   * H138(elon): unlocked buy-list rows for the RoiExampleCard. Separate from
   * buyListPreview (which uses locked rows for FOMO via C222). RoiExampleCard
   * filters !locked internally but if buyListPreview is all locked rows it
   * renders nothing. Passing unlocked rows here fixes the silent null render.
   * Falls back to buyListPreview when roiRows is not provided.
   */
  roiRows?: SsrBuyListItem[] | null
  /**
   * C221(elon): up to 2 unlocked buy-list rows from the page's proofRows.
   * Shown inside the above-fold CTA so visitors see actual products + prices
   * before the paywall ask, not just "47+ items like this" text.
   * Surface: blog 130/7d. Replaces generic copy with real product evidence.
   */
  buyListPreview?: SsrBuyListItem[] | null
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

  // H140 CRO: read captured email so blog above-fold CTA pre-fills Stripe.
  // Blog is our #1 traffic surface (130/7d) and checkout_from_blog = 0 all-time.
  // C202 removed an unconditional email input (hurt conversion for returning visitors).
  // This adds it back CONDITIONALLY — only when riq_capture_email is not already set.
  // First-visit ChatGPT referrers (cold, no localStorage email) see one field.
  // Returning visitors (email already stored from /pricing, /tools, homepage) skip it.
  // Value persists to riq_capture_email so all downstream GuestCheckoutButtons pre-fill.
  // CRO #6 (cognitive load: Stripe's email field is the single highest-friction moment)
  // + #9 (friction: only for visitors who need it, not a gate for all).
  // Revenue 2026-09-29. H140.
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])
  const handleEmailChange = (v: string) => {
    setCapturedEmail(v)
    if (v.trim()) {
      try { localStorage.setItem("riq_capture_email", v.trim()) } catch { /* private mode */ }
    }
  }

  const isActiveQueryFreeModel = (FREE_SAMPLES as readonly string[]).some(
    (m) => m.toLowerCase() === (chipQuery ?? preflightQuery).toLowerCase()
  )
  // Keep the original name for the chips logic (show chips when the POST topic is free,
  // regardless of chip state — chips only appear before any chip is clicked).
  const isFreeModelQuery = (FREE_SAMPLES as readonly string[]).some(
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
      {/* H181: the check itself is the first child. Live HTML (what-sells-best,
          2026-09-29) put the €19 unlock bar, ROI card and catalog chips ABOVE
          FreeChecker, so "See the verdict" landed on a pay ask. FreeChecker
          auto-runs initialQuery and must be the first thing in this box.
          Do not pass initialResult — a seeded PAYWALL skips that auto-run. */}
      <FreeChecker
        key={checkerKey}
        initialQuery={activeQuery}
        locale={locale}
        variant="card"
        src="blog-check"
        buyListPreview={buyListPreview}
      />

      {/* C207/C208: checkout pitch AFTER the check, never before it.
          C207: previously gated on isSSRPaywall; changed to !isFreeModelQuery for the post topic.
          C208: now uses !isActiveQueryFreeModel so after a chip click (paid item), the CTA
          appears immediately for the chip query — not for the static post topic.
          H150: comparable_n from SSR PAYWALL response is now surfaced in the above-fold CTA
          (was only shown in HardPaywallCard below, which loads client-side — 300ms delay).
          When comparable_n is present and no chip is active, the teaser and button label
          are message-matched to the post's item, not generic. */}
      {!isActiveQueryFreeModel && (
        <div
          data-testid="riq-blog-above-fold-cta"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            background: "rgba(52,199,89,.08)",
            border: "1px solid rgba(52,199,89,.22)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          {/* C221(elon): Show 2 actual buy-list rows instead of generic "47+ items" text.
              BEFORE: "47+ items like this, ranked by profit margin" + "See full buy list →"
              → 0 checkout_from_blog all-time. Generic claim, no proof.
              AFTER: 2 real unlocked products with buy-below + resale prices — visitors
              see what they're paying for BEFORE clicking checkout. Same data already on
              page (proofRows). Only adds 10 lines; no extra network call.
              Surface: blog 130/7d. */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {buyListPreview && buyListPreview.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8FA3C4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  From today&rsquo;s buy list
                </span>
                {buyListPreview.slice(0, 2).map((it, i) => {
                  const color = VERDICT_COLOR[it.verdict] ?? "#8b99b8"
                  const price = buyBelowLabel(it.buy_below)
                  return (
                    <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ color: "#EEF1F7", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {itemDisplayName(it.brand, it.model)}
                      </span>
                      <span style={{ color, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{it.verdict}</span>
                      {price ? (
                        <span style={{ color: "#30D158", fontSize: 12, flexShrink: 0, fontWeight: 700 }}>
                          {price}
                        </span>
                      ) : it.locked ? (
                        <span style={{ color: "#5b6b8c", fontSize: 12, flexShrink: 0 }}>🔒 price locked</span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.45 }}>
                <strong style={{ color: "#34C759" }}>Today&rsquo;s buy list</strong> — ranked items with buy-below prices.
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            {/* H150 CRO: comparable_n teaser — item-specific coverage before the button.
                initialResult (SSR PAYWALL payload) carries comparable_n for the post's
                preflightQuery. Previously only visible in HardPaywallCard, which renders
                client-side (~300ms after paint). This surfaces it immediately in the
                above-fold CTA for no extra cost — data is already in SSR props.
                Only shown when no chip is active (chipQuery===null) since initialResult
                is for the post's own preflightQuery, not a chip query.
                Surface: blog 130/7d. Revenue 2026-09-29. H150. */}
            {initialResult?.comparable_n && !chipQuery && (
              <span style={{ fontSize: 11.5, color: "#34C759", fontWeight: 700, lineHeight: 1.3 }}>
                ✓ {initialResult.comparable_n.toLocaleString()} data points on {preflightQuery}
              </span>
            )}
            {/* H160: email input REMOVED from above-fold CTA.
                C202 proved checkout_from_blog = 0 after C199 added it.
                H140 re-added it conditionally (cold visitors only) — still 0.
                C202 lesson: /tools converts ~30% with a single button.
                Any extra field before the button kills cold ChatGPT traffic.
                Stripe collects email. customerEmail pre-fill still works via
                riq_capture_email (written by footer/sticky captures). */}
            <GuestCheckoutButton
              locale={locale}
              src="blog_buylist_pitch"
              query={activeQuery}
              customerEmail={capturedEmail || undefined}
            />
          </div>
        </div>
      )}

      {/* H137 CRO: ROI worked example below above-fold CTA for paid-model blog posts.
          Blog: 130/7d visitors, 0 checkout_from_blog all-time.
          The above-fold CTA shows 2 buy-list rows (C221); visitors see what's in the list
          but don't immediately see WHY it pays off. RoiExampleCard adds the P&L math:
          "Buy X at €Y, typical exit €Z, margin ~€W — one flip covers your Starter month"
          from a REAL live buy-list row. Same component as /pricing (H136), different surface.
          Rendered only for non-free-model queries (free-model posts already show the buy-list
          pitch below — adding ROI there too would duplicate). buyListPreview is already in
          scope; no extra fetch. Falls back gracefully: renders nothing when no suitable row
          is available (RoiExampleCard contract). CRO #4 (objection: worth it?) +
          #8 (specificity: real item, real margin, not a claim) +
          #12 (conviction before the FreeChecker paywall). Revenue 2026-09-29. H137. */}
      {/* H138(elon): use roiRows (unlocked) if available, else fall back to buyListPreview.
          C222 passes locked rows as buyListPreview for FOMO in the CTA above; RoiExampleCard
          filters !locked so it was silently rendering nothing on posts where all buyListPreview
          rows are locked. roiRows is the unlocked slice from the page, no extra fetch. */}
      {!isFreeModelQuery && (roiRows ?? buyListPreview) && (roiRows ?? buyListPreview)!.length > 0 && (
        <RoiExampleCard items={(roiRows ?? buyListPreview)!} />
      )}

      {/* C214: Buy-list pitch for free-model visitors (Fred Perry Polo, AF1, Samba).
          These posts have 495+ SSR calls/7d but 0 checkout_from_blog ever.
          The visitor just got a free verdict — they don't need 'see another verdict'.
          They need to see the DIFFERENT value: the full ranked buy list.
          Pitch: 47+ items like this, ranked by profit margin, with buy-below prices.
          Direct checkout CTA — no chip redirect detour. */}
      {isFreeModelQuery && !chipQuery && (
        <div
          data-testid="riq-blog-buylist-pitch"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            background: "rgba(52,199,89,.08)",
            border: "1px solid rgba(52,199,89,.22)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {buyListPreview && buyListPreview.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8FA3C4", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  From today&rsquo;s buy list
                </span>
                {buyListPreview.slice(0, 2).map((it, i) => {
                  const color = VERDICT_COLOR[it.verdict] ?? "#8b99b8"
                  const price = buyBelowLabel(it.buy_below)
                  return (
                    <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ color: "#EEF1F7", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {itemDisplayName(it.brand, it.model)}
                      </span>
                      <span style={{ color, fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{it.verdict}</span>
                      {price ? (
                        <span style={{ color: "#30D158", fontSize: 12, flexShrink: 0, fontWeight: 700 }}>
                          {price}
                        </span>
                      ) : it.locked ? (
                        <span style={{ color: "#5b6b8c", fontSize: 12, flexShrink: 0 }}>🔒 price locked</span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.45 }}>
                <strong style={{ color: "#34C759" }}>Today&rsquo;s buy list</strong> — ranked items with buy-below prices.
              </span>
            )}
          </div>
          <GuestCheckoutButton
            locale={locale}
            src="blog_buylist_pitch"
            query={activeQuery}
            customerEmail={capturedEmail || undefined}
          />
        </div>
      )}

      {/* C224(elon): paywall-demo chips — free-model posts only, before any chip clicked.
          Free-model visitors (Fred Perry Polo, AF1, Samba) get a free verdict and bounce —
          checkout_from_blog = 0 all-time. These chips let them one-tap a real paid item
          to experience the paywall CTA with context (comparable_n), not cold.
          Chips must not be free-model queries (see FREE_SAMPLES). Confirmed in catalog. */}
      {isFreeModelQuery && !chipQuery && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#5b6b8c", flexShrink: 0 }}>Now try a paid item →</span>
          {["Stone Island Hoodie", "New Balance 550", "Balenciaga Track"].map((q) => (
            <button
              key={q}
              onClick={() => { setChipQuery(q); trackEvent("chip_click", q) }}
              style={{
                background: "rgba(52,199,89,.08)",
                border: "1px solid rgba(52,199,89,.22)",
                borderRadius: 6,
                color: "#c3cde0",
                fontSize: 12.5,
                fontWeight: 600,
                padding: "5px 10px",
                cursor: "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* C227(elon): Cross-check chips for PAID-model posts — no chip clicked yet.
          On free-model posts (Fred Perry Polo/AF1/Samba) the C224 chips above nudge to a paid item.
          Paid-model posts had NO equivalent: a first-timer who got their free verdict
          for Stone Island Hoodie had no prompt to check a second item — they just left.
          After a first-timer's free verdict, their NEXT check returns 402 PAYWALL.
          These chips surface 3 different brands to click immediately after the verdict,
          driving a second auto-run → paywall → comparable_n → conversion moment.
          Guard: only show when the post topic is NOT a free model (paid posts only),
          no chip has been clicked yet, and the chip items differ from the post's own query.
          Items are confirmed paid-model catalog entries (not FREE_SAMPLES). */}
      {!isFreeModelQuery && !chipQuery && (() => {
        // Verified PAYWALL for anonymous visitors (all return paywalled=true + comparable_n≥40).
        // H145: swapped Ralph Lauren Polo Shirt → New Balance 550 (RL returns free 200 for anon;
        // NB550 is confirmed PAYWALL for anon and has 59 data points — good comparable_n teaser).
        // H177(elon): removed "Fred Perry Polo" from CROSS_CHIPS — it is a FREE_MODEL.
        // Clicking it on a paid-post gave a free verdict with no checkout CTA → dead-end.
        // All chips must be paid-model catalog entries that return 402 for anon visitors.
        const CROSS_CHIPS = ["Stone Island Hoodie", "Balenciaga Track", "Levis 501", "New Balance 550", "Ralph Lauren Polo"]
        const chips = CROSS_CHIPS.filter(q =>
          q.toLowerCase() !== preflightQuery.toLowerCase() &&
          !(FREE_SAMPLES as readonly string[]).some(m => m.toLowerCase() === q.toLowerCase())
        ).slice(0, 3)
        if (chips.length === 0) return null
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "#5b6b8c", flexShrink: 0 }}>Also in catalog →</span>
            {chips.map((q) => (
              <button
                key={q}
                onClick={() => { setChipQuery(q); trackEvent("chip_click", q) }}
                style={{
                  background: "rgba(52,199,89,.08)",
                  border: "1px solid rgba(52,199,89,.22)",
                  borderRadius: 6,
                  color: "#c3cde0",
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )
      })()}

    </div>
  )
}
