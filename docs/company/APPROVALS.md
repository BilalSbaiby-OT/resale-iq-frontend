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
- [ ] Measured, not assumed (`~/Library/Logs/resaleiq/tcc-probe.log`, 2026-09-01): a launchd job
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
