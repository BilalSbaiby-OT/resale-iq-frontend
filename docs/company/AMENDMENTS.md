# AMENDMENTS to OS.md

`docs/company/OS.md` is the founder's charter, saved verbatim and never edited. Where it
describes a company we do not actually run, the correction lives here. **The constitution is
`OS.md` + this file.** An amendment is only valid with a founder approval date.

Every agent reads both. Where they conflict, the amendment wins, because the amendment is the
one that was checked against the machine.

---

## AM-1 — The stack is FastAPI + SQLite, not Next.js + Supabase
**Approved by the founder 2026-08-31** ("our stack is different from the prompt, adapt to it").
Supersedes: OS §2 (backend-eng role), §3 (source column), §5 (Standards), §9 (dashboard), §11 Q2.

| OS.md says | Reality | What replaces it |
|---|---|---|
| Next.js + **Supabase** | Next.js 16 frontend + **FastAPI** backend | `backend-eng` owns FastAPI routes in `demand-intel/api/`, not Supabase |
| **RLS on every table** | SQLite has no RLS | **Every read path is scoped in the query layer**, and that scoping gets its own test. This is a weaker guarantee than RLS and must be treated as such: a missing `WHERE user_id = ?` is a data breach, not a bug. |
| Supabase schema/edge functions/`pgvector` | `demand-intel/db/schema.py`, `db/queries.py`, a single 56 GB SQLite file | Migrations are Python + SQL against that file, reversible, with `pipeline_version` bumped on any data-shape change |
| `Bash(psql *)` in the agent tool list | `sqlite3` | Agents get `sqlite3` **read-only**: `sqlite3 'file:…/demand_intel.db?mode=ro'`. Always `LIMIT`. |
| §9 dashboard runs SQL "on the read replica" | **There is no read replica** | `scripts/build_dashboard.py` runs against a **snapshot copy**, never the live file. A long analytical scan on the file production is serving is a real risk, and a launchd scraper writes to it every 2 hours. |
| §11 Q2 "prod and staging: same Supabase project?" | Unanswerable as written | The real question: **is there a second database, or does agent work read and write the file production serves?** Phase 1 `DATA.md` answers it. If it is the same file, that is P0 #1 exactly as the OS intends. |

## AM-2 — Spend cap: €200/month, all-in
**Approved by the founder 2026-08-31** ("I don't have a monthly spending cap but I wouldn't like it
to exceed 200 euros"). Supersedes: OS §11 Q1.

€200/month covers **infra + Claude spend together** (Hetzner, Coolify, domain, model usage).
Treated as a KPI with a hard behaviour, per OS §0.8:
- ≥ 80 % (€160) → the dashboard panel goes red and `finance-ops` raises it in the digest.
- ≥ 100 % → new agent work stops except P0 and anything customer-facing; the CEO parks the rest.
Model policy stays: Sonnet by default, Opus only for judgement (data science, tech-lead review,
the CEO), Haiku for grep and verification.

## AM-3 — The Business €99 tier is cut
**Approved by the founder 2026-08-31** ("I prefer not having it because there is nothing I can
provide right now; I prefer focusing on the main things"). Supersedes: OS §1, §2 (`sales` agent),
§11 Q6.

- The `sales` agent is **not created**. The role is deleted from the roster, not parked.
- The tier comes off the pricing page, the JSON-LD, the sitemap and the Stripe surface as one
  reviewable PR in Phase 2. `MONEY.md` maps that surface first.
- **Blocking pre-condition:** if any customer is currently on Business €99, nothing is removed
  until the founder decides what happens to them. Cutting something a paying user uses is a
  founder gate (OS §0.10) and stays one.
- Publishing the change to the live pricing page remains a separate founder gate.

## AM-4 — The Stop gate is armed
**Approved by the founder 2026-08-31** ("if it's correct and would cause no issue for us"), after
the condition was verified: the unattended loop has been cold since 2026-08-28, has no runner
script, no cron entry and no launchd job. Evidence is in `.claude/STOP_GATE_ON`.
Restores OS §5 as written. If an unattended loop is ever restarted, delete that flag file first.

## AM-5 — There is no `ConfigChange` hook event
**Installed 2026-08-31, Phase 0.** OS §8 asks for a `ConfigChange` hook. Claude Code has no such
event. Harness protection is enforced inside `PreToolUse` (`.claude/hooks/guard.py`) instead: any
write to `.claude/settings*.json`, `.claude/hooks/`, `.claude/agents/`, `OS.md`, `METRICS.md`,
`SCOREBOARD.md`, `MATCH-AUDIT.md` or `CALIBRATION.md` is blocked unless `.claude/UNLOCK_HARNESS`
exists. Same guarantee, real mechanism.

## AM-6 — Company root is `resale-iq/`
**Approved by the founder 2026-08-31** (APPROVALS A1). The OS says "the repo root"; the company
spans four repos. `docs/company/`, `docs/audit/`, `sql/metrics/`, `dashboard/` and the rails live
in `resale-iq`. `demand-intel` keeps the backend and the database and is governed from here.


---

## AM-7 — A decision that touches another agent's surface, or the product as a whole, requires consulting the whole roster

**Founder instruction, 2026-09-01, verbatim in substance:** *"in big decisions etc that touches other
sub agents or the whole saas please consult all sub agents."*

This is now standing, not per-request. It applies before — not after — a change that:

- alters a surface another agent owns,
- changes what a customer is shown or charged,
- changes a KPI definition or the evidence behind a published number, or
- deploys.

**Why it is an amendment and not a preference.** Every material correction of 2026-09-01 came from an
agent contradicting the CEO, and none of them would have surfaced from a solo pass:

- `tech-lead` found the C6 fix was manufacturing fabricated sales into the column C4 had just made
  authoritative — my own two commits fighting each other.
- `data-scientist` found that `band_evidence_p50`, which I built to authorise A13, **falls** under
  A13 and would have scored the honest change a MISS.
- `verifier` found the Phase-0 proof certified one repo of four, then found my correction of that
  was itself incomplete.
- `monetization` resolved a contradiction against git while `ux-researcher` had inferred it from
  documentation — and the documentation was mine, and wrong.

The consultation is not ceremony. **It has never once returned unanimous agreement with the
proposal put to it.**

**The founder's own condition, kept:** deploy is authorised *only* after consulting the whole team.
