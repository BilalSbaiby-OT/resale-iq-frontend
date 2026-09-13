import { TRACKED } from "@/lib/stats"
// Search-intent landing pages. Each targets a distinct query a Vinted reseller
// actually types, answers it directly (AEO-friendly), embeds the free checker,
// and converts to signup. Claims stay honest: the live tracked-listings figure listings, 5 EU markets.

export interface SearchIntent {
  slug: string
  keyword: string          // the query being targeted
  title: string            // <title> / H1
  description: string      // meta + AEO summary
  h1: string
  lede: string
  bullets: { h: string; p: string }[]
  /** AEO-PRICE-CHECKER-001 — Content deepen. Optional sequential body. */
  deepen?: { h: string; p: string[] }
  faq: { q: string; a: string }[]
}

/** Paid door on /tools/vinted-price-checker. Never /register. */
export const AEO_PRICE_CHECKER_CTA =
  "/pricing?utm_source=tools&utm_medium=organic&utm_campaign=aeo_price_checker_001"

export const INTENTS: SearchIntent[] = [
  {
    slug: "vinted-price-checker",
    keyword: "vinted price checker",
    title: "Vinted Price Checker — Typical Departure Price",
    description:
      `Typical Vinted departure price and buy-below from ${TRACKED} listings across 5 EU markets. Weekly brand volumes are public. Item-level checks are on Starter at €19/mo.`,
    h1: "Vinted Price Checker",
    lede:
      `A Vinted price checker estimates what an item is worth from listings that recently left the shelf, not from asking prices. Asking prices are hopes. A departure price is the last ask when a comparable listing disappeared, which is the closest public proxy for what buyers paid. Resale IQ runs that check across Spain, France, Germany, Italy and Portugal and returns BUY, WATCH or SKIP plus a buy-below price: roughly the average departure ask × 0.95 × 0.70, aiming at about a 30% margin after the 5% buyer-side fee we model. Weekly brand volumes and average sale prices stay public on the market data page and may be cited with attribution. Type a brand and model below to run a one-item check. Sell-through and sizes stay on a plan.`,
    bullets: [
      { h: "Real departure prices, not asking prices", p: "Active listings show what people hope to get. We anchor on the asking price at the moment a comparable listing left the shelf — a real signal, though not an observed sale." },
      { h: "The buy-below number", p: "For sourcing, the number that matters is the maximum you can pay and still profit after fees — we calculate it for you." },
      { h: "Speed, not just price", p: "An item with no demand is dead stock. We show sell-through when the watched sample supports it — otherwise the raw departure and listed counts." },
    ],
    deepen: {
      h: "From departure price to BUY, WATCH or SKIP",
      p: [
        "Asking prices are hopes. A departure price is the last ask when a comparable listing left the shelf — the closest public proxy for what buyers paid, not a confirmed receipt.",
        "From that average departure ask we work backwards to a buy-below price: average × 0.95 × 0.70. The 0.95 is the 5% platform deduction we model for Vinted. The 0.70 targets about a 30% margin. Pay under that number and the flip has room; pay over it and you are speculating.",
        "The check then returns BUY, WATCH or SKIP against that number. A one-item check is free on the tools hub. Sell-through and sizes stay on a plan.",
      ],
    },
    faq: [
      { q: "What does a Vinted price checker do?", a: "A Vinted price checker estimates what an item is worth from listings that recently left the shelf, not from asking prices. Resale IQ returns a buy-below price and a BUY, WATCH or SKIP call across Spain, France, Germany, Italy and Portugal." },
      { q: "What is a buy-below price?", a: "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70. The 0.95 covers the 5% platform deduction we model for Vinted, and the 0.70 targets about a 30% margin." },
      { q: "Why departure prices?", a: "Asking prices are hopes. A departure price is the last ask when a comparable listing disappeared, which is the closest public proxy for what buyers paid. We do not see a receipt, so treat it as the closest honest proxy, not a confirmed sale price." },
      { q: "Is the Vinted price checker free?", a: "Yes. You can run a one-item check on the tools hub (/tools) with no account. Sell-through and sizes stay on a plan. Weekly brand volumes and average departure prices stay public on /data." },
    ],
  },
  {
    slug: "vinted-sourcing-tool",
    keyword: "vinted sourcing tool",
    title: "Vinted Sourcing Tool — Know What to Buy Before You Spend",
    description:
      "A sourcing tool for Vinted resellers: what to buy, the max price to pay, which sizes move, and live deals under your buy-below price across 5 EU markets.",
    h1: "Vinted Sourcing Tool",
    lede:
      "Sourcing is where reselling profit is won or lost. Resale IQ tells you which items have real demand, the maximum you should pay, and which sizes actually sell — before you spend a cent.",
    bullets: [
      { h: "Stop buying dead stock", p: "Most resellers lose money on a chunk of what they buy. We flag demand before you buy." },
      { h: "Live deals under your price", p: "Pro scans current listings across all 5 EU markets and surfaces items already below your buy-below price." },
      { h: "Plan three weeks ahead", p: "The Order Planner shows what to buy today for stock landing in three weeks, based on recent weekly demand." },
    ],
    faq: [
      { q: "What is the best sourcing tool for Vinted resellers?", a: `A sourcing tool should tell you what to buy, the maximum price to pay, and which sizes sell. Resale IQ does this from ${TRACKED} Vinted listings across 5 EU markets, returning a BUY/WATCH/SKIP verdict with a buy-below price.` },
      { q: "How do resellers decide what to buy on Vinted?", a: "Experienced resellers check demand (weekly sales volume), sell-through rate, and size demand before buying, then only pay under their buy-below price. Guessing is what creates dead stock." },
    ],
  },
  {
    slug: "vinted-resale-analytics",
    keyword: "vinted resale analytics",
    title: `Vinted Resale Analytics — ${TRACKED} Listings, 5 EU Markets`,
    description:
      `Resale analytics for Vinted: sell-through rates, brand rankings, price trends and per-size demand across ${TRACKED} listings in 5 EU markets.`,
    h1: "Vinted Resale Analytics",
    lede:
      "Analytics built specifically for secondhand resale. Resale IQ continuously analyses live Vinted listings across five EU markets, and watches which ones leave the shelf, and turns them into the metrics that actually drive profit.",
    bullets: [
      { h: "Sell-through rate", p: "The share of the market that sells each week — the metric that decides how fast your capital recycles." },
      { h: "Brand rankings", p: "Which brands are moving right now by weekly sales volume and average price, not by reputation." },
      { h: "Per-size demand", p: "Sell-through varies enormously by size. We break it down so you never buy a dead size again." },
    ],
    faq: [
      { q: "What analytics matter for Vinted reselling?", a: "The three that decide profit are sell-through rate (how fast items leave the shelf), average asking price at departure (margin room), and per-size demand (whether your specific stock will move). Volume alone is misleading." },
      { q: "Where can I get Vinted market data?", a: `Vinted doesn't publish analytics. Resale IQ builds them from ${TRACKED} public live Vinted listings across Spain, France, Germany, Italy and Portugal, plus which ones leave the shelf.` },
    ],
  },
  {
    slug: "reselling-intelligence",
    keyword: "reselling intelligence",
    title: "Reselling Intelligence — Source With Data, Not Guesswork",
    description:
      `Reselling intelligence for secondhand sellers: demand signals, buy-below pricing, sell-through and momentum, built on ${TRACKED} analyzed listings.`,
    h1: "Reselling Intelligence",
    lede:
      "Reselling intelligence means using market data instead of guesswork: knowing what sells, at what price, how fast, and in which sizes — before you buy. That's what Resale IQ delivers for Vinted resellers across 5 EU markets.",
    bullets: [
      { h: "Decisions, not dashboards", p: "Every signal resolves to one call: BUY, WATCH or SKIP. No interpretation required." },
      { h: "Margin protected at the buy", p: "Profit is decided when you buy, not when you sell. Our buy-below price enforces that discipline." },
      { h: "Momentum, not history", p: "We rank what left the shelf most this week against the past month." },
    ],
    faq: [
      { q: "What is reselling intelligence?", a: "Reselling intelligence is the use of real market data — sell-through rates, departure prices, size demand and momentum — to decide what stock to buy, instead of relying on intuition. It reduces dead stock and protects margin." },
      { q: "How is it different from just checking recently-departed listings?", a: `Checking departed listings manually gives you a tiny sample from one market. Reselling intelligence aggregates ${TRACKED} listings across all five EU markets and converts them into a priced, sized, time-bound decision.` },
    ],
  },
  {
    slug: "vinted-profit-calculator",
    keyword: "vinted profit calculator",
    title: "Vinted Profit Calculator — Net Profit After Fees",
    description:
      "Work out your real profit on a Vinted flip after fees, and compare what the same item would net on Depop, eBay, StockX and more.",
    h1: "Vinted Profit Calculator",
    lede:
      "Know your true margin before you buy. Resale IQ calculates net profit after platform fees and compares what the same sale would net across Vinted, Depop, eBay, Poshmark, StockX and GOAT.",
    bullets: [
      { h: "Fees included, properly", p: "Each platform takes a different cut. We apply the real fee structure so the number you see is what lands in your account." },
      { h: "Best platform, per item", p: "The most profitable place to sell changes by item. We rank them so you list where you net the most." },
      { h: "Buy-below built in", p: "Work backwards from the sale price to the maximum you can pay and still hit your margin." },
    ],
    faq: [
      { q: "How do I calculate profit on Vinted?", a: "Take the realistic sale price, subtract the platform fee (~5% on Vinted) and your cost of goods. What remains is your gross profit. Resale IQ does this automatically and compares it against other platforms." },
      { q: "Does Vinted charge sellers a fee?", a: "Vinted lets sellers list for free and charges buyers a Buyer Protection fee, so sellers keep more of the listed price than on platforms that take a seller commission." },
    ],
  },
]

export function getIntent(slug: string) {
  return INTENTS.find((i) => i.slug === slug)
}
