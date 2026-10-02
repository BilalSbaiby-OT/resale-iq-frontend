/**
 * BlogIndexFreeChecker — "See it live" free sample chips on the blog index.
 *
 * WHY: /blog (130/7d) is the highest-traffic surface outside the homepage but
 * has ZERO interactive product experience. Visitors from ChatGPT (31/7d) land,
 * see article titles + a buy-list strip, and face a cold "Start — €19/mo" ask.
 * They never experience the product — so the ask lands on an unconvinced visitor.
 *
 * Plausible.io pattern: show the product working on the page the visitor is on,
 * before sending them anywhere else. Three free-sample chips (AF1/Samba/Fred Perry Polo)
 * return full verdicts — no account, no paywall, no navigation.
 *
 * After the inline verdict: GuestCheckoutButton directly at peak conviction.
 * H165 CRO: removed the email input gate that appeared before the checkout button
 * (same fix as H160 on blog posts). H160 proved email gates kill cold-traffic
 * conversion (checkout_from_blog stayed 0 with the input; C202 on /tools showed
 * a single button converts ~30%). Stripe collects email natively.
 * riq_capture_email pre-fill still works when the visitor previously gave their
 * email on /pricing, /tools, homepage, or blog footer — zero friction for return
 * visitors, and Stripe handles first-timers. Surface: blog 130/7d. Revenue 2026-09-29.
 *
 * "Now check YOUR item" input bridges the "does it cover my brands?" objection —
 * custom items hit 402 PAYWALL → comparable_n → personalized inline ask.
 * Mirrors PricingTryInput (H128) and VerdictUpsellCta (H159) on blog articles.
 *
 * H161 CRO:
 *  - Blog index /blog: 130/7d — highest-traffic non-homepage surface.
 *  - No interactive product trial existed before this.
 *  - CRO #4 (objection: does it actually work?) + #7 (trust: live data before ask)
 *    + #12 (experience → conviction → ask — the Plausible/Fathom pattern).
 *  - CRO #3 (message match: "check YOUR item" personalizes after sample).
 *
 * Revenue 2026-09-29. H161.
 */
"use client"
import { useEffect, useState } from "react"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { trackEvent } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { TrendingUp, TrendingDown, Minus, Lock } from "lucide-react"
import type { SsrBuyListItem } from "@/lib/ssr-buy-list"
import { FREE_SAMPLE_CHIPS, isFreeSample } from "@/lib/free-samples"

type VerdictType = "BUY" | "WATCH" | "SKIP"

interface InlineVerdict {
  verdict: VerdictType
  buy_below: number | null
  sell_avg: number | null
  demand_note: string | null
  product: string
}

function verdictColor(v: VerdictType): string {
  if (v === "BUY") return "#34C759"
  if (v === "SKIP") return "#FF3B30"
  return "#FFD60A"
}

function VerdictIcon({ v }: { v: VerdictType }) {
  if (v === "BUY") return <TrendingUp size={13} color="#34C759" />
  if (v === "SKIP") return <TrendingDown size={13} color="#FF3B30" />
  return <Minus size={13} color="#FFD60A" />
}

