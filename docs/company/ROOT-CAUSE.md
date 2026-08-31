# ROOT-CAUSE — why work kept being "done" without working

**2026-09-01.** The founder: *"could you find the underlying issues that cause you to not finish
work and check if its working and implemented and working for me — and fix the issue to not happen
again."*

`GAPS.md` lists the symptoms. This is the disease, and the fix.

---

## The one root cause

**I verified that artefacts exist. I never verified the system as configured actually uses them.**

Every failure below is the same shape: a component that works, tested in isolation, wired to nothing.

| What I reported | What was true |
|---|---|
| "Phase 3 complete — 21 agent files" | The roster was in `resale-iq/.claude/agents/`; every agent was spawned from a session rooted at `~/Desktop`, where it does not resolve. **Not one of the 21 was ever loaded** — every spawn silently fell back to `general-purpose` |
| "Stop gate armed" (AM-4) | `Stop` was wired only in `resale-iq/.claude/settings.json`. The session runs from `~/Desktop`, which had only `SubagentStop`. It never fired — through two production deploys |
| "Rails proven, 41/41" | `test_rails.py:5` invokes the hooks **by hardcoded absolute path**. If `settings.json` stopped registering them, all 41 still pass while the repo runs completely ungated |
| Activity ledger working | 1,420 rows, every one attributed to `ceo`, because `CLAUDE_AGENT_NAME` is never set and main + subagents share one session id |

The test suite was the problem, not the safety net. **41/41 green is compatible with a completely
ungated repo**, because the tests name their own subject.

### Two secondary causes, both evidenced

**Presence read as capability.** I told the founder twice that Reddit was connectable because
`REDDIT_CLIENT_ID` appeared in a list of variable *names*. Confirmed today at the value level:
`REDDIT_CLIENT_ID: NAME PRESENT, VALUE EMPTY`. The rule was already written in this codebase, at
`resale-iq-growth/scripts/doctor.js:6-8` — *"a key that is set but rejected is worse than no key"* —
and I never ran it.

**Mechanism reasoned about instead of measured.** I declared the "scraped every 30 min" claim FALSE
from reading a launchd plist. `DATA.md` measured 353 real scrape intervals and proved it **TRUE**.
Separately I concluded attribution was fine because migrations run at startup; the GTM agent ran the
query and found the traffic was the founder's own `/admin` browsing.

### The rule I broke was already written here

`resale-iq-growth/skills/resale-iq-verify/scripts/verify.mjs:9-14`, by a previous session:

> *"A check that found nothing to look at is a FAILURE, not a pass. A green run that inspected zero
> rows is confidence without evidence — worse than no check, because it stops anyone else from
> looking."*

I proved the point again while fixing it: my first script to remove the 8 dead hook registrations
found **zero** (the paths were quote-wrapped, so `endswith(".js")` failed) and **reported success**.
The corrected version asserts `dead` is non-empty before writing — a detector that finds nothing in
a file known to be broken has failed, not passed.

---

## Fixed today — step 0, all verified

Broken state was captured to
`resale-iq-growth/skills/resale-iq-verify/fixtures/broken-wiring-2026-08-31.json` **before** any fix,
so the self-test can prove each predicate still bites. Fixing before capturing is what makes a fix
folkloric instead of permanent.

| # | Defect | Status |
|---|---|---|
| 1 | `~/.claude/settings.json` registered **8 hook events** at `/private/tmp/Claude-Code-Agent-Monitor/scripts/hook-handler.js`, which does not exist — 15 `Cannot find module` errors, two failed `node` spawns per tool call, and `/private/tmp` is tmp-cleaned so it would re-break | **FIXED** — 0 events left |
| 2 | `StopFailure` is not a valid Claude Code hook event; `stop-failure.sh` had never run from the harness | **FIXED** |
| 4 | `~/Desktop` absent from `guard.py` `SCOPE` — `Read` on the settings file governing the session was blocked as out-of-scope | **FIXED** |
| 5 | `.claude/DEPLOY_APPROVED` not gitignored while its three siblings were — a production deploy token was committable | **FIXED** |
| 6 | `with-secrets.sh` **dot-sourced** the credential file, so a malformed line **executed as shell** (live `line 21: by: command not found` on every run) — arbitrary code execution in the one sanctioned credential path | **FIXED** — parses `KEY=VALUE` |
| 8 | `~/.claude/plans` absent from `SCOPE` — the rails blocked the plan describing this fix | **FIXED** |
| — | Event wiring differed between the two roots | **FIXED** — both roots now identical |

Verified after: rails **40/40**, Postiz `/integrations` **200**, Stripe `/v1/balance` **200**, and the
shell-execution warning is gone.

---

## The permanent fix

Three new layers in the **existing** `verify.mjs` harness — not a new one, because a verifier nobody
runs is the disease. Predicates in a new `wiring.mjs`, **imported never inlined**
(`verify.mjs:16-19` records that an inlined copy already drifted, and the self-test proved a fixed
predicate while the harness ran the broken one).

- **`harness`** (offline, <200ms): every registered hook command exists · is executable · event name
  valid · **events wired in one root are wired in the other** · roster resolves from the session's
  project dir · flags gitignored · **end-to-end probe — each registered blocking hook actually
  blocks, and its negative control passes**
- **`credentials`** (live auth through `with-secrets.sh`, values never printed): non-empty **and**
  authenticating. GSC reports `— NOT CHECKED` rather than green from an unconnected MCP
- **`production`**: freshness and disk ingested from `health_check.py`, never re-implemented
- **`claims`**: every `DONE` in `OS-COMPLIANCE.md` names a check that passed this run

**The single highest-leverage change: `test_rails.py:5`.** Deriving the hook paths from
`settings.json` instead of hardcoding them makes "the component works" and "the component is wired"
the same assertion. That one line is the structural fix.

**Runs:** hourly launchd (the only tier that runs when no session exists — there are currently 0 cron
and 0 launchd jobs for the OS) · advisory at `SessionStart` · blocking at `Stop`, **harness layer
only**, never on credentials or production, and only after clean unattended runs.

**Reports:** a ~20-line block generated from `status.json`, never composed as prose, ending every
turn. No percentage — a score invites optimising the score, which is how "41/63 DONE" happened.

**Claims register:** a `Check` column in `OS-COMPLIANCE.md`. `DONE` requires a named check that
passed. Founder-approved consequence: the headline drops from **41 DONE to roughly 8**. If the
number does not fall, nothing is bound.
