/**
 * Paths that next.config.ts permanently redirects elsewhere. They must NOT be
 * listed in sitemap.xml: a sitemap entry that 308s tells Google the URL is a
 * page (and it also duplicated /flip's title in the report as
 * "Page with redirect"). Kept in a plain module so a unit test can compare it
 * with the literal `source:` entries in next.config.ts.
 */
export const SITEMAP_EXCLUDED_REDIRECTS: readonly string[] = [
  "/blog/stone-island-hoodies-eu-vinted-price-guide",
  "/blog/how-to-spot-fake-items-vinted",
  "/blog/days-to-sell-vs-profit-margin",
  "/flip/bershka",
  "/flip/mango",
  "/flip/pull-bear",
  "/flip/jordan/model/jordan-1",
]

const EXCLUDED = new Set(SITEMAP_EXCLUDED_REDIRECTS)

export function isRedirectedPath(url: string): boolean {
  const path = url.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "") || "/"
  return EXCLUDED.has(path)
}
