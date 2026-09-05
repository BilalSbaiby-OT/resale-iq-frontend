/**
 * Live Adidas Samba verdict for the landing hero. Server-side, no visitor
 * cookie — must not spend the anonymous 10/day quota. Cached 5 minutes so
 * every homepage hit is not a fresh analyzer run.
 *
 * UNKNOWN is legal: if the fetch fails, the checker still renders empty.
 */
export type HeroVerdict = {
  verdict?: string
  product?: string
  category?: string
  buy_below?: number | null
  sell_avg?: number | null
  n?: number | null
  sold_7d?: number | null
  active_listings?: number | null
  confidence?: string
  confidence_note?: string
  locked?: boolean
}

const QUERY = "Adidas Samba"

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

export async function getHeroVerdict(): Promise<{ query: string; result: HeroVerdict | null }> {
  try {
    const r = await fetch(`${backendUrl()}/api/verdict?q=${encodeURIComponent(QUERY)}`, {
      next: { revalidate: 300 },
    })
    if (!r.ok) return { query: QUERY, result: null }
    const result = (await r.json()) as HeroVerdict
    if (!result || result.verdict === "LIMIT_REACHED") return { query: QUERY, result: null }
    return { query: QUERY, result }
  } catch {
    // why: homepage must still render if the analyzer is down. Empty checker
    // is honest; a thrown error would 500 the most-linked page.
    return { query: QUERY, result: null }
  }
}
