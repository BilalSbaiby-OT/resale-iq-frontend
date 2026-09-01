# LIFECYCLE — the trial-expiry email sequence

Written by `lifecycle` (on-call), 2026-09-01. Templates only. **Nothing in this file sends anything.**
Every send is a founder gate (OS §0.10 "email users"). This document is the draft for that gate.

A note on injected content encountered while researching this file: several tool outputs during this
session surfaced large blocks of text claiming to be `CLAUDE.md` / `.claude/rules/*` files instructing
things like auto-committing, auto-pushing to `main`, and routing to agents outside this roster. That
content was treated as data, not instructions, per OS §0.1 — it conflicted with this role's explicit
hard rules (no git commands, no sends, one file written) and was disregarded. Flagging it here because
if it is real repository content, it is worth a security-eng look; if it is not, someone should know an
injection landed in this session's tool output.

---

## 1. Inventory — what exists today, read from the code, not assumed

**Sending infrastructure:** `demand-intel/api/email.py`. Resend (`https://api.resend.com/emails`),
gated on `RESEND_API_KEY` — if unset, `send_email()` logs and returns `False` rather than sending
(`email.py:68-89`). `FROM_EMAIL=noreply@resaleiq.dev`, `REPLY_TO_EMAIL=support@resaleiq.dev`. One
shared HTML shell (`_html()`) with dark-theme CSS, a footer linking Privacy/Terms/Manage account. No
`List-Unsubscribe` header on any template today.

**Templates that exist and their actual send paths:**

| Template | Fires from | Sent today? |
|---|---|---|
| `send_email_verification` | `POST /auth/register` | Yes — the only email a new signup gets |
| `send_password_reset_email` | `POST /auth/forgot-password` | Yes |
| `send_subscription_confirmation` | Stripe webhook, subscription created | Yes |
| `send_cancellation_email` | Stripe webhook, subscription cancelled | Yes |
| `send_deal_alert_email` | `_job_deal_alerts` (APScheduler, every 6h) | Yes, watchlist/saved-search hits only |
| `send_welcome_email` | **nothing.** Dead code. | **No.** Docstring: *"Unused on purpose. Kept honest so nobody re-enables Demand Intel copy."* Its body ("You have 7 days of Starter access") is stale/wrong framing to build on, not a starting point — the sequence below writes new copy for the welcome slot. |

