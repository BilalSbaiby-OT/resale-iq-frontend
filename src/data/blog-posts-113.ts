// Batch 113 — Vinted negotiation strategy: accept, counter, or decline.
// Targets the #1 seller skill gap: how to handle offers without leaving money on the table.
// Sources: Vinted official help docs, Redrip/Vinkit/Vendy Studio seller guides (2026),
// live API data (19 Sep 2026). Zero fabrication: all numbers from the live market snapshot.

import type { BlogPost } from "./blog-posts"
import { pricingBodyCta, pricingMidCta } from "@/lib/blog-mid-cta"
import { ilinkHref } from "@/lib/blog-ilink"

export const POSTS_113: BlogPost[] = [
  {
    slug: "vinted-negotiation-strategy-accept-counter-or-decline",
    title: "Vinted Negotiation Strategy: When to Accept, Counter, or Decline (2026)",
    seoTitle: "Vinted Negotiation Strategy — Accept, Counter, or Decline | Resale IQ",
    description:
      "Most Vinted sales go through offers. Learn the 70% rule, counter-offer psychology, and when to decline — with live data from 5.4M+ tracked listings and real examples from this week's departures.",
    date: "2026-09-19",
    category: "Selling",
    readMins: 8,

    preflightQuery: "Vinted negotiation strategy accept counter decline offers",

    intro:
      "Most Vinted sales do not happen at the listed price. They happen through the Make an Offer button — buyers can send up to 25 offers per day, and sellers can counter, accept, or decline. The problem is not the offers. The problem is that most sellers have no system for handling them. They accept too low, counter too high, or decline buyers who would have paid more. This guide gives you a decision framework built on how the platform actually works — not on forum opinions.",

    definedTerm: {
      name: "Vinted Make an Offer",
      description:
        "A feature that lets buyers propose a lower price on a listing — up to 40% below the listed price. Sellers can accept, decline, or counter-offer. Offers are not binding: even if the seller accepts, the buyer must click 'Buy now' to complete the purchase. Buyers can send up to 25 offers per day.",
    },

    sections: [
      {
        h: "The 70% rule: your accept/counter/decline framework",
        p: [
          "The simplest framework that actually works: accept any offer at or above 70% of your listed price. Below 70%, counter at the midpoint between their offer and your price. Below 40%, decline politely. This is not arbitrary — it is the threshold where accepting beats waiting, and where countering beats declining.",
          "Here is the math. List at €30. A buyer offers €21 (70%) — accept. The sale closes today, you get €21, and you free up the listing. The same buyer offers €18 (60%) — counter at €24. Typical settlement is €22–24. You earn €3–6 more than accepting €18, and the buyer feels they won. The buyer offers €12 (40%) — decline. They are testing; 80% of the time they never come back at a fair price, and the 20% who do are not worth the margin sacrifice.",
          `Use the live departure data to set your floor before you list. If Fred Perry Shirts sold 160 times this week at €16 average, your floor is not €25 — it is €16, and every negotiation should anchor to that number. [Check what your item's floor is →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_negotiation_70rule_20260919"),
      },
      {
        h: "When to accept an offer immediately",
        p: [
          "Accept the offer the moment it lands if any of these are true. The offer is within 10% of your listed price — the margin is thin and the sale is fast. The item has been listed for over two months with no serious interest at full price. The buyer has a strong profile with many positive reviews. The item is seasonal and will be harder to sell later — winter coats in August, summer dresses in February. You need the closet space now.",
          "The most common mistake here is accepting out of anxiety. A seller who listed an item six weeks ago sees an offer 15% below asking and accepts immediately because they are tired of waiting. But 15% below asking on a correctly priced item is still a fair deal — if the item was priced at the sold-price benchmark, not at a wishful-thinking price. The anxiety comes from the wrong starting price, not from the offer itself.",
          `The data tells you whether your floor is real. ResaleIQ's watched departure count shows how many comparable items actually sold this week — not how many are listed. If Balenciaga sold 209 times this week at €134 average, the market is liquid and €134 is your floor. If Calvin Klein sold 6 times, the market is thin and no negotiation strategy fixes a demand problem. [Check demand for your item →](${ilinkHref("flip")})`,
        ],
        cta: pricingMidCta("ctr_negotiation_accept_20260919"),
      },
      {
        h: "The counter-offer: the zone that actually closes sales",
        p: [
          "A counter-offer is not a rejection — it is a invitation to finish the deal. The buyer made an offer because they want the item but want a better price. If you counter in the right zone, 60–70% of the time they accept. Counter too high and they walk. Counter too low and you leave money on the table.",
          "The zone is the midpoint between their offer and your price, weighted slightly upward. They offer €18 on €30. Midpoint is €24. Counter at €25 — one euro above the midpoint signals you bent without looking desperate. They feel they won. You get €7 more than the €18 they offered. The €1 difference is the psychology of concession: it costs you nothing and signals that €25 is your real floor.",
          "Never counter with a round number when the midpoint is already round. €24 is a calculated price. €25 is a concession. €30 is the same as your original listing. The exact euro matters more than the five euros.",
          `Set your counter-offer range before the offer arrives. Know your floor, know your midpoint, know your walk-away. When the offer lands, you decide in seconds — not after an hour of anxiety. [See live prices for your category →](/data)`,
        ],
        cta: pricingBodyCta("ctr_negotiation_counter_20260919"),
      },
      {
        h: "When to decline without guilt",
        p: [
          "Decline when the offer is more than 30% below your price. Decline when the item was listed less than two weeks ago and is priced correctly — let the algorithm work before you concede. Decline when you already have other buyers interested or favouriting the item. Decline when the buyer has few or no reviews and the offer pattern looks like a scam or a reseller lowballing.",
          "The hardest decline is the one that feels like it might be the only offer you will get. Reddit threads on r/vinted are full of sellers who accepted €10 on a €25 item because they were scared. The data says something different: items priced at the sold-price benchmark sell. If your item is not selling at the right price, the problem is the price, not the negotiation. Fix the price, do not accept a bad offer.",
          "The polite decline template: 'Thanks for your offer, but that is below what I can do for this item. If you would like to bundle with something else, I can do a combined price.' This leaves the door open for a bundle deal — which is the highest-margin way to close a negotiation — without accepting a price that hurts you.",
          `The watched departure data tells you whether your item should be selling. If a brand is moving 100+ units per week at a specific price, your item at that price will sell — and you can afford to decline offers that do not respect the market. [Check your item's demand →](/tools)`,
        ],
        cta: pricingMidCta("ctr_negotiation_decline_20260919"),
      },
      {
        h: "Handling aggressive negotiators and the bundle escape",
        p: [
          "Some buyers will message 'final price' and mean it as a threat. The stat is that in 70% of cases, they accept your reasonable counter. Do not drop your price out of fear of losing the sale — an aggressive negotiator who forces a €5 discount today will leave a bad review when the item arrives. The cost of the discount is less than the cost of the bad review.",
          "The bundle is the highest-margin negotiation tool on Vinted. When a buyer is stuck €3 below your floor, offer to include a second item from your closet at a combined price. They get a deal — two items for less than two separate purchases. You get a higher total sale and clear two listings instead of one. The shipping cost to you is the same for two items as for one.",
          "Never negotiate outside Vinted. Any buyer who asks to pay via bank transfer, PayPal Friends, or 'direct to avoid fees' is asking you to lose buyer protection. Decline politely and move on. The Vinted fee structure is already in your favour — sellers pay no commission on most sales. There is no reason to go off-platform.",
          `The bundle strategy works best when you have multiple items in the same niche. A buyer negotiating on a Stone Island Hoodie might also want a Stone Island T-shirt. Your data shows which items move together — use it to build bundles that feel like a win for both sides. [See what sells well together →](${ilinkHref("data")})`,
        ],
        cta: pricingBodyCta("ctr_negotiation_aggressive_20260919"),
      },
      {
        h: "Real examples from this week's data (19 September 2026)",
        p: [
          "Fred Perry Shirts: 160 watched departures this week at a €16 average exit. The market is liquid — items sell. The negotiation game is fast turnover: list at €18 (odd price, 12% above benchmark), expect offers at €14–15, counter at €16–17, accept €15+ if the buyer has good reviews. Do not hold out for €18 — the volume is there but the margin per unit is thin. The profit is in the turnover.",
          "Stone Island Hoodies: 101 watched departures this week at a €71 average exit. The margin per unit is strong (€25+ gross after sourcing). List at €79 (just under €80 threshold). Expect offers at €55–60. Counter at €68–72. The buyer who offers €55 is a reseller — decline politely and wait for the end consumer who will pay €65+. The data says the item will sell at €71, so there is no race.",
          "Balenciaga Sneakers: 60 watched departures this week at a €166 average exit. High-value items get lowballed harder because the absolute euro amount is bigger. A buyer offering €120 on €166 is at 72% — accept if the profile is clean. A buyer offering €100 is at 60% — counter at €140. The absolute euro difference between €120 and €140 is larger than on a Fred Perry shirt, but the percentage logic is the same. Use the 70% rule, not your feelings about the item.",
          "These three examples show the full spectrum: high-volume thin-margin where you accept fast (Fred Perry), strong-margin where you hold (Stone Island), and high-value where the absolute euros make the counter-offer zone wider (Balenciaga). The negotiation strategy does not change — only the numbers do.",
          `The checker tells you which bucket an item falls into before you list it. [Check your item →](/tools)`,
        ],
        cta: pricingBodyCta("ctr_negotiation_examples_20260919"),
      },
    ],

    faq: [
      {
        q: "Should I accept the first offer on my Vinted listing?",
        a: "Not immediately. Wait a few hours even if the offer suits you. It shows the buyer your price is not artificially inflated, keeps them mentally engaged, and maintains room for a potential counter. But if the offer is ≥70% of your listed price and the item has been listed for weeks, accept — the sale is worth more than the wait.",
      },
      {
        q: "What percentage below my asking price should I accept?",
        a: "Use the 70% rule: accept at or above 70% of your listed price. Below 70%, counter at the midpoint (weighted €1 upward). Below 40%, decline politely. A €30 item: €21+ accept, €18–20 counter at €24–25, below €12 decline. The exact threshold depends on your margin floor, which the live departure data tells you.",
      },
      {
        q: "How do I counter-offer without offending the buyer?",
        a: "Counter at the midpoint between their offer and your price, plus €1 if the midpoint is round. They offer €18 on €30 — counter at €25, not €24. Accompany it with a short reason: 'I can do €25 because the item is in great condition.' The reason costs you nothing and makes the counter feel like a concession rather than a random number.",
      },
      {
        q: "When should I decline an offer on Vinted?",
        a: "Decline when the offer is more than 30% below your price, when the item was listed less than two weeks ago and is priced correctly, when you have other interested buyers, or when the buyer profile is thin or the offer pattern looks like a scam. The polite decline leaves the door open for a bundle deal without accepting a price that hurts you.",
      },
      {
        q: "Is a buyer who says 'final price' actually done negotiating?",
        a: "No. In 70% of cases, a buyer who says 'final price' accepts your reasonable counter. Do not drop your price out of fear. Reply with 'My real final price is €X, win-win' and hold. If they walk, the item was not going to sell at their price anyway — the data will show you whether the market supports your number.",
      },
      {
        q: "Should I bundle items to close a negotiation?",
        a: "Yes. When a buyer is stuck below your floor, offer a bundle: two items at a combined price. They get a deal, you get a higher total sale and clear two listings. Shipping cost to you is the same for two items as for one. The bundle is the highest-margin way to close a negotiation on Vinted.",
      },
      {
        q: "Can I negotiate outside Vinted to avoid fees?",
        a: "Never. Sellers pay no commission on most Vinted sales. Any buyer asking to pay via bank transfer, PayPal Friends, or 'direct to avoid fees' is asking you to lose buyer protection. Decline politely and move on. The platform's fee structure is already in your favour.",
      },
      {
        q: "How long should I wait before responding to a Vinted offer?",
        a: "Wait a few hours even if the offer suits you. It keeps the buyer engaged and maintains your negotiating position. Offers expire after roughly 24 hours, so you have time to check the item's live departure data, set your floor, and respond with a clear decision — not a panicked one.",
      },
    ],
  },
]
