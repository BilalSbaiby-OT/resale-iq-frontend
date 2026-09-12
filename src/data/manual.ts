// THE VINTED RESELLING MANUAL — part 1 of 2 (chapters 1-8).
//
// Long-form operator content, split across two files purely to keep each under
// a readable length. Pages must import ALL_CHAPTERS from here, never CHAPTERS,
// or half the manual silently disappears — the same trap the blog-posts files
// have.
//
// EDITORIAL RULES for anything added here:
//  1. Nothing copied from Reddit, forums or competitors. Every claim is either
//     structural (fee maths, capital turns) or comes from our own dataset.
//  2. No invented statistics. If a number is not measured, describe the shape
//     of the effect instead of inventing a figure for it.
//  3. Never publish a paid signal (buy-below prices, per-model stats, scores).
//     Teaching the method is fine; handing over the output is the product.
//  4. No tax, legal or financial advice — describe the rules, point at a pro.

import { CHAPTERS_2 } from "./manual-2"

export interface ManualSection {
  h2: string
  body: string[]
  list?: string[]
  callout?: { label: string; text: string }
}

export interface ManualChapter {
  slug: string
  number: number
  part: string
  title: string
  description: string
  minutes: number
  intro: string
  sections: ManualSection[]
  takeaways: string[]
  faq: { q: string; a: string }[]
  // Optional content-refresh date (YYYY-MM-DD). When a chapter carries a dated
  // live-data callout, set this so the sitemap advertises the real refresh day
  // instead of the static build date — otherwise a genuinely-changed page tells
  // crawlers it hasn't (the EXP-20 stale-lastmod trap, manual half).
  updated?: string
}

export const PARTS = [
  { name: "The economics", blurb: "The arithmetic that decides whether any of this is worth doing." },
  { name: "Sourcing", blurb: "Where stock comes from and how to judge it before you pay." },
  { name: "Selling", blurb: "Turning inventory into money at the speed you planned for." },
  { name: "Running it as a business", blurb: "Cashflow, measurement, scale and the rules you sit under." },
]

