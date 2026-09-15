// Batch 30 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// New Balance sneakers EU Vinted price guide — targets "new balance vinted price",
// "new balance 550 vinted eu", "new balance 574 vinted price", "new balance resell value".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_30: BlogPost[] = [
  {
    slug: "new-balance-sneakers-price-guide-eu-vinted",
    title: "New Balance Sneakers Price Guide for EU Vinted (2026 Data)",
    seoTitle: "New Balance Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "What New Balance sneakers actually sell for on EU Vinted in 2026: 550, 990, 993, 574, 327. Real departure averages, buy-below prices, and weekly volume across 10 tracked models.",
    date: "2026-09-15",

    preflightQuery: "New Balance",
    category: "Sourcing",
    readMins: 9,
    intro:
      "New Balance ranks #5 by watched departures on EU Vinted, with 240 tracked sneaker departures per week across 10 models as of the week to 14 September 2026 — at a €52 average exit price. That volume beats Adidas (90 total brand departures), Levi's, and almost every other brand on the platform except the market leaders. The brand's strongest models span three distinct tiers: trend-driven (550), heritage running (990/993), and everyday volume (574). This guide breaks down departure data, buy-below prices, and sourcing priorities across the New Balance EU Vinted catalogue.",
    definedTerm: {
      name: "New Balance sneaker departure average",
      description:
        "The New Balance sneaker departure average is the average price at which a tracked New Balance sneaker listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 14 September 2026, the New Balance sneaker departure average across 10 tracked models is €52 (240 observed departures across France, Germany, Spain, Italy, and Portugal). Individual models range from below the category average (574 at volume) to well above it (990v5, 993 in premium colourways).",
    },
    sections: [
      {
        h: "New Balance on EU Vinted: brand overview",
        p: [
          "Across 10 tracked New Balance sneaker models, ResaleIQ recorded 240 watched departures in the 7 days to 14 September 2026, across the 5 main EU Vinted markets (France, Germany, Spain, Italy, Portugal). With a €52 average exit price, New Balance sits above Nike's volume-adjusted average and far above most apparel brands — this is a high-velocity sneaker brand with real margin potential.",
          "The brand's Vinted performance is almost entirely sneaker-driven: 240 of 258 total brand departures (93%) are in the Sneakers category. Tracksuits, hoodies, and T-shirts make up the remaining 7% at much lower exit prices — if you are sourcing New Balance, you are sourcing footwear. Non-footwear New Balance (grey logo tees, PE kit tracksuits) exits below €20 and is not worth prioritising at the buy-below threshold.",
          `[Current New Balance departure data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_nb_guide_intro_20260915"),
      },
      {
        h: "New Balance 550: the trend model above the departure average",
        p: [
          "The 550 is the most culturally active New Balance silhouette on EU Vinted right now. Originally a 1989 basketball shoe, the 550 was revived in 2020 and accelerated through collaborations with Aimé Leon Dore (ALD), making it the most recognisable New Balance on social media across Europe. On EU Vinted, 550 listings exit above the brand's €52 departure average — clean pairs in neutral colourways (white/navy, white/grey, beige) exit at €60–90 depending on condition and colourway.",
          "The buy-below for 550 pairs targeting the upper end of the departure window (€80+) is approximately €53 at 30% margin after the Vinted platform fee. Clean white/grey and white/navy 550s sourced below €50 at charity shops or flea markets represent solid margin — the model's recognisability among younger buyers drives faster liquidation than more niche silhouettes.",
          "ALD collaboration 550s are a separate tier: these exit at €150–400 depending on the colourway, but they require authentication (check the ALD hangtag and box — fakes circulate) and are rarely sourced casually. Do not apply the standard buy-below to ALD pieces; price them against the specific colourway's live Vinted exit data before committing.",
          "Condition priority on 550: the chunky midsole shows creasing and yellowing most visibly on this silhouette — a yellow midsole that looks white in photos is the most common complaint driving returns. Photograph the midsole in natural light before listing.",
        ],
      },
      {
        h: "New Balance 574: the volume workhorse",
        p: [
          "The 574 is the highest-volume New Balance silhouette on EU Vinted by listing count — it is one of the most-listed secondhand sneakers across all EU markets. Exit prices run €25–55 for standard colourways, with the bulk of departures in the €30–45 range. Buy-below for a €38 average 574 exit is approximately €25 at 30% margin.",
          "The 574's volume is a double-edged signal: high buyer demand but also high seller supply, which compresses exit prices toward the lower end of the range. Standard 574s in grey, navy, or brown — the most common colourways — are competitive to list and price-sensitive. The margin exists but it is tighter than on the 550 or heritage running models.",
          "Where the 574 earns its keep in a sourcing operation: it is one of the easiest New Balance models to source below €15 at charity shops (it was a mass-retail product for decades), and even a €38 exit at that sourcing cost represents >100% gross return on the item cost alone. The challenge is condition — 574s are often sourced worn-in, and sole yellowing plus mesh discolouration are the most common value reducers.",
          `[Current New Balance departure data →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "New Balance 990 and 993: the heritage running tier",
        p: [
          "The 990 series (990v5, 990v6) and 993 are the premium end of the New Balance secondhand market on EU Vinted. These models retail at €250–400 new; secondhand exits range from €80–180 depending on condition, version, and colourway. The buy-below for a €120 exit target is approximately €80 at 30% margin.",
          "The 990/993 are 'Made in USA' (MIUSA) models — this is a real differentiator on Vinted. Buyers searching for MIUSA New Balance specifically target these models and will pay above the category average for confirmed MIUSA pairs. Verify on the insole or tongue tag: 'Made in USA' should be present; pairs marked 'Made in Vietnam' or 'Made in China' are non-MIUSA and exit at mainstream category prices, not the MIUSA premium.",
          "The 993 in grey marle (the classic colourway, worn by Steve Jobs) has consistent buyer recognition and exits at €80–130 in clean condition. The 990v5 in 'Marblehead' (light grey, tan accent) is the most-searched 990 colourway on EU Vinted. Both models source infrequently at charity shops (they were never mass-market in Europe) — the more reliable sourcing path is Facebook Marketplace and eBay sold listings where US-imported pairs surface.",
          "Condition priority: 990/993 upper mesh is delicate and darkens with wear — a dirty grey mesh reads as neglect and kills 20–30% of the exit price. A suede brush and sneaker cleaner applied before listing recovers most of this.",
        ],
        cta: pricingBodyCta("body_nb_990_20260915"),
      },
      {
        h: "New Balance 327: the styling pick",
        p: [
          "The 327 is the mid-tier New Balance model with the widest colour and print range — it was introduced in 2020 as a retro-running riff on 1970s New Balance track shoes. On EU Vinted, 327 pairs exit at €40–65 for standard retail colourways, with bold collaborations (MS327 JJJJound, Salehe Bembury) reaching €100–150.",
          "The 327's broad colourway range is both its appeal and its sourcing complexity: high-demand colourways (earthy tones, seasonal limited editions) exit at the upper end; the numerous standard colourways (white, black, generic multicolour) exit toward €40. If sourcing a 327 below €30, verify the colourway before committing — a standard white 327 at €35 and a sand/brown 327 at €35 are not the same sourcing decision.",
          "The buy-below for a €50 average 327 exit is approximately €33 at 30% margin. That sourcing ceiling is achievable at charity shops for retail-priced pairs — the 327 was stocked across mainstream EU sportswear retailers at €100–130, which puts it in regular charity shop rotation.",
        ],
      },
      {
        h: "Model comparison: New Balance EU Vinted at a glance",
        p: [
          "Departure volumes and exit prices vary meaningfully across the New Balance line. The table below maps the main models by departure tier, exit price range, and the buy-below ceiling for a 30% net margin target (after Vinted's approximate 5% platform fee).",
        ],
        table: {
          caption:
            "New Balance EU Vinted: observed departure ranges and buy-below prices, week to 14 Sep 2026",
          head: [
            "Model",
            "Departure tier",
            "Exit range (EU Vinted)",
            "Buy-below (30% margin)",
            "Sourcing ease",
          ],
          rows: [
            [
              "574",
              "High volume",
              "€25–55",
              "~€25",
              "Easy — mass retail origin",
            ],
            [
              "327",
              "Mid volume",
              "€40–65",
              "~€33",
              "Moderate — colourway matters",
            ],
            [
              "550",
              "Trend-driven",
              "€60–90",
              "~€53",
              "Moderate — rising supply",
            ],
            [
              "993",
              "Heritage premium",
              "€80–130",
              "~€58",
              "Hard — rarely charity-sourced",
            ],
            [
              "990v5/v6 (MIUSA)",
              "Heritage premium",
              "€80–180",
              "~€80",
              "Hard — online-sourced",
            ],
          ],
        },
      },
      {
        h: "Sourcing New Balance: where to find pairs worth buying",
        p: [
          "New Balance sourcing in EU markets splits cleanly by model tier. Volume models (574, 327, 550 in standard colourways) circulate regularly in charity shops and at car boot sales — the brand had a broad EU retail presence through Foot Locker, JD Sports, Intersport, and its own stores. Budget €10–35 for charity-sourced pairs in these models.",
          "Heritage running models (990, 993, 1500, 1300) rarely appear in EU charity shops because they were never mass-retail products in Europe. The more reliable path is eBay UK (search 'New Balance 990 990v5 job lot' or individual model + size), Facebook Marketplace, and Vinted cross-market sourcing (buying in a lower-price EU market to relist in a higher-price one). US-imported MIUSA pairs also surface via eBay US sellers shipping to Europe — factor in import duty for commercial volumes.",
          "Authentication note: New Balance does not face the same counterfeit pressure as Nike or Adidas at the standard retail level, but 990/993 MIUSA fakes exist in the resale market. Verify 'Made in USA' on the insole (the raised lettering in the footbed) and the tongue label. Box labels on genuine MIUSA 990s carry a US address (Lawrence, MA); fakes often list a generic 'New Balance Athletic Shoe, Inc.' with no address.",
          `[Check live buy-below prices →](${ilinkHref("pricing")})`,
        ],
        cta: pricingBodyCta("body_nb_sourcing_20260915"),
      },
    ],
    faq: [
      {
        q: "What do New Balance sneakers sell for on Vinted?",
        a: "New Balance sneakers averaged €52 per departure across EU Vinted in the week to 14 September 2026, across 240 observed departures in France, Germany, Spain, Italy, and Portugal. The range is wide: 574s exit at €25–55, 327s at €40–65, 550s at €60–90, and heritage running models (990, 993) at €80–180 depending on condition and colourway. The buy-below price for the brand average (30% net margin after Vinted's platform fee) is approximately €35.",
      },
      {
        q: "Is New Balance worth reselling on Vinted?",
        a: "Yes — New Balance is one of the highest-volume secondhand footwear brands on EU Vinted, with 240 sneaker departures per week at a €52 average as of September 2026. That puts it ahead of Adidas, Levi's, and most apparel brands by volume. The margin window is real: charity-sourced 574s at €10–20 can exit at €35–50; 550s sourced at €40–50 can exit at €70–90. The heritage running tier (990, 993) is harder to source but exits at €80–180.",
      },
      {
        q: "Which New Balance model sells best on Vinted?",
        a: "By departure volume on EU Vinted (September 2026 data), the 574 is the most-departed New Balance model — it has the deepest secondhand supply and buyer base. By exit price, the 990v5 and 993 MIUSA models achieve the highest individual sale prices (€80–180). The 550 is the current trend model, exiting above the brand average at €60–90 with strong buyer recognition among 18–30 year old buyers across France, Germany, and Spain.",
      },
      {
        q: "What is the buy-below price for New Balance on Vinted?",
        a: "Using the EU Vinted departure average of €52 for New Balance sneakers (week to 14 Sep 2026), the buy-below price at 30% net margin (after Vinted's ~5% platform fee) is approximately €35. This is the maximum sourcing cost to hit a defensible margin at the departure average. For specific models: 574 buy-below ~€25 (exits at €38 avg), 550 buy-below ~€53 (exits at €80 avg), 993 buy-below ~€58 (exits at €87 avg). Real-time buy-below prices update with each week's departure data via Resale IQ.",
      },
      {
        q: "Are New Balance 550s worth reselling?",
        a: "Yes, with the right sourcing price. New Balance 550s exit at €60–90 on EU Vinted in standard neutral colourways; the buy-below at 30% margin is approximately €53. If you can source 550s below €45 (feasible at flea markets, car boots, or Facebook Marketplace), the margin window is 35–50% gross. ALD (Aimé Leon Dore) collaboration 550s are a separate tier at €150–400 — verify authenticity before sourcing. Avoid paying over €55 for standard retail colourways; the market is liquid but the margin disappears above that entry price.",
      },
      {
        q: "How do I find New Balance 990 or 993 to resell?",
        a: "990 and 993 MIUSA models rarely appear in EU charity shops. The most reliable sourcing paths: eBay UK (search individual models by version + 'Made in USA'), Facebook Marketplace in the UK (where New Balance has stronger cultural presence than mainland Europe), and eBay US with EU shipping. Budget €60–100 sourcing cost for pairs targeting €90–150 exits. Authentication check: verify 'Made in USA' on the insole footbed and tongue label — fakes exist but are less common than Nike or Adidas equivalents. Box label should reference Lawrence, MA.",
      },
    ],
  },
]
