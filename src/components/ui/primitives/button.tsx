"use client"
/**
 * Button — Use for all interactive call-to-action controls across the app.
 *
 * Variants: primary (buy-green), secondary (surface-elevated + hairline border),
 * ghost (transparent + hairline on hover), danger (skip-red).
 *
 * Sizes: sm (36px logical height), md (44px DEFAULT), lg (52px).
 * ALL sizes have a minimum 44×44px touch-target hit area via padding/pseudo, per
 * Apple HIG and WCAG 2.5.5. The sm variant pads its hit region invisibly.
 *
 * Press state: scale(0.97) with cubic-bezier(0.25,1,0.5,1) 200ms.
 * Respects prefers-reduced-motion (motion suppressed).
 *
 * asChild / as prop: pass `as={Link}` to render a Next.js <Link> without losing styles.
 */

import React, { forwardRef, type ElementType, type ComponentPropsWithoutRef } from "react"

// ── Variant & size maps ──────────────────────────────────────────────────────

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "var(--color-buy)",
    color: "var(--color-on-buy)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--color-surface-elevated)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--color-skip)",
    color: "#ffffff",
    border: "1px solid transparent",
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    height: 36,
    minHeight: 36,
    padding: "0 var(--space-2)",
    fontSize: "var(--text-meta)",
    // Hit region extended to 44px via negative margin trick (inline; see container)
  },
  md: {
    height: 44,
    minHeight: 44,
    padding: "0 var(--space-3)",
    fontSize: "var(--text-body-app)",
  },
  lg: {
    height: 52,
    minHeight: 52,
    padding: "0 var(--space-4)",
    fontSize: "var(--text-body-app)",
  },
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

type PolymorphicProps<T extends ElementType = "button"> = {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Size preset. md (44px) is the default. */
  size?: ButtonSize
  /** Show spinner and disable interaction */
  loading?: boolean
  /** Render as a different element or component (e.g. Next Link) */
  as?: T
  fullWidth?: boolean
} & Omit<ComponentPropsWithoutRef<T>, "as">

// ── Component ────────────────────────────────────────────────────────────────

// Internal style injected once
const STYLE_ID = "riq-button-styles"

function ensureButtonStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement("style")
  el.id = STYLE_ID
  el.textContent = `
    .riq-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: var(--radius-control);
      font-family: var(--font-sans);
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: opacity var(--motion-fast) var(--motion-ease),
                  transform var(--motion-base) cubic-bezier(0.25,1,0.5,1),
                  background var(--motion-fast) var(--motion-ease),
                  border-color var(--motion-fast) var(--motion-ease);
      -webkit-tap-highlight-color: transparent;
      position: relative;
      flex-shrink: 0;
    }
    .riq-btn:focus-visible {
      outline: 2px solid var(--color-blue);
      outline-offset: 2px;
    }
    .riq-btn:active:not(:disabled):not([data-loading="true"]) {
      transform: scale(0.97);
    }
    @media (prefers-reduced-motion: reduce) {
      .riq-btn { transition: none; }
      .riq-btn:active:not(:disabled):not([data-loading="true"]) { transform: none; }
    }
    .riq-btn:disabled, .riq-btn[data-loading="true"] {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }
    .riq-btn--ghost:hover:not(:disabled) {
      border-color: var(--color-border) !important;
      background: var(--color-surface-elevated) !important;
    }
    .riq-btn--secondary:hover:not(:disabled) {
      border-color: var(--color-border-2) !important;
    }
    /* sm: extend hit region to 44px without changing visual size */
    .riq-btn--sm::before {
      content: "";
      position: absolute;
      inset: -4px;
    }
  `
  document.head.appendChild(el)
}

export const Button = forwardRef(function Button<T extends ElementType = "button">(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    as,
    fullWidth,
    children,
    style,
    className,
    disabled,
    ...rest
  }: PolymorphicProps<T>,
  ref: React.Ref<Element>,
) {
  if (typeof window !== "undefined") ensureButtonStyles()

  const Tag = (as ?? "button") as ElementType

  const classes = [
    "riq-btn",
    `riq-btn--${variant}`,
    `riq-btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const resolvedStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    width: fullWidth ? "100%" : undefined,
    ...style,
  }

  const tagProps: Record<string, unknown> = {
    ref,
    className: classes,
    style: resolvedStyle,
    "data-loading": loading ? "true" : undefined,
    ...rest,
  }

  // Only add disabled/aria-disabled for actual button/a elements
  if (Tag === "button") {
    tagProps.disabled = disabled || loading
    tagProps.type = (rest as { type?: string }).type ?? "button"
  } else {
    tagProps["aria-disabled"] = disabled || loading || undefined
  }

  return (
    <Tag {...tagProps}>
      {loading && (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            animation: "riq-spin 0.7s linear infinite",
            flexShrink: 0,
          }}
        >
          <style>{`@keyframes riq-spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="25" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </Tag>
  )
}) as <T extends ElementType = "button">(
  props: PolymorphicProps<T> & { ref?: React.Ref<Element> },
) => React.ReactElement | null
