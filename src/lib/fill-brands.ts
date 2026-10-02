/**
 * The brands-tracked count in static copy. Pure — safe to import from client
 * components (like floor-to-10k.ts). Do not put warehouse/fs here; the live
 * number comes from getBrandsTracked() in stats.ts.
 *
 * Sentinel for prose that lives in a static module (src/data/*.ts, i18n
 * dictionaries, FAQ constants) and so cannot await. Same contract as TRACKED in
 * stats.ts: write BRANDS_TRACKED where the number belongs, pass the structure through
 * `fillBrands` at the render site.
 *
 * Write it as "the {{BRANDS}} brands we track" so the sentence still reads when
 * the number is dropped ("the brands we track"). In a plain string (as i18n.ts
 * and the blog data do) type the literal {{BRANDS}}; in a template literal use
 * ${BRANDS_TRACKED}. Every render site that reads such a module must call
 * fillBrands (brand-count-literals.test.ts pins the sites).
 */
export const BRANDS_TRACKED = "{{BRANDS}}"

/**
 * Deep-substitutes BRANDS_TRACKED through any JSON-ish structure, returning a new one.
 *
 * With a number it prints it. With null it removes the sentinel AND the single
 * space after it, so "the {{BRANDS}} brands we track" becomes "the brands we
 * track" instead of "the  brands we track". It never guesses a replacement:
 * the founder rule is that an unknown count leaves the sentence, not that a
 * stale literal stands in for it.
 */
export function fillBrands<T>(value: T, brands: number | null): T {
  if (typeof value === "string") {
    return (brands == null
      ? value.replace(/\{\{BRANDS\}\} ?/g, "")
      : value.split(BRANDS_TRACKED).join(String(brands))) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map(v => fillBrands(v, brands)) as unknown as T
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => [k, fillBrands(v, brands)]),
    ) as unknown as T
  }
  return value
}

/**
 * " (of 61 tracked)" — the English suffix for a sentence that prints the
 * PUBLISHED brand count (market.brandCount: brands that cleared the weekly
 * floor) beside a departures figure. Empty when the tracked total is unknown
 * or not larger, so it never prints a made-up denominator.
 *
 * The published count is "brands with published weekly data", never "tracked":
 * the two numbers share a site and must not share a label.
 */
export function ofTracked(published: number, tracked: number | null): string {
  return tracked != null && tracked > published ? ` (of ${tracked} tracked)` : ""
}
