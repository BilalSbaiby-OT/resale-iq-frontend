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
 *  - Never fabricates a result — null is always the safe fallback.
 *
 * H183 FIX (2026-09-29): original code used { next: { revalidate: 3600 } }
 * without a timeout. Inside the deployed FE container, Next.js's patched fetch
 * hangs indefinitely on that ISR option — "it can ignore AbortSignal next to
 * next.revalidate" (per hero-verdict.ts comment). Measured: every blog/[slug]
 * page returned 0 bytes after 25s. Fix: use fetchBounded (2.5s abort,
 * cache:"no-store") which is the established pattern for every other SSR
 * backend call in this codebase.
 */
import { fetchBounded } from "@/lib/hero-verdict"
import { parsePaywallBody, type PaywallPayload } from "@/lib/hard-paywall"

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:8080"
}

export async function ssrBlogVerdict(
  query: string | undefined | null
): Promise<PaywallPayload | null> {
  if (!query) return null
  try {
    const r = await fetchBounded(
      `${backendUrl()}/api/verdict?q=${encodeURIComponent(query)}`
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
