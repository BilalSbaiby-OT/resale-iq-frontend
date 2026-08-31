# Production truth, read directly — 2026-08-31

Read via `ssh resaleiq` → `docker exec <backend> python3 -` with the DB opened `mode=ro`,
and the LIVE Stripe key used from inside the production container so it never left the host.
Reproduce with `docs/company/ACCESS.md`.

## Revenue — the number the whole audit was missing

| Metric | Value | Source |
|---|---|---|
| Active subscriptions | **0** | Stripe LIVE, `/v1/subscriptions?status=all` → n=1, status `canceled` |
| Customers, all time | **1** | Stripe LIVE `/v1/customers` |
| Charges, all time | **1, refunded** | Stripe LIVE `/v1/charges` |
| Gross collected, all time | **€0.00** | same |
| **MRR** | **€0** | same |
| Production users | **6** — 4 `free`, 2 `power` (the owner's own) | `SELECT plan, count(*) FROM users` |
| Users with a Stripe customer id | **0** | `SELECT count(*) … stripe_customer_id NOT NULL` |

`MONEY.md` reported MRR as UNKNOWN because it could only see the local dev copy. This is the
answer: **Resale IQ is pre-revenue.** One person ever paid, was refunded, and cancelled.

## The Stripe price catalogue is a mess

10 prices live, 8 active, including duplicate €49 and €19 pairs (`price_1U0psh…`,
`price_1U0p6W…`, `price_1U0nwZ…` all €49/month and all active) plus orphan **€79** and **€24**
prices matching no advertised tier. Only two carry a nickname. **No €99 price exists at all**,
which independently confirms `MONEY.md`: Business €99 was never purchasable.

## Production data IS fresh — the 11-day outage did not happen

| Table | Rows | Newest | Last 24h |
|---|---|---|---|
| `listings` | **12,473,981** | `sold_at` 2026-08-31 16:15:20 | 7,979 |
| `model_signals` | 100 | 2026-08-31 15:22:44 | 100 |
| `verdict_logs` | 356 | 2026-08-31 16:37:33 | 31 |
| `pageviews` | 2,256 | 2026-08-31 16:54:52 | 90 |
| `predictions` | 336 | 2026-08-31 13:58:50 | 7 |
| `signup_attribution` | **0** | — | 0 |

Production DB: **19.8 GB** (the 56 GB file on the Mac is the stale dev copy).

**So `FUNNEL.md` F-4's worst case did not occur.** The dead laptop job cost nothing measurable:
production is ingesting. What survives is unchanged and still serious — 131 consecutive failures
of a component documented as production's only Vinted source produced **no alert**, and nobody
could have said which of the two paths was carrying the product.

**And it deepens a different mystery:** `SCRAPER_PROXY` is **EMPTY** in the production container,
while `demand-intel/config.py:194` states Vinted 403s the production host on every request. Data
is arriving anyway. One of those two things is wrong, and `DATA.md` should settle which.

## Other production facts

- `ALLOWED_ORIGINS` is **EMPTY** in production — the CORS setting `SECURITY-AUDIT.md` could not
  verify. Whatever the code does with an empty value is now a real question, not a hypothetical.
- `signup_attribution` has **0 rows in production**, with 3 signups in the last 7 days. `pageviews`
  is being written (90 rows in 24h), so the migration runner does work — which means the CEO
  correction on `MARKETING-AUDIT.md` was right about the mechanism and **still leaves attribution
  producing nothing**. Open.
- Both containers run image tags matching their repo HEADs (`a81942c`, `5d4329f`) — production is
  current with `main`.

## Process note — a rule I broke

The follow-up probe included `COUNT(DISTINCT …)` over a 12.5M-row table and ran for minutes
against the live database. `AMENDMENTS.md` AM-1 says exactly not to do that. Recorded rather than
quietly dropped; the rule is now written into `docs/company/ACCESS.md` where the next session
will see it before connecting.
