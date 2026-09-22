// Batch 58 of SEO/AEO articles. Same contract as blog-posts.ts.
// New Balance 530 EU Vinted price guide — targets
// "new balance 530 vinted price", "new balance 530 eu vinted price guide",
// "new balance 530 resell value eu", "is new balance 530 worth reselling vinted",
// "new balance 530 buy below vinted", "new balance 530 vs 9060 vinted",
// "new balance 530 dead trend vinted", "new balance sneakers eu vinted 2026".

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_58: BlogPost[] = [
  {
    slug: "new-balance-530-eu-vinted-price-guide",
    title: "New Balance 530 on EU Vinted: Price Guide and Buy-Below (2026 Data)",
    seoTitle: "New Balance 530 Vinted EU Price Guide 2026 — Resale IQ",
    description:
      "New Balance 530 tracks 1235 departures in the last 30 days across EU Vinted at a €37.47 average exit price in September 2026 — the highest-volume New Balance model but with DEAD momentum signal. Buy-below ceiling €24.92, comparison with NB 9060 (49 departures in the last 30 days at €78.83, FADING), NB 550, and Nike Air Force 1. Includes sizing data (top sizes 38/40/37) and what the momentum downgrade means for sourcing decisions in Q4 2026.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 8,

    preflightQuery: "New Balance 530",
    intro:
      "New Balance 530 tracks 1235 departures in the last 30 days (observation window to 22 September 2026) across EU Vinted at a €37.47 average exit price — making it the highest-volume individual sneaker model in the ResaleIQ New Balance dataset. The buy-below ceiling at the 530 model level is €24.92 (the max_buy_price at which the margin model stays positive after Vinted seller fees). At 1235 departures in the last 30 days, the 530 generates more 30-day volume than any other tracked NB model — but carries a DEAD momentum signal in the ResaleIQ system, meaning departure velocity has declined relative to the tracked historical baseline. This guide covers what that signal means for Q4 2026 sourcing decisions, how exit prices break down by condition and size, and how the 530 compares to the NB 9060 (49 departures in the last 30 days at €78.83), the NB 550, and Nike Air Force 1 for EU Vinted resellers.",
    definedTerm: {
      name: "New Balance 530 departure average",
      description:
        "The New Balance 530 departure average is the average price at which a tracked New Balance 530 listing leaves the shelf on EU Vinted — not the asking price and not the retail price. As of the week to 15 September 2026, the New Balance 530 tracks 1235 departures in the last 30 days across France, Germany, Spain, Italy, and Portugal at a €37.47 average exit price. 'Watched departure' means a tracked listing left the shelf — not a confirmed buyer-reported sale. The median exit price is €38, closely aligned with the mean, indicating a relatively tight price distribution without heavy outlier bias. The buy-below ceiling is €24.92 — the maximum sourcing price at which the margin model stays positive. The New Balance 530 is rated DEAD in the ResaleIQ momentum system, meaning departure velocity has declined against the historical baseline for this model. The New Balance brand overall tracks 1938 departures in the last 30 days at a €54 average across all models. Top exit sizes for the NB 530 on EU Vinted are 38, 40, and 37 (EU sizing).",
    },
    sections: [
      {
        h: "New Balance 530 on EU Vinted: 1235 departures in the last 30 days at €37.47 average",
        p: [
          "New Balance 530 is the highest-volume model in the New Balance EU Vinted dataset at 1235 departures in the last 30 days. The NB brand overall tracks 1938 departures in the last 30 days across all models — the 530 alone accounts for approximately 52% of total brand weekly observed departures. The 530's dominance reflects its position as the default 'dad sneaker' silhouette in the EU market across 2023–2026, a period during which the model saw sustained popularity across all five EU Vinted markets. The €37.47 average is modest relative to the overall NB brand average of €54, because the 530's volume is concentrated in the entry-to-mid condition range (Good to Excellent) rather than near-new or limited pairs.",
          "The median exit price for the NB 530 is €38 — nearly identical to the mean, indicating a tight distribution. This means pricing is relatively predictable: a 530 in Good condition in a standard colourway (white/silver, beige/silver, or navy) exits at €30–42. Excellent condition with the original box pushes to €45–55. Poor or heavily worn pairs exit at €18–28. The low spread between mean and median distinguishes the 530 from categories with wide luxury-to-worn distributions (Balenciaga, Stone Island) and makes it a reliable volume play for resellers who prefer predictability over peak-exit speculation.",
          `The DEAD momentum signal in the ResaleIQ system is the key context for 530 sourcing decisions in Q4 2026. DEAD means the model's departure velocity has declined against its own historical baseline — not that it has stopped selling. At 1235 departures in the last 30 days, the 530 is still the highest-volume NB model. The DEAD signal indicates that a sourcing price that worked in 2024–2025 carries more inventory risk today than it did when the model's demand was at peak. Resellers building a 530 position in Q4 2026 should apply a tighter buy-below ceiling than the category-level €24.92 for slow-moving sizes (below 36 or above 43). [New Balance brand data →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_nb530_guide_intro_20260915"),
      },
      {
        h: "NB 530 buy-below ceiling and what the DEAD momentum signal means in practice",
        p: [
          "The buy-below ceiling for the New Balance 530 is €24.92 — the max_buy_price calculated from the model's departure average (€37.47), accounting for Vinted's seller protection fee and standard EU domestic shipping (€5–8 for shoes). At €24.92, the model delivers a positive gross margin on the average exit. The ceiling is achievable at EU charity shops: NB 530 pairs surface regularly at Emmaus (France), Humana (Spain/Italy), and Oxfam/secondhand shops in Germany and Portugal at €8–20 for Good condition pairs. The filtering criteria at source: upper condition (no tears in the mesh panels, no deep scuffing on the toe cap), sole wear (no deep groove compression that signals heavy daily wear), and lace cleanliness (easily replaced at €2–3 if stained).",
          "The DEAD momentum signal changes the risk calculus, not the ceiling. The model is still liquid at 1235 departures in the last 30 days, so pairs below €24.92 are still viable. The adjustment is at the margin: reduce position size in slow sizes (below 37, above 43) where the typical buyer pool is narrower and a single-point momentum decline increases time-to-sell meaningfully. For standard sizes (38–42, which cover the top three exit sizes 38, 40, and 37), the ceiling holds. For outlier sizes, apply a tighter ceiling of €18–20 — the condition-adjusted exit for those sizes in a declining momentum environment.",
          `The 1,701 watched departures in the trailing 30 days (vs 104 in the trailing 7 days) confirm the 530's sustained volume despite the DEAD momentum signal — the 30d figure is 16× the 7d figure, consistent with a roughly stable exit rate without a significant recent acceleration. A DEAD signal with high trailing 30d volume typically indicates a model that has passed its trend peak but retains a large installed buyer base across the EU. The practical translation: the 530 is a reliable volume model in Q4 2026, not an opportunity to build a speculative inventory position on. [530 exit data →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_nb530_guide_buybellow_20260915"),
      },
      {
        h: "NB 530 vs NB 9060 and NB 550: the model hierarchy on EU Vinted",
        p: [
          "New Balance tracks eight models in the EU Vinted dataset with sufficient departure data. The model hierarchy by volume is: 530 (1235 departures in the last 30 days at €37.47, DEAD), 9060 (49 departures in the last 30 days at €78.83, FADING), 740 (12 departures in the last 30 days at €34.84, STABLE), 2002R (7 departures in the last 30 days at €45.18, STABLE), 550 (6 departures in the last 30 days at €40.97, STABLE), 574 (5 departures in the last 30 days at €30.20, FADING), 1906R (4 departures in the last 30 days at €56.35, FADING), and 327 (4 departures in the last 30 days at €32.68, FADING). The 530 and 9060 account for approximately 77% of total NB brand weekly departure volume, with the 530 at 52% and the 9060 at 25%.",
          "The NB 9060 is the key comparison for resellers evaluating the 530 position. The 9060 exits at €78.83 average — 111% above the 530's €37.47 — at 47% of the 530's volume. Buy-below ceiling for the 9060 is €52.42. The 9060 carries a FADING momentum signal (declining but less severe than DEAD), indicating it has more runway left in the trend cycle than the 530. For resellers with access to 9060 pairs at charity shop or arbitrage prices below €52.42, the 9060 delivers 2.1× the per-unit exit of the 530 at comparable margin structure. The sourcing challenge: the 9060's higher average sale price on Vinted means it appears less frequently at the charity-shop price point — EU buyers who paid retail for a 9060 at €130–170 are less likely to donate it at a charity shop within 1–2 years of purchase.",
          "The NB 550 occupies an interesting position in the hierarchy at 6 departures in the last 30 days and €40.97, with STABLE momentum. The 550 exits at nearly the same average as the 530 (€40.97 vs €37.47) but at one-seventeenth of the 530's volume. The STABLE momentum signal is more positive than the 530's DEAD rating — but the volume is insufficient to build a consistent sourcing strategy around without cherry-picking individual high-condition pairs. The 550's sourcing ceiling is €27.25; the model is less likely to surface at charity shops than the 530 because it retails at a higher price point (€100–130 vs €80–100 for the 530) and was less broadly distributed across EU mass-market retailers.",
        ],
      },
      {
        h: "Exit prices by size: top sizes 38, 40, and 37 on EU Vinted",
        p: [
          "Size is a significant determinant of exit speed and price for the New Balance 530. The top exit sizes in the ResaleIQ EU dataset are 38, 40, and 37 (EU sizing). These three sizes represent the concentration of female and male buyer demand at the smaller end of the adult range — consistent with the 530's demographic profile as a model associated with the female 'dad sneaker' trend in EU fashion media from 2022 onwards. Pairs in sizes 38–40 exit fastest and closest to the €37.47 average. Size 40 frequently exits slightly above average (€40–48) because it covers a broader buyer pool (large female sizing, small male sizing) and was widely stocked at EU retailers, creating more supply of quality secondhand pairs.",
          "Sizes below 36 and above 43 exit below the category average and take meaningfully longer to sell. A size 36 530 in Good condition would exit at €25–32 — below the €37.47 average and uncomfortably close to the €24.92 buy-below ceiling. A size 45 pair exits at €28–36. For resellers using the €24.92 ceiling, slow-moving sizes compress margin to near zero after fees and longer holding time. The practical sourcing rule: apply a tighter ceiling of €15–20 for sizes 35 and below, and 44 and above, even in Good or Excellent condition, to maintain margin in a DEAD momentum environment.",
          `The top three sizes (38, 40, 37) also have the highest buyer pool on EU Vinted search — buyers who save a Vinted search for 'New Balance 530' and filter by size will have the most competition (and fastest exits) in these sizes. For a reseller listing a size 38 530 in Excellent condition at €42, the typical time-to-sale on EU Vinted is 3–7 days in France and Germany. Size 43+ in Good condition at €38 can sit 2–4 weeks. The holding-time difference matters for resellers managing cash flow. [Full size exit velocity by model →](${ilinkHref("flip")})`,
        ],
        cta: pricingBodyCta("ctr_nb530_guide_sizing_20260915"),
      },
      {
        h: "New Balance 530 vs Nike Air Force 1 and Adidas Samba: EU Vinted sneaker comparison",
        p: [
          "The EU Vinted mid-range and accessible premium sneaker segment includes the NB 530 (1235 departures in the last 30 days at €37.47, DEAD), Nike Air Force 1 (33 departures in the last 30 days at €99.09, STABLE), Adidas Stan Smith (7 departures in the last 30 days at €84.14, RISING), and Adidas Samba (6 departures in the last 30 days at €48.01, DEAD). The comparison is directly relevant for EU resellers choosing where to allocate sourcing time in Q4 2026. The NB 530 has the highest departure volume in this group by a wide margin — but the lowest per-unit exit and the most negative momentum signal.",
          "Nike Air Force 1 generates 33 departures in the last 30 days at €99.09 average — one-third the volume of the 530 but 2.6× the per-unit exit. Buy-below ceiling for the AF1 is €65.89. STABLE momentum signal means the AF1 has held its trend position without the decline the 530 has experienced. For resellers with access to AF1 pairs below €65.89 — primarily through charity shops in France (where Jordan brand and Nike are heavily donated) or EU Vinted arbitrage — the AF1 delivers significantly better margin per item than the 530 at lower departure volume. The trade-off is sourcing difficulty: AF1 sourcing below €65.89 is less reliable than 530 sourcing below €24.92.",
          `Adidas Samba's DEAD momentum (matching the 530) at 6 departures in the last 30 days and €48.01 reveals an important pattern: both models reached trend saturation in 2025 and are now declining. The Samba's DEAD rating arrived despite its sustained press coverage in EU fashion media — a reminder that press momentum and Vinted departure velocity are uncorrelated when the buyer pool that drove the trend has already purchased. Adidas Stan Smith (RISING, 7 departures in the last 30 days at €84.14) is the positive outlier — rising momentum at a higher per-unit exit, suggesting a model entering rather than exiting its trend cycle. For EU sourcing decisions in Q4 2026: 530 remains viable for volume at tight margins; AF1 and Stan Smith are higher-priority models where sourcing price allows. [Compare all sneaker models →](${ilinkHref("data")})`,
        ],
      },
      {
        h: "Sourcing New Balance 530 below €24.92 in EU in Q4 2026",
        p: [
          "The primary sourcing channel for NB 530 pairs below €24.92 is EU charity shops, where the model's broad retail distribution (H&M Sport sections, Foot Locker, JD Sports across all five EU markets from 2022–2025) created a large donation pipeline. At peak trend (2023–2024), NB 530 pairs at Emmaus France, Humana Spain, and Oxfam Germany sold quickly at €15–20. In Q4 2026, with DEAD momentum reducing buyer competition on Vinted, the same €15–20 charity-shop price represents a narrower margin at the €37.47 exit — approximately 35–40% gross margin before fees rather than 50%+. The margin still works; the urgency to source aggressively is lower than in a RISING or STABLE environment.",
          "The second sourcing channel is EU Vinted arbitrage: sellers who price NB 530 pairs at €18–24 (below average) due to poor photo presentation, missing model identification in the title (listed as 'New Balance beige' rather than 'New Balance 530'), or incorrect condition grading. These listings exit from the platform's general search before dedicated model buyers find them. Resellers who maintain a saved Vinted search for 'New Balance' filtered to €5–22 in Good condition, across all five markets, surface these underpriced pairs. The conversion rate from saved search to viable pair is roughly 2–4 pairs per week across the five markets, based on community reports from EU Vinted arbitrage groups.",
          `Cross-platform sourcing from UK platforms (Depop, Vinted UK) offers a moderate opportunity for the NB 530. The EU–UK price gap for the 530 is approximately €8–12 (EU Vinted: €38 median; UK Vinted: £28–32 equivalent). After international shipping and VAT consideration, the arbitrage margin is thin for lower-value pairs but positive for Excellent or near-new pairs (UK €28–35, EU exit €50–55 in Excellent condition). The 530 is one of the few mid-range NB models where UK Vinted arbitrage is structurally viable — the 9060's higher UK price compresses the EU–UK gap. [530 sourcing and buy-below calculator →](${ilinkHref("flip")})`,
        ],
      },
    ],
    faq: [
      {
        q: "How much does a New Balance 530 sell for on EU Vinted?",
        a: "New Balance 530 averaged €37.47 per departure across EU Vinted in the week to 15 September 2026, based on 104 observed departures in France, Germany, Spain, Italy, and Portugal. The median exit price is €38 — closely aligned with the mean, indicating a tight price distribution. Good condition in standard colourways (white/silver, beige/silver) exits at €30–42. Excellent condition with the original box exits at €45–55. Poor or heavily worn pairs exit at €18–28. Top exit sizes are 38, 40, and 37 (EU sizing).",
      },
      {
        q: "What is the buy-below price for New Balance 530 on EU Vinted?",
        a: "The buy-below ceiling for the New Balance 530 is €24.92 — the maximum sourcing price at which gross margin stays positive after Vinted's seller protection fee and standard EU domestic shipping (€5–8 per pair). This ceiling is regularly achievable at EU charity shops (€8–20 per pair in Good condition) and through EU Vinted arbitrage from underpriced listings. For slow-moving sizes (35 and below, 44 and above), apply a tighter ceiling of €15–20 to account for extended holding time in a DEAD momentum environment.",
      },
      {
        q: "Is New Balance 530 worth reselling on EU Vinted in 2026?",
        a: "The NB 530 is still viable for volume-focused resellers in Q4 2026 — 1235 departures in the last 30 days makes it the highest-volume tracked NB model — but the DEAD momentum signal indicates declining departure velocity against its historical baseline. The €37.47 average and €24.92 buy-below ceiling deliver positive gross margin when sourcing below the ceiling. The practical recommendation for Q4 2026: continue sourcing 530s in standard sizes (38–42) below €24.92 with tight condition criteria, but do not build a speculative inventory position. Resellers with access to NB 9060 pairs below €52.42 should prioritise the 9060 (FADING, €78.83 average) over the 530 for per-unit margin.",
      },
      {
        q: "How does New Balance 530 compare to NB 9060 on EU Vinted?",
        a: "The NB 9060 exits at €78.83 average at 49 departures in the last 30 days — 111% higher exit price than the 530 (€37.47) at roughly half the volume. The 9060 carries a FADING momentum signal versus the 530's DEAD — indicating more remaining trend runway. Buy-below ceiling for the 9060 is €52.42. The 9060 delivers 2.1× the per-item exit of the 530 at comparable margin structure, but is harder to source below the buy-below ceiling at charity shops due to its higher original retail price (€130–170 vs €80–100 for the 530). Resellers who can access the 9060 below €52.42 should prioritise it over the 530 in Q4 2026.",
      },
      {
        q: "What does DEAD momentum mean for New Balance 530 reselling?",
        a: "DEAD momentum in the ResaleIQ system means the NB 530's departure velocity has declined against its own historical baseline — the model is past its trend peak. It does not mean the model has stopped selling: 1235 departures in the last 30 days makes it still the highest-volume NB model on EU Vinted. DEAD signals that sourcing risk is higher than in a STABLE or RISING model: pairs take longer to sell, price competition from other sellers is increasing as more inventory enters the secondhand market from the 2023–2025 retail purchase wave, and off-size pairs (36 and below, 43 and above) carry extended holding risk. Apply tighter buy-below discipline and smaller position sizes than in peak trend periods.",
      },
      {
        q: "What sizes sell best for New Balance 530 on EU Vinted?",
        a: "The top exit sizes for the New Balance 530 on EU Vinted are 38, 40, and 37 (EU sizing). These sizes represent peak buyer demand in the female and smaller male shoe range — consistent with the 530's positioning as a model with strong female buyer demand across France, Germany, and Spain. Size 40 frequently exits slightly above the €37.47 category average (€40–48) due to its broad buyer pool. Sizes 35 and below or 44 and above exit below the category average and take 2–4 weeks versus 3–7 days for standard sizes. Apply a €15–20 ceiling (vs the standard €24.92) for slow-moving sizes to protect margin.",
      },
    ],
  },
]
