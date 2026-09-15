// Batch 50 of SEO/AEO articles. Same contract as blog-posts.ts.
// Patagonia Jacket EU Vinted price guide — targets
// "patagonia jacket vinted price", "patagonia jacket eu vinted price guide",
// "patagonia jacket resell value europe", "is patagonia jacket worth reselling vinted",
// "patagonia synchilla vinted eu price", "patagonia nano puff vinted eu",
// "outdoor jacket resell vinted eu", "patagonia vs north face vinted eu".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_50: BlogPost[] = [
  {
    slug: "patagonia-jacket-eu-vinted-price-guide",
    title: "Patagonia Jackets on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Patagonia Jacket Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Patagonia jackets track 307 watched departures per week across EU Vinted in September 2026 at a €51 average exit price — the highest jacket departure volume on the platform. Real exit ranges by model (Synchilla, Nano Puff, Down Sweater, R1, Torrentshell), buy-below ceiling €33.15, and how Patagonia jackets compare to The North Face for EU resellers.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 9,

    preflightQuery: "Patagonia",
    intro:
      "Patagonia jackets track 307 watched departures per week across EU Vinted in the week to 15 September 2026 at a €51 average exit price — the largest jacket departure volume of any brand tracked on the platform. At a vol×val score of €15,657 per week (307 × €51), Patagonia jackets represent the single most liquid jacket category in the EU secondhand market: more weekly transactions than The North Face jackets (108/7d at €48), Arc'teryx (which is lower volume at higher per-unit price), and Moncler (which trades at higher price but far fewer departures). The buy-below ceiling of €33.15 (€51 × 0.65) is reliably achievable at EU charity shops and clearance markets, making Patagonia the highest-volume, lowest-friction jacket category available to EU resellers in 2026. This guide covers exit prices by model, buy-below ceilings by category, condition grading checkpoints, and how Patagonia compares to The North Face for EU reselling strategy.",
    definedTerm: {
      name: "Patagonia jacket departure average",
      description:
        "The Patagonia jacket departure average is the average price at which a tracked Patagonia jacket listing leaves the shelf on EU Vinted — not the asking price and not the retail price. Patagonia jackets track 307 watched departures per week in the week to 15 September 2026 across France, Germany, Spain, Italy, and Portugal at a €51 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The broader Patagonia brand tracks 733 watched departures per week at a €37 average across all categories (jackets, hoodies, bags, caps, T-shirts). The buy-below ceiling for the Patagonia jacket category at the €51 exit average is €33.15 — targeting a 35% gross margin after Vinted's 5% seller protection fee. Patagonia jackets have the highest weekly departure volume of any tracked jacket category on EU Vinted.",
    },
    sections: [
      {
        h: "Patagonia jackets on EU Vinted: 307 departures per week at €51 average",
        p: [
          "Patagonia jackets are the highest-volume jacket category tracked on EU Vinted by weekly departure count. At 307 watched departures per week in September 2026 at a €51 average exit price, the category delivers consistent, predictable liquidity across all five EU markets we track (France, Germany, Spain, Italy, Portugal). For context: Patagonia jackets represent 42% of the brand's total 733 weekly departures — the jacket category is the dominant driver, with hoodies (122/7d at €40 avg), bags (115/7d at €24 avg), caps (68/7d at €9 avg), and T-shirts (58/7d at €17 avg) filling out the rest of the brand's EU Vinted footprint.",
          "The €51 average exit price reflects a broad model mix: the Nano Puff and Down Sweater insulated jackets exit at the upper end (€55–90), while the Synchilla fleece — by far the highest-volume individual model — exits at the lower end (€35–55) but at the highest transaction frequency. For sourcing strategy, the average is a portfolio anchor: building a Patagonia jacket rotation at EU charity shops requires sourcing to a blended average rather than a single model target, because the Synchilla is what you find most often, and the Nano Puff is what you source selectively when it appears.",
          `The EU geographic distribution of Patagonia jacket departures is more even than most premium outdoor brands: Germany and France lead volume, but Spain and Italy contribute meaningfully year-round because Patagonia's brand positioning (outdoor sustainability) resonates across the EU eco-conscious consumer segment, not just the colder-climate DE/FR buyer. This means a Patagonia jacket sourced in Madrid or Milan sells just as readily to a buyer in Hamburg. [Full Patagonia brand data →](${ilinkHref("flip")})`,
        ],
      },
      {
        h: "Model breakdown: Synchilla, Nano Puff, Down Sweater, R1, Torrentshell",
        p: [
          "The Synchilla fleece is the backbone of Patagonia's EU Vinted resale market and the model you will encounter most frequently at EU charity shops. The classic Synchilla snap-T pullover exits in the €35–55 range depending on colourway and condition — heritage colourways (teal, salmon, retro grid patterns from the 1990s and early 2000s) exit at the upper end (€50–70+) as the vintage market for early Synchilla has strengthened. A standard Synchilla in a contemporary colourway in clean condition at €40 is a reliable exit. The Synchilla is the only Patagonia model where colourway is as important as condition: a worn Synchilla in a sought-after pattern can exit above a perfect Synchilla in a neutral colourway.",
          "The Nano Puff insulated jacket is the highest-exit individual model in the category and the precision sourcing target. Nano Puff exits in the €55–90 range — above the category average — driven by its packability (it compresses to its own chest pocket), its DWR finish longevity, and its strong brand recognition among outdoor-literate EU buyers. Buy-below for a Nano Puff targeting an €80 exit: €52. The Nano Puff is less common in charity shop rotation than the Synchilla because households holding one know its value; it appears more often in private sales, Facebook Marketplace, and estate sales of outdoor enthusiasts. Authentication is straightforward: the PrimaLoft fill label, the DWR test (water beads on a fresh DWR coat), and the chest logo patch.",
          `The Down Sweater hooded jacket exits in the €65–110 range for clean examples and is the highest-margin single transaction available in the Patagonia jacket category. The Down Sweater's 800-fill down and its distinctive baffle construction make it identifiable and desirable. Condition grading is decisive: a Down Sweater with baffle collapse, fill migration (uneven lumps), or a non-functioning hood drawcord exits at €30–40 rather than €80. The R1 fleece (midlayer technical piece) exits at €40–65 and is sought by outdoor technical users; the Torrentshell rain jacket exits at €45–70 and is the most common hardshell model you'll find in EU charity rotation. [See all model data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_patagonia_jacket_20260915"),
      },
      {
        h: "Buy-below ceiling: €33.15 — and why Patagonia is the most accessible premium jacket category",
        p: [
          "The category buy-below ceiling of €33.15 targets a 35% gross margin at the €51 category average after Vinted's 5% seller protection fee. This ceiling is the most achievable of any premium outdoor brand tracked on EU Vinted: the Synchilla — the highest-volume model — is regularly found at EU charity shops at €10–25 in smaller towns and at €20–35 in larger cities, making €33.15 a ceiling that requires sourcing discipline rather than luck. Contrast with The North Face jacket category (buy-below €31.20 at €48 avg), where the Nuptse and McMurdo are well-understood by charity shop staff and increasingly priced above €25 in major DE and FR cities.",
          "The ceiling varies by model. A Nano Puff sourced at €52 targeting an €85 exit is the same 35% margin at higher absolute value — the Nano Puff is the model to hunt at private sales and estate clearances where price knowledge is lower. A Synchilla sourced at €20 targeting a €45 exit is a simpler trade that requires no authentication expertise. The Synchilla's accessibility is its moat: you can build a Patagonia jacket rotation with no specialist knowledge, sourcing what you find and applying the category buy-below ceiling as a consistent filter.",
          "The vintage Synchilla premium is a genuine additional vector. A Synchilla fleece from the 1990s in an authentic heritage colourway — snap-T salmon/teal, Aztec pattern, early Made in USA label — can exit at €80–150 on EU Vinted from buyers specifically seeking archival pieces. These appear at brocantes, estate sales, and church jumble sales rather than organised charity shops. Identifying pre-2000 Synchillas requires checking the label generation (the block-font Patagonia text label predates the current brand iteration) and the snap-T button placement. The margin on a €25 heritage Synchilla exiting at €100 dwarfs the category average, but the units are infrequent.",
        ],
        table: {
          caption: "Patagonia jacket models — EU Vinted, week to 15 Sep 2026",
          head: ["Model", "Exit range", "Buy-below (35% margin)", "Sourcing channel", "Risk level"],
          rows: [
            ["Down Sweater (hooded)", "€65–110", "€42–72", "Estate sales, outdoor clearances", "Med (condition)"],
            ["Nano Puff", "€55–90", "€36–59", "Private sales, estate sales", "Low (auth easy)"],
            ["Vintage Synchilla (pre-2000)", "€80–150", "€52–98", "Brocantes, jumble sales", "Low (label check)"],
            ["R1 Fleece", "€40–65", "€26–42", "Charity shops, private sales", "Low"],
            ["Torrentshell", "€45–70", "€29–46", "Charity shops", "Low"],
            ["Synchilla (contemporary)", "€35–55", "€23–36", "Charity shops", "Low (high volume)"],
            ["Category average", "€51", "€33.15", "Seasonal clearance", "—"],
          ],
        },
      },
      {
        h: "Authentication: what makes a Patagonia jacket genuine and what damages exit price",
        p: [
          "Patagonia authentication at EU charity shop sourcing prices is low-risk compared to luxury categories — the brand is not a target for sophisticated counterfeiting at price points where resellers operate. The risk is condition misjudgement, not fake authentication. For all insulated models (Nano Puff, Down Sweater): (1) Check the fill label — authentic Patagonia uses PrimaLoft or traceable down with a specific fill-power spec printed on the inner label; (2) Test the DWR — on a clean coat, water should bead on the outer face fabric; (3) Check the zips — authentic Patagonia uses YKK zips on virtually all models from 2010 onward; (4) Check the chest logo — woven, not printed, with clean stitch backing.",
          "Condition grading for insulated models is binary on one dimension: fill integrity. A Down Sweater or Nano Puff with fill migration (uneven lumpiness in the baffles, especially noticeable in the arms) has a permanently compromised exit price. This is irreversible without re-baffling, which EU resellers do not do. The check takes 10 seconds: compress each baffle section with both hands and release — even fill redistributes evenly; migrated fill stays clumped. A jacket that fails this check at €25 at a charity shop is a pass, not a buy, regardless of colourway.",
          "For the Synchilla, condition grading centres on pilling (the fleece surface pills with washing and wear — moderate pilling is priced into the €35 range; heavy pilling drops the exit to €20–25) and zip function (the snap-T front zip is a known failure point on older models). The snap-T's distinctive button-and-snap closure at the collar is a useful authentication marker: all genuine Synchilla snap-T models have this closure; a full-length zip model without snaps is the Snap-T alternative style. Both are genuine Patagonia products; knowing the difference matters for identifying vintage pieces where the snap-T commands the premium.",
        ],
      },
      {
        h: "Patagonia vs The North Face — which EU Vinted jacket category is the better reselling play?",
        p: [
          "By raw departure volume and aggregate weekly value, Patagonia jackets (307 departures/7d at €51 avg, €15,657/week) substantially outperform The North Face jackets (108 departures/7d at €48 avg, €5,184/week) on EU Vinted. The difference is structural: Patagonia's brand positioning as a sustainability-first outdoor brand creates a broader buyer base across the EU, and the Synchilla's accessibility (findable at almost any EU charity shop circuit) means the Patagonia jacket category is self-replenishing as a sourcing category in a way that TNF is not.",
          "For a reseller choosing between the two brands, the decision comes down to sourcing strategy. Patagonia is the volume play: high departure frequency, accessible sourcing, predictable margins at €33.15 buy-below. The Synchilla in particular is a zero-authentication-skill sourcing target — you find it, you check the condition, you buy at or below €33. The North Face is the precision play: lower volume, but higher-margin outliers available (the 1990 Mountain Jacket, the vintage Nuptse) to resellers with authentication knowledge and estate sale access.",
          `In practice: if you are building a repeatable EU secondhand reselling rotation, start with Patagonia. The Synchilla alone gives you a consistent pipeline. Add The North Face selectively when you have authentication confidence for the Nuptse and 1990. A mixed Patagonia (volume) + TNF (outliers) strategy gives you both liquidity and margin upside without requiring you to build expertise in either brand exclusively. [Compare both brands live →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_patagonia_vs_tnf_20260915"),
      },
      {
        h: "EU market patterns: Patagonia's year-round demand and the winter sourcing window",
        p: [
          "Patagonia jacket departures on EU Vinted are more year-round than most technical outerwear categories, driven by the Synchilla fleece — which sells as both a winter mid-layer and a year-round casual piece. The departure data does not show the sharp September–November peak that The North Face jacket category shows; instead, Patagonia jacket departures are elevated throughout the September–March window, with a modest dip in June–July rather than the sharper outerwear seasonality. This means there is no single optimal selling window: Patagonia jackets sourced in summer clear-outs sell reliably in both autumn/winter and early spring.",
          "The sourcing window is nonetheless most productive in June–August, when charity shops across DE, FR, and ES rotate spring/summer stock and outerwear is marked down. The buy-below ceiling of €33.15 is most consistently achievable during this rotation window, particularly for the Synchilla (which moves quickly at charity shops and is repriced down if it stalls). September–October sourcing is still viable for Nano Puff and Down Sweater models at private sales and estate clearances, where seasonal repricing is less aggressive.",
          "The Patagonia brand's 733 total weekly departures across all categories — with jackets at 307 (42%), hoodies at 122 (17%), bags at 115 (16%), caps at 68 (9%), and T-shirts at 58 (8%) — means a reseller working the Patagonia category has multiple complementary product lines. A charity shop visit producing three Synchilla fleeces and a Patagonia tote bag is a viable sourcing session: the bag (€24 avg exit at 115/7d category volume) is a different buyer profile but the same sourcing location. The brand's breadth gives it the highest EU Vinted vol×val score of any outdoor brand we track.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the average price for a Patagonia jacket on EU Vinted?",
        a: "Patagonia jackets track a €51 average exit price across EU Vinted in the week to 15 September 2026, based on 307 watched departures across France, Germany, Spain, Italy, and Portugal. Exit range by model: Down Sweater €65–110, Nano Puff €55–90, vintage Synchilla (pre-2000) €80–150, R1 Fleece €40–65, Torrentshell €45–70, contemporary Synchilla €35–55. The €51 average reflects a weighted mix — sourcing to a specific model requires using that model's exit range, not the category average.",
      },
      {
        q: "What is the buy-below price for a Patagonia jacket on Vinted?",
        a: "The category buy-below ceiling is €33.15 — calculated as €51 × 0.65, targeting a 35% gross margin after Vinted's 5% seller protection fee. Model-specific ceilings: Down Sweater → €42–72 (targeting €65–110 exit), Nano Puff → €36–59 (targeting €55–90 exit), vintage Synchilla → €52–98 (targeting €80–150 exit), Torrentshell → €29–46 (targeting €45–70 exit), contemporary Synchilla → €23–36 (targeting €35–55 exit). The Synchilla is the most findable model at or below buy-below in EU charity shop circuits.",
      },
      {
        q: "Is Patagonia worth reselling on Vinted in Europe?",
        a: "Yes — Patagonia jackets are the highest-volume premium jacket category on EU Vinted with 307 watched departures per week at a €51 average exit price. The category has the highest vol×val score (€15,657/week) of any jacket brand tracked on EU Vinted. The Synchilla fleece in particular is an accessible zero-authentication-skill sourcing target at EU charity shops with a €33.15 buy-below ceiling that is achievable during summer clearance rotations. The Down Sweater and Nano Puff carry higher per-unit margins for selective sourcing at estate sales and private sellers.",
      },
      {
        q: "How do I authenticate a Patagonia Synchilla fleece?",
        a: "The Synchilla's primary authentication markers are: (1) woven chest logo patch with clean stitch backing (not printed or heat-transferred); (2) YKK zip on all models post-2010; (3) the snap-T closure at the collar on snap-T variants (genuine pull-over has the snap button above the zip). Condition is more decisive than authentication at EU resale price points: check pilling (heavy pilling reduces exit by 30–40%), zip function (the snap-T zip stalls on worn examples), and snap closure integrity. Pre-2000 vintage Synchilla is identifiable by the block-font Patagonia label rather than the current iteration.",
      },
      {
        q: "What is the best Patagonia model to resell on EU Vinted?",
        a: "For volume reselling: the Synchilla fleece — highest departure frequency, findable at nearly any EU charity shop circuit, no authentication expertise required, buy-below €33.15 achievable in summer clearance. For margin per unit: the Down Sweater (€65–110 exit, buy-below €42–72) and Nano Puff (€55–90 exit, buy-below €36–59) — require estate sale and private sale sourcing but deliver the highest absolute gross margin per transaction. For vintage premium: pre-2000 Synchilla in heritage colourways (€80–150 exit) at brocantes and estate sales.",
      },
    ],
  },
]
