"use client"
/**
 * Input family — Use for all form controls in the app.
 *
 * Components: Input, Select, Textarea, FieldLabel, FieldError, FieldHint
 *
 * Critical rules enforced here:
 *  - 44px min height on all controls (WCAG 2.5.5 tap target)
 *  - 16px minimum font size (iOS Safari zooms the page on focus below 16px — real bug)
 *  - Visible focus ring using --color-blue
 *  - Error state wired to aria-invalid + aria-describedby
 *
 * Usage pattern:
 *   <FieldLabel htmlFor="email">Email address</FieldLabel>
 *   <Input id="email" type="email" aria-describedby="email-error" invalid={!!error} />
 *   <FieldError id="email-error">{error}</FieldError>
 */

import React, { forwardRef } from "react"

// ── Shared base styles ───────────────────────────────────────────────────────

const baseControlStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "0 var(--space-2)",
  fontSize: "var(--text-body-app)", // 16px — never below, iOS zooms on focus
  fontFamily: "var(--font-sans)",
  color: "var(--color-text-primary)",
  background: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-control)",
  outline: "none",
  transition: "border-color 150ms ease, box-shadow 150ms ease",
  WebkitAppearance: "none",
  appearance: "none",
  boxSizing: "border-box",
}

// Focus styles injected once
const STYLE_ID = "riq-input-styles"
function ensureInputStyles() {
  if (typeof document === "undefined") return
  if (document.getElementById(STYLE_ID)) return
  const el = document.createElement("style")
  el.id = STYLE_ID
  el.textContent = `
    .riq-control:focus {
      border-color: var(--color-blue);
      box-shadow: 0 0 0 3px rgba(10,132,255,0.22);
    }
    .riq-control[aria-invalid="true"] {
      border-color: var(--color-skip);
      box-shadow: 0 0 0 3px rgba(255,69,58,0.18);
    }
    .riq-control::placeholder {
      color: var(--color-text-muted);
    }
    .riq-control:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .riq-select {
      padding-right: 36px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238fa3c4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
    }
    .riq-select option {
      background: var(--color-surface-elevated);
      color: var(--color-text-primary);
    }
  `
  document.head.appendChild(el)
}

// ── Input ────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Triggers error styling; pair with aria-describedby pointing to FieldError */
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, style, ...rest },
  ref,
) {
  if (typeof window !== "undefined") ensureInputStyles()
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={["riq-control", className].filter(Boolean).join(" ")}
      style={{ ...baseControlStyle, ...style }}
      {...rest}
    />
  )
})

// ── Select ───────────────────────────────────────────────────────────────────

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, style, ...rest },
  ref,
) {
  if (typeof window !== "undefined") ensureInputStyles()
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={["riq-control", "riq-select", className].filter(Boolean).join(" ")}
      style={{ ...baseControlStyle, cursor: "pointer", ...style }}
      {...rest}
    />
  )
})

// ── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, style, ...rest },
  ref,
) {
  if (typeof window !== "undefined") ensureInputStyles()
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={["riq-control", className].filter(Boolean).join(" ")}
      style={{
        ...baseControlStyle,
        padding: "var(--space-1) var(--space-2)",
        minHeight: 88,
        resize: "vertical",
        lineHeight: 1.55,
        ...style,
      }}
      {...rest}
    />
  )
})

// ── FieldLabel ───────────────────────────────────────────────────────────────

/** Use above every form control. Sentence case. */
export const FieldLabel = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  function FieldLabel({ children, style, ...rest }, ref) {
    return (
      <label
        ref={ref}
        style={{
          display: "block",
          fontSize: "var(--text-body-app)",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: 6,
          ...style,
        }}
        {...rest}
      >
        {children}
      </label>
    )
  },
)

// ── FieldError ───────────────────────────────────────────────────────────────

/** Renders validation error text. Give it an id and point the control's aria-describedby to it. */
export const FieldError = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function FieldError({ children, style, ...rest }, ref) {
    if (!children) return null
    return (
      <p
        ref={ref}
        role="alert"
        style={{
          fontSize: "var(--text-meta)",
          color: "var(--color-skip)",
          marginTop: 5,
          lineHeight: 1.4,
          ...style,
        }}
        {...rest}
      >
        {children}
      </p>
    )
  },
)

// ── FieldHint ────────────────────────────────────────────────────────────────

/** Supplementary hint text below a control. */
export const FieldHint = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  function FieldHint({ children, style, ...rest }, ref) {
    return (
      <p
        ref={ref}
        style={{
          fontSize: "var(--text-meta)",
          color: "var(--color-text-muted)",
          marginTop: 5,
          lineHeight: 1.4,
          ...style,
        }}
        {...rest}
      >
        {children}
      </p>
    )
  },
)
