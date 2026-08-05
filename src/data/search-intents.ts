// Search-intent landing pages. Each targets a distinct query a Vinted reseller
// actually types, answers it directly (AEO-friendly), embeds the free checker,
// and converts to signup. Claims stay honest: 30M+ listings, 5 EU markets.

export interface SearchIntent {
  slug: string
  keyword: string          // the query being targeted
  title: string            // <title> / H1
  description: string      // meta + AEO summary
  h1: string
  lede: string
  bullets: { h: string; p: string }[]
  faq: { q: string; a: string }[]
}

export const INTENTS: SearchIntent[] = [
  {
    slug: "vinted-price-checker",
    keyword: "vinted price checker",
    title: "Vinted Price Checker — What Any Item Really Sells For",
    description:
      "Free Vinted price checker. See what an item actually sells for, the max you should pay, and how fast it moves — from 30M+ listings across 5 EU markets.",
    h1: "Vinted Price Checker",
    lede:
      "Check what any item genuinely sells for on Vinted before you buy or list it. Type a brand and model below to get an instant BUY / WATCH / SKIP call, computed from 30M+ real listings across Spain, France, Germany, Italy and Portugal.",
    bullets: [
      { h: "Real sold prices, not asking prices", p: "Active listings show what people hope to get. We anchor on what actually sold, so your price reflects the real market." },
      { h: "The buy-below number", p: "For sourcing, the number that matters is the maximum you can pay and still profit after fees — we calculate it for you." },
      { h: "Speed, not just price", p: "A high price on an item that never sells is worthless. We show sell-through so you know how fast your cash comes back." },
    ],
    faq: [
      { q: "How do I check the price of an item on Vinted?", a: "Search the exact brand and model and look at recently SOLD listings, not active ones — active listings show asking prices, not real sale prices. Resale IQ automates this across 30M+ listings in 5 EU markets and returns the typical sale price plus a buy-below price." },
      { q: "Is there a free Vinted price checker?", a: "Yes — you can run a free check here to get the headline BUY/WATCH/SKIP verdict for any item. The exact buy-below price, sell price, best sizes and sell-through rate are available on a paid plan." },
      { q: "What is a fair price to pay for an item to resell on Vinted?", a: "Pay no more than the buy-below price: roughly the average sale price × 0.95 (after the ~5% fee) × 0.70, which targets about a 30% margin." },
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
      { h: "Stop buying dead stock", p: "Most resellers lose money on a chunk of what they buy. We flag demand before you commit, so your cash goes into stock that moves." },
      { h: "Live deals under your price", p: "Pro scans current listings across all 5 EU markets and surfaces items already below your buy-below price." },
      { h: "Plan three weeks ahead", p: "The Order Planner shows what to buy today for stock landing in three weeks, based on where demand is heading." },
    ],
    faq: [
      { q: "What is the best sourcing tool for Vinted resellers?", a: "A sourcing tool should tell you what to buy, the maximum price to pay, and which sizes sell. Resale IQ does this from 30M+ Vinted listings across 5 EU markets, returning a BUY/WATCH/SKIP verdict with a buy-below price." },
      { q: "How do resellers decide what to buy on Vinted?", a: "Experienced resellers check demand (weekly sales volume), sell-through rate, and size demand before buying, then only pay under their buy-below price. Guessing is what creates dead stock." },
    ],
  },
  {
    slug: "vinted-resale-analytics",
    keyword: "vinted resale analytics",
    title: "Vinted Resale Analytics — 30M+ Listings, 5 EU Markets",
    description:
      "Resale analytics for Vinted: sell-through rates, brand rankings, price trends and per-size demand across 30M+ listings in 5 EU markets.",
    h1: "Vinted Resale Analytics",
    lede:
      "Analytics built specifically for secondhand resale. Resale IQ continuously analyses live and sold Vinted listings across five EU markets and turns them into the metrics that actually drive profit.",
    bullets: [
      { h: "Sell-through rate", p: "The share of the market that sells each week — the metric that decides how fast your capital recycles." },
      { h: "Brand rankings", p: "Which brands are moving right now by weekly sales volume and average price, not by reputation." },
      { h: "Per-size demand", p: "Sell-through varies enormously by size. We break it down so you never buy a dead size again." },
    ],
    faq: [
      { q: "What analytics matter for Vinted reselling?", a: "The three that decide profit are sell-through rate (how fast items sell), average sale price (margin room), and per-size demand (whether your specific stock will move). Volume alone is misleading." },
      { q: "Where can I get Vinted market data?", a: "Vinted doesn't publish analytics. Resale IQ builds them from 30M+ public live and sold listings across Spain, France, Germany, Italy and Portugal." },
    ],
  },
  {
    slug: "reselling-intelligence",
    keyword: "reselling intelligence",
    title: "Reselling Intelligence — Source With Data, Not Guesswork",
    description:
      "Reselling intelligence for secondhand sellers: demand signals, buy-below pricing, sell-through and momentum, built on 30M+ analyzed listings.",
    h1: "Reselling Intelligence",
    lede:
      "Reselling intelligence means replacing gut feel with evidence: knowing what sells, at what price, how fast, and in which sizes — before you buy. That's what Resale IQ delivers for Vinted resellers across 5 EU markets.",
    bullets: [
      { h: "Decisions, not dashboards", p: "Every signal resolves to one call: BUY, WATCH or SKIP. No interpretation required." },
      { h: "Margin protected at the buy", p: "Profit is decided when you buy, not when you sell. Our buy-below price enforces that discipline." },
      { h: "Momentum, not history", p: "We track what's accelerating this week, so you're sourcing into rising demand rather than last month's trend." },
    ],
    faq: [
      { q: "What is reselling intelligence?", a: "Reselling intelligence is the use of real market data — sell-through rates, sold prices, size demand and momentum — to decide what stock to buy, instead of relying on intuition. It reduces dead stock and protects margin." },
      { q: "How is it different from just checking sold listings?", a: "Checking sold listings manually gives you a tiny sample from one market. Reselling intelligence aggregates millions of listings across markets and converts them into a priced, sized, time-bound decision." },
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
