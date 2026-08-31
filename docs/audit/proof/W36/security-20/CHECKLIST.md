# SECURITY — 20-point hardening checklist

`security-eng`, W36. Scope: `demand-intel` only (per the handoff — another agent
owns `resale-iq/src` copy this week; this doc is the one file this pass writes
outside `demand-intel`). Builds on `docs/audit/SECURITY-AUDIT.md` (Phase 1) —
does not redo it, cites it where a Phase 1 finding already covers an item.
Stack per AM-1: FastAPI + SQLite, not Next.js + Supabase; items 3 and 4 are
translated accordingly, as instructed.

Work: `demand-intel` branch `claude/security-eng/hardening-20`, commit
`2c89f11`. Full suite after the fix: **1153 passed** (`python3 -m pytest
tests/ -q`). No exploit was run against `resaleiq.dev`. No `.env` was opened;
no secret value was read or printed.

**Worst thing found, first:** item 15. `RegisterRequest.email`'s validation
regex (`api/auth.py`) excluded only `@` and whitespace, so
`/auth/register` — public, unauthenticated — accepted an email like
`<img src=x onerror=alert(document.cookie)>@evil.com`. That string is stored
verbatim in `users.email` and was rendered with **unescaped** template-literal
interpolation (`${u.email}`) inside an `innerHTML` assignment in
`demand-intel/frontend/admin.html`. `/admin` is proxied straight through to
this backend in production (`resale-iq/next.config.ts` rewrites:
`{ source: "/admin/:path*", destination: `${API}/admin/:path*` }`), so this
was a stored-XSS delivery path into the one browser session that holds
`_require_power` (owner) privileges — reachable by anyone, no account or
auth needed, one API call. **FIXED** in `demand-intel@2c89f11`: the regex now
also excludes `< > " ' \` & ;`, and `admin.html` escapes every interpolated
API value before it reaches `innerHTML` (matching the `safe()` pattern already
used in `frontend/deals.html`). Test added first, confirmed failing (4/6
crafted payloads accepted) before the fix, passing after —
`tests/test_register_email_validation.py::test_email_with_html_metacharacters_is_rejected`.
No existing account is affected: no real email address uses the characters
now blocked.

---

## 1. Hide API keys — PASS

No key in client-shipped code, in either the extension bundle or the
demand-intel-served frontend. Re-verified this pass:
- `grep -rniE "sk_live|sk_test|resend_api|jwt_secret\s*=" demand-intel/frontend/*.html` — zero
  matches.
