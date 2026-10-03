"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { comparePrices, isPaymentRequired } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { PriceCompareResult, SearchItem } from "@/types"
import { Globe, ExternalLink } from "lucide-react"
import { useT } from "@/components/i18n/locale-provider"

// The five Vinted sites Resale IQ tracks. The label is the DOMAIN the listings
// were seen on, not the seller's country (listings carry no seller country).
const MARKETS = ["es", "fr", "de", "it", "pt"]

const DEFAULT_MARKETS = MARKETS

export default function ComparePage() {
  const tx = useT()
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
        ? tx("Price across Vinted sites is a Pro feature. Upgrade to compare typical asking prices across the Vinted sites we track.")
        : tx("Comparison failed. Try again."))
    } finally { setLoading(false) }
  }

  // Fixed site order: never ranked by price (no "cheapest"/"priciest" framing).
  const sorted = result
    ? Object.entries(result.by_country).sort((a, b) => MARKETS.indexOf(a[0]) - MARKETS.indexOf(b[0]))
    : []

  return (
    <AppShell title={tx("Price across Vinted sites")} subtitle={tx("Compare typical asking prices for the same search across the Vinted sites we track (ES · FR · DE · IT · PT).")}>
      <div className="max-w-4xl">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder={tx("e.g. Nike Air Force 1, Adidas Samba OG, Stone Island crewneck")}
            className="flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[var(--color-accent)]/60 placeholder:text-[var(--color-graphite-muted)]" style={{ color: "var(--color-on-graphite)" }} />
          <button onClick={run} disabled={loading || !query.trim() || selectedMarkets.length === 0}
            className="px-5 py-3 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}>
            <Globe size={15} />{loading ? tx("Comparing…") : tx("Compare")}
          </button>
        </div>

        {/* Market toggles */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {MARKETS.map((tld) => {
            const on = selectedMarkets.includes(tld)
            return (
              <button key={tld} onClick={() => toggleMarket(tld)}
                className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors"
                style={{
                  background: on ? "rgba(52,199,89,.12)" : "var(--color-graphite-elevated)",
                  border: `1px solid ${on ? "rgba(52,199,89,.35)" : "var(--color-hairline)"}`,
                  color: on ? "var(--color-accent)" : "var(--color-graphite-muted)",
                }}>
                vinted.{tld}
              </button>
            )
          })}
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {result?.source === "tracked_index" && (
          <div className="text-[12px] text-[#5b6b8c] mb-3">{tx("Prices come from listings recently seen on Vinted (last 3 days), not a live lookup. Open a listing to confirm it is still available.")}</div>
        )}
        {result && (
          <div className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--color-graphite-muted)" }}>
            {tx("Many listings appear on several Vinted sites at the same price, so differences between sites are usually small. Each figure is the median asking price, not a sale price.")}
          </div>
        )}

        {/* Country breakdown */}
        {sorted.length > 0 && (
          <div className="flex flex-col gap-2">
            {sorted.map(([tld, stats]) => {
              const expanded = expandedCountry === tld
              return (
                <div key={tld} className="bg-[var(--color-bg-3)] border rounded-xl overflow-hidden"
                  style={{ borderColor: "var(--color-hairline)" }}>
                  <button onClick={() => setExpandedCountry(expanded ? null : tld)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-[var(--color-surface-elevated)]/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold" style={{ color: "var(--color-on-graphite)" }}>vinted.{tld}</span>
                      </div>
                      <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">{tx("Median of the newest listings seen on this site")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[16px] font-bold" style={{ color: "var(--color-on-graphite)" }}>{eur(stats.median_price || stats.avg_price)}</div>
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

        {!result && !loading && (
          <div className="text-[13px] bg-[var(--color-graphite-elevated)] border border-[var(--color-hairline)] rounded-xl p-6" style={{ color: "var(--color-graphite-muted)" }}>{tx("Search any product to see typical asking prices on each Vinted site we track. Same search, same wording on every site — asking prices, not sale prices.")}</div>
        )}
      </div>
    </AppShell>
  )
}
