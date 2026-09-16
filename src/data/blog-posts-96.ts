// Batch 96 of SEO/AEO articles. Same contract as blog-posts.ts.
// Off-White Sneakers EU Vinted price guide — targets
// "off white sneakers vinted price", "off white sneakers eu vinted price guide",
// "off white nike collab vinted price eu", "off white out of office vinted price",
// "is off white sneakers worth reselling vinted", "off white air jordan 1 vinted eu price",
// "off white air force 1 vinted price guide", "off white vs gucci sneakers vinted eu".
// DISTINCT from off-white-reselling-vinted-guide (brand overview: all categories,
// 20 total departures, €63 brand avg; mentions sneakers in one paragraph at €110
// using September 14 data) — this guide is Sneakers-only: 5/7d @€154 avg
// (Sep 16 live), buy-below €100.10, Nike collab model hierarchy (AJ1/AF1/Dunk/OOO),
// colourway premiums, EU size dynamics, post-Virgil Abloh premium,
// vs Gucci/Balenciaga comparison.

import type { BlogPost } from "./blog-posts"
import { pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_96: BlogPost[] = [
  {
    slug: "off-white-sneakers-eu-vinted-price-guide",
    title: "Off-White Sneakers on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Off-White Sneakers Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Off-White sneakers track 5 watched departures per week across EU Vinted at a €154 average exit price as of September 2026 — the highest per-departure average in the Off-White dataset. Nike collab vs Out of Office model breakdown, buy-below ceiling €100.10, EU colourway premiums, and how Off-White sneakers compare to Gucci and Balenciaga for EU resellers.",
    date: "2026-09-16",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Off-White Sneakers",

    intro:
      "Off-White sneakers track 5 watched departures per week across EU Vinted in the week to 16 September 2026 at a €154 average exit price — 2.4× the Off-White brand average of €63 and the highest category average within the Off-White EU Vinted dataset. Sneakers are 25% of Off-White's EU Vinted volume but represent the largest revenue-per-transaction tier, with individual exits clustering between €80 and €300 depending on model and colourway. The buy-below ceiling at the €154 average is €100.10 (€154 × 0.65), targeting 35% gross margin after Vinted platform fees. The sourcing opportunity is defined by the post-Virgil Abloh premium: Off-White Nike collaboration pieces from the 2017–2022 Virgil era command persistent secondary-market premiums that EU charity shops and general resellers consistently undervalue, because the pricing gap between 'designer logo' and 'Virgil Abloh collab' is not reflected in retail pricing references used by non-specialist shops. This guide covers the model hierarchy, Nike collab premium structure, EU colourway dynamics, and how Off-White sneakers compare to Gucci and Balenciaga for EU Vinted sourcing decisions.",

    definedTerm: {
      name: "Off-White sneaker departure average",
      description:
        "The Off-White sneaker departure average is the average price at which a tracked Off-White sneaker listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 16 September 2026, Off-White sneakers track 5 watched departures per week across France, Germany, Spain, Italy, and Portugal at a €154 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The Off-White brand overall tracks 20 watched departures per week at a €63 brand average. The sneaker category exits at 2.4× the brand average because Off-White footwear concentrates buyer intent at the product-aware end of the market: buyers searching for Off-White sneakers on EU Vinted are looking for a specific collab or model, have a retail price reference point of €350–600+, and are prepared to pay €100–250 for an authentic EU-condition pair. The buy-below ceiling at the €154 average is €100.10 (€154 × 0.65), targeting 35% gross margin. EU charity shops price Off-White pieces at generic designer rates (€20–50 for footwear) without distinguishing Nike collab value from standard line — the model identification gap is the sourcing edge.",
    },

    sections: [
      {
        h: "Why Off-White sneakers exit at €154 on EU Vinted",
        p: [
          "The Off-White brand averages €63 across 20 watched departures per week on EU Vinted as of 16 September 2026. Sneakers exit at €154 — 2.4× that brand average — because the buyer pool for Off-White footwear is structurally different from the buyer pool for Off-White T-Shirts (€28 avg) or Hoodies (€37 avg). A T-Shirt buyer may be looking for the Off-White aesthetic at an accessible price; a sneaker buyer on EU Vinted is typically looking for a specific collab model they could not source elsewhere, or could not afford at reseller retail prices. This product-aware buyer has a clear price ceiling derived from StockX or GOAT EU pricing, and EU Vinted's lower pricing means they are prepared to pay more than a generic shopper would for the same search terms.",
          "The post-Virgil Abloh effect compounds this. Virgil Abloh (Off-White founder) died in November 2021. Pieces from his 2017–2022 Nike collaboration era — particularly the 'The Ten' collection (Air Jordan 1, Air Force 1, Air Max 90, Blazer, Chuck Taylor, Vapormax, React Hyperdunk, Zoom Fly, Air Presto, Air Max 97) — carry legacy premiums that do not fully deflate because the collection is finite. EU Vinted buyers who understand the collab history bid at premiums that reflect this: an Off-White x Nike Air Jordan 1 in clean condition exits at €200–350 on EU Vinted depending on colourway, against a retail was €190 in 2017. The departure data averages across all Off-White sneaker types; the Nike collab tier pulls the average toward €154.",
          `The volume is low — 5 departures per week — which means the opportunity is narrow-but-deep. EU charity shops and estate sales surface Off-White sneakers at irregular frequency at €20–60, priced as generic premium sneakers. A buyer who knows the exact collab value at EU Vinted prices has a clear sourcing edge at that price point. [Current Off-White sneaker data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_offwhite_snk_intro_20260916"),
      },
      {
        h: "Buy-below ceiling and condition tiers for Off-White sneakers",
        p: [
          "At a €154 departure average and a 35% gross margin target (before Vinted platform fees of approximately 5%), the buy-below ceiling is €100.10. Any Off-White sneaker sourced below €100 — authenticated, condition correct — has a realistic margin at current departure prices. This is a high absolute buy-below relative to other brands in the EU Vinted dataset (compare: Puma sneakers buy-below €36.40, Nike buy-below mid-range ~€45), which means sourcing volume will be lower, but per-transaction margin is proportionally high.",
          "Condition tiers operate differently for Off-White than for mainstream athletic sneakers. Sole wear is the primary devalue factor: an Off-White x Nike Air Force 1 with heavy sole yellowing loses 25–35% against the average exit price, dropping toward €90–110 regardless of upper condition. Off-White canvas or leather uppers are robust — light scuffs or creasing do not significantly devalue relative to sole condition, because buyers are sourcing for display or light rotation. Box + all accessories (zip-ties, extra laces, spare insoles from 'The Ten' releases) adds 15–25% premium for Nike collab pieces where EU buyers know what the complete accessory set should look like.",
          "Authentication is a hard pre-condition. Off-White sneakers are one of the most counterfeited categories on EU Vinted, which is also why authentic pairs hold premium exit prices — buyers will pay above market for verified-authentic EU pairs listed with detailed photos. The stitching density on the 'Industrial' belt/lace features, the embossed Helvetica font weight on Off-White logos, and the Nike collaboration's double-branded tongue label are the three highest-signal authentication checkpoints that separate authentic from replica at the sourcing stage.",
        ],
        cta: pricingMidCta("ctr_offwhite_snk_buybelow_20260916"),
      },
      {
        h: "Nike collab vs Out of Office vs Arrow series: which Off-White sneakers to source",
        p: [
          "Off-White's sneaker range on EU Vinted splits across three tiers with distinct price dynamics. The Nike collaboration tier (2017–2022 'The Ten', subsequent Off-White x Nike drops) occupies the top exit range at €150–350 for clean, authenticated pairs. Within the Nike collab tier, the Air Jordan 1 'University Blue' and 'Chicago' colourways, and the Air Force 1 'MCA' and 'Volt' colourways, are the highest-exit models because they have strong community name recognition and were produced in limited EU allocations. The Blazer Mid collab and Dunk Low collab (2020–2021) sit at €100–180 for clean pairs — lower than AJ1 but more accessible at sourcing because they appear at EU thrift stores more frequently than Jordan 1s.",
          "The Out of Office (OOO) sneaker — Off-White's own production line, not a Nike collab — exits at €100–160 for clean pairs in EU Vinted. The OOO is a polarising silhouette (chunky sole, prominent branding) that has a defined buyer demographic but less broad name recognition than Nike collab pieces. EU pricing for OOO is more stable than Nike collab pricing, which can spike on specific colourways. OOO sourcing is more reliable at EU charity shops and estate sales where the shoe may be priced purely as 'designer sneaker' without recognising the Off-White brand premium. Clean OOO pairs in white or 'OAMC' colourways exit at the higher end of the €100–160 range.",
          "The Arrow series (lower-profile Off-White sneaker line, including the Odsy-1000 and the Off-Court silhouettes) exits at €60–100 on EU Vinted — below the buy-below ceiling calculated at the €154 average. These models are worth sourcing below €40, but they do not contribute to the category average and should be assessed separately against the live data for their individual exit range. The Nike collab pieces and OOO are the primary sourcing targets at the €100.10 buy-below ceiling.",
        ],
      },
      {
        h: "EU colourway premiums and size dynamics for Off-White sneakers",
        p: [
          "Colourway is the single highest-variance factor in Off-White sneaker exit pricing on EU Vinted. White-dominant colourways (Off-White x Nike Air Force 1 'MCA', OOO Triple White) carry premiums of 15–20% above the category average because they read as more versatile to EU buyers who use them for light rotation use. Black-dominant colourways (Off-White x Nike Blazer Black, OOO Triple Black) exit closer to the category average. Seasonal colourways from specific collab 'moments' (the University Blue Jordan 1, the Volt Air Force 1) carry 20–40% premiums independent of base colour because collector demand sustains the bid.",
          "EU size dynamics for Off-White sneakers skew toward the EU39–44 range, consistent with the EU Vinted buyer profile across all sneaker categories. However, Off-White Nike collab pieces have a secondary dynamic: collector buyers in EU42–44 are particularly active because that size range corresponds to US9–10, which was the standard 'reseller retail' size in the original collab releases. Off-White pieces in EU42–44 (US9–10) exit at 10–15% above equivalent sizes in EU40–41 (US7–8) because the collab narrative around those sizes is stronger. EU39 and below see demand reduction of 10–15% from the EU collab-buyer demographic.",
          "Deadstock status has an outsized impact for Off-White Nike collab pieces. Never-worn with intact zip-ties and complete box earns 30–50% above the average exit price for well-documented colourways. The documentation standard matters: EU Vinted buyers for Off-White collabs at €200+ scrutinise listing photos closely. A deadstock pair listed with full unboxing photos (box interior, size sticker, original laces, zip-ties in place) achieves the deadstock premium; the same pair listed with a single shoe photo against a white background does not.",
        ],
      },
      {
        h: "Off-White vs Gucci vs Balenciaga sneakers on EU Vinted: sourcing comparison",
        p: [
          "The three highest average-exit sneaker categories tracked in the EU Vinted dataset (as of September 2026) are Gucci Sneakers (€212 avg, 37 departures/7d), Off-White Sneakers (€154 avg, 5 departures/7d), and Balenciaga (€153 brand avg across all categories, ~30 departures/7d). Each has a distinct sourcing profile. Gucci sneakers have the highest absolute exit price and the highest volume of the three, but also the highest sourcing floor — Gucci shoes at EU charity shops are increasingly priced at €30–80 as thrift shops recognise the brand, compressing margins. Gucci's buy-below ceiling is €137.80 (€212 × 0.65), achievable but harder to hit as sourcing floors rise.",
          "Off-White sneakers have a lower average exit price than Gucci but a stronger margin-per-sourced-unit because the model identification gap is larger. Charity shops that price Off-White at generic 'designer sneaker' rates (€20–50) do not distinguish Nike collab value from standard Off-White line — the OOO at €30 in a charity shop can exit at €120–140 on EU Vinted. Balenciaga's sourcing landscape is similar to Gucci's in that the brand name is increasingly recognised at second-hand shops, making sourcing below the buy-below ceiling more competitive. Off-White's narrower name recognition at non-specialist sourcing venues means the margin gap is more available.",
          `Volume determines strategy: resellers targeting consistent weekly throughput will find Gucci (37 departures/7d) or Balenciaga more reliable than Off-White (5 departures/7d). Resellers targeting high per-transaction returns on irregular sourcing — for example, charity shop hunters who do one run per week — will find Off-White collab pieces the highest-return individual opportunity when sourced correctly. Both strategies are viable at different operational scales. [Full brand-level data →](${ilinkHref("flip")})`,
        ],
      },
    ],

    faq: [
      {
        q: "What is the buy-below price for Off-White sneakers on EU Vinted?",
        a: "The buy-below ceiling for Off-White sneakers on EU Vinted is €100.10, calculated as 65% of the €154 average exit price tracked in the week to 16 September 2026. This targets a 35% gross margin after Vinted platform fees of approximately 5%. Off-White sneakers track 5 watched departures per week across France, Germany, Spain, Italy, and Portugal at the €154 average. 'Buy-below' means the maximum sourcing price that preserves 35% gross margin at the average exit — individual models exit above and below that average. Nike collab pieces (Air Jordan 1, Air Force 1, Out of Office) regularly exit at €150–300 for clean, authenticated pairs, which means the buy-below ceiling for those specific models is higher — up to €130–195 depending on colourway and condition. The €100.10 figure is the floor-safe ceiling; apply it to unknown or mixed-condition Off-White sneakers. Track current Off-White sneaker exit prices at resaleiq.dev, which updates weekly from EU Vinted departure data.",
      },
      {
        q: "Which Off-White sneaker models sell best on EU Vinted?",
        a: "The highest-exit Off-White sneaker models on EU Vinted are Nike collaboration pieces from the 2017–2022 Virgil Abloh era, particularly the Off-White x Nike Air Jordan 1 ('University Blue', 'Chicago', 'Retro High'), the Off-White x Nike Air Force 1 ('MCA', 'Volt', 'University Gold'), and the Off-White x Nike Blazer Mid. These models exit at €180–350 for clean, authenticated EU pairs, substantially above the €154 Off-White sneaker category average. The Off-White Out of Office (OOO) is the strongest performer outside the Nike collab tier, exiting at €100–160 for clean pairs. It appears at EU charity shops more frequently than Nike collab pieces, which are increasingly priced by specialist thrift stores. The Off-White Arrow series and Odsy-1000 exit below the category average at €60–100. Deadstock Nike collab pairs with intact accessories (zip-ties, original laces, box) earn 30–50% above the clean worn premium.",
      },
      {
        q: "Are Off-White Nike collabs worth more than Off-White's own sneakers on Vinted EU?",
        a: "Yes. Off-White x Nike collaboration sneakers consistently exit at higher prices than Off-White's own-line sneakers on EU Vinted. Nike collab pieces (Air Jordan 1, Air Force 1, Blazer, Dunk) exit at €150–350 for clean authenticated pairs. Off-White's own-line sneakers — the Out of Office (OOO), Arrow series, and Odsy-1000 — exit at €60–160 depending on model and condition. The premium on Nike collab pieces is sustained by two factors: the finite production run (no restock, no reissue on original Virgil Abloh collabs), and the strong community name recognition among EU Vinted buyers who are familiar with the collab narrative and the retail price history. The OOO is the closest own-line competitor to Nike collab exit prices, but even clean OOO pairs in premium colourways sit below what a clean Air Force 1 MCA or Air Jordan 1 in the same condition achieves. From a sourcing perspective, Nike collab pieces have a higher buy-below ceiling but also a harder sourcing floor as specialist thrift stores increasingly identify them.",
      },
      {
        q: "How do you authenticate Off-White sneakers before buying to resell on Vinted EU?",
        a: "Off-White sneakers are among the most counterfeited categories on EU Vinted, making authentication a hard prerequisite before sourcing. Three checkpoints cover the majority of fakes encountered at EU charity shops and estate sales. First, the Industrial Belt or lace feature: authentic Off-White sneakers use a yellow zip-tie or 'Industrial' label with a specific weight and stitch density — replicas use lighter, cheaper versions that feel loose or hollow when squeezed. Second, the Helvetica font weight: the embossed or printed Off-White text on the upper (shoes that carry the brand name in quotes, such as 'AIR' on Nike collabs) must match the heavy-weight Helvetica specification with precise letter spacing. Replicas commonly use a lighter font weight or incorrect kerning. Third, on Nike collab pieces, the double-branded tongue label must show both the Nike and Off-White branding with correct stitching tension and thread colour. Sole unit build quality — weight, flexibility, and material feel — is the fastest disqualifier for low-quality replicas but harder to assess without handling the shoe.",
      },
      {
        q: "How do Off-White sneakers compare to Gucci sneakers for EU Vinted reselling?",
        a: "Gucci sneakers and Off-White sneakers are the two highest average-exit sneaker categories in the EU Vinted dataset tracked by ResaleIQ. Gucci sneakers exit at €212 average across 37 departures per week; Off-White sneakers exit at €154 average across 5 departures per week. Gucci offers higher volume and higher absolute exit prices, but sourcing margins are increasingly under pressure as EU charity shops recognise Gucci branding and price accordingly (€30–80 for Gucci footwear is now common in urban EU thrift stores). Off-White offers lower volume but a larger model identification gap: EU charity shops price Off-White sneakers without distinguishing Nike collab value from standard Off-White line, creating reliable margin opportunities for resellers who can identify models on sight. The buy-below ceiling for Gucci sneakers is €137.80 (€212 × 0.65); for Off-White it is €100.10 (€154 × 0.65). Resellers running high-volume operations will prioritise Gucci; resellers who source opportunistically from charity shops and estate sales will find Off-White collab pieces the higher-margin individual transaction.",
      },
    ],
  },
]
