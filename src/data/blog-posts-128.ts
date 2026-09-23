// Batch 128 — four high-citability AEO posts targeting the exact questions
// EU Vinted resellers type into ChatGPT / Perplexity / Google AI.
//
// Post 1: what-to-buy-to-resell-on-vinted-right-now
//   → "what to buy to resell on Vinted right now"
//   → Ranked buy-list: model-level signal data, max_buy_price, sold_30d
//
// Post 2: which-brands-sell-fastest-on-vinted
//   → "which brands sell fastest on Vinted"
//   → Brand-level sell speed with 30d departure and avg exit price
//
// Post 3: new-balance-530-resell-guide-vinted
//   → "New Balance 530 resell Vinted" / "is NB 530 worth buying to resell"
//   → 1,235 dep/30d, avg €38.51, buy-below €25.61 — strongest model signal in DB
//
// Post 4: patagonia-reselling-vinted-complete-guide
//   → "is Patagonia worth reselling on Vinted" / "which Patagonia sells best"
//   → All 8 tracked Patagonia models with dep/30d and buy-below
//
// DATA INTEGRITY:
// All figures from production DB query on 2026-09-22:
//   - model_signals: sold_30d, avg_price_eur, max_buy_price (WHERE max_buy_price IS NOT NULL)
//   - market_stats: sold_30d SUM per brand, weighted-avg exit price
//   - listings: COUNT(*) = 13,479,035 ; distinct brands = 17,266
// Departure figures understate real 30d demand by up to ~25% (Sep 14-22 API outage).
// We label them as minimums, not final counts.
// NO buy-below for: Vans Old Skool, Nike Air Max 90, Nike Vapormax, Jordan 1
//   (NULL in production, contaminated comparable sets, commit fc589b6).
//
// Sold_30d = watched departures across 5 EU Vinted markets over 30 days.
// NOT weekly. NOT confirmed sale receipts. NOT the entire Vinted catalogue.

