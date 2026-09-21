/**
 * IQ-002 FE half — coverage vs paywall.
 *
 * Backend today returns PAYWALL (402) for almost every anon query outside
 * Samba / AF1 / NB 530. Do not invent fields. When the API already names
 * unknown/untracked (optional `reason` / `coverage` / `coverage_class` /
 * `verdict: UNKNOWN`) OR the query matches no catalog *brand* we already
 * ship, prefer a “not in catalog” face over Stripe copy.
 *
 * seo-brands.json is slugs, not warehouse numbers. Matching model-name
 * fragments ("Jacket") falsely paywalled unknown queries. Brand names
 * only. Miu Miu is not a catalog brand today → coverage, not Should I buy.
 */
import brandsRaw from "../data/seo-brands.json" with { type: "json" }
import { FREE_MODELS } from "./working-models.ts"

export type QueryCoverageKind = "free_sample" | "catalog" | "untracked"
export type CheckerFace = "paywall" | "coverage"

const UNTRACKED_CODES =
  /^(untracked|unknown|not_in_catalog|off_catalog|no_coverage|low_coverage|coverage_gap|low_demand)$/i

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function hasPhrase(haystack: string, needle: string): boolean {
  const n = normalize(needle)
  if (n.length < 3) return false
  return ` ${normalize(haystack)} `.includes(` ${n} `)
}

const CATALOG_BRANDS: string[] = (brandsRaw as { brands: { brand: string }[] }).brands
  .map((b) => b.brand)
  .filter(Boolean)

export function apiSignalsUntracked(body: unknown): boolean {
  if (!body || typeof body !== "object") return false
  const b = body as Record<string, unknown>
  if (b.verdict === "UNKNOWN") return true
  for (const key of ["reason", "coverage", "coverage_class", "code", "refusal_reason"] as const) {
    const v = b[key]
    if (typeof v === "string" && UNTRACKED_CODES.test(v.trim())) return true
  }
  return false
}

export function queryCoverageKind(q: string): QueryCoverageKind {
  const query = q.trim()
  if (query.length < 2) return "untracked"
  if ([...FREE_MODELS].some((m) => hasPhrase(query, m))) return "free_sample"
  if (CATALOG_BRANDS.some((b) => hasPhrase(query, b))) return "catalog"
  return "untracked"
}

/**
 * Which face to render after a 402 / PAYWALL / UNKNOWN payload.
 * Catalog + PAYWALL stays Stripe. Untracked never pretends a number is waiting.
 */
export function checkerFace(opts: {
  verdict?: string | null
  query: string
  apiBody?: unknown
}): CheckerFace {
  if (apiSignalsUntracked(opts.apiBody)) return "coverage"
  if (opts.verdict === "UNKNOWN") return "coverage"
  if (queryCoverageKind(opts.query) === "untracked") return "coverage"
  return "paywall"
}
