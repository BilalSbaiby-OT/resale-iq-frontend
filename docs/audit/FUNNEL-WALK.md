# FUNNEL WALK — a code read, not a browser session

**Method.** I have Read/Grep/Glob only — no Bash, no browser, no git checkout. Everything below is
**code-derived**: I traced the actual source that renders each screen and the actual FastAPI handler
that answers each request, and I quote the real strings the code emits. Where a prior audit
(`docs/audit/FUNNEL.md`, `docs/audit/proof/W36/...`, `demand-intel/docs/PRODUCTION_READINESS.md`,
`docs/company/SESSION.md`) already did a **live** check, I cite it and label it **verified-live**
(their evidence, not mine). Everything else is labelled **code-derived, not run**. I did not open a
browser and did not execute any request.

**One fact that governs the whole walk:** `git push origin main` deploys production automatically in
both repos (`resale-iq/CLAUDE.md`, `demand-intel/CLAUDE.md`, both hook-enforced). So **whatever is on
`main` is what a real visitor gets today** — a branch with a fix sitting unmerged is a fix nobody has
received yet. I checked this explicitly for step 3 below.

---

## Step 1 — the homepage's claim

`resale-iq/src/app/page.tsx:71-88`. A visitor sees, left column:

> **{heroTitle}** (i18n copy, `src/lib/i18n.ts`)
> {heroBody}
> {heroFrom(tracked)} — dataset size, e.g. "from X items tracked"

Directly under it, `id="check"`, is the live search box (`<FreeChecker />`,
`src/components/tools/free-checker.tsx`), with this line right underneath it
(`page.tsx:85-87`, `src/lib/trial-copy.ts:9-10`):

> "10 checks/day without an account; 7 days of Starter + 5 live finds + 1 order plan after
> signup, then 10/month."

Trust strip (`page.tsx:124-131`): "`{n}` unique items tracked · Scraped every 30 min · Every
formula on /methodology · No accuracy claims until 30 outcomes scored."

**This is the promise the rest of the walk is graded against: a free, no-account check, right on the
homepage, with a number back.** `/methodology` is independently confirmed by the CEO's own live walk
to be honest and accurate (`docs/audit/FUNNEL.md` "What the walk found that was right") — the
methodology page is not the problem; whether the promise on the homepage is *kept* is.

---

## Step 2 — the first search: tracing `/api/verdict` from the top

Handler: `demand-intel/api/routes.py:662` (`@public_router.get("/api/verdict")`). For a brand-new,
cookie-less, logged-out visitor typing "Adidas Samba" and hitting **Check it free**
(`free-checker.tsx:57-69` → `GET /api/verdict?q=...`, same-origin, no `Authorization` header):

1. `_resolve_caller` finds no JWT/API key → `current_user = None` (`routes.py:688-689`).
2. Per-minute rate limit check, keyed on an IP hash since there's no user (`routes.py:698-705`) —
   irrelevant for a first-ever click.
3. `is_free = True`, `spending_unlock = False` → enters the free-anonymous branch
   (`routes.py:750-805`).
4. **This is the branch that decides whether the visitor gets an answer at all — see Step 3.**
5. If quota is granted: the query goes through `match_verdict_signal` against the top-200
   `model_signals` (`routes.py:836-871`). Four possible shapes come back, and the copy for each is
   quoted verbatim in Steps 4–7 below: `LIMIT_REACHED`, `UNKNOWN` (no/ambiguous/too-vague match),
   `INSUFFICIENT_DATA` (thin comparables), or a real `BUY`/`WATCH`/`SKIP` gated through `_gate()`
   (`routes.py:942-1015`) so an anonymous caller only ever sees `buy_below`, `sell_avg`, headline
   verdict, confidence, and `n` — sell-through, sizes and reasons stay paid.

---

## Step 3 — the worst moment: is `LIMIT_REACHED` on a brand-new visitor still live on `main`?

**Yes. Code-derived, cross-referenced against three independent documents, all internally
consistent and all dated today or this week.**

What I checked, since I cannot run `git log`:

- `demand-intel/.git/HEAD` → currently on `refs/heads/claude/backend-eng/data-defects-c6-c5-c4`
  (**not** `main`, **not** the fix branch).
