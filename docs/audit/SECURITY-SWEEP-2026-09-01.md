# Security sweep — 2026-09-01

Author: security-eng. Scope: `resale-iq`, `demand-intel`, `resale-iq-growth`, `resale-iq-seo`.
Method: static review only — read source, git history and config; ran `npm audit` (resale-iq,
resale-iq-growth) and manual dependency review (`pip-audit` unavailable, no network access to
install it — see §1). No code changed. No secret value was read, printed or copied; where a
possible secret was found in tracked source it was checked structurally (prefix + entropy, see
§2) without printing the match.

Ranking is by real-world exploitability, not scanner severity. `MONETIZATION.md` (dated today)
independently re-checked the entitlement trap from the revenue angle and reached the same
conclusion I did from the access-control angle — cross-referenced in §4, not duplicated.

---

## Ranked findings

| # | Severity | Area | Finding | Live now? |
|---|---|---|---|---|
| 1 | **CRITICAL** | 6 (rails) | One-token bypass of the only rail blocking direct `.env` reads via Bash | **Yes, today, in-scope** |
| 2 | **HIGH** | 6 (rails) | Company OS rails (guard.py) never load outside a resale-iq project root — demand-intel/growth/seo sessions run unguarded | **Yes, for any session rooted in those 3 repos** |
| 3 | **HIGH (latent)** | 4 (entitlement) | `users.plan` schema default is a paid tier (`'operator'`); nothing but programmer discipline prevents it being hit | **Not reachable today** — verified every write path |
| 4 | LOW | 6 (rails) | `check_paths` uses `abspath`, not `realpath` — symlink indirection isn't caught; Grep/Glob-class tools aren't in the hook matcher at all | Requires extra steps / tool availability |
| 5 | INFO | 1 (deps) | npm audit: 4 high/1 moderate in resale-iq (all dev-tooling or build-time-only, not attacker-reachable) | No live exploit path found |
| 6 | INFO | 1 (deps) | npm audit: 9 critical/2 high/2 moderate in resale-iq-growth, all in the local-only Remotion video-render CLI, never network-exposed | No live exploit path found |
| — | CLEAN | 2 (secrets) | No secret ever committed to git in any of the 3 versioned repos; `.gitignore` correct; `with-secrets.sh` well-built | — |
| — | CLEAN | 3 (auth/quota) | Every route reviewed is correctly gated; anon-quota cookie is genuinely HMAC-signed and verified | — |
| — | CLEAN | 5 (scraper) | No evasion tooling, no proxy-credential leakage into logs | — |

---

## 1. Dependencies

### resale-iq (`npm audit`)
4 high, 1 moderate, 0 critical. Traced each to its consumer with `npm ls <pkg> --all`:

