"use client"

/**
 * "Continue with Google" button — Apple-grade, accessibility-correct, and
 * hidden when the backend hasn't been given OAuth credentials yet.
 *
 * Design notes (apple-design skill):
 *  • 44×44 px minimum tap target (WCAG 2.5.5 + HIG).
 *  • :active scale press state ("a button without a press state feels unresponsive").
 *  • Official Google G icon (SVG inline — no external CDN request).
 *  • Sentence-case label per HIG.
 *  • Semantic tokens (`var(--color-*)`) — no raw hex except for the Google-brand white
 *    button background which is specified by Google's branding guidelines.
 *  • The divider uses CSS grid, not absolute positioning, so it survives zoom.
 */

import { useEffect, useState } from "react"
import { getGoogleOAuthStatus } from "@/lib/google-oauth"

export function GoogleSignInButton({
  label = "Continue with Google",
}: {
  label?: string
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    getGoogleOAuthStatus().then(s => setEnabled(s.enabled))
  }, [])

  // null  → still loading; hide to avoid layout shift
  // false → creds absent; hide entirely (never a broken button)
  if (!enabled) return null

  return (
    <a
      href="/auth/google/login"
      role="button"
      aria-label="Continue with Google"
      className={[
        // Layout
        "flex items-center justify-center gap-2.5",
        "w-full min-h-[44px] px-4 py-2.5 rounded-lg",
        // Colours — white background is Google branding spec
        "bg-white border border-[var(--color-border-2)]",
        "text-[#1f1f1f] font-medium text-[14px]",
        // Interaction
        "cursor-pointer select-none",
        "hover:bg-gray-50 active:scale-[0.97]",
        "transition-all duration-200",
        // Focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-buy)] focus-visible:ring-offset-1",
      ].join(" ")}
    >
      {/* Google G icon — from https://developers.google.com/identity/branding-guidelines */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>{label}</span>
    </a>
  )
}

/** Horizontal rule between form and Google button.
 *  Built with CSS grid so it survives text-zoom and RTL. */
export function AuthDivider({ text = "or" }: { text?: string }) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 my-1"
      role="separator"
      aria-hidden="true"
    >
      <div className="h-px bg-[var(--color-border-2)]" />
      <span className="text-[11px] text-[var(--color-text-muted)] px-1 select-none">
        {text}
      </span>
      <div className="h-px bg-[var(--color-border-2)]" />
    </div>
  )
}