- `demand-intel/.git/refs/heads/main` → `a8ac5bd...`.
  `demand-intel/.git/refs/heads/claude/backend-eng/anon-quota-cookie` → `836e6d5...` — a different
  commit, on a different branch, never merged into the ref `main` points at.
- `resale-iq/docs/audit/proof/W36/security-20/CHECKLIST.md:173-178` (a security review of the fix
  commit, this week): *"the new anonymous-visitor identity added in `demand-intel` commit `836e6d5`
  on `claude/backend-eng/anon-quota-cookie` **(not yet merged to `main` — reviewed via `git show`,
  not checked out)**."*
- `resale-iq/docs/company/OS-COMPLIANCE.md:167-169` (this week): *"the first thing in that path was
  a new visitor's opening click returning `LIMIT_REACHED`. That is fixed on
  `claude/backend-eng/anon-quota-cookie` **and waiting to ship.**"*
- `resale-iq/docs/company/SESSION.md`, updated **2026-09-01 (today)**, line 30-31: the sibling
  backend-eng branch this checkout is actually on, `data-defects-c6-c5-c4`, is explicitly logged as
  **"not merged and not deployed."** No entry anywhere records `anon-quota-cookie` merging either.
- `resale-iq/dashboard/data.json:130-134` lists both `demand-intel:anon-quota-cookie` and
  `demand-intel:data-defects-c6-c5-c4` as **open branches** under `backend-eng`, not as shipped work.

So: the cookie fix exists, is reviewed, and is good (`HttpOnly`/`Secure`/`SameSite=Lax`, a signed
token, a same-commit `ANON_IP_DAILY_CEILING` backstop for cookie-less callers) — but it has not
reached `main`, and only `main` deploys. **Production today still runs the old code**, where the
free/anonymous branch keys the quota on `_client_ip()` (`routes.py:23-53`), i.e. one 10/day bucket
per IP, shared by everyone behind that NAT — a mobile carrier's CGNAT, an office, a café. The exact
failure the CEO's live walk caught and evidenced (`docs/audit/FUNNEL.md` F-1,
`docs/audit/proof/W36/funnel/F-1-verdict-limit-reached.json`, **verified-live**, 2026-08-31):

```
GET https://resaleiq.dev/api/verdict?q=Adidas%20Samba  → 200
{"verdict":"LIMIT_REACHED",
 "message":"Free tier: 10 verdicts/day. Starter or Pro for unlimited.",
 "upgrade_url":"/stripe/plans",
 "used_today":22,"limit":10}
```

on a browser that carried **zero** cookies, zero localStorage, zero sessionStorage. A genuine
first-time visitor can land on the hero, type the site's own example model, click **Check it free**,
and be told they've already used 22 of their 10 daily checks. No prior audit or SESSION entry places
this fix on `main` since. **I could not re-run the live request myself (no browser tool available to
this role) — I am reporting the branch/merge state from the repo and cross-checking three independent
docs that agree, not re-verifying the live HTTP response.** If it has shipped in the hours since the
last SESSION.md update, that would be new information this file does not have.

---

## Step 4 — hitting `FREE_VERDICT_DAILY_LIMIT` (config: 10/day, `demand-intel/config.py:26`)

Whether via the IP bucket (current `main`) or, once shipped, the per-visitor cookie, the response
shape is identical (`routes.py:806-817`):

```json
{
  "verdict": "LIMIT_REACHED",
  "message": "Free tier: {FREE_VERDICT_DAILY_LIMIT} verdicts/day. Starter or Pro for unlimited.",
  "upgrade_url": "/stripe/plans",
  "used_today": <int>,
  "limit": 10
}
```

On the homepage widget, `free-checker.tsx:106-109` renders this as one grey sentence, no styling
distinct from a normal answer beyond the amber `LIMIT_REACHED` colour token
(`VERDICT_COLOR`, line 44): *"Free tier: 10 verdicts/day. Starter or Pro for unlimited."* No button,
no link — `upgrade_url` from the API (`/stripe/plans`) is **never read or rendered** by this
component; the only next step offered is the general "Unlock the rest →" CTA that appears on *every*
result (`free-checker.tsx:169-177`, `SmartCTA anonLabel="Unlock the rest →"`), pointed at `/register`
via `SmartCTA`, not at Stripe. **The extension's version is more actionable**
(`extension/background.js:89` → `content.js:355`): *"Free checks used up for today. Sign in and the
panel reconnects on its own."* with a real link to `/login`.

