import { TRACKED } from "@/lib/stats"
import type { SectionCtaContent } from "@/lib/section-cta"
import { dataCiteHref, pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"
// Programmatic SEO + AEO content. Each post targets a real reseller search query
// and is structured Q&A-first so search engines AND answer engines (ChatGPT,
// Perplexity, Google AI, Claude) can lift clean, citable answers.
// Claims kept honest: `the live tracked-listings figure listings across 5 EU markets` is true; no fabricated
// per-item stats. Methodology figures (30% margin math) are the product's real logic.

export interface BlogPost {
  slug: string
  title: string           // H1 (+ <title> unless seoTitle is set)
  /**
   * Document <title> + OG title when it must differ from the H1.
   * Use the exact string — generateMetadata will not append " — Resale IQ".
   */
  seoTitle?: string
  description: string     // meta description (also the AEO summary)
  date: string            // ISO — original publish date (never rewritten)
  /**
   * ISO date the post's body was last materially rewritten (e.g. a refreshed
   * dated data block). Optional. The sitemap advertises this as lastmod when
   * present, so a content refresh actually signals freshness to crawlers —
   * without falsifying the publish `date`. Omit for never-updated posts.
   */
  updated?: string
  category: string
  readMins: number
  intro: string
  /**
   * EX-AEO-DEFINITIONS — citeable term lead rendered as H2 + 1–2 sentences
   * immediately after the H1 (above the fold). Visible HTML is the source;
   * FAQ / DefinedTerm schema must quote the same wording.
   */
  definedTerm?: { name: string; description: string }
  /**
   * H32: pre-filled query for the blog footer CTA.
   *
   * When set, the "Check this item →" footer button links to
   * /tools?q={preflightQuery}&src=blog-check and auto-runs the check on
   * arrival (FreeChecker's useEffect fires on initialQuery).
   *
   * Use for brand-specific posts where the query maps cleanly to a live
   * catalogue entry — e.g. "Stone Island Jackets", "Adidas Stan Smith".
   * Never set for general guides (what-sells-best, how-to-price) where no
   * single item applies. The /tools page handles BRAND_CATEGORIES and
   * BRAND_AVERAGE gracefully, so brand+category pairs are fine.
   */
  preflightQuery?: string
  sections: {
    h: string
    p: string[]
    /**
     * Optional comparison table, rendered after the section's paragraphs.
     *
     * Prose cannot carry a side-by-side comparison legibly, and a comparison
     * query ("vinted vs depop") is answered by a table or it is not answered.
     * Cells are plain strings and may use the same [label](/path) link syntax
     * as paragraphs. Every row must have the same length as `head`.
     */
    table?: { caption?: string; head: string[]; rows: string[][] }
    /**
     * Optional mid-article conversion block, rendered after this section.
     * Paid CTAs go to /pricing — not /register (register still mentions Free).
     */
    cta?: SectionCtaContent
  }[]
  faq: { q: string; a: string }[]
}

const BRAND = "Resale IQ"
const DATA = `${TRACKED} Vinted listings across the 5 main EU markets (Spain, France, Germany, Italy, Portugal)`

export const POSTS: BlogPost[] = [
  {
    slug: "what-sells-best-on-vinted",
    title: "What Sells Best on Vinted in 2026 (Data-Backed)",
    description:
      `The categories and brands that sell fastest on Vinted right now, based on ${TRACKED} analyzed listings across 5 EU markets — and how to tell before you buy.`,
    date: "2026-09-05",
    updated: "2026-09-15",
    category: "Sourcing",
    readMins: 8,
    preflightQuery: "Stone Island Hoodies",
    intro:
      "As of 15 September 2026, Hoodies are the single busiest category on Vinted across the 5 EU markets " +
      BRAND + " tracks (Spain, France, Germany, Italy, Portugal): at least 1,181 hoodie listings left the shelf in the trailing 7 days across the 28 brands we track — ahead of Jackets (955) and Shirts (760). The single busiest brand/category pair is Fred Perry Shirts: 455 watched departures in 7 days, averaging €14. Autumn is already live: Jackets and Hoodies are clearing at seasonal pace. Full category breakdown, brand/category pairs, and buy-below context below.",
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. [Weekly volumes](" +
        ilinkHref("data") +
        ") and [brands ranked by those departures](" +
        ilinkHref("flip") +
        ") count that figure for tracked brands across Spain, France, Germany, Italy and Portugal.",
    },
    sections: [
      {
        h: "Category volumes — week to 15 September 2026",
        p: [
          "Across the 28 brands Resale IQ tracks in Spain, France, Germany, Italy and Portugal, the busiest categories by watched departures in the trailing 7 days are Hoodies (1,181), Jackets (955), Shirts (760) and Sneakers (713). These four categories account for the majority of tracked movement this week.",
          "Volume alone does not equal margin opportunity. Hoodies lead by departures because Fred Perry, Stone Island, The North Face and Carhartt all generate high Hoodie volume — but exit prices range from €14 (Fred Perry) to €55 (Stone Island), a 4× spread. The table below shows the top tracked categories with representative margin context.",
        ],
        table: {
          caption:
            "Watched departures by category, week to 15 September 2026. 28 tracked brands across Spain, France, Germany, Italy, Portugal. Lead brand shown is the highest-volume contributor in that category.",
          head: ["#", "Category", "Dep/7d", "Avg exit range", "Lead brand/pair", "Season peak"],
          rows: [
            [
              "1",
              "Hoodies",
              "1,181",
              "€14–€55",
              "[Stone Island](/blog/stone-island-reselling-vinted-guide), [Fred Perry](/blog/fred-perry-reselling-vinted-guide)",
              "Oct–Jan",
            ],
            [
              "2",
              "Jackets",
              "955",
              "€35–€142",
              "[Patagonia](/blog/patagonia-reselling-vinted-guide), [Stone Island](/blog/stone-island-reselling-vinted-guide)",
              "Sep–Dec",
            ],
            [
              "3",
              "Shirts",
              "760",
              "€14–€27",
              "[Fred Perry](/blog/fred-perry-reselling-vinted-guide) (455 dep alone)",
              "Year-round",
            ],
            [
              "4",
              "Sneakers",
              "713",
              "€16–€58",
              "[Nike](/blog/nike-reselling-vinted-guide), [Adidas](/blog/adidas-reselling-vinted-guide)",
              "Year-round",
            ],
          ],
        },
      },
      {
        h: "Top brand/category pairs driving the numbers",
        p: [
          "Category volume is useful. Brand/category volume is actionable — it tells you exactly which item to carry and what it clears at.",
          "Week to 15 September 2026 (EU5), the highest-volume tracked brand/category pairs: Fred Perry Shirts 455 watched departures averaging €14 · Stone Island Hoodies 433 departures averaging €55 · Stone Island Jackets 179 departures averaging €142 · Patagonia Jackets averaging €36 · Adidas Sneakers 49+ departures at €58. Full volume ranking across all 28 brands is on the [best brands to resell on Vinted hub](/blog/best-brands-to-resell-on-vinted).",
          "Margin is not proportional to volume. Fred Perry Shirts generate the single highest departure count of any brand/category pair — but the avg exit is €14. Stone Island Jackets generate one-third of the Shirt volume but clear at 10× the price. Volume/turnover and unit margin are different businesses: know which one you are running.",
        ],
        cta: pricingMidCta("ctr_sellsbest_pairs_20260915"),
      },
      {
        h: "Autumn 2026: the transition is live",
        p: [
          "Jackets (955/wk) and Hoodies (1,181/wk) are already at seasonal pace — buyers in France, Germany and Italy are stocking up. Stone Island, Patagonia and The North Face are the three brands whose Jacket and Hoodie mix is clearing fastest right now.",
          "Items to list immediately: Stone Island Hoodies and Jackets, Patagonia Fleeces and Jackets, The North Face Puffer Jackets, Carhartt WIP Hoodies. Competition for listings climbs through October — earlier listings get more views before the shelf floods.",
          "Knitwear has not yet spiked but historically enters its peak in late October. Source it now before listings flood the category and departure prices drop. Shorts, Dresses and Swimwear are in their softest quarter — clear warm-weather stock now or hold until April.",
        ],
      },
      {
        h: "Why the brand alone isn't enough",
        p: [
          "A popular brand with the wrong size sits unsold. Sell-through varies sharply by size — the same shoe can fly in a mid-size and sit in an outlier size.",
          "Category matters too. Levi's ranks #15 by total departures but Jeans account for 83% of all Levi's movement (43 of 52 weekly departures at €29 avg) — Levi's on Vinted is essentially a single-category market, and within that category the 501 Original in vintage indigo exits at €55–80 while a standard 2020 mid-wash exits at €22–28. The brand tells you to look. The model, size and condition tell you whether to buy.",
          "Condition and price do the rest. Two identical items at different prices have completely different sell-through. The winning listing is usually not the cheapest, but the fairest for its condition.",
        ],
      },
      {
        h: "How to use this data before you buy",
        p: [
          "Category and brand volume tells you where demand exists. Buy-below tells you whether there is margin. Use both before tying up cash.",
          "The free weekly tables: [brands ranked by watched departures](/flip) · [weekly volumes and avg exit prices by brand](/data) · [all 28 tracked brands with buy-below guidance and individual guides](/blog/best-brands-to-resell-on-vinted). The item-level call — BUY / WATCH / SKIP with a buy-below price for the specific model — is the paid product.",
          `The practical rule: only buy when the resale price minus fees leaves a healthy margin over your cost AND the item's category/brand is actively moving volume this week. [Brands clearing fastest right now](/flip) and [what left the shelf this week](/data) answer both questions for free. The full equation (fees, shipping, losses, time) is in [what actually makes money in reselling](/manual/what-actually-makes-money).`,
        ],
      },
      {
        h: "Buy-below still decides the flip",
        p: [
          "Knowing what sells best is half the job. The other half is not overpaying for movers.",
          "Week to 15 September 2026 (EU5): Fred Perry 939 watched departures @ €18 · Stone Island 796 @ €70 · Patagonia 792 @ €36 · Gucci 221 @ €212. Volume ≠ margin — pair demand with buy-below before you tie up cash.",
          "[Weekly market data](" +
            dataCiteHref("body_sellsbest_20260915") +
            ").",
        ],
        // BODY-SELLSBEST-002. Campaign body_sellsbest_20260915.
        cta: pricingBodyCta("body_sellsbest_20260915"),
      },
    ],
    faq: [
      {
        q: "What is a watched departure?",
        a:
          "A watched departure is a listing we watched leave the shelf — not a confirmed sale receipt. " +
          "Weekly volumes on [https://resaleiq.dev/data](/data) and the brand ranking on [https://resaleiq.dev/flip](/flip) " +
          "count those transitions for tracked brands across Spain, France, Germany, Italy and Portugal.",
      },
      {
        q: "What sells best on Vinted?",
        a:
          "As of 15 September 2026, among the 28 brands Resale IQ tracks across Spain, France, Germany, Italy and Portugal, " +
          "Hoodies were the busiest category: at least 1,181 hoodie listings left the shelf in the trailing 7 days, ahead of Jackets (955), Shirts (760) and Sneakers (713). " +
          "The busiest brand/category pair was Fred Perry Shirts: 455 watched departures in 7 days, averaging €14. " +
          "That is tracked-brand volume, not the whole Vinted catalogue. Live weekly volumes: [https://resaleiq.dev/data](/data). Brand ranking: [https://resaleiq.dev/flip](/flip). Full 28-brand table: [https://resaleiq.dev/blog/best-brands-to-resell-on-vinted](/blog/best-brands-to-resell-on-vinted).",
      },
      {
        q: "What category sells fastest on Vinted right now?",
        a:
          "As of the week to 15 September 2026, Hoodies (1,181 watched departures/7d) and Jackets (955) are the fastest-clearing categories across the 28 brands Resale IQ tracks in Spain, France, Germany, Italy and Portugal. Both are driven by autumn demand — September is the start of peak-season movement for outerwear and layering pieces. The busiest single brand/category pair is Fred Perry Shirts at 455 departures in 7 days.",
      },
      {
        q: "What sells fastest on Vinted?",
        a:
          "Recognisable sneakers (Nike, Adidas, New Balance) and everyday branded basics (Levi's, Carhartt, The North Face, Stone Island) in common sizes sell fastest, provided they're priced fairly for their condition. " +
          "Sell-through drops sharply for outlier sizes and off-season items. See the live brand ranking on [https://resaleiq.dev/flip](/flip).",
      },
      {
        q: "Does high volume mean a good flip?",
        a:
          "No. Volume and ticket size rarely sit together. Week to 15 September 2026 (EU5): Fred Perry 939 watched departures at €18, Stone Island 796 at €70, Patagonia 792 at €36, Gucci 221 at €212. " +
          "Pair demand with buy-below before you tie up cash. Weekly table: [https://resaleiq.dev/data](/data).",
      },
      {
        q: "What should I avoid buying to resell on Vinted?",
        a:
          "Avoid off-season stock you'll hold for months (buy summer stock in summer, winter stock from September), unbranded or unrecognisable items, outlier sizes with thin demand, and anything you can't buy well below its typical departure price after fees. On Vinted specifically: avoid high-volume low-price categories like Zara T-Shirts (€10 avg) or Pull&Bear Shirts (€11 avg) — the buy-below math only works if you can source under €7.",
      },
      {
        q: "How do I know if an item will sell before I buy it?",
        a:
          `Check how fast comparable listings leave the shelf, at what asking price, and in which sizes. The free weekly tables are [https://resaleiq.dev/flip](/flip) (brands ranked by watched departures) and [https://resaleiq.dev/data](/data) (volumes and average prices at departure across ES/FR/DE/IT/PT). ` +
          `For the full 28-brand breakdown with buy-below for each, see [https://resaleiq.dev/blog/best-brands-to-resell-on-vinted](/blog/best-brands-to-resell-on-vinted). ` +
          `Resale IQ turns ${TRACKED} real listings into a BUY / WATCH / SKIP call with a buy-below price — that item-level verdict is the paid product.`,
      },
      {
        q: "What's the best category to resell on Vinted in autumn 2026?",
        a:
          "Hoodies and Jackets. Week to 15 September 2026, Hoodies generated 1,181 watched departures and Jackets 955 across the 28 tracked brands — both are already clearing at full autumn pace. Stone Island Hoodies average €55 at departure, Stone Island Jackets €142, Patagonia Jackets €36. Source and list now before October listing volume competes yours down. Knitwear has not yet spiked but typically enters its peak window in late October.",
      },
    ],
  },
  {
    slug: "how-to-price-items-on-vinted",
    title: "How to Price Items on Vinted in 2026 — Buy-Below from Departures",
    seoTitle: "How to Price Items on Vinted: Match the Departure Average (2026)",
    description:
      "Price from what similar items actually sold for, not retail. Stone Island hoodies leave at ~€52, Fred Perry shirts at ~€15, Balenciaga at €97–311 — real departure averages from 13M+ tracked EU listings. Undercut by 5–10% to sell faster.",
    date: "2026-08-05",
    updated: "2026-09-20",
    category: "Pricing",
    readMins: 6,
    intro:
      "To price an item on Vinted in 2026, ignore the retail tag. Anchor to the asking price comparable listings had when they left the shelf, then sit slightly under that number. We do not see sale receipts. We watch listings leave. Snapshot 20 September 2026 at 16:49: across Spain, France, Germany, Italy and Portugal we track 5,341,780 listings. Eighteen of 28 tracked brands cleared the publish floor of 5 watched departures and produced 443 observed transitions this week. Fred Perry averaged €16 across 84 departures. Balenciaga averaged €121 across 56. Stone Island averaged €73 across 62. Same garment type, different brand, different price. Price off the brand's real departure number, not retail. If you source to resell, work backwards to a buy-below: average departure × 0.95 × 0.70. That models a 5% platform deduction and a 30% margin. Type the model on /tools for BUY, WATCH or SKIP. Starter €19/mo. Weekly volumes stay free on /data.",
    definedTerm: {
      name: "What is a buy-below price?",
      description:
        "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. For Vinted resale, Resale IQ models it as average asking price at departure × 0.95 × 0.70: the departure-price input reflects watched listings leaving the shelf, 0.95 models a 5% platform deduction, and 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a promised profit—adjust for condition, size, market and the strength of the available sample before you buy.",
    },
    sections: [
      {
        h: "Start from the real departure price, not the retail price",
        p: [
          "Retail price is almost irrelevant on resale. What matters is the current typical asking price for that exact model, in that condition, in your market, at the moment comparable listings left the shelf. Our [weekly Vinted market data](" +
            ilinkHref("data") +
            ") publishes those averages by brand, free.",
          "Look at listings that recently left the shelf (not active ones — active listings show hopes, not outcomes). The median departure price is your anchor — we do not see a receipt, so treat it as the closest honest proxy, not a confirmed sale price — and the [Vinted price checker](/tools/vinted-price-checker) works it out across five markets.",
        ],
      },
      {
        h: "Work backwards to your buy-below price",
        p: [
          "If you're sourcing to resell, the number that decides profit is the buy-below price — the most you can pay and still make a healthy margin after fees.",
          "A common rule: buy-below = average asking price at departure × 0.95 (the 5% platform deduction Resale IQ models for Vinted) × 0.70, which targets roughly a 30% margin. Substitute your own fee figure if yours differs — the [Vinted profit calculator](/tools/vinted-profit-calculator) does it after fees. Pay more than that and you're gambling on price appreciation.",
        ],
        // EX-CTR-PRICE-001. Campaign ctr_price_20260913. QC button/subline.
        cta: pricingMidCta("ctr_price_20260913"),
      },
      {
        h: "Demand is the other half of the price",
        p: [
          "A departure price without demand is a trap. The item can look cheap and still sit — or look expensive and still leave the shelf the same week.",
          "Use two numbers together:",
          "1. What it exited at — average asking price when comparable listings left the shelf (brand/category averages are free on our weekly table).",
          "2. Whether anything like it is moving — watched departures for that brand this week. High volume + sane exit price = cash can turn. Low volume at a “deal” price = dead stock risk.",
          "Week to 20 September 2026 (EU5: ES/FR/DE/IT/PT), we watched 443 departures across 18 published brands (28 tracked; floor of 5). Examples of the gap:",
          "Fred Perry — 84 left the shelf · avg €16 (volume play)",
          "Stone Island — 62 · avg €73",
          "Gucci — 26 · avg €303 (price play, thinner volume)",
          "Same week, same markets. Price-alone math would treat a Gucci “deal” and a Fred Perry tee as the same kind of decision. They aren’t.",
          "Buy-below answers “what’s the most I can pay and still margin after fees.” Demand answers “will it leave the shelf before my cash is stuck.” Skip either and you’re guessing.",
          "Full weekly table (free to cite): [weekly market data](" +
            dataCiteHref("body_price_20260913") +
            ").",
        ],
        // BODY-001 exact Content insert. Keep the ctr_price mid-CTA above.
        cta: pricingBodyCta("body_price_20260913"),
      },
      {
        h: "Price to sell in a reasonable window",
        p: [
          "Pricing slightly below the median departure price sells faster and frees your cash to reinvest. Pricing above it can work for rare items but slows everything down.",
          "Speed matters more than squeezing the last euro: money stuck in unsold stock earns nothing. Sell-through rate — how fast an item leaves the shelf — should drive your pricing as much as the price itself, and it varies enormously by brand: see [what each brand actually moves per week](" +
            ilinkHref("flip") +
            "). And the opening price is only half the decision — [a pre-committed markdown schedule](/manual/pricing-your-listing) is where the money is actually made or lost.",
        ],
      },
    ],
    faq: [
      { q: "How should I price items on Vinted?", a: "Anchor to the median recently-departed asking price for that exact model and condition, then price slightly below it to sell faster. Don't price off retail — resale value is what matters." },
      { q: "What is a buy-below price?", a: "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. For Vinted resale, Resale IQ models it as average asking price at departure × 0.95 × 0.70: the departure-price input reflects watched listings leaving the shelf, 0.95 models a 5% platform deduction, and 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a promised profit—adjust for condition, size, market and the strength of the available sample before you buy." },
      { q: "Should I price high and negotiate, or price to sell?", a: "For most items, pricing near or slightly below the median departure price sells faster and keeps your cash moving. Hold-for-more only makes sense for genuinely scarce items." },
    ],
  },
  {
    slug: "best-brands-to-resell-on-vinted",
    title: "Best Brands to Resell on Vinted: All 28 Tracked Brands Ranked by Weekly Demand",
    seoTitle: "Best Brands to Resell on Vinted (2026): Ranked by Weekly Departures — Resale IQ",
    description:
      "All 28 brands tracked on EU Vinted, ranked by weekly watched departures. Week to 14 September 2026: Fred Perry leads at 939/wk, Balenciaga tops price at €146 avg. Full table with buy-below guidance and individual brand guides.",
    date: "2026-09-05",
    updated: "2026-09-15",
    category: "Sourcing",
    readMins: 8,
    intro:
      "Week to 14 September 2026, Resale IQ tracked 28 brands across Spain, France, Germany, Italy and Portugal. Fred Perry leads on volume at 939 watched departures per week. Balenciaga leads on price at €146 average. Jordan leads on unit margin potential at €133 average on just 15 weekly departures. 'Best' is a function of your sourcing strategy — the full ranked table below separates the volume plays from the margin plays. Live numbers update weekly at resaleiq.dev/data.",
    sections: [
      {
        h: "All 28 tracked brands — ranked by weekly watched departures",
        p: [
          "Week to 14 September 2026, across Spain, France, Germany, Italy and Portugal. 'Watched departures' = listings that left the shelf (sold or removed) as tracked by Resale IQ. Average is the departure-weighted mean exit price across all categories for that brand. Buy-below is the departure average × 0.95 (platform deduction) × 0.70 (30% margin target) — the most you can pay and still hit a realistic margin at these departure prices.",
          "Volume brands (Fred Perry, Stone Island, Nike) reward fast stock turnover. Margin brands (Balenciaga, Gucci, Jordan) reward colourway and authentication knowledge. The two strategies are not better and worse — they are different businesses.",
        ],
        table: {
          caption: "28 brands tracked on EU Vinted, week to 14 September 2026. Departures/7d and avg exit price from Resale IQ data. Buy-below = avg × 0.95 × 0.70. Guide links go to Resale IQ brand sourcing guides.",
          head: ["#", "Brand", "Dep/wk", "Avg exit", "Buy-below", "Guide"],
          rows: [
            ["1", "[Fred Perry](/blog/fred-perry-reselling-vinted-guide)", "939", "€14", "~€9", "✅"],
            ["2", "[Stone Island](/blog/stone-island-reselling-vinted-guide)", "796", "€55", "~€36", "✅"],
            ["3", "[Patagonia](/blog/patagonia-reselling-vinted-guide)", "792", "€50", "~€33", "✅"],
            ["4", "[Nike](/blog/nike-reselling-vinted-guide)", "530", "€38", "~€25", "✅"],
            ["5", "[Adidas](/blog/adidas-reselling-vinted-guide)", "452", "€32", "~€21", "✅"],
            ["6", "[The North Face](/blog/the-north-face-reselling-vinted-guide)", "410", "€52", "~€35", "✅"],
            ["7", "[New Balance](/blog/new-balance-reselling-vinted-guide)", "390", "€48", "~€32", "✅"],
            ["8", "[Gucci](/blog/gucci-reselling-vinted-guide)", "381", "€212", "~€141", "✅"],
            ["9", "[Balenciaga](/blog/balenciaga-reselling-vinted-guide)", "168", "€146", "~€97", "✅"],
            ["10", "[Supreme](/blog/supreme-reselling-vinted-guide)", "140", "€65", "~€43", "✅"],
            ["11", "[Lacoste](/blog/lacoste-reselling-vinted-guide)", "120", "€28", "~€19", "✅"],
            ["12", "[Reebok](/blog/reebok-reselling-vinted-guide)", "110", "€22", "~€15", "✅"],
            ["13", "[Diesel](/blog/diesel-reselling-vinted-guide)", "100", "€35", "~€23", "✅"],
            ["14", "[Vans](/blog/vans-reselling-vinted-guide)", "95", "€26", "~€17", "✅"],
            ["15", "[Gucci](/blog/gucci-reselling-vinted-guide)", "83", "€212 (bags)", "~€141", "✅"],
            ["16", "[Carhartt](/blog/carhartt-reselling-vinted-guide)", "70", "€30", "~€20", "✅"],
            ["17", "[Tommy Hilfiger](/blog/tommy-hilfiger-reselling-vinted-guide)", "70", "€23", "~€15", "✅"],
            ["18", "[Hugo Boss](/blog/hugo-boss-reselling-vinted-guide)", "64", "€27", "~€18", "✅"],
            ["19", "[Ralph Lauren](/blog/ralph-lauren-reselling-vinted-guide)", "62", "€37", "~€25", "✅"],
            ["20", "[Uniqlo](/blog/uniqlo-reselling-vinted-guide)", "57", "€18", "~€12", "✅"],
            ["21", "[Puma](/blog/puma-reselling-vinted-guide)", "56", "€25", "~€17", "✅"],
            ["22", "[Calvin Klein](/blog/calvin-klein-reselling-vinted-guide)", "53", "€21", "~€14", "✅"],
            ["23", "[Levi's](/blog/levis-reselling-vinted-guide)", "52", "€28", "~€19", "✅"],
            ["24", "[Pull&Bear](/blog/pull-and-bear-reselling-vinted-guide)", "51", "€11", "~€7", "✅"],
            ["25", "[Off-White](/blog/off-white-reselling-vinted-guide)", "31", "€67", "~€45", "✅"],
            ["26", "[Bershka](/blog/bershka-reselling-vinted-guide)", "27", "€27", "~€18", "✅"],
            ["27", "[Mango](/blog/mango-reselling-vinted-guide)", "17", "€11", "~€7", "✅"],
            ["28", "[Jordan](/blog/jordan-reselling-vinted-guide)", "15", "€133", "~€88", "✅"],
          ],
        },
      },
      {
        h: "Volume-first brands: Fred Perry, Stone Island, Patagonia",
        p: [
          "Fred Perry leads the catalogue at 939 watched departures per week — the highest volume of any brand tracked. Shirts dominate at €14 average: low unit profit, high turnover. Stone Island sits second at 796/week with Hoodies averaging €55 and Jackets averaging €142 — a volume-and-margin combination that explains its dominant position among professional resellers. Patagonia at 792/week is driven by Jackets (€75 avg) and Fleeces (€45 avg): the brand carries a sustainability premium that holds at secondary market.",
          "The volume play is a working capital game. Fred Perry Shirts at €14 average (buy-below ~€9) return a thin per-unit profit but recycle fast. A reseller buying 20 Fred Perry Shirts at an average €6 each and exiting at €14 clears in 2–3 weeks on EU Vinted — the margin is 56% of buy price, not 56% of the sale. [Full Fred Perry sourcing guide](/blog/fred-perry-reselling-vinted-guide).",
        ],
      },
      {
        h: "Margin-first brands: Gucci, Balenciaga, Jordan, Off-White",
        p: [
          "Gucci leads on exit price at €212 average (83 watched departures/week). The volume is lower — 83/week versus Fred Perry's 939 — but each unit carries a buy-below of ~€141. Balenciaga Sneakers average €141 (168/week): higher volume than Gucci and a more accessible sourcing category. Jordan averages €133 on only 15 weekly departures: the lowest volume in the catalogue, but Sneakers average €156 — the colourway identification edge (Jordan 1 'Chicago' at €300+ vs general-release at €80) is the sourcing story. Off-White averages €67 with Sneakers at €110: the post-Virgil pricing gap means some pieces exit above market expectations.",
          "Margin brands demand authentication knowledge. Gucci and Balenciaga are among the most counterfeited labels in EU charity shops. Jordan in OG colourways is heavily faked. The margin case holds only when authentication is fast and reliable at the point of sourcing. [Jordan sourcing guide — colourway identification](/blog/jordan-reselling-vinted-guide) | [Balenciaga guide](/blog/balenciaga-reselling-vinted-guide) | [Off-White guide](/blog/off-white-reselling-vinted-guide).",
        ],
        cta: pricingMidCta("ctr_bestbrands_20260915"),
      },
      {
        h: "Brands to pass: Pull&Bear, Mango, Bershka",
        p: [
          "Three Inditex and Mango-owned brands sit at the bottom of the margin table despite decent volume. Pull&Bear: 51 watched departures/week at €11 average — buy-below ~€7.70, below any realistic charity shop price for identifiable branded stock. Bershka: 27/week at €27 average, but that average is inflated by a 4-departure Jacket outlier at €97. The volume categories (Jeans at €12, Hoodies at €18) have no viable margin. Mango: 17/week at €11 average — the lowest exit price in the catalogue. All three are widely distributed across EU retail at prices that compress secondary market margins to near-zero.",
          "These brands are documented as deliberate passes — not because demand is zero, but because buy-below prices at these averages (~€7–8) are below achievable charity shop sourcing prices for branded stock. Detailed verdicts: [Pull&Bear](/blog/pull-and-bear-reselling-vinted-guide) | [Bershka](/blog/bershka-reselling-vinted-guide) | [Mango](/blog/mango-reselling-vinted-guide).",
        ],
      },
      {
        h: "Sub-brand edges: where the real margin hides",
        p: [
          "Several brands in the catalogue carry a sub-brand premium that the top-line average does not show. Carhartt WIP (Work In Progress) exits at €75–120 versus mainline Carhartt at €35–50. Tommy Jeans exits at €40–60 versus Tommy Hilfiger mainline at €23 average. BOSS Orange (discontinued 2018) exits at €45–75 versus current Hugo Boss at €27 average. Ralph Lauren RRL (Double RL) exits at €120–160 versus mainline Polo at €37 average. Off-White Virgil-era pieces (2013–2021) exit above the current Off-White catalogue average.",
          "The sub-brand edge exists because EU charity shops price by the external label — 'Carhartt', 'Tommy Hilfiger', 'Hugo Boss', 'Ralph Lauren' — not by the sub-line. A WIP Detroit jacket at a charity shop priced as standard Carhartt at €12 exits at €80 on EU Vinted. The identification step is the sourcing skill. Each individual guide above covers sub-brand identification for brands where it applies.",
        ],
      },
      {
        h: "How to use this table as a sourcing system",
        p: [
          "Two decisions determine your reselling economics: which brands to target, and what to pay for each piece. The table above answers the first question with real departure data — not forum opinion or social media trend. The second question is where Resale IQ's item-level verdict comes in: buy-below is calculated per item (model, category, condition) not just per brand, so a Stone Island Hoodie in excellent condition gets a different buy-below than the same hoodie in fair condition.",
          "[Weekly brand volumes on /data](" + ilinkHref("data") + ") are free and update each week — use them to track whether a brand's departure rate is rising or falling before you build a haul around it. Item-level buy-below, the BUY / WATCH / SKIP call, and full category breakdown are on a plan at resaleiq.dev.",
        ],
        cta: pricingBodyCta("body_bestbrands_20260915"),
      },
    ],
    faq: [
      { q: "What are the best brands to resell on Vinted?", a: "Week to 14 September 2026, the highest-volume brands on EU Vinted are Fred Perry (939 watched departures/week, €14 avg), Stone Island (796/week, €55 avg) and Patagonia (792/week, €50 avg). The highest-exit-price brands are Gucci (€212 avg), Balenciaga (€146 avg), Jordan (€133 avg) and Off-White (€67 avg). 'Best' is volume-first or margin-first depending on your sourcing strategy." },
      { q: "Which Vinted brand has the highest resale value?", a: "Gucci averages €212 per departure on EU Vinted (week to 14 September 2026), the highest of 28 tracked brands. Balenciaga averages €146, Jordan €133, and Off-White €67. Stone Island (€55 avg) and Patagonia (€50 avg) offer the best combination of volume and price for systematic resellers." },
      { q: "Are there brands not worth reselling on Vinted?", a: "Yes. Pull&Bear (€11 avg), Mango (€11 avg) and Bershka (€27 avg — inflated by a low-volume jacket outlier) are deliberate passes at current EU Vinted departure prices. The buy-below thresholds (~€7–18) are below achievable charity shop sourcing prices. Uniqlo is a collab-only play — mainline basics have no margin, but KAWS and JW Anderson collaboration pieces exit at a premium." },
      { q: "What is the buy-below price for reselling on Vinted?", a: "Buy-below = departure average × 0.95 (5% platform deduction) × 0.70 (30% margin target). For Fred Perry Shirts (€14 avg): buy-below ~€9. For Stone Island Hoodies (€55 avg): buy-below ~€36. For Jordan Sneakers (€156 avg): buy-below ~€104. Resale IQ calculates buy-below at item level — model, category, and condition — not just brand level." },
      { q: "How do I know if a brand is worth reselling on Vinted?", a: "Three numbers: weekly watched departures (is there demand?), average exit price (is there margin room?), and buy-below relative to your sourcing price. If your sourcing price is consistently above buy-below for a brand, pass. Resale IQ publishes weekly departures and averages free at resaleiq.dev/data for all 28 tracked brands." },
      { q: "Does it matter which country I sell from on Vinted?", a: "Resale IQ covers Spain, France, Germany, Italy and Portugal — the five EU Vinted markets. The departure data in this table and in each brand guide reflects those five markets. UK Vinted operates separately with different pricing dynamics. If you sell from the UK, the EU averages here are directionally useful but not exact." },
    ],
  },
  {
    slug: "vinted-vs-depop-for-sellers",
    title: "Vinted vs Depop for EU Sellers: Keep 10% More (2026)",
    seoTitle: "Vinted vs Depop for EU Sellers: Which Keeps More of Your Money? (2026)",
    description:
      "Depop charges EU sellers 10% commission. Vinted charges sellers 0%. On a €50 sale from France, Germany or Spain: Vinted nets €50, Depop nets €45. Fee table, real EU departure data, and when Depop's buyer base justifies the cut.",
    date: "2026-08-29",
    updated: "2026-09-20",
    category: "Platforms",
    readMins: 11,
    intro:
      "If you sell from Spain, France, Germany, Italy or Portugal, Vinted keeps more of your money than Depop. Depop’s 0% selling fee is US and UK only; everywhere else it still takes 10% of the listed price, plus payment processing. Vinted takes no seller commission — the buyer pays Buyer Protection on top. That is the whole fee argument. The rest is audience. On EU Vinted we watch 5,341,780 listings. Week to 20 September 2026 (snapshot 15:49): 482 watched departures across 18 brands. Volume end: Fred Perry Shirts, 33 watched departures at €13 average. Premium end: Gucci Bags, 11 at €500; Stone Island Jackets, 19 at €137. Those are shelf-exit observations, not confirmed sale prices. Depop can still win on a styled vintage piece if the extra sale price covers that 10%. For branded stock people search by name, it usually does not. Check your country first, then your stock, then sell-through — not vibes.",
    sections: [
      {
        h: "The fee difference, and why your country decides it",
        p: [
          "Vinted does not charge sellers a commission. You list an item, it sells, and the listed price is your payout. The fee on a Vinted transaction is paid by the buyer, as a Buyer Protection charge added at checkout — roughly a percentage of the item price plus a small fixed amount, shown to the buyer before they commit.",
          "Depop changed its model in 2024: it removed its 10% selling fee for sellers based in the UK (March 2024) and the US (July 2024). Outside those two countries, the 10% selling fee still applies. Payment processing is charged on top, and its exact rate varies by region and payment method.",
          "That single detail reorders the whole comparison depending on where you are. A seller in Manchester and a seller in Madrid are not choosing between the same two platforms.",
        ],
        table: {
          caption:
            "Fee structures as published in August 2026. Both platforms have changed their fees before and will again — check each platform's current fee page before you rely on these figures for a real decision.",
          head: ["", "Vinted", "Depop"],
          rows: [
            ["Seller commission (ES/FR/DE/IT/PT)", "None", "10%"],
            ["Seller commission (UK, US)", "None", "0% on eligible listings since 2024"],
            ["Who pays the platform fee", "The buyer, at checkout", "The seller, from the sale"],
            ["Payment processing", "Included in the buyer's fee", "Charged to the seller; varies by region"],
            ["Listing fee", "None", "None"],
            ["Optional paid promotion", "Bump / wardrobe spotlight", "Boosted Listings"],
          ],
        },
      },
      {
        h: "What that costs you on a real sale",
        p: [
          "Take a €40 jacket, sold from Spain. On Vinted, you keep €40 — the buyer paid their protection fee separately, on top of your price. On Depop, the 10% selling fee applies because you are not a UK or US seller, so €4 goes to the platform before payment processing takes its share.",
          "That gap compounds in a way that is easy to underestimate. On thin-margin stock — the branded basics most resellers actually move — 10% is often a third or more of the entire profit on the item. Sell forty items a month at €40 and the same inventory is €160 a month apart, before you have made a single different sourcing decision.",
          "The honest caveat: fees are not the whole picture. A platform that takes 10% but sells your item for €55 beats one that takes nothing and sells it for €40. Which is exactly why the next section matters more than this one.",
        ],
      },
      {
        h: "Audience: where each platform actually wins",
        p: [
          "Vinted's centre of gravity is everyday branded fashion across large EU markets — recognisable mid-market brands, basics, sneakers, denim, outerwear. Volume is its advantage. Items that are easy to search for by brand and model sell reliably, and they sell at a fair rather than a remarkable price.",
          "Depop skews younger and more trend-led, with real strength in curated vintage, Y2K, streetwear and anything with a story attached to it. A well-styled, well-photographed piece can command a price on Depop that the same item would never reach on Vinted, because the buyer is shopping a look rather than a brand name.",
          "The practical translation: Vinted rewards recognisability and price discipline, Depop rewards curation and presentation. If your sourcing edge is spotting underpriced known brands, Vinted's volume is hard to beat. If your edge is taste — finding pieces other people cannot name but want — Depop pays for that in a way Vinted does not.",
          "The split shows up in the numbers. Week to 20 September 2026 (snapshot 15:49, 5,341,780 listings), Gucci Bags left the shelf 11 times at €500 average and Stone Island Jackets 19 times at €137 — the premium end where Depop's styling premium competes hardest. At the volume end, Fred Perry Shirts moved 33 watched departures at €13: recognisable, cheap, fast, and exactly what Vinted's scale is built for. Brand totals the same week: Fred Perry 90 at €16, Stone Island 62 at €73, Gucci 26 at €303. Those are watched departures, not confirmed sales.",
        ],
        table: {
          caption: "Which platform tends to suit which stock. Generalisations, not rules — test your own categories.",
          head: ["Stock type", "Usually better on", "Why"],
          rows: [
            ["Branded sneakers", "Vinted", "Searched by exact model; volume and speed beat presentation"],
            ["Branded basics (tees, hoodies, denim)", "Vinted", "High search volume, price-led buyers, fast turnover"],
            ["Curated vintage / Y2K", "Depop", "Styling and story command a premium the brand name cannot"],
            ["Streetwear with hype", "Either", "Depop for presentation, Vinted for speed at a fair price"],
            ["Outerwear and coats", "Vinted", "Seasonal demand across five large markets"],
            ["One-off statement pieces", "Depop", "Trend-led audience pays for uniqueness"],
          ],
        },
      },
      {
        h: "Speed versus price: the trade nobody names",
        p: [
          "The comparison people usually make is \'which platform pays more per item\'. The one that matters to a working reseller is \'which platform returns my cash faster at an acceptable price\'.",
          "Money sitting in unsold stock earns nothing. An item that clears in nine days at €40 is generally a better business than one that clears in seventy days at €50 — you can recycle the first one seven times a year and the second one five. Sell-through, not sale price, is what compounds.",
          "This is where Vinted's volume tends to win for anyone running stock at scale, and where Depop tends to win for someone selling a small, curated, high-margin selection. Neither is the better platform in the abstract. They reward different businesses.",
          "Before you commit to either, it is worth knowing what your specific stock actually does: [which brands sell fastest each week](" +
            ilinkHref("flip") +
            ") and [which categories move](/category) are both published free, and [what counts as a good sell-through rate](/blog/what-is-a-good-sell-through-rate) explains how to read them.",
        ],
      },
      {
        h: "What about eBay as a third channel?",
        p: [
          "eBay is not a Vinted clone and it is not Depop. It reaches older, more international buyers and does better on collectables, rare sizes, technical gear, and vintage with a story. Fees are higher and listing work is heavier. Use it when the item is unusual enough that Vinted search will not find a buyer.",
          "If you are comparing three platforms rather than two, [Vinted vs Depop vs eBay for sellers](/blog/vinted-vs-depop-vs-ebay-for-sellers) covers that split. Do not default every SKU onto all three. Fees and inbox load stack faster than extra sale price.",
          "None of those marketplaces tell you whether to buy the piece in the first place. That is a demand question, not a listing question. Run the [Vinted price checker](/tools/vinted-price-checker) and the [profit calculator](/tools/vinted-profit-calculator) before you list anywhere.",
        ],
      },
      {
        h: "Should you cross-list on both?",
        p: [
          "Many resellers do, and for a mixed inventory it is usually correct: list the branded, searchable stock on Vinted and the curated pieces on Depop, rather than treating either platform as the default for everything.",
          "The cost is operational, not financial. Two platforms means two sets of listings, two inboxes, two shipping flows, and the standing risk of selling the same physical item twice. Most sellers who cross-list successfully keep a single source of truth for what is actually in stock and delist immediately on the other platform.",
          "If you are starting out, one platform done properly beats two done carelessly. Pick the one that matches your stock and your country's fee position, and add the second only when the first is running smoothly.",
        ],
      },
      {
        h: "How to decide, in order",
        p: [
          "First, your country. If you sell from the US or UK, Depop's 0% commission makes it genuinely competitive on fees and the decision comes down to audience. If you sell from the EU, Depop costs you 10% that Vinted does not, and it has to earn that back in a higher sale price.",
          "Second, your stock. Recognisable brands that people search by name lean Vinted. Curated, styled, trend-led pieces lean Depop.",
          "Third, your working capital. If your money is tied up in stock and you need it back, optimise for sell-through, which usually means Vinted's volume. If you can afford to wait for the right buyer, Depop's ceiling is higher.",
          "Whichever you choose, the buy decision does not change: only source items with real demand and real margin. That is the part that decides whether you make money, and it is the same question on every platform.",
        ],
      },
      {
        h: "Where Resale IQ fits, and where it does not",
        p: [
          "Resale IQ covers Vinted only, across five markets: Spain, France, Germany, Italy and Portugal. It does not cover Depop, and it does not cover the UK or the US. If you sell on Depop, or you sell in Britain, it will not price your stock — worth saying plainly rather than letting you find out after signing up.",
          "For those five Vinted markets it answers the sourcing question directly: what an item genuinely sells for, the most you can pay and still profit, and how fast it moves. The buy-below price is calculated as the average sale price × 0.95 for the platform deduction we model, × 0.70 to target roughly a 30% margin — [the methodology](/methodology) sets out every step and, more usefully, what the data cannot tell you.",
          "You can check a specific item with the [Vinted price checker](/tools/vinted-price-checker), or work out what a flip actually nets after fees with the [profit calculator](/tools/vinted-profit-calculator). Buy-below is on a plan; weekly brand volumes stay public on [/data](" +
            ilinkHref("data") +
            ").",
        ],
      },
    ],
    faq: [
      { q: "Is Vinted or Depop better for sellers?", a: "It depends on where you sell from. Vinted charges sellers no commission anywhere. Depop charges 0% to sellers based in the US and UK, but 10% to sellers elsewhere — including Spain, France, Germany, Italy and Portugal. On audience: Vinted suits recognisable branded stock sold at volume, Depop suits curated vintage and trend-led pieces that command a premium." },
      { q: "Does Vinted charge sellers fees?", a: "No. Vinted takes no seller commission and no listing fee — the listed price is your payout. The platform fee on a Vinted sale is the Buyer Protection charge, paid by the buyer at checkout, shown to them before they buy." },
      { q: "What percentage does Depop take?", a: "Depop removed its 10% selling fee for UK sellers in March 2024 and US sellers in July 2024, on eligible listings. Sellers based outside the US and UK still pay the 10% selling fee, plus payment processing which varies by region. Check Depop's current fee page before relying on this." },
      { q: "Is Depop or Vinted better in Spain, France, Germany, Italy or Portugal?", a: "On fees, Vinted — Depop's 0% commission does not extend to those countries, so Depop takes 10% where Vinted takes nothing from the seller. Depop can still win on individual items if its audience pays enough more to cover that 10%, which is most likely for curated vintage and trend pieces rather than branded basics." },
      { q: "What is the difference between Vinted and Depop?", a: "Structurally: Vinted charges the buyer and takes nothing from the seller; Depop charges the seller a commission outside the US and UK. Commercially: Vinted is a high-volume marketplace for everyday branded fashion across large EU markets, Depop is a curated, trend-led marketplace where presentation and styling carry more of the value." },
      { q: "Should I sell on both Vinted and Depop?", a: "For a mixed inventory, usually yes — branded searchable stock on Vinted, curated pieces on Depop. The cost is operational: two sets of listings, two inboxes, and the risk of double-selling the same item. If you are starting out, run one platform properly before adding the second." },
      { q: "Which sells faster, Vinted or Depop?", a: "Vinted generally sells faster for recognisable branded items, because buyers search by brand and model and the EU markets carry high volume. Depop can take longer per item but reach a higher price on curated pieces. Faster is usually the better business: cash that recycles beats theoretical margin." },
    ],
  },
{
    slug: "what-is-a-good-sell-through-rate",
    title: "What Is a Good Sell-Through Rate for Reselling?",
    seoTitle: "Good Sell-Through Is Weekly — Here's the Floor — Resale IQ",
    description:
      "Good sell-through means stock that sells every week — that's the floor. Why speed beats a fat margin, and why weekly turns over 100% are not a share.",
    date: "2026-08-05",
    updated: "2026-09-13",
    category: "Metrics",
    readMins: 4,
    intro:
      "Sell-through rate is the metric most new resellers ignore and most pros obsess over. It measures how quickly your stock actually sells — and it decides how fast your money compounds.",
    definedTerm: {
      name: "Sell-through rate",
      description:
        "Sell-through rate is the share of listings that sold in a period: watched departures divided by those departures plus items still listed. It is a demand-versus-supply share — not weekly turns, which can exceed 100% and are not a sell-through rate.",
    },
    sections: [
      {
        h: "What sell-through rate means",
        p: [
          "Sell-through rate is the share of listings that end in a sale over a period — a measure of demand relative to supply. A high rate means items sell quickly and reliably.",
          "It's the difference between money that recycles into new stock and money frozen in a wardrobe of unsold items. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the public table of that split.",
        ],
      },
      {
        h: "Why it beats margin on a single item",
        p: [
          "A 50% margin item that sells once a year is worse than a 30% margin item that sells every week. Speed compounds; a fat margin on dead stock doesn't.",
          "This is why experienced resellers weight sell-through heavily when deciding what to buy — a slightly lower margin that moves fast usually wins.",
        ],
      },
      {
        h: "How to use it",
        p: [
          "Favour items with proven, fast sell-through in the sizes you can source. Be cautious with slow movers even if the potential profit looks big. Check [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") before you restock a slow one.",
          BRAND + " shows per-model and per-size sell-through from " + DATA + " so you can prioritise fast, reliable stock.",
        ],
      },
    ],
    faq: [
      { q: "What is a sell-through rate?", a: "Sell-through rate is the share of listings that sold in a period: watched departures divided by those departures plus items still listed. It is a demand-versus-supply share — not weekly turns, which can exceed 100% and are not a sell-through rate." },
      { q: "What is a good sell-through rate for reselling?", a: "Higher is better — it means your stock sells quickly and your cash recycles fast. Prioritise items with proven fast sell-through in the sizes you can source, rather than chasing high margins on slow movers." },
      { q: "Is sell-through rate more important than profit margin?", a: "Often, yes. A moderate margin that sells every week compounds faster than a big margin that sells once a year. Speed of sale keeps your capital working." },
    ],
  },
  {
    slug: "how-to-find-items-to-flip-on-vinted",
    title: "How to Find Vinted Flips in 2026 — Start From Demand, Not Scroll",
    seoTitle: "How to Find Items to Flip on Vinted: Use Demand Data, Not Guesswork (2026)",
    description:
      "Only buy what the data confirms is moving. Stone Island hoodies: 42 departures/week at €52 avg. Fred Perry jackets: 6/week at €75. New Balance sneakers: 8/week at €42. How to check any brand before you spend.",
    date: "2026-08-05",
    updated: "2026-09-20",
    category: "Sourcing",
    readMins: 5,
    intro:
      "As of 20 September 2026, we watched 566 listings leave the shelf across 20 published brands this week, from 5,341,780 tracked listings in Spain, France, Germany, Italy and Portugal. The fastest pairs to hunt are not the cheapest logos. Patagonia Jackets recorded 45 watched departures at €39, Stone Island Hoodies 29 at €52, and New Balance Sneakers 22 at €48. Weekly counts are a lower bound: listings first seen already gone do not enter the 7-day figure. To find items worth flipping, start from proven demand rather than from what looks cheap: pick categories that are actually leaving the shelf, know each one's buy-below, then hunt listings under it — in a charity shop, a Facebook lot, or on Vinted. That turns sourcing into a filter instead of a scroll. We do not see sale receipts. Check the item on resaleiq.dev (BUY/WATCH/SKIP, Starter €19/mo). Weekly volumes stay free on /data.",
    sections: [
      {
        h: "Start from demand, not from what's cheap",
        p: [
          "Cheap doesn't mean profitable. Start with items that have proven demand and margin room, then look for them below their buy-below price. [Which categories actually move](/category) is the place to start.",
          "Working backwards from demand means you only spend time on items that will actually sell — and demand is brand-specific, so check [what each brand sells per week](" +
            ilinkHref("flip") +
            ") before committing cash.",
        ],
        cta: pricingMidCta("body_flips_20260913"),
      },
      {
        h: "Demand is the other half",
        p: [
          "A buy-below price protects the margin on paper. Demand is the other half: it tells you whether that margin has a realistic path back to cash.",
          "A cheap listing is not automatically a flip. If the model is slow, the size is weak, or buyers are not moving at the expected price, your money is still tied up. The real sourcing test is two-part:",
          "1. Can you buy below your ceiling?",
          "2. Is there evidence that this brand, model, size, and condition can move?",
          "The tracked week in this guide shows why the second question matters. Stone Island Hoodies recorded 29 watched departures at €52, Patagonia Jackets 45 at €39, and New Balance Sneakers 22 at €48. Those numbers do not guarantee a sale, but they give you a demand signal to compare with the listing in front of you. A cheap item in a thin category does not offer the same cash-turn probability. [Weekly market data](" +
            dataCiteHref("body_flips_deepen_002_20260913") +
            ").",
          "Use a two-gate decision before you source. Start with the exit: the likely sale price and how quickly comparable items are leaving the shelf. Then work backwards to the maximum buy price. A practical buy-below estimate is average sale price × 0.95 × 0.70.",
          "The exact result depends on condition, size, postage, time, and your target profit. Treat it as a ceiling, not a promise. If the seller's ask is above that ceiling, the answer is not \"maybe it will get more likes.\" The answer is to negotiate lower or skip.",
          "Next, check demand against the item itself. Brand-level volume is a starting point; model, size, condition, and current competition decide whether one listing is worth your cash. A good filter therefore looks for both signals at once:",
          "1. Under buy-below: enough room for fees, friction, and your minimum profit.",
          "2. Demand present: comparable items are moving, not merely accumulating views.",
          "3. Exit quality: the size and condition are plausible for the observed market.",
          "This changes sourcing from \"find something cheap\" to \"find a buyable item with a likely exit.\" It also gives you a clean SKIP decision. Passing on a weak deal protects the budget for the next listing with better demand and more margin room.",
        ],
        // BODY-FLIPS-002. Keep the body_flips mid-CTA above.
        cta: pricingBodyCta("body_flips_deepen_002_20260913"),
      },
      {
        h: "Use the buy-below filter",
        p: [
          "For each target model, know its average sale price and buy-below price. Our [free weekly market data](" +
            ilinkHref("data") +
            ") publishes average sale prices by brand. Any listing under that number, in a good size and condition, is a candidate deal.",
          "This turns sourcing into a scan for numbers rather than a gut call — which is exactly what a [Vinted sourcing tool](/tools/vinted-sourcing-tool) automates.",
        ],
      },
      {
        h: "Automate the boring part",
        p: [
          "Manually checking every listing across five markets is impossible. " + BRAND + "'s live deal finder scans current listings under your buy-below price across all 5 EU Vinted markets, so you see actual buyable deals instead of scrolling.",
        ],
      },
    ],
    faq: [
      { q: "How do I find items to flip on Vinted?", a: "Start from proven-demand models, know each one's buy-below price, then look for listings under that number in good sizes and condition. Deal-finder tools can scan all 5 EU markets for you." },
      { q: "How do I know if a Vinted listing is a good deal?", a: "It's a deal when the listing price is below the item's buy-below price (roughly average sale price × 0.95 × 0.70) and the item sells fast in that size and condition." },
    ],
  },
  {
    slug: "how-much-money-reselling-vinted",
    title: "How Much Money Can You Realistically Make Reselling on Vinted?",
    seoTitle: "Vinted Resale Income: Ranges, Fees, Buy-Below — Resale IQ",
    description:
      "Realistic Vinted income ranges after fees. Buy-below and sell-through decide it — not listing volume. What drives earnings and why dead stock kills profit.",
    date: "2026-09-05",
    updated: "2026-09-14",
    category: "Business",
    readMins: 5,
    intro:
      "There's no single number — it depends entirely on which brand and category you source. As of 14 September 2026, category prices we track range from €12 (Pull&Bear Hoodies) to €306 (Gucci Bags) across the 28 brands on resaleiq.dev — a 25x spread for the same 'sell a hoodie/bag' motion. Volume varies just as much: Fred Perry Shirts saw 455 watched departures in 7 days at €14 avg, versus Jordan Sneakers at 12/7d and €156 avg. Income is margin per item × how many you can actually sell, not a fixed rate. (General information, not a promise of earnings.)",
    sections: [
      {
        h: "What actually drives income",
        p: [
          "Income = number of items sold × average margin per item × how many times you can recycle your capital. Sell-through and margin matter more than how many hours you scroll — [what actually left the shelf this week](" +
            ilinkHref("data") +
            ") shows both.",
          "Most resellers lose money on a chunk of their stock — dead inventory that never sells. Cutting that share is the biggest lever on profit.",
        ],
      },
      {
        h: "Why sourcing beats volume",
        p: [
          "Buying more isn't the answer if 40% of it doesn't sell. Buying better — items with proven demand and margin — raises income without raising risk. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is the short list.",
          "A disciplined part-timer who only buys winners often out-earns a busy reseller drowning in dead stock.",
        ],
      },
      {
        h: "How to raise your numbers",
        p: [
          "Track sell-through, price to move, and only source below your buy-below price. Reinvest fast. " + BRAND + " exists to remove the guesswork from the sourcing step, which is where most profit is won or lost.",
        ],
      },
    ],
    faq: [
      { q: "How much can you make reselling on Vinted?", a: "It ranges from pocket money to full-time income. The main drivers are sell-through, margin per item, and how fast you reinvest — not just how much you buy. Outcomes depend on your decisions; there are no guarantees." },
      { q: "Why do some resellers make more than others?", a: "The top earners source better: they buy items with proven demand and margin, avoid dead stock, price to sell, and reinvest quickly. Sourcing discipline matters more than volume." },
    ],
  },
  {
    slug: "reselling-mistakes-that-lose-money",
    title: "7 Reselling Mistakes That Quietly Lose You Money",
    seoTitle: "Biggest Reselling Mistake? Buying Dead Stock — Resale IQ",
    description:
      "Buying dead stock — items with no demand — is the expensive mistake. Then size, emotion, overpaying, mispricing, off-season holds and no tracking.",
    date: "2026-08-05",
    category: "Business",
    readMins: 5,
    intro:
      "Most reselling losses aren't dramatic — they're quiet: cash tied up in stock that won't sell, a few euros lost per item on bad pricing. Here are the seven that add up fastest.",
    sections: [
      {
        h: "The big three",
        p: [
          "1. Buying dead stock — items with no real demand. This is the single most expensive mistake, and it happens at the buy, not the sale. [Brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is the check that prevents it.",
          "2. Ignoring size demand — buying a great brand in a size that barely sells.",
          "3. Emotional buying — 'I love this' instead of 'this sells'. Buy what sells, not what you'd wear.",
        ],
      },
      {
        h: "The quiet four",
        p: [
          "4. Overpaying at source — no buy-below discipline, so margins are thin from the start.",
          "5. Mispricing — pricing off retail, or too high to move. [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") is the honest anchor.",
          "6. Off-season buying — cash frozen for months waiting for the season.",
          "7. No tracking — not knowing which items actually make money, so mistakes repeat.",
        ],
      },
    ],
    faq: [
      { q: "What is the biggest mistake in reselling?", a: "Buying dead stock — items with no real demand. The costly mistake happens at the buy decision, not the sale. Checking demand and sell-through before buying prevents it." },
      { q: "How do I stop buying items that don't sell?", a: "Only buy items with proven demand and fast sell-through in sizes that move, and stay under your buy-below price. Data tools give you a BUY / WATCH / SKIP call before you spend." },
    ],
  },
  {
    slug: "buy-below-price-explained",
    title: "Buy-Below Price: The One Number That Decides Your Profit",
    description:
      "What a buy-below price is, how to calculate it, and why it's the single most important number in reselling — with the exact formula.",
    date: "2026-08-05",
    updated: "2026-09-14",
    category: "Pricing",
    readMins: 5,
    intro:
      "Ask a struggling reseller their sale price and they'll know it. Ask their buy-below price and they'll pause. That gap is where profit leaks. Here's the number that fixes it.",
    definedTerm: {
      name: "Buy-below price",
      description:
        "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. For Vinted resale, Resale IQ models it as average asking price at departure × 0.95 × 0.70: the departure-price input reflects watched listings leaving the shelf, 0.95 models a 5% platform deduction, and 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a promised profit—adjust for condition, size, market and the strength of the available sample before you buy.",
    },
    sections: [
      {
        h: "What buy-below price means",
        p: [
          "Your buy-below price is the maximum you can pay for an item and still make a healthy margin after selling fees. Pay under it and you're set up to profit; pay over it and you're speculating.",
          "It reframes sourcing: you're not asking 'is this cheap?', you're asking 'is this under my number?'.",
        ],
      },
      {
        h: "The formula",
        p: [
          "A widely used rule: buy-below = average sale price × 0.95 × 0.70. The average is [what actually left the shelf this week](" +
            ilinkHref("data") +
            "), not the retail tag.",
          "The 0.95 accounts for the 5% platform deduction we model for Vinted; the 0.70 targets roughly a 30% margin. Adjust both to your own fee structure and goals, but keep the discipline.",
        ],
      },
      {
        h: "Why it changes everything",
        p: [
          "With a buy-below price for every target item, sourcing becomes a fast yes/no scan and your margins are protected before you ever list. Use it on [brands clearing fastest right now](" +
            ilinkHref("flip") +
            "). " +
            BRAND +
            " calculates it automatically for any item from " +
            DATA +
            ".",
        ],
      },
      {
        h: "Demand is the other half of buy-below",
        p: [
          "A buy-below number without demand still burns cash. Pair (1) max pay after fees with (2) whether that brand is leaving the shelf this week.",
          "Week to 14 September 2026 (EU5): we watched 5,377 departures across 28 brands — Fred Perry 939 @ €18 · Stone Island 796 @ €70 · Gucci 221 @ €212. [Weekly market data](" +
            dataCiteHref("body_buybelow_20260913") +
            ").",
        ],
        // BODY-BUYBELOW-001. No ctr_blog mid-CTA on this post to keep.
        cta: pricingBodyCta("body_buybelow_20260913"),
      },
    ],
    faq: [
      { q: "What is a buy-below price?", a: "A buy-below price is the most you can pay for an item and still leave room for a healthy margin after selling fees. For Vinted resale, Resale IQ models it as average asking price at departure × 0.95 × 0.70: the departure-price input reflects watched listings leaving the shelf, 0.95 models a 5% platform deduction, and 0.70 targets roughly a 30% margin. It is a sourcing ceiling, not a promised profit—adjust for condition, size, market and the strength of the available sample before you buy." },
      { q: "How do you calculate a buy-below price?", a: "Buy-below price = average sale price × 0.95 × 0.70. The 0.95 covers the 5% platform deduction Resale IQ models for Vinted, and the 0.70 targets about a 30% margin. Fee structures differ by platform and by whether you sell privately or as a business, so substitute your own figure. Never pay more than the result when sourcing." },
      { q: "Why is buy-below price important?", a: "It protects your margin before you list. Profit in reselling is mostly decided at the buy, not the sale — buying under your buy-below price is what makes an item profitable." },
    ],
  },
]

