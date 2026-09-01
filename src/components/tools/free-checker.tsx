"use client"
import { useState } from "react"
import { SmartCTA } from "@/components/smart-cta"
import { Lock, Search, Loader2 } from "lucide-react"
import { watchedSampleNote } from "@/lib/watched-sample"
import { TRIAL_LIMITS_SHORT } from "@/lib/trial-copy"

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
  // LIMIT_REACHED-only. Real backend fields (docs/product/SUPPORT-VOICE.md
  // §3, api/routes.py:806-817) — never invent a "used" count client-side.
  // used_today is deliberately NOT rendered: FUNNEL.md F-1 found the anon
  // quota key can be shared (IP-based backstop), so a personal usage count
  // is not always attributable to the visitor reading it. limit is a fixed,
  // attribution-free fact and is safe to show.
  limit?: number | null
}

// Verdict colour vs. system/quota colour are two different channels — see
// design/tokens.json known_splits and docs/product/DESIGN-REVIEW.md §2.
// WATCH was hardcoded to a drifted #eab308 instead of the real --color-watch
// token (#f59e0b), and LIMIT_REACHED — a quota state with nothing to do with
// the item — was wearing that same amber. Amber must mean one thing: the
// WATCH verdict. LIMIT_REACHED gets the neutral --color-unknown instead.
const VERDICT_COLOR: Record<string, string> = {
  BUY: "#22c55e",
  WATCH: "#f59e0b",
  SKIP: "#ef4444",
  LOCKED: "#8b99b8",
  INSUFFICIENT_DATA: "#8b99b8",
  UNKNOWN: "#8b99b8",
  LIMIT_REACHED: "#8b99b8",
}

function money(n: number | null | undefined) {
  return n != null && Number.isFinite(n) ? `€${Math.round(n)}` : "—"
}

// The catalogue is 26 brands, model-level, sneaker/streetwear-coded — not
// "any Vinted item." A refusal is the right answer for most typed-in queries
// (insufficient_data_rate = 40.9% of answered searches, METRICS.md), but the
// UI should turn that into "it works for THESE" rather than an empty box.
// Each of these is a query independently confirmed elsewhere as covered and
// well-priced: Nike Air Force 1 (e2e/mock-backend.mjs catalogue, HIGH/BUY),
// Adidas Samba (extension-hero.tsx's own production-verdict example),
// New Balance 530 (design/social — a worked post with real n=174 sold data).
// Never invent a fourth without the same grounding.
const TRY_EXAMPLES = ["Nike Air Force 1", "Adidas Samba", "New Balance 530"]

// Placeholder examples must be brands/models the catalogue actually prices —
// 26 brands, sneaker/streetwear-coded (Nike, Adidas, Jordan, New Balance).
// "Levi's 501" gestured at general vintage resale the catalogue does not
// cover, which reads as a lie of omission to a casual flipper who tries it
// and gets refused. ux-researcher, roster consult 2026-09-01.
export function FreeChecker({ placeholder = "e.g. Adidas Samba, Nike Air Force 1, New Balance 530" }: { placeholder?: string }) {
  const [q, setQ] = useState("")
  const [res, setRes] = useState<FreeVerdict | null>(null)
  const [loading, setLoading] = useState(false)
  // Two separate channels, not one — see design/extension-panel/system-status.html's
  // severity split, docs/product/DESIGN-REVIEW.md §3. "Enter a brand and model"
  // is a self-serve input nudge, not a system failure; it must not wear the same
  // SKIP red as a genuine fetch/network failure, or every hesitation before typing
  // reads as the product being broken.
  const [formErr, setFormErr] = useState("")
  const [err, setErr] = useState("")

  const run = async (override?: string) => {
    const query = (override ?? q).trim()
    setFormErr("")
    if (query.length < 2) { setFormErr("Enter a brand and model"); return }
    if (override) setQ(override)
    setLoading(true); setErr(""); setRes(null)
    // MONETIZATION.md #1/#4: the "checking…" state had no timeout, so a request
    // that dies server-side (a PENDING row that never resolves — measured 24.4%
    // of 7-day rows, docs/company/METRICS.md) hung forever with nothing on
    // screen. This falls back to the honest "could not reach it" state instead.
    const timeout = new AbortController()
    const timer = setTimeout(() => timeout.abort(), 10_000)
    try {
      const r = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`, { signal: timeout.signal })
      if (!r.ok) throw new Error("Could not check that item right now")
      setRes(await r.json())
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === "AbortError"
      setErr(aborted ? "This is taking longer than expected — try again in a moment." : e instanceof Error ? e.message : "Something went wrong")
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
          onClick={() => run()}
          disabled={loading}
          aria-label={loading ? "Checking item" : "Check it free"}
          style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, border: "none", borderRadius: 10, padding: "13px 22px", cursor: loading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? "Checking…" : "Check it free"}
        </button>
      </div>

      {formErr && <p style={{ color: "#8b99b8", fontSize: 13, marginTop: 12 }}>{formErr}</p>}
      {err && <p style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{err}</p>}

      {res && (
        <div style={{ marginTop: 18, borderTop: "1px solid #1c2333", paddingTop: 18 }}>
          {res.verdict === "LIMIT_REACHED" ? (
            // System/quota state, not a verdict about the item — never amber,
            // never the WATCH colour. design/extension-panel/quota-reached.html,
            // docs/product/DESIGN-REVIEW.md §3, MONETIZATION.md #4 (the
            // backend already computes upgrade_url/limit; this was previously
            // one line of plain text that surfaced neither).
            <div>
              <span style={{ display: "inline-block", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "#8b99b8", background: "#1a2030", borderRadius: 999, padding: "2px 8px" }}>
                Free limit
              </span>
              <p style={{ fontSize: 13.5, color: "#eef1f7", fontWeight: 600, marginTop: 10, lineHeight: 1.5 }}>
                {res.message ?? "Today's free limit is reached."}
              </p>
              {res.limit != null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid #1c2333" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>{res.limit}</span>
                  <span style={{ fontSize: 10.5, color: "#8b99b8", textTransform: "uppercase", letterSpacing: "0.4px" }}>free checks / day, resets daily</span>
                </div>
              )}
              <p style={{ marginTop: 10, fontSize: 12, color: "#a9b6d0", lineHeight: 1.55 }}>
                Not an error — sign in for 10/month with no daily wait, or a plan for unlimited.
              </p>
              <SmartCTA
                anonLabel="Sign in to keep checking →"
                anonHref="/register?plan=free"
                authedLabel="See plans →"
                authedHref="/account"
                style={{ display: "inline-block", marginTop: 12, background: "#1a2030", border: "1px solid #263147", color: "#eef1f7", fontSize: 12.5, fontWeight: 700, padding: "9px 16px", borderRadius: 8, textDecoration: "none" }}
              />
            </div>
          ) : res.verdict === "UNKNOWN" ? (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              <p style={{ fontSize: 14, color: "#c4a574", lineHeight: 1.55 }}>
                {res.message ?? "No data for that query. Use a brand and a real model."}
              </p>
              {/* ux-researcher, roster consult 2026-09-01: turn "this doesn't
                  work" into "it works for THESE" — the narrowing is honest,
                  an empty refusal with no next step reads as broken. */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                  Try one of these instead
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {TRY_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => run(ex)}
                      disabled={loading}
                      style={{ background: "#1a2030", border: "1px solid #263147", color: "#c3cde0", fontSize: 12.5, padding: "7px 12px", borderRadius: 999, cursor: loading ? "wait" : "pointer" }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
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
