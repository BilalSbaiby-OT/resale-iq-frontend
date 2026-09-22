/**
 * Badge & VerdictBadge — Status and classification chips.
 *
 * Badge: generic, configurable colour pill. Use for status labels, tags, counts.
 *
 * VerdictBadge: ResaleIQ-specific. Maps BUY/WATCH/SKIP/UNKNOWN to the semantic
 * colour tokens. ALWAYS renders the verdict WORD — colour is never the sole signal
 * (accessibility requirement: WCAG 1.4.1 — info not conveyed by colour alone).
 *
 * Fixes the live bug: an empty verdict pill (bare coloured dot with no text)
 * currently appears on the homepage. VerdictBadge guarantees text is always present.
 */

import React, { forwardRef } from "react"

// ── Badge ────────────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Hex or var(--color-*) */
  color?: string
  /** Background colour; defaults to 12% tint of `color` */
  bg?: string
  size?: "sm" | "md"
}

/** Generic status pill. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    color = "var(--color-text-secondary)",
    bg,
    size = "sm",
    children,
    style,
    ...rest
  },
  ref,
) {
  const resolvedBg =
    bg ?? `color-mix(in srgb, ${color} 14%, transparent)`

  return (
    <span
      ref={ref}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "3px 8px" : "5px 12px",
        fontSize: size === "sm" ? "var(--text-meta)" : "var(--text-body-app)",
        fontWeight: 600,
        letterSpacing: "0.01em",
        borderRadius: "var(--radius-pill)",
        color,
        background: resolvedBg,
        border: `1px solid color-mix(in srgb, ${color} 24%, transparent)`,
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
})

// ── VerdictBadge ─────────────────────────────────────────────────────────────

export type VerdictValue = "BUY" | "WATCH" | "SKIP" | "UNKNOWN" | "NO DATA" | string | null | undefined

const VERDICT_CONFIG: Record<string, { color: string; label: string }> = {
  BUY: { color: "var(--color-buy)", label: "Buy" },
  WATCH: { color: "var(--color-watch)", label: "Watch" },
  SKIP: { color: "var(--color-skip)", label: "Skip" },
  UNKNOWN: { color: "var(--color-unknown)", label: "Unknown" },
  "NO DATA": { color: "var(--color-unknown)", label: "No data" },
}

export interface VerdictBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  verdict: VerdictValue
  /** Override display label (e.g. translated verdict word) */
  label?: string
  size?: "sm" | "md"
}

/**
 * VerdictBadge — always shows the verdict WORD. Never an empty pill or bare dot.
 *
 * The `label` prop accepts a translated verdict word (e.g. from verdictWord()).
 * Falls back to English display word when label is not provided.
 */
export const VerdictBadge = forwardRef<HTMLSpanElement, VerdictBadgeProps>(function VerdictBadge(
  { verdict, label, size = "sm", style, ...rest },
  ref,
) {
  const key = (verdict ?? "UNKNOWN").toString().toUpperCase()
  const config = VERDICT_CONFIG[key] ?? VERDICT_CONFIG.UNKNOWN
  const displayLabel = label ?? config.label

  return (
    <Badge
      ref={ref}
      color={config.color}
      size={size}
      style={style}
      // Accessibility: ensure assistive tech reads the verdict
      aria-label={`Verdict: ${displayLabel}`}
      data-verdict={key}
      {...rest}
    >
      {displayLabel}
    </Badge>
  )
})
