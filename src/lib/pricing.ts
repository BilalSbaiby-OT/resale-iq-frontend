// Pricing ladder: public data (Free card) -> Starter -> Pro.
//
// HARD_PAYWALL: anon /api/verdict is 402. The Free card is public weekly
// volumes on /data, not item checks. Item-level BUY/WATCH/SKIP is Starter
// €19; Pro €49 adds Planner / Compare / API.
//
// Business €99 was cut 2026-08-31 (AMENDMENTS.md AM-3, founder-approved):
// zero customers, no Stripe price ever existed for it, nothing to provide
// behind it right now. Removed rather than parked so nobody re-adds a tier
// with no built entitlements behind it.
export interface Tier {
  id: string
  name: string
  price: number            // monthly EUR
  priceId?: string         // Stripe price id (checkout); absent = waitlist tier
  /** Annual EUR total (2 months free vs monthly x12). Absent = no annual price yet. */
  priceAnnual?: number
  /** Stripe annual price id placeholder, resolved via resolveAnnualPriceId(). */
  priceIdAnnual?: string
  tagline: string
  cta: string
  highlight?: boolean      // the recommended / most-popular tier
  /** Framed increment over the tier below — the "it is only X more" line. */
  stepUp?: string
  /** The one sentence that justifies that increment. */
  stepUpWhy?: string
  free?: boolean           // the no-card entry rung
  features: string[]
  /** One honest sentence on what runs out — the reason to climb. */
  ceiling?: string
}

// Ordered high → low so the eye anchors on Pro first.
export const TIERS: Tier[] = [
  {
    id: "power",
    name: "Pro",
    price: 49,
    priceId: "__POWER__",
    priceAnnual: 490,
    priceIdAnnual: "__POWER_ANNUAL__",
    highlight: true,
    // The €19 -> €49 jump only reads as fair once the difference is named as a
    // category change rather than a longer feature list. Starter answers when
    // you ask. Pro does the asking: it watches all five markets continuously
    // and surfaces items already under your buy price. That is the difference
    // between a reference tool and a sourcing engine, and it is what people are
    // actually paying the extra €30 for.
    tagline: "Plan how many of each brand to buy",
    cta: "Let it find the deals",
    stepUp: "+€30 over Starter — about €1 a day",
    stepUpWhy:
      "Starter tells you whether an item is worth buying once you've found it. Pro adds the Order Planner (how many pieces of each brand to buy), Price Compare and the API.",
    ceiling: "Need seats, bulk or a custom scope? That's a conversation.",
    features: [
      "Everything in Starter",
      "Order Planner — how many pieces of each brand to buy",
      "Per-size sell-through when the watched sample supports it",
      "REST API access (your own API key)",
      "Price Compare — full buy-below intelligence on ES/FR/DE/IT/PT, plus live asking-price search across 26 markets total",
    ],
  },
  {
    id: "operator",
    name: "Starter",
    price: 19,
    priceId: "__OPERATOR__",
    priceAnnual: 190,
    priceIdAnnual: "__OPERATOR_ANNUAL__",
    tagline: "Answers on anything you look up",
    cta: "Get the numbers",
    features: [
      "Unlimited buy/sell verdicts",
      "Every product signal we compute, unblurred",
      "Fast sellers — models that sell in all five markets",
      "Full market trends & brand rankings",
      "Watchlist & portfolio P&L",
      "Cross-platform fee calculator",
    ],
    ceiling: "No Order Planner, Price Compare or API — that's Pro.",
  },
  {
    id: "free",
    name: "Free",
    price: 0,
    free: true,
    tagline: "Weekly brand volumes stay public",
    cta: "See public data",
    features: [
      "Weekly brand volumes and average departure prices on /data, no account.",
      "The reselling manual, no signup.",
      "No anonymous item-level buy-below.",
      "Item checks are Starter at €19 a month.",
    ],
    ceiling: "There is no free item-check tier.",
  },
]

// planDisplayName() lived here and mapped operator/power/free to Starter/Pro/
// Free. It was deleted on 2026-09-06: it took a plan STRING, so it could not
// see trial_active and rendered "Free" to a user mid-trial while /account said
// "Free trial", and it returned English to all six locales. Plan naming is now
// src/lib/entitlement.ts planChip(user, locale), which takes the whole user.
// Do not reintroduce a plan-name helper here.

// Public /stripe/plans ids (also returned by the live API). Used when the
// click happens before getPlans() hydrates — that path used to dump strangers
// to /register and we converted 0 of them.
export const BAKED_PRICE_IDS: Record<string, string> = {
  operator: "price_1U0psg1Mvj7CL8HQ58vsNbPF",
  power: "price_1U0psh1Mvj7CL8HQd4eK0kVM",
}

export function resolvePriceId(placeholder: string | undefined, plans: { id: string; price_id?: string }[]): string | undefined {
  if (!placeholder) return undefined
  const map: Record<string, string> = { "__OPERATOR__": "operator", "__POWER__": "power" }
  const planId = map[placeholder]
  if (!planId) return undefined
  return plans.find(p => p.id === planId)?.price_id || BAKED_PRICE_IDS[planId]
}

// Annual prices (2026-09-28 sprint): 2 months free vs monthly x12. Same
// baked-fallback pattern as BAKED_PRICE_IDS — created live via Stripe API,
// recorded here so the very first click (before /stripe/plans hydrates)
// still resolves to a real price id instead of bouncing to /register.
export const BAKED_ANNUAL_PRICE_IDS: Record<string, string> = {
  operator: "price_1UKlc51Mvj7CL8HQgGFgVKQK",
  power: "price_1UKlc51Mvj7CL8HQ3Dr1nptv",
}

export function resolveAnnualPriceId(
  placeholder: string | undefined,
  plans: { id: string; price_id_annual?: string }[],
): string | undefined {
  if (!placeholder) return undefined
  const map: Record<string, string> = { "__OPERATOR_ANNUAL__": "operator", "__POWER_ANNUAL__": "power" }
  const planId = map[placeholder]
  if (!planId) return undefined
  return plans.find(p => p.id === planId)?.price_id_annual || BAKED_ANNUAL_PRICE_IDS[planId]
}

export type BillingCycle = "monthly" | "yearly"

/** The EUR figure a pricing card shows for the selected billing cycle.
 *  Yearly uses the tier's real annual total (2 months free); if a tier
 *  somehow has no priceAnnual, falls back to price*12 so the card never
 *  shows a blank number (defensive — every current tier has priceAnnual). */
export function tierPriceEur(tier: Pick<Tier, "price" | "priceAnnual">, cycle: BillingCycle): number {
  if (cycle === "monthly") return tier.price
  return tier.priceAnnual ?? tier.price * 12
}
