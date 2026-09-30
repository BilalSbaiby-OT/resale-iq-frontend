/**
 * Sitemap <lastmod> derivations. A hub's lastmod must MOVE when its children
 * move; a hardcoded constant tells crawlers the hub is unchanged, so new
 * children stay undiscovered (the "stale hub lastmod" trap). Every hub date in
 * sitemap.ts is derived through here from the same data the hub renders.
 * Plain module — loadable by node --test.
 */
const day = (d: Date): Date => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))

export function maxDay(dates: Array<Date | string | undefined | null>, fallback: Date): Date {
  const ms = dates
    .map((d) => (d ? new Date(d).getTime() : NaN))
    .filter((n) => Number.isFinite(n)) as number[]
  return ms.length ? day(new Date(Math.max(...ms))) : day(fallback)
}

/** /blog hub: newest updated ?? date across the indexable posts it lists. */
export function blogHubDate(posts: Array<{ date: string; updated?: string; noindex?: boolean }>, fallback: Date): Date {
  return maxDay(posts.filter((p) => !p.noindex).map((p) => p.updated ?? p.date), fallback)
}

/** /manual hub: newest chapter `updated`. */
export function manualHubDate(chapters: Array<{ updated?: string }>, fallback: Date): Date {
  return maxDay(chapters.map((c) => c.updated), fallback)
}

/** /buy pages: the day the buy-data snapshot was generated (buy-data.json generated_at). */
export function buyDataDate(generatedAt: string, fallback: Date): Date {
  return maxDay([generatedAt], fallback)
}
