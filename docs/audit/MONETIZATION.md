# MONETIZATION — why trial_to_paid = 0.0% and what to do about the mechanism, not the rate

**Written** 2026-09-01, monetization agent. KPI card: primary = trial-to-paid conversion, secondary
= refund rate, counter = "no entitlement promised that is not enforced."

**The number this file explains:** `trial_to_paid = 0.0%`, n = 1 (`sql/metrics/trial_to_paid.sql`,
`docs/company/METRICS.md`). MRR = €0.00 (Stripe, live, read-only). One customer, ever — refunded and
cancelled. Six accounts total.

**On the statistics: do not trust any percentage in this file.** n=1 for the KPI itself, and the
production `verdict_logs` sample this audit reasons from (78 rows/7d) is two orders of magnitude too
small to support a rate. Every "19%" / "24%" / "40.9%" below is METRICS.md's own production reading,
carried over for orientation, not re-derived here — **this file ranks by mechanism and severity, not
by rate.** A mechanism that is provably capable of losing every visitor is a P0 at n=1 exactly as
much as at n=100,000; a rate is not.

**Two prior audits already did most of the code-tracing this brief asked for**, in more depth than
one pass can repeat: `docs/audit/MONEY.md` (entitlement/quota/webhook correctness) and
`docs/audit/FUNNEL-WALK.md` (a full code-derived walk of the same funnel, including PENDING and
LIMIT_REACHED). **This file does not re-litigate what they already settled correctly — it (a)
verifies their two most important open questions against the actual git state, since this role has
`Bash(git *)` and theirs did not, (b) traces the one mechanism FUNNEL-WALK left as "a strong
hypothesis from the code," and (c) finds one defect neither prior audit checked: the logged-in
dashboard's own paywall moment.** Citations throughout say which is which.

---

## 0. The trap this brief asked me to re-check: does `plan` defaulting to `'operator'` leak paid access anywhere?

**No live leak found.** Traced every place `.plan` or `_get_plan()` decides entitlement:

- `db/schema.py:565` — `plan TEXT NOT NULL DEFAULT 'operator'` — the trap is real as a schema fact.
- But the **only** `INSERT INTO users` in the codebase (`api/auth.py:414-421`, called from
  `register()` at `api/auth.py:700`) always passes `"free"` explicitly — the default is never
  actually hit by a real signup. `RegisterRequest.plan` from the client is validated but discarded;
  the comment says why: `# always free — plan upgrades via Stripe only` (`auth.py:700`).
- Every entitlement check I could find (`api/routes.py:710-721`, `1481-1482`+`1581-1600` via
  `_get_plan()`, `1611`, `1641`, `2857`; `api/auth.py:559-568` `require_paid_plan`, `608-621`
  `require_live_finder_access`, `624-634` `require_order_planner_access`, `525-532`
  `require_power_plan`) reads `current_user["plan"]` or calls `_get_plan()`, and both trace back to
  the same DB row a real registration wrote as `'free'`.
- The one write path that *can* set `plan='operator'`/`'power'` without a Stripe subscription —
  `PUT /admin/users/{id}/plan` (`api/routes.py:2106-2133`) — is owner-only (`_require_power`),
  cannot touch the owner's own row, and is not reachable by a customer.
- The Stripe webhook (`api/stripe_routes.py:519-578`) forces `plan="free"` on any subscription that
  is not `active`/`trialing` (`:541-542`), regardless of price id, and an ordering guard
  (`:567-576`) stops an out-of-order "active" event from resurrecting access after a cancellation.

