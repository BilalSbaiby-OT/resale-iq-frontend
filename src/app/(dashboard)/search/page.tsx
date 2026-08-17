"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { searchVinted } from "@/lib/api"
import { eur } from "@/lib/utils"
import type { SearchItem } from "@/types"
import { Search, ExternalLink, Star, Eye } from "lucide-react"

const MARKETS: Record<string, string> = {
  es: "Spain", fr: "France", de: "Germany", it: "Italy", pt: "Portugal",
  nl: "Netherlands", be: "Belgium", at: "Austria", pl: "Poland", cz: "Czechia",
  sk: "Slovakia", hu: "Hungary", ro: "Romania", hr: "Croatia", lt: "Lithuania",
  fi: "Finland", dk: "Denmark", se: "Sweden", "co.uk": "United Kingdom",
  com: "USA", lu: "Luxembourg", ie: "Ireland", gr: "Greece", bg: "Bulgaria",
  si: "Slovenia", ee: "Estonia",
}

const SORT_OPTIONS = [
  { value: "newest_first", label: "Newest" },
  { value: "price_low_to_high", label: "Price: Low → High" },
  { value: "price_high_to_low", label: "Price: High → Low" },
  { value: "relevance", label: "Relevance" },
]

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [market, setMarket] = useState("es")
  const [sort, setSort] = useState("newest_first")
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const run = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true); setError(""); setItems([])
    try {
      const res = await searchVinted({ q, market, limit: 30, sort })
      setItems(res.items)
      setSearched(true)
    } catch {
      setError("Search failed. Try again.")
    } finally { setLoading(false) }
  }

  return (
    <AppShell title="Live Search" subtitle="Search Vinted listings across 26 European markets in real time">
      <div className="max-w-4xl">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder="e.g. Nike Air Force 1, Levi's 501, Stone Island jacket"
            className="flex-1 bg-[#1a2030] border border-[#263147] rounded-lg px-4 py-3 text-[14px] text-[#e8ecf4] outline-none focus:border-emerald-500/60 placeholder:text-[#546380]" />
          <select value={market} onChange={e => setMarket(e.target.value)}
            className="bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-3 text-[13px] text-[#a9b6d0] outline-none">
            {Object.entries(MARKETS).map(([tld, name]) => (
              <option key={tld} value={tld}>{name}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-[#1a2030] border border-[#263147] rounded-lg px-3 py-3 text-[13px] text-[#a9b6d0] outline-none">
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={run} disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-lg text-[13px] font-bold bg-emerald-400 text-[#06090c] hover:bg-emerald-300 transition-colors disabled:opacity-40 flex items-center gap-2 whitespace-nowrap">
            <Search size={15} />{loading ? "Searching…" : "Search"}
          </button>
        </div>

        {error && <div className="text-[13px] text-red-400 mb-4">{error}</div>}

        {/* Results */}
        {items.length > 0 && (
          <div className="text-[12px] text-[#5b6b8c] mb-3">{items.length} listings found in {MARKETS[market] || market}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="bg-[#141820] border border-[#1e2535] rounded-xl overflow-hidden hover:border-[#2a3a55] transition-colors group">
              {item.photo && (
                <div className="aspect-square bg-[#0d0f13] overflow-hidden">
                  <img src={item.photo} alt={item.title} loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-3.5">
                <div className="text-[13px] font-medium text-[#e8ecf4] line-clamp-2 mb-1.5">{item.title}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[17px] font-bold text-emerald-400">{eur(item.price_eur)}</span>
                  {item.size && <span className="px-2 py-0.5 rounded bg-[#1a2030] border border-[#263147] text-[11px] text-[#a9b6d0]">{item.size}</span>}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#546380]">
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
          <div className="text-[13px] text-[#5b6b8c] bg-[#12151d] border border-[#1c2333] rounded-xl p-6">
            No listings found for &quot;{query}&quot; in {MARKETS[market] || market}. Try a different market or broader search term.
          </div>
        )}

        {!searched && !loading && (
          <div className="text-[13px] text-[#5b6b8c] bg-[#12151d] border border-[#1c2333] rounded-xl p-6">
            Search any product across 26 Vinted markets. Results come directly from Vinted&apos;s live catalog — click any listing to view it on Vinted.
          </div>
        )}
      </div>
    </AppShell>
  )
}
