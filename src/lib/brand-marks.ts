/**
 * Local CC0 Simple Icons marks (vendored under public/brand-marks/).
 * Brands without a good free logo are omitted — never a text name as the mark.
 * Remote icon CDNs 403 here. Do not use the hugo slug for Hugo Boss.
 */
export const BRAND_MARK_SRC: Record<string, string> = {
  Nike: "/brand-marks/nike.svg",
  Adidas: "/brand-marks/adidas.svg",
  Puma: "/brand-marks/puma.svg",
  "New Balance": "/brand-marks/newbalance.svg",
  Reebok: "/brand-marks/reebok.svg",
  Zara: "/brand-marks/zara.svg",
  "The North Face": "/brand-marks/thenorthface.svg",
  Uniqlo: "/brand-marks/uniqlo.svg",
  Jordan: "/brand-marks/jordan.svg",
}

export const CATALOG_BRANDS_WITH_MARKS = Object.keys(BRAND_MARK_SRC)

const STRIP_MAX = CATALOG_BRANDS_WITH_MARKS.length

export function brandMarkSrc(name: string): string | null {
  return BRAND_MARK_SRC[name] ?? null
}

/** Published snapshot first, then fill from catalog brands that have a mark. */
export function brandStripNames(published: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of published) {
    if (!BRAND_MARK_SRC[name] || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  for (const name of CATALOG_BRANDS_WITH_MARKS) {
    if (out.length >= STRIP_MAX) break
    if (seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

/**
 * Remainder for the “+N more” chip. Never negative. `total` is the warehouse
 * brand count (brandsTracked ?? brandCount), not seo-brands.json.
 */
export function brandStripMoreCount(shown: number, total: number): number {
  if (!Number.isFinite(shown) || !Number.isFinite(total)) return 0
  const s = Math.max(0, Math.floor(shown))
  const t = Math.max(0, Math.floor(total))
  return t > s ? t - s : 0
}
