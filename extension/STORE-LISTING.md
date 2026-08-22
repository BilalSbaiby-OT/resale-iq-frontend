# Chrome Web Store — what to paste

Everything below is written to survive review. The two things that get
extensions rejected are an unjustified permission and a privacy policy that
does not match what the code does; both are addressed.

## One-off setup
Register once at https://chrome.google.com/webstore/devconsole — **$5, one
payment, forever**. Requires a Google account.

## Upload
Upload `resale-iq-extension.zip`. The manifest is at the zip root, which is
what the console expects.

## Listing fields

**Name**
Resale IQ - buy-below prices for resellers

NOTE: the name deliberately does NOT contain "Vinted". Google treats another
product's trademark in an extension NAME as implying endorsement, and it is one
of the most common rejections. Descriptive use in the DESCRIPTION is fine, so
the description says Vinted plainly.

**Summary** (132 char limit)
See the most you can pay for a Vinted item and still hit your margin, on the listing page itself.

**Description**
Resale IQ is not affiliated with, endorsed by, or connected to Vinted. It shows
the highest price you can pay for a Vinted item and still make your margin — in
euros, on the listing page, before you buy.

Open any item on Vinted ES, FR, DE, IT or PT and a small panel appears with:
• the buy-below price for that model
• BUY, WATCH or SKIP
• what the item typically sells for
• which model we matched, so you can see what was priced

The numbers come from live and sold Vinted listings across five EU markets,
recomputed hourly. Every formula is published at resaleiq.dev/methodology,
along with what the data cannot tell you.

Works without an account — the first 10 listing views still show the numbers.
Then 7 days unlimited after you sign up, then 10 checks a month.

Support: support@resaleiq.dev

**Category:** Shopping
**Language:** English

## Privacy — the part reviewers actually read

**Single purpose**
Show Resale IQ pricing data on Vinted listing pages.

**Permission justifications**
- `storage` — stores the user's own session token so their plan allowance is
  used instead of the anonymous free tier. Nothing else is stored.
- `host_permissions: https://resaleiq.dev/*` — the extension asks our own API
  for the buy-below price. This is the only host it contacts.
- Content script on `vinted.*` — reads the public product title, brand and
  asking price already rendered on the page, in order to look that product up
  and compare it against the buy-below price.
- Content script on `resaleiq.dev` — reads the session our own site already
  stored in the user's browser, so signing in connects the extension without
  the user copying a token by hand. It runs only on our own domain.

**Data use — tick these honestly**
- Does NOT collect: personal info, health, financial, authentication,
  personal communications, location, web history, user activity.
- Does NOT sell or transfer data to third parties.
- Does NOT use data for creditworthiness or lending.

The only thing leaving the browser is the product title being looked up, sent
to our own API. No Vinted account data, no session, no cookies, no analytics.

**Privacy policy URL:** https://resaleiq.dev/privacy

## Assets to prepare
- 128×128 icon — included in the zip
- 1280×800 or 640×400 screenshot — at least one. A Vinted item page with the
  panel visible is the whole pitch.

## Review
Usually a few days. A narrow host permission and a matching privacy policy are
what keep it short.
