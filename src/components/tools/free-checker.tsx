"use client"
import { useState } from "react"
import Link from "next/link"
import { SmartCTA } from "@/components/smart-cta"
import { Lock, Search, Loader2 } from "lucide-react"
import { watchedSampleNote } from "@/lib/watched-sample"
import { TRIAL_LIMITS_SHORT_BY_LOCALE } from "@/lib/trial-copy"
import { copy, type Locale } from "@/lib/i18n"
import { verdictCopy } from "@/lib/verdict-copy"
import { canonicalPath } from "@/lib/locale-routes"
import { ModelChips } from "@/components/tools/model-chips"
import { WORKING_MODELS } from "@/lib/working-models"
import { fieldState } from "@/lib/locked-fields"
import { formatStrPct } from "@/lib/str-pct"
import { verdictWord, confidenceBand, categoryName, localizeConfidenceNote } from "@/lib/verdict-words"

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
  // The list of fields the server actually withheld. `locked` is a constant
  // false and cannot be used to detect gating — see src/lib/locked-fields.ts
  // for the production curl that proves it. This is the field to branch on.
  locked_fields?: string[]
  message?: string
  buy_below?: number | null
  sell_avg?: number | null
  n?: number | null
  sold_7d?: number | null
  active_listings?: number | null
  confidence?: string
  confidence_note?: string
  // True when the call rests on momentum, speed and sold prices alone because
  // sell-through history is still maturing (api/routes.py `_provisional_verdict`).
  // The server has always sent this on the anonymous payload (`_gate` passes it
  // through); this card was the one verdict surface that never rendered it.
  provisional?: boolean | null
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
  // Only populated on BRAND_CATEGORIES (api/routes.py) — a brand-only query
  // with no garment named. brand/categories/next_step are structured, so the
  // frontend builds its own translated sentence instead of trusting
  // res.message (English-only prose), same reasoning as LIMIT_REACHED/
  // UNKNOWN above.
  brand?: string
  categories?: string[]
  next_step?: string
  // Added alongside BRAND_CATEGORIES (2026-09-04, conversion fix): a
  // category-level aggregate — same public class as BRAND_AVERAGE's
  // sell_avg, never per-model — for each category named above, most
  // departures first. Lets the bare-brand screen show a real price instead
  // of only a list of garment words to retype.
  category_aggregates?: {
    category: string
    sold_7d: number
    avg_price_eur: number | null
  }[]
}