**One adjacent, real but non-exploitable finding:** `_set_plan()` (`stripe_routes.py:425-441`)
updates `plan` on cancellation but **never clears `stripe_sub_id`**. `trial_to_paid.sql`'s own
definition of paid is `stripe_sub_id IS NOT NULL` — so a cancelled customer whose trial the query's
cohort ever captured would read as "converted" forever, contradicting the query's own comment that
`plan` is untrustworthy but `stripe_sub_id` is a fact about money. It is **not** a fact about
*current* money once a subscription is deleted. This did not distort the current 0.0% reading (the
one paying-then-refunded customer is not in the trial cohort **either because their `trial_ends_at`
predates the query's tracked cohort, or because it is null — production has this row, this session
does not** — the local `demand_intel.db` is unmigrated QA fixture data with 40+ synthetic accounts,
never production; see `docs/audit/MONEY.md` §0 and §5 for the same caveat independently reached).
**Flagging for the metric's own integrity, not as a revenue leak**: `_set_plan` should clear
`stripe_sub_id` (or `trial_to_paid.sql` should additionally require an *active* Stripe status) so a
second cancellation doesn't silently inflate the KPI it is supposed to keep honest.
*File:line:* `demand-intel/api/stripe_routes.py:425-441`; `resale-iq/sql/metrics/trial_to_paid.sql`.

**Entitlements vs. the pricing page (task item 3):** verified rather than assumed, per the brief.
`resale-iq/src/lib/pricing.ts` sells on Pro (`power`, €49): REST API, Live Deal Finder, 3-week Order
Planner, Price Compare. Backend gates: `POST /auth/api-key` → `require_power_plan`
(`auth.py:808`), `GET /api/live-deals` → `require_live_finder_access` (Pro-unlimited or
trial-budget, `auth.py:608-621`), `GET /api/order-plan` → `require_order_planner_access`
(`auth.py:624-634`), `GET /api/compare/prices` → `require_pro_paid` (`routes.py:2409`). **All four
match the pricing page exactly**, including the trial's temporary access to Live Finder/Order
Planner via lifetime sub-budgets (`TRIAL_LIVE_FIND_LIMIT=5`, `TRIAL_PLANNER_LIMIT=1`,
`config.py:66-67`, atomic via `claim_trial_counter`). `demand-intel/CLAUDE.md`'s "Hard no: REST API
· Order Planner" is stale documentation, not a live defect — `DECISIONS.md` A5 already has this open
for the founder as a docs-vs-reality reconciliation, not an entitlement bug. No action needed here
beyond what A5 already tracks.

---

## 1. The money path, traced end to end

signup → `POST /auth/register` always writes `plan='free'` (`auth.py:700`) → confirmation email →
trial starts **at verification, not registration** (`_start_trial_if_unset`, `auth.py:506-517`,
`trial_ends_at = now + 7d`, one-time via `WHERE trial_ends_at IS NULL`) → `_is_trial_active()`
(`auth.py:541-556`) is evaluated **live** on every gated request, not a stored flag → at
`trial_ends_at`, nothing writes `users.plan`; access simply stops matching `is_paid OR
_is_trial_active()` on the next request. `docs/audit/MONEY.md` §3 independently audited this same
path and calls it "the best-built piece of the entitlement system... No P0 here" — I agree, the
*mechanics* of expiry are correct and fail-closed.

**What happens at expiry, concretely — verified fresh, not assumed:**
- **No email.** Every template in `api/email.py` (`send_welcome_email` [dead], `send_password_reset_email`,
  `send_email_verification`, `send_subscription_confirmation`, `send_cancellation_email`,
  `send_deal_alert_email`) — none is trial-related. Grep for `trial` in `email.py` returns one hit,
  the *signup* confirmation copy ("Confirm this address to start your 7-day trial").
- **No scheduled job.** All 20 APScheduler jobs in `main.py` (scraper, trends, tracker, prediction
  eval, analyzer, daily brief, strong-buy alerts, health check, db backup, WAL checkpoint, reddit
  bot, business digest, data quality, label migration, STR diagnostic, shelf watchdog, metric
  baselines, website audit, watchlist alerts, deal alerts) — grep for `trial` across `main.py`: zero
  matches.
- **No frontend page reads `trial_ends_at`.** Repo-wide grep of `resale-iq/src` for `trial_ends_at`:
  zero matches. The only trial-state UI is `user.trial_days_left`, one passive sub-line on
  `/account` (`api/auth.py:778-804`) that a user has no reason to visit unless they already suspect
  something changed.
