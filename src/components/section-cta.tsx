"use client"
import Link from "next/link"
import type { SectionCtaContent } from "@/lib/section-cta"
import { trackEvent } from "@/lib/analytics"

/**
 * Mid-article conversion block. Shared by blog and manual so the markup cannot drift.
 *
 * H143(elon): wire click tracking on both the primary and secondary CTA buttons.
 * blog_section_cta was invisible in the funnel — 50+ blog post files use pricingMidCta /
 * pricingBodyCta, each rendering a "Get the numbers → /pricing" link, but zero events
 * were ever emitted for them. We cannot know if they're clicked without tracking.
 * Fires "checkout_intent_guest" with path carrying src=section_cta so it lands in the
 * same funnel table without adding a new column.
 * Surface: blog 130/7d. Revenue 2026-09-29. H143.
 */
export function SectionCta({ cta }: { cta: SectionCtaContent }) {
  return (
    <div style={{ margin: "18px 0 4px", padding: "22px 24px", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7" }}>{cta.headline}</div>
      <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "8px 0 0", lineHeight: 1.6 }}>{cta.body}</p>
      {cta.example && (
        <p style={{ fontSize: 13, color: "#a9b6d0", margin: "10px 0 0", lineHeight: 1.6 }}>{cta.example}</p>
      )}
      <Link
        href={cta.href}
        onClick={() => trackEvent("checkout_intent_guest", `${typeof window !== "undefined" ? window.location.pathname : ""}?src=section_cta`)}
        style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none", marginTop: 16 }}
      >
        {cta.label} →
      </Link>
      {cta.secondaryHref && cta.secondaryLabel && (
        <div style={{ marginTop: 12 }}>
          <Link
            href={cta.secondaryHref}
            onClick={() => trackEvent("checkout_intent_guest", `${typeof window !== "undefined" ? window.location.pathname : ""}?src=section_cta_free`)}
            style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}
          >
            {cta.secondaryLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
