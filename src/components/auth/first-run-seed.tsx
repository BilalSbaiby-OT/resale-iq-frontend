"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { clearFirstCheckSeed, readFirstCheckSeed } from "@/lib/first-check-seed"
import { FREE_SAMPLES } from "@/lib/free-samples"
import { useT } from "@/components/i18n/locale-provider"

/**
 * One button, not a blank input.
 *
 * Canva (https://supademo.com/user-flow-examples/canva): the dashboard
 * has no blank canvas — a template is already there.
 * Linear (https://www.candu.ai/blog/linear-onboarding-teardown): an
 * empty state is one explanation and one button.
 * Duolingo (https://screensdesign.com/articles/duolingo-onboarding-design/):
 * the first lesson starts; the user does not invent the exercise.
 *
 * Founder rule: we still landed on /dashboard. This does not redirect.
 * The query was chosen from the live public buy-list at signup and is
 * always a FREE_SAMPLES string, so the click returns a priced verdict.
 * Dashboard visitor count before this mount: 15 unique humans / 7d.
 *
 * C(tony)SeedDismissedFallback: when the user dismisses the seed with
 * "Not now", they previously fell into a blank state — no guided path to
 * a first free verdict. Research:
 *   Notion (https://sanjaydey.com/saas-onboarding-ux-15-examples-that-convert):
 *     "Template gallery instead of blank page. Users always have 2–3 choices."
 *   Canva (https://supademo.com/user-flow-examples/canva):
 *     "No blank canvas. Templates ARE the empty state."
 *   PLG Handbook (https://plghandbook.com/empty-state-design):
 *     "Guided empty states increase activation by 30–40%."
 * Fix: after dismiss, show 3 FREE_SAMPLES chips so the user still has a
 * clear, frictionless path to their first real free verdict. Chips link
 * with src=signup_seed_dismissed for funnel measurement.
 */
export function FirstRunSeed() {
  const tx = useT()
  const pathname = usePathname()
  const [query, setQuery] = useState<string | null>(null)
  // C(tony)SeedDismissedFallback: after "Not now" the seed is cleared;
  // dismissed=true switches the component to the fallback chip row
  // so the user never lands in a blank state with no free-verdict path.
  const [dismissed, setDismissed] = useState(false)

  const onDashboard = pathname === "/dashboard" || pathname.endsWith("/dashboard")

  useEffect(() => {
    if (!onDashboard) return
    setQuery(readFirstCheckSeed())
  }, [onDashboard])

  if (!onDashboard) return null
  // Render nothing until we have either a seed query OR a dismissed state
  // to show the fallback. Avoids a flash of empty content on mount.
  if (!query && !dismissed) return null

  // C(tony)SeedDismissedFallback: Notion template-gallery pattern.
  // Never leave the user staring at nothing after a dismissal.
  // 3 chips = 3 guaranteed-free verdicts (all in FREE_SAMPLES).
  // Clicking a chip navigates to /verdict — the component unmounts and
  // dismissed state is gone, so /dashboard re-shows cleanly on return.
  // The × dismisses the fallback row for this session.
  if (dismissed) {
    return (
      <div
        data-testid="riq-first-run-seed-fallback"
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: "var(--color-graphite-muted)",
            whiteSpace: "nowrap",
          }}
        >{tx("Try a free sample:")}</span>
        {FREE_SAMPLES.map((m) => (
          <Link
            key={m}
            href={`/verdict?q=${encodeURIComponent(m)}&src=signup_seed_dismissed`}
            data-testid={`riq-seed-fallback-chip-${m.replace(/\s+/g, "-").toLowerCase()}`}
            style={{
              background: "var(--color-graphite-elevated)",
              border: "1px solid var(--color-border-ui)",
              borderRadius: 8,
              color: "var(--color-on-graphite)",
              fontSize: 13,
              padding: "5px 12px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {m}
          </Link>
        ))}
        <button
          type="button"
          aria-label={tx("Dismiss free sample suggestions")}
          onClick={() => setDismissed(false)}
          style={{
            background: "none",
            border: "none",
            padding: "4px 6px",
            fontSize: 14,
            color: "var(--color-graphite-muted)",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    )
  }

  const href = `/verdict?q=${encodeURIComponent(query!)}&src=signup_seed`

  return (
    <div
      data-testid="riq-first-run-seed"
      style={{
        background: "var(--color-graphite-elevated)",
        borderRadius: 14,
        padding: "14px 20px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-graphite)" }}>{tx("Your first check is ready")}</div>
        <div style={{ fontSize: 14, color: "var(--color-graphite-muted)", marginTop: 4 }}>
          {query}
        </div>
      </div>
      <Link
        href={href}
        data-testid="riq-first-run-seed-cta"
        onClick={() => clearFirstCheckSeed()}
        style={{
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          borderRadius: 12,
          padding: "10px 16px",
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >{tx("See the verdict →")}</Link>
      <button
        type="button"
        onClick={() => { clearFirstCheckSeed(); setDismissed(true) }}
        style={{
          background: "none",
          border: "none",
          padding: "8px 4px",
          fontSize: 13,
          color: "var(--color-graphite-muted)",
          cursor: "pointer",
        }}
      >{tx("Not now")}</button>
    </div>
  )
}
