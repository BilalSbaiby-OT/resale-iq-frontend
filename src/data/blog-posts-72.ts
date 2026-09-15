// Batch 72 of SEO/AEO articles. Same contract as blog-posts.ts.
// Adidas Samba EU Vinted price guide — targets
// "adidas samba vinted price", "adidas samba eu vinted price guide",
// "adidas samba buy below vinted", "adidas samba resell value europe",
// "adidas samba vinted 2026", "adidas samba vinted worth it",
// "adidas samba og vinted price", "adidas samba size guide vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_72: BlogPost[] = [
  {
    slug: "adidas-samba-eu-vinted-price-guide",
    title: "Adidas Samba on EU Vinted: Price Guide, Buy-Below and Oversupply Warning (2026 Data)",
    seoTitle: "Adidas Samba Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Adidas Samba tracked 6 watched departures per week on EU Vinted in September 2026 against 27,338 active listings — a 210-month supply overhang that makes standard Sambas a SKIP for most resellers. Buy-below ceiling €31.93. Size 41 exits at €82 average — the one size where the economics still work. Samba OG exits higher at €60.61 (3/7d). Full size-level data, oversupply context, and the Adidas models that outperform the Samba on EU Vinted right now.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,

    preflightQuery: "Adidas Samba",
    intro:
      "The Adidas Samba is EU Vinted's most searched sneaker — and the one resellers most frequently get burned by. In the week to 15 September 2026, ResaleIQ tracked 6 watched departures of the Adidas Samba across EU Vinted against 27,338 active listings. That is 210 months of supply at current departure rates. The average exit price is €48.01, with a buy-below ceiling of €31.93 — but finding a Samba under €32 at a charity shop that you can reliably exit at the average is harder than it sounds with that much competition. The exception is size 41: buyers in that size pay a €82 average and sourcing ceiling rises to €54.53. This guide gives you the full Samba data for September 2026, explains why the oversupply exists, where the exceptions are, and which Adidas models are better sourcing targets right now.",
    definedTerm: {
      name: "Adidas Samba departure average",
      description:
        "The Adidas Samba departure average is the average price at which a tracked Adidas Samba listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, Adidas Samba tracks 6 watched departures per week across France, Germany, Spain, Italy, and Portugal at a €48.01 average exit price, with 27,338 active listings. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The buy-below ceiling at category level is €31.93 — the maximum sourcing price that keeps gross margin positive after Vinted's seller protection fee, targeting a 35% gross margin. The Samba OG variant tracks separately at 3 watched departures per week at a €60.61 average, with a buy-below of €40.31. The best-performing EU market for Samba exits is Germany.",
    },
    sections: [
      {
        h: "Adidas Samba on EU Vinted: the oversupply problem",
        p: [
          "The Adidas Samba's Vinted resale story is straightforward: massive cultural popularity driving record retail production has created an oversaturated secondary market. As of September 2026, there are 27,338 active Adidas Samba listings on EU Vinted. The platform is clearing 6 of them per week in ResaleIQ's tracked data. That is 210 months of supply — the longest supply tail of any sneaker in our EU Vinted database at this volume level.",
          "The practical result: listing a Samba at the €48 average is not a guarantee of a quick sale. Your listing is competing with thousands of others. The Sambas that clear are the ones at the lowest price in the size, in the best condition, with the clearest photography. The ones that do not clear sit active for weeks, then get repriced down. This dynamic explains why the Samba appears frequently on EU Vinted — buyers are everywhere — but the departure rate is low relative to supply.",
          `The ResaleIQ verdict on the Adidas Samba is currently SKIP for standard resale sourcing — the opportunity score of 11.3/100 reflects the supply overhang and DEAD momentum trajectory. That is the correct assessment for a general sourcing strategy. The exceptions are specific: size 41 and certain colourways where size scarcity creates a different market. [See current Samba data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_adidas_samba_oversupply_20260915"),
      },
      {
        h: "Adidas Samba departure data: September 2026",
        p: [
          "ResaleIQ tracked the following Adidas Samba EU Vinted data in the 7 days to 15 September 2026:",
          "Category average exit: €48.01. Median exit: €39.00 — the €9 gap between mean and median indicates a right tail, where a small number of premium colourways and rare sizes pull the average up. If you are sourcing a standard white/black or black/white Samba, the €39 median is the more realistic exit target than the €48 average.",
          "The best-performing EU market for Samba exits is Germany. French and Spanish markets tend to exit below category average; German buyers pay closer to the mean. If you are cross-border selling, routing German-market listings first is the priority.",
          "Active listings: 27,338. Comparable sales (comparable_n): 63 over the tracking period. Months supply: 210. Speed score: 9.2/100 — the lower the score, the slower the exit relative to comparable items.",
        ],
        table: {
          caption: "Adidas Samba EU Vinted data — week to 15 Sep 2026",
          head: ["Metric", "Samba", "Samba OG"],
          rows: [
            ["Watched departures/7d", "6", "3"],
            ["Average exit price", "€48.01", "€60.61"],
            ["Median exit price", "€39.00", "€60.00"],
            ["Buy-below ceiling", "€31.93", "€40.31"],
            ["Active listings", "27,338", "3,082"],
            ["Months supply", "210", "67"],
            ["Best EU market", "Germany", "Spain"],
            ["Momentum", "DEAD", "DEAD"],
          ],
        },
      },
      {
        h: "Size-level buy-below prices: where the Samba economics work",
        p: [
          "The category-level buy-below of €31.93 is the floor — but size-level data tells a more nuanced story. Adidas Sambas exit at significantly different prices by size, creating targeted sourcing opportunities that the category average hides.",
          "Size 41 is the stand-out: 3 exits at an average of €82.00 over the tracking period, with a buy-below ceiling of €54.53. Buyers paying €82 for a Samba in size 41 are likely seeking a specific colourway or the OG version in that size — supply scarcity for larger EU men's sizes drives the premium. If you find a clean Samba in size 41 priced under €54, the economics work regardless of the oversupply at the category level.",
          "Size 39 exits at an average of €60.27 with a buy-below of €40.08. Sizes 38 and 40 cluster near or below the general category average; size 37 is the weakest exit at €30.52 average. The practical rule: prioritise sizes 39 and above when sourcing Sambas — exit prices are meaningfully higher and buy-below ceilings are more achievable at charity-shop sourcing levels.",
        ],
        table: {
          caption: "Adidas Samba EU Vinted size-level data — Sep 2026",
          head: ["Size", "Avg exit price", "Buy-below ceiling", "Sample (n)"],
          rows: [
            ["37", "€30.52", "€20.30", "12"],
            ["38", "€55.01", "€36.58", "10"],
            ["39", "€60.27", "€40.08", "13"],
            ["40", "€33.44", "€22.24", "4"],
            ["41", "€82.00", "€54.53", "3"],
            ["42.5", "€64.50", "€42.89", "4"],
          ],
        },
      },
      {
        h: "Samba OG vs Samba: which to source",
        p: [
          "The Samba OG is a distinct model from the standard Samba — it carries the original gum-sole construction, a slightly different last, and the authentic 1950s silhouette versus the more lifestyle-oriented standard Samba. On EU Vinted, the Samba OG exits at €60.61 average versus €48.01 for the standard, with a buy-below ceiling of €40.31.",
          "The supply overhang is less severe on the OG: 3,082 active listings versus 27,338 for the standard, giving 67 months of supply versus 210. That is still elevated, but significantly less saturated. If a source has both variants priced identically, always take the OG.",
          "Authentication is the critical skill: at a charity shop, the OG and standard Samba look similar to non-specialists. The OG has a thicker gum sole, a slightly lower profile, and 'OG' text on the heel. Verify before pricing as standard — a correct OG identification at a charity shop priced at €5–8 gives you a €60+ exit asset versus a €30–40 one.",
          `[Check current Samba and Samba OG departure data →](${ilinkHref("data")})`,
        ],
        cta: pricingMidCta("ctr_adidas_samba_og_20260915"),
      },
      {
        h: "Better Adidas sourcing alternatives: Handball Spezial and Stan Smith",
        p: [
          "If you want Adidas exposure on EU Vinted, the Samba is not the best model to focus on in September 2026. Two models significantly outperform it on the criteria that matter for resellers:",
          "The Handball Spezial is the highest-volume Adidas model in our tracked data: 12 watched departures per week at a €79.38 average exit, with a buy-below of €52.79. The supply situation is entirely different — active listings are manageable, the STABLE momentum label means the model is holding its exit price without declining, and the exit average is 65% higher than the Samba's. Size 39 and 38 dominate volume, both with strong exits. The Handball Spezial is harder to find at charity shops than the Samba — precisely because it has not been mass-produced at the same scale — but that scarcity is what makes it a better sourcing target.",
          "The Stan Smith exits at the highest Adidas average tracked: €84.14 with 7 watched departures per week and RISING momentum. The white/green OG colourway is liquid and consistently demanded; supply is present at charity shops across EU without the extreme saturation of the Samba. Buy-below ceiling €55.95.",
          "Neither the Handball Spezial nor the Stan Smith generates the social-media recognition of the Samba — but on EU Vinted, resale buyers are spending real money, not looking for hype signals. The Handball Spezial and Stan Smith convert at higher prices with healthier supply dynamics.",
        ],
        table: {
          caption: "Adidas EU Vinted model comparison — week to 15 Sep 2026",
          head: ["Model", "Departures/7d", "Avg exit", "Buy-below", "Momentum"],
          rows: [
            ["Handball Spezial", "12", "€79.38", "€52.79", "STABLE"],
            ["Stan Smith", "7", "€84.14", "€55.95", "RISING"],
            ["Gazelle Indoor", "4", "€58.00", "€38.57", "RISING"],
            ["Samba OG", "3", "€60.61", "€40.31", "DEAD"],
            ["Samba", "6", "€48.01", "€31.93", "DEAD"],
            ["Campus 00s", "4", "€37.99", "€25.26", "DEAD"],
          ],
        },
      },
      {
        h: "When Samba sourcing still makes sense",
        p: [
          "Despite the SKIP verdict and oversupply, Adidas Sambas still make sense to source in three scenarios. First: size 41 sourced under €54.53 — the size-specific buy-below creates a defensible margin even with the category's supply overhang. Second: Samba colourway arbitrage — specific limited colourways (Wales Bonner, Humanrace, Patta) exit at €150–300 when correctly identified, and charity-shop sources that mislabel them as generic Sambas are the opportunity. Identification requires knowing the specific colourway details; a basic eye for unusual Samba colourways with a label check is enough. Third: standard colourways at deeply discounted sourcing levels below €15, where even a €35–40 median exit gives a positive margin.",
          "The common mistake is buying a standard Samba in a common size (38, 40) at €20–30 from another reseller or at a curated vintage shop, then being surprised that it exits at €35–40 after platform fees rather than the €48 category average. The category average includes premium colourways and rare sizes that distort the mean. For standard colourways in common sizes, the realistic exit is the €39 median — plan buy-below around that figure.",
          `ResaleIQ's Deal Scanner surfaces the current Samba buy-below ceiling alongside all other EU Vinted models in real time. For size-specific prices and the current opportunity score across all Adidas models, the full data is in the app. [See Adidas model data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_adidas_samba_bottom_20260915"),
      },
    ],
    faq: [
      {
        q: "What is the Adidas Samba average price on EU Vinted in 2026?",
        a: "The Adidas Samba averages €48.01 per departure on EU Vinted as of September 2026, with a median exit of €39.00. The gap reflects premium colourways and rare sizes (especially size 41 at €82 average) pulling up the mean. For standard colourways in common sizes (38, 40), plan exits around the €39 median.",
      },
      {
        q: "What is the Adidas Samba buy-below price for EU Vinted resellers?",
        a: "The category-level buy-below ceiling is €31.93 — the maximum sourcing price that maintains a positive gross margin at the €48 category average after Vinted's platform fee. For size 41 specifically, the buy-below rises to €54.53. For size 39, it is €40.08. For size 37, it drops to €20.30.",
      },
      {
        q: "Is the Adidas Samba oversaturated on Vinted?",
        a: "Yes. As of September 2026, there are 27,338 active Samba listings on EU Vinted clearing 6 departures per week — 210 months of supply. This is the longest supply tail in ResaleIQ's EU sneaker database at this volume level. The Samba is a cultural phenomenon in streetwear, but the resale market is saturated by the same retail production volume that makes it popular.",
      },
      {
        q: "Adidas Samba or Handball Spezial: which is better to resell on EU Vinted?",
        a: "Handball Spezial by every metric: 12 watched departures per week (vs 6 for Samba), €79.38 average exit (vs €48.01), STABLE momentum (vs DEAD), and far fewer competing listings. The Handball Spezial is the better sourcing target in September 2026.",
      },
      {
        q: "How many Adidas Sambas are active on EU Vinted right now?",
        a: "ResaleIQ tracked 27,338 active Adidas Samba listings on EU Vinted as of 15 September 2026. At the current departure rate of 6 per week, clearing the full active supply would take 210 months.",
      },
    ],
  },
]
