"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { KpiCard } from "@/components/ui/kpi-card"
import { MomentumBadge } from "@/components/ui/momentum-badge"
import { ScoreBar } from "@/components/ui/score-bar"
import { SizePills } from "@/components/ui/size-pills"
import { SkeletonRows } from "@/components/ui/skeleton"
import { getKPIs, getDeals, getBrandRankings, getTrendsSummary, getRecentSold, addToWatchlist } from "@/lib/api"
import { eur, ago, getPlanFromToken } from "@/lib/utils"
import type { KPIs, Deal, BrandRanking, RecentSold, ModelSignal } from "@/types"

/* Section shell: uniform card with header + optional action link */
function Section({ title, sub, action, children }: {
  title: string; sub?: string; action?: { href: string; label: string }; children: React.ReactNode
}) {
  return (
    <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid #1c2333" }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 650, color: "#eef1f7" }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: "#4d5a75", marginTop: 1 }}>{sub}</div>}
        </div>
        {action && (
          <Link href={action.href} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#22c55e", textDecoration: "none", fontWeight: 550 }}>
            {action.label} <ArrowRight size={13} />
          </Link>
        )}
      </div>
      <div className="riq-scroll-x">{children}</div>
    </div>
  )
}

const TH: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#4d5a75", textAlign: "left", padding: "9px 14px", background: "#151924", borderBottom: "1px solid #1c2333" }
const TD: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid #181e2d", fontSize: 12.5, verticalAlign: "middle" }
const NUM: React.CSSProperties = { ...TD, fontVariantNumeric: "tabular-nums" }