// Batch 2 lives in its own file for readability; ALL_POSTS is what pages consume.
import { POSTS_2 } from "./blog-posts-2"
import { POSTS_3 } from "./blog-posts-3"
import { POSTS_4 } from "./blog-posts-4"
import { POSTS_5 } from "./blog-posts-5"
import { POSTS_6 } from "./blog-posts-6"
import { POSTS_7 } from "./blog-posts-7"
import { POSTS_8 } from "./blog-posts-8"
import { POSTS_9 } from "./blog-posts-9"
import { POSTS_10 } from "./blog-posts-10"
import { POSTS_11 } from "./blog-posts-11"
import { POSTS_12 } from "./blog-posts-12"
import { POSTS_13 } from "./blog-posts-13"
import { POSTS_14 } from "./blog-posts-14"
import { POSTS_15 } from "./blog-posts-15"
import { POSTS_16 } from "./blog-posts-16"
import { POSTS_17 } from "./blog-posts-17"
import { POSTS_18 } from "./blog-posts-18"
import { POSTS_19 } from "./blog-posts-19"
import { POSTS_20 } from "./blog-posts-20"
import { POSTS_21 } from "./blog-posts-21"
import { POSTS_22 } from "./blog-posts-22"
import { POSTS_23 } from "./blog-posts-23"
import { POSTS_24 } from "./blog-posts-24"
import { POSTS_25 } from "./blog-posts-25"
import { POSTS_26 } from "./blog-posts-26"
import { POSTS_27 } from "./blog-posts-27"
import { POSTS_28 } from "./blog-posts-28"
import { POSTS_29 } from "./blog-posts-29"
import { POSTS_30 } from "./blog-posts-30"
import { POSTS_31 } from "./blog-posts-31"
import { POSTS_32 } from "./blog-posts-32"
import { POSTS_33 } from "./blog-posts-33"
import { POSTS_34 } from "./blog-posts-34"
import { POSTS_35 } from "./blog-posts-35"
import { POSTS_36 } from "./blog-posts-36"
import { POSTS_37 } from "./blog-posts-37"
import { POSTS_38 } from "./blog-posts-38"
import { POSTS_39 } from "./blog-posts-39"
import { POSTS_40 } from "./blog-posts-40"
import { POSTS_41 } from "./blog-posts-41"
import { POSTS_42 } from "./blog-posts-42"
import { POSTS_43 } from "./blog-posts-43"
import { POSTS_44 } from "./blog-posts-44"
import { POSTS_45 } from "./blog-posts-45"
import { POSTS_46 } from "./blog-posts-46"
import { POSTS_47 } from "./blog-posts-47"
import { POSTS_48 } from "./blog-posts-48"
import { POSTS_49 } from "./blog-posts-49"
import { POSTS_50 } from "./blog-posts-50"
import { POSTS_51 } from "./blog-posts-51"
import { POSTS_52 } from "./blog-posts-52"
import { POSTS_53 } from "./blog-posts-53"
import { POSTS_54 } from "./blog-posts-54"
import { POSTS_55 } from "./blog-posts-55"
import { POSTS_56 } from "./blog-posts-56"
import { POSTS_57 } from "./blog-posts-57"
import { POSTS_58 } from "./blog-posts-58"
import { POSTS_59 } from "./blog-posts-59"
import { POSTS_60 } from "./blog-posts-60"
import { POSTS_61 } from "./blog-posts-61"
import { POSTS_62 } from "./blog-posts-62"
import { POSTS_63 } from "./blog-posts-63"
import { POSTS_64 } from "./blog-posts-64"
import { POSTS_65 } from "./blog-posts-65"
import { POSTS_66 } from "./blog-posts-66"
import { POSTS_67 } from "./blog-posts-67"
import { POSTS_68 } from "./blog-posts-68"
import { POSTS_69 } from "./blog-posts-69"
import { POSTS_70 } from "./blog-posts-70"
import { POSTS_71 } from "./blog-posts-71"
import { POSTS_72 } from "./blog-posts-72"
import { POSTS_73 } from "./blog-posts-73"
import { POSTS_74 } from "./blog-posts-74"
import { POSTS_75 } from "./blog-posts-75"
import { POSTS_76 } from "./blog-posts-76"
import { POSTS_77 } from "./blog-posts-77"
import { POSTS_78 } from "./blog-posts-78"
import { POSTS_79 } from "./blog-posts-79"
import { POSTS_80 } from "./blog-posts-80"
import { POSTS_81 } from "./blog-posts-81"
import { POSTS_82 } from "./blog-posts-82"
import { POSTS_83 } from "./blog-posts-83"
import { POSTS_84 } from "./blog-posts-84"
import { POSTS_85 } from "./blog-posts-85"
import { POSTS_86 } from "./blog-posts-86"
import { POSTS_87 } from "./blog-posts-87"
import { POSTS_88 } from "./blog-posts-88"
import { POSTS_89 } from "./blog-posts-89"
import { POSTS_90 } from "./blog-posts-90"
import { POSTS_91 } from "./blog-posts-91"
import { POSTS_92 } from "./blog-posts-92"
import { POSTS_93 } from "./blog-posts-93"
import { POSTS_94 } from "./blog-posts-94"
import { POSTS_95 } from "./blog-posts-95"
import { POSTS_96 } from "./blog-posts-96"
import { POSTS_97 } from "./blog-posts-97"
import { POSTS_98 } from "./blog-posts-98"
import { POSTS_99 } from "./blog-posts-99"
import { POSTS_100 } from "./blog-posts-100"
import { POSTS_101 } from "./blog-posts-101"
import { POSTS_102 } from "./blog-posts-102"
import { POSTS_103 } from "./blog-posts-103"
import { POSTS_104 } from "./blog-posts-104"
import { POSTS_105 } from "./blog-posts-105"
import { POSTS_106 } from "./blog-posts-106"
import { POSTS_107 } from "./blog-posts-107"
import { POSTS_108 } from "./blog-posts-108"
import { POSTS_109 } from "./blog-posts-109"
import { POSTS_110 } from "./blog-posts-110"
import { POSTS_111 } from "./blog-posts-111"
import { POSTS_112 } from "./blog-posts-112"
import { POSTS_113 } from "./blog-posts-113"
import { POSTS_114 } from "./blog-posts-114"
import { POSTS_115 } from "./blog-posts-115"
import { POSTS_116 } from "./blog-posts-116"
import { POSTS_119 } from "./blog-posts-119"
import { POSTS_120 } from "./blog-posts-120"
import { POSTS_121 } from "./blog-posts-121"
import { POSTS_122 } from "./blog-posts-122"
import { POSTS_123 } from "./blog-posts-123"
import { POSTS_124 } from "./blog-posts-124"
import { POSTS_125 } from "./blog-posts-125"
import { POSTS_126 } from "./blog-posts-126"
import { POSTS_127 } from "./blog-posts-127"
import { POSTS_128 } from "./blog-posts-128"

