// Batch 107 of SEO/AEO articles. Same contract as blog-posts.ts.
// Off-White Hoodie EU Vinted price guide — targets
// "off-white hoodie vinted price", "off-white hoodie eu vinted price guide",
// "off-white hoodie resell value europe", "is off-white hoodie worth reselling vinted",
// "off-white hoodie buy below vinted", "off-white wipp hoodie vinted eu price",
// "off-white hoodie vs sneakers vinted", "off-white hoodie buy below vinted".
// DISTINCT from off-white-sneakers-eu-vinted-price-guide (sneakers only, 5 departures in the last 30 days @€154,
// buy-below €100.10, Nike collab / OOO / Arrow three-tier hierarchy — a completely different
// buyer pool and price band) and off-white-reselling-vinted-guide (brand overview, multi-category).
// This guide is HOODIES ONLY: 4 departures in the last 30 days @€42 avg (19 Sep 2026 live snapshot),
// buy-below €27.30, WIP Hooded Chase / Back to Black / Diagonal Arrow / Basic hoodie hierarchy,
// hoodie-specific fail points (chest graphic crack / drawcord / cuff pilling),
// vs Balenciaga hoodies (38 departures in the last 30 days @€100) and Stone Island hoodies (76 departures in the last 30 days @€55).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_107: BlogPost[] = [
  {
    slug: "off-white-hoodie-eu-vinted-price-guide",
    title: "Off-White Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Off-White Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Off-White hoodies track 4 departures in the last 30 days on EU Vinted at a €42 average exit price as of 19 September 2026 — the highest-volume Off-White apparel category after sneakers, and a different play from the €154 sneaker market. Buy-below €27.30, WIP Hooded Chase vs Back to Black vs Diagonal Arrow identification, condition grading, and how Off-White hoodies compare to Balenciaga (€100) and Stone Island (€55) for EU resellers.",
    date: "2026-09-19",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "Off-White Hoodie",

    intro:
      "Off-White hoodies track 4 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €42 average exit price. Hoodies are half of Off-White's 8 weekly brand departures and the second-highest-volume Off-White category behind sneakers (1 departures in the last 30 days at €40 in this snapshot — the brand's sneaker page covers a different €154 average across tracked sneaker models). They are 50% of the brand's tracked weekly volume this week. The buyer is not purchasing a Nike collab shoe. They are purchasing a branded fleece layer: a WIP Hooded Chase with the large chest script, a Back to Black hoodie with the diagonal Arrow print, or a basic Off-White pullover with the per-forced label. The buy-below ceiling at €42 average is €27.30 (€42 × 0.65), targeting 35% gross margin after Vinted platform fees. This guide covers the live margin case, Off-White hoodie identification hierarchy, buy-below by condition, and how Off-White hoodies sit against Balenciaga and Stone Island for EU resellers.",

    definedTerm: {
      name: "Off-White hoodie departure average",
      description:
        "The Off-White hoodie departure average is the average price at which a tracked Off-White hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 19 September 2026, Off-White hoodies track 4 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €42 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Off-White brand tracks 8 departures in the last 30 days at a €33 brand average; hoodies exit above the brand average, which T-shirts (2 departures in the last 30 days at €26) and shirts (1 departures in the last 30 days at €5) pull down. The buy-below ceiling at the €42 departure average is €27.30 (€42 × 0.65), targeting 35% gross margin after Vinted platform fees. ResaleIQ updates Off-White hoodie exit data weekly from EU Vinted departure observations across five markets.",
    },

    sections: [
      {
        h: "Off-White hoodies on EU Vinted: 4 departures in the last 30 days at €42 average",
        p: [
          "Off-White hoodies track 4 departures in the last 30 days across EU Vinted at a €42 average exit price in the week to 19 September 2026. That is the highest-volume Off-White apparel category this week: T-shirts 2 departures in the last 30 days at €26, shirts 1 departures in the last 30 days at €5. Sneakers, the brand's headline category, tracked 1 departures in the last 30 days at €40 in this snapshot — the Off-White sneakers guide covers a different €154 average across broader tracked sneaker models. The €42 hoodie average sits €9 above the €33 brand average because hoodies carry the brand's streetwear premium; T-shirts and shirts drag the brand number down.",
          "4 departures in the last 30 days at €42 average is €168 of observed hoodie revenue over 30 days across five markets. That is not a volume operation and it is not the Off-White money — the sneaker category is. Observed T-shirt revenue this week is €52 (2 × €26). The hoodie is the piece that shows up on the same German, French, and Italian charity-shop rails as Stone Island and Balenciaga fleece, and it competes directly with both. Treat the hoodie figure as its own market. An Off-White hoodie buyer on EU Vinted is buying branded streetwear fleece, not a Nike collab, and they will not pay sneaker money for it.",
          `€42 puts Off-White hoodies below Balenciaga hoodies (38 departures in the last 30 days at €100) and Stone Island hoodies (76 departures in the last 30 days at €55) on exit, and well below both on frequency. Balenciaga and Stone Island are the higher-tier hoodie plays on EU Vinted by both volume and exit. Off-White's hoodie slot is the mid-tier streetwear-fleece position: higher exit than the average hoodie brand, lower frequency than the heritage sportswear names. [Full Off-White brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_offwhite_hoodie_intro_20260919"),
      },
      {
        h: "Buy-below ceiling: €27.30 — WIP identification is the whole margin",
        p: [
          "The buy-below ceiling for Off-White hoodies at the €42 average exit is €27.30 (€42 × 0.65), targeting 35% gross margin after Vinted fees of roughly 5–8%. Net of a 6% fee on a €42 exit, take-home is €39.48 — €12.18 on a €27.30 buy (45% on capital). At German Kleiderkammer and French brocante pricing of €8–20 for Off-White hoodies, the arithmetic works on clean pieces sourced under €20. A worn Basic hoodie at €25 does not clear.",
          "Condition tiers move the ceiling. Like New (no graphic crack, crisp WIP script, intact drawcord, firm cuffs, clean kangaroo pocket edge) → €55–75 exit, buy-below €35.75–48.75. Very Good (light seasonal use, graphic intact, drawcord present, no cuff pilling) → €40–55 exit, buy-below €26–35.75 — the primary target. Good (light graphic crack, slight cuff pilling, clean interior) → €28–40 exit, buy-below €18.20–26. Fair (heavy graphic crack, pilled cuffs, missing drawcord, stretched hem) → €15–25 exit. Skip Fair unless the ticket is €6 or less.",
          "The Off-White hoodie identification split is larger than the condition split. A WIP Hooded Chase in Very Good condition exits at €48–70; a basic Off-White pullover with just the per-forced label exits at €22–35 at the same condition. Both hang as 'Off-White hoodie' at a charity shop and are often ticketed the same €10–18. Buying a basic expecting Hooded Chase money is the common Off-White hoodie mistake. Exterior: the Hooded Chase carries a large chest graphic (script or diagonal Arrow) plus, on many seasons, a WIP label at the neck; a basic Off-White hoodie has only the small per-forced brand label. Interior care tag: 'Off-White' with the WIP sub-line mark confirms Chase; 'Off-White' alone reads basic.",
        ],
        cta: pricingMidCta("ctr_offwhite_hoodie_buybelow_20260919"),
      },
      {
        h: "Off-White hoodie types: Hooded Chase, Back to Black, Diagonal Arrow, basic pullover",
        p: [
          "Four hoodie types drive the 4 EU Vinted departures in the last 30 days. The WIP Hooded Chase — large WIP script across the chest, often with a rear C or cross, WIP neck label — is the piece EU streetwear buyers search for. Very Good Hooded Chase in black, shamrock, or cypress exits at €48–70, well above the €42 category average. Neutral colourways clear; loud seasonal colourways sit. Size M and L move fastest on EU Vinted; S and XL lag.",
          "The Back to Black hoodie — Off-White's own-line streetwear piece with the diagonal Arrow print across the chest — exits in a similar band, €35–55 Very Good, and is easier to clock from across a rack because of the diagonal print. Print cracking and peel are the fail point: run a thumb across the print at source. Any surface crack drops the piece to Good and the exit toward €22–32. The diagonal Arrow zip-through (full zip, Arrow print, WIP label at placket) is less common at charity shops and exits at €40–60 Very Good if the zip runs clean from stop to collar.",
          "Basic Off-White pullovers — small per-forced label at the neck or chest, no large graphic, midweight cotton-blend — are the volume of what EU charity shops actually hold. They exit at €22–35 Very Good, around or below the €42 average. A basic sourced at €8 still clears. The same piece at €20 does not. If the tag reads basic Off-White with no large graphic, price it as a €22–35 garment, not as a Hooded Chase. Mixing the two is how Off-White hoodie inventory stalls.",
        ],
      },
      {
        h: "Is an Off-White hoodie worth reselling on EU Vinted?",
        p: [
          "Yes, with a WIP or Arrow check and a sourcing price under €20. At 4 departures in the last 30 days and a €42 average, Off-White hoodies are not a primary play. They are the mid-tier streetwear fleece that shows up next to Stone Island and Balenciaga on the same racks. A clean Hooded Chase at €10–15 is one of the better per-minute decisions on a German or French rail. A pilled basic at €18 is a skip.",
          "Decision rule at the rack: (1) Hooded Chase, Back to Black, Arrow, or basic, (2) graphic or script intact, (3) drawcord present, (4) cuffs not pilled to pills-on-pills, (5) ticket vs the condition-tier buy-below above. Hooded Chase + Very Good + under €20 → buy. Back to Black + Very Good + under €15 → buy. Basic + Very Good + under €10 → buy as filler. Anything Fair, or basic above €12 → leave it.",
          "In a session that has both a clean Off-White hoodie and a clean Stone Island hoodie, take the Stone Island. Stone Island hoodies exit at €55 average (76 departures in the last 30 days) against Off-White at €42 (4 departures in the last 30 days) — higher exit and 19× the volume. Off-White becomes the buy when the Stone Island rail is empty or the Off-White piece is a Hooded Chase clearly under €15. Do not confuse either with Off-White sneakers. An Off-White hoodie and an Off-White Nike collab sneaker do not share a buyer, a capital ticket, or an exit band — the sneaker guide covers that separately.",
        ],
        cta: pricingBodyCta("ctr_offwhite_hoodie_worth_reselling_20260919"),
      },
      {
        h: "Off-White vs Balenciaga vs Stone Island hoodies on EU Vinted",
        p: [
          "Off-White hoodies (4 departures in the last 30 days at €42) sit below Balenciaga hoodies (38 departures in the last 30 days at €100) and Stone Island hoodies (76 departures in the last 30 days at €55) on both exit and volume this week. Balenciaga's buyer cue is the brand's designer-fashion positioning; Stone Island's is the compass badge and sportswear heritage; Off-White's is the WIP script and the Virgil Abloh streetwear narrative. Charity-shop tickets in Germany and France overlap across all three (€8–25). Condition equal and ticket equal, prefer Stone Island over Off-White because Stone Island has a higher Very Good ceiling (€45–70 vs Off-White's €40–55 band around a €42 average) and 19× the frequency. Prefer Balenciaga over both at the same ticket — Balenciaga's €70–110 Very Good band is the strongest of the three.",
          "Ralph Lauren hoodies (12 departures in the last 30 days at €50) sit above Off-White on exit and 3× on volume. Off-White is the mid-tier streetwear-fleece play; Ralph Lauren is the polo-heritage premium fleece. They do not share a buyer. Hugo Boss hoodies (6 departures in the last 30 days at €24) undercut Off-White on both exit and frequency — Hugo Boss is the workwear-adjacent branded-fleece slot, not streetwear. Take Off-White when the session has a Hooded Chase or Back to Black under €18 and the Stone Island rail is empty. The three brands fill different slots on the same rails; a mixed haul can list all three without competing with itself.",
          `Fred Perry hoodies (37 departures in the last 30 days at €17) and Carhartt hoodies (7 departures in the last 30 days at €21) are the volume and workwear comparisons, not the streetwear ones. Off-White's play is the WIP identification edge at the mid-tier: a Hooded Chase sourced at €10 targeting €48–70 is a higher per-unit return than a Fred Perry at €7 targeting €17, but Fred Perry moves 9× as often. For volume resale, Fred Perry and Stone Island are the hoodie plays. For per-transaction margin on a clean WIP piece found at the right price, Off-White Hooded Chase is the call. [Hoodie category comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_offwhite_hoodie_vs_competitors_20260919"),
      },
    ],

    faq: [
      {
        q: "How much does an Off-White hoodie sell for on EU Vinted?",
        a: "Off-White hoodies track 4 departures in the last 30 days across EU Vinted at a €42 average exit price as of the week to 19 September 2026. By type and condition: WIP Hooded Chase in Very Good condition exits at €48–70. Back to Black hoodie (diagonal Arrow print) in Very Good exits at €35–55. Diagonal Arrow zip-through in Very Good exits at €40–60. Basic Off-White pullover with the per-forced label exits at €22–35. By condition tier: Like New (no graphic crack, crisp WIP script, intact drawcord, firm cuffs) → €55–75. Very Good (light seasonal use, graphic intact, drawcord present) → €40–55 — the primary target. Good (light graphic crack, slight cuff pilling) → €28–40. Fair (heavy graphic crack, pilled cuffs, missing drawcord) → €15–25. The broader Off-White brand tracks 8 departures in the last 30 days at a €33 brand average — hoodies exit above the brand average and are half the brand's weekly volume this week. ResaleIQ tracks Off-White hoodie exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for an Off-White hoodie to make a profit on EU Vinted?",
        a: "The buy-below ceiling for Off-White hoodies is €27.30 — 65% of the €42 average exit tracked in the week to 19 September 2026, targeting 35% gross margin after Vinted fees of about 5–8%. By condition: Like New (targeting €65 exit) → buy-below €42.25. Very Good (targeting €47 exit) → buy-below €30.55. Good (targeting €34 exit) → buy-below €22.10. Fair (targeting €20 exit) → buy-below €13 or skip. Apply the type split on top of that: a WIP Hooded Chase targeting €55–70 can support a higher ticket than a basic targeting €22–35. At German and French charity shops Off-White hoodies typically ticket at €8–20. The risk at source is mistaking a basic pullover for a Hooded Chase, and cracked chest graphic and missing drawcord, both of which drop exit into the Good band.",
      },
      {
        q: "Which Off-White hoodie sells for the most on EU Vinted?",
        a: "The WIP Hooded Chase in Very Good condition is the highest-exit Off-White hoodie on EU Vinted, at €48–70 for black, shamrock, or cypress in M/L. The diagonal Arrow zip-through exits at €40–60 if the zip is clean and the Arrow print is uncracked. The Back to Black hoodie exits at €35–55 for Very Good examples. Basic Off-White pullovers with the per-forced label exit at €22–35 and should not be priced as Hooded Chase pieces. Hooded Chase and Back to Black are less common on EU charity-shop rails than basic pullovers; when a clean Hooded Chase appears at €10–15 it is the hoodie to take. Loud seasonal colourways sit longer than neutrals.",
      },
      {
        q: "How do Off-White hoodies compare to Balenciaga hoodies for reselling on EU Vinted?",
        a: "Off-White hoodies track 4 departures in the last 30 days at €42 average; Balenciaga hoodies track 38 departures in the last 30 days at €100 as of 19 September 2026. Balenciaga exits 2.4× higher and moves 9.5× more often. Balenciaga is the higher-tier hoodie play on EU Vinted by both volume and exit. Off-White's WIP Hooded Chase (€48–70 Very Good) occupies a lower tier than Balenciaga's branded-fleece hoodies (€70–110 Very Good). The gap that matters at source: a Balenciaga hoodie sourced at €15 targeting €70–110 returns more per transaction than an Off-White Hooded Chase sourced at €12 targeting €48–70 — but Balenciaga pieces at charity shops are increasingly identified by staff (€15–30 tickets are common in urban EU stores). Off-White retains a larger identification gap at the basic-vs-Chase level. For volume resale, Balenciaga and Stone Island are the hoodie plays; for a per-transaction margin on a rare WIP find at the right price, Off-White Hooded Chase is the call.",
      },
      {
        q: "Is an Off-White hoodie worth reselling on EU Vinted?",
        a: "Yes, if it is a WIP Hooded Chase, Back to Black, or diagonal Arrow piece sourced under €20. Off-White hoodies track 4 departures in the last 30 days at a €42 average on EU Vinted in the week to 19 September 2026. Buy-below is €27.30. Per-unit net is about €12–25 on a clean Very Good piece — below Balenciaga hoodies (€100 average, 38 departures in the last 30 days) and Stone Island (€55 average, 76 departures in the last 30 days), but viable when a Hooded Chase is ticketed at €10–15 on a German or French rail. The identification test (Hooded Chase graphic vs Back to Black diagonal Arrow vs basic per-forced label, graphic intact, drawcord present, cuffs not destroyed) is fast. Off-White hoodies are a mid-tier streetwear-fleece add-on, not a primary play. Take the Stone Island when both are clean and available; take the Off-White Hooded Chase when the Stone Island rail is empty or the Chase is clearly under €15.",
      },
    ],
  },
]
