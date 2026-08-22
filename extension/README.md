# Resale IQ — Vinted extension

Shows the buy-below price on the Vinted listing page, where the decision is
actually made.

## Why this exists

The site had ~21 human visitors a month against 227 indexed pages. Four models,
asked independently, reached the same conclusion: the constraint is
distribution, not data — and the buy-below number is worth most at the moment
of the buy, which happens on Vinted, not on our dashboard.

## Install (unpacked, for testing)

1. Chrome → `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select this `extension/` folder
4. Open any Vinted item page on .es / .fr / .de / .it / .pt

No account needed — the first 10 listing views still show numbers. The options page accepts
a token to use your plan's allowance instead.

**Chrome Web Store:** https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm

## Publishing

Needs the owner's Chrome Web Store developer account (one-off $5 registration).
Zip the folder contents and upload. Screenshots and a privacy justification for
`storage` + the `resaleiq.dev` host permission are required.

## What it does not do

It does not read the Vinted account, touch the session, or send anything about
the user anywhere. It reads the public title and brand already rendered on the
page and asks our own public verdict endpoint about that string.

## Verified against production

- `/api/verdict?q=` returns **HTTP 200** with `{"verdict":"LIMIT_REACHED"}` when
  the free allowance is spent, and `"UNKNOWN"` when there is no data. Neither is
  an HTTP error, so status-code checks alone are not enough.
- The success payload uses `buy_below`, `sell_avg`, `product` — not
  `max_buy_price` / `avg_price_eur`.
- The endpoint accepts a **Bearer JWT** only. `X-Api-Key` is not honoured here;
  it decodes the token by hand rather than going through the usual dependency.
