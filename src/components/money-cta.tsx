import Link from "next/link"
import { MONEY_CTA_LABEL, MONEY_CTA_SUBLINE } from "@/lib/money-cta"

/** Primary paid-door button. Same copy on /tools and /category. */
export function MoneyCta({
  href,
  secondaryHref,
  secondaryLabel,
}: {
  href: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  return (
    <div
      style={{
        padding: "22px 24px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-2)",
        borderRadius: 12,
        textAlign: "center",
        margin: "0 0 28px",
      }}
    >
      <Link
        href={href}
        style={{
          display: "inline-block",
          background: "#34C759",
          color: "#06090c",
          fontWeight: 700,
          fontSize: 14,
          padding: "11px 22px",
          borderRadius: 9,
          textDecoration: "none",
        }}
      >
        {MONEY_CTA_LABEL}
      </Link>
      <p style={{ fontSize: 13.5, color: "#8b99b8", margin: "10px 0 0", lineHeight: 1.6 }}>
        {MONEY_CTA_SUBLINE}
      </p>
      {secondaryHref && secondaryLabel && (
        <div style={{ marginTop: 12 }}>
          <Link href={secondaryHref} style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "underline" }}>
            {secondaryLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
