# PATH TO TEN — the arithmetic, the sequence, and the honest paragraph

**Written** 2026-09-01, chief-of-staff, on the founder's KPI verbatim: *"get me first real paying 10
customers."* He sleeps; the roster acts; he reads this at 08:30. Every number below carries its `n`,
its date and its source, per OS §0.2. Where a number is an assumption rather than a measurement, it
is labelled **ASSUMPTION** in bold and nothing downstream of it is allowed to be quoted as a fact.

**The measured starting point, restated so this document stands alone:** €0 MRR · 6 accounts (2 of
them the founder's own) · 3 extension installs, ever · 1 customer ever, refunded and cancelled,
reason unknown · North Star `weekly_trusted_checks` = 0, n = 1 · 10 trials ended, 0 converted, and
**not one of those ten was ever asked to pay** — no email, no scheduled job, no proactive frontend
surface exists (`docs/audit/MONETIZATION.md` §1, `docs/product/LIFECYCLE.md` §1) · known spend
€5.83/mo of a €200 cap, Anthropic spend UNKNOWN (`docs/company/LEDGER.md`).

**One data-integrity note before anything else, because it changes how much to trust §1 below.**
`docs/product/LIFECYCLE.md` (written tonight) flags that "10 trials ended, 0 converted" and "6 accounts
total" do not obviously reconcile — the 6-account count is a live production read
(`docs/company/GTM.md` §0, 2026-08-31) and the 10-trial figure is stated in this task's own brief with
no query attached. **This is itself an open item, not resolved here**: either accounts were deleted
between the two reads, or "trials ended" counts something other than "accounts that currently exist,"
or one of the two numbers is stale. Whichever it is, it means the funnel arithmetic in §1 is built on
the smaller, cleaner, more defensible anchor (visitors → accounts, all production-read, same session)
rather than on the trial-cohort number, specifically so this reconciliation gap does not propagate into
the headline math. Reconciling it is a cheap query and belongs in `GOALS.md` next week, not tonight.

---

## 1. The arithmetic — does it close?

**Short answer: not this week, and probably not this month. Read plainly: reaching 10 paying
customers requires on the order of a few thousand real visitors net of bots and our own probe
traffic, and the company currently produces well under two hundred a month. That gap is roughly
20–35× today's rate. Nothing currently in flight closes it. Say so, because the alternative is a
plan whose first real contact with the numbers is next week's SCOREBOARD.**

### 1.1 Pick a tier — **ASSUMPTION**

Pricing is Free (€0) / Starter (€19/mo) / Pro (€49/mo) — Business €99 was cut 2026-08-31 (AM-3).
**This document targets Starter as the qualifying "paying customer."** Reason, not a default: Pro
sells Live Deal Finder, the watchlist, and Price Compare — and `tech-lead`'s review of A13
(`docs/company/APPROVALS.md`, "A13 — REQUEST CHANGES") found those four surfaces publish a buy-below
with **no `n ≥ 8` evidence floor at all** (`GAPS.md` C11). Selling Pro today means selling the exact
shape of confident, thin-evidence number that produced this company's only refund. Starter's core
surface (`/api/verdict`) does carry the gate. **If the founder wants Pro customers specifically,
the visitor number below gets larger, not smaller — Pro asks more of a prospect and C11 must close
first regardless.**

### 1.2 The conversion assumptions — **ASSUMPTION, unvalidated, stated as a range**

No valid trial→paid rate exists to measure: the one historical conversion refunded and cancelled
(n=1, not a rate), and the ten-trial cohort was never asked (§0). There is nothing to read off
production for this stage. What follows is an unsourced range, not a company measurement, and it is
the single largest source of uncertainty in this document:

- **trial → paid, once actually asked and once the funnel isn't silently eating requests: 5%–15%.**
  This is a shape borrowed from low-touch, no-sales-team self-serve SaaS trials generally — it is
  not derived from this company's data because this company has never run the experiment (the
  trial-expiry machine has never shipped). Treat the low end as the planning number and the high end
  as optimistic.
