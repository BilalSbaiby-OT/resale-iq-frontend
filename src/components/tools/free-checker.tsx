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

// Verdict colour vs. system/quota colour are two different channels — see
// design/tokens.json known_splits and docs/product/DESIGN-REVIEW.md §2.
// WATCH was hardcoded to a drifted #eab308 instead of the real --color-watch
// token (#f59e0b), and LIMIT_REACHED — a quota state with nothing to do with
// the item — was wearing that same amber. Amber must mean one thing: the
// WATCH verdict. LIMIT_REACHED gets the neutral --color-unknown grey instead.
// roster consult 2026-09-01.
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

// --- INSUFFICIENT_DATA copy (defect 2, 2026-09-01) -------------------------
// Named constants, not inline JSX literals, so a future i18n pass has a
// single place to swap in translated strings. NOTE: this whole component is
// still hardcoded English end to end (button label, placeholder, every
// branch) — frontend-eng flagged this after landing de/it/pt in
// src/lib/i18n.ts, and that gap is NOT fixed by this pass. Wiring
// FreeChecker into the `copy` dictionary means threading a Locale prop
// through every caller (page.tsx, tools/page.tsx, tools/[slug]/page.tsx) and
// is a real structural change, not a copy edit — out of scope for "change
// ONE thing." Flagged for frontend-eng/designer to scope separately rather
// than done quietly here. The two strings below reuse language already
// proven to translate cleanly: INSUFFICIENT_STATEMENT matches
// extension/content.js's existing `thinSample` string verbatim, and
// INSUFFICIENT_SUBTEXT echoes `t.heroHonesty` (src/lib/i18n.ts), which
// already has fr/es equivalents.
const INSUFFICIENT_STATEMENT = "Not enough watched departures to price this yet."
const INSUFFICIENT_SUBTEXT = "We’d rather say that than guess."
const INSUFFICIENT_N_LABEL = "watched, not enough"

