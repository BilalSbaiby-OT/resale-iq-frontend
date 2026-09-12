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
  faq: { q: string; a: string }[]
}

export const INTENTS: SearchIntent[] = [
  {
    slug: "vinted-price-checker",
    keyword: "vinted price checker",
    title: "Vinted Price Checker — What Any Item Really Sells For",
    description:
      `Vinted price checker from ${TRACKED} listings across 5 EU markets. Weekly brand volumes are public. Item-level buy-below, sell-through and sizes are on Operator at €19/mo.`,
    h1: "Vinted Price Checker",
    lede:
      `A Vinted price checker estimates what an item is worth from listings that recently left the shelf, not from asking prices. Asking prices are hopes. A departure price is the last ask when a comparable listing disappeared, which is the closest public proxy for what buyers paid. Resale IQ runs that check across Spain, France, Germany, Italy and Portugal and returns BUY, WATCH or SKIP plus a buy-below price: roughly the average departure ask × 0.95 × 0.70, aiming at about a 30% margin after the 5% buyer-side fee we model. Weekly brand volumes and average sale prices stay public on the market data page and may be cited with attribution. Item-level buy-below, sell-through and sizes are on Operator at €19 a month. Type a brand and model below to start a check; the paywall is the next step, not a hidden free number.`,
    bullets: [
      { h: "Real departure prices, not asking prices", p: "Active listings show what people hope to get. We anchor on the asking price at the moment a comparable listing left the shelf — a real signal, though not an observed sale." },
      { h: "The buy-below number", p: "For sourcing, the number that matters is the maximum you can pay and still profit after fees — we calculate it for you." },
      { h: "Speed, not just price", p: "An item with no demand is dead stock. We show sell-through when the watched sample supports it — otherwise the raw departure and listed counts." },
    ],
    faq: [
      { q: "How do I check the price of an item on Vinted?", a: `Search the exact brand and model and look at listings that recently left the shelf, not active ones — active listings show asking prices, and departed listings show the price at the moment they disappeared, which is our closest honest proxy for what buyers actually paid. Resale IQ automates this across ${TRACKED} listings in 5 EU markets and returns the typical departure price plus a buy-below price.` },
      { q: "Is there a free Vinted price checker?", a: "Weekly brand volumes and average departure prices are free on the market data page. There is no anonymous item-level buy-below. Starting a check on this page leads to Operator at €19 a month before BUY, WATCH or SKIP, the max you should pay, or sizes appear. Category demand without a plan lives on /data and /category." },
      { q: "What is a fair price to pay for an item to resell on Vinted?", a: "Pay no more than the buy-below price: roughly the average asking price at departure × 0.95 (the 5% platform deduction we model for Vinted) × 0.70, which targets about a 30% margin. Substitute your own fee figure if yours differs." },
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
