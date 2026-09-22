"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { comparePrices, isPaymentRequired } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { PriceCompareResult, SearchItem } from "@/types"
import { Globe, ArrowDown, ArrowUp, ExternalLink } from "lucide-react"

const ALL_MARKETS: Record<string, string> = {
  es: "Spain", fr: "France", de: "Germany", it: "Italy", pt: "Portugal",
  nl: "Netherlands", be: "Belgium", at: "Austria", pl: "Poland", cz: "Czechia",
  sk: "Slovakia", hu: "Hungary", ro: "Romania", hr: "Croatia", lt: "Lithuania",
  fi: "Finland", dk: "Denmark", se: "Sweden", "co.uk": "United Kingdom",
  com: "USA", lu: "Luxembourg", ie: "Ireland", gr: "Greece", bg: "Bulgaria",
  si: "Slovenia", ee: "Estonia",
}

const DEFAULT_MARKETS = ["es", "fr", "de", "it", "pt"]

export default function ComparePage() {
  const [query, setQuery] = useState("")
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(DEFAULT_MARKETS)
  const [result, setResult] = useState<PriceCompareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  const toggleMarket = (tld: string) => {
    setSelectedMarkets(prev =>
      prev.includes(tld) ? prev.filter(m => m !== tld) : [...prev, tld]
    )
  }

  const run = async () => {
    const q = query.trim()
    if (!q || selectedMarkets.length === 0) return
    setLoading(true); setError(""); setResult(null); setExpandedCountry(null)
    try {
      setResult(await comparePrices({ q, markets: selectedMarkets, limit: 10 }))
    } catch (e) {
      setError(isPaymentRequired(e)
        ? "Price Compare is a Pro feature. Upgrade to compare live asking prices across 26 markets."
        : "Comparison failed. Try again.")
    } finally { setLoading(false) }
  }

  const sorted = result
    ? Object.entries(result.by_country).sort((a, b) => a[1].avg_price - b[1].avg_price)
    : []

  const cheapestTld = result?.cheapest_market?.tld
  const priciest = result?.most_expensive_market?.tld

  return (
    <AppShell title="Price Compare" subtitle="Compare prices for any product across Vinted markets — find the cheapest country to buy from">
      <div className="max-w-4xl">
        <div className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--color-graphite-muted)" }}>
          Full buy-below intelligence (verdicts, sell-through, confidence) only exists for
          Spain, France, Germany, Italy and Portugal — the markets Resale IQ tracks. The other
          21 markets below are live Vinted asking-price search only: current prices, no
          buy-below price and no verdict.
        </div>
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder="e.g. Nike Air Force 1, Adidas Samba OG, Stone Island crewneck"
            className="flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[var(--color-accent)]/60 placeholder:text-[var(--color-graphite-muted)]" style={{ color: "var(--color-on-graphite)" }} />
          <button onClick={run} disabled={loading || !query.trim() || selectedMarkets.length === 0}
            className="px-5 py-3 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}>
            <Globe size={15} />{loading ? "Comparing…" : "Compare"}
          </button>
        </div>

        {/* Market toggles */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {Object.entries(ALL_MARKETS).map(([tld, name]) => {
            const on = selectedMarkets.includes(tld)
            return (
              <button key={tld} onClick={() => toggleMarket(tld)}
                className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
                style={{
                  background: on ? "rgba(52,199,89,.12)" : "var(--color-graphite-elevated)",
                  border: `1px solid ${on ? "rgba(52,199,89,.35)" : "var(--color-hairline)"}`,
                  color: on ? "var(--color-accent)" : "var(--color-graphite-muted)",
                }}>
                {name}
              </button>
            )
          })}
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {/* Summary cards */}
        {result && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <SummaryCard label="Markets with results" value={`${result.markets_with_results} / ${result.markets_searched}`} />
            {result.cheapest_market && (
              <SummaryCard label="Cheapest" value={result.cheapest_market.country}
                sub={eur(result.cheapest_market.avg_price) + " avg"} accent="var(--color-accent)" icon={<ArrowDown size={14} />} />
            )}
            {result.most_expensive_market && (
              <SummaryCard label="Most expensive" value={result.most_expensive_market.country}
                sub={eur(result.most_expensive_market.avg_price) + " avg"} accent="var(--color-skip)" icon={<ArrowUp size={14} />} />
            )}
          </div>
        )}

        {/* Country breakdown */}
        {sorted.length > 0 && (
          <div className="flex flex-col gap-2">
            {sorted.map(([tld, stats]) => {
              const expanded = expandedCountry === tld
              const isCheapest = tld === cheapestTld
              const isPriciest = tld === priciest
              return (
                <div key={tld} className="bg-[var(--color-bg-3)] border rounded-xl overflow-hidden"
                  style={{ borderColor: isCheapest ? "rgba(52,199,89,.3)" : "var(--color-hairline)" }}>
                  <button onClick={() => setExpandedCountry(expanded ? null : tld)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold" style={{ color: "var(--color-on-graphite)" }}>{stats.country}</span>
                        {isCheapest && <span className="px-1.5 py-0.5 rounded text-[12px] font-bold border" style={{ background: "rgba(52,199,89,.10)", color: "var(--color-accent)", borderColor: "rgba(52,199,89,.30)" }}>CHEAPEST</span>}
                        {isPriciest && <span className="px-1.5 py-0.5 rounded text-[12px] font-bold border" style={{ background: "rgba(255,69,58,.10)", color: "var(--color-skip)", borderColor: "rgba(255,69,58,.30)" }}>PRICIEST</span>}
                      </div>
                      <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{stats.count} listings</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[16px] font-bold" style={{ color: isCheapest ? "var(--color-accent)" : "var(--color-on-graphite)" }}>{eur(stats.avg_price)}</div>
                      <div className="text-[12px] text-[var(--color-text-secondary)]">{eur(stats.min_price)} – {eur(stats.max_price)}</div>
                    </div>
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
                            <div className="text-[12px] text-[var(--color-text-secondary)]">{item.size || "—"} · {item.seller?.login || "Unknown seller"}</div>
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

        {!result && !loading && (
          <div className="text-[13px] bg-[var(--color-graphite-elevated)] border border-[var(--color-hairline)] rounded-xl p-6" style={{ color: "var(--color-graphite-muted)" }}>
            Search any product and compare prices across multiple Vinted markets simultaneously.
            Find arbitrage opportunities — buy where it&apos;s cheapest, sell where it&apos;s most expensive.
          </div>
        )}
      </div>
    </AppShell>
  )
}

function SummaryCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: string; accent?: string; icon?: React.ReactNode
}) {
  return (
    <div className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="text-[12px] uppercase tracking-wide mb-1.5" style={{ color: "var(--color-graphite-muted)" }}>{label}</div>
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <span className="text-[17px] font-bold" style={{ color: accent || "var(--color-on-graphite)" }}>{value}</span>
      </div>
      <div className="text-[12px] mt-0.5" style={{ color: "var(--color-graphite-muted)" }}>{sub}</div>
    </div>
  )
}
