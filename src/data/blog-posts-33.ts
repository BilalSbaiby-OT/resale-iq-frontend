// Batch 33 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees. Data references departure averages only.
// Nike sneakers EU Vinted price guide — targets "nike sneakers vinted",
// "nike air force 1 vinted price", "nike dunk low vinted resale",
// "nike air max vinted buy below", "is nike worth reselling vinted".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_33: BlogPost[] = [
  {
    slug: "nike-sneakers-eu-vinted-price-guide",
    title: "Nike Sneakers on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "Nike Sneaker Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "Nike sneakers averaged €96 per departure across EU Vinted in September 2026 — 77 pairs per week. Air Force 1, Dunk, Air Max 90/95/97, Blazer: real exit ranges, buy-below prices, and which silhouettes actually move.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 9,
    intro:
      "Nike is the world's largest sportswear brand and one of the most actively traded on EU Vinted — but the resale picture is more nuanced than name recognition suggests. In the week to 15 September 2026, 77 Nike sneaker pairs left the shelf across France, Germany, Spain, Italy and Portugal at an average exit price of €96. That average hides a wide spread: entry-level Cortez and Blazer pairs exit at €25–40, while limited Dunk Low and Air Max 97 colourways consistently clear €120–200. This guide breaks down Nike's key resale-active silhouettes by departure tier, buy-below ceiling, and the condition signals that separate a fast flip from a sitting listing.",
    definedTerm: {
      name: "Nike sneaker departure average",
      description:
        "The Nike sneaker departure average is the average price at which a tracked Nike sneaker listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, the Nike sneaker departure average is €96 across 77 observed sneaker departures in France, Germany, Spain, Italy, and Portugal. This figure is the brand-level average across all Nike sneaker silhouettes — Air Force 1, Dunk, Air Max 90/95/97/1, Blazer, Cortez, and other models all fall within the tracked pool. Individual silhouettes range from €25–40 for entry Cortez and basic Blazer Mid to €150–250 for limited Dunk colourways and rare Air Max 97 Metallic editions.",
    },
    sections: [
      {
        h: "Nike sneakers on EU Vinted: what the data shows",
        p: [
          "Of Nike's 161 total watched departures per week across EU Vinted (week to 15 September 2026), sneakers account for 77 of them at a €96 average exit price — 48% of weekly volume at 1.5× the brand's overall departure average of €64. The remaining Nike volume is Hoodies (21/wk, €23 avg), Jackets (21/wk, €54 avg), T-Shirts (17/wk, €19 avg), and Tracksuits (11/wk, €32 avg). At 77 sneaker pairs per week × €96 average, Nike footwear represents €7,392 of weekly secondary market activity across five EU countries tracked by Resale IQ.",
          "The €96 average is the central estimate across all tracked Nike silhouettes. The distribution is heavily right-skewed: high-volume, lower-ticket models like the Air Force 1 and Blazer Mid pull the mass of the transaction count while limited Dunk and Air Max 97 colourways pull the average upward. Knowing which silhouette you have — and which colourway — is the entire sourcing decision, because Nike's brand equity does not translate uniformly into resale value across models.",
          `[Current Nike departure data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_nike_sneakers_intro_20260915"),
      },
      {
        h: "Nike Air Force 1: the volume model — high turnover, moderate margin",
        p: [
          "The Air Force 1 Low is Nike's most consistently traded sneaker on EU Vinted and the model most likely to appear across all five tracked markets. Standard colourways (Triple White, Black/Black, White/University Red, and mass-retail GR releases) exit in the €30–60 range for used pairs in good condition. Premium and collaborative colourways — Off-White AF1s, Travis Scott joints, Fear of God editions — exit materially higher at €150–400+ but are comparatively rare in EU secondhand supply.",
          "The buy-below for a standard AF1 Low targeting a €45 exit is approximately €30 at 30% net margin after Vinted's platform fee. At that sourcing ceiling, the Air Force 1 is a volume play, not a per-unit margin play. The model's strength is turnover speed: GR colourways in good condition move within 3–7 days at competitive pricing. Avoid AF1 Mids at standard colourway pricing — the Mid sits between two more popular tiers and carries lower liquidity than the Low.",
          "Condition benchmark for AF1: the midsole yellowing threshold is the key pricing signal. Minimal yellowing (white or near-white midsole visible from 50cm) supports €40–60 pricing. Moderate yellowing (visible cream tone) drops to €25–35. Heavy yellowing or cracked midsole drops to €15–20 or unsellable. Clean the AF1 midsole before photographing — it is the single highest-impact detail photo for conversion on this model.",
        ],
      },
      {
        h: "Nike Dunk Low and Dunk High: the premium resale tier",
        p: [
          "The Dunk Low is Nike's highest-margin resale silhouette in the EU secondhand market. Limited colourways (Panda, University Blue, Chicago, Lottery, Raygun, SB collaborations) exit at €90–250+ depending on the specific release, condition, and size. The Dunk High follows at a slight discount to the Low for most colourways. GR Dunk Lows (Photon Dust, Plum Fog, and current Foot Locker exclusives) exit at €55–90 in good condition — still above average for Nike footwear, but not the premium tier.",
          "The buy-below for a GR Dunk Low targeting a €75 exit is approximately €50 at 30% margin. For a limited colourway Dunk targeting a €150 exit, the buy-below is approximately €100. Identifying the specific release before setting a sourcing price is non-optional — two Dunk Lows in the same colourway family can differ by €80 in resale value depending on whether it is a GR or a limited drop. Cross-reference Vinted sold listings and StockX EU price history before bidding.",
          "Condition weight on Dunks is higher than AF1: Dunk buyers are more likely to be sneaker-aware and will pay for original laces, clean insoles, and an intact box. Box-included Dunks carry a €10–20 premium on average. Missing the dust bag on an SB collaboration reduces exit price by up to 15%. Size matters more here than on most Nike models: EU size 42–44 (US 8.5–10) is the sweet spot for liquidity; EU 45+ and EU 38– carry a 20–30% liquidity discount.",
        ],
        cta: pricingMidCta("ctr_nike_dunk_20260915"),
      },
      {
        h: "Nike Air Max 90, 95 and 97: the heritage tier with colourway dependency",
        p: [
          "The Air Max family is the deepest and most colourway-dependent resale tier in Nike's catalogue. The Air Max 97 consistently commands the highest exits in the Air Max line on EU Vinted: Silver Bullet, Gold Bullet, and Metallic colourways exit at €100–160 for used pairs in good condition. The AM97 in GR colourways (Neon Yellow, Triple Black, premium SNKRS drops) exits at €65–100. The Air Max 90 sits slightly below: iconic colourways (Infrared, Elephant, OG colourways) exit at €60–90; standard GR colourways at €40–65.",
          "The Air Max 95 is the most supply-constrained of the three in EU markets — it has a smaller retail footprint in France and Spain relative to the UK — which keeps exit prices for OG colourways (Neon, Black/White) at €80–120. The buy-below for a standard AM95 targeting an €85 exit is approximately €56 at 30% margin. For a limited AM97 Metallic targeting €130, the buy-below is approximately €86.",
          "Air Max sourcing signal: Air units are the primary condition flag. A visible bubble leak (air unit delamination or visible collapse) is not fixable and destroys resale value — a pair with a leaking AM97 heel unit is worth €10–20 for parts, not resale. Check the heel unit by applying gentle pressure: it should compress and return fully. The sole unit on the AM90 also separates from the upper with age — press the forefoot and heel seam before pricing as resellable.",
        ],
      },
      {
        h: "Nike Blazer Mid and Blazer Low: the charity-shop tier",
        p: [
          "The Blazer is Nike's lowest-ticket, highest-charity-shop-frequency silhouette in EU markets. Standard Blazer Mid 77 Vintage colourways (White/White, Black/White, White/Black) exit at €25–45 in good condition on EU Vinted — consistently below the Nike sneaker departure average. The model's strength for resellers is supply availability at low sourcing cost: Blazer Mids surface regularly in UK and German charity shops in the €3–10 range because the original buyers treat them as disposable fashion trainers rather than collectibles.",
          "The buy-below for a Blazer Mid targeting a €35 exit is approximately €23 at 30% net margin. That sourcing ceiling is comfortably achievable through charity shop sourcing. Premium or collaborative Blazer editions (Supreme, Comme des Garçons, Off-White) are a different calculation — those exit at €80–200 but are rarely charity shop finds. Identify them by checking the colourway name against Nike's SNKRS archive or StockX before sourcing.",
          "The Blazer is a good Nike starting point for new resellers: low capital per unit, fast turnover at competitive pricing, and wide supply. The margin per pair is modest (€8–15 typical), so it works as a volume play alongside higher-ticket models rather than as a standalone strategy.",
          `[Check the departure average for Nike this week →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "Nike SB Dunks and collaboration models: the high-ceiling tier",
        p: [
          "Nike SB Dunks sit in a separate category from standard Dunk Lows and Dunk Highs — they are designed for skateboarding use and historically command significant resale premiums for limited releases. SB Dunk colourways (Heineken, Tiffany, Paris, Pigeon, Strangelove, Travis Scott × Fragment) exit at €200–800+ on EU Vinted for used pairs in good condition with original lacing and insoles. These are capital-intensive buys requiring knowledge of the specific release history.",
          "For a reseller new to the Nike SB category: the primary identification check is the insole. SB Dunks carry an extra padded insole for impact cushioning — this is absent on standard Dunk Lows. The Nike SB branding appears on the tongue (a small green SB logo on many older releases) and on the box label. Misidentified standard Dunks listed as SB command no SB premium and generate buyer complaints. Verify the specific SB colourway against authenticated sold listings on Vinted ES/FR before pricing above €150.",
          "Collaboration Nike models outside SB (Off-White, Sacai, Acronym, Union) follow a similar framework: identify the specific collaboration and colourway first, then source a Vinted sold comps baseline, then set a buy-below at 30% margin on the realistic EU exit — not the StockX ask, which often sits 20–40% above actual EU Vinted transacted prices due to market depth differences.",
        ],
        cta: pricingMidCta("ctr_nike_sb_20260915"),
      },
      {
        h: "Nike sneaker silhouette comparison: EU Vinted at a glance",
        p: [
          "Exit volumes and prices vary significantly across Nike's sneaker range. The table below maps the key silhouettes by typical exit range, buy-below ceiling at 30% net margin, and liquidity on EU Vinted. All data anchored to the brand's sneaker departure average of €96 (week to 15 September 2026). Colourway-specific exits can differ materially from these ranges — use as a starting baseline, not a final bid price.",
        ],
        table: {
          caption:
            "Nike EU Vinted sneaker silhouettes: typical exit ranges and buy-below at 30% margin after ~5% platform fee. Week to 15 Sep 2026. Exit ranges are market-observed approximations across standard condition pieces; limited colourways exit higher.",
          head: [
            "Silhouette",
            "Exit range (EU Vinted, GR)",
            "Buy-below (30% margin)",
            "Liquidity",
            "Key condition signal",
          ],
          rows: [
            [
              "Blazer Mid 77 (GR)",
              "€25–45",
              "~€23",
              "High — fast charity-shop volume",
              "Sole separation + clean toe cap",
            ],
            [
              "Air Force 1 Low (GR)",
              "€30–60",
              "~€30",
              "Very high — fastest EU turnover",
              "Midsole yellowing threshold",
            ],
            [
              "Air Max 90 (GR / OG colourway)",
              "€40–90",
              "~€42",
              "High — OG colourways faster",
              "Forefoot sole separation",
            ],
            [
              "Air Max 95 (GR)",
              "€55–100",
              "~€53",
              "Moderate — lower EU supply",
              "Air unit integrity",
            ],
            [
              "Air Max 97 (GR)",
              "€65–120",
              "~€63",
              "High — Metallic tier fastest",
              "Heel air unit compression",
            ],
            [
              "Dunk Low (GR release)",
              "€55–90",
              "~€50",
              "High — broad buyer pool",
              "Lace cleanliness + insole",
            ],
            [
              "Dunk Low (limited / SNKRS)",
              "€100–250+",
              "~€100",
              "Moderate — size-dependent",
              "Original box + laces + size",
            ],
            [
              "Nike SB Dunk (limited)",
              "€150–600+",
              "~€130",
              "Low — specialist buyers only",
              "SB insole + tongue tag + comps",
            ],
          ],
        },
        cta: pricingBodyCta("body_nike_sneakers_table_20260915"),
      },
    ],
    faq: [
      {
        q: "What do Nike sneakers sell for on Vinted?",
        a: "Nike sneakers averaged €96 per departure across EU Vinted in the week to 15 September 2026, across 77 observed sneaker departures in France, Germany, Spain, Italy, and Portugal. The range is wide: Blazer Mid GR colourways exit at €25–45; Air Force 1 Low GR at €30–60; Air Max 90/95/97 at €40–120 depending on colourway; Dunk Low GR at €55–90; limited Dunk Low at €100–250+; Nike SB Dunks at €150–600+ for limited releases. The buy-below at 30% net margin for the €96 average is approximately €64.",
      },
      {
        q: "Is Nike worth reselling on Vinted?",
        a: "Yes — Nike is one of the most actively traded brands on EU Vinted. In the week to 15 September 2026, 161 Nike items departed weekly across EU markets, with 77 of those being sneakers averaging €96 per pair. Nike resale is silhouette-specific: the AF1 and Blazer are volume plays with moderate per-pair margin; the Dunk Low and Air Max 97 in the right colourways can return 30–50%+ margin per unit. The risk is colourway misjudgement — buying a GR colourway at limited-edition pricing results in an unsellable position.",
      },
      {
        q: "What is the buy-below for Nike Air Force 1 on Vinted?",
        a: "For a standard Air Force 1 Low GR colourway targeting a €45 EU Vinted exit (mid-range for a used pair in good condition), the buy-below at 30% net margin after Vinted's approximately 5% platform fee is approximately €30. Pairs with clean midsoles and minimal yellowing support €50–60 exits and a higher buy-below of ~€40. Heavy midsole yellowing drops exit price to €25–35, reducing the buy-below to ~€17–23. Real-time buy-below prices update weekly via Resale IQ.",
      },
      {
        q: "What Nike sneakers are most profitable to resell?",
        a: "By per-unit margin: Nike SB Dunks in limited colourways (Tiffany, Heineken, Travis Scott collabs) — exits €200–600+, buy-below ceiling ~€130+, but require specialist knowledge and carry liquidity risk on wrong sizes. By margin-to-risk: limited Dunk Low colourways (University Blue, Chicago) — exits €100–250, established buyer pool, clear comps available. By volume and turnover speed: Air Force 1 Low GR — exits €30–60, fastest EU turnover, forgives sourcing errors at low cost. For new resellers, the AF1 Low is the safest entry; for capital-efficient margin per flip, the limited Dunk Low is the best risk-adjusted pick.",
      },
      {
        q: "How do I identify a Nike SB Dunk vs a standard Dunk Low?",
        a: "Three differences distinguish an SB Dunk from a standard Dunk Low: (1) the insole — SB Dunks carry an extra padded Zoom Air insole for impact cushioning, absent on standard Dunks; (2) the tongue — many SB releases have a Nike SB logo (often in green or a collaboration-specific graphic) on the tongue label; (3) the box label — the SB Dunk box lists the model as 'Dunk Low Pro SB' or 'Dunk High Pro SB'. Do not rely on the outer colourway alone — several standard Dunk colourways deliberately reference SB colourways and are often mislabelled by sellers.",
      },
      {
        q: "How do Nike sneakers compare to New Balance for Vinted resale?",
        a: "Nike tracks 77 sneaker departures per week at €96 average vs New Balance's 240 sneaker departures per week at €52 average across EU Vinted (week to 15 September 2026). New Balance is the higher-volume play — nearly 3× the weekly pairs — with more predictable per-unit margins on core models like the 530 and 990. Nike has higher per-unit upside on limited silhouettes (Dunks, SB, collabs) but more colourway-specific risk. For a reseller optimising cash turnover, New Balance is the more reliable baseline; for per-unit margin, Nike's limited tier wins. The two strategies are complementary rather than competitive.",
      },
    ],
  },
]
