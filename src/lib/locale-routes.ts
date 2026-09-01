/**
 * Locale ROUTING, not locale COPY. This file is deliberately separate from
 * `@/lib/i18n.ts` (the dictionary, owned by frontend-eng) — it only knows
 * which path segments are real, translated pages, and how to build the
 * hreflang set for them. Adding a language here without a translated route
 * behind it reproduces the exact bug this file exists to close: a URL that
 * promises a language it does not serve.
 *
 * Scope, on purpose: only the homepage is fully translated today (it already
 * reads `copy[locale]` from i18n.ts for every string that matters). Deep
 * pages (`/methodology`, `/check`) are not in PATH_LOCALES yet because their
 * copy is still 100% English — see the SEO session notes for why routing
 * ahead of translated content was rejected rather than shipped.
 */
import type { Locale } from "./i18n"

/** English is unprefixed at "/" and is not in this list. */
export const PATH_LOCALES = ["es", "fr", "de", "it", "pt"] as const
export type PathLocale = (typeof PATH_LOCALES)[number]

export function isPathLocale(v: string): v is PathLocale {
  return (PATH_LOCALES as readonly string[]).includes(v)
}

/** Full locale set including English, for hreflang and <html lang>. */
export const ALL_LOCALES: Locale[] = ["en", ...PATH_LOCALES]

const BASE = "https://resaleiq.dev"

/**
 * Reciprocal hreflang block for a page family that exists at "/" (English)
 * and "/<locale>" for every entry in PATH_LOCALES, plus x-default -> "/".
 * `suffix` lets a future page reuse this for e.g. "/methodology" +
 * "/es/methodology" once that route exists — pass "" for the homepage.
 */
export function hreflangLanguages(suffix = ""): Record<string, string> {
  const out: Record<string, string> = { en: `/${suffix}`.replace(/\/+/g, "/") || "/" }
  for (const l of PATH_LOCALES) out[l] = `/${l}${suffix}`
  out["x-default"] = out.en
  return out
}

/** Absolute canonical URL for a locale route, English or prefixed. */
export function canonicalPath(locale: Locale, suffix = ""): string {
  const path = locale === "en" ? `/${suffix}` : `/${locale}${suffix}`
  return path.replace(/\/+/g, "/")
}

export function absoluteUrl(path: string): string {
  return `${BASE}${path}`
}
