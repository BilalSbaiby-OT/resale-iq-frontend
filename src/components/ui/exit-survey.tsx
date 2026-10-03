"use client"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { exitSurveyCopy } from "@/lib/exit-survey-copy"
import {
  EXIT_FREE_TEXT_MAX,
  EXIT_SURVEY_REASONS,
  buildExitSurveyPayload,
  exitSurveySeen,
  markExitSurveySeen,
  type ExitSurveyContext,
  type ExitSurveyReason,
} from "@/lib/exit-survey"

/**
 * "What stopped you?" — one question, one tap, dismissible (O2).
 *
 * Mounted under the checkout-cancel return, the PAYWALL card and the
 * LIMIT_REACHED card. Shown at most once per visitor per context: the first
 * mount marks the context as seen in localStorage, so a reload, a second
 * check or another page never asks again. Answers go to POST
 * /api/feedback/exit; nothing is emailed.
 */
export function ExitSurvey({
  context,
  locale,
  query,
}: {
  context: ExitSurveyContext
  locale: Locale
  /** The item the visitor was looking at, when there is one. */
  query?: string
}) {
  const t = exitSurveyCopy[locale] ?? exitSurveyCopy.en
  const [visible, setVisible] = useState(false)
  const [other, setOther] = useState(false)
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  // A ref survives React StrictMode's simulated remount, so the "mark as seen"
  // write on the first pass cannot hide the card on the second.
  const decided = useRef(false)

  useEffect(() => {
    if (decided.current) return
    decided.current = true
    if (exitSurveySeen(window.localStorage, context)) return
    markExitSurveySeen(window.localStorage, context)
    setVisible(true)
  }, [context])

  if (!visible) return null

  const submit = (reason: ExitSurveyReason, freeText?: string) => {
    setDone(true)
    const body = buildExitSurveyPayload({ context, reason, freeText, query, locale })
    void fetch("/api/feedback/exit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch((e) => {
      // why: the visitor already tapped and saw the thank-you; a failed
      // survey write must never turn into an error on a checkout page. It is
      // logged so a broken endpoint is visible in the console.
      console.warn("[exit-survey] could not send answer", e)
    })
  }

  const box: React.CSSProperties = {
    marginTop: 16,
    padding: "12px 14px",
    border: "1px solid var(--color-hairline)",
    borderRadius: 12,
    background: "var(--color-surface)",
    position: "relative",
    textAlign: "left",
  }

  if (done) {
    return (
      <div data-testid="riq-exit-survey-thanks" role="status" style={{ ...box, fontSize: 13, color: "var(--color-text-secondary)" }}>
        {t.thanks}
      </div>
    )
  }

  const chip: React.CSSProperties = {
    minHeight: 36,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid var(--color-border-ui)",
    background: "transparent",
    color: "var(--color-text-primary)",
    fontSize: 13,
    cursor: "pointer",
  }

  return (
    <div data-testid="riq-exit-survey" data-context={context} role="group" aria-label={t.question} style={box}>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label={t.dismiss}
        data-testid="riq-exit-survey-dismiss"
        style={{ position: "absolute", top: 6, right: 6, width: 32, height: 32, border: 0, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <X size={14} aria-hidden />
      </button>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10, paddingRight: 28 }}>
        {t.question}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {EXIT_SURVEY_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            data-testid={`riq-exit-survey-${r}`}
            aria-pressed={r === "other" ? other : undefined}
            onClick={() => (r === "other" ? setOther(true) : submit(r))}
            style={chip}
          >
            {t.reasons[r]}
          </button>
        ))}
      </div>
      {other && (
        <div
          style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "stretch" }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={EXIT_FREE_TEXT_MAX}
            placeholder={t.otherPlaceholder}
            aria-label={t.reasons.other}
            data-testid="riq-exit-survey-text"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit("other", text) } }}
            style={{ flex: 1, minWidth: 0, minHeight: 36, padding: "6px 10px", fontSize: 16, borderRadius: 8, border: "1px solid var(--color-border-ui)", background: "transparent", color: "var(--color-text-primary)" }}
          />
          <button type="button" onClick={() => submit("other", text)} data-testid="riq-exit-survey-send" style={{ ...chip, borderRadius: 8, fontWeight: 600 }}>
            {t.send}
          </button>
        </div>
      )}
    </div>
  )
}
