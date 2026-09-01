# Extension review — v1.3.0 (3 installs, live since 2026-08-30)

Scope: read-only review. `extension/*`, `design/extension-panel/*`, and the parts
of `src/` the design specs cite as source of truth (`src/types/index.ts`,
`src/app/(dashboard)/verdict/page.tsx`). No code changed, nothing built, nothing
pushed. Everything below is either **verified by reading the shipped source**
(marked *code*) or **something that needs a loaded extension / live Vinted page
to confirm** (marked *needs browser* — I did not open a browser for this task).

Context that changes the read: `git log` shows the four design specs
(`design/extension-panel/*.html`, commit `439405f`) landed **2026-08-31**, two
days *after* v1.3.0 shipped (`ead8449`, 2026-08-29). The shipped panel predates
the spec. This is not a regression — it's a spec that was never implemented.
Also relevant: `docs/company/OS.md` already has a pre-registered goal
`G-W36-02` — `panel_honest_state_rate` baseline **0.91** (n=50, W35), target
0.99. 9% of a 50-listing sample already isn't rendering a band or honest
state. Findings 1–3 below are the most likely explanations for that 9%.

---

## Findings, ranked by how many of the (few) users hit them

### 1. INSUFFICIENT_DATA and UNKNOWN collapse into one generic message — the backend's `message` field is never read
**Code.** `extension/content.js:264-268`:
```js
const body = buyBelow != null
  ? `<div class="riq-num">${money(buyBelow)}</div><div class="riq-sub">${esc(L.most)}</div>`
  : `<div class="riq-num riq-muted">${esc(L.notTracked)}</div><div class="riq-sub">${esc(L.noData)}</div>`;
```
Both `noData`/`notTracked` are static i18n strings (`content.js:23-24` etc.) —
the same two sentences for every non-priced item, in every language. The
backend distinguishes the two cases and gives each a purpose-written
explanation in `message` (`src/types/index.ts:213`, consumed by the web
dashboard at `src/app/(dashboard)/verdict/page.tsx:139-148`: *"The backend's
own message explains WHY (thin sample, or a brand whose sales we cannot
observe yet), and it is the only useful thing on the card."*). `content.js`
never reads `d.message`, `d.n` is only shown as a bare number if present, and
the two purpose-built design specs for this — `design/extension-panel/
insufficient.html` ("Not enough sold data to price this yet… Our floor for a
price is 8 comparable sales. This model has 4.") and `design/extension-panel/
not-covered.html` ("Zara isn't in our model catalogue… same is true for
Pull&Bear, Bershka and Mango… Check the brand page for what's covered") —
have no corresponding markup in `content.js` or classes in `content.css` at
all (`grep` for `riq-statement`, `riq-fact-row`, `riq-threshold`, `riq-brand-
pill`, `riq-why`, `riq-next` in `content.css` returns nothing).

**Impact.** This is the modal path, not an edge case: 43% of tracked models
are priceable and 40.9% of answered searches are honest refusals per the KPI
card. Every one of those refusals currently shows the same two sentences
regardless of whether it's "thin sample, try again once it sells more" or
"we will never price this brand, go elsewhere." A user who sees "no model-
level data" on a Zara item and a Sézane item they know is a thin-sample case
learns nothing about which situation they're in, or what to do next.

**Smallest fix.** In `paint()`, prefer `d.message` over the static string when
present (one line: `d.message || L.noData`), and branch styling only on
whether `n` is present at all — you don't need the full design spec's
fact-row/brand-pill treatment to close most of the gap. That alone gets the
UNKNOWN vs INSUFFICIENT_DATA distinction onto the panel without new markup.
Full parity with the two designs is a larger `content.css` change (new
classes for `riq-fact-row`, `riq-threshold`, `riq-brand-pill`, `riq-why`,
`riq-next`) — worth scoping separately since neither the "8 comparable sales"
floor nor the sold-date-range shown in both specs exists as a field on
`VerdictResult` (`src/types/index.ts:186-226` has no threshold or date-range
field) — the designs cite numbers the API doesn't return yet, which is a
backend/design gap, not just an extension one.

### 2. System-error states and the genuine WATCH verdict share the same visual class
**Code.** `extension/content.js:222-229`, `paintStatus()` (used for network-
down, 403/unverified, 429/rate-limited, and LIMIT_REACHED) renders:
```js
render(`<div class="riq-card riq-watch"> ... `);
```
`extension/content.js:235` and `:271`, the real BUY/WATCH/SKIP verdict card
computes `tone` and renders `<div class="riq-card riq-${tone}">` — for a
genuine WATCH verdict, `tone` is also `"watch"`. `content.css:18` sets
`.riq-watch { border-left-color: #fbbf24; }` (amber) — the one and only style
rule that applies to both. There is no visual difference between "we priced
this item and our answer is WATCH" and "Resale IQ is unreachable" / "confirm
your email" / "you're rate-limited" beyond the copy inside the card.

**Impact.** This is the exact confusion the KPI is trying to prevent: "a band
or an honest state" implies the two must be visually distinguishable, and
right now they are not. At low traffic this reads as a minor detail, but it's
also exactly the kind of thing 3 early testers would notice and describe as
"the price checker showed me something that looked like a WATCH price but it
was actually broken" — a much worse first impression than a clearly-labeled
error.

**Smallest fix.** Give `paintStatus()` its own class (e.g. `riq-status`)
distinct from the verdict tones, with a neutral (grey/blue, not amber) left
border. One new CSS rule, one template change.

### 3. Uncovered markets (vinted.co.uk, vinted.com, any non-ES/FR/DE/IT/PT domain) get total silence, not a message
**Code.** `extension/manifest.json:32-48`, `content_scripts.matches` lists
only `www.vinted.{es,fr,de,it,pt}`. Manifest V3 content scripts only run on
matched origins — there is no code path where the extension runs at all on
`vinted.co.uk` or `vinted.com`. `extension/options.html:21` has one static
line — *"Open a Vinted item on ES, FR, DE, IT or PT"* — shown in the popup
regardless of which tab is active; it doesn't detect the current tab and say
"you're on an unsupported site right now." A user on `vinted.co.uk` gets no
panel, no popup warning tied to their actual tab, nothing in the page at all.
This matches the task brief's worry precisely — not a wrong number, but not
a clear message either; it's simply nothing.

**Impact.** Vinted's UK site is one of its largest markets. Any tester,
reviewer, or organically-discovered user starting from `vinted.co.uk` — very
plausible given the extension's own name mentions "Vinted" with no country
qualifier — installs it, opens a listing, and sees literally nothing happen.
At 3 installs, this could already be an unexplained "doesn't work" data
point.

**Smallest fix.** `background.js` already owns all networking and runs as a
service worker with `"host_permissions": ["https://resaleiq.dev/*"]` — it
cannot see the active Vinted tab's URL without an added permission, so the
cheapest real fix is in `options.js`/`options.html`: read `chrome.tabs.query
({active:true,currentWindow:true})` (`chrome.tabs` query on the active tab
does not require the `tabs` permission, only `activeTab`, which is
user-gesture-scoped and matches how the popup is opened) and swap the popup's
static line for "You're on vinted.co.uk — Resale IQ covers ES/FR/DE/IT/PT
only" when the hostname doesn't match. That's a popup-only, permission-light
change; doesn't touch the manifest's `permissions` array beyond adding
`"activeTab"`, which is one of the more benign, well-understood permissions
for reviewers and install-page trust.

### 4. Zero telemetry — a silently-broken panel is invisible at 3 installs, and would stay invisible at 300
**Code.** `grep -n "fetch\|sendMessage\|analytics\|track" extension/*.js`
shows exactly two network destinations in the whole extension: `resaleiq.dev/
api/verdict` and `resaleiq.dev/api/purchases` (`background.js:41,57`). There
is no error-reporting call anywhere. `content.js:163-187` (`readListing()`)
uses a selector chain with silent fallbacks — `title` falls back to
`document.title.split("|")[0]`, `brand` falls back to `""` — and if the whole
chain fails (`title.length < 3`), `readListing()` returns `null`. `run()`
(`content.js:333-340`) then does `document.getElementById(BADGE_ID)?.remove()`
and returns — no panel, no log, no signal sent anywhere. The outermost guard,
`content.js:377` (`try { run(); } catch { /* same */ }`), swallows any
exception the same way. `background.js:94-96` catches fetch failures and
returns `{ok:false, down:true}`, which *does* reach the content script and
*does* paint something (finding 2's shared-class issue aside) — but a DOM-
selector failure in `readListing()` never reaches `background.js` at all, so
even that path is silent.

**Impact.** This is precisely how the existing `panel_honest_state_rate`
baseline of 0.91 (`docs/company/OS.md:222`, W35, n=50) can sit at 9% failure
without anyone knowing why. At 3 installs, a Vinted DOM change that breaks
`readListing()`'s selectors would produce zero panel, zero error, zero
complaint route beyond a user giving up and uninstalling — which is itself
invisible. The task brief asks "how would we even know" — on the evidence
here, we would not, short of the manual `browser-qa sample` /
`chrome-walk` skill referenced in `METRICS.md:145` and `GAPS.md:53` (which
`GAPS.md` notes doesn't exist yet — `.claude/skills/` is empty).

**Smallest fix.** Not a code change I'd make unreviewed given the "reads
public listing text only" privacy story is core to this product's Chrome Web
Store trust (`STORE-LISTING.md:83-84`) — adding a telemetry beacon changes
the privacy declaration and needs `legal-compliance`/`security-eng` sign-off,
not just an extension patch. Flagging as a proposal, not doing it: a single
`navigator.sendBeacon` (or a `fetch` with `keepalive:true`, since MV3 service
workers can die mid-beacon) to `resaleiq.dev` firing only on `readListing()`
returning `null` on a confirmed `/items/\d+` URL (i.e. "this looks like a
listing page and we still couldn't parse it") — no listing content, just a
counter increment — would surface selector breakage without touching the "we
only read public listing text" claim, since it sends no listing content at
all, just a boolean failure signal plus the two-letter market. This should go
through `security-eng`/`legal-compliance` before being built, not ship as a
same-PR fix to findings 1-3.

### 5. Store screenshots and the description only show the confident 59% — the honest-refusal majority is not depicted anywhere in the listing
**Code.** `extension/store-assets/make-screenshots.py:22-27`, the `SHOTS`
array has exactly two entries, both with a `buy_below` value set (Nike Air
Max 1 → BUY, Jordan 4 → SKIP). `store-assets/README.md:8-9` confirms this is
deliberate: *"BUY on a real listing"* / *"SKIP on a real listing"*. Neither
the screenshots, the marquee, nor `STORE-LISTING.md`'s description shows or
mentions the "not tracked" / "no model-level data" state, even though — per
this review's own KPI card — that state is the more common outcome of a
lookup (40.9% of answered searches, and 57% of tracked models can't be priced
at all). `STORE-LISTING.md:38-48` reads: *"Open any item on Vinted in Spain,
France, Germany, Italy or Portugal and a small panel appears with: •
Buy-below price..."* — technically true (a panel does appear), but the bullet
list under it reads as a guarantee of a price, which is the minority outcome.

I did **not** find any accuracy or hit-rate claim in `STORE-LISTING.md` or
`SUBMIT-CHECKLIST.md` — no "X% accurate", no win-rate number. That part is
already clean and matches the "0 of 340 predictions graded" constraint. The
gap here is expectation-setting, not a false claim: a store rating risk, not
a compliance risk.

**Impact.** Secondary KPI is store rating ≥ 4.3. A listing whose only two
screenshots show a confident number, installed by someone who then hits "not
tracked" on their first two or three real lookups (very likely, given the
KPI numbers), is a plausible source of "doesn't work" 1-star reviews at low
volume, where every single review moves the average a lot.

**Smallest fix — proposed copy** (replacing `STORE-LISTING.md:38-48`, no
files edited by me, this is a draft for the next PR):
```
Open any item on Vinted in Spain, France, Germany, Italy or Portugal and a
small panel appears on the page:
• Buy-below price, BUY / WATCH / SKIP, and what the item typically sells for
  — when we have enough recent sold comparables for that exact model
• When we don't — a thin sample or a brand we don't track model-by-model yet
  — the panel says so plainly instead of guessing. That happens on a
  meaningful share of items; we'd rather tell you than invent a number.
• Which model we matched, so you can see exactly what was priced

The numbers come from live and sold listings across five EU markets, collected
about every 30 minutes and recomputed roughly every 2 hours. Every formula is
published at resaleiq.dev/methodology, together with what the data cannot
tell you — no accuracy claims we cannot back.
```
And add a third screenshot (or replace one of the two) showing the
"not tracked" state once finding 1 gives it real copy to show — shipping a
screenshot of the current generic fallback isn't worth doing first.

---

## Job 4 — manifest permissions (verified, no action needed)
`extension/manifest.json:22-27`:
```json
"permissions": ["storage"],
"host_permissions": ["https://resaleiq.dev/*"]
```
That's the entire permission surface. `storage` backs the token and the
collapsed-state flag (`content.js:213-220`, `options.js:24-36`) — both
justified, both already documented correctly in `STORE-LISTING.md:76-80` and
`SUBMIT-CHECKLIST.md:75-80`, and the justification text matches what the code
actually does (checked both files against `background.js`/`content.js`
directly, not just against each other). `host_permissions` is scoped to the
product's own API, not a wildcard. `options.js:20` calls `chrome.tabs.create`
— this does not require the `tabs` permission (only reading tab URL/title
after the fact would), and it isn't declared, so nothing is over-requested
there either. Content-script injection on the five Vinted domains is declared
via `content_scripts.matches`, not `host_permissions` — Chrome still shows it
on the install-page permission prompt ("Read and change your data on
www.vinted.es and 4 other sites") but it's required for the product's core
feature and can't be narrowed further. **No unjustified permission found.**
This is the one area of the five jobs that's in good shape as shipped.

---

## What I could not verify without a browser
- Whether the title/brand/price selectors in `readListing()`
  (`content.js:163-187`) currently match production Vinted DOM on all five
  markets today — I read the selector chain and its fallbacks, but did not
  load a live `vinted.es`/`.fr`/`.de`/`.it`/`.pt` listing page to confirm hit
  rate or check the price-matching loop (`content.js:176-181`, which scans
  *every* `p`/`div`/`span` on the page for a euro-shaped string and takes the
  first DOM-order match — plausible that a promo banner or a recommended-
  item price above the actual listing wins the race, but I can't confirm
  without rendering the page).
- Whether the extension currently renders visibly broken (vs. absent) on
  Vinted pages that aren't `/items/\d+` — code says `readListing()` returns
  `null` and the badge is removed, which should be silent-correct, but this
  is inference from source, not an observed render.
- The actual install-page permission-prompt wording Chrome shows for this
  manifest — inferred from Chrome's general behavior for `content_scripts`
  matches, not observed in a live install flow.
- Chrome Web Store's current live listing content/screenshots (whether 1.3.0
  has actually been approved and is showing the updated BUY/SKIP screenshots
  per `SUBMIT-CHECKLIST.md`, or whether the listing has already drifted from
  what's in the repo) — not fetched, per this task's Chrome Web Store
  restriction.

## Summary table

| # | Finding | File:line | Verified via |
|---|---|---|---|
| 1 | INSUFFICIENT_DATA/UNKNOWN not distinguished, `message` field unused | `extension/content.js:264-268`, `src/types/index.ts:213` | code |
| 2 | System-error states share `.riq-watch` class with genuine WATCH verdict | `extension/content.js:222-229,235,271`, `content.css:18` | code |
| 3 | Uncovered markets get silence, popup isn't tab-aware | `extension/manifest.json:32-48`, `options.html:21` | code |
| 4 | Zero telemetry; selector failure is unobservable | `extension/content.js:163-187,333-340,377`; `grep` across `extension/*.js` | code |
| 5 | Store screenshots/copy only show confident outcomes | `store-assets/make-screenshots.py:22-27`, `STORE-LISTING.md:38-48` | code |
| — | Permissions minimal and justified | `manifest.json:22-27` | code, no fix needed |
