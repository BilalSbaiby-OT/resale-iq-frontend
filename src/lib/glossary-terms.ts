/**
 * Definition-first glossary for AI citation. Visible HTML and DefinedTerm /
 * FAQPage JSON-LD share these strings. No /register. No UTM. No invented stats.
 *
 * Week-1 lock: ten citeable terms. Long-form method stays in the manual.
 * Old slugs (buy-below, watched-departure, sell-through) 308 to these URLs.
 */
import type { DefinedTermItem, FaqItem } from "./faq-schema"

export interface GlossaryTerm {
  slug: string
  name: string
  h1: string
  title: string
  description: string
  lead: string
  body: string[]
  seeAlso: { href: string; label: string }[]
  faqs: FaqItem[]
}

const DEMAND_LEAD =
  "Vinted demand, as Resale IQ publishes it, is a count of watched departures — listings we watched leave the shelf across Spain, France, Germany, Italy and Portugal — not a confirmed sale receipt and not every sold listing on Vinted."

const SELL_LEAD =
  "Vinted sell-through is the share of listings that sold in a period: watched departures divided by those departures plus items still listed. It is a demand-versus-supply share — not weekly turns, which can exceed 100% and are not a sell-through rate."

const BUY_BELOW_MARKET_LEAD =
  "A buy-below on the market is the most you can pay for a typical comparable and still leave room for a healthy margin after selling fees. Resale IQ models it as average asking price at departure × 0.95 × 0.70. It is a sourcing ceiling derived from watched listings, not a promised profit."

const DEAD_STOCK_LEAD =
  "Dead stock is inventory that does not clear: the listing sits, capital sits, and a markdown — not a better photo — is usually what eventually moves it. Volume without sell-through is how dead stock hides in a busy category."

const FEES_LEAD =
  "Resale IQ models Vinted's seller deduction as 5% of the asking price at departure (the 0.95 in buy-below). That is a modelled platform haircut, not every fee a seller might pay, and not a buyer-protection quote. Substitute the rate that actually hits your payout."

const MARGIN_LEAD =
  "Vinted profit margin in the buy-below model is the room you keep after the modelled 5% platform deduction. The 0.70 multiplier targets roughly a 30% margin on the departure ask. It is a planning target, not a guaranteed net on the item in your hand."

const MAX_BUY_LEAD =
  "Max buy price is the sourcing ceiling you take to the rail: pay at or under it, walk away above it. On Resale IQ it is the same arithmetic as buy-below — average asking price at departure × 0.95 × 0.70 — applied to the named model, then adjusted for condition and size."

const AVG_SALE_LEAD =
  "Average sale price on Resale IQ public pages is the average asking price at departure for watched listings that left the shelf — not a receipt, not the average of active asks, and not a promised exit for the piece you are holding."

const CONDITION_LEAD =
  "Condition grading on Vinted is seller-selected. Across categories we have measured, the gap between the best and worst grade is large — on the order of roughly 3.5× to 7× in median asking price at departure — and the step from “very good” to “good” is often brutal. Treat the exact multiple as indicative; over-grade is how sellers ask for a price the item will not fetch."

