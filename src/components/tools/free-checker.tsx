"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Lock, Unlock, Search, Loader2 } from "lucide-react"
import { watchedSampleNote } from "@/lib/watched-sample"
import { TRIAL_LIMITS_SHORT_BY_LOCALE } from "@/lib/trial-copy"
import { copy, type Locale } from "@/lib/i18n"
import { verdictCopy } from "@/lib/verdict-copy"
import { canonicalPath } from "@/lib/locale-routes"
import { DigestSubscribe } from "@/components/tools/digest-subscribe"
import { ModelChips } from "@/components/tools/model-chips"
import { RegisterCheckVintedItemTool } from "@/components/tools/register-check-vinted-item-tool"
import { HardPaywallCard } from "@/components/ui/hard-paywall-card"
import { CoverageMissCard } from "@/components/ui/coverage-miss-card"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { Aw26ReportCta } from "@/components/ui/aw26-report-cta"
import { useAuthStore } from "@/lib/auth-store"
import { planChip } from "@/lib/entitlement"
import { checkerUnlockBranch, checkerRefusalIsPaid } from "@/lib/checker-unlock-state"
import { getToken, getPlanFromToken } from "@/lib/utils"
import type { Plan, User } from "@/types"
import {
  CHECK_VINTED_ITEM_DESCRIPTION,
  CHECK_VINTED_ITEM_NAME,
  CHECK_VINTED_ITEM_QUERY_DESCRIPTION,
} from "@/lib/webmcp-tools"
import "@/types/webmcp-jsx"
import { FREE_MODELS } from "@/lib/working-models"
import { fieldState } from "@/lib/locked-fields"
import { parsePaywallBody, type PaywallPlan } from "@/lib/hard-paywall"
import { checkerFace } from "@/lib/query-coverage"
import { collectVerdictMetrics, hasVerdictIntelligence, type ReconstructedSignals } from "@/lib/verdict-intelligence"
import { formatStrPctString } from "@/lib/str-pct"
import { verdictWord, confidenceBand, categoryName, localizeConfidenceNote } from "@/lib/verdict-words"
import { trackEvent } from "@/lib/analytics"

// 10s: long enough for a real answer (matches the extension's own budget,
// extension/background.js), short enough that a hung request — the PENDING
// rows docs/audit/MONETIZATION.md §4 traced to zero exception handling
// between the anon-quota debit and its resolution — doesn't leave the
// spinner running forever. See the `timedOut` branch below.
const VERDICT_TIMEOUT_MS = 10_000

function fmtCount(n: number | null | undefined): string {
  return n != null && Number.isFinite(n) ? n.toLocaleString("en-GB") : "—"
}

// Public checker. HARD_PAYWALL: anonymous callers get buy-below only on the
// three free models (Samba / AF1 / NB 530). Everything else is HTTP 402.
// STR, demand, sizes and history stay behind the plan. Never invent numbers:
// only render fields the API sent. Number first, letter second, sample third
// — SKIP without counts reads as "this model does not sell".