// Shared by the UNKNOWN (not covered) and INSUFFICIENT_DATA (not enough
// evidence) branches below — both are refusals, both need a next step so
// the screen is not a dead end. designer, 2026-09-01 (defect 3: the row
// existed only on the UNKNOWN branch; INSUFFICIENT_DATA — the state 37 of
// 100 board models land on — had none).
function TryExamplesRow({ onPick, disabled }: { onPick: (ex: string) => void; disabled: boolean }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
        Try one of these instead
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TRY_EXAMPLES.map(ex => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            disabled={disabled}
            style={{ background: "#1a2030", border: "1px solid #263147", color: "#c3cde0", fontSize: 12.5, padding: "7px 12px", borderRadius: 999, cursor: disabled ? "wait" : "pointer" }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

// Placeholder examples must be brands/models the catalogue actually prices —
// 26 brands, sneaker/streetwear-coded (Nike, Adidas, Jordan, New Balance).
// "Levi's 501" gestured at general vintage resale the catalogue does not
// cover, which reads as a lie of omission to a casual flipper who tries it
// and gets refused. ux-researcher, roster consult 2026-09-01.
export function FreeChecker({ placeholder = "e.g. Adidas Samba, Nike Air Force 1, New Balance 530" }: { placeholder?: string }) {
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

  // override: set by the "try one of these instead" chips below, which pass
  // a known-good query directly rather than relying on state set via onChange
  // (which wouldn't have committed yet inside the same click handler).
  const run = async (override?: string) => {
    const query = (override ?? q).trim()
    if (query.length < 2) { setErr("Enter a brand and model"); return }
    if (override) setQ(override)
    setLoading(true); setErr(""); setRes(null); setTimedOut(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VERDICT_TIMEOUT_MS)
    try {
      const r = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`, { signal: controller.signal })
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
  // INSUFFICIENT_DATA no longer reaches this label — it has its own branch
  // below (defect 2, 2026-09-01) so it never renders as a big coloured tag
  // that looks like a verdict.
  const label = res?.verdict === "LIMIT_REACHED" ? "LIMIT REACHED"
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
            onClick={() => run()}
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
              {/* ux-researcher, roster consult 2026-09-01: turn "this doesn't
                  work" into "it works for THESE" — the narrowing is honest,
                  an empty refusal with no next step reads as broken. */}
              <TryExamplesRow onPick={ex => run(ex)} disabled={loading} />
            </>
          ) : res.verdict === "INSUFFICIENT_DATA" ? (
            // A DELIBERATE REFUSAL, not an error. design/extension-panel/insufficient.html
            // is the reference: same card, no verdict-coloured tag, a plain
            // sentence in the number's slot, honest n shown rather than hidden,
            // and a next step so it isn't a dead end (defect 2 + defect 3,
            // 2026-09-01 designer pass). This branch never reads VERDICT_COLOR —
            // no green/amber/red, not even the neutral --color-unknown as a
            // "verdict tag" — because this is not a call on the item at all,
            // just text at the same weight the price copy would have used.
            //
            // NOTE on res.confidence_note / res.message below: these strings are
            // backend-owned (demand-intel/engine/listing_identity.py:364-370,
            // api/routes.py:538,595-597,922,1075). As of this pass they still say
            // "comparable sold items", the exact claim swept from the rest of the
            // site today ("watched departures" — a departure can be a delist, an
            // edit or a reservation, not only a sale). That is a backend copy bug,
            // not a frontend one: fixing it here would only hide it, and three
            // test files (test_verdict_confidence.py, test_provisional_verdict.py,
            // test_evidence_gate_paid_surfaces.py) assert the exact string, so the
            // real fix is a backend-eng PR that updates the string AND its tests
            // together. Flagged, not papered over — do not string-replace "sold"
            // here.
            //
            // data-testid, not the copy, is what e2e/regression-p0.spec.ts pins to
            // (defect 2/3 test update, 2026-09-01) — a test locked to this literal
            // English sentence would break on the next copy pass or the i18n pass
            // this branch still owes. Assert the PROPERTY (a statement is shown, n
            // is honest, no verdict colour, a next step exists), not the wording.
            <div data-testid="riq-insufficient">
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>

              <p style={{ fontSize: 17, fontWeight: 700, color: "#eef1f7", lineHeight: 1.4, margin: 0 }}>
                {INSUFFICIENT_STATEMENT}
              </p>
              <p style={{ fontSize: 12.5, color: "#8fa3c4", marginTop: 6, lineHeight: 1.5 }}>
                {INSUFFICIENT_SUBTEXT}
              </p>

              {(res.n ?? res.sold_7d) != null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid #1c2333" }}>
                  <span data-testid="riq-insufficient-n" style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>
                    {fmtCount(res.n ?? res.sold_7d)}
                  </span>
                  <span style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {INSUFFICIENT_N_LABEL}
                  </span>
                </div>
              )}

              {(res.confidence_note || res.message) && (
                <p style={{ marginTop: 10, fontSize: 12.5, color: "#7f8da9", lineHeight: 1.55 }}>
                  {res.confidence_note ?? res.message}
                </p>
              )}
              {res.confidence_note && res.message && res.message !== res.confidence_note && (
                <p style={{ marginTop: 6, fontSize: 12.5, color: "#7f8da9", lineHeight: 1.55 }}>{res.message}</p>
              )}

              {res.category && (
                <div style={{ fontSize: 11, color: "#5b6b8c", marginTop: 10 }}>{res.category}</div>
              )}

              <TryExamplesRow onPick={ex => run(ex)} disabled={loading} />
            </div>
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
                {sold != null ? <Stat label="Left shelf (watched)" value={fmtCount(sold)} /> : null}
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

              {/* res.verdict is never INSUFFICIENT_DATA here — that verdict has
                  its own branch above (defect 2/3, 2026-09-01) — so !hasPrices
                  in this branch only ever means BUY/WATCH/SKIP without an
                  account, not a refusal. */}
              {!hasPrices && (
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
