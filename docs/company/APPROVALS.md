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

- [x] **Installed 2026-09-01**, on the founder's explicit authorisation in chat. `UNLOCK_HARNESS`
      was created for that single write and **removed immediately after**; the gate is re-armed.
      The three definition decisions below are still open and are the actual founder calls.

**Three definition changes this work forced, which are yours to decide (OS §3: changing a definition
is a founder gate):**

- [ ] **`MAPE ≤ 15 %` must be struck from §3 or redefined.** It is **impossible**, not merely open:
      no ground-truth sold price exists or can exist, and the `is_sold = 1` rows are fabricated.
      Computing it would grade our predictions against fiction.
- [ ] **Split `band_coverage`.** The shipped metric is demand-side (of searches answered, how many
      got a band). §3 arguably means supply-side (of models tracked, how many *could* be priced).
      One name, two questions.

      **CORRECTION to `METRICS.md`, which is wrong on this point and must be amended when you
      decide.** That file says supply-side is blocked on adding `model_stats.comparable_n`. It is
      not blocked at all: the column already exists on **`model_signals`** (I checked the wrong
      table). Measured in production 2026-09-01:

          model_signals            100 rows
          comparable_n >= 8         43        <- supply-side band_coverage = 43%
          comparable_n 3-7          57

      So **43% of the models we track have enough comparables to be priced at all** — against the
      same ≥80% target, and roughly 16 points worse than the demand-side 59.1%. That is a supply
      problem, not a matching problem, and it is arguably the more important of the two numbers.

      I did not ship the query: adding a KPI is the definition change this gate exists to decide.
      Say the word and it is one file.
- [ ] **Accept the North Star as an upper bound, or fix C5 first.** The `n ≥ 8` gate fails open when
      `comparable_n` is absent (`engine/listing_identity.py:50-58`), so today's count is an upper
      bound, not an exact figure.


---

### A9 — the persistent memory directory is outside the rails' SCOPE, so memory does not work

**2026-09-01.** The founder asked whether a memory plugin would improve project memory. The more
useful finding came first: **the memory this session already has is completely blocked.**

`guard.py`'s `SCOPE` allows `~/.claude/projects/-Users-bilalsbaiby-Desktop/memory`. Sessions rooted
at `~/work` write to `-Users-bilalsbaiby-work/memory`, which no SCOPE entry covers. Measured, not
assumed — a real write was attempted and refused:

    BLOCKED by Company OS rails: path outside company scope

Both directories exist on disk. Nothing has been written to the `work` one since the move, and
nothing can be.

This is the **third** instance of the same root cause, which is now a pattern worth naming: SCOPE
was written from the paths the CEO imagined the harness would touch, rather than from what it
actually touches. The first two are recorded in `guard.py`'s own comment — the Desktop
`settings.json` was unreadable, and `~/.claude/plans` blocked the plan describing that very fix.

- [ ] **Add `~/.claude/projects/` to `SCOPE`** (the whole tree, not one project dir, so this does
      not recur the next time the company moves). One line in `.claude/hooks/guard.py` — a
      PROTECTED path, hence a founder gate.

**On the plugins themselves** (`claude-mem`, `task-observer`, `headroom`): none is in this account's
plugin catalog, which returned empty. They are community plugins installed through the `/plugin`
marketplace, an interactive terminal panel not available in this session. **Recommendation: fix A9
first.** A memory plugin layered on a memory directory the rails refuse to write to would fail the
same way, and would be much harder to diagnose from inside a plugin.


---

### A10 — the last of the ECC harness sits behind the rails

**2026-09-01.** `GAPS.md` C2 executed as far as the rails allow, on `demand-intel` branch
`claude/devops/delete-ecc-harness`: **1,156 files → 43, 11M → 408K.** Removed 159 skills, 45
commands, the ECC scripts and `ecc-package.json`.

New evidence, observed rather than argued: those 159 skill descriptions are **injected into context
on any session that touches a demand-intel file**. It is not dormant weight, it is a context tax
paid on every backend task for a harness with no evidence of ever running.

Two directories could not be removed — both are PROTECTED in `guard.py`, and I did not self-unlock:

- [ ] **`demand-intel/.claude/agents/` — 22 ECC agents.** Straightforward delete.

      **I raised a shadowing concern here and then checked it — it was wrong, and the check is the
      point.** I suggested these 22 might shadow the company's 21-agent roster, the `GAPS.md` A1
      failure again. They do not: the two sets share **zero** names (`comm -12` on the two
      directories returns nothing). The ECC set is `architect`, `code-reviewer`, `cs-*`,
      `tdd-guide` — none of which the company roster uses. So they would only ADD 22 unrelated
      agent types in `demand-intel`, never replace `backend-eng` or `tech-lead`.

      That downgrades this from a correctness risk to housekeeping, which is why it is listed last.
- [ ] **`demand-intel/.claude/hooks/`** — includes the no-op `pre:write:gate` whose entire body is
      `echo "[ECC] File write/edit detected" >/dev/null`.

**Kept deliberately, and this one is not a gate — it is a warning:** `.claude/rules/` (3 dirs, 68K).
`HARNESS.md` marks it **MERGE, "do not delete unread"** — the topics overlap `docs/eng/STANDARDS.md`,
which does not exist yet. Deleting it would destroy the only draft of a document we still owe.


---

### A11 — the rails cannot express "only the verifier may write this", so they block everyone

**2026-09-01, found by `verifier` in an independent cold audit**, not by me.

The OS gives `verifier` one exclusive duty: it is the **sole writer** of `docs/company/SCOREBOARD.md`
(OS §7). `guard.py` lists that same path in `PROTECTED`. So the agent the OS appoints to write the
file is the one agent the rails guarantee cannot. The duty and the enforcement contradict.

**The root cause is not a bad rule — it is a missing input, and we have met it before.** A PreToolUse
hook cannot tell which agent is calling it: `CLAUDE_AGENT_NAME` is unset, and the main session and
its subagents share one session id. That is **exactly** `GAPS.md` **A3**, the bug that made all 1,380
activity rows claim to be the CEO's work. The same blind spot has now produced a second, quieter
failure: a rule meaning "only verifier writes here" is not expressible, so it degrades to "nobody
writes here", and the scoring loop in OS §7 has never run.

This is worth deciding rather than patching, because the same limit applies to every
"only agent X may do Y" rule the OS contains.

- [ ] **Pick one:**
      **(a)** Accept it — `verifier` reports its scoreboard to the founder in chat and the file stays
      empty. Cheapest, and OS §7's tier ladder stays decorative.
      **(b)** Un-protect `SCOREBOARD.md` and rely on the doer≠scorer convention rather than the
      rails. Honest about what is actually enforced, and enforces nothing.
      **(c)** Give the hook a real agent identity so the rule can mean what it says — this also
      fixes A3's attribution, which is the reason to prefer it.

**Recommendation: (c)**, and not for the scoreboard's sake. It is the same missing input twice; the
third time will be a rule we trusted more.
