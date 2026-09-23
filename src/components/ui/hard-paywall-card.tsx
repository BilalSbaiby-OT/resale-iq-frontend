"use client"
import Link from "next/link"
import { Lock, Check } from "lucide-react"
import { copy, type Locale } from "@/lib/i18n"
import { verdictWord } from "@/lib/verdict-words"
import { canonicalPath } from "@/lib/locale-routes"
import { operatorPrice, type PaywallPlan } from "@/lib/hard-paywall"
import { useTrackedLabel } from "@/lib/use-tracked-label"
import { GuestCheckoutButton } from "@/components/ui/guest-checkout-button"
import { Aw26ReportCta } from "@/components/ui/aw26-report-cta"

/**
 * The conversion face for HARD_PAYWALL=1: anon/unpaid /api/verdict is 402.
 * Guest checkout goes straight to Stripe (same path as /pricing) — the
 * register wall was the #1 measured drop.
 *
 * H24: optional `query` prop personalizes the headline to the item the visitor
 * searched (CRO principle #3 message-match). Falls back to generic headline
 * when no query is provided (e.g. dashboard paywall). Revenue 2026-09-15.
 *
 * 2026-09-21 (Revenue sprint): added inline offer — price, feature bullets,
 * BUY button — so 93% of users who hit the paywall and never navigate to
 * /pricing see the offer IN PLACE. Added comparable_n teaser ("we hold N
 * data points on this item") to answer the "do they have my data?" objection.
 * Added AW26 one-off report as secondary CTA for visitors who won't subscribe.
 */
export function HardPaywallCard({
  locale,
  plans,
  query,
  comparableN,
}: {
  locale: Locale
  plans?: PaywallPlan[]
  query?: string
  /** Teaser from the 402 body — number of comparables we hold for this item. */
  comparableN?: number | null
}) {
  const t = copy[locale].checker
  const price = operatorPrice(plans)
  const tracked = useTrackedLabel()
  const headline = query?.trim()
    ? t.paywallHeadlineForItem(query.trim())
    : t.paywallHeadline
  const bodyText = (() => {
    const resolved = tracked
    if (query?.trim() && t.paywallBodyForItem) {
      return t.paywallBodyForItem(query.trim(), resolved)
    }
    return t.paywallBody.replace("{{TRACKED}}", resolved)
  })()

  return (
    <div data-testid="riq-hard-paywall">
      {/* Locked verdict chips — shows we HAVE an answer, it's behind the gate */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lock size={15} style={{ color: "#34C759" }} aria-hidden />
        <span style={{ fontSize: 15.5, fontWeight: 700, color: "#eef1f7" }}>{headline}</span>
      </div>
      <div
        data-testid="riq-paywall-locked-verdicts"
        style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}
      >
        {(["BUY", "WATCH", "SKIP"] as const).map((v) => (
          <span
            key={v}
            style={{
              opacity: 0.4,
              border: "1px solid #263147",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: "#eef1f7",
            }}
          >
            {verdictWord(v, locale) ?? v}
          </span>
        ))}
      </div>

      {/* Evidence teaser — "we hold N data points on this item". Not a paid field. */}
      {comparableN != null && comparableN > 0 && (
        <p style={{ fontSize: 12.5, color: "#34C759", marginBottom: 10, lineHeight: 1.45, fontWeight: 600 }}>
          ✓ We hold {comparableN.toLocaleString("en-GB")} data points on this item — the answer is ready.
        </p>
      )}

      {/* ── Inline offer — price + what you get + primary CTA ────────────────
          93% of users who hit the paywall never reach /pricing. Show the offer
          here so they don't have to navigate. CRO 2026-09-21. */}
      <div
        style={{
          background: "rgba(52,199,89,.07)",
          border: "1px solid rgba(52,199,89,.2)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#eef1f7", letterSpacing: "-0.5px" }}>
            €{price}
          </span>
          <span style={{ fontSize: 13, color: "#8b99b8" }}>/month · cancel anytime</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {[
            "BUY / WATCH / SKIP verdict + exact buy-below price",
            "Unlimited checks — every item in our catalog",
            "Sell-through rate, demand, top sizes, market trends",
            "Instant access · 30-day money-back guarantee",
          ].map((f) => (
            <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Check size={13} color="#34C759" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 13, color: "#c3cde0", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
        <GuestCheckoutButton locale={locale} label={t.paywallCta(price)} src="paywall_card" query={query} />
      </div>

      <p style={{ fontSize: 13.5, color: "#8b99b8", lineHeight: 1.65, marginBottom: 8 }}>{bodyText}</p>
      <p style={{ fontSize: 12.5, color: "#8b99b8", lineHeight: 1.55, marginBottom: 14 }}>
        {t.paywallCatalogNote}
      </p>

      {/* ── Secondary CTA: one-off AW26 report for non-subscribers ───────────
          EUR49, no account, no subscription. Single source: Aw26ReportCta.
          Revenue 2026-09-21. */}
      <Aw26ReportCta />

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <Link href={canonicalPath(locale, "/login")} style={{ color: "#8fa3c4", fontSize: 13 }}>
          {t.paywallLogin}
        </Link>
        <Link
          href={`${canonicalPath(locale, "/pricing")}?src=paywall${query?.trim() ? `&item=${encodeURIComponent(query.trim())}` : ""}`}
          data-testid="riq-paywall-see-plans"
          style={{ color: "#8fa3c4", fontSize: 13 }}
        >
          {t.seePlans}
        </Link>
      </div>

      {/* Risk-reversal guarantee */}
      <div
        data-testid="riq-paywall-guarantee"
        style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 14, fontSize: 12.5, color: "#6a7d9a" }}
      >
        <Check size={13} color="#34C759" strokeWidth={2.5} aria-hidden />
        30-day money-back guarantee — if it doesn&rsquo;t pay for itself, we refund you.
      </div>
    </div>
  )
}
