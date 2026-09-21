/**
 * Parse the live HARD_PAYWALL 402 body from /api/verdict.
 *
 * Elon gate (prod, 2026-09-12): anon/unpaid →
 *   { verdict:"PAYWALL", locked:true, message, upgrade_url, plans:[{tier,label,price_eur}] }
 *   HTTP 402, no buy_below / sell_avg / aggregates.
 *
 * The parser is the under-block guard: a 402 body that somehow still carries
 * teaser fields is treated as PAYWALL and those fields are dropped, never
 * copied onto the public card.
 */

export type PaywallPlan = {
  tier: string
  label: string
  price_eur: number
}

export type PaywallPayload = {
  verdict: "PAYWALL"
  locked: true
  message?: string
  reason?: string
  coverage?: string
  coverage_class?: string
  code?: string
  refusal_reason?: string
  upgrade_url?: string
  plans: PaywallPlan[]
}

const DEFAULT_PLANS: PaywallPlan[] = [
  { tier: "operator", label: "Starter", price_eur: 19 },
  { tier: "power", label: "Pro", price_eur: 49 },
]

export function parsePaywallBody(status: number, body: unknown): PaywallPayload | null {
  if (status !== 402) return null
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const raw = Array.isArray(b.plans) ? b.plans : []
  const plans: PaywallPlan[] = raw
    .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
    .map(p => ({
      tier: typeof p.tier === "string" ? p.tier : "",
      label: typeof p.label === "string" ? p.label : String(p.tier ?? ""),
      price_eur: typeof p.price_eur === "number" && Number.isFinite(p.price_eur) ? p.price_eur : 0,
    }))
    .filter(p => p.tier && p.price_eur > 0)
  const opt = (key: string) => (typeof b[key] === "string" ? (b[key] as string) : undefined)
  return {
    verdict: "PAYWALL",
    locked: true,
    message: opt("message"),
    reason: opt("reason"),
    coverage: opt("coverage"),
    coverage_class: opt("coverage_class"),
    code: opt("code"),
    refusal_reason: opt("refusal_reason"),
    upgrade_url: opt("upgrade_url"),
    plans: plans.length ? plans : DEFAULT_PLANS,
  }
}

export function operatorPrice(plans?: PaywallPlan[]): number {
  const hit = plans?.find(p => p.tier === "operator" && p.price_eur > 0)
  return hit?.price_eur ?? 19
}
