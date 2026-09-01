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


---

### A12 — the secret rail can be defeated by a shell comment, and 3 of 4 repos have no rails

**2026-09-01, found by `security-eng` in an independent sweep.** Both items are `guard.py` /
settings changes, so both are PROTECTED-path founder gates. **Neither was tested by exploitation —
found by reading, and deliberately left unproven rather than demonstrated.**

- [ ] **CRITICAL — the `.env` block is a substring check.** `guard.py:131-137` skips the secret
      block when the sanctioned script's filename appears **anywhere in the command text**,
      including in a trailing comment. So a command that reads a live `.env` while merely mentioning
      `with-secrets.sh` in a comment passes unblocked, and the live Stripe key lands in the
      transcript. **Fix: match the invoked executable, not a substring of the command.**

      This is the same defect class as A11: the rails repeatedly test a *string* where they mean a
      *thing*. PROTECTED matches a path substring so it cannot tell your roster from dead ECC files;
      the secret rule matches a command substring so it cannot tell an invocation from a comment.

- [ ] **HIGH — the rails only exist in `resale-iq`.** `demand-intel/.claude/settings.json` is a
      separate file that does not reference `guard.py` at all: no-op hooks, an explicit `cat*` allow,
      no deny list. `resale-iq-growth` has no hooks. `resale-iq-seo` has no `.claude/` directory.
      Each of those repos' own `CLAUDE.md` treats itself as a session home base, so the normal way
      to work on the backend is **unprotected** — including against a push to `main`, which
      `demand-intel/CLAUDE.md` says deploys production.

      Every rail described in `OS-COMPLIANCE.md` §0 as DONE is DONE **in one repo of four.**

- [ ] **MEDIUM, latent — `users.plan` DEFAULT `'operator'`** (`db/schema.py:565`). Two agents
      independently confirmed no live path hits it (registration always writes `'free'`), so this is
      not a current leak. It is a one-omitted-column landmine with no test protecting the invariant.
      **Fix: `DEFAULT 'free'` plus a regression test on the default itself.**


---

### A13 — the one-token change that moves coverage 19 points

**2026-09-01, `data-scientist`, measured against production read-only.** Not a founder gate — a
**P0 for the next engineering session**, recorded here so it is the first thing seen.

`demand-intel/db/queries.py:1986` gates on `MIN_COMPARABLES` (3) where it should gate on
`MIN_VERDICT_COMPARABLES` (8). `prices_30d` is built thirty lines earlier in the same loop and then
**discarded** for any model that found 3 comps in 7 days. So a model with 5 comps at 7d and 11 at
30d is stored as `comparable_n = 5` and refused a price it has the evidence for.

| | now | after |
|---|---|---|
| supply coverage (n=100 models) | 43.0 % | **62.0 %** |
| demand `band_coverage`, all-time (n=180) | 62.8 % | **81.1 %** |
| last 7 days (n=44) | 43.2 % | 65.9 % |

The counterfactual reproduces today's 43.0 % to the decimal on 90/100 models, so it is a
replication rather than a model. **Recommend the 14-day window, not 30**: identical gain today,
half the future staleness, because `sold_observed = 1` only begins 2026-08-21 and the corpus is
11 days deep.

**It also raises honesty, which is the part that matters.** Median `comparable_n` behind a printed
band goes **12 → 26**. Cutting the threshold from 8 to 5 would reach a similar coverage number and
take that median **12 → 10** — same headline, opposite direction on the thing the number is for.
**Do not cut the threshold. 8 is right.**

**Two flags from the same analysis:**

- **The real ceiling is the labeller, not the constants.** Only **7,247 of 103,993** observed sales
  (7.0 %) carry a `model` label; 11.8M of 12.7M listings have a brand and no model. No constant
  fixes that.
- Coverage will drift upward on its own until ~2026-09-20 as the corpus deepens, so any goal set on
  it needs a calendar control or it will score a win that time delivered.


---

### A8 / A12 — CONSULTATION IN PROGRESS (founder authorised, conditional)

**2026-09-01.** The founder authorised A8 and A12 **on the condition that every agent with an
informed opinion is consulted first**. Consultation is open with data-scientist, security-eng,
tech-lead, product-manager, devops and verifier. Recorded as it lands, dissent included.

#### `verifier` — DISSENTS on proceeding tonight as stated

| Item | Verdict |
|---|---|
| **A8-1 strike MAPE** | **SAFE.** No `sql/metrics/mape.sql` was ever written, so there is no baseline to break. Removing a KPI that was never measured costs nothing |
| **A8-2 `band_coverage` split** | **SERIES BREAK REQUIRED.** `band_coverage.sql` is live and will be scored; redefining it makes before/after incomparable |
| **A8-3 North Star exact after C5** | **SERIES BREAK REQUIRED**, same reason |
| **A12** | **Do not ratify as stated — it overstates what the proof verified** |

**It corrected my unifying diagnosis, and it is right.** I claimed the SCOREBOARD block and the
credential-file bypass were one root cause ("the rails match strings where they mean things"). They
are not:

