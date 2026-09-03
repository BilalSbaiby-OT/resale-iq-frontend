"use client"
import { useState } from "react"
import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import { Lock, Search, Loader2 } from "lucide-react"
import { watchedSampleNote } from "@/lib/watched-sample"
import { TRIAL_LIMITS_SHORT_BY_LOCALE } from "@/lib/trial-copy"
import { copy, type Locale } from "@/lib/i18n"
import { canonicalPath } from "@/lib/locale-routes"

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
  // BRAND_AVERAGE is a real ANSWER, not a refusal, so it must not share the grey
  // used for UNKNOWN and INSUFFICIENT_DATA. Blue: informative, deliberately not
  // the green of BUY -- it is a brand-level average, not a per-item call.
  BRAND_AVERAGE: "#60a5fa",
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

// --- INSUFFICIENT_DATA copy (defect 2, 2026-09-01; localised 2026-09-01) ---
// The English strings for this branch now live in src/lib/i18n.ts under
// `copy[locale].checker.insufficient*`, keyed to match this branch's
// designer-owned wording exactly (see the INSUFFICIENT_DATA render branch
// below for the reasoning this branch does not touch: backend-owned
// res.message/res.confidence_note still say "comparable sold items" and
// that is a backend-eng fix, not a frontend string-replace).

