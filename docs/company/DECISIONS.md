# DECISIONS

Append-only. Newest first. A decision here is settled — reopen it only with new evidence, and
then write a new entry rather than editing the old one.

---

## 2026-08-31 — Founder's answers to APPROVALS A1–A6

| # | Decision | Founder's words | Status |
|---|---|---|---|
| A1 | Company root is `resale-iq/` | "i approve a1" | **Settled.** [[AMENDMENTS.md AM-6]] |
| A2 | Stop gate armed | "if its correct and would cause no issue for us" | **Settled**, condition verified first — see below. AM-4 |
| A3 | Adapt the OS to the real stack | "sure yeah our stack is different from the prompt, adapt to it" | **Settled.** AM-1 |
| A4 | The uncommitted `demand-intel/api/routes.py` | "check and decide yourself with the agents after" | **Delegated to the CEO.** Open — decided after the audit. |
| A5 | REST API / Order Planner vs the `Hard no` list | "plan yourself with the sub agents after" | **Delegated to the CEO.** Open — `CLAIMS.md` scopes it, then a PRD. |
| A6.1 | Spend cap | "i don't have monthly spending cap but i wont like it to exceed 200 euros" | **Settled: €200/month all-in.** AM-2 |
| A6.2 | Staging vs production DB | "check everything yourself" | **Delegated.** `DATA.md` answers it. If it is one file, that is P0 #1. |
| A6.3 | Sold prices or asking prices | "check best way with sub agents, the specialized one that is experienced with this" | **Delegated** to the Opus data audit. Everything in Quality depends on the answer. |
| A6.4 | Which features have a paying user | "check everything yourself" | **Delegated.** `MONEY.md` produces the table; features with no telemetry are reported as NOT MEASURABLE, not as zero. |
| A6.5 | Second growth channel | "on postiz i already have the platforms that im signed up on, i will add when you ask for it" | **Delegated.** The audit reports which channels are actually connected and recommends one; the founder connects more only on request. |
| A6.6 | Business €99 | "i prefer not having it because there is nothing i can provide right now; i prefer focusing on main things" | **Settled: the tier is cut, and the `sales` agent is never created.** AM-3 |

### Why A2 was armed rather than parked
The founder's approval was conditional — "if it causes no issue for us". The issue would have been
wedging the unattended loop, so that was checked before arming, not assumed:

- last loop session `2026-08-28T15:40:49Z` (`agent/loop.log`), three days cold
- no loop runner script in the repo, no cron entry, no launchd job that runs `claude`
  (the two launchd jobs are the 2-hourly scraper and an unrelated `flippr`)
- lane lock free: `agent/HANDOFF.md` → `STATUS: READY`, `OWNER: none`

The gate blocks a stop **once** and then lets it through, so its worst case is one extra cycle,
and what it enforces is `CLAUDE.md`'s own "commit before you stop" rule. Evidence is kept in
`.claude/STOP_GATE_ON`; delete that file before any unattended loop is restarted.

### What "delegated to the CEO" costs the founder
Five of the eleven items came back as "decide yourself". That is autonomy, not silence: each one
gets a written decision in this file with the evidence that drove it, and anything that touches a
price, a paying customer, a published page or an outbound message still stops at a founder gate
(OS §0.10) no matter what the audit concludes.

---

## 2026-08-31 — Phase 0 rails installed
Authorised by the founder's bootstrap message (OS §8). Hooks over prose, because the harness runs
unattended. Every deny rule ships with a negative control, since a rule that also blocks the benign
case is broken rather than strict. Proof: `docs/audit/proof/W36/phase0/proof.sh`, 26/26.
`.claude/UNLOCK_HARNESS` was used once and removed; both facts are in `SECURITY-LOG.md`.