- **The only conversion moment is reactive, not proactive:** `Paywall` (`src/components/layout/paywall.tsx`)
  renders when an authenticated non-paid account hits a 402, and fetches `getTrialRecap()` — a
  genuinely good idea ("in your trial we flagged N BUYs worth ~€X", loss-aversion framing) that only
  fires **if `recap.buys > 0`**. Given `insufficient_data_rate = 40.9%` and the coverage ceiling
  METRICS.md already documents, a real share of trial users will have `buys === 0` and fall through
  to the generic "one good flip pays for the month" line with no personalization.

**So: is there a paywall moment at all? Yes, but it is entirely reactive** — the product waits for
the user to walk into a locked door rather than telling them the door is about to lock. This is a
genuine conversion gap, independently confirmed in the same shape by `FUNNEL-WALK.md` Break #5
(`docs/audit/FUNNEL-WALK.md:335-353`), which also proposes the smallest fix I'd land on: one new
APScheduler job (same pattern as every other job in `main.py`) that finds `trial_ends_at` in the
next 24-48h and sends one email via the existing `send_email()`/`_html()` primitives, reusing
`getTrialRecap`'s own headline copy so the email and the eventual paywall screen agree.

---

## 2. Where the free/anon wall sits, and whether it converts or annoys

`FREE_VERDICT_DAILY_LIMIT=10` (`config.py:26`) gates **whether a lookup returns anything at all** —
for anonymous visitors (`claim_anon_verdict_quota`) and, separately, for logged-in free/post-trial
accounts (`claim_verdict_quota`, same limit, same shape, its own daily counter). It is a different,
correctly-monthly mechanism (`FREE_UNLOCK_LIFETIME_BUDGET=10`, resets on `unlocks_period` matching
the calendar month, `db/queries.py:2468-2527`) that gates the **paid fields** on a specific item —
this is the "then 10 full checks/month" half of the promise, and `MONEY.md` §2c independently
confirms it is solid (account-scoped, atomic, no TOCTOU). I re-verified both and did not find a
different result — the two systems are correctly separated, not confused with each other in the code
(I initially misread this myself; `MONEY.md §2a/§2c` is the correct account and I am confirming it,
not proposing a fix).

### The wall's identity bug — verified fixed, not still open
`FUNNEL-WALK.md` Break #1 and `docs/audit/FUNNEL.md` F-1 (a **verified-live** browser walk,
2026-08-31) both documented a brand-new, cookie-less visitor's *first ever click* returning
`LIMIT_REACHED` with `used_today: 22` — because the anon quota was keyed on `_client_ip()`
(`routes.py:23-53` pre-fix), one bucket per NAT/office/carrier. **I checked this against the actual
git state, which neither prior audit's toolset allowed:**
```
$ git fetch origin main && git log -1 --format="%H %cI %s" origin/main
a8ac5bd0a1e7a21500ae277d0185ebd01a348065 2026-08-31T22:58:44+02:00 merge: tighten email validation...
$ git merge-base --is-ancestor 96f8fec main && echo MERGED
MERGED
```
`96f8fec` ("anon verdict quota keyed on a signed visitor cookie, not IP") **is an ancestor of
`origin/main`**, and `demand-intel/CLAUDE.md` states a push to `main` deploys automatically. **This
fix has shipped since the last SESSION.md update FUNNEL-WALK.md cited** — the code now mints a
signed `HttpOnly` visitor cookie on a caller's first request and keys the 10/day bucket on that
(`routes.py:764-785`), with the old IP check kept only as a much wider abuse backstop
(`ANON_IP_DAILY_CEILING`). **Do not re-open this as a P0 — verify it live (curl from a clean
network) before spending more engineering time on it; the code fix is real and merged.**

