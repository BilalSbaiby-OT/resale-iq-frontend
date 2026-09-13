/**
 * WebMCP money tools (Chrome Declarative API).
 *
 * One shared checker tool: /tools and /tools/vinted-price-checker both
 * mount FreeChecker. Field name is `query` (the live input had no name=
 * before this pass). No toolautosubmit — human-in-loop. Never annotate
 * Stripe / checkout / payment forms.
 */

export const CHECK_VINTED_ITEM_NAME = "check_vinted_item"

export const CHECK_VINTED_ITEM_DESCRIPTION =
  "Returns BUY, WATCH or SKIP and a buy-below price for a Vinted item query from watched-departure data across ES, FR, DE, IT and PT. Does not process payments."

export const CHECK_VINTED_ITEM_QUERY_DESCRIPTION =
  "Vinted item URL, title, or search query to check."

export const CALCULATE_VINTED_PROFIT_NAME = "calculate_vinted_profit"

export const CALCULATE_VINTED_PROFIT_DESCRIPTION =
  "Estimates net Vinted profit after the published ~5% seller-side fee from a buy price and an expected sale price. Does not look up live market prices and does not process payments."

export const CALCULATE_VINTED_PROFIT_BUY_DESCRIPTION =
  "Purchase price in euros you would pay for the item."

export const CALCULATE_VINTED_PROFIT_SELL_DESCRIPTION =
  "Expected Vinted sale price in euros, before the ~5% seller fee."
