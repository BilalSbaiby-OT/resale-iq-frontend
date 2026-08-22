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

## Publishing (Chrome Web Store)

1. Zip is already built at `~/Desktop/resale-iq-extension-1.2.0.zip` (manifest at the zip root).
   To rebuild: from this folder, `zip -r ~/Desktop/resale-iq-extension-1.2.0.zip manifest.json background.js content.js content.css link.js options.html options.js icons -x "*.DS_Store"`
2. Open https://chrome.google.com/webstore/devconsole (one-off $5 registration).
3. Find **Resale IQ**, click **Package** → **Upload new package** → the zip.
4. Bump listing if asked; paste copy from `STORE-LISTING.md`.
5. Privacy policy URL: https://resaleiq.dev/privacy
6. Submit for review. Usually a few days.

The public listing is still the previous version until Google approves 1.2.0.

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