### What is still open at this wall: the message the visitor actually sees
The backend deliberately builds an escape hatch — `upgrade_url: "/stripe/plans"` in the
`LIMIT_REACHED` payload (`routes.py:811-817`). **The homepage widget never reads it.**
`src/components/tools/free-checker.tsx:106-109` renders exactly one line of grey text — *"Free
checks used up for today. Sign in to continue."* — no button, no link, `upgrade_url` typed in
`src/types/index.ts:214` and referenced nowhere else in the frontend (repo-wide grep). Confirmed
independently in `FUNNEL-WALK.md:130-138`. **The Chrome extension does this correctly** —
`content.js:355`, a real `/login` link — which is the proof this is a one-file omission, not a
missing capability.

---

## 3. NEW — the logged-in dashboard's own paywall moment is silently broken (neither prior audit checked this surface)

`FUNNEL-WALK.md` traced the homepage widget (`free-checker.tsx`) and the extension (`content.js`).
Neither traced the in-app tool a signed-up, post-trial free user actually uses:
`resale-iq/src/app/(dashboard)/verdict/page.tsx`. This page hits the **same** `FREE_VERDICT_DAILY_LIMIT`
gate (`api/routes.py:750-753`, `claim_verdict_quota` on `current_user`) — so a real signed-up
customer who exhausts their post-trial 10/day *will* get a `LIMIT_REACHED` response here too.

**What the code does with it:**
```ts
// src/app/(dashboard)/verdict/page.tsx:80
const vs = result ? (VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE.UNKNOWN) : null
```
`VERDICT_STYLE` (line 14-22) has keys for `BUY`, `WATCH`, `SKIP`, `UNKNOWN`, `INSUFFICIENT_DATA`
only. `"LIMIT_REACHED"` is not one of them, so it silently falls back to the `UNKNOWN` style — label
**"NO DATA"**, grey. The render branch at line 139 (`result.verdict === "UNKNOWN" || result.verdict
=== "INSUFFICIENT_DATA"`) is the *only* place that displays `result.message` — and `"LIMIT_REACHED"`
matches neither string literal, so it falls all the way to the final `else` (line 160-209): the full
metrics grid, four `Metric` tiles, all rendering `"—"` because `buy_below`/`sell_avg`/`sold_7d` are
all `undefined` on a `LIMIT_REACHED` payload. **The server's own message — "Free tier: 10
verdicts/day. Starter or Pro for unlimited." — is computed and sent, and is never displayed
anywhere on this page.** A paying-eligible, logged-in, post-trial customer who searches once too
often today sees a card that looks exactly like "we have no data on this product," with no
indication they hit a cap, and no upgrade prompt at all — objectively worse than the homepage
widget's plain-text dead end, on the one surface actually visited by people who already created an
account.

**File:line:** `resale-iq/src/app/(dashboard)/verdict/page.tsx:14-22` (missing key),
`:80` (silent fallback), `:139-148` (message only shown for two of the four non-happy verdict
values). Backend source of the unhandled value: `demand-intel/api/routes.py:806-817`.
**Smallest fix:** add one branch — `result.verdict === "LIMIT_REACHED"` — rendering
`result.message` with a link to `/account#plans` (the same destination `Paywall` already links to),
mirroring the extension's correct handling at `content.js:355`. No backend change needed; the field
already exists.

---

## 4. PENDING rows: quota spent, nothing returned — mechanism confirmed, not just hypothesized

METRICS.md: **19 of 78** verdict rows in the last 7 days are `PENDING` — reserved, never resolved.
`FUNNEL-WALK.md` Break #2 called this "a strong hypothesis from the code, not a confirmed root
cause" because that role had no code-execution visibility into the gap between reservation and
resolution. **I traced it as a control-flow fact, not a hypothesis:**

