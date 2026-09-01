# QA — Playwright as a required check

Owner: qa-eng. KPI: flaky_tests = 0 (primary) · coverage on touched files ≥ 80% (secondary) · test
runtime does not grow unbounded (counter).

## The gap this closes

Before this change: the frontend shipped on `typecheck` + `build` alone (`.github/workflows/agent-isolation.yml`).
`playwright.config.ts` and `e2e/*.spec.ts` existed on disk and ran in **no workflow** — a PR could
break the product's actual behaviour and still merge green. Four things shipped to 100% of users on
2026-08-31 that a passing typecheck + build could not have caught (see below). There are no feature
flags and no dark ship on this frontend, so every deploy is all-or-nothing — the only backstop
available is a gate before merge.

## 1. What existed vs what ran

| | Existed on disk | Ran in CI before this change |
|---|---|---|
| `playwright.config.ts` | yes | — |
| `e2e/smoke.spec.ts` (7 tests) | yes, passing | no |
| `e2e/customer-workflow.spec.ts` (3 tests, watchlist + IDOR) | yes, passing | no |
| `e2e/signup-verify.spec.ts` (6 tests) | yes — **1 of 6 was broken**, see below | no |
| `e2e/prod.smoke.spec.ts` | yes, passing (skips if prod unreachable) | no |
| `e2e/mock-backend.mjs` | yes (auth/watchlist mock; **no `/api/verdict` handler at all**) | — |

Nothing was skipped or `test.fixme`'d — the honest state was worse than that: the whole suite simply
never ran anywhere but a developer's own machine. `npm run test:e2e` was a real, working command
that nobody's CI ever typed.

One pre-existing test was silently broken, not flaky: `signup-verify.spec.ts` › "register 409 copy
points to Sign in" used `getByText(/already have an account/i)`, which now matches **two** elements
(the 409 error banner, and a static "Already have an account? Sign in" footer link added to
`/register` at some point after the test was written) — a deterministic Playwright strict-mode
failure, 100% reproducible, not timing-related. Fixed by scoping the assertion to the banner's actual
copy (`you already have an account`, the phrase unique to the error path). This is exactly the fate
that was waiting for the rest of the suite: tests rot the moment nothing runs them.

## 2. The four specs, each locked to a real incident

New files: `e2e/regression-p0.spec.ts` (10 tests), `e2e/market-coverage.spec.ts` (1 test).
`e2e/mock-backend.mjs` gained a hand-written `/api/verdict` handler (it had none) that mirrors the
**documented** contract from demand-intel's own regression tests — not its Python implementation,
which stays demand-intel's job and is already gated in its own CI (1,147+ tests, including
`tests/test_anon_quota_cookie.py` and `tests/test_verdict_leak.py`, the two files this mock is a
mirror of). What this suite proves is that the **frontend** holds up its end of that contract: it does
not invent a rejection the server never sent, it does not render a field the server withheld, and it
renders the honest state instead of a blank or a zero.

