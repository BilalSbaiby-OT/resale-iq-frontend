"use client"
import { useState } from "react"
import { SmartCTA } from "@/components/smart-cta"
import { Lock, Search, Loader2 } from "lucide-react"
import { fmtCount } from "@/lib/market-numbers"
import { watchedSampleNote } from "@/lib/watched-sample"

// Public checker. Anonymous callers get market price + buy-below on the first
// views (the conversion "holy shit" moment). STR, demand, sizes and history
// stay behind the plan. Never invent numbers: only render fields the API sent.
// Number first, letter second, sample third — SKIP without counts reads as
// "this model does not sell".

interface FreeVerdict {
  verdict?: string
  product?: string
  category?: string
  locked?: boolean
  message?: string
  buy_below?: number | null
  sell_avg?: number | null
  n?: number | null
  sold_7d?: number | null
  active_listings?: number | null
  confidence?: string
  confidence_note?: string
  sell_through_rate?: string | null
  top_sizes?: string[]
}

const VERDICT_COLOR: Record<string, string> = {
  BUY: "#22c55e",
  WATCH: "#eab308",
  SKIP: "#ef4444",
  LOCKED: "#8b99b8",
  INSUFFICIENT_DATA: "#8b99b8",
  UNKNOWN: "#8b99b8",
  LIMIT_REACHED: "#f59e0b",
}

function money(n: number | null | undefined) {
  return n != null && Number.isFinite(n) ? `€${Math.round(n)}` : "—"
}

export function FreeChecker({ placeholder = "e.g. Adidas Samba, Nike Air Force 1, Levi's 501" }: { placeholder?: string }) {
  const [q, setQ] = useState("")
  const [res, setRes] = useState<FreeVerdict | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const run = async () => {
    if (q.trim().length < 2) { setErr("Enter a brand and model"); return }
    setLoading(true); setErr(""); setRes(null)
    try {
      const r = await fetch(`/api/verdict?q=${encodeURIComponent(q.trim())}`)
      if (!r.ok) throw new Error("Could not check that item right now")
      setRes(await r.json())
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const color = res?.verdict ? (VERDICT_COLOR[res.verdict] ?? "#8b99b8") : "#8b99b8"
  const sold = res?.sold_7d ?? res?.n
  const listed = res?.active_listings
  const hasPrices = res?.buy_below != null || res?.sell_avg != null
  const sample = watchedSampleNote(sold, listed, res?.verdict)
  const label = res?.verdict === "INSUFFICIENT_DATA" ? "NOT MEASURED"
    : res?.verdict === "LIMIT_REACHED" ? "LIMIT REACHED"
    : res?.verdict ?? "—"

  return (
    <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") run() }}
          placeholder={placeholder}
          aria-label="Item to check"
          style={{ flex: "1 1 240px", minWidth: 0, background: "#0f1218", border: "1px solid #232c42", borderRadius: 10, padding: "13px 15px", color: "#eef1f7", fontSize: 14.5, outline: "none" }}
        />
        <button
          onClick={run}
          disabled={loading}
          style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, border: "none", borderRadius: 10, padding: "13px 22px", cursor: loading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? "Checking…" : "Check it free"}
        </button>
      </div>

      {err && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{err}</p>}

      {res && (
        <div style={{ marginTop: 18, borderTop: "1px solid #1c2333", paddingTop: 18 }}>
          {res.verdict === "LIMIT_REACHED" ? (
            <p style={{ fontSize: 13.5, color: "#8b99b8" }}>
              {res.message ?? "Free checks used up for today. Sign in to continue."}
            </p>
          ) : (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 12 }}>{res.product ?? q}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                <Stat label="Buy-below" value={money(res.buy_below)} accent="#22c55e" />
                <Stat label="Market price" value={money(res.sell_avg)} />
                {sold != null ? <Stat label="Sold (watched)" value={fmtCount(sold)} /> : null}
                {listed != null ? <Stat label="Still listed" value={fmtCount(listed)} /> : null}
                {res.locked || res.sell_through_rate == null ? (
                  <div style={{ background: "#1a2030", borderRadius: 9, padding: "11px 13px" }}>
                    <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sell-through</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#5b6b8c" }}>{res.locked ? "Plan" : "—"}</div>
                  </div>
                ) : (
                  <Stat label="Sell-through" value={res.sell_through_rate} />
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "0.5px" }}>
                  {label}
                </span>
                <div style={{ fontSize: 12.5, color: "#5b6b8c" }}>
                  {res.category ? `${res.category} · ` : ""}
                  {res.confidence ? `Confidence ${res.confidence}` : ""}
                </div>
              </div>

              {sample && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "#c4a574", lineHeight: 1.55 }}>{sample}</p>
              )}
              {!sample && res.confidence_note && (
                <p style={{ marginTop: 10, fontSize: 13, color: "#c4a574" }}>{res.confidence_note}</p>
              )}

              {!hasPrices && res.verdict !== "INSUFFICIENT_DATA" && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#8b99b8" }}>
                  Headline call only — market price and buy-below need an account (7 days free, then 10/month).
                </p>
              )}
            </>
          )}

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#22c55e" />
              {res.message ?? "Unlock sell-through, demand, sizes and history with a plan."}
            </div>
            <SmartCTA anonLabel="Unlock the rest →" authedLabel="See full numbers →" authedHref="/verdict" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }} />
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#1a2030", borderRadius: 9, padding: "11px 13px" }}>
      <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent || "#eef1f7" }}>{value}</div>
    </div>
  )
}
