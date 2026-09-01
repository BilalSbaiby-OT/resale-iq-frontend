# Chrome Web Store — what to paste

Everything below is written to survive review. The two things that get
extensions rejected are an unjustified permission and a privacy policy that
does not match what the code does; both are addressed.

Upload **1.3.0**. Live store is still 1.2.0 until Google approves this package.

## One-off setup
Register once at https://chrome.google.com/webstore/devconsole — **$5, one
payment, forever**. Requires a Google account.

## Upload
Zip: `~/Desktop/resale-iq-extension-1.3.0.zip`
The manifest is at the zip root, which is what the console expects.

Rebuild:
```
cd ~/Desktop/resale-iq/extension
zip -r ~/Desktop/resale-iq-extension-1.3.0.zip \
  manifest.json background.js content.js content.css link.js \
  options.html options.js icons \
  -x "*.DS_Store"
```

## Listing fields

**Name**
Resale IQ - buy-below prices for resellers

NOTE: the name deliberately does NOT contain "Vinted". Google treats another
product's trademark in an extension NAME as implying endorsement, and it is one
of the most common rejections. Descriptive use in the DESCRIPTION is fine.

**Summary** (132 char limit)
See the most you can pay for a Vinted item and still hit your margin, on the listing page itself.

**Description** (paste as-is)
Resale IQ is not affiliated with, endorsed by, or connected to Vinted. It shows
the highest price you can pay for a Vinted item and still make your margin — in
euros, on the listing page, before you buy.

Open any item on Vinted in Spain, France, Germany, Italy or Portugal and a
small panel appears with:
• Buy-below price — the most you can pay for that model and still hit your target margin after fees
• BUY, WATCH or SKIP
• The average asking price of comparable listings when they left the shelf, with sample size
• Which model we matched, so you can see exactly what was priced

The numbers come from live Vinted listings across five EU markets, plus which
ones leave the shelf, collected about every 30 minutes and recomputed roughly
every 2 hours. We do not observe sale prices — a departure can be a sale, a
delisting or a relist, and we say so plainly. Every formula, and what the data
cannot tell you, is published at resaleiq.dev/methodology — no accuracy
claims we cannot back.

Works without an account. You get free checks every day, and the panel stays
out of the way of the buy button. Sign in at resaleiq.dev (confirm your email)
and checks count against your plan. Collapse the panel if you want it smaller.

Support: support@resaleiq.dev

**Category:** Shopping
**Language:** English
**Homepage:** https://resaleiq.dev

**Release notes (1.3.0)**
BUY / WATCH / SKIP on the listing (no more IN RANGE / TOO DEAR). Panel stays
visible when we have no model data. Sign-in token stays on this device, not
Chrome sync. Collapse control, German/Italian/Portuguese panel copy, and a
toolbar popup to see if you are connected.

## Privacy — tick these to match the zip

**Single purpose**
Show Resale IQ pricing data on Vinted listing pages.

**Permission justifications**
- `storage` — stores (1) an optional session token after the user signs in at
  resaleiq.dev, so checks use their plan instead of the anonymous allowance,
  and (2) whether they hid the panel. Nothing else is stored. Token is
  chrome.storage.local — this device only, not Chrome sync.
- `host_permissions: https://resaleiq.dev/*` — the extension asks our own API
  for the buy-below price. This is the only host it contacts.
- Content script on `vinted.es/fr/de/it/pt` — reads the public product title,
  brand and asking price already rendered on the page, to look that product up.
- Content script on `resaleiq.dev` — reads the session our own site already
  stored in the user's browser, so signing in connects the extension without
  pasting a token. It runs only on our own domain.

**Data use — tick honestly (2026 Limited Use)**
DO collect, only as needed for the single purpose:
- Website content — the public listing title/brand, sent to resaleiq.dev to
  look up the buy-below price.
- Authentication information — optional session token, stored locally after
  sign-in at resaleiq.dev, sent only to resaleiq.dev as a Bearer token.

Do NOT collect: personal communications, location, web history, health,
financial/card data, or anything from the Vinted account.

Certify:
- Does NOT sell or transfer data to third parties.
- Does NOT use data for creditworthiness or lending.
- Data is used only to show the buy-below price and apply the user's quota.

**Privacy policy URL:** https://resaleiq.dev/privacy

## Assets
- Store icon: `store-assets/store-icon-128.png` (also in zip as icons/128.png)
- Small promo (required): `store-assets/small-promo-440x280.jpg`
- Marquee (optional, needed to be featured): `store-assets/marquee-1400x560.jpg`
- Screenshots 1280×800, square corners, no browser chrome:
  regenerate with `python3 store-assets/make-screenshots.py` so they show
  **BUY** and **SKIP**, not the old IN RANGE / TOO DEAR labels. Upload at
  least those two. Do not submit 1.3.0 with the old screenshots — Google
  compares screenshots to the running UI.

## Review
Usually a few days. A narrow host permission and a matching privacy policy
are what keep it short.
