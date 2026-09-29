/**
 * Display name for a buy-list row. Catalog model names often already start
 * with the brand ("Fred Perry Polo" under brand "Fred Perry"), so naive
 * `${brand} ${model}` renders "Fred Perry Fred Perry Polo".
 */
export function itemDisplayName(brand: string | null | undefined, model: string | null | undefined): string {
  const b = (brand ?? "").trim()
  const m = (model ?? "").trim()
  if (!m) return b
  if (!b) return m
  return m.toLowerCase().startsWith(b.toLowerCase()) ? m : `${b} ${m}`
}