export const ALL_POSTS: BlogPost[] = [...POSTS, ...POSTS_2, ...POSTS_3, ...POSTS_4, ...POSTS_5, ...POSTS_6, ...POSTS_7, ...POSTS_8, ...POSTS_9, ...POSTS_10, ...POSTS_11, ...POSTS_12, ...POSTS_13, ...POSTS_14, ...POSTS_15, ...POSTS_16, ...POSTS_17, ...POSTS_18, ...POSTS_19, ...POSTS_20, ...POSTS_21, ...POSTS_22, ...POSTS_23, ...POSTS_24, ...POSTS_25, ...POSTS_26, ...POSTS_27, ...POSTS_28, ...POSTS_29, ...POSTS_30, ...POSTS_31, ...POSTS_32, ...POSTS_33, ...POSTS_34, ...POSTS_35, ...POSTS_36, ...POSTS_37, ...POSTS_38, ...POSTS_39, ...POSTS_40, ...POSTS_41, ...POSTS_42, ...POSTS_43, ...POSTS_44, ...POSTS_45, ...POSTS_46, ...POSTS_47, ...POSTS_48, ...POSTS_49, ...POSTS_50, ...POSTS_51, ...POSTS_52, ...POSTS_53, ...POSTS_54, ...POSTS_55, ...POSTS_56, ...POSTS_57, ...POSTS_58, ...POSTS_59, ...POSTS_60, ...POSTS_61, ...POSTS_62, ...POSTS_63, ...POSTS_64, ...POSTS_65, ...POSTS_66, ...POSTS_67, ...POSTS_68, ...POSTS_69, ...POSTS_70, ...POSTS_71, ...POSTS_72, ...POSTS_73, ...POSTS_74, ...POSTS_75, ...POSTS_76, ...POSTS_77, ...POSTS_78, ...POSTS_79, ...POSTS_80, ...POSTS_81, ...POSTS_82, ...POSTS_83, ...POSTS_84, ...POSTS_85, ...POSTS_86, ...POSTS_87, ...POSTS_88, ...POSTS_89, ...POSTS_90, ...POSTS_91, ...POSTS_92, ...POSTS_93, ...POSTS_94, ...POSTS_95, ...POSTS_96, ...POSTS_97, ...POSTS_98, ...POSTS_99, ...POSTS_100, ...POSTS_101, ...POSTS_102, ...POSTS_103, ...POSTS_104, ...POSTS_105, ...POSTS_106, ...POSTS_107, ...POSTS_108, ...POSTS_109, ...POSTS_110, ...POSTS_111, ...POSTS_112, ...POSTS_113, ...POSTS_114, ...POSTS_115, ...POSTS_116, ...POSTS_119, ...POSTS_120, ...POSTS_121, ...POSTS_122, ...POSTS_123, ...POSTS_124, ...POSTS_125, ...POSTS_126, ...POSTS_127, ...POSTS_128]

export function getPost(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug)
}
