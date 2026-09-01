# SUBMIT 1.3.0 — do these in order

Everything below is generated from extension/STORE-LISTING.md. Paste verbatim.

Dashboard: https://chrome.google.com/webstore/devconsole
Item: fgpajplglnapkebhbcbhlmbbkmnighcm

Claude cannot do this part: Chrome forbids extensions from scripting the Web
Store, and the Web Store API only uploads/publishes a package — it cannot touch
screenshots or the privacy declarations, which are exactly what must change.

---

## 1. Package  →  Build / Upload new package

    ~/Desktop/resale-iq-extension-1.3.0.zip

Verified: manifest 1.3.0, matches the committed source byte-for-byte.

## 2. Screenshots  →  Store listing  →  REPLACE BOTH

    ~/Desktop/resale-iq/extension/store-assets/screenshot-1-in-range.png
    ~/Desktop/resale-iq/extension/store-assets/screenshot-2-too-dear.png

Both 1280x800. The old ones showed IN RANGE / TOO DEAR, which 1.3.0 no longer
has — this is the single most likely cause of rejection. Delete the old two.

## 3. Summary (132 char limit)

See the most you can pay for a Vinted item and still hit your margin, on the listing page itself.

## 4. Description

Resale IQ is not affiliated with, endorsed by, or connected to Vinted. It shows
the highest price you can pay for a Vinted item and still make your margin — in
euros, on the listing page, before you buy.

Open any item on Vinted in Spain, France, Germany, Italy or Portugal and a
small panel appears with:
• Buy-below price — the most you can pay for that model and still hit your target margin after fees
• BUY, WATCH or SKIP
• The average asking price of comparable listings when they left the shelf, with sample size
• When we don't have enough evidence — a thin sample, or a brand we don't track model-by-model yet
  — the panel says so plainly instead of guessing. That happens on a meaningful share of items;
  we'd rather tell you than invent a number.
• Which model we matched, so you can see exactly what was priced

The numbers come from live Vinted listings across five EU markets, plus which
ones leave the shelf, collected roughly every 2 hours. We do not observe sale
prices — a departure can be a sale, a delisting or a relist, and we say so
plainly. Every formula, and what the data cannot tell you, is published at
resaleiq.dev/methodology — no accuracy claims we cannot back.

Works without an account. You get free checks every day, and the panel stays
out of the way of the buy button. Sign in at resaleiq.dev (confirm your email)
and checks count against your plan. Collapse the panel if you want it smaller.

Support: support@resaleiq.dev

## 5. Category / Language / Homepage

    Category: Shopping
    Language: English
    Homepage: https://resaleiq.dev

## 6. Release notes (1.3.0)

BUY / WATCH / SKIP on the listing (no more IN RANGE / TOO DEAR). Panel stays
visible when we have no model data. Sign-in token stays on this device, not
Chrome sync. Collapse control, German/Italian/Portuguese panel copy, and a
toolbar popup to see if you are connected.

## 7. Privacy tab  →  Single purpose

Show Resale IQ pricing data on Vinted listing pages.

## 8. Privacy tab  →  Permission justifications

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

## 9. Privacy tab  →  Data use

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

## 10. Privacy policy URL

    https://resaleiq.dev/privacy

VERIFIED LIVE 2026-08-29 — shows "27 August 2026" and all four phrases the
reviewer cross-checks. (Use a cache-buster if you check it yourself: a plain
request can serve a stale copy showing the old date.)

## 11. Submit for review

Then tell Claude, and the handoff gets closed out.
