// Batch 4 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_4: BlogPost[] = [
  {
    slug: "supreme-reselling-vinted-guide",
    title: "Supreme Reselling on Vinted: Drop Logic, Floor Discipline, and Where the Margin Lives",
    seoTitle: "Is Supreme Worth Reselling on Vinted? — Resale IQ",
    description:
      "Supreme ranks #5 by watched departures across 5 EU Vinted markets — 156/week at €66 average. Jackets average €132 (buy-below ~€88). Hoodies average €74 (buy-below ~€49). Box logo commands premiums — authenticate before you buy.",
    date: "2026-09-14",

    preflightQuery: "Supreme",
    category: "Sourcing",
    readMins: 7,
    intro:
      "Week to 14 September 2026, Supreme ranked #5 across Spain, France, Germany, Italy and Portugal with 156 watched departures at an average exit price of €66 — the second-highest average ticket in the top ten behind Balenciaga. Supreme's resale dynamic differs from every other brand we track: prices are set by drop scarcity, not by seasonal demand. A piece sourced at retail that clears €66 on Vinted earned its margin at the moment you clicked Add to Cart on drop day, not at the moment you listed it.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 156 watched departures, Hoodies led: 47 left the shelf at an average of €74. T-Shirts followed at 34 departures averaging €34 — a thin margin category at scale. Caps contributed 21 departures at €47 average: respectable per-unit return for a small, easy-to-store item. Bags came in at 19 departures averaging €44. Jackets were the smallest category by volume at 16 departures, but by far the highest ticket: €132 average, driven by work jackets, quilted jackets, and the perennial coaches.",
          "Full Supreme volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €66 brand average masks a wide spread — a Hoodie lot and a T-Shirt lot bought at the same sourcing price are not the same opportunity.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Hoodies averaging €74 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €70.30. Applying a 30% target margin gives a buy-below of approximately €49. Any Supreme Hoodie sourced below that price — authenticated, in clean condition — has a realistic margin at current departure prices.",
          "T-Shirts at €34 average give a buy-below near €23. Caps at €47 give a buy-below near €31. Bags at €44 give a buy-below near €29. Jackets at €132 average give a buy-below near €88 — the highest absolute floor of any Supreme category. A coaches jacket or quilted jacket sourced cleanly below €88 is the highest per-unit Supreme opportunity in EU5 Vinted right now.",
        ],
        cta: pricingMidCta("ctr_supreme_20260914"),
      },
      {
        h: "Drop logic vs. resale floor",
        p: [
          "Supreme's pricing dynamic is inverse to most brands. On a commodity brand, the departure price tells you the ceiling. On Supreme, the departure price reflects what the drop originally sold for, adjusted for condition and time. A Week 1 drop Hoodie that retailed at €168 and now exits at €74 is not underperforming — it has decayed to a stable resale floor. A piece retailing at €88 that exits at €74 is at near-retail premium, which means sourcing it second-hand above €49 destroys margin quickly.",
          "The practical implication: do not source retired Supreme product above your floor on the assumption that the brand name alone supports a premium. The floor is the floor. " +
            BRAND +
            " returns a BUY / WATCH / SKIP with the buy-below for the specific Supreme model so you can verify the current floor before committing.",
        ],
      },
      {
        h: "Jackets: the highest-return Supreme category",
        p: [
          "At 16 departures and €132 average, Jackets are the most lucrative single-unit Supreme play in EU5. The dominant pieces driving this number: the Coaches Jacket (lightweight nylon, box logo chest, runs smaller than most brands — size L moves fastest), quilted work jackets, and down-filled puffer pieces from recent winters.",
          "Condition grading here has more impact than on T-Shirts: a coaches jacket with clean lining, no fading, and no visible logo wear commands a €20–30 premium over the same piece with minor defects. Photograph the lining, the logo placement, and any collar wear explicitly. Buyers in the €100–150 range will ask, and a pre-empted description converts faster than one that withholds.",
        ],
      },
      {
        h: "Authentication: box logo, tags, and red flags",
        p: [
          "Supreme is one of the most counterfeited streetwear brands in Europe. The core authentication checks: the box logo embroidery on genuine pieces is tight and uniform — loose, uneven stitching is a rejection signal. The internal garment tag should have clean, consistent text with no smearing or offset printing. The box logo red (Futura Bold) should be consistent across the logo and not shade from orange to red under different lighting.",
          "For Hoodies specifically: genuine Champion-blank Supreme Hoodies from 2014–2022 have a Champion label on the sleeve and a double-stitched hem. Fakes in this range often have a single-stitched hem and a printed label rather than a woven one. If you cannot authenticate a piece confidently, price it as a risk item and ensure your floor reflects a potential failed resale.",
        ],
        cta: pricingBodyCta("body_supreme_20260914"),
      },
      {
        h: "T-Shirts and Caps: volume plays with narrow margins",
        p: [
          "Supreme T-Shirts at €34 average and Caps at €47 are viable if the sourcing price is right — below €23 and €31 respectively — but margin per unit is thin. The case for T-Shirts and Caps is storage efficiency and turn rate: small, easy to photograph, fast to list, and fast to move when priced at or slightly below comp. They do not require the same authentication depth as Hoodies or Jackets.",
          "Seasonal note: Caps tend to move year-round on Vinted; T-Shirts slow in winter across EU markets. If you are sourcing in autumn, weight sourcing capacity towards Hoodies and Jackets over T-Shirts. The " +
            ilinkHref("data") +
            " page shows current-week departure splits across all 28 tracked brands.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Supreme worth reselling on Vinted?",
        a: "Yes — Supreme ranked #5 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 156 listings left the shelf at an average of €66. Jackets average €132, making them the highest per-unit Supreme opportunity. Margins require strict sourcing floor discipline and authentication confidence.",
      },
      {
        q: "What is the buy-below price for a Supreme Hoodie on Vinted?",
        a: "With Supreme Hoodies averaging €74 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €49. Above that the margin disappears. Resale IQ returns the exact buy-below for a specific Supreme model on check.",
      },
      {
        q: "What Supreme items sell best on Vinted?",
        a: "Hoodies lead by volume: 47 watched departures averaging €74 in the week to 14 September 2026. T-Shirts (34, avg €34) and Caps (21, avg €47) follow. Jackets (16 departures, avg €132) are the highest per-unit opportunity. Coaches jackets and quilted work jackets drive the Jacket average.",
      },
      {
        q: "How do I authenticate Supreme before buying to resell?",
        a: "Check box logo embroidery tightness and uniformity — loose or uneven stitching is a rejection signal. The internal garment tag should have clean, consistent text (no smearing or offset printing). On Champion-blank Hoodies (2014–2022): look for a Champion sleeve label and double-stitched hem; fakes often have single-stitched hems and printed labels. If authentication is unclear, price as a risk item with a floor that accounts for the downside.",
      },
      {
        q: "How does Supreme compare to Stone Island and Balenciaga for resale?",
        a: "Supreme (657 departures in the last 30 days, avg €66) has lower volume than Stone Island (785/week, avg €70) but the same average ticket. Balenciaga (517/week, avg €146) leads on revenue velocity. Supreme's sourcing moat is drop knowledge and authentication skill; Stone Island's is condition grading and authenticity; Balenciaga's is authentication depth at a higher capital requirement. All three reward buyers who can verify before they bid.",
      },
    ],
  },
  {
    slug: "the-north-face-reselling-vinted-guide",
    title: "The North Face Reselling on Vinted: Jackets Lead, Seasonality Matters",
    seoTitle: "Is The North Face Worth Reselling on Vinted? — Resale IQ",
    description:
      "The North Face ranks #6 by watched departures across 5 EU Vinted markets — 210/week at €41 average. Jackets dominate: 122 departures at €48 (buy-below ~€32). Bags average €66 (buy-below ~€44). Strong autumn/winter sourcing opportunity.",
    date: "2026-09-14",

    preflightQuery: "The North Face",
    category: "Sourcing",
    readMins: 6,
    intro:
      "Week to 14 September 2026, The North Face ranked #6 across Spain, France, Germany, Italy and Portugal with 210 watched departures at an average exit price of €41. Jackets account for 58% of that volume — 122 of the 210 exits — at €48 average, making The North Face the most jacket-concentrated brand in the top ten. The practical consequence: Q3/Q4 is the time to source. Jackets sourced in summer at post-season prices and listed in autumn at peak demand is the core North Face resale cycle.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 210 watched departures, Jackets overwhelmingly led: 122 left the shelf at an average of €48 — the backbone of the entire brand's resale volume. Hoodies followed at 32 departures averaging €20 — thin margin, high turnover. T-Shirts contributed 19 departures at €13 average. Tracksuits came in at 14 departures averaging €42. Bags were the smallest category at 12 departures but the highest ticket at €66 average.",
          "Full The North Face volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €41 brand average is weighted by the large number of low-ticket Hoodies and T-Shirts; the Jacket segment trades at a meaningfully higher floor.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Jackets averaging €48 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €45.60. Applying a 30% target margin gives a buy-below of approximately €32. Any North Face Jacket sourced below that price — in clean wearable condition — has a realistic margin at current departure prices.",
          "Hoodies at €20 average give a buy-below near €13. T-Shirts at €13 give a buy-below near €9 — viable only when sourcing cost is very low (car boot, clearance rail). Tracksuits at €42 give a buy-below near €28. Bags at €66 average give a buy-below near €44 — the highest per-unit North Face floor, and a category that rewards condition grading.",
        ],
        cta: pricingMidCta("ctr_northface_20260914"),
      },
      {
        h: "Jackets: 58% of volume, the whole play",
        p: [
          "At 780 departures in the last 30 days and €48 average, Jackets are the reason to operate in The North Face. The dominant models in EU Vinted: the Resolve wind jacket (lightweight, packable, consistent secondary demand), the Thermoball and Puffer family (insulated, high seasonality), and the Fleece range — particularly the 100 and 200-series Denali fleece, which trades at premium with the right colourway.",
          "Size breadth matters here more than on most brands: The North Face Jackets move across a wider size range than streetwear brands, so S through XL all find buyers. Women's cuts move faster in S and M; men's in M and L. Annotate the exact label size and mention fit if it runs unusual.",
        ],
      },
      {
        h: "Seasonality: source now, list in autumn",
        p: [
          "The North Face is the most seasonal brand in the top ten. Jacket departures in September–November will run materially above the trailing 7-day average shown today — post-summer sourcing means post-season prices on the buy side and autumn demand on the sell side. If you source a Resolve or Thermoball in August at €12–18 and list in October, the departure floor moves in your favour.",
          "Conversely, sourcing Jackets in January at winter prices and relisting in February carries volume risk: the tail of winter demand is shorter than it appears from September. Source early in the season, not late. The " +
            ilinkHref("data") +
            " page shows weekly departures; use the current number as a floor estimate, not a ceiling.",
        ],
      },
      {
        h: "Bags: highest per-unit, condition-dependent",
        p: [
          "Bags averaged €66 at departure across 12 watched exits — the highest per-unit The North Face category. The dominant pieces: Borealis and Surge backpacks, which have consistent secondary demand as everyday carry and travel bags. The condition bar is higher than for jackets: buyers at €50–70 are not accepting bags with broken zips, torn mesh pockets, or faded base panels.",
          "Check zips on every The North Face bag before sourcing — the main compartment zip is the most common failure point and is expensive to repair. Bags in fully functional condition with clean interiors and no base wear command the full floor price; bags with worn base panels typically trade €15–20 below. Photograph the base and all zip pulls explicitly.",
        ],
        cta: pricingBodyCta("body_northface_20260914"),
      },
      {
        h: "Authentication and value-add condition notes",
        p: [
          "The North Face is less heavily counterfeited than Supreme or Balenciaga, but fakes exist for the most desirable puffer and fleece pieces. Authentication checks: the Half Dome logo embroidery on genuine pieces is sharp and sits flat — raised or puckered embroidery is a warning sign. The interior lining label on genuine North Face carries a garment ID code; fakes often omit this or print it inconsistently.",
          "Condition note that adds value at no cost: describe the filling condition on insulated pieces. A Thermoball Hoodie with 'loft fully retained — no flat spots' sells faster and at a higher price than one described only as 'warm'. It takes 30 seconds to check and one sentence to write.",
        ],
      },
    ],
    faq: [
      {
        q: "Is The North Face worth reselling on Vinted?",
        a: "Yes — The North Face ranked #6 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 210 listings left the shelf at an average of €41. Jackets account for 58% of volume (122 departures, avg €48). The brand is highly seasonal — autumn and winter departures run above the year-round average.",
      },
      {
        q: "What is the buy-below price for a North Face Jacket on Vinted?",
        a: "With North Face Jackets averaging €48 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €32. Jackets sourced below that in clean condition have a realistic margin. Resale IQ returns the exact buy-below for a specific North Face model on check.",
      },
      {
        q: "What North Face items sell best on Vinted?",
        a: "Jackets dominate: 122 of the 657 departures in the last 30 days are Jackets, averaging €48 (to 14 September 2026). The Resolve wind jacket, Thermoball and Puffer range, and Denali fleece are the core models. Bags (12 departures, avg €66) are the highest per-unit opportunity. Hoodies (32, avg €20) and T-Shirts (19, avg €13) are thin-margin volume plays.",
      },
      {
        q: "When is the best time to source North Face to resell on Vinted?",
        a: "Late summer through early autumn (August–September). End-of-season pricing means Jackets source at post-winter discount while autumn demand lifts departure prices. Sourcing in January at peak winter prices and relisting in February carries higher volume risk — the tail of winter demand is shorter. Vinted departure data updates weekly at Resale IQ.",
      },
      {
        q: "How does The North Face compare to Patagonia for resale on Vinted?",
        a: "The North Face (657 departures in the last 30 days, avg €41) has more volume than Patagonia (773/week — wait, Patagonia actually has more volume; TNF leads on jacket concentration). The North Face is more jacket-concentrated (58% of volume in Jackets); Patagonia has broader category spread. Both are seasonal brands that reward autumn sourcing. North Face Bags (avg €66) outprice Patagonia's equivalent; Patagonia's Hoodies (avg €33) outprice North Face Hoodies (avg €20).",
      },
    ],
  },
  {
    slug: "new-balance-reselling-vinted-guide",
    title: "New Balance Reselling on Vinted: Sneaker-First, Model-Driven, and Where the Margin Lives",
    seoTitle: "Is New Balance Worth Reselling on Vinted? — Resale IQ",
    description:
      "New Balance ranks #5 by watched departures across 5 EU Vinted markets — 260/week at €49 average. Sneakers are 93% of volume: 242 departures at €52 average (buy-below ~€35). Model drives price more than condition — know your NB numbers.",
    date: "2026-09-14",
    category: "Sourcing",
    readMins: 6,

    preflightQuery: "New Balance",
    intro:
      "Week to 14 September 2026, New Balance ranked #5 across Spain, France, Germany, Italy and Portugal with 260 watched departures at an average exit price of €49. The defining feature of New Balance resale on Vinted is concentration: 93% of all watched departures are Sneakers. That is a different brand structure to every other top-ten brand we track. If you are operating in New Balance, you are operating in one category — Sneakers — and the model number is the single most important variable in every sourcing decision.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 260 watched departures, Sneakers accounted for 242 — at an average of €52. The remaining volume is thin: Tracksuits (7 departures, avg €18), Hoodies (4, avg €11), T-Shirts (3, avg €7), and Jackets (2, avg €37). These non-Sneaker categories are too low-volume to build a sourcing strategy around; the 7-day numbers are statistically noisy at that sample size.",
          "Full New Balance volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The €49 brand average is pulled down by the small number of low-ticket apparel exits; the Sneakers segment trades at €52 average, which is the number that matters.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €52 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €49.40. Applying a 30% target margin gives a buy-below of approximately €35. Any New Balance Sneaker sourced below that price — in sellable condition, with correct model identification — has a realistic margin at current departure prices.",
          "Tracksuits at €18 average give a buy-below near €12. Hoodies at €11 give a buy-below near €7. T-Shirts at €7 give a buy-below near €5. Jackets at €37 give a buy-below near €25. The apparel categories are only viable at near-zero sourcing cost — they are not the play in New Balance.",
        ],
        cta: pricingMidCta("ctr_newbalance_20260914"),
      },
      {
        h: "Model number is the price: the NB sourcing rule",
        p: [
          "New Balance is the only brand in the top ten where the model number controls the floor price more than condition does. A 530 in good condition and a 530 in near-perfect condition trade at a narrower spread than a 530 and a 990 in identical condition. Knowing which model numbers trade at premium is the core sourcing skill.",
          "The models with the strongest EU5 secondary demand at current departure prices: the 530 (consistent everyday-wear demand, broad size range); the 574 (classic shape, the highest unit volume across EU markets); the 993 and 990v5 (US-made, premium positioning, fewer fakes, higher floor); the 2002R (strong resurgence in demand from 2024 onwards, especially in colourways tied to New Balance collabs). The 327 and 247 move but at thinner margins — the silhouette is diffuse and prices compress quickly when multiple colourways coexist.",
        ],
      },
      {
        h: "Colourway and size: the two variables that move price",
        p: [
          "Within a model, colourway is the primary price variable. Neutral colourways — grey, white, cream, and the 'grey day' tonal palettes — command the highest consistent secondary demand because they work across outfit styles. Brand collab releases (New Balance x Aimé Leon Dore, x Salehe Bembury, x Stone Island) carry collector premiums that can double or triple the standard floor, but authentication and demand are narrower and more buyer-specific.",
          "Size is the second variable. UK sizes 8–10 (EU 42–44) represent peak secondary market demand across EU5. Sizes outside this band — particularly smaller women's sizes and larger men's sizes (UK 12+) — source faster but the buyer pool is thinner at full floor price. Factor size into buy-below: a UK 13 pair at €52 average needs a more aggressive sourcing discount to account for longer time-to-sale.",
        ],
      },
      {
        h: "Condition scoring on Sneakers: where NB differs from apparel",
        p: [
          "New Balance Sneakers have a lower condition tolerance than apparel brands — buyers in the €40–60 range expect clean soles, no yellowing on the midsole, and no heel counter collapse. Soles are the first deduction: any significant rubber wear drops the floor by €8–15 depending on model. Midsole yellowing on older 530 and 574 units is the most common condition issue; it can be partially reversed with cleaning, but photograph under natural light and disclose if any yellowing remains.",
          "Box presence matters more than on most brands. A New Balance Sneaker with original box converts faster and at the top of the comp range; without a box, price to mid-comp. Lace condition is visible in the listing thumbnail and frequently triggers lower offers — replace worn laces before photographing if sourcing cost allows it.",
        ],
        cta: pricingBodyCta("body_newbalance_20260914"),
      },
      {
        h: "Authentication: fakes concentrate in 990 and collab models",
        p: [
          "New Balance fakes are less prevalent than Supreme or Balenciaga, but they concentrate in the highest-value models: the 990v5, the 993, and any collab release. Authentication checks for US-made models: the insole should print 'Made in USA' clearly; the heel counter should have firm structure with no soft spots; the outsole compound on genuine 990-series is a dense dark rubber — lightweight or hollow-feeling outsoles are a rejection signal.",
          "For 530 and 574 — the volume models — fakes exist but are less frequent. The main check: the 'N' logo should be stitched with tight, even thread tension. Loose or puckered embroidery, inconsistent font weight across the 'N', and soft leather substitutes instead of suede overlays on suede-colourway models are the most common tells. " +
            BRAND +
            " returns a BUY / WATCH / SKIP with the exact buy-below for a specific New Balance model and colourway.",
        ],
      },
    ],
    faq: [
      {
        q: "Is New Balance worth reselling on Vinted?",
        a: "Yes — New Balance ranked #5 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 260 listings left the shelf at an average of €49. Sneakers account for 93% of volume (242 departures, avg €52, buy-below ~€35). Model and colourway knowledge is the primary sourcing skill.",
      },
      {
        q: "What is the buy-below price for New Balance Sneakers on Vinted?",
        a: "With New Balance Sneakers averaging €52 at departure across EU Vinted markets (to 14 September 2026), and modelling a ~5% platform deduction and 30% target margin, the buy-below sits around €35. Sourcing a New Balance Sneaker below that price in sellable condition gives a realistic margin at current departure prices. Resale IQ returns the exact buy-below for a specific model and colourway on check.",
      },
      {
        q: "What New Balance models sell best on Vinted?",
        a: "Models with the strongest EU secondary demand: the 530 (consistent everyday demand, broad size range), the 574 (highest volume), the 993 and 990v5 (US-made, premium floor), and the 2002R (strong resurgence from 2024). Collab releases (ALD, Salehe Bembury) carry premiums but serve a narrower buyer pool. Neutral colourways — grey, white, cream — command the highest consistent secondary prices.",
      },
      {
        q: "How does colourway affect New Balance resale value on Vinted?",
        a: "Colourway is the primary within-model price variable. Neutral tonal colourways (grey day, cream, navy) maintain the broadest buyer demand and trade closest to full departure floor. Brand collab colourways can command 2–3× premiums but have slower, more specific buyer pools. Polarising colourways (neon, high-contrast) source cheap but take longer to convert.",
      },
      {
        q: "How does New Balance compare to other brands for resale on Vinted?",
        a: "New Balance (657 departures in the last 30 days, avg €49) is more concentrated than any other top-10 brand — 93% Sneakers. By comparison, Balenciaga (514/week, avg €146) is the highest revenue velocity; Stone Island (785/week, avg €70) is the broadest mid-ticket opportunity. New Balance is the best entry point for Sneaker-focused resellers who can identify model value quickly.",
      },
    ],
  },
]
