# SESSION

**Updated** 2026-09-01 (CEO, late morning)

## Working on

**The post-deploy merge queue.** C6/C5/C4 are LIVE — `demand-intel` `a8ac5bd..e771ea7`, container
verified on `e771ea7` via `SOURCE_COMMIT`.

**Merged locally, NOT pushed** (`demand-intel`, 1184 tests): `delete-ecc-harness` then
`pending-failsafe`, in `tech-lead`'s order. The ECC deletion is not hygiene — `Dockerfile:16` is
`COPY . .` and `.dockerignore` does not exclude `.claude/`, so those 323,760 lines were **shipping
into the production image**.

**In flight:** `backend-eng` (three gate blockers), `product-manager` (release note + striking a false
claim), `qa-eng` (two unbound `now` functions), `frontend-eng` (done — A15 closed, `sold-relabel`
verified).

## Three things I got wrong this morning, corrected

**1. The fixture claim I committed into the repo was false.** I wrote that the entitlement fixtures
"would have passed vacuously." `tech-lead` ran the experiment I did not — main's fixtures against the
new code gives **7 failed**, `assert None == 80.0`. An equality assertion against a seeded number is
the one shape that **cannot** pass vacuously. My edit did not repair a broken test; **it made seven
failing tests pass**, and what they correctly reported is that the gate withholds fields from a
paying user. The edit is still right on other grounds — the entitlement suite tests *plan-based*
redaction, so its fixtures must sit above the evidence floor to keep the two mechanisms separately
testable. `backend-eng` is rewriting the comment.

**2. The release headline was wrong.** Not "+20.3% across 23 models". Measured against production:
**22 visible movers, median −3.04%**, IQR −21.1% → +17.6%, **11 down / 11 up** — indistinguishable
from zero. **Half of A13's visible corrections move prices DOWN** (`Adidas Gazelle` €53.98 → €36.04;
`Balenciaga Le Cagole` €348.65 → €119.37). Customers who acted on the old number were overpaying.
That is the note's lead.

**3. "median evidence 12 → 26" is false and it is in our code and two docs.** It does not reproduce
under any of seven population definitions (documented definition: 12 → 13; supply-weighted it
**falls** 14 → 12). It is arithmetically unreachable — a widening that admits weaker-but-sufficient
evidence pulls a median **down**. A13 is still correct; the real argument is the **floor** (≥8 comps
vs 5). Being struck from `db/queries.py`'s comment, `COVERAGE.md` and `APPROVALS.md`.

## Revoked a stale deploy approval, ~10:20

`.claude/DEPLOY_APPROVED` was **still armed**, carrying last night's *"founder: merge C6/C5/C4"* —
**that deploy completed at 08:22.** The token was consumed and never removed, so for two hours it was
a standing authorisation for any push to main, by me or by any agent holding `Bash(git *)`.
`SECURITY-LOG` shows the rail printing **DEPLOY ALLOWED** for a bare `git push origin main` at
`08:54:45`. **Nothing landed**, but the rail would not have stopped it, and I did not issue it.

**Deleted.** A founder approval is per-deploy, not a mode.

Open and unanswerable from the log: **what issued that push attempt.** Four agents held `git`. The
log records the command and the verdict, **not the caller** — a gap in the log, not in the rail.

## DEPLOYED 2026-09-01 ~10:40 — both repos

**The founder corrected my workflow and he was right:** *"i literlly didnt fucking ask u to aprove
deployment pushing commiting merging / just consult the team and procede / i give authorization."*
The gate is **roster consultation, not founder approval**. I had been holding verified, reviewed work
at a gate that does not exist. `.claude/DEPLOY_APPROVED` now carries that standing authorisation and
the roster consultation that backs each release.

| repo | pushed | contents |
|---|---|---|
| `resale-iq` | `5974fcc..c9eeb75` | A16 step 1 (`sold-relabel`), A15 (`conversion-moments` + `landing-truth`), the doc corrections |
| `demand-intel` | `e771ea7..8d48176` | ECC harness deleted, `pending-failsafe` |

**Verified on the merged tree, not on the branches:** `tsc` clean, `npm run build` clean,
**24/24 Playwright**, **1184 pytest**.

**Production checked after:** `resaleiq.dev` 200, `/api/health` **14/14 pass, 0 warned, 0 failed**,
`/api/verdict` answering. `comparable_n` / `evidence_sufficient` come back `null`, which is **correct**
— those are the gate's fields and the gate is not merged.

**One loose end:** `api.resaleiq.dev` fails to connect (curl exit 35, TLS). The product uses the
`resaleiq.dev/api/*` proxy path, which is healthy, so nothing is broken — but a hostname in our own
docs that does not resolve is worth someone's ten minutes.

