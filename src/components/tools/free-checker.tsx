"use client"
import { useState } from "react"
import Link from "next/link"
import { Lock, Search, Loader2 } from "lucide-react"

// Free public checker. Calls the unauthenticated /api/verdict, which returns the
// headline verdict but withholds every actionable number (buy-below price, sell
// price, sizes, sell-through). Enough to prove the data is real; not enough to
// source with — that's the conversion mechanic.

interface FreeVerdict {
  verdict?: string
  product?: string
  category?: string
  locked?: boolean
  message?: string
  // present only for paid callers
  buy_below?: number
}

const VERDICT_COLOR: Record<string, string> = {
  BUY: "#22c55e",
  WATCH: "#eab308",
  SKIP: "#ef4444",
  LOCKED: "#8b99b8",
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "0.5px" }}>
              {res.verdict ?? "—"}
            </span>
            <div>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600 }}>{res.product ?? q}</div>
              {res.category && <div style={{ fontSize: 12.5, color: "#5b6b8c" }}>{res.category}</div>}
            </div>
          </div>

          {/* Locked value — the actual money numbers */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
            {["Buy-below price", "Sells for", "Sell-through", "Best sizes"].map((label) => (
              <div key={label} style={{ background: "#1a2030", borderRadius: 9, padding: "11px 13px" }}>
                <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#c3cde0", filter: "blur(5px)", userSelect: "none" }}>€00.00</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#22c55e" />
              {res.message ?? "Unlock the buy-below price, sell price, best sizes and sell-through."}
            </div>
            <Link href="/register" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }}>
              Unlock the numbers →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
