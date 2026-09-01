# ROADMAP — the shortest path to one retained paying customer

**Written** 2026-09-01, `product-manager`. Answers `OS-COMPLIANCE.md`'s closing note directly:
Founder Gate #1 asks which features to CUT for lack of paying users. At €0 MRR, 6 accounts, 3
extension installs and one customer ever (refunded, cancelled), that question cuts everything and
answers nothing. I am not re-litigating that finding — it is correct and I am building on it, not
restating it. This document answers the question it replaces it with: **what is the shortest path
to one retained paying customer**, ranked and dated against the numbers already on the board.

No PRDs here, no new features. Everything below is already identified in `GAPS.md`, `DATA.md`,
`METRICS.md`, `APPROVALS.md` or `OS-COMPLIANCE.md`. This is sequencing, not invention.

---

## 1. How I ranked this — and why not RICE-Reach

RICE asks for Reach first. At n=6 accounts and a North Star reading of **1** trusted check in
7 days, Reach cannot discriminate between an item that touches 40% of interactions and one that
touches 5% — both round to "all 6 users," which is not a ranking, it's a rounding error. Confidence
has the same problem: you cannot compute variance on a sample of 1. Using RICE's Reach × Confidence
here would launder a guess as a score.

What I ranked on instead, in this order:

1. **Severity** — how far the number is from true, and how central the broken mechanism is to the
   product's core promise (`buy_below = avg_sale × 0.95 × 0.70`). A fabricated FX rate that
   multiplies a price by 400× is more severe than a copy nit, independent of how many of the 6
   accounts have seen it.
2. **Mechanism — does it unblock measurement of something else?** Several items on this list exist
   only so that *other* numbers stop being upper bounds, caveats, or UNKNOWN. Fixing `n ≥ 8`'s
   fail-open (C5) doesn't just fix one gate — it turns the North Star from "an upper bound" into an
   exact count, which is the precondition for every future decision on this document being made
   from a real number instead of an inflated one.
3. **Cost, specifically: already-built vs. not-yet-started.** Three P0 fixes (FX, the n≥8 gate, the
   resolver) and the anon-quota-cookie fix are **coded, tested, and sitting unmerged** — the cost of
   shipping them is a review, not an engineering sprint. That moves them ahead of equally severe
   items that haven't been touched yet, because Reach-blind or not, "ship what's already built"
   beats "start something new" every time hours are the scarce resource.

Effort still matters as a denominator, but it is read off the branch list, not estimated.

---

## 2. Three piles, and the order between them

**TRUE → MEASURABLE → FINDABLE. Defended below, not asserted.**

- **TRUE** — the unmerged P0s (FX, n≥8 fail-open, the resolver), the remaining fabricated-data
  readers, the quota-wall fix, the refusal copy. These make the product's existing claims match
  what the data can actually support.
- **MEASURABLE** — `METRICS.md`'s open founder gate (A8), the missing install→first-check event,
  the deploys log, the canary set. These make it possible to tell whether anything else worked.
- **FINDABLE** — SEO, the extension store listing, content, the GTM plan already written in
  `GTM.md`. These get more people to the product.

**Why TRUE first:** we have ~166–180 distinct visitors ever and 3 extension installs. That is not a
renewable resource at this stage — every visitor who hits `LIMIT_REACHED` on their first click, or
gets a silently unresolved `PENDING`, or is served a price that is 400× wrong on a paid feature, is
a visitor spent for nothing, on a product that currently answers a trusted question **40.9%** of the
time it answers at all (n=44), before counting the 19% that never get past the quota wall or the
24% that never resolve. Sending more traffic at that funnel before fixing it is not premature
optimisation — it is burning the one input we cannot buy back. Two of these fixes are already
written, tested, and waiting for review; shipping them costs a review cycle, not new engineering.

**Why MEASURABLE second, not first:** the founder-gate items in this pile (A8's three definition
decisions) cost the founder three answers, not engineering hours — they don't compete with TRUE for
the same time, and I've listed them to be actioned in parallel, immediately. But the *engineering*
items in this pile — wiring the `deploys` table, building the canary set — measure a product whose
core answer is still an "upper bound" (C5) and whose calibration resolver, until A1 below merges,
grades against 98.1%-fabricated rows. Building better instruments for numbers that are still known
to be wrong is measuring the wrong thing precisely. The one exception is the install→first-check
event (B3): it is this KPI card's own primary metric, it does not exist as an event today, and it
should be instrumented alongside the TRUE-pile funnel fixes (A3/A4) rather than waiting — you cannot
tell whether unblocking the quota wall moved activation if activation has no clock.

