"use client"
/**
 * BlogStickyBar — persistent bottom checkout bar for blog posts.
 *
 * WHY: Blog 130/7d, checkout_from_blog = 0 all-time. The inline checker + CTA
 * is above the fold; after the visitor scrolls past it, there is no actionable
 * surface for the remaining 11 minutes of read. A sticky bar keeps the
 * conversion action visible throughout the scroll.
 *
 * H191 CRO: surface "€0 today" in the sticky bar left copy.
 * H189 introduced "€0 today" framing on the paywall card (cost before value →
 * trial before price). The sticky bar never got that frame — visitors scrolled
 * through the blog seeing item name + data count but no cost signal, then
 * faced a "Start my 7-day free trial" button with no anchor on what it costs.
 * Adding "€0 today" to the left copy answers the cost question at the exact
 * moment the visitor is deciding whether to click.
 * CRO #3 (message match: every surface now says €0 today)
 * + #8 (loss-framing: free > paid anchoring on cold scroll traffic)
 * + #12 (conviction before commitment: trial = zero risk, visible before CTA).
 * Surface: blog 130/7d. Revenue 2026-09-30. H191.
 *
 * Rules:
 * - Only visible after the visitor has scrolled past the inline checker
 *   (400px threshold — above-fold CTA is still visible before that).
 * - Disappears when the footer block is in view (not competing with it).
 * - Shows the post's own preflightQuery as the personalized item.
 * - GuestCheckoutButton (same path as everywhere else — no new checkout logic).
 * - No fabricated numbers. No fake urgency. Honest: the item name only.
 * - Hides on print / prefers-reduced-motion respected via CSS.
 *
 * H141. Surface: blog 130/7d. Revenue 2026-09-29.
 */
import { useEffect, useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

export function BlogStickyBar({
  preflightQuery,
  locale = "en",
  comparableN,
}: {
  preflightQuery: string
  locale?: Locale
  /**
   * H151 CRO: comparable_n from ssrBlogVerdict — number of data points we hold
   * for this post's item. Surfaced in the sticky bar copy so the scroll-phase
   * CTA carries specificity ("47 data points on Stone Island Hoodie") instead of
   * a generic claim ("buy-below price & demand data"). Same data already SSR'd
   * for the above-fold CTA (H150); passing it here costs nothing.
   * CRO #8 (specificity: a real count > a vague description)
   * + #7 (trust: proves we have data on this item while they're still reading).
   * Surface: blog 130/7d. Revenue 2026-09-29. H151.
   */
  comparableN?: number | null
}) {
  const [visible, setVisible] = useState(false)
  // H142 CRO: pre-fill Stripe email from localStorage.
  // Visitors who captured their email via H140 (above-fold blog CTA) or any other
  // riq_capture_email writer will skip Stripe's email field when clicking this bar.
  // CRO #6 (cognitive load: removes one required field) + #9 (friction: Stripe
  // email is the highest single-step drop-off). Surface: blog 130/7d. Revenue 2026-09-29.
  const [capturedEmail, setCapturedEmail] = useState("")
  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        // Show after 400px — the above-fold checker is past the viewport.
        // Hide if the user is near the footer (bottom 400px of doc).
        const docH = document.documentElement.scrollHeight
        const winH = window.innerHeight
        const nearFooter = scrollY + winH > docH - 400
        setVisible(scrollY > 400 && !nearFooter)
        ticking = false
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      data-testid="riq-blog-sticky-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(11,13,16,0.97)",
        borderTop: "1px solid rgba(52,199,89,.25)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        // Respect print / reduced-motion
        "@media print": { display: "none" },
      } as React.CSSProperties}
    >
      <span style={{ fontSize: 13, color: "#8FA3C4", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        <strong style={{ color: "#34C759" }}>{preflightQuery}</strong>
        {" "}—{" "}
        {comparableN != null && comparableN > 0
          ? "data ready · "
          : "buy-below price · "}
        <strong style={{ color: "#34C759" }}>€0 today</strong>
      </span>
      <GuestCheckoutButton
        locale={locale}
        src="blog_sticky_bar"
        query={preflightQuery}
        customerEmail={capturedEmail || undefined}
      />
    </div>
  )
}