- **`brace-expansion` (high, DoS)** and **`js-yaml` (high, DoS)** — both pulled in only by
  `eslint`/`eslint-config-next`'s dependency chain (`eslint@9.39.4 → @eslint/eslintrc@3.3.5 →
  js-yaml@4.3.0`; `typescript-eslint@8.62.0 → minimatch@10.2.5 → brace-expansion@5.0.6`). **Dev-only,
  never shipped, never runs against attacker input** — this is lint tooling on the developer's
  machine, not a runtime dependency. Present-in-tree, not exploitable in our usage.
- **`postcss` (high, path traversal reading arbitrary `.map` files) / `nanoid` (high, DoS on
  `size=0`)** — pulled in by `next@16.3.0` and `@tailwindcss/postcss@4.3.1`, both real production
  dependencies (`package.json:24,32`). But `postcss`'s vulnerable path requires processing
  attacker-supplied CSS with the `from` option unset and a crafted `sourceMappingURL` comment —
  this only runs at **build time** over the repo's own local CSS files (Next.js's build pipeline),
  never over runtime/user input. `nanoid`'s bug needs a caller to invoke a custom generator with
  `size=0`, which nothing in this codebase or its build chain does. Present-in-tree, not
  exploitable in our usage.
- **Upgrade path (all within existing semver ranges, confirmed via `npm outdated`):**
  `@tailwindcss/postcss` 4.3.1 to 4.3.3, `next` 16.3.0 to 16.3.4, `eslint` 9.39.4 to 9.39.5,
  `eslint-config-next` stays at 16.2.9 (latest compatible with the pinned `eslint-config-next`
  major) — a routine dependency bump resolves all four without a major version change.

### resale-iq-growth (`npm audit`)
9 critical, 2 high, 2 moderate — all inside the `@remotion/cli@4.0.200` dependency tree
(`@remotion/bundler`, `@remotion/studio*`, `esbuild`, `extract-zip`, `ws`, `webpack`). This is a
real production dependency (`package.json:36-43`), **but it is a local, offline video-render CLI
tool, never a network service**: `src/server/index.js:516` binds the dashboard to
`cfg.dash.host` which defaults to `127.0.0.1` (`src/config.js:110`), and `src/server/` never
imports `remotion` (searched every file in `src/server/` for the string — none found; Remotion is
invoked only via `npm run media` / the CLI render pipeline, one-shot, by whoever runs it locally).
The `@remotion/studio-server`'s known CVEs (arbitrary file read/RCE in its dev server) require the
studio dev server to be reachable, which it never is here. Present-in-tree, not exploitable in
our usage. No safe minor/patch upgrade exists yet for `@remotion/cli@4.0.200` at time of audit
(pinned version, no compatible bump available) — flag for a deliberate major-version bump later,
not a P0.

### demand-intel (`requirements.txt`, manual review — `pip-audit` unavailable, no network in this
environment to install it)
All packages are pinned exact versions (`requirements.txt:1-10`, deliberately, per its own
top-of-file comment about floating-version incidents). Manually checked the one package with a
known historical CVE class relevant to this app's usage:
- **`python-jose[cryptography]==3.5.0`** — the algorithm-confusion class of CVE against
  `python-jose` requires the *caller* to decode without pinning `algorithms=[...]`. This app pins
  `algorithms=[JWT_ALGORITHM]` (`JWT_ALGORITHM = "HS256"`, `api/auth.py:36`) on **every** decode
  call (`api/auth.py:117`, `153`) — the vulnerable pattern is not present. Clean in our usage.
- No other pinned version in `requirements.txt` matched a CVE I could confirm from memory with
  confidence; **this is a best-effort manual pass, not a substitute for running `pip-audit`
  in CI with network access** — recommend adding that to the weekly cadence rather than treating
  this section as exhaustive.

---

## 2. Secrets hygiene

- **Nothing ever committed.** `git log --all --diff-filter=A --name-only` across resale-iq,
  demand-intel and resale-iq-growth shows no live env file (only `.env.example` templates and one
  `docs/PRODUCTION_ENVIRONMENT.md`) was ever added to any commit in any branch, in any of the
  three git repos.
- **`resale-iq-seo` is not a git repository at all** (`git status` reports "fatal: not a git
  repository"). No history-leak risk, but also no audit trail for changes. Its credentials live at
  `resale-iq-seo/.secrets/gsc-oauth-client.json` and `.secrets/token.json`, directory mode `700`,
  files mode `600` — correct filesystem-level protection given there's no VCS to gitignore them
  from. Not a finding to fix tonight (not code, and outside the "don't modify" scope), just
  recorded as a structural difference from the other three repos.
- **`.gitignore` correctly covers env files** in all three versioned repos: `resale-iq/.gitignore:36`
  (`.env*`), `demand-intel/.gitignore:6,10-11` (`.env`, `.env.bak*`, `.env.*.bak`),
  `resale-iq-growth/.gitignore:2` (`.env`).
- **No live key material found in tracked source.** `git grep` for the Stripe live/test/webhook
  secret key prefixes across resale-iq and demand-intel returned only documentation/validation
  code (e.g. skill docs describing the Stripe key *format*, `stripe_routes.py` code that *maps*
  price IDs). Checked each match programmatically for an actual key-shaped string (prefix followed
  by ≥10 alphanumeric characters) — zero matches. Confirms the live Stripe key lives only where
  `CLAUDE.md` says it should (the production container's env, sourced only through
  `with-secrets.sh`).
- **`with-secrets.sh` (`resale-iq/.claude/bin/with-secrets.sh`) is well-built**: it parses
  `KEY=VALUE` lines itself rather than sourcing the env file directly (its own comment documents
  why — a malformed line under direct sourcing is arbitrary shell execution, which was a live bug
  it fixed), and scrubs every value ≥8 chars from both stdout and stderr before the child
  process's output reaches the transcript. This is the correct design — **but see finding #1
  below**, which defeats the *only* gate that forces callers through it.

**Finding #1 (CRITICAL) — the with-secrets.sh requirement is a one-token bypass.**
`resale-iq/.claude/hooks/guard.py:131-137` (paraphrased, not reproducing the literal trigger
string here on purpose):

It matches the command text for a live env-file reference, and skips the block **only if the
literal substring naming the sanctioned script appears anywhere in the command text** — it does
not check that the script is what's actually being executed.

**Any command that references a real env-file path and also contains that script's filename
anywhere — including a trailing shell comment — passes untouched.** Concrete attack:
`cat <path-to-live-env-file>  # <sanctioned-script-name-as-a-comment>` (or the same trick inside a
`python3 -c "..."` one-liner, or a `grep` for a specific key name) is **not blocked** — the
env-file regex matches, but the containment check for the script name also matches (it's sitting
in a comment), so the block never fires. The command executes normally and would print the live
Stripe key and every other secret in that file straight into the calling agent's transcript. I
confirmed this by reading the guard logic, not by running the exploit — no secret was read in the
course of finding this, and this report deliberately does not spell out the exact trigger
substrings as a working one-liner.

