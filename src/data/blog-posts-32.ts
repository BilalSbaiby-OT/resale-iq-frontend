// Batch 32 of SEO/AEO articles. Same contract as blog-posts.ts.
// Patagonia jacket EU Vinted price guide — targets "patagonia vinted eu price",
// "patagonia jacket resell vinted", "patagonia synchilla price vinted",
// "patagonia better sweater vinted eu", "patagonia retro x vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_32: BlogPost[] = [
  {
    slug: "patagonia-jacket-price-guide-eu-vinted",
    title: "Patagonia Jacket Price Guide for EU Vinted (2026 Data)",
    seoTitle: "Patagonia Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "What Patagonia jackets actually sell for on EU Vinted in 2026: Synchilla, Better Sweater, Retro-X, Torrentshell, R1, Nano Puff. Real departure averages, size-level buy-below prices, and weekly volume across 9 tracked models.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 9,
    intro:
      "Patagonia is one of the most reliably traded outerwear brands on EU Vinted, with over 1,000 watched departures per month across 9 tracked models as of September 2026. The brand spans three distinct tiers: volume fleeces (Synchilla, Better Sweater), premium hardshells (Torrentshell, R1), and high-margin collector pieces (Retro-X). Unlike fast-fashion, Patagonia's lifetime guarantee and repair culture means buyers on Vinted expect and tolerate wear — which creates a lower condition floor than sneakers and a bigger sourcing window. This guide breaks down departure data, size-level buy-below prices, and sourcing priorities across the Patagonia EU Vinted catalogue.",
    definedTerm: {
      name: "Patagonia jacket departure average",
      description:
        "The Patagonia jacket departure average is the average price at which a tracked Patagonia jacket listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of September 2026, the departure average across 9 tracked Patagonia jacket and fleece models ranges from €21 (Capilene baselayer) to €95 (Torrentshell hardshell). Individual model averages are sourced from observed departures across France, Germany, Spain, Italy, and Portugal.",
    },
    sections: [
      {
        h: "Patagonia on EU Vinted: brand overview",
        p: [
          "Patagonia is tracked across 9 models in the ResaleIQ EU Vinted database. Combined, these models account for roughly 1,100 watched departures per month — making Patagonia the highest-volume non-footwear brand in the database. The brand's wide price range (€21–€95 average exit) means sourcing strategy differs significantly between model tiers.",
          "The fleece segment (Synchilla, Better Sweater, Snap-T, R1) drives volume. The hardshell segment (Torrentshell, Houdini) delivers higher exit prices. The Retro-X fleece occupies a premium tier with the highest average exit price in the jacket category. Bags (Black Hole, Refugio) are high-volume but operate differently — treated as gear, not apparel.",
          `Patagonia's repair culture and Worn Wear programme mean buyers accept visible patching and repairs, which makes sourcing heavily worn items viable where other brands would price-penalise. [Current Patagonia brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_patagonia_guide_intro_20260915"),
      },
      {
        h: "Synchilla fleece: highest jacket departure volume",
        p: [
          "The Synchilla is Patagonia's highest-departure jacket by monthly volume: 216 watched departures in the last 30 days at a €51.80 average exit price. Weekly volume runs at 47 departures — more than any other Patagonia model. Buy-below ceiling at the brand level is €34.45.",
          "Size matters significantly here. Size-level data from EU Vinted shows S exits at a €54.76 average (buy-below €36.42) while XS exits lower at €36.27 (buy-below €24.12). XL exits at €41.62 (buy-below €27.68). The practical implication: an S-size Synchilla at €20 at a charity shop is well inside the buy-below ceiling; an XS at the same price only breaks even.",
          "The Synchilla is a volume play, not a margin play. At 47 departures per week, finding one is not hard — but sourcing profitably requires knowing the size ceiling. The most common EU Vinted sizes (M, S, L) all have workable buy-below prices.",
        ],
      },
      {
        h: "Better Sweater: the reliable workhorse",
        p: [
          "The Better Sweater (fleece, not knit) is Patagonia's second-highest departure model: 181 watched departures in 30 days at a €40.91 average. Buy-below ceiling: €27.21. Weekly volume: 27 departures.",
          "Size-level breakdown: XL exits highest at €46.10 (buy-below €30.66), M at €47.06 (buy-below €31.29), XXL at €43.70 (buy-below €29.06). S drops to €38.25 (buy-below €25.44). L exits at €43.00 (buy-below €28.59). Larger sizes exit at a small premium — likely because the Better Sweater skews male and larger male sizes see less charity-shop churn.",
          "The Better Sweater is slightly lower-margin than Synchilla but highly liquid. At 27 departures per week it turns quickly. Sourcing below €18 in any size secures margin at the worst-case exit price.",
        ],
        cta: pricingBodyCta("ctr_patagonia_guide_better_sweater_20260915"),
      },
      {
        h: "Retro-X: the premium Patagonia pick",
        p: [
          "The Retro-X is the highest average-exit Patagonia jacket in the database: €78.30 average, buy-below €52.07, 127 watched departures in 30 days. Weekly volume: 22 departures.",
          "Size data is directionally clear: M exits at €97.13 average (buy-below €64.59) — notably above the brand average. S exits at €70.00 (buy-below €46.55). L at €86.67 (buy-below €57.64). The M-size premium is likely driven by scarcity in a popular colourway pool. At €97 average exit, an M-size Retro-X sourced below €50 at a car boot or flea market is well within buy-below range.",
          "The Retro-X is the highest-margin Patagonia opportunity but requires knowing authentic colourways — the teal/tan and brown/cream iterations command premiums; black is liquid but priced lower. Older pull-through-zip versions (pre-2015) can command premiums if condition is good.",
        ],
      },
      {
        h: "R1 and Torrentshell: performance tier",
        p: [
          "The R1 fleece exits at €63.22 average (buy-below €42.04, 126 departures/month). Size data: L exits at €70.88 (buy-below €47.14), M at €61.43 (buy-below €40.85), S at €65.00 (buy-below €43.22). The R1 is a technical baselayer — buyers know exactly what they want, which compresses the condition tolerance vs. lifestyle fleeces.",
          "The Torrentshell 3L hardshell exits at the highest average of all Patagonia models: €94.57, buy-below €62.89, 117 departures/month. S exits at €113.33 (buy-below €75.36) — a significant premium. M at €95.06 (buy-below €63.21), L at €88.55 (buy-below €58.89). Small Torrentshells are consistently above the brand average — source them aggressively under €60.",
          "The Nano Puff exits at €58.00 average (buy-below €38.57, 53 departures/month). It's more size-variable than fleeces. Best opportunity is sourcing S or XS Nano Puffs (often sold cheaply because the original owner lost weight); they still exit at a reasonable price.",
        ],
        cta: pricingBodyCta("ctr_patagonia_guide_hardshell_20260915"),
      },
      {
        h: "Patagonia bags: Refugio and Black Hole",
        p: [
          "The Refugio backpack (26L/30L) is Patagonia's highest-volume non-jacket item: 223 watched departures in 30 days at a €44.09 average, buy-below €29.32. Unlike jackets, sizing matters less here — colour and condition drive price variance. Popular colourways (navy, forest green, sage) exit near average. Rips in main fabric or broken zips reduce value significantly.",
          "The Black Hole duffel exits at €37.91 average (buy-below €25.21, 186 departures/month). Buy-below is modest but volume is reliable. A clean Black Hole at €10 from a charity shop exits at average; a scuffed one does not.",
          "Bags are harder to source profitably than jackets because they are more commoditised. Focus Patagonia sourcing on jackets first; bags when volume sourcing allows.",
        ],
      },
      {
        h: "Patagonia vs The North Face and Stone Island on EU Vinted",
        p: [
          "Patagonia vs The North Face: TNF Summit Series exits at €96.49 (buy-below €64.17, 26 departures/month) — higher exit but far lower volume than Patagonia's top models. TNF is harder to find in sourcing and exits less predictably. Patagonia offers both volume (Synchilla, Better Sweater) and margin (Retro-X, Torrentshell).",
          "Patagonia vs Stone Island: Stone Island exits at €150+ average — dramatically higher ceiling — but with 20–30 departures/month vs Patagonia's 100–200. Stone Island is a specialist play; Patagonia is a generalist volume strategy. Different buyer pools, different sourcing channels.",
          `Patagonia vs Arc'teryx: Arc'teryx is not in the tracked database — too few EU Vinted departures to build a reliable signal. The brand exits high on specialist platforms but is not liquid enough on EU Vinted to source for. [See all tracked EU brands →](${ilinkHref("data")})`,
        ],
      },
    ],
    faq: [
      {
        q: "What is the average price for a Patagonia jacket on EU Vinted?",
        a: "It depends on the model. The Torrentshell 3L hardshell exits at the highest average: €94.57 as of September 2026. The Retro-X fleece averages €78.30. Mid-range fleeces (R1 €63.22, Better Sweater €40.91, Synchilla €51.80) cover the mainstream. The Nano Puff averages €58. Bags run €38–44. All figures are watched departure averages from EU Vinted markets (France, Germany, Spain, Italy, Portugal).",
      },
      {
        q: "Which Patagonia model sells best on Vinted?",
        a: "By volume, the Synchilla leads with 216 watched departures in 30 days and 47 departures per week. The Better Sweater (181/month), Black Hole bag (186/month), and Refugio bag (223/month) are also high-volume. By margin potential, the Retro-X (€78 average exit) and Torrentshell S (€113 average exit) offer the best buy-below headroom if sourced cheaply.",
      },
      {
        q: "What sizes are best to source for Patagonia on EU Vinted?",
        a: "For the Synchilla: S exits at €54.76 — source S preferentially over XS (€36.27). For the Better Sweater: XL and M exit highest at €46–47. For the Torrentshell: S exits at €113 vs €88 for L — S is meaningfully more valuable. For the Retro-X: M exits at €97 vs €70 for S. Size premiums vary by model so check per-model data before sourcing.",
      },
      {
        q: "Does condition matter for Patagonia resale on Vinted?",
        a: "Less than for most brands. Patagonia's lifetime guarantee and Worn Wear culture mean buyers accept visible repairs, pilling, and wear. A Synchilla with moderate pilling still exits near the average. More important than condition is colourway — discontinued or limited-run colours can exit 15–25% above the departure average even in tired condition. For hardshells (Torrentshell), delamination matters and should be disclosed.",
      },
      {
        q: "What is the buy-below price for a Patagonia Synchilla?",
        a: "The overall buy-below for the Synchilla on EU Vinted is €34.45 (65% of the €51.80 departure average). Size matters: S buy-below is €36.42, M is €30.70, XL is €27.68, XS is €24.12. Sourcing below the size-appropriate buy-below provides margin after Vinted's seller fee and shipping costs.",
      },
      {
        q: "Are Patagonia bags worth sourcing on EU Vinted?",
        a: "They can be, but margins are tighter than jackets. The Refugio exits at €44.09 (buy-below €29.32) and the Black Hole at €37.91 (buy-below €25.21). Volume is reliable but condition is more binary — a damaged bag does not recover to average the way a pilled fleece does. Prioritise jackets for margin; take bags when sourcing volume allows.",
      },
    ],
  },
]
