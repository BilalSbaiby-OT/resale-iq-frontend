/**
 * WebMCP money tools (Chrome Declarative API).
 *
 * /tools uses check_vinted_item. /tools/vinted-price-checker uses
 * check_vinted_price (same FreeChecker, different tool name). Profit
 * calculator is calculate_vinted_profit. Field name on the checker is
 * `query`. No toolautosubmit. Never annotate Stripe / checkout forms.
 */

export const CHECK_VINTED_ITEM_NAME = "check_vinted_item"

export const CHECK_VINTED_ITEM_DESCRIPTION =
  "Return BUY, WATCH or SKIP and a buy-below price for a Vinted item from watched-departure data across Spain, France, Germany, Italy and Portugal. Does not process payments."

export const CHECK_VINTED_PRICE_NAME = "check_vinted_price"

export const CHECK_VINTED_PRICE_DESCRIPTION =
  "Return BUY, WATCH or SKIP and a buy-below price for a Vinted item from watched-departure data across Spain, France, Germany, Italy and Portugal. Does not process payments."

export const CHECK_VINTED_ITEM_QUERY_DESCRIPTION =
  "Vinted item URL, title, or search query to check"

export const CALCULATE_VINTED_PROFIT_NAME = "calculate_vinted_profit"

export const CALCULATE_VINTED_PROFIT_DESCRIPTION =
  "Estimates net Vinted profit after the published ~5% seller-side fee from a buy price and an expected sale price. Does not look up live market prices and does not process payments."

export const CALCULATE_VINTED_PROFIT_BUY_DESCRIPTION =
  "Purchase price in euros you would pay for the item."

export const CALCULATE_VINTED_PROFIT_SELL_DESCRIPTION =
  "Expected Vinted sale price in euros, before the ~5% seller fee."

function escAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

/** Raw HTML a Server Component can inject so curl/view-source always sees the attrs. */
export function webmcpFormHtml(opts: {
  toolname: string
  tooldescription: string
  fields: { name: string; description: string }[]
}): string {
  const inputs = opts.fields
    .map(
      (f) =>
        `<input name="${escAttr(f.name)}" required toolparamdescription="${escAttr(f.description)}">`,
    )
    .join("")
  return `<form toolname="${escAttr(opts.toolname)}" tooldescription="${escAttr(opts.tooldescription)}">${inputs}</form>`
}

export const CHECK_VINTED_ITEM_FORM_HTML = webmcpFormHtml({
  toolname: CHECK_VINTED_ITEM_NAME,
  tooldescription: CHECK_VINTED_ITEM_DESCRIPTION,
  fields: [{ name: "query", description: CHECK_VINTED_ITEM_QUERY_DESCRIPTION }],
})

export const CHECK_VINTED_PRICE_FORM_HTML = webmcpFormHtml({
  toolname: CHECK_VINTED_PRICE_NAME,
  tooldescription: CHECK_VINTED_PRICE_DESCRIPTION,
  fields: [{ name: "query", description: CHECK_VINTED_ITEM_QUERY_DESCRIPTION }],
})

export const CALCULATE_VINTED_PROFIT_FORM_HTML = webmcpFormHtml({
  toolname: CALCULATE_VINTED_PROFIT_NAME,
  tooldescription: CALCULATE_VINTED_PROFIT_DESCRIPTION,
  fields: [
    { name: "buy_price", description: CALCULATE_VINTED_PROFIT_BUY_DESCRIPTION },
    { name: "sell_price", description: CALCULATE_VINTED_PROFIT_SELL_DESCRIPTION },
  ],
})