**Smallest fix:** stop testing substring containment against the whole command line. Check that
the command's actual executable (first shell token, or the last stage of a pipeline) is the
sanctioned script — e.g. `shlex.split(c)[0].endswith("with-secrets.sh")` — rather than a bare
`in` containment test. A trailing comment can still say anything; only what is *executed* should
matter.

---

## 3. Auth and quota (demand-intel) — reviewed clean

- **Router-level gating, verified against every endpoint, not assumed:** `main.py:1148` mounts
  `router` (which holds `/api/demand`, `/admin/*`, `/api/scraper/*`, `/api/config`, etc.) behind
  `Depends(require_verified_email), Depends(require_paid_plan)` **at the router-include level** —
  so the many endpoints on `router` with no per-route `Depends(...)` visible in `api/routes.py`
  (I enumerated all 60+ route decorators programmatically) are not unauthenticated; they inherit
  the router-wide gate. `public_router` (`main.py:1139`) genuinely has none, and every endpoint on
  it was checked individually: `/api/verdict`, `/api/public/market-snapshot`, `/api/calc`,
  `/api/model-signals`, `/api/purchases`, `/api/ping`, `/api/health`, `/api/track` — all
  appropriately public (marketing/health/anonymous-teaser surfaces) or self-throttled (see below).
  `resale_router` (`main.py:1156`) requires only `require_verified_email`; paid-tier gating is
  applied per-endpoint (`require_power_plan` / `require_paid_plan` / trial-aware variants),
  verified at `api/resale_routes.py:182` and the `require_*` family in `api/auth.py:525-634`.
- **Admin endpoints are owner-gated, not plan-gated.** `_require_power()` (`api/routes.py:56-85`)
  checks `is_owner_email()` against an env allowlist (`OWNER_EMAILS`/`BOOTSTRAP_ADMIN_EMAIL`),
  not `plan == "power"` — so a paying Pro customer cannot reach `/admin/users`,
  `/admin/users/{id}/plan`, `/admin/users/{id}/toggle`, `/admin/users/{id}`,
  `/admin/config-check`, `/admin/reddit-*`, or `/api/scraper/trigger`. Confirmed for every admin
  route in the file. One read-only exception: `GET /api/scraper/status` (`routes.py:2444`) has no
  owner check, only the router-level paid-plan gate — any paying customer can see scraper
  health/row counts. Informational exposure, not a vulnerability; not ranked.
