// Pricing ladder: Free -> Starter -> Pro -> Business.
//
// Free is a 7-day reverse trial, then 10 full checks per calendar month.
// Anonymous visitors get 10 numbered views, then a sign-in wall.
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
  /** Framed increment over the tier below — the "it is only X more" line. */
  stepUp?: string
  /** The one sentence that justifies that increment. */
  stepUpWhy?: string
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
      "Priority support",
      "Volume & multi-seat pricing on request",
    ],
  },
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
      "Starter tells you whether an item is worth buying, once you have found it. Pro finds it: it scans all five EU markets every 30 minutes and shows you listings already priced under your buy-below number.",
    ceiling: "Need seats, bulk or a custom scope? That's a conversation.",
    features: [
      "Everything in Starter",
      "Live Deal Finder — current Vinted listings under your buy-below, scanned every 30 minutes",
      "3-week demand Order Planner",
      "Per-size sell-through when the watched sample supports it",
      "REST API access (your own API key)",
      "26-market Price Compare",
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
      "All 100 product signals, unblurred",
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
    tagline: "See that the data is real before you pay",
    cta: "Create a free account",
    features: [
      "7 days of Starter (verdicts + Deal Scanner), 5 live finds and 1 order plan, then 10 full checks / month. Anonymous visitors get 10 checks/day.",
      "BUY / WATCH / SKIP on every lookup",
      "The whole reselling manual and market data",
      "No card required",
    ],
    ceiling: "10 checks each calendar month after the trial. Live Finder after the 5 trial searches is Pro.",
  },
]

// Resolve the display placeholders to the live Stripe price ids from /stripe/plans.
/** Internal plan ids stay operator/power. Customers see Starter/Pro. */
export function planDisplayName(plan: string | undefined | null): string {
  if (plan === "operator") return "Starter"
  if (plan === "power") return "Pro"
  if (plan === "free") return "Free"
  return plan ? plan : "Free"
}

export function resolvePriceId(placeholder: string | undefined, plans: { id: string; price_id?: string }[]): string | undefined {
  if (!placeholder) return undefined
  const map: Record<string, string> = { "__OPERATOR__": "operator", "__POWER__": "power" }
  const planId = map[placeholder]
  return plans.find(p => p.id === planId)?.price_id
}
