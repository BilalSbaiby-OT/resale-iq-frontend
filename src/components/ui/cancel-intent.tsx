"use client"
import { useState } from "react"
import type { Locale } from "@/lib/i18n"
import { cancelIntentCopy, CANCEL_INTENT_REASONS, type CancelIntentReason } from "@/lib/cancel-intent-copy"
import { EXIT_FREE_TEXT_MAX, buildExitSurveyPayload } from "@/lib/exit-survey"
import { getToken } from "@/lib/utils"

/**
 * "Thinking of cancelling?" — shown only when the customer clicks that link
 * next to "Manage subscription". One question, reason chips, an optional
 * comment box, then on to the Stripe portal (where the cancel itself happens).
 *
 * It never blocks: "Continue" always goes on to the portal, the answer is a
 * fire-and-forget POST /api/feedback/exit (context cancel_intent, keepalive so
 * it survives the navigation), and nothing is required. Nothing is emailed.
 */
export function CancelIntent({
  locale,
  onContinue,
}: {
  locale: Locale
  /** Opens the Stripe billing portal (the page's existing handler). */
  onContinue: () => Promise<void> | void
}) {
  const t = cancelIntentCopy[locale] ?? cancelIntentCopy.en
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<CancelIntentReason | null>(null)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  const cont = async () => {
    if (busy) return
    setBusy(true)
    const freeText = text.trim()
    if (reason || freeText) {
      const body = buildExitSurveyPayload({ context: "cancel_intent", reason: reason ?? "other", freeText, locale })
      const token = getToken()
      void fetch("/api/feedback/exit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch((e) => {
        // why: cancelling must never fail because a survey write did.
        console.warn("[cancel-intent] could not send answer", e)
      })
    }
    try {
      await onContinue()
    } finally {
      setBusy(false)
    }
  }

  const chip = (on: boolean): React.CSSProperties => ({
    minHeight: 36,
    padding: "7px 12px",
    borderRadius: 999,
    border: `1px solid ${on ? "var(--color-text-primary)" : "var(--color-border-ui)"}`,
    background: on ? "var(--color-surface)" : "transparent",
    color: "var(--color-text-primary)",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: on ? 600 : 400,
  })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="riq-cancel-intent-link"
        className="block mx-auto mt-2 py-2 text-[12px] text-[var(--color-text-secondary)] underline cursor-pointer bg-transparent border-0"
      >
        {t.link}
      </button>
    )
  }

  return (
    <div
      data-testid="riq-cancel-intent"
      role="group"
      aria-label={t.question}
      style={{ marginTop: 12, padding: "14px 16px", border: "1px solid var(--color-hairline)", borderRadius: 12, background: "var(--color-surface)", textAlign: "left" }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>{t.question}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CANCEL_INTENT_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            data-testid={`riq-cancel-intent-${r}`}
            aria-pressed={reason === r}
            onClick={() => setReason(reason === r ? null : r)}
            style={chip(reason === r)}
          >
            {t.reasons[r]}
          </button>
        ))}
      </div>
      <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", margin: "12px 0 6px" }} htmlFor="riq-cancel-intent-text">
        {t.textLabel}
      </label>
      <textarea
        id="riq-cancel-intent-text"
        data-testid="riq-cancel-intent-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={EXIT_FREE_TEXT_MAX}
        rows={3}
        placeholder={t.textPlaceholder}
        style={{ width: "100%", padding: "8px 10px", fontSize: 16, borderRadius: 8, border: "1px solid var(--color-border-ui)", background: "transparent", color: "var(--color-text-primary)", resize: "vertical" }}
      />
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>{t.note}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={cont}
          disabled={busy}
          data-testid="riq-cancel-intent-continue"
          style={{ ...chip(false), borderRadius: 8, fontWeight: 600, opacity: busy ? 0.6 : 1 }}
        >
          {busy ? t.contBusy : t.cont}
        </button>
        <button type="button" onClick={() => setOpen(false)} data-testid="riq-cancel-intent-back" style={{ ...chip(false), borderRadius: 8, border: 0 }}>
          {t.back}
        </button>
      </div>
    </div>
  )
}
