"use client"
import { useState } from "react"
import Link from "next/link"
import { addToWatchlist } from "@/lib/api"
import { itemDisplayName } from "@/lib/item-display-name"
import type { Locale } from "@/lib/i18n"
import { fmtDate } from "@/lib/ui-translate"
import { useT } from "@/components/i18n/locale-provider"

export interface BuyRow {
  brand: string; model?: string; category?: string; verdict: string; momentum: string
  locked: boolean; sold_30d?: number | null; sold_30d_evidence?: number | null
  sold_7d?: number | null
  avg_price_eur: number | null; max_buy_price?: number | null; updated_at?: string
}

const VC: Record<string, string> = { "STRONG BUY": "#30D158", BUY: "#30D158", RISING: "#30D158", WATCH: "#FF9F0A", SKIP: "#8E8E93" }
// Fixed abbreviations: Intl "short" month differs across Node/ICU versions ("Sep" vs "Sept").
const eur0 = (n: number | null | undefined) => (n == null ? "—" : `€${Math.round(n)}`)

/** "30 Sep" from the newest updated_at (sqlite UTC 'YYYY-MM-DD HH:MM:SS'); null if unreadable. */
function updatedLabel(rows: BuyRow[], locale: Locale): string | null {
  const ts = rows.map((r) => Date.parse((r.updated_at ?? "").replace(" ", "T") + "Z")).filter(Number.isFinite)
  if (!ts.length) return null
  const d = new Date(Math.max(...ts))
  return fmtDate(locale, d, { day: "numeric", month: "short" })
}

/**
 * THIS WEEK'S FULL BUY LIST for paid/trialing accounts: every row unlocked,
 * buy-below (the most you should pay) next to the exit price (average asking
 * price at departure). Data = the existing paid /api/buy-list, untouched.
 * trialMode: show "Top this week" heading instead of "This week's buy list"
 * so trial users see demand signals without a BUY label that implies certainty.
 */
export function WeeklyBuyList({ rows, trialMode = false }: { rows: BuyRow[]; trialMode?: boolean }) {
  const tx = useT()
  const [watched, setWatched] = useState<Set<string>>(new Set())
  const updated = updatedLabel(rows, tx.locale)
  const watch = async (r: BuyRow) => {
    const key = `${r.brand}|${r.model}`
    try { await addToWatchlist(r.brand, r.model ?? "", r.category ?? "") } catch { /* already watched */ }
    setWatched((s) => new Set(s).add(key))
  }
  return (
    <section
      id="what-to-buy"
      data-testid="riq-weekly-buy-list"
      style={{ background: "var(--color-graphite-elevated)", borderRadius: 14, padding: "16px 16px 12px", marginBottom: 24 }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--color-on-graphite)", letterSpacing: "-0.01em" }}>{trialMode ? tx("Top this week") : tx("This week’s buy list")}</h2>
        <span style={{ fontSize: 12, color: "var(--color-graphite-muted)" }}>{tx("{0} items · EU5 Vinted", [rows.length])}</span>
      </div>
      <div data-testid="riq-buy-list-updated" style={{ fontSize: 12.5, color: "var(--color-graphite-muted)", margin: "4px 0 10px" }}>
        {updated ? tx(`Updated {0} — `, [updated]) : ""}{tx("new list every Monday")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 52px 48px 52px", gap: "0 8px", fontSize: 11, color: "var(--color-graphite-muted)", letterSpacing: "0.04em", textTransform: "uppercase", paddingBottom: 6, borderBottom: "1px solid var(--color-hairline)" }}>
        <span>{tx("Item")}</span><span style={{ textAlign: "right" }}>{tx("Buy below")}</span><span style={{ textAlign: "right" }}>{tx("Exit")}</span><span />
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r, i) => {
          const label = (r.model ? itemDisplayName(r.brand, r.model) : `${r.brand} ${r.category ?? ""}`.trim())
          const v = VC[r.verdict] ? r.verdict : r.momentum
          const isW = watched.has(`${r.brand}|${r.model}`)
          return (
            <li
              key={`${label}-${i}`}
              data-testid="riq-buy-row"
              style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 52px 48px 52px", gap: "0 8px", alignItems: "center", minHeight: 52, padding: "6px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--color-hairline)" : "none" }}
            >
              <Link href={`/verdict?q=${encodeURIComponent(label)}&src=dashboard_buy_list`} style={{ textDecoration: "none", minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-on-graphite)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.25 }}>{label}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--color-graphite-muted)", marginTop: 1 }}>
                  <span style={{ color: VC[v] ?? "#8E8E93", fontWeight: 700, letterSpacing: "0.03em" }}>{v}</span>
                  {r.sold_7d != null ? ` · ${r.sold_7d.toLocaleString(tx.locale)} dep/7d` : r.sold_30d != null ? ` · ${r.sold_30d.toLocaleString(tx.locale)}/30d` : ""}
                </span>
              </Link>
              <span style={{ textAlign: "right", fontSize: 15, fontWeight: 600, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums" }}>{eur0(r.max_buy_price)}</span>
              <span style={{ textAlign: "right", fontSize: 14, color: "var(--color-graphite-muted)", fontVariantNumeric: "tabular-nums" }}>{eur0(r.avg_price_eur)}</span>
              <button
                type="button"
                onClick={() => watch(r)}
                disabled={isW}
                aria-label={tx(`Watch {0}`, [label])}
                data-testid="riq-buy-row-watch"
                style={{ background: "none", border: "none", minHeight: 44, color: isW ? "var(--color-accent)" : "var(--color-graphite-muted)", fontSize: 12.5, cursor: isW ? "default" : "pointer", textAlign: "right", padding: 0 }}
              >{isW ? tx("Watching ✓") : tx("Watch")}</button>
            </li>
          )
        })}
      </ol>
      <div style={{ fontSize: 12, color: "var(--color-graphite-muted)", marginTop: 8, lineHeight: 1.5 }}>{tx("Buy below = most you should pay after fees. Exit = average asking price at departure. /30d = watched departures in 30 days. Tap an item to check it.")}</div>
    </section>
  )
}
