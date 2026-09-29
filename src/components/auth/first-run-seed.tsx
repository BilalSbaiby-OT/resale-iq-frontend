"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { clearFirstCheckSeed, readFirstCheckSeed } from "@/lib/first-check-seed"

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
 * always a FREE_MODELS string, so the click returns a priced verdict.
 * Dashboard visitor count before this mount: 15 unique humans / 7d.
 */
export function FirstRunSeed() {
  const pathname = usePathname()
  const [query, setQuery] = useState<string | null>(null)

  const onDashboard = pathname === "/dashboard" || pathname.endsWith("/dashboard")

  useEffect(() => {
    if (!onDashboard) return
    setQuery(readFirstCheckSeed())
  }, [onDashboard])

  if (!onDashboard || !query) return null

  const href = `/verdict?q=${encodeURIComponent(query)}&src=signup_seed`

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
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-on-graphite)" }}>
          Your first check is ready
        </div>
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
      >
        See the verdict →
      </Link>
      <button
        type="button"
        onClick={() => { clearFirstCheckSeed(); setQuery(null) }}
        style={{
          background: "none",
          border: "none",
          padding: "8px 4px",
          fontSize: 13,
          color: "var(--color-graphite-muted)",
          cursor: "pointer",
        }}
      >
        Not now
      </button>
    </div>
  )
}
