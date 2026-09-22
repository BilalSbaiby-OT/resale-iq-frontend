// Batch 104 of SEO/AEO articles. Same contract as blog-posts.ts.
// Carhartt Hoodie EU Vinted price guide — targets
// "carhartt hoodie vinted price", "carhartt hoodie eu vinted price guide",
// "carhartt wip hoodie resell value europe", "is carhartt hoodie worth reselling vinted",
// "carhartt hoodie buy below vinted", "carhartt chase hoodie vinted eu price",
// "carhartt wip vs original hoodie vinted", "carhartt hoodie vs tommy hilfiger vinted".
// DISTINCT from carhartt-detroit-jacket-eu-vinted-price-guide (jackets, Detroit WIP
// chore coat, 6 departures in the last 30 days @€33 live) and carhartt-wip-jacket-eu-vinted-price-guide
// (all-WIP jacket models) and carhartt-reselling-vinted-guide (brand overview,
// hoodies as one stale paragraph at 18 departures in the last 30 days @€28).
// This guide is HOODIES ONLY: 7 departures in the last 30 days @€21 avg (19 Sep 2026 live snapshot),
// buy-below €13.65, WIP Chase vs mainline midweight vs Hooded Chase hierarchy,
// hoodie-specific fail points (script print, cuff pilling, kangaroo pocket),
// vs Tommy Hilfiger hoodies (8 departures in the last 30 days @€20) and Ralph Lauren (12 departures in the last 30 days @€50).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_104: BlogPost[] = [
  {
    slug: "carhartt-hoodie-eu-vinted-price-guide",
    title: "Carhartt Hoodies on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Carhartt Hoodie Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Carhartt hoodies track 7 departures in the last 30 days (per tracked models, model_signals) at a €21 average exit price as of 22 September 2026. Carhartt brand-level: 2,791 departures/30d at €25.90 avg. Tommy Hilfigerthe €33 jacket market. Buy-below €13.65, WIP Chase vs mainline identification, condition grading, and how Carhartt hoodies compare to Tommy Hilfiger (€20) and Ralph Lauren (€50) for EU resellers.",
    date: "2026-09-19",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "Carhartt Hoodies",

    intro:
      "Carhartt hoodies track 7 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €21 average exit price. Hoodies are 41% of Carhartt's 17 30-day brand departures — more volume than jackets (6 departures in the last 30 days at €33) — so the hoodie rack is the first Carhartt decision most EU charity-shop sessions actually present. The buyer is not purchasing a Detroit chore coat. They are purchasing workwear-adjacent streetwear branding: the small WIP script on the left chest, the reverse C on a Chase, or the block Carhartt wordmark on a mainline midweight. The buy-below ceiling at €13.65 (€21 × 0.65) means only clean pieces sourced under €10 deliver real margin. This guide covers the live margin case, WIP Chase vs mainline identification, buy-below by condition, and how Carhartt hoodies sit against Tommy Hilfiger and Ralph Lauren for EU resellers.",

    definedTerm: {
      name: "Carhartt hoodie departure average",
      description:
        "The Carhartt hoodie departure average is the average price at which a tracked Carhartt hoodie listing leaves the shelf on EU Vinted — not the asking price and not retail. As of the week to 19 September 2026, Carhartt hoodies track 7 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €21 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Carhartt brand tracks 17 departures in the last 30 days at a €25 brand average; hoodies are 41% of that volume and exit below the brand average, which jackets (6 departures in the last 30 days at €33) and jeans (2 departures in the last 30 days at €33) pull up. The buy-below ceiling at the €21 departure average is €13.65 (€21 × 0.65), targeting 35% gross margin after Vinted platform fees. ResaleIQ updates Carhartt hoodie exit data weekly from EU Vinted departure observations across five markets.",
    },

    sections: [
      {
        h: "Carhartt hoodies on EU Vinted: 7 departures in the last 30 days at €21 average",
        p: [
          "Carhartt hoodies track 7 departures in the last 30 days across EU Vinted at a €21 average exit price in the week to 19 September 2026. That is the highest-volume Carhartt category this week: jackets 6 departures in the last 30 days at €33, jeans 2 departures in the last 30 days at €33, T-shirts 2 departures in the last 30 days at €10. The €21 hoodie average sits €4 below the €25 brand average because jackets and jeans carry the brand number. Treat the hoodie figure as its own market. A Carhartt hoodie buyer on EU Vinted is buying a branded fleece layer, not canvas workwear, and they will not pay Detroit money for it.",
          "7 departures in the last 30 days at €21 average is €147 of observed hoodie revenue over 30 days across five markets. That is not a volume operation. It is a selective add-on buy that appears on the same racks as the jackets. Observed jacket revenue over 30 days is €198 (6 × €33). When a session has both a clean hoodie and a clean jacket, the jacket still wins on per-unit gross. The hoodie wins when the jacket rack is empty and a Chase or a clean mainline is sitting at €5–10.",
          `Carhartt hoodies track 7 departures in the last 30 days (per tracked models, model_signals). Tommy Hilfiger hoodies track 510 brand-level departures/30d at €19.69 average.€17) and Fred Perry hoodies (37 departures in the last 30 days at €17). Ralph Lauren hoodies (12 departures in the last 30 days at €50) exit at 2.4× Carhartt's hoodie average at higher weekly volume. The North Face hoodies (4 departures in the last 30 days at €31) exit higher but move slower. Carhartt's hoodie slot is mid-price workwear-streetwear, not outdoor fleece and not polo-heritage premium. [Full Carhartt brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_carhartt_hoodie_intro_20260919"),
      },
      {
        h: "Buy-below ceiling: €13.65 — WIP identification is the whole margin",
        p: [
          "The buy-below ceiling for Carhartt hoodies at the €21 average exit is €13.65 (€21 × 0.65), targeting 35% gross margin after Vinted fees of roughly 5–8%. Net of a 6% fee on a €21 exit, take-home is €19.74 — €6.09 on a €13.65 buy (45% on capital). At German Kleiderkammer and French brocante pricing of €4–12 for Carhartt hoodies, the arithmetic works on clean pieces. Absolute gross is small (€6–15 depending on source price) compared with a WIP Detroit at €55–80 exit.",
          "Condition tiers move the ceiling. Like New (no pilling, crisp script or wordmark, intact drawcord, firm cuffs, clean kangaroo pocket edge) → €28–38 exit, buy-below €18.20–24.70. Very Good (light seasonal use, no chest pilling, print intact, drawcord present) → €18–26 exit, buy-below €11.70–16.90 — the primary target. Good (cuff pilling, slight script fade, clean interior) → €12–18 exit, buy-below €7.80–11.70. Fair (heavy pilling, cracked print, missing drawcord, stretched hem) → €8–12 exit. Skip Fair unless the ticket is €4 or less.",
          "The WIP vs mainline split is larger than the condition split. A WIP Chase Hoodie in Very Good condition exits at €28–42; a mainline midweight with the block Carhartt wordmark exits at €14–22 at the same condition. Both hang as 'Carhartt hoodie' at a charity shop and are often ticketed the same €6–10. Buying mainline expecting Chase money is the common Carhartt hoodie mistake. Interior care tag: 'Carhartt Work In Progress' with the WIP logo confirms WIP. Mainline reads 'Carhartt' only. Exterior: small WIP script on the left chest plus, on many Chase seasons, a large C on the reverse left shoulder. Mainline uses the block wordmark without WIP.",
        ],
        cta: pricingMidCta("ctr_carhartt_hoodie_buybelow_20260919"),
      },
      {
        h: "Carhartt hoodie types: Chase, Hooded Chase, mainline midweight, zip-through",
        p: [
          "Four hoodie types drive the 7 EU Vinted departures in the last 30 days. The WIP Chase Hoodie — pullover, small WIP script on the left chest, often a reverse C — is the piece EU streetwear buyers search for. Very Good Chase in black, hamilton brown, or cypress exits at €28–42, well above the €21 category average. Neutral colourways clear; loud seasonal colourways sit. Size L and XL move fastest on EU Vinted; S and XXL lag.",
          "The WIP Hooded Chase Sweatshirt (larger script across the chest) exits in a similar band, €26–40 Very Good, and is easier to clock from across a rack because of the chest graphic. Script cracking and peel are the fail point: run a thumb across the print at source. Any surface crack drops the piece to Good and the exit toward €18–24. The WIP zip-through (full zip, WIP label at the placket) is less common at charity shops and exits at €24–36 Very Good if the zip runs clean from stop to collar.",
          "Mainline Carhartt midweight hoodies — heavier fleece, block wordmark, no WIP — are the volume of what EU charity shops actually hold. They exit at €14–22 Very Good, around or below the €21 average. A mainline hoodie sourced at €5 still clears. The same piece at €12 does not. If the tag is mainline, price it as a €14–22 garment, not as a Chase. Mixing the two is how Carhartt hoodie inventory stalls.",
        ],
      },
      {
        h: "Is a Carhartt hoodie worth reselling on EU Vinted?",
        p: [
          "Yes, with a WIP check and a sourcing price under €10. At 7 departures in the last 30 days and a €21 average, Carhartt hoodies are not a primary play. They are the fleece that shows up next to the jackets. A clean Chase at €6–8 is one of the better per-minute decisions on a German or French rack. A pilled mainline at €9 is a skip.",
          "Decision rule at the rack: (1) interior tag WIP or mainline, (2) script or wordmark intact, (3) drawcord present, (4) cuffs not pilled to pills-on-pills, (5) ticket vs the condition-tier buy-below above. WIP + Very Good + under €10 → buy. Mainline + Very Good + under €7 → buy as filler. Anything Fair, or mainline above €10 → leave it.",
          "In a session that has both a clean Carhartt hoodie and a clean Carhartt jacket, take the jacket. Jackets exit at €33 average (6 departures in the last 30 days) against hoodies at €21 (7 departures in the last 30 days). Hoodies become the buy when the jacket rail is empty or the hoodie is a Chase clearly under €10. The two categories serve different buyers — chore-coat vs branded fleece — so a mixed Carhartt haul can list both without competing with itself.",
        ],
        cta: pricingBodyCta("ctr_carhartt_hoodie_worth_reselling_20260919"),
      },
      {
        h: "Carhartt vs Tommy Hilfiger vs Ralph Lauren hoodies on EU Vinted",
        p: [
          "Carhartt hoodies track 7 departures in the last 30 days (per tracked models, model_signals, at €21 average). Tommy Hilfiger hoodies track 510 brand-level departures/30d at €19.69 average.e this week. Tommy's flag or small chest logo is the buyer cue; Carhartt's is the WIP script or the block wordmark. Charity-shop tickets in Germany overlap (€5–12). Condition equal and ticket equal, prefer the WIP Chase over a Tommy flag hoodie because Chase has a higher Very Good ceiling (€28–42 vs Tommy's €18–26 band around a €20 average). Prefer Tommy over mainline Carhartt at the same ticket — mainline Carhartt's €14–22 Very Good band is the weaker of the three.",
          "Ralph Lauren hoodies (12 departures in the last 30 days at €50, buy-below €32.50) are a different slot. Same 30-day hoodie volume class, 2.4× the exit. Ralph Lauren tickets higher at donation (€8–18). A Polo hoodie sourced at €12 targeting €45–55 beats a Carhartt Chase sourced at €8 targeting €28–36 on gross. If the session offers both clean, take Ralph Lauren on margin. Take Carhartt when Ralph Lauren is absent, which is the common German workwear-rail case.",
          `The North Face hoodies (4 departures in the last 30 days at €31) exit above Carhartt but move half as often. TNF is sport-casual fleece (Half-dome, Drew Peak); Carhartt is workwear-streetwear. They do not share a buyer. Nike hoodies (9 departures in the last 30 days at €17) undercut Carhartt on price and beat it on frequency — Nike is the volume fleece filler, Carhartt WIP is the identification edge. [Hoodie category comparison →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_carhartt_hoodie_vs_competitors_20260919"),
      },
    ],

    faq: [
      {
        q: "How much does a Carhartt hoodie sell for on EU Vinted?",
        a: "Carhartt hoodies track 7 departures in the last 30 days across EU Vinted at a €21 average exit price as of the week to 19 September 2026. By condition: Like New (no pilling, crisp branding, intact drawcord, firm cuffs) → €28–38. Very Good (light use, print intact, drawcord present) → €18–26. Good (cuff pilling, slight script fade) → €12–18. Fair (heavy pilling, cracked print, missing drawcord) → €8–12. By type: WIP Chase Hoodie in Very Good condition exits at €28–42. WIP Hooded Chase (large chest script) exits at €26–40. WIP zip-through exits at €24–36. Mainline midweight with the block wordmark exits at €14–22. The broader Carhartt brand tracks 17 departures in the last 30 days at a €25 brand average — hoodies are 41% of that volume and exit below jackets (6 departures in the last 30 days at €33). ResaleIQ tracks Carhartt hoodie exit data weekly from EU Vinted departure observations across France, Germany, Spain, Italy, and Portugal.",
      },
      {
        q: "What should I pay for a Carhartt hoodie to make a profit on EU Vinted?",
        a: "The buy-below ceiling for Carhartt hoodies is €13.65 — 65% of the €21 average exit tracked in the week to 19 September 2026, targeting 35% gross margin after Vinted fees of about 5–8%. By condition: Like New (targeting €32 exit) → buy-below €20.80. Very Good (targeting €22 exit) → buy-below €14.30. Good (targeting €15 exit) → buy-below €9.75. Fair (targeting €10 exit) → buy-below €6.50 or skip. Apply the WIP split on top of that: a Chase targeting €32–38 can support a higher ticket than a mainline targeting €16–20. At German and French charity shops Carhartt hoodies typically ticket at €4–12. The risk at source is mistaking mainline for WIP, plus cracked chest script and missing drawcord, both of which drop exit into the Good band.",
      },
      {
        q: "Which Carhartt hoodie sells for the most on EU Vinted?",
        a: "The WIP Chase Hoodie in Very Good condition is the highest-exit Carhartt hoodie on EU Vinted, at €28–42 for black, hamilton brown, or cypress in L/XL. The Hooded Chase with the large chest script exits at €26–40 when the print is uncracked. The WIP zip-through exits at €24–36 if the zip is clean. Mainline midweight hoodies exit at €14–22 and should not be priced as Chase pieces. Chase and Hooded Chase are less common on EU charity-shop rails than mainline; when a clean Chase appears at €6–10 it is the hoodie to take. Loud seasonal colourways sit longer than neutrals.",
      },
      {
        q: "How do Carhartt hoodies compare to Tommy Hilfiger hoodies for reselling on EU Vinted?",
        a: "Carhartt hoodies track 7 departures in the last 30 days (per tracked models, model_signals) at €21 average. Tommy Hilfiger hoodies track 510 brand-level departures/30d at €19.69 average (22 September 2026).ber 2026. Volume and price are close. The gap is the WIP Chase ceiling: a Very Good Chase exits at €28–42, above Tommy's band around the €20 average. Mainline Carhartt (€14–22 Very Good) is the weaker of the two at an equal ticket. Charity-shop prices in Germany overlap. Selection rule: WIP Chase over Tommy at the same source price; Tommy over mainline Carhartt at the same source price. Both brands fill the mid-price branded-fleece slot; neither matches Ralph Lauren hoodies at 12 departures in the last 30 days and €50 average.",
      },
      {
        q: "Is a Carhartt hoodie worth reselling on EU Vinted?",
        a: "Yes, if it is WIP or a cheap clean mainline. Carhartt hoodies track 7 departures in the last 30 days at a €21 average on EU Vinted in the week to 19 September 2026. Buy-below is €13.65. Per-unit net is about €6–15 — below Carhartt jackets (€33 average, 6 departures in the last 30 days) and well below Ralph Lauren hoodies (€50 average, 12 departures in the last 30 days), but viable when a Chase is ticketed at €6–10 on a German or French rail. The identification test (WIP care tag vs mainline, script intact, drawcord present, cuffs not destroyed) is fast. Carhartt hoodies are a rack add-on, not a hunt. Take the jacket when both are clean; take the hoodie when it is a Chase under €10 or a mainline under €7.",
      },
    ],
  },
]
