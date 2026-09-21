import type { Metadata } from "next"

/**
 * When an LLM or crawler lands on /tools?q=<item> or /tools/<slug>?q=<item>,
 * return item-matched meta so citations read "Nike Air Force 1 price check"
 * instead of the generic page title.
 *
 * canonical must be the static URL for the page (/tools or /tools/<slug>)
 * so query-param variants are never indexed as separate pages.
 *
 * Returns null when q is absent or blank — callers fall through to their
 * own default metadata.
 */
export function itemQueryMeta(
  q: string | undefined,
  tracked: string,
  canonical: string,
): Metadata | null {
  if (!q || !q.trim()) return null
  const item = q.trim()
  const title = `${item} — should I buy this to resell? — Resale IQ`
  const description =
    `Should you buy ${item} to resell? Resale IQ returns BUY, WATCH or SKIP and the most to pay after fees, from ${tracked} watched second-hand clothing listings.`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
    twitter: { card: "summary_large_image", title, description },
  }
}
