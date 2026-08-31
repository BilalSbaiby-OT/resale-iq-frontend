# APPROVALS — the founder's inbox

One line each, newest at the top. `- [ ]` = waiting on you. `- [x]` = decided, with the date.
Nothing here stops the company: the CEO parks the item and takes the next one. The **only**
blocking stop is Founder Gate #1 at the end of Phase 1 (OS §8).

---

## Open

### A1 — Company root is `~/Desktop/resale-iq/` (veto if wrong)
- [ ] The OS says "the repo root", but the company spans four repos. I put `docs/company/`,
  `docs/audit/` and the rails in **`resale-iq`** because it is the product repo, it already holds
  the cross-repo lock (`agent/LANES.md`, which `demand-intel/CLAUDE.md` points at), and it ships the
  site and the extension. `demand-intel` keeps the backend and the database. **Veto and name another
  root, or say nothing and it stands.**

### A2 — The Stop gate is installed but disarmed
- [ ] OS §8 wants `Stop` to block a session that stops without proof. You already run an unattended
  loop in this repo whose wrapper needs the process to die (`.claude/hooks/stop.sh` says so in a
  comment). A blocking `Stop` would wedge that loop. So the gate **records** by default and only
  blocks when `.claude/STOP_GATE_ON` exists. **Arm it once the loop is retired — or tell me the loop
  is already dead and I arm it now.**

### A3 — The OS describes a stack this company does not run
- [ ] `OS.md` §1/§2/§3/§5/§9/§11 assume **Next.js + Supabase** with RLS, edge functions and a
  **read replica**. The real backend is **FastAPI + a single 56 GB SQLite file**
  (`demand-intel/demand_intel.db`, 56,428,421,120 bytes on 2026-08-28). There is no Supabase, no
  RLS, and no read replica for `scripts/build_dashboard.py` to query. This changes three things:
  - §11 Q2 ("prod and staging: same Supabase project?") is unanswerable as written. The real
    question is: **is there any staging database at all, or does the agent read and write the same
    file production serves?** Phase 1 will answer it; if the answer is "the same file", that is P0 #1.
  - §5 "RLS on every table" has to become "every read path is scoped in the query layer" — a weaker
    guarantee that needs its own test.
  - §9's dashboard must read a **snapshot copy** of the DB, not the live file. A 56 GB SQLite file
    in WAL mode can be read concurrently, but a long analytical scan on the file production is
    serving is a real risk.
  **Confirm I should adapt the OS to the real stack in Phase 2 rather than build toward Supabase.**

### A4 — `demand-intel` has an uncommitted change on `main`
- [ ] `api/routes.py` is modified and uncommitted in the backend repo, and a push to `main` there
  deploys the customer-facing API. `agent/LANES.md` is explicit that an uncommitted tree is the one
  state another agent cannot reason about. It is not mine and I have not touched it.
  **Whose is it, and should it be committed, branched, or reverted?**

### A5 — §1 contradiction, already confirmed without the audit
- [ ] `CLAUDE.md` lists **"REST API · Order Planner"** under **Hard no**. The live pricing page
  **sells both** on Pro €49. One of the two is wrong and a paying customer is on the wrong side of
  it. Phase 1 `CLAIMS.md` will scope it; the fix is a founder call because it touches a price tier.
  **Which is true: does Pro include a REST API and an Order Planner, or does the page lie?**

### A6 — Founder Gate #1 inputs (OS §11), restated for the real stack
- [ ] 1. Monthly spend cap (infra + Claude) in €.
- [ ] 2. Staging: is there a second database, or is the agent reading the file production serves? (see A3)
- [ ] 3. Sold prices stored, or asking prices only? Everything in Quality depends on it.
- [ ] 4. Which of Price Compare / Order Planner / fee calculator / portfolio P&L / manual / blog /
  API has had a **paying** user in the last 30 days? Anything without one is a CUT candidate.
- [ ] 5. Second growth channel after Reddit: X or IG — wherever you already have followers.
- [ ] 6. Who answers Business €99 leads — you, or `sales` drafts and you send?

---

## Decided

- [x] **2026-08-31 — Phase 0 rails installed.** Authorised by the founder's own bootstrap message
  (OS §8 Phase 0). `.claude/UNLOCK_HARNESS` was used once, for one edit, then removed; both the use
  and the re-arming are in `SECURITY-LOG.md`.