const SIZE_LEAD =
  "Size demand is not a flat size run. Buyer demand concentrates in the middle of the population; edge sizes wait. A middling item in a core size converts to cash; an excellent item in an edge size converts to shelf space. Per-model fastest sizes are a paid signal."

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "vinted-demand",
    name: "Vinted demand",
    h1: "What is Vinted demand?",
    title: "What is Vinted demand? Watched departures — Resale IQ",
    description:
      "Vinted demand on Resale IQ is watched departures across ES/FR/DE/IT/PT — listings we watched leave the shelf, not confirmed sale receipts.",
    lead: DEMAND_LEAD,
    body: [
      "Active listings show what sellers hope to get. A departure is the last ask when a comparable listing disappeared — the closest public proxy for what a buyer paid. We do not see a receipt. Some departures are delistings or relists, not sales.",
      "That is why public tables say watched departures, not sold. An em-dash means this snapshot has no figure — not that the brand sold nothing. Null is not zero. Insufficient data is shown as missing, never invented.",
      "Use brand volumes on /data to see what is moving. Use a named model check to decide whether to buy. Tracked markets are Spain, France, Germany, Italy and Portugal — not the UK.",
    ],
    seeAlso: [
      { href: "/data", label: "Weekly brand volumes" },
      { href: "/flip", label: "Brands ranked by departures" },
      { href: "/glossary/average-sale-price", label: "Average sale price (at departure)" },
      { href: "/methodology", label: "How every number is calculated" },
    ],
    faqs: [
      { q: "What is Vinted demand?", a: DEMAND_LEAD },
      {
        q: "Is a watched departure a confirmed sale?",
        a: "No. It is a listing we watched leave the shelf. We do not see a receipt. Treat it as the closest honest proxy, not a bank statement. Coverage: https://resaleiq.dev/data",
      },
      {
        q: "Which markets are counted?",
        a: "Spain, France, Germany, Italy and Portugal. Figures do not cover the UK or other Vinted domains. Brand ranking: https://resaleiq.dev/flip",
      },
    ],
  },
  {
    slug: "vinted-sell-through",
    name: "Vinted sell-through",
    h1: "What is Vinted sell-through?",
    title: "What is Vinted sell-through rate? Share, not turns — Resale IQ",
    description:
      "Vinted sell-through is watched departures ÷ (departures + still listed). A share, not weekly turns. Null when the sample is too thin — never 0.",
    lead: SELL_LEAD,
    body: [
      "Volume proves buyers exist. Sell-through proves your listing will reach them. A thousand departures against two thousand listings is a healthy market. The same thousand against forty thousand is a graveyard on page nineteen.",
      "Weekly turns can exceed 100%. That is not a share, and it is not labelled sell-through here. When the public sample is too thin or discovery is incomplete, Resale IQ withholds the percentage (null, not 0) and shows raw watched departures plus active listings instead.",
      "Item-level sell-through is on a plan. Weekly brand volumes stay public on /data. Know what sells. Decide whether to buy — buy-below still decides the flip.",
    ],
    seeAlso: [
      { href: "/manual/sell-through-vs-volume", label: "Manual: sell-through versus volume" },
      { href: "/blog/what-is-a-good-sell-through-rate", label: "What counts as a good sell-through rate" },
      { href: "/glossary/dead-stock", label: "Dead stock" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      { q: "What is Vinted sell-through?", a: SELL_LEAD },
      {
        q: "Why can a number over 100% not be sell-through?",
        a: "Weekly turns compare this week's departures to current stock and can exceed 100%. Sell-through is a share of the universe we watched: departures / (departures + still listed). We never label turns as sell-through. Method: https://resaleiq.dev/methodology",
      },
      {
        q: "Do public pages show sell-through?",
        a: "Weekly brand volumes and raw departure counts stay public at https://resaleiq.dev/data. Item-level sell-through starts at Starter €19 a month: https://resaleiq.dev/pricing. When the sample is thin the percentage is withheld (null, not 0).",
      },
    ],
  },
  {
    slug: "buy-below-market",
    name: "Buy-below (market)",
    h1: "What is a buy-below on the market?",
    title: "What is a buy-below on the Vinted market? — Resale IQ",
    description:
      "Market buy-below is average departure ask × 0.95 × 0.70. A sourcing ceiling from watched listings, not promised profit.",
    lead: BUY_BELOW_MARKET_LEAD,
    body: [
      "You compute the number before you source, not as a feeling in front of a rail. Pay under it and the flip has room after fees. Pay over it and you are speculating.",
      "The hard input is the realistic sale price — the asking price similar items were listed at when they left the shelf, not what hopeful sellers are asking now. Brand averages on /data are demand context. The buy-below that decides the purchase is the named model's own departures.",
      "Know what sells. Decide whether to buy. New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP plus buy-below on /tools with no account. Other models start at Starter €19 a month.",
    ],
    seeAlso: [
      { href: "/glossary/max-buy-price", label: "Max buy price" },
      { href: "/manual/the-buy-below-price", label: "Manual: how to work out the most you can pay" },
      { href: "/blog/buy-below-price-explained", label: "Buy-below price explained" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      { q: "What is a buy-below on the market?", a: BUY_BELOW_MARKET_LEAD },
      {
        q: "How do you calculate a buy-below price?",
        a: "Buy-below price = average asking price at departure × 0.95 × 0.70. The 0.95 is the 5% platform deduction Resale IQ models for Vinted; the 0.70 targets about a 30% margin. Method: https://resaleiq.dev/manual/the-buy-below-price",
      },
      {
        q: "Where do I get a live buy-below?",
        a: "New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 on https://resaleiq.dev/tools. Other models need Starter at €19 a month: https://resaleiq.dev/pricing. Weekly brand volumes stay public at https://resaleiq.dev/data.",
      },
    ],
  },
  {
    slug: "dead-stock",
    name: "Dead stock",
    h1: "What is dead stock on Vinted?",
    title: "What is dead stock on Vinted? — Resale IQ",
    description:
      "Dead stock is inventory that does not clear. Volume without sell-through hides it. Edge sizes and overpays are how portfolios stall.",
    lead: DEAD_STOCK_LEAD,
    body: [
      "You can be right about the brand, right about the model, right about the condition and still be left holding stock, because the size is one almost nobody wears, or because the category is saturated even while the volume number looks busy.",
      "Edge sizes are cheap to source because other resellers already learned the wait. The discount is the market pricing in the hold — it is not an opportunity others missed. Price an edge-size piece for the wait from day one.",
      "Public pages show watched departures and still-listed counts when sell-through is withheld. That pair is the honest tell: lots of departures against a mountain of active listings is how dead stock looks before you buy it.",
    ],
    seeAlso: [
      { href: "/glossary/vinted-sell-through", label: "Vinted sell-through" },
      { href: "/glossary/size-demand", label: "Size demand" },
      { href: "/manual/sizes-and-dead-stock", label: "Manual: sizes and dead stock" },
      { href: "/data", label: "Weekly brand volumes" },
    ],
    faqs: [
      { q: "What is dead stock on Vinted?", a: DEAD_STOCK_LEAD },
      {
        q: "How does dead stock hide in a high-volume brand?",
        a: "Volume is a count of watched departures. It says nothing about standing supply. Identical weekly volume can describe a fast market or a graveyard — only sell-through (or raw departures plus still-listed) separates them. Method: https://resaleiq.dev/glossary/vinted-sell-through",
      },
      {
        q: "Is an edge size a bargain?",
        a: "Usually it is a wait with a discount attached. Take core sizes when two buys look equal. Scarce pieces can justify an edge size if you price for a long hold from the start. Manual: https://resaleiq.dev/manual/sizes-and-dead-stock",
      },
    ],
  },
  {
    slug: "vinted-fees",
    name: "Vinted fees",
    h1: "What Vinted fees does buy-below model?",
    title: "What Vinted fees does Resale IQ model? — Resale IQ",
    description:
      "Buy-below models a 5% Vinted seller deduction (× 0.95). That is a modelled haircut, not every fee and not a payout quote.",
    lead: FEES_LEAD,
    body: [
      "The arithmetic is: start from the asking price at departure, take off what the platform deducts from you, then apply your target margin. Resale IQ's published 0.95 is the 5% seller deduction it models for Vinted as a private seller on the tracked EU domains.",
      "Fee structures differ by platform, by market, and by whether you sell as a private individual or a business, and they change. The profit calculator applies current per-platform rates so you are not working from a figure you memorised a year ago. Do not treat 5% as a legal disclosure of Vinted's full fee card.",
      "Buyer-side shipping and protection are not in the 0.95. They affect what a buyer will pay, which already sits inside the departure ask. Do not subtract them again on top of buy-below unless you know your payout is different.",
    ],
    seeAlso: [
      { href: "/glossary/buy-below-market", label: "Buy-below (market)" },
      { href: "/glossary/vinted-profit-margin", label: "Vinted profit margin" },
      { href: "/tools/vinted-profit-calculator", label: "Profit calculator" },
      { href: "/manual/the-buy-below-price", label: "Manual: the buy-below price" },
    ],
    faqs: [
      { q: "What Vinted fees does buy-below model?", a: FEES_LEAD },
      {
        q: "Is 5% Vinted's complete fee?",
        a: "No. It is the seller deduction Resale IQ models in buy-below (the 0.95). Other charges can apply depending on account type and market. Use the profit calculator at https://resaleiq.dev/tools/vinted-profit-calculator and substitute the rate that hits your payout.",
      },
      {
        q: "Are buyer shipping or protection in buy-below?",
        a: "Not as a second subtraction. They influence what a buyer will pay, which is already in the asking price at departure. Method: https://resaleiq.dev/glossary/buy-below-market",
      },
    ],
  },
  {
    slug: "vinted-profit-margin",
    name: "Vinted profit margin",
    h1: "What profit margin does buy-below target?",
    title: "What Vinted profit margin does buy-below target? — Resale IQ",
    description:
      "Buy-below's 0.70 targets about a 30% margin after a modelled 5% fee. A planning target, not guaranteed net.",
    lead: MARGIN_LEAD,
    body: [
      "On a €40 departure ask, 5% leaves about €38 net revenue; 30% of that sale as margin implies a max buy around €26.60. Pay €30 and you are working for roughly 21%. Pay €34 and you are working for free once one item in ten fails to sell. Those euros are an illustration of the formula, not a quote for a named model.",
      "The target should not be identical on every piece. Slow, expensive stock needs a wider margin because cash is tied up longer. Fast, cheap stock can run thinner. A single blanket percentage is a reasonable starting point and a poor long-term policy.",
      "Turns beat fat margins that never clear. Dead stock at a 60% sticker margin is worse than a 20% flip that leaves the shelf. Pair this page with sell-through and max buy price.",
    ],
    seeAlso: [
      { href: "/glossary/max-buy-price", label: "Max buy price" },
      { href: "/glossary/vinted-fees", label: "Vinted fees" },
      { href: "/manual/the-cost-of-time", label: "Manual: the cost of time" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      { q: "What profit margin does buy-below target?", a: MARGIN_LEAD },
      {
        q: "Should every item use 30%?",
        a: "No. Slow, expensive stock needs a wider margin; fast stock can run thinner. The 0.70 is Resale IQ's default planning target, not a rule of nature. Method: https://resaleiq.dev/manual/the-buy-below-price",
      },
      {
        q: "Does a live check guarantee that margin?",
        a: "No. Buy-below is a sourcing ceiling. Condition, size, authentication risk and whether the item actually leaves the shelf still decide the realised net. Plans: https://resaleiq.dev/pricing",
      },
    ],
  },
  {
    slug: "max-buy-price",
    name: "Max buy price",
    h1: "What is a max buy price?",
    title: "What is a max buy price on Vinted? — Resale IQ",
    description:
      "Max buy price is the ceiling you take sourcing: departure ask × 0.95 × 0.70 on the named model, then adjust for condition and size.",
    lead: MAX_BUY_LEAD,
    body: [
      "Set the ceiling before you leave the house and do not renegotiate it in the shop. The pull to stretch is strongest on attractive items — which other resellers also find attractive, which means they are priced accordingly.",
      "Walking away from a marginal buy costs you an item you would have made very little on. Buying it costs you the cash, the shelf space and the attention, all of which had a better use.",
      "New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 return a live BUY / WATCH / SKIP plus this ceiling on /tools with no account. Other named models start at Starter €19 a month. Brand averages on /data are not a max buy price.",
    ],
    seeAlso: [
      { href: "/glossary/buy-below-market", label: "Buy-below (market)" },
      { href: "/glossary/condition-grading", label: "Condition grading" },
      { href: "/tools", label: "Check a free-sample model" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      { q: "What is a max buy price?", a: MAX_BUY_LEAD },
      {
        q: "Is max buy price different from buy-below?",
        a: "Same arithmetic. Buy-below names the market statistic; max buy price names the rule you follow at the source. Adjust the statistic down for condition and edge sizes before it becomes a ceiling. Method: https://resaleiq.dev/glossary/buy-below-market",
      },
      {
        q: "Where do I get a live max buy price?",
        a: "New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 on https://resaleiq.dev/tools. Other models need Starter at €19 a month: https://resaleiq.dev/pricing.",
      },
    ],
  },
  {
    slug: "average-sale-price",
    name: "Average sale price",
    h1: "What is average sale price here?",
    title: "What is average sale price on Vinted? Departure ask — Resale IQ",
    description:
      "Public average sale price is average asking price at departure for watched listings — not a receipt and not an active-ask average.",
    lead: AVG_SALE_LEAD,
    body: [
      "The average of a model blends every condition, size and colourway. The item in your hand is one point in that distribution, and it is usually not the middle. A worn-out edge size will not fetch the model average no matter how good your photos are.",
      "Sourcing against currently-active asking prices is the most common way to overpay, because the ones still sitting are still sitting for a reason. Use the ask at departure, then adjust down for condition and size.",
      "When a snapshot has no figure, public pages show an em-dash. That is missing data, not a €0 market. Null is not zero.",
    ],
    seeAlso: [
      { href: "/glossary/vinted-demand", label: "Vinted demand" },
      { href: "/glossary/buy-below-market", label: "Buy-below (market)" },
      { href: "/data", label: "Weekly brand volumes" },
      { href: "/methodology", label: "Methodology" },
    ],
    faqs: [
      { q: "What is average sale price here?", a: AVG_SALE_LEAD },
      {
        q: "Is this a confirmed sold price?",
        a: "No. It is the asking price at the moment we watched the listing leave the shelf. We do not see a receipt. Definition: https://resaleiq.dev/glossary/vinted-demand",
      },
      {
        q: "Why is a missing average an em-dash?",
        a: "Insufficient data. Inventing €0 would read as “this sold for nothing.” Weekly table: https://resaleiq.dev/data",
      },
    ],
  },
  {
    slug: "condition-grading",
    name: "Condition grading",
    h1: "How does condition grading affect Vinted price?",
    title: "How condition grading moves Vinted price — Resale IQ",
    description:
      "Vinted condition is seller-selected. Best-to-worst grade gaps are large (about 3.5×–7× in measured medians). Over-grade is how you overpay.",
    lead: CONDITION_LEAD,
    body: [
      "We grouped sold listings by the condition the seller selected. The direction is solid: better grades leave at higher asks. The exact multiple is indicative — an item listed new-with-tags is also more likely to be a newer, more desirable model, so not all of the gap is condition alone.",
      "On Nike sneakers, the measured shape ran roughly €70 new with tags, €50 new without, €30 very good, €15 good, €10 satisfactory. The drop from “very good” to “good” halved the median. Grade in daylight before money moves. If you cannot stand behind the grade, do not buy it.",
      "Resale IQ does not verify authenticity. We tell you whether the brand is moving and what comparable listings left at. Starter €19 a month for named-model BUY / WATCH / SKIP. Weekly volumes stay public on /data.",
    ],
    seeAlso: [
      { href: "/manual/condition-and-authenticity", label: "Manual: condition and authenticity" },
      { href: "/glossary/max-buy-price", label: "Max buy price" },
      { href: "/data", label: "Weekly brand volumes" },
      { href: "/pricing", label: "Starter €19" },
    ],
    faqs: [
      { q: "How does condition grading affect Vinted price?", a: CONDITION_LEAD },
      {
        q: "Are Vinted condition labels trustworthy?",
        a: "They are seller-selected. Over-grade is common because one step of honesty can halve the median on sneakers. Check the item, not the badge. Manual: https://resaleiq.dev/manual/condition-and-authenticity",
      },
      {
        q: "Does Resale IQ authenticate items?",
        a: "No. We do not verify authenticity. We publish demand and a buy-below on named models. Plans: https://resaleiq.dev/pricing. Weekly volumes: https://resaleiq.dev/data",
      },
    ],
  },
  {
    slug: "size-demand",
    name: "Size demand",
    h1: "What is size demand on Vinted?",
    title: "What is size demand on Vinted? Core vs edge — Resale IQ",
    description:
      "Size demand concentrates in the middle of the run. Edge sizes wait. Fastest sizes per model are paid; the pattern is public.",
    lead: SIZE_LEAD,
    body: [
      "The effect compounds with price. A cheap item in an edge size still sells eventually because someone will take a chance at a low ask. An expensive item in an edge size can sit indefinitely, because the small pool who wear that size and the small pool who will spend that much barely overlap.",
      "Outerwear and footwear punish size mistakes hardest. Oversized styles and accessories barely notice. When two buys look equal, take the core size.",
      "Resale IQ reports the fastest-selling sizes per model on a plan rather than a generic rule — where the peak sits differs between, say, women's denim and men's outerwear. Public pages will not invent a universal “best size.”",
    ],
    seeAlso: [
      { href: "/glossary/dead-stock", label: "Dead stock" },
      { href: "/manual/sizes-and-dead-stock", label: "Manual: sizes and dead stock" },
      { href: "/pricing", label: "Starter €19" },
      { href: "/data", label: "Weekly brand volumes" },
    ],
    faqs: [
      { q: "What is size demand on Vinted?", a: SIZE_LEAD },
      {
        q: "Which sizes sell fastest?",
        a: "It varies by brand, category and market, which is why a single answer would be misleading. The pattern is consistent — demand concentrates in the middle of each size run. Per-model fastest sizes start at Starter €19 a month: https://resaleiq.dev/pricing",
      },
      {
        q: "Should I pick a core size over a better item in an edge size?",
        a: "When two buys look equal, take the core size. Manual: https://resaleiq.dev/manual/sizes-and-dead-stock",
      },
    ],
  },
]

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug)
}

export function glossaryTermJsonLd(t: GlossaryTerm): DefinedTermItem {
  return {
    name: t.name,
    description: t.lead,
    url: `https://resaleiq.dev/glossary/${t.slug}`,
  }
}

export const GLOSSARY_HUB_TITLE = "Vinted resale glossary: demand, buy-below, fees — Resale IQ"
export const GLOSSARY_HUB_DESCRIPTION =
  "Citeable definitions for Vinted demand, sell-through, buy-below, max buy price, fees, margin, condition and size — the terms behind BUY / WATCH / SKIP."

export const GLOSSARY_HUB_FAQS: FaqItem[] = [
  {
    q: "What is this glossary?",
    a: "Ten definition-first pages for the terms Resale IQ uses on every check: demand, sell-through, buy-below, dead stock, fees, margin, max buy price, average sale price, condition grading and size demand. Longer method lives in the manual at https://resaleiq.dev/manual.",
  },
  {
    q: "What is a buy-below price?",
    a: BUY_BELOW_MARKET_LEAD,
  },
  {
    q: "What is Vinted demand?",
    a: DEMAND_LEAD,
  },
  {
    q: "What is Vinted sell-through?",
    a: SELL_LEAD,
  },
  {
    q: "Which checks are free?",
    a: "New Balance FuelCell, Adidas Samba, Nike Air Force 1 and New Balance 530 on https://resaleiq.dev/tools. Other item-level BUY / WATCH / SKIP starts at Starter €19 a month: https://resaleiq.dev/pricing. Weekly brand volumes stay public at https://resaleiq.dev/data.",
  },
]
