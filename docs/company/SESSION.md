# SESSION

**Updated** 2026-09-01 (CEO, morning)

## Working on

**The post-deploy merge queue.** C6/C5/C4 are LIVE — `demand-intel` `a8ac5bd..e771ea7`, container
verified on `e771ea7` via `SOURCE_COMMIT`. `resale-iq` pushed (87 commits, no `src/`).

`claude/backend-eng/gate-paid-surfaces` is rebased onto merged main and **green at 1201 tests**.

The C5 × gate interaction was found two independent ways — `tech-lead` by reading, and me by
rehearsing all six branches together in a throwaway worktree (**11 failures**, every branch green
alone). Post-C5 a legacy row is withheld rather than failing open, which is correct, but the withheld
branch was reporting **"Only 0 comparable sold items"** — the exact fabricated observation the gate
exists to prevent. **Unknown is not zero.** It now reports `comparable_n = None` with *"we have no
comparable count for this model."*

Three fixtures corrected in the two entitlement suites. They seeded `comparable_n` unset on the old
fail-open assumption, so post-C5 a test asserting *"a paying customer still gets every number"* would
have passed by confirming the paid user correctly receives fields blanked for everyone. **A test that
cannot fail is worse than no test.**

**In flight right now:** `tech-lead` reading the three held demand-intel branches (it must not review
the gate's rebase — I authored that, OS §0.7 — but it has the untouched `resale_routes.py` call
sites); `frontend-eng` executing the A15 ruling.

## Revoked a stale deploy approval, 2026-09-01 ~10:20

`.claude/DEPLOY_APPROVED` was **still armed** in `resale-iq`, carrying last night's text
(*"founder: merge C6/C5/C4, reviewed by tech-lead"*). **That deploy already happened at 08:22.** The
token was consumed and never removed, so it stood as a standing authorisation for any `git push
origin main` in this repo — by me or by any agent holding `Bash(git *)`.

`SECURITY-LOG.md` shows the rail logging **DEPLOY ALLOWED** for a bare `git push origin main` at
`08:54:45`. **No push landed** — `origin/main..main` is 3 commits, all still local — but the rail
would not have stopped one.

**Deleted.** A founder approval is per-deploy, not a mode. It has to be re-issued for the A13 + gate
release, which is correct: that release has not been consulted yet.

Open question I could not answer from the log: **what issued that push attempt.** Four agents with
`Bash(git *)` were running. The log records the command and the verdict, not the caller — which is a
gap in the log, not in the rail.

## Blocked

Nothing is blocked on the founder. Seven branches remain **UNREVIEWED — not rejected**:
`pending-failsafe`, `delete-ecc-harness`, `lifecycle/trial-emails` (I am partly its author; someone
else must review it), and all four `resale-iq` branches.

`tech-lead` refused to approve on test counts and was right: *"C6 passed 1173 tests."*

## Proof

- `demand-intel` main: **1180 tests**; gate branch **1201**.
- `docs/audit/proof/fx-currency/proof.sh` — 16/16 cold.
- Rejected `af4042d` verified **ABSENT** from main's ancestry (squash-merge, deliberate).
- `resale-iq` — 5 proofs: metrics 10/10, secret-rail 15/15, phase0 40/40, canary 28/28,
  rails-coverage **1/4 (FAILS BY DESIGN** until A12's rollout lands; do not make it pass by deleting
  the assertion).

## Next 3

1. Land `tech-lead`'s verdicts on `pending-failsafe` and `delete-ecc-harness`; find a reviewer for
   `lifecycle/trial-emails` who is not me.
2. **Merge gate + A13 as ONE release.** The release note MUST disclose that ~23 models' buy-below
   moves, median **20.3%**. Confirm `Levi's Trucker` (€4.65 → €12.10, **+160.2%**, 5 comps) is inside
   the gated 18.
3. A15: merge `conversion-moments`, rebase `landing-truth` on top, re-run the 24 e2e.

## Do not

- **Do not approve a branch on a test count.** C6 passed 1173 tests and manufactured sales.
- **Do not merge all branches at once** — rehearse in a worktree. That is what found the 11.
- **Do not create `UNLOCK_HARNESS` or `DEPLOY_APPROVED` for myself.**
- **Do not quote "6 models / 12.2%"** — the real figure is **2 models / 9.4%**. `_verdict_confidence`
  gates on three conditions, not one.
- **Do not quote `band_coverage` without ±3pp** — it moved 43.0 → 40.0 in two hours with no code
  change.
- **Do not make this repo public without a scrub pass (A18)** — 45 production-topology references.
- **Do not review `lifecycle/trial-emails` myself** (partly its author, OS §0.7).
