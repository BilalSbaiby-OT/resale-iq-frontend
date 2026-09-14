// THE VINTED RESELLING MANUAL — part 2 of 2 (chapters 9-16).
// Editorial rules and the type definition live in ./manual.ts. Chapters added
// here are picked up automatically by ALL_CHAPTERS.

import type { ManualChapter } from "./manual"

export const CHAPTERS_2: ManualChapter[] = [
  {
    slug: "pricing-your-listing",
    number: 9,
    part: "Selling",
    updated: "2026-09-12",
    title: "Pricing a listing, and when to cut",
    seoTitle: "How to Price a Vinted Listing (and When to Cut) — The Vinted Reselling Manual",
    description:
      "Setting an opening price that leaves room to negotiate, running a disciplined markdown schedule, and knowing when a price cut is cheaper than waiting.",
    minutes: 7,
    intro:
      "Pricing is two decisions, not one: what you open at, and what you do when it does not sell. Most resellers agonise over the first and improvise the second, which is the wrong way round — the second one is where the money actually goes.",
    sections: [
      {
        h2: "The opening price",
        body: [
          "Open slightly above your target, not dramatically above it. A modest premium leaves room to accept an offer and lets a price drop register as a genuine reduction later. A large premium gets you filtered out of the searches where buyers set a maximum, which means nobody sees the listing at all and you learn nothing from the silence.",
          "Anchor the number to the asking price at departure for the same model in similar condition. Where the item is at the edge of the distribution — worn, edge size, off-season — start closer to your floor, because the extra premium is not going to be paid and all it buys you is weeks of invisibility.",
          "How far apart those anchors sit is easy to underestimate until you see the spread. As of 14 September 2026, across the brands we watch leave Vinted's shelf, a Fred Perry Shirt departed at an average of €14 (460 watched departures in seven days), a Stone Island Jacket at €142 (179), and a Gucci Bag at €306 (83) — the same \"sell one garment\" motion spanning roughly twenty times the price. A number that is right for one is nonsense for another, which is exactly why the anchor has to come from your model's own departures rather than a category feel or a round figure that looks sensible.",
        ],
        callout: {
          label: "Price-filter awareness",
          text: "A buyer who sets a maximum price will almost always set a round one. So listing at €51 risks being filtered out of the results of everyone who capped at €50 — for one euro of upside. Price just under the round numbers, not just over.",
        },
      },
      {
        h2: "A markdown schedule beats improvisation",
        body: [
          "Decide the schedule when you list, not when you are frustrated. Something like: hold the opening price for two weeks, cut modestly at three, cut again at six, and set a hard decision point at ten weeks where the item either goes at whatever it will fetch or gets bundled. The exact numbers matter less than having them fixed in advance.",
          "The reason to pre-commit is that the decision is emotionally distorted at the moment it has to be made. By week eight you are attached to the item, aware of what you paid, and inclined to wait one more week — repeatedly. A schedule you wrote when you were neutral is more reliable than a judgement you make when you are not.",
        ],
      },
      {
        h2: "Cutting is usually cheaper than waiting",
        body: [
          "An item that has been listed for two months has been shown to a large number of relevant buyers and declined by all of them. That is information, and the information is that the price is wrong. Holding out is a bet that the next buyer values it more than the last hundred did, which is occasionally true and usually not.",
          "The comparison to run is not \"this price versus the price I wanted\". It is \"this price now versus that price maybe, minus another two months of my capital being unavailable\". Framed that way, the cut is often obviously correct at a point where it still feels premature.",
        ],
      },
    ],
    takeaways: [
      "Open modestly above target — enough to negotiate, not enough to be filtered out.",
      "Write the markdown schedule at listing time, while you are still neutral about the item.",
      "Sixty days of no sale is the market answering the question. Believe it.",
      "Compare the cut against the price you want minus two more months of tied-up capital.",
    ],
    faq: [
      {
        q: "How should I set the opening price on Vinted?",
        a: "Open slightly above your target, anchored to the asking price at departure for the same model in similar condition. A large premium gets you filtered out of max-price searches, so you learn nothing from the silence.",
      },
      {
        q: "When should I cut the price on a Vinted listing?",
        a: "Decide the schedule when you list. Hold the opening price about two weeks, cut modestly at three, again at six, and make a hard call at ten weeks. Sixty days of no sale is the market answering.",
      },
      {
        q: "Should I accept low offers?",
        a: "Compare the offer against your buy price and the realistic outcome of waiting, not against your asking price. An offer that clears a thin profit on week two is frequently better than the same money on week ten, because the capital comes back sooner.",
      },
      {
        q: "Does relisting an item help?",
        a: "It can restore visibility in feeds that favour recent listings, but it does not fix a pricing problem. If an item has been declined for two months, relisting it at the same price mostly buys you a fresh audience for the same wrong number.",
      },
    ],
  },
  {
    slug: "photos-and-titles",
    number: 10,
    part: "Selling",
    updated: "2026-09-12",
    title: "Photos and titles: the conversion layer",
    seoTitle: "How to Write Vinted Titles and Photos That Sell — The Vinted Reselling Manual",
    description:
      "The listing work that actually moves the needle — searchable titles, a repeatable photo set, and descriptions that reduce returns rather than sell.",
    minutes: 6,
    intro:
      "Sourcing decides whether a sale is possible. The listing decides whether it happens, and how fast. It is the cheapest lever in the whole operation and the one most consistently under-worked.",
    sections: [
      {
        h2: "Titles are a search problem, not a copywriting one",
        body: [
          "Buyers find items by typing what they want. Your title's only job is to contain those words. Brand, model, category, colour, size — in the order a person would actually search — beats anything clever, because clever does not match a query.",
          "This is the direct inverse of the mispricing signal from chapter 6. The listings you buy cheaply are the ones with vague titles; the listings you sell well are the ones with precise ones. Getting the model name right is worth more than every other listing optimisation combined, because it is the difference between appearing in the right search and not existing.",
          "As of 14 September 2026, across the brands we watch leave Vinted's shelf, a Stone Island Hoodie departed at an average of €55 (439 watched departures in seven days) and a Fred Perry Shirt at €14 (460). At that volume the title is a search problem: leave out the brand or the category noun and the listing is not in the results those buyers are already typing.",
        ],
        list: [
          "Brand first — it is the most common opening search term",
          "Model name, spelled the way buyers spell it",
          "Category noun, so category browsers reach you",
          "Colour and size, which are frequent filter terms",
          "No filler: \"rare\", \"vintage\", \"must have\" match nothing anyone searches",
        ],
      },
      {
        h2: "A repeatable photo set",
        body: [
          "Consistency matters more than production value. Use the same spot, the same light, the same framing every time, and the listing stops being a creative task and becomes a two-minute routine you can do forty times in an evening.",
          "The set that works: full garment flat or hung in daylight, a back shot, a close-up of the brand label, a close-up of the size label, a texture or fabric shot, and an honest photo of any flaw. That last one is not a concession — it is the single most effective return-prevention measure available.",
        ],
        callout: {
          label: "Why daylight",
          text: "Indoor artificial light shifts colours, and colour mismatch is a leading cause of returns. A window and a neutral background costs nothing and removes a whole category of dispute.",
        },
      },
      {
        h2: "Descriptions prevent problems, they do not persuade",
        body: [
          "Nobody buys because of the description. But plenty of people return because of what it left out. Measurements, exact condition, fabric, and any flaw with a photo — stated plainly — is the whole job. Persuasive adjectives add nothing and set expectations the item then has to meet.",
          "Measurements deserve emphasis, particularly across borders. Sizing conventions differ between markets and brands, and a buyer working from a label alone is guessing. Pit-to-pit and length take fifteen seconds with a tape measure and remove the most common reason a garment comes back.",
        ],
      },
    ],
    takeaways: [
      "Titles exist to match searches: brand, model, category, colour, size. Nothing else.",
      "A fixed photo routine beats occasional high-effort photography.",
      "Photograph flaws deliberately — it is the cheapest return prevention there is.",
      "Measurements in centimetres prevent more returns than any other single line of text.",
    ],
    faq: [
      {
        q: "What should a Vinted title include?",
        a: "Brand, model, category, colour, size — in the order a buyer would search. Filler like \"rare\" or \"must have\" matches nothing anyone types.",
      },
      {
        q: "How many photos should a listing have?",
        a: "Five to seven covers it: full front, back, brand label, size label, fabric close-up, and any flaw. More than that adds effort without adding conversion; fewer than four leaves the buyer guessing about something.",
      },
      {
        q: "Do descriptions sell the item?",
        a: "No. They prevent returns. Measurements, exact condition, fabric, and a photo of any flaw — stated plainly — is the whole job. Persuasive adjectives add nothing and set expectations the item then has to meet.",
      },
      {
        q: "Should I write listings in the local language of each market?",
        a: "For a cross-border listing it helps materially, because buyers search in their own language. A pragmatic middle ground is to keep the title's brand and model in their original form — those are searched identically everywhere — and translate the category noun and description.",
      },
    ],
  },
  {
    slug: "vinted-mechanics",
    number: 11,
    part: "Selling",
    updated: "2026-09-13",
    title: "Vinted mechanics you can actually control",
    seoTitle: "Vinted Bumps, Offers and Visibility That Work — The Vinted Reselling Manual",
    description:
      "How visibility, bumps, offers and buyer messaging work in practice, and which of the levers are worth paying for.",
    minutes: 6,
    intro:
      "Every marketplace has a set of mechanics that determine who sees what. Some are worth optimising, some are worth paying for occasionally, and some are folklore. Knowing which is which saves both money and a lot of wasted effort.",
    sections: [
      {
        h2: "Freshness is the lever you get for free",
        body: [
          "Secondhand marketplace feeds generally favour recent activity, so a newly-listed item tends to get an initial burst of visibility that fades. We have not measured Vinted's ranking directly and nobody outside the company can, so treat this as a working assumption rather than a fact — but it is the assumption the platform's own bump products are sold on, which is reasonable evidence it holds.",
          "If it does hold, listing cadence matters: spreading twenty listings across a week should beat posting all twenty on Sunday evening, because each gets its own moment in the feed instead of competing with your other nineteen. This one is cheap to test on your own account, and worth testing rather than believing.",
          "It also means a stale listing is not being shown to many people, which is worth remembering before concluding that the price is wrong. Sometimes the price is fine and the listing is simply invisible.",
        ],
      },
      {
        h2: "Paid visibility, honestly assessed",
        body: [
          "Paid bumps and wardrobe spotlights buy attention, not demand. On an item that is correctly priced and simply lost in the feed, that attention can convert. On an item that is overpriced, it buys a larger number of people the chance to decline it.",
          "The discipline is to fix the price first and only then consider paying for visibility, rather than using promotion as a substitute for a markdown. Treat any spend as a cost against that item's margin and check afterwards whether it actually paid — most resellers never measure this, which is why opinions about it vary so wildly.",
        ],
        callout: {
          label: "Order of operations",
          text: "Right price, then good title and photos, then paid visibility. Promotion applied to a bad price is the most reliably wasted money in reselling.",
        },
      },
      {
        h2: "Offers, bundles and buyer messages",
        body: [
          "Offers are a negotiation channel with a deadline, which mostly works in your favour: a buyer who makes an offer has already decided they want the item. Countering modestly rather than accepting immediately is usually worth a few euros, and rarely loses the sale outright.",
          "Bundles are the most under-used tool available. A buyer taking three items in one transaction gives you a single shipment, a single interaction, and three items off the shelf — and they are often happy to trade a discount for it. Actively suggesting a bundle to someone browsing several of your listings converts far better than waiting for them to propose it.",
          "Respond quickly to messages. Not because of any ranking effect, but because a buyer asking a question is a buyer with intent, and intent is perishable.",
        ],
      },
    ],
    takeaways: [
      "Recency drives visibility — spread listings across the week rather than batching them.",
      "Paid bumps buy attention, never demand. Fix the price before spending.",
      "Counter offers modestly; the buyer has already decided they want it.",
      "Bundles clear multiple items in one transaction and are badly under-used.",
    ],
    faq: [
      {
        q: "Does listing everything on Sunday night work?",
        a: "Spreading listings across the week should beat posting them all on Sunday evening, because each gets its own moment in a recency-weighted feed. We have not measured Vinted's ranking directly — test it on your own account rather than treating it as fact.",
      },
      {
        q: "Are Vinted bumps worth the money?",
        a: "Sometimes, on correctly-priced items that have gone stale in the feed. Track the outcome per item rather than trusting a general impression — the honest answer varies by price tier and category, and most sellers who have strong opinions about it have never measured.",
      },
      {
        q: "Are bundles worth using on Vinted?",
        a: "Yes. A buyer taking three items is one shipment and three items off the shelf. Suggesting a bundle to someone browsing several of your listings converts better than waiting for them to propose it.",
      },
      {
        q: "How fast should I reply to buyers?",
        a: "Same day, ideally within a few hours. Buyer interest decays quickly and a competing listing is one tap away. Batching replies twice a day is a reasonable compromise once volume makes constant checking impractical.",
      },
    ],
  },
  {
    slug: "cross-border-markets",
    number: 12,
    part: "Selling",
    updated: "2026-09-13",
    title: "The five EU markets are mostly one market",
    description:
      "We measured how much Vinted's ES, FR, DE, IT and PT catalogues overlap. Most listings appear on several domains at an identical price — which means the country-arbitrage playbook does not work the way it is usually described.",
    minutes: 7,
    intro:
      "The standard advice is to buy in a cheap country and sell in an expensive one. We checked that against our own crawl of all five Vinted domains, and it does not survive contact with the data. The five markets are far closer to one shared catalogue than to five separate ones.",
    sections: [
      {
        h2: "What we measured",
        body: [
          "For several high-volume brand and category combinations, we took every listing we had collected on each of the five domains and compared them by listing ID. If the domains were genuinely separate marketplaces, the overlap between them would be small. It is not — the large majority of listings we checked showed up on more than one domain, and a substantial share showed up on all five at once. We have not yet published the exact percentages with the query and date behind them, so treat the size of the effect as directional rather than precise.",
          "The price finding is the clearer one. Of the listings that appeared on four or more domains, close to all of them carried an identical price on every single one. Not a similar price — the same number.",
        ],
        callout: {
          label: "What this means in one line",
          text: "Vinted is largely one catalogue surfaced under five domains, not five national marketplaces. A buyer browsing the Italian site can already see the Spanish listing, at the Spanish price.",
        },
      },
      {
        h2: "Why the arbitrage playbook fails here",
        body: [
          "Arbitrage requires that the buyer in the expensive market cannot easily see the cheap market. On Vinted, for most listings, they can — the item is already visible to them at the same price. There is no gap to capture, because the platform has already closed it.",
          "This also means you should be sceptical of any tool or guide quoting per-country Vinted sales volumes. If those figures come from counting each domain separately, they are counting the same listings several times over, and the differences between countries they present as insight are mostly differences in crawl coverage. We publish a single aggregated figure across the five markets specifically to avoid that error.",
          "There is a real exception, and it is the minority tail: a smaller share of listings we found on only one domain, varying by category. Genuinely local inventory does exist. It is simply much smaller than the conventional advice implies, and it is not where a beginner should be looking for an edge.",
        ],
      },
      {
        h2: "What the shared catalogue is actually good for",
        body: [
          "Read the finding the other way round and it is good news. Your listing is not competing for one country's buyers — it is exposed to a pool spanning five of the largest secondhand markets in Europe. Demand is deeper than a single-country view suggests, which is precisely why a thin-looking national niche can still clear quickly.",
          "The practical work shifts from picking a market to being legible across all of them. Keep brand and model names in their original form, since those are searched identically everywhere. Translate the category noun and the description where you can. Always give measurements in centimetres, because a buyer reading a size label from another country's convention is a buyer guessing, and guessing produces returns.",
          "Be explicit about shipping. A buyer who was not clearly told the item crosses a border is unhappy on day six, and that converts into a rating that costs more than the sale earned.",
        ],
      },
      {
        h2: "Where local advantage is real",
        body: [
          "The sourcing side is genuinely national in a way the selling side is not. Charity shops, car boot sales, local classifieds and wholesale contacts are all bounded by geography, and they are not visible to a reseller in another country. That is a real, durable edge — it just sits upstream of the platform, not on it.",
          "So the honest version of the cross-border strategy is the inverse of the usual one: source locally, where distance genuinely protects you from competition, and sell into the shared pool, where distance does not exist.",
        ],
      },
    ],
    takeaways: [
      "The large majority of listings we checked appear on more than one Vinted domain; a substantial share appear on all five.",
      "Nearly all multi-domain listings carry an identical price everywhere — there is little gap left to arbitrage.",
      "Per-country Vinted volume figures usually double-count: summing domains overstates distinct listings by several times.",
      "Source locally, where geography protects you. Sell into the shared pool, where it does not.",
    ],
    faq: [
      {
        q: "Are Vinted ES, FR, DE, IT and PT separate marketplaces?",
        a: "No. The large majority of listings we checked appear on more than one domain, and nearly all multi-domain listings carry an identical price. It is largely one catalogue under five domains, not five national marketplaces.",
      },
      {
        q: "Can I buy on Vinted in one country and resell in another?",
        a: "Generally not profitably, because for most listings the buyer in the second country can already see the first listing at the same price. Our crawl found that of listings present on four or more domains, nearly all were priced identically on all of them. The exception is the minority of genuinely single-country inventory, which is a much smaller pool than the usual advice suggests.",
      },
      {
        q: "Which Vinted market is best to sell in?",
        a: "For most listings the question does not apply the way it is usually asked, because the item surfaces across several domains regardless. That is why Resale IQ reports one aggregated figure across ES, FR, DE, IT and PT rather than five national ones — presenting them separately would mean counting the same listings several times.",
      },
      {
        q: "Where is local advantage real on Vinted?",
        a: "On the sourcing side: charity shops, car boots, local classifieds and wholesale contacts are bounded by geography. Source locally, where distance protects you, and sell into the shared pool, where it does not.",
      },
    ],
  },
  {
    slug: "inventory-and-cashflow",
    number: 13,
    part: "Running it as a business",
    updated: "2026-09-13",
    title: "Inventory and cashflow",
    seoTitle: "Why Profitable Resellers Still Run Out of Cash — The Vinted Reselling Manual",
    description:
      "How much stock to hold, why profitable resellers still run out of money, and the simple discipline that prevents it.",
    minutes: 6,
    intro:
      "The most common way a growing resale operation fails is not lack of profit. It is holding all the profit as clothing. Every euro earned goes into the next buy until there is a full rail, a good spreadsheet and no cash.",
    sections: [
      {
        h2: "Profit and cash are different things",
        body: [
          "Profit is recognised when an item sells. Cash is what is in the account today. A month where you bought eighty items and sold sixty can be highly profitable and still leave you with less money than you started with — the difference is sitting on the rail, and the rail does not pay for the next bale.",
          "This gap widens as you grow, because growth is funded by buying more than you sell. That is fine and normal, right up until an unexpected cost arrives and there is nothing liquid to meet it.",
        ],
      },
      {
        h2: "Two rules that prevent it",
        body: [
          "First: keep a reserve you do not source from. A fixed buffer that is simply not available for buying stock, however good the opportunity looks. Its whole purpose is to be there when something unplanned happens, and any reserve you are willing to raid for a good deal is not a reserve.",
          "Second: cap your inventory in units, not euros. A euro cap drifts upward as you move into more expensive stock. A unit cap forces the real question — can I actually photograph, list and manage this many items? — and that constraint binds long before the money does.",
        ],
        callout: {
          label: "The listing bottleneck",
          text: "Most resellers can source far more than they can list well. Stock you have not listed is generating nothing while occupying capital. If unlisted items are piling up, buying more is the wrong move.",
        },
      },
      {
        h2: "Ageing your stock",
        body: [
          "Group inventory by how long it has been listed — under 30 days, 30 to 60, 60 to 90, and over 90. The shape of that distribution is the fastest health check available. A business in good order is heavily weighted to the first bucket; one in trouble has a growing tail.",
          "The over-90 bucket needs a standing policy rather than case-by-case deliberation: bundle it, discount it hard, or write it off. Whatever you choose, decide it once and apply it automatically, because the alternative is a rail that only ever grows.",
        ],
      },
    ],
    takeaways: [
      "Profitable and cash-poor is the normal failure mode. Growth consumes cash by design.",
      "Hold a reserve that is genuinely off-limits for sourcing.",
      "Cap inventory in units — your listing capacity binds sooner than your money does.",
      "Age your stock in buckets and run a standing policy on everything past 90 days.",
    ],
    faq: [
      {
        q: "Why do profitable Vinted resellers run out of cash?",
        a: "Profit is recognised when an item sells; cash is what is in the account today. A month where you bought eighty and sold sixty can be highly profitable and still leave you with less money — the difference is sitting on the rail.",
      },
      {
        q: "How much stock should I hold?",
        a: "As much as you can list, photograph and manage properly, which is usually less than you can afford. Work backwards from your listing throughput per week and the time it takes stock to sell, rather than from your available cash.",
      },
      {
        q: "Should I cap inventory in euros or in units?",
        a: "Units. A euro cap drifts as you move into more expensive stock. A unit cap asks whether you can photograph, list and manage this many items — and that constraint binds first.",
      },
      {
        q: "What do I do with stock that will not sell at any price?",
        a: "Bundle it with items that do move, sell it on as a job lot, or donate it and take the loss cleanly. Holding it costs space, attention and the illusion that it is still an asset — none of which is free.",
      },
    ],
  },
  {
    slug: "metrics-that-matter",
    number: 14,
    part: "Running it as a business",
    updated: "2026-09-13",
    title: "The five numbers to track weekly",
    description:
      "A minimal measurement routine — sell-through, days to sell, realised margin, cash conversion and unlisted backlog — and what each one tells you to change.",
    minutes: 6,
    intro:
      "You do not need accounting software. You need five numbers, updated weekly, that between them tell you whether the business is working and which part to fix.",
    sections: [
      {
        h2: "The five",
        body: [
          "Each of these answers a different question, and each has a specific corrective action when it moves the wrong way. Tracking more than five is how measurement becomes a hobby that displaces the work.",
        ],
        list: [
          "Sell-through — items sold this week divided by items listed. Falling means your pricing or your sourcing has drifted.",
          "Median days to sell — the middle of your sold items, not the mean. The mean is distorted by one item that took nine months.",
          "Realised margin — actual profit on sold items after fees and shipping, not the margin you planned when you bought.",
          "Cash conversion — cash received this week against cash spent on stock. Persistently below one means you are funding growth, which is fine only if it is deliberate.",
          "Unlisted backlog — items bought but not yet listed. The clearest early warning that you are over-sourcing.",
        ],
      },
      {
        h2: "Medians, not averages",
        body: [
          "Resale data is skewed. One item that sold in four hours and one that sat for eleven months produce an average that describes neither, and averaging days-to-sell across a portfolio with a long tail will consistently flatter you.",
          "The median is the honest summary. Track it alongside the worst decile if you want a second number — that decile is where your dead stock lives, and its behaviour is a better predictor of trouble than anything the top half is doing.",
        ],
      },
      {
        h2: "Realised margin is the one that hurts",
        body: [
          "Planned margin is what you believed at the point of purchase. Realised margin is what actually landed after price cuts, absorbed shipping, and the items you eventually gave away. The gap between them is the most useful diagnostic you have, because it quantifies exactly how optimistic your buying is.",
          "If planned margin is 35% and realised is 19%, the fix is not to sell harder. It is to lower the maximum you are willing to pay, until the two numbers converge.",
        ],
        callout: {
          label: "Weekly, not monthly",
          text: "A monthly cadence lets a bad pattern run for four weeks before you see it. Fifteen minutes every Sunday catches a drift while it is still cheap to correct.",
        },
      },
    ],
    takeaways: [
      "Five metrics: sell-through, median days to sell, realised margin, cash conversion, unlisted backlog.",
      "Use medians — resale distributions have long tails that ruin averages.",
      "The gap between planned and realised margin measures how optimistic your buying is.",
      "Review weekly. Monthly is too slow to catch a drift cheaply.",
    ],
    faq: [
      {
        q: "What five numbers should I track weekly as a Vinted reseller?",
        a: "Sell-through, median days to sell, realised margin, cash conversion, and unlisted backlog. Each answers a different question and each has a specific corrective action when it moves the wrong way.",
      },
      {
        q: "Why use the median instead of the average for days to sell?",
        a: "Resale data is skewed. One four-hour sale and one eleven-month sit produce an average that describes neither. The median is the honest summary.",
      },
      {
        q: "Do I need a spreadsheet for this?",
        a: "A spreadsheet is plenty. Five columns and one row per week beats any tool you will not actually maintain. The failure mode is never insufficient sophistication — it is abandoning the routine after three weeks.",
      },
      {
        q: "What is a good median days-to-sell?",
        a: "It depends heavily on price tier, so a universal target would be misleading. What matters is the trend in your own number: rising median days-to-sell at a stable price point means your sourcing is drifting toward stock the market wants less.",
      },
    ],
  },
  {
    slug: "scaling-past-the-hobby",
    number: 15,
    part: "Running it as a business",
    updated: "2026-09-12",
    title: "Scaling past the hobby",
    seoTitle: "How to Scale Vinted Reselling Past 20 Listings — The Vinted Reselling Manual",
    description:
      "What breaks between 20 and 200 listings, why the constraint is throughput rather than capital, and the systems that have to exist before volume goes up.",
    minutes: 6,
    intro:
      "Twenty listings is a hobby that runs on memory. Two hundred is an operation that runs on systems. The transition breaks specific things in a predictable order, and knowing the order lets you fix them before they cost you.",
    sections: [
      {
        h2: "What breaks first",
        body: [
          "Memory goes first. At twenty items you know what everything cost and where it is. At eighty you do not, and without a record you cannot compute margin, cannot find an item a buyer just bought, and cannot tell which of your sourcing decisions were good.",
          "Physical retrieval breaks next. Finding one specific garment among two hundred takes real time unless there is a location system, and dispatch delays are among the fastest ways to damage a seller rating.",
          "Listing throughput breaks last and hardest. Sourcing scales easily — you can buy a hundred items in an afternoon. Listing them properly takes ten to fifteen minutes each, and that arithmetic is what actually caps the business.",
        ],
      },
      {
        h2: "The minimum systems",
        body: [
          "None of this needs software. It needs a record and a location scheme, applied consistently.",
        ],
        list: [
          "One row per item: what you paid, when, where from, condition grade, listed date, sold date, sold price.",
          "A physical location code on every item, written on the tag, matching the row.",
          "A photo routine done in batches — one session, fixed setup, twenty items at a time.",
          "A standing markdown schedule applied by listing age, not by mood.",
          "A weekly review of the five metrics from chapter 14.",
        ],
      },
      {
        h2: "Specialise before you scale",
        body: [
          "Volume without focus multiplies the number of things you have to be knowledgeable about. Two hundred listings across forty brands means you cannot know any of them well, and your pricing becomes guesswork at exactly the point where guesswork gets expensive.",
          "Narrowing to a handful of brands and categories you understand deeply makes sourcing faster, pricing more accurate and mistakes rarer. Nearly every reseller who scales successfully narrows first, and nearly every one who stalls tried to do it the other way around.",
          "As of 14 September 2026, across the brands we watch leave Vinted's shelf, a Fred Perry Shirt departed at an average of €14 (460 watched departures in seven days) and a Gucci Bag at €306 (83). Photographing and listing either one takes the same ten to fifteen minutes. When listing time is the constraint, twenty times the departure price is twenty times the return on that hour, which is why narrowing the range before raising volume is a throughput decision, not a taste one.",
        ],
        callout: {
          label: "The real ceiling",
          text: "Your business is capped by how many items you can list well per week, not by how much stock you can afford. Fix throughput before raising the sourcing budget.",
        },
      },
    ],
    takeaways: [
      "Memory fails first, retrieval second, listing throughput last and hardest.",
      "A row per item and a location code on every tag is the whole minimum system.",
      "Batch photography and apply markdowns by age, automatically.",
      "Narrow your brand range before increasing volume — depth is what makes pricing accurate.",
    ],
    faq: [
      {
        q: "What breaks first when you scale a Vinted closet?",
        a: "Memory first — at eighty items you no longer know what everything cost. Physical retrieval next. Listing throughput last and hardest: sourcing a hundred items in an afternoon is easy; listing them properly is not.",
      },
      {
        q: "When should I stop sourcing and just list?",
        a: "When the unlisted backlog exceeds roughly one week of your listing throughput. Beyond that, more stock is not an asset — it is capital doing nothing while you fall further behind.",
      },
      {
        q: "Why specialise before you scale?",
        a: "Volume without focus multiplies the brands you have to price well. Narrowing to a handful you understand makes sourcing faster, pricing more accurate and mistakes rarer.",
      },
      {
        q: "Is it better to sell many cheap items or few expensive ones?",
        a: "Expensive items are far less work per euro of profit, which matters enormously once throughput is your constraint. The trade-off is slower turns and more capital at risk per mistake, so most operations settle on a blend rather than one extreme.",
      },
    ],
  },
  {
    slug: "tax-and-the-rules",
    number: 16,
    part: "Running it as a business",
    updated: "2026-09-13",
    title: "Tax, platform reporting and knowing when it is a business",
    seoTitle: "Do You Pay Tax on Vinted Sales? DAC7 Basics — The Vinted Reselling Manual",
    description:
      "A plain-language overview of DAC7 platform reporting in the EU, the hobby-versus-business distinction, and what records to keep. Not tax advice.",
    minutes: 6,
    intro:
      "At some point selling your own old clothes becomes trading, and trading has obligations. This chapter describes the landscape in general terms so you know what to ask about. It is not tax or legal advice, and the details differ by country — take proper advice for your own situation.",
    sections: [
      {
        h2: "Platform reporting is already happening",
        body: [
          "Under the EU's DAC7 rules, online marketplaces are required to collect information about sellers and report it to tax authorities once a seller passes certain activity thresholds within a calendar year. The commonly cited triggers are a number of sales in the year or total proceeds above a set amount, and platforms typically ask for a tax identification number when a seller approaches them.",
          "The practical point is not the exact threshold — it varies and it changes — but the direction of travel. Assume that anything you sell at volume is visible, and plan on that basis rather than on the assumption that small-scale selling is invisible.",
        ],
        callout: {
          label: "Not advice",
          text: "Thresholds, rates and registration rules differ by country and change over time. Treat this chapter as a list of questions to ask an accountant, not as answers.",
        },
      },
      {
        h2: "Selling your own things versus trading",
        body: [
          "Most tax systems distinguish between disposing of your own possessions and buying goods with the intention of selling them at a profit. The first is generally not trading. The second generally is, from the first item, regardless of scale or how casual it feels.",
          "The signals that matter are intent and pattern: buying specifically to resell, repeated transactions, sourcing systematically, and organising the activity in a business-like way. If you are reading a manual about maximising resale margin, you are almost certainly on the trading side of that line, and the right move is to find out what that means where you live before it becomes a backdated problem.",
        ],
      },
      {
        h2: "Keep records from day one",
        body: [
          "Whatever your eventual status, the records are the same and they are the same ones the business needs anyway: purchase date, purchase price, proof of purchase where you have it, sale date, sale price, platform fees and shipping costs. One row per item.",
          "Reconstructing a year of purchases from memory and bank statements is miserable and inaccurate, and it usually costs you money — because undocumented costs are costs you cannot deduct. Starting the record on day one costs a few seconds per item; starting it in month fourteen costs a weekend and is still wrong.",
        ],
      },
    ],
    takeaways: [
      "EU platforms report seller activity above certain thresholds under DAC7. Assume visibility.",
      "Buying with intent to resell is generally trading from the first item, regardless of scale.",
      "Keep one row per item with purchase and sale detail, fees and shipping, from day one.",
      "Rules differ by country and change — get advice specific to where you live.",
    ],
    faq: [
      {
        q: "What is DAC7?",
        a: "EU rules that require online marketplaces to collect seller information and report it to tax authorities once a seller passes activity thresholds in a calendar year. The practical point is the direction of travel: assume volume selling is visible.",
      },
      {
        q: "Do I have to declare Vinted income?",
        a: "That depends on your country, your total income and whether the activity counts as trading rather than selling personal possessions. Because it varies so much, the only responsible answer is to ask a qualified accountant in your jurisdiction — and to have kept the records that let you answer their questions.",
      },
      {
        q: "Is selling my own clothes the same as trading?",
        a: "Most tax systems distinguish disposing of your own possessions from buying with intent to resell. The second is generally trading from the first item. This chapter is not tax advice — ask an accountant where you live.",
      },
      {
        q: "What records will I be asked for?",
        a: "Typically what you paid, what you sold it for, when each happened, and the costs in between. That is the same data the five metrics in chapter 14 need, which is a good reason to keep one record that serves both purposes.",
      },
    ],
  },
]
