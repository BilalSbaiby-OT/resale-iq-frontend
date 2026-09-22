// Batch 90 of SEO/AEO articles. Same contract as blog-posts.ts.
// Ralph Lauren Hoodie EU Vinted price guide — targets
// "ralph lauren hoodie vinted price", "ralph lauren hoodie vinted eu price guide",
// "polo ralph lauren hoodie vinted eu", "is ralph lauren hoodie worth reselling vinted",
// "ralph lauren hoodie buy below vinted", "ralph lauren quarter zip vinted eu",
// "ralph lauren sweatshirt vinted eu price", "polo ralph lauren hoodie vinted prix".
// DISTINCT from ralph-lauren-eu-vinted-price-guide (brand overview, all categories)
// and ralph-lauren-reselling-vinted-guide (general intro).
// This guide is hoodie-only: crew-neck, quarter-zip, double-knit — model depth.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_90: BlogPost[] = [
  {
    slug: "ralph-lauren-hoodie-eu-vinted-price-guide",
    title: "Ralph Lauren Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Ralph Lauren Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Ralph Lauren hoodies track 20 departures in the last 30 days across EU Vinted in September 2026 at a €46 average exit price — the highest-margin category in the Ralph Lauren EU Vinted dataset. Real exit ranges by hoodie type, buy-below ceiling €29.90, condition grading, crew-neck vs quarter-zip vs double-knit breakdown, and how Ralph Lauren hoodies compare to Lacoste and Stone Island for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Ralph Lauren Hoodie",

    intro:
      "Ralph Lauren hoodies track 20 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €46 average exit price — the highest-margin category in the Ralph Lauren EU Vinted dataset, ahead of shirts (20 departures in the last 30 days at €28), jackets (6 departures in the last 30 days at €56 but low volume), and T-shirts (6 departures in the last 30 days at €19). The Ralph Lauren brand total is 53 departures in the last 30 days across five categories at a €36 brand average. At a buy-below ceiling of €29.90 (€46 × 0.65), the hoodie category delivers a gross margin of approximately €16.10 per unit on a correctly sourced piece — one of the strongest per-unit margins in the EU Vinted mid-range segment. This guide covers exit prices by hoodie type, the buy-below ceiling by condition tier, the quarter-zip premium, how hoodies compare to the rest of the Ralph Lauren EU Vinted catalogue, and where Ralph Lauren stacks against Lacoste and Stone Island hoodies for EU resellers.",

    definedTerm: {
      name: "Ralph Lauren hoodie departure average",
      description:
        "The Ralph Lauren hoodie departure average is the average price at which a tracked Ralph Lauren hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 16 September 2026, Ralph Lauren hoodies track 20 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €46 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Ralph Lauren brand tracks 53 departures in the last 30 days at a €36 brand average across all five categories. The buy-below ceiling for the hoodie category at the €46 exit average is €29.90 — that is €46 × 0.65, targeting a 35% gross margin after platform fees. Ralph Lauren hoodies represent 38% of all tracked Ralph Lauren watched departures per week in September 2026, making hoodies the joint-leading category alongside shirts by volume and the leading category by revenue-per-departure.",
    },

    sections: [
      {
        h: "What the Ralph Lauren hoodie market looks like on EU Vinted right now",
        p: [
          "Ralph Lauren hoodies are the highest-revenue-per-departure category in the Ralph Lauren EU Vinted dataset. 20 departures in the last 30 days at €46 average makes them 38% of the brand's total weekly movement — tied with shirts on volume but 64% higher on exit price (€46 vs €28). The hoodie category is characterised by genuine demand across the French, German, and Spanish Vinted markets, driven by the Ralph Lauren brand's association with American collegiate and old-money aesthetics that resonate with EU buyers aged 22–40.",
          "The category splits into three main sub-types with distinct pricing outcomes. Classic crew-neck sweatshirts with the Polo Ralph Lauren chest or sleeve logo — often in navy, grey marl, or dark green — exit at €28–€45. Quarter-zip fleece and half-zip pullovers, typically bearing the embroidered pony or 'Polo' lettering, trade at €40–€65 and represent the premium end of the hoodie market. Heavyweight double-knit or stadium hoodies in block colours exit at €55–€90 where found in Very Good or better condition.",
          "Condition is the primary pricing variable across all hoodie sub-types. Ralph Lauren hoodies suffer visible ageing at the cuffs, hem, and chest-logo area — pilling, colour fade, and cuff stretching are the three defects that depress exit price fastest. A hoodie in Very Good condition with no pilling and a crisp logo exits at the €46 category average or above; the same model in Good condition with chest pilling exits at €25–€32. Source aggressively for condition first, brand second.",
        ],
        cta: pricingMidCta("ctr_rl_hoodie_guide_intro_20260916"),
      },
      {
        h: "Buy-below ceiling: what to pay at source to hit 35% gross margin",
        p: [
          "At a €46 average exit price, the buy-below ceiling is €29.90 (€46 × 0.65). This targets a 35% gross margin before Vinted platform fees, typically 5–8% of transaction value on the buyer side. Net of a 6% platform assumption, the actual take on a €46 exit is approximately €43.24, giving a €13.34 net margin on a €29.90 buy — a 44.6% net ROI on capital deployed per hoodie. The practical sourcing target is the €14–€26 range to maintain margin while accounting for condition risk.",
          "Condition tiers shift the ceiling. Excellent or Like New — no pilling, crisp logo, firm cuffs, no odour: buy-below €34.45, targeting a €53 exit. Very Good with light wear, no pilling, minimal cuff wear: buy-below €29.90 at the €46 category average. Good with visible cuff stretch and minor chest pilling: buy-below €18.85, targeting a €29 exit. Fair with heavy pilling, stretched hem, or faded logo: buy-below €11.05 or skip entirely — the €17 exit ceiling at Fair condition barely covers platform fees at typical sourcing prices. Practical sourcing venues: French brocantes, German Kleiderkammer networks, Spanish Wallapop (cross-list to Vinted), and EU thrift chains (Humana, Emmaus) where RL hoodies surface at €6–€18.",
        ],
        cta: pricingBodyCta("ctr_rl_hoodie_buybelo_20260916"),
      },
      {
        h: "Hoodie types and which commands the exit premium on EU Vinted",
        p: [
          "Quarter-zip and half-zip pullovers are the highest-exit sub-type in the Ralph Lauren hoodie category on EU Vinted. The embroidered Polo pony on the chest or the Polo Sport label signals quality to EU buyers who associate the silhouette with 90s American athleticwear. Quarter-zips in French navy, racing green, and burgundy exit at €45–€65; buy-below €40 for these. Stock condition is critical — the zip mechanism must function smoothly, and the sherpa or fleece lining must show no matting. Matted fleece is the single fastest way to lose €15 on a quarter-zip exit.",
          "Classic crew-neck sweatshirts with the embroidered chest pony exit at €28–€45. The top-performing colourways on EU Vinted in September 2026 are French navy, grey marl, and hunter green — colours that align with the casual autumn wardrobe in French and German markets. Logo placement matters: a small left-chest embroidered pony outperforms a large printed graphic on the Vinted platform because the buyer demographic reads the small pony as premium. Large-logo vintage RL sweatshirts are a separate niche — collector demand is real but erratic.",
          `Heavyweight double-knit stadium hoodies — typically identified by the 'Polo' script across the chest or number graphics — exit at €55–€90 for Very Good or better condition. These are slower movers but deliver the highest gross margin per unit at €27.95–€58.50 at the respective buy-below ceilings. Vest-format and gilet RL pieces are tracked within the hoodie category at the edges and exit at €35–€55. Do not mix: a RL puffer vest is not a hoodie and should be listed as outerwear to reach the correct buyer segment. [See full Ralph Lauren brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_rl_hoodie_models_20260916"),
      },
      {
        h: "Ralph Lauren hoodies vs the rest of the RL catalogue: where the money is",
        p: [
          "Within the Ralph Lauren EU Vinted brand catalogue, hoodies and jackets are the two categories worth building a focused sourcing strategy around. Shirts (20 departures in the last 30 days at €28) are structurally oversaturated — 30,000+ active listings competing for 20 weekly watched departures implies a forward supply measured in years. T-shirts (6 departures in the last 30 days at €19) have too low an exit price for meaningful gross margin after fees.",
          "Hoodies generate €920 in weekly revenue at category average (20 × €46) versus shirts' €560 (20 × €28). At the 35% gross margin target, hoodies produce €322/week in gross margin from watched departures; shirts produce €196/week. The ratio is 1.64× in favour of hoodies on a per-category basis. For a reseller managing the Ralph Lauren brand, building hoodie inventory over shirts is the mathematically correct allocation.",
          "Jackets (6 departures in the last 30 days at €56) are the highest per-unit exit in the brand but lowest weekly volume — they are a supplementary category, not a core one. Source RL jackets opportunistically when priced below €36.40 (the buy-below at a €56 exit target), but do not structure a sourcing trip around finding them. The hoodie market at 20 departures in the last 30 days provides the volume for a repeatable sourcing operation.",
        ],
        cta: pricingBodyCta("ctr_rl_hoodie_vs_catalogue_20260916"),
      },
      {
        h: "Ralph Lauren hoodies vs Lacoste and Stone Island: EU Vinted comparison",
        p: [
          "Lacoste hoodies track 9 departures in the last 30 days on EU Vinted at a €49 average exit — less than half Ralph Lauren's volume at a comparable exit price. Ralph Lauren delivers 2.2× more weekly hoodie transactions. Lacoste hoodies are a secondary category for the brand (Lacoste leads in shirts and polos); Ralph Lauren hoodies are the brand's primary value driver on EU Vinted. For a reseller choosing between old-money hoodie categories, Ralph Lauren provides higher throughput at a marginally lower average exit.",
          `Stone Island hoodies are a different market tier entirely — 1323 departures in the last 30 days at €57 average on EU Vinted, making Stone Island the dominant premium hoodie brand on the platform. The entry price for Stone Island hoodies in sourceable condition typically exceeds the buy-below ceiling for Ralph Lauren, making them non-competing sourcing targets. Ralph Lauren hoodies occupy the mid-range (€46 average exit) between Lacoste (€49, lower volume) and Stone Island (€57, far higher volume, higher sourcing cost). For EU resellers building a hoodie inventory on a sourcing budget of €15–€30 per unit, Ralph Lauren is the optimal brand at the mid-range tier. [Check live Ralph Lauren hoodie data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_rl_hoodie_vs_competitors_20260916"),
      },
    ],

    faq: [
      {
        q: "How many Ralph Lauren hoodies sell on EU Vinted per week?",
        a: "Ralph Lauren hoodies track 20 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €46 average exit price. 'Watched departure' means a tracked Ralph Lauren hoodie listing left the shelf — not a confirmed buyer-reported sale. The hoodie category represents 38% of all Ralph Lauren watched departures per week in September 2026, making it the joint-leading category by volume alongside shirts. The broader Ralph Lauren brand tracks 53 departures in the last 30 days at a €36 brand average across five categories: hoodies (20 departures in the last 30 days), shirts (20 departures in the last 30 days at €28), jackets (6 departures in the last 30 days at €56), T-shirts (6 departures in the last 30 days at €19), and sneakers (1 departures in the last 30 days at €5). Weekly counts reflect EU markets including France, Germany, Spain, Italy, and Portugal. ResaleIQ updates these counts weekly from the EU Vinted market dataset.",
      },
      {
        q: "What should I pay for a Ralph Lauren hoodie to make a profit on Vinted?",
        a: "The buy-below ceiling for Ralph Lauren hoodies at the €46 category average exit is €29.90 — that is €46 × 0.65, targeting a 35% gross margin after Vinted platform fees. In practice, the profitable sourcing range is €14–€26 for Very Good condition Ralph Lauren crew-neck or quarter-zip hoodies at French brocantes, German Kleiderkammer networks, Spanish Wallapop, or EU thrift chains. Quarter-zip variants command a higher ceiling: up to €34.45 for near-new condition targeting a €53 exit. Hoodies with heavy chest pilling, stretched cuffs, or faded logos should be sourced below €12 or skipped — the exit range drops to €25–€32 and margin shrinks below the 35% target. Condition is the primary pricing variable; chest pilling and cuff condition are the key defects buyers screen in listing photos.",
      },
      {
        q: "Which Ralph Lauren hoodie type sells for the most on Vinted?",
        a: "On EU Vinted in September 2026, Ralph Lauren quarter-zip and half-zip fleece pullovers command the highest exit prices in the hoodie category, typically €40–€65 in Very Good or better condition. The embroidered Polo pony or Polo Sport label is the key buyer signal on EU Vinted. Classic crew-neck sweatshirts with a small left-chest pony exit at €28–€45 — French navy, grey marl, and hunter green are the strongest-performing colourways in September 2026. Heavyweight double-knit stadium hoodies with 'Polo' script or number graphics exit at €55–€90 for Very Good condition, delivering the highest gross margin per unit. Large-logo printed sweatshirts are slower movers with a narrower collector buyer pool. Avoid: heavily pilled crew-neck hoodies regardless of colourway — exits drop to €18–€28 and rarely justify sourcing above €11.",
      },
      {
        q: "Are Ralph Lauren hoodies worth reselling on EU Vinted?",
        a: "Yes — Ralph Lauren hoodies are one of the stronger mid-range hoodie sourcing categories on EU Vinted in September 2026. The category tracks 20 departures in the last 30 days at €46 average, delivering a gross margin of approximately €16.10 per unit at the €29.90 buy-below ceiling. This is a 35% gross margin target, net approximately 44.6% ROI on capital deployed after platform fees. The category is superior to Ralph Lauren shirts (oversaturated at 30,000+ active listings for 20 departures in the last 30 days) and outperforms Lacoste hoodies on weekly volume (20 vs 9 departures in the last 30 days). The key risk is condition: a pilled or cuff-stretched hoodie sourced above €12 will fall below the margin threshold. Source at €14–€26 for Very Good condition and the category generates consistent margin at a 20-unit-per-week market throughput.",
      },
      {
        q: "How do Ralph Lauren hoodies compare to Stone Island hoodies on Vinted?",
        a: "Stone Island hoodies track 1323 departures in the last 30 days across EU Vinted at a €57 average exit — 16× Ralph Lauren's hoodie volume at a 24% higher exit price. Stone Island is the dominant premium hoodie brand on EU Vinted by a significant margin. The sourcing cost difference is equally stark: sourceable Stone Island hoodies in Very Good condition typically cost €35–€60 at European second-hand markets, compared to €14–€26 for Ralph Lauren. Ralph Lauren hoodies occupy the mid-range tier at €46 average exit — accessible sourcing cost, reliable buyer demand, and a 38% gross margin target at the buy-below ceiling. For resellers with a per-unit sourcing budget of €15–€30, Ralph Lauren is the optimal mid-range hoodie brand on EU Vinted. Stone Island targets a different budget tier and buyer segment.",
      },
    ],
  },
]