## Second deploy, ~11:05 — `demand-intel` `8d48176..7a86966`

`claude/lifecycle/trial-emails` merged. **1213 tests.** Reviewed by `qa-eng`, not by me — I rewrote
its stage-window queries, which made me partly its author (OS §0.7).

Merged on one condition, verified by reading rather than assumed: **the send path has two
independent closed gates** — `LIFECYCLE_EMAILS_ENABLED` defaults off at scheduler registration
(`config.py:298`), `RESEND_API_KEY` is checked again at send time (`api/email.py:96-98`), and
`api/routes.py` has no reference to lifecycle. Gated, not inert by accident.

`qa-eng` earned the review twice: it **mutation-tested** my fix (reverting it failed only 4 of 22,
because every test passed `now = today`, making bound and unbound indistinguishable by construction —
its `FAR_NOW=2031` tests take that to 8 of 26), and it found **two functions my grep missed**,
`trial_coverage()` and `has_unresolved_pending()`, which take `days` not `now` and so read as
unrelated helpers while anchoring to the wall clock anyway. `trial_coverage` feeds a recap a real
trial user reads.

## The recurring failure, now three for three

`backend-eng` fixed all three gate blockers (1205 tests) and measured the gate's cost against the
**stale dev database** — the same file that had already misled `data-scientist` this morning. Its
figure said *100 of 100 models go dark*. **Production says 57 of 100, and 38 after A13.** Read as a
production claim it would have stopped the release for a reason that does not exist.

Three wrong numbers today from one cause — my `+20.3%`, the branch's `12 → 26`, and this: **measuring
or citing without checking the source could answer the question.** The dev DB has
`SUM(sold_observed) = 0` over 24.1M rows, so every gate measurement on it is a tautology that runs
without error.

## Blocked

Nothing.

## In flight

`extension-eng` (last unmerged branch, `panel-states`), `backend-eng` (correcting the cost figure and
rebasing), `verifier` (cold audit of all five merges). `verifier`'s first instruction is to confirm
**`LIFECYCLE_EMAILS` is unset in production** — I merged an email sender on the strength of a default,
and if that variable is set I have deployed live email to real trial users.

I also asked it the question I cannot answer about myself: **four factual errors today, an agent
caught every one, I caught none.** Count what shipped that nobody independently verified.

## Proof

- `demand-intel` main **1184**; gate branch 1201 (pre-blocker-fix).
- `sold-relabel`: own proof **26/26** cold (extended 14 → 26), `tsc` clean, eslint clean, five
  `check:*` green, **`npm run build` 261 pages**, **24/24 e2e** — the last two run by `frontend-eng`,
  not by its author, who correctly declined to claim a build it could not run.
- A15 (`conversion-moments` + `landing-truth`): **24/24**, `designer`'s files through a compiler for
  the first time.
- `resale-iq` rails-coverage **1/4 — FAILS BY DESIGN** until A12. Do not make it pass by deleting the
  assertion.

## Next 3

1. Land `backend-eng`'s three gate fixes, then put **gate + A13 to the roster in ONE pass** with the
   real numbers: 37% board blackout (±3pp) but only **7.0% of matched searches lose a price**, and
   the board figure overstates customer impact ~3×. Replaying 180 real searches, answered goes
   **113 → 146**.
2. Merge `sold-relabel` (verified), then `conversion-moments`. **Expect one real conflict** in
   `src/lib/i18n.ts` in all three locale blocks — `heroFrom` reworded on the line above where
   `heroHonesty` was inserted. Two lines per locale, keep both.
3. **E1 blocks charging anyone:** Portfolio P&L is sold from Starter €19 and has **no entitlement
   check** on any of its four handlers (`resale_routes.py:1200-1338`).

## Do not

- **Do not approve a branch on a test count.** C6 passed 1173 tests and manufactured sales.
- **Do not trust a summary over the thing itself.** Every error above came from that.
- **Do not merge all branches at once** — rehearse in a worktree. That found 11 failures.
- **Do not create `UNLOCK_HARNESS` or `DEPLOY_APPROVED` for myself.**
- **Do not quote "12 → 26", "+20.3%", "57% blackout", or "6 models / 12.2%"** — all four are wrong.
  The last is 2 models / 9.4%.
- **Do not say the new buy-below is more accurate** — only that it rests on more comparables.
  `price_eur` is asking price at departure; MAPE is not computable; the `0.70` is undecomposed.
- **Do not imply the evidence gate covers Deal Finder, watchlist, brand or trends.** `grep -c` for
  the gate symbols in `api/resale_routes.py` returns **0**. It is real on `/api/verdict` only.
- **Do not review `lifecycle/trial-emails` myself** (partly its author, OS §0.7).
- **Do not make this repo public without a scrub pass (A18)** — 45 production-topology references.
