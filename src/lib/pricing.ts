// Pricing ladder: public data (Free card) -> Starter -> Pro.
//
// HARD_PAYWALL: anon /api/verdict is 402. The Free card is public weekly
// volumes on /data, not item checks. Item-level BUY/WATCH/SKIP is Starter
// €19; Pro €49 adds Live Finder / Planner / Compare / API.
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
    highlight: true,
    // The €19 -> €49 jump only reads as fair once the difference is named as a
    // category change rather than a longer feature list. Starter answers when
    // you ask. Pro does the asking: it watches all five markets continuously
    // and surfaces items already under your buy price. That is the difference
    // between a reference tool and a sourcing engine, and it is what people are
    // actually paying the extra €30 for.
    tagline: "It stops waiting for you to ask",
    cta: "Let it find the deals",
    stepUp: "+€30 over Starter — about €1 a day",
    stepUpWhy:
      "Starter tells you whether an item is worth buying, once you have found it. Pro finds it: on demand, it searches the five EU markets we track and shows you listings already priced under your buy-below number.",
    ceiling: "Need seats, bulk or a custom scope? That's a conversation.",
    features: [
      "Everything in Starter",
      "Live Deal Finder — current Vinted listings under your buy-below, on demand when you search",
      "3-week demand Order Planner",
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
    tagline: "Answers on anything you look up",
    cta: "Get the numbers",
    features: [
      "Unlimited buy/sell verdicts",
      "Every product signal we compute, unblurred",
      "Deal Scanner — warehouse models already under buy-below",
      "Full market trends & brand rankings",
      "Watchlist & portfolio P&L",
      "Cross-platform fee calculator",
    ],
    ceiling: "No Live Deal Finder, Order Planner, Price Compare or API — that's Pro.",
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
    ceiling: "There is no free item-check tier. Live Finder is Pro.",
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
