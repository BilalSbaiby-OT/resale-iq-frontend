# GAPS — what I forgot, broke, or built and never used

**2026-08-31.** The founder: *"check the prompt again and find other things you forgot or didn't
create or didn't finish or finished and not working or working and you are not using. i dont want
to remind you again of anything."*

Fair. This is that audit, checked against the filesystem rather than against my memory of it.
`OS-COMPLIANCE.md` lists what is done. This lists what is **wrong**, which is the more useful half.

Four categories, worst first: **things that looked done and were not working at all.**

---

## A. Built, reported as working, actually inert — FIXED THIS SESSION

### A1 — The 21-agent roster was invisible. Every agent I spawned was `general-purpose`.
The roster lives in `resale-iq/.claude/agents/`. Every agent this session was spawned from a
session whose project dir is **`~/Desktop`**, where `.claude/agents/` did not exist. Claude Code
resolves agent types from the project directory, so **not one of the 21 files was ever loaded**.
I built an org chart, put it somewhere the company cannot see it, and then reported it as Phase 3
complete. **Fixed:** `~/Desktop/.claude/agents` now symlinks to the roster; 21 agents resolve.

### A2 — The Stop gate was "armed" and never fired.
`AMENDMENTS.md` AM-4 records arming the Definition-of-Done gate after verifying the loop was cold.
But `Stop` was only wired in `resale-iq/.claude/settings.json`, and this session runs from
`~/Desktop`, whose settings had **only `SubagentStop`**. So the gate has been decorative all
session — including through two production deploys. **Fixed:** `Stop` wired at the Desktop level.

### A3 — Every one of 1,380 activity rows claimed to be the CEO's work.
`activity.py` defaulted `agent` to `"ceo"` when `CLAUDE_AGENT_NAME` was unset — and it is always
unset. Main session and subagents also share **one** session id, so the hook genuinely cannot tell
them apart. The result was a ledger asserting that every subagent's edit was mine, and a dashboard
column counting it. That is a false attribution dressed as data, which is exactly what rule 2
exists to stop. **Fixed:** the field now says `unattributed`, and the dashboard reports per-agent
events as not-derivable. Agent work is attributed by **branches and commits**, which is real.

### A4 — The lock said "Phase 1 audit (read-only)" for six hours, through two deploys.
`.claude/LOCK` is injected at every session start, so it was actively misinforming. **Fixed**, and
the file now carries a note that a stale lock is a bug rather than a formality.

---

## B. Never created — the prompt asks for these and they do not exist

| # | Missing | OS ref | Why it matters |
|---|---|---|---|
| ~~B1~~ **DONE 2026-09-01** (`9174d3c`) — `sql/metrics/` + runner + production path shipped; `METRICS.md` itself blocked at the founder gate, parked as APPROVALS **A8** | ~~**`docs/company/METRICS.md` + `sql/metrics/*.sql`**~~ | §3 | **The single biggest gap.** Every KPI in §3 is supposed to have one SQL file. Without it the North Star, retention, band coverage and match precision panels are permanently UNKNOWN, and "no KPI is ever computed ad hoc" is unenforceable |
| B2 | `GOALS.md`, `SCOREBOARD.md` | §4, §7 | The whole reward/penalty loop is inert. Nothing is pre-registered, nothing is scored, tiers can never move |
| B3 | `OKRS.md`, `ROADMAP.md` | §4 | Deliberately deferred — an OKR set written at €0 MRR and 6 users would be fiction. Still owed |
| ~~B4~~ **DONE** | `docs/eng/STANDARDS.md` written, VERIFIED rules separated from INHERITED ones | §5 | Built from this session's incidents plus the 17 preserved `.claude/rules/` files. Found that ECC rule 0 already forbade relaxing the `sold_observed` predicate — the rule existed while the code violated it (C4) |
| B5 | `docs/product/prd/`, `docs/eng/adr/`, `docs/product/releases/` | §4, §5 | "Nothing is built without a PRD" — and four things shipped today without one |
| B6 | `data/quarantine/` | §2 | Untrusted (R-tier) agents are supposed to write structured JSON here and nowhere else |
| B7 | **Skills** — `gates, canary, sanitize-untrusted, precision-audit, proof, chrome-walk, postiz-draft, stripe-read, prd, adr, code-review, release-notes, design-review` | §8 Ph3 | `.claude/skills/` does not exist |
| B8 | **Commands** — `/audit /fix-p0 /weekly /canary /precision /calibration /truth /bulk /security /support-voice /rollback /approvals /scoreboard /retro /okrs /sprint /prd /dashboard` | §8 Ph3 | `.claude/commands/` does not exist. The founder cannot drive any of this by name |
| B9 | **Phase 4 schedulers** — 0 cron entries, 0 launchd jobs | §8 Ph4 | Nothing runs unattended. The dashboard's hourly refresh, the daily P0 pass and the Monday precision/retro all exist only as prose |
| B10 | Canary set of 60 frozen labelled listings | §8 Ph2 | Phase 2's exit criterion. Quality is unverifiable without it |
| B11 | Feature flags / dark ship | §5 | Everything shipped today went straight to 100% of users |

