"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"
import { FREE_MODELS } from "@/lib/working-models"
import { ModelChips } from "@/components/tools/model-chips"

/**
 * IQ-002 FE — untracked / off-catalog is coverage, not a Starter wall.
 * Used when /api/verdict 402s a query we can already tell is not in the
 * catalogue, or when the API names unknown/untracked.
 *
 * C182: chips come from /api/public/buy-list (live top buys) rather than
 * the static FREE_MODELS sneaker list. A Supreme visitor now sees what
 * actually sells today, not four trainer names. Falls back to FREE_MODELS
 * if the fetch fails or returns nothing.
 */
export function CoverageMissCard({
  locale,
  query,
  onPick,
  disabled = false,
}: {
  locale: Locale
  query?: string
  onPick: (q: string) => void
  disabled?: boolean
}) {
  const t = copy[locale].checker
  const [examples, setExamples] = useState<readonly string[]>(FREE_MODELS)

  useEffect(() => {
    let cancelled = false
    fetch("/api/public/buy-list?limit=4")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return
        const items: string[] = (d?.items ?? [])
          .map((x: { brand?: string; model?: string; category?: string }) =>
            x.model ? `${x.brand} ${x.model}` : x.brand ?? "")
          .filter(Boolean)
        if (items.length >= 2) setExamples(items as string[])
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div data-testid="riq-coverage-miss">
      <div style={{ fontSize: 15, fontWeight: 600, color: "#eef1f7", marginBottom: 8 }}>
        {query?.trim() || t.coverageHeadline}
      </div>
      <p style={{ fontSize: 14, color: "#FF9F0A", lineHeight: 1.55, marginBottom: 8 }}>
        {t.coverageHeadline}
      </p>
      <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 12 }}>
        {t.coverageBody}
      </p>
      <ModelChips onPick={onPick} disabled={disabled} label={t.tryTheseInstead} examples={examples} />
      <div style={{ marginTop: 10 }}>
        <Link
          href={canonicalPath(locale, "/data")}
          style={{ fontSize: 12.5, color: "#8fa3c4", textDecoration: "none" }}
        >
          {t.coverageCatalogCta}
        </Link>
      </div>
    </div>
  )
}