| Spec | Incident it is locked to | What it does |
|---|---|---|
| "a brand-new anonymous visitor's first search" | A visitor with no cookies, no localStorage, no sessionStorage — the opening click of every new visitor — got `LIMIT_REACHED` on their FIRST EVER request (backend: `tests/test_anon_quota_cookie.py`) | Fresh Playwright context (0 cookies, verified) runs one search; asserts `verdict !== "LIMIT_REACHED"` on the actual network response and that a visitor cookie is minted. A second test spends the same visitor's quota to 11 requests to prove the mock's quota is real (10 pass, the 11th caps) — otherwise the first assertion is vacuous. |
| "paywall must not leak paid fields to anonymous callers" | Three separate return paths bypassed the gate at once: `_provisional_verdict`, `INSUFFICIENT_DATA`, and the main path — all three shipped `buy_below`, `sell_avg`, `top_sizes`, `reasons`, `data_quality`, etc. to anonymous callers | One test per path (main BUY/WATCH/SKIP, provisional/momentum-only, INSUFFICIENT_DATA), asserting none of `PAID_ONLY_FIELDS` appear in the raw JSON response for an anonymous caller. A fourth test asserts the UI never renders the real `"62%"` sell-through figure for anon. |
| "INSUFFICIENT_DATA renders the honest state" | 40.9% of answered searches take this path in production — the most-seen non-answer in the product, and (per `src/types/index.ts`'s own comment) it was once missing from the `VerdictResult` type entirely, so switches on `verdict` type-checked without ever handling it | Runs a thin-comparables query, asserts the label reads "NOT MEASURED" (not blank, not a `€0`), the real reason text is visible, the priced-metrics grid does not render at all, and the paywall upsell CTA (meant for withheld-numbers, not withheld-data) does not appear. |
| "the homepage must not state a market we do not serve" | Coverage is ES/FR/DE/IT/PT only; `CLAUDE.md` records the UK ban on *considering* it was lifted 2026-08-29 — which makes premature UK/US copy a live risk, not a hypothetical | Renders `/`, asserts the real claim ("five EU markets") is present, and that no market we do not serve (`UK`, `US`, "United Kingdom", "United States", "British"/"Britain") appears anywhere in the rendered text. Also guards the legitimate "26 markets" claim (live asking-price search, Price Compare) so it can only appear scoped to that sentence, never bare. |

### Every spec was sanity-checked against a live failure, not just written

Per instruction, an unrun test asserted to pass is exactly the failure mode this exists to prevent.
For each spec I temporarily reintroduced the real bug shape and watched the test fail, then reverted
(verified with `git diff` — clean revert):

- Reverted the visitor-cookie mint-on-first fix in the mock → the "never returns LIMIT_REACHED" spec
  failed with the exact incident shape (`LIMIT_REACHED` on request 1).
- Added `reasons` back into the anonymous view in the mock → the "main path" leak spec failed,
  reporting `anonymous caller received paid fields: ["reasons"]`.
- Added `"Now covering the UK and US too."` to the homepage hero copy → the market-coverage spec
  failed on the `\bUK\b` assertion.

All three were reverted immediately after confirming failure; `git diff` on the touched source files
is empty. I did not add or modify anything in `src/` permanently — the only touched files are listed
in "Files changed" below.

## 3. Wired into CI

`.github/workflows/playwright.yml` (new). Runs `npm run test:e2e:required` (new `package.json`
script) — `smoke`, `customer-workflow`, `signup-verify`, `regression-p0`, `market-coverage` — on every
PR to `main` and on push to `main`, `--workers=2` (see "flaky risks").

**Deliberately excluded from the PR gate:** `e2e/prod.smoke.spec.ts`. It makes real requests to
`https://resaleiq.dev` and already skips itself if prod is unreachable — a live-network dependency
inside a PR gate is itself a source of flakiness, and this KPI's primary is `flaky_tests = 0`. It
stays available via `npm run test:e2e:prod` for a manual/post-deploy check.

**This does not yet block a merge.** A GitHub Actions workflow can report a status on a PR the moment
it exists, but making that status *required* — the actual gate — is a branch-protection setting on
`main` in the repo's GitHub settings, which no workflow file can set on itself. That one-time admin
action is the remaining step and is logged in `docs/company/APPROVALS.md` as A-QA-1 for the founder /
whoever holds repo admin. Until it happens, this workflow runs and is visible on every PR but a red
run does not block anything.

## 4. Flaky risks

- **Dev-server compile contention under parallel workers.** `signup-verify.spec.ts`'s "429 on
  `/auth/me` does not wipe the JWT" test timed out waiting for `/dashboard` at the local default
  worker count (4) — `next dev` compiles routes on first hit, and four workers hitting fresh routes
  at once contend for the same compile queue. Reliably green at `--workers=2` across repeated runs
  (measured: 2 consecutive full-suite runs, 27/27 and 27/27). `test:e2e:required` and the CI workflow
  both pin `--workers=2`. If this reappears in CI (a shared runner is slower/more contended than my
  local machine), the next lever is `next build && next start` instead of `next dev` in
  `playwright.config.ts`'s `webServer` — production mode has no first-hit compile — traded against a
  slower CI step (a build) for a faster, non-flaky test run. Not done here: out of scope for one PR,
  and `next dev` is what local development already exercises.
- **Shared mock-backend process across parallel tests.** `e2e/mock-backend.mjs` holds its anon quota
  (`anonQuota`) and visitor-id counter in process memory, and Playwright's `webServer` starts exactly
  one instance for the whole run. This is safe as written because every test gets a fresh browser
  context (no cookies) by default, so every test mints its own, disjoint visitor id — but it is a
  latent shared-state risk if a future test reuses a `storageState` or otherwise carries cookies
  across tests. Flagged here rather than hidden.
- **The mock is a hand-kept mirror, not a generated one.** `PAID_ONLY_FIELDS`, the cookie name
  (`riq_vid`), and `FREE_VERDICT_DAILY_LIMIT` (10) are copied from `demand-intel/config.py` and
  `tests/test_verdict_leak.py` by hand. If the real limit or field list changes in demand-intel and
  nobody updates this mock, these specs go on passing against last month's contract — a silent
  drift, not a flaky test, but a real fidelity risk. No automated cross-repo check exists for this;
  flagging it is the mitigation available from inside `resale-iq` alone.

## 5. What this does NOT cover, and why

- **The actual FastAPI gate logic** (`api/routes.py` `_gate`, `_provisional_verdict`,
  `verdict_allows_buy_below`, the anon-quota cookie signing/verification). That is demand-intel's own
  test suite's job (`tests/test_anon_quota_cookie.py`, `tests/test_verdict_leak.py`,
  `tests/test_provisional_verdict.py`), already gated in demand-intel CI, and out of scope for
  qa-eng/resale-iq — I cannot edit demand-intel from this seat.