---

## C. Finished but not working properly

| # | Problem | Evidence |
|---|---|---|
| C1 | **`demand-intel/CLAUDE.md` is 395 lines**; the prompt caps it at 60 | §8 Ph3. `resale-iq/CLAUDE.md` is fine at 46 |
| ~~C2~~ **MOSTLY DONE** `85f77fc` — 1,156 files → 43, 11M → 408K. 159 skills, 45 commands and the ECC scripts deleted. The 22 agents + hooks are PROTECTED paths, parked as APPROVALS **A10**. `.claude/rules/` kept: HARNESS says MERGE, not delete | `HARNESS.md` recommended DELETE with evidence none has ever run. I wrote the recommendation and never executed it |
| C3 | Playwright still gates nothing | The frontend deployed today on typecheck + build alone |
| ~~C4~~ **FIXED** `d3850d9` | now reads `sold_observed=1`. Root cause was **not** brokenness: no prediction has ever been ripe (oldest 27d, window 30d; first eligible ~2026-09-04) | Ran the production query `DATA.md` §900 asked for: **5,332,659 of 5,435,995 sold rows (98.1%) were never observed** |
| ~~C5~~ **FIXED** `c1143d3` | fails closed now | Measured first: production `model_signals` has `comparable_n` on **100/100** rows, so the fail-open protected nothing live. The North Star is now a count, not an upper bound |
| ~~C6~~ **FIXED** `af4042d` | five rates added **and** `to_eur()` fails closed on any unknown currency | `DATA.md` §19. The rates fix today's five markets; failing closed fixes the next one Vinted adds |
| C7 | Ingestion monitoring is a liveness check | asserts a scrape *ran*, never that a row *landed*. **Partly addressed:** `sql/metrics/pipeline_lag_min.sql` now measures freshness from rows LANDING (`items_new > 0`), reading 1.5 min over 1,344 productive runs. The **alerting** is still liveness-based |

---

## D. Working, and I am not using it

| # | Thing | Why that is bad |
|---|---|---|
| D1 | **The 21 agent files** (A1) | Now visible. From here on, spawns name a roster agent — `backend-eng`, `data-scientist` — not `general-purpose`, so the KPI cards and tool restrictions actually bind |
| D2 | **`docs/audit/proof/W36/*/proof.sh`** | Written and only ever run by me, by hand. `verifier` is supposed to run them cold on a schedule — blocked on B9 |
| D3 | **`with-secrets.sh`** | Works well, and I only discovered `POSTIZ_API_KEY` was already sitting in env *after* an agent spent a run trying to deploy a second Postiz. Nobody checked the inventory first |
| D4 | **The 155-skill ECC library** | Either use the handful that fit or delete all of it (C2). Leaving it is the worst of both |
| D5 | **`docs/audit/DATA.md`** — 903 lines, 8 P0s | The best document produced this session and not one of its P0s has been actioned |

---

## The order I will work it

1. ~~**B1 — `METRICS.md` + `sql/metrics/`.**~~ **DONE** (`9174d3c`). Four UNKNOWN panels became
   numbers. It also did part of B9: the hourly job now refreshes the dashboard. And it produced the
   first real reading — **`band_coverage` 59.1 % against a ≥ 80 % target**, and
   **`n_predictions_resolved` 0 of 340**, which is C4 at ten times the scale this file assumed.
2. **B9 — schedulers.** Nothing is autonomous until this exists; it is the difference between a
   company and a folder of documents.
3. **B8 + B7 — commands and skills**, so the founder can drive this by name.
4. ~~**C6, C5, C4**~~ — **ALL THREE DONE** on `claude/backend-eng/data-defects-c6-c5-c4`, 1173
   tests, each with a negative control. They turned out to be **one bug wearing three hats: failing
   open.** An unknown currency, an absent `comparable_n` and an unobserved sale were each treated as
   "probably fine", and each published a confident number we had not earned. Not merged, not
   deployed — `tech-lead` reviews, since I wrote them (OS §0 rule 7).
5. **C2** — execute the ECC deletion I already recommended: 159 skills, 45 commands, 22 agents in
   `demand-intel/.claude/`. Counted this session, still not done.

Written down so it does not need to be asked for again.
