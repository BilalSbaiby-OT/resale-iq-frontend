/**
 * Defaults for the /pricing payback calculator (components/landing/payback-calculator.tsx)
 * and the numbers the pricing FAQ "Is it worth €19 a month?" quotes about them.
 * ONE place, so the sliders and the FAQ (visible HTML AND FAQPage JSON-LD) cannot
 * drift apart: src/lib/payback-defaults.test.ts fails if copy[locale].pricingSection.faq
 * stops matching these.
 *
 * Founder decision 2026-10-02: the default is a VOLUME buyer, 60 items a month at
 * EUR 20 each = EUR 1,200 of stock a month (it was 20 x EUR 15 = EUR 300). Both
 * values sit on the existing slider steps (items 5-200 step 5, price 5-120 step 1),
 * so no slider bound changed. The EUR 20 is a plausibility pick against the live
 * public buy-list (unlocked rows buy below EUR 8-35), not a measured average:
 * the calculator's own disclaimer says it is arithmetic on the reader's figures
 * and claims no hit rate. Plain .ts with no imports so node:test can load it.
 */
export const PAYBACK_DEFAULT_ITEMS_PER_MONTH = 60
export const PAYBACK_DEFAULT_AVG_BUY_EUR = 20

/**
 * Break-even in ITEMS: how many avoided buys at the average price cover one month
 * of the plan. Rounded UP on purpose so the claim is never flattering: at EUR 15 an
 * item, 19/15 = 1.27 becomes "2 items", not "1"; at EUR 20, 19/20 = 0.95 becomes "1".
 * Do not relax the rounding to make a small number look smaller.
 */
export function breakEvenItems(planPrice: number, avgBuyPrice: number): number {
  return Math.max(1, Math.ceil(planPrice / Math.max(avgBuyPrice, 1)))
}

/** Monthly stock spend implied by a pair of slider values. */
export function monthlySpend(itemsPerMonth: number, avgBuyPrice: number): number {
  return itemsPerMonth * avgBuyPrice
}
