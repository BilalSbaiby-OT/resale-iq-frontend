import type { Locale } from "./i18n.ts"
import { TOOLS_LANDING_COPY } from "./tools-landing-copy.ts"
import { fmtEur } from "./ui-translate.ts"

/**
 * verdictUpsellLine — the ONE real per-item numeric line shown directly
 * under every free verdict for anon/free users (verdict-upsell-cta.tsx).
 *
 * Computed from the verdict's OWN fields only. Never invents a number: when
 * either buy_below or sell_avg is absent the line is omitted entirely
 * (returns null), never zero-filled or approximated from something else.
 * Founder rule: no invented numbers, only live API data.
 */
export function verdictUpsellLine(v: {
  buy_below?: number | null
  sell_avg?: number | null
}, locale: Locale = "en"): string | null {
  if (v.buy_below == null || !Number.isFinite(v.buy_below)) return null
  if (v.sell_avg == null || !Number.isFinite(v.sell_avg)) return null
  const buy = Math.round(v.buy_below)
  const sell = Math.round(v.sell_avg)
  // Translated surfaces: max buy price + typical resale price only. No euro
  // margin figure (no profit promise); euros in the visitor's own format.
  if (locale !== "en") return TOOLS_LANDING_COPY[locale].summaryLine(fmtEur(locale, buy), fmtEur(locale, sell))
  const margin = sell - buy
  const base = `Buy below €${buy} · typical exit €${sell}`
  // Data noise: sell_avg can occasionally sit below buy_below for thin
  // samples. Never show a negative "margin" — just drop the arrow clause.
  return margin > 0 ? `${base} → ~€${margin} margin` : base
}
