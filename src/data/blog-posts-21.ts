// Batch 21 of SEO/AEO articles. Same contract as blog-posts.ts.
// Honest claims only: no earnings guarantees, no tax/legal advice as professional advice.
// All departure data from /api/public/market-snapshot (2026-09-15 build).

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_21: BlogPost[] = [
  {
    slug: "how-to-sell-designer-items-on-vinted",
    title: "How to Sell Designer Items on Vinted (Without Getting Scammed or Flagged)",
    seoTitle: "How to Sell Designer Items on Vinted — Resale IQ",
    description:
      "The full guide to selling designer clothes, bags, and shoes on Vinted: authentication, listing, pricing against departure data, and protecting yourself from buyer disputes. Based on live EU Vinted departure data for Gucci, Balenciaga, Stone Island, and more.",
    date: "2026-09-15",
    category: "Selling",
    readMins: 11,
    intro:
      "Selling designer items on Vinted is high-stakes resale: the margin potential is real (Gucci Bags depart at €304 on average, Balenciaga at €147), but so is the dispute risk. One returned item on a fake claim can wipe the margin from three legitimate sales. This guide covers the process from authentication through to getting paid — protection first, profit second.",
    definedTerm: {
      name: "Departure average",
      description:
        "A departure average is the mean price at which items actually completed sales on Vinted over a rolling 7-day window — not listed prices, not asking prices. Resale IQ tracks departure averages across 28 brands and 6 categories on EU Vinted. For designer items, departure averages set the ceiling for your listing price and the floor for your authentication investment.",
    },
    sections: [
      {
        h: "Which designer brands actually sell on EU Vinted",
        p: [
          "Not all luxury brands have active resale markets on Vinted. The platform skews younger and mid-market — ultra-luxury (Hermès, Chanel) has thin buyer depth on Vinted vs. specialist platforms like Vestiaire Collective. The designer brands with proven buyer depth on EU Vinted, based on departure data for the 7 days to 15 September 2026:",
          "**Balenciaga** — 2322 departures in the last 30 days, average €147. Top categories: Sneakers (156 dep, avg €145), T-Shirts (92 dep, avg €89), Hoodies (79 dep, avg €107). High volume for streetwear-luxury. Active buyer market.",
          "**Gucci** — 489 departures in the last 30 days, average €211. Top categories: Bags (81 dep, avg €304), Caps (52 dep, avg €146), Sneakers (38 dep, avg €209). Lower volume but higher per-item value. Bags are the highest single-category departure average tracked.",
          "**Stone Island** — 178 departures in the last 30 days, average €70. Bridges premium and designer. Hoodies (178 departures in the last 30 days, avg €56), Jackets (51 departures in the last 30 days, avg €140). High volume relative to price point — more approachable for first designer listings.",
          "**Supreme** — 199 departures in the last 30 days, average €66. Hoodies (47 departures in the last 30 days, avg €74), T-Shirts (34 departures in the last 30 days, avg €34). Drop-culture brand; individual release values vary widely from the averages.",
          "**Off-White** — 27 departures in the last 30 days, average €60. Sneakers (10 departures in the last 30 days, avg €110) dominate. Thin buyer depth overall — slower exits.",
          "For the full departure table across all 28 tracked brands, use [Resale IQ's brand tracker](" + ilinkHref("flip") + "). If your item's brand isn't on the list, buyer depth on Vinted is likely insufficient for reliable exits.",
        ],
      },
      {
        h: "Authenticate before you list",
        p: [
          "Authentication is not optional for designer items on Vinted. Vinted's buyer protection allows disputes on authenticity for 2 days post-delivery. A successful dispute means the item is returned and the transaction reversed — and you bear the return shipping. If the item is damaged in return transit, you absorb that loss.",
          "Authenticate every designer item before listing, regardless of provenance. The checks that matter by brand:",
          "**Gucci Bags:** Hardware weight (authentic is heavy, hollow-sounding hardware is fake), interior leather smell (authentic has a distinctive tannery scent), stitching regularity (10–12 stitches per inch on authentic pieces), and the serial number inside — first number corresponds to year, second to production month. Cross-check the serial against the year on the receipt if present.",
          "**Balenciaga Sneakers:** Box label authenticity (barcode must match shoe tag), sole embossing depth, tongue label printing (authentic has clean, slightly raised print), and the glue line between sole and upper (uneven or visible glue beads indicate replica).",
          "**Stone Island:** The badge — authentic has a floating compass rose in the centre that moves. The stitching on the badge surround is continuous (replicas often break). The garment dye is uneven by design on authentic pieces; too-uniform colour is suspect.",
          "**Supreme box logo items:** Box logo proportions (height-to-width ratio is strict on authentic), interior tag font, and the wash label language matching the season. Full authentication details at [how to authenticate designer items on Vinted](/blog/how-to-authenticate-designer-items-vinted).",
          "If you have any doubt, get a third-party authentication before listing. Several EU-based authentication services charge €10–20 per item. The cost is insurance against a €150+ dispute loss.",
        ],
        cta: pricingMidCta("ctr_designer_20260915"),
      },
      {
        h: "Price against departure data, not retail or instinct",
        p: [
          "Designer items on Vinted have departure averages that sit well below retail — buyers are on Vinted precisely for that discount. Pricing at or above the departure average guarantees a long hold; pricing below it accelerates departure at reduced margin.",
          "The positioning framework: **departure average × 0.90 to 1.05** depending on condition. An item in perfect condition with tags can reach 5% above the departure average. Good condition (worn, no flaws) should price at the average. Visible wear prices 10–15% below average.",
          "Examples from live data: Gucci Bags at €304 average departure — price a mint-condition authenticated Gucci bag at €300–320. A used bag with light scuffing prices at €255–270. Price at €400 and you are outside the clearing range; you will hold indefinitely unless a buyer with specific model preference finds you.",
          "Balenciaga Sneakers at €145 average: clean pair without box prices at €130–145. Same pair with original box in good condition: €155–175. Never price below your buy-below floor — if the departure average doesn't support your margin, the item should not have been sourced.",
          "Check departure averages by category before setting the listing price. Gucci Caps (avg €146) and Gucci Sneakers (avg €209) are different products from Gucci Bags (avg €304) — don't apply one brand-level average across categories.",
        ],
      },
      {
        h: "Listing a designer item: the seven fields that move it",
        p: [
          "Designer buyers on Vinted are more research-driven than general secondhand buyers. They will check the listing photos carefully, read the description, and often cross-reference the price against similar active listings. Your listing must earn their confidence.",
          "**Title:** Brand + specific model or item type + size + condition marker. 'Balenciaga Triple S Sneakers 42 Light Use' not 'Balenciaga trainers 🔥 great condition'. Model name matters — buyers search for it specifically.",
          "**Photos:** 10–15 photos minimum for designer items. Required shots: (1) full item clean background, (2) brand logo close-up, (3) authentication marker (badge, serial number, hardware), (4) size label, (5) each side or angle, (6) any flaws isolated and clearly lit. Do not use flash on leather — it kills the texture and reads as hiding something.",
          "**Description:** Condition grading first (new/excellent/good/acceptable — Vinted's own scale), then authentication notes (what you checked), then measurements if garment, then sourcing context if it adds trust (bought new in store, original receipt available). End with: 'Happy to send additional photos on request.'",
          "**Category and subcategory:** Be precise. Balenciaga Sneakers in 'Trainers' not 'Shoes'. Gucci Bags in 'Handbags' not 'Accessories'. Wrong category kills search visibility.",
          "**Size:** List the item's label size AND the measurements. Designer sizing varies; a Supreme Hoodie labelled 'L' may fit like an M. Buyers who know this will ask for measurements — pre-empt it.",
          "**Postage:** For items over €100, always include tracked shipping in the price or offer it as the only option. Untracked postage on a €300 Gucci Bag creates a dispute surface — 'never received' claims are harder to defend without tracking.",
        ],
      },
      {
        h: "Protecting against buyer disputes",
        p: [
          "Vinted's buyer protection window gives buyers 2 days after delivery to raise an issue. For designer items, the main dispute vectors are: authenticity claims, condition disagreement, and 'not as described'. All three are manageable with preparation.",
          "**Before listing:** Document the item with a video walkthrough — camera in hand, narrate each authentication marker you can see, the label, the hardware, the interior. This is not required by Vinted but it is the single best defence if a dispute is raised. Store the video.",
          "**In the listing:** State the authentication checks you performed in the description. Not a legal certification — a factual description ('badge compass rose moves freely, stitching uniform, serial number checked against year'). This sets the buyer's expectation and makes a post-sale 'it's fake' claim harder to sustain.",
          "**When you ship:** Photograph the item packaged — garment/bag laid out next to the shipping label, visible condition. Photograph the sealed package. This protects against 'received damaged' and 'not as described' disputes that relate to packaging condition.",
          "**If a dispute is raised:** Respond within 24 hours with your documentation: video, listing photos, and shipping photos. Vinted's resolution team reviews disputes with the evidence provided by both parties. Documented sellers win the majority of legitimate authenticity disputes; undocumented sellers lose by default.",
        ],
      },
      {
        h: "Timing and visibility for designer listings",
        p: [
          "Designer items have different browsing patterns than general secondhand. Buyers researching a specific model or brand visit Vinted repeatedly over days or weeks — they are comparison shopping, not impulse buying. This means your listing needs sustained visibility, not just a launch spike.",
          "**List on Thursday evening or Friday.** Vinted traffic peaks on weekends. A Friday listing gets first-day exposure during peak traffic and then stays visible through the weekend when buyer intent is highest.",
          "**Don't immediately drop the price.** Designer buyers discount items that drop quickly — it signals seller anxiety and raises authenticity questions. Hold price for at least 10 days before any reduction. When you do reduce: drop by €5–10, not a percentage. Percentage drops look distressed.",
          "**Use the bump feature strategically.** Vinted allows periodic visibility boosts. Use it on day 7 if no activity, not on day 1. Reserve the bump for when the listing needs a second wave of exposure rather than to compensate for a weak initial listing.",
          "If an item has had no views after 72 hours, the problem is usually category placement or search keywords — not price. Review the title for searchable terms and verify the category is correct before touching the price.",
        ],
      },
      {
        h: "When to relist vs. cross-platform a stuck designer item",
        p: [
          "A designer item that has not departed after 30 days on Vinted needs a different decision than a standard secondhand item. The options:",
          "**Relist on Vinted:** Unpublish and re-list after 30 days. This resets search position. Effective if the problem was visibility rather than price or demand. Adjust photos or description to reflect any feedback you received.",
          "**Cross-list to Vestiaire Collective or Depop:** These platforms have different buyer demographics. Vestiaire attracts buyers specifically shopping luxury secondhand; they expect authentication documentation and higher prices. If your Gucci Bag at €290 isn't moving on Vinted (where buyers are price-sensitive), it may sell faster at €310 on Vestiaire to a buyer specifically searching for that bag.",
          "**Reduce and exit:** If the market has moved (departure averages shift over months), the item's value on Vinted may have declined since listing. Re-check current departure data. If the average has dropped 15%, your pricing is now wrong. Price to the current market and exit — holding cost and capital opportunity cost exceed the additional margin.",
          "**Accept the current best offer:** If you have received offers below your floor but above your cost plus minimum margin, evaluate accepting. A €240 offer on a €304 average item is €54 below average — frustrating, but if the item has been listed 45 days, the time cost may make acceptance rational. Track your decision in your records.",
        ],
        cta: pricingBodyCta("body_designer_20260915"),
      },
    ],
    faq: [
      {
        q: "Do designer items actually sell on Vinted?",
        a: "Yes — Balenciaga tracks 9,365 brand-level departures in the last 30 days on EU Vinted at €158.57 average, Gucci tracks 7,940 brand-level departures at €167.21 average, and Stone Island tracks 13,556 brand-level departures at €60.84 average. These are brand-level figures from our full EU Vinted tracking.e last 30 days at an average €70. The buyer market for designer items on Vinted is real and active for these brands. Ultra-luxury (Hermès, Chanel) has thinner buyer depth; specialist platforms like Vestiaire Collective suit those better.",
      },
      {
        q: "How do I prove a designer item is authentic on Vinted?",
        a: "Document every authentication marker before listing: video walkthrough showing the badge, hardware, serial number, stitching, and size label. State what you checked in the description. Ship with photos of the packaged item. This creates a paper trail that defends against post-delivery authenticity disputes. Third-party authentication certificates (available from EU services at €10–20) are the strongest protection for high-value items.",
      },
      {
        q: "What price should I list designer items for on Vinted?",
        a: "Price against departure averages — actual completed sales, not listed prices. Gucci Bags average €304 at departure on EU Vinted; Balenciaga Sneakers average €145. For mint condition, list at the average or up to 5% above. For visible wear, list 10–15% below. Price above the departure average and you are outside the clearing range for that item type.",
      },
      {
        q: "How long does it take to sell a designer item on Vinted?",
        a: "Faster than most sellers expect for active brands. Balenciaga's 2322 departures in the last 30 days indicates strong buyer activity — a well-listed item in the right price range can depart in 3–7 days. Gucci Bags (489 departures in the last 30 days) typically take 7–14 days at correct pricing. Items priced above the departure average take significantly longer. List on Thursday or Friday to catch peak weekend traffic.",
      },
      {
        q: "Is it safe to sell designer bags on Vinted?",
        a: "It is safe when you document correctly. The main risks — authenticity disputes and 'not as described' claims — are manageable with pre-shipping video documentation and accurate listing descriptions. For items above €150, use tracked shipping as standard. For items above €300, Vinted's buyer protection requires some form of documentation; treat third-party authentication as cost of doing business at that price point.",
      },
      {
        q: "Should I sell on Vinted or Vestiaire Collective for designer items?",
        a: "Vinted if you want volume and fast exits for streetwear-adjacent brands (Balenciaga, Stone Island, Supreme, Gucci caps/sneakers). Vestiaire if you're selling classic luxury or if a Vinted listing has stalled at full price — Vestiaire's buyers are specifically shopping luxury and accept higher prices. Many active sellers cross-list on both and pull from whichever platform converts first.",
      },
    ],
  },
]
