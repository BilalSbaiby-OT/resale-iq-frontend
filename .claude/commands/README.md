# Commands — five, not eighteen

`GAPS.md` B8 lists eighteen commands the OS asks for:

    /audit /fix-p0 /weekly /canary /precision /calibration /truth /bulk /security
    /support-voice /rollback /approvals /scoreboard /retro /okrs /sprint /prd /dashboard

**Five exist.** The other thirteen are deliberately absent, and this file is why.

## The rule applied here

`GAPS.md` D4, about the 155-skill ECC library nobody has ever run: *"Either use the handful that fit
or delete all of it. Leaving it is the worst of both."*

A command whose machinery does not exist is a command that fails when the founder types it. Thirteen
of those would teach the founder that the slash commands do not work — which costs more than not
having them. So a command ships here only when the thing it drives already runs.

## What exists, and what it runs

| Command | Runs | Proven by |
|---|---|---|
| `/status` | `scripts/company/status_report.py` | runs hourly under launchd, GREEN with no session open |
| `/metrics` | `scripts/company/metrics.py` + `sql/metrics/` | `docs/audit/proof/W36/metrics/proof.sh`, 8/8 cold |
| `/dashboard` | `build_dashboard.py --prod` | `production/dashboard-data-fresh` check |
| `/proof` | every `docs/audit/proof/**/proof.sh` | they are the proofs |
| `/approvals` | reads `docs/company/APPROVALS.md` | the file exists and is current |

## What is missing, and the ONE thing each needs

Not a wishlist — each row names the specific artefact that would make the command real.

| Command | Blocked on |
|---|---|
| `/precision` | a `match_audit` table. §3 wants a 30-sample weekly **human** audit; no query substitutes for it |
| `/canary` | the 60 frozen labelled listings (`GAPS.md` B10, Phase 2's exit criterion) |
| `/calibration` | predictions that have ripened. The first become eligible ~2026-09-04 (`GAPS.md` C4) |
| `/scoreboard` | `SCOREBOARD.md`, which only `verifier` may write (OS §7) |
| `/okrs` `/sprint` `/retro` `/weekly` | `GOALS.md` + `OKRS.md`. Deliberately deferred: an OKR set written at €0 MRR and 6 users would be fiction |
| `/prd` | `docs/product/prd/` and a template (`GAPS.md` B5) |
| `/rollback` | the `deploys` table being written by the deploy path — it has 1 row, dated 2026-08-12 |
| `/security` | nothing structural; `SECURITY-LOG.md` is maintained by hand and would need parsing |
| `/audit` `/fix-p0` `/truth` `/bulk` `/support-voice` | these are workflows over the above, not primitives |

**Add a command the day its machinery lands, not before.**