export default function DashboardPage() {
  // Each section loads independently — one slow endpoint never blanks the page.
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [deals, setDeals] = useState<Deal[] | null>(null)
  const [brands, setBrands] = useState<BrandRanking[] | null>(null)
  const [trending, setTrending] = useState<ModelSignal[] | null>(null)
  const [sold, setSold] = useState<RecentSold[] | null>(null)
  const plan = getPlanFromToken()

  useEffect(() => {
    getKPIs().then(setKpis).catch(() => setKpis(null))
    getDeals({ limit: 8 }).then(d => setDeals(d.deals)).catch(() => setDeals([]))
    getBrandRankings(8).then(d => setBrands(d.brands)).catch(() => setBrands([]))
    getTrendsSummary().then(d => setTrending((d.trending_models ?? []).slice(0, 7))).catch(() => setTrending([]))
    getRecentSold(7).then(d => setSold(d.data)).catch(() => setSold([]))
  }, [])

  const watch = async (b: string, m: string) => {
    try { await addToWatchlist(b, m); alert(`Added ${b} ${m} to watchlist`) }
    catch { alert("Already in watchlist") }
  }

  return (
    <AppShell title="Dashboard" subtitle="Live market overview across 5 Vinted markets">
      {plan === "free" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "linear-gradient(90deg,rgba(34,197,94,.07),transparent)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 10, padding: "13px 16px", marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: "#eef1f7" }}>Unlock full market intelligence</div>
            <div style={{ fontSize: 11.5, color: "#8b99b8" }}>100 signals · unlimited verdicts · size velocity · alerts</div>
          </div>
          <Link href="/register?plan=operator" style={{ background: "#22c55e", color: "#06090c", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
            Upgrade — €19/mo
          </Link>
        </div>
      )}

      {/* KPI row */}
      <div className="riq-grid-kpi" style={{ marginBottom: 18 }}>
        <KpiCard label={kpis?.avg_profit_margin.label ?? "Avg sell-through / wk"} loading={!kpis} value={kpis?.avg_profit_margin.value} unit="%" sublabel={kpis?.avg_profit_margin.sublabel ?? "across all tracked models"} />
        <KpiCard label="Listings tracked" loading={!kpis} value={kpis?.items_analyzed.formatted} sublabel="across 5 Vinted markets" />
        <KpiCard label="Top category" loading={!kpis} value={kpis?.top_category.value} sublabel={kpis?.top_category.sublabel ?? "by 7-day sales volume"} />
        <KpiCard label={kpis?.market_opportunity.label ?? "Buy signals"} loading={!kpis} value={kpis?.market_opportunity.value} sublabel={kpis?.market_opportunity.sublabel ?? (kpis?.market_opportunity.top_signal ? `Top: ${kpis.market_opportunity.top_signal}` : "actionable now")} />
      </div>

      {/* Opportunities + Brands */}
      <div className="riq-grid-main" style={{ marginBottom: 14 }}>
        <Section title="Top opportunities" sub="Ranked by opportunity score, refreshed hourly" action={{ href: "/deals", label: "Deal scanner" }}>
          {!deals ? <SkeletonRows rows={6} height={34} /> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Product", "Buy below", "Est. profit", "STR", "Momentum", "Sizes", ""].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {deals.map((d, i) => (
                  <tr key={i}>
                    <td style={TD}>
                      <div style={{ fontWeight: 600, color: "#eef1f7" }}>{d.model}</div>
                      <div style={{ fontSize: 10.5, color: "#4d5a75" }}>{d.brand} · {d.category}</div>
                    </td>
                    <td style={{ ...NUM, color: "#34d399", fontWeight: 650 }}>{eur(d.max_buy_price)}</td>
                    <td style={NUM}>
                      <span style={{ color: "#fbbf24", fontWeight: 600 }}>{d.est_profit_eur != null ? `+${eur(d.est_profit_eur)}` : "—"}</span>
                    </td>
                    <td style={NUM}>{d.str_pct != null ? `${d.str_pct.toFixed(0)}%` : "—"}</td>
                    <td style={TD}><MomentumBadge momentum={d.momentum_label} /></td>
                    <td style={TD}><SizePills sizes={d.top_sizes ?? []} /></td>
                    <td style={TD}>
                      <button onClick={() => watch(d.brand, d.model)} title="Add to watchlist"
                        style={{ background: "transparent", border: "1px solid #232c42", borderRadius: 6, color: "#8b99b8", fontSize: 11, padding: "4px 9px", cursor: "pointer" }}>
                        Watch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <Section title="Brand rankings" sub="By 7-day sales" action={{ href: "/brands", label: "All brands" }}>
          {!brands ? <SkeletonRows rows={6} height={30} /> : (
            <div style={{ padding: "4px 0" }}>
              {brands.map(b => (
                <Link key={b.brand} href={`/deals?brand=${encodeURIComponent(b.brand)}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", textDecoration: "none", borderBottom: "1px solid #181e2d" }}>
                  <span style={{ fontSize: 11, color: "#4d5a75", width: 20, fontVariantNumeric: "tabular-nums" }}>{b.rank}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#eef1f7" }}>{b.brand}</span>
                  <span style={{ fontSize: 12, color: "#8b99b8", fontVariantNumeric: "tabular-nums" }}>{eur(b.avg_price_eur)}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: b.speed_label?.includes("Fast") ? "#34d399" : "#fbbf24" }}>{b.speed_label}</span>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Trending + Recently sold */}
      <div className="riq-grid-2">
        <Section title="Trending this week" sub="Highest momentum models" action={{ href: "/trends", label: "Market trends" }}>
          {!trending ? <SkeletonRows rows={5} height={32} /> : (
            <div style={{ padding: "4px 0" }}>
              {trending.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: "1px solid #181e2d" }}>
                  <span style={{ fontSize: 11, color: "#4d5a75", width: 16, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#eef1f7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.model}</div>
                    <div style={{ fontSize: 10.5, color: "#4d5a75" }}>{r.brand}</div>
                  </div>
                  <MomentumBadge momentum={r.momentum_label} />
                  <ScoreBar score={r.opportunity_score} width={46} />
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Recently sold" sub="Live sold-evidence feed">
          {!sold ? <SkeletonRows rows={5} height={28} /> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Brand", "Item", "Size", "Price", "When"].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {sold.map((s, i) => (
                  <tr key={i}>
                    <td style={{ ...TD, fontWeight: 600, color: "#eef1f7" }}>{s.brand}</td>
                    <td style={{ ...TD, color: "#8b99b8", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.model || s.title}</td>
                    <td style={NUM}>{s.size ?? "—"}</td>
                    <td style={{ ...NUM, color: "#34d399", fontWeight: 650 }}>{eur(s.price_eur)}</td>
                    <td style={{ ...NUM, color: "#4d5a75", fontSize: 11 }}>{ago(s.sold_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>
    </AppShell>
  )
}