---

## Step 5 — sign-up: email verification, trial start

`src/app/(auth)/register/page.tsx`. Plan choice includes a genuine **Free** option
(`PLAN_META`, line 16-20) that was previously unreachable — the code comment above it
(`register/page.tsx:9-15`) records that the free tier used to be advertised everywhere and reachable
nowhere; this file is the fix. On submit (`register/page.tsx:64-66`) the user is routed straight to
`/check-email`, which says (`check-email/page.tsx:43-49`):

> "We sent a confirmation link to `{email}`. Open it to start your 7-day trial. Look in **spam /
> junk** if it isn't there — it comes from `noreply@resaleiq.dev`."

The trial does **not** start at registration — it starts at verification
(`demand-intel/api/auth.py:506-509`, comment: *"7-day trial starts at email verify, not at
register"*), a guarded one-time `UPDATE ... WHERE trial_ends_at IS NULL`. Once verified: unlimited
verdicts for 7 days (`_is_trial_active`, `auth.py:541-556`, honoured by `require_paid_plan`,
`require_power_or_trial`, and — since the fix documented in `PRODUCTION_READINESS.md` "Ninth pass"
— by `/api/verdict` itself, `routes.py:710-721`, which used to check `plan` alone and silently capped
trial users at the free tier on the one feature they signed up to try).

---

## Step 6 — the trial ends (`trial_ends_at`): does anything happen?

**No proactive signal of any kind. It lapses silently, and the user finds out only by hitting a wall
later — code-derived, and the absence is as load-bearing as the presence would be, so I checked it
from three directions.**

1. **No email.** `demand-intel/api/email.py:1-8` — the module docstring lists every template that
   exists: *"verify, reset, subscription, cancel, deal alerts."* `send_welcome_email` is defined but
   explicitly *"unused on purpose."* Full function list (`email.py:68-153`):
   `send_email`, `send_welcome_email` (dead), `send_password_reset_email`,
   `send_email_verification`, `send_subscription_confirmation`, `send_cancellation_email`,
   `send_deal_alert_email`. **There is no `send_trial_ending_email` or equivalent.** No scheduled job
   references `trial_ends_at` either (`grep` across `main.py` and `email.py`: zero matches).
2. **No frontend page ever reads `trial_ends_at`.** A repo-wide grep of `resale-iq/src` for
   `trial_ends_at` returns nothing. The only frontend awareness of trial state is the derived boolean
   `user.trial_active` / `user.trial_days_left`, computed server-side
   (`demand-intel/api/auth.py:778-789`) and surfaced in exactly one place:
   `src/app/(dashboard)/account/page.tsx:154`, as a passive sub-line the user must navigate to
   `/account` to see: *"7 days of unlimited left, then 10 checks/month"* while active, or
   *"7-day trial ended — 10 full checks each calendar month"* once it lapses. **Nothing pushes this
   information to the user; they have to go looking for it.**
3. **The one reactive signal is the Paywall component, and it only fires when a blocked action is
   attempted.** `src/components/layout/paywall.tsx` renders when an authenticated, non-paid account
   hits a 402 on a gated page/section. It calls `getTrialRecap()`
   (`paywall.tsx:57`, backend `demand-intel/api/resale_routes.py:1517-1541`,
   `GET /api/account/trial-recap`) and — **only if `recap.buys > 0`** — shows a personalised line
   such as *"In your trial, Resale IQ flagged N BUY opportunities worth ~€X in potential margin"*
   (`resale_routes.py:1530-1536`). This is a genuinely good idea (loss-aversion, concrete ROI) but it
   is (a) reactive — shown only after the user is already blocked, never before or at expiry — and
   (b) conditional on the recap having a nonzero BUY count, which Step 7 of this walk shows is
   structurally unlikely for most trial users on the current data.

**Net effect for a real trial user:** day 8, they open the app expecting the tool they used all week.
Somewhere they touch a gated endpoint, get a 402, and are shown a pricing wall — possibly with a
value recap, more often not. They received no warning on day 5 or day 6 that this was coming, and no
email ever told them the trial had ended. The only place that says so in plain language is a
sub-line on `/account` they have no reason to visit unless they already suspect something changed.

---

## Step 7 — the Chrome extension: install → first use on a Vinted listing

`extension/manifest.json`: MV3, permissions = `["storage"]` only, `host_permissions` =
`https://resaleiq.dev/*`. Content script runs on `vinted.{es,fr,de,it,pt}/*`
(`manifest.json:34-39`). **Reads only the public page** — title, brand link, a regex-matched asking
price (`content.js:163-187`) — never the user's Vinted session, confirmed by the options popup's own
copy (`options.html:25`): *"The extension only sends the public listing title to resaleiq.dev. It
never reads your Vinted account."*

**First paint**, before any answer: a neutral "checking…" card (`content.js:346`).

**The request**, `background.js:38-48`: `GET https://resaleiq.dev/api/verdict?q=...` with an
`Authorization: Bearer <token>` header **only if the user signed in through the popup** — otherwise no
auth header, and critically, **no `credentials: "include"`**, so no cookie is ever sent even once the
anon-quota-cookie fix ships. `routes.py:792-795` names this exact case in its own comment: *"the
extension's background fetch — `extension/background.js` never sends credentials cross-origin, so
every call looks like a brand-new visitor to the cookie quota above."* Practically: a logged-out
extension user browsing Vinted today hits the **same IP-shared 10/day bucket** as the homepage
checker (Step 3) — one busy flea-market seller on a shared office Wi-Fi can exhaust it for everyone
on that connection before lunch.

**Four response shapes, mapped to real UI** (`content.js:222-301`, cross-checked against
`design/extension-panel/*.html`, which are static design references, not live captures, but map
1:1 to the same CSS classes and copy as `content.js`):

- **Confident** (`design/extension-panel/confident.html`): green-accented card, buy-below price,
  "most you can pay for your margin", confidence pill, `n`, "listed at €X — within/over your price."
- **Insufficient data** (`design/extension-panel/insufficient.html`, maps to
  `INSUFFICIENT_DATA`/`d.buy_below == null`): *"Not enough sold data to price this yet. We'd rather
  tell you that than guess."* with the real `n` shown ("4 sold, watched") and a floor stated in
  plain language: *"Our floor for a price is 8 comparable sales. This model has 4."*
- **Not covered** (`design/extension-panel/not-covered.html`, maps to `UNKNOWN`): different copy from
  insufficient-data on purpose — *"Zara isn't in our model catalogue... This is a coverage gap, not
  a thin sample"* — and gives a next step: *"we still price every brand whose catalogue does track
  individual models. Check the brand page for what's covered before you buy."*
- **Limited** (`content.js:355`, no matching design file — this state isn't in the four-state design
  set at all): *"Free checks used up for today. Sign in and the panel reconnects on its own."* with
  a working link to `/login`.

The panel degrades honestly on network failure too: `paintStatus(t().down)` — *"Could not reach
Resale IQ. Try again in a moment"* — rather than disappearing or hanging (`content.js:349-364`).

---

# BREAKS, ranked by how many users hit them

Ranked by estimated reach against the production numbers given for this audit
(78 verdict requests/7d; 19% `LIMIT_REACHED`=15; 24% `PENDING`; 40.9% of *answered* searches
`INSUFFICIENT_DATA`; 43% of tracked models priceable at all). Severity labels: **code-derived** =
traced in source, not independently re-run by this session; **verified-live** = an earlier session
executed the request/browser check and I am citing its evidence.

### 1. `LIMIT_REACHED` on a visitor's first-ever click — 19% of all requests, and it is the very first
one a new visitor makes (Step 3)
**What the user experiences:** they read the hero, type the example model the site itself suggests,
click the one green button on the page, and are told they've already used their free checks — with
no cookie, no account, no prior visit. It reads as either a broken product or an aggressive
dark-pattern paywall; either read kills trust before the product has said anything true.
**File:line:** production behaviour = `demand-intel/api/routes.py` on `main` (`a8ac5bd`), the
pre-fix `_client_ip()`-keyed branch at `routes.py:23-53` + `750-805` on that commit; the fix is
written and reviewed but stranded on `claude/backend-eng/anon-quota-cookie` (commit `836e6d5`),
confirmed unmerged as of `docs/company/SESSION.md` (today).
**Smallest fix:** this is not a code problem, it's a shipping problem — the fix already exists,
passed security review (`docs/audit/proof/W36/security-20/CHECKLIST.md` item 9, PASS), and has its
own test suite. **Merge `claude/backend-eng/anon-quota-cookie` to `main`.** That is the entire fix;
writing new code here would be redundant with work already done and reviewed.

### 2. `PENDING` and never resolved — 24% of requests
**What the user experiences:** given the code path, `PENDING` is not a verdict value this endpoint
ever returns to the client (`routes.py`'s only terminal states are `LIMIT_REACHED`, `UNKNOWN`,
`INSUFFICIENT_DATA`, or a resolved `BUY`/`WATCH`/`SKIP` — see the anon quota's own claim-then-resolve
pattern, `claim_anon_verdict_quota` / `resolve_anon_verdict`, `routes.py:801-804`, `1061-1062`,
`1200-1201`). A row that stays `PENDING` in the logging table almost certainly means the request
**never got an HTTP response at all** — the process died mid-request, the DB write lock stalled, or
the client gave up first. To the user this is the worst possible failure mode: the "checking…" card
(`content.js:346`, or the loading spinner in `free-checker.tsx:97-98`) **just sits there forever**.
No error, no retry prompt, no timeout message — nothing in either the extension or the web widget
ever cancels a hung request or shows a "this is taking too long" state.
**File:line:** the reservation is written in `claim_anon_verdict_quota` and resolved in
`resolve_anon_verdict` (`db/queries.py`, called from `routes.py:801-804` and `1061-1062`/`1200-1201`);
neither the extension (`content.js:348-366`) nor the web widget (`free-checker.tsx:57-69`) has a
client-side timeout. This is a strong hypothesis from the code, not a confirmed root cause — I did
not have access to the `verdict_logs` table to see what state those 24% are actually stuck in.
**Smallest fix:** two independent, additive changes: (a) a client-side fetch timeout (8-10s) in both
`free-checker.tsx` and `content.js` that falls back to the existing `paintStatus(t().down)` /
"Could not check that item right now" states — this alone fixes what the *user* sees, without
touching the backend; (b) separately, instrument why rows stay `PENDING` server-side (is it always
resolved and the *logging* table is stale, or do requests really die mid-flight under load).

### 3. The `INSUFFICIENT_DATA` refusal — 40.9% of answered searches, i.e. the single most common
non-answer in the product
**What the user experiences, and why the wording matters here more than anywhere else in the
product:** this is not a dead end. The actual copy the API sends
(`routes.py:1046-1054`, the sufficiency-gate path) is:

> `message`: *"We know '{brand model}', but {n} watched comps is too few to print a buy-below."*
> `confidence_note`: *"Only {n} comparable sold items — not enough to name a buy-below. The model is
> tracked; the price is not."*

and the web widget renders this verbatim under a clearly-labelled **"NOT MEASURED"** state
(`free-checker.tsx:76`, `157-159`), never as a blank or a generic error. The extension panel's design
reference goes further — *"Not enough sold data to price this yet. We'd rather tell you that than
guess"* with the real `n` shown next to a plainly-stated floor (`design/extension-panel/insufficient.html:104-113`).
**This is honest, well-written, and correctly the product's stated differentiator** ("the price check
that tells you when it doesn't know"). It is not a bug in the wording. The break is structural: at
40.9% of answered searches, "not enough data" is nearly a coin flip on any given search, which is a
data-coverage problem (see #4) wearing honest copy — the copy cannot fix the fact that four in ten
answers are a refusal. **Do not touch the wording; it is one of the best things in the product**
(confirmed independently by `docs/audit/FUNNEL.md`'s "what the walk found that was right").
**File:line:** `demand-intel/api/routes.py:889-911` (pre-`apply()` gate, `verdict_allows_buy_below`)
and `:1036-1063` (post-`apply()` gate, `data_sufficient`) — two separate code paths produce
`INSUFFICIENT_DATA` with near-identical but not identical copy; worth unifying so the message is
consistent regardless of which gate fires, but that is a polish item, not the P0.
**Smallest fix (not a copy fix — a coverage fix):** this is the same underlying problem as #4 below.

### 4. Only 43% of tracked models can be priced at all
**What the user experiences:** this is the upstream cause of #3. A model can be *tracked* (it's in
the catalogue) and still return `UNKNOWN`/no price for structural reasons unrelated to that day's
sales volume — `demand-intel/CLAUDE.md`'s own "Current Known Issues" section documents the
sell-through discovery-rate hold that blanks `opportunity_score`/`str_pct` product-wide whenever
`str_discovery_rate` exceeds 20% (measured 62-64% in the most recent audits cited in
`PRODUCTION_READINESS.md`), and the 14-day-old corpus problem underneath it. `routes.py:1076-1081`'s
`_provisional_verdict` path exists specifically to answer *something* rather than nothing while that
hold is active — a real, deliberate mitigation — but it still cannot manufacture a price where no
comparable sales exist at all.
**File:line:** `demand-intel/engine/sufficiency.py` (`apply()`, the gate), `demand-intel/CLAUDE.md`
"Sell-through is HIDDEN product-wide" section, `demand-intel/docs/PRODUCTION_READINESS.md` "Twelfth
pass" (0/100 models answering, verified-live, since partially mitigated by provisional verdicts).
**Smallest fix:** not a code fix — the corpus needs to age (self-lifting per the hold's own design)
or the 20% discovery-rate ceiling needs an owner decision to retune. Out of scope for a single PR;
flagged here because it is the real reason #3 is as high as it is.

### 5. The trial ends with no signal, ever (Step 6)
**What the user experiences:** a week of full access, then silence. No day-5 warning, no
expiry email, no push notification — nothing proactive exists anywhere in the codebase (checked
`email.py`'s full template list, every job in `main.py`, and every frontend reference to
`trial_ends_at`, all empty). The user finds out only when they hit a 402 on some later visit, and
even then the message is generic unless the trial happened to produce at least one BUY call
(`getTrialRecap`, conditional on `recap.buys > 0`). Given #3/#4 above (a 40.9% refusal rate and a
43% pricing ceiling), a meaningful share of trial users will hit `recap.buys === 0` and get the
plain paywall with no personalised hook at all (`resale_routes.py:1538-1540`'s generic fallback:
*"one good flip pays for the month"*).
**File:line:** absence confirmed across `demand-intel/api/email.py:1-8` (template list),
`demand-intel/main.py` (no scheduled job references `trial_ends_at`), `resale-iq/src` (zero matches
for `trial_ends_at`); the one reactive path is
`resale-iq/src/components/layout/paywall.tsx:57` + `demand-intel/api/resale_routes.py:1517-1541`.
**Smallest fix:** a single scheduled check (reuse the existing APScheduler pattern already in
`main.py`) that finds users with `trial_ends_at` within the next 24-48h and sends one email using
the existing `send_email()` primitive and `_html()` template wrapper already in `email.py` — this is
additive (a new template function, no changes to existing ones) and reuses infrastructure that
already exists for every other transactional email in the product.

---

## What is already right, and should not be touched by whoever picks these up

- The `INSUFFICIENT_DATA` and `UNKNOWN` copy (#3 above) is honest, specific, and gives a next step
  ("Say X or Y", "try a brand + model name", "the model is tracked; the price is not"). This is the
  product's stated differentiator and it is real in the code, not just on the methodology page.
- The extension reads only public listing data and says so in its own UI copy — verified by reading
  `content.js` end to end, not just trusting the popup's claim.
- The paywall's trial-value recap (`getTrialRecap`) is a genuinely good, non-obvious idea — the fix
  for #5 should extend it (put the same recap headline in the proactive email), not replace it.

## What I could not check from this seat

- Whether the 24% `PENDING` rows are a logging artifact or genuinely-hung requests — needs DB access
  to `verdict_logs`, which this role does not have.
- Whether `LIMIT_REACHED` (#1) has been fixed on `main` in the hours since `SESSION.md`'s last
  update — I read three converging documents, not the live site.
- The actual visual rendering of any of this — every "what a user sees" claim above is reconstructed
  from the exact JSX/HTML/CSS that renders it, not from a screenshot. Where the design HTML files are
  static references rather than live captures, I said so.
