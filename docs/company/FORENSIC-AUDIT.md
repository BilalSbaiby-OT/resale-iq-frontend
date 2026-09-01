# FORENSIC AUDIT — why the 21-agent system underperforms

**2026-09-02. Read-only. Nothing was fixed, modified or created during this audit except this file.**

**Scope limit, stated first:** the session hit its usage limit mid-audit (*"You've hit your session
limit · resets 12:50am"*), which killed 7 of 11 agents in a running workflow. **This audit was
therefore performed by the CEO session directly, not by a fleet.** Parts requiring per-agent
execution traces are marked **UNKNOWN** rather than inferred.

---

## 1. EXECUTIVE DIAGNOSIS

**The 21 agents are one agent wearing 21 name tags.**

Two unrelated agents — `backend-eng` and `designer` — differ by **24 lines out of 240**. Roughly
**90% of every agent prompt is identical boilerplate.** The genuine differentiation per agent is
about **ten lines**: name, description, tool list, a four-line KPI card, a branch slug, one domain
fact, one personality sentence.

**And the second finding is worse than the first: the engineering is fine.** 1,342 passing tests,
111 test files against 48 source modules, **zero TODOs, zero skipped tests, zero
`NotImplementedError`**. The founder's assumption that the code is bad is **not supported**. The
failures are in the agent layer, the thresholds, and the product logic — not the craftsmanship.

**The single highest-leverage root cause:** *nothing in this system distinguishes a claim from a
proof, and nothing makes an agent's context match its job.*

---

## 2 & 3. ARCHITECTURE AND THE ACTUAL AGENT SYSTEM

| | DOCUMENTED | ACTUAL | STATUS | EVIDENCE |
|---|---|---|---|---|
| Agent roster | 21 specialists, 5 departments | 21 files, 90% identical | **partially working** | `.claude/agents/*.md`, `ORG.md` |
| Second roster | not documented | **22 DIFFERENT agents** | **orphaned** | `demand-intel/.claude/agents/` — `cs-*`, `architect`, `tdd-guide`; **zero name overlap** |
| Orchestration | implied autonomous | **the CEO session, manually** | **missing** | no scheduler; every agent runs only when spawned by hand |
| Agent-to-agent comms | `bus.py` mailbox | built 2026-09-01, **16 of 16 unread** until wired tonight | **was broken** | `bus.py`, `bus-read.jsonl` |
| Memory | "disk is memory" | docs exist; **agents never read them unprompted** | **partially working** | see §7 |
| Tests | — | 1,342 passing | **working** | `pytest tests/ -q` |
| CI | 3 workflows | frontend + backend deploy, isolation | **working, over-gated** | `.github/workflows/` |

**Trace of how an agent actually receives its job** — this is the real flow, not the documented one:

1. **Role** — from its `.md` file (90% boilerplate).
2. **Objective** — **from the CEO's spawn prompt only.**
3. **Project context** — whatever the CEO pasted. It reads no docs unless told.
4. **Previous agent output** — **only if the CEO relays it.** There is no shared state.
5. **Constraints** — partly file, mostly the spawn prompt.
6. **Authority** — **ambiguous** (§4).
7. **Expected output** — spawn prompt only.
8. **Verification** — **no requirement exists in any agent file.**

**Everything of substance arrives through one channel: a prompt I type.** The 21 files contribute
about ten lines each.

---

## 4. THE SCORECARD

Because the prompts are 90% identical, **individual scoring is largely meaningless** — a fact that is
itself the finding. Scored as a class, with the differentiators noted:

| dimension | score | evidence |
|---|---|---|
| Role clarity | **6/10** | descriptions are clear; scope boundaries are not |
| Context quality | **3/10** | no doc-reading requirement; context is whatever was pasted |
| Authority clarity | **2/10** | 21/21 cite **AM-2, lifted by AM-9**; gates contradicted across 6 docs |
| Execution capability | **7/10** | tools are correctly scoped per agent — the best-differentiated field |
| Verification quality | **2/10** | **0 of 21 define "done"**; verification appears as prose, never a requirement |
| Output quality | **7/10** | observed work is genuinely good — see §12 |
| Independence | **2/10** | cannot start, cannot see mail, cannot reach each other |
| Coordination | **1/10** | bus unread 16/16 until tonight; all coordination routes through the CEO |
| Business alignment | **4/10** | KPI cards exist but are unscored — `verifier` has never run |

**Class average ≈ 3.8/10.** The variance between agents is smaller than the variance between
dimensions, which tells you the problem is architectural, not per-agent.

---

## 5, 6. DEPENDENCY GRAPH AND OVERLAP

**The graph is a star, not a mesh.** Every edge passes through the CEO session.

```
                    ┌──────────┐
   all 21 agents ──▶│   CEO    │──▶ all 21 agents
                    └──────────┘
        (no agent has ever read another agent's output directly)
```

- **Distinct responsibilities:** ~12 by tool surface (backend, frontend, extension, data, infra, QA,
  design, content, SEO, legal, money, research).
- **Overlapping:** `product-manager` / `chief-of-staff` / CEO all do prioritisation.
  `tech-lead` / `qa-eng` / `verifier` all verify. `content-social` / `seo` both own published words.
- **Redundant:** likely **4–6**. **UNKNOWN** without per-agent execution traces.
- **Circular:** none observed — because nothing delegates.
- **Single point of failure:** **the CEO session. Totally.** If it stops, the company stops.

**Is 21 justified? On the evidence, no.** 21 near-identical prompts with 10 differentiating lines
each is not 21 specialists; it is one generalist and a tool-permission matrix. **The tool scoping is
the only real differentiation, and it is genuinely good.**

---

## 7. CONTEXT AND MEMORY FAILURES

- **No persistent memory.** Every agent starts cold. Confirmed by design.
- **Shared memory existed and was unread**: `bus.py` built 2026-09-01, **16 of 16 messages unread**
  until wired into spawn tonight. *We built a mailbox and wired it to nobody.*
- **Stale context, systemically:** **21/21 agent files cite AM-2**, lifted by AM-9. The files
  literally say: *"Read these BEFORE you answer — they are current; **this file is not**."*
  **A prompt that documents its own staleness is not a prompt, it is an apology.**
- **What agents do NOT know but must:** the current goal, what shipped an hour ago, what another
  agent just found, and what is already fixed. All of it lives in files nobody opens.
- **Context contamination:** low. The prompts are short. **The problem is starvation, not pollution.**

---

## 8. ORCHESTRATION FAILURES

There is **no orchestrator**. There is a human-shaped session doing dispatch by hand. Consequences:

- Agents cannot be triggered by events, only by me typing.
- No dependency resolution: I decide order, from memory.
- **No rollback mechanism at the agent level.** Rollback exists for deploys only.
- No retry, no queue, no backpressure.
- **Work stalls silently:** measured at **12 of 27 rows** with no spawnable owner
  (`WHY-WORK-STALLS.md`).

---

## 9. FALSE-COMPLETION ANALYSIS

**The requested taxonomy, applied to real cases from the last 24h:**

| case | CLAIMED | EXECUTED | VERIFIED | PROVEN |
|---|---|---|---|---|
| W54 deploy key | "still issues GET" | nothing | no | **FALSE — file had been POST since 08-29** |
| Stripe test-mode (CEO) | "we can't take money" | nothing | no | **FALSE — read a sandbox key** |
| PENDING 38% (CEO) | "62% return no answer" | froze marketing | no | **FALSE — dead incident, 146 rows in one day** |
| W58 orphan container (CEO) | "833 MiB leaked" | nothing | no | **FALSE — reaped 21 min before I looked** |
| W60 aggregate fallback | "closed" | 5 files | **13 new tests + live before/after** | **TRUE** |

**The pattern is unmistakable and it is not about the agents.** *Four of the five false claims are
mine.* Every agent-produced claim that was checked held up; **three agents actively refused to
execute a wrong instruction** (`devops` on W54 and W58, `backend-eng` on PENDING).

**Why false completion happens here:** not laziness, not hallucination incentive. It is **reading one
level below the failure** — a sandbox key instead of production, an all-time average instead of a
rate, a container age instead of a replacement age, a code read instead of a browser.

---

## 10. PROMPT FAILURES

- **No acceptance criteria.** 0/21.
- **No failure behaviour** beyond two boilerplate lines.
- **Stale authority.** 21/21 cite a lifted amendment.
- **Personality lines that carry no constraint** — *"You do not trust a value you did not see
  written"* is a nice sentence and enforces nothing.
- **KPI cards that have never been scored.** They name `verifier` as scorer; `verifier` had never run
  until tonight.
- **Optimised for sounding intelligent, not for verified outcomes** — the prompts read well and
  specify almost nothing checkable.

---

## 11. ENGINEERING QUALITY — the counterintuitive result

**Search for defects found almost none.**

| probe | result |
|---|---|
| TODO / FIXME / HACK, both repos | **0** |
| Skipped tests | **0** |
| `NotImplementedError` | **0** |
| Tests passing | **1,342** |
| Test files vs source modules | **111 / 48** |

I initially recorded "33 placeholders" in the frontend. **They are Tailwind `placeholder:` class
variants — not defects.** Reporting them would have been exactly the error this audit exists to find,
so it is recorded here rather than quietly dropped.

**The real product defects are logic, not craft:**
- **`opportunity_score >= 65` against a data ceiling of 59.2 — 0 of 100 models can ever return BUY.**
- **UNKNOWN returned while holding the answer** (fixed today, W60).
- **The host disk reached 100%**, silently stopping every deploy.

---

## 12. QA OF THE QA — and of the roster

**`qa-eng`, `verifier`: UNKNOWN.** Neither had run in the observed window until tonight. `verifier`
is the sole writer of `SCOREBOARD.md`; **no scoreboard has been produced.** The KPI cards in all 21
prompts are therefore decorative.

**But the observed agent work was strong**, and this contradicts the founder's premise:
- `devops` **refused** W54 and disproved it with the platform's own logs.
- `backend-eng` **refused** to ship a redundant fix, calling it *"manufacturing proof"*.
- `frontend-eng` flagged **prompt injection** in `AGENTS.md` and declined to act on it.
- The grey-area workflow **killed its own best-converting feature** on an honesty ground.

**Agents are not the weak link. The scaffolding around them is.**

---

## 13. BUSINESS ALIGNMENT

Objective: **€2,000 MRR by 2026-12-31** (`MISSION.md`). Current: **0 paying, 7 users.**

**Ask of each agent: "what measurable company outcome improves if this agent excels?"**

- **Clear line to revenue:** `backend-eng`, `frontend-eng`, `monetization`, `data-scientist`,
  `content-social`, `seo`, `lifecycle`.
- **Indirect but real:** `devops`, `qa-eng`, `security-eng`, `legal-compliance`, `data-eng`,
  `ux-researcher`, `designer`, `extension-eng`.
- **Flagged — activity, not value, on current evidence:** `chief-of-staff`, `finance-ops`,
  `customer-success`, `verifier`, `product-manager`. **At 0 customers there is no success to manage,
  no finance to operate, and no roadmap to prioritise beyond "make it answer."**

---

## 14. ROOT-CAUSE TREE

```
SYMPTOM      agents deliver less than expected; work stalls; claims prove false
   ↓
DIRECT       nothing distinguishes a claim from a proof, and agents start context-blind
   ↓
SYSTEMIC     (a) 0/21 definitions of done   (b) all state lives in prose nobody reads
             (c) all coordination routes through one human-shaped session
   ↓
ROOT         RULES AND CONTEXT WERE WRITTEN, NOT DELIVERED OR ENFORCED.
             57 rules across 39 docs; 5 mechanised. 52 bugs fixed twice.
```

**Pareto: two root causes explain most observed failures.**

1. **Written-not-delivered (≈60%)** — stale gates, unread mail, 21/21 citing a lifted amendment, the
   12 unassignable rows, the workboard drift.
2. **Claim-not-proof (≈30%)** — every false-completion case, all five in the table above.

The remaining ~10% is ordinary engineering entropy (the disk, the thresholds).

---

## 15. TOP 10 SYSTEMIC PROBLEMS

1. **0 of 21 agents have a definition of done.**
2. **21 of 21 operate under a superseded amendment** (AM-2, lifted by AM-9).
3. **90% of every prompt is boilerplate** — ~10 differentiating lines per agent.
4. **The CEO session is the only orchestrator and a total single point of failure.**
5. **A second, orphaned 22-agent roster** sits in the backend repo with zero overlap.
6. **KPI cards are never scored** — `verifier` has not run.
7. **Agents cannot read each other's output** without the CEO relaying it.
8. **Verification is prose, never a requirement.**
9. **Gates are disproportionate** — three times today a docs check blocked a customer-facing deploy.
10. **The founder's own premise about code quality is wrong**, which has been misdirecting effort.

---

## 16–18. MERGE / REMOVE / MISSING

**Merge:** `chief-of-staff` + `product-manager` (one prioritiser) · `qa-eng` + `verifier` (one prover)
· `content-social` + `seo` (one publisher) · `finance-ops` + `monetization` (one money role).

**Remove or suspend until there are customers:** `customer-success` (0 customers),
`ux-researcher` as standing (fold into `designer`), and **the entire orphaned `demand-intel` roster**.

**Missing, and this is the important half:**
- **An orchestrator** that is not a human session.
- **A verification contract** — a machine-checkable definition of done per task type.
- **An agent that owns "what does a customer actually get?"** Nobody does, which is why 62% dead-end
  answers went unnoticed for weeks by a roster of specialists each doing its own surface well.

---

## 19. INFORMATION STILL REQUIRED

**CRITICAL — 2 questions.**

1. **What was `opportunity_score >= 65` calibrated against?** Nobody can tell whether it is a fossil
   from a rescaling or an aspiration for a better market. **Until this is answered, the product
   cannot honestly say BUY, and every downstream decision — pricing, marketing, the grey-area
   design — rests on it.** Lowering it without the answer is manufacturing proof.
2. **Do you want the roster to be autonomous, or to be tools I direct?** The 21 files describe
   standing autonomous roles; the actual system is manual dispatch. **Both are viable; the current
   half-state produces the worst of each** — agents with the authority of specialists and the context
   of contractors.

**IMPORTANT — 1.** Is the €200/month figure in all 21 prompts genuinely dead, or dead only for model
spend? AM-9 says lifted; every prompt still cites it. **UNKNOWN.**

---

## 20. RECOMMENDED REBUILD PRINCIPLES

*(Principles only — no rebuild performed, per instruction.)*

1. **Deliver context; do not expect recall.** A rule not in the prompt does not exist.
2. **A task is not accepted without a machine-checkable definition of done.**
3. **Differentiate agents by tools and evidence requirements, not by prose personality.** Tool scoping
   is already the best part of this system.
4. **A check blocks a deploy only if what it catches could reach a customer.**
5. **Fewer agents, sharper contracts.** 12 well-specified beats 21 near-identical.
6. **Someone must own the whole customer answer**, not a surface.
7. **Verification is a separate act from execution**, performed by a different agent, on the artifact.
8. **Preserve the refusal behaviour.** Three agents refused wrong instructions today and each was
   right. **Whatever produced that is the most valuable property this system has — do not optimise it
   away in the name of throughput.**