- **visitor → registered account: 2.3%–3.5%, n = 4–6.** This *is* a production read
  (`docs/company/GTM.md` §0: ~166–180 distinct human visitors, 2026-08-07→08-31, produced 6 accounts,
  2 of them the founder's own — so 4 external accounts on the low end, 6 if the founder's testing
  counted as "reachable by the same channel" on the high end). **n = 4–6 is not a rate any statistics
  textbook would accept** (the same ±14.5pp-at-n=44 argument `data-scientist` used in APPROVALS A8
  applies with even more force here) — it is the only number this company has, used because a wrong
  order-of-magnitude beats no order-of-magnitude, not because it is trustworthy.

### 1.3 Working backward

```
10 paying (Starter)
  ÷ trial→paid rate (5%–15%)                =  67 – 200 trial starts needed
  ÷ visitor→account rate (2.3%–3.5%)        =  1,914 – 8,696 real visitors needed
```

Cross-multiplying both ranges gives a full plausible band of **~1,900 to ~8,700 real visitors**,
with a central case (10% conversion, 3% signup rate) of **≈ 3,300 visitors**. **State the number
plainly, as asked: N ≈ 2,000–8,700, call it "a few thousand," central estimate ~3,000–3,500.**

### 1.4 What the company actually produces, per month, today

- **Google Search Console: 906 impressions / 28 days ≈ 900/month** (`docs/company/GTM.md` §0,
  `MARKETING-AUDIT.md` §1) — but only **6 clicks** in that window (0.66% CTR), and **71.1%** of those
  impressions are US+GB, a market the product does not serve; only **6.7%** (≈61/28d) are EU5. Organic
  search is not close to a channel at this stage — it is a rounding error with a CTR problem on top of
  a geography problem.
