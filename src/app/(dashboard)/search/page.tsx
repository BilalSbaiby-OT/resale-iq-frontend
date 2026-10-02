"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { searchVinted, isPaymentRequired } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { SearchItem } from "@/types"
import { Search, ExternalLink, Star, Eye } from "lucide-react"
import { N_ } from "@/lib/ui-translate"
import { useT } from "@/components/i18n/locale-provider"

const MARKETS: Record<string, string> = {
  es: "Spain", fr: "France", de: "Germany", it: "Italy", pt: "Portugal",
  nl: "Netherlands", be: "Belgium", at: "Austria", pl: "Poland", cz: "Czechia",
  sk: "Slovakia", hu: "Hungary", ro: "Romania", hr: "Croatia", lt: "Lithuania",
  fi: "Finland", dk: "Denmark", se: "Sweden", "co.uk": "United Kingdom",
  com: "USA", lu: "Luxembourg", ie: "Ireland", gr: "Greece", bg: "Bulgaria",
  si: "Slovenia", ee: "Estonia",
}

const SORT_OPTIONS = [
  { value: "newest_first", label: N_("Newest") },
  { value: "price_low_to_high", label: N_("Price: Low → High") },
  { value: "price_high_to_low", label: N_("Price: High → Low") },
  { value: "relevance", label: N_("Relevance") },
]

export default function SearchPage() {
  const tx = useT()
  const [query, setQuery] = useState("")
  const [market, setMarket] = useState("es")
  const [sort, setSort] = useState("newest_first")
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState(false)

  const run = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true); setError(""); setItems([])
    try {
      const res = await searchVinted({ q, market, limit: 30, sort })
      setItems(res.items)
      setRecent(res.source === "tracked_index")
      setSearched(true)
    } catch (e) {
      setError(isPaymentRequired(e)
        ? tx("Live Search needs Starter or Pro. Upgrade to look up listings across markets.")
        : tx("Search failed. Try again."))
    } finally { setLoading(false) }
  }

  return (
    <AppShell title={tx("Live Search")} subtitle={tx("Search Vinted listings across 26 European markets in real time — live asking prices only outside ES/FR/DE/IT/PT, no buy-below or verdict")}>
      <div className="max-w-4xl">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder={tx("e.g. Nike Air Force 1, Levi's 501, Stone Island jacket")}
            className="flex-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-4 py-3 text-[14px] text-[#e8ecf4] outline-none focus:border-[rgba(52,199,89,0.60)] placeholder:text-[var(--color-text-secondary)]" />
          <select value={market} onChange={e => setMarket(e.target.value)}
            className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-3 text-[13px] text-[#a9b6d0] outline-none">
            {Object.entries(MARKETS).map(([tld, name]) => (
              <option key={tld} value={tld}>{name}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] rounded-lg px-3 py-3 text-[13px] text-[#a9b6d0] outline-none">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{tx(o.label)}</option>
            ))}
          </select>
          <button onClick={run} disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-[13px] font-bold bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:opacity-90 transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap">
            <Search size={15} />{loading ? tx("Searching…") : tx("Search")}
          </button>
        </div>

        {error && <div className="text-[13px] text-[var(--color-skip)] mb-4">{error}</div>}

        {/* Results */}
        {items.length > 0 && (
          <div className="text-[12px] text-[#5b6b8c] mb-3">{tx("{0} listings found in {1}{2}", [items.length, MARKETS[market] || market, recent && " — recently seen on Vinted (last 3 days), not a live lookup; open the listing to confirm it is still available"])}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="bg-[var(--color-bg-3)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[#2a3a55] transition-colors group">
              {item.photo && (
                <div className="aspect-square bg-[#0d0f13] overflow-hidden">
                  <img src={item.photo} alt={item.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-3.5">
                <div className="text-[13px] font-medium text-[#e8ecf4] line-clamp-2 mb-1.5">{item.title}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[17px] font-bold text-[var(--color-buy)]">{eur(item.price_eur)}</span>
                  {item.size && <span className="px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-2)] text-[12px] text-[#a9b6d0]">{item.size}</span>}
                </div>
                <div className="flex items-center gap-3 text-[12px] text-[var(--color-text-secondary)]">
                  {item.favourite_count > 0 && <span className="flex items-center gap-1"><Star size={10} />{item.favourite_count}</span>}
                  {item.view_count > 0 && <span className="flex items-center gap-1"><Eye size={10} />{item.view_count}</span>}
                  {item.seller && <span className="ml-auto">{item.seller.login}</span>}
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {searched && items.length === 0 && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[var(--color-surface)] border border-[#1c2333] rounded-xl p-6">{tx("No listings found for \"{0}\" in {1}. Try a different market or broader search term.", [query, MARKETS[market] || market])}</div>
        )}

        {!searched && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[var(--color-surface)] border border-[#1c2333] rounded-xl p-6">{tx("Search any product across 26 Vinted markets. Results come directly from Vinted's live catalog — click any listing to view it on Vinted.")}</div>
        )}
      </div>
    </AppShell>
  )
}