// Shared by the UNKNOWN (not covered) and INSUFFICIENT_DATA (not enough
// evidence) branches below — both are refusals, both need a next step so
// the screen is not a dead end. designer, 2026-09-01 (defect 3: the row
// existed only on the UNKNOWN branch; INSUFFICIENT_DATA — the state 37 of
// 100 board models land on — had none).
function TryExamplesRow({ onPick, disabled, label }: { onPick: (ex: string) => void; disabled: boolean; label: string }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
        {label}
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
export function FreeChecker({ placeholder, locale = "en" }: { placeholder?: string; locale?: Locale }) {
  const t = copy[locale].checker
  const resolvedPlaceholder = placeholder ?? `${t.placeholderPrefix} Adidas Samba, Nike Air Force 1, New Balance 530`
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
    if (query.length < 2) { setErr(t.enterBrandModel); return }
    if (override) setQ(override)
    setLoading(true); setErr(""); setRes(null); setTimedOut(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VERDICT_TIMEOUT_MS)
    try {
      const r = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      if (!r.ok) throw new Error(t.couldNotCheck)
      setRes(await r.json())
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setTimedOut(true)
      } else {
        setErr(e instanceof Error ? e.message : t.somethingWrong)
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
  const sample = watchedSampleNote(sold, listed, res?.verdict, locale)
  // INSUFFICIENT_DATA no longer reaches this label — it has its own branch
  // below (defect 2, 2026-09-01) so it never renders as a big coloured tag
  // that looks like a verdict.
  // A verdict is a WORD WE SHOW A STRANGER, not a database constant. Found by
  // pulling the last frame out of a marketing video: it rendered
  // "BRAND_AVERAGE" in 26px caps, underscore and all. ffprobe called that video
  // valid; only looking at the picture caught it.
  const VERDICT_LABEL: Record<string, string> = {
    BRAND_AVERAGE: "BRAND AVERAGE",
  }
  const label = res?.verdict === "LIMIT_REACHED" ? t.limitReachedLabel
    : (res?.verdict ? (VERDICT_LABEL[res.verdict] ?? res.verdict) : "—")

  return (
    <div style={{ background: "#12151d", border: "1px solid #1c2333", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") run() }}
          placeholder={resolvedPlaceholder}
          aria-label={t.inputAriaLabel}
          style={{ flex: "1 1 240px", minWidth: 0, background: "#0f1218", border: "1px solid #232c42", borderRadius: 10, padding: "13px 15px", color: "#eef1f7", fontSize: 14.5, outline: "none" }}
        />
        <button
          onClick={() => run()}
          disabled={loading}
          aria-label={loading ? t.checkingAriaLabel : t.checkAriaLabel}
          style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 14.5, border: "none", borderRadius: 10, padding: "13px 22px", cursor: loading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? t.checking : t.checkFree}
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
            {t.timedOutPre}{" "}
            <a href="mailto:support@resaleiq.dev" style={{ color: "#8fa3c4" }}>support@resaleiq.dev</a>{" "}
            {t.timedOutPost}
          </p>
          <button
            onClick={() => run()}
            style={{ marginTop: 8, background: "#1a2030", border: "1px solid #263147", color: "#c3cde0", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
          >
            {t.tryAgain}
          </button>
        </div>
      )}

      {res && (
        <div style={{ marginTop: 18, borderTop: "1px solid #1c2333", paddingTop: 18 }}>
          {res.verdict === "LIMIT_REACHED" ? (
            <div>
              {/* res.message is backend-owned English prose (api/routes.py) with
                  no locale awareness — always show the translated fallback
                  instead of trusting it, never as an ?? default. A French/ES/
                  DE/IT/PT visitor hitting their daily limit is the single most
                  common way to reach this branch, and res.message previously
                  overrode the fallback whenever the backend sent one, which is
                  always. */}
              <p style={{ fontSize: 13.5, color: "#8b99b8" }}>
                {t.limitReachedFallback}
              </p>
              {res.used_today != null && res.limit != null && (
                <p style={{ fontSize: 12, color: "#5b6b8c", marginTop: 4 }}>
                  {t.usedOfLimit(res.used_today, res.limit)}
                </p>
              )}
              {/* Free account before paid tier, per docs/product/SUPPORT-VOICE.md
                  §3: an anon visitor has no account yet, so the smaller ask
                  (register — free, keeps the same 10/day and adds 10 full
                  unlocks/month, no card) comes before the sale. NOT res.upgrade_url: the API
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
                  {t.createFreeAccount}
                </Link>
                {/* W61: was the absolute path "/#pricing" -- on a translated
                    route (FreeChecker is mounted on both "/" and "/<locale>",
                    see landing-content.tsx) that sent a Spanish/French/German/
                    Italian/Portuguese visitor who had just hit their daily
                    limit back to the ENGLISH homepage's pricing section, mid
                    funnel, with no warning. canonicalPath keeps them on their
                    own locale root; the section itself is already translated
                    (pricing-section.tsx reads copy[locale]). */}
                <Link href={`${canonicalPath(locale)}#pricing`} style={{ color: "#8fa3c4", fontSize: 13 }}>
                  {t.seePlans}
                </Link>
              </div>
            </div>
          ) : res.verdict === "UNKNOWN" ? (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              {/* Same reasoning as the LIMIT_REACHED branch above: res.message
                  is backend-owned English prose, never localised. Always show
                  the translated fallback. */}
              <p style={{ fontSize: 14, color: "#c4a574", lineHeight: 1.55 }}>
                {t.unknownFallback}
              </p>
              {/* ux-researcher, roster consult 2026-09-01: turn "this doesn't
                  work" into "it works for THESE" — the narrowing is honest,
                  an empty refusal with no next step reads as broken. */}
              <TryExamplesRow onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} />
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
                {t.insufficientStatement}
              </p>
              <p style={{ fontSize: 12.5, color: "#8fa3c4", marginTop: 6, lineHeight: 1.5 }}>
                {t.insufficientSubtext}
              </p>

              {(res.n ?? res.sold_7d) != null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid #1c2333" }}>
                  <span data-testid="riq-insufficient-n" style={{ fontSize: 22, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>
                    {fmtCount(res.n ?? res.sold_7d)}
                  </span>
                  <span style={{ fontSize: 11, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {t.insufficientNLabel}
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

              <TryExamplesRow onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} />
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              {res.match_note && (
                <p style={{ fontSize: 12.5, color: "#8b99b8", marginBottom: 12 }}>{res.match_note}</p>
              )}

              {hasPrices && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                <Stat label={t.buyBelow} value={money(res.buy_below)} accent="#22c55e" />
                <Stat label={t.marketPrice} value={money(res.sell_avg)} />
                {sold != null ? <Stat label={t.leftShelf} value={fmtCount(sold)} /> : null}
                {listed != null ? <Stat label={t.stillListed} value={fmtCount(listed)} /> : null}
                {res.locked || res.sell_through_rate == null ? (
                  <div style={{ background: "#1a2030", borderRadius: 9, padding: "11px 13px" }}>
                    <div style={{ fontSize: 10.5, color: "#5b6b8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>{t.sellThrough}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#5b6b8c" }}>{res.locked ? t.planLabel : "—"}</div>
                  </div>
                ) : (
                  <Stat label={t.sellThrough} value={res.sell_through_rate} />
                )}
              </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: hasPrices ? 16 : 4 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "0.5px" }}>
                  {label}
                </span>
                <div style={{ fontSize: 12.5, color: "#5b6b8c" }}>
                  {res.category ? `${res.category} · ` : ""}
                  {res.confidence ? `${t.confidenceLabel} ${res.confidence}` : ""}
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
                  {t.headlineOnly} {TRIAL_LIMITS_SHORT_BY_LOCALE[locale]}
                </p>
              )}
            </>
          )}

          {res.verdict !== "UNKNOWN" && res.verdict !== "INSUFFICIENT_DATA" && res.verdict !== "LIMIT_REACHED" && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#0f1720", border: "1px solid #1c3327", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#22c55e" />
              {t.unlockLine}
            </div>
            <SmartCTA anonLabel={t.unlockRest} anonHref="/register?plan=free" authedLabel={t.seeFullNumbers} authedHref="/verdict" style={{ background: "#22c55e", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }} />
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
