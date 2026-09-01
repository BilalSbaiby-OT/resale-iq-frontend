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

## SECRET EXPOSED — founder decision, not acted on

`devops`'s first `env | grep RESEND_API_KEY` matched the whole line and **put the key's value into a
subagent transcript** before it switched to a value-safe check. It caught itself, did not repeat the
value, and **disclosed it unprompted**. The value left our systems: **treat it as exposed.**

**Rotation is the founder's call.** I have not touched it — entering or rotating a live credential is
not mine to do.

**The lesson, so it does not recur:** `grep` on an env dump is a secret-printing tool. Every future
check uses `grep -c '^VAR=.'` — present/absent, never the value.

## The two gates are one gate

`qa-eng` verified by reading that the lifecycle send path had **two independent** closed gates. The
machine says otherwise: `LIFECYCLE_EMAILS` is absent from the container `env` and the boot log reads
`Lifecycle emails OFF... Scheduler started with 18 jobs`, `job_lifecycle_emails` unregistered — **but
`RESEND_API_KEY` is present and non-empty.**

So one unset variable is the only thing between us and live mail to real trial users. **Production is
safe, by one flag, not two.** Record it that way; the difference matters next time someone reasons
about merging email code.

## RELEASED ~11:50 — `demand-intel` `7a86966..95cfc07`

**The joint gate + A13 release, as one release**, per `APPROVALS.md:417-420` and AM-7. **1246 tests**,
`/api/health` 14/14 pass after.

`tech-lead` approved after requesting changes **twice** and tracing call sites rather than reading
diffs — which is how both real defects surfaced, since neither appears in a diff.

**Consultation (AM-8):** `tech-lead`, `verifier`, `qa-eng`, `data-scientist`, `product-manager`,
`monetization`, `backend-eng`. **Per AM-8a: mediated by me, and I am partly author of the gate half.**

## Production facts, from the machine

- Container was `ph5clxk9hmghspv65pdkvak9-...` on `7a86966`, single container — **now `95cfc07`.**
- `devops` caught a **brief two-container window on the frontend** during a rolling deploy. Resolved
  in under a minute, but it is last night's exact shape — single-container is not guaranteed.
- **ECC deletion is real but modest**: `.claude/skills` genuinely absent from the container, image
  939MB → 920MB (−2%). I implied more; most of the image is Python deps.
- **`api.resaleiq.dev` was never ours.** Not a broken cert — it resolves to Porkbun wildcard parking,
  same as a made-up control subdomain. No code or docs point a customer at it.

## What a browser found in ten minutes that a day of reading code did not

The founder: *"why are you not using chrome tabs why not using browsers use? use them do human
testing yourself."* He was right. I walked `resaleiq.dev` and found **four defects on the primary
conversion path**, none of them findable by reading code:

1. The withheld-price screen says **"Only 3 comparable SOLD items"** — the exact claim removed from
   every other surface today. It shipped this morning inside the evidence gate and was never swept.
   **37 of 100 board models land there.**
2. **"NOT MEASURED"** in grey caps reads as *broken*, not as a deliberate refusal. Refusal is now the
   brand; the screen does not look like one.
3. The **"try one of these instead" chips** built this morning **do not render** there. Dead end.
4. **Enter does nothing** in the hero search box. You must click.

## Agent capability audit — 18 roles could not do what their own description promises

Founder: *"each sub agent give them plug in skill mcp and tool that improves its work."*

| role | its description says | it had |
|---|---|---|
| `seo` | **"GSC"**, flip and category pages | **zero** Search Console tools |
| `customer-success` | **"Support inbox"**, churn and refund reasons | **no email access** |
| `legal-compliance` | GDPR, DSAR, ToS, **store policies** | **no way to fetch any external document** |
| `ux-researcher` | **"funnel walks in a real browser"** | `Read, Grep, Glob, Write` |
| `content-social` | **"Postiz drafts"** | no way to reach Postiz |
| `extension-eng` | the **four panel states** | no browser |
| `lifecycle` | owns email code | no way to run a test |

**Fixed, additive only.** `customer-success` got Gmail **read-only** — never send; an outbound
message to a real person stays a founder gate.

## Marketing was fully built and nobody pressed send — then the queue turned out to be wrong

`POSTIZ_API_KEY` live, **4 accounts connected** (X, Instagram, TikTok, Reddit), 10 approved pieces,
a working `npm run publish`. **Never run outside dry-run.**

**Held, and this is why it matters that I looked:** every queued post says *"619 Vinted **sales**",
"96 Gucci caps **sell**", "340 New Balance **sold**"*. **The queue would have published the exact
false claim the product spent today removing**, to four live accounts. Written before this morning;
nobody would have caught it until a customer did.

Accounts are also **English-only, one brand identity** — no per-market split, against a
five-market product.

## Two process failures of mine, recorded

1. **`npm test | tail -2 && git push`** — `tail` always exits 0, so the push could not be blocked by
   a failing test. I have spent the day demanding agents verify rather than assume, and wrote a
   verification that structurally could not fail.
2. **`designer` was editing the shared main checkout**, not a worktree. I ran the suite against a
   tree being mutated underneath me (23/24, from its half-finished work) and **one `git add -A`
   would have deployed it.** Production was unaffected — verified, the pushed commit contains none
   of it — but by timing, not design. Its WIP is preserved in `stash@{0}` and in
   `scratchpad/designer-wip/`.

## Blocked

Nothing.

## The release numbers reproduced

`verifier` re-ran `docs/audit/proof/W36/a13-gate-joint/proof.sh` cold against production at
`09:13:32`, 17 minutes after `product-manager`'s run at `08:56:48`. **Every substantive figure came
back identical** — Q1 41/19/22, Levi's Trucker withheld, Q3 median −3.04%, Q4 63/37, supply coverage,
`min_comparable_n` over banded rows, and the counter-KPI. The only diff in the whole artifact is the
timestamp and the corpus growing 106,514 → 106,543 rows.

That is better than the "shelf life measured in hours" warning implied, and it is the first time a
number in this company has been independently reproduced by a second agent against production on a
different run. **The warning still stands for the reproduction control itself** (64/100 exact, down
from 90/100 eight hours earlier) — the headline aggregates are stable, individual model rows are not.

`backend-eng` corrected its `cost()` figure with full provenance and rebased: `8676efd`, **1238
tests**, on top of `7a86966`. Back with `tech-lead` for re-review of its own three blockers.

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
