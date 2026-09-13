/** Paid-door hrefs for the google_search_test campaign + tools FAQ CTA. */

export const GOOGLE_SEARCH_TEST_CAMPAIGN = "google_search_test_20260913"

export const MONEY_CTA_LABEL = "Get the numbers"
export const MONEY_CTA_SUBLINE = "Buy-below + demand before cash sticks."

export function googleSearchTestPricingHref(content: string): string {
  return `/pricing?utm_source=google&utm_medium=cpc&utm_campaign=${GOOGLE_SEARCH_TEST_CAMPAIGN}&utm_content=${content}`
}

export const TOOLS_MONEY_HREF = googleSearchTestPricingHref("tools")
export const CATEGORY_MONEY_HREF = googleSearchTestPricingHref("category")
export const PROFIT_CALC_MONEY_HREF = googleSearchTestPricingHref("profit_calc")
export const PRICE_CHECKER_MONEY_HREF = googleSearchTestPricingHref("price_checker")

export const TOOLS_FAQ_CTA_HREF =
  "/pricing?utm_source=tools&utm_medium=organic&utm_campaign=aeo_tools_faq_001"

export const TOOLS_INDEX_SECONDARY_HREF = "/pricing?src=tools_index"
export const CATEGORY_INDEX_SECONDARY_HREF = "/pricing?src=category_index"