`claim_anon_verdict_quota` (`db/queries.py:2652-2704`) `INSERT`s a `'PENDING'` row **atomically with
the quota claim itself** — the row *is* the reservation, and the function's own docstring says so
explicitly: *"A row left PENDING means the request died mid-flight — it still counts against the
cap, which is the fail-closed direction."* The row is only ever resolved by `resolve_anon_verdict()`
or `record_search_outcome()`, called from four points inside `get_verdict()`
(`api/routes.py:1061-1063`, `1078-1081`, `1200-1201`, and via `_log_search` at `840/858/866`) —
**every one of them sits between the reservation (line ~801) and the function's `finally: await
db.close()` (line 1223), with no `except` clause anywhere in that span.** I checked line-by-line
(`awk` over 663-1225): the only two `try/except` blocks in the whole handler wrap `_log_recap` and
`log_prediction` — both **downstream of** the resolve calls, and both explicitly non-fatal
telemetry, not error recovery for the verdict computation itself.

**The mechanism, stated plainly:** any uncaught exception raised between `claim_anon_verdict_quota`
and its resolution — inside `get_model_signals`, `match_verdict_signal`, `engine.sufficiency.apply`,
`get_shelf_coverage`, or any DB call in that stretch — propagates straight past every resolve point,
FastAPI's default handler returns a bare 500 with no custom body (`main.py` registers no
`exception_handler`), and the `PENDING` row is orphaned **permanently**: the quota slot is spent
(the `INSERT` already committed), the visitor gets nothing, and there is no retry, timeout, or
partial-credit path anywhere in this flow. This is not a rare edge case in the code's own design —
it is the direct, structural consequence of doing real work (signal matching, sufficiency gating,
coverage lookups) between an atomic quota debit and its resolution, with zero exception handling in
between.

**Client side compounds it exactly as `FUNNEL-WALK.md` found:** neither `free-checker.tsx:57-69`
nor `content.js:346-366` sets a fetch timeout, so the "checking…" state hangs indefinitely on a
request that never returns rather than falling back to an error state.

**Why this outranks the trial-expiry gap:** it does not merely fail to ask for money — it takes a
scarce, already-spent trial-of-the-product slot from a visitor and returns them **nothing**, on
**24% of requests** in the one week METRICS.md measured. A visitor who hits this on their first
search has no product experience to judge at all, which is upstream of every other conversion
mechanism in this file.

**File:line:** reservation `db/queries.py:2652-2704`; resolve call sites `api/routes.py:840, 858,
866, 1061-1063, 1078-1081, 1200-1201`; the unguarded span between them `api/routes.py:801-1222`
(confirmed via `awk` scan — only two `try/except` blocks in the whole function, both after the last
resolve point and both non-fatal telemetry).
**Smallest fix (two additive, independent changes — matches `FUNNEL-WALK.md`'s own recommendation,
which I now have direct evidence for rather than a hypothesis):**
1. Backend: wrap `api/routes.py:828-1222` (from immediately after the anon-quota claim to the final
   `_gate()` return) in `try/except Exception` that calls `resolve_anon_verdict(db, anon_log_id,
   "ERROR")` before re-raising or returning a clean 5xx — this alone turns every future orphaned
   `PENDING` row into a resolved, countable failure and stops silently burning quota on a crash.
2. Frontend: an 8-10s fetch timeout in `free-checker.tsx` and `content.js`, falling back to the
   error states that already exist (`paintStatus(t().down)` / "Could not check that item right
   now") — so a visitor is never left staring at a spinner with a spent quota slot and no answer.

---

## RANKED LIST

Ranked by mechanism and severity — how completely each defect can lose a visitor/customer with zero
recovery, not by the rate (n too small everywhere to support one; see the header). Each is either a
**revenue leak** (we give away or destroy value we should be charging for / relying on to convert)
or a **conversion gap** (we never ask, or the ask is invisible).

| # | Defect | Type | File:line | What the user experiences | Smallest fix |
|---|---|---|---|---|---|
| 1 | Orphaned `PENDING` rows: any exception between the atomic anon-quota debit and its resolution burns the slot and returns nothing, with no exception handling in the entire unguarded span and no client-side timeout | **Revenue leak** (destroys the trial-of-the-product itself; a spent quota slot returns zero value) | `demand-intel/db/queries.py:2652-2704`; `api/routes.py:801-1222` (unguarded span, confirmed by scan); `resale-iq/src/components/tools/free-checker.tsx:57-69`; `extension/content.js:346-366` | The "checking…" spinner hangs forever, or the request silently vanishes; one of their 10 free looks for the day is gone; no error, no retry | Wrap the verdict-computation span in `try/except` that resolves the row to `"ERROR"` before returning; add an 8-10s client timeout that falls back to the existing "could not reach" state on both surfaces |
| 2 | The logged-in dashboard's own `/verdict` tool mis-renders `LIMIT_REACHED` as "NO DATA" and never shows the server's own upgrade message | **Conversion gap** (the one paywall moment aimed at people who already made an account, and it's invisible) | `resale-iq/src/app/(dashboard)/verdict/page.tsx:14-22, 80, 139-148` | A real signed-up customer who searches once too often sees what looks exactly like "we don't track this product" — no cap notice, no upgrade link | Add a `LIMIT_REACHED` branch rendering `result.message` + a link to `/account#plans`; field already exists server-side |
| 3 | The trial ends with zero proactive signal — no email, no scheduled job, no frontend surface that isn't buried on `/account`; the only conversion moment is reactive (`Paywall`) and its personalization is conditional on `recap.buys > 0`, which a ~41% refusal rate and a partial pricing ceiling make unreliable | **Conversion gap** (we never ask until they've already walked into a locked door, and often not usefully even then) | `demand-intel/api/email.py:1-153` (no trial template exists); `main.py` (no job references `trial_ends_at`); `resale-iq/src` (zero references to `trial_ends_at`); reactive path: `src/components/layout/paywall.tsx:57` + `demand-intel/api/resale_routes.py:1517-1541` | A week of full access, then silence; they find out only by hitting a wall on some later visit, and even then often get the generic "one good flip" fallback | One new APScheduler job (same pattern as the other 20 in `main.py`) that emails users with `trial_ends_at` in the next 24-48h, reusing `send_email()`/`_html()` and `getTrialRecap`'s own headline copy so the email and the eventual paywall agree |
| 4 | The homepage's free-checker never surfaces the `upgrade_url` the backend already computes on `LIMIT_REACHED` — plain grey text, no CTA | **Conversion gap** (the wall stops but does not ask; the extension proves the fix is one component, not a missing capability) | `resale-iq/src/components/tools/free-checker.tsx:106-109`; dead field `src/types/index.ts:214`; correct reference implementation at `extension/content.js:355` | "Free checks used up for today. Sign in to continue." with nothing to click | Render `upgrade_url` (or a static `/register` link, since anon visitors have no account yet — register before Stripe, matching the free tier's actual funnel) as a real CTA, copying `content.js:355`'s pattern |
| 5 | `_set_plan()` never clears `stripe_sub_id` on cancellation, so `trial_to_paid.sql`'s own paid-definition (`stripe_sub_id IS NOT NULL`) can misclassify a cancelled customer as "converted" in a future cohort | **Metric-integrity risk, not a leak** (entitlement correctly reads `plan`, not `stripe_sub_id`; only the KPI's own honesty is at risk) | `demand-intel/api/stripe_routes.py:425-441`; `resale-iq/sql/metrics/trial_to_paid.sql` | No direct user-facing symptom; the risk is to trust in the KPI this whole file exists to explain | Clear `stripe_sub_id` (and `stripe_customer_id` is a separate, correctly-permanent identity link — do not clear that) on `plan="free"` writes in `_handle_subscription_change`, or add `AND status='active'`-equivalent to the metric's cohort definition — the latter is a founder-gated `.sql` change per METRICS.md's own rule |

