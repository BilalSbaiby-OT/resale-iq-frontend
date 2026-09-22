/**
 * Card — Structured content container on the dark surface.
 *
 * Use for grouping related content with a visual boundary.
 * Composition: <Card> → <CardHeader> → <CardTitle> + <CardBody> + <CardFooter>
 *
 * Variants:
 *  - default: var(--color-surface) background (the standard app surface)
 *  - elevated: var(--color-surface-elevated) (lighter — never white; for nested emphasis)
 *
 * Concentric radius: nested elements use radius = outer_radius - padding
 * (14px card → 8px inner elements at 16px padding).
 */

import React, { forwardRef } from "react"

// ── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** elevated uses --color-surface-elevated (lighter, not white) */
  variant?: "default" | "elevated"
  /** Remove default padding */
  noPadding?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", noPadding = false, children, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        background:
          variant === "elevated"
            ? "var(--color-surface-elevated)"
            : "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: noPadding ? 0 : "var(--space-card-pad)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
})

// ── CardHeader ───────────────────────────────────────────────────────────────

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ children, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          marginBottom: "var(--space-2)",
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

// ── CardTitle ────────────────────────────────────────────────────────────────

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ children, style, ...rest }, ref) {
    return (
      <h3
        ref={ref}
        style={{
          fontSize: "var(--text-title)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.015em",
          margin: 0,
          ...style,
        }}
        {...rest}
      >
        {children}
      </h3>
    )
  },
)

// ── CardBody ─────────────────────────────────────────────────────────────────

export const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ children, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{ color: "var(--color-text-body)", lineHeight: 1.6, ...style }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

// ── CardFooter ───────────────────────────────────────────────────────────────

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ children, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-1)",
          marginTop: "var(--space-2)",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--color-border)",
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)
