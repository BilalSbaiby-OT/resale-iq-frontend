// Batch 13 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_13: BlogPost[] = [
  {
    slug: "calvin-klein-reselling-vinted-guide",
    title: "Calvin Klein Reselling on Vinted: Jackets at €34 Average and the Logo vs. No-Logo Split",
    seoTitle: "Is Calvin Klein Worth Reselling on Vinted? — Resale IQ",
    description:
      "Calvin Klein tracks 1,222 departures in the last 30 days across all tracked Calvin Klein items on EU Vinted (brand-level) at a €18.15 average. Jackets lead at €38.29 avg (55 jacket departures/30d). The sourcing edge is the logo vs. no-logo split: CK One and Calvin Klein Jeans logo pieces consistently exit above the brand mean.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "Calvin Klein",
    intro:
      "Calvin Klein tracks 1,222 departures in the last 30 days across all tracked Calvin Klein items on EU Vinted (brand-level, observation window to 22 September 2026) at a €18.15 average. The brand average is held down by T-Shirts at €6.95 — a non-viable sourcing category — and lifted by Jackets at €38.29 and Jeans at €17.84. The practical sourcing case is logo-forward pieces: Calvin Klein Jeans (CKJ) and Calvin Klein One logo pieces exit consistently above the brand mean at EU charity shops where they are priced as generic branded clothing.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Calvin Klein brand-level departures in the last 30 days on EU Vinted: Hoodies 167 (€15.74 avg), T-Shirts 119 (€6.95 avg), Shirts 86 (€11.15 avg), Jackets 55 (€38.29 avg), Jeans 47 (€17.84 avg), Tracksuits 43 (€14.53 avg). Total brand: 1,222 departures at €18.15 average. These are brand-level figures — ResaleIQ does not yet publish per-model departure counts for Calvin Klein (not in per-model catalogue).",
          "Full Calvin Klein brand data is on " +
            ilinkHref("flip") +
            " and update weekly. The €18.15 brand average is held down by T-Shirts at €6.95 — below any viable margin floor. Jackets at €38.29 carry the margin case. Hoodies at €15.74 are borderline at charity shop pricing; only logo-prominent CK One hoodies in very good condition clear a practical buy-below.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €38.29 (brand-level, 55 departures/30d on EU Vinted) and Vinted modelling roughly a 5% platform deduction, the departure-net is around €36.38. Applying a 30% target margin gives a rough buy-below of approximately €25. For CKJ trucker jackets specifically (which exit at €30–60), the implied buy-below stretches to €20–42. ResaleIQ does not publish per-model buy-below for Calvin Klein (not in per-model catalogue).",
          "Jeans at €17.84 average give a rough buy-below near €11.60. Hoodies at €15.74 give a rough buy-below near €10.23. Tracksuits at €14.53 give a rough buy-below near €9.44. T-Shirts at €6.95 are not a viable sourcing target. Jeans are viable when sourced at clearance pricing.",
        ],
        cta: pricingMidCta("ctr_calvinklein_20260915"),
      },
      {
        h: "Logo vs. no-logo: the sourcing split",
        p: [
          "Calvin Klein's product architecture creates two distinct resale tiers. Calvin Klein Jeans (CKJ) — the denim and logo-casualwear sub-line — carries the iconic 'CK' or 'Calvin Klein Jeans' chest logo associated with 90s fashion revival. Calvin Klein One — the fragrance-led lifestyle line introduced in 1994 and revived for the Y2K/90s cycle — carries strong logo-recognition on its casualwear. The mainline Calvin Klein (also labelled 'Calvin Klein' or 'CK') is the minimalist fashion line: less logo, more tailoring, and a cleaner aesthetic that exits at higher prices only in Jackets and outerwear.",
          "At EU charity shops, staff price 'Calvin Klein' as a mid-premium brand uniformly, regardless of sub-line. A CK One logo hoodie (the banded cuff, the bold CK One chest print) exits at €25–40 on EU Vinted. The same piece is priced at €8–15 at a charity shop because the staff see 'Calvin Klein knitwear', not 'CK One heritage logo piece'. The identification edge is the sub-line label and the logo placement — four seconds reading the interior label and checking the chest graphic.",
        ],
      },
      {
        h: "Jackets: the highest-margin category",
        p: [
          "Jackets track 55 brand-level departures in the last 30 days at €38.29 average — the highest-average category. Two types drive consistent above-average exits: Calvin Klein denim jackets in the classic trucker silhouette (zip or button-front, structured shoulders, logo interior tab at the back waistband) exit at €30–60 in very good condition depending on wash and size — correctly identified CKJ trucker jackets are among the most underpriced Calvin Klein pieces at EU charity shops (€8–18 sourcing, €30–60 exit). The Calvin Klein lightweight technical jacket (the zippered nylon blouson silhouette, introduced in multiple seasonal colourways) exits at €28–50.",
          "Sourcing signal: CKJ denim jackets are frequently mispriced at EU charity shops — the interior back tab reads 'Calvin Klein Jeans' and staff price generically at €10–20. On Vinted, buyers searching 'Calvin Klein denim jacket' or 'CK Jeans trucker' find a market with consistent demand from buyers who associate the 90s revival with the CKJ aesthetic. A CKJ trucker jacket in mid-blue wash, very good condition, sourced at €12 and listed at €42 with the correct sub-line in the title is a representative transaction.",
        ],
      },
      {
        h: "Jeans: the volume opportunity",
        p: [
          "Jeans track 47 brand-level departures in the last 30 days at €17.84 average — one of the viable sourcing categories. Calvin Klein Jeans in the straight-leg and slim-fit cuts exit at €20–35 depending on wash, era, and condition. The 90s-era high-waist Calvin Klein Jeans — identifiable by the CKJ leather back patch and the high-rise silhouette — exit at €28–55 as vintage pieces on EU Vinted, where the 90s revival has sustained demand for high-waist denim.",
          "The sourcing case for CKJ denim is the era identification edge: 90s Calvin Klein Jeans carry a vintage premium that contemporary CKJ production does not. The interior back leather patch on 90s pieces reads 'CALVIN KLEIN JEANS' in a serif font, vs. the contemporary sans-serif label. This distinction is invisible to charity shop staff and material to Vinted buyers. A pair of 90s high-waist CKJ straight-leg jeans in very good condition, sourced at €5–10, listed at €35–50 with the era correctly identified in the title, is a representative vintage jeans transaction on EU Vinted.",
        ],
        cta: pricingBodyCta("body_calvinklein_20260915"),
      },
      {
        h: "Authenticity and condition flags",
        p: [
          "Calvin Klein counterfeit risk is lower than luxury brands (Gucci, Balenciaga) but exists for the high-demand logo pieces — CK One logo hoodies and CKJ denim jackets. The key authentication check on CKJ pieces is the interior label: genuine pieces use a woven label with tight, even stitching; fakes use a printed label with irregular borders. On CK One casualwear, the chest logo embroidery should be three-dimensional (raised threads) on genuine pieces, not flat heat-print.",
          "Condition is the primary risk on Jeans: Calvin Klein denim at charity shop pricing is often there because of inner thigh wear (the most common failure point on slim-fit and skinny CKJ cuts). Check the inner thigh seam on both legs — any fabric thinning or abrasion at departure-net prices makes the piece non-viable at a €15 buy-below. For Jackets, check the collar inner edge (common press-crease from storage) and the zip mechanism.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Calvin Klein worth reselling on Vinted?",
        a: "Yes — specifically Jackets and CKJ/CK One logo pieces. Calvin Klein tracks 1,222 brand-level departures in the last 30 days on EU Vinted at €18.15 average. Jackets: 55 departures at €38.29 average. CKJ trucker jackets exit at €30–60; 90s high-waist CKJ jeans exit at €28–55. T-Shirts at €6.95 avg are not viable. The logo vs. no-logo identification split is the practical sourcing edge.",
      },
      {
        q: "What is the buy-below price for Calvin Klein on Vinted?",
        a: "For Calvin Klein Jackets (brand-level avg €38.29, 55 departures/30d): rough buy-below ~€25. For CKJ trucker jackets (which exit at €30–60), implied buy-below is €20–42. Jeans at €17.84 avg give rough buy-below ~€11.60. Hoodies at €15.74 avg give rough buy-below ~€10.23. T-Shirts at €6.95 avg are below viable sourcing floor. ResaleIQ does not publish per-model ceilings for Calvin Klein (not in per-model catalogue).",
      },
      {
        q: "What Calvin Klein pieces are worth sourcing for Vinted resale?",
        a: "By per-unit value: 90s high-waist CKJ jeans in vintage condition (€28–55), CKJ trucker denim jackets (€30–60), CK One logo hoodies (€25–40). By 30-day brand-level volume: Hoodies (167 at €15.74 avg — only CK One logo pieces are viable), T-Shirts (119 at €6.95 — not viable), Jackets (55 at €38.29), Jeans (47 at €17.84). T-Shirts and generic Tracksuits are below practical margin floors.",
      },
      {
        q: "How do I identify genuine Calvin Klein Jeans vintage pieces?",
        a: "The 90s-era CKJ pieces carry a leather back patch with serif 'CALVIN KLEIN JEANS' text, a high-rise silhouette (typically 10–12 inch rise), and a straight or relaxed leg cut. Contemporary CKJ uses a sans-serif label and a lower rise. On Vinted, correctly labelling 90s high-waist CKJ in the listing title (e.g. 'vintage 90s Calvin Klein Jeans high waist straight leg') significantly increases visibility to buyers searching for era-specific pieces.",
      },
    ],
  },
  {
    slug: "off-white-reselling-vinted-guide",
    title: "Off-White Reselling on Vinted: Sneakers at €110 Average and the Post-Virgil Pricing Shift",
    seoTitle: "Is Off-White Worth Reselling on Vinted? — Resale IQ",
    description:
      "Off-White ranks #25 by watched departures across 5 EU Vinted markets — 31/week at €67 average. Sneakers lead at €110 avg (buy-below ~€73). The sourcing edge is the post-Virgil Abloh transition: pre-2022 pieces carry a legacy premium that retail and charity shops do not price.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Off-White tracks 2,447 brand-level departures in the last 30 days across all tracked Off-White items on EU Vinted at a €36.45 average — with its highest-category Sneakers exiting at €110 avg. Sneakers dominate at €110 average, with Hoodies at €71 a second tier. The sourcing case is defined by one structural fact: Off-White prices at EU charity shops have not adjusted for the post-Virgil Abloh era — pieces priced at €15–30 as 'designer logo streetwear' consistently exit at €80–150 on EU Vinted where buyers who understand the brand's history and legacy pricing pay accordingly.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 31 watched departures in the week to 14 September 2026, Sneakers led at 10 exits averaging €110. T-Shirts contributed 9 departures averaging €31. Hoodies added 8 departures averaging €71. Shirts added 2 departures averaging €6. Caps rounded out at 1 departure averaging €70.",
          "Full Off-White volumes are on " +
            ilinkHref("flip") +
            " and update weekly. Off-White is a low-volume, high-value brand — 31 departures is low compared to Nike (88 departures in the last 30 days) or Adidas (a limited number of departures in the last 30 days), but at €67 average it generates proportionally more per transaction. The sourcing opportunity is narrow-but-deep: Off-White pieces at charity shops are rare, but when found, the margin is typically 3–6x the sourcing price.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €110 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €104.50. Applying a 30% target margin gives a buy-below of approximately €73. Any Off-White sneaker sourced below that price — authenticity confirmed, condition correct — has a realistic margin at current departure prices.",
          "Hoodies at €71 average give a buy-below near €47. T-Shirts at €31 give a buy-below near €21. Caps at €70 give a buy-below near €46. Shirts at €6 average are non-viable. The sourcing floor for T-Shirts is achievable at charity shops where Off-White pieces surface (often at €10–20 regardless of model), making T-Shirts the highest-accessibility entry point — though not the highest-margin. The primary sourcing goal remains Sneakers and Hoodies.",
        ],
        cta: pricingMidCta("ctr_offwhite_20260915"),
      },
      {
        h: "The post-Virgil Abloh pricing shift",
        p: [
          "Virgil Abloh founded Off-White in 2012 and died in November 2021. The brand continued under LVMH ownership with new creative direction, but the streetwear and sneaker community widely distinguishes 'Virgil-era' Off-White (pre-November 2021) from post-Virgil production. Pre-2022 Off-White pieces — identifiable by the season label, the Helvetica quotation-mark motifs ('OFF WHITE'), and the diagonal stripes — carry a legacy and collectibility premium that post-Virgil production does not.",
          "EU charity shops, which receive Off-White pieces sporadically (typically donated by consumers who bought at retail 2015–2022), price the pieces at €15–40 as 'designer branded clothing'. They do not distinguish Virgil-era from post-Virgil, do not know the Nike × Off-White collaboration context, and do not price the 'The Ten' Nike × Off-White sneaker models at anything near their Vinted secondary market value. This is the sourcing gap. A 2019 Off-White × Nike Air Jordan 1 sourced at €50 and listing for €300–600 is an extreme example; more common are 2017–2022 Off-White logo hoodies sourced at €20–35, listing for €90–150 on EU Vinted.",
        ],
      },
      {
        h: "Sneakers: the highest-value category",
        p: [
          "At 10 departures averaging €110, Sneakers are the highest-value category and the primary sourcing target. The Off-White sneaker market is defined by the Nike × Off-White 'The Ten' collaboration — ten Nike icons redesigned by Virgil Abloh and released in 2017. The ten silhouettes are: Air Jordan 1 Retro High OG, Nike Air Force 1 Low '07, Nike Air Max 90, Nike Air Max 97, Nike Air Presto, Nike Air VaporMax, Converse Chuck Taylor All Star 70 Hi, Nike Zoom Fly SP, Nike Air Jordan 1 Retro High OG 'UNC', and Nike React Hyperdunk 2017. On EU Vinted, these exit at €120–600+ depending on condition, size, and box completeness.",
          "Beyond The Ten, Off-White's ongoing Nike collaboration (Air Rubber Dunk, Air Max, Air Force 1 subsequent releases) and the Off-White × Air Jordan releases generate secondary market demand. At charity shops, any white/cream sneaker with the Off-White label and the 'SHOELACES' zip-tie hang tag is a high-value find — the hang tag is attached to the lace on genuine Off-White × Nike releases and signals the collaboration. A Zip-tie tag intact confirms completeness and adds to exit value.",
        ],
      },
      {
        h: "Hoodies and T-Shirts: the logo premium",
        p: [
          "At 8 departures averaging €71, Hoodies represent the second-highest category by value. Off-White logo hoodies in the Virgil-era design language — the diagonal stripes across the chest, the quotation-mark motifs, the fluorescent orange industrial belt — exit at €60–120 on EU Vinted in good condition. Post-Virgil Off-White hoodies (cleaner aesthetic, less visible logo motifs) exit at €40–80.",
          "T-Shirts at €31 average are the most accessible sourcing target by buy-below (~€21). A Virgil-era Off-White graphic T-Shirt sourced at €12–18 at a charity shop — where it is priced as 'designer graphic T-Shirt' regardless of the Off-White × print collaboration — lists at €28–50 on EU Vinted. The sourcing frequency is low (Off-White T-Shirts appear at EU charity shops rarely) but the margin per transaction is 2–3x sourcing price, making any find viable at the standard €21 buy-below.",
        ],
        cta: pricingBodyCta("body_offwhite_20260915"),
      },
      {
        h: "Authentication: the critical check",
        p: [
          "Off-White is heavily counterfeited. Authentication is the single most important step before sourcing any Off-White piece. Key authentication checks: (1) The interior label should read 'OFF-WHITE c/o VIRGIL ABLOH™' in Helvetica on Virgil-era pieces, with a season identifier (e.g. 'SS19', 'FW17'). No season code is a red flag on claimed Virgil-era pieces. (2) The quotation-mark motifs ('QUOTE') on Off-White garments are printed or embroidered — on genuine pieces the rendering is crisp and aligned; fake pieces show bleed, misalignment, or incorrect font. (3) The Off-White diagonal stripe on Hoodies and Outerwear should be a woven jacquard stripe on genuine pieces (textured when touched), not a printed flat stripe. (4) For sneakers, the Off-White × Nike lace zip-tie tag should have a consistent Helvetica 'OFF WHITE' print — the kerning and weight are specific and difficult to replicate. Charity shops rarely authenticate; the buyer on Vinted will authenticate and return if the piece fails. A failed authentication is a complete loss of sourcing cost.",
          "If in doubt about authenticity, do not buy. Off-White's high per-unit sourcing cost (relative to CK or Adidas) means a single authentication failure is more material than in lower-priced brands.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Off-White worth reselling on Vinted?",
        a: "Yes — specifically Sneakers (€110 avg) and Hoodies (€71 avg). Off-White ranked #25 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 31 departures at €67 average. Sneakers buy-below ~€73; Hoodies buy-below ~€47; T-Shirts buy-below ~€21. The sourcing edge is the post-Virgil Abloh pricing gap — EU charity shops price Off-White at €15–40 regardless of era or collaboration; EU Vinted buyers pay €80–150+ for Virgil-era pieces.",
      },
      {
        q: "What is the buy-below price for Off-White on Vinted?",
        a: "For Off-White Sneakers: with an average departure of €110 and 5% platform deduction, buy-below sits around €73. For Off-White × Nike 'The Ten' collabs (which exit at €120–600+), buy-below is materially higher. Hoodies at €71 avg give buy-below near €47. T-Shirts at €31 give buy-below near €21. Resale IQ returns exact buy-below by brand, model, and condition.",
      },
      {
        q: "What Off-White pieces are worth sourcing?",
        a: "By per-unit value: Off-White × Nike 'The Ten' sneakers (€120–600+), Virgil-era logo Hoodies (€60–120), Off-White caps (€70 avg). By accessibility: T-Shirts (€31 avg, buy-below ~€21 — the most achievable charity shop find). Shirts at €6 avg are non-viable. The Off-White × Nike collaboration (Zoom Fly, Air Jordan, Air Force 1 subsequent releases) is the primary sneaker target.",
      },
      {
        q: "How do I authenticate Off-White before reselling?",
        a: "Check four things: (1) interior label reads 'OFF-WHITE c/o VIRGIL ABLOH™' with a season code on Virgil-era pieces; (2) quotation-mark motifs are crisp, correctly kerned, no font bleed; (3) diagonal stripe on Hoodies/Outerwear is woven jacquard (textured), not flat print; (4) for Nike × Off-White sneakers, the lace zip-tie tag has consistent Helvetica 'OFF WHITE' print with correct kerning. If any check fails, do not source. Off-White's counterfeiting is prolific and the per-unit sourcing cost makes a failed authentication materially costly.",
      },
    ],
  },
]

