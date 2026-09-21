"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Lock, TrendingUp, ArrowRight } from "lucide-react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { AW26_REPORT_URL } from "@/lib/hard-paywall"
import type { Locale } from "@/lib/i18n"

/**
 * HomeBuyList — ranked teaser of top buying opportunities.
 *
 * CEO directive 2026-09-21: the landing experience must NOT be an empty
 * search box demanding input. It must immediately SHOW a ranked BUY LIST
 * "here is what to buy right now" with the top rows visible and the rest
 * locked behind the paywall.
 *
 * Data source: /api/public/buy-list — top N brand+category by opportunity_score.
 * Free rows: verdict + avg_price_eur visible.
 * Locked rows: brand/category/verdict visible, numbers behind paywall.
 * max_buy_price is NEVER shown free — that is the paid answer.
 */

interface BuyListItem {
  brand: string
  category: string
  verdict: "BUY" | "WATCH" | "SKIP" | string
  momentum: string
  locked: boolean
  sold_7d: number | null
  avg_price_eur: number | null
  comparable_n: number | null
  months_supply: number | null
}

const VERDICT_COLOR: Record<string, string> = {
  BUY: "#34C759",
  WATCH: "#FF9F0A",
  SKIP: "#FF453A",
}

const VERDICT_LABEL: Record<string, string> = {
  BUY: "BUY",
  WATCH: "WATCH",
  SKIP: "SKIP",
}

function VerdictBadge({ v }: { v: string }) {
  const color = VERDICT_COLOR[v] ?? "#8b99b8"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.06em",
        borderRadius: 6,
        padding: "3px 8px",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
      }}
    >
      {VERDICT_LABEL[v] ?? v}
    </span>
  )
}

export function HomeBuyList({ locale }: { locale: Locale }) {
  const [items, setItems] = useState<BuyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lockedRows, setLockedRows] = useState(0)

  useEffect(() => {
    let live = true
    fetch("/api/public/buy-list?limit=8")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!live || !d?.items?.length) { setError(true); return }
        setItems(d.items)
        setLockedRows(d.locked_rows ?? 0)
      })
      .catch(() => { if (live) setError(true) })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [])

  if (loading) {
    // No height during load — avoids pushing content below the fold on first paint.
    // The component is client-only (useEffect), so SSR and tests see null.
    return null
  }

  if (error || items.length === 0) return null

  return (
    <div
      data-testid="riq-home-buy-list"
      style={{
        maxWidth: 680,
        margin: "0 auto var(--space-3, 20px)",
        padding: "0 0 8px",
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={16} color="#34C759" aria-hidden />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#eef1f7", letterSpacing: "0.02em" }}>
            What to buy right now
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#6a7d9a" }}>
          Ranked by demand · EU5 Vinted
        </span>
      </div>

      {/* Buy list table */}
      <div
        style={{
          background: "var(--color-surface, #131a27)",
          border: "1px solid var(--color-border-ui, #1e2a3f)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 64px 64px 64px",
            padding: "8px 14px",
            borderBottom: "1px solid var(--color-border-ui, #1e2a3f)",
            background: "rgba(255,255,255,.02)",
          }}
        >
          {["Item", "Verdict", "Departs/wk", "Avg price", "Buy below"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "#4a5a74", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>

        {items.map((item, i) => (
          <div
            key={`${item.brand}-${item.category}-${i}`}
            data-testid={item.locked ? "riq-buy-list-row-locked" : "riq-buy-list-row-free"}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 64px 64px 64px",
              padding: "10px 14px",
              borderBottom: i < items.length - 1 ? "1px solid rgba(30,42,63,.6)" : "none",
              alignItems: "center",
              background: item.locked ? "rgba(10,14,20,.3)" : "transparent",
              opacity: item.locked ? 0.7 : 1,
            }}
          >
            {/* Brand + category */}
            <div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: item.locked ? "#6a7d9a" : "#eef1f7" }}>
                {item.brand}
              </span>
              <span style={{ fontSize: 12, color: "#546380", marginLeft: 6 }}>
                {item.category}
              </span>
              {item.momentum && !item.locked && (
                <span style={{ fontSize: 10, fontWeight: 600, color: "#FF9F0A", marginLeft: 8, letterSpacing: "0.05em" }}>
                  {item.momentum}
                </span>
              )}
            </div>

            {/* Verdict */}
            <div>
              {item.locked
                ? <Lock size={13} color="#364456" aria-hidden />
                : <VerdictBadge v={item.verdict} />
              }
            </div>

            {/* Departs/week */}
            <span style={{ fontSize: 13, color: item.locked ? "#364456" : "#c3cde0", fontFamily: "monospace" }}>
              {item.locked ? "—" : (item.sold_7d != null ? `${item.sold_7d}/wk` : "—")}
            </span>

            {/* Avg price */}
            <span style={{ fontSize: 13, color: item.locked ? "#364456" : "#c3cde0", fontFamily: "monospace" }}>
              {item.locked ? "—" : (item.avg_price_eur != null ? `€${item.avg_price_eur}` : "—")}
            </span>

            {/* Buy below — always locked; this IS the paid answer */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Lock size={11} color="#364456" aria-hidden />
              <span style={{ fontSize: 11, color: "#364456", fontFamily: "monospace" }}>paid</span>
            </div>
          </div>
        ))}

        {/* Paywall footer */}
        {lockedRows > 0 && (
          <div
            style={{
              padding: "14px 16px",
              borderTop: "1px solid var(--color-border-ui, #1e2a3f)",
              background: "rgba(52,199,89,.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#eef1f7", margin: "0 0 2px" }}>
                {lockedRows} more opportunities locked — plus the exact buy-below price on every row.
              </p>
              <p style={{ fontSize: 12, color: "#6a7d9a", margin: 0 }}>
                Starter €19/mo — cancel anytime. Instant access.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <GuestCheckoutButton
                locale={locale}
                label="Unlock all →"
                src="buy_list_paywall"
              />
              <a
                href={AW26_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                AW26 report €49 →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* "See full data" link */}
      <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 12 }}>
        <Link href="/data" style={{ color: "#6a7d9a", textDecoration: "none" }}>
          Public brand volumes → /data
        </Link>
        <span style={{ color: "#364456", margin: "0 8px" }}>·</span>
        <Link href="/pricing" style={{ color: "#6a7d9a", textDecoration: "none" }}>
          See all plans
        </Link>
      </p>
    </div>
  )
}