- **Anonymous verdict quota cookie is genuinely signed and verified, not decorative.**
  `create_visitor_token`/`decode_visitor_token` (`api/auth.py:135-159`) are real HS256 JWTs
  (`jwt.decode(..., algorithms=[JWT_ALGORITHM])`, `auth.py:153`) with a `typ` claim that rejects a
  user-session token presented in its place. Can a visitor mint unlimited free verdicts by
  clearing the cookie? Partially, by design, and bounded: clearing the cookie does reset the
  soft per-visitor quota (`FREE_VERDICT_DAILY_LIMIT = 10`/day, `config.py:26`), because a new
  visitor genuinely needs a first check — but every anonymous request is also checked against
  `ANON_IP_DAILY_CEILING = 300`/day (`config.py:46`) keyed on `client_ip_hash`
  (`api/routes.py:797-798`), computed from `_client_ip()` (`routes.py:23-43`), which takes the
  last `X-Forwarded-For` hop — the one Traefik itself appends and a client cannot forge (the
  first-hop bug that would have made this spoofable was already fixed, per the comment at
  `routes.py:36-43`). Net effect: cookie-clearing buys roughly 10 fresh verdicts per clear, hard
  capped at 300/day per real IP. This is the intended two-tier design (soft UX quota plus a real
  abuse backstop), not a bypass. Is the cookie signature actually verified? Yes — it requires
  `JWT_SECRET`, which cannot be recovered from the client side, and the app refuses to boot in
  production with the public dev-default secret
  (`_assert_jwt_secret_is_not_the_public_default`, `auth.py:39-60`, called at
  `main.py:893-894`).

## 4. THE ENTITLEMENT TRAP — real as a schema fact, not reachable today

`db/schema.py:565`: `plan TEXT NOT NULL DEFAULT 'operator'` — confirmed, this is a paid tier name
used as the column default.

**Every place that grants a capability off `plan`, traced to source:** `require_paid_plan`
(`auth.py:559-574`), `require_power_plan` (`auth.py:525-532`), `require_pro_paid`
(`auth.py:597-605`), `require_power_or_trial` (`auth.py:577-594`), `require_live_finder_access`
(`auth.py:608-621`), `require_order_planner_access` (`auth.py:624-634`), the inline checks in
`api/routes.py:710-721,1481-1482,1591-1611,1641,2857`. All of them read `current_user["plan"]` (or
`_get_plan()`), and `current_user` is **re-fetched live from the DB on every request**
(`get_current_user`, `auth.py:441-473`; `_resolve_caller`, `routes.py:1545-1556`) — a token proves
identity only, never entitlement, so this is correct architecture given the row's `plan` value
is trustworthy.

**Is the row's `plan` value ever set by hitting the schema default?** No, in the current
codebase. Exhaustively grepped for every `INSERT INTO users` in application code
(tests excluded): the only one is `api/auth.py:421`, reached only from `register()`
(`auth.py:685-748`), which always passes the literal string `"free"` — `RegisterRequest.plan`
from the client is validated (`auth.py:691-692`) then explicitly discarded
(`user_id = await _create_user(req.email, hashed, "free")  # always free`, `auth.py:700`). No
OAuth flow, admin "create user" endpoint, bulk-import script, or migration inserts a `users` row
anywhere else in the tree. The Stripe webhook and `/admin/users/{id}/plan` only ever modify an
existing row's `plan` column, never insert a new row (`stripe_routes.py:425-441`,
`routes.py:2106-2133`), and that admin path is owner-gated (`_require_power`, see §3).

