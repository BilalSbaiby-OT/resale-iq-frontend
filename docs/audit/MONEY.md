# MONEY — Monetization + Finance-Ops Audit (Phase 1, read-only)

Written by: `monetization` + `finance-ops` departments. Date: 2026-08-31.
DB used for every SQL query below: `sqlite3 'file:/Users/bilalsbaiby/Desktop/demand-intel/demand_intel.db?mode=ro'`.

## 0. Load-bearing caveat — read this before trusting any number in §5/§6/§8

The queryable `demand_intel.db` (56 GB) contains **16 user rows total**, every one of them
a test/QA/dev account by name (`audit@demandIntel.io`, `admin@demandintel.io`,
`qa_free_gate_test@example.com`, `isoA_victim_test@example.com`, `race_verdict_test@example.com`,
`tierpowerNone@x.com`, `bilal@resaleiq.io`, …). `SELECT COUNT(*) FROM users WHERE
stripe_customer_id IS NOT NULL AND stripe_customer_id != ''` → **0**. `MAX(created_at)` across
`users` → **2026-08-20**, eleven days before this audit. `MAP.md` independently confirms the file
itself hasn't been written to since **2026-08-28 14:19** (`demand_intel.db-wal` is 0 bytes and
unchanged) and that the local scrape agent meant to feed it has failed for 11 straight days.

Conclusion: **this file is a local development/test copy, not the database serving live traffic
on resaleiq.dev.** The real production `users`/`verdict_logs`/Stripe-linked data lives on the
Hetzner box behind Coolify, which this session has no credential or channel to reach (no SSH tool,
`.env` is hook-blocked, no Stripe API tool provided). Per the evidence rule, every customer/MRR/
usage number below is reported **as measured in this file, with n and SQL**, and separately marked
**UNKNOWN (production)** where the real answer requires the live server or a Stripe read call this
session cannot make. `A6.2` (staging vs. production DB) is `DATA.md`'s question to settle
definitively; this finding is the monetization-side corroboration of the same fact.

---

## 1. The plans as coded — promised vs. enforced

Source of truth for entitlements: `demand-intel/api/auth.py` (gates), `demand-intel/api/routes.py`
+ `api/resale_routes.py` (endpoints), `demand-intel/api/stripe_routes.py` (plan metadata + price
IDs), `demand-intel/config.py` (quota constants). Source of truth for the promise:
`resale-iq/src/lib/pricing.ts` (`TIERS`, the single source the pricing page renders from).

Internal plan ids are `free` / `operator` / `power`. Customer-facing names are Free / Starter €19 /
Pro €49 / Business €99 (`planDisplayName()`, `pricing.ts:110-115`).

Price IDs referenced (names only, per the no-secrets rule):
- `STRIPE_PRO_PRICE_ID` env var → Starter €19/mo → internal plan `operator` (`config.py:10`, `stripe_routes.py:502-514`; the env name is historical and documented as misleading in a code comment)
- `STRIPE_OPERATOR_PRICE_ID` env var → Pro €49/mo → internal plan `power` (`config.py:11`, same mapping)
- **No price ID exists for Business €99 anywhere in the backend.** `grep -n business
  demand-intel/config.py demand-intel/api/stripe_routes.py` returns no plan/price hit — only
  unrelated comment text ("business's own branding", "EU business customers"). `pricing.ts:35-46`
  confirms this is deliberate: the Business tier object has no `priceId` field at all, by design
  ("Business €99 is an enquiry-only anchor... It has no Stripe price on purpose").

