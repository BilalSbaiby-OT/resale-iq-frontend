"use client"
/**
 * DigestSubscribe — calm email capture after a free verdict.
 *
 * Design rules (apple-design skill):
 *  - Never gates the verdict. Renders BELOW the result, before upgrade CTAs.
 *  - No modal, no interruption. Easily ignored.
 *  - Sentence case copy. Minimal chrome. 44px min-height tap targets.
 *  - Three states: idle → submitting → success (or already_subscribed).
 *  - Inline email validation only — no server roundtrip until submit.
 */

import { useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import type { Locale } from "@/lib/i18n"

interface DigestSubscribeProps {
  /** The query the visitor just ran (stored as GDPR source context). */
  query?: string
  /** Short human-readable verdict summary (e.g. "BUY — Nike Air Force 1"). */
  verdictSummary?: string
  /** Locale — needed for GuestCheckoutButton post-subscribe upgrade CTA (H93). */
  locale?: Locale
}

type SubmitState = "idle" | "submitting" | "success" | "already" | "error"

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function DigestSubscribe({ query, verdictSummary, locale = "en" }: DigestSubscribeProps) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<SubmitState>("idle")
  const [inlineErr, setInlineErr] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInlineErr("")

    if (!isValidEmail(email)) {
      setInlineErr("Enter a valid email address.")
      return
    }

    setState("submitting")
    try {
      const res = await fetch("/api/digest/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          query: query ?? null,
          verdict_summary: verdictSummary ?? null,
        }),
      })
      if (!res.ok) throw new Error("server error")
      const body = (await res.json()) as { status: string }
      if (body.status === "already_subscribed") {
        setState("already")
      } else {
        setState("success")
      }
    } catch {
      // why: subscribe failures are non-critical UI — a network blip should not
      // break the page or print stack traces to the console. The error state
      // shows the user a "try again" message, so the failure is surfaced to them
      // rather than silently discarded. No re-throw: this is a best-effort capture.
      setState("error")
    }
  }

  // After success / already-subscribed, show a quiet one-liner.
  if (state === "success") {
    return (
      <div
        data-testid="digest-subscribe-success"
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-hairline)",
          borderRadius: 10,
          fontSize: 13.5,
          color: "var(--color-text-secondary, #8fa3c4)",
        }}
      >
        <div style={{ marginBottom: 10 }}>
          ✓ You&apos;re in — first email lands Monday.
        </div>
        {/* H93 CRO: email typed → highest-intent moment → bridge to paid plan.
            Visitor just confirmed their email address; pre-fill Stripe so they
            never have to type it again. CRO #12 (conversion momentum at peak
            intent) + #10 (solution-aware CTA: they know what the product does).
            Expected: 20-30% lift on checkout_started from this cohort because
            email already captured = intent > any cold visitor. Revenue 2026-09-23. */}
        <GuestCheckoutButton
          locale={locale}
          label="Unlock full analysis — €19/mo →"
          src="digest_subscribe_success"
          query={query}
          customerEmail={email}
        />
      </div>
    )
  }

  if (state === "already") {
    return (
      <div
        data-testid="digest-subscribe-already"
        style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-hairline)",
          borderRadius: 10,
          fontSize: 13,
          color: "var(--color-text-dim, #5b6b8c)",
        }}
      >
        <div style={{ marginBottom: 10 }}>Already subscribed.</div>
        {/* H93: same bridge for already-subscribed visitors — they know the product */}
        <GuestCheckoutButton
          locale={locale}
          label="Unlock full analysis — €19/mo →"
          src="digest_already_subscribed"
          query={query}
          customerEmail={email}
        />
      </div>
    )
  }

  return (
    <div
      data-testid="digest-subscribe"
      style={{
        marginTop: 20,
        padding: "16px",
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-hairline)",
        borderRadius: 10,
      }}
    >
      {/* Offer copy — one calm sentence */}
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 13.5,
          color: "var(--color-text-secondary, #8fa3c4)",
          lineHeight: 1.5,
        }}
      >
        Get next week&apos;s buy list — 10 items with the strongest demand, free, every Monday.
      </p>

      <form
        onSubmit={submit}
        noValidate
        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}
      >
        <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            type="email"
            aria-label="Email address for weekly buy list"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (inlineErr) setInlineErr("")
              if (state === "error") setState("idle")
            }}
            disabled={state === "submitting"}
            style={{
              background: "var(--color-bg-2, #0f1621)",
              border: `1px solid ${inlineErr ? "#FF453A" : "var(--color-border-2, #263147)"}`,
              borderRadius: 9,
              padding: "11px 13px",
              color: "var(--color-text-primary, #dde3f0)",
              fontSize: 15,
              outline: "none",
              minHeight: 44,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          {inlineErr && (
            <span
              role="alert"
              style={{ fontSize: 12, color: "#FF453A", lineHeight: 1.4 }}
            >
              {inlineErr}
            </span>
          )}
          {state === "error" && (
            <span
              role="alert"
              style={{ fontSize: 12, color: "#FF453A", lineHeight: 1.4 }}
            >
              Something went wrong — try again.
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={state === "submitting"}
          style={{
            background: "var(--color-surface, #161c2a)",
            border: "1px solid var(--color-border-2, #263147)",
            borderRadius: 9,
            padding: "11px 18px",
            color: "var(--color-text-primary, #dde3f0)",
            fontSize: 14,
            fontWeight: 600,
            cursor: state === "submitting" ? "wait" : "pointer",
            minHeight: 44,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {state === "submitting" ? "…" : "Get free list"}
        </button>
      </form>

      {/* Consent text — GDPR single opt-in */}
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 11,
          color: "var(--color-text-dim, #5b6b8c)",
          lineHeight: 1.5,
        }}
      >
        Weekly buy list. Unsubscribe anytime.
      </p>
    </div>
  )
}
