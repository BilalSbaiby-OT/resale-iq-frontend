/**
 * /compare (Price across Vinted sites) — pure helpers over the
 * /api/compare/prices payload (backend origin/main 34d3a9c).
 *
 * Per site and pooled the API returns a TRUE median with p25/p75 over listings
 * de-duplicated by external_id (the same item appears on several Vinted
 * domains at the same price). Sites with too few recent listings come back
 * `insufficient: true` with null numbers: we render "not enough recent
 * listings", never a number. Founder rule: no counts in copy, so `n_unique`
 * is deliberately not exposed here. Median, not mean. Asking prices, never
 * "sold".
 *
 * Plain .ts, no imports, so node:test can load it.
 */
export type CompareSiteStats = {
  median_price?: number | null
  p25_price?: number | null
  p75_price?: number | null
  avg_price?: number | null
  insufficient?: boolean | null
  share_also_on_other_sites?: number | null
}

export type CompareFigures =
  | { kind: "ok"; median: number; low: number | null; high: number | null }
  | { kind: "insufficient" }

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)

/** Median + typical range, or "insufficient" (explicit flag OR no median to show). */
export function compareFigures(s: CompareSiteStats | null | undefined): CompareFigures {
  if (!s || s.insufficient === true) return { kind: "insufficient" }
  // Pre-34d3a9c payloads had no p25/p75/insufficient: fall back to avg only
  // when there is no median at all.
  const median = isNum(s.median_price) && s.median_price > 0 ? s.median_price : isNum(s.avg_price) && s.avg_price > 0 && s.insufficient === undefined ? s.avg_price : null
  if (median === null) return { kind: "insufficient" }
  const low = isNum(s.p25_price) ? s.p25_price : null
  const high = isNum(s.p75_price) ? s.p75_price : null
  // A range that collapses or inverts says nothing: show the median alone.
  if (low !== null && high !== null && low <= high) return { kind: "ok", median, low, high }
  return { kind: "ok", median, low: null, high: null }
}

/** Whole percent (0-100) of listings also seen on another site, or null when absent/invalid. */
export function alsoOnOtherSitesPct(share: number | null | undefined): number | null {
  if (!isNum(share) || share < 0 || share > 1) return null
  return Math.round(share * 100)
}

// ── Preview / generic-query helpers (backend feat/compare-generic-preview) ──
// Every field below may be absent on the live backend today: all helpers
// degrade to "nothing extra to show".

export type CompareSuggestion = { label: string; query: string }

/** Sites in display order (the five tracked Vinted domains). */
export const COMPARE_SITES = ["es", "fr", "de", "it", "pt"] as const

/** Brand + model examples used when the backend sends no suggestions. Same models as FREE_SAMPLES. */
export const COMPARE_EXAMPLES: ReadonlyArray<CompareSuggestion> = [
  { label: "Adidas Samba", query: "Adidas Samba" },
  { label: "Nike Air Force 1", query: "Nike Air Force 1" },
]

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v)

/** Clean backend suggestions: {label, query} with a non-empty query, deduped, max 6. */
export function normalizeSuggestions(raw: unknown): CompareSuggestion[] {
  if (!Array.isArray(raw)) return []
  const out: CompareSuggestion[] = []
  const seen = new Set<string>()
  for (const r of raw) {
    const o = typeof r === "string" ? { query: r } : r
    if (!isObj(o)) continue
    const query = typeof o.query === "string" ? o.query.trim().slice(0, 80) : ""
    if (!query || seen.has(query.toLowerCase())) continue
    const label = typeof o.label === "string" && o.label.trim() ? o.label.trim().slice(0, 80) : query
    seen.add(query.toLowerCase())
    out.push({ label, query })
    if (out.length >= 6) break
  }
  return out
}

export type CompareView =
  | { mode: "results"; suggestions: CompareSuggestion[] }
  | { mode: "nudge"; why: "generic" | "nodata"; suggestions: CompareSuggestion[] }

type CompareLike = {
  reason?: string | null
  suggestions?: unknown
  pooled?: CompareSiteStats | null
  by_country?: Record<string, CompareSiteStats> | null
}

/**
 * What /compare renders for a Pro result. `generic_query` (backend) or no
 * priced site and no priced pooled figure -> a nudge with chips, never a thin
 * or empty table. Otherwise results (+ chips when the backend sent suggestions,
 * e.g. a brand-only query: pooled stats, narrow it down with a model).
 */
export function compareView(r: CompareLike | null | undefined): CompareView {
  const suggestions = normalizeSuggestions(r?.suggestions)
  if (r?.reason === "generic_query") return { mode: "nudge", why: "generic", suggestions }
  const sitesOk = Object.values(r?.by_country ?? {}).filter((s) => compareFigures(s).kind === "ok").length
  const pooledOk = r?.pooled ? compareFigures(r.pooled).kind === "ok" : false
  if (sitesOk === 0 && !pooledOk) return { mode: "nudge", why: "nodata", suggestions }
  return { mode: "results", suggestions }
}

export type ComparePreview = { sites: string[]; suggestions: CompareSuggestion[] }

/**
 * Non-Pro 402 body -> preview {sites_with_data:{es:true,...}, suggestions}.
 * Looks at body.preview, body.detail.preview, body.detail, body. Returns null
 * when absent (old backend): the caller then shows only the upgrade ask.
 * No prices are read, ever.
 */
export function comparePreviewFromBody(body: unknown): ComparePreview | null {
  const b = isObj(body) ? body : null
  if (!b) return null
  const d = isObj(b.detail) ? b.detail : null
  const cands = [b.preview, d?.preview, d, b]
  for (const c of cands) {
    if (!isObj(c)) continue
    const swd = isObj(c.sites_with_data) ? c.sites_with_data : null
    const suggestions = normalizeSuggestions(c.suggestions)
    if (!swd && suggestions.length === 0) continue
    const sites = swd ? COMPARE_SITES.filter((s) => swd[s] === true) : []
    return { sites: [...sites], suggestions }
  }
  return null
}

// Single generic words (any tracked locale). Brands ("nike") are NOT here:
// a brand-only query is a valid pooled comparison.
const GENERIC_WORDS = new Set(
  (
    "all everything vintage clothes clothing clothe shoes shoe sneakers trainers jacket jackets coat coats dress dresses bag bags shirt shirts tshirt t-shirt " +
    "sweater sweaters jumper hoodie jeans jean trousers pants skirt top tops men women kids " +
    "tout tous toute vetements vetement veste vestes manteau manteaux robe robes pull pulls chaussures chaussure basket baskets sac sacs chemise pantalon jupe homme femme enfant " +
    "alles kleidung jacke jacken mantel kleid kleider hose hosen schuhe schuh tasche taschen hemd pullover rock herren damen " +
    "todo todos ropa chaqueta chaquetas abrigo abrigos vestido vestidos zapatos zapatillas bolso bolsos camisa camisas pantalones falda hombre mujer " +
    "tutto abbigliamento giacca giacche cappotto cappotti vestito vestiti scarpe borsa borse camicia camicie pantaloni gonna uomo donna " +
    "tudo roupa casaco casacos sapatos tenis mala malas calcas saia homem mulher"
  ).split(/\s+/),
)

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

/** True for a 1-word input that is a generic category word, not a brand or model. */
export function isGenericCompareInput(q: string | null | undefined): boolean {
  const words = fold((q ?? "").trim()).split(/\s+/).filter(Boolean)
  return words.length === 1 && GENERIC_WORDS.has(words[0])
}
