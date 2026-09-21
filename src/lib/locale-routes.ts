/**
 * Locale ROUTING, not locale COPY. This file is deliberately separate from
 * `@/lib/i18n.ts` (the dictionary, owned by frontend-eng) — it only knows
 * which path segments are real, translated pages, and how to build the
 * hreflang set for them. Adding a language here without a translated route
 * behind it reproduces the exact bug this file exists to close: a URL that
 * promises a language it does not serve.
 *
 * Scope, on purpose: PATH_LOCALES gates which pages get a locale-prefixed
 * route at all, so a URL never promises a language it does not serve.
 *
 * The homepage is fully translated (it reads `copy[locale]` from i18n.ts for
 * every string that matters). /methodology is now translated too (58 keys
 * verified in all 6 locales, src/lib/methodology-copy.ts) and has its own
 * route at src/app/[locale]/methodology/page.tsx — a handful of short,
 * mostly figure-adjacent prose fragments on that page still have no
 * translation key and render in English on every locale (grep
 * src/app/methodology/page.tsx for "no key yet"); that is a real, smaller
 * gap, not the old "page is 100% English" state.
 *
 * Every other deep page (`/check`, `/blog`, `/terms`, ...) is still 100%
 * English and deliberately NOT in PATH_LOCALES — see the SEO session notes
 * for why routing ahead of translated content was rejected rather than
 * shipped, and src/app/[locale]/[...rest]/page.tsx for what happens when a
 * locale-prefixed URL hits one of those paths today (a redirect to the
 * English page, not a 404 and not a silently-English render under a foreign
 * URL).
 */
import type { Locale } from "./i18n"

/** English is unprefixed at "/" and is not in this list. */
export const PATH_LOCALES = ["es", "fr", "de", "it", "pt"] as const
export type PathLocale = (typeof PATH_LOCALES)[number]

export function isPathLocale(v: string): v is PathLocale {
  return (PATH_LOCALES as readonly string[]).includes(v)
}

/**
 * Shared `generateStaticParams` for every `[locale]/<root>/page.tsx` route
 * (methodology, register, support, ...). Extracted because the identical
 * three-line body was about to exist in three separate files — the exact
 * "same rule in two places" shape check-duplicate-logic.mjs exists to catch,
 * having already cost this repo three incidents (see that script's header).
 */
export function localeStaticParams() {
  return PATH_LOCALES.map((locale) => ({ locale }))
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

/**
 * Unprefixed paths that have a real translated route at `/<locale><path>`.
 * Cookie-carrying visitors get a 307 there (src/proxy.ts). A URL must never
 * promise a language it does not serve — only add a path once the locale
 * page actually renders translated copy.
 */
export const LOCALE_ROUTED_EXACT = [
  "/methodology",
  "/pricing",
  "/data",
  "/tools",
  "/best",
  "/vs",
  "/for",
] as const

export const LOCALE_ROUTED_PREFIXES = ["/best/", "/vs/", "/for/"] as const

/** GSC EN winners cloned onto /es|/fr|/de|/it|/pt. Keep in sync with seo-landings copy. */
export const BLOG_CLONE_SLUGS = [
  "how-to-price-items-on-vinted",
  "how-to-find-items-to-flip-on-vinted",
  "vinted-bundles-and-offers-strategy",
  "how-to-get-more-views-on-vinted",
  "vinted-vs-depop-for-sellers",
  "seasonal-reselling-calendar",
  "best-time-to-list-on-vinted",
  "reseller-record-keeping-basics",
  "vinted-listing-description-guide",
  "best-brands-to-resell-on-vinted",
  "buy-below-price-explained",
  "what-sells-best-on-vinted",
] as const

export type BlogCloneSlug = (typeof BLOG_CLONE_SLUGS)[number]

export function isBlogCloneSlug(slug: string): slug is BlogCloneSlug {
  return (BLOG_CLONE_SLUGS as readonly string[]).includes(slug)
}

export function isLocaleRoutedPath(pathname: string): boolean {
  if ((LOCALE_ROUTED_EXACT as readonly string[]).includes(pathname)) return true
  if (LOCALE_ROUTED_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (pathname.startsWith("/blog/")) return isBlogCloneSlug(pathname.slice("/blog/".length))
  return false
}

/**
 * Cookie-only translated roots that are not in LOCALE_ROUTED_EXACT
 * (proxy 307 list) but still have a real `/[locale]/<root>` page.
 */
const LOCALE_ROUTED_EXTRA_ROOTS = ["register", "support"] as const

/**
 * IQ-012 — sibling URL for the language switcher.
 *
 * The switcher used to hard-code homepage / methodology / register / support.
 * `/de/pricing`, `/de/data`, `/de/tools` (and the other locale-routed hubs)
 * then reloaded the same URL after setting a cookie, so picking Français
 * looked broken. Derive from the routing table instead of a second set.
 */
export function localeSiblingPath(pathname: string, locale: Locale): string | null {
  const seg = pathname.split("/").filter(Boolean)
  if (seg.length > 0 && isPathLocale(seg[0])) seg.shift()
  if (seg.length === 0) return canonicalPath(locale, "")
  const unprefixed = `/${seg.join("/")}`
  const root = seg[0] ?? ""
  if ((LOCALE_ROUTED_EXTRA_ROOTS as readonly string[]).includes(root)) {
    return canonicalPath(locale, unprefixed)
  }
  if (isLocaleRoutedPath(unprefixed)) return canonicalPath(locale, unprefixed)
  return null
}

/**
 * "/es/register" -> "/register", "/es" -> "/", "/register" -> "/register".
 *
 * Exists because funnel events were keyed on the raw pathname, so every
 * locale-prefixed visit was invisible to the funnel. Measured on production
 * 2026-09-06: the `pageviews` table holds 7 rows for "/es/register" and every
 * one of them has `event IS NULL` — `signup_started` never fired for a Spanish
 * visitor, and the same hole existed for /fr, /de, /it, /pt and for "/es" vs
 * "/" on the landing page.
 *
 * Only strips a segment that is a real PATH_LOCALE, so a future "/esim" or a
 * page literally named "/deals" is untouched.
 */
export function stripLocalePrefix(pathname: string): string {
  const m = /^\/([^/]+)(\/.*)?$/.exec(pathname)
  if (!m || !isPathLocale(m[1])) return pathname
  return m[2] || "/"
}
