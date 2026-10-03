"use client"
import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { eur } from "@/lib/utils"
import { alsoOnOtherSitesPct, compareFigures, COMPARE_EXAMPLES, type CompareSuggestion } from "@/lib/compare-stats"
import type { PriceCompareResult, SearchItem } from "@/types"
import { useT } from "@/components/i18n/locale-provider"

// Fixed site order: never ranked by price (no "cheapest"/"priciest" framing).
const SITE_ORDER = ["es", "fr", "de", "it", "pt"]

/**
 * The pooled card + per-site rows. Shared by the Pro page and the non-Pro
 * "Example" block so both render byte-for-byte the same card/rows.
 * `expandable` = rows open to the listing grid (Pro); the example keeps rows closed.
 */
export function CompareResultsView({ result, expandable = true }: { result: PriceCompareResult; expandable?: boolean }) {
  const tx = useT()
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)
  const sorted = Object.entries(result.by_country ?? {}).sort((a, b) => SITE_ORDER.indexOf(a[0]) - SITE_ORDER.indexOf(b[0]))
  return (
    <>
      {/* Headline: the pooled median over every distinct listing (each counted once). */}
      {result.pooled && (() => {
        const f = compareFigures(result.pooled)
        const share = alsoOnOtherSitesPct(result.pooled.share_also_on_other_sites)
        return (
          <div data-testid="compare-pooled" className="mb-4 rounded-xl p-5 border" style={{ background: "var(--color-bg-3)", borderColor: "var(--color-hairline)" }}>
            <div className="text-[12px]" style={{ color: "var(--color-graphite-muted)" }}>{tx("Typical asking price across the Vinted sites we track")}</div>
            {f.kind === "ok" ? (
              <>
                <div data-testid="compare-pooled-median" className="text-[28px] font-bold mt-1" style={{ color: "var(--color-on-graphite)" }}>{eur(f.median)}</div>
                {f.low !== null && f.high !== null && (
                  <div className="text-[13px] mt-0.5" style={{ color: "var(--color-graphite-muted)" }}>{tx("Typical range {0}", [`${eur(f.low)}–${eur(f.high)}`])}</div>
                )}
              </>
            ) : (
              <div data-testid="compare-pooled-insufficient" className="text-[14px] mt-1" style={{ color: "var(--color-graphite-muted)" }}>{tx("Not enough recent listings for a typical price")}</div>
            )}
            {share !== null && (
              <div className="text-[12px] mt-2" style={{ color: "var(--color-graphite-muted)" }}>{tx("{0}% of these listings also appear on other Vinted sites", [share])}</div>
            )}
          </div>
        )
      })()}

      {/* Per-site rows: where each listing was FIRST seen, not seller country */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-2">
          {sorted.map(([tld, stats]) => {
            const expanded = expandable && expandedCountry === tld
            const f = compareFigures(stats)
            const share = f.kind === "ok" ? alsoOnOtherSitesPct(stats.share_also_on_other_sites) : null
            return (
              <div key={tld} className="bg-[var(--color-bg-3)] border rounded-xl overflow-hidden" style={{ borderColor: "var(--color-hairline)" }}>
                <button onClick={() => expandable && setExpandedCountry(expanded ? null : tld)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold" style={{ color: "var(--color-on-graphite)" }}>{tx("seen on {0}", [`vinted.${tld}`])}</span>
                    </div>
                    <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{f.kind === "ok" ? tx("Median asking price among listings seen on this site") : tx("Not enough recent listings")}{share !== null && ` · ${tx("{0}% also on other Vinted sites", [share])}`}</div>
                  </div>
                  {f.kind === "ok" && (
                    <div className="text-right">
                      <div className="text-[16px] font-bold" style={{ color: "var(--color-on-graphite)" }}>{eur(f.median)}</div>
                      {f.low !== null && f.high !== null && (
                        <div className="text-[12px] text-[var(--color-text-secondary)]">{eur(f.low)} – {eur(f.high)}</div>
                      )}
                    </div>
                  )}
                </button>
                {expanded && stats.items && (
                  <div className="border-t border-[var(--color-border)] p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stats.items.map((item: SearchItem) => (
                      <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                        className="flex gap-3 p-2.5 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors group" style={{ background: "var(--color-bg)" }}>
                        {item.photo && (
                          <img src={item.photo} alt="" className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] line-clamp-1" style={{ color: "var(--color-graphite-muted)" }}>{item.title}</div>
                          <div className="text-[14px] font-bold mt-0.5" style={{ color: "var(--color-accent)" }}>{eur(item.price_eur)}</div>
                          <div className="text-[12px] text-[var(--color-text-secondary)]">{item.size || "—"}{item.seller?.login ? ` · ${item.seller.login}` : ""}</div>
                        </div>
                        <ExternalLink size={12} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-graphite-muted)" }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/** Clickable suggestion chips: label shown, `query` run. */
export function CompareChips({ suggestions, onPick, testId = "compare-chips" }: { suggestions: CompareSuggestion[]; onPick: (query: string) => void; testId?: string }) {
  if (suggestions.length === 0) return null
  return (
    <div data-testid={testId} className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((s) => (
        <button key={s.query} type="button" data-testid="compare-chip" onClick={() => onPick(s.query)}
          className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-colors"
          style={{ background: "rgba(52,199,89,.12)", border: "1px solid rgba(52,199,89,.35)", color: "var(--color-accent)" }}>
          {s.label}
        </button>
      ))}
    </div>
  )
}

/** "Try a brand + model" line, an optional reason line and chips. Falls back to COMPARE_EXAMPLES. */
export function CompareNudge({ why, suggestions, onPick }: { why?: "generic" | "nodata"; suggestions: CompareSuggestion[]; onPick: (query: string) => void }) {
  const tx = useT()
  const chips = suggestions.length > 0 ? suggestions : [...COMPARE_EXAMPLES]
  return (
    <div data-testid="compare-nudge" className="text-[13px] bg-[var(--color-graphite-elevated)] border border-[var(--color-hairline)] rounded-xl p-5" style={{ color: "var(--color-graphite-muted)" }}>
      {why && <div className="mb-1">{why === "generic" ? tx("That search is too broad for a useful comparison.") : tx("Not enough recent listings for that search yet.")}</div>}
      <div style={{ color: "var(--color-on-graphite)" }}>{tx("Try a brand + model, e.g. {0}", [chips.slice(0, 2).map((c) => c.label).join(", ")])}</div>
      <CompareChips suggestions={chips} onPick={onPick} />
    </div>
  )
}
