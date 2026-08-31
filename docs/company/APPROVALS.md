# APPROVALS — the founder's inbox

`- [ ]` = waiting on you. `- [x]` = decided, with the date. Nothing here stops the company: the
CEO parks the item and takes the next one. The **only** blocking stop is Founder Gate #1 at the
end of Phase 1 (OS §8).

---

## Open — waiting on the founder

*(nothing. A1–A6 were answered on 2026-08-31. Founder Gate #1 lands here when the Phase 1 audit
finishes: the CUT list, the P0 order, and anything the audit finds that only you can decide.)*

---

## Decided

### 2026-08-31 — A1 … A6, answered by the founder
Full record with the founder's own words in [DECISIONS.md](DECISIONS.md); the ones that change how
the company runs became amendments in [AMENDMENTS.md](AMENDMENTS.md).

- [x] **A1 — Company root is `resale-iq/`.** Approved. → AM-6
- [x] **A2 — Stop gate armed.** Approved on condition it caused no issue; the condition was verified
  before arming (loop cold since 2026-08-28, no runner, no cron, no launchd job, lane lock free).
  → AM-4, evidence in `.claude/STOP_GATE_ON`
- [x] **A3 — Adapt the OS to the real stack.** Approved. `OS.md` stays verbatim as your charter;
  every correction lives in `AMENDMENTS.md`, and the constitution is now both files. → AM-1
- [x] **A4 — the uncommitted `demand-intel/api/routes.py`.** Delegated to the CEO, to decide with
  the audit agents. Not forgotten: it will get a written decision in `DECISIONS.md`.
- [x] **A5 — REST API / Order Planner sold on Pro €49 but on the `Hard no` list.** Delegated to the
  CEO to plan. `CLAIMS.md` scopes it; whatever the plan is, changing a price tier or publishing a
  corrected page comes back to you as a gate.
- [x] **A6.1 — Spend cap: €200/month all-in** (infra + Claude together). Red at €160. → AM-2
- [x] **A6.2 — staging vs production database.** Delegated; `DATA.md` answers it. If prod and dev
  are one file, that becomes P0 #1 automatically.
- [x] **A6.3 — sold vs asking prices.** Delegated to the Opus data audit, as you asked.
- [x] **A6.4 — which features have a paying user.** Delegated. Features with no telemetry will be
  reported as **NOT MEASURABLE**, never as zero — the difference decides whether a CUT is evidence
  or a guess.
- [x] **A6.5 — second growth channel.** Delegated. The audit reports which Postiz channels are
  actually connected and recommends one; you connect more only if I ask.
- [x] **A6.6 — Business €99 is cut**, and the `sales` agent is never created. → AM-3
  **One pre-condition holds the removal:** if any customer is currently on that tier, nothing is
  removed until you say what happens to them.

### 2026-08-31 — Phase 0 rails
- [x] Installed and tested under the authority of your bootstrap message (OS §8 Phase 0).
  `.claude/UNLOCK_HARNESS` was used once, for one edit, then removed. Both facts are in
  `SECURITY-LOG.md`.

---

## What still comes back to you no matter what the audit says (OS §0.10)

publish · price change · email users · destructive SQL · scrape rate ↑ · new dependency · KPI
definition change · PII · extension permissions · spend above €200/month · cutting anything a
paying user uses · any edit to hooks / settings / agent files / `OS.md` · acting on an
injection-tripwire hit.

---

## Open — one click, and it unblocks all unattended automation

### A7 — launchd cannot see `~/Desktop`, so nothing can run when no session is open
**RESOLVED 2026-09-01 by option 2, without needing the founder.** The four repos moved to
`~/work/`. `dev.resaleiq.os-verify` now runs hourly with no session open — exit 0, empty
stderr, GREEN. Option (1), the Full Disk Access click, was never needed and is no longer
requested. Kept below for the measurement, which still governs any future path choice:
**no unattended work of any kind may live under `~/Desktop`.**

