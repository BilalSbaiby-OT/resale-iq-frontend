// Pricing ladder: Free -> Starter -> Pro -> Business.
//
// Free is deliberately depth-limited rather than time-limited. Every lookup
// returns the BUY/WATCH/SKIP headline, and FREE_UNLOCKS_PER_DAY (3) of them
// per day also return the numbers. That proves the data is real — the hardest
// thing to sell — while staying useless for sourcing a week's stock, so it
// converts rather than substitutes. A trial would instead give everything away
// and then take it back, which churns.
//
// Business €99 is an enquiry-only anchor that makes Pro €49 read as obvious
// value. It has no Stripe price on purpose: team seats and bulk features are
// NOT built, and selling them self-serve would repeat this project's worst
// habit of advertising things that do not exist.
export interface Tier {
  id: string
  name: string
  price: number            // monthly EUR
  priceId?: string         // Stripe price id (checkout); absent = waitlist tier
  tagline: string
  cta: string
  highlight?: boolean      // the recommended / most-popular tier
  anchor?: boolean         // the high anchor tier (no checkout, enquiry only)
  free?: boolean           // the no-card entry rung
  features: string[]
  /** One honest sentence on what runs out — the reason to climb. */
  ceiling?: string
}

// Ordered high → low so the eye anchors on €99 first.
export const TIERS: Tier[] = [
  {
    id: "business",
    name: "Business",
    price: 99,
    anchor: true,
    tagline: "High volume or a team? Let's talk.",
    cta: "Talk to us",
    // Enquiry-only tier: no priceId, so it can never be self-served. We promise
    // a conversation, NOT specific unbuilt features — anything scoped here is
    // agreed case-by-case before any money changes hands.
    features: [
      "Everything in Pro",
      "Custom scope, agreed with you directly",
      "Priority support from the founder",
      "Volume & multi-seat pricing on request",
    ],
  },
  {
    id: "power",
    name: "Pro",
    price: 49,
    priceId: "__POWER__",
    highlight: true,
    tagline: "For serious sellers who move volume",
    cta: "Start selling smarter",
    ceiling: "Need seats, bulk or a custom scope? That's a conversation.",
    features: [
      "Everything in Starter",
      "Live deal finder across 5 EU markets",
      "3-week demand Order Planner",
      "Per-size sell-through velocity",
      // REST API is real (POST /auth/api-key → X-Api-Key auth, power plan only).
      // "Webhook alerts" was removed — we do not ship customer webhooks.
      "REST API access (your own API key)",
      "Cross-platform fee calculator",
    ],
  },
  {
    id: "operator",
    name: "Starter",
    price: 19,
    priceId: "__OPERATOR__",
    tagline: "Everything you need to stop guessing",
    cta: "Start selling smarter",
    features: [
      "Unlimited buy/sell verdicts",
      "All 100 product signals, unblurred",
      "Full market trends & brand rankings",
      "Authenticity signals (confidence score, not a guarantee)",
      "Watchlist & portfolio P&L",
    ],
    ceiling: "No live deal finder, Order Planner or API — that's Pro.",
  },
  {
    id: "free",
    name: "Free",
    price: 0,
    free: true,
    tagline: "See that the data is real before you pay",
    cta: "Create a free account",
    features: [
      "Unlimited BUY / WATCH / SKIP verdicts",
      "3 full unlocks a day — buy-below price, sell price, sizes, sell-through",
      "The whole reselling manual and market data",
      "No card required",
    ],
    ceiling: "Only 3 items a day come with the numbers.",
  },
]

// Resolve the display placeholders to the live Stripe price ids from /stripe/plans.
export function resolvePriceId(placeholder: string | undefined, plans: { id: string; price_id?: string }[]): string | undefined {
  if (!placeholder) return undefined
  const map: Record<string, string> = { "__OPERATOR__": "operator", "__POWER__": "power" }
  const planId = map[placeholder]
  return plans.find(p => p.id === planId)?.price_id
}