interface FreeVerdict extends ReconstructedSignals {
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
  /** 30-day aggregate sales count — present for shelf-blind models admitted
   *  on 30d evidence. NOT weekly departures; must be labelled differently. */
  sold_30d_evidence?: number | null
  /** Human-readable 30-day evidence string, e.g. "88 sold in 30 days (...)". */
  demand_note?: string | null
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
  plans?: PaywallPlan[]
  /** Number of data points held for this query (teaser — not a paid field).
   *  Sent by the backend on 402 when the brand is in-universe. 2026-09-21. */
  comparable_n?: number | null
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
  // OVERSUPPLIED (2026-09-22): heavy live supply, ~zero departures. A real
  // answer ("do not stock this"), not a refusal — deliberately NOT reusing
  // `categories`, which is typed string[] for BRAND_CATEGORIES and rendered
  // through Intl.ListFormat.
  oversupply_categories?: {
    category: string
    live_listings: number
    avg_price_eur: number | null
    departures_7d: number
  }[]
  live_listings_total?: number
  /** Backend-supplied alternatives for this query — items with stronger 30-day
   *  demand. Present on verdicts. buy_below_locked=true means price is paid-only. */
  alternatives?: {
    brand: string
    model: string
    category: string
    sold_30d: number
    demand_note: string
    avg_price_eur: number | null
    momentum: string
    buy_below_locked: boolean
  }[]
  /** Backend-supplied note explaining why these alternatives are shown. */
  alternatives_note?: string | null
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
  PAYWALL: "#8b99b8",
  // BRAND_AVERAGE is a real ANSWER, not a refusal, so it must not share the grey
  // used for UNKNOWN and INSUFFICIENT_DATA. Blue: informative, deliberately not
  // the green of BUY -- it is a brand-level average, not a per-item call.
  BRAND_AVERAGE: "#60a5fa",
  // OVERSUPPLIED is an ANSWER ("do not stock this"), not a refusal, so it must
  // not take the grey of UNKNOWN/PAYWALL. Red = the same "don't put money in"
  // meaning SKIP carries, because that is exactly what it means.
  OVERSUPPLIED: "#FF453A",
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
  return formatStrPctString(raw) ?? raw
}

// Anon chips must be models that still 200 with buy-below. Live 2026-09-21:
// Adidas Samba, Nike Air Force 1, New Balance 530 → 200. Levi's 501 and
// New Balance 550 → 402 paywall. Never advertise those as free.
const TRY_EXAMPLES = FREE_MODELS

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

// H47 CRO: LIMIT_REACHED upgrade component — paid CTA primary, free account secondary.
// A visitor who ran 10 checks in one session is the warmest possible lead;
// the old branch sent them to "Create a free account" (€0) instead of Starter (€19).
// This fixes the CTA hierarchy: paid button first, free account as a secondary link.
// Pattern matches HardPaywallCard: guest checkout goes straight to Stripe.
// CRO #8 (behavioral trigger: hit the limit = proof of intent) + #12 (earned urgency).
// Revenue 2026-09-16.
function LimitReachedUpgrade({
  locale,
  used,
  limit,
}: {
  locale: Locale
  used?: number | null
  limit?: number | null
}) {
  const t = copy[locale].checker

  return (
    <div data-testid="riq-limit-reached-upgrade">
      <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 14 }}>
        {t.limitReachedUpgradeBody}
      </p>
      {used != null && limit != null && (
        <p style={{ fontSize: 12, color: "#5b6b8c", marginTop: -10, marginBottom: 14 }}>
          {t.usedOfLimit(used, limit)}
        </p>
      )}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <GuestCheckoutButton locale={locale} label={t.limitReachedUpgradeCta} src="limit_reached" />
        {/* W61 note applies here too: canonicalPath keeps locale-prefixed visitors on
            the right locale root for the pricing section. */}
        <Link
          href={canonicalPath(locale, "/login")}
          style={{ color: "#8fa3c4", fontSize: 13, textDecoration: "none" }}
        >
          {t.createFreeAccount}
        </Link>
      </div>
      {/* AW26 secondary CTA: one-off EUR49 for visitors who won't subscribe.
          No account needed, converts cold traffic. Single source: Aw26ReportCta.
          Revenue 2026-09-21. */}
      <Aw26ReportCta />
    </div>
  )
}

