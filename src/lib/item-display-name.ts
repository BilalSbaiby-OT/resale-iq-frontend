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

/**
 * Inverse of a naive `${brand} ${model}` chip.
 *
 * Dashboard suggestions are built as `${brand} ${model}` (dashboard-content,
 * not edited here). When the catalog model already starts with the brand,
 * that click is "Fred Perry Fred Perry Polo". Live 2026-09-29: that string
 * is tracked (comparable_n=70) but is not a public sample, so /api/verdict
 * returns 402. "Fred Perry Polo" is the free sample. Collapse only a
 * repeated leading phrase; "Nike Air Force 1" is unchanged.
 */
export function collapseDoubledModelQuery(query: string): string {
  const s = query.trim().replace(/\s+/g, " ")
  if (!s) return s
  const words = s.split(" ")
  for (let n = Math.floor(words.length / 2); n >= 1; n--) {
    const prefix = words.slice(0, n).join(" ")
    const rest = words.slice(n).join(" ")
    const restLower = rest.toLowerCase()
    const prefixLower = prefix.toLowerCase()
    if (restLower === prefixLower || restLower.startsWith(prefixLower + " ")) return rest
  }
  return s
}
