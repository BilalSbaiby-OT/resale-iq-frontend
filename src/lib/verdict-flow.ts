/**
 * Which UI surface produced a /api/verdict call (O2, 2026-10-03).
 *
 * The backend stores this in verdict_logs.flow and whitelists the same five
 * values (db/queries.py VERDICT_FLOWS) — anything else becomes NULL there. The
 * point is a funnel we can read: of the checks that end at the paywall, how
 * many started from a sample chip, how many were a visitor's own item, how
 * many came from a buy-list row or a blog post.
 *
 *   sample_button  a free-sample / demo chip (FREE_SAMPLES, ModelChips, "try these")
 *   own_item       an unpaid visitor (no account, or free account) typed an item
 *                  that is NOT a free sample — the first-free-verdict path
 *   typed          anything else the visitor typed (paid user, or a sample typed by hand)
 *   buylist        a buy-list row click
 *   blog_example   the blog's embedded checker / examples / SSR blog prefetch
 *
 * Calls with no user action behind them (SSR hero / pricing demo / crawler
 * teaser) send no flow and are stored as NULL on purpose.
 *
 * Plain .ts with one sibling import so node:test can load it.
 */
import { isFreeSample } from "./free-samples.ts"

export const VERDICT_FLOWS = ["sample_button", "own_item", "typed", "buylist", "blog_example"] as const
export type VerdictFlow = (typeof VERDICT_FLOWS)[number]

/** `&flow=x` for a URL that already has `?q=`; "" when there is no flow. */
export function flowParam(flow?: VerdictFlow | null): string {
  return flow ? `&flow=${flow}` : ""
}

/** Plans that pay. Everything else (anon, "free", unknown) is an unpaid visitor. */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "operator" || plan === "power"
}

/** Flow for a query the visitor typed (or arrived with as a deep link). */
export function typedFlow(query: string, plan: string | null | undefined): VerdictFlow {
  return !isPaidPlan(plan) && !isFreeSample(query) ? "own_item" : "typed"
}

const SRC_FLOW: Record<string, VerdictFlow> = {
  // buy-list rows
  buy_list_locked: "buylist",
  dashboard_buy_list: "buylist",
  buy: "buylist",
  "buy-cat": "buylist",
  "buy-cat-hub": "buylist",
  // blog
  "blog-check": "blog_example",
  blog_proof: "blog_example",
  "blog-footer-cta": "blog_example",
  blog_index_try: "blog_example",
  // sample chips that hand off to the checker page
  home_free_sample: "sample_button",
  pricing_free_sample: "sample_button",
  dashboard_suggestion: "sample_button",
  signup_seed: "sample_button",
  signup_seed_dismissed: "sample_button",
}

/** Flow implied by a `?src=` entry point, or undefined when it says nothing. */
export function flowFromSrc(src: string | null | undefined): VerdictFlow | undefined {
  return src && Object.hasOwn(SRC_FLOW, src) ? SRC_FLOW[src] : undefined
}
