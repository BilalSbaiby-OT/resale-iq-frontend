"use client"
import { useEffect, useState } from "react"
import { getLiveDeals } from "@/lib/api"
import type { Deal, LiveDeal } from "@/types"
import { Zap, Search, Heart } from "lucide-react"

interface LiveDealsModalProps {
  deal: Deal
  onClose: () => void
}

export function LiveDealsModal({ deal, onClose }: LiveDealsModalProps) {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<LiveDeal[]>([])
  const [markets, setMarkets] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true); setError("")
      try {
        const res = await getLiveDeals({
          brand: deal.brand, model: deal.model,
          max_price: deal.max_buy_price, sizes: deal.top_sizes, limit: 24,
        })
        if (cancelled) return
        setDeals(res.deals); setMarkets(res.markets_hit)
        if (res.error) setError(res.error)
      } catch {
        if (!cancelled) setError("Live search failed — try again shortly.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [deal])

  const avg = typeof deal.avg_price_eur === "number" && Number.isFinite(deal.avg_price_eur)
    ? deal.avg_price_eur
    : null
  const netProfit = (price: number) => avg != null && avg > 0 ? avg * 0.95 - price : null

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0F1115", border: "1px solid #263147", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2535", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><Zap size={16} style={{ color: "#f59e0b" }} /> Live Deals — {deal.brand} {deal.model}</div>
            <div style={{ fontSize: 11, color: "#546380", marginTop: 2 }}>
              Buyable now · {deal.max_buy_price != null ? `under €${Math.floor(deal.max_buy_price)}` : "buy-below withheld"} · sizes {(deal.top_sizes ?? []).slice(0,4).join(", ") || "all"}
              {markets.length > 0 && ` · ${markets.join(" ")}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#546380", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: 12 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#546380", fontFamily: "monospace", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Search size={13} /> Searching live Vinted across 5 markets…
            </div>
          ) : deals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#546380", fontSize: 13 }}>
              {error || "No live listings under your buy-price right now. Check back — new deals drop constantly."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {error && <div style={{ fontSize: 11, color: "#f59e0b", padding: "4px 8px" }}>{error}</div>}
              {deals.map((d, i) => {
                const profit = netProfit(d.price_eur)
                return (
                  <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 12, background: "#141820", border: "1px solid #1e2535", borderRadius: 10, padding: 10, textDecoration: "none", color: "#e8ecf4", transition: "border-color .12s" }}>
                    {d.photo ? (
                      <img src={d.photo} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 52, height: 52, borderRadius: 8, background: "#1a2030", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: "#546380", marginTop: 2 }}>
                        {d.market} · size {d.size || "?"} · {d.condition || "?"}
                        {d.favourites > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}> · <Heart size={10} style={{ color: "#f43f5e" }} /> {d.favourites}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: "#22c55e" }}>€{d.price_eur.toFixed(0)}</div>
                      {profit != null && profit > 0 && (
                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#f59e0b" }}>~€{profit.toFixed(0)} profit</div>
                      )}
                    </div>
                    <span style={{ color: "#3b82f6", fontSize: 13 }}>↗</span>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid #1e2535", fontSize: 10, color: "#546380", textAlign: "center" }}>
          Live from Vinted · deduped across markets · cheapest first. Verify condition & authenticity before buying.
        </div>
      </div>
    </div>
  )
}
