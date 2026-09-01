# COMPLIANCE.md — legal-compliance risk register

Owner: `legal-compliance` (on-call). KPI card: primary = no public claim without a source,
secondary = DSAR response readiness, counter = no PII in logs.

**I am not a lawyer and this is not legal advice.** This is a risk register built by reading the
actual code and the actual live pages, written so a founder can act on it. Every row cites a
file:line or a live artefact. Anything marked **NEEDS COUNSEL** is a judgment call about EU law
that a machine cannot close — get a real lawyer (ideally Spain-qualified, since `/legal` states the
operator is based in Spain) before treating it as settled.

Method: read `db/schema.py`, `api/auth.py`, `api/routes.py`, `scrapers/vinted.py` in
`~/work/demand-intel`, and `src/app/{privacy,terms,legal}/page.tsx`, `extension/`,
`docs/audit/{CLAIMS,MAP,SECURITY-AUDIT,DATA,MONEY}.md` in `~/work/resale-iq`. No `.env` was opened.
No live request was sent beyond what other audits already document. Two claims in the schema
comments (`pageviews.visitor_hash`, `referrer_host`) were checked against the code that *writes*
them, not just the comment — see §1.1.

---

## RISK REGISTER — ranked by expected harm

| # | Risk | Likelihood | Impact | Evidence | Smallest mitigation |
|---|---|---|---|---|---|
| 1 | **The privacy policy and account-page UI publicly promise GDPR data export and account deletion that the backend does not actually perform.** This is not "no DSAR process" — it is a **published, false compliance claim**, which is worse. | **High** (EU-facing product; a DSAR or an account deletion is a when-not-if event) | **High** — Art. 15/17/20 GDPR non-compliance plus a documentable false statement ("This export contains all personal data... per GDPR Article 20") | See §1.2, §1.3 below | Fix `export_data()` and `delete_account()` to cover every user-linked table (list in §2), or change the copy on `/privacy` and the account page to stop promising what the code doesn't do, today, in the same PR |
| 2 | **Self-service `/delete-account` does not cancel the Stripe subscription.** A user who deletes their account keeps being billed; the local record of who they were is gone, so a future Stripe webhook for that customer has nothing to reconcile against. | Medium (only affects paying users who delete rather than cancel first) | High — continued billing after "account deleted" is both a GDPR erasure failure and a straightforward consumer-protection / chargeback problem | `api/auth.py:842-851` — no `stripe_sub_id` read, no Stripe API call | Before deleting the row, if `stripe_sub_id` is set, cancel it via the Stripe API (or block deletion with "cancel your subscription first" until that's built) |
| 3 | **No retention limit on any personal-data-adjacent table** — `verdict_logs.query` (raw, unrestricted text a person typed), `purchase_logs`, `activity_logs` never age out. Only `listings` (market data) has a retention job. | Medium (a DPA asking "how long do you keep this" has no good answer today) | Medium-High — Art. 5(1)(e) storage-limitation is a distinct GDPR principle from erasure-on-request | `db/queries.py:2580-2598` (`LISTINGS_RETENTION_DAYS`, listings only); no equivalent found for `verdict_logs`/`purchase_logs`/`activity_logs` in `db/queries.py` or `main.py`'s APScheduler jobs (§7 of `docs/audit/MAP.md` lists all 20 jobs — none is a personal-data retention job) | Pick a number (90 days is a defensible default for search logs) and add one APScheduler job; state the number in `/privacy` |
| 4 | **`/privacy` withholds the controller's legal identity ("provided on request") instead of stating it**, and states no legal basis for processing, no retention periods, no international-transfer disclosure for Stripe/Resend. | High (every visitor to `/privacy` sees this) | Medium — Art. 13 GDPR requires this information to be given proactively, not on request | `src/app/legal/page.tsx:9-10,26-30` ("legal name, tax ID, postal address... provided on request"); `src/app/privacy/page.tsx` has no controller-identity block, no legal-basis line, no retention-period line, no transfer disclosure | **NEEDS COUNSEL** — likely just needs the identity block added to `/privacy` itself (it already exists as text, just gated behind an email) plus 3-4 sentences on basis/retention/transfers |
| 5 | **Raw email addresses are written to application logs** in at least five call sites. | Medium (depends on log retention/access at the hosting provider, which this audit could not check without opening `.env`/Coolify) | Medium — this is the counter-KPI on this role's own card | `api/email.py:71,85,88`; `api/auth.py:850`; `api/routes.py:2290`; `api/stripe_routes.py:466` | Log `user_id` (or a truncated hash) instead of the raw address; keep the address only in the one line that's genuinely needed for support triage, and note the retention window of wherever those logs land |
| 6 | **Consumer-facing claims a regulator or a paying customer could call misleading** — five items, already fully evidenced in `docs/audit/CLAIMS.md`, restated here with the consumer-law framing | High (they are live on the site today) | High — EU Unfair Commercial Practices Directive covers false claims about a product's main characteristics and (for the API-rate-limit item) unsubstantiated guarantees | See §3 | See §3, one line per claim |
| 7 | **The Vinted-facing scraper is ordinary public-data access AND a Terms-of-Service breach, and the platform has already taken active measures against it** (production IP 403-blocked; the residential fallback gets 429-throttled). That is a materially different risk posture than "we scrape public pages" — it is evidence of an adversarial relationship with the data source the entire product depends on. | Medium (no legal action today; blocking has already escalated once) | Very High if realised — the whole product is Vinted data | `scrapers/vinted.py` (rate limiting, backoff, 403/429 handling — see §4); `docs/eng/runbook/local-scrape-agent.md`; `docs/audit/MAP.md §7` | **NEEDS COUNSEL** on the actual ToS text and EU case law exposure (database right, computer-misuse-style claims vary by member state); business-side mitigation is §4's contingency plan, not a technical one |
| 8 | **The Chrome Web Store listing text still carries the false "collected about every 30 minutes" claim** that `CLAIMS.md` already found false on the main site (actual cadence ~2h, and broken entirely for 11 days per the runbook). | High (live in the store listing today) | Medium — store-policy risk (inaccurate listing) layered on top of the same consumer-claim risk as #6 | `extension/STORE-LISTING.md:50-51` ("collected about every 30 minutes and recomputed roughly every 2 hours") vs. `docs/audit/CLAIMS.md §3` and `docs/eng/runbook/local-scrape-agent.md` | Same fix as `CLAIMS.md` Top-10 #2, applied to this file too — it was missed because it's a different repo location, not because it's a different fact |
| 9 | **`predictions` accuracy is not currently claimed anywhere (0 of 340 predictions graded), but nothing *enforces* that** — no visible counter, no code-level gate found tying "30 outcomes" specifically to a publish decision. | Low today (nothing false is currently published) | High if it slips — publishing an accuracy number before real grading is a textbook false-advertising claim | `docs/audit/CLAIMS.md §5` — found `EVAL_WINDOW_DAYS = 30` (a time window) but no `MIN_SCORED`/count gate | A one-line SQL check any agent proposing to publish an accuracy figure must run first: `SELECT COUNT(*) FROM predictions WHERE outcome_correct IS NOT NULL` — refuse the PR if it's below the number the copy claims |
| 10 | Extension permissions and Stripe delivery — checked, no gap found | — | — | See §5 | None needed |
| 11 | **NEW, 2026-09-01 — `resale_routes.py` publishes an actionable buy-below price on paid surfaces (Deal Finder, watchlist, brand/model pages, opportunities, sourcing links) with no evidence-floor check**, while the same underlying number is correctly fail-closed at `n<8` on `/api/verdict`. See §6 — this is now ranked ahead of everything except itself for anyone paying **tonight**; read §6.4 for why the ordering against #1 is not what you'd guess from this table's static ranking. | High (measured live: 18/41 shifted models are on ungated surfaces today) | High — this is the product's core paid promise, not a secondary right | `engine/listing_identity.py:39-74`, `api/resale_routes.py` (`publishable_opportunity`, `build_sourcing_links`) — full trace in §6 | §6.5 |

---

## §1. GDPR / personal data

### 1.1 Verifying the schema comments (not trusting them)

`db/schema.py:774-799` (`pageviews` table) carries two comments: *"host only, never the full
referring URL"* and *"salted daily hash, not an identity."* I checked the writer, not the comment:

- `_visitor_hash(ip, ua)` (`api/routes.py:3029-3035`) — `sha256(f"{today}|{JWT_SECRET}|{ip}|{ua}")`,
  truncated to 32 hex chars. Rotates daily (the date is baked into the hash input), keyed with a
  server secret, and cannot be reversed to the IP without brute-forcing 128 bits plus the secret.
  **Comment verified TRUE.**
- `ref_host = urlparse(ev.referrer).hostname` (`api/routes.py:3063-3071`), truncated to 120 chars,
  and the site's own domain is zeroed out before storage. Only ever a hostname, never a path or
  query string. **Comment verified TRUE.**

Both are good engineering and don't need fixing. This is stated so the one clean result in this
audit doesn't get lost among the gaps below.

### 1.2 What is actually stored, by table (the DSAR inventory)

Every table with a `user_id` column or FK, or that otherwise carries a query a real person typed:

| Table | Personal data | FK to `users.id`? | Cascades on delete? |
|---|---|---|---|
| `users` | email, hashed_password, plan, `api_key_hash`, `telegram_chat_id`, Stripe customer/sub ids, trial flags | — | — |
| `watchlist_items` | brand/model watch, notes | `ON DELETE CASCADE` (`schema.py:371`) | Yes, **if** the deleting connection has `PRAGMA foreign_keys=ON` — see 1.3 |
| `portfolio_items` | cost, sold price, `source_url`, free-text `notes` | `ON DELETE CASCADE` (`schema.py:385`) | Same caveat |
| `saved_searches` | filter JSON | `ON DELETE CASCADE` (`schema.py:427`) | Same caveat |
| `user_alerts` | alert target/threshold | `ON DELETE CASCADE` (`schema.py:440`) | Same caveat |
| `password_resets` | reset token | `ON DELETE CASCADE` (`schema.py:454`) | Same caveat |
| `email_verifications` | verification token | `ON DELETE CASCADE` (`schema.py:465`) | Same caveat |
| `signup_attribution` | acquisition source/campaign | `ON DELETE CASCADE` (`schema.py:750`) | Same caveat |
| `verdict_outcomes` | buy/sell price the user actually paid | `ON DELETE CASCADE` on **both** `user_id` and `verdict_log_id` (`schema.py:838-839`) | Same caveat, plus depends on `verdict_logs` row still existing (see below) |
| `activity_logs` | `action`, free-text `details`, `ip_hash` | `ON DELETE SET NULL` (`schema.py:476`) | Anonymises rather than deletes — a legitimate audit-log pattern, but only if the pragma actually fires (1.3) and if `details` never carries free text a person typed (not verified in this pass — worth a `qa-eng` check of every call site) |
| `verdict_logs` | **raw query text**, `ip_hash`, `client_ip_hash`, `said_buy_below`/`said_sell_avg` | **No FK** — `user_id` added by `ALTER TABLE` (`schema.py:1025`), plain `INTEGER`, no `REFERENCES` clause | **No.** Never cascades under any circumstance. Must be deleted explicitly. |
| `purchase_logs` | **raw query text**, `listing_url`, `bought_at` (price the user says they paid) | **No FK** — plain `INTEGER` (`schema.py:527`) | **No.** Same as above. |

`pageviews` is excluded from this table on purpose: it carries no `user_id` and, per §1.1, its
`visitor_hash` cannot be linked back to a person or across days. It is not "this user's data" in
the DSAR sense.

### 1.3 The account-deletion gap — proven, not inferred

`db/queries.py:74-78` (`get_db()`) sets `PRAGMA foreign_keys=ON` on every connection it opens — this
is what makes the `ON DELETE CASCADE` clauses above actually fire. But the two routes a real person
actually calls to touch their own data **do not use `get_db()`**:

```
api/auth.py:846   async with aiosqlite.connect(DB_PATH) as db:   # delete_account
api/auth.py:1123  async with aiosqlite.connect(DB_PATH) as db:   # export_data
```

`aiosqlite.connect()` (and the SQLite C library underneath it) defaults `foreign_keys` to **OFF**
per connection; nothing in either function turns it on. Consequence, verified by reading the
executed statement, not by running it:

- `delete_account` (`api/auth.py:842-851`) issues exactly one statement:
  `DELETE FROM users WHERE id=?`. On this connection the eight `ON DELETE CASCADE` tables in §1.2
  **do not cascade** — their rows sit in the database with a `user_id` that no longer resolves to
  any account, un-anonymised, un-deleted. `verdict_logs` and `purchase_logs` were never going to be
  touched by a cascade anyway (no FK exists), and this route doesn't delete them explicitly either
  — unlike the two **admin** routes (`api/routes.py:2219,2287`), which do explicitly
  `DELETE FROM purchase_logs ... ; DELETE FROM verdict_logs ...` before deleting the user. **The
  self-service path a real customer uses is less complete than the internal admin path**, which is
  backwards from what a DSAR process should look like.
- Net result of clicking "Delete my account" on `resaleiq.dev/account` today: the `users` row is
  gone (email/password/plan/API key/Telegram chat id are erased); everything else — watchlist,
  portfolio (which can carry free-text notes), saved searches, alerts, every raw search query ever
  typed while signed in, every self-reported buy/sell price, the Stripe subscription itself — is
  left exactly as it was.

### 1.4 The export gap — proven, not inferred

`export_data()` (`api/auth.py:1120-1142`) selects six columns from `users`
(`id, email, plan, email_verified, is_active, created_at` — note this omits `telegram_chat_id` even
within that one table) plus all of `activity_logs`, and returns it with the literal string *"This
export contains all personal data held by Resale IQ per GDPR Article 20."* It does not touch any of
the other nine tables in §1.2 — watchlist, portfolio, saved searches, alerts, raw search history,
self-reported prices, or acquisition attribution. **The claim in the response body is false as
written**, independent of whether a real DSAR has ever tested it.

### 1.5 Fix, in priority order (smallest first)

1. Today, cheapest, no code change: soften the copy on `/privacy` (`src/app/privacy/page.tsx:25,27`)
   and the `export_data` response note (`api/auth.py:1141`) to stop claiming completeness they don't
   have, while a real fix is built. This is the "stop the lie" step, not the "fix the gap" step.
2. Route `delete_account` and `export_data` through `db/queries.get_db()` (or explicitly set
   `PRAGMA foreign_keys=ON` on their own connections) so the eight CASCADE tables actually cascade.
3. Add explicit `DELETE FROM verdict_logs WHERE user_id=?` and `DELETE FROM purchase_logs WHERE
   user_id=?` to `delete_account`, matching what the admin routes already do.
4. Before the `DELETE FROM users` in `delete_account`, if `stripe_sub_id` is set, cancel the Stripe
   subscription (or block deletion until the user cancels, whichever the founder prefers — this is
   a founder-gate product decision, not a code decision).
5. Extend `export_data` to union all nine tables in §1.2, keyed on `user_id`.
6. Add a retention job for `verdict_logs`/`purchase_logs`/`activity_logs` (risk #3) and state the
   number in `/privacy`.

None of steps 2-5 are large — they're the same shape as the admin routes that already exist and
work. This is a backend-eng ticket, not a research problem.

---

## §2. DSAR readiness — the runbook (write it because it doesn't exist)

**Today, if a DSAR lands at `support@resaleiq.dev`, here is what must happen by hand**, because the
self-service tools in §1 are incomplete. This is the operational answer to "what exactly happens
today" — the honest answer is "not enough, without a human filling the gap manually":

### Access request (Art. 15) / portability (Art. 20)
1. Confirm the requester's identity matches the account email (existing `get_current_user` auth is
   sufficient if they're logged in; if they email in from a different address, verify some other way
   before disclosing anything — a misdirected DSAR response is its own breach).
2. Run `/auth/export-data` as that user for the baseline (`users` fields it covers +
   `activity_logs`).
3. **Manually supplement** — until §1.5 step 5 ships — with a read-only query against each of the
   remaining eight tables in §1.2, filtered `WHERE user_id = <id>` (or `WHERE verdict_log_id IN
   (SELECT id FROM verdict_logs WHERE user_id = <id>)` for `verdict_outcomes`). Use the read-only
   `sqlite3 'file:...?mode=ro'` connection per AM-1's tooling rule — never write during a DSAR.
4. Note explicitly in the response what is held **outside** this database: Stripe (customer profile,
   payment method, invoices) and Resend (transactional email send logs) each hold their own copy of
   the email address and, for Stripe, billing history. Point the requester to Stripe's own data
   rights process for anything Stripe-side if asked, since this company doesn't hold that data
   directly.
5. Respond within one month (Art. 12(3)); log the request and response date somewhere durable so a
   second request from the same person doesn't restart the clock incorrectly.

### Erasure request (Art. 17)
1. Same identity check as above.
2. If `stripe_sub_id` is set, cancel the Stripe subscription **first** (manually, in the Stripe
   dashboard, until §1.5 step 4 ships) — do not leave someone being billed after they've asked to be
   deleted.
3. Run `delete_account` (or the admin delete route) — today this only removes the `users` row.
4. **Manually run** the explicit deletes the code doesn't yet do:
   `DELETE FROM verdict_logs WHERE user_id=?`, `DELETE FROM purchase_logs WHERE user_id=?`, and
   confirm the eight CASCADE tables actually emptied (they will, if this manual step is run via
   `db/queries.get_db()`-style tooling with the pragma on — a raw `sqlite3` CLI session has
   `foreign_keys` **off by default too**, so explicitly `PRAGMA foreign_keys=ON;` in that session
   before deleting, or delete all nine child tables explicitly rather than relying on cascade).
5. State in the reply that backups are on a rotation window and the deleted data will drop out of
   backups once the current retention cycle rolls over — `docs/audit/SECURITY-AUDIT.md` MED-1 notes
   the backup rotation is "disk-share budget," not a fixed day count, so **this number needs to be
   pinned down and stated** (a `devops` task, not a `legal-compliance` one, but this role should keep
   asking until it has an answer).
6. Log the deletion (who, when, what was removed) in a durable record kept **outside** the deleted
   user's own data, since "prove we did it" is itself a retention obligation.

### Rectification (Art. 16)
No dedicated route was found. Today this is: the user changes what they can from `/account`
(password via `change-password`, presumably watchlist/portfolio edits via their own CRUD routes),
and anything else (e.g. a wrong email) goes through `support@resaleiq.dev` as a manual `UPDATE`.
Fine for current volume; worth a note if support volume ever grows.

---

## §3. Consumer-facing claims — the ones a regulator or a customer could call misleading

Full evidence and file:line citations for all of these already exist in `docs/audit/CLAIMS.md`
(Phase 1 truth pass, product-manager) — this section restates the subset with active legal exposure
and adds the consumer-law framing that document didn't need to make explicit.

1. **"Scraped every 30 min" / "recomputed hourly"** — stated as fact on the homepage, `/methodology`,
   the Chrome Web Store listing (`STORE-LISTING.md:50-51`, item #8 above), and `llms.txt`. Actual
   cadence is ~2 hours by design (`config.py` comment, cited in `CLAIMS.md §3`), and the residential
   fallback had a broken 11-day stretch with zero new data. This is a claim about the product's core
   characteristic (data freshness) that is provably false at the moment a customer reads it — the
   kind of claim EU unfair-commercial-practices rules target directly. *Fix already scoped in
   `CLAIMS.md` Top-10 #2; this register just adds: fix `STORE-LISTING.md` in the same commit, it was
   missed the first time because it lives in a different repo location for the same fact.*
2. **"All 100 product signals"** sold as the headline Starter €19 feature — no enumeration found
   anywhere in either codebase, actual field count ~25. A specific, countable number used to sell a
   paid tier, with nothing behind the number. `CLAIMS.md §2`, Top-10 #3.
3. **"26-market Price Compare" sold as part of Pro €49** with no disclosure that 21 of those 26
   markets return only live asking prices — none of the buy-below/verdict/sell-through analytics the
   rest of the page is selling. `CLAIMS.md §1`, Top-10 #1 — flagged there as the single highest-damage
   finding in that audit, and this register agrees with that ranking.
4. **Live Deal Finder "scanned every 30 minutes"** (Pro €49 pitch) is in fact an on-demand endpoint
   with no scheduled scan found anywhere in the backend. `CLAUDE.md §4`, Top-10 #4.
5. **REST API "60 requests per minute per key"** published on `/api-docs` for a paying tier, with no
   empirical confirmation the limit is actually enforced (`CLAIMS.md §4`, Top-10 #6). Distinguish
   this from the "hard no" governance question in `docs/company/DECISIONS.md` A5/`MONEY.md` §"REST
   API" — **the API and Order Planner are real, delivered, server-side entitlement-enforced
   features** (`MONEY.md` line 56/58), so "sold but not delivered" does **not** apply to them; the
   only live risk is the unverified rate-limit number, which is a much narrower fix (a load test) than
   the governance-doc contradiction, which is `tech-lead`'s problem, not this role's.

None of these need new evidence-gathering — they need the fix `CLAIMS.md` already specifies,
treated as a legal deadline (false claims accrue liability every day they stay live), not just a
product-polish backlog item.

---

## §4. The scraping posture

### What the code actually does (checked directly, not assumed)

`scrapers/vinted.py`:
- Rate limit: **1 request/second per domain, with 0.8-2.5s jitter** (line 4 header comment,
  `rate_limit()` at line 560).
- `429` → back off 5 minutes for that domain only (line 5, `580-582`).
- `403` → counted honestly (`blocked_403` counter, lines 482-484, 527-528, 621-622) and logged as
  what it is — *"the egress IP is blocked by Vinted, not a session problem"* (line 532-533) — never
  silently retried against the same IP in a way that would look like probing for a gap in the block.
- `SCRAPER_PROXY`, when set, routes requests through a proxy (lines 446-451, 486, 497-498, 1000,
  1304-1310) — used **because** the production host's IP is already blocked (per the code's own
  comment at line 490-494 and the runbook), not to defeat a block that hasn't happened yet.
- A standard browser `User-Agent` string is sent (line 501, 1310) — this is normal HTTP client
  behaviour, not a fingerprint-evasion technique; nothing in the code rotates User-Agents, solves
  CAPTCHAs, or otherwise actively works around a detection mechanism.

**This register does not recommend anything beyond what's already there** — per the task brief, if
Vinted blocks the scraper harder, the answer is a business answer, not a technical one (below). No
evasion technique is proposed here, and none should be added to the codebase in response to a block.

### Framing the risk honestly, both directions

- **In favour of "this is ordinary public-data access":** every request targets a public listing
  page or public search endpoint, at a rate slower than a human browsing session could plausibly
  sustain by hand (1 req/s/domain), with no login, no paywall bypass, no scraping of private
  messages or account data. Courts in several jurisdictions (most famously *hiQ v. LinkedIn* in the
  US, though EU case law and the Database Directive's sui generis right are a different legal
  framework — see below) have drawn a real line between "public, unauthenticated data" and
  "circumventing access controls."
- **In favour of "this is a ToS breach, and Vinted has already acted on it":** Vinted's Terms of
  Service almost certainly prohibit automated access (standard for marketplace platforms; the actual
  clause was not read as part of this pass — **NEEDS COUNSEL** to confirm the exact wording and
  whether it's enforceable in the relevant jurisdiction). More importantly, **this isn't
  theoretical** — the production server's IP is already 403-blocked *by Vinted specifically*
  (`docs/eng/runbook/local-scrape-agent.md`), and the residential fallback built to route around
  that block is itself now getting 429-throttled. That is evidence of an active, escalating
  adversarial relationship with the platform the entire product is built on, not a passive "we read
  public pages and hope nobody minds" posture.

**NEEDS COUNSEL:** whether Vinted's actual ToS creates enforceable liability for this specific access
pattern, and what EU sui generis database-right exposure looks like for storing/republishing derived
statistics (buy-below prices, sell-through rates) computed from scraped listings — this is a
genuinely unsettled question this pass cannot close.

### "Vinted blocks us" — the contingency plan, written because it doesn't exist yet

`docs/company/OS.md §2` lists this as owed by this role; nothing in `docs/audit/` or
`docs/company/` currently contains it (only references to the *current* partial block, not a plan
for a full one). Per the task brief, this must be a **business** answer:

1. **Trigger:** all five Vinted TLDs return 403/429 persistently (not the current partial state) from
   both the production IP and the residential fallback, for a sustained window (e.g. 24h) with the
   backoff logic already in place having had a fair chance to recover.
2. **Immediate customer communication, not silence:** the homepage/methodology already promise a
   specific refresh cadence (currently false per §3 item 1 anyway — fix that regardless). If data
   genuinely stops updating, say so on the site within the same day, with a dated banner — silence
   while charging Starter/Pro subscriptions for stale data is its own consumer-protection exposure on
   top of the outage itself.
3. **Freeze, don't fabricate:** existing sold/asking data stays visible and dated ("last updated
   X"), never silently re-labelled as fresh. `verdict`/`buy_below` computations should either be
   suppressed or carry a visible staleness flag once the underlying data is old enough that the
   confidence bands in `/methodology` would no longer justify them — this is a `data-scientist` call
   on the actual threshold, not a legal one, but the *principle* (never present stale data as live) is
   this role's to enforce.
4. **Business options to evaluate, in order of effort:** (a) legitimate API/partnership inquiry to
   Vinted, however unlikely to succeed, costs nothing but an email and closes the "did we even ask"
   question if this ever becomes a dispute; (b) diversify the data source — `Wallapop`/`Facebook`
   scrapers already exist in the codebase but are disabled (`demand-intel/CLAUDE.md` "Disabled
   Platforms") for data-quality reasons unrelated to blocking, so re-evaluate them as a hedge, not a
   default; (c) if no viable data source remains, the product's core value proposition (buy-below
   pricing on live Vinted data) is gone, and that's a founder-level pivot/wind-down decision, not
   something this role can pre-approve.
5. **What this plan deliberately does not contain:** any technique to defeat, hide from, or work
   around Vinted's blocking (rotating proxies to look like different users, spoofing signals beyond a
   normal browser UA, CAPTCHA-solving, etc.). If the platform has decided to block the product, the
   correct response is one of the business options above, not a more sophisticated way to keep
   scraping anyway.

---

## §5. Chrome Web Store + Stripe policy

### Chrome extension — checked, essentially clean

`extension/manifest.json:22-27`: permissions are exactly `"storage"` +
`host_permissions: ["https://resaleiq.dev/*"]`. `extension/STORE-LISTING.md:76-102` and
`src/app/privacy/page.tsx:22` (the "Chrome extension" paragraph) both describe the same thing: reads
the public title/brand/price already on a Vinted page, sends it to `resaleiq.dev` only, stores an
optional session token locally (not synced), never touches the Vinted account/cookies/messages. All
three surfaces (code, store-listing draft, live privacy policy) agree with each other. **No gap
found** — this is the one area of the five that needed no fix beyond item #8 in the register (the
stale "every 30 minutes" line, which is a data-freshness claim, not a permissions/privacy mismatch).

### Stripe — checked against `docs/audit/MONEY.md`

- REST API and Order Planner, sold as Pro €49 features, **are real and delivered**: server-side
  gated (`require_order_planner_access`, `require_power_plan` per `MONEY.md` lines 56/58), API keys
  actually issued and usable. The internal `CLAUDE.md` "Hard no" list contradicts this, but that's a
  governance-document staleness problem for `tech-lead`/the CEO to resolve (already tracked as
  `DECISIONS.md` A5) — it is **not** a "sold but not delivered" consumer-protection issue, because
  customers do receive what they're sold.
- Business €99 has zero Stripe price ID and zero customers (`MONEY.md` §7, `DECISIONS.md` AM-3) —
  already correctly identified as safe to remove, blocked only on the standing founder-gate for
  cutting anything a paying user relies on (which doesn't apply here, since nobody is on it).
- The one live gap this pass found that `MONEY.md` didn't frame as a compliance issue: **§ risk #2
  above (no subscription cancellation on account deletion)** — that's the actual Stripe-adjacent
  legal risk, not the feature-delivery question.

---

## §6. ROSTER CONSULT, 2026-09-01 — the `resale_routes.py` evidence-floor gap

Requested by the coordinator under the cited AM-7 process, alongside `tech-lead` and
`data-scientist`'s independent finding. I did not take the finding on faith — I traced the code
myself before answering. I could not independently verify the specific production numbers quoted to
me (Levi's Trucker €12.10/n=5, Jordan 1 Low €78.47/n=3, the 41/100-models/20.3%-median/+160%-max A13
result) — this role has no live DB access (`Read`/`Grep`/`Glob`/`Write` only, no `sqlite3`), so those
figures are reported here as **relayed, not independently confirmed**. The underlying *code-level*
claim — that `resale_routes.py` has no evidence-floor check while `/api/verdict` does — I traced
myself and confirm below with exact line numbers.

### 6.0 What I verified directly

`engine/listing_identity.py:39-74`:
```
MIN_COMPARABLES = 3            # admission floor for a model_signals board row
MIN_VERDICT_COMPARABLES = 8    # floor to print a buy-below on /api/verdict

def verdict_allows_buy_below(row: dict) -> bool:
    """... FAILS CLOSED. A row that cannot prove it has >= MIN_VERDICT_COMPARABLES
    clean comps does not get a buy-below price."""
    n = row.get("comparable_n") or row.get("n_fenced")
    if n is None:
        return False
    return int(n) >= MIN_VERDICT_COMPARABLES   # (paraphrased; try/except in source)
```
So a row can sit in `model_signals` — with a populated, non-null `max_buy_price` — on as few as
**3** comparable sales. `api/routes.py` (`/api/verdict`, lines 889-911) calls
`verdict_allows_buy_below()` and returns `INSUFFICIENT_DATA` below 8. `api/resale_routes.py` never
calls `verdict_allows_buy_below()` or `verdict_comparable_n()` anywhere — confirmed by grep, zero
hits in that file. Its own gate, `publishable_opportunity()` (`engine/listing_identity.py:259-265`),
checks only "not a junk model" and "`avg_price_eur`/`max_buy_price` are non-null" — **no count
check at all**. That function feeds Deal Finder, the watchlist redaction logic
(`resale_routes.py:1119-1122`), the deals redaction logic (`_DEALS_LOCKED_FIELDS`, line 685), and
brand/model pages. `build_sourcing_links()` (`resale_routes.py:202-227`) then embeds whatever
`max_buy_price` it's handed as a live `&price_to=` URL param on a one-click Vinted search — so a
row admitted at n=3 doesn't just get *displayed*, it gets baked into a link the user clicks to go
spend money. The comment at `verdict_allows_buy_below()` line 50-56 confirms the team already
closed exactly this gap on the `/verdict` surface, dated **2026-09-01** — the same day this
surface's gap was found. That timing is itself informative: this isn't a old, forgotten bug, it's a
fix applied to one surface while an identical live gap sat on another, on the same day.

### 6.1 EU consumer-law exposure — what I actually know vs. what needs counsel

**What I can say without counsel, as a factual/structural matter:** the UCPD (2005/29/EC) reaches
misleading actions (Art. 6) and misleading omissions (Art. 7) that distort the "average consumer"'s
*transactional decision*. Publishing a specific, unqualified number labelled as the price a person
"can pay... and still hit your margin" — the product's own tagline
(`extension/manifest.json:5`) — off 3 comparable sales, with no visible qualifier, is a textbook
fact pattern for a misleading-action claim about "the main characteristics of the... service" and
"the results to be expected from its use" (Art. 6(1)(b)). The company's own `/methodology` page
independently establishes what it considers a defensible sample size (the HIGH/MEDIUM/LOW bands
`CLAIMS.md §10` already traced), which raises rather than lowers exposure: the claim isn't just
unsubstantiated in the abstract, it's contradicted by the company's *own published standard*.

**Does paying change it?** Yes, in two concrete ways I can state plainly:
1. UCPD's trigger is *distortion of a transactional decision*. A paying subscriber acting on a
   number to spend real money buying secondhand inventory is about as direct a transactional
   decision as this framework contemplates — this is not a marginal or borderline case.
2. Payment adds a second, independent theory beyond UCPD: **breach of the actual bargain.** The
   customer paid specifically for the thing `/methodology` describes (a confidence-banded price).
   If the code doesn't apply that standard uniformly, the gap between the contractual promise and
   delivered service is a distinct claim from "was this commercial practice unfair," and doesn't
   need the UCPD framework to exist at all.

**Where `/methodology` disclosure helps, and where it doesn't:** it helps establish good faith
*if the product actually follows it everywhere it applies*. It does **not** cure a specific surface
that silently doesn't apply the standard it publishes — a generic page reachable from the footer is
unlikely to satisfy Art. 7's requirement that material information be given in a way that's "clear,
intelligible, unambiguous and timely" **at the point the transactional decision is made**. A
reseller looking at a live Deal Finder card or clicking a sourcing link is not, at that moment,
reading a separate methodology page — the disclosure has to travel with the number or it isn't
doing the job Art. 7 requires of it.

**NEEDS COUNSEL:** whether individual resellers using this as a side-income tool are "consumers"
under the UCPD (likely yes for the SaaS purchase itself — a private individual paying €19-49/month
for a tool is a fairly clean consumer transaction) or whether their downstream Vinted purchases
change that characterisation; and what a Spanish court specifically would do with the
methodology-contradicts-code fact pattern above. I'm confident in the *shape* of the exposure; I am
not qualified to price it.

### 6.2 Does gating vs. disclosure change the exposure — my actual view, not a punt

The coordinator asked me not to dodge this, and I don't think it's as symmetric as "I don't know
which way it cuts." **My view: matched disclosure can be a real mitigation; mismatched disclosure is
not one, and can function as evidence of knowledge, which is worse than silence.**

The distinction that matters is not "gate vs. disclose" as a binary — it's whether the treatment
applied to a low-n row is the *same standard the company has already decided, in writing and in
code, that it needs*:

- `/api/verdict` already has the honest answer built and shipped: below the floor, return
  `INSUFFICIENT_DATA` with an explicit `confidence_note` ("Only N comparable sold items... not
  enough to name a buy-below" — `api/routes.py:897-900`). This is not a hypothetical design to
  build; it is a working, tested pattern that a second surface can call into, not reinvent.
- Applying that *same* floor (`MIN_VERDICT_COMPARABLES = 8`) inside `resale_routes.py` — most
  simply, inside `publishable_opportunity()` or wherever `max_buy_price` is attached before
  serialization — closes the gap for every downstream surface at once, **including the sourcing
  links**, because `build_sourcing_links()` only adds `&price_to=` `if max_buy_price and
  max_buy_price > 0` (`resale_routes.py:224`): null the upstream field and the link stops
  embedding an unqualified price automatically. This is a genuinely small, single-function-call
  fix, not a rewrite — I note this because it bears directly on the coordinator's ask in §6.4, even
  though weighing effort is explicitly the coordinator's job, not mine.
- A **disclosed low-confidence price** is only a defence if the disclosure (a) sits directly next
  to the number at the same visual weight, not a tooltip or footnote, (b) appears on *every*
  surface that renders the number, including the machine-readable use in a sourcing-link URL — which
  is harder to attach a visible label to than a UI card, and (c) is the deliberate, considered
  design chosen because it's honest, not the path chosen because it's cheaper than calling an
  already-existing gate. If it's built as the cheaper option, and the company can be shown to know
  (via the `/methodology` page, and via the 2026-09-01 fix on the sibling surface, both of which are
  now on the record) that its own standard requires 8 comparables, showing a bare or thinly-labelled
  number under that anyway reads as **choosing to publish something you know is unreliable**, which
  under UCPD Art. 6(1)'s "knew or could reasonably have been expected to know" language is closer to
  an aggravating fact than a mitigating one.

Net: I'd reuse the existing, already-fail-closed pattern rather than design a new disclosed-low-
confidence state under time pressure tonight. The `-57%` board-size cost the coordinator quotes is
the real, accurate cost of enforcing the standard already on the record — not a new risk introduced
by fixing this, and the founder should see that number stated plainly before deciding, since it's a
product/business tradeoff sitting directly downstream of a legal one.

### 6.3 Duty to correct already-published prices

**What I can state as fact, not opinion:** `verdict_outcomes`
(`schema.py:836-854`) already snapshots `said_buy_below`/`said_sell_avg` per user at the moment
advice was given, specifically so it can be graded against what was actually said rather than
today's number (the table's own header comment says this). `purchase_logs` separately records
`bought_at` self-reported by the user via the extension's "I bought at €X" button. **Together these
two tables are exactly the query needed to identify which specific users acted on a given
now-corrected number, while it was live** — this is a `SELECT`, not a guess, and it should be run
before deciding whether outreach is owed, rather than assuming either "nobody was affected" or
"everybody was."

**What needs counsel, genuinely:** whether there is an affirmative duty to proactively contact and
remediate (refund/credit/notice) users who can be shown to have acted on a materially wrong number
while it was live, versus a duty that's satisfied by fixing the number going forward. I'd flag two
facts that make the "just fix it forward" position weaker, without asserting a legal conclusion: (1)
the company continues to bill the same subscribers monthly, so staying silent about a known-bad
number while continuing to collect payment for the surface that showed it is a worse fact pattern
than a free product would present; (2) the data to identify affected users already exists and is
cheap to query — declining to look is a choice, and "we didn't check" tends to read worse after the
fact than "we checked and X people were affected, here's what we did."

### 6.4 Ranking against the GDPR finding — and where I disagree with treating this as one ranked list

The coordinator asked me to rank this against my own §1 finding and to say which must close before
ten strangers pay tonight. **I want to flag directly that these are two different questions with two
different answers, and my original risk-register ranking (§ risk table, item 1) answers the first
one, not the second:**

- **"Ranked by expected harm over the life of the company"** — the register's static ordering — is a
  reasonable placement for the GDPR export/erasure gap at or near the top, because it's a *published,
  false compliance statement* that will eventually be tested by a real DSAR, and false statements
  about legal compliance carry their own distinct regulatory exposure (misrepresenting compliance is
  its own problem, separate from the underlying gap).
- **"What must close before taking money from ten strangers tonight"** is a narrower, sharper
  question, and the answer is different: **the `resale_routes.py` evidence-floor gap (§6) is the one
  that has to close first.** My reasoning:
  1. It is live and actionable on **minute one** of a new paid subscription — a new Pro customer's
     first click into Deal Finder or the watchlist can show them an unqualified, thin-evidence price
     the moment they've paid. The GDPR gap only crystallizes if and when that same customer later
     files a DSAR or deletes their account — a real risk, but not a day-one one for people signing
     up tonight specifically.
  2. It is a defect in **the thing being sold**, not a defect in a secondary right about the sold
     thing. The product's entire pitch is "the highest price you can pay... and still hit your
     margin" — that is the exact sentence this gap breaks, for the exact customers signing up
     tonight. The GDPR gap is about what happens to their account data later, which matters, but
     isn't the transaction's subject matter.
  3. The blast radius the coordinator measured (18 of 41 shifted models, live today, on paid
     surfaces) is wide, not a rare edge case — it is closer to "this happens routinely" than "this
     happens occasionally," for a cohort about to be onboarded tonight specifically.
  4. The fix is small and already exists in the codebase in working form (§6.2) — this isn't "we
     found a hard problem," it's "a fix that shipped on one surface today needs to be applied to a
     second surface before more customers see the unpatched one."

  **So: close §6 before taking payment tonight.** The GDPR gap (§1) should be fixed this week, on its
  own priority, but I do not think it is the one that blocks tonight, and I'd be giving the
  coordinator a worse answer if I let my own register's static ranking stand in for a direct answer
  to the specific question asked. Reconcile it this way: the register ranks *total expected harm*;
  this section ranks *what's actionable tonight*; they're allowed to disagree, and here they do.

### 6.5 What "closed" means before tonight, stated narrowly

Not "gate everything to n≥8 with no exceptions decided by a legal role at midnight" — that's a
product call about how thin a board the founder is willing to launch with, and it's the founder's
or `product-manager`'s to make, not mine. What I'm asserting is narrower and is a legal-risk
statement, not a product one: **whatever ships tonight must not let a `resale_routes.py`-served
`max_buy_price` reach a paying customer, or a URL they can click, at a comparable count the company's
own `/methodology` page and its own `/api/verdict` code have already stated is insufficient to name
a price** — via the existing 8-comp floor, or via a disclosure design that genuinely meets the
per-instance, same-prominence bar in §6.2, not a footnote. Whichever of those two the founder picks
is a real decision with a real product cost either way, and that tradeoff is exactly what should
reach the founder before tonight, not get decided silently by whichever fix is fastest to type.
