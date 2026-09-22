/**
 * PageHeader — Consistent page-top rhythm for all gated/app routes.
 *
 * Use at the top of every authed page (dashboard, deals, trends, watchlist,
 * portfolio, settings). Provides title + optional description + optional
 * right-side actions slot.
 *
 * Title uses --text-h1-app (30px) for app pages. Sentence case.
 * No gated route should roll its own H1 + subtitle combo — use this.
 */

import React, { forwardRef } from "react"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Page title — sentence case */
  title: string
  /** Optional sub-copy below the title */
  description?: string
  /** Right-aligned slot for buttons/actions */
  actions?: React.ReactNode
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, description, actions, style, ...rest },
  ref,
) {
  return (
    <header
      ref={ref}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        marginBottom: "var(--space-4)",
        flexWrap: "wrap",
        ...style,
      }}
      {...rest}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: "var(--text-h1-app)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "var(--tracking-h1)",
            lineHeight: "var(--leading-h1)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: "var(--text-body-app)",
              color: "var(--color-text-secondary)",
              marginTop: 6,
              lineHeight: 1.55,
              maxWidth: "var(--measure-body)",
              margin: "6px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            flexShrink: 0,
          }}
          aria-label="Page actions"
        >
          {actions}
        </div>
      )}
    </header>
  )
})
