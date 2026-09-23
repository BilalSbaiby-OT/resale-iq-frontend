/**
 * SSR prefetch for a blog post's preflight query.
 *
 * WHY: Blog posts (130 unique visitors/7d, our largest audience) auto-run the
 * inline checker client-side. The visitor sees a spinner → API call → 402 →
 * HardPaywallCard. The delay is dead time before the conversion moment.
 *
 * This fetches the verdict server-side so the HardPaywallCard (with
 * comparable_n when C189 backend is live) renders on first HTML paint — no
 * JS, no spinner, no below-fold load.
 *
 * Rules:
 *  - Anon (no auth) — will return PAYWALL for almost all queries.
 *  - Returns null on any error → BlogInlineChecker falls back to client fetch.
 *  - Returns null for a 200 (free model) → client auto-run picks it up.
 *  - revalidate: 3600 — re-fetches hourly via ISR, not every build.
 *  - Never fabricates a result — null is always the safe fallback.
 */
import { parsePaywallBody, type PaywallPayload } from "@/lib/hard-paywall"

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

export async function ssrBlogVerdict(
  query: string | undefined | null
): Promise<PaywallPayload | null> {
  if (!query) return null
  try {
    const r = await fetch(
      `${backendUrl()}/api/verdict?q=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    )
    let body: unknown = null
    try {
      body = await r.json()
    } catch {
      // why: non-JSON error pages (e.g. 502 HTML) should not crash the SSR render.
      // body stays null and parsePaywallBody handles a null body safely.
    }
    // Only seed PAYWALL results — free-model 200s should stay as client auto-runs
    // so the result is live, not a stale SSR snapshot.
    return parsePaywallBody(r.status, body)
  } catch (err) {
    // why: ssrBlogVerdict is a best-effort optimisation — the blog post must always
    // render even when the backend is down. BlogInlineChecker falls back to its own
    // client-side fetch. Log so backend outages surface in server logs.
    console.warn("[ssr-blog-verdict] prefetch failed, falling back to client fetch:", err instanceof Error ? err.message : String(err))
    return null
  }
}