export function BlogIndexFreeChecker({ locale = "en", buyListPreview }: { locale?: Locale; buyListPreview?: SsrBuyListItem[] | null }) {
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InlineVerdict | null>(null)
  const [customQ, setCustomQ] = useState("")
  const [customLoading, setCustomLoading] = useState(false)
  const [paywallQuery, setPaywallQuery] = useState<string | null>(null)
  const [paywallN, setPaywallN] = useState<number | null>(null)
  const [capturedEmail, setCapturedEmail] = useState("")

  useEffect(() => {
    try { setCapturedEmail(localStorage.getItem("riq_capture_email") ?? "") } catch { /* private mode */ }
  }, [])

  // H165 CRO: handleEmailChange removed — email inputs removed from blog index free-checker.
  // capturedEmail read from localStorage for pre-fill on GuestCheckoutButton. H160 lesson.
  
  async function fetchSample(query: string) {
    setActiveChip(query)
    setResult(null)
    setPaywallQuery(null)
    setPaywallN(null)
    setCustomQ("")
    setLoading(true)
    trackEvent("chip_click", `blog_index_${query}`)
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResult({
          verdict: (data.verdict as VerdictType) ?? "WATCH",
          buy_below: data.buy_below ?? null,
          sell_avg: data.sell_avg ?? null,
          demand_note: data.demand_note ?? null,
          product: data.product ?? query,
        })
      }
    } catch {
      // why: fetch failure is non-fatal on the blog index — chips stay active and
      // the visitor can still navigate into an article. An error here is a transient
      // API issue, not a missing product path, so logging at warn keeps it debuggable.
      console.warn("[BlogIndexFreeChecker] sample fetch failed silently")
    } finally {
      setLoading(false)
    }
  }

  async function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = customQ.trim()
    if (!trimmed) return
    setPaywallQuery(null)
    setPaywallN(null)
    setResult(null)
    setActiveChip(null)
    setCustomLoading(true)
    trackEvent("verdict_upsell_try_submit", "blog_index")
    try {
      const res = await fetch(`/api/verdict?q=${encodeURIComponent(trimmed)}`)
      if (res.status === 402 || res.status === 401) {
        try {
          const body = await res.json().catch(() => null)
          if (body?.comparable_n != null) setPaywallN(body.comparable_n as number)
        } catch { /* non-fatal */ }
        setPaywallQuery(trimmed)
      } else if (res.ok) {
        const data = await res.json()
        if (data.verdict && data.verdict !== "PAYWALL") {
          setActiveChip(trimmed)
          setResult({
            verdict: (data.verdict as VerdictType) ?? "WATCH",
            buy_below: data.buy_below ?? null,
            sell_avg: data.sell_avg ?? null,
            demand_note: data.demand_note ?? null,
            product: data.product ?? trimmed,
          })
        } else {
          setPaywallQuery(trimmed)
        }
      } else {
        // unexpected error — navigate to /tools
        window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=blog_index_try`
      }
    } catch {
      // why: network error on custom check is non-fatal — navigating to /tools ensures
      // the visitor always has a path to the verdict, so swallowing the network error
      // here is safe and the /tools fallback makes the failure visible.
      window.location.href = `/tools?q=${encodeURIComponent(trimmed)}&src=blog_index_try`
    } finally {
      setCustomLoading(false)
    }
  }

  const col = result ? verdictColor(result.verdict) : "#34C759"
  // H176(elon): detect when the result is from a free-model chip (AF1/Samba/Fred Perry Polo).
  // If so, the visitor ALREADY has buy_below for free — CTA "Unlock X buy-below" is a lie.
  // Fix: when result is from a free model, CTA = "Unlock the full buy list" (the value gap).
  const isFreeSampleResult = !!result && isFreeSample(activeChip)

  return (
    <div
      data-testid="riq-blog-index-free-checker"
      style={{
        background: "var(--color-surface)",
        border: "1px solid rgba(52,199,89,.18)",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 28,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>
        See it live — free samples, no account required
      </p>

      {/* Free sample chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {FREE_SAMPLE_CHIPS.map(({ label, q }) => (
          <button
            key={q}
            type="button"
            onClick={() => fetchSample(q)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: activeChip === q ? "#000" : "#34C759",
              background: activeChip === q ? "#34C759" : "transparent",
              border: "1px solid rgba(52,199,89,.35)",
              borderRadius: 7,
              padding: "5px 12px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 32,
            }}
          >
            {loading && activeChip === q ? "…" : label}
          </button>
        ))}
      </div>

      {/* Inline verdict result */}
      {result && (
        <div
          data-testid="riq-blog-index-verdict"
          style={{
            background: `${col}0D`,
            border: `1px solid ${col}40`,
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{result.product}</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11.5,
                fontWeight: 800,
                color: col,
                border: `1px solid ${col}55`,
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              <VerdictIcon v={result.verdict} />
              {result.verdict}
            </span>
          </div>
          <div style={{ display: "flex", gap: 18, marginBottom: result.demand_note ? 8 : 0 }}>
            {result.buy_below != null && (
              <div>
                <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>Buy below</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: col, letterSpacing: "-0.3px" }}>€{result.buy_below.toFixed(0)}</div>
              </div>
            )}
            {result.sell_avg != null && (
              <div>
                <div style={{ fontSize: 10.5, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 1 }}>Avg resale</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.3px" }}>€{result.sell_avg.toFixed(0)}</div>
              </div>
            )}
          </div>
          {result.demand_note && (
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>{result.demand_note}</p>
          )}
          {/* H165 CRO: real locked buy-list rows in blog index inline verdict.
              Pattern from H150 (/pricing InlineVerdictCard) + H155 (homepage)
              + H158 (CustomItemPaywallCard) + H228(elon) (HardPaywallCard).
              BEFORE: visitor sees buy_below + verdict but has no proof the catalog
              has any depth. "Also in your buy list" with 3 real brand/model names
              (blurred price) answers "does it cover more than 3 free items?" inline.
              130/7d blog visitors — the highest-traffic non-homepage surface.
              Falls back silently when buyListPreview unavailable.
              CRO #8 (behavioral: real items > abstract claims) + #4 (objection:
              catalog depth) + #7 (trust: concrete names, not a vague pitch).
              Revenue 2026-09-29. H165. */}
          {buyListPreview && buyListPreview.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, border: "1px solid var(--color-border-2)", borderRadius: 9, padding: "8px 10px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 2 }}>
                Also in your buy list
              </span>
              {buyListPreview.filter(it => it.brand).slice(0, 3).map((it, i) => (
                <div key={`${it.brand}-${it.model ?? i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 12.5, color: "var(--color-text-body)", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {it.brand}{it.model ? ` ${it.model}` : ""}
                  </span>
                  <span aria-hidden style={{ filter: "blur(4px)", color: "var(--color-text-primary)", fontSize: 12.5, fontWeight: 700, flexShrink: 0, userSelect: "none" as const, display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <Lock size={9} />
                    {it.avg_price_eur != null ? `€${Math.round(it.avg_price_eur * 0.665)}` : "€••"}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* H165 CRO: email input REMOVED from free-verdict block.
              H160 proved email gates kill cold-traffic conversion on blog posts
              (checkout_from_blog=0 with input). Same lesson applies here.
              Stripe collects email. riq_capture_email pre-fill still works via
              customerEmail prop below for return visitors. */}
          <GuestCheckoutButton
            locale={locale}
            src="blog_index_free_checker"
            query={activeChip ?? undefined}
            customerEmail={capturedEmail || undefined}
          />
          <p style={{ fontSize: 11, color: "var(--color-text-muted)", margin: "7px 0 0" }}>
            <a href="/terms" style={{ color: "var(--color-text-muted)", textDecoration: "underline" }}>Full refund within 30 days — see Terms</a>
          </p>
        </div>
      )}

      {/* Inline personalized paywall */}
      {paywallQuery && (
        <div
          data-testid="riq-blog-index-paywall"
          style={{
            background: "var(--color-surface)",
            border: "1px solid rgba(52,199,89,.3)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 4px", lineHeight: 1.4 }}>
            We have data on <strong style={{ color: "#34C759" }}>{paywallQuery}</strong> — unlock it
          </p>
          {paywallN != null && paywallN > 0 && (
            <p style={{ fontSize: 12, color: "#34C759", margin: "0 0 8px", fontWeight: 600, lineHeight: 1.45 }}>
              ✓ {paywallN.toLocaleString("en-GB")} data points tracked — the answer is ready.
            </p>
          )}
          {/* H165 CRO: email input REMOVED from custom-item paywall block.
              Same fix as free-verdict block above and H160 on blog posts.
              Stripe collects email natively. */}
          <GuestCheckoutButton
            locale={locale}
            src="blog_index_custom_paywall"
            query={paywallQuery}
            customerEmail={capturedEmail || undefined}
          />
        </div>
      )}

      {/* "Now check YOUR item" — after any interaction, or as the default bridge */}
      {(result || paywallQuery || (!result && !paywallQuery)) && (
        <div style={{ marginTop: result || paywallQuery ? 10 : 0, paddingTop: result || paywallQuery ? 10 : 0, borderTop: (result || paywallQuery) ? "1px solid rgba(255,255,255,.06)" : "none" }}>
          <form onSubmit={handleCustomSubmit} style={{ display: "flex", gap: 8, maxWidth: 400 }}>
            <input
              type="text"
              value={customQ}
              onChange={e => setCustomQ(e.target.value)}
              placeholder="Check your item: e.g. Stone Island Hoodie"
              autoComplete="off"
              style={{
                flex: 1,
                background: "rgba(255,255,255,.04)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-ui)",
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 13,
                outline: "none",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              disabled={!customQ.trim() || customLoading}
              style={{
                background: "#30D158",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: (customQ.trim() && !customLoading) ? "pointer" : "not-allowed",
                opacity: (customQ.trim() && !customLoading) ? 1 : 0.45,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {customLoading ? "…" : "Check →"}
            </button>
          </form>
          <p style={{ fontSize: 11.5, color: "#4a5970", margin: "5px 0 0" }}>
            No account needed for {FREE_SAMPLE_CHIPS.map(c => c.label).join(" · ")}. Every other model starts with a 7-day free trial (card required, €0 today).
          </p>
        </div>
      )}
    </div>
  )
}
