"use client"
/**
 * HeroFreeChips — free sample chips with analytics tracking.
 *
 * Split from the server-rendered landing-content so onClick analytics can fire
 * without making the whole page a Client Component. Tracks hero_cta_click with
 * a variant path so we can see which chip drives the most trial checks.
 *
 * CRO: free chips are the lowest-friction conversion step. A visitor who clicks
 * Samba gets a verdict WITHOUT signup → proves the product → increases likelihood
 * of returning and subscribing. 37% of verdict-seers come back (funnel data).
 */
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"

const SAMPLES = ["Adidas Samba", "Nike Air Force 1", "New Balance 530"] as const

export function HeroFreeChips({ locale }: { locale: Locale }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        marginTop: 8,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--color-text-dim)", whiteSpace: "nowrap" }}>
        Try free:
      </span>
      {SAMPLES.map((q) => (
        <Link
          key={q}
          href={canonicalPath(locale, `/tools?q=${encodeURIComponent(q)}&src=home_free_sample`)}
          onClick={() =>
            trackEvent(
              "hero_cta_click",
              `/hero_cta/free_chip/${q.toLowerCase().replace(/ /g, "_")}`,
            )
          }
          style={{
            fontSize: 12,
            color: "#34C759",
            border: "1px solid rgba(52,199,89,.35)",
            borderRadius: 6,
            padding: "3px 9px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            fontWeight: 600,
            lineHeight: 1.6,
          }}
        >
          {q}
        </Link>
      ))}
      <span style={{ fontSize: 11, color: "var(--color-text-dim)", whiteSpace: "nowrap" }}>
        — no account needed
      </span>
    </div>
  )
}