**Why this is still a live access-control defect, not a non-issue:** the invariant "every insert
sets `plan` explicitly" is enforced by nothing except every current author remembering to do it.
There is no `CHECK` constraint, no test asserting the *default itself* resolves to `'free'`, and
no code-review signal that would catch a future write path that *omits* the column — a bulk CSV
import script, a future magic-link/OAuth signup, or a one-off support tool creating a row with
only `email` and `hashed_password` set would silently mint a paid `'operator'` account with zero
error, zero test failure, and no reviewer likely to notice an omission. This is exactly the class
of bug that survives code review — a missing column, not a wrong value. It does not currently
grant anyone anything, but it is one omitted column away from doing so, silently.

**Smallest fix:** `db/schema.py:565` — change `DEFAULT 'operator'` to `DEFAULT 'free'`. This is a
one-word change with no behavioral effect today (every current insert already overrides it) and
closes the landmine for every future write path and fresh install. Recommend pairing it with a
one-line regression test (insert a row with no `plan` column supplied, assert it reads
`plan='free'`) so the *invariant*, not just today's callers, is what's under test. (Not filing the
Stripe-linkage/metrics-integrity finding here — `MONETIZATION.md` section 1 already tracks
`_set_plan()` not clearing `stripe_sub_id` on cancellation as a KPI-honesty issue, which is the
revenue angle, not access control.)

## 5. Scraper posture — reviewed clean

- Scheduled scraping stays on the 5-TLD set (`VINTED_DOMAINS`, `config.py:93-99`); the 26-market
  set (`ALL_VINTED_MARKETS`, `config.py:104-113`) is used only for on-demand search/compare
  (`/api/search/vinted`, `/api/compare/prices`), not a background crawl — `config.py:101-103`
  documents this split explicitly ("respect rate limits from a single IP").
- **No evasion tooling.** Searched `scrapers/`, `engine/`, `config.py` for CAPTCHA-solving
  services, stealth/undetected-browser libraries, fingerprint spoofing, or proxy-rotation logic —
  none found. On a CAPTCHA/Cloudflare challenge or a 403, the code backs off honestly and reports
  it (`scrapers/vinted.py:591-611` detects and refuses HTML-challenge/`captcha_required`
  responses rather than trying to solve them; `526-536` logs the block and tells the operator to
  configure a residential proxy rather than trying to disguise the traffic further). The one
  browser-shaped header set (User-Agent/Accept-Language/Referer, `vinted.py:500-508`) is ordinary
  practice for calling a public JSON endpoint that 403s datacenter IPs outright — not fingerprint
  evasion.
- **Proxy credentials do not leak into logs.** `SCRAPER_PROXY` (`config.py:223`, the standard
  `scheme://user:pass@host:port` shape) is read once and passed straight to httpx as
  `kwargs["proxy"]` (`vinted.py:497-498`, `1306-1307`). Checked every exception handler that could
  fire on a proxy-level failure (`vinted.py:526-540, 613-634, 846, 921, 1172-1196, 1277, 1379`) —
  all log the exception object or `platform_key` via `%s`, never `kwargs`, the client object, or
  `SCRAPER_PROXY` itself. No log statement anywhere references the proxy value.