export const CHAPTERS_1: ManualChapter[] = [
  {
    slug: "what-actually-makes-money",
    number: 1,
    part: "The economics",
    title: "What actually makes money in reselling",
    description:
      "The full margin equation for Vinted resale — buy price, platform fee, shipping, returns and time — and why most resellers only track the first two.",
    minutes: 7,
    intro:
      "Almost everyone who starts reselling tracks two numbers: what they paid and what it sold for. The gap between them feels like profit. It is not. It is revenue minus cost of goods, and there are four more subtractions between that figure and the money that stays in your account.",
    sections: [
      {
        h2: "The equation nobody writes down",
        body: [
          "Profit on a single item is the sale price, minus the platform's cut, minus whatever shipping you absorbed, minus the buy price, minus the share of your losses that this item has to carry. That last term is the one that gets skipped, and it is usually the one that decides whether the month was profitable.",
          "Losses are not optional. Some items never sell. Some sell after four price cuts. Some come back as returns or disputes. If you sell 100 items and 12 of them end up at or below cost, the other 88 are paying for those 12 whether you account for it or not. A reseller who thinks they are running a 35% margin and is actually running 24% will keep reinvesting at prices that cannot work.",
        ],
        list: [
          "Sale price — what the buyer actually pays you, not the list price",
          "Platform fee — Resale IQ models 5% on Vinted; other platforms run 9.5% to 20%",
          "Shipping absorbed — anything you covered to close the sale",
          "Buy price — including petrol, parking, entry fees and the items you bought in the same lot that you cannot sell",
          "Loss allowance — the write-offs and deep discounts spread across everything that did sell",
        ],
      },
      {
        h2: "Margin percentage is the wrong headline number",
        body: [
          "A 50% margin on a €10 item is €5. A 20% margin on a €120 item is €24. Percentage margin is useful for comparing two items of similar price and useless for deciding where to put your money. What you are actually optimising is euros of profit per euro of capital per week — margin and speed together, never margin alone.",
          "This is why volume brands and premium brands are different businesses rather than better and worse versions of the same one. High-volume, low-price stock returns small amounts quickly and forgives mistakes. Premium stock returns larger amounts slowly and punishes them. Both work. Mixing them without noticing which one you are doing does not.",
        ],
        callout: {
          label: "The test",
          text: "Before buying anything, ask what this item returns per week of shelf life, not what it returns per sale. An item that doubles your money in six months is worse than one that adds 25% in three weeks.",
        },
      },
      {
        h2: "Why the buy price carries all the risk",
        body: [
          "You control exactly one number in the equation. You do not set the platform fee, you cannot make a buyer pay above market, and you can only influence sell-through at the margins. The buy price is the whole of your control surface, which is why professional resellers obsess over it and hobbyists obsess over the sale price.",
          "Every mistake in judgement — wrong size, wrong season, condition worse than it looked, demand softer than you thought — is survivable if you bought low enough. None of them are survivable if you paid close to retail resale value and planned to make it up on a strong listing.",
        ],
      },
    ],
    takeaways: [
      "Profit is sale price minus fee minus shipping minus buy price minus your share of losses. Most people stop at buy price.",
      "Track euros per week of capital, not margin percentage.",
      "The buy price is the only variable you fully control — it absorbs every other mistake.",
      "Unsold and deeply-discounted stock is a real cost that has to be spread across the items that did sell.",
    ],
    faq: [
      {
        q: "What margin should I target on Vinted?",
        a: "There is no universal figure, because it depends on how fast the item turns. As a working rule, price-tier stock that sells in under three weeks can justify a thinner margin than stock that takes two months. Resale IQ's buy-below price targets a healthy margin after fees for the specific model rather than applying one blanket percentage.",
      },
      {
        q: "Do I need to account for my own time?",
        a: "If you want an honest picture, yes. Photographing, listing, answering messages and packing is roughly ten to fifteen minutes per item once you are practised. At any sensible hourly rate that makes very cheap items marginal, which is why experienced sellers raise their minimum item price long before they raise their volume.",
      },
    ],
  },
  {
    slug: "the-buy-below-price",
    number: 2,
    part: "The economics",
    title: "How to work out the most you can pay",
    description:
      "Deriving a maximum buy price from the expected sale price, the platform fee and your target margin — the single calculation that separates sourcing from shopping.",
    minutes: 6,
    intro:
      "A buy-below price is the maximum you can pay for an item and still hit your target margin after fees. It is a number you compute before you go sourcing, not a feeling you have while standing in front of a rail.",
    sections: [
      {
        h2: "The derivation",
        body: [
          "Start from the price the item realistically sells for — the asking price similar items were last listed at before they left the shelf, not the price hopeful sellers are currently asking. Take off whatever the platform deducts from you. What remains is your net revenue. Multiply that by one minus your target margin, and you have the most you can pay.",
          "Concretely, using the 5% deduction Resale IQ models for Vinted: an item that reliably sells for €40 nets about €38. If you want a 30% margin on the sale, you can pay up to about €26.60. Pay €30 and you are working for roughly 21%. Pay €34 and you are working for free once one item in ten fails to sell.",
          "Substitute your own figure — fee structures differ by platform, by market and by whether you sell as a private individual or a business, and they change. The arithmetic does not care what the number is, only that you use the real one. The profit calculator applies the current per-platform rates so you are not working from a figure you memorised a year ago.",
          "The arithmetic is trivial. The hard part is the first input — the realistic sale price — and that is where almost every bad buy originates.",
        ],
        callout: {
          label: "Watch this",
          text: "Active listings show what sellers hope to get. The asking price at the moment a listing left the shelf is our closest honest proxy for what a buyer actually paid — though we do not see a receipt; some departures are delistings or relists, not sales. Sourcing against active-listing prices is the most common way to overpay, because the ones still sitting are still sitting for a reason.",
        },
      },
      {
        h2: "Why the realistic price is not the average price",
        body: [
          "The average sale price of a model blends every condition, size and colourway together. The item in your hand is one specific point in that distribution, and it is usually not the middle. A worn-out size XS in an unpopular colour will not fetch the model average no matter how good your photos are.",
          "Adjust down for condition, for sizes at the edge of the range, and for anything seasonal that you are buying out of season. Adjust up only when you can point to something concrete — deadstock with tags, a colourway that is genuinely scarce, a size that sells faster than the rest.",
        ],
      },
      {
        h2: "Building the discipline",
        body: [
          "Set the target margin before you leave the house and do not renegotiate it in the shop. The pull to stretch on a specific item is strongest exactly when it should be resisted, because the reason you want to stretch is that the item is attractive — which means other resellers find it attractive too, which means it is priced accordingly.",
          "Walking away from a marginal buy costs you nothing except an item you would have made €3 on. Buying it costs you the cash, the shelf space and the attention, all of which had a better use.",
        ],
      },
    ],
    takeaways: [
      "Max buy price = realistic sale price, minus platform fee, times (1 − target margin).",
      "Use the asking price at departure, never a currently-active asking price, as the input.",
      "Adjust that departure price down for condition, edge sizes and out-of-season stock before you compute anything.",
      "Fix the target margin before sourcing and refuse to renegotiate it item by item.",
    ],
    faq: [
      {
        q: "Where do I find real departure prices on Vinted?",
        a: "Vinted's own search can be filtered to items sellers marked sold, which gives you a rough distribution for a specific model — though that is a seller's self-report, not a verified transaction. It is manual and slow across five markets, which is exactly the gap Resale IQ fills — the per-model figures it returns are computed from listings we watched leave the shelf across ES, FR, DE, IT and PT rather than one country's active listings.",
      },
      {
        q: "Should the target margin be the same for every item?",
        a: "No. Slow, expensive stock needs a wider margin because your money is tied up longer and the downside if it does not sell is larger. Fast, cheap stock can run thinner. A single blanket percentage is a reasonable starting point and a poor long-term policy.",
      },
    ],
  },
  {
    slug: "sell-through-vs-volume",
    number: 3,
    part: "The economics",
    title: "Sell-through rate versus volume: reading demand properly",
    description:
      "Why a category selling thousands of units a week can still be a bad place to put your money, and how to tell demand from saturation.",
    minutes: 7,
    intro:
      "Volume tells you buyers exist. Sell-through tells you whether they will get to your listing. These are different questions, and the second one is the one that determines how long your money sits still.",
    sections: [
      {
        h2: "The two numbers and what each one hides",
        body: [
          "Weekly sales volume is a count of what we watched leave the shelf. It is the number every brand page and category ranking leads with, and it is genuinely useful — a category with almost no departures is a category you should not be sourcing in, full stop.",
          "But volume says nothing about supply. A thousand departures a week against two thousand active listings is a healthy market. A thousand departures a week against forty thousand active listings is a graveyard where your item is buried on page nineteen. Sell-through — departures measured against the standing inventory — is what separates those two cases, and they look identical if you only read volume.",
        ],
        callout: {
          label: "Definition",
          text: "Sell-through is sales in a period relative to the inventory available in that period. High sell-through means stock clears; low sell-through means stock accumulates, regardless of how big the raw sales number looks.",
        },
      },
      {
        h2: "Saturation is a competitor count, not a demand signal",
        body: [
          "When a brand becomes widely known as a good flip, supply arrives before demand does. Every reseller reads the same guides, sources the same brands, and lists them in the same week. The visible symptom is not falling sales — sales can hold steady — it is that individual listings take longer and longer to move, and that price cuts become the only reliable way to close.",
          "This is why the top of a volume ranking is often the worst place to start. The leading brand in any category is the default choice for everyone, which means the price is efficient and the margin has already been competed away. The interesting rows are usually two to five places down, where demand is still solid and fewer people are looking.",
        ],
      },
      {
        h2: "Momentum: the third number",
        body: [
          "Volume and sell-through are both snapshots. Momentum is the derivative — whether this week is running ahead of or behind the recent baseline. A category with flat volume and rising momentum is warming up; the same volume with falling momentum means you are buying into a market that is cooling, and by the time you list, the numbers you sourced against will be stale.",
          "Momentum needs history to mean anything. A market you have only observed for a week has no baseline to compare against, and any momentum figure computed from it is noise dressed up as a signal — a board where every model is labelled the same way is telling you it cannot yet rank them, not that everything is hot at once. Treat any momentum reading from a short observation window with suspicion, ours included, and lean on volume and sell-through until the history is deep enough to rank against.",
        ],
      },
    ],
    takeaways: [
      "Volume proves buyers exist. Sell-through proves your listing will reach them.",
      "Identical volume figures can describe a fast market and a saturated one — only sell-through separates them.",
      "The top of a volume ranking is the most competitive, not the most profitable.",
      "Momentum without months of history is noise. Distrust any short-window trend, including ours.",
    ],
    faq: [
      {
        q: "Is a high sell-through rate always good?",
        a: "It is good for speed and it is a warning about pricing. Extremely fast sell-through often means the market is telling you the item was underpriced. If everything you list sells within 48 hours, raise your prices until it does not.",
      },
      {
        q: "How do I estimate sell-through without a tool?",
        a: "Search a specific model, note roughly how many active listings there are, then filter to sold and count how many moved in the last week or month. The ratio is crude but directionally useful. Doing it across five markets and a hundred models by hand is where it stops being practical.",
      },
    ],
  },
  {
    slug: "the-cost-of-time",
    number: 4,
    part: "The economics",
    title: "The cost of time: why fast stock beats fat margins",
    description:
      "Capital turns explained — how a 20% margin that clears in three weeks outperforms a 60% margin that takes six months, and what that means for what you buy.",
    minutes: 6,
    intro:
      "Two resellers each start with €1,000. One makes 20% per item and turns their stock every three weeks. The other makes 60% and turns it every six months. After a year the first has compounded roughly seventeen times; the second has done it twice. Same capital, radically different businesses.",
    sections: [
      {
        h2: "Turns, not margins",
        body: [
          "A turn is one full cycle: cash becomes stock, stock becomes cash. Your annual return is roughly your per-turn margin compounded across however many turns you complete. Margin is the height of each step; turns are how many steps you take. Most beginners optimise the height and ignore the count.",
          "The practical consequence is that shelf life is a cost with a price tag. Money sitting in an unsold jacket is money not buying the next three items. That opportunity cost never appears on any invoice, which is exactly why it gets ignored until the reseller notices they have €2,000 of stock and no cash.",
        ],
        callout: {
          label: "Rough rule",
          text: "Multiply your typical margin by your turns per year. If that number is not comfortably ahead of the effort you are putting in, the problem is almost always turns, not margin.",
        },
      },
      {
        h2: "Where slow stock comes from",
        body: [
          "Slow stock is rarely bought slow on purpose. It arrives through three routes: buying out of season, buying edge sizes because they were cheap, and buying premium items whose buyer pool is small. All three feel like good decisions at the moment of purchase, because the margin on paper is wide.",
          "The wide margin is compensation for the wait, not free money. A €200 coat with a €120 buy price is not a better buy than a €30 hoodie with a €18 buy price if the coat takes four months and the hoodie takes twelve days. Run the per-week arithmetic on both before deciding which one you were right about.",
        ],
      },
      {
        h2: "Designing a mix",
        body: [
          "Most working resellers end up with a deliberate blend: a base of fast, boring, reliable stock that generates the weekly cashflow, and a smaller allocation to slower, higher-margin items that would strangle the business if they were the whole of it. The base pays the bills and funds the next buy; the premium layer is where the upside lives.",
          "The mistake is drifting into an accidental version of this — a portfolio that is 80% slow because the slow items are the ones that did not sell. That is not an allocation, it is an accumulation, and the difference is whether you chose it.",
        ],
      },
    ],
    takeaways: [
      "Annual return ≈ margin per turn × turns per year. Turns are the neglected half.",
      "Shelf life is a real cost: capital in unsold stock is capital not buying the next item.",
      "A wide margin on slow stock is payment for waiting, not a superior deal.",
      "Hold a deliberate fast/slow mix. If your slow pile grew by accident, it is dead stock, not a strategy.",
    ],
    faq: [
      {
        q: "How many turns per year is realistic on Vinted?",
        a: "It depends entirely on price tier. Cheap, high-volume clothing can turn in two to four weeks when priced correctly. Premium outerwear and designer pieces routinely take months. Measure your own by tracking days-from-listing-to-sale for thirty items — the answer is usually slower than the one you would guess.",
      },
      {
        q: "Should I cut the price on something that has not sold?",
        a: "Usually yes, and sooner than feels comfortable. An item at 60 days has already told you the price is wrong. Recovering your capital at a thin margin and redeploying it beats holding out for a number the market has declined twice.",
      },
    ],
  },
  {
    slug: "where-to-source",
    number: 5,
    part: "Sourcing",
    title: "Where stock actually comes from",
    description:
      "The four supply channels for resale stock — charity and thrift, wholesale and bales, retail clearance, and platform-to-platform — with the real cost and risk of each.",
    minutes: 8,
    intro:
      "Sourcing is not one activity. It is four quite different businesses that happen to share an output, and each has a distinct cost structure, time cost and failure mode. Picking the wrong one for your capital and schedule is a more expensive mistake than picking the wrong brand.",
    sections: [
      {
        h2: "Charity shops and secondhand markets",
        body: [
          "The classic entry point: low capital, no minimum order, and you inspect every item before paying. The costs are time and variance. You might spend three hours and find two items worth listing, and you cannot plan around that — the stock is whatever was donated that week.",
          "It scales badly on purpose. The moment you need forty items a week, the hours required grow linearly and the good shops get picked over by everyone else doing the same thing. It remains an excellent way to learn what sells, because the feedback loop between judgement and outcome is short and cheap.",
        ],
      },
      {
        h2: "Wholesale lots and bales",
        body: [
          "Buying by the kilo or by the pallet inverts the trade-off: cheap per item, near-zero selection time, and you cannot see what you are buying. The economics work when your per-item cost is low enough that a large share of unsellable stock still leaves you ahead — and they collapse quietly when a supplier's grading slips.",
          "The real risks here are commercial rather than operational. Supplier quality varies between lots from the same seller, sorting a bale is genuinely physical work, and you need somewhere to put several hundred garments. Start with the smallest lot a supplier will sell you, regardless of what the per-kilo price does at volume.",
        ],
        callout: {
          label: "Before any bale",
          text: "Ask what the graded percentage is, ask what happens if the lot does not match the grade, and buy the smallest quantity available first. A cheap price per kilo on unsellable stock is not cheap.",
        },
      },
      {
        h2: "Retail clearance and outlet",
        body: [
          "Buying new stock at markdown is the most predictable channel: known condition, known sizes, full size runs, and you can reorder what works. The margin is thinner because everyone can see the same clearance price, and the window is short.",
          "This channel rewards knowing the resale value of specific models cold, because the decision has to be made in minutes and there is no negotiating. It is also the channel where a per-model buy-below price earns its keep most obviously — the question is never whether the brand is good, it is whether this particular price beats your number.",
        ],
      },
      {
        h2: "Platform-to-platform",
        body: [
          "Buying underpriced listings on one platform and reselling them on another, or in another market, is the lowest-friction channel and the most competitive. No travel, no storage before purchase, immediate scale. The catch is that everyone else can also see the listing, and the good ones are gone in minutes.",
          "It works when you have an information edge — you know a model's real value and the seller does not — and it fails when you are simply refreshing the same feed as three hundred other people. Note that the edge has to come from knowing the item, not from geography: we measured the five EU Vinted domains and found most listings appear on several of them at an identical price, so buying in one country to sell in another mostly does not work. Chapter 12 has the numbers.",
        ],
      },
    ],
    takeaways: [
      "Four channels, four cost structures: thrift buys with time, bales buy with risk, clearance buys with speed, platform arbitrage buys with information.",
      "Thrift teaches judgement cheaply but does not scale past a few dozen items a week.",
      "With bales, always buy the smallest first lot and ask what recourse you have on grading.",
      "Platform arbitrage only works with a genuine information edge, not faster refreshing.",
    ],
    faq: [
      {
        q: "Which channel should a beginner start with?",
        a: "Charity and secondhand, almost always. The capital at risk per mistake is a few euros, you see every item before paying, and the fast feedback teaches you what sells far quicker than reading about it. Move to bales or clearance once you can predict sale prices without looking them up.",
      },
      {
        q: "Are wholesale bales worth it?",
        a: "They can be, once you have both the storage and the pattern recognition to sort quickly. They are a bad first move because you cannot yet tell a good lot from a bad one, and the loss on a bad first pallet is large enough to end the experiment.",
      },
    ],
  },
  {
    slug: "reading-a-listing",
    number: 6,
    part: "Sourcing",
    title: "Reading a listing: spotting mispriced stock",
    description:
      "What underpriced listings have in common, which signals are real and which are traps, and how to check a find in under a minute.",
    minutes: 6,
    intro:
      "Mispriced listings are not random. They come from sellers who do not know what they have, and that ignorance leaves consistent, recognisable traces in the listing itself.",
    sections: [
      {
        h2: "The signature of a seller who does not know",
        body: [
          "Vague titles are the strongest single tell. Someone who writes \"black jacket size M\" is not searching for the model name because they do not know it, which means the listing will not appear for the searches that would price it correctly. The item is cheap because it is invisible, not because it is worthless.",
          "Supporting signals: photos taken on a bed or floor rather than hung, no mention of condition, a round-number price like €15 or €20 that was clearly chosen rather than researched, and a profile with few listings and a clearing-out-the-wardrobe description.",
        ],
        list: [
          "Generic title with no brand or model name",
          "Casual photography — floor, bed, poor light, no full-garment shot",
          "Round-number pricing that was guessed rather than researched",
          "Low-listing-count profile, wardrobe-clearout framing",
          "Model name present but misspelled, so search never surfaces it",
        ],
      },
      {
        h2: "The traps that look identical",
        body: [
          "The same signals appear on listings that are cheap for good reason. A vague title on a genuinely damaged item is still a damaged item. Before committing, get eyes on the specifics: ask for photos of the label, the inside seams, the soles or cuffs, and any area the existing photos conveniently do not show.",
          "A seller who cannot or will not photograph the label is a seller you should walk away from, whether the reason is a fake, damage, or simple disinterest. The cost of asking is one message; the cost of not asking is the whole buy price plus the return dispute.",
        ],
        callout: {
          label: "One-minute check",
          text: "Label photo, condition close-up, sold-price sanity check against your buy-below number. If all three pass, act quickly. If any fails, the discount was not a discount.",
        },
      },
      {
        h2: "Speed is part of the edge",
        body: [
          "Genuinely underpriced listings do not last. If your check takes ten minutes because you are hand-searching sold prices in three markets, the good ones will be gone before you finish, and you will only ever get the ones nobody else wanted — which is a selection effect that quietly destroys the returns of this whole channel.",
          "This is the argument for knowing your numbers in advance rather than looking them up in the moment. The resellers who win at arbitrage are not the ones checking hardest; they are the ones who already know what the model is worth and only have to verify the item.",
        ],
      },
    ],
    takeaways: [
      "Underpriced listings are usually invisible listings — vague titles and no model name.",
      "The same signals also mark genuinely bad items. Always demand a label photo and a condition close-up.",
      "A seller who will not photograph the label is a pass, regardless of the reason.",
      "If your verification takes ten minutes, you will systematically only get the leftovers.",
    ],
    faq: [
      {
        q: "Is it worth messaging sellers to negotiate?",
        a: "On already-underpriced stock, usually not — the delay is a bigger risk than the few euros. Negotiate on items that have been sitting for weeks, where the seller has already learned the price is wrong and nobody else is competing for it.",
      },
      {
        q: "How do I avoid buying fakes when the price looks too good?",
        a: "Treat an unexplained deep discount on a commonly-faked brand as the primary hypothesis, not a lucky break. Ask for label, stitching and hardware photos, compare against genuine examples, and skip anything where the seller gets evasive. Chapter 8 goes into this properly.",
      },
    ],
  },
  {
    slug: "sizes-and-dead-stock",
    number: 7,
    part: "Sourcing",
    title: "Sizes: the quiet way portfolios die",
    description:
      "Why size distribution matters as much as brand demand, how edge sizes turn good buys into dead stock, and the sourcing rule that follows from it.",
    minutes: 6,
    intro:
      "You can be right about the brand, right about the model, right about the condition and still be left holding stock for six months, because the size you bought is one almost nobody wears.",
    sections: [
      {
        h2: "Demand is not evenly spread across a size run",
        body: [
          "Buyer demand across sizes roughly follows the population, which means the middle of the run does most of the volume and the ends do very little. A garment in the most common two or three sizes has a large buyer pool. The same garment two sizes out has a fraction of it, and a fraction of a pool means a multiple of the waiting time.",
          "The effect compounds with price. A cheap item in an edge size still sells eventually because someone will take a chance at €12. An expensive item in an edge size can sit indefinitely, because the small pool of people who wear that size and the small pool who will spend that much barely overlap.",
        ],
        callout: {
          label: "The trap",
          text: "Edge sizes are cheap to source precisely because other resellers already learned this. The discount is the market pricing in the wait — it is not an opportunity others missed.",
        },
      },
      {
        h2: "Category changes the shape",
        body: [
          "Size sensitivity is not uniform. Outerwear and tailoring are the most punishing, because fit is the whole purchase and buyers will not compromise. Oversized styles, hoodies and tracksuit tops are far more forgiving, since a buyer who wants a relaxed fit will happily take a size up. Footwear is unforgiving in a different way: the size run is wide, demand concentrates hard in the middle, and a slow pair is slow for a long time.",
          "Accessories, bags and caps escape the problem almost entirely, which is one reason they hold value as a portfolio stabiliser even when their headline margins are unexciting.",
        ],
      },
      {
        h2: "The rule this produces",
        body: [
          "When you are unsure about an item, let the size break the tie. A middling item in a core size is a better buy than an excellent item in an edge size, because the first one converts into cash and the second converts into shelf space.",
          "If you do buy edge sizes — and there are good reasons to, particularly with genuinely scarce pieces — price them for the wait from day one rather than discovering it over three months of cuts. The reseller who lists an edge-size item at the same price as a core-size one is running an expensive experiment they have already lost.",
        ],
      },
    ],
    takeaways: [
      "Size demand follows the population: the middle of the run carries most of the volume.",
      "Edge sizes are discounted because the wait is real, not because others overlooked them.",
      "Outerwear and footwear punish size mistakes hardest; oversized styles and accessories barely notice.",
      "When two buys look equal, take the one in a core size.",
    ],
    faq: [
      {
        q: "Which sizes sell fastest on Vinted?",
        a: "It varies by brand, category and market, which is why a single answer would be misleading. The pattern is consistent — demand concentrates in the middle of each size run — but where exactly the peak sits differs between, say, women's denim and men's outerwear. Resale IQ reports the fastest-selling sizes per model rather than a generic rule.",
      },
      {
        q: "Should I ever buy edge sizes?",
        a: "Yes, when the item is scarce enough that buyers will search it out specifically, or when the discount is deep enough to survive the wait. Price it for a long hold from the start and treat it as a small allocation, not a habit.",
      },
    ],
  },
  {
    slug: "condition-and-authenticity",
    number: 8,
    part: "Sourcing",
    title: "How to Spot Fake Items on Vinted (and Grade Condition)",
    description:
      "How to spot fakes on Vinted without becoming an expert authenticator, plus a practical way to grade condition and which defects quietly kill your margin.",
    minutes: 7,
    intro:
      "Condition is the single largest price variable we can measure, and it is bigger than almost anyone assumes. Grading consistently is not perfectionism — it is how you avoid paying good-condition prices for stock you will have to describe honestly later.",
    sections: [
      {
        h2: "How much condition is actually worth",
        body: [
          "We took sold listings on Vinted Spain and grouped them by the condition the seller selected. The gap between the top and bottom grade is not a rounding error — across the categories we checked, the best grade sold for roughly three and a half to seven times the worst.",
          "Nike sneakers are the clearest example. Median sold price ran about €70 new with tags, €50 new without tags, €30 very good, €15 good, and €10 satisfactory. Adidas sneakers showed nearly the same shape, from about €55 down to €8. Levi's jeans compressed into a narrower band — roughly €40 down to €10 — and Zara jackets narrower still.",
          "Two things fall out of that. First, the drop from \"very good\" to \"good\" is brutal: on Nike sneakers it halved the median. One grade of honesty costs a lot, which is exactly why sellers over-grade and why you must not pay their grade's price without checking. Second, deadstock with tags carries a real premium — it is often the only condition where a premium buy price is justified.",
        ],
        callout: {
          label: "Read this honestly",
          text: "These grades are seller-selected and confounded — an item listed new-with-tags is also more likely to be a newer, more desirable model, so not all of the gap is condition alone. The direction and the rough scale are solid; treat the exact multiples as indicative.",
        },
      },
      {
        h2: "Grade in the shop, not at home",
        body: [
          "Check condition before money changes hands, in daylight, with a consistent routine: underarms and collar for staining, seams and crotch for splitting, cuffs and hems for wear, zips and buttons for function, and the whole garment held up to light for holes. It takes forty seconds once it is habit.",
          "Write the grade down at the point of purchase. Grading from memory a week later, with the item already bought and the money already spent, reliably produces a more generous assessment than the item deserves — and an over-graded listing is how you get returns, disputes and a damaged rating.",
        ],
        list: [
          "Pilling and bobbling — cosmetic, cheap to fix, mildly price-reducing",
          "Small marks and stains — often removable, always disclose if not",
          "Fading and colour loss — usually terminal for premium pricing",
          "Holes, splits, broken zips — repair cost almost always exceeds the value added",
          "Odour, smoke or damp — the one defect buyers will not forgive; walk away",
        ],
      },
      {
        h2: "Which defects are actually fatal",
        body: [
          "The economics are simpler than they look. Anything a wash and a de-bobbler can fix is not really a defect, and buying lightly-pilled stock cheaply is a genuine edge. Anything requiring a repair — a replacement zip, a re-stitched seam — almost never pays, because the labour cost is fixed while the value added is proportional to a garment that is, by definition, already damaged.",
          "Smell is the exception that deserves its own rule. Smoke and damp survive washing more often than people expect, buyers detect it instantly on arrival, and it converts directly into returns and bad reviews. There is no price low enough to make it worthwhile.",
        ],
      },
      {
        h2: "Counterfeits, without becoming an authenticator",
        body: [
          "You do not need to be an expert on every brand. You need to know which brands in your range are heavily faked, and to apply extra scrutiny only to those. Concentrate on the parts counterfeiters get wrong most consistently: interior labels and their stitching, hardware weight and finish, font and spacing on any printed branding, and the quality of the stitch line where two panels meet.",
          "The commercial rule matters more than the technical one. If you are not confident, do not buy — and if you have already bought and are not confident, do not sell it as genuine. Listing something you cannot stand behind risks your account, and an account is worth considerably more than any single item.",
        ],
        callout: {
          label: "Non-negotiable",
          text: "Never list an item as authentic when you are unsure. The downside is not a refund — it is the account, the rating and every future sale that would have run through them.",
        },
      },
    ],
    takeaways: [
      "Condition is the biggest measurable price variable: best grade sold for ~3.5–7× the worst across the categories we checked.",
      "The very-good to good step alone halved the median on Nike sneakers. Never pay a grade's price without verifying the grade.",
      "Grade before paying, in daylight, to a fixed routine — and write it down immediately.",
      "Washable defects are an opportunity; repairable ones rarely pay for the repair.",
      "Smoke and damp odour has no viable price. Walk away.",
      "Scrutinise only the brands that are actually faked, and never list an item you cannot vouch for.",
    ],
    faq: [
      {
        q: "Should I disclose small flaws in a listing?",
        a: "Always, with a photo of the flaw. The disclosure costs you a small amount of price and eliminates the return, the dispute and the rating hit. Buyers are markedly more forgiving of a flaw they were shown than of one they discovered.",
      },
      {
        q: "How do I handle a buyer claiming an item is fake?",
        a: "Respond through the platform, provide your sourcing detail and the photos you took before dispatch, and follow the platform's dispute process rather than arguing directly. This is the strongest argument for photographing labels and condition on every item before it ships — the evidence has to already exist when the claim arrives.",
      },
    ],
  },
]

/** Every chapter, in order. Always import this, never CHAPTERS_1 alone. */
export const ALL_CHAPTERS: ManualChapter[] = [...CHAPTERS_1, ...CHAPTERS_2]

export function getChapter(slug: string): ManualChapter | undefined {
  return ALL_CHAPTERS.find((c) => c.slug === slug)
}
