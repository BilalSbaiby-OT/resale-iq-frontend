"use client"
import { useState } from "react"
import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import { Lock, Search, Loader2 } from "lucide-react"
import { watchedSampleNote } from "@/lib/watched-sample"
import { TRIAL_LIMITS_SHORT } from "@/lib/trial-copy"

// 10s: long enough for a real answer (matches the extension's own budget,
// extension/background.js), short enough that a hung request — the PENDING
// rows docs/audit/MONETIZATION.md §4 traced to zero exception handling
// between the anon-quota debit and its resolution — doesn't leave the
// spinner running forever. See the `timedOut` branch below.
const VERDICT_TIMEOUT_MS = 10_000

function fmtCount(n: number | null | undefined): string {
  return n != null && Number.isFinite(n) ? n.toLocaleString("en-GB") : "—"
}

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
  match_note?: string | null
  reason?: string | null
  // Only populated on LIMIT_REACHED (api/routes.py:806-817). upgrade_url is
  // typed but deliberately unused for navigation below — see the comment at
  // the LIMIT_REACHED render branch.
  upgrade_url?: string
  used_today?: number
  limit?: number
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
  // Distinct from `err`: a plain fetch failure never reached the server, but
  // a client-side timeout means the request may well have — the anon quota
  // is claimed atomically before the answer is computed (db/queries.py:2652),
  // so an attempt that times out can still have spent one of the day's 10.
  // Conflating the two would tell someone their count is untouched when it
  // might not be. See docs/product/SUPPORT-VOICE.md §4.
  const [timedOut, setTimedOut] = useState(false)

  const run = async () => {
    if (q.trim().length < 2) { setErr("Enter a brand and model"); return }
    setLoading(true); setErr(""); setRes(null); setTimedOut(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VERDICT_TIMEOUT_MS)
    try {
      const r = await fetch(`/api/verdict?q=${encodeURIComponent(q.trim())}`, { signal: controller.signal })
      if (!r.ok) throw new Error("Could not check that item right now")
      setRes(await r.json())
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setTimedOut(true)
      } else {
        setErr(e instanceof Error ? e.message : "Something went wrong")
      }
    } finally {
      clearTimeout(timer)
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
          aria-label={loading ? "Checking item" : "Check it free"}
          style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, border: "none", borderRadius: 10, padding: "13px 22px", cursor: loading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? "Checking…" : "Check it free"}
        </button>
      </div>

      {err && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{err}</p>}

      {timedOut && (
        <div style={{ marginTop: 12 }}>
          {/* Proposed copy, docs/product/SUPPORT-VOICE.md §4 "same failure
              path" row — this IS that failure path (a request that may have
              reserved quota server-side and then never answered), so its
              honest-about-the-spend wording applies verbatim. */}
          <p style={{ color: "#c4a574", fontSize: 13, lineHeight: 1.55 }}>
            Something went wrong on our end finishing that check — it may still count
            against today&rsquo;s free limit. If your count looks wrong, email{" "}
            <a href="mailto:support@resaleiq.dev" style={{ color: "#8fa3c4" }}>support@resaleiq.dev</a>{" "}
            and we&rsquo;ll fix it.
          </p>
          <button
            onClick={run}
            style={{ marginTop: 8, background: "#1a2030", border: "1px solid #263147", color: "#c3cde0", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      )}

      {res && (
        <div style={{ marginTop: 18, borderTop: "1px solid #1c2333", paddingTop: 18 }}>
          {res.verdict === "LIMIT_REACHED" ? (
            <div>
              <p style={{ fontSize: 13.5, color: "#8b99b8" }}>
                {res.message ?? "Free checks used up for today. Sign in to continue."}
              </p>
              {res.used_today != null && res.limit != null && (
                <p style={{ fontSize: 12, color: "#5b6b8c", marginTop: 4 }}>
                  {res.used_today} of {res.limit} free checks used today.
                </p>
              )}
              {/* Free account before paid tier, per docs/product/SUPPORT-VOICE.md
                  §3: an anon visitor has no account yet, so the smaller ask
                  (register — free, raises the cap to 10/month with no daily
                  wait) comes before the sale. NOT res.upgrade_url: the API
                  sends "/stripe/plans", the JSON GET getPlans() calls
                  (src/lib/api.ts:212) via next.config.ts's /stripe/:path*
                  rewrite — not a page. Linking it directly would navigate to
                  raw JSON. /register and the homepage's #pricing section are
                  real pages that exist today. */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
                <Link
                  href="/register?plan=free"
                  style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none" }}
                >
                  Create a free account →
                </Link>
                <Link href="/#pricing" style={{ color: "#8fa3c4", fontSize: 13 }}>
                  See plans
                </Link>
              </div>
            </div>
          ) : res.verdict === "UNKNOWN" ? (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              <p style={{ fontSize: 14, color: "#c4a574", lineHeight: 1.55 }}>
                {res.message ?? "No data for that query. Use a brand and a real model."}
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              {res.match_note && (
                <p style={{ fontSize: 12.5, color: "#8b99b8", marginBottom: 12 }}>{res.match_note}</p>
              )}

              {hasPrices && (
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
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: hasPrices ? 16 : 4 }}>
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
              {res.verdict === "INSUFFICIENT_DATA" && res.message && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "#8b99b8", lineHeight: 1.55 }}>{res.message}</p>
              )}

              {!hasPrices && res.verdict !== "INSUFFICIENT_DATA" && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#8b99b8" }}>
                  Headline call only — market price and buy-below need an account. {TRIAL_LIMITS_SHORT}
                </p>
              )}
            </>
          )}

          {res.verdict !== "UNKNOWN" && res.verdict !== "INSUFFICIENT_DATA" && res.verdict !== "LIMIT_REACHED" && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#22c55e" />
              Unlock sell-through, demand, sizes and history with a plan.
            </div>
            <SmartCTA anonLabel="Unlock the rest →" authedLabel="See full numbers →" authedHref="/verdict" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }} />
          </div>
          )}
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