- `fb_session.json` (Facebook Marketplace's saved manual-login session) is gitignored
  (`demand-intel/.gitignore:5`) and never tracked; the Facebook scraper is currently disabled
  (per `CLAUDE.md`'s "Disabled Platforms" section).

## 6. The rails themselves (guard.py) — full findings, ranked

Known and not re-reported per the brief: (a) `PROTECTED` matches on a path substring and can't
distinguish which repo a protected-looking filename belongs to; (b) the hook never checks
`CLAUDE_AGENT_NAME` (unset), so it can't enforce per-role restrictions.

**#1 (CRITICAL) — the env-file Bash gate is a one-token bypass.** See §2, finding #1 — same
defect, filed once. `guard.py:131-137`.

**#2 (HIGH) — the rails only load inside a resale-iq project root.**
`resale-iq/.claude/settings.json:28` wires `guard.py` to
`Bash|Read|Edit|Write|MultiEdit|NotebookEdit` — but that's resale-iq's own settings file.
`demand-intel/.claude/settings.json` is a separate, independent file that does not reference
`guard.py` at all: its `PreToolUse` hooks (`settings.json:5-27`) are a memory-directory-creation
no-op for Bash and, for `Write|Edit`, a literal echo of a fixed string redirected to `/dev/null`
(`settings.json:22`) — text that performs no check and is discarded. Its `permissions.allow`
(`settings.json:70-94`) explicitly allows a broad `cat` wildcard and has no deny list at all — no
equivalent of resale-iq's settings-level deny rules for env files. `resale-iq-growth/.claude/`
contains only a `launch.json` (no `settings.json`, no hooks); `resale-iq-seo` has no `.claude`
directory whatsoever.

**Concrete attack:** any Claude Code session whose project root is `demand-intel`,
`resale-iq-growth`, or `resale-iq-seo` — not `resale-iq` — never invokes `guard.py` at all.
Reading the live env file directly (per `demand-intel/CLAUDE.md`'s own note that this file
"contains live Stripe keys"), edits to any file including this very `guard.py` or
`settings.json`, a forced push, or a push of the `main` branch (which `demand-intel/CLAUDE.md`
states deploys production automatically via CI, with only the test suite as a gate) are all
completely unguarded from that session context. Given each repo's own `CLAUDE.md` describes
agents whose normal working directory is that repo (e.g. the growth lane's home base is
`resale-iq-growth`; the SEO/growth split described in `demand-intel/CLAUDE.md` implies sessions
routinely root there), this is not a hypothetical edge case — it's the default for at least three
of the four repos' own agent workflows.

**Smallest fix:** point each repo's own `.claude/settings.json` `PreToolUse` hook at the same
`guard.py` (its `SCOPE` array at `guard.py:41-56` already spans all four repos and the shared
scratchpad — it was written to be called from anywhere in the company), instead of — or chained
before — demand-intel's decorative ECC hooks. Add matching `settings.json` and hook wiring to
resale-iq-growth and resale-iq-seo, which currently have none.

**#3 (LOW) — no symlink resolution.** `check_paths` (`guard.py:96-119`) matches `SECRET`/
`PROTECTED` against `os.path.abspath(...)`, never `os.path.realpath(...)` — it does not follow
symlinks. A symlink whose own name doesn't match the `SECRET` regex but that resolves to a real
env file would not be caught by the Read/Edit/Write path check, because the matched path is the
symlink's own path string, not its resolved target. Creating such a symlink through Bash is
itself caught by the same env-file text check (unless combined with finding #1), but a non-Bash
path (an MCP tool not covered by the hook matcher, or Python string concatenation that never
spells the extension as a contiguous substring) would not be. Smallest fix: resolve the real path
before matching in `check_paths`; treat finding #1's fix as the higher-leverage mitigation since a
command-line substring match can never be made complete against deliberate obfuscation.

**#4 (LOW) — the hook's tool-name coverage is a fixed allowlist, not "everything."**
`settings.json:28`'s matcher and `guard.py:232-250`'s dispatch both only recognize
`Bash, Read, Edit, Write, NotebookEdit, MultiEdit`. Any other tool name a session has access to —
this very audit's own task briefing lists `Grep` and `Glob` as granted tools for this role — never
reaches `guard.py`, so neither the `SECRET` path check nor any `Bash` command check ever runs for
it. If a native content-search tool (as opposed to `grep` shelled out through `Bash`, which is
caught) is ever exercised against a path including an env file, it returns matching lines with the
hook never firing. Smallest fix: extend the `PreToolUse` matcher in `settings.json` to include
every tool name actually enabled for a project (`Grep|Glob` at minimum), and add a corresponding
branch in `guard.py`'s `main()`.