- SCOREBOARD is a **missing-information** problem — guard.py identifies the path perfectly well and
  simply has no caller identity with which to apply an exception.
- The credential-file bypass is an **encoding** problem — the match is too loose.

They share an architecture (policy by string-matching on external facts, with no context-dependent
rules) but need **different fixes**, and treating them as one would produce a fix for neither.

**Then it turned the audit on itself, which is the finding of the night.** Its own cold run searched
`resale-iq/docs/audit/proof` and nowhere else:

> *"The proof passed while testing one quarter of its subject. That is exactly the failure mode I
> exist to catch."*

- [ ] **Correct `OS-COMPLIANCE.md`**: Phase 0 rails go from **DONE (40/40)** to **PARTIAL —
      resale-iq only (40/40); demand-intel, growth, seo unverified.**
- [ ] **Extend the Phase-0 proof to all four repos** — assert guard.py is present and wired, that
      each PROTECTED tuple covers the critical paths, and that the deny rules and their negative
      controls fire identically in each. Then re-run: it either still passes, or it fails and
      surfaces the missing rails. Both outcomes are useful; the current state is not.
- [ ] **A new suite asserting `demand-intel` cannot push `main` without hitting a rail**, because
      that push is the production deploy.

**Following its recommendation rather than my original plan:** ratify A8 *with* the two series-break
markers; do **not** ratify A12 until the rail audit covers all four repos and OS-COMPLIANCE is
corrected.

---

#### A NEW DEFECT, found by trying to write this file

Committing the paragraph above was **blocked by the rails**, because the commit message contained
the literal name of the credential file while explaining the bug. The secret rule matches that
string anywhere in a command and cannot tell *reading* a secret from *writing about the rule*.

So the defect has both faces:
- **false negative** — a trailing shell comment naming the sanctioned wrapper defeats the block
  (security-eng, CRITICAL);
- **false positive** — documenting the rule trips it, which is how a rail teaches people to route
  around it.

- [ ] Any fix must be verified against **both** directions. A tightened match that still fires on
      prose is only half repaired.


#### `product-manager` — AGREES on all three, with one condition that changes A8-2

| Item | Verdict |
|---|---|
| **A8-1 strike MAPE** | **AGREE, no reservation.** "There is no version of wait-and-see that makes this different later — the data simply is not collectable off Vinted's public surface" |
| **A8-2 the split** | **AGREE the SHAPE. HOLD the demand-side VALUE.** Approve supply-side shipping as its own named metric; do **not** publish 59.1% / 40.9% as the demand-side's canonical first reading |
| **A8-3 North Star exact** | **AGREE, strictly conditional.** Correct *by construction* the moment C5 merges. **Gate the copy change on the merge commit, not on tonight's authorisation** — "exact" applied before the merge is a false claim of precision, worse than the caveat it replaces |

**The condition, and it is the right one:** formalising the demand-side definition tonight with a
reading we now know is contaminated would mean *the founder's first act under this new authority is
ratifying a number already known to be wrong at the moment of ratification.*

**It then corrected its own roadmap, unprompted.** It had called 59.1% "the single most actionable
number in the file" — quoting `METRICS.md`, i.e. quoting me. Its retraction:

> *"It isn't a number yet; it's an instrument reading its own testing signal."*

Its §4 conclusion survives on independent evidence — the 19% quota-wall rate is measured over ALL
requests, and `DATA.md` §6.3's catalog ceiling is derived from production totals with no query-log
dependency. The conclusion holds; the figure used to illustrate it does not.

- [ ] **New, for `data-scientist`:** exclude known probe/internal IPs from every demand-side metric
      before it is cited again, and report `n` as deduplicated real sessions rather than raw rows.
- [ ] **ROADMAP.md baseline** for `band_coverage` / `insufficient_data_rate` becomes
      **UNKNOWN-pending-probe-filter**, per OS §0 rule 2. A number known to be contaminated does not
      get to stand as the baseline merely because it was measured first.

**On A13 (the one-token fix):** does not displace the branch — both are P0, neither substitutes for
the other (one is a wrong-*answer* bug, the other a wrong-*denominator* bug). But **review them in
the SAME pass, not sequentially**: both touch "how many comparables justify a band", and someone must
confirm the changed 30-day windowing does not interact with C5's `comparable_n` check before either
is called done. And re-verify the 81.1% was not computed over the same contaminated population
before anyone reports the ≥80% target as met.

---

### Where A8 stands after two independent consultations

Both agents converge, from different directions:

- **A8-1 — RATIFY.** Safe on both readings: no baseline exists to break, and no future data can
  rescue it.
- **A8-2 — RATIFY THE STRUCTURE ONLY.** Supply-side ships as its own named metric. The demand-side
  value is held at UNKNOWN pending the probe filter, and carries a series-break marker.
- **A8-3 — RATIFY, GATED ON THE MERGE COMMIT.** Not on tonight's authorisation.
