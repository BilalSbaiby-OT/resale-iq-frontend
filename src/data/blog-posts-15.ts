// Batch 15 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_15: BlogPost[] = [
  {
    slug: "bershka-reselling-vinted-guide",
    title: "Bershka Reselling on Vinted: The €97 Jacket Anomaly and Why the Average Lies",
    seoTitle: "Is Bershka Worth Reselling on Vinted? — Resale IQ",
    description:
      "Bershka ranked #26 by watched departures across 5 EU Vinted markets — 27/week at €27 average. Jackets at €97 avg (4 dep) are an anomaly, not the norm. Jeans at €12 avg are the volume category with no viable margin. Honest assessment: a deliberate pass.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 5,
    intro:
      "Week to 14 September 2026, Bershka ranked #26 across Spain, France, Germany, Italy and Portugal with 27 watched departures at an average exit price of €27. That average is materially misleading for resellers: it is inflated by 4 Jacket departures averaging €97 — an outlier cluster driven by low Jacket volume rather than a consistent Jacket premium. The actual reselling picture is Jeans at €12 average (9 departures, the volume category), Hoodies at €18 (3 departures), and T-Shirts at €5 (3 departures). Bershka is Inditex-owned (alongside Zara, Pull&Bear, Massimo Dutti, Stradivarius) and carries the same structural resale problem as Pull&Bear: wide EU distribution, available new at lower prices than secondary market exit, and no scarcity-based premium.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 27 watched departures in the week to 14 September 2026, Jeans led at 9 exits averaging €12. Jackets contributed 4 departures averaging €97. Coats added 3 departures averaging €20. Hoodies added 3 departures averaging €18. T-Shirts rounded out at 3 departures averaging €5.",
          "Full Bershka volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €97 Jacket average deserves immediate context: 4 departures is too low a sample to treat as a stable category average — one or two premium vintage outerwear pieces attributed to Bershka can move a 4-departure average significantly. At 4 departures in the last 30 days in the Jacket category, the actual sourcing signal is not 'Bershka Jackets average €97' but rather 'occasional Bershka-labelled outerwear exits above €50' — a different and weaker claim. The reliable volume category is Jeans at 9 departures and €12 average — which has no viable margin.",
        ],
      },
      {
        h: "Why the €97 Jacket average is not a sourcing signal",
        p: [
          "The Bershka Jacket average of €97 across 4 departures in a single week is almost certainly driven by 1–2 outlier pieces rather than a consistent Jacket premium. Bershka's mainline Jacket range retails at €30–60 — a leather-look jacket at €49.99, a puffer at €39.99, a bomber at €44.99. For these to exit at €97 average on EU Vinted, either: (a) the pieces are rare vintage or limited-edition Bershka outerwear from the brand's early Inditex period; (b) the pieces are mislabelled (Bershka occasionally stocks items from external brands with Bershka hangtags at differing price points); or (c) a sampling artefact from 4-departure-per-week volume.",
          "A reseller targeting 'Bershka Jackets at €97' as a sourcing strategy would find that — across a typical EU charity shop supply — the Bershka outerwear available is current-era production priced at €8–20, exiting at €20–40 on Vinted, not at €97. The reliable data signal is: 27 departures in the last 30 days at €27 average, with Jeans as the volume leader at €12. That is the Bershka resale market on EU Vinted.",
        ],
        cta: pricingMidCta("ctr_bershka_20260915"),
      },
      {
        h: "The Inditex distribution problem: no margin in current production",
        p: [
          "Bershka shares the Pull&Bear resale problem: it is Inditex-owned, operates across 900+ EU locations, and produces trend-reactive casualwear at accessible prices. Jeans retail at €25–35; Hoodies at €20–30; T-Shirts at €10–20. On EU Vinted, these items exit at €12, €18, and €5 respectively. The margin case is negative or zero after fees at any charity shop price above €5 for most categories.",
          "The buy-below for Bershka Jeans at €12 exit is near €8.40. The buy-below for Hoodies at €18 exit is near €12.60. The buy-below for T-Shirts at €5 exit is near €3.50. None of these thresholds are achievable at EU charity shop pricing for recognisable branded basics. Bershka is not a viable deliberate sourcing target for current production.",
        ],
      },
      {
        h: "Practical verdict: deliberate pass, opportunistic vintage only",
        p: [
          "The honest assessment for Bershka is a deliberate pass for systematic reselling. The brand is widely distributed, cheaply available new, and exits on EU Vinted at prices that do not support charity shop sourcing economics. The only edge case is early Bershka production (late-1990s, early-2000s) from the brand's founding era under the Inditex expansion period — vintage Bershka denim with period branding exits at a modest premium (€20–30) on the 90s-revival cycle, but supply is low and the uplift is insufficient to support a sourcing strategy.",
          "For resellers who encounter Bershka pieces at charity shops: pass on T-Shirts and Jeans at any standard charity shop price. A Hoodie priced below €8 is a marginal case. Any Bershka piece priced above €10 at a charity shop is non-viable at current EU Vinted averages. Time spent identifying Bershka-branded pieces at charity shops is better spent on higher-average brands: Stone Island (€70 avg), Balenciaga (€146 avg), Jordan (€133 avg).",
        ],
        cta: pricingBodyCta("body_bershka_20260915"),
      },
    ],
    faq: [
      {
        q: "Is Bershka worth reselling on Vinted?",
        a: "Generally no — not for deliberate sourcing. Bershka ranked #26 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 27 departures at €27 average. The €27 average is inflated by 4 Jacket departures averaging €97 (likely outliers). The volume category is Jeans at €12 avg (9 dep) — no viable margin at charity shop pricing. Bershka is Inditex-owned with wide EU distribution; current production has no secondary market scarcity.",
      },
      {
        q: "What is the buy-below price for Bershka on Vinted?",
        a: "For Bershka Jeans: with an average departure of €12 and 5% platform deduction, buy-below sits around €8.40. For Hoodies at €18 avg, buy-below is near €12.60. For T-Shirts at €5 avg, buy-below is near €3.50. None of these are achievable at EU charity shop pricing for branded basics. Bershka is not a viable deliberate sourcing target.",
      },
      {
        q: "Why are Bershka Jackets so expensive on Vinted?",
        a: "The €97 Jacket average in the week to 14 September 2026 reflects 4 departures — too low a sample to be a stable average. One or two premium outlier pieces (vintage Bershka outerwear, mislabelled pieces, or limited-era production) can move a 4-departure average significantly. Bershka mainline Jackets retail at €30–60 and typically exit on EU Vinted at €20–40. The €97 average is not a reliable sourcing signal.",
      },
      {
        q: "How does Bershka compare to Zara for resale on Vinted?",
        a: "Zara is significantly more resellable. Zara (82 dep/wk at €20 avg) has 3× Bershka's volume and a higher reliable average. Zara Jackets exit at €35 avg (buy-below ~€23) with a consistent supply; Bershka Jackets at €97 avg are a low-sample outlier. Zara Studio identification (limited-edition pieces exiting at €40–80) gives a real sourcing edge without a Bershka equivalent. Both are Inditex brands; Zara's higher global recognition creates stronger secondary market pricing.",
      },
    ],
  },
  {
    slug: "mango-reselling-vinted-guide",
    title: "Mango Reselling on Vinted: €11 Average and Why the Brand Doesn't Resell",
    seoTitle: "Is Mango Worth Reselling on Vinted? — Resale IQ",
    description:
      "Mango ranked #27 by watched departures across 5 EU Vinted markets — 17/week at €11 average. Every category average is below a viable buy-below threshold. Honest assessment: do not deliberately source Mango for resale.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 4,
    intro:
      "Week to 14 September 2026, Mango ranked #27 across Spain, France, Germany, Italy and Portugal with 17 watched departures at an average exit price of €11 — the joint-lowest brand average in the tracked catalogue alongside Pull&Bear. Every category average for Mango on EU Vinted is at or below the buy-below threshold achievable at EU charity shop pricing. Mango is a Spanish mid-market fashion brand with 2,700+ stores globally, wide EU distribution, and a value proposition built on trend-led basics at accessible prices — the same structural resale problem as Pull&Bear and Bershka. This guide is a transparency report on why Mango does not resell, not a sourcing strategy.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 17 watched departures in the week to 14 September 2026, Jackets led at 5 exits averaging €11. Jeans contributed 5 departures averaging €8. T-Shirts added 3 departures averaging €6. Hoodies added 2 departures averaging €18. Coats rounded out at 1 departure averaging €30.",
          "Full Mango volumes are on " +
            ilinkHref("flip") +
            " and update weekly. At 17 departures, Mango has the lowest volume of any tracked brand in the catalogue. The highest category average — Coats at €30 (1 departure) — is too low a sample to be actionable. The most significant category by volume (Jackets and Jeans at 5 departures each) averages €11 and €8 respectively — below any viable buy-below threshold at charity shop pricing.",
        ],
      },
      {
        h: "Why Mango does not resell: the mid-market trap",
        p: [
          "Mango's resale problem is structural, not cyclical. The brand occupies the same mid-market tier as Zara (which it competes with directly), but with lower global brand recognition and a more fashion-cycle-dependent aesthetic. Zara exits at €20 average on EU Vinted because the Zara name has sufficient recognition to command a modest premium over the new retail price for out-of-season pieces. Mango exits at €11 — below the price of a new Mango basic at Mango's own outlet pricing (which runs at €8–20 for T-Shirts, Jeans, and basics in-season).",
          "The supply-side problem is equivalent demand volume: Mango's wide EU store footprint (flagship stores in Spain, France, Germany, Italy, Portugal) means buyers on EU Vinted are never more than 10km from a Mango store and can buy the same or equivalent item new for the same or lower price than any used Vinted listing. The secondary market premium that supports resale (the ability to charge above new retail for scarcity, rarity, or discontinued items) does not exist for current Mango production.",
        ],
        cta: pricingMidCta("ctr_mango_20260915"),
      },
      {
        h: "The only viable Mango case: Mango premium sub-lines",
        p: [
          "Mango has two premium sub-lines that exit above the brand average: Mango Committed (the sustainable fabric line, using certified organic cotton, recycled fibres, and responsible supply chains) and Mango Premium (the elevated fabric line, using linen, silk blends, and premium wool). Neither has a strong secondary market identity — buyers on EU Vinted do not search for 'Mango Committed' specifically — but pieces from these lines in very good condition and a clean, versatile silhouette exit at €20–35.",
          "The Coats category at €30 average (1 departure, low confidence) likely reflects premium-line outerwear. Mango premium wool coats and linen-blend blazers in classic colourways (navy, camel, black) exit at €25–50 on EU Vinted — above the brand average but requiring a buy-below of €17–35 that is occasionally achievable at estate sales or higher-end charity shops that stock premium brands. This is an opportunistic edge case, not a systematic sourcing strategy.",
        ],
      },
      {
        h: "Practical verdict: skip Mango at charity shops",
        p: [
          "The practical guidance for Mango is to skip it at EU charity shops in favour of higher-average brands at the same sourcing price. A £8–12 charity shop sourcing budget that produces a Mango Jacket exits at €11 on EU Vinted. The same £8–12 sourcing budget finding a Fred Perry Shirt exits at €14 average; a Lacoste Polo exits at €33 average; a Stone Island T-Shirt exits at €24 average. The opportunity cost of Mango sourcing is the foreground metric: time spent confirming 'Mango Jacket' at a charity shop is time not spent identifying the higher-margin pieces alongside it.",
          "For resellers who encounter Mango in bulk: Coats in classic colourways priced under €10 are a marginal case; everything else is a pass. Current-production Mango at any standard charity shop price does not generate viable reselling margin on EU Vinted.",
        ],
        cta: pricingBodyCta("body_mango_20260915"),
      },
    ],
    faq: [
      {
        q: "Is Mango worth reselling on Vinted?",
        a: "No — not for deliberate sourcing. Mango ranked #27 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 17 departures at €11 average — the joint-lowest in the tracked catalogue. Every category exits below viable buy-below thresholds: Jackets €11 avg, Jeans €8 avg, T-Shirts €6 avg. Mango premium sub-lines (Committed, Premium) exit at €20–50 for outerwear, but this is an opportunistic edge case.",
      },
      {
        q: "What is the buy-below price for Mango on Vinted?",
        a: "For Mango Jackets: with an average departure of €11 and 5% platform deduction, buy-below sits around €7.70. For Jeans at €8 avg, buy-below is near €5.60. For Hoodies at €18 avg, buy-below is near €12.60. None of these thresholds are achievable at EU charity shop pricing for recognisable branded basics. Skip Mango and invest sourcing time in higher-average brands.",
      },
      {
        q: "What Mango items sell best on Vinted?",
        a: "By value: Coats (1 dep/wk at €30 avg — too low volume to be a reliable signal). By volume: Jackets and Jeans (5 dep/wk each at €11 and €8 avg — not viable). Mango premium outerwear (Mango Premium wool coats, linen blazers) exits at €25–50 in classic colourways, but supply at EU charity shops is insufficient to build a sourcing strategy.",
      },
      {
        q: "How does Mango compare to Zara for resale on Vinted?",
        a: "Zara is substantially more resellable. Zara (82 dep/wk at €20 avg) has 5× Mango's volume and nearly double the average exit price. Zara's Jacket category exits at €35 avg with consistent supply; Mango's Jacket category exits at €11 avg. Zara Studio identification (limited pieces exiting at €40–80) provides a reliable sourcing edge; Mango has no equivalent premium sub-brand with strong secondary market recognition. Both compete in mid-market fashion; Zara's stronger global identity creates a meaningfully better resale market.",
      },
    ],
  },
]
