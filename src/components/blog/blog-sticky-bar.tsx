"use client"
/**
 * BlogStickyBar — persistent bottom checkout bar for blog posts.
 *
 * WHY: Blog 130/7d, checkout_from_blog = 0 all-time. The inline checker + CTA
 * is above the fold; after the visitor scrolls past it, there is no actionable
 * surface for the remaining 11 minutes of read. A sticky bar keeps the
 * conversion action visible throughout the scroll.
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
}: {
  preflightQuery: string
  locale?: Locale
}) {
  const [visible, setVisible] = useState(false)

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
        {" "}— buy-below price &amp; demand data
      </span>
      <GuestCheckoutButton
        locale={locale}
        label="Unlock buy-below →"
        src="blog_sticky_bar"
        query={preflightQuery}
      />
    </div>
  )
}
