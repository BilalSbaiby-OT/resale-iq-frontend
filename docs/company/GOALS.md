> # ⚠️ SUPERSEDED BY `MISSION.md` and `DOCTRINE.md` (2026-09-02)
> **The current target is €2,000 MRR by 2026-12-31 — see `MISSION.md`, which carries the
> arithmetic (80 customers, 2.56% visitor→paying at today's traffic).**
>
> Kept readable for the history of what was aimed at before.

---

# GOALS — week of 2026-09-01

Written off-cycle (Tuesday, not the usual Monday) because `GOALS.md` has never existed until now —
this closes `GAPS.md` **B2**. OS §7: every goal is pre-registered — metric, query/check, baseline,
target and holdout written down *before* work starts, so nobody can move the target after seeing
the result. `sha256` at the bottom is computed over the exact pre-registration block below; if that
hash ever stops matching, the block was edited after the fact and the goal is void.

**Cap:** ≤ 5 goals/week (this file's own counter-KPI, `goals_count`). Five below, all five agent-
executable this week, none of them a rate target on a population too small to support one — see
§2 for the ones deliberately **not** set, and why.

**REVISED same day, 2026-09-01 evening**, on the founder's explicit KPI: *"get me first real paying
10 customers."* `docs/company/PATH-TO-TEN.md` is the plan this revision serves. **This supersedes
the morning registration, not by editing it — by replacing it with a new one, recorded in full in
§3, before any of the five goals below had been scored.** Nothing in the superseded block was ever
run against a HIT/MISS/FAKE verdict, so this is a re-registration, not a moved target. Two goals
survive unchanged (G-W36-02, G-W36-03) because they were already the two most load-bearing items for
the ten-customer KPI before the KPI itself was named tonight. G-W36-01 survives because it is
CRITICAL, cheap (≤1h) and does not compete with the other four for the same hours. Two goals
(G-W36-04 `c8_blast_radius_measured`, G-W36-05 `n_predictions_resolved`) are **deferred, not
abandoned** — neither moves a visitor, a trial, or a conversion this week, and both remain real,
dated items in `GAPS.md`/`ROADMAP.md` for next week's cycle. Two new goals (G-W36-06, G-W36-07) take
their place, both drawn directly from `PATH-TO-TEN.md` §2's sequence.

---

## 1. Pre-registered goals (this exact block is hashed — see §3)

```
G-W36-01  owner: security-eng  reviewer: tech-lead
metric:  guard_env_bypass_open (binary: 0 = closed, 1 = open)
baseline: 1 (open) — 2026-09-01, docs/audit/SECURITY-SWEEP-2026-09-01.md finding #1 (CRITICAL):
  guard.py's env-file Bash block is defeated by a substring-containment check instead of an
  executable check; confirmed by code read, not by running the exploit.
check:   docs/audit/proof/W36/g01-guard-bypass/proof.sh — re-runs the documented bypass command
  from SECURITY-SWEEP-2026-09-01.md against .claude/hooks/guard.py from a clean checkout; must
  block (exit 2) after the fix, and the same proof must show it was unblocked before.
target:  guard_env_bypass_open = 0 by 2026-09-03 (48h — CRITICAL, live today, no gate needed to fix a rail)
holdout: N/A — single documented exploit, not a sample; the proof re-running the exact documented
  command from a clean checkout is the anti-gaming control.
budget:  Sonnet <= 1h

G-W36-02  owner: backend-eng  reviewer: tech-lead
metric:  data_defect_merge_count (count of {C4, C5, C6} fixes that are ancestors of demand-intel
  origin/main, 0-3)
baseline: 0 of 3 — 2026-09-01, measured directly: `git merge-base --is-ancestor <sha> origin/main`
  for c1143d3 (C5), d3850d9 (C4), 998ef72 (C6 rework) all return false (verified this session).
check:   docs/audit/proof/W36/g02-data-defects/proof.sh — runs the three `git merge-base
  --is-ancestor` checks above against demand-intel's live origin/main and counts true/3.
target:  data_defect_merge_count = 3 by 2026-09-06, each merge preceded by a tech-lead review
  distinct from the author (OS §5 — backend-eng wrote these, so backend-eng may not review them)
holdout: N/A — binary ancestor check against the real remote, not a sample.
counter: test suite green at merge time (1173 tests recorded on the branch as of 2026-09-01;
  regression = any drop in that count without a matching removal note)
budget:  Sonnet <= 3h (review + merge only; the code is already written)

G-W36-03  owner: backend-eng  reviewer: tech-lead
metric:  pending_row_failsafe_shipped (binary)
baseline: 0 (not shipped) — 2026-09-01, docs/audit/MONETIZATION.md finding #1: no exception
  handling wraps the anon-quota-debit-to-resolution span (demand-intel api/routes.py:801-1222,
  db/queries.py:2652-2704), so an exception mid-span burns a visitor's quota slot and returns
  nothing; row stays PENDING forever. 24% of all requests are PENDING and unresolved (n=78, 7d).
  **Argued tonight in PATH-TO-TEN.md §3 as the single highest-leverage fix in the company: it
  also corrupts `get_trial_recap()`, the data the trial-expiry machine (G-W36-06) depends on to
  ask honestly — ship this one first if only one hour exists before sunrise.**
check:   a new fault-injection regression test (path chosen by backend-eng, referenced from
  docs/audit/proof/W36/g03-pending-failsafe/proof.sh) that forces an exception at a point in the
  span and asserts the row resolves to a terminal state (not PENDING) rather than hanging.
target:  pending_row_failsafe_shipped = 1, merged to demand-intel main, by 2026-09-06
holdout: the verifier injects the fault at a DIFFERENT point in the span than the one used during
  development, so the fix must honor the general contract (always resolve on exception), not just
  pass the one scenario it was built against.
budget:  Sonnet <= 2h

G-W36-06  owner: backend-eng  reviewer: tech-lead
metric:  trial_lifecycle_job_ready (binary: 0 = not ready, 1 = code merged behind a disabled job +
  copy staged for a founder go/no-go)
baseline: 0 — 2026-09-01, docs/product/LIFECYCLE.md is copy/design only; `alerts/lifecycle_emails.py`
  does not exist and `schedule_jobs()` in demand-intel/main.py registers no lifecycle job (grep
  confirmed, both files, this session).
check:   docs/audit/proof/W36/g06-trial-lifecycle/proof.sh — asserts (a) the four selection queries
  in LIFECYCLE.md §4 exist and return the specified shapes against fixture data, (b) the job is
  NOT registered in schedule_jobs() (must stay OFF — sending is a founder gate, OS §0.10), (c) the
  `email_unsubscribes` table and `marketing_opt_out` column exist via a reversible migration, (d)
  all four templates render against fixture data with no accuracy/hit-rate claim string present
  (grep-based negative control, since 0 of 340 predictions are graded).
target:  trial_lifecycle_job_ready = 1, merged to demand-intel main with the job explicitly
  disabled, LIFECYCLE.md §3 copy pasted verbatim into a new docs/company/APPROVALS.md entry
  awaiting one founder decision, by 2026-09-03.
holdout: the verifier confirms the merged diff does NOT add a live `add_job` call for lifecycle
  emails — a proof that passes while accidentally enabling sending is scored FAKE, not HIT (OS §7).
budget:  Sonnet <= 3h

G-W36-07  owner: backend-eng  reviewer: tech-lead
metric:  limit_reached_dashboard_render_fixed (binary)
baseline: 0 (broken) — 2026-09-01, docs/audit/MONETIZATION.md finding #2: resale-iq/src/app/
  (dashboard)/verdict/page.tsx has no LIMIT_REACHED case in VERDICT_STYLE or the message-rendering
  branch (page.tsx:14-22, 80, 139-148), so a paying-eligible signed-in customer who exhausts their
  post-trial 10/day sees a "NO DATA" card instead of the server's own upgrade message, which is
  computed and never shown.
check:   a new component test (path chosen by the implementing agent, referenced from
  docs/audit/proof/W36/g07-limit-reached-render/proof.sh) asserting a mocked LIMIT_REACHED response
  renders result.message and a link to /account#plans, not the four-metric "—" grid.
target:  limit_reached_dashboard_render_fixed = 1, merged to resale-iq main, by 2026-09-03
holdout: the verifier's test uses a different exact message string (same shape, different n/
  used_today values) than the one used during development, confirming the fix renders the field
  generically rather than hardcoding the dev fixture's copy.
budget:  Sonnet <= 1h
```

---

## 2. What is NOT set as a goal this week, and what it needs first

This is the harder and more useful half of this document. At 6 accounts, 3 extension installs,
1 customer ever (refunded, cancelled) and EUR 0 MRR, most of the KPIs in OS §3 are rate metrics
over populations too small to move meaningfully in a week — pre-registering a target on them
would be fiction with a sha256 attached, not a goal.

| KPI | Current reading | Why no goal this week | What it needs first |
|---|---|---|---|
| **`paying_customer_count` / "10 paying customers"** | 0, n=0 | This is the founder's KPI and the north star this whole file now serves — and it is precisely the one number `PATH-TO-TEN.md` §1 shows **cannot** be pre-registered as a weekly target without the arithmetic being fiction: closing it needs on the order of 2,000–8,700 real visitors (central ~3,300) against a current real run-rate of ~100–150/month. Setting "10 by Sunday" as a goal would be exactly the kind of target OS §7 exists to prevent — one nobody can hit honestly and everybody will feel pressured to fudge. | Everything in `PATH-TO-TEN.md` §2's sequence, landed and given weeks, not days, to run. Progress is tracked via the five goals above and the metrics table in `PATH-TO-TEN.md` §6, not via this number directly, until n leaves single digits. |
| `weekly_trusted_checks` (North Star) | **0**, n = 1 | A target on n=1 cannot be hit or missed in any way that means anything — the last 7 days produced exactly one trusted check. This is a volume problem, not something a weekly target fixes. | The funnel fixes already in G-W36-02/03 shipped and given time to run. No target should be set until n is at least in the dozens/week — below that, one extra visitor moves the number 100%. |
| `band_coverage_demand` / `insufficient_data_rate` | withheld at n=44 (below the n=100 contract floor, `APPROVALS.md` A8) / 40.9%, n = 44 | The n-floor added under A8 already blanks the demand-side reading below n=100. `insufficient_data_rate` is shown per the A8 gate but the same noise argument applies to any *movement* target: distinguishing a real 5-point move from noise at 95% confidence on a ~50% proportion needs roughly n ≈ 385; we are at 44. | Roughly an order of magnitude more answered searches per week before a *weekly* delta means anything. Track the number; don't target it yet. |
| `band_coverage_supply` | 43.0%, n = 100 (and **already observed to drift to 40.0% within hours** from corpus churn alone, `PATH-TO-TEN.md` §6) | A13 (§2 item 6 in `PATH-TO-TEN.md`) is in engineering review, not blocked on a goal — and any target set on this number this week would be scored against a clock, not against work, per the calendar-control note now required in `PATH-TO-TEN.md` §6. | Merge A13, then re-baseline with the corpus-age caveat attached to every reading until ~2026-09-20. |
| `retention_30d` | UNKNOWN, n = 0 | The cohort is genuinely empty — oldest account is 28 days old. It starts computing on its own around 2026-09-03, with no goal needed to make that happen. | Time, then several more weeks before a *rate* (as opposed to raw existence of a number) means anything — one account either retaining or not is not a rate. |
| `trial_to_paid`, MRR | 0.0% (n = 1), EUR 0.00 — and see `PATH-TO-TEN.md`'s opening note: this may not even be the same population as the "10 trials, 0 converted" figure in this week's founder brief; the two have not been reconciled | A conversion-rate or MRR target this week would be a guess wearing a target's clothes, doubly so while the underlying `n` itself is in question. G-W36-06 ships the *mechanism* to ask, not a conversion number — asking is measurable this week (binary: did the machine ship, ready to fire); converting is not. | A larger, older trial cohort, the trial machine actually switched on by the founder, and — first — a one-query reconciliation of the 10-vs-6 discrepancy, itself a candidate for next week's `GOALS.md`. |
| extension installs/week | 3 installs total, ever | `GTM.md` §1.1: the entire category tops out around 1,065 users across all 9 competing extensions, and the extension cannot run on the device sourcing actually happens on (mobile). `PATH-TO-TEN.md` §4 names this a STOP, not a hold-for-later. | Not this KPI. If mobile `/check` proves out as the real acquisition surface, a *mobile* activation metric replaces this line entirely rather than this line eventually getting a target. |
| Claude/Anthropic API spend vs the EUR 200 cap (AM-2) | UNKNOWN — EUR 5.83/mo known (infra only), API spend not evidenced | Not agent-executable: `LEDGER.md` names the Anthropic console usage export as the settling evidence, and no local usage/billing log exists on this machine (checked — `~/.claude` has no usage or billing artifact). This needs the founder's console login, not an agent's tool access. | The founder to pull the Anthropic console export (Billing → Usage, 2026-08-01 to 2026-09-01) — or an Admin API key provisioned so an agent can pull it directly. Named again in the digest. |
| `c8_blast_radius_measured` | 0 — UNKNOWN as of 2026-09-01 | **Deferred this week, not abandoned.** This was G-W36-04 this morning. `PATH-TO-TEN.md` §4 names it explicitly: it does not move a visitor, a trial, or a conversion, and the hour is worth more on G-W36-06/07 tonight. Still real, still in `GAPS.md` C8. | A slot in next week's `GOALS.md`, unchanged from this morning's registration otherwise. |
| `n_predictions_resolved` | 0 of 340 — 2026-09-01 | **Deferred this week, not abandoned.** This was G-W36-05 this morning, `depends on: G-W36-02` — since G-W36-02 (the data-defects merge) is still pending review either way, deferring the resolver-reading goal costs nothing real this week and frees the hour. | Re-register once G-W36-02 merges; the dependency was already correctly stated this morning and still holds. |

---

## 3. Provenance

**This file was re-registered once, same day, on the founder's explicit KPI.** Both hashes are kept
so the audit trail is complete rather than edited away.

### 3.1 The morning registration (superseded, never scored)

sha256 of that block, computed the same way, over the same five-goal fence content written at
first light on 2026-09-01 (G-W36-01 through G-W36-05, the version with `c8_blast_radius_measured`
and `n_predictions_resolved` in place of G-W36-06/07):

```
c826d61c1e21ade021af43631bd8ede6a45eea99ae05d98a061dbed0f524a87c
```

That hash is **not** the hash of the block currently in §1 — it documents the block this file
originally shipped with, before the founder's KPI card reset priorities the same evening. No agent
ever ran a check against it; `verifier` had not yet scored it. It is superseded, not falsified.

### 3.2 This registration (current, §1 above)

sha256 of the pre-registration block in §1 (everything between the ` ``` ` fences, exact bytes,
computed with `shasum -a 256` before this file was written):

```
6a1f62cf4e867a2f94489b87891b23afeaaddfdd14ac36eea72f4d229f123418
```

To re-verify: extract the fenced block in §1 byte-for-byte and re-hash. A mismatch means the block
was edited after registration — the goal it changed is void, not scored, and the edit itself is a
`GAPS.md` entry.

Written by: chief-of-staff, 2026-09-01 (morning registration), revised 2026-09-01 (evening, on the
founder's KPI, `docs/company/PATH-TO-TEN.md`). Scored by: `verifier`, Sunday 2026-09-06 (G-W36-01
checks early at 2026-09-03 given its severity; G-W36-06 and G-W36-07 also check early at 2026-09-03
per their own targets; the rest score on the normal Sunday cadence). Outcome vs output weighting and
the HIT/MISS/FAKE ladder are OS §7, unchanged here.