// Placeholder examples must be brands/models the catalogue actually prices —
// 26 brands, sneaker/streetwear-coded (Nike, Adidas, Jordan, New Balance).
// "Levi's 501" gestured at general vintage resale the catalogue does not
// cover, which reads as a lie of omission to a casual flipper who tries it
// and gets refused. ux-researcher, roster consult 2026-09-01.
// H54 CRO: message-match the paid CTA label to the item just checked.
// When a visitor arrives from a blog post (?src=blog-check) the checker
// auto-runs on their item. The unlock bar used to always read the generic
// "Get full numbers — Starter €19/mo →" regardless of which item was just
// priced — CRO #3 (message match) violation. When src is blog-check and the
// API returned a product name, derive a label like
// "Get [product] numbers — €19/mo →" so the CTA mirrors the item.
// Blog posts are English-only, product names are catalogue English, so this
// path is English-only — other locales fall back to t.unlockRestPaid.
// Revenue 2026-09-16.
function blogModeCtaLabel(product: string | undefined | null): string | null {
  if (!product) return null
  // Keep the label short enough for a button (target ≤35 chars total).
  // For long product names (>22 chars), use the first two tokens
  // (e.g. "Nike Air Force 1 Low Retro" → "Nike Air Force 1").
  const words = product.trim().split(/\s+/)
  const short = product.length <= 22 ? product : words.slice(0, 3).join(" ")
  return `Get ${short} numbers — €19/mo →`
}

/**
 * VerdictAlternatives — renders backend-supplied alternative items below a verdict.
 *
 * WHY THIS EXISTS: 2,786 of 2,798 verdict-runners in the last 14 days ran
 * exactly one check and never came back (99.6% one-and-done). 80% of all
 * searches are three sneaker models whose verdict is usually SKIP or WATCH.
 * The alternatives the backend now supplies ARE the next search — the reason
 * to run a second check. Each row is clickable and fires that item's query.
 *
 * Design rules:
 * - demand_note is backend-owned copy — never substitute "30 days" for "weekly".
 * - avg_price_eur is the honest exit price — label it, never claim it is buy-below.
 * - buy_below_locked:true means the buy-below price is paid-only — show lock,
 *   never leak the number or show a blurred/fake value.
 * - alternatives_note is backend-supplied context copy — use verbatim, do not
 *   paraphrase or invent stronger claims.
 * - Each row is a button that runs that item as a new check (creates second search).
 */
