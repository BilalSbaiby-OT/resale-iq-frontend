import type { DefinedTermItem, FaqItem } from "./faq-schema"

/**
 * EX-TOOLS-AEO + EX-ACTIVATION-FIX. Visible HTML and FAQPage JSON-LD share
 * these strings. Schema answers stay clean: no signup wall, no campaign tags.
 *
 * Product boundary (do not invert):
 * - Anon /api/verdict is mostly 402. Do not advertise a free BUY/WATCH/SKIP check.
 * - Try the checker; most items unlock with Starter €19.
 * - Weekly brand volumes stay public on /data
 */

export const BUY_BELOW_TERM_NAME = "Buy-below price"

export const BUY_BELOW_TERM =
  "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. " +
  "Resale IQ models it as average asking price at departure × 0.95 × 0.70. " +
  "Item-level BUY, WATCH or SKIP plus that number start at Starter €19 a month."

export const TOOLS_HUB_BODY =
  "Resale IQ is demand intelligence for people who resell second-hand clothes. You already have suppliers. The job here is which clothing items and models to buy at this price to resell on the platforms we cover. Type a brand and model below. We watch listings leave the shelf on Vinted in Spain, France, Germany, Italy and Portugal — not the UK. A check returns BUY, WATCH or SKIP and the most you should pay after fees, counted from watched departures, not receipts we did not see. Weekly brand volumes stay public on /data with no account. Most item checks unlock with Starter at €19 a month: BUY, WATCH or SKIP, the buy-below price, and how many watched departures sit behind it. Some well-known models show a teaser; the next model usually needs Starter. We do not tell you where to source. We do not write how to list in France. Demand is treated as the same trend unless the numbers split. Cancel anytime after you pay."

export const TOOLS_HUB_DEFINED_TERM: DefinedTermItem = {
  name: BUY_BELOW_TERM_NAME,
  description: BUY_BELOW_TERM,
  url: "https://resaleiq.dev/tools",
}

export const TOOLS_HUB_FAQS: FaqItem[] = [
  {
    q: "What is a buy-below price?",
    a:
      "Buy-below price is the most you can pay for an item and still keep a healthy margin after selling fees. " +
      "Resale IQ models it as average asking price at departure × 0.95 × 0.70 and returns BUY, WATCH or SKIP with that number on a Starter check.",
  },
  {
    q: "How does ResaleIQ show demand?",
    a:
      "Demand is shown as watched departures: listings we watched leave the shelf, not confirmed sale receipts. " +
      "A Starter item check shows how many watched departures sit behind the buy-below number. " +
      "Weekly brand volumes stay public at https://resaleiq.dev/data.",
  },
  {
    q: "Who is ResaleIQ for?",
    a:
      "Resale IQ is for people who resell second-hand clothes and already have suppliers. Check which items and models to buy to resell. " +
      "Tracked listings cover Spain, France, Germany, Italy and Portugal. Figures do not cover the UK or other Vinted domains.",
  },
  {
    q: "Is the Vinted price checker free?",
    a:
      "Weekly brand volumes and average departure prices stay public at https://resaleiq.dev/data with no account. " +
      "Item-level BUY, WATCH or SKIP and buy-below start at Starter €19 a month. You can try the checker; most items unlock with Starter.",
  },
  {
    q: "What does the Starter plan unlock?",
    a:
      "Starter is €19 a month: unlimited item checks, every product signal unblurred, Deal Scanner, market trends and brand rankings, watchlist and portfolio P&L, and the fee calculator. " +
      "Live Deal Finder, Order Planner, Price Compare and the API are Pro at €49. Weekly volumes stay public. See https://resaleiq.dev/pricing.",
  },
]
