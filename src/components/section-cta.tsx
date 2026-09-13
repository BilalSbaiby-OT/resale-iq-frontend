import Link from "next/link"
import type { SectionCtaContent } from "@/lib/section-cta"

/** Mid-article conversion block. Shared by blog and manual so the markup cannot drift. */
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
        style={{ display: "inline-block", background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 14, padding: "11px 22px", borderRadius: 9, textDecoration: "none", marginTop: 16 }}
      >
        {cta.label} →
      </Link>
      {cta.secondaryHref && cta.secondaryLabel && (
        <div style={{ marginTop: 12 }}>
          <Link href={cta.secondaryHref} style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
            {cta.secondaryLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