// Verdict colour vs. system/quota colour are two different channels — see
// design/tokens.json known_splits and docs/product/DESIGN-REVIEW.md §2.
// WATCH was hardcoded to a drifted #FF9F0A instead of the real --color-watch
// token (#FF9F0A), and LIMIT_REACHED — a quota state with nothing to do with
// the item — was wearing that same amber. Amber must mean one thing: the
// WATCH verdict. LIMIT_REACHED gets the neutral --color-unknown grey instead.
// roster consult 2026-09-01.
const VERDICT_COLOR: Record<string, string> = {
  BUY: "#34C759",
  WATCH: "#FF9F0A",
  SKIP: "#FF453A",
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

/**
 * The server sends sell-through as an already-formatted STRING, so this card
 * re-derives the number and re-applies the one shared rule (src/lib/str-pct.ts)
 * rather than trusting the spelling it arrived in.
 *
 * This replaces a local formatter that could not fix the bug it was written
 * for: it returned `raw` unchanged when the parsed value was 0, so the two
 * spellings that actually reach a customer as a falsehood — "0%" and "0.0%" —
 * were the exact two it passed straight through. It also duplicated a rule
 * that has to hold identically on five other surfaces.
 *
 * A string that is not a percentage at all (already "<0.1%", or copy the
 * backend changed) is passed through untouched — inventing a number from an
 * unparseable string would be worse than showing what the server said.
 */
function formatSellThrough(raw: string): string {
  const m = raw.trim().match(/^(-?[\d.]+)\s*%$/)
  if (!m) return raw
  return formatStrPct(Number(m[1])) ?? raw
}

// The catalogue is 26 brands, model-level, sneaker/streetwear-coded — not
// "any Vinted item." A refusal is the right answer for most typed-in queries
// (insufficient_data_rate = 40.9% of answered searches, METRICS.md), but the
// UI should turn that into "it works for THESE" rather than an empty box.
// Each of these is a query independently confirmed LIVE (2026-09-09) as
// returning WATCH with a real buy-below — so a dead-ended user who clicks a
// rescue chip lands on a compelling YES, not another SKIP. Re-verify against
// /api/verdict before changing (never-manufacture-proof): New Balance 530
// (WATCH, buy_below €24, sold_7d 378), Levi's 501 (WATCH, €13), New Balance
// 550 (WATCH, €28). The old list (Nike Air Force 1 / Adidas Samba) both
// return SKIP live and sent stuck users to a second dead end.
const TRY_EXAMPLES = ["New Balance 530", "Levi's 501", "New Balance 550"]

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

// Placeholder examples must be brands/models the catalogue actually prices —
// 26 brands, sneaker/streetwear-coded (Nike, Adidas, Jordan, New Balance).
// "Levi's 501" gestured at general vintage resale the catalogue does not
// cover, which reads as a lie of omission to a casual flipper who tries it
// and gets refused. ux-researcher, roster consult 2026-09-01.
export function FreeChecker({
  placeholder, locale = "en", variant = "card", initialQuery, initialResult,
}: {
  placeholder?: string
  locale?: Locale
  variant?: "card" | "hero"
  initialQuery?: string
  initialResult?: FreeVerdict | null
}) {
  const t = copy[locale].checker
  const resolvedPlaceholder = placeholder ?? `${t.placeholderPrefix} Adidas Samba, Nike Air Force 1, New Balance 530`
  const [q, setQ] = useState(initialQuery ?? "")
  const [res, setRes] = useState<FreeVerdict | null>(initialResult ?? null)
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
  // WATCHED DEPARTURES ONLY. This was `res.sold_7d ?? res.n`, and `n` is NOT a
  // departure count — it is `comparable_n`, the fenced subset of clean comps the
  // confidence band and the price stats are computed from (api/routes.py
  // `_verdict_display_n`). Production, Adidas Samba: sold_7d 43, n 20. The
  // fallback therefore put the comparable count under the "Left shelf (watched)"
  // label and inside "N left the shelf vs M still listed" — a real number
  // answering a different question than the label asks.
  //
  // No substitute is honest here, so there is none: when sold_7d is absent the
  // tile and the sample sentence simply do not render. (Live check 2026-09-05:
  // 0 of 100 catalogue rows have a null/0 sold_7d with a positive comparable_n,
  // so this fallback was never firing in production — it was a latent mislabel,
  // removed before it could.)
  const sold = res?.sold_7d
  const listed = res?.active_listings
  const hasPrices = res?.buy_below != null || res?.sell_avg != null
  // Gated / present / genuinely unmeasured — three states, never collapsed
  // into one dash. See src/lib/locked-fields.ts.
  const strState = fieldState(res?.sell_through_rate, res?.locked_fields, "sell_through_rate")
  // Scope note: `top_sizes`, `size_velocity`, `months_supply`, `reasons` and
  // `opportunity_score` are also in this payload's locked_fields, but this hero
  // has never rendered them at all — there is no dash to fix. Surfacing them
  // as new gated tiles is an upsell change, not this rendering fix, so it stays
  // out. The authenticated /verdict card DOES render two of them; those are
  // fixed there.
  // Same destination the unlock CTA at the foot of this card already uses for
  // an anonymous visitor (SmartCTA anonHref below): the job here is an account,
  // not a plan — the deep fields are inside the free tier's monthly unlocks.
  // canonicalPath keeps a /es /fr /de /it /pt visitor on their own locale
  // instead of dropping them on the English register page mid-funnel (W61).
  const unlockHref = `${canonicalPath(locale, "/register")}?plan=free`
  const sample = watchedSampleNote(sold, listed, res?.verdict, locale)
  // INSUFFICIENT_DATA no longer reaches this label — it has its own branch
  // below (defect 2, 2026-09-01) so it never renders as a big coloured tag
  // that looks like a verdict.
  // A verdict is a WORD WE SHOW A STRANGER, not a database constant. Found by
  // pulling the last frame out of a marketing video: it rendered
  // "BRAND_AVERAGE" in 26px caps, underscore and all. ffprobe called that video
  // valid; only looking at the picture caught it. That fix only replaced the
  // underscore-and-caps constant with a human phrase — it stayed hardcoded
  // English in all 6 locales until this pass (a French/ES/DE/IT/PT stranger
  // is still a stranger). LIVE-VERIFIED via CDP-driven Chrome, production,
  // 2026-09-03: q="chaqueta/veste/Jacke/giacca/casaco Carhartt" on
  // /es /fr /de /it /pt all rendered the literal English "BRAND AVERAGE"
  // mid-sentence in an otherwise fully-translated card.
  const VERDICT_LABEL: Record<string, string> = {
    BRAND_AVERAGE: t.brandAverageLabel,
  }
  // ...and BUY/WATCH/SKIP were the last three constants still falling through
  // to the raw enum. Live /es, 2026-09-05: a 26px green "BUY" over an
  // otherwise Spanish card. verdict-words.ts translates the three; everything
  // else (BRAND_AVERAGE above, LIMIT_REACHED below) keeps its existing branch.
  const label = res?.verdict === "LIMIT_REACHED" ? t.limitReachedLabel
    : (res?.verdict
        ? (VERDICT_LABEL[res.verdict] ?? verdictWord(res.verdict, locale) ?? res.verdict)
        : "—")
  const shownCategory = categoryName(res?.category, locale)
  const shownConfidence = confidenceBand(res?.confidence, locale)
  const shownNote = localizeConfidenceNote(res?.confidence_note, locale)

  const hero = variant === "hero"
  return (
    <div style={hero ? { background: "transparent", padding: 0 } : { background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 14, padding: 20 }}>
      <div className="riq-checker-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") run() }}
          placeholder={resolvedPlaceholder}
          aria-label={t.inputAriaLabel}
          style={{ background: "var(--color-bg-2)", border: hero ? "1px solid var(--color-border-2)" : "1px solid var(--color-border)", borderRadius: hero ? 12 : 10, padding: hero ? "15px 16px" : "13px 15px", color: "#eef1f7", fontSize: hero ? 16 : 15, fontWeight: 400, outline: "none" }}
        />
        <button
          onClick={() => run()}
          disabled={loading}
          aria-label={loading ? t.checkingAriaLabel : t.checkAriaLabel}
          style={{
            background: hero ? "var(--color-on-graphite)" : "#34C759",
            color: hero ? "var(--color-graphite)" : "#06090c",
            fontWeight: hero ? 600 : 700,
            fontSize: hero ? 15 : 14.5,
            border: "none",
            borderRadius: hero ? "var(--radius-control)" : 10,
            padding: hero ? "15px 22px" : "13px 22px",
            cursor: loading ? "wait" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? t.checking : t.checkFree}
        </button>
      </div>

      {err && <p style={{ color: "#FF453A", fontSize: 13, marginTop: 12 }}>{err}</p>}

      {timedOut && (
        <div style={{ marginTop: 12 }}>
          {/* Proposed copy, docs/product/SUPPORT-VOICE.md §4 "same failure
              path" row — this IS that failure path (a request that may have
              reserved quota server-side and then never answered), so its
              honest-about-the-spend wording applies verbatim. */}
          <p style={{ color: "#FF9F0A", fontSize: 13, lineHeight: 1.55 }}>
            {t.timedOutPre}{" "}
            <a href="mailto:support@resaleiq.dev" style={{ color: "#8fa3c4" }}>support@resaleiq.dev</a>{" "}
            {t.timedOutPost}
          </p>
          <button
            onClick={() => run()}
            style={{ marginTop: 8, background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-2)", color: "#c3cde0", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}
          >
            {t.tryAgain}
          </button>
        </div>
      )}

      {res && (
        <div
          className={hero ? "animate-fade-in" : undefined}
          data-testid={hero ? "riq-result-card" : undefined}
          style={hero
            // Graphite, not the navy --color-surface. The fold above this card
            // was redesigned to the graphite scale; the result face is the
            // first thing a stranger sees AFTER using the product, and it was
            // still wearing the dashboard's blue. --color-graphite is the
            // existing token for that surface — no new colour is authored here.
            ? { marginTop: "var(--space-3)", background: "var(--color-graphite)", border: "1px solid var(--color-hairline)", borderRadius: "var(--radius-card)", padding: "var(--space-card-pad)" }

            : { marginTop: 18, borderTop: "1px solid var(--color-border-ui)", paddingTop: 18 }}
        >
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
                  href={`${canonicalPath(locale, "/register")}?plan=free`}
                  style={{ background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none" }}
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
              <p style={{ fontSize: 14, color: "#FF9F0A", lineHeight: 1.55 }}>
                {t.unknownFallback}
              </p>
              {/* ux-researcher, roster consult 2026-09-01: turn "this doesn't
                  work" into "it works for THESE" — the narrowing is honest,
                  an empty refusal with no next step reads as broken. */}
              <ModelChips onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} examples={TRY_EXAMPLES} />
            </>
          ) : res.verdict === "BRAND_CATEGORIES" ? (
            // A brand-only query — the backend recognises the brand but has no
            // garment to price. Previously fell through to the default
            // BUY/WATCH/SKIP/BRAND_AVERAGE branch below, which rendered the raw
            // enum string "BRAND_CATEGORIES" as a coloured verdict tag (same
            // class of bug the VERDICT_LABEL comment above already fixed once
            // for BRAND_AVERAGE) and a misleading "unlock the market price"
            // upsell for a query that was never priced at all. This branch
            // builds a real translated sentence from the structured fields
            // instead of trusting res.message (English-only prose). Category
            // names (Jackets, Hoodies, ...) stay untranslated, same convention
            // as the BRAND_AVERAGE card's "Carhartt Jackets" — catalogue
            // taxonomy, not prose.
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.brand ?? res.product ?? q}</div>
              <p style={{ fontSize: 14, color: "#FF9F0A", lineHeight: 1.55 }}>
                {t.brandCategoriesIntro(
                  res.brand ?? q,
                  new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(res.categories ?? [])
                )}
              </p>
              {/* The conversion fix: category_aggregates turns the bare-brand
                  screen from a list of garment words into real prices, most
                  departures first (backend already ranks it). Aggregate only
                  — same public class as BRAND_AVERAGE's sell_avg, never a
                  per-model buy-below. Category names stay untranslated, same
                  convention as the intro sentence above. */}
              {res.category_aggregates && res.category_aggregates.length > 0 && (
                <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                  {res.category_aggregates.map(a => (
                    <div
                      key={a.category}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "baseline",
                        background: "var(--color-surface-elevated)", borderRadius: 9, padding: "9px 12px",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#eef1f7" }}>{a.category}</span>
                      <span style={{ fontSize: 12.5, color: "#8b99b8" }}>
                        {money(a.avg_price_eur)} {t.avg} · {t.leftShelfCount(fmtCount(a.sold_7d))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <ModelChips onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} examples={WORKING_MODELS} />
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

              {res.n != null && (
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--color-border-ui)" }}>
                  <span data-testid="riq-insufficient-n" style={{ fontSize: 22, fontWeight: 700, color: "#eef1f7", letterSpacing: "-0.5px" }}>
                    {fmtCount(res.n)}
                  </span>
                  <span style={{ fontSize: 12, color: "#5b6b8c", letterSpacing: "0.1px" }}>
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

              {shownCategory && (
                <div style={{ fontSize: 11, color: "#5b6b8c", marginTop: 10 }}>{shownCategory}</div>
              )}

              <ModelChips onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} examples={TRY_EXAMPLES} />
            </div>
          ) : hero ? (
            // THE PUBLIC RESULT FACE (homepage `/` only — /tools keeps the card
            // branch below unchanged).
            //
            // What this replaced and why: a row of raised #1a2030 tiles, each
            // with a micro-caps label, a green €-figure in one and an amber
            // 26px verdict beneath — the dashboard aesthetic, directly under a
            // hero that had just been rebuilt on the graphite scale. A stranger
            // met a calm page, pressed the one button on it, and landed on a
            // telemetry board. That inconsistency is the whole defect.
            //
            // The shape now answers the question the search asked, in the order
            // a person asks it: WHICH item (caption) → WHAT is the call
            // (the verdict, the largest thing on the card) → ON WHAT EVIDENCE
            // (category, confidence, provisional) → THE NUMBERS (a short list,
            // not a grid of boxes) → the caveat.
            //
            // Constraints this deliberately keeps:
            //  - Two figures, never more: buy-below and sold_7d. `n` is not a
            //    departure count and never appears beside them (#54).
            //  - sell_through_rate stays gated, named, and never substituted.
            //  - The provisional qualifier rides on the verdict line, not in a
            //    footnote.
            //  - No CTA. e2e/smoke pins E-13 (#59): no /register link, no
            //    "Plan"/"Unlock" in the gated slot, one Check control in the
            //    fold. See docs note in the report — the "one filled accent
            //    CTA" this pass was briefed to leave behind is the Check
            //    button itself; adding a second would reopen #59.
            <>
              <div style={{ fontSize: "var(--text-meta)", fontWeight: 500, color: "var(--color-text-dim)" }}>
                {res.product ?? q}
              </div>
              <div style={{ marginTop: 2, fontSize: "var(--text-title)", fontWeight: 600, color, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {label}
              </div>
              <div style={{ marginTop: 4, fontSize: "var(--text-meta)", color: "var(--color-text-dim)" }}>
                {shownCategory ? `${shownCategory} · ` : ""}
                {shownConfidence ? `${t.confidenceLabel} ${shownConfidence}` : ""}
                {res.provisional ? `${res.confidence ? " · " : ""}${verdictCopy[locale].provisional}` : ""}
              </div>
              {res.match_note && (
                <p style={{ marginTop: "var(--space-1)", fontSize: "var(--text-meta)", color: "var(--color-text-dim)", lineHeight: 1.5 }}>{res.match_note}</p>
              )}

              {hasPrices && (
                // Capped, not full-bleed. Left to itself the list spans the
                // whole 620px card and the eye travels the width of the fold to
                // pair "Buy-below" with "€20" — which is what made the old tile
                // grid feel like a readout. 420px is wide enough for the
                // longest label in the six locales ("Precio máximo de compra")
                // and short enough that a label and its number read as one
                // line. `min()` so 390px keeps its gutter.
                <div data-testid="riq-answer-rows" style={{ marginTop: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-hairline)", display: "grid", gap: "var(--space-1)", maxWidth: "min(100%, 420px)" }}>
                  <AnswerRow label={t.buyBelow} value={money(res.buy_below)} />
                  {/* Public demand on the fold is sold_7d (watched departures),
                      never comparable_n. Market price and still-listed stay on
                      /tools. */}
                  {sold != null && <AnswerRow label={t.leftShelf} value={fmtCount(sold)} />}
                  {strState === "value" ? (
                    <AnswerRow label={t.sellThrough} value={formatSellThrough(res.sell_through_rate!)} />
                  ) : strState === "locked" ? (
                    <GatedRow label={t.sellThrough} note={t.gatedFreeAccount} />
                  ) : null}
                </div>
              )}

              {shownNote && (
                <p style={{ marginTop: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-hairline)", fontSize: "var(--text-meta)", color: "var(--color-text-dim)", lineHeight: 1.5 }}>
                  {shownNote}
                </p>
              )}

              {!hasPrices && (
                <p style={{ marginTop: "var(--space-2)", fontSize: "var(--text-meta)", color: "var(--color-text-dim)", lineHeight: 1.5 }}>
                  {t.headlineOnly} {TRIAL_LIMITS_SHORT_BY_LOCALE[locale]}
                </p>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 15, color: "#eef1f7", fontWeight: 600, marginBottom: 8 }}>{res.product ?? q}</div>
              {res.match_note && (
                <p style={{ fontSize: 12.5, color: "#8b99b8", marginBottom: 12 }}>{res.match_note}</p>
              )}

              {hasPrices && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
                <Stat label={t.buyBelow} value={money(res.buy_below)} accent="#34C759" />
                <Stat label={t.marketPrice} value={money(res.sell_avg)} />
                {sold != null ? <Stat label={t.leftShelf} value={fmtCount(sold)} /> : null}
                {listed != null ? <Stat label={t.stillListed} value={fmtCount(listed)} /> : null}
                {/* THE P0 BUG THIS BRANCH USED TO CARRY: the condition was
                    `res.locked || res.sell_through_rate == null`, and the value
                    was `res.locked ? t.planLabel : "—"`. Because `res.locked`
                    is the constant false on every backend branch (see
                    src/lib/locked-fields.ts for the production curl), the FIRST
                    half only ever matched via the null check and the SECOND
                    half only ever chose "—". The gated-copy path was
                    unreachable: every visitor to the homepage hero saw a bare
                    dash over the sell-through slot, which reads as "this
                    product is broken" rather than "this is behind a plan".
                    The API had been naming the withheld fields in
                    `locked_fields` the whole time; the UI just never read it.

                    Now: gated -> a lock and a route that unlocks it; genuinely
                    unmeasured -> no tile at all, because an empty slot is
                    honest and a dash pretending to be a number is not. */}
                {strState === "value" ? (
                  <Stat label={t.sellThrough} value={formatSellThrough(res.sell_through_rate!)} />
                ) : strState === "locked" ? (
                  <LockedStat label={t.sellThrough} href={unlockHref} value={t.planLabel} cta={t.unlockRest} />
                ) : null}
              </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: hasPrices ? 16 : 4 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "0.5px" }}>
                  {label}
                </span>
                {/* PROVISIONAL IS PART OF THE CALL, NOT A FOOTNOTE. A provisional
                    verdict rests on momentum and price only, with sell-through
                    still maturing (api/routes.py `_provisional_verdict`), and it
                    is what the public checker returns for every BUY in the
                    catalogue today — production 2026-09-05: Nike Air Force 1 Low,
                    Gucci Rhyton/Ace/Dionysus, Levi's 512 all `provisional: true`.
                    The authenticated /verdict card has always shown this
                    ((dashboard)/verdict/page.tsx); this one printed a bare "BUY ·
                    Confidence MEDIUM" over the same payload, which claims a
                    settled verdict the API did not issue.
                    Copy is reused from verdictCopy, already translated in all six
                    locales — not re-invented in i18n.ts's checker dictionary.

                    NO BARE "· n=11" CHIP HERE. #53 added one to keep a thin
                    sample visible next to BUY — right goal, wrong instrument.
                    `n` is comparable_n; `sold_7d` is watched departures; on
                    AF1 Low they are 11 and 20. The chip put the first, with no
                    label, two lines above "20 left the shelf" — two departure
                    counts to a reseller, one of which is unexplained, and a
                    silent restatement of the confidence_note directly beneath
                    it. That note is rendered unconditionally below and says the
                    same thing WITH a label, so #53's intent survives and the
                    ambiguity does not.

                    The category and the band are read through verdict-words.ts
                    rather than printed raw: on /es this line rendered
                    "Sneakers · Confianza MEDIUM", an English noun and an
                    English band either side of a translated label. */}
                <div style={{ fontSize: 12.5, color: "#5b6b8c" }}>
                  {shownCategory ? `${shownCategory} · ` : ""}
                  {shownConfidence ? `${t.confidenceLabel} ${shownConfidence}` : ""}
                  {res.provisional ? `${res.confidence ? " · " : ""}${verdictCopy[locale].provisional}` : ""}
                </div>
              </div>

              {shownNote && (
                <p style={{ marginTop: 10, fontSize: 13, color: "#FF9F0A" }}>{shownNote}</p>
              )}
              {/* XOR: "left the shelf" is sold_7d, never also n. The homepage
                  fold does not render this sentence at all (it has its own
                  branch above and restating two counts there would be a third
                  and fourth figure); /tools keeps it, built from sold_7d +
                  active_listings only. */}
              {sample && (
                <p style={{ marginTop: 10, fontSize: 13.5, color: "#FF9F0A", lineHeight: 1.55 }}>{sample}</p>
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

          {/* Hero keeps a single primary CTA (Check). The green Unlock /
              Open-dashboard bar competes with it above the fold, so it stays
              on the /tools card only. The gated sell-through tile below is
              the remaining unlock and still routes ?plan=free. */}
          {!hero && res.verdict !== "UNKNOWN" && res.verdict !== "INSUFFICIENT_DATA" && res.verdict !== "LIMIT_REACHED" && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#34C759" />
              {t.unlockLine}
            </div>
            <SmartCTA anonLabel={t.unlockRest} anonHref="/register?plan=free" authedLabel={t.seeFullNumbers} authedHref="/verdict" style={{ background: "#34C759", color: "#06090c", fontWeight: 700, fontSize: 13.5, padding: "10px 18px", borderRadius: 9, textDecoration: "none", whiteSpace: "nowrap" }} />
          </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "var(--color-surface-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--color-border-ui)" }}>
      <div style={{ fontSize: 12, color: "#5b6b8c", letterSpacing: "0.1px" }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: accent || "#eef1f7", marginTop: 3, letterSpacing: "-0.3px", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  )
}

/**
 * A withheld field, wearing the same tile as a real one so the row does not
 * develop a hole — but unmistakably a lock, and clickable.
 *
 * Three things this must keep doing:
 *  - Say WHICH field is gated. The label stays ("Sell-through"), so the visitor
 *    learns the product measures it. A tile that hid the label too would just
 *    be a smaller absence.
 *  - Never imply a value. There is no number here, blurred or otherwise — the
 *    server omitted it (docs: src/lib/locked-fields.ts). No "62%" behind a
 *    filter, no fake bar, no placeholder digits.
 *  - Be a route, not a sign. The whole tile is the link; a lock with no way
 *    through is the same dead end as the dash it replaced, just prettier.
 *
 * Copy is reused, not invented: `sellThrough`, `planLabel` and `unlockRest`
 * already ship in all six locales (src/lib/i18n.ts) — `planLabel` was written
 * for exactly this slot and had been unreachable since the gate flag went
 * constant.
 *
 * `quiet` — the hero variant. Sell-through IS the product story, and on the
 * landing page it was being told by a padlock, the word "Plan" at 15px/700 and
 * a green "Unlock the rest →" sitting inline among the core metrics, above the
 * fold on a 390px screen. Three unlock signals in one 140px tile, louder than
 * the buy-below beside it: the first thing a stranger read about our best
 * metric was that they could not have it.
 *
 * Quiet keeps all three obligations above and drops only the volume: the label
 * stays, the lock glyph stays (grey, at text size, not amber), the whole tile
 * stays a link to the same ?plan=free route, and `cta` moves into the tooltip
 * and the accessible name instead of a green line. It must never become a bare
 * dash — that was the P0 this component exists to fix (src/lib/locked-fields.ts),
 * and `strState === "locked"` still renders a tile, not nothing.
 */

/**
 * One line of the homepage answer: what we measured, and the number.
 *
 * Not a tile. The five raised boxes this replaced were the "bingo board" an
 * outside look flagged — each one drew a border around a single number, which
 * on a card holding two numbers is four more edges than there is information.
 * A label and a value on one baseline says the same thing and lets the verdict
 * above it stay the loudest object on the card.
 *
 * No accent colour on the value. The graphite scale spends its one accent on a
 * single filled CTA; a green buy-below and an amber verdict on the same card is
 * two accents arguing. The verdict word keeps its BUY/WATCH/SKIP colour because
 * that is a semantic channel (design/tokens.json known_splits), not decoration.
 */
function AnswerRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)" }}>
      <span style={{ fontSize: "var(--text-body-app)", color: "var(--color-text-dim)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-body-app)", fontWeight: 600, color: "var(--color-on-graphite)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  )
}

/**
 * The same line, for a field the server withheld.
 *
 * Keeps every obligation the tile version documents above — name the field,
 * never imply a value, never a bare dash — and adds back the one it had lost.
 * E-13 (#59) removed the Plan/Unlock LINK from the fold for a good reason (a
 * second CTA competing with Check), but what shipped was a labelled box
 * containing a padlock and nothing else: `innerText` on production, 2026-09-06,
 * was literally "SELL-THROUGH" followed by an empty line. That reads as a
 * broken tile, which is the exact impression src/lib/locked-fields.ts exists to
 * prevent — it just swapped one wordless state ("—") for another.
 *
 * So: the condition is stated in words, in all six locales, and it is still not
 * a CTA. No href, no accent, no "Unlock"/"Plan" verb — e2e/smoke.spec.ts pins
 * all three, and those assertions are E-13's and stay green.
 */
function GatedRow({ label, note }: { label: string; note: string }) {
  return (
    <div
      data-testid="riq-locked-stat"
      data-locked-field="sell_through_rate"
      style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)" }}
    >
      <span style={{ fontSize: "var(--text-body-app)", color: "var(--color-text-dim)" }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--text-meta)", color: "var(--color-text-dim)" }}>
        <Lock size={12} aria-hidden />
        {note}
      </span>
    </div>
  )
}

function LockedStat({ label, value, cta, href }: {
  label: string; value: string; cta: string; href: string
}) {
  return (
    <Link
      href={href}
      data-testid="riq-locked-stat"
      data-locked-field="sell_through_rate"
      title={cta}
      aria-label={`${label} — ${value}. ${cta}`}
      style={{
        background: "var(--color-surface-elevated)", borderRadius: 10, padding: "12px 14px",
        border: "1px solid var(--color-border-ui)", textDecoration: "none", display: "block",
      }}
    >
      <div style={{ fontSize: 12, color: "#5b6b8c", letterSpacing: "0.1px" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
        <Lock size={14} color="#FF9F0A" aria-hidden />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#c3cde0" }}>{value}</span>
      </div>
      <div style={{ fontSize: 10.5, color: "#34C759", fontWeight: 600, marginTop: 3 }}>{cta}</div>
    </Link>
  )
}