- **All channels combined, production `pageviews`:** ~166–180 distinct human visitors over 24 days
  (2026-08-07→08-31) ≈ **~7/day ≈ ~210/month gross** — of which **31.4%** of all pageviews are
  bot-tagged (`docs/company/GTM.md` §1.6), and a further unquantified share is the team's own testing
  (COVERAGE.md independently found at least 4 of 44 recent search-log rows were internal probes, a
  different table but the same contamination pattern). **Net real external visitors is very likely in
  the 100–150/month range** — this is an estimate, not a measurement; nobody has tagged and excluded
  probe traffic from `pageviews` yet, and that is itself a named gap (`APPROVALS.md` A8, "tag probe
  traffic").
- **The one active growth motion, `GTM.md` §5** (pre-registered, not yet founder-approved to post):
  TikTok/Spanish, 1 post/day × 14 days, **success bar = 25 distinct visitors in 14 days ≈ 54/month**
  if it fully succeeds. That is additive to the ~100–150/month baseline, not a multiplier — even a
  fully successful bet roughly doubles monthly visitors, it does not 10–20× them.

### 1.5 The gap, stated as the task asked

```
Needed:    ~2,000 – 8,700 real visitors (central ~3,300)
Have:      ~100 – 150 real visitors/month, best-case ~200/month if TikTok fully succeeds
Ratio:     roughly 15× – 35× today's realistic monthly rate, central case ~20×
```

**At today's rate, with zero improvement, reaching the low end of the range takes 12–20 months; the
central estimate takes 20–35 months.** Nothing currently in flight — the funnel fixes, the trial
machine, the landing page rebuild — increases *visitor volume*; they only improve what happens once a
visitor already arrives. The only volume lever in motion is the TikTok bet, and its own success
criterion (25/14 days) does not close the gap even if it hits every target. **The arithmetic does not
close this week, this month, or on current motions alone this quarter.** Two things move the ratio,
and neither is "work harder on the funnel fixes already queued": (a) a volume channel an order of
magnitude larger than anything currently running or planned, which does not exist on this roster
tonight, or (b) accepting a materially longer timeline and using that stated timeline, not a founder
KPI card, as the pacing instrument. Both are the founder's calls, not mine to make silently by
picking one.

---

## 2. The sequence — what happens in what order, what's already moving, what's blocked on him

**Numbered in execution order. Items 1–7 need no founder decision beyond what AM-7's roster
consultation already covers. Items 8–9 are explicitly blocked on him and are named as such rather
than quietly parked.**

| # | Step | Status tonight | Founder gate? |
|---|---|---|---|
| 1 | Anon-quota-cookie fix (first-click `LIMIT_REACHED` for a brand-new visitor) | **Merged**, `a8ac5bd`, confirmed ancestor of `origin/main` (`MONETIZATION.md` §2). Nobody has re-run the live curl since the merge — cheap, do it first. | No |
| 2 | Merge `data-defects-c6-c5-c4` (FX fail-closed, `n≥8` fail-closed, resolver reads `sold_observed`) | Coded, 1,173 tests, `tech-lead` review pending, joint with A13 | No — `GOALS.md` G-W36-02 |
| 3 | Ship the `PENDING`-row failsafe (24% of all requests silently burn a quota slot and return nothing) | Not started; scoped ≤2h | No — `GOALS.md` G-W36-03, **argued as the top lever in §3** |
| 4 | Fix the dashboard `/verdict` page's `LIMIT_REACHED` mis-render (a paying-eligible customer sees "NO DATA" instead of an upgrade prompt) | Not started; one branch, ≤1h | No — new `GOALS.md` G-W36-07 |
| 5 | Fix the homepage `free-checker.tsx` dead `upgrade_url` (anon visitor hits the wall, sees grey text, no CTA) | Not started; one component | No |
| 6 | Merge A13 (comparable-window widen: supply coverage 43%→62%) | Coded, `tech-lead` REQUEST CHANGES pending the crossing-models price-delta report (`APPROVALS.md`) | No — engineering review, already in motion |
| 7 | Resolve the C11 consultation (gate the four Pro-tier surfaces with no evidence floor) | **Live tonight per this task's brief**, roster consulting | No, if resolved by roster consensus per AM-7 — but see §5, this is a real decision with real content, not a formality |
| 8 | Build the trial-expiry email machine (code, migration, tests) to a **ready-not-sending** state, copy staged in `APPROVALS.md` | Templates drafted tonight (`LIFECYCLE.md`), zero code exists | **Building it: no. Turning it on: yes** — "email users" is explicit in `APPROVALS.md`'s founder-gate list. The roster can get this 100% ready for a single morning click; it may not flip the switch. |
| 9 | Post to TikTok (`GTM.md` §5, the only volume lever with a pre-registered plan) | Pre-registered, window 2026-09-01→09-14, **not yet founder-approved to post** — `GTM.md` §8 names "creating/naming the account, posting each clip" as founder-only actions | **Yes, explicit and not delegated.** Also gated on a cheap prerequisite the roster CAN clear tonight: walking the mobile `/check` page at 375px on real mobile data, which `GTM.md` §1.2/§5 marks UNKNOWN and untested |

**What this means concretely for tonight:** items 1, 3, 4, 5 and the mobile-`/check` walk under item 9
are pure engineering/QA, need no founder input, and are where the roster's hours should go before
sunrise. Items 2 and 6 are already moving through review. Item 7 is a real decision the roster must
reach and can reach without him (AM-7), but it is consequential enough that the reasoning should be
written down for him to see, not just the outcome. Items 8 and 9 should be **built to "ready" and
placed on his desk as one-click decisions** — that is the whole point of "he sleeps, the roster acts."

---

## 3. The single biggest lever — argued, not asserted

**The founder's candidate: the trial-expiry machine — ten people finished a trial and nobody asked
them for money.** I agree it is real, cheap (LIFECYCLE.md's copy is already written, the job pattern
already exists twenty times over in `main.py`), and the single most *legible* fact in this whole
audit — "we never asked" is a sentence a founder can act on without reading a SQL file. **I am
shipping it (§2 item 8) and I am not arguing against it.**

**But if forced to rank one item above it, I rank the `PENDING`-row failsafe (§2 item 3) higher, and
here is the argument, not just the assertion:**

1. **Reach.** `PENDING` touches **24% of all requests, every day, continuously** (n=78/7d,
   `docs/company/METRICS.md`). The trial-expiry machine touches only the people who reach expiry —
   a slice of a slice, currently ~10 people total, ever. A fix that touches one in four requests
   outranks a fix that touches one cohort's exit door, on reach alone.

2. **It corrupts the very asset the trial machine depends on.** `get_trial_recap()` — the function
   the trial-ending email's personalization is built on — counts `verdict_logs` rows with
   `verdict='BUY'`/`'WATCH'`. A request that dies mid-flight into `PENDING` **never resolves to
   either**, so it can never count, regardless of what the answer would have been
   (`db/queries.py:2871-2895`, `MONETIZATION.md` §4). Concretely: a trial user who would have gotten
   a real `BUY` call, but whose request happened to die between the quota claim and resolution, is
   invisible to their own recap. Ship the email machine onto that defect and Variant B ("no BUY
   calls yet — here's why, honestly") can fire on someone the product actually helped, which is the
   dishonest outcome the email's own copy goes out of its way to avoid manufacturing
   (`LIFECYCLE.md` §3.2). **The trial-expiry email's honesty is only as good as the data it recaps,
   and `PENDING` is currently poisoning that data on a quarter of requests.**

3. **Cost is nearly identical** — both are cheap (≤2–3h each, per the existing goal scoping) — so
   this is not "spend the hours elsewhere instead," it is "spend the first hour here, because the
   second thing's honesty depends on the first thing being fixed." Ship both tonight; if only one
   hour exists before sunrise, it goes to `PENDING`.

**Restated plainly: I agree with the founder's diagnosis and disagree only on sequencing. "Nobody
asked" is the right headline. The `PENDING` orphan is the reason the ask, once it ships, would be
built on data the product itself cannot vouch for.**

---

## 4. What to STOP, to make room

1. **Any acquisition spend or push beyond the already pre-registered TikTok bet**, until items 1, 3,
   4, 5 in §2 ship. `ROADMAP.md` §2 already establishes this (TRUE before FINDABLE) and tonight's
   arithmetic (§1) makes it sharper: sending strangers at a funnel that silently eats 24% of requests
   and never asks anyone to pay is not premature optimization, it is the exact mechanism that produced
   this company's only refund, run a second time on more people.

2. **Do not use Pro / Live Deal Finder as the ten-customer wedge until C11 closes** (§2 item 7). Four
   surfaces publishing a confident number off as few as 3 comparables, with no floor at all, is not a
   footnote — it is the same shape of defect, on the tier that costs more and promises more.

3. **Stop presenting "26-market Price Compare" as parity with the banded intelligence product** until
   the FX fix (part of §2 item 2) merges — `ROADMAP.md` §3 already found a 15,000 HUF listing
   publishing as €15,000 pre-fix. Price Compare is a paid Pro-tier feature; this is a live pricing
   defect on a surface aimed at exactly the customers this document is trying to reach.

4. **Stop treating extension installs as a growth signal this cycle.** `GTM.md` §1.1–1.2: the entire
   Chrome Web Store category tops out around 1,065 users total, the category leader has 439, and the
   extension cannot run on the device sourcing actually happens on (mobile). Hours aimed at installs
   are better spent hardening the mobile `/check` path (§2 item 9's prerequisite).

5. **Defer this week's `C8` blast-radius measurement and `n_predictions_resolved` goals** (not
   abandon — both remain real, both are in `GAPS.md`/`ROADMAP.md`). Neither moves a visitor, a trial,
   or a conversion this week; both cost hours that are better spent on §2 items 1–5. See `GOALS.md`
   §3 for the explicit supersession.

6. **Stop the Wallapop tracker** (`ROADMAP.md` §3.1) — 36 rows, dead since 2026-06-18, zero revenue
   attribution, and it is the one platform whose code path can still return `"sold"`, which is a live
   source of confusion in exactly the codepaths §2 items 2–3 touch tonight.

---

## 5. The honest paragraph

**Is "ten paying customers" the right target right now?** The evidence says: as a north star, yes;
as this week's literal instruction, its own arithmetic (§1) already rules that out, so the harder
question is what to actually ask ten real people for in the meantime. Here is the concern, and it is
not manufactured — every number in it is cited above: only **43%** of tracked models can be priced at
all today (rising to a reviewed-but-unmerged **62%**), **40.9%** of answered searches are an honest
refusal, **0 of 340** logged predictions have ever been graded so there is no accuracy track record to
stand behind a claim, and **four Pro-tier surfaces publish a buy-below with no evidence floor at all**
— the same shape of confident, thin-evidence number that produced this company's only paying
customer's refund. Charging ten strangers full price today, before C11 closes and before the trial
machine even exists to ask honestly, risks reproducing that outcome ten times instead of once, and
each of those ten would be a real person's real money and a data point the company only gets to
collect once per person. **My honest read: the ten people worth pursuing first are best framed to
themselves as early/design partners — paying, but told plainly what "43% priceable, refusal is the
honest answer four times in ten, no track record yet" means before they hand over a card — rather
than run through an unmodified, no-caveat Starter/Pro paywall.** That is not a different KPI or a
softer number; it is the same ten real dollars, earned with the honesty the product already claims as
its differentiator (`GTM.md` §3: "we will tell you when we don't know"), rather than earned by
omission. The founder can weigh this against simply wanting ten transactions however they land — both
are legitimate calls, and both are his to make, not mine to make silently by choosing the copy.

---

## 6. Pre-registered metrics, with calendar controls

Every metric below already has a `.sql` file in `sql/metrics/` except where noted. **Baseline and
check date are stated now, before any of §2's items ship, so nothing here can be moved after seeing
the result** (OS §7).

| Metric | Baseline (n, date) | Check date | Calendar control |
|---|---|---|---|
| `weekly_trusted_checks` (North Star) | 0, n=1, 2026-09-01 | Re-read weekly; no target set (n too small, per `GOALS.md` §2) | None needed — it is a raw count, not a proportion the corpus clock moves |
| `band_coverage_supply` | **43.0%, n=100, snapshot 2026-08-31 22:43:02** — **already observed to drift to 40.0% within hours of that same measurement, from corpus churn alone** (`APPROVALS.md` A13) | Re-read after A13 merges (§2 item 6); expect ~62% | **Required.** The observed-sales corpus is 11 days deep (`MIN(sold_at)`=2026-08-21); it deepens on its own until ~2026-09-20. Any reading between now and then must state the corpus age alongside the percentage, or a clock-driven rise will be scored as a HIT nobody earned. |
| `insufficient_data_rate` (renamed from a mixed union per the A8 gate's open item) | 40.9%, n=44, 2026-09-01 | Re-read 7 days after §2 items 2–3 merge | Same corpus-age control as above — the two metrics move together |
| `trial_to_paid` | 0.0%, n=1 (production) — **withheld below the n=100 floor** per the A8 gate | Do not re-score until n ≥ 30 informally, n ≥ 100 to be shown on the dashboard | Not corpus-driven; driven entirely by whether §2 item 8 ships and is switched on |
| `pending_row_failsafe_shipped` | 0 (not shipped), 2026-09-01 | 2026-09-06 (`GOALS.md` G-W36-03) | N/A — binary |
| `trial_lifecycle_job_ready` | 0 (no code exists), 2026-09-01 | 2026-09-03 (`GOALS.md` G-W36-06) | N/A — binary, and explicitly must stay OFF until the founder flips it |
| `limit_reached_dashboard_render_fixed` | 0 (broken), 2026-09-01 | 2026-09-03 (`GOALS.md` G-W36-07) | N/A — binary |
| Real (non-bot, non-probe) monthly visitors | ~100–150/month, **estimated, not measured** — probe traffic is not yet tagged (`APPROVALS.md` A8 open item) | Re-estimate once probe-tagging ships; do not quote this range as a KPI until it is | Bot rate (31.4%) and probe contamination are both independent of the corpus-age clock; flagging so nobody conflates the two calendar effects |
| Visitors needed for 10 Starter customers (§1.3) | 1,900–8,700, central ~3,300 — **derived, not measured**, built on two unvalidated rate assumptions (§1.2) | Recompute the moment either assumption gets a real `n` (first 10 real asks post-trial-machine; first 30 post-fix visitor→account reads) | The whole range should shrink toward one number as real data replaces the two assumptions — track which direction it moves, since a range that only widens means the assumptions were wrong in the optimistic direction |

**What is deliberately not on this table:** `retention_30d` (n=0, cohort starts computing on its own
~2026-09-03), extension installs (§4.4 — not a target this cycle), and Claude/Anthropic API spend
(`LEDGER.md` — blocked on the founder's console export, not on the roster). All three remain in
`GOALS.md` §2 with their own reasoning, unchanged by this document.
