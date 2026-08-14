// Programmatic SEO + AEO content. Each post targets a real reseller search query
// and is structured Q&A-first so search engines AND answer engines (ChatGPT,
// Perplexity, Google AI, Claude) can lift clean, citable answers.
// Claims kept honest: "900,000+ listings across 5 EU markets" is true; no fabricated
// per-item stats. Methodology figures (30% margin math) are the product's real logic.

export interface BlogPost {
  slug: string
  title: string           // <title> + H1
  description: string     // meta description (also the AEO summary)
  date: string            // ISO
  category: string
  readMins: number
  intro: string
  sections: { h: string; p: string[] }[]
  faq: { q: string; a: string }[]
}

const BRAND = "Resale IQ"
const DATA = "900,000+ Vinted listings across the 5 main EU markets (Spain, France, Germany, Italy, Portugal)"

export const POSTS: BlogPost[] = [
  {
    slug: "what-sells-best-on-vinted",
    title: "What Sells Best on Vinted in 2026 (Data-Backed)",
    description:
      "The categories and brands that sell fastest on Vinted right now, based on 900,000+ analyzed listings across 5 EU markets — and how to tell before you buy.",
    date: "2026-08-05",
    category: "Sourcing",
    readMins: 6,
    intro:
      "The items that sell best on Vinted aren't always the ones that look most valuable. What actually moves is a mix of brand demand, the right size, condition, and price. Based on " +
      DATA + ", here's what consistently sells — and how to check any item before you spend.",
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
          "Instead of guessing, check the market: how fast does this exact model actually sell, at what price, in which sizes? That's the entire job of " + BRAND + " — it turns 900,000+ real listings into a BUY / WATCH / SKIP call, with a buy-below price and the sizes that move.",
          "The practical rule: only buy when the resale price minus fees leaves a healthy margin over your cost, AND the item sells fast enough that your cash isn't stuck for months.",
        ],
      },
    ],
    faq: [
      { q: "What sells fastest on Vinted?", a: "Recognisable sneakers (Nike, Adidas, New Balance) and everyday branded basics (Levi's, Carhartt, The North Face) in common sizes sell fastest, provided they're priced fairly for their condition. Sell-through drops sharply for outlier sizes and off-season items." },
      { q: "What should I avoid buying to resell on Vinted?", a: "Avoid off-season stock you'll hold for months, unbranded or unrecognisable items, outlier sizes with thin demand, and anything you can't buy well below its typical sale price after fees." },
      { q: "How do I know if an item will sell before I buy it?", a: "Check the item's real sell-through rate, average sale price, and best-selling sizes. Tools like Resale IQ compute this from 900,000+ real Vinted listings so you get a BUY / WATCH / SKIP call instead of guessing." },
    ],
  },
  {
    slug: "how-to-price-items-on-vinted",
    title: "How to Price Items on Vinted to Sell Fast (Without Underselling)",
    description:
      "A simple, data-backed method for pricing items on Vinted so they sell quickly but still protect your margin — including the exact buy-below rule resellers use.",
    date: "2026-08-05",
    category: "Pricing",
    readMins: 5,
    intro:
      "Most Vinted sellers price by feel, then either undersell (leaving money on the table) or overprice (and watch it sit). The fix is to anchor to what the item actually sells for, then work backwards.",
    sections: [
      {
        h: "Start from the real sale price, not the retail price",
        p: [
          "Retail price is almost irrelevant on resale. What matters is the current typical sale price for that exact model, in that condition, in your market.",
          "Look at recently sold listings (not active ones — active listings show hopes, not sales). The median sold price is your anchor.",
        ],
      },
      {
        h: "Work backwards to your buy-below price",
        p: [
          "If you're sourcing to resell, the number that decides profit is the buy-below price — the most you can pay and still make a healthy margin after fees.",
          "A common rule: buy-below = average sale price × 0.95 (the 5% platform deduction Resale IQ models for Vinted) × 0.70, which targets roughly a 30% margin. Substitute your own fee figure if yours differs. Pay more than that and you're gambling on price appreciation.",
        ],
      },
      {
        h: "Price to sell in a reasonable window",
        p: [
          "Pricing slightly below the median sold price sells faster and frees your cash to reinvest. Pricing above it can work for rare items but slows everything down.",
          "Speed matters more than squeezing the last euro: money stuck in unsold stock earns nothing. Sell-through rate — how fast an item sells — should drive your pricing as much as the price itself.",
        ],
      },
    ],
    faq: [
      { q: "How should I price items on Vinted?", a: "Anchor to the median recently-sold price for that exact model and condition, then price slightly below it to sell faster. Don't price off retail — resale value is what matters." },
      { q: "What is a buy-below price?", a: "The maximum you should pay when sourcing an item to resell it profitably. A common formula is average sale price × 0.95 (after fees) × 0.70, which targets about a 30% margin." },
      { q: "Should I price high and negotiate, or price to sell?", a: "For most items, pricing near or slightly below the median sold price sells faster and keeps your cash moving. Hold-for-more only makes sense for genuinely scarce items." },
    ],
  },
  {
    slug: "best-brands-to-resell-on-vinted",
    title: "The Best Brands to Resell on Vinted (and How to Judge Any Brand)",
    description:
      "Which brands hold resale value on Vinted, why demand beats hype, and a repeatable way to judge whether any brand is worth flipping — from 900,000+ analyzed sales.",
    date: "2026-08-05",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Everyone wants a list of 'best brands to resell', but demand shifts and lists go stale. The brands below are consistently liquid on Vinted, and just as importantly, here's how to judge any brand yourself.",
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
          "A premium brand that rarely sells ties up your cash. A mid-tier brand that sells every week compounds your profit faster. Liquidity often beats prestige for a working reseller.",
          "The best brand for YOU is the one that sells fast at a margin, in sizes you can source. That's a data question, not an opinion.",
        ],
      },
      {
        h: "How to judge any brand in 30 seconds",
        p: [
          "Three numbers tell you almost everything: weekly sales volume (is there demand?), average sale price (is there margin room?), and sell-through by size (will YOUR stock move?).",
          BRAND + " ranks brands on exactly these signals across " + DATA + ", so you can check a brand before you commit a haul to it.",
        ],
      },
    ],
    faq: [
      { q: "What are the best brands to resell on Vinted?", a: "Consistently liquid brands include Nike, Adidas, New Balance, Levi's, Carhartt, The North Face, and Stone Island. The 'best' brand for you is whichever sells fast at a margin in sizes you can source." },
      { q: "Is it better to resell premium or mid-tier brands?", a: "Mid-tier brands that sell weekly often out-earn premium brands that sell rarely, because your cash recycles faster. Liquidity usually beats prestige for active resellers." },
      { q: "How do I know if a brand is worth reselling?", a: "Check three numbers: weekly sales volume, average sale price, and sell-through by size. Resale IQ ranks brands on these from 900,000+ real listings." },
    ],
  },
  {
    slug: "vinted-vs-depop-for-sellers",
    title: "Vinted vs Depop for Sellers: Which Should You Use in 2026?",
    description:
      "A practical comparison of Vinted and Depop for resellers — fees, audience, what sells on each, and how to decide where to list.",
    date: "2026-08-05",
    category: "Platforms",
    readMins: 5,
    intro:
      "Vinted and Depop are the two biggest secondhand platforms in Europe, but they behave differently for sellers. Here's how they compare on the things that affect your profit.",
    sections: [
      {
        h: "Fees",
        p: [
          "Vinted charges buyers a Buyer Protection fee and lets sellers list for free, so your listed price is closer to what you keep. Depop charges sellers a commission on sales.",
          "Lower seller-side friction is a big reason Vinted has scaled so fast across the EU.",
        ],
      },
      {
        h: "Audience and what sells",
        p: [
          "Vinted skews toward everyday branded fashion, basics, and value across five large EU markets. Depop skews younger, more trend- and vintage-led, and is strong in the UK and US.",
          "If you source recognisable mid-market brands and sneakers, Vinted's volume is hard to beat. For curated vintage and streetwear with a story, Depop can command higher prices.",
        ],
      },
      {
        h: "How to decide",
        p: [
          "Match the item to the platform: high-volume branded basics and sneakers → Vinted; curated/vintage/trend pieces → Depop. Many resellers cross-list.",
          "Wherever you list, the buy decision is the same: only source items with real demand and margin. " + BRAND + " focuses on Vinted's 5 EU markets and 900,000+ listings to make that call.",
        ],
      },
    ],
    faq: [
      { q: "Is Vinted or Depop better for sellers?", a: "Vinted has free listings and huge EU volume, ideal for branded basics and sneakers. Depop takes a seller commission but reaches a younger, trend-led audience that pays more for curated vintage. Match the item to the platform." },
      { q: "Does Vinted charge sellers fees?", a: "Vinted lets sellers list for free and charges buyers a Buyer Protection fee, so sellers keep more of the listed price than on platforms that take a seller commission." },
    ],
  },
  {
    slug: "what-is-a-good-sell-through-rate",
    title: "What Is a Good Sell-Through Rate for Reselling?",
    description:
      "Sell-through rate explained for resellers — what it means, what counts as good, and why it matters more than profit margin on any single item.",
    date: "2026-08-05",
    category: "Metrics",
    readMins: 4,
    intro:
      "Sell-through rate is the metric most new resellers ignore and most pros obsess over. It measures how quickly your stock actually sells — and it decides how fast your money compounds.",
    sections: [
      {
        h: "What sell-through rate means",
        p: [
          "Sell-through rate is the share of listings that end in a sale over a period — a measure of demand relative to supply. A high rate means items sell quickly and reliably.",
          "It's the difference between money that recycles into new stock and money frozen in a wardrobe of unsold items.",
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
          "Favour items with proven, fast sell-through in the sizes you can source. Be cautious with slow movers even if the potential profit looks big.",
          BRAND + " shows per-model and per-size sell-through from " + DATA + " so you can prioritise fast, reliable stock.",
        ],
      },
    ],
    faq: [
      { q: "What is a good sell-through rate for reselling?", a: "Higher is better — it means your stock sells quickly and your cash recycles fast. Prioritise items with proven fast sell-through in the sizes you can source, rather than chasing high margins on slow movers." },
      { q: "Is sell-through rate more important than profit margin?", a: "Often, yes. A moderate margin that sells every week compounds faster than a big margin that sells once a year. Speed of sale keeps your capital working." },
    ],
  },
  {
    slug: "how-to-find-items-to-flip-on-vinted",
    title: "How to Find Profitable Items to Flip on Vinted",
    description:
      "A repeatable sourcing process for finding underpriced, fast-selling items to flip on Vinted — without scrolling for hours or guessing.",
    date: "2026-08-05",
    category: "Sourcing",
    readMins: 5,
    intro:
      "The hardest part of reselling isn't listing — it's finding stock that's both underpriced and in demand. Here's a process that replaces endless scrolling with a repeatable filter.",
    sections: [
      {
        h: "Start from demand, not from what's cheap",
        p: [
          "Cheap doesn't mean profitable. Start with items that have proven demand and margin room, then look for them below their buy-below price.",
          "Working backwards from demand means you only spend time on items that will actually sell.",
        ],
      },
      {
        h: "Use the buy-below filter",
        p: [
          "For each target model, know its average sale price and buy-below price. Any listing under that number, in a good size and condition, is a candidate deal.",
          "This turns sourcing into a scan for numbers rather than a gut call.",
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
    description:
      "An honest look at reselling income on Vinted — what drives it, realistic ranges, and why sourcing decisions matter more than volume.",
    date: "2026-08-05",
    category: "Business",
    readMins: 5,
    intro:
      "Reselling income on Vinted ranges from pocket money to a full-time living. The difference is rarely luck — it's sourcing discipline, sell-through, and reinvestment. Here's an honest breakdown. (This is general information, not a promise of earnings.)",
    sections: [
      {
        h: "What actually drives income",
        p: [
          "Income = number of items sold × average margin per item × how many times you can recycle your capital. Sell-through and margin matter more than how many hours you scroll.",
          "Most resellers lose money on a chunk of their stock — dead inventory that never sells. Cutting that share is the biggest lever on profit.",
        ],
      },
      {
        h: "Why sourcing beats volume",
        p: [
          "Buying more isn't the answer if 40% of it doesn't sell. Buying better — items with proven demand and margin — raises income without raising risk.",
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
    description:
      "The common reselling mistakes that drain profit on Vinted — dead stock, wrong sizes, emotional buying — and how to avoid each one.",
    date: "2026-08-05",
    category: "Business",
    readMins: 5,
    intro:
      "Most reselling losses aren't dramatic — they're quiet: cash tied up in stock that won't sell, a few euros lost per item on bad pricing. Here are the seven that add up fastest.",
    sections: [
      {
        h: "The big three",
        p: [
          "1. Buying dead stock — items with no real demand. This is the single most expensive mistake, and it happens at the buy, not the sale.",
          "2. Ignoring size demand — buying a great brand in a size that barely sells.",
          "3. Emotional buying — 'I love this' instead of 'this sells'. Buy what sells, not what you'd wear.",
        ],
      },
      {
        h: "The quiet four",
        p: [
          "4. Overpaying at source — no buy-below discipline, so margins are thin from the start.",
          "5. Mispricing — pricing off retail, or too high to move.",
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
    category: "Pricing",
    readMins: 4,
    intro:
      "Ask a struggling reseller their sale price and they'll know it. Ask their buy-below price and they'll pause. That gap is where profit leaks. Here's the number that fixes it.",
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
          "A widely used rule: buy-below = average sale price × 0.95 × 0.70.",
          "The 0.95 accounts for the 5% platform deduction we model for Vinted; the 0.70 targets roughly a 30% margin. Adjust both to your own fee structure and goals, but keep the discipline.",
        ],
      },
      {
        h: "Why it changes everything",
        p: [
          "With a buy-below price for every target item, sourcing becomes a fast yes/no scan and your margins are protected before you ever list. " + BRAND + " calculates it automatically for any item from " + DATA + ".",
        ],
      },
    ],
    faq: [
      { q: "How do you calculate a buy-below price?", a: "Buy-below price = average sale price × 0.95 × 0.70. The 0.95 covers the 5% platform deduction Resale IQ models for Vinted, and the 0.70 targets about a 30% margin. Fee structures differ by platform and by whether you sell privately or as a business, so substitute your own figure. Never pay more than the result when sourcing." },
      { q: "Why is buy-below price important?", a: "It protects your margin before you list. Profit in reselling is mostly decided at the buy, not the sale — buying under your buy-below price is what makes an item profitable." },
    ],
  },
  {
    slug: "how-to-spot-fake-items-vinted",
    title: "How to Spot Fake Items When Sourcing on Vinted",
    description:
      "Practical checks to avoid buying counterfeits when sourcing to resell on Vinted — tags, stitching, pricing red flags, and when to walk away.",
    date: "2026-08-05",
    category: "Sourcing",
    readMins: 5,
    intro:
      "Buying a counterfeit to resell is a double loss — wasted cash and a hit to your reputation. These checks reduce the risk before you commit. (Authenticity checks are probabilistic — when in doubt, don't buy.)",
    sections: [
      {
        h: "Price and listing red flags",
        p: [
          "A price far below the typical sale price for that model is the most common red flag — if it looks too good, it often is.",
          "Vague descriptions, stock photos instead of real ones, and refusal to send extra photos of tags/labels are warning signs.",
        ],
      },
      {
        h: "Physical checks",
        p: [
          "Compare tags, fonts, stitching, and logos against verified references for that exact model. Counterfeits usually slip on small details.",
          "Check serial numbers/style codes where applicable, and the quality of materials and hardware.",
        ],
      },
      {
        h: "When in doubt",
        p: [
          "If you can't confirm authenticity, walk away — the downside outweighs the deal. " + BRAND + " includes a probabilistic authenticity read to flag risk before you buy, but a human check always wins.",
        ],
      },
    ],
    faq: [
      { q: "How do I spot fake items on Vinted?", a: "Watch for prices far below the model's typical sale price, stock photos, and vague descriptions. Compare tags, fonts, stitching and style codes to verified references. When in doubt, don't buy." },
      { q: "Is it risky to resell items bought on Vinted?", a: "The main risk is counterfeits. Verify authenticity before buying, keep evidence, and walk away from anything you can't confirm — reselling a fake costs you money and reputation." },
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