- `extension/manifest.json` and `background.js`/`content.js`/`options.js` — no
  hardcoded key; already covered in Phase 1 ("no hardcoded API key in
  background.js/content.js/options.js/link.js").
- No `NEXT_PUBLIC_*` env var carries a secret — `resale-iq` is another
  agent's lane this week and was not re-audited beyond this grep; Phase 1
  already covered it.

## 2. Purge Git secrets — PASS (demand-intel); not re-run on resale-iq

`git log --all -p` on `demand-intel`, scanned for `sk_live_`, `sk_test_`,
`AKIA[A-Z0-9]{16}`, `ghp_[A-Za-z0-9]{30,}`, PEM/RSA/EC/OPENSSH private-key
headers, `AIza...`, and a broader
`(password|secret|token|apikey|api_key)\s*[:=]\s*['"][A-Za-z0-9+/=_.-]{12,}['"]`
sweep: **zero live credentials**. All hits are either regex *definitions*
inside a secret-scanner reference file, or test fixtures / doc examples
(`di_not_a_real_key`, `di_super_secret_key_value_abc123`,
`sqlAdministratorLoginPassword: 'REPLACE_WITH_KEYVAULT_REFERENCE'`, and the
`API_KEY = "sk-1234567890abcdef"` "BAD: Hardcoded secret" example inside a
`.claude/skills/*/references/` doc). No value is printed here per the rules —
only file/pattern locations were inspected. `resale-iq` history was not
re-scanned this pass; Phase 1 already ran the same sweep there and found
nothing (see SECURITY-AUDIT.md "Secrets in git history").

## 3. Use public DB key (translated: no client holds a DB credential) — PASS

No Supabase; translated per AM-1 to "can any client-side code reach the
database directly?" It cannot. The only DB handle is `aiosqlite` inside
`demand-intel`'s own process (`db/queries.py:get_db()`); the browser never
holds a DB credential of any kind. `resale-iq-stack.yml` confirms the
topology: the backend service is commented `:8080 — internal only`, carries
no `ports:` mapping to the host, and is reachable only from the `frontend`
container over the Docker-internal network — the frontend proxies
`/api /auth /stripe /admin` to it (`next.config.ts` rewrites). A browser can
reach only HTTP JSON endpoints behind auth, never the SQLite file.

## 4. Enforce row-level scoping (translated from RLS) — PASS, enumerated

SQLite has no RLS (AM-1); the guarantee is "every user-scoped query is
filtered by the caller's own id." Enumerated every user-data query in
`api/resale_routes.py` (the only place besides `db/queries.py` that touches
per-user tables) and its `db/queries.py` counterparts:

| Route | Query | Scoped? |
|---|---|---|
| `GET /api/watchlist` | `api/resale_routes.py:1104-1109` (`WHERE w.user_id=?`) | yes |
| `POST /api/watchlist` | `:1141` INSERT carries `user_id` from `_uid()` | yes (write, not a leak vector) |
| `DELETE /api/watchlist/{id}` | `:1165` `WHERE id=? AND user_id=?`, 404 on 0 rows | yes |
| `GET /api/portfolio` | `:1206-1211` `WHERE user_id=?` (+ optional status) | yes |
| `GET /api/portfolio/stats` | `:1238` `WHERE user_id=?` | yes |
| `POST /api/portfolio` | `:1249-1266` INSERT carries `user_id` | yes |
| `PUT /api/portfolio/{id}` | `:1284` sub-select and `:1307` UPDATE both carry `WHERE id=? AND user_id=?` | yes |
| `DELETE /api/portfolio/{id}` | `:1330` `WHERE id=? AND user_id=?` | yes |
| `POST /api/alerts/telegram/connect` | `:1461` `UPDATE users ... WHERE id=?` with `uid` from `_uid()` | yes |
| `DELETE /api/alerts/telegram/disconnect` | `:1481` same pattern | yes |
| `POST /api/alerts/telegram/test` | `:1495` `SELECT telegram_chat_id FROM users WHERE id=?` (own id only) | yes |
| `GET /api/account/trial-recap` | `db/queries.py:get_trial_recap(db, current_user["id"], ...)` | yes |
| `/auth/me`, `/auth/api-key`, `/auth/change-password`, `/auth/activity`, `/auth/export` | all key off `current_user["id"]` from `get_current_user` (JWT `sub`), never a client-supplied id | yes |

`_uid()` (`api/resale_routes.py:148-171`) resolves the id from the *validated*
Bearer JWT or `X-Api-Key` — never from a path/query/body parameter — so there
is no id-substitution surface upstream of these `WHERE` clauses either.
Admin routes (`/admin/*`, `/api/admin/*`) are correctly *not*
per-user-scoped — they are meant to return cross-user data — and are instead
gated by `_require_power` (item 6). Nothing enumerated returns another user's
row. This is the single most valuable item on the list per the brief, and no
gap was found.

## 5. Encrypt sensitive data — PASS

PII inventory (`db/schema.py` `users` table): `email` (plaintext — required
for login/notifications, not a secret), `hashed_password` (bcrypt, item 10),
`api_key` — stored as `api_key_hash` (SHA-256, `api/auth.py:340-345`,
`hash_api_key()`); the plaintext is returned once at issuance
(`issue_api_key`, `api/auth.py:751`) and never persisted — a DB or backup
leak yields no usable key or password. `telegram_chat_id` is plaintext
(low-sensitivity, functionally required to deliver alerts). No payment-card
or bank data is stored anywhere in the schema — Stripe holds PCI data;
`stripe_customer_id`/`stripe_sub_id` are opaque references, not card data.

## 6. Enforce server-side auth (no client-trusted plan/role) — PASS

Confirms and extends Phase 1's finding. Every `/admin/*` route calls
`_require_power` (`api/routes.py:44-75`, owner-email allowlist via
`is_owner_email`, **not** `plan=='power'`) — re-read all handlers this pass,
including the four not in Phase 1's explicit list:
`admin_list_users` (`:2018-2023`), `admin_change_plan` (`:2050-2052`,
additionally refuses to change the owner row's own plan), `admin_toggle_user`
(`:2173-2178`, refuses to disable the owner), `admin_delete_user`
(`:2210-2214`, refuses to delete owner/protected emails) — all call
`await _require_power(request)` explicitly; the rest use
`dependencies=[Depends(_require_power)]`. `get_current_user`
(`api/auth.py:385-426`) reads `plan`/`is_active` live from the DB on every
request rather than trusting the JWT's embedded claim — a cancelled or banned
user loses access on the very next call, not at token expiry (documented
in-line as a prior incident fix).

## 7. Lock record access (IDOR) — PASS

Same enumeration as item 4 covers this from the other direction: every route
taking an `item_id`/`user_id` from the request path checks ownership before
acting (`WHERE id=? AND user_id=?` on watchlist/portfolio mutations, 404 on a
zero-row match). Admin routes taking a `user_id` (`/admin/users/{id}/plan`,
`/toggle`, DELETE) are owner-only via `_require_power`, so the "ownership"
check there is correctly "is the *caller* the owner," not "does the target
row belong to the caller."

## 8. Block field tampering (mass assignment) — PASS

- `RegisterRequest.plan` is accepted from the client (`api/auth.py:592`) but
  force-overwritten to `"free"` at registration
  (`api/auth.py:632`, comment: "always free — plan upgrades via Stripe
  only"); the token is minted with `"free"` too (`:636`), never `req.plan`.
- `email_verified` is set only by three server-controlled paths: the
  verification-token flow (`api/auth.py:1018`), the Stripe webhook
  (`api/stripe_routes.py:289`), and the reset-password flow
  (`api/auth.py:892`) — never accepted in a request body.
- `stripe_customer_id`/`stripe_sub_id` are written only by
  `_link_customer()` (`api/stripe_routes.py:481-491`), called from the
  webhook handler after `stripe.Webhook.construct_event(...,
  STRIPE_WEBHOOK_SECRET)` signature verification (`:362`) — never from a
  client-supplied field.
- `is_owner` is never a stored column — `/auth/me` computes it per-request
  from `is_owner_email(current_user["email"])` (`api/auth.py:735`), so there
  is nothing to tamper.
- The two admin routes that accept a raw `dict` body
  (`update_cycle`, `update_catalog_item`) are both `_require_power`-gated,
  and `update_catalog_item` (`db/queries.py:1077-1090`) additionally
  whitelists keys against a fixed `allowed` set before building the SQL —
  belt-and-suspenders even for the owner-only path.

## 9. Secure session cookies — PASS, including the new commit

Auth is bearer-JWT / `X-Api-Key` in a header, not a cookie (Phase 1); the one
cookie in the system is the new anonymous-visitor identity added in
`demand-intel` commit `836e6d5` on `claude/backend-eng/anon-quota-cookie`
(not yet merged to `main` — reviewed via `git show`, not checked out).
Reviewed that commit specifically, as asked:
`response.set_cookie(ANON_VISITOR_COOKIE_NAME, create_visitor_token(visitor_id), max_age=ANON_VISITOR_COOKIE_MAX_AGE_DAYS*86400, httponly=True, secure=True, samesite="lax", path="/")`
(`api/routes.py:776-784` on that branch) — `HttpOnly`, `Secure`, `SameSite=Lax`
all correctly set, and the commit's own test suite asserts all three
(`test_...:561-565`). The cookie value is itself a signed token
(`create_visitor_token`/`decode_visitor_token`, reusing `JWT_SECRET`), so it
cannot be forged even though `HttpOnly` already prevents JS access to it.

**One behavioral note, not a defect in the cookie flags:** keying the anon
quota on a per-visitor cookie instead of IP (the whole point of the fix)
means a caller that never carries the cookie (curl, a cookie-clearing farm,
the extension's cookie-less background fetch) gets a fresh `visitor_id` —
and therefore a fresh 10/day allowance — on every single call, which is
weaker than the old IP-keyed bucket for that specific caller shape. The same
commit anticipates this and adds `ANON_IP_DAILY_CEILING` (`config.py`, 300/
day, `db/queries.py:count_ip_verdicts_today`) as a wide backstop keyed on the
real client IP for exactly the cookie-less case — so the regression is
already closed in the same change, not left open. Flagging it here only so
the founder can see the tradeoff was checked, not missed. See item 12 for
the residual gap this backstop doesn't close (no bot challenge under 300/day).

## 10. Hash passwords — PASS

`bcrypt` via `passlib.CryptContext(schemes=["bcrypt"], deprecated="auto")`
(`api/auth.py:67-71`) — passlib's bcrypt default cost factor is 12 rounds, a
sane work factor, never sha/md5. `_WEAK_PASSWORDS` blocklist plus a
length + not-the-email rule (`api/auth.py:74+`) raises the floor beyond
length alone.

## 11. Rate limit login — PASS

Three separate, purpose-built throttles in `api/auth.py`:
- `auth_attempts_ok`/`record_auth_failure` (`:219-236`) — 10 failed
  login attempts / 5 min / IP; a successful login never counts against the
  budget (documented, so it can't lock out a legitimate user who just typed
  their password right).
- `register_attempts_ok` (`:252-264`) — separate 10 signups / 5 min / IP
  bucket, kept apart from login failures so new signups from a shared
  NAT don't look like a login attack.
- `reset_request_ok` (`:288-308`) — 3 / 15 min, keyed on **both** IP and
  target address (closes both the "flood one inbox" and "walk an address
  list" angles); the throttle is recorded before the account lookup so a 429
  can never distinguish a real address from a fake one — `forgot-password`
  keeps its "always 200" contract, so this can't become an enumeration
  oracle either.
Caveat already flagged correctly in the code's own comments and in Phase 1:
in-process/per-worker, resets on deploy — acceptable at today's
single-worker scale, a real gap the day a second worker is added.

## 12. Add bot protection — OPEN (partial; founder decision)

The anon verdict endpoint (`GET /api/verdict`, `api/routes.py:650`) has
layered rate limiting — 60/min per identity (`check_rate_limit`,
`api/auth.py:200-218`) and a 10/day-per-visitor quota
(`claim_anon_verdict_quota`, TOCTOU-safe) — plus, as of `836e6d5`, a
300/day/IP backstop for cookie-less callers (item 9). **None of this is a
bot challenge.** A scripted client that simply respects the per-minute rate
limit can still pull up to 300 verdicts/day from one IP with zero human
interaction and no CAPTCHA/Turnstile/hCaptcha anywhere in the stack — 30×
the intended per-visitor allowance, and the "wide abuse backstop" comment in
`count_ip_verdicts_today` (`db/queries.py:2272-2286`) explicitly documents
that this is deliberate ("a speed bump... not an entitlement boundary"),
not an oversight. **Action for the founder:** decide whether 300/day/IP is
an acceptable ceiling for the free-tier funnel's abuse surface, or whether a
lightweight challenge (Cloudflare Turnstile is the standard low-friction
choice) belongs in front of `/api/verdict` for cookie-less/high-volume
callers. Not fixed this pass — it's a product/cost tradeoff (Turnstile is a
new external dependency touching the funnel, which is an OS §0.10 founder
gate: "new dependency").

## 13. Parameterize queries — PASS

`tests/test_sql_parses.py` (existing, ran clean this pass: "130 static
queries checked, 10 f-string queries NOT checked") plus a manual read of
every one of those 10 f-string sites: all build only placeholder strings
(`?,?,?` via `",".join("?" for _ in ids)`) or column lists drawn from a
**fixed, hardcoded** allowlist — never from a client-supplied key or value.
Specifically checked `db/queries.py:1077-1090`
(`update_catalog_item`, keys filtered against a fixed `allowed` set),
`db/queries.py:2506-2512` (`get_trial_counter`, `column` validated against
`("trial_live_used","trial_planner_used")` before interpolation), and
`api/resale_routes.py:1307` (`update_portfolio_item`'s `set_clause` built
from a fixed Python dict's own keys, values still `?`-bound). No live
f-string/`.format()`-built SQL takes a client-controlled string into the
query text; matches Phase 1's finding, re-verified with fresh greps this
pass.

## 14. Validate all input — PASS

Spot-checked the public-facing surface: `/api/verdict` bounds `q` to 2-200
chars (`api/routes.py:653-655`); `/api/search/vinted` uses `Query(...,
min_length=2, max_length=200)` plus `market`/`limit` bounds
(`api/routes.py:2327-2330`); `WatchlistAdd`/`PortfolioAdd`/`PortfolioUpdate`
(`api/resale_routes.py`) all carry Pydantic `Field` length/value constraints
(`min_length=1, max_length=100/200`, `ge=0.01`, etc.); `RegisterRequest`
validates email shape and length (item 15) and password strength
(`validate_password_strength`). No endpoint found taking a raw unvalidated
`str`/`dict` body from a public (non-`_require_power`) route.

## 15. Escape user content — FIXED (see "worst thing found" above)

Root cause fixed at the source (`_EMAIL_RE` tightened, `api/auth.py:597`) plus
the rendering sink hardened (`frontend/admin.html`, `safe()` escaping added
for `u.email`, `u.plan` display, and `reddit_queue` `subreddit`/`title`/
`status`). Checked the other rendering surfaces this item calls out:
- `resale-iq/src` JSON-LD (`MED-2` in SECURITY-AUDIT.md) — not touched this
  pass; still open per Phase 1, belongs to the frontend/content lane, not
  re-verified since that repo is out of scope for this pass.
- `extension/content.js` — already confirmed clean in Phase 1 (`esc()`
  entity-escaping on every scraped-field call site).
- `frontend/deals.html` — already escapes (`safe()`, pre-existing); used as
  the reference pattern for the `admin.html` fix.
- Other `frontend/*.html` pages (`watchlist.html`, `portfolio.html`,
  `dashboard.html`, `brands.html`, `trends.html`) render `brand`/`model`/
  `notes` values via unescaped `innerHTML` template literals too. `brand`/
  `model` in the signals tables come from the catalog pipeline (not raw
  attacker-controlled free text, per `CLAUDE.md`: "Brand comes from Vinted,
  never from the search term"), but `WatchlistAdd`/`PortfolioAdd.notes`
  (and `brand`/`model` on those two endpoints specifically) are **client-
  supplied free text with no server-side catalog check** — a user can set
  their own watchlist/portfolio `notes` to arbitrary HTML. Since watchlist/
  portfolio reads are scoped to the owning user only (item 4), this is
  **self-XSS at worst** (a user can only inject into a page only they view)
  — not fixed this pass because it's a different, lower-severity pattern
  than the one just fixed (no privilege boundary crossed) and touches five
  more files; flagging as **OPEN/low** for a follow-up pass to apply the
  same `safe()` treatment project-wide rather than file-by-file.

## 16. Restrict file uploads — PASS (no upload path exists)

`grep -rn "UploadFile\|multipart\|save(\|os.path.join.*filename" api/*.py` —
zero matches. There is no file-upload endpoint anywhere in `demand-intel`.

## 17. Trim API responses — PASS

`/auth/me` (`api/auth.py:701-736`) returns `id, email, plan, email_verified,
trial_active, trial_days_left, telegram_chat_id, is_owner` — no
`hashed_password`, no `api_key_hash`. `/admin/users`
(`api/routes.py:2018-2029`) selects an explicit column list (`id, email,
plan, is_active, created_at, stripe_customer_id, stripe_sub_id,
verdict_count_today, verdict_date, email_verified`) — again no password
hash — and is owner-only besides. `get_current_user` (`api/auth.py:385-426`)
narrows the JWT path to `{id, email, plan}` before it's used anywhere
downstream. No route returns a full `SELECT *` off `users` to a non-admin
caller (the one `SELECT *` on `users`-adjacent data,
`admin_reddit_queue_item`, `api/routes.py:2289-2301`, is
`_require_power`-gated and reads `reddit_queue`, not `users`).

## 18. Add security headers — PASS; `ALLOWED_ORIGINS` empty is the safe direction

Confirmed the specific question in the brief: with `ALLOWED_ORIGINS` unset/
empty, `main.py:1084-1085` produces `_origins = []`, passed to
`CORSMiddleware(allow_origins=[], allow_credentials=True, ...)`
(`main.py:1104-1111`). An empty allow-list is the **restrictive** direction
— Starlette's CORS middleware only ever adds an `Access-Control-Allow-Origin`
header for an origin present in the configured list, so `_origins=[]` means
**no** foreign origin gets a CORS-allow header; browsers block cross-origin
reads. This is not permissive, and matches the in-code comment ("Defaults to
same-origin only") and Phase 1's finding that it was verified against
production on 2026-08-12. The dangerous case the code explicitly guards
against is `ALLOWED_ORIGINS=*`, which `main.py:1093-1102` strips and logs an
error for, specifically because Starlette would otherwise *reflect* the
caller's origin under `allow_credentials=True` — that is not today's config.
Security-headers middleware (`main.py:1117-1126`) sets
`X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`,
`Referrer-Policy`, `Permissions-Policy`, and conditionally HSTS. **Note, not
a live gap:** the HSTS line only fires `if request.url.scheme == "https"`,
and `uvicorn.run()` in `main.py` is called with no `proxy_headers`/
`forwarded_allow_ips` argument — but this is moot in the current topology,
because the backend is never internet-facing (item 3/19): only the Next.js
frontend container is, and it sets its own HSTS
(`resale-iq/next.config.ts:33-40`, already confirmed in Phase 1). If the
backend is ever exposed directly (a second ingress, a debug port), this
line would need `uvicorn.run(..., proxy_headers=True,
forwarded_allow_ips=...)` to see the real scheme.

## 19. Force HTTPS — PASS

Enforced at the actual internet-facing edge: `next.config.ts` HSTS with
preload (Phase 1, `MED-3`/headers section) plus Coolify/Traefik terminating
TLS for the public `frontend:3000` service (`resale-iq-stack.yml` comment:
"Coolify maps this to your domain + HTTPS"). `demand-intel`'s own backend is
internal-only (item 3) and is reached over the Docker network, not the
public internet, so its HTTP-only listener is not a live HTTPS gap — see the
note under item 18.

## 20. Scan dependencies — 1 informational finding, not reachable

`pip-audit -r demand-intel/requirements.txt` (ran this pass, via a throwaway
venv since the environment lacked `pip`): **1 known vulnerability** —
`ecdsa==0.19.2`, `PYSEC-2026-1325` / `CVE-2024-23342` (Minerva timing attack
on P-256 ECDSA signing; verification is unaffected; upstream "considers side
channel attacks out of scope... no planned fix"). `ecdsa` is an unconditional
`install_requires` of `python-jose==3.5.0` (confirmed via PyPI metadata) —
present in the tree even with the `[cryptography]` extra installed — but
**not reachable**: `demand-intel` signs/verifies JWTs with `HS256` only
(`api/auth.py:36`, `JWT_ALGORITHM = "HS256"`), never an EC algorithm, and
`grep -rl "ecdsa" api/ db/ engine/ scrapers/ main.py config.py` finds no
direct import anywhere in the application. python-jose additionally prefers
its `cryptography`-backed implementation over the pure-python `ecdsa`
backend when the `cryptography` extra is installed, which it is here. Same
posture as Phase 1's `LOW-1` (nanoid): present, not exercised by any request
this app serves. **Recommend, not urgent:** the founder can drop `ecdsa`
from the resolved tree by pinning `python-jose[cryptography]` without the
plain `ecdsa` extra at the next dependency bump, purely to shrink the
audit surface — no functional change needed. `npm audit` on `resale-iq` was
not re-run this pass (out of scope, another agent's lane); Phase 1 already
covered it (`LOW-1`, build-time-only `nanoid` advisory, not reachable).

---

## Summary

| # | Item | Verdict |
|---|---|---|
| 1 | Hide API keys | PASS |
| 2 | Purge Git secrets | PASS (demand-intel; resale-iq relies on Phase 1) |
| 3 | Public DB key (translated) | PASS |
| 4 | Row-level scoping (translated) | PASS — fully enumerated |
| 5 | Encrypt sensitive data | PASS |
| 6 | Server-side auth | PASS |
| 7 | Lock record access (IDOR) | PASS |
| 8 | Block field tampering | PASS |
| 9 | Secure session cookies | PASS (incl. new commit `836e6d5`) |
| 10 | Hash passwords | PASS |
| 11 | Rate limit login | PASS |
| 12 | Bot protection | **OPEN** — founder: accept 300/day/IP ceiling or add a challenge (new-dependency gate) |
| 13 | Parameterize queries | PASS |
| 14 | Validate all input | PASS |
| 15 | Escape user content | **FIXED** (email regex + admin.html) — plus **OPEN/low**: watchlist/portfolio `notes`/`brand`/`model` self-XSS in 5 more `frontend/*.html` files |
| 16 | Restrict file uploads | PASS (no upload path) |
| 17 | Trim API responses | PASS |
| 18 | Security headers | PASS — `ALLOWED_ORIGINS=""` confirmed restrictive, not permissive |
| 19 | Force HTTPS | PASS |
| 20 | Scan dependencies | 1 informational, not reachable (`ecdsa`/PYSEC-2026-1325 via python-jose, HS256-only app never exercises it) |

**Fixed this pass:** item 15 (stored XSS via email → admin panel — the worst
finding). `demand-intel@2c89f11`, branch `claude/security-eng/hardening-20`.
Test-first, full suite green (1153 passed).

**Open for the founder:**
- Item 12 — bot protection on `/api/verdict` (new-dependency gate, OS §0.10).
- Item 15 (residual) — same escaping treatment for
  `watchlist.html`/`portfolio.html`/`dashboard.html`/`brands.html`/
  `trends.html`; low severity (self-XSS only), follow-up not blocking.
- Item 20 — optionally drop `ecdsa` from the resolved dependency tree at the
  next bump; not exploitable today.
- Items 2 and 15 (JSON-LD) — Phase 1 findings in `resale-iq/src`, owned by
  the content/frontend lane this week, not re-verified or re-fixed here.
