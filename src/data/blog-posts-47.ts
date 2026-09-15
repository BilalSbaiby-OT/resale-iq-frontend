// Batch 47 of SEO/AEO articles. Same contract as blog-posts.ts.
// Adidas Gazelle EU Vinted price guide — targets
// "adidas gazelle vinted price", "adidas gazelle eu vinted price guide",
// "adidas gazelle resell value europe", "is adidas gazelle worth reselling vinted",
// "adidas handball spezial vinted eu price", "adidas sneakers buy below vinted eu".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_47: BlogPost[] = [
  {
    slug: "adidas-gazelle-eu-vinted-price-guide",
    title: "Adidas Gazelle on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Adidas Gazelle Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Adidas sneakers track 45 watched departures per week across EU Vinted in September 2026 at a €60 average exit price. Real exit ranges by model (Gazelle Indoor, Handball Spezial, Samba, Stan Smith), buy-below ceilings by size, RISING momentum signals, and how to source Adidas trainers profitably across France, Germany, Spain, and Italy.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,
    intro:
      "Adidas sneakers track 45 watched departures per week across EU Vinted in the week to 15 September 2026 at a €60 average exit price — the single highest-volume trainer category in our EU dataset, ahead of Nike Air Force 1 (38/7d, €52 avg) and Jordan 3 (29/7d, €97 avg). The Adidas Gazelle and Gazelle Indoor are among the most searched Adidas models on EU Vinted, driven by the shoe's sustained cultural relevance since Beyoncé's 2023 Renaissance tour appearances. Our live data shows the Gazelle Indoor category tracking 4 watched departures per week at €58 average with RISING momentum — low volume, fast clearance. For EU resellers, the real volume opportunity sits in the Handball Spezial (12/7d at €79) and the Samba family, while the Gazelle Indoor represents a precision play: fewer units, better margin per transaction. This guide covers exit prices by model, buy-below ceilings by size, momentum signals, and sourcing method across the five EU Vinted markets.",
    definedTerm: {
      name: "Adidas Gazelle departure average",
      description:
        "The Adidas Gazelle departure average is the average price at which a tracked Adidas Gazelle listing leaves the shelf on EU Vinted — not the asking price and not the retail price. The Adidas Gazelle Indoor variant tracks 4 watched departures per week in the week to 15 September 2026 across France, Germany, Spain, Italy, and Portugal at a €58 average exit price. The broader Adidas sneaker category tracks 45 watched departures per week at a €60 average across all Adidas trainer models. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The Adidas brand overall tracks 85 watched departures per week at a €53 average across all categories. The buy-below ceiling for the Gazelle Indoor at the €58 exit average is €37.70 — targeting a 35% gross margin after platform fees.",
    },
    sections: [
      {
        h: "Adidas sneakers on EU Vinted: 45 departures per week at €60 average",
        p: [
          "Adidas trainers are the most liquid brand-specific sneaker category on EU Vinted by weekly departure volume. At 45 watched departures per week in September 2026, Adidas sneakers outpace Nike (Air Force 1 and Jordan combined at approximately 67/7d but across two brand families) and sit well above niche luxury trainers (Balenciaga at 152/7d is brand-total, not category-specific). The €60 category average reflects a wide model spread: the Handball Spezial at €79, Gazelle Indoor at €58, and Samba at €48 are the anchors below-average by volume weight.",
          "The Adidas brand overall tracks 85 watched departures per week across all categories — sneakers account for 53% of that activity. Tracksuits (16/7d, €45), T-shirts (8/7d, €16), jackets (7/7d, €89), and hoodies (5/7d, €38) make up the remainder. For EU Vinted resellers building a trainer-focused sourcing strategy, Adidas is the operationally simplest brand: authentication is well-documented, the Samba and Handball Spezial are not heavily counterfeited at EU second-hand market prices (unlike limited Nike SB or Jordan colourways), and the buyer base across France, Germany, Spain, and Italy is deep.",
          `The €60 category average across 45 weekly departures is a reliable signal, not an outlier. It has been stable across the August-September 2026 observation window. A reseller sourcing Adidas sneakers at or below the buy-below ceiling (€39 at brand-sneaker category level) and exiting at the average targets a 35% gross margin after Vinted's 5% seller protection fee — consistent with the Adidas brand's operating profile across EU Vinted. [Full Adidas brand data →](${ilinkHref("flip")})`,
        ],
      },
      {
        h: "Model breakdown: Gazelle Indoor, Handball Spezial, Samba, Stan Smith",
        p: [
          "The Adidas Gazelle Indoor is the Gazelle variant with strongest current momentum on EU Vinted. At 4 watched departures per week (10 over 30 days) at a €58 average, it is a precision category: fewer weekly transactions but a RISING momentum signal and a 80 speed score — both indicate the model clears faster than its volume suggests. The buy-below ceiling at the €58 exit average is €37.70 (€58 × 0.65). For size 36 specifically — the dominant size in our dataset — the ceiling tightens to €33.25 at a €50 average, reflecting size-specific demand concentration.",
          "The Handball Spezial is the highest-volume and highest-per-unit Adidas sneaker in our dataset. At 12 watched departures per week (64 over 30 days) at a €79.38 average, it generates more total gross margin per sourcing session than any other Adidas sneaker model we track. STABLE momentum and a speed score of 37.5 indicate consistent demand without the DEAD signal risk of the Samba. The buy-below ceiling is €52.79 for size 39 (the top-selling size at 17% of 30-day volume) and €52.09 for size 38 (16.7% of volume). These are size-specific ceilings — sourcing a size 37 without a specific data point carries greater price risk.",
          `The Samba is the highest-awareness Adidas model on EU Vinted — 27,338 active listings and 130 watched departures over 30 days — but carries a DEAD momentum signal and a speed score of just 9.2 out of 100. The market is saturated: months of supply sits at 210 (more than 17 years of inventory at current departure rate). A Samba in good condition exits at the €48 average, but it competes against 27,000 other listings. Buy-below for the Samba is €31.93 at brand-category level; size 38 ceiling is €36.58 (€55 avg, n=10). The Stan Smith tracks 7 watched departures per week at €84.14 average with RISING momentum — a smaller but more favourable supply picture (3,619 active listings) and a buy-below of approximately €54.70 at category level. [See all model data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_adidas_gazelle_20260915"),
      },
      {
        h: "Buy-below ceilings by size: where the Adidas margin lives",
        p: [
          "Adidas sneaker pricing on EU Vinted is size-sensitive. The Handball Spezial shows the clearest size premium: size 39 (top volume) averages €76.83 with a buy-below of €51.09, while size 38 averages €78.33 (buy-below €52.09). Sizes 37 and below and 43 and above exit below the category average — the EU Vinted buyer base concentrates in the 37–42 range for Adidas, with 39 and 38 as the most liquid.",
          "For the Gazelle Indoor, size 36 is the most frequently observed departure size at a €50 average (buy-below €33.25). The sample size (n=3 for size 36) means this ceiling is directional, not precise. With only 10 departures over 30 days total, the Gazelle Indoor is a model to source opportunistically when condition and price align, not to build a volume strategy around. Exit faster and cleaner than volume models.",
          "For the Samba — where sourcing at or below the ceiling matters most because of saturation — the buy-below varies significantly by size. Size 37 has a buy-below of €20.30 (average €30.52); size 39 is €40.08 (average €60.27); size 42.5 is €42.89 (average €64.50). The wide spread reflects that Samba pricing on EU Vinted is chaotic — buyers who know their size and want a specific colourway pay a premium; buyers browsing broadly accept the lower end. Condition arbitrage on the Samba requires precise size-level pricing.",
        ],
        table: {
          caption: "Adidas sneaker model comparison — EU Vinted, week to 15 Sep 2026",
          head: ["Model", "Departures/7d", "Avg exit price", "Buy-below", "Momentum"],
          rows: [
            ["Handball Spezial", "12", "€79", "€52.79 (size 39)", "STABLE"],
            ["Stan Smith", "7", "€84", "€54.70", "RISING"],
            ["Samba", "6", "€48", "€31.93", "DEAD"],
            ["Gazelle Indoor", "4", "€58", "€37.70", "RISING"],
            ["Campus 00s", "4", "€38", "€24.60", "DEAD"],
          ],
        },
      },
      {
        h: "Momentum signals: what RISING and DEAD mean for your sourcing decision",
        p: [
          "Two Adidas models carry RISING momentum in our September 2026 data: the Gazelle Indoor and the Stan Smith. RISING means the model's departure rate is accelerating relative to its 30-day baseline — a positive signal for sourcing, because it indicates growing buyer demand at current price levels. Neither model has high absolute volume, but the RISING signal means the buy-below ceiling is more defensible: you are sourcing into a deepening market, not an emptying one.",
          "The Samba and Campus 00s carry DEAD momentum. DEAD means departure rate is decelerating — the market is becoming less liquid at current price levels. This does not mean you cannot exit a Samba profitably, but it means at 27,000 active listings competing for 6 departures per week, the clearance time for any individual listing is unpredictable. The Samba has been the most popular Adidas model on EU Vinted for three years; 'DEAD momentum' reflects market saturation, not disappearing demand. Price below the category average to clear faster.",
          "The Handball Spezial is the most balanced signal: STABLE momentum at 12 departures per week and a buy-below of €52.79. STABLE means the departure rate is neither accelerating nor decelerating — consistent, predictable throughput. For a reseller building weekly volume, the Handball Spezial is the most operationally reliable Adidas sneaker to source: predictable exit price, moderate competition (5,166 active listings, far below the Samba's 27,338), and a size-specific buy-below ceiling that is genuinely achievable in EU charity shops and market stalls.",
        ],
      },
      {
        h: "Authentication: Adidas trainers are low-risk but not zero-risk",
        p: [
          "Adidas trainers are among the lower authentication-risk categories in EU second-hand markets compared to Nike Jordan colourways or Balenciaga sneakers. The Handball Spezial and Gazelle Indoor are not counterfeited at scale at EU charity shop prices — a €60 charity shop find is not worth replicating. The Samba is counterfeited in the €100+ premium colourway tier (Samba OG in rare colourways, Palace × Adidas, etc.) but not at the €48 standard exit level. Authentication risk increases significantly if you are sourcing premium Samba colourways above €80.",
          "For standard Adidas trainers at EU Vinted resale prices: check the boost midsole (Samba OG uses a non-boost midsole — verify the correct sole type for the specific model), the Trefoil or Three Stripes placement (genuine pieces show consistent spacing and stitching; replicas often show uneven stripe spacing or loose stitching at stripe ends), and the size tag (genuine Adidas size tags list EU and UK sizes with consistent font; replica tags frequently show font-weight inconsistency or incorrect UK size conversions). Box authentication is not reliable for pre-loved Adidas — most EU charity shop finds arrive without original boxes.",
          `The Handball Spezial's suede upper is a useful authentication touchpoint: genuine suede on the Spezial has a consistent nap direction and a tight weave — you can see the nap direction change when you brush the suede under light. Replica suede on lower-quality fakes is often flat and does not show clear nap direction. This is not a substitute for full authentication but is a fast first-pass check at a charity shop. [Full authentication guides for all brands →](${ilinkHref("flip")})`,
        ],
      },
      {
        h: "Sourcing: where EU resellers find Adidas trainers profitably",
        p: [
          "EU charity shops are the highest-margin sourcing channel for Adidas trainers. The Handball Spezial and Gazelle Indoor surface in charity shops across France (Emmaus, La Croix Rouge), Germany (Humana, Red Cross Kleiderkammer), and Spain (CRU, Koopjeshoek) at prices typically in the €8–25 range — well below the buy-below ceiling for any of the models in our dataset. A Handball Spezial pair in good condition at €18 from a German Humana shop represents a potential €60+ gross margin at the €79 category average.",
          "EU flea markets (French brocantes, Spanish rastros, Italian mercati delle pulci) are a secondary source. Adidas trainers at flea markets in the €15–35 range appear frequently in September as summer storage clearances begin. Flea market sourcing requires size awareness: bring a size conversion chart and check the EU size label against the insole, as mislabelled pairs are common at markets and incorrect size listings on Vinted drive post-sale disputes.",
          `Vinted-to-Vinted arbitrage is particularly effective for the Stan Smith (RISING, €84 average): sellers who list Stan Smiths without identifying the specific model — writing 'white Adidas trainers' rather than 'Stan Smith OG' — frequently price at €15–30. A clean Stan Smith OG in white/green at €20–25 relisted with the correct model identification, size chart, and condition photos targets an exit at €75–85. The margin event requires only accurate product identification, not condition arbitrage. [See live Adidas Vinted data →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("body_adidas_gazelle_20260915"),
      },
    ],
    faq: [
      {
        q: "How much does an Adidas Gazelle sell for on EU Vinted?",
        a: "The Adidas Gazelle Indoor tracks 4 watched departures per week at a €58 average exit price across EU Vinted in September 2026, with RISING momentum. The broader Adidas sneaker category tracks 45 watched departures per week at a €60 average. Individual exit prices range from €35–45 for worn or smaller sizes to €75–90 for near-new Gazelle Indoor pairs in popular sizes.",
      },
      {
        q: "What is the buy-below price for an Adidas Gazelle on EU Vinted?",
        a: "The buy-below ceiling for the Adidas Gazelle Indoor at the €58 departure average is €37.70 — 65% of the average exit price, targeting a 35% gross margin after Vinted's 5% seller protection fee. For size 36 specifically (the most observed departure size), the size-adjusted ceiling is €33.25 at a €50 size average.",
      },
      {
        q: "Which Adidas trainer has the highest resale value on EU Vinted?",
        a: "The Stan Smith leads on average exit price at €84 with RISING momentum (7 departures/week). The Handball Spezial combines the highest volume (12 departures/week) with a strong €79 average — making it the highest total gross margin opportunity. The Samba has the most activity (130 departures/month) but DEAD momentum and a lower €48 average due to market saturation.",
      },
      {
        q: "Is the Adidas Samba still worth reselling on EU Vinted?",
        a: "The Samba carries DEAD momentum in our September 2026 data, with 27,338 active listings competing for 6 departures per week — an estimated 210 months of supply. It can still exit profitably at the €48 average if sourced below €32, but clearance time is unpredictable. We recommend the Handball Spezial or Gazelle Indoor over the Samba for consistent throughput.",
      },
      {
        q: "What is the best Adidas sneaker to resell on EU Vinted?",
        a: "By total gross margin per sourcing session: the Handball Spezial (12 departures/week, €79 avg, buy-below €52.79, STABLE). By margin efficiency per unit: the Stan Smith (7 departures/week, €84 avg, RISING momentum, lower inventory competition). The Gazelle Indoor is a precision play: low weekly volume but fast clearance and RISING signal, best for opportunistic sourcing when a pair appears at charity shop prices.",
      },
      {
        q: "How do I authenticate Adidas trainers when sourcing in EU charity shops?",
        a: "For standard Adidas trainers at EU second-hand price points: check the Three Stripes placement (even spacing, tight stitching), the size tag (correct EU/UK font and conversion), and for the Handball Spezial specifically, the suede nap direction (genuine suede shows clear directional nap under low-angle light; flat non-directional suede is a replica indicator). Premium Samba colourways above €80 require additional sole construction verification.",
      },
    ],
  },
]
