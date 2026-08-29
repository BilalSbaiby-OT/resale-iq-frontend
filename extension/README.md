# Resale IQ — Vinted extension

Shows the buy-below price on the Vinted listing page, where the decision is
actually made.

## Install (unpacked, for testing)

1. Chrome → `chrome://extensions`
2. Turn on **Developer mode** (top right)
3. **Load unpacked** → select this `extension/` folder
4. Open any Vinted item page on .es / .fr / .de / .it / .pt
5. Click the puzzle-piece toolbar icon → Resale IQ, to see if you are connected

No account needed — free daily checks still show numbers. Sign in at
resaleiq.dev and the extension picks up the session on this device.

**Chrome Web Store:** https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm

## Publishing (Chrome Web Store)

1. From this folder:
   `zip -r ~/Desktop/resale-iq-extension-1.3.0.zip manifest.json background.js content.js content.css link.js options.html options.js icons -x "*.DS_Store"`
2. Open https://chrome.google.com/webstore/devconsole
3. **Resale IQ** → **Package** → **Upload new package** → the zip
4. Paste copy from `STORE-LISTING.md` (privacy ticks included)
5. Replace screenshots with BUY / SKIP captures (see store-assets/README.md)
6. Privacy policy URL: https://resaleiq.dev/privacy
7. Submit for review

The public listing stays on the previous version until Google approves 1.3.0.

## What it does not do

It does not read the Vinted account, touch that session, or send Vinted cookies
anywhere. It reads the public title and brand already rendered on the page and
asks our own verdict endpoint about that string. The optional sign-in token is
`chrome.storage.local` on this device — not Chrome sync.

## Verified against production

- `/api/verdict?q=` returns **HTTP 200** with `{"verdict":"LIMIT_REACHED"}` when
  the free allowance is spent, and `"UNKNOWN"` when there is no data. Neither is
  an HTTP error. UNKNOWN is painted as "not tracked", not a missing panel.
- Unverified accounts get **403**; the panel points at email confirmation.
- The success payload uses `buy_below`, `sell_avg`, `product` — not
  `max_buy_price` / `avg_price_eur`.
- The endpoint accepts a **Bearer JWT** only.