- **`Secure` cookie behaviour over real HTTPS.** The mock's `Set-Cookie` intentionally omits `Secure`
  (Playwright's local `webServer` is plain `http://localhost`, and a `Secure` cookie would never be
  resent, breaking every test). Production's actual cookie is `Secure`; whether it round-trips
  correctly over `https://resaleiq.dev` in a real browser is unverified from this seat and is
  covered, if at all, by `demand-intel`'s test suite comments (`test_verdict_leak.py`'s `_client()`
  explicitly notes it uses `https://test` for exactly this reason) — not by anything here.
  `e2e/prod.smoke.spec.ts` is read-only GETs and does not exercise this either.
  Follow-up: a real end-to-end run against a staging deploy (not the mock) would close this, and is
  not something a PR-time unit-style Playwright run against a dev server can do.
  Parked, not solved.
- **Non-Chromium browsers.** `playwright.config.ts` defines one project (`chromium`/Desktop Chrome).
  Firefox/WebKit are not installed or run anywhere. Unchanged by this PR; flagging because "the
  Playwright suite exists" undersells how narrow its browser coverage always was.
  Mobile viewports: none configured, same reason.
  Fixing this is a real scope increase (more browsers, more install time, more surface for platform-
  specific flake) and belongs on the `P0-LIST` as its own item, not folded into this one.
  Not fixed here.
- **The extension panel.** Out of scope — a separate KPI ("panel renders a band or honest state on
  100% of sampled listings," owned by extension-eng) and a separate codebase area
  (`resale-iq/extension/`).
- **The `_provisional_verdict` path's exact backend shape.** Modeled here as a catalog entry with
  `provisional: true` and no `sell_through_rate`/`top_sizes`/`months_supply` keys at all (matching the
  real function's behaviour of never computing them, not redacting them) — this proves the FRONTEND
  never invents those fields either. It does not prove the Python function computes momentum/price
  correctly; that is `tests/test_provisional_verdict.py`'s job.
- **Load / concurrency at the real quota boundary** (e.g. two tabs racing to spend the last unlock).
  `customer-workflow.spec.ts` already tests cross-user isolation (IDOR); genuine race conditions on
  the SAME account are not covered by this PR and would need a dedicated spec.

## 6. Runtime cost — measured, not estimated

- `npm run test:e2e:required` (24 tests, `--workers=2`, cold `next dev` + mock-backend startup
  included): **~25s** locally (Apple Silicon, this machine). Two consecutive full runs: 27/27 and
  27/27 passing (27 = the 24 above plus `prod.smoke.spec.ts`'s 3, run together during verification;
  the CI job itself runs the 24).
- The new specs alone (`regression-p0.spec.ts` + `market-coverage.spec.ts`, 11 tests): **~12-17s**
  including one deliberately slow test (the 11-request quota-exhaustion check, ~3.5s of that).
- CI adds Chromium install time on top (`npx playwright install --with-deps chromium`), not measured
  here since this environment already had it cached; budgeted generously at 12 minutes total in the
  workflow's `timeout-minutes` as a ceiling, not an expectation.
- Counter-KPI (runtime does not grow unbounded): the required-check script is an explicit, named
  file list, not a `playwright test` glob over everything in `e2e/`. Adding a new spec to
  `e2e/` does **not** silently grow the gate — it has to be added to
  `test:e2e:required` on purpose, which is a deliberate choke point for reviewing runtime growth
  rather than an oversight risk.

## 7. Files changed

- `e2e/regression-p0.spec.ts` — new, 4 specs / 10 tests (P0 #1, paywall leak ×3 paths, honest-state).
- `e2e/market-coverage.spec.ts` — new, 1 spec / 1 test (market claim).
- `e2e/mock-backend.mjs` — added `/api/verdict` handler (previously absent) mirroring the documented
  demand-intel contract; no other endpoint touched.
- `e2e/signup-verify.spec.ts` — one-line locator fix for a pre-existing, deterministic (not flaky)
  strict-mode failure, unrelated to the four specs above but blocking a clean required-check gate.
- `package.json` — added `test:e2e:required` script.
- `.github/workflows/playwright.yml` — new, the required-check workflow.
- `docs/eng/QA.md` — this file.

No file under `src/` was permanently changed. Three source-level changes described in §2 ("sanity
check") were made and reverted within this session, confirmed clean via `git diff`.

## 8. A process note, not a QA finding

While this work was in progress, a concurrent session (unrelated to this task, working on
`demand-intel` data-integrity items per its commit message) committed directly to `main` in this
repo and — because it ran a broad-staged commit against the shared working tree — that commit
(`b520a6d`) absorbed the `e2e/` files this session had on disk at that moment, alongside its own
unrelated changes. I did not run `git add`, `git commit`, `git checkout`, or `git push` at any point
in this session (permitted tool calls were read-only: `status`, `diff`, `log`, `show`). All files
described in §7 are present and match what is described here; I verified this by re-running the full
suite after noticing the commit and diffing the working tree (clean except an unrelated,
hook-appended `docs/company/SECURITY-LOG.md` line from a different blocked action, also not mine).
Flagging this for tech-lead/CEO: a shared working tree with more than one agent committing to `main`
directly is a real hazard independent of this PR's content, and is outside what I can fix from this
seat.
