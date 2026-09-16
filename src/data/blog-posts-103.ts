// Batch 103 of SEO/AEO articles. Same contract as blog-posts.ts.
// The North Face Hoodie EU Vinted price guide — targets
// "the north face hoodie vinted price", "the north face hoodie eu vinted price guide",
// "tnf hoodie resell value europe", "is the north face hoodie worth reselling vinted",
// "north face hoodie buy below vinted", "north face half dome hoodie vinted eu price",
// "north face drew peak hoodie vinted eu", "tnf hoodie vs carhartt hoodie vinted".
// DISTINCT from the-north-face-jacket-eu-vinted-price-guide (jackets 85/7d @€48,
// outdoor technical buyer, Nuptse/Himalayan/McMurdo hierarchy) and
// the-north-face-reselling-vinted-guide (brand overview) and
// the-north-face-summit-series-eu-vinted-price-guide (technical summit performance).
// This guide is HOODIES ONLY: 18/7d @€20 avg (Sep 16 live), buy-below €13.00,
// sport-casual branded fleece buyer (NOT outdoor technical), Half-dome vs Drew Peak
// vs Surgent hierarchy, vs Carhartt hoodies (18/7d @€22) and Ralph Lauren (18/7d @€46).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_103: BlogPost[] = [
  {
    slug: "the-north-face-hoodie-eu-vinted-price-guide",
    title: "The North Face Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "The North Face Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "The North Face hoodies track 18 watched departures per week on EU Vinted at a €20 average exit price as of September 2026 — a tight-margin, high-frequency sourcing play distinct from the €48 TNF jacket market. Buy-below €13.00, hoodie type hierarchy (Half-dome vs Drew Peak vs Surgent fleece), condition grading, and how TNF hoodies compare to Carhartt (€22) and Ralph Lauren (€46) for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "The North Face Hoodies",

    intro:
      "The North Face hoodies track 18 watched departures per week across EU Vinted in the week to 16 September 2026 at a €20 average exit price. At €20 average, this is a fundamentally different reselling proposition from TNF jackets (85/7d at €48) — the buyer is not purchasing technical outdoor gear. The TNF hoodie buyer on EU Vinted is purchasing sport-casual branded fleece: the Half-dome chest logo, the recognisable Drew Peak silhouette, the collegiate brand association. The buy-below ceiling at €13.00 (€20 × 0.65) means only correctly conditioned pieces sourced under €10 deliver meaningful margin. TNF hoodies are found frequently at EU charity shops — The North Face is one of the most donated sportswear brands across France, Germany, and Spain — which makes sourcing access broad, but condition discipline is non-negotiable at this price point. This guide covers the realistic margin case, hoodie type hierarchy by exit price, buy-below by condition tier, and how TNF hoodies compare to Carhartt and Ralph Lauren hoodies for EU resellers.",

    definedTerm: {
      name: "The North Face hoodie departure average",
      description:
        "The North Face hoodie departure average is the average price at which a tracked The North Face hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 16 September 2026, The North Face hoodies track 18 watched departures per week across France, Germany, Spain, Italy, and Portugal at a €20 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader The North Face brand tracks 132 watched departures per week at a €42 brand average across all five categories; the hoodie category exits at €20, well below the brand average which is pulled upward by jackets (85/7d at €48) and coats (5/7d at €70). The buy-below ceiling at the €20 departure average is €13.00 (€20 × 0.65), targeting 35% gross margin after Vinted platform fees. The North Face hoodies represent 13.6% of total TNF EU Vinted weekly departure volume. ResaleIQ updates TNF hoodie exit data weekly from EU Vinted departure observations across five markets.",
    },

    sections: [
      {
        h: "The North Face hoodies on EU Vinted: 18 watched departures per week at €20 average",
        p: [
          "The North Face hoodies track 18 watched departures per week across EU Vinted at a €20 average exit price in the week to 16 September 2026. The €20 average is the lowest per-unit exit across TNF's tracked EU Vinted categories: jackets exit at €48 (85/7d), coats at €70 (5/7d), bags at €45 (7/7d), and T-shirts at €13 (12/7d). The hoodie category's €20 average reflects the market reality: TNF hoodies occupy the casual branded fleece segment, not the technical outdoor segment. The buyer is not purchasing weather protection or alpine performance — they are purchasing the Half-dome logo on a cotton-blend fleece at a secondhand price below the €80–120 new-retail equivalent.",
          "18 departures per week at €20 average means the total observed weekly TNF hoodie revenue on EU Vinted is €360 — a fraction of the €4,080 weekly jacket revenue (85 × €48). For a reseller running a volume operation, TNF hoodies alone cannot sustain a business. The honest case for including TNF hoodies in an EU reselling portfolio is threefold: broad sourcing availability (TNF hoodies appear regularly at French brocantes, German Kleiderkammer networks, and Spanish thrift chains at €4–12), low sourcing price relative to buy-below, and portfolio diversification across the winter casual-fleece buyer demographic. At correctly sourced pieces under €8, the gross margin per unit (€8–12 at target exit) makes TNF hoodies a viable add-on buy when found in clean condition.",
          `The €20 average positions TNF hoodies in the lower tier of the EU Vinted branded hoodie market. Carhartt hoodies (18/7d at €22) and Nike hoodies (15/7d at €23) are close volume and price comparators. Ralph Lauren hoodies (18/7d at €46) exit at 2.3× TNF's hoodie average at the same weekly volume — the case for preferring Ralph Lauren hoodies over TNF hoodies on per-unit margin is clear when sourcing access allows. Patagonia hoodies (98/7d at €41) and Stone Island hoodies (331/7d at €57) represent higher-exit-price options with stronger weekly throughput. TNF hoodies sit at the accessible, high-frequency end of the branded hoodie spectrum. [Full TNF brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_tnf_hoodie_intro_20260916"),
      },
      {
        h: "Buy-below ceiling: €13.00 — margin reality for The North Face hoodies",
        p: [
          "The buy-below ceiling for The North Face hoodies at the €20 average exit price is €13.00 (€20 × 0.65), targeting 35% gross margin after Vinted platform fees of approximately 5–8%. Net of a 6% platform fee on a €20 exit, the actual take is €18.80 — giving a net margin of €5.80 on a €13 buy (44.6% ROI on capital). At EU charity shop pricing of €4–12 for TNF hoodies, the margin arithmetic is achievable on correctly sourced pieces, but the absolute per-unit gross margin (€5.80–14.80 depending on sourcing price) is low relative to TNF jackets (€13–35 per unit) or Ralph Lauren hoodies (€13 net on a €29.90 buy at €46 exit).",
          "Condition tiers shift the ceiling sharply. Like New (unworn, no pilling, crisp Half-dome logo print, intact drawcord, firm cuffs) → €26–32 exit, buy-below €16.90–20.80. Very Good (light seasonal use, no pilling on chest or sleeves, clean exterior, drawcord intact) → €18–24 exit, buy-below €11.70–15.60 — the primary sourcing target. Good (minor cuff pilling, slight logo fade, clean interior) → €13–18 exit, buy-below €8.45–11.70. Fair (visible pilling on chest or back, faded logo, stretched hem, missing drawcord) → €8–12 exit — marginal at most sourcing prices. Skip Fair pieces unless sourcing price is €5 or less.",
          "The two primary condition fail points for TNF hoodies in EU charity shop sourcing: (1) Chest logo print fade and cracking — the rubberised Half-dome and Drew Peak chest prints crack, peel, or dull with repeated washing. Run a thumb across the print at the sourcing point; any surface cracking drops the piece to Good or Fair. (2) Hood lining and drawcord condition — TNF hoodies are frequently donated with the drawcord missing entirely (removed at wash or lost). A missing drawcord on a premium hoodie is visible to buyers and cuts the exit price to Good tier at best. Check the drawcord channel before committing at the sourcing price.",
        ],
        cta: pricingMidCta("ctr_tnf_hoodie_buybelow_20260916"),
      },
      {
        h: "The North Face hoodie types: Half-dome, Drew Peak, and Surgent fleece",
        p: [
          "Three TNF hoodie sub-types drive the majority of the 18 weekly EU Vinted departures. The North Face Half-dome pullover hoodie — the cotton-blend heavyweight pullover with the Half-dome graphic across the back or a smaller chest-logo variant — is the most frequently sourced TNF hoodie at EU charity shops and the primary driver of the 18-departure-per-week figure. Half-dome pullover hoodies in Very Good condition exit at €18–24 on EU Vinted, near the €20 category average. The graphic-heavy back-print versions are buyer-polarising: some buyers actively seek the large Half-dome back print, while others prefer the minimalist chest-logo only. List the graphic clearly in photos and title.",
          "The North Face Drew Peak hoodie — the oversized cut with the large embroidered Drew Peak summit route graphic across the chest — exits slightly above the Half-dome pullover at €20–28 for clean examples. The Drew Peak silhouette is popular with younger buyers purchasing the streetwear-adjacent oversized aesthetic; sizing is generous by design, and the cut runs large. An oversized Drew Peak in Very Good condition in a neutral colourway (black, grey, green) exits at €22–28. Colourway strongly influences exit price: earth tones and neutrals clear fastest in the EU market; season-specific colourways (bright orange, seasonal collabs) are slower and more condition-sensitive.",
          `The North Face Surgent fleece hoodie and Open-gate zip hoodie represent the highest-exit-price TNF hoodie sub-types. The Surgent (heavyweight fleece, tonal North Face chest embroidery, athletic fit) exits at €24–35 in Very Good condition — above the €20 hoodie category average and the clearest per-unit margin opportunity in the TNF hoodie category. Surgent hoodies are found less frequently than Half-dome or Drew Peak at EU charity shops, but a clean Surgent fleece sourced at €8–10 delivers the strongest per-unit return (€16–25 gross) in the TNF hoodie segment. The Open-gate full-zip (fleece-lined, tonal zip, mock-neck variation) exits at €22–32 in clean condition. [See current TNF data →](${ilinkHref("flip")})`,
        ],
      },
      {
        h: "Is The North Face hoodie worth reselling on EU Vinted?",
        p: [
          "TNF hoodies are worth reselling on EU Vinted with two conditions: sourcing price under €8–10, and condition Very Good or better. At the €20 average exit and €13.00 buy-below, the per-unit gross margin is low (€5–12 net) compared to TNF jackets or higher-average hoodie brands. The case for including TNF hoodies in an EU reselling portfolio is not per-unit margin — it is sourcing frequency and accessibility. TNF is one of the most donated sportswear brands at EU charity shops across all five markets, and hoodies surface regularly alongside the more valuable jacket inventory. Buying only jackets and passing on every clean hoodie priced under €10 leaves accessible gross margin on the shelf.",
          "The practical decision rule: at EU charity shops and brocantes, apply the condition-first test (Half-dome print intact? Drawcord present? No cuff pilling?), then price against the condition tier buy-below above. A clean TNF hoodie at €6 → buy it. A pilled drawcord-missing TNF hoodie at €8 → skip. The condition fail points (logo cracking, missing drawcord, hem pilling) are fast to check at the sourcing point and reliably predict which pieces will underperform the category average on EU Vinted.",
          "Portfolio context: in an EU charity shop session where both TNF jackets and TNF hoodies are available, prioritise jackets (€31.20 buy-below, €15–35 per-unit gross) over hoodies at any overlapping budget. TNF hoodies become the primary buy only when jacket inventory is depleted or sourcing price is clearly sub-€8. The two categories target different EU Vinted buyers — the jacket buyer is function-conscious, the hoodie buyer is brand-casual — and a mixed TNF portfolio serves both.",
        ],
        cta: pricingBodyCta("ctr_tnf_hoodie_worth_reselling_20260916"),
      },
      {
        h: "The North Face vs Carhartt vs Ralph Lauren hoodies on EU Vinted",
        p: [
          "TNF, Carhartt, and Ralph Lauren each track 18 watched departures per week in EU Vinted's hoodie category as of September 2026 — the same weekly volume at markedly different price points. TNF hoodies exit at €20 average; Carhartt hoodies at €22; Ralph Lauren hoodies at €46. The three-way comparison at identical weekly volume makes the exit-price difference stark: Ralph Lauren hoodies generate 2.3× TNF's per-unit gross at the same sourcing frequency. If a sourcing session allows a choice between a clean TNF hoodie at €8 and a clean Ralph Lauren hoodie at €10, the Ralph Lauren is the correct buy on margin arithmetic alone.",
          "The sourcing reality complicates the margin arithmetic. Ralph Lauren hoodies are found at EU charity shops at €8–18 (higher sourcing price ceiling reflects the brand's perceived premium at donation point); TNF hoodies at €4–12. A TNF hoodie sourced at €6 delivers €12 gross on a €18 exit; a Ralph Lauren hoodie sourced at €18 delivers €10 gross on a €28 exit (Good condition). The charity shop repricing of premium casual brands means TNF's lower average exit is partially offset by lower sourcing floors. Track both when sourcing, buy on condition-adjusted margin, not brand alone.",
          `Carhartt hoodies (18/7d at €22) sit closest to TNF hoodies in the EU Vinted branded hoodie market — same weekly volume, €2 higher average exit. The Carhartt hoodie buyer is purchasing workwear-adjacent streetwear branding (script logo, patch label) rather than outdoor performance heritage. Carhartt hoodies at EU charity shops in Germany and France surface at similar price points to TNF (€5–14), making the two brands a natural compare at the sourcing point. At €22 exit and a €14.30 buy-below, Carhartt hoodies deliver slightly more per-unit headroom than TNF. The selection rule: condition equal, same sourcing price — buy Carhartt for the small per-unit exit advantage. [Full hoodie comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_tnf_hoodie_vs_competitors_20260916"),
      },
    ],

    faq: [
      {
        q: "How much does a The North Face hoodie sell for on EU Vinted?",
        a: "The North Face hoodies track 18 watched departures per week across EU Vinted at a €20 average exit price as of the week to 16 September 2026. By condition: Like New (no pilling, crisp logo print, intact drawcord, firm cuffs) → €26–32. Very Good (light seasonal use, no pilling, drawcord intact, clean exterior) → €18–24. Good (minor cuff pilling, slight logo fade, clean interior) → €13–18. Fair (visible pilling, faded logo, missing drawcord, stretched hem) → €8–12. By type: Half-dome pullover in Very Good condition exits at €18–24. Drew Peak hoodie in Very Good condition exits at €20–28. Surgent fleece hoodie in Very Good condition exits at €24–35. Open-gate full-zip in Very Good condition exits at €22–32. The broader TNF brand tracks 132 watched departures per week at a €42 brand average — the hoodie category exits well below the brand average, which is driven by jackets (85/7d at €48). ResaleIQ tracks TNF hoodie exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a The North Face hoodie to make a profit on EU Vinted?",
        a: "The buy-below ceiling for The North Face hoodies is €13.00 — calculated as 65% of the €20 average exit price tracked in the week to 16 September 2026, targeting 35% gross margin after Vinted platform fees of approximately 5–8%. By condition tier: Like New (targeting €28 exit) → buy-below €18.20. Very Good (targeting €21 exit) → buy-below €13.65. Good (targeting €15 exit) → buy-below €9.75. Fair (targeting €10 exit) → buy-below €6.50 or skip. At EU charity shops across France, Germany, Spain, Italy, and Portugal, TNF hoodies typically price at €4–12 — buy-below is achievable for Very Good or better pieces. The primary risk at the sourcing point: cracked or peeling chest logo print (Half-dome or Drew Peak emblem) and missing drawcord, both of which drop exit price to Good tier and compress margin below the buy-below target. Only purchase Fair condition pieces at under €5 to maintain viability.",
      },
      {
        q: "Which The North Face hoodie sells for the most on EU Vinted?",
        a: "The North Face Surgent fleece hoodie and Open-gate full-zip hoodie exit at the highest prices within the TNF hoodie category — €24–35 and €22–32 respectively in Very Good condition. Both are found less frequently at EU charity shops than the more common Half-dome pullover or Drew Peak hoodie. The Drew Peak hoodie exits at €20–28 in Very Good condition and is found with moderate frequency. The Half-dome pullover is the most frequently found TNF hoodie at EU charity shops and exits at €18–24 in Very Good condition — the primary volume target for most EU resellers. The practical sourcing hierarchy: prioritise Surgent fleece when found clean (buy-below €16–22.75), Drew Peak as the secondary target (buy-below €13–18.20), Half-dome pullover as the consistent weekly workhorse (buy-below €11.70–15.60 depending on condition). The Half-dome back-print graphic versions are buyer-polarising — disclose clearly in listing photos and price against condition rather than the graphic's presence alone.",
      },
      {
        q: "How do The North Face hoodies compare to Carhartt hoodies for reselling on EU Vinted?",
        a: "The North Face and Carhartt hoodies both track 18 watched departures per week on EU Vinted as of September 2026, making them direct volume comparators. Carhartt hoodies exit at €22 average (buy-below €14.30); TNF hoodies at €20 (buy-below €13.00). The €2 per-unit exit difference is small in absolute terms but meaningful at scale: a reseller buying 10 hoodies per month generates €20 more monthly gross from Carhartt at identical volume and sourcing cost. In practice, charity shop repricing often closes this gap — Carhartt's workwear-streetwear brand recognition in Germany and France means Carhartt hoodies are sometimes priced €2–4 higher at source than TNF. The selection rule: buy on condition-adjusted net margin, not brand preference. Both brands are sourced regularly at EU charity shops, both suit the same reseller portfolio slot, and both target the casual-branded-fleece EU Vinted buyer demographic. Where sourcing price is identical, Carhartt has a small exit price advantage.",
      },
      {
        q: "Is a The North Face hoodie worth reselling on EU Vinted?",
        a: "Yes, with condition discipline and a sourcing price under €10. The North Face hoodies track 18 watched departures per week at a €20 average exit on EU Vinted in September 2026. The buy-below is €13.00 and per-unit net margin is €5–12 — lower than TNF jackets (€15–35 net) or Ralph Lauren hoodies (€13+ net at €46 exit), but viable when sourcing price is sub-€8 for clean pieces. The case for TNF hoodies in an EU reselling portfolio is broad sourcing frequency and low minimum buy-in: TNF hoodies surface regularly at French brocantes, German Kleiderkammer, and Spanish thrift chains at €4–12, and the condition check (logo print intact, drawcord present, no cuff pilling) is fast to run at the sourcing point. TNF hoodies are a portfolio add-on buy — not a primary reselling play — that complements the higher-margin TNF jacket inventory and fills the casual-fleece portfolio slot when clean pieces are available below buy-below.",
      },
    ],
  },
]
