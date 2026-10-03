"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { comparePrices, isPaymentRequired } from "@/lib/api"
import { COMPARE_EXAMPLES, compareView, isGenericCompareInput } from "@/lib/compare-stats"
import { CompareChips, CompareNudge, CompareResultsView } from "@/components/compare/compare-results"
import type { PriceCompareResult } from "@/types"
import { Globe } from "lucide-react"
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

  const toggleMarket = (tld: string) => {
    setSelectedMarkets(prev =>
      prev.includes(tld) ? prev.filter(m => m !== tld) : [...prev, tld]
    )
  }

  const run = async (override?: string) => {
    const q = (override ?? query).trim()
    if (!q || selectedMarkets.length === 0) return
    setLoading(true); setError(""); setResult(null)
    try {
      setResult(await comparePrices({ q, markets: selectedMarkets, limit: 10 }))
    } catch (e) {
      setError(isPaymentRequired(e)
        ? tx("Price across Vinted sites is a Pro feature. Upgrade to compare typical asking prices across the Vinted sites we track.")
        : tx("Comparison failed. Try again."))
    } finally { setLoading(false) }
  }

  // A chip fills the box and runs that query.
  const runQuery = (q: string) => { setQuery(q); void run(q) }
  const view = compareView(result)
  // Before submit: a 1-word generic input ("vintage", "veste", "tout"...) gets a nudge.
  const genericHint = !result && !loading && isGenericCompareInput(query)

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
          <button onClick={() => run()} disabled={loading || !query.trim() || selectedMarkets.length === 0}
            className="px-5 py-3 rounded-lg text-[13px] font-bold transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)" }}>
            <Globe size={15} />{loading ? tx("Comparing…") : tx("Compare")}
          </button>
        </div>

        {genericHint && (
          <div data-testid="compare-generic-hint" className="mb-4 text-[12.5px]" style={{ color: "var(--color-graphite-muted)" }}>
            {tx("Try a brand + model, e.g. {0}", [COMPARE_EXAMPLES.map(c => c.label).join(", ")])}
            <CompareChips suggestions={[...COMPARE_EXAMPLES]} onPick={runQuery} testId="compare-hint-chips" />
          </div>
        )}

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
          <div className="text-[12px] text-[#5b6b8c] mb-3">{tx("Prices come from listings recently seen on Vinted (last 7 days), not a live lookup. Open a listing to confirm it is still available.")}</div>
        )}
        {result && (
          <div className="text-[12px] mb-4 leading-relaxed" style={{ color: "var(--color-graphite-muted)" }}>
            {tx("Many listings appear on several Vinted sites at the same price, so differences between sites are usually small. Each figure is the median asking price, not a sale price.")}
          </div>
        )}

        {result && view.mode === "nudge" && (
          <CompareNudge why={view.why} suggestions={view.suggestions} onPick={runQuery} />
        )}
        {result && view.mode === "results" && (
          <>
            <CompareResultsView result={result} />
            {view.suggestions.length > 0 && (
              <div className="mt-4 text-[12.5px]" style={{ color: "var(--color-graphite-muted)" }}>
                {tx("Narrow it down with a model:")}
                <CompareChips suggestions={view.suggestions} onPick={runQuery} />
              </div>
            )}
          </>
        )}

        {!result && !loading && (
          <div className="text-[13px] bg-[var(--color-graphite-elevated)] border border-[var(--color-hairline)] rounded-xl p-6" style={{ color: "var(--color-graphite-muted)" }}>{tx("Search any product to see typical asking prices on each Vinted site we track. Same search, same wording on every site — asking prices, not sale prices.")}</div>
        )}
      </div>
    </AppShell>
  )
}