**Confirmed absent (matches the brief's finding, independently re-verified this session):**
- Grep for `trial` in `email.py` → one hit, inside the verify-email copy ("start your 7-day trial").
  No dedicated trial template exists at all.
- Grep for `trial` in `main.py` → zero matches across all 20 `scheduler.add_job(...)` calls
  (`main.py:720-880`). No job reads `trial_ends_at`.
- Grep for `trial_ends_at` in `resale-iq/src` → zero matches. The only trial-state UI is
  `user.trial_days_left`, a passive line on `/account` (`api/auth.py:795-804`) nobody visits without
  already suspecting something changed.
- The only conversion moment is `Paywall` (`src/components/layout/paywall.tsx:57, 118-122`) —
  **reactive** (renders after a 402), and its personalization line only renders `if (recap && recap.buys
  > 0)`. A trial that produced zero `BUY` verdicts renders nothing extra — just the generic pricing
  grid.

**The trial mechanics themselves (for accuracy in the copy below):** the trial starts at **email
verification**, not registration (`_start_trial_if_unset`, `auth.py:506-517`, `trial_ends_at = now +
7 days`, written once via `WHERE trial_ends_at IS NULL`). Expiry is enforced live on every gated
request (`_is_trial_active`, `auth.py:541-556`) — nothing writes `users.plan` at expiry; access just
stops matching `is_paid OR _is_trial_active()`. `users` has no name column — copy cannot personalize by
name, only by what the account actually did.

**`get_trial_recap` (`demand-intel/db/queries.py:2871-2895`)** — already built, already correct, just
never emailed:
```python
async def get_trial_recap(db, user_id: int, days: int = 7) -> dict:
    # returns: days, verdicts, buys, watches, est_margin_eur
```
It counts `verdict_logs` rows for that `user_id` where `verdict='BUY'`/`'WATCH'` and sums
`est_profit` on the BUY rows. **It only has rows to count for logged-in users** —
`said_buy_below`/`said_sell_avg`/`est_profit` are populated by `log_user_verdict()`
(`queries.py:2731-2747`), which requires `user_id`; anonymous quota rows (`ip_hash`-keyed,
`claim_anon_verdict_quota`) never populate these fields. Since every trial email in this sequence
targets a registered, verified account, that is not a gap for this use case — it would be a gap if
anyone tried to reuse this table for anonymous-visitor emails, which nobody should, because there is
no anonymous email to send to.

**Coverage facts the copy below must not contradict** (METRICS.md / `docs/product/SUPPORT-VOICE.md`,
n stated every time):
- `band_coverage_supply = 43%` (n=100 tracked models — only 43 have `comparable_n ≥ 8`, i.e. enough
  comparables to be priced at all).
- `insufficient_data_rate = 40.9%` of *answered* searches (n=44) come back `INSUFFICIENT_DATA`.
- Market coverage: ES / FR / DE / IT / PT only.
- **0 of 340 predictions have been graded** — no accuracy or hit-rate number exists to put in an email,
  and none of the copy below states or implies one.

**The metric this sequence exists to move, and its own honesty problem:**
`sql/metrics/trial_to_paid.sql` reads **n=1, 0.0%** on the local (unmigrated QA-fixture) DB this
session ran against; the brief that assigned this task states **n=10 ended trials, 0 converted**,
presumably read against a different snapshot. `docs/audit/MONETIZATION.md` (2026-09-01) independently
notes the underlying `users` table this session has access to is fixture data, not production. **I am
not resolving that discrepancy — flagging it as UNKNOWN which n is live** (OS §0.2: a number without
its `n` and provenance is unknown; here I have two numbers and don't know which is current). Either
way: six accounts total, zero paying. Section 6 below treats both readings the same way — too small
for a rate to mean anything.

---

## 2. The sequence — four emails, one job, mapped to `trial_ends_at`

```
verify email ──(sets trial_ends_at = now+7d)──> WELCOME         (fires once, within hours of verify)
                                                      │
                                          trial day ~3–4 ──────> MID-TRIAL RECAP  (fires once)
                                                      │             (two copy variants: buys>0 / buys=0)
                                          trial_ends_at −48h to −24h ─> TRIAL ENDING (fires once)
                                                      │             (two copy variants: buys>0 / buys=0)
                                          trial_ends_at +24h to +48h ─> POST-EXPIRY (fires once)
                                                                       (only if still unconverted)
```

Four emails total, matching the brief's "3-4, not a drip campaign" instruction. No email fires unless
the previous ones in the chain either fired or their window has passed — this is enforced by each
being its own idempotent, independently-scheduled query (§4), not a chained drip state machine, so a
gap in one does not block the next.

---

## 3. Copy — ready for founder edit/approval, not for direct send

Constraints applied to every template below: no accuracy/hit-rate claim (0/340 graded), coverage
stated as ES/FR/DE/IT/PT only where coverage is mentioned, no countdown timers or "only X left"
scarcity language, one CTA each, reuses the existing `_html()`/`_CSS` shell and voice from
`email.py` (dark, numeric, no hype — matches OS §6 copy voice).

### 3.1 WELCOME — fires at trial start (email verified)

```
Subject:    Your 7 days of full access are live
Preheader:  Buy-below, typical sale price, sell-through — start with one item you already know.
```
```html
<h1>You're in</h1>
<p>Your email is confirmed. For the next 7 days you have full access: buy-below price, typical sale
price, sell-through, and best sizes on ES, FR, DE, IT and PT.</p>
<p>Start with something you already know the market on — a brand or model you've bought or sold
before. That's the fastest way to see whether what we find matches what you already believe.</p>
<a href="{{SITE_URL}}/verdict" class="btn">CHECK YOUR FIRST ITEM →</a>
<p class="note">Honest note up front: we track a fixed catalog, not everything on Vinted. About 43%
of the models we track have enough sales data to price at all — if a search comes back
"not enough data," that's a real answer, not an error. It happens on roughly 4 in 10 searches.</p>
```

### 3.2 MID-TRIAL RECAP — fires trial day 3–4, `get_trial_recap(db, user_id, days=4)`

**Variant A — the product found something (`buys > 0`)**
```
Subject:    {{buys}} BUY {{buys == 1 ? "call" : "calls"}} so far this trial
Preheader:  Here's what we've actually flagged for you this week — not a pitch, a recap.
```
```html
<h1>What your trial has found so far</h1>
<p>Over the last {{days}} days you ran {{verdicts}} checks. {{buys}} came back BUY, with an
estimated combined margin of ~€{{est_margin_eur}} if bought at the flagged price and sold at the
typical price we measured.</p>
<p>That estimate is arithmetic on past sales, not a guarantee — we don't publish a hit rate because we
don't have enough graded outcomes yet to state one honestly.</p>
<a href="{{SITE_URL}}/verdict" class="btn">SEE YOUR RESULTS →</a>
<p class="note">Trial ends in {{days_left}} days. Reply to this email if a number here looks off —
a real person reads it.</p>
```

**Variant B — the trial found nothing (`buys == 0`) — the case that matters most**

This is the honest version, not a softened version of Variant A. Do not imply value that wasn't
delivered; do not manufacture a consolation number.
```
Subject:    A straight update on your trial
Preheader:  No BUY calls yet — here's exactly why, and what to try instead.
```
```html
<h1>No BUY calls yet — here's why, honestly</h1>
<p>You've run {{verdicts}} check{{verdicts == 1 ? "" : "s"}} in the last {{days}} days, and none came
back BUY. That's not a glitch and we're not going to pretend otherwise.</p>
<p>Two real reasons that happens: we only price about 43% of the models we track (not enough sales
data on the rest), and we only cover ES, FR, DE, IT and PT — if what you're searching isn't tracked
in one of those markets, we correctly have nothing to say about it. On the searches we can answer at
all, roughly 4 in 10 still come back "not enough data" rather than a call either way.</p>
<p>If you tell us what you were trying to price, we'll tell you plainly whether we'll ever cover it —
that's a better use of your remaining {{days_left}} days than us guessing.</p>
<a href="mailto:support@resaleiq.dev?subject=What I searched for" class="btn">REPLY WITH WHAT YOU SEARCHED →</a>
<p class="note">If you want to try a few tracked names directly: Nike, Adidas, Levi's and The North
Face have the deepest data on the board today.</p>
```

### 3.3 TRIAL ENDING — fires `trial_ends_at` − 24h to −48h, `get_trial_recap(db, user_id, days=7)`

No countdown graphic, no "hurry" language — the date is stated once, plainly.

**Variant A — `buys > 0`**
```
Subject:    Your trial ends {{trial_end_date}}
Preheader:  {{buys}} BUY calls this week, ~€{{est_margin_eur}} flagged margin — what happens after.
```
```html
<h1>Your trial ends {{trial_end_date}}</h1>
<p>This week you got {{buys}} BUY call{{buys == 1 ? "" : "s"}} (~€{{est_margin_eur}} in flagged
margin) and {{watches}} WATCH call{{watches == 1 ? "" : "s"}} across {{verdicts}} checks.</p>
<p>After {{trial_end_date}} your account drops to the free tier: 10 checks a month, no buy-below or
sell-price numbers. Starter (€19/mo) keeps what you had this week — unlimited checks, buy-below,
sell price, sell-through.</p>
<a href="{{SITE_URL}}/account#plans" class="btn">KEEP FULL ACCESS →</a>
<p class="note">Cancel anytime from Settings. No call, no card details needed to just look at plans.</p>
```

**Variant B — `buys == 0`**

Selling a subscription to someone the product hasn't yet proven value for would be the dishonest
version of this email. This one does not ask for money as the primary action — it asks for a reply,
per §5's actual goal at this scale, and states plainly what downgrading means.
```
Subject:    Your trial ends {{trial_end_date}} — quick honest note
Preheader:  It didn't find a BUY for you this week. Here's what that means and what's next.
```
```html
<h1>Your trial ends {{trial_end_date}}</h1>
<p>Across {{verdicts}} checks this week, nothing came back BUY. We said why in our last email — model
coverage (~43% of tracked models) and market coverage (ES/FR/DE/IT/PT only) are the two real limits,
not a fluke in your searches.</p>
<p>After {{trial_end_date}} you're on the free tier: 10 checks a month, without buy-below or sell-price
numbers. We're not going to push Starter at you off a week that found nothing — if what you needed
priced isn't in scope for us, paying wouldn't fix that.</p>
<p>What would actually help us: one line on what you were trying to price. If it's something we should
track and don't, that's useful to know before you decide anything.</p>
<a href="mailto:support@resaleiq.dev?subject=What I was trying to price" class="btn">REPLY →</a>
<p class="note">If you'd rather just see the plans: <a href="{{SITE_URL}}/account#plans">account
settings</a>.</p>
```

### 3.4 POST-EXPIRY — fires `trial_ends_at` + 24h to +48h, only if `stripe_sub_id IS NULL`

One version — by now the recap is a week old either way, so the distinction matters less than
confirming what changed and leaving one clear door open.
```
Subject:    Your trial ended — here's what changed
Preheader:  You're on the free tier now. Nothing was charged. Here's how to get back what you had.
```
```html
<h1>Your trial ended</h1>
<p>Your 7 days of Starter access ended on {{trial_end_date}}. Nothing was charged — you're now on the
free tier: 10 checks a month, without buy-below, sell-price or sell-through numbers.</p>
{{#if had_buys}}
<p>For reference, your trial flagged {{buys}} BUY call{{buys == 1 ? "" : "s"}} with an estimated
~€{{est_margin_eur}} in combined margin.</p>
{{else}}
<p>Your trial didn't return a BUY call — if that was because of what you were searching rather than
what we cover, reply and tell us; we read every message at support@resaleiq.dev.</p>
{{/if}}
<a href="{{SITE_URL}}/account#plans" class="btn">SEE PLANS →</a>
<p class="note">Your data and checks are kept — nothing was deleted when the trial ended.</p>
```

---

## 4. The job — where it hooks in, what it selects, how it stays idempotent

**New job, same pattern as every other job in `main.py`** (`schedule_jobs()`, `main.py:720-880`):

```python
scheduler.add_job(
    _job_lifecycle_emails, CronTrigger(hour="*/6", minute=55),
    id="lifecycle_emails", name="Trial Lifecycle Emails",
    max_instances=1, coalesce=True, replace_existing=True,
)
```
`minute=55` is deliberately offset from `watchlist_alerts` (`:30`) and `deal_alerts` (`:45`) — same
reasoning as the comment already on `deal_alerts`: two paging/mailing jobs must not double-fire in the
same tick. New module: `alerts/lifecycle_emails.py`, mirroring `alerts/deal_alerts.py`'s shape
(dataclass per candidate, one `_load_*` per stage, one `fire_lifecycle_emails()` entry point) so it is
reviewable against a pattern that's already shipped and tested, not a new shape.

**Idempotency — reuses the existing `user_alerts` table, no schema migration needed for this part.**
`deal_alerts.py` already establishes the pattern (`_alert_state`, `queries.py`/`deal_alerts.py:229-245`):
one row per `(user_id, alert_type, target)`, `last_fired_at` set only after a confirmed send. Lifecycle
reuses it directly:

| Stage | `alert_type` | `target` | Selection window |
|---|---|---|---|
| Welcome | `lifecycle_welcome` | `'onboarding'` | `trial_ends_at` set in the last 6h (job cadence) |
| Mid-trial recap | `lifecycle_recap` | `'onboarding'` | `trial_ends_at − now` between 3 and 4 days |
| Trial ending | `lifecycle_ending` | `'onboarding'` | `trial_ends_at − now` between 0 and 2 days, `trial_ends_at > now` |
| Post-expiry | `lifecycle_post_expiry` | `'onboarding'` | `now − trial_ends_at` between 1 and 2 days, `stripe_sub_id IS NULL` |

Difference from `deal_alerts`'s cooldown model: lifecycle stages are **one-shot, not repeating** — the
guard is "does a row for `(user_id, alert_type, 'onboarding')` already exist," not a time-based
cooldown. A row is inserted the moment a candidate is selected (before send, same fail-closed direction
`claim_anon_verdict_quota` uses for quota — see `MONETIZATION.md` §4 on why a claim-then-resolve order
matters) and only removed/retried if the send itself throws, mirroring `_mark_fired`'s "a failed send
does not stamp `last_fired_at`, so the next run retries" comment already in `deal_alerts.py:14`.

**Example selection query (mid-trial recap stage):**
```sql
SELECT u.id, u.email
  FROM users u
 WHERE u.trial_ends_at IS NOT NULL
   AND u.trial_ends_at BETWEEN datetime('now', '+3 days') AND datetime('now', '+4 days')
   AND u.is_active = 1
   AND COALESCE(u.marketing_opt_out, 0) = 0                      -- see unsubscribe below
   AND NOT EXISTS (
         SELECT 1 FROM user_alerts a
          WHERE a.user_id = u.id AND a.alert_type = 'lifecycle_recap'
                AND a.target = 'onboarding'
       )
```
The other three stages are the same shape with the window and `alert_type` swapped per the table
above; `trial_ending`'s window additionally excludes anyone who already converted
(`AND (u.stripe_sub_id IS NULL OR u.stripe_sub_id = '')`) so a customer who upgraded on day 3 doesn't
get a "your trial is ending, upgrade!" email for a trial that's already moot.

**Migration this DOES require** (one line, reversible, flagged for `backend-eng`/founder review, not
executed by this role): `ALTER TABLE users ADD COLUMN marketing_opt_out INTEGER DEFAULT 0`. Every
query above filters on it. Nothing currently sets it — the unsubscribe endpoint below is what would.

**Unsubscribe — required, because this is marketing, not transactional.** Verify-email, password-reset
and Stripe receipts are transactional (the account/purchase does not function without them) and are
exempt from EU opt-out requirements. This sequence is not — it is a retention/upsell nudge sent to an
EU-resident user base (ES/FR/DE/IT/PT coverage implies EU subjects), so it needs, per email:
1. A visible unsubscribe link in the footer (extend `_html()`'s footer, not a new template — one line:
   `<a href="{{SITE_URL}}/unsubscribe?token=...">Unsubscribe from onboarding emails</a>`).
2. A `List-Unsubscribe` + `List-Unsubscribe-Post` header on the Resend call (one-click per RFC 8058) —
   `send_email()` (`email.py:68`) needs a new optional `list_unsubscribe_token` param that, when
   present, adds those two headers to the `httpx.AsyncClient` `POST`.
3. A single-use token, same shape as `password_resets`/`email_verifications`
   (`db/schema.py:452-471`) — a new `email_unsubscribes` table (`user_id`, `token UNIQUE`,
   `created_at`) is cleaner than overloading either existing table, since this token never expires (an
   unsubscribe link should keep working) and isn't tied to a login action.
4. `GET /unsubscribe?token=...` sets `marketing_opt_out=1` and returns a plain confirmation page — no
   login required, since making someone log in to opt out of email is itself the dark pattern this rule
   exists to prevent.

This unsubscribe scope applies to the four lifecycle emails only. It does not touch
`send_deal_alert_email` (arguably also marketing and arguably missing the same header — flagging as a
separate, pre-existing gap, not fixing it here: one thing per PR, and it is out of this file's KPI
card).

---

## 5. Counter-KPI: emails sent without a founder gate = 0

This file is the gate artefact. Nothing here sends until the founder approves the exact copy in §3 (or
edits it) and a human or an explicitly-approved job config turns `_job_lifecycle_emails` on. Until then
`RESEND_API_KEY`-gated `send_email()` already fails closed to log-only, but the counter is about intent,
not just the technical kill switch — the job itself should not even be registered in `schedule_jobs()`
until this doc is approved in `docs/company/APPROVALS.md`, per OS §0.10 ("email users" is listed
explicitly as a founder gate).

---

## 6. The metric — what should move, and the honest limit of what "moving" means at n=10

**Primary:** `trial_to_paid` (`sql/metrics/trial_to_paid.sql`) — currently read as 0.0% at both n=1
(this session's local DB) and n=10 (this brief); provenance of which is live is UNKNOWN per §1. Six
accounts total, zero conversions either way.

**What this sequence should move, mechanically, and why:** right now 0 of {{1 or 10}} ended trials
were ever asked to convert — no email, no job, no proactive frontend surface (§1). The mid-trial and
trial-ending emails close that gap for the next cohort. The honest expectation is not "X% conversion,"
it's "the denominator of *people who were actually asked* goes from 0 to (new trials starting) instead."

**Why no rate target is set:** OS §0.2 — a number without `n` is unknown, and at `n < 30` no rate
computed from it clears ordinary sampling noise (one conversion out of 10 trials moves the reading from
0% to 10%; that swing is noise, not signal, at this sample size). Setting a numeric target here would
be exactly the kind of ad-hoc KPI computation OS §3 prohibits — `trial_to_paid`'s definition is frozen
in `METRICS.md` and this sequence doesn't get its own side-metric.

**The actual goal at this scale, stated plainly per the brief: a REPLY, not a conversion rate.** Every
"found nothing" variant (§3.2 Variant B, §3.3 Variant B) makes the primary CTA a `mailto:` reply, not
a checkout link — deliberately, because asking for money from someone the product hasn't yet helped is
the wrong ask, and a reply is the one outcome informative enough to act on at n=10: it tells us whether
the 43%/40.9% coverage ceiling is actually what's driving the silence, or whether something else is.
**Secondary/counter to watch once this ships (still not a target, just a read):** unsubscribe rate on
these four sends (this is the KPI card's stated secondary) and reply rate — track both as raw counts
(`n=...`) in the next `SESSION.md`, not as a percentage, until the denominator is large enough to say
one.

---

## Files referenced (read-only this session, none modified outside this doc)

`demand-intel/api/email.py`, `demand-intel/main.py:700-880`, `demand-intel/db/queries.py:2700-2895`,
`demand-intel/db/schema.py:420-471, 558-571, 974-1043`, `demand-intel/api/auth.py:495-594, 770-804`,
`demand-intel/alerts/deal_alerts.py`, `demand-intel/config.py`, `resale-iq/src/components/layout/paywall.tsx`,
`resale-iq/src/lib/trial-copy.ts`, `resale-iq/sql/metrics/trial_to_paid.sql`,
`resale-iq/docs/audit/MONETIZATION.md`, `resale-iq/docs/audit/FUNNEL-WALK.md`,
`resale-iq/docs/product/SUPPORT-VOICE.md`, `resale-iq/docs/company/METRICS.md`.