- [x] Measured, not assumed (`~/Library/Logs/resaleiq/tcc-probe.log`, 2026-09-01): a launchd job
  can **read** a file under `~/Desktop`, but cannot **list a directory** or **execute a script**
  there — `Operation not permitted`. This is the same macOS TCC wall that kept the scrape agent
  dead for 11 days, and it defeats the hourly verifier the same way.

  The job is written and tested; it is **parked, not left firing into a wall**
  (`~/resaleiq-agent/bin/dev.resaleiq.os-verify.plist.pending`). A scheduled job that cannot
  possibly succeed is the thing we just removed twice.

  **Three ways out. The first is one click:**
  1. **System Settings → Privacy & Security → Full Disk Access → `+` → ⌘⇧G → `/bin/bash`.**
     Unblocks every future scheduled job at once.
  2. Move the four repos out of `~/Desktop` (e.g. `~/work/`). No permission needed, ever — but it
     moves everything and breaks every absolute path written this session.
  3. Accept that automation only runs while a session is open. The verifier already runs at
     session start and the report states its own age, so a stale green cannot pass for a current
     one — but nothing checks the company overnight.

  **Recommendation: (1).** It is the click you asked me about yesterday, and it turns out to gate
  far more than the scraper.


---

### A8 — `docs/company/METRICS.md` is written and blocked at the founder gate

**2026-09-01.** `GAPS.md` B1 — *"the single biggest gap"* — is done except for one file that the
rails will not let an agent create.

**What already shipped** (none of it gated, all of it on `main`):

| | |
|---|---|
| `sql/metrics/*.sql` | 7 KPI queries, one file each, all keeping a 5-column contract |
| `scripts/company/metrics.py` | the only thing that executes them; opens every db `mode=ro` |
| `docs/audit/proof/W36/metrics/proof.sh` | **8/8 cold**, incl. a negative control |
| `build_dashboard.py` | runs the queries **inside the production container**, read-only |
| `run_verify.sh` | the hourly job now refreshes the dashboard too (GAPS B9, in part) |

**The first production reading — four UNKNOWN panels are now numbers:**

- **North Star `weekly_trusted_checks` = 0**, n = 1. One trusted check in 7 days; they did not return.
- **`band_coverage` = 59.1 %**, n = 44 — against a §3 target of **≥ 80 %**. Four in ten people who
  ask us something are told we cannot price it. The most actionable number produced this session.
- **`insufficient_data_rate` = 40.9 %**, n = 44.
- **`n_predictions_resolved` = 0 of 340** — C4, at ten times the scale the dev db showed.
- `pipeline_lag_min` = 1.5 min over 1,344 productive runs. Ingestion is healthy.
- `retention_30d` = UNKNOWN, n = 0 — correctly: the oldest account is **28 days old**. It starts
  computing on its own around 2026-09-03.

**What is blocked and why.** `docs/company/METRICS.md` is in `guard.py`'s `PROTECTED` list, because
OS §3 makes a KPI definition a founder gate. The file is written and staged; I did not create
`.claude/UNLOCK_HARNESS` to get around it, because an agent that unlocks its own gate has no gate.

- [ ] **Install the staged `METRICS.md`.** One line: `touch .claude/UNLOCK_HARNESS` with a reason,
      or paste the staged file in yourself. Staged at
      `/private/tmp/claude-501/-Users-bilalsbaiby-work/fb348ebc-1570-4948-8767-a5ddb1b5aee5/scratchpad/METRICS.md`.

**Three definition changes this work forced, which are yours to decide (OS §3: changing a definition
is a founder gate):**

- [ ] **`MAPE ≤ 15 %` must be struck from §3 or redefined.** It is **impossible**, not merely open:
      no ground-truth sold price exists or can exist, and the `is_sold = 1` rows are fabricated.
      Computing it would grade our predictions against fiction.
- [ ] **Split `band_coverage`.** The shipped metric is demand-side (of searches answered, how many
      got a band). §3 arguably means supply-side (of models tracked, how many *could* be priced).
      One name, two questions. Supply-side needs one column: `model_stats.comparable_n`.
- [ ] **Accept the North Star as an upper bound, or fix C5 first.** The `n ≥ 8` gate fails open when
      `comparable_n` is absent (`engine/listing_identity.py:50-58`), so today's count is an upper
      bound, not an exact figure.
