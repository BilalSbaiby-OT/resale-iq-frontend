"use client"

import { useLocale } from "@/components/i18n/locale-provider"
import { momentumWord } from "@/lib/app-copy"

/**
 * A model's demand status, in the reader's language.
 *
 * TWO DEFECTS FIXED HERE, and they are the same defect in two costumes.
 *
 * 1. It printed `{momentum}` — the RAW API enum. So an otherwise-Spanish deal
 *    card rendered "RISING" and "HOT" beside market chips that were correctly
 *    ES/IT/FR. Identical in kind to the verdict word `verdict-words.ts` was
 *    written for: a backend constant reaching the screen untranslated because
 *    nothing stood between the payload and the JSX.
 * 2. It was a filled, bordered, tinted chip in one of five hues. Multiplied
 *    across a grid of deal cards it competed with the one thing on the card
 *    that should win — the price.
 *
 * The dot keeps the hue, because the status genuinely is ordinal and colour is
 * the cheapest way to scan a grid. The BOX is what went: no fill, no border,
 * muted label. Colour marks; type and whitespace rank.
 *
 * `useLocale()` rather than a `locale` prop, deliberately — this renders on
 * /deals, /dashboard, /trends, /watchlist, /market and /portfolio, and a prop
 * would translate it on the pages someone remembered to update and leave the
 * rest English. That asymmetry is the bug, not the fix.
 */

const DOT: Record<string, string> = {
  HOT: "#ef4444",
  RISING: "#f59e0b",
  STABLE: "#3b82f6",
  FADING: "#64748b",
  DEAD: "#4b5563",
}

interface MomentumBadgeProps { momentum: string | null; size?: "sm" | "md" }

export function MomentumBadge({ momentum, size = "sm" }: MomentumBadgeProps) {
  const locale = useLocale()
  if (!momentum) return null
  const label = momentumWord(momentum, locale)
  const dot = DOT[momentum] ?? DOT.STABLE
  return (
    <span
      data-testid="riq-momentum"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: size === "sm" ? 13 : 14,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      {label}
    </span>
  )
}
