// Batch 14 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: listings-tracked via TRACKED + fillTracked, no earnings promises,
// no tax/legal advice presented as professional advice.

import { TRACKED } from "@/lib/stats"
import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

const BRAND = "Resale IQ"

export const POSTS_14: BlogPost[] = [
  {
    slug: "jordan-reselling-vinted-guide",
    title: "Jordan Brand Reselling on Vinted: Sneakers at €156 Average and the Colourway Edge",
    seoTitle: "Is Jordan Worth Reselling on Vinted? — Resale IQ",
    description:
      "Jordan Brand ranked #28 by watched departures across 5 EU Vinted markets — 15/week at €133 average. Sneakers dominate at €156 avg (buy-below ~€109). The sourcing edge is colourway and retro identification — OG colourways exit 2–3× above the category mean.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 7,

    preflightQuery: "Jordan 1 Mid",
    intro:
      "Week to 14 September 2026, Jordan Brand ranked #28 across Spain, France, Germany, Italy and Portugal with 15 watched departures at an average exit price of €133 — the highest average price of any brand tracked outside Gucci (€212) and Balenciaga (€146). Sneakers dominate at 12 departures averaging €156 — driven by Air Jordan retro releases where the colourway determines the exit price. The sourcing edge is colourway knowledge: a Jordan 1 Retro High in a deadstock OG colourway exits at €200–500+ while a general-release Jordan 1 in a non-OG colourway exits at €60–100. EU charity shops price Jordans as 'Nike trainers' — the same pricing regardless of colourway — creating reliable identification upside for informed resellers.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 15 watched departures in the week to 14 September 2026, Sneakers led at 12 exits averaging €156. Hoodies contributed 1 departure averaging €25. Jackets added 1 departure averaging €40. T-Shirts rounded out at 1 departure averaging €65.",
          "Full Jordan Brand volumes are on " +
            ilinkHref("flip") +
            " and update weekly. At 101 departures in the last 30 days Jordan is lower-volume than other tracked brands — but the per-unit average (€133) is the third-highest in the catalogue, reflecting the luxury streetwear positioning of Jordan Brand at the intersection of sportswear heritage and sneaker collecting. The reselling case is almost entirely Sneakers: 80% of departures, 100% of the margin case. Jordan apparel exits at non-trivial averages (T-Shirts at €65 — likely Jump Man 23 heritage graphic tees) but volumes are too low for a systematic sourcing strategy.",
        ],
      },
      {
        h: "Buy-below by category",
        p: [
          "With Sneakers averaging €156 at departure and Vinted modelling roughly a 5% platform deduction, the departure-net is around €148.20. Applying a 30% target margin gives a buy-below of approximately €104. Any Jordan sneaker sourced below that price — confirmed model, confirmed colourway, confirmed condition — has a realistic margin at current departure prices.",
          "The upper range for premium Jordan retro colourways (the Jordan 1 Retro High OG 'Chicago', the Jordan 4 Retro 'Military Blue', the Jordan 3 Retro 'White Cement') is €300–600+ for wearable deadstock or near-deadstock condition, shifting the buy-below ceiling significantly upward. For Jordan apparel: T-Shirts at €65 give a buy-below near €46. Hoodies at €25 give a buy-below near €18. The T-Shirt buy-below is achievable only for heritage graphic tees — Jordan 23 jumpsuit logo, authentic vintage 90s Jordan brand pieces — not current production.",
        ],
        cta: pricingMidCta("ctr_jordan_20260915"),
      },
      {
        h: "Colourway knowledge: the primary sourcing edge",
        p: [
          "Jordan Brand's resale value is more colourway-dependent than any other brand in the catalogue. The same Jordan 1 Retro High silhouette exits at €80 in a general-release colourway and at €400 in the 'Chicago' OG colourway — a 5× difference for the same model. The colourways that consistently exit above the EU Vinted category mean are: the Air Jordan 1 Retro High OG 'Chicago' (red/white/black, the original 1985 colourway), exiting at €300–600 for wearable pairs; the Air Jordan 1 Retro High 'Bred' (black/red), exiting at €200–400; the Air Jordan 1 Retro High 'Royal' (royal blue/black), exiting at €200–350; the Air Jordan 1 Low 'Chicago' (red/white/black), exiting at €100–180.",
          "The Air Jordan 3 Retro 'White Cement' (the original 1988 colourway — white leather with grey cement print and visible Air unit) exits at €200–400 for pairs in good condition. The Air Jordan 4 Retro 'Military Blue' (white/military blue), returning to retail for the first time in decades, exits at €150–300. The Air Jordan 11 Retro 'Space Jam' (black patent leather/royal blue) exits at €150–300 for wearable pairs. Each of these colourways is identifiable from the exterior of the shoe — colour combination confirms OG status — and EU charity shop staff price all Jordan 1 silhouettes as 'Nike high-tops' regardless of colourway.",
        ],
      },
      {
        h: "Identifying Jordan retros at EU charity shops",
        p: [
          "Jordan Brand sneakers at EU charity shops are almost always mispriced relative to their colourway-specific secondary market value. The identification workflow for a Jordan pair at a charity shop: confirm the visible colourway (the colour of the toe cap, side panel, heel, and lace eyelet trim against the known OG colourway list); confirm the model number from the tongue tab or interior label (Jordan 1, 3, 4, 11 — the most frequently found retro silhouettes); confirm the midsole print (the size, the 'Nike Air' or 'Air Jordan' text); confirm condition (the crease lines on the toe box, the midsole cleanliness, and — for older retros with original foam midsoles — the 'crumbling' status of the foam, which is the primary devaluation risk for vintage pairs).",
          "The practical charity shop workflow takes under 60 seconds: pick up any Jordan retro, check the colourway against the OG short-list, check the model from the tongue, check the sole condition. A Jordan 1 Retro High in white/black/red (Chicago colourway) with clean soles and minimal toe crease, sourced at €25–35, exits at €250–500 on EU Vinted. The same shoe in an off-colourway (white/black/blue unlisted in OG references) exits at €60–100. The difference is a 60-second colourway check.",
        ],
      },
      {
        h: "Jordan apparel: vintage tees and the €65 average",
        p: [
          "Jordan Brand apparel exits at significantly higher averages on EU Vinted than the Jordan clothing brand's current market positioning would suggest — the €65 T-Shirt average reflects vintage and heritage pieces rather than current production Jordan apparel (which retails at €25–40 and exits at €12–25 on EU Vinted). The high-exit Jordan T-Shirts are: vintage 1990s Jordan Brand 'Jumpman 23' graphic tees (the original Jumpman silhouette on single-stitch cotton, period-production fabric), exiting at €40–90 for clean originals in season-specific designs; Jordan × Nike heritage co-branded T-Shirts from the 1991–2000 period (the 'Nike Air Jordan' co-brand, the Flight School graphics); Jordan Brand team-issue or limited-market T-Shirts from specific athlete campaigns.",
          "Current Jordan Brand apparel — the Jordan Sport DNA T-Shirt, the Jordan Flight Fleece Hoodie — exits at €15–25 and does not generate viable reselling margin. The apparel sourcing case is exclusively vintage production, where the 1990s-era single-stitch construction and period graphics exit at a heritage premium. At charity shops, vintage Jordan T-Shirts are price at €5–12 as generic Nike sportswear — the Jordan Brand sub-label identification (the Jumpman logo on a vintage tee versus a current production piece) is the entire value signal.",
        ],
        cta: pricingBodyCta("body_jordan_20260915"),
      },
      {
        h: "Authentication and condition checks",
        p: [
          "Jordan Brand is one of the highest-counterfeited sneaker labels globally — particularly the Air Jordan 1 Retro High in OG colourways (Chicago, Bred, Royal). Authentication of high-value Jordan pairs at charity shop sourcing prices is essential before listing. The key authentication checks: the Nike Swoosh on the Jordan 1 should be a smooth, uniform leather or synthetic leather overlay — counterfeit Swooshes have irregular edges or uneven paint. The Air unit in the heel (visible through the transparent midsole window on Jordan 11, 3, 4) should be clean and fully inflated; counterfeit midsoles use a non-functional visual Air window. The Jumpman logo on the heel counter of Jordan 1 should be precisely proportioned — the figure's proportions and the script text below are a frequent counterfeit error.",
          "For the Air Jordan 1 Retro High specifically: the original Wings logo (the 23 in a wing motif on the ankle collar) should be a clean die-cut leather embossment on genuine pairs; counterfeits use lower-quality embossment or heat-press. The toe box on the Jordan 1 should have a slight toe-spring (the front curves upward at rest) — flat toe boxes suggest a non-original midsole or a counterfeit sole unit. The lace set: original Jordan 1 pairs in OG colourways come with matching laces and a replacement set — the presence of two lace sets confirms a more careful custodian and a higher likelihood of original production. For any pair over €150 expected exit price, use a specialist authentication service (CheckCheck, Legit App, GOAT Authentication) before purchasing at charity shop prices.",
        ],
      },
    ],
    faq: [
      {
        q: "Is Jordan Brand worth reselling on Vinted?",
        a: "Yes — specifically Jordan Retro Sneakers in OG colourways. Jordan ranked #28 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 15 departures at €133 average. Sneakers averaged €156 (buy-below ~€104). The sourcing edge is colourway identification: Jordan 1 Retro High 'Chicago', 'Bred', and 'Royal' colourways exit at €200–500+ at EU charity shop sourcing prices of €25–40. Jordan apparel is not a viable systematic sourcing target.",
      },
      {
        q: "What is the buy-below price for Jordan on Vinted?",
        a: "For Jordan Sneakers: with an average departure of €156 and 5% platform deduction, buy-below sits around €104. For OG colourway Jordan 1 Retro High (which exits at €250–500+), buy-below stretches to €175–350. For general-release Jordan Sneakers (which exit at €60–100), buy-below is near €42–70 — harder to achieve at EU charity shops where Jordan pricing is increasing with collector awareness. Resale IQ returns exact buy-below by brand, model, colourway, and condition.",
      },
      {
        q: "What Jordan items sell best on Vinted?",
        a: "By per-unit value: Jordan 1 Retro High OG 'Chicago' (€300–600 wearable), Jordan 1 Retro High 'Bred' (€200–400), Jordan 3 Retro 'White Cement' (€200–400), Jordan 4 Retro 'Military Blue' (€150–300). By volume: Sneakers (12 dep/wk at €156 avg). Vintage 90s Jordan Brand graphic tees exit at €40–90 but volumes are too low for systematic sourcing.",
      },
      {
        q: "How do I identify Jordan OG colourways at charity shops?",
        a: "The key OG colourways to know for the Jordan 1 Retro High: Chicago = red toe cap, white mid-panel, black collar and ankle trim; Bred = black toe and collar, red mid-panel detailing; Royal = royal blue toe and collar, white mid-panel. For Jordan 3: White Cement = white leather upper, grey cement speckle print, visible Air unit in heel. For Jordan 4: Military Blue = white upper with military blue support wings and lace pocket. A colourway reference card (printable from the Resale IQ blog) covers the 12 most valuable OG Jordan colourways — a 60-second charity shop check against that list is the full sourcing workflow.",
      },
      {
        q: "How do I authenticate Jordan sneakers before buying?",
        a: "Key checks for the Jordan 1 Retro High: Nike Swoosh edges should be clean and uniform — irregular edges suggest counterfeit. Wings logo on the ankle collar should be a precise leather embossment. Toe box should have a slight upward curve at rest. For high-value pairs (expected exit over €150), use CheckCheck, Legit App, or GOAT Authentication before purchasing. Counterfeit Jordan 1s in OG colourways are the most common faked sneaker in the EU charity shop supply chain. A €30 authentication check on a pair expected to exit at €300 is a necessary cost.",
      },
    ],
  },
  {
    slug: "pull-and-bear-reselling-vinted-guide",
    title: "Pull&Bear Reselling on Vinted: High Volume, Low Margin, and the Vintage Exception",
    seoTitle: "Is Pull&Bear Worth Reselling on Vinted? — Resale IQ",
    description:
      "Pull&Bear ranked #23 by watched departures across 5 EU Vinted markets — 51/week at €11 average. The brand average is the lowest viable margin case in the catalogue. The only realistic sourcing edge is vintage late-90s/early-00s Pull&Bear denim and limited edition collab pieces.",
    date: "2026-09-15",
    category: "Sourcing",
    readMins: 5,
    intro:
      "Week to 14 September 2026, Pull&Bear ranked #23 across Spain, France, Germany, Italy and Portugal with 51 watched departures at an average exit price of €11 — the lowest brand average in the tracked catalogue for brands with meaningful volume. The core Pull&Bear product range (basics, Hoodies, Jeans, casual Jackets) exits at prices that sit at or below the price of the same item in a Pull&Bear store new, eliminating margin for deliberate resellers. Pull&Bear is Inditex-owned and widely available across EU markets, with Zara-equivalent distribution creating no secondary market scarcity. The only realistic sourcing edge is vintage Pull&Bear — late-1990s and early-2000s denim and collab pieces where the Inditex era branding carries a retro premium.",
    sections: [
      {
        h: "Volume and category breakdown",
        p: [
          "Of the 51 watched departures in the week to 14 September 2026, Hoodies led at 33 exits averaging €12. Jeans contributed 5 departures averaging €8. Jackets added 3 departures averaging €12. Shirts added 3 departures averaging €3. T-Shirts rounded out at 3 departures averaging €7.",
          "Full Pull&Bear volumes are on " +
            ilinkHref("flip") +
            " and update weekly. The volume-to-average ratio is the worst in the catalogue for brands tracked: 51 departures at €11 average reflects a market where demand is high (51 weekly exits) but buyer willingness to pay is low. Hoodies at €12 and Jackets at €12 are the peak of the Pull&Bear price ceiling on EU Vinted. Shirts at €3 and T-Shirts at €7 are below any viable cost-of-reselling threshold. Jeans at €8 are below charity shop pricing for branded denim.",
        ],
      },
      {
        h: "Why Pull&Bear has no margin: the Inditex distribution problem",
        p: [
          "Pull&Bear is owned by Inditex (the Zara parent) and operates 900+ stores across 40 markets. The brand's value proposition is trend-reactive casualwear at accessible prices — a Hoodie retails at €20–30, Jeans at €25–35, Jackets at €30–50. On EU Vinted, these same items exit at €12, €8, and €12 respectively — at or below charity shop prices and well below new retail. The structural problem is identical to Zara basics: Pull&Bear items are available new, in current sizes, at the same or lower price than any used listing on Vinted.",
          "A deliberate reseller buying Pull&Bear at a charity shop (€5–8 per piece) and listing at EU Vinted average prices (€11 brand average) generates €3–6 gross margin per item before fees, packaging, and time. At Vinted's approximate fee structure, the net is €1–3 per item — below any viable unit economics for deliberate resale strategy. Pull&Bear items sourced at charity shops are almost never below the buy-below threshold because the buy-below threshold (near €7 for Hoodies at €12 exit) is lower than typical branded charity shop pricing.",
        ],
        cta: pricingMidCta("ctr_pullandbear_20260915"),
      },
      {
        h: "The vintage exception: late-90s Pull&Bear denim",
        p: [
          "The only realistic sourcing edge in Pull&Bear is the vintage exception: late-1990s and early-2000s Pull&Bear production from the brand's early Inditex era. Pull&Bear launched in 1991 and developed a distinct aesthetic through the mid-to-late 1990s — grunge-adjacent, heavier denim, contrast-stitching details, and period branding. This vintage Pull&Bear denim exits at €20–40 on EU Vinted for clean original pieces, driven by the 90s revival that has sustained demand for early-era Inditex denim.",
          "Identification of vintage Pull&Bear: care labels from the 1990s carry the era's logo design (the P&B bear, which has been redesigned several times), country of manufacture (early Pull&Bear was manufactured in Spain and Portugal, later shifting to Turkey and Asia), and the period Inditex house style on the interior label. At EU charity shops, vintage 90s Pull&Bear denim is priced identically to current production — staff identify 'Pull&Bear jeans' and price at €5–10. The era label confirmation takes under 10 seconds and is the only sourcing check required.",
        ],
      },
      {
        h: "Practical verdict: Pull&Bear is a passing grade, not a sourcing target",
        p: [
          "The honest assessment for Pull&Bear is a deliberate pass rather than a sourcing strategy. At a limited number of departures in the last 30 days with an €11 average, the brand has real demand volume — but the economics do not support deliberate charity shop sourcing of current-production Pull&Bear. The only viable case is opportunistic vintage denim at clearance pricing (under €5), and these pieces are uncommon enough that they cannot support a consistent sourcing plan.",
          "For resellers who encounter Pull&Bear pieces at charity shops: Hoodies priced below €7 and Jackets priced below €8 represent marginal cases; current production pieces priced above €8 are almost certainly non-viable after fees. Vintage denim with a 90s-era P&B bear label at under €5 is the only piece worth buying deliberately. All other Pull&Bear sourcing is a net-negative time investment.",
        ],
        cta: pricingBodyCta("body_pullandbear_20260915"),
      },
    ],
    faq: [
      {
        q: "Is Pull&Bear worth reselling on Vinted?",
        a: "Generally no — not for deliberate sourcing. Pull&Bear ranked #23 by watched departures across Spain, France, Germany, Italy and Portugal in the week to 14 September 2026: 51 departures at €11 average — the lowest average in the tracked catalogue. Hoodies at €12 and Jackets at €12 peak; Shirts at €3 and Jeans at €8 are non-viable. The only realistic case is vintage late-90s Pull&Bear denim at clearance pricing (under €5), exiting at €20–40.",
      },
      {
        q: "What is the buy-below price for Pull&Bear on Vinted?",
        a: "For Pull&Bear Hoodies: with an average departure of €12 and 5% platform deduction, buy-below sits around €8. For Jackets at €12 avg, buy-below is near €8. For Jeans at €8 avg, buy-below is near €5.50. These thresholds are below typical EU charity shop pricing for branded basics. Only clearance-priced pieces (under €5) generate any margin — and only if condition is very good. Pull&Bear is not a viable deliberate sourcing target.",
      },
      {
        q: "What Pull&Bear items sell best on Vinted?",
        a: "By volume: Hoodies (33 dep/wk at €12 avg). By value: vintage late-90s Pull&Bear denim (€20–40 for original era pieces). The volume leader (Hoodies) is not a viable sourcing target — €12 exit average after fees leaves no margin at charity shop pricing. Vintage denim is viable but rare.",
      },
      {
        q: "How does Pull&Bear compare to Zara for resale on Vinted?",
        a: "Both are Inditex brands with similar resale challenges. Zara (82 dep/wk at €20 avg) has a higher volume and a higher average than Pull&Bear (51 dep/wk at €11 avg). Zara's Jackets at €35 avg give a viable buy-below near €23; Pull&Bear's Jackets at €12 avg give a buy-below near €8. Zara Studio identification (limited-edition pieces that exit at €40–80) is a viable Zara sourcing edge without a Pull&Bear equivalent at the same scale. Zara is meaningfully more resellable than Pull&Bear.",
      },
    ],
  },
]
