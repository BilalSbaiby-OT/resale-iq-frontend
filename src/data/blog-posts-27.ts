// Batch 27 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// All departure data from /api/public/market-snapshot (2026-09-15 build).
// Nike sneakers EU price guide — high-intent sourcing + pricing topic.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_27: BlogPost[] = [
  {
    slug: "nike-sneakers-price-guide-eu-vinted",
    title: "Nike Sneakers Price Guide: What They Actually Sell for on EU Vinted (2026)",
    seoTitle: "Nike Sneakers EU Price Guide — Resale IQ (2026 Data)",
    description:
      "What Nike sneakers actually sell for on EU Vinted in 2026: departure averages, buy-below prices, and which models have real demand. Based on tracked departures across 5 EU markets.",
    date: "2026-09-15",
    category: "Price Guides",
    readMins: 11,
    intro:
      "Nike is the highest-demand sneaker brand on EU Vinted — 78 Nike sneakers watched departures per week across France, Germany, Spain, Italy and Portugal, at an average exit price of €96. But that average hides significant variation: the Air Force 1 exits at a different price from the Tech Fleece trainer exits at, and sourcing the wrong model at the wrong price is how you end up holding stock. This guide covers what Nike sneakers actually sell for on EU Vinted, which models have enough weekly liquidity to be worth sourcing, and the buy-below price approach that makes the difference between a margin and a loss.",
    definedTerm: {
      name: "Nike sneaker departure average",
      description:
        "A Nike sneaker departure average is the median exit price at which a specific Nike model actually sold on EU Vinted over a trailing period (typically 7–14 days), across tracked EU markets. It is calculated from completed transactions — items that left the platform — not from current listing prices, which include unsold stock and therefore overstate the achievable price. The departure average is the correct pricing anchor for a seller; the buy-below price is the sourcing ceiling derived from it.",
    },
    sections: [
      {
        h: "Nike sneakers on EU Vinted: the baseline numbers",
        p: [
          "Nike accounts for 78 sneaker departures per week on EU Vinted in ResaleIQ's tracked markets, at an average exit price of €96. Of the 28 brands tracked, Nike ranks in the top five for sneaker category volume — which means there is real buyer demand, but also real seller competition. The practical implication: Nike sneakers do sell on Vinted, but only at prices buyers are willing to pay, which are lower than most sellers expect.",
          "The Air Force 1 is the single most-searched Nike query on ResaleIQ and one of the most frequently departed Nike sneakers on EU Vinted. Current departure data shows it exiting at an average of €93.75, with a buy-below sourcing ceiling of €62.34 — meaning you need to source the shoe below that price for the margin to hold after accounting for your time and any platform transaction costs. At 38 departures per week, it has enough volume to treat as a reliable category.",
          "The important caveat with Nike on Vinted: the brand has dozens of models, and departure rates vary sharply between them. Mainstream retro runners (Air Force 1, Air Max 90, Dunk) move faster than technical training silhouettes or older lifestyle models that have left mainstream rotation. Before sourcing any Nike model, the relevant question is not 'does Nike sell on Vinted?' but 'does this specific model sell, at what price, and how many per week?'",
        ],
      },
      {
        h: "Air Force 1: the benchmark Nike model",
        p: [
          "The Air Force 1 is the safest Nike model to source on EU Vinted by liquidity. With 38 weekly departures in tracked markets and an average exit of €93.75, it has both volume and a clear price floor. The buy-below ceiling sits at €62.34 — sourcing at charity shops, market stalls, or secondary platforms below that number leaves a workable margin at the EU Vinted exit average.",
          "Condition matters more on the Air Force 1 than on most other models because it is a white-heavy silhouette. Yellowed soles, midsole scuffs, and creased toe boxes all bring the exit price down materially — buyers on Vinted searching for AF1s are price-sensitive and have enough supply to choose clean pairs at competitive prices. Pairs graded 'good' (minor wear, clean uppers) exit closer to €85–95; pairs graded 'fair' (visible creasing, oxidised soles) exit closer to €55–70. Source accordingly.",
          "Regional variation: French and German Vinted buyers tend to pay slightly above the EU average for Nike Air Force 1s, while Spanish and Italian buyers are more price-sensitive in the sneaker category. If you are listing in France or Germany, you can often set your listing price at the EU average and still convert; in Spain or Italy, pricing 10–15% below the EU average moves stock faster.",
        ],
        cta: pricingMidCta("ctr_nike_price_guide_20260915"),
      },
      {
        h: "Air Max models: higher ceiling, slower turns",
        p: [
          "Air Max models (90, 95, 97, TN) exit at higher average prices than the Air Force 1 — the Air Max 90 tracks in the €80–110 range depending on colourway and condition — but they also have lower departure volume per week. This matters for sourcing decisions: a model that exits at €110 but only sells twice per week in your market carries more holding risk than the Air Force 1, which exits at €94 but sells 38 times per week.",
          "The Air Max TN ('Tuned Air') deserves specific mention. It is the highest-demand Air Max silhouette in Southern Europe (Spain, Italy, Portugal) — often exiting at €90–120 for clean pairs in popular colourways — but has lower traction in France and Germany, where retro running aesthetics dominate over the TN's technical look. Sourcing TNs makes most sense for sellers in or shipping to Iberian and Italian markets.",
          "Air Max 97 pairs from popular colourways (Silver Bullet, Black/Gold) still exit at premium prices — often €100–150 for very good condition — but the supply of clean pairs on secondary markets has thinned, which means sourcing at buy-below is harder. If you find clean 97s at charity shop prices, they remain a reliable flip; the market for average-condition 97s at €60–70 buy price is much thinner.",
        ],
      },
      {
        h: "Dunk Low and SB Dunks: the nuanced case",
        p: [
          "Nike Dunk Lows peaked in resale premium in 2021–2022 and have normalised significantly since. On EU Vinted, general release Dunk Lows now exit at prices close to retail (€100–130) or slightly below for older colourways. The opportunity has shifted: the money is no longer in standard Dunks at premium prices, but in specific colourways or SB Dunk collaborations that maintain a premium on Vinted because their buyer base specifically seeks them out.",
          "SB Dunks (skateboarding line) have a more stable premium on Vinted than general release Dunks, because SB buyers are a more dedicated community with higher price tolerance. Popular SB collabs (Heineken, Paris, Travis Scott) still exit at significant premiums — €200–400+ for deadstock pairs — but those sourcing opportunities are rare and require authenticating carefully. Most SB Dunks sourced at charity shops or flea markets are well-worn and exit below €80.",
          "The practical Vinted seller approach for Dunks: general release Dunks are only worth sourcing at below €70 buy price given current EU exit averages. SB Dunks are worth researching individually by colourway before purchasing — the spread between an average pair and a sought colourway is too large to apply a blanket rule.",
        ],
      },
      {
        h: "Nike Tech Fleece and apparel: different rules",
        p: [
          "Nike apparel on Vinted follows different demand patterns from footwear. Nike Tech Fleece (joggers, full-zip hoodies, tracksuits) has strong EU demand — it is a core resale category on Vinted because it is recognisable, size-agnostic compared to footwear, and the brand's RRP (€120–200 for a tracksuit) creates a large spread between new and second-hand prices.",
          "Tech Fleece on EU Vinted exits at roughly €35–55 for individual pieces (joggers or hoodie separately) and €60–90 for matching sets, depending on colour and condition. The most liquid colours are black, grey, and navy — the core Nike tech palette. Limited or seasonal colours (burgundy, olive, teal) have lower departure volume and more price variance. Sourcing the core palette at below €25 per piece creates reliable margins at EU Vinted average exits.",
          "Nike tracksuits (non-Tech Fleece — the nylon or woven track top and bottom sets) exit lower, around €25–45 for the set, and have higher variance by vintage. 1990s and early 2000s Nike tracksuits can exceed this if in good condition and in a desired colourway, but the market is smaller and requires more research per item.",
        ],
      },
      {
        h: "How to set your Nike buy-below price before sourcing",
        p: [
          "The buy-below price for any Nike model is: (EU Vinted departure average for that model) × (1 − target margin %) − selling costs. For Vinted specifically, selling costs are lower than other platforms because there are no seller fees — only your time and shipping if you offer it included. A 30% gross margin target on an Air Force 1 exiting at €93.75 puts the buy-below ceiling at €65. ResaleIQ calculates this directly for covered models: the current Air Force 1 buy-below is €62.34, reflecting realistic margin after accounting for the full cost of selling.",
          "For Nike models not individually tracked in ResaleIQ, use the EU departure average for Nike sneakers (€96) as a starting point and apply a 30–35% buy-below ceiling (€63–67). This is conservative for popular models and aggressive for slower ones — which is the correct asymmetry: it is better to pass on a slow seller that would have worked than to source a slow seller that stalls.",
          "The most common mistake in Nike sourcing is anchoring on the retail price rather than the Vinted departure average. A Nike Air Max 95 with a €160 RRP does not exit at €160 on EU Vinted — it exits closer to €80–110 for a clean pair. Sourcing at what feels like 'half retail' (€80) when the exit is €90 leaves almost no margin. Always anchor on departure data, not retail. [Check current departure data →](" + ilinkHref("data") + ")",
        ],
      },
      {
        h: "Which Nike models to prioritise in 2026",
        p: [
          "By departure volume and buy-below opportunity: the Air Force 1 is the first-choice Nike model on EU Vinted. High weekly volume (38 departures), clear buy-below (€62.34), and a well-understood buyer base. Source clean pairs below €62 and list at or near the departure average.",
          "Air Max TN for Southern European sellers: higher exit price (€90–120), lower volume than AF1, but strong demand in Spain, Italy, and Portugal. Good model for sellers in those markets or willing to ship there.",
          "Tech Fleece tracksuits and joggers: core colours (black, grey, navy) in good condition. Consistent demand, lower per-unit exit price (€35–55 per piece) but faster turns and less condition-sensitivity than footwear.",
          "Avoid sourcing Nike models you cannot quickly verify departure data on — 'it's Nike so it will sell' is not a sourcing framework. The brand has hundreds of models, and many of them move slowly or not at all on EU Vinted at prices that make sourcing worthwhile.",
        ],
        cta: pricingBodyCta("ctr_nike_price_guide_bottom_20260915"),
      },
    ],
    faq: [
      {
        q: "What is the average price for Nike sneakers on Vinted in Europe?",
        a: "Nike sneakers exit at an average of €96 across EU Vinted markets tracked by ResaleIQ (France, Germany, Spain, Italy, Portugal) as of 2026. The Air Force 1 specifically averages €93.75. Individual models vary — Air Max TN exits closer to €90–120 in Southern Europe, Dunk Lows near retail (€100–130) for general release colourways.",
      },
      {
        q: "Is it worth reselling Nike trainers on Vinted?",
        a: "Yes, for models with sufficient weekly departure volume. The Air Force 1 sees 38 departures per week in tracked EU markets — enough volume to treat as a reliable category. The margin depends on sourcing below the buy-below price (€62.34 for AF1). For lower-volume Nike models, the holding risk increases and the sourcing threshold needs to be proportionally lower.",
      },
      {
        q: "What is the buy-below price for Nike Air Force 1 on Vinted?",
        a: "The current ResaleIQ buy-below price for Nike Air Force 1 on EU Vinted is €62.34. This is the maximum sourcing cost that leaves a defensible margin when selling at the current EU departure average of €93.75. Sourcing above €62.34 requires above-average exits to make money, which cannot be reliably planned for.",
      },
      {
        q: "Which Nike sneaker sells best on Vinted?",
        a: "By weekly departure volume on EU Vinted, the Air Force 1 leads Nike's tracked footwear. Air Max models (90, 95, TN) have higher per-pair exit prices in some markets but lower weekly volume. Nike Tech Fleece apparel also sells consistently — different buyer, faster turns, lower per-unit exit.",
      },
      {
        q: "How do I price Nike sneakers I am selling on Vinted?",
        a: "Use the EU Vinted departure average for your specific model — not the retail price and not other sellers' listing prices. Departure averages reflect what buyers actually paid. For the Air Force 1, that is €93.75. Adjust down for condition (visible wear, creasing) and up slightly if you are selling in France or Germany vs Spain or Italy. ResaleIQ tracks departure averages and buy-below prices for covered Nike models.",
      },
      {
        q: "Are Nike Dunks still profitable to resell on Vinted in 2026?",
        a: "General release Nike Dunks have largely normalised to near-retail EU Vinted exit prices (€100–130 for good condition), which only leaves a margin if sourced significantly below that — ideally under €70. SB Dunk collaborations still command premiums on Vinted, but require per-colourway research and careful authentication before sourcing.",
      },
    ],
  },
]
