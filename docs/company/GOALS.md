# GOALS — week of 2026-09-01

Written off-cycle (Tuesday, not the usual Monday) because `GOALS.md` has never existed until now —
this closes `GAPS.md` **B2**. OS §7: every goal is pre-registered — metric, query/check, baseline,
target and holdout written down *before* work starts, so nobody can move the target after seeing
the result. `sha256` at the bottom is computed over the exact pre-registration block below; if that
hash ever stops matching, the block was edited after the fact and the goal is void.

**Cap:** ≤ 5 goals/week (this file's own counter-KPI, `goals_count`). Five below, all five agent-
executable this week, none of them a rate target on a population too small to support one — see
§2 for the ones deliberately **not** set, and why.

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
check:   a new fault-injection regression test (path chosen by backend-eng, referenced from
  docs/audit/proof/W36/g03-pending-failsafe/proof.sh) that forces an exception at a point in the
  span and asserts the row resolves to a terminal state (not PENDING) rather than hanging.
target:  pending_row_failsafe_shipped = 1, merged to demand-intel main, by 2026-09-06
holdout: the verifier injects the fault at a DIFFERENT point in the span than the one used during
  development, so the fix must honor the general contract (always resolve on exception), not just
  pass the one scenario it was built against.
budget:  Sonnet <= 2h

G-W36-04  owner: data-eng
metric:  c8_blast_radius_measured (binary: does a number with n, dates and query exist)
baseline: 0 — UNKNOWN as of 2026-09-01 (GAPS.md C8: parse_item returns None on empty brand_title,
  0.58% of items, and that drop reaches engine.shelf.detect_ended the same way C6 did; how many
  sold_observed=1 rows trace to this path has never been counted)
check:   docs/audit/C8-BLAST-RADIUS.md — one query, one number, n, window, against production or a
  dated production snapshot; UNKNOWN is an acceptable answer only with a named blocker, a silent
  omission is not
target:  c8_blast_radius_measured = 1 by 2026-09-04. No magnitude target is set — the number is not
  yet known in either direction, so committing to "small" or "large" now would be a guess.
holdout: N/A — full-population count query, not a sample.
budget:  Sonnet <= 1h

G-W36-05  owner: data-scientist  depends on: G-W36-02
metric:  n_predictions_resolved (from sql/metrics/n_predictions_resolved.sql, production)
baseline: 0 of 340 — 2026-09-01 (METRICS.md, production)
check:   sql/metrics/n_predictions_resolved.sql re-run against production, plus a check that the
  resolver code path executing at resolution time reads sold_observed (post G-W36-02), not is_sold
target:  n_predictions_resolved >= 1 by 2026-09-08 (the first predictions become 30-day-ripe
  ~2026-09-04; this goal is void — not a MISS — if G-W36-02 has not merged by then, since resolving
  against is_sold would grade against 98.1%-fabricated rows, which is worse than not resolving)
holdout: N/A — full population of ripe predictions in the window, not a sample.
budget:  Haiku <= 30m (read-only query + one code check)
```

---

## 2. What is NOT set as a goal this week, and what it needs first

This is the harder and more useful half of this document. At 6 accounts, 3 extension installs,
1 customer ever (refunded, cancelled) and EUR 0 MRR, most of the KPIs in OS §3 are rate metrics
over populations too small to move meaningfully in a week — pre-registering a target on them
would be fiction with a sha256 attached, not a goal.

| KPI | Current reading | Why no goal this week | What it needs first |
|---|---|---|---|
| `weekly_trusted_checks` (North Star) | **0**, n = 1 | A target on n=1 cannot be hit or missed in any way that means anything — the last 7 days produced exactly one trusted check. This is a volume problem, not something a weekly target fixes. | The funnel fixes already in G-W36-02/03 shipped and given time to run. No target should be set until n is at least in the dozens/week — below that, one extra visitor moves the number 100%. |
| `band_coverage` / `insufficient_data_rate` | 59.1% / 40.9%, n = 44 | OS §3 already has a standing target (≥ 80%) — the problem isn't the target, it's that a week-over-week *movement* target at n=44 can't be told apart from sampling noise. Textbook arithmetic, not a company-specific estimate: to distinguish a real 5-point move from noise at 95% confidence on a ~50% proportion needs roughly n ≈ (1.96² × 0.5 × 0.5) / 0.05² ≈ 385. We are at 44. | Roughly an order of magnitude more answered searches per week before a *weekly* delta means anything. Track the number; don't target it yet. |
| `band_coverage_supply` | 43.0%, n = 100 | No engineering is currently aimed at growing the model corpus — `ROADMAP.md` §3.3 explicitly holds brand/market expansion ("depth before breadth, and the depth isn't there yet either"). A goal with no owner action driving it isn't a goal, it's a wish. | A founder or product decision to prioritize corpus depth, which isn't on the table this week. |
| `retention_30d` | UNKNOWN, n = 0 | The cohort is genuinely empty — oldest account is 28 days old. It starts computing on its own around 2026-09-03, with no goal needed to make that happen. | Time, then several more weeks before a *rate* (as opposed to raw existence of a number) means anything — one account either retaining or not is not a rate. |
| `trial_to_paid`, MRR | 0.0% (n = 1), EUR 0.00 | One trial ever converted, and that customer refunded and cancelled. A conversion-rate or MRR target this week would be a guess wearing a target's clothes. Also: `ROADMAP.md` deliberately holds the FINDABLE (marketing/GTM) pile until the TRUE-pile funnel fixes (G-W36-02/03) ship — sending more visitors at an unfixed funnel is not a growth strategy, it already produced this company's only refund. | A larger, older trial cohort — and TRUE-pile fixes landing first, on purpose. |
| extension installs/week | 3 installs total, ever | Same reasoning as MRR: growth spend is deliberately paused pending the funnel fixes above. Setting an installs target while GTM execution is on hold would be asking an agent to hit a number nothing is driving. | GTM held per `ROADMAP.md`; resume once `band_coverage`/`insufficient_data_rate` are re-measured post-fix. |
| Claude/Anthropic API spend vs the EUR 200 cap (AM-2) | UNKNOWN — EUR 5.83/mo known (infra only), API spend not evidenced | Not agent-executable: `LEDGER.md` names the Anthropic console usage export as the settling evidence, and no local usage/billing log exists on this machine (checked — `~/.claude` has no usage or billing artifact). This needs the founder's console login, not an agent's tool access. | The founder to pull the Anthropic console export (Billing → Usage, 2026-08-01 to 2026-09-01) — or an Admin API key provisioned so an agent can pull it directly. Named again in the digest. |

---

## 3. Provenance

sha256 of the pre-registration block in §1 (everything between the ` ``` ` fences, exact bytes,
computed with `shasum -a 256` before this file was written):

```
c826d61c1e21ade021af43631bd8ede6a45eea99ae05d98a061dbed0f524a87c
```

To re-verify: extract the fenced block in §1 byte-for-byte and re-hash. A mismatch means the block
was edited after registration — the goal it changed is void, not scored, and the edit itself is a
`GAPS.md` entry.

Written by: chief-of-staff, 2026-09-01. Scored by: `verifier`, Sunday 2026-09-06 (G-W36-01 checks
early at 2026-09-03 given its severity; the rest score on the normal Sunday cadence). Outcome vs
output weighting and the HIT/MISS/FAKE ladder are OS §7, unchanged here.