**Not ranked — verified fixed, keep off future P0 lists unless a live check contradicts this:**
anonymous quota keyed on IP instead of a visitor cookie (`FUNNEL-WALK.md` Break #1 / `FUNNEL.md`
F-1) — `96f8fec` is confirmed an ancestor of `origin/main` as of this session
(`git merge-base --is-ancestor 96f8fec main` → true, `git fetch origin main` → same commit,
`a8ac5bd`, timestamp `2026-08-31T22:58:44+02:00`), and a push to `main` auto-deploys per both
repos' `CLAUDE.md`. Confirm with one live curl before spending more engineering time here.

**Not ranked — checked and correct, no action:** the plan-default-to-`'operator'` trap (registration
always writes `'free'` explicitly; every entitlement check routes through the same value); REST
API/Live Finder/Order Planner/Price Compare gating against the Pro tier (all four match the pricing
page exactly); the monthly 10-unlock budget vs. the daily 10-lookup cap (two correctly-separate
mechanisms, confirmed against `docs/audit/MONEY.md` §2a/§2c independently).

## Sources cross-checked, not duplicated
`docs/audit/MONEY.md` (entitlement/quota/webhook correctness, §0-8), `docs/audit/FUNNEL.md` (live
browser walk, F-1/F-2), `docs/audit/FUNNEL-WALK.md` (full code-derived funnel walk, Breaks #1-#5),
`docs/company/METRICS.md` (KPI definitions and the one production reading available),
`docs/company/AMENDMENTS.md` AM-3 (Business €99 cut — confirmed not re-opened by anything found
here), `docs/company/DECISIONS.md` A5 (REST API/Order Planner vs. `CLAUDE.md` — confirmed
docs-vs-reality only, not an entitlement bug).

---

## ADDENDUM — roster consult, 2026-09-01: gate `api/resale_routes.py`'s ungated `max_buy_price` reads?

Consulted by the coordinator alongside `tech-lead`/`data-scientist` on AM-7. Verified before opining
(their claim, not taken on trust): `grep -c "comparable_n\|verdict_allows_buy_below\|MIN_VERDICT"
demand-intel/api/resale_routes.py` → **0**. Confirmed directly: the watchlist query
(`resale_routes.py` ~1104, `SELECT ... ms.max_buy_price FROM model_signals ms`, no join/filter on
evidence depth) and the sourcing-link builder (`&price_to=` param built from raw `max_buy_price`)
both read the paid-tier number with no sufficiency check.

**Recommendation: gate, but "gate" should mean *relabel*, not *delete* — reuse the pattern
`/api/verdict` already ships, not a new one.** `verdict_allows_buy_below()` doesn't remove a row
from a response, it swaps the confident number for `INSUFFICIENT_DATA` with the model name, `n`,
and honest copy still attached (`engine/listing_identity.py:44-72`); `engine/sufficiency.py`'s
`WITHHELD` tuple already names `max_buy_price` for exactly this at-read-time treatment, and
`comparable_n` already exists as a real column on `model_signals` (`db/schema.py:971`). Wiring this
into Deal Finder/watchlist/brand pages is a small, additive change — not a new feature competing
with A13 for roadmap space — because the column and the pure function both already exist.

**Revenue reasoning, not principle:** at ~10 target customers with zero testimonials banked, one
customer acting on a false-confident buy-below (Levi's Trucker €4.65→€12.10 on 5 comps, still
ungated after A13) and saying so publicly costs more in acquisition than a thinner-looking board
ever could — there is no base of good stories yet to dilute a bad one against. But a **hard delete**
of 57%-of-board rows would gut Deal Finder's core pitch and could genuinely make Pro look mispriced
for what it shows; a **relabel** (keep the row, model, `n`; withhold or flag only the price) avoids
that trade entirely and reuses the extension's own four-state vocabulary
(Confident/Insufficient/Not-covered/Limited), which `FUNNEL-WALK.md` already found tests as one of
the product's strengths, not a weakness.

**Sequencing: gate with or before A13**, per data-scientist — shipping A13's corrected prices onto
still-ungated surfaces just replaces one confidently-wrong number with a different one on the same
18 models, burning trust twice instead of once. Given the fix reuses existing columns/functions, the
"gating first costs more than it protects" concern doesn't hold on cost.

**Not independently verified this session:** the "57% of board" figure — I have the 41/100-model A13
study from the consult but no production `model_signals` access to confirm the board-wide
`comparable_n < 8` share myself; flagging per this file's own rule (no number without `n`, dates, a
query) rather than repeating it as fact.
