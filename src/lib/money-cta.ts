/** Paid-door hrefs for the money CTAs. */

/**
 * ATTRIBUTION HONESTY. These hrefs are INTERNAL links — a visitor already on
 * resaleiq.dev clicking through to /pricing. They used to carry
 * `utm_source=google&utm_medium=cpc&utm_campaign=google_search_test_20260913`,
 * which stamped every organic, direct and LLM-referred visitor as paid Google
 * CPC traffic the moment they clicked a CTA.
 *
 * That is not a cosmetic leak. The single question the company cannot answer
 * is "which acquisition source produces a payer", and ChatGPT/Perplexity
 * citation is the only channel that has ever produced a signup. Overwriting
 * that source with a fake `cpc` campaign on the click that matters most
 * destroys exactly the evidence needed to decide where to spend.
 *
 * Internal clicks now use `utm_medium=internal` with the placement in
 * `utm_content`, so the real first-touch source survives in analytics and the
 * placement is still measurable.
 */
export const INTERNAL_CTA_CAMPAIGN = "internal_money_cta"

export const MONEY_CTA_LABEL = "Get the numbers"
export const MONEY_CTA_SUBLINE = "Buy-below + demand before cash sticks."

export function moneyCtaPricingHref(content: string): string {
  return `/pricing?utm_source=site&utm_medium=internal&utm_campaign=${INTERNAL_CTA_CAMPAIGN}&utm_content=${content}`
}

export const TOOLS_MONEY_HREF = moneyCtaPricingHref("tools")
export const CATEGORY_MONEY_HREF = moneyCtaPricingHref("category")
export const PROFIT_CALC_MONEY_HREF = moneyCtaPricingHref("profit_calc")
export const PRICE_CHECKER_MONEY_HREF = moneyCtaPricingHref("price_checker")

export const TOOLS_FAQ_CTA_HREF =
  "/pricing?utm_source=tools&utm_medium=organic&utm_campaign=aeo_tools_faq_001"

export const TOOLS_INDEX_SECONDARY_HREF = "/pricing?src=tools_index"
export const CATEGORY_INDEX_SECONDARY_HREF = "/pricing?src=category_index"
