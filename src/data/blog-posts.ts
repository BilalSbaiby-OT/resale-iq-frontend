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
    updated: "2026-09-13",
    category: "Sourcing",
    readMins: 6,
    intro:
      "As of 11 September 2026, Hoodies are the single busiest category on Vinted across the 5 EU markets " +
      BRAND + " tracks (Spain, France, Germany, Italy, Portugal): at least 1,400 hoodie listings left the shelf in the trailing 7 days across the 28 brands we track — ahead of Jackets (1,076) and Shirts (993). The single busiest brand/category pair is Stone Island Hoodies: 577 watched departures in 7 days, averaging €54. Full brand-by-brand numbers, updated weekly and free to check, live at resaleiq.dev.",
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
        h: "The categories that move fastest",
        p: [
          "Sneakers and trainers are the single most liquid category on Vinted — recognisable models from Nike, Adidas, and New Balance sell quickly when priced right and in common sizes.",
          "Everyday branded basics (T-shirts, hoodies, tracksuits, jeans) from mid-tier brands like Levi's, Carhartt, The North Face, and Stone Island have steady, year-round demand.",
          "Seasonality matters: coats and knitwear spike in autumn/winter; shorts, dresses and swimwear in spring/summer. Buying against the season and holding is a common cash-flow trap.",
        ],
      },
      {
        h: "Why the brand isn't enough on its own",
        p: [
          "A popular brand with the wrong size sits unsold. Sell-through varies enormously by size — the same shoe can fly in a mid size and rot in an outlier size.",
          "Condition and price do the rest. Two identical items at different prices have completely different sell-through. The winning listing is usually not the cheapest, but the fairest for its condition.",
        ],
      },
      {
        h: "How to know before you buy",
        p: [
          "Instead of guessing, check the market: how fast does this exact model actually sell, at what price, in which sizes? That's the entire job of " + BRAND + ` — it turns ${TRACKED} real listings into a BUY / WATCH / SKIP call, with a buy-below price and the sizes that move.`,
          "The practical rule: only buy when the resale price minus fees leaves a healthy margin over your cost, AND the item sells fast enough that your cash isn't stuck for months. [Brands clearing fastest right now](/flip) and [what actually left the shelf this week](/data) are the free weekly tables. The full equation (fees, shipping, losses and time) is in [what actually makes money in reselling](/manual/what-actually-makes-money).",
        ],
      },
      {
        h: "Buy-below still decides the flip",
        p: [
          "Knowing what sells best is half the job. The other half is not overpaying for movers.",
          "Week to 13 September 2026 (EU5): Fred Perry 1,027 watched departures @ €19 · Stone Island 892 @ €66 · Patagonia 843 @ €36 · Gucci 230 @ €197. Volume ≠ margin — pair demand with buy-below before you tie up cash.",
          "[Weekly market data](" +
            dataCiteHref("body_sellsbest_20260913") +
            ").",
        ],
        // BODY-SELLSBEST-001. Keep the EX-ILINK flip/data anchors above.
        cta: pricingBodyCta("body_sellsbest_20260913"),
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
          "As of 11 September 2026, among the 28 brands Resale IQ tracks across Spain, France, Germany, Italy and Portugal, " +
          "Hoodies were the busiest category: at least 1,400 hoodie listings left the shelf in the trailing 7 days, ahead of Jackets (1,076) and Shirts (993). " +
          "The busiest brand/category pair was Stone Island Hoodies: 577 watched departures in 7 days, averaging €54. " +
          "That is tracked-brand volume, not the whole Vinted catalogue. Live weekly volumes: [https://resaleiq.dev/data](/data). Brand ranking: [https://resaleiq.dev/flip](/flip).",
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
          "No. Volume and ticket size rarely sit together. Week to 13 September 2026 (EU5): Fred Perry 1,027 watched departures at €19, Stone Island 892 at €66, Patagonia 843 at €36, Gucci 230 at €197. " +
          "Pair demand with buy-below before you tie up cash. Weekly table: [https://resaleiq.dev/data](/data).",
      },
      {
        q: "What should I avoid buying to resell on Vinted?",
        a:
          "Avoid off-season stock you'll hold for months, unbranded or unrecognisable items, outlier sizes with thin demand, and anything you can't buy well below its typical sale price after fees.",
      },
      {
        q: "How do I know if an item will sell before I buy it?",
        a:
          `Check how fast comparable listings leave the shelf, at what asking price, and in which sizes. The free weekly tables are [https://resaleiq.dev/flip](/flip) (brands ranked by watched departures) and [https://resaleiq.dev/data](/data) (volumes and average prices at departure across ES/FR/DE/IT/PT). ` +
          `Resale IQ turns ${TRACKED} real listings into a BUY / WATCH / SKIP call with a buy-below price — that item-level verdict is the paid product.`,
      },
    ],
  },
  {
    slug: "how-to-price-items-on-vinted",
    title: "How to Price Items on Vinted: Buy-Below from Departure Prices",
    seoTitle: "How to Price Items on Vinted — Get Your Buy-Below Automatically",
    description:
      "Price off real Vinted departure prices, then work backwards to buy-below. Resale IQ computes it from watched EU listings. Starter €19/mo.",
    date: "2026-08-05",
    updated: "2026-09-13",
    category: "Pricing",
    readMins: 6,
    intro:
      "To price an item on Vinted, anchor to what it actually sells for — the median price comparable listings reached when they left the shelf — then set yours slightly below it. Most sellers instead price by feel, which either undersells the item or leaves it sitting unseen. As of 11 September 2026, we watched 6,378 listings leave the shelf across 28 tracked brands this week, and the departure price for the same garment varies wildly by brand: Fred Perry Shirts average €14, Stone Island Hoodies €54, and Balenciaga Sneakers €121. Price off the brand's real departure number, not retail.",
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
          "Week to 13 September 2026 (EU5: ES/FR/DE/IT/PT), we watched 5,746 departures across 28 brands. Examples of the gap:",
          "Fred Perry — 1,027 left the shelf · avg €19 (volume play)",
          "Stone Island — 892 · avg €66",
          "Gucci — 230 · avg €197 (price play, thinner volume)",
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
      { q: "What is a buy-below price?", a: "The maximum you should pay when sourcing an item to resell it profitably. A common formula is average asking price at departure × 0.95 (after fees) × 0.70, which targets about a 30% margin." },
      { q: "Should I price high and negotiate, or price to sell?", a: "For most items, pricing near or slightly below the median departure price sells faster and keeps your cash moving. Hold-for-more only makes sense for genuinely scarce items." },
    ],
  },
  {
    slug: "best-brands-to-resell-on-vinted",
    title: "The Best Brands to Resell on Vinted (and How to Judge Any Brand)",
    seoTitle: "Best Vinted Brands: Departed vs Still Listed — Resale IQ",
    description:
      "Best Vinted brands by weekly volume — departed vs still listed, not prestige. How to judge any brand on demand, price and size before you buy.",
    date: "2026-09-05",
    updated: "2026-09-13",
    category: "Sourcing",
    readMins: 6,
    intro:
      "As of 11 September 2026, the highest-volume brands leaving Vinted's shelf right now are Fred Perry (1,115 listings/7d, Shirts averaging €14), Stone Island (1,051/7d, Hoodies averaging €54) and Patagonia (938/7d, Jackets averaging €49). For margin instead of turnover: Gucci Bags average €301 on 96 watched departures/7d, and Balenciaga Sneakers average €121 on 172/7d. 'Best' depends on whether you want turnover or margin — full live numbers, updated weekly, at resaleiq.dev.",
    sections: [
      {
        h: "Consistently liquid brands",
        p: [
          "Sportswear: Nike, Adidas, New Balance, Puma — high volume, recognisable models, strong sneaker demand.",
          "Denim & basics: Levi's, Carhartt — steady year-round demand and easy to authenticate.",
          "Outerwear & streetwear: The North Face, Stone Island, Ralph Lauren — higher price points with reliable buyers.",
        ],
      },
      {
        h: "Why demand matters more than prestige",
        p: [
          "A premium brand that rarely sells ties up your cash. A mid-tier brand that sells every week compounds your profit faster. Liquidity often beats prestige for a working reseller. That split is the one in [what actually makes money in reselling](/manual/what-actually-makes-money): volume and premium are different businesses, not better and worse versions of the same one.",
          "The best brand for YOU is the one that sells fast at a margin, in sizes you can source. That's a data question, not an opinion — [brands clearing fastest right now](" +
            ilinkHref("flip") +
            ") is the weekly list.",
        ],
      },
      {
        h: "How to judge any brand in 30 seconds",
        p: [
          "Three numbers tell you almost everything: weekly sales volume (is there demand?), average sale price (is there margin room?), and sell-through by size (will YOUR stock move?). [What actually left the shelf this week](" +
            ilinkHref("data") +
            ") publishes the first two for free.",
          BRAND + " ranks brands on exactly these signals across " + DATA + ", so you can check a brand before you commit a haul to it.",
        ],
      },
    ],
    faq: [
      { q: "What are the best brands to resell on Vinted?", a: "Consistently liquid brands include Nike, Adidas, New Balance, Levi's, Carhartt, The North Face, and Stone Island. The 'best' brand for you is whichever sells fast at a margin in sizes you can source." },
      { q: "Is it better to resell premium or mid-tier brands?", a: "Mid-tier brands that sell weekly often out-earn premium brands that sell rarely, because your cash recycles faster. Liquidity usually beats prestige for active resellers." },
      { q: "How do I know if a brand is worth reselling?", a: `Check three numbers: weekly sales volume, average sale price, and sell-through by size. Resale IQ ranks brands on these from ${TRACKED} real listings.` },
    ],
  },
  {
    slug: "vinted-vs-depop-for-sellers",
    title: "Vinted vs Depop for Sellers: Who Pays More?",
    seoTitle: "Is Vinted or Depop Better? Your Country — Resale IQ",
    description:
      "Depop's 0% seller fee is US and UK only. From ES, FR, DE, IT or PT, Vinted pays you more — no seller commission versus Depop's 10%.",
    date: "2026-08-29",
    updated: "2026-09-12",
    category: "Platforms",
    readMins: 9,
    intro:
      "Vinted and Depop get compared endlessly, usually on vibes. The comparison that actually decides your profit is narrower than that, and it has an answer most guides get wrong: what each platform takes depends on which country you sell from. Depop's headline 0% selling fee applies to sellers based in the US and the UK. If you sell from Spain, France, Germany, Italy or Portugal, it does not apply to you.",
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
          "The split shows up in the numbers. As of 12 September 2026, the highest-ticket categories we watch leave Vinted's shelf are Gucci Bags (an average €288 across 97 watched departures in 7 days) and Stone Island Jackets (€134 across 197) — the curated, premium end where Depop's styling-and-story premium competes hardest. At the volume end, Fred Perry Shirts moved 547 watched departures at an average €14 the same week: recognisable, cheap, fast, and exactly what Vinted's scale is built for.",
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
    title: "How to Find Vinted Flips — Start From Demand, Not Scroll",
    seoTitle: "How to Find Items to Flip on Vinted — Start From Demand",
    description:
      "Stop random scrolling. Find underpriced Vinted items from real demand across ES/FR/DE/IT/PT. Free weekly brand data on Resale IQ.",
    date: "2026-08-05",
    updated: "2026-09-13",
    category: "Sourcing",
    readMins: 5,
    intro:
      "As of 11 September 2026, we watched 6,333 listings leave the shelf across 28 tracked brands this week, and the fastest-moving categories point straight at what's worth flipping: Stone Island Hoodies (566 watched departures at €55), Patagonia Jackets (346 at €50) and New Balance Sneakers (283 at €51). To find items worth flipping on Vinted, start from proven demand rather than from what looks cheap: pick categories that sell fast, know each one's buy-below price, then hunt for listings under it. That turns the hardest part of reselling into a repeatable filter instead of endless scrolling.",
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
    updated: "2026-09-13",
    category: "Business",
    readMins: 5,
    intro:
      "There's no single number — it depends entirely on which brand and category you source. As of 11 September 2026, category prices we track range from €11 (Pull&Bear Hoodies) to €301 (Gucci Bags) across the 28 brands on resaleiq.dev — a 27x spread for the same 'sell a hoodie/bag' motion. Volume varies just as much: Fred Perry Shirts saw 560 watched departures in 7 days at €14 avg, versus Jordan Sneakers at 11/7d and €158 avg. Income is margin per item × how many you can actually sell, not a fixed rate. (General information, not a promise of earnings.)",
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
    updated: "2026-09-13",
    category: "Pricing",
    readMins: 5,
    intro:
      "Ask a struggling reseller their sale price and they'll know it. Ask their buy-below price and they'll pause. That gap is where profit leaks. Here's the number that fixes it.",
    definedTerm: {
      name: "Buy-below price",
      description:
        "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70.",
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
          "Week to 13 September 2026 (EU5): we watched 5,746 departures across 28 brands — Fred Perry 1,027 @ €19 · Stone Island 892 @ €66 · Gucci 230 @ €197. [Weekly market data](" +
            dataCiteHref("body_buybelow_20260913") +
            ").",
        ],
        // BODY-BUYBELOW-001. No ctr_blog mid-CTA on this post to keep.
        cta: pricingBodyCta("body_buybelow_20260913"),
      },
    ],
    faq: [
      { q: "What is a buy-below price?", a: "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70." },
      { q: "How do you calculate a buy-below price?", a: "Buy-below price = average sale price × 0.95 × 0.70. The 0.95 covers the 5% platform deduction Resale IQ models for Vinted, and the 0.70 targets about a 30% margin. Fee structures differ by platform and by whether you sell privately or as a business, so substitute your own figure. Never pay more than the result when sourcing." },
      { q: "Why is buy-below price important?", a: "It protects your margin before you list. Profit in reselling is mostly decided at the buy, not the sale — buying under your buy-below price is what makes an item profitable." },
    ],
  },
]

// Batch 2 lives in its own file for readability; ALL_POSTS is what pages consume.
import { POSTS_2 } from "./blog-posts-2"
import { POSTS_3 } from "./blog-posts-3"

export const ALL_POSTS: BlogPost[] = [...POSTS, ...POSTS_2, ...POSTS_3]

export function getPost(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug)
}
