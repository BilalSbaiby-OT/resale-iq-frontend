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
}): string | null {
  if (v.buy_below == null || !Number.isFinite(v.buy_below)) return null
  if (v.sell_avg == null || !Number.isFinite(v.sell_avg)) return null
  const buy = Math.round(v.buy_below)
  const sell = Math.round(v.sell_avg)
  const margin = sell - buy
  const base = `Buy below €${buy} · typical exit €${sell}`
  // Data noise: sell_avg can occasionally sit below buy_below for thin
  // samples. Never show a negative "margin" — just drop the arrow clause.
  return margin > 0 ? `${base} → ~€${margin} margin` : base
}
