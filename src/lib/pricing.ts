// Pricing model — no free tier. Three paid tiers with a high anchor (Business
// €99) that makes Pro €49 read as the obvious value (Slack/Salesforce anchoring;
// Monday.com decoy pattern). Charm pricing throughout. Pro is the decoy winner.
export interface Tier {
  id: string
  name: string
  price: number            // monthly EUR
  priceId?: string         // Stripe price id (checkout); absent = waitlist tier
  tagline: string
  cta: string
  highlight?: boolean      // the recommended / most-popular tier
  anchor?: boolean         // the high anchor tier (no checkout, waitlist)
  features: string[]
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
      "Authenticity checker",
      "Watchlist & portfolio P&L",
    ],
  },
]

// Resolve the display placeholders to the live Stripe price ids from /stripe/plans.
export function resolvePriceId(placeholder: string | undefined, plans: { id: string; price_id?: string }[]): string | undefined {
  if (!placeholder) return undefined
  const map: Record<string, string> = { "__OPERATOR__": "operator", "__POWER__": "power" }
  const planId = map[placeholder]
  return plans.find(p => p.id === planId)?.price_id
}
