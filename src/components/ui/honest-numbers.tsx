import type { Locale } from "@/lib/i18n"
import { basisText, hasHonestContent, honestCopy, isLowData, rangeText, type HonestOutput } from "@/lib/honest-output"

/**
 * Numbers first (O3): typical resale range, the listings count + window behind
 * it, and the max buy price. The verdict is rendered by the host card AFTER
 * this block; under 20 comparables the host shows LOW DATA instead of a call
 * and this block carries the one-line reason.
 */
export function HonestNumbers({ honest, locale }: { honest: HonestOutput | null | undefined; locale: Locale }) {
  if (!hasHonestContent(honest)) return null
  const c = honestCopy[locale] ?? honestCopy.en
  const range = rangeText(honest)
  const basis = basisText(honest, locale)
  return (
    <div data-testid="riq-honest-numbers" data-basis={honest.basis} style={{ marginBottom: 14 }}>
      {range && (
        <div>
          <div style={{ fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.rangeLabel}</div>
          <div data-testid="riq-honest-range" style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {range}
          </div>
          {basis && (
            <div data-testid="riq-honest-basis" style={{ marginTop: 2, fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)", lineHeight: 1.5 }}>
              {basis}
            </div>
          )}
        </div>
      )}
      {honest.max_buy_eur != null && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--text-body-app, 14px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.maxBuyLabel}</span>
          <span data-testid="riq-honest-maxbuy" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>€{honest.max_buy_eur}</span>
          <span style={{ fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.margin(honest.margin_pct)}</span>
        </div>
      )}
      {isLowData(honest) && (
        <p data-testid="riq-honest-lowdata-note" style={{ marginTop: 8, fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)", lineHeight: 1.5 }}>
          {c.lowDataNote(honest.n)}
        </p>
      )}
    </div>
  )
}