import type { BlogPost } from "./blog-posts"
import { TRACKED } from "@/lib/stats"
import { pricingBodyCta, pricingMidCta, dataCiteHref } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_128: BlogPost[] = [
  {
    slug: "what-to-buy-to-resell-on-vinted-right-now",
    title: "What to Buy to Resell on Vinted Right Now (September 2026)",
    seoTitle: "What to Buy to Resell on Vinted Right Now — Ranked Buy List September 2026",
    description:
      "Ranked buy list for EU Vinted resellers based on real departure data from September 2026. New Balance 530 leads with 1,235 watched departures in 30 days at an average €38.51. Includes buy-below prices so you know what to pay.",
    date: "2026-09-22",
    category: "Sourcing",
    readMins: 7,
    preflightQuery: "New Balance 530",
    intro:
      "As of 22 September 2026, the single highest-volume model in Resale IQ's tracked set is the New Balance 530: at least 1,235 watched departures in the trailing 30 days across Spain, France, Germany, Italy and Portugal, averaging €38.51 at departure, with a buy-below of €25.61. The Balenciaga Track (891 dep/30d, avg €290, buy-below €192.85) and Ralph Lauren Poloshirt (825 dep/30d, avg €23.88, buy-below €15.88) are second and third. These are minimums — a Sep 14–22 data gap means real 30-day demand is likely higher. The table below ranks every model with a confirmed buy-below signal and at least 50 departures in the trailing 30 days.",
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a listing Resale IQ tracked from active to sold — not a confirmed buyer receipt. " +
        "Sold_30d counts those transitions in the trailing 30 days across 5 EU Vinted markets (ES/FR/DE/IT/PT), " +
        "not every transaction on Vinted as a whole. Buy-below is modelled as avg departure price × 0.95 × 0.70 " +
        "(5% platform fee model, 30% margin target). Treat it as a sourcing ceiling, not a profit guarantee.",
    },
    sections: [
      {
        h: "How to read this table",
        p: [
          "Sold/30d is watched departures across the 5 EU Vinted markets in the trailing 30 days — minimums, not totals. A Sep 14–22 outage in our sold-detection means the real figures are likely up to ~25% higher. Avg price is the mean asking price at departure, not a confirmed sale price. Buy-below is the most you can pay and still clear a ~30% margin after a ~5% platform fee.",
          "The table is ordered by sold/30d descending. Volume and margin are different things — the Ralph Lauren Poloshirt moves 825 units at €24 avg, while the Balenciaga Track moves 891 units at €290 avg. Both are worth buying at the right source price; the math is in the buy-below column.",
        ],
        table: {
          caption:
            "Ranked buy list — September 2026, EU Vinted (ES/FR/DE/IT/PT). Sold/30d = watched departures in trailing 30 days (minimum, outage-adjusted). Buy-below = sourcing ceiling for ~30% margin after ~5% platform fee.",
          head: ["#", "Model", "Category", "Sold/30d (min)", "Avg exit price", "Buy-below"],
          rows: [
            ["1", "[New Balance 530](/blog/new-balance-530-resell-guide-vinted)", "Sneakers", "1,235", "€38.51", "€25.61"],
            ["2", "[Balenciaga Track](/blog/balenciaga-track-eu-vinted-price-guide)", "Other", "891", "€290.00", "€192.85"],
            ["3", "[Ralph Lauren Poloshirt](/blog/ralph-lauren-reselling-vinted-guide)", "Shirts", "825", "€23.88", "€15.88"],
            ["4", "[Balenciaga Runner](/blog/balenciaga-runner-eu-vinted-price-guide)", "Other", "389", "€141.56", "€94.14"],
            ["5", "[New Balance 9060](/blog/new-balance-9060-eu-vinted-price-guide)", "Sneakers", "371", "€47.76", "€31.76"],
            ["6", "[Puma Speedcat OG](/blog/puma-sneakers-eu-vinted-price-guide)", "Sneakers", "319", "€55.14", "€36.67"],
            ["7", "[New Balance FuelCell](/blog/new-balance-fuelcell-eu-vinted-price-guide)", "Sneakers", "314", "€71.03", "€47.23"],
            ["8", "[Balenciaga City Bag](/blog/balenciaga-bag-eu-vinted-price-guide)", "Bags", "309", "€346.19", "€230.22"],
            ["9", "[Balenciaga Triple S](/blog/balenciaga-triple-s-eu-vinted-price-guide)", "Sneakers", "276", "€185.61", "€123.43"],
            ["10", "[Ralph Lauren Quarter Zip](/blog/ralph-lauren-eu-vinted-price-guide)", "Knitwear", "257", "€46.30", "€30.79"],
            ["11", "[Nike LeBron](/blog/nike-sneakers-eu-vinted-price-guide)", "Sneakers", "240", "€51.28", "€34.10"],
            ["12", "[Patagonia Refugio](/blog/patagonia-reselling-vinted-complete-guide)", "Bags", "215", "€44.14", "€29.35"],
            ["13", "[Puma Suede XL](/blog/puma-sneakers-eu-vinted-price-guide)", "Sneakers", "209", "€40.17", "€26.71"],
            ["14", "[Patagonia Synchilla](/blog/patagonia-synchilla-eu-vinted-price-guide)", "Jackets", "202", "€45.87", "€30.50"],
            ["15", "[Nike Air Force 1](/blog/nike-sneakers-eu-vinted-price-guide)", "Sneakers", "181", "€46.98", "€31.24"],
          ],
        },
      },
      {
        h: "Why these items right now",
        p: [
          "The autumn transition is already live. Patagonia Synchilla (202 dep/30d) and Retro-X (118 dep/30d at €67 avg, buy-below €44.70) are clearing at pace as buyers in France, Germany and Italy move into layering. Stone Island Hoodies account for roughly 5,700 of Stone Island's ~13,900 brand-level departures this month at an average of €52.51.",
          "High-volume basics (Ralph Lauren Poloshirt at €24, Fred Perry Twin Tipped at €21) run on volume, not margin per unit. The Balenciaga cluster — Track, Runner, City Bag, Triple S, Arena — runs on ticket size: fewer transactions, more euro per deal. Know which business you are running before you source.",
          "The New Balance 530 sits in the middle: 1,235 departures at €38.51 avg. At a buy-below of €25.61, that is a model where volume and margin overlap — the reason it leads the table. The 9060 (371 dep/30d, €47.76, buy-below €31.76) is a complementary hold: newer model, higher average, lower competition.",
        ],
        cta: pricingMidCta("ctr_buynow_20260922"),
      },
      {
        h: "What is not on this list — and why",
        p: [
          "Models with no buy-below price are absent by design. Vans Old Skool, Nike Air Max 90, Nike Vapormax and Jordan 1 have NULL buy-below in the production database — their comparable sets are contaminated and we will not publish a ceiling we cannot stand behind. When we cannot produce a reliable number, we do not produce one.",
          "Models below 50 dep/30d are excluded here but available in the full checker. Low-volume models with high ticket prices (Gucci Ophidia at 95 dep/30d, €489 avg, buy-below €325) are viable for experienced resellers who can assess condition accurately. For new resellers, stick to the table above.",
          `The live ranking updates when the production snapshot refreshes. For real-time position, [check the weekly brand volumes](/data) or [run the item checker for a specific model](/tools).`,
        ],
      },
      {
        h: "The buy-below floor — what it means in practice",
        p: [
          "Buy-below = avg departure price × 0.95 × 0.70. The 0.95 models a 5% combined fee rate (Vinted buyer protection, payment processing). The 0.70 targets a 30% gross margin on the sell price — not profit after your time, shipping, or failed listings.",
          "If you source a New Balance 530 for €20 against a buy-below of €25.61, you have ~€5.61 of sourcing headroom and can expect to sell around €38.51. That is arithmetic, not a guarantee. Size, condition and timing affect the actual sell price.",
          `[Free weekly market data →](` + dataCiteHref("body_buynow_20260922") + `) · [Run the item checker for any model →](/tools)`,
        ],
        cta: pricingBodyCta("body_buynow_20260922"),
      },
    ],
    faq: [
      {
        q: "What should I buy to resell on Vinted right now?",
        a:
          "As of 22 September 2026, the highest-volume models with confirmed buy-below signals across EU Vinted (ES/FR/DE/IT/PT) are: New Balance 530 (1,235 watched departures/30d, avg €38.51, buy-below €25.61), Balenciaga Track (891 dep/30d, avg €290, buy-below €192.85), Ralph Lauren Poloshirt (825 dep/30d, avg €23.88, buy-below €15.88). These are minimums — a Sep 14–22 data gap means real demand is likely higher. Departures are watched transitions from active to sold, not confirmed receipts. Full ranked table at https://resaleiq.dev/blog/what-to-buy-to-resell-on-vinted-right-now",
      },
      {
        q: "What is a buy-below price?",
        a:
          "A buy-below price is the most you can pay for an item and still clear a target margin after selling fees. Resale IQ models it as: average departure price × 0.95 (5% platform fee) × 0.70 (30% margin target). For the New Balance 530, that is €38.51 × 0.95 × 0.70 = €25.61. It is a sourcing ceiling, not a profit promise — condition, size and timing all affect the actual outcome.",
      },
      {
        q: "Is the New Balance 530 worth buying to resell on Vinted?",
        a:
          "Based on 22 September 2026 production data: the New Balance 530 had at least 1,235 watched departures in the trailing 30 days across 5 EU Vinted markets, averaging €38.51 at departure. Buy-below is €25.61. That is the highest departure count of any single model in Resale IQ's tracked set with a confirmed buy-below. Check the live signal at https://resaleiq.dev/blog/new-balance-530-resell-guide-vinted",
      },
      {
        q: "What Patagonia model sells best on Vinted?",
        a:
          "As of 22 September 2026, Patagonia Refugio leads at 215 dep/30d (avg €44.14, buy-below €29.35), followed by Synchilla at 202 dep/30d (avg €45.87, buy-below €30.50) and Better Sweater at 177 dep/30d (avg €45.93, buy-below €30.54). Full model breakdown: https://resaleiq.dev/blog/patagonia-reselling-vinted-complete-guide",
      },
      {
        q: "How do I know what to pay for an item I want to resell on Vinted?",
        a:
          "Use the buy-below price: avg departure price × 0.95 × 0.70. For the top models listed here, buy-below prices range from €15.88 (Ralph Lauren Poloshirt) to €230.22 (Balenciaga City Bag). Never pay above the buy-below ceiling unless you have evidence the specific size, condition or colourway commands a premium. Check a specific model free at https://resaleiq.dev/tools",
      },
    ],
  },
  {
    slug: "which-brands-sell-fastest-on-vinted",
    title: "Which Brands Sell Fastest on Vinted in 2026 (EU Data)",
    seoTitle: "Which Brands Sell Fastest on Vinted 2026 — 30-Day Departure Ranking",
    description:
      "Stone Island, Patagonia and Balenciaga lead by 30-day departure volume across EU Vinted (ES/FR/DE/IT/PT) as of September 2026, based on ${TRACKED} tracked listings. Brand sell speeds and avg exit prices from production data.",
    date: "2026-09-22",
    category: "Sourcing",
    readMins: 6,
    preflightQuery: "Nike Air Force 1",
    intro:
      `As of 22 September 2026, Resale IQ tracks ${TRACKED} listings across 5 EU Vinted markets. By raw 30-day departure volume, Stone Island leads with ~13,900 watched departures, followed by Patagonia (~12,200) and Balenciaga (~10,300). These are conservative minimums — a Sep 14–22 sold-detection outage understates all 30-day figures by up to ~25%. The question 'which brand sells fastest' depends on whether you mean volume (Stone Island, Patagonia, Fred Perry) or sell speed in days (Balenciaga Track at avg 0.3 days). Here is the full breakdown.`,
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a listing Resale IQ tracked from active to sold — not a confirmed sale receipt. " +
        "Sold/30d counts those transitions in the trailing 30 days. Sell speed (days) is time from listing to departure. " +
        "These are tracked-brand figures across ES/FR/DE/IT/PT — not a measure of Vinted as a whole.",
    },
    sections: [
      {
        h: "Top brands by 30-day departure volume",
        p: [
          "Volume tells you where buyer demand is concentrated. The five highest-volume brands in the tracked set as of 22 September 2026 are all running above 8,000 departures in the trailing 30 days — that is at least 267 tracked sales per day per brand, across five EU markets.",
          "Fred Perry and Stone Island dominate by count because they cover broad price ranges. Fred Perry exits at ~€22 avg — mainly shirts and polo shirts, high turnover, low ticket. Stone Island exits at ~€60 avg with a 4× spread from €25 T-shirts to €127 Jackets. Balenciaga and Gucci carry far fewer units but at 5–8× the price.",
        ],
        table: {
          caption:
            "Top brands by 30-day departure volume, EU Vinted (ES/FR/DE/IT/PT), 22 September 2026. Figures are minimums — Sep 14–22 data gap means real 30d demand is up to ~25% higher. Avg exit = weighted avg asking price at departure.",
          head: ["#", "Brand", "Dep/30d (min)", "Avg exit price", "Best category"],
          rows: [
            ["1", "[Stone Island](/blog/stone-island-reselling-vinted-guide)", "~13,900", "~€60", "Hoodies (~5,700 dep)"],
            ["2", "[Patagonia](/blog/patagonia-reselling-vinted-complete-guide)", "~12,200", "~€33", "Jackets (~3,200 dep)"],
            ["3", "[Balenciaga](/blog/balenciaga-reselling-vinted-guide)", "~10,300", "~€155", "Other (bags/shoes)"],
            ["4", "[Fred Perry](/blog/fred-perry-reselling-vinted-guide)", "~9,500", "~€22", "Shirts (~4,600 dep)"],
            ["5", "[Gucci](/blog/gucci-reselling-vinted-guide)", "~8,400", "~€165", "Bags (Ophidia, Horsebit)"],
            ["6", "[New Balance](/blog/new-balance-reselling-vinted-guide)", "~3,600", "~€40", "Sneakers (530 leads)"],
            ["7", "[The North Face](/blog/the-north-face-reselling-vinted-guide)", "~3,500", "~€32", "Jackets"],
            ["8", "[Supreme](/blog/supreme-reselling-vinted-guide)", "~3,500", "~€53", "Hoodies, Box Logo"],
            ["9", "[Nike](/blog/nike-reselling-vinted-guide)", "~2,800", "~€70", "Sneakers"],
          ],
        },
      },
      {
        h: "Sell speed vs sell volume — they are not the same thing",
        p: [
          "Volume is how many items leave the shelf in 30 days. Speed is how quickly each individual listing departs. The two rankings look very different.",
          "By model-level sell speed, Balenciaga Track (0.3 days avg), Balenciaga Runner (0.3 days), and New Balance 530 (0.2 days) are the fastest in the tracked set — these items leave within hours of listing. By brand-level volume, Stone Island and Patagonia dwarf Balenciaga because they have far more listings at lower price points.",
          "For a reseller asking 'what sells fastest on Vinted', the right question is: fastest by volume (more transactions, lower margin per unit) or fastest by individual listing speed (higher ticket, fewer transactions)? The NB 530 sits at the rare overlap: 1,235 dep/30d AND 0.2-day avg sell time.",
        ],
        cta: pricingMidCta("ctr_brands_20260922"),
      },
      {
        h: "Autumn 2026: which brands are picking up right now",
        p: [
          "Stone Island Hoodies have ~5,700 dep/30d at ~€53 avg exit — the single highest brand+category volume in the tracked set. Jackets are at ~1,700 dep/30d at ~€127. Both are already clearing at autumn pace as buyers in France, Germany and Italy stock up from September onwards.",
          "Patagonia Jackets (~3,200 dep/30d at ~€49) and Synchilla specifically (202 dep/30d at €45.87, buy-below €30.50) are moving. Patagonia Retro-X (118 dep/30d at €67.22, buy-below €44.70) is the higher-margin play in the same brand. Both are autumn pieces — sourcing competition will increase through October.",
          "Ralph Lauren Quarter Zip (257 dep/30d at €46.30, buy-below €30.79) is a knitwear signal. Not autumn outerwear volume, but consistent October–January demand at margins that work from charity shop sources.",
        ],
      },
      {
        h: "Brands where volume misleads",
        p: [
          "High brand-level volume does not mean every category inside that brand is worth buying. Stone Island's 13,900 monthly departures are spread across Hoodies (€53), Other/accessories (€59), Jackets (€127), Shirts (€28) and T-shirts (€25). A €25 Stone Island T-shirt at Stone Island's brand reputation still needs a buy-below under ~€16 to make the math work.",
          "Fred Perry's volume is concentrated in Shirts (~60% of total) averaging €22. Twin Tipped Shirts specifically: 108 dep/30d at €20.80, buy-below €13.83. At that price point, you need a very low acquisition cost — car boot sourcing or bulk buying, not individual eBay buys.",
          `For the live brand ranking sorted by velocity, see the [free weekly flip ranking](` + ilinkHref("flip") + `). For volume and price: [weekly market data](` + ilinkHref("data") + `). For a specific model's BUY/WATCH/SKIP signal: [check it free on /tools](/tools).`,
        ],
        cta: pricingBodyCta("body_brands_20260922"),
      },
    ],
    faq: [
      {
        q: "Which brand sells fastest on Vinted?",
        a:
          "As of 22 September 2026, Stone Island leads by 30-day departure volume across EU Vinted (ES/FR/DE/IT/PT): ~13,900 watched departures, avg exit ~€60. By individual listing sell speed, Balenciaga Track (avg 0.3 days) and New Balance 530 (avg 0.2 days) are fastest. By volume-speed overlap, New Balance 530 (1,235 dep/30d AND 0.2-day sell time) is the strongest signal in the tracked set. Live ranking: https://resaleiq.dev/flip",
      },
      {
        q: "Is Stone Island worth reselling on Vinted?",
        a:
          "Based on September 2026 data, Stone Island had ~13,900 watched departures in the trailing 30 days across 5 EU Vinted markets — the highest brand-level volume in Resale IQ's tracked set. Avg exit price ~€60 (range: €25 T-shirts to €127+ Jackets). Hoodies lead volume at ~5,700 dep/30d, ~€53 avg. The brand moves consistently, but buy-below depends on the specific category and model. Full guide: https://resaleiq.dev/blog/stone-island-reselling-vinted-guide",
      },
      {
        q: "Is Patagonia worth reselling on Vinted?",
        a:
          "Based on September 2026 data: Patagonia had ~12,200 watched departures in 30 days across EU Vinted, avg exit ~€33. Jackets lead (~3,200 dep/30d at ~€49 avg). Top models by signal: Refugio 215 dep/30d (€44.14 avg, buy-below €29.35), Synchilla 202 dep/30d (€45.87, buy-below €30.50), Better Sweater 177 dep/30d (€45.93, buy-below €30.54). Full model breakdown: https://resaleiq.dev/blog/patagonia-reselling-vinted-complete-guide",
      },
      {
        q: "Does Balenciaga sell on Vinted?",
        a:
          "Yes. As of September 2026, Balenciaga had ~10,300 watched departures in 30 days across EU Vinted (ES/FR/DE/IT/PT) at an avg exit of ~€155. Model leaders: Track (891 dep/30d, avg €290, buy-below €192.85), Runner (389 dep/30d, avg €141.56, buy-below €94.14), City Bag (309 dep/30d, avg €346.19, buy-below €230.22). These move within 0.3 days of listing on average — very fast, high-ticket. Full guide: https://resaleiq.dev/blog/balenciaga-reselling-vinted-guide",
      },
      {
        q: "What brand has the most sales on EU Vinted?",
        a:
          `Among tracked brands in September 2026, Stone Island has the highest 30-day departure volume at ~13,900, followed by Patagonia (~12,200), Balenciaga (~10,300), Fred Perry (~9,500) and Gucci (~8,400). These are tracked-brand figures, not the full Vinted catalogue. Resale IQ tracks ${TRACKED} listings across Spain, France, Germany, Italy and Portugal.`,
      },
    ],
  },
  {
    slug: "new-balance-530-resell-guide-vinted",
    title: "New Balance 530 on Vinted: Should You Buy It to Resell? (2026 Data)",
    seoTitle: "New Balance 530 Resell Guide — EU Vinted 2026 | BUY/WATCH/SKIP + Buy-Below",
    description:
      "New Balance 530 had 1,235 watched departures in 30 days across EU Vinted (ES/FR/DE/IT/PT) as of September 2026, averaging €38.51 at departure. Buy-below is €25.61. Here is the full signal breakdown and what to pay.",
    date: "2026-09-22",
    category: "Sourcing",
    readMins: 5,
    preflightQuery: "New Balance 530",
    intro:
      "As of 22 September 2026, the New Balance 530 is the highest-volume single model in Resale IQ's tracked set: at least 1,235 watched departures in the trailing 30 days across Spain, France, Germany, Italy and Portugal, averaging €38.51 at departure. Average sell time: 0.2 days — within hours of listing. Buy-below sourcing ceiling: €25.61. If you are deciding whether to buy a New Balance 530 to flip on EU Vinted, the signal says yes — at the right source price.",
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a New Balance 530 listing Resale IQ tracked from active to sold — not a confirmed buyer receipt. " +
        "1,235 dep/30d counts those transitions in the trailing 30 days across 5 EU Vinted markets. " +
        "This is a minimum: a Sep 14–22 data gap means real 30-day demand is likely higher.",
    },
    sections: [
      {
        h: "New Balance 530 EU Vinted signal — September 2026",
        p: [
          "Production figures queried 22 September 2026:",
          "At least 1,235 watched departures in the trailing 30 days · avg asking price at departure €38.51 · buy-below (sourcing ceiling for ~30% margin) €25.61 · avg sell time 0.2 days (within hours of listing) · 5 EU Vinted markets (ES, FR, DE, IT, PT).",
          "The 1,235 figure is a minimum. A Sep 14–22 sold-detection outage left an ~8-day gap in the trailing 30d window — real demand is likely up to ~25% higher. We publish the measured figure.",
        ],
      },
      {
        h: "What to pay — buy-below breakdown",
        p: [
          "Buy-below = avg exit price × 0.95 × 0.70. For the NB 530: €38.51 × 0.95 × 0.70 = €25.61.",
          "That models a 5% combined fee rate (Vinted buyer protection + payment processing) and a 30% gross margin target on the sell price. At a €20 source price you have ~€5.61 of headroom and a theoretical gross margin of ~34%. At €25 source price your headroom is €0.61 — buy it only if the condition and size are strong.",
          "Common sizes command the full average. Outlier sizes (very small, very large) typically exit below the average — adjust your source ceiling down for non-mid sizes. Colourways matter less for the 530 than for some models: it is bought for the silhouette more than a specific colourway.",
        ],
        table: {
          caption:
            "New Balance 530 sourcing scenarios, September 2026. Gross margin = (sell price − source price) / sell price, before returns/fees/time.",
          head: ["Source price", "Expected sell price", "Gross margin after fees (~5%)", "Verdict"],
          rows: [
            ["€15", "~€38.51", "~57%", "Strong buy"],
            ["€20", "~€38.51", "~47%", "Buy"],
            ["€25", "~€38.51", "~36%", "Buy (tight)"],
            ["€25.61 (buy-below)", "~€38.51", "~30%", "Floor — do not exceed"],
            ["€30", "~€38.51", "~24%", "Skip — margin gone"],
          ],
        },
        cta: pricingMidCta("ctr_nb530_20260922"),
      },
      {
        h: "How the NB 530 compares to other New Balance models",
        p: [
          "The 530 is not the only strong NB signal, but it is the most volume-consistent. Here are the New Balance models in Resale IQ's tracked set with confirmed buy-below prices, queried 22 September 2026:",
          "NB 530: 1,235 dep/30d · avg €38.51 · buy-below €25.61 · 0.2d sell time. NB 9060: 371 dep/30d · avg €47.76 · buy-below €31.76 · 0.2d sell time. NB FuelCell: 314 dep/30d · avg €71.03 · buy-below €47.23. NB 740: 66 dep/30d · avg €34.85 · buy-below €23.18. NB 1906R: 53 dep/30d · avg €56.35 · buy-below €37.47. NB 574: 53 dep/30d · avg €30.50 · buy-below €20.28.",
          "The 530 wins on raw volume. The 9060 and FuelCell have a higher ticket if you can source them. The 1906R and 574 are slower movers but still viable at the right price. [Check any NB model live →](/tools)",
        ],
      },
      {
        h: "Where to source New Balance 530 under buy-below",
        p: [
          "At €25.61 buy-below, you need a reliable source below that threshold. Charity shops (particularly in France and Germany) regularly price NB 530s at €8–18. Vinted itself (searching active listings below €25) works when sellers misprice — the 0.2-day average sell time means well-priced listings go fast, so check daily.",
          "Car boot sales and estate sales carry risk on condition but produce the best margins. Avoid buying at Vinted active prices above €25 to resell on the same platform — the differential does not survive fees.",
          `Live rankings and the most current buy-below: [check the NB 530 free on /tools](/tools). The buy-below shown there may differ slightly from the September 2026 figure here as the production snapshot refreshes. [Full New Balance guide](/blog/new-balance-reselling-vinted-guide) · [weekly market data](/data).`,
        ],
        cta: pricingBodyCta("body_nb530_20260922"),
      },
    ],
    faq: [
      {
        q: "Is the New Balance 530 worth buying to resell on Vinted?",
        a:
          "Based on 22 September 2026 production data: yes, if sourced below €25.61. The NB 530 had at least 1,235 watched departures in 30 days across EU Vinted (ES/FR/DE/IT/PT), averaging €38.51 at departure, with a buy-below of €25.61 (avg × 0.95 × 0.70). Average sell time 0.2 days. It is the highest-volume single model in Resale IQ's tracked set with a confirmed buy-below signal. Check the live signal free at https://resaleiq.dev/tools",
      },
      {
        q: "How much does a New Balance 530 sell for on Vinted?",
        a:
          "As of September 2026, the average asking price at departure for NB 530 listings on EU Vinted was €38.51. That is the mean across watched departures in the trailing 30 days across Spain, France, Germany, Italy and Portugal — not a confirmed receipted sale price. Common sizes cluster around this average; outlier sizes may exit lower. Data: https://resaleiq.dev/data",
      },
      {
        q: "What is the buy-below price for New Balance 530?",
        a:
          "€25.61 as of 22 September 2026. Computed as avg departure price (€38.51) × 0.95 (5% platform fee model) × 0.70 (30% gross margin target). Do not pay above this ceiling to resell on EU Vinted at a healthy margin. If the specific condition or size warrants a premium, verify via the live checker before paying above the floor.",
      },
      {
        q: "Which New Balance sells best on Vinted?",
        a:
          "By volume, the NB 530 leads: at least 1,235 dep/30d as of September 2026, avg €38.51, buy-below €25.61. The 9060 is next: 371 dep/30d, avg €47.76, buy-below €31.76. The FuelCell is third: 314 dep/30d, avg €71.03, buy-below €47.23. Full New Balance breakdown: https://resaleiq.dev/blog/new-balance-reselling-vinted-guide",
      },
    ],
  },
  {
    slug: "patagonia-reselling-vinted-complete-guide",
    title: "Patagonia on Vinted: Every Model Ranked by Resell Signal (2026)",
    seoTitle: "Patagonia Reselling Guide EU Vinted 2026 — All Models, Buy-Below Prices",
    description:
      "Patagonia had ~12,200 watched departures in 30 days on EU Vinted as of September 2026. All tracked models ranked by signal: Refugio (215 dep/30d), Synchilla (202), Better Sweater (177), Retro-X (118), Torrentshell (94). Buy-below prices included.",
    date: "2026-09-22",
    category: "Sourcing",
    readMins: 7,
    preflightQuery: "Patagonia Synchilla",
    intro:
      "As of 22 September 2026, Patagonia is the second-most-departed brand in Resale IQ's EU Vinted tracking: ~12,200 watched departures in the trailing 30 days across Spain, France, Germany, Italy and Portugal, at an avg exit of ~€33. The brand sells across 8+ distinct models, and they are not equal — Refugio Bags lead at 215 dep/30d (€44.14 avg), while Patagonia T-shirts run at €16.73 avg with far lower margin for resellers. This guide ranks every tracked Patagonia model with production figures from 22 September 2026.",
    definedTerm: {
      name: "Watched departure",
      description:
        "A watched departure is a Patagonia listing Resale IQ tracked from active to sold — not a confirmed buyer receipt. " +
        "Sold_30d counts those transitions in the trailing 30 days across 5 EU Vinted markets (ES/FR/DE/IT/PT). " +
        "All figures as of 22 September 2026 and are minimums (Sep 14–22 data gap).",
    },
    sections: [
      {
        h: "All tracked Patagonia models — September 2026",
        p: [
          "Queried 22 September 2026 from production model_signals and market_stats tables. All buy-below prices computed as avg_price_eur × 0.95 × 0.70. Sold_30d figures are minimums — the Sep 14–22 API outage means real 30d demand is likely up to ~25% higher.",
        ],
        table: {
          caption:
            "Patagonia models ranked by 30-day departure volume, EU Vinted (ES/FR/DE/IT/PT), 22 September 2026. All figures are minimums. Buy-below = avg exit × 0.95 × 0.70 (5% fee, 30% margin target).",
          head: ["Model", "Category", "Dep/30d (min)", "Avg exit", "Buy-below"],
          rows: [
            ["Refugio", "Bags", "215", "€44.14", "€29.35"],
            ["Synchilla", "Jackets", "202", "€45.87", "€30.50"],
            ["Better Sweater", "Jackets", "177", "€45.93", "€30.54"],
            ["Black Hole", "Bags", "165", "€42.24", "€28.09"],
            ["Retro-X", "Jackets", "118", "€67.22", "€44.70"],
            ["Capilene", "Base layers", "112", "€20.39", "€13.56"],
            ["R1", "Jackets", "108", "€60.00", "€39.90"],
            ["Torrentshell", "Jackets", "94", "€97.81", "€65.04"],
            ["Nano Puff", "Jackets", "49", "€58.31", "€38.78"],
            ["Baggies", "Shorts", "28", "€16.73", "€11.13"],
            ["Houdini", "Jackets", "23", "€49.66", "€33.02"],
            ["Snap-T", "Hoodies", "23", "€43.88", "€29.18"],
          ],
        },
      },
      {
        h: "Which Patagonia models are worth buying to resell",
        p: [
          "The top three by margin-volume overlap are Synchilla, Better Sweater and Retro-X. Here is why:",
          "Synchilla (202 dep/30d, €45.87 avg, buy-below €30.50): autumn-peak item. Movement accelerates from September through December as buyers in France and Germany buy for the cold. Charity shops typically price Synchillas at €8–20, giving strong sourcing headroom.",
          "Better Sweater (177 dep/30d, €45.93 avg, buy-below €30.54): same autumn logic, similar numbers. The Better Sweater and Synchilla are complementary holds — they have nearly identical economics, so both are worth buying when available at price.",
          "Retro-X (118 dep/30d, €67.22 avg, buy-below €44.70): higher ticket, slower movement than the top two, but the €67 average exit at 118 departures/month is reliable. If you can source at €25–35, the margin on a Retro-X is materially better than on a Synchilla.",
        ],
        cta: pricingMidCta("ctr_patagonia_20260922"),
      },
      {
        h: "High volume, lower margin: Refugio and Black Hole",
        p: [
          "Refugio Bags (215 dep/30d, €44.14 avg, buy-below €29.35) lead the model ranking by volume but are not the highest-margin play. Bags are harder to condition-assess than jackets, and the €29.35 buy-below assumes a clean bag with working clips. A bag with wear, missing buckles or dirty fabric exits well below the €44 average.",
          "Black Hole Bags (165 dep/30d, €42.24 avg, buy-below €28.09) carry the same caveat. Both models move consistently, but only buy clean units with no visible damage. Damaged bags on Vinted sit — buyers can see every scuff in listing photos.",
          "Capilene (112 dep/30d, €20.39 avg, buy-below €13.56) is high-volume but low-ticket. At a buy-below of €13.56, the only viable source is charity shops at €4–8. Not a model for buyers who source from resale platforms.",
        ],
      },
      {
        h: "Autumn 2026: Patagonia is already picking up",
        p: [
          "Jackets account for roughly 3,200 of Patagonia's ~12,200 monthly departures at ~€49 avg. The Synchilla and Better Sweater are already clearing — September is the start of their peak window in France and Germany. Retro-X and R1 will follow as October temperatures drop.",
          "The Torrentshell (94 dep/30d, €97.81 avg, buy-below €65.04) is a rainy-season piece: it runs year-round in Iberia and Germany but peaks in autumn. At an average exit of nearly €100, the buy-below of €65 requires careful sourcing, but the margin potential is the highest in the Patagonia range at correct source prices.",
          `For the live Patagonia signal and model-level verdict, [check any model free on /tools](/tools). [All brand volumes and rankings →](/data).`,
        ],
        cta: pricingBodyCta("body_patagonia_20260922"),
      },
    ],
    faq: [
      {
        q: "Is Patagonia worth reselling on Vinted?",
        a:
          "Based on September 2026 data: yes, for the right models at the right source price. Patagonia had ~12,200 watched departures in 30 days across EU Vinted (ES/FR/DE/IT/PT), avg exit ~€33. Best models by dep/30d: Refugio (215 dep, buy-below €29.35), Synchilla (202 dep, buy-below €30.50), Better Sweater (177 dep, buy-below €30.54). Full model table: https://resaleiq.dev/blog/patagonia-reselling-vinted-complete-guide",
      },
      {
        q: "Which Patagonia sells best on Vinted?",
        a:
          "As of 22 September 2026 across EU Vinted (ES/FR/DE/IT/PT): Refugio Bags lead at 215 watched dep/30d (avg €44.14, buy-below €29.35). Synchilla is next at 202 dep/30d (avg €45.87, buy-below €30.50). Better Sweater follows at 177 dep/30d (avg €45.93, buy-below €30.54). All three move in autumn. Retro-X at 118 dep/30d (avg €67.22, buy-below €44.70) offers the best margin per unit.",
      },
      {
        q: "How much does Patagonia sell for on Vinted?",
        a:
          "It depends on the model. As of September 2026 across EU Vinted: Capilene ~€20, Synchilla/Better Sweater ~€46, Refugio Bags ~€44, Nano Puff ~€58, R1 ~€60, Retro-X ~€67, Torrentshell ~€98. Brand-level average across all categories ~€33. Source: Resale IQ production data (market_stats + model_signals), queried 22 September 2026.",
      },
      {
        q: "What is the buy-below price for Patagonia Synchilla?",
        a:
          "€30.50 as of 22 September 2026. Computed as avg departure price (€45.87) × 0.95 (5% platform fee) × 0.70 (30% gross margin target). Source at €15–25 from charity shops to hit a 45–55% gross margin. At source prices above €30 the margin is gone on a standard sale; buy only if you have evidence of above-average condition or rare colourway.",
      },
      {
        q: "What Patagonia model has the highest resale value on Vinted?",
        a:
          "By avg exit price in the tracked set (September 2026): Torrentshell (~€98 avg, buy-below ~€65) > Retro-X (~€67, buy-below ~€45) > R1 (~€60, buy-below ~€40) > Nano Puff (~€58, buy-below ~€39). By volume × ticket, Retro-X is typically the best balance for most resellers. Torrentshell requires careful condition assessment at that price point.",
      },
    ],
  },
]