**Why FINDABLE last:** `GTM.md` is strategy only — nothing published, nothing posted, and posting is
a founder gate anyway (OS §0.10). There is real, usable work sitting there. But spending it now
means marketing a product where four in ten answered searches are an honest refusal and roughly a
quarter of all requests never resolve. That isn't a hypothetical risk — it already happened once:
the one customer this company has ever had refunded and cancelled. Findable work should resume once
TRUE-pile items land and the re-measured `band_coverage` / `insufficient_data_rate` are real numbers
instead of an upper bound, not before.

---

## 3. What to STOP

Evidence-specific, not general belt-tightening:

1. **Wallapop.** 36 `listings` rows, last scrape **2026-06-18**, 74 days dead at time of `DATA.md`.
   Zero revenue attribution, zero users depend on it (`GAPS.md` #17, `DATA.md` §9.1, "CUT
   candidate"). It is also the *only* platform whose tracker branch can return `"sold"` at all,
   which makes it a live source of confusion in code that otherwise correctly treats Vinted as
   unable to confirm a sale (`DATA.md` §2.2). Remove it; it earns nothing and costs review-time
   every time someone reads `engine/tracker.py`.

2. **STOP marketing "26-market Price Compare" as parity with the banded product**, until the FX fix
   (C6, already coded) merges. 21 of those 26 markets carry zero resale intelligence — no band, no
   sold history, band-eligible coverage exists only for ES/FR/DE/IT/PT — and today, pre-merge, a
   15,000 HUF listing on one of those 21 publishes as **€15,000** (`DATA.md` §9.2, finding #10). This
   is not a recommendation to remove the 26-market search; raw live price comparison across 26 sites
   is a real, working feature. It is a recommendation to stop presenting it next to intelligence
   claims it cannot back, exactly as `DATA.md` already recommended in its suggested copy fix, which
   as of this audit had not been verified as shipped.

3. **STOP any brand or market expansion.** No expansion work is currently in flight, so this is a
   standing instruction, not a reversal: with `band_coverage_supply` at **43%** (n=100) — fewer than
   half the models we already track have enough comparables to be priced at all — adding a 6th
   marketplace, a 27th TLD, or brand #27 makes the supply problem worse before it makes it better.
   Depth before breadth, and the depth isn't there yet either.

4. **Predictions inflow has stopped; either restart it or stop presenting "outcomes" as live.** 38
   predictions were logged in a 4-day burst ending 2026-08-18; none since — 13+ days of silence
   against 26 rows in `verdict_logs` over the same window (`DATA.md` §7.4). "No accuracy claims
   until 30 outcomes scored" is honest today, but the machine that would ever produce those 30
   outcomes has gone quiet. Left as-is, the promise never resolves either way — which is its own
   form of dishonesty, just a slower one.

5. **STOP non-P0 internal scaffolding from competing for the same hours as items 1–5 below** — the
   159-skill ECC library, the 22 duplicate agents, further schedulers/dashboard panels beyond the
   ones already wired. None of it moves `weekly_trusted_checks`, `retention_30d`, or MRR, and
   `GAPS.md` already queues it behind the P0 data defects in its own stated order. I am not
   reprioritising engineering's queue; I am naming it here because it is real hours that could
   otherwise go to items 1–8 below, and the founder should read this list knowing that trade exists.

---

## 4. What "one retained paying customer" requires — and where it breaks today

The concrete, user-visible sequence:

1. A visitor reaches the site or installs the extension.
2. They run a search.
3. **The product returns a trusted band** (`n ≥ 8`) rather than an honest refusal, a `PENDING` that
   never resolves, or a quota wall.
4. They trust the answer enough to come back within 7 days — this *is* the North Star,
   `weekly_trusted_checks`.
5. They convert to paid (`trial_to_paid`).
6. They stay subscribed 30 days without cancelling or refunding — this is "retained"
   (`retention_30d`).

**Step 3 is the one most likely to break today, and the numbers already say so, not a guess:**

- 19% of all requests hit the free quota wall before a search even completes.
- 24% of the remainder sit `PENDING` and are never resolved (n=78, trailing 7d).
- Of what *is* answered, 40.9% is an honest refusal (n=44).
- `DATA.md` §6.3 derives a hard lower bound from production's own published numbers: at most
  **⌊1,089/8⌋ = 136 models** in all of EU5 can possibly clear `n ≥ 8` in a 7-day window, against
  ≥20,841 known brand+model pairs — a ceiling under **0.65%** of the catalog, rising to roughly
  2.6% on the 30-day fallback window.

Compounding those, the overwhelming majority of interactions never reach step 3 as a trusted band.
That is consistent with the one measured fact we have: the North Star read **0** in the last 7 days,
n=1 — not because retention is bad, but because the funnel almost never produces a trusted check to
retain someone against. Steps 4–6 cannot be improved by anything on this roadmap until step 3 is.

---

## 5. The ranked roadmap

Rank order is the order I would spend hours in. "Cost" reflects whether the work is unstarted,
in-flight, or already built and waiting on review — the one lever RICE's Reach couldn't give me at
this n.

| # | Pile | Item | Severity / evidence | Mechanism (what it unblocks) | Cost |
|---|---|---|---|---|---|
| 1 | TRUE | **Merge `claude/backend-eng/data-defects-c6-c5-c4`** (demand-intel) — FX fail-closed (C6), `n≥8` fail-closed (C5), resolver reads `sold_observed` (C4) | P0, three separate confident-guess-on-missing-fact bugs, `GAPS.md` C4/C5/C6, `STANDARDS.md` §0 | Turns the North Star from an "upper bound" into an exact count; stops the resolver grading against 98.1%-fabricated rows; stops a paid feature publishing prices off by up to 400× | **Already coded, 1,173 tests, tech-lead review pending.** Ship, don't build. |
| 2 | TRUE | **Merge `claude/backend-eng/anon-quota-cookie`** (demand-intel) | The first click on a new visitor's session can return `LIMIT_REACHED` — the worst possible place in the funnel named in §4 to lose someone | Directly targets step 2→3 in §4 and this KPI card's own primary metric (activation) | **Already coded, waiting to ship** (`OS-COMPLIANCE.md` closing note) |
| 3 | TRUE | **Fix the remaining 7 `is_sold=1` read sites** not covered by #1: `db/queries.py:631,692,1881,2552`, `engine/analyzer.py:767`, `engine/model_catalog.py:763`, `db/schema.py:1215` | 66.4% of the local corpus is fabricated `is_sold=1`; #1 fixes the resolver (the worst site) but not these seven | Every price aggregation and catalog view still reachable through these paths stops reading fiction | Not yet branched — new, small, mechanical work; same pattern as #1 |
| 4 | TRUE | **Diagnose and fix the 24% `PENDING`-and-never-resolved rows** | n=78 trailing 7d, 19 rows stuck; `METRICS.md`: "logged here because the metric found it. Not fixed in this pass" | A silent non-answer is worse than an honest refusal for step 3 — the user gets no feedback at all | New investigation, not yet started |
| 5 | TRUE | **Audit the refusal / insufficient-data copy actually shown in-product** | Refusals are 40.9%+ of the experience most visitors have (n=44) — copy for the *majority* case has not been verified end-to-end, only the design states exist (`OS-COMPLIANCE.md` §6) | Whether an honest "no" invites a return visit or ends the session is exactly what step 3→4 in §4 depends on | Verification pass, not a build |
| 6 | MEASURABLE, zero engineering cost | **Founder answers the three `APPROVALS.md` A8 gates**: strike/redefine `MAPE`, split `band_coverage` into demand/supply, accept the North Star as an upper bound or wait for #1 | `METRICS.md` itself is blocked at a founder gate; three specific decisions are named and dated | Every number this document cites depends on these definitions staying stable; the split alone changes the single most actionable number in the file (59.1% vs 43%) | **Costs the founder three answers, not hours.** Action in parallel with #1–#5, immediately. |
| 7 | MEASURABLE | **Instrument the install → first-trusted-check event** | This is this KPI card's own primary metric and it is unmeasurable today: no install event, no funnel-event table (`METRICS.md` §2b) | Without it, no amount of work on #2/#4 can be shown to have moved activation — it's the clock this card is scored against | Not yet started; sequence with #2/#4 since it instruments the same funnel |
| 8 | MEASURABLE | **Wire the `deploys` table on every deploy path** | `deploys` has 1 row dated 2026-08-12; two deploys on 2026-08-31 alone never wrote to it | Lets `change_failure_rate` and `rollback < 10 min` exist before #1–#5 ship, so a bad deploy of a P0 fix is itself measurable | Not yet started; lower urgency than #7 — proof.sh + tech-lead review already substitute partially |
| 9 | FINDABLE | **Hold `GTM.md` execution** — do not publish, post, or connect a channel yet | Posting is a founder gate regardless (OS §0.10); re-measure `band_coverage`/`insufficient_data_rate` post-#1 before spending the ~170 visitors' worth of remaining channel credibility | Prevents repeating the one outcome already observed: the one paying customer this company has ever had refunded and cancelled | N/A — this is a hold, not a task |

### Pre-registered metrics

| # | Metric | Baseline (as measured) | Target check |
|---|---|---|---|
| 1 | North Star caveat / `band_coverage` | `weekly_trusted_checks`=0, n=1, upper bound; `band_coverage`=59.1%, n=44, upper bound (C5) | Re-measure on next hourly dashboard run after merge; expect the "upper bound" caveat removed from every display of these two numbers |
| 2 | `insufficient_data_rate` and quota-wall rate | 40.9%, n=44; 19% of all requests hit the wall | Re-measure 7 days after merge; the wall rate should drop for first-session visitors specifically — check by re-running the query segmented on session age if available |
| 3 | Fabricated-row exposure | 5,332,659 of 5,435,995 `is_sold=1` rows have `sold_observed=0` (98.1%), 8 read sites, 1 fixed by #1 | 0 of the remaining 7 sites reading `is_sold=1` unfiltered, verified by grep + a passing negative-control test, by 2026-09-08 |
| 4 | `PENDING` share | 24% (19/78), n=78, trailing 7d as of 2026-09-01 | Root cause identified by 2026-09-05; fix shipped and re-measured by 2026-09-08 |
| 5 | Refusal-copy return rate | No instrument exists yet — cannot re-measure without #7 | Qualitative audit complete by 2026-09-08; quantitative re-check folds into #7 once the funnel event exists |
| 6 | Three A8 definitions | Open since 2026-09-01 | Founder answer recorded in `APPROVALS.md` by 2026-09-02 — no engineering blocker, so no reason for this to still be open a week from now |
| 7 | Activation funnel | UNKNOWN — no install event exists (`METRICS.md` §2b) | Event emitting and `activation: install→first trusted check <60s` computable (even if the number is bad) by 2026-09-08 |
| 8 | `deploys` log completeness | 1 row, dated 2026-08-12; ≥2 known missing deploys since | Every deploy from 2026-09-02 forward writes a row, verified by count matching `git log` merges to `main` on the relevant branches, by 2026-09-15 |
| 9 | Retention, trial-to-paid | `retention_30d` UNKNOWN, n=0 (cohort empty, starts 2026-09-03); `trial_to_paid` 0.0%, n=1 | No target — these become computable on their own around 2026-09-03; do not act on them until n leaves single digits |

`pipeline_lag_min` (1.5 min, n=1,344) is not on this list. It is the one part of the system already
healthy and does not need hours spent on it right now.

---

## 6. Should this whole roadmap be one item?

No — but the reason is not that there's a long list of independent priorities. It's that the list
splits into two kinds of cost, and only one of them competes for engineering hours.

**The single highest-leverage engineering action is unambiguous and it is one thing:** merge the two
branches that are already built and tested — `data-defects-c6-c5-c4` and `anon-quota-cookie` (items
1–2). Everything else that costs engineering hours (3, 4, 5, 7, 8) is real but secondary work that
follows from having shipped what's already sitting reviewed. If I had to defend a one-line version
of this document, it would be: *ship the two branches that already exist.*

What keeps this from literally being a one-item roadmap is item 6 — the founder-gate answers cost
the founder three sentences, not the engineering team an hour, so there is no reason to sequence it
behind anything, and no reason to omit it just because it isn't "an engineering task." A roadmap that
only lists engineering work would undercount the one open item that is genuinely free to resolve
today.

Findable-pile work (item 9) is intentionally not "cut" — `GTM.md` is real, usable strategy — but it
is held, not ranked, because spending it now measures how good our messaging is at driving traffic
into a funnel we already know loses most visitors before step 3. That's not a priority call, it's
sequencing: there's nothing to learn from a findable experiment run against an unfixed funnel that
the funnel numbers alone don't already tell us.