| Feature / promise (pricing.ts) | Free | Starter €19 | Pro €49 | Business €99 | Enforced where | Gap |
|---|---|---|---|---|---|---|
| Verdicts / buy-sell calls | 7d trial then 10/mo (login) or 10/day (anon) | Unlimited | Unlimited | "Everything in Pro" | `auth.py:503-518` `require_paid_plan`; quota in `routes.py:706-761` | None — matches promise |
| All 100 product signals unblurred | No (locked fields) | Yes | Yes | Yes | `routes.py:886-959` `_gate()` allowlist | None |
| Deal Scanner (`/api/deals`) | Redacted deals | Full | Full | Full | `resale_routes.py:824-847` `_is_paid_or_trial` | None |
| Watchlist | — | Yes | Yes | Yes | `resale_routes.py:1095-1128` — checked in-handler via `_is_paid_or_trial(current_user)`, locks `_WATCHLIST_LOCKED_FIELDS` (avg price, buy-below, opportunity score, etc.) to `null` for non-paid callers | None — correctly gated at the field level, verified by reading the handler body |
| Portfolio P&L | — | Yes | Yes | Yes | `resale_routes.py:1200-1215` `get_portfolio()` — only `Depends(get_current_user)`/`_uid(request)`; **no `_is_paid_or_trial` or plan check anywhere in the handler**, confirmed by reading the full function body | **Real enforcement gap**: any logged-in account, including a `free`-plan account past its 7-day trial, can create/read/update/delete portfolio items with full, unredacted cost/price/profit data through `GET/POST/PUT/DELETE /api/portfolio*`. Not a leak of *proprietary market data* (the numbers are the user's own purchase entries), but Portfolio P&L is sold starting at Starter €19 and is currently free-tier-accessible in full. |
| Fee calculator (`/api/calc`) | No | Yes | Yes | Yes | `routes.py:1404-1428`, explicit `plan not in ("operator","power")` → 402 | None |
| Live Deal Finder | No | No | Yes (or trial, 5 finds) | Yes | `auth.py:552-565` `require_live_finder_access` | None |
| 3-week Order Planner | No | No | Yes (or trial, 1 use) | Yes | `auth.py:568-578` `require_order_planner_access` | None |
| 26-market Price Compare | No | No | Yes | Yes | `auth.py:541-549` `require_pro_paid` — **trial does NOT pass** (doc'd explicitly) | Matches promise: pricing.ts's `ceiling` line for Starter says "No... Price Compare... that's Pro," consistent with trial-excluded |
| REST API access (own key) | No | No | Yes | Yes | `auth.py:739-740` `issue_api_key` gated on `require_power_plan` (plan===power only, **trial excluded too**) | None on the gate itself — see the CLAUDE.md contradiction below |
| Business: "Custom scope", "Priority support", "Volume & multi-seat pricing" | — | — | — | Promised on the pricing page | **Nothing built.** No seats table, no volume-pricing logic, no priority-support routing anywhere in `auth.py`/`routes.py`/`resale_routes.py`. | **Promise not enforced by design** — `pricing.ts:40-42` says so explicitly: "we promise a conversation, NOT specific unbuilt features." This is the intended shape of an enquiry-only anchor tier, not a bug, but it is a promise with literally nothing behind it if a lead is ever actually signed. |

### Contradiction the founder needs to see: `CLAUDE.md` "Hard no" vs. what's sold on Pro €49

`resale-iq/CLAUDE.md` states under **Hard no**: *"REST API · Order Planner · auto-buy · fake hit
rates · fake users · authenticity marketing · rewriting the app · new frameworks."* Yet:
- `pricing.ts:70-77` sells "REST API access (your own API key)" and "3-week demand Order Planner" as
  headline Pro €49 features.
- `stripe_routes.py:118` sells the same REST API line in `/stripe/plans`.
- `llms.txt` (`resale-iq/src/app/llms.txt/route.ts:110`) publicly states "Pro EUR 49/month: adds
  the Live Deal Finder, Order Planner, Price Compare and REST API access."
- Both features are **fully implemented and server-side gated** (`auth.py:568-578`,
  `resale_routes.py:1035-1093`, `auth.py:739-740`) — this is not a stale promise on dead code, it is
  a real, live, sold, working feature that a repo-level rule says must never exist.

This is already flagged as delegated decision **A5** in `docs/company/DECISIONS.md` ("REST API /
Order Planner sold on Pro €49 but on the Hard no list") — this audit is the evidence that closes
that delegation: **both features are real, billed, and used by the entitlement system as sold; the
contradiction is in `CLAUDE.md`, not in the product.** Recommend `CLAUDE.md`'s Hard-no list be
corrected (it is almost certainly stale from an earlier build phase), not that the features be cut —
cutting either is "cutting something a paying user uses," a founder gate per OS §0.10, and §6 below
shows there is currently no telemetry proving anyone uses them, which is the actual open question.

---

## 2. Quota enforcement

**Two separate quotas exist, and they are not equally strong.**

### 2a. The daily 10-verdict headline cap (anon + free logged-in) — `config.py:26 FREE_VERDICT_DAILY_LIMIT = 10`

- **Logged-in free accounts**: keyed on `users.id` via `claim_verdict_quota()`
  (`db/queries.py:2561-2608`), a single atomic `UPDATE ... WHERE verdict_count_today < ?` — this
  closes a real TOCTOU race the code comments document was previously exploitable ("15 requests
  dispatched in one event-loop tick... all 15 were served"). **This half is solid**: the counter is
  keyed on server-controlled identity (the JWT-verified `user.id`), not on anything the client sends.
- **Anonymous callers**: keyed on `hashlib.sha256(_client_ip(request))` via
  `claim_anon_verdict_quota()` (`db/queries.py:2611-2643`), also atomic — but the key itself is weak.
  **The code's own comment admits this** (`db/queries.py:2627-2630`): *"this cap is IP-keyed and
  therefore soft by nature: rotating egress IPs defeats it no matter how atomic the accounting is.
  It is a speed bump against casual over-use, not an entitlement boundary."*

### 2b. Concrete bypass recipe (not executed — paper analysis only, per the rules)

`_client_ip()` (`routes.py:23-41`) resolves the "real" client IP like this:
```python
xff = request.headers.get("x-forwarded-for", "")
if xff:
    first = xff.split(",")[0].strip()   # <-- takes the LEFTMOST entry
    ...
```
Standard reverse-proxy behavior (nginx's `$proxy_add_x_forwarded_for`, seen verbatim in the
project's own legacy `deploy/nginx.conf:34-51`, and Traefik/Coolify's default forwarding) is to
**append** the real connecting IP to any `X-Forwarded-For` the client already sent, so the trustworthy
value sits at the *end* of the chain, not the start. Reading `.split(",")[0]` reads the
**client-supplied, attacker-controlled** first hop instead. Recipe on paper:
1. Send `GET /api/verdict?q=...` with header `X-Forwarded-For: 1.2.3.4` (any string parseable as a
   first CSV token works — it is never validated as an IP).
2. `ip_hash = sha256("1.2.3.4")[:16]` becomes the quota bucket key.
3. Repeat with `X-Forwarded-For: 1.2.3.5`, `1.2.3.6`, ... — each request lands in a fresh, empty
   `verdict_logs` bucket, resetting the "10/day" cap to effectively unlimited.
This does not require owning multiple real IPs (classic egress rotation) — a single header on a
single connection is sufficient, if the edge in front of FastAPI passes through or appends rather
than strictly overwrites index 0. **This needs confirmation against the live Coolify/Traefik
config** (this session cannot inspect it — SSH is out of scope) before calling it a proven P0, but
the code pattern itself (`xff.split(",")[0]`, taking the first not the last hop) is the textbook
anti-pattern for exactly this bypass, and the module's own docstring on the anon quota function
already concedes IP-keying is soft. Recommend: either take the **last** entry (or better, the
address the actual TCP connection arrived on, if Coolify's proxy is configured to inject a trusted
single-hop header) or move anon quota to a bot-resistant secondary signal.

### 2c. The monthly 10-unlock budget (post-trial free, logged-in) — `config.py:35 FREE_UNLOCK_LIFETIME_BUDGET = 10`

This is the "then 10/month" half of the promise. `claim_verdict_unlock()`
(`db/queries.py:2450-2486`) is account-scoped (keyed on `users.id`, not IP), atomic (single guarded
`UPDATE`), and gates on `email_verified=1` in the same statement — **no TOCTOU window, no
client-controlled key.** This is the real entitlement boundary and it is solid.

### 2d. Is the extension trusted to self-report usage?

No. `resale-iq/extension/background.js:41` calls the exact same `GET /api/verdict` endpoint the
website uses — same JWT/API-key auth, same server-side quota gate. There is no separate
client-reported usage counter anywhere in the extension code that the backend trusts.

### 2e. Secondary, weaker bypass: multi-accounting

Account-level quota (§2c) is real per-account, but nothing stops one person creating unlimited
`free` accounts to reset it — `register_attempts_ok()` (`auth.py:252-262`) only throttles to 10
signups per 5 minutes **per IP**, not per person, and email verification (required before
`_start_trial_if_unset` fires, `auth.py:450-461`, `980-1021`) only proves a mailbox was reachable,
which disposable-email services satisfy trivially. Lower severity than §2b (it costs the attacker a
new email + a click each time, versus a single spoofed header), but it is a real, standing gap on
the account-scoped boundary that §2c otherwise gets right.

**Verdict on Constitution KPI `quota_bypass_incidents = 0/week` (OS §3):** currently **not
provably 0** — §2b is a plausible bypass pending live-edge confirmation, and §2e is a confirmed
(if weaker) one.

---

## 3. Trial logic

- **Starts**: at email verification, not at registration — `_start_trial_if_unset()`
  (`auth.py:450-461`) sets `trial_ends_at = now + 7 days`, called from `POST /auth/verify-email`
  (`auth.py:980-1021`). The `WHERE trial_ends_at IS NULL` guard makes this one-time; re-verifying
  cannot extend it.
- **Checked**: `_is_trial_active()` (`auth.py:485-500`) is a **live, real-time comparison**
  (`datetime.now(utc) < trial_ends_at`) evaluated on every gated request — it is not a stored
  boolean that something needs to flip.
- **Ends**: automatically, on the next request after `trial_ends_at` passes. No background job is
  required and none exists for this purpose — the design is self-expiring by construction. This is
  the opposite of the failure mode the brief asked me to find: **there is no code path where a
  trial can "never end,"** because nothing needs to actively end it. A missing/NULL `trial_ends_at`
  (e.g. a user who never verifies) makes `_is_trial_active` return `False` — fails closed, not open.
- **What "expiry" does**: nothing writes `users.plan` at expiry. A trialing free account's `plan`
  column stays `'free'` throughout; every paid-tier gate (`require_paid_plan`,
  `require_power_or_trial`, `require_live_finder_access`, `require_order_planner_access`) computes
  `plan == paid OR _is_trial_active()` fresh on each call. This means downgrade at expiry is
  automatic and correct by construction — the only way it could fail is if one of the paid-tier
  gates were changed to check a stored flag instead of calling `_is_trial_active()` live, which none
  currently do.
- **Trial-scoped Pro sub-budgets**: `TRIAL_LIVE_FIND_LIMIT = 5` and `TRIAL_PLANNER_LIMIT = 1`
  (`config.py:46-47`) are lifetime counters (`trial_live_used`, `trial_planner_used` columns),
  spent via the same atomic-UPDATE pattern as §2c (`claim_trial_counter`, `db/queries.py:2489-2504`)
  — no TOCTOU, no reset exploit found.

**Net assessment**: trial logic is the best-built piece of the entitlement system in this audit —
real-time expiry, fail-closed on missing data, atomic sub-budget spending. No P0 here.

---

## 4. Webhooks

`POST /stripe/webhook` (`stripe_routes.py:346-394`):
- **Signature verification**: fail-closed. If `STRIPE_WEBHOOK_SECRET` is unset, the endpoint
  refuses every event with 503 rather than trusting an unsigned body (`stripe_routes.py:358-360`).
  `stripe.Webhook.construct_event()` is called before any event data is read
  (`stripe_routes.py:362-364`); a bad signature is a 400, and nothing downstream ever sees the
  payload.
- **Idempotency**: no explicit `event.id` dedup table exists, but the handlers are **naturally
  idempotent by design** — `_set_plan()` (`stripe_routes.py:425-441`) always `UPDATE`s `plan=?`
  (assignment), never increments anything, so replaying the same event twice is harmless. The one
  place ordering matters (an "active" event delivered after a "canceled" one would otherwise
  resurrect paid access) is explicitly guarded: `event_ts` (the webhook **event's** timestamp, not
  the subscription object's, which the code comment notes is constant across an object's whole life
  and therefore useless for ordering) is compared against `users.stripe_event_ts`, and any event
  older than the last applied one is dropped (`stripe_routes.py:567-576`).
- **Handler errors never bubble to a 500**: every branch is wrapped so a failure gets logged and the
  webhook still 200s (`stripe_routes.py:378-393`) — deliberate, to avoid Stripe's infinite-retry
  storm on a transient bug, with `verify-session` (§ below) as the synchronous safety net instead.
- **`customer.subscription.deleted`**: routed to `_handle_subscription_change(data, active=False,
  ...)` (`stripe_routes.py:387-388`), which forces `plan = "free"` regardless of price id
  (`stripe_routes.py:541-542`) — correct downgrade behavior, and it still respects the ordering
  guard above.
- **Webhook-independent safety net**: `GET /stripe/verify-session` (`stripe_routes.py:228-297`)
  lets the success page verify-and-upgrade synchronously with Stripe, specifically because
  "webhooks can't reach a machine without a stable public URL" reliably — documented as the reason
  a customer who pays should never fail to get upgraded even if the webhook never arrives.
- **Checkout redirect hardening**: `_same_origin_or_default()` (`stripe_routes.py:127-156`) closes
  an open-redirect that previously let any authenticated caller mint a real Stripe checkout link
  under this merchant account redirecting to an attacker-chosen domain post-payment, carrying the
  session id with it — fixed by exact scheme+netloc comparison against `APP_URL`, not `startswith`.

No P0 found in the webhook path. This is the second best-built area in this audit.

---

## 5. The customers (from the local DB — see §0 caveat)

```sql
SELECT plan, COUNT(*) FROM users GROUP BY plan;
```
`n=16` total. `free=8, operator=4, power=4`. Date range of the underlying `users` rows:
`2026-06-24 23:12:18` to `2026-08-20 07:42:27` (`SELECT MIN(created_at), MAX(created_at) FROM
users`).

```sql
SELECT COUNT(*) FROM users WHERE stripe_customer_id IS NOT NULL AND stripe_customer_id != '';
```
→ **0**. Every `operator`/`power` row in this file was set by direct DB write or an admin
promotion path, not by a real Stripe checkout (no row carries a `stripe_customer_id`). Manually
inspecting all 16 rows (`SELECT id, email, plan, created_at, stripe_customer_id, trial_ends_at,
email_verified FROM users ORDER BY created_at`) shows every email is a QA/test pattern
(`isoA_victim_test@`, `race_verdict_test@`, `tierpowerNone@x.com`, …).

**MRR**: **UNKNOWN.** Not derivable from this file (0 Stripe-linked customers, 0 subscriptions to
sum). The real figure lives in Stripe/the production DB, neither reachable from this session (no
Stripe read tool provided, `.env` hook-blocked, no SSH). Do not estimate it — flag it in Founder
Gate #1 as a number the founder should pull directly from the Stripe dashboard.

**Weekly signups, last 8 weeks** (`SELECT strftime('%Y-W%W', created_at), COUNT(*) FROM users GROUP
BY 1 ORDER BY 1`, n=16, range 2026-06-24 to 2026-08-20):

| Week | Signups |
|---|---|
| 2026-W25 | 2 |
| 2026-W28 | 1 |
| 2026-W29 | 1 |
| 2026-W32 | 2 |
| 2026-W33 | 10 |

No rows after W33 (week of 2026-08-17). **Zero signups recorded in this file for the 11 days
immediately before this audit.** Activation and churn by week: **UNKNOWN / not meaningful** — the
`growth_metrics.py` module defines `activated` conceptually ("did the thing the product is for, at
least once") but computing it needs a real event stream this file does not have at any volume, and
`signup_attribution` has **0 rows** (`SELECT COUNT(*) FROM signup_attribution`) despite the schema
existing — attribution tracking is wired but not populated in this file.

---

## 6. Which features have a paying user? (per-feature telemetry audit)

The founder's question (A6.4) is answered feature-by-feature below. **"NOT MEASURABLE" is used,
never "0," whenever no logging path exists at all** — per the founder's own instruction in
`DECISIONS.md`, the two must not be conflated.

| Feature | Endpoint | Telemetry table? | n (paying, last 30d) | Verdict |
|---|---|---|---|---|
| Price Compare | `GET /api/compare/prices` (`resale_routes.py`... actually `routes.py:2348`) | None | — | **NOT MEASURABLE.** Handler does a live scrape and returns; no INSERT anywhere in the function (`routes.py:2348-2381`). Needed: an insert into a `feature_usage(user_id, feature, ts)`-shaped table on every authenticated call. |
| Order Planner | `GET /api/order-plan` | None for paid users. `trial_planner_used` exists but is trial-only, lifetime (not date-stamped) | — | **NOT MEASURABLE** for paying (`power`) users. Only trial usage is countable at all, and even that has no timestamp per use, only a lifetime counter (`resale_routes.py:1057-1067`). |
| Fee calculator | `GET /api/calc` | None | — | **NOT MEASURABLE.** `routes.py:1404-1428` computes and returns; no persistence. |
| Portfolio P&L | `GET/POST/PUT/DELETE /api/portfolio*` | `portfolio_items` (has `user_id`, `sourced_at`) | **n=1** row total, 1 distinct `user_id` (`SELECT COUNT(*), COUNT(DISTINCT user_id) FROM portfolio_items` → `1, 1`), dated `2026-08-18`. That single row's owner's plan is unverifiable from the row alone without a join — but with only 16 users total and 0 Stripe-linked, **it is not a real paying customer** in this dataset either way. | Measurable in principle (real table exists); **n=0 provably-paying** in this file. |
| Manual | static content, `/manual` pages | `pageviews` (path + `visitor_hash` only — **no `user_id` column**) | — | **NOT MEASURABLE per-account.** `pageviews` schema (`db/schema.py`) deliberately has no user linkage ("visitor_hash — salted daily hash, not an identity"), so a page-view can never be tied to a paying account by design, only to anonymous traffic volume. Needed: a join key from an authenticated session to a pageview event, which does not exist. |
| Blog | `/blog/*` pages | same `pageviews` table, same gap | — | **NOT MEASURABLE per-account**, same reason as Manual. |
| REST API | `X-Api-Key` auth, key issued at `POST /auth/api-key` (`auth.py:739-740`, gated `power`-only) | None | — | **NOT MEASURABLE.** No request log keyed on API key exists anywhere (checked the full table list — no `api_requests`/`usage_log`/similar). Needed: an insert of `(api_key_hash, endpoint, ts)` on every `X-Api-Key`-authenticated request. |
| Watchlist | `GET/POST/DELETE /api/watchlist` | `watchlist_items` (has `user_id`, `created_at`) | `SELECT COUNT(*), COUNT(DISTINCT user_id) FROM watchlist_items` → **6 rows, 3 distinct users**, range `2026-07-03` to `2026-08-18`. | Measurable in principle; **n=0 provably-paying** (same reasoning as Portfolio — 0 rows in `users` carry a `stripe_customer_id`). |
| Deal Scanner | `GET /api/deals` | None | — | **NOT MEASURABLE.** `resale_routes.py:824-847` reads and redacts/returns; no INSERT. |
| Deal Finder (Live) | `GET /api/live-deals` | None for `power` users. `trial_live_used` exists, trial-only, lifetime counter | — | **NOT MEASURABLE** for paying users, same shape as Order Planner. |
| Live search (headline verdict) | `GET /api/verdict` | `verdict_logs` — **but `user_id` column does not exist in this DB file** (`PRAGMA table_info(verdict_logs)` shows only `id, ip_hash, query, verdict, created_at`; the code at `db/queries.py:2670-2686` inserts into `user_id, q_norm, est_profit, said_buy_below, said_sell_avg` columns that `db/schema.py`'s migration list defines but this file was never migrated to include) | `SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM verdict_logs` → **n=26**, range `2026-06-25` to `2026-08-19`. All 26 rows are necessarily anon/free (`ip_hash`-keyed) since the paid path (`is_free = not is_paid`) never claims quota and the per-user log write (`log_user_verdict`) targets columns that don't exist on this table in this file — meaning **every attempted per-user verdict log call on this file would have raised an exception**, silently swallowed by the `try/except` at `routes.py:865-869` ("best-effort, never blocks"). | **NOT MEASURABLE for paying users in this file** — even the code path meant to measure it is broken against this specific database's actual schema. This is itself a finding: either this file predates a schema migration that shipped to prod, or the migration silently failed to apply — either way, per-user verdict telemetry as written cannot currently produce data on this file. |

**Bottom line for the CUT list**: of the eight features named in OS §11 Q4 (Price Compare, Order
Planner, fee calculator, portfolio P&L, manual, blog, API, plus Watchlist/Deal Scanner/Deal
Finder/Live search added by the founder's question) — **zero have telemetry proving a paying
account used them in the last 30 days, in this file.** Six of eleven have **no logging mechanism at
all** (Price Compare, fee calc, manual, blog, REST API, Deal Scanner, Deal Finder, Order Planner —
that's eight, not six; correcting: Portfolio, Watchlist and Live-search have *some* persistence,
the other eight have none). This is not evidence the features are unused — it is evidence **the
question is currently unanswerable from telemetry, on any account, paying or not**, which is a
distinct and arguably more urgent finding than any individual feature's usage number.

---

## 7. Business €99 — removal surface (mapping only, nothing removed)

**Founder decision already on record** (`docs/company/AMENDMENTS.md` AM-3, `DECISIONS.md` A6.6,
2026-08-31): the tier is cut, contingent on no customer currently being on it. This section
supplies that evidence and the exact removal surface.

### Is any customer currently on Business €99?

```sql
SELECT DISTINCT plan FROM users;
```
→ `operator`, `power`, `free`. **The value `business` has never been written to `users.plan` in
this file — n=0, and it structurally cannot exist as a live subscription anywhere**, because (§1)
no Stripe price id is configured for it at all: `stripe_routes.py`'s `price_to_plan()`
(`stripe_routes.py:497-516`) only maps two price env vars (`STRIPE_PRO_PRICE_ID` →`operator`,
`STRIPE_OPERATOR_PRICE_ID`→`power`) and returns `None` — explicitly fail-closed, "leave the user's
plan unchanged" — for anything else. **There is no code path by which a Stripe checkout could ever
set a user's plan to `business`.** Combined with §0's caveat (this file may not be the live DB),
the honest statement is: **n=0 in every place this audit can check, and the system has no
mechanism to create a paying Business customer even in principle** — the pre-condition in AM-3 is
satisfied as far as this audit can determine; the founder may still want the production DB checked
directly before pulling the trigger, per §0.

### Every file/surface that mentions Business €99

| Surface | File | What to remove |
|---|---|---|
| Pricing data | `resale-iq/src/lib/pricing.ts:32-46` | The entire `{id: "business", ...}` object in the `TIERS` array |
| Pricing page render | `resale-iq/src/components/landing/pricing-section.tsx` | Renders whatever `TIERS` contains — no separate Business-specific markup found beyond the shared `t.anchor` branch (`pricing-section.tsx:87`) and the mailto enquiry handler (`pricing-section.tsx:27`, `mailto:support@resaleiq.dev?subject=Resale%20IQ%20Business%20plan%20enquiry`) |
| Paywall component | `resale-iq/src/components/layout/paywall.tsx:61` | Same mailto enquiry fallback (`if (!placeholder) { window.location.href = "mailto:...Business%20plan%20enquiry" }`) — this fires whenever `resolvePriceId()` returns undefined, i.e. specifically for the anchor tier |
| Backend plan metadata | `demand-intel/api/stripe_routes.py` `get_plans()` (`:79-122`) | Nothing to remove here — Business was never added to the `plans` array returned by `/stripe/plans` in the first place. Confirms the tier is frontend-copy-only. |
| llms.txt (public, LLM-readable) | `resale-iq/src/app/llms.txt/route.ts:111` | Line `"- Business EUR 99/month: enquiry only, scoped case by case."` |
| JSON-LD structured data | `resale-iq/src/app/layout.tsx:87-91` | **No Business-specific entry found.** The only "business" hit is `applicationCategory: "BusinessApplication"`, an unrelated schema.org taxonomy value — false positive, nothing to change here. |
| Sitemap | `resale-iq/src/app/sitemap.ts` | **No Business/pricing-specific entries found** (`grep -in "business\|pricing\|99"` returned nothing) — pricing lives on a single page, not a separate route, so there is no sitemap URL to remove. |
| Stripe objects | Stripe dashboard | **Nothing to remove** — no product/price was ever created for it (§1). |
| Other copy mentions ("business" as a generic word, not the tier) | `manual.ts` (6), `manual-2.ts` (12), `blog-posts*.ts` (14 combined), `tools/[slug]/page.tsx` (1), `methodology/page.tsx` (1), `support/page.tsx` (1), `legal/page.tsx` (1) | **Needs a human/LLM read-through, not a blind strip** — these are overwhelmingly generic uses of the word "business" (e.g. "reselling business," "your business") in manual/blog content, not references to the €99 tier. Flagging the files so Phase 2's removal PR checks them, not asserting they need edits. |

**Removal is a small, contained, one-PR change**: one array entry in `pricing.ts`, one mailto
fallback becomes dead code in two files (harmless to leave or trivial to remove), one line in
`llms.txt`. No Stripe object, no JSON-LD, no sitemap entry, no backend plan-metadata entry exists
for it — the tier really is exactly as advertised in its own code comment: "no Stripe price on
purpose."

---

## 8. Unit economics

| Cost | Value | Source | Confidence |
|---|---|---|---|
| VPS (Hetzner CX22, 2 CPU/4GB/40GB) | ~€5/mo | `demand-intel/LAUNCH-STEPS.md:31`, `MASTER-CHECKLIST.md:57`, `COOLIFY-DEPLOY.md:28` (consistent across 3 docs) | Stated, not verified against an actual Hetzner invoice |
| Backups (Backblaze B2) | ~€1/mo | `LAUNCH-STEPS.md:33`, `PRE-LAUNCH-CHECKLIST.md:72` | Same — stated, not verified |
| Domain | Not found priced anywhere in the repo | — | **UNKNOWN** — no domain-registrar cost figure in any doc |
| Coolify itself | €0 (self-hosted, open-source, runs on the same VPS) | `COOLIFY-DEPLOY.md:32` (`curl ... install.sh`) | Free by design, no separate line item |
| Claude/Anthropic spend | **UNKNOWN** | No spend ledger file exists anywhere in either repo (`find ... -iname "*spend*" -o -iname "*ledger*"` → nothing under `resale-iq`). `AMENDMENTS.md` AM-2 defines the €200/mo cap and its 80%/100% behavior but nothing in this audit's reach currently *measures* actual spend against it. | Missing input: a token-cost export from the Anthropic Console/Claude Code billing, which this session has no tool to pull |
| **Total known infra** | **~€6/mo** (Hetzner + Backblaze only) | sum of above | Against the **€200/month all-in cap** (AM-2), known infra alone is ~3% of budget — the cap is overwhelmingly a Claude-spend cap in practice, and that half is exactly the half with no ledger. |
| Scrape cost per trusted check | **UNKNOWN** | Would need: (a) a per-check attribution of scraper compute/bandwidth, (b) the North Star metric `weekly_trusted_checks` actually computed (OS §3) — neither exists as a running number in the files this audit can reach. | Missing inputs named |

**Gross margin per plan**: **UNKNOWN** — with MRR unknown (§5) and Claude spend unknown, no
per-plan margin can be computed without guessing, which the evidence rule forbids.

**Spend-cap status**: infra (~€6/mo) is nowhere near the €160 red line. The real risk to the €200
cap is Claude/model spend, which this audit cannot quantify — recommend `finance-ops`'s first
standing-cadence task be building the ledger AM-2 already promises a red panel for, since right now
the "red at €160" behavior has no data feeding it.

---

## TOP FINDINGS

| # | Finding | Evidence | Severity | Money at risk |
|---|---|---|---|---|
| 1 | Queryable DB is a local dev/test copy (16 test accounts, 0 Stripe-linked, idle 11 days) — real customer/MRR data is not reachable from this session | `SELECT COUNT(*) FROM users WHERE stripe_customer_id...` → 0; `MAX(created_at)` → 2026-08-20; corroborated independently by `MAP.md` (file untouched since 2026-08-28, local scraper failing 11 days) | **P0** | Every §5/§6/§8 number is provisional until the production DB or a Stripe read is available — the founder is currently flying blind on MRR with no local instrument that can see it |
| 2 | Anonymous 10/day quota keys on a client-controllable `X-Forwarded-For` first-hop, not the trusted last hop; the code's own comment already calls the IP-key "soft... not an entitlement boundary" | `routes.py:23-41` (`xff.split(",")[0]`); `db/queries.py:2627-2630` (self-documented as soft) | **P1** | Bounds the free "numbered view" teaser, not the paid product — no direct revenue leak, but undermines the free-tier funnel numbers and the honesty of "10/day" as a promise |
| 3 | Zero telemetry exists for 8 of 11 named features (Price Compare, fee calc, Order Planner, Deal Finder, Deal Scanner, REST API, manual, blog); per-user verdict logging (`log_user_verdict`) targets columns absent from this DB file and silently fails | `resale_routes.py`/`routes.py` handlers, no INSERT found; `PRAGMA table_info(verdict_logs)` vs `db/schema.py` migration list mismatch | **P0** | The CUT decision the founder explicitly asked for (A6.4) cannot be made on evidence today — building the measurement is a prerequisite to any Business/feature-cutting decision, not optional |
| 4 | `resale-iq/CLAUDE.md` "Hard no" list bans REST API and Order Planner; both are fully built, sold on Pro €49, and server-side entitlement-enforced | `CLAUDE.md` Hard-no line; `auth.py:568-578`, `739-740`; `pricing.ts:70-77` | **P1** | Not a money risk directly — a governance-document risk: an agent following `CLAUDE.md` literally could try to remove live, paid, working features |
| 5 | Business €99 has zero customers and zero Stripe surface — removal is cleared on the evidence available, pending the founder's own production-DB check per §0 | `SELECT DISTINCT plan FROM users` (no `business` value); `price_to_plan()` fail-closed with no third mapping | **P2** | None currently — confirms AM-3's pre-condition is met, no revenue at stake in the cut itself |
| 6 | No Claude/Anthropic spend ledger exists anywhere in the repo, despite AM-2's €200/mo cap having defined red-line behavior at 80%/100% | `find` for spend/ledger files → none; AM-2 text in `AMENDMENTS.md` | **P1** | The cap the founder explicitly set has no instrument watching it — spend could cross €200 with no automated signal |
| 7 | `/api/portfolio*` has no plan check at all (verified by reading the full handler) — any free, post-trial account gets full Portfolio P&L, a Starter €19+ feature. Watchlist, by contrast, is correctly field-gated. | `resale_routes.py:1200-1215` `get_portfolio()` vs `resale_routes.py:1095-1128` `get_watchlist()` (has `_is_paid_or_trial` + locked fields) | **P1** | Low direct revenue risk (data is the user's own, not proprietary market intel), but it is a real promise/enforcement mismatch on a named paid feature — straightforward one-line fix (add the same `_is_paid_or_trial` gate Watchlist already uses) |
