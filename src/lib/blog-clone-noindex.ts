/**
 * Locale blog-clone noindex rule (SEO-CONSOLIDATE-P1).
 * noindex,follow when body < 300 words AND the (locale, slug) had 0 human
 * visits in the last 60 days. Any human visit keeps the page indexable.
 * HUMAN_VISITED_60D is from prod pageviews (is_bot=0, 2026-09-30); it must be
 * refreshed by hand if the rule is re-run.
 */
export const THIN_WORD_LIMIT = 300

export const HUMAN_VISITED_60D: ReadonlySet<string> = new Set([
  "de/what-sells-best-on-vinted",
  "es/best-time-to-list-on-vinted",
  "es/what-sells-best-on-vinted",
  "fr/what-sells-best-on-vinted",
  "pt/what-sells-best-on-vinted",
])

export function countWords(v: unknown): number {
  if (typeof v === "string") return v.trim() ? v.trim().split(/\s+/).length : 0
  if (Array.isArray(v)) return v.reduce((n: number, x) => n + countWords(x), 0)
  if (v && typeof v === "object") return Object.values(v).reduce((n: number, x) => n + countWords(x), 0)
  return 0
}

export function shouldNoindexBlogClone(locale: string, slug: string, words: number): boolean {
  if (locale === "en") return false
  if (HUMAN_VISITED_60D.has(`${locale}/${slug}`)) return false
  return words < THIN_WORD_LIMIT
}