function VerdictAlternatives({
  alternatives,
  alternatives_note,
  locale,
  onRun,
  disabled,
}: {
  alternatives: NonNullable<FreeVerdict["alternatives"]>
  alternatives_note?: string | null
  locale: Locale
  onRun: (query: string) => void
  disabled: boolean
}) {
  const t = copy[locale].checker
  if (alternatives.length === 0) return null
  return (
    <div
      data-testid="riq-verdict-alternatives"
      style={{ marginTop: 16 }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8FA3C4", marginBottom: 8 }}>
        {t.alternativesHeading}
      </div>
      {alternatives_note && (
        <p style={{ fontSize: 12.5, color: "#8FA3C4", marginBottom: 10, lineHeight: 1.5 }}>
          {alternatives_note}
        </p>
      )}
      <div
        style={{
          background: "var(--color-surface, #12151d)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {alternatives.map((alt, i) => (
          <button
            key={`${alt.brand}-${alt.model}`}
            type="button"
            disabled={disabled}
            onClick={() => onRun(`${alt.brand} ${alt.model}`)}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "11px 14px",
              background: "transparent",
              border: "none",
              borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.06)",
              cursor: disabled ? "wait" : "pointer",
              textAlign: "left",
            }}
          >
            {/* Left: brand + model, demand note (30-day NOT weekly) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#EEF1F7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {alt.brand} {alt.model}
              </span>
              <span style={{ fontSize: 11.5, color: "#8FA3C4" }}>
                {/* demand_note is backend-owned: "371 sold in 30 days" — never relabel as weekly */}
                {t.alternativesDemand(alt.demand_note)}
              </span>
            </div>
            {/* Right: avg price + lock on buy-below */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
              {alt.avg_price_eur != null && (
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#EEF1F7", fontVariantNumeric: "tabular-nums" }}>
                  {t.alternativesAvgPrice(`€${Math.round(alt.avg_price_eur)}`)}
                </span>
              )}
              {/* buy_below_locked:true — price is paid-only, show lock label, never leak value */}
              {alt.buy_below_locked && (
                <span style={{ fontSize: 11, color: "#8FA3C4", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Lock size={10} aria-hidden />
                  {t.alternativesBuyBelow}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function paidUserForChip(user: User | null, tokenPlan: string | null): User | null {
  if (user) return user
  if (tokenPlan === "operator" || tokenPlan === "power") {
    return { id: 0, email: "", plan: tokenPlan as Plan }
  }
  return null
}

function PaidPostCheckBar({ locale, user }: { locale: Locale; user: User | null }) {
  const t = copy[locale].checker
  const chip = planChip(user, locale)
  return (
    <div
      data-testid="riq-paid-session-bar"
      style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 10, padding: "14px 16px" }}
    >
      <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
        <Unlock size={14} color="#34C759" />
        {t.paidUnlockLine(chip)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <Link
          href={canonicalPath(locale, "/verdict")}
          data-testid="riq-paid-verdict-cta"
          style={{
            background: "#34C759",
            color: "#06090c",
            fontWeight: 700,
            fontSize: 13.5,
            padding: "10px 18px",
            borderRadius: 9,
            textDecoration: "none",
          }}
        >
          {t.seeFullNumbers}
        </Link>
        <Link
          href={canonicalPath(locale, "/account")}
          data-testid="riq-paid-manage"
          style={{ fontSize: 12, color: "#5b6b8c", textDecoration: "none" }}
        >
          {t.paidManageCta}
        </Link>
      </div>
    </div>
  )
}

export function FreeChecker({
  placeholder, locale = "en", variant = "card", initialQuery, initialResult,
  webmcpName = CHECK_VINTED_ITEM_NAME,
  webmcpDescription = CHECK_VINTED_ITEM_DESCRIPTION,
  src,
}: {
  placeholder?: string
  locale?: Locale
  variant?: "card" | "hero"
  initialQuery?: string
  initialResult?: FreeVerdict | null
  webmcpName?: string
  webmcpDescription?: string
  // H54: traffic source. When "blog-check" the paid CTA is message-matched to
  // the checked item. No effect on hero variant (no CTA bar there).
  src?: string
}) {
  const t = copy[locale].checker
  const resolvedPlaceholder = placeholder ?? `${t.placeholderPrefix} Adidas Samba, Nike Air Force 1, New Balance 530`
  const { user, checkAuth } = useAuthStore()
  const [sessionProbed, setSessionProbed] = useState(false)
  const [tokenPlan, setTokenPlan] = useState<string | null>(null)
  const [q, setQ] = useState(initialQuery ?? "")
  const [res, setRes] = useState<FreeVerdict | null>(initialResult ?? null)
  // True while the card is showing the seeded sample (not a visitor's own
  // search). Drives the "Example" eyebrow so the pre-rendered verdict reads as
  // a sample, not the finished product — the hero input is now empty to invite
  // a real search (2026-09-10 funnel fix).
  const [isExample, setIsExample] = useState<boolean>(!!initialResult)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  // Distinct from `err`: a plain fetch failure never reached the server, but
  // a client-side timeout means the request may well have — the anon quota
  // is claimed atomically before the answer is computed (db/queries.py:2652),
  // so an attempt that times out can still have spent one of the day's 10.
  // Conflating the two would tell someone their count is untouched when it
  // might not be. See docs/product/SUPPORT-VOICE.md §4.
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    void checkAuth().finally(() => {
      setTokenPlan(getPlanFromToken())
      setSessionProbed(true)
    })
  }, [checkAuth])

  // override: set by the "try one of these instead" chips below, which pass
  // a known-good query directly rather than relying on state set via onChange
  // (which wouldn't have committed yet inside the same click handler).
  const run = async (override?: string) => {
    const query = (override ?? q).trim()
    if (query.length < 2) { setErr(t.enterBrandModel); return }
    if (override) setQ(override)
    setLoading(true); setErr(""); setRes(null); setTimedOut(false); setIsExample(false)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VERDICT_TIMEOUT_MS)
    try {
      const token = getToken()
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    const r = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`, { signal: controller.signal, headers })
      let body: unknown = null
      try { body = await r.json() } catch { /* non-JSON error page */ }
      const wall = parsePaywallBody(r.status, body)
      if (wall) {
        // why: 402 is the product under HARD_PAYWALL, not a failed check —
        // this anon visitor already got their one free verdict and is now
        // looking at the checkout card, same as the authed flow logs it
        // (verdict-content.tsx). Not analysis_failed.
        setRes(wall)
        return
      }
      if (!r.ok) throw new Error(t.couldNotCheck)
      setRes(body as FreeVerdict)
      // why: this component is the ONLY anon entry point for ChatGPT-citation
      // and /blog CTA traffic (/tools/vinted-price-checker), but it never
      // fired a funnel event before this fix — every real free check by a
      // stranger was invisible to /api/admin/growth-funnel, which counts
      // free_checks from event IN ('first_analysis','analysis_completed').
      // Measured 2026-09-14: 0 free_checks recorded across 7 days despite
      // confirmed traffic hitting this exact page from chatgpt.com referrer.
      trackEvent("first_analysis")
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setTimedOut(true)
        trackEvent("analysis_failed", undefined, { reason: "network" })
      } else {
        setErr(e instanceof Error ? e.message : t.somethingWrong)
        trackEvent("analysis_failed", undefined, { reason: "generic" })
      }
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  // Auto-run when a ?q= deep-link prefills the input (e.g. /check?q=Nike+Air+Force+1
  // redirected here, or an LLM citation links /tools?q=Model). initialResult means
  // a sample is seeded server-side; don't auto-run over it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initialQuery && !initialResult) run(initialQuery) }, [])

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
  const intel = res ? collectVerdictMetrics(res) : []
  const hasIntel = res ? hasVerdictIntelligence(res) : false
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
  // H59 CRO: route to /login (returning user) not ?plan=free. Under HARD_PAYWALL
  // there is no free item-check path; a free-plan logged-in user who sees a
  // LockedStat is best served by signing in to their existing account.
  // Revenue 2026-09-16.
  const unlockHref = canonicalPath(locale, "/login")
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
  const unlockBranch = checkerUnlockBranch({
    isExample,
    verdict: res?.verdict,
    user,
    tokenPlan,
  })
  const refusalIsPaid = checkerRefusalIsPaid({
    verdict: res?.verdict,
    user,
    tokenPlan,
  })
  // Don't flash GuestCheckout at a paying session while /auth/me is in flight.
  const barBranch = (!sessionProbed && unlockBranch === "checkout") ? "hidden" : unlockBranch
  const chipUser = paidUserForChip(user, tokenPlan)

  const hero = variant === "hero"
  return (
    <div style={hero ? { background: "transparent", padding: 0 } : { background: "var(--color-surface)", border: "1px solid var(--color-border-ui)", borderRadius: 14, padding: 20 }}>
      {/* WebMCP: one shared money tool for /tools and /tools/vinted-price-checker
          (same FreeChecker). Field name is `query`. No toolautosubmit. */}
      <form
        className="riq-checker-row"
        noValidate
        toolname={webmcpName}
        tooldescription={webmcpDescription}
        onSubmit={(e) => {
          e.preventDefault()
          if (loading) return
          void run()
        }}
      >
        <input
          name="query"
          required
          autoFocus={hero}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={resolvedPlaceholder}
          aria-label={t.inputAriaLabel}
          toolparamdescription={CHECK_VINTED_ITEM_QUERY_DESCRIPTION}
          style={{ background: "var(--color-bg-2)", border: hero ? "1px solid var(--color-border-2)" : "1px solid var(--color-border)", borderRadius: hero ? 12 : 10, padding: hero ? "15px 16px" : "13px 15px", color: "var(--color-text-primary)", fontSize: 16, fontWeight: 400, outline: "none", minHeight: 44 }}
        />
        <button
          type="submit"
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
      </form>
      {hero && (
        <>
          <p
            className="riq-free-scope"
            data-testid="riq-free-scope"
          >
            {copy[locale].heroFreeScope}
          </p>
          <ModelChips
            onPick={(ex) => run(ex)}
            disabled={loading}
            label={t.tryTheseInstead}
            examples={TRY_EXAMPLES}
            testId="riq-hero-try-chips"
            align="center"
          />
        </>
      )}
      <RegisterCheckVintedItemTool name={webmcpName} description={webmcpDescription} />

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
        <>
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
          {hero && isExample && (
            // Eyebrow so a stranger reads the pre-rendered verdict as a SAMPLE,
            // not the whole product — the fix that pairs with the now-empty
            // input. Points them back to the box to run their own.
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8b99b8", background: "var(--color-surface-elevated)", border: "1px solid var(--color-hairline)", borderRadius: 6, padding: "3px 8px" }}>
                {t.exampleLabel}
              </span>
              <span style={{ fontSize: 12.5, color: "#8b99b8" }}>{t.exampleNudge}</span>
            </div>
          )}
          {res.verdict === "PAYWALL" ? (
            checkerFace({ verdict: "PAYWALL", query: q, apiBody: res }) === "coverage"
              ? <CoverageMissCard locale={locale} query={q} onPick={ex => run(ex)} disabled={loading} />
              : refusalIsPaid
                ? <PaidPostCheckBar locale={locale} user={chipUser} />
                : <HardPaywallCard locale={locale} plans={res.plans} query={q} comparableN={res.comparable_n} />
          ) : res.verdict === "LIMIT_REACHED" ? (
            refusalIsPaid
              ? <PaidPostCheckBar locale={locale} user={chipUser} />
              : <LimitReachedUpgrade locale={locale} used={res.used_today} limit={res.limit} />
          ) : res.verdict === "UNKNOWN" ? (
            <CoverageMissCard locale={locale} query={res.product ?? q} onPick={ex => run(ex)} disabled={loading} />
          ) : res.verdict === "OVERSUPPLIED" ? (
            // Heavy live supply, ~zero departures. This is the product doing
            // its job on a query we used to fail: "Uniqlo down jacket" (69
            // searches) and "Zara wool coat" (65) previously returned UNKNOWN
            // or a 402 asking €19 for an answer we did not hold.
            //
            // "Do not stock this" is worth money to a reseller — it stops a bad
            // purchase — so it renders as a real verdict, then pivots to the
            // buy list. A dead end here wastes the one moment the visitor has
            // just seen us be genuinely useful for free.
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: ".08em",
                  color: VERDICT_COLOR.OVERSUPPLIED,
                  background: "rgba(255,69,58,.12)",
                  padding: "5px 9px", borderRadius: 6,
                }}>
                  DON&apos;T STOCK
                </span>
                <span style={{ fontSize: 15, color: "var(--color-text-primary)", fontWeight: 600 }}>
                  {res.brand ?? q}
                </span>
              </div>

              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.55, marginBottom: 12 }}>
                {res.live_listings_total != null
                  ? `${res.live_listings_total.toLocaleString("en-GB")} live listings on Vinted EU, almost none leaving the shelf in the last 7 days. Heavy supply with no departures means slow resale and price pressure.`
                  : res.message}
              </p>

              {res.oversupply_categories && res.oversupply_categories.length > 0 && (
                <div style={{
                  border: "1px solid var(--color-hairline)", borderRadius: 10,
                  overflow: "hidden", marginBottom: 14,
                }}>
                  {res.oversupply_categories.slice(0, 3).map((c, i) => (
                    <div key={c.category} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      gap: 12, padding: "10px 12px", minHeight: 44,
                      borderTop: i === 0 ? "none" : "1px solid var(--color-hairline)",
                    }}>
                      <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>
                        {c.category}
                      </span>
                      <span style={{
                        fontSize: 12, color: "var(--color-text-secondary)",
                        fontFamily: "ui-monospace, 'SF Mono', monospace",
                      }}>
                        {c.live_listings.toLocaleString("en-GB")} listed · {money(c.avg_price_eur)} · {c.departures_7d} sold/wk
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <a
                href="/#what-to-buy"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 44, padding: "12px 18px", borderRadius: 10,
                  background: "var(--color-buy)", color: "var(--color-on-buy)",
                  fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}
              >
                See what IS selling this week →
              </a>
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
              {/* H23: same-brand category chips (CRO #10/#12).
                  The grid above already shows prices per category — these chips
                  make each row clickable without requiring the user to retype
                  "Carhartt Jackets". Constructed from res.categories + res.brand
                  at render time, so they stay on-brand regardless of which brand
                  triggered BRAND_CATEGORIES. Falls back to FREE_MODELS only
                  when the backend sends no categories (shouldn't happen in prod
                  but defends the invariant). */}
              {res.categories && res.categories.length > 0 && res.brand ? (
                <ModelChips
                  onPick={ex => run(ex)}
                  disabled={loading}
                  label={t.tryTheseInstead}
                  examples={(res.categories as string[]).map(cat => `${res.brand} ${cat}`)}
                  testId="riq-brand-category-chips"
                />
              ) : (
                <ModelChips onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} examples={FREE_MODELS} />
              )}
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
              {intel.filter((row) => row.id !== "n").length > 0 && (
                <div data-testid="riq-answer-rows" style={{ marginTop: 14, display: "grid", gap: 8, maxWidth: "min(100%, 420px)" }}>
                  {intel.filter((row) => row.id !== "n").map((row) => (
                    <AnswerRow
                      key={row.id}
                      label={row.id === "buy_below" ? t.buyBelow : row.id === "sell_avg" ? t.marketPrice : row.id === "sold_7d" ? t.leftShelf : t.stillListed}
                      value={row.id === "buy_below" || row.id === "sell_avg" ? money(row.numeric) : fmtCount(row.numeric)}
                    />
                  ))}
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

              {/* D-38: 30-day demand evidence — shown when weekly shelf departures
                  are not yet observable but the model was admitted on 30d sales.
                  This is NOT weekly departures. Label is distinct: "88 sold in 30 days". */}
              {res.sold_30d_evidence != null && (res.sold_7d == null || res.sold_7d === 0) && res.demand_note && (
                <p style={{ marginTop: 6, fontSize: 12.5, color: "#7f8da9", lineHeight: 1.55 }}>{res.demand_note}</p>
              )}

              {shownCategory && (
                <div style={{ fontSize: 11, color: "#5b6b8c", marginTop: 10 }}>{shownCategory}</div>
              )}

              <ModelChips onPick={ex => run(ex)} disabled={loading} label={t.tryTheseInstead} examples={TRY_EXAMPLES} />

              {/* H64 CRO: upgrade nudge on INSUFFICIENT_DATA.
                  37 of 100 board models land here. The visitor ran a real item,
                  saw real price + n figures, and hit a dead end. That is warm intent
                  with ZERO conversion path. Adding a checkout offer converts this
                  warm-lead cohort without touching the paywall or the hero result.
                  CRO #10 (CTA ladder: they've seen data → now a committed next step)
                  + #12 (earned-urgency: value first, ask second).
                  Revenue 2026-09-23. */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--color-border-ui)", display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 12.5, color: "#8b99b8", margin: 0, lineHeight: 1.5 }}>
                  More data = a clearer call. Starter unlocks every item in the catalog — unlimited checks.
                </p>
                <GuestCheckoutButton locale={locale} label="Unlock full analysis — €19/mo →" src="insufficient_data_nudge" />
              </div>
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

              {(hasPrices || intel.some((r) => r.id === "sold_7d" || r.id === "buy_below") || strState !== "absent") && (
                <div data-testid="riq-answer-rows" style={{ marginTop: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-hairline)", display: "grid", gap: "var(--space-1)", maxWidth: "min(100%, 420px)" }}>
                  {intel.filter((r) => r.id === "buy_below").map((r) => (
                    <AnswerRow key="buy" label={t.buyBelow} value={money(r.numeric)} />
                  ))}
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

              {!hasPrices && !hasIntel && (
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

              {intel.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 140px),1fr))", gap: 10 }}>
                {intel.map((row) => (
                  <Stat
                    key={row.id}
                    label={row.id === "buy_below" ? t.buyBelow : row.id === "sell_avg" ? t.marketPrice : row.id === "sold_7d" ? t.leftShelf : row.id === "active_listings" ? t.stillListed : row.id === "comps" ? t.stillListed : row.id === "n" ? "n" : t.buyBelow}
                    value={row.id === "buy_below" || row.id === "sell_avg" ? money(row.numeric) : fmtCount(row.numeric)}
                    accent={row.id === "buy_below" ? "#34C759" : undefined}
                  />
                ))}
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

              {/* D-38: 30-day demand evidence for shelf-blind models. NOT weekly departures. */}
              {res.sold_30d_evidence != null && (res.sold_7d == null || res.sold_7d === 0) && res.demand_note && (
                <p style={{ marginTop: 10, fontSize: 13, color: "#8b99b8", lineHeight: 1.55 }}>{res.demand_note}</p>
              )}

              {/* res.verdict is never INSUFFICIENT_DATA here — that verdict has
                  its own branch above (defect 2/3, 2026-09-01) — so !hasPrices
                  in this branch only ever means BUY/WATCH/SKIP without an
                  account, not a refusal. */}
              {!hasPrices && !hasIntel && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#8b99b8" }}>
                  {t.headlineOnly} {TRIAL_LIMITS_SHORT_BY_LOCALE[locale]}
                </p>
              )}
            </>
          )}

          {/* After a free Samba/AF1 200, the next click used to be /register —
              the #1 measured drop. Guest Stripe, same as the 402 card.
              Also show on hero after a real check (not the seeded example).
              Paid sessions (operator/power) must NEVER see this checkout bar —
              founder report 2026-09-21. Branch is checkerUnlockBranch. */}

          {barBranch === "paid" && (
            <PaidPostCheckBar locale={locale} user={chipUser} />
          )}
          {barBranch === "checkout" && (
          <div data-testid="riq-guest-unlock-bar" style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "var(--color-surface)", border: "1px solid var(--color-border-2)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 13.5, color: "#8b99b8", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color="#34C759" />
              {t.unlockLine}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <GuestCheckoutButton
                locale={locale}
                label={(src === "blog-check" && blogModeCtaLabel(res?.product)) || t.unlockRestPaid}
                src="tools_result"
              />
              <Link
                href={canonicalPath(locale, "/login")}
                data-testid="riq-starter-cta-bar"
                style={{ fontSize: 12, color: "#5b6b8c", textDecoration: "none" }}
              >
                {t.unlockRest}
              </Link>
            </div>
          </div>
          )}
        </div>
        {/* Weekly digest opt-in — placed OUTSIDE riq-result-card to avoid
            violating e2e/public-result-face.spec.ts's CTA-count/background assertions.
            Shown to anonymous visitors after any real verdict (not the seeded example).
            Never shown to paid sessions. Never a modal. Easily ignored. */}
        {!isExample && !user && res.verdict && res.verdict !== "PAYWALL" && res.verdict !== "LIMIT_REACHED" && (
          <DigestSubscribe
            query={q}
            verdictSummary={res.verdict && res.product ? `${res.verdict} — ${res.product}` : res.verdict ?? undefined}
          />
        )}
        {/* Alternatives — shown after any real verdict (not the seeded example) when
            the backend provides them. Each row is clickable and fires a new search,
            creating the second check the 99.6% one-and-done rate shows people never run.
            buy_below_locked is always respected — never leak the price. */}
        {!isExample && res.alternatives && res.alternatives.length > 0 && (
          <VerdictAlternatives
            alternatives={res.alternatives}
            alternatives_note={res.alternatives_note}
            locale={locale}
            onRun={run}
            disabled={loading}
          />
        )}
        </>
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
