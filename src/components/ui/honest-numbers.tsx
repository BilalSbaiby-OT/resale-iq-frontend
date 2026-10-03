import type { Locale } from "@/lib/i18n"
import { hasHonestContent, honestCopy, rangeText, signalDots, signalStrength, type HonestOutput } from "@/lib/honest-output"

/**
 * Compact three-dot meter. The dots are decorative; the accessible name is the
 * full sentence ("Signal strength: weak"). Never shows a count.
 */
export function SignalMeter({ honest, locale, withLabel = true }: { honest: HonestOutput | null | undefined; locale: Locale; withLabel?: boolean }) {
  const s = signalStrength(honest)
  if (s === null) return null
  const c = honestCopy[locale] ?? honestCopy.en
  return (
    <span
      role="img"
      aria-label={c.signalAria[s]}
      data-testid="riq-signal-strength"
      data-strength={s}
      style={{ display: "inline-flex", alignItems: "baseline", gap: 6, fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)" }}
    >
      {withLabel && <span aria-hidden="true">{c.signalLabel}</span>}
      <span aria-hidden="true" style={{ letterSpacing: "0.12em", color: "var(--color-text-primary)" }}>{signalDots(s)}</span>
    </span>
  )
}

/**
 * Numbers first (O3): Typical resale price (p25-p75), Max buy price with its
 * margin footnote, then the Signal strength meter. The verdict is rendered by
 * the host card, exactly as computed. No counts, no LOW DATA label.
 */
export function HonestNumbers({ honest, locale }: { honest: HonestOutput | null | undefined; locale: Locale }) {
  if (!hasHonestContent(honest)) return null
  const c = honestCopy[locale] ?? honestCopy.en
  const range = rangeText(honest)
  return (
    <div data-testid="riq-honest-numbers" data-basis={honest.basis} style={{ marginBottom: 14 }}>
      {range && (
        <div>
          <div style={{ fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.rangeLabel}</div>
          <div data-testid="riq-honest-range" style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {range}
          </div>
        </div>
      )}
      {honest.max_buy_eur != null && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--text-body-app, 14px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.maxBuyLabel}</span>
          <span data-testid="riq-honest-maxbuy" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>€{honest.max_buy_eur}</span>
          <span style={{ fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)" }}>{c.margin(honest.margin_pct)}</span>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <SignalMeter honest={honest} locale={locale} />
      </div>
      {honest.basis === "active_asking" && (
        <p data-testid="riq-honest-asking-note" style={{ marginTop: 6, fontSize: "var(--text-meta, 12px)", color: "var(--color-text-dim, #7f8da9)", lineHeight: 1.5 }}>
          {c.askingNote}
        </p>
      )}
    </div>
  )
}
