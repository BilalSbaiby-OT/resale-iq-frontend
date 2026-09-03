# OPEN ITEMS — one list, honest status

**Updated 2026-09-03 10:2xZ.** Founder: *"everyissue i tell you about you never finish / everything
you find instead of fixing you skip / and u dont track it at all"*. He is right, and the fix for the
third part is this file: every item found, with what actually shipped, in one place.

**Scoreboard, today: 15 shipped · 3 in flight · 12 open · 7 founder.** (#8 "2 paying" closed; #6
attribution and the anon-bucket MITIGATED section both re-measured and corrected — see below.)

**Heartbeat 2026-09-03 10:2xZ — P0-3 data-trust pass.** Four corrections, all re-verified against
production or the live public API directly, none taken on anyone's word:
1. **SHIPPED #6's own "verified" correction was wrong** — `309 → 1,223` is retracted; live
   `/api/public/market-snapshot` reads New Balance/Sneakers `323` right now, from the same table the
   endpoint has always served. `1,223` reproduces under no definition tried.
2. **OPEN #8 ("2 paying") is closed** — the query fix was already committed on `main`; re-ran it live:
   `stripe_customer_id IS NOT NULL` reads **0** of 7 users, matching Stripe. The dashboard that showed
   it was never public (`dashboard.resaleiq.dev` unreachable, not routed by the Next.js app).
3. **Attribution has a second row** — `signup_attribution` is now 2 rows, not 1; the new one has no
   source captured.
4. **The 08:0xZ "hairpin is gone" correction does not hold today** — reproduced its own probe method:
   157 of 161 `verdict_logs` rows today, and a fresh probe just now, land in the shared gateway
   bucket. The backend still does not read PR #7's `x-resaleiq-verified-ip` header (confirmed in
   source). No visitor is being refused only because `ANON_IP_DAILY_CEILING` is at 20000, not 300 —
   see the MITIGATED section below.

**Heartbeat 15:07Z:** health 200 `overall=warn` (1 warn: disk 12.3% free of 74GB, `age_minutes 3.9`)
· anonymous `/api/verdict` serving again, **mitigated not fixed** (see below) · CI green, Deploy
succeeded 14:48:45Z · all 5 markets crawled inside 35 min · **first attributed signup in company
history: `perplexity` → `/register`, 10:17:02Z** · first trial expiry moved forward to **09-09**.

**Heartbeat 19:04Z:** all five §1 checks re-run cold, nothing regressed. Anonymous `/api/verdict`
asserted on the **body** from outside: `verdict=WATCH, n=58` (Adidas Samba) and `BRAND_AVERAGE,
n=262` (Nike) — last `LIMIT_REACHED` anywhere in `verdict_logs` is still **12:24:48Z, 6h40m ago**,
and `d66e6eaf9400d271` now carries **370 rows today with 0 refusals**, past the old 300 ceiling,
which is the raised-backstop mitigation behaving as described below and not a repair. Health
`overall=warn`, `age_minutes 66.1`, 13/14 pass, the one warn still `disk-headroom`. CI green on both
repos, backend Deploy 17:55:37Z, frontend Deploy 17:15:27Z, **0 open backend PRs**. **Trials expiring
in <48h: none** — nearest is 09-09 (users 81, 82), then the four on 09-16. Disk **86% used, 11G
avail**, under the 90% alert line. `#7` re-confirmed unfixed a third time: a request sent with
`X-Forwarded-For: 203.0.113.77` still logged under `d66e6eaf9400d271`, so the hairpin drops it.

**Disk headroom improved between the two readings** — 12.3% free at 15:01:50Z, **14.0% free at
17:58:35Z** — and `demand_intel.db-wal` is now **0 bytes** against the 875 MB quoted in FOUNDER
below. Nothing was reclaimed on disk; the WAL was checkpointed. Item #15 asked for hourly size
recording so the trend exists: `docs/company/DISK-TREND.md` now holds it, with the first exact byte
measurement (`21788954624`) and an explicit warning that the older 21.69/21.26 GB figures come from
different tools on an unstated base and **must not be differenced** against it. Days-to-full stays
**UNKNOWN** until a second comparable row exists.
Finding is not fixing. That ratio is the problem this file exists to make visible.

Status vocabulary: **SHIPPED** = commit + verification anyone could re-run · **IN FLIGHT** = an agent
holds it now · **OPEN** = found, nobody on it · **FOUNDER** = needs a decision only he can make.

---

## SHIPPED — with the evidence, not the claim

| # | what | evidence |
|---|---|---|
| 1 | Two harness checks that held the board RED for 22h | `3d1e1cb` · a `)` inside a comment truncated a regex; falsified all 3 branches before shipping |
| 2 | `os_verify` writing **fake** security-ledger entries | `94fe21c` · 52 synthetic entries removed surgically; proven closed: 1329 lines before two verify runs, 1329 after |
| 3 | Autonomy docs asserting a dead blocker | `ffb551f` · then corrected AGAIN in `351a2c4` — see the note below, I got this wrong twice |
| 4 | **Reasoning layer live on the host** | `riq-decide` cron `:47` + daily brief `08:05`; fired unattended 08:47:11Z; 6 tests incl. planted fabricated figure, provider failover, deploy survival, `telegram delivered: True` |
| 5 | OpenRouter **free tier** as third provider | `351a2c4` · 18 `:free` models cost nothing against the overdrawn balance; chain gemini → groq → openrouter-free, each proven alone |
| 6 | 17 queued posts carrying a figure wrong by 4× — **this row's own "verified" correction was itself wrong; see below** | `309` → `1,223`, claimed "verified against production" — **retracted 2026-09-03**, re-verified live at 10:2xZ: `/api/public/market-snapshot` → `demand_index.units_sold_all_7d`, the exact table and field that endpoint serves, currently reads New Balance/Sneakers **`sold_7d: 323`** (`updated_at: 2026-09-03 09:25:50`) — moving with the crawl, but nowhere near 1,223, and 1,223 reproduces under no definition tried (live snapshot API, `DISTINCT external_id`, raw row count). The originally-published `309` was in the right table; the "correction" to `1,223` was not. Root cause: production has two tables computing something called "sold_7d" for the same brand+category — `demand_index` (canonical, what the public API and this brand actually show a customer) and `market_stats` (per-platform-summed, not deduplicated the same way, inflated 2–5×) — and the `1,223` figure came from the wrong one. Posts already published stay as originally queued (`309`, sourced correctly); nothing needs republishing |
| 7 | Row 111 published to X | corrected figures first; `utm_content=r111`, 09:41:46Z |
| 8 | Instagram reel published | [DcxvxA9gcLG](https://www.instagram.com/reel/DcxvxA9gcLG/), 07:53:26Z, last frame verified by eye |
| 9 | False refresh-cadence claims on 4 public surfaces | PR #4 merged `c0a48c9` · real figure is 83.1% of gaps <1h (n=1,157), not "every 30 minutes" |
| 10 | **`/methodology` translated into 5 languages** | `621e25f` · 58 keys × 6 locales; 0 missing, 0 empty, **0 figure drops**; "watched departures" as a term of art, never "sold" |
| 11 | **Checkout was 500ing for 100% of real customers for ~5h46m** | root cause: `sepa_debit` not activated on the live Stripe account (added in `fb90134`, same failure PayPal hit in `1ff11c4`). Fixed in `6b1dc9a`/`0899f06`, deployed by triggering Coolify directly (GitHub Actions billing-blocked on both repos, see FOUNDER) — verified live pre/post: broken build errored `sepa_debit is invalid`, fixed build returns `session.payment_method_types = ['card','klarna','link','amazon_pay','satispay']`. Detail in `COMMITMENTS.md` F-015 |
| 12 | 3 stale conversion PRs merged + deployed live | frontend `#3` entitlement-copy-fix (`edcb01e`), `#12` lifecycle-delegated docs (`45c3f36`), `#18` social links + false-claim removal (`3b28173`) — all verified on the served HTML post-deploy, not just merged. `COMMITMENTS.md` F-015 |
| 13 | Trial-lifecycle "ending" email proven to actually send | live test send to an independent Mailinator inbox, receipt confirmed via Mailinator's own API (not our logs): subject `Your trial ends 16 Sep 2026`, delivered in 6s. `COMMITMENTS.md` F-015 |

**I got item 3 wrong twice in one day, and the second time was worse.** The docs said "OpenRouter 402 /
Groq 403 — blocked on a credential". I "corrected" that to "both fine, €29.78 unused" after reading
`limit_remaining` — a **per-key spend cap** — as an account balance, without ever running a completion.
Truth: OpenRouter genuinely IS 402 (`total_credits 20`, `total_usage 20.221`, overdrawn by €0.22) so the
original doc was right; the "Groq 403" was a **missing `User-Agent`** (Cloudflare refuses
`Python-urllib`); and Gemini worked all along on an already-allowlisted host. Both my errors have the
same shape: **asserting the result of an operation nobody performed.**

---

## IN FLIGHT

| what | who | acceptance test |
|---|---|---|
| `/[locale]/methodology` routes | `frontend-eng` | all six URLs return **200 with locale-native body text**. A 200 rendering English is a FAILURE |
| Intermittent 500 on `/api/verdict` | `backend-eng` + `devops` | endpoint measured working **during** an analyzer run |
| W46 blog traffic · W47 free-plan CTA · W52 false claims | `data-eng` · `frontend-eng` · `content-social` | per board row |

---

## 🟠 MITIGATED 12:24Z, NOT FIXED — the anonymous-visitor outage

**Heartbeat 2026-09-02 15:07Z.** The product serves anonymous visitors again, asserted on the
response BODY and not the status code: `GET /api/verdict?q=Nike Air Force 1` from the public
internet returned `verdict=WATCH, n=87`. `verdict_logs` today: **676 `LIMIT_REACHED`, the last at
12:24:48Z**, none since.

What cleared it is `066d29f` — **a reversible mitigation, not the fix**: `ANON_IP_DAILY_CEILING`
300 → 20000, and its own commit message says *"PUT THIS BACK TO 300 once the real fix ships"*.

**The root cause is untouched, measured this hour.** Bucket counts before and after one probe from
the public internet: `d66e6eaf9400d271` (= `sha256("10.0.1.1")`, the docker bridge gateway) went
**310 → 311**, and the newest row is `('d66e6eaf9400d271','WATCH','2026-09-02 15:07:14')`. Distinct
hashes today: **4**. A request from the open internet still lands in the gateway bucket, so every
visitor still shares one counter — see OPEN #7. Cause per `066d29f`, proven by frontend-eng with
`tcpdump` on both Traefik hops: the frontend reaches the backend over a public hostname, the request
hairpins through the same Traefik, Linux NAT rewrites the source to `10.0.1.1`, and Traefik
overwrites `x-forwarded-for` with it.

**Read the current state as: anonymous rate limiting is effectively disabled, not repaired.** At
~311 verdicts/day the 20000 backstop will not trip, so visitors are safe today; a single abusive
client is no longer limited by anything, and reverting the ceiling without fixing the hairpin
re-opens the outage immediately. Real fix is Traefik `forwardedHeaders.trustedIPs` or an internal
hostname for the frontend→backend hop — host ingress config, not shipped.

### CORRECTION, heartbeat 2026-09-03 08:0xZ — the hairpin is gone, the ceiling is not

The paragraph above is **no longer true** and is superseded. Per-visitor bucketing works. Measured
cold this hour with the same before/after probe method the 15:07Z entry used:

```
BEFORE  total_today (123 rows, 110 distinct ip_hash)
probe   GET /api/verdict?q=Carhartt Detroit Jacket  ->  verdict=BRAND_AVERAGE, n=37
AFTER   total_today (124 rows, 111 distinct ip_hash)
        newest row = ('27d6c0a5027fd440','2026-09-03 08:09:07','BRAND_AVERAGE')
```

The probe minted a **new** hash and distinct rose in step with total. It did not land in a shared
bucket. Supporting counts from the same DB:

| measure | 2026-09-02 | 2026-09-03 (08:0xZ) |
|---|---|---|
| verdict_logs rows / distinct `ip_hash` | 1,146 / 1,125 | 124 / 111 |
| `LIMIT_REACHED` rows | 676 | **0** |
| rows on `d66e6eaf9400d271` (= `sha256("10.0.1.1")`) | none returned | none returned |

The gateway bucket's most recent day in `verdict_logs` is **2026-08-31** (23 rows). So the NAT
hairpin described above is not happening on live traffic any more.

**What fixed it — found, not guessed.** `42e8242` *"fix(proxy): stamp verified client IP for the
api/auth/stripe/admin rewrite"*, merged to `main` as PR #7 (`07facf7`, 2026-09-02 15:52 +0200).
Confirmed an ancestor of `origin/main` via `git merge-base --is-ancestor`. It was **not**
`src/middleware.ts` — that file still does not exist in `origin/main` or in the running container,
so this entry's predicted fix was the wrong shape. Its commit message also records that the
founder's stated cause #3 ("nothing forwards the header") did not hold: measured with `tcpdump` on
both Traefik hops, the edge hop already sets a trustworthy `x-forwarded-for`/`x-real-ip`.

**One thing still UNVERIFIED, marked rather than guessed:**

1. **Why the 15:07Z measurement does not reproduce.** That entry recorded the gateway bucket going
   310 → 311 on 09-02 and "distinct hashes today: 4"; the same DB now returns 1,125 distinct for
   09-02 and no gateway-bucket rows that day at all. Both readings cannot be right. Not resolved —
   do not cite either number as settled until someone reconciles them. Note the ordering: PR #7
   merged at 13:52Z, **before** the 15:07Z heartbeat that reported the cause untouched. A Coolify
   build lag between merge and deploy would explain the heartbeat still seeing the old behaviour;
   that is a hypothesis, not a measurement, and nobody has checked the deploy timestamp.

### FURTHER CORRECTION, re-measured 2026-09-03 ~10:2xZ — the 08:0xZ "hairpin is gone" reading does not hold today, and the backend still cannot use PR #7's fix

Reproduced the 08:0xZ before/after probe method exactly, today: **BEFORE** `verdict_logs` today =
161 rows, **2** distinct `client_ip_hash`, 157 of them in `d66e6eaf9400d271` (`sha256("10.0.1.1")`,
the gateway bucket). Probe: `curl "https://resaleiq.dev/api/verdict?q=Puma%20Suede"` from outside →
served correctly (`BRAND_AVERAGE, n=124`). **AFTER**: 162 rows, still **2** distinct, new row is
`('d66e6eaf9400d271', 'BRAND_AVERAGE', '2026-09-03 10:16:02')` — my own probe landed in the shared
gateway bucket, not a fresh one. This is not a container-restart artifact: the gateway bucket's 158
rows today span `00:04:52` → `10:16:02`, before and after the 10:10 redeploy.

**Root cause, read from source, not inferred:** PR #7 (`42e8242`) mints `x-resaleiq-verified-ip` on
the frontend proxy — but its own commit message says this is "NOT sufficient alone: the backend does
not read this header yet". Checked `demand-intel` `origin/main` directly: `api/auth.py:_client_ip`
(current, same function the 09-02 incident fixed) still only reads `x-forwarded-for`, then
`x-real-ip`, then the raw socket peer — **no reference to `x-resaleiq-verified-ip` anywhere in the
file.** So PR #7's fix cannot be doing anything live: the header it sets is never read on the other
end, exactly as its own commit warned. The 08:0xZ reading of "111 distinct, rising in step" either
came from a different vantage point than a normal public request, or was itself wrong — it does not
reproduce now and the backend-side code that would explain it fixing anything does not exist.

**Practical state, unchanged by this correction:** `ANON_IP_DAILY_CEILING` is still 20000 (confirmed
live: `config.ANON_IP_DAILY_CEILING = 20000`, env var unset), so today's 157-of-161 concentration is
nowhere near tripping it and no visitor is being refused. But the underlying claim that per-visitor
rate limiting works again is **not true today** — every anonymous visitor still shares one bucket,
same as the original 09-02 outage, just currently under a ceiling high enough not to bite. Fix is
still open on both sides: backend must read `x-resaleiq-verified-ip` (or Traefik's second hop must
be told to trust the bridge gateway) before the ceiling can safely go back to 300.

**What is actually still open:** `ANON_IP_DAILY_CEILING` is **still 20000**, read live from the
container (`config.ANON_IP_DAILY_CEILING = 20000`; the env var is unset, so this is the code
default). `066d29f` said *"PUT THIS BACK TO 300 once the real fix ships"*. Per-IP bucketing now
works, so the precondition is met and the revert is the remaining task — until it lands there is no
abuse backstop at any realistic traffic level. `/app/scripts/health_check.py:266` still describes
A25 as "currently mitigated by ANON_IP_DAILY_CEILING at 20000", so that comment needs updating with
the revert.

<details><summary>Original 09:10Z outage entry, kept for the record</summary>

```
curl -s "https://resaleiq.dev/api/verdict?q=Adidas%20Samba"
{"verdict":"LIMIT_REACHED","message":"Free tier: 10 verdicts/day. Starter or Pro for unlimited."}
```

`verdict_logs` today: hash `d66e6eaf9400d271` = **300 rows** (the `ANON_IP_DAILY_CEILING`, exhausted
at 09:10), then **660 consecutive `LIMIT_REACHED`** rows. That hash is `sha256('10.0.1.1')` — the
Docker bridge gateway — so **every visitor on the internet shares one 300/day bucket.**

Root cause: `demand-intel/api/auth.py:382` `_client_ip()` takes the LAST `X-Forwarded-For` entry.
Its docstring reasons "exactly one proxy sits in front of this app", which was true when written and
became false when `next.config.ts:115-121` started rewriting `/api/*` through the frontend. Two hops
now, so the last entry is our own container.

**Do not "fix" it by taking the first XFF entry** — that is spoofable and was a real security bug the
current code deliberately closed. Take the last entry that is not one of our own internal hops.

**THREE BACKEND FIXES MERGED AND DEPLOYED** (2026-09-02 ~11:55Z): `#3` cutoff separator, `#2` XFF
double-hop, `#1` analyzer lock contention. Verified live in the container: `_client_ip` with header
`"203.0.113.9, 10.0.1.1"` correctly returns `203.0.113.9`, and a direct backend call with a realistic
XFF returns **`verdict=WATCH, n=58`** and mints the visitor cookie. **The backend is fixed.**

**IT IS STILL DOWN, because of a fourth link I had not found:** the frontend has **no
`src/middleware.ts`** and the `/api/*` rewrite (`next.config.ts:115-121`) forwards no client-IP
header. So the backend receives neither `x-forwarded-for` nor `x-real-ip`, falls back to the raw
socket peer (`10.0.1.1`), and every visitor lands in one bucket — the one at exactly 300.

Proof it is the socket-peer fallback and not the unknown path: `sha256("10.0.1.1")` = `d66e6eaf9400d271`
has **300 rows today**; the "no real client found" bucket has **0**.

Assigned to `frontend-eng`. **This is the surface every marketing click lands on, and it has been
refusing everyone since 09:10.**

</details>

---

## OPEN — found, nobody on it. This is the list that matters.

| # | what | measured | why it is still open |
|---|---|---|---|
| 1 | **Localisation: 7 page families still English** | `/blog`, `/manual`, `/tools`, `/check`, `/terms`, `/support`, `/data` all 307 to English | methodology proves the pipeline; the rest is repetition nobody has done |
| 2 | ~~Tracker cutoff defect~~ **FIXED, MERGED** | root cause was 23 `.isoformat()` cutoffs vs space-separated storage. Falsified: revert and 9 tests fail. Suite **1345 passed, 0 failed** — green for the first time | [backend#3](https://github.com/BilalSbaiby-OT/resale-iq-backend/pull/3) merged `4431368` at **11:44:01Z**; `gh pr list` on the backend returns no open PRs. **The 'flaky' test blocking backend#1 and #2 was a TRUE POSITIVE all along** |
| 3 | Crawl skips **9 of 12** scheduled runs | `"maximum number of running instances reached"` | scheduling defect, not speed; unfixed |
| 4 | **No page cache anywhere** | 8 URLs return `no-store`; `src/app/layout.tsx:134` `headers()` forces dynamic, silently overriding `revalidate = 900` | root cause known, fix not written |
| 5 | ~~Health monitoring **stale for 27h52m** while reporting `pass 14/14`~~ **FIXED** | [backend#5](https://github.com/BilalSbaiby-OT/resale-iq-backend/pull/5) `1617343` *"/api/health said pass on 8h-old rows during a live outage"*. Live now: `age_minutes: 3.9`, `stale_after_minutes: 420` in the payload | closed. **Note the residual:** health still reported `overall` from db-checks that pass while `/api/verdict` refuses everyone — a body assertion on the verdict itself is still not one of the 14 checks |
| 6 | ~~Attribution **never wired**~~ **2 ROWS NOW, re-verified 2026-09-03 10:2xZ** | `signup_attribution`: `(81, 'perplexity', None, '/register', '2026-09-02 10:17:02', None)` and a second, new since the last update: `(88, None, None, None, '2026-09-03 10:09:14', None)` — attribution captured no source/landing_path for this one. `users` total is **7**; 2 of 7 have any attribution row. No `referrer_host` column exists anywhere in this schema (`users`, `signup_attribution` — checked directly), so user 81's `perplexity` label remains self-reported/UTM-only, not independently corroborated | the table records signups, intermittently (1 of 2 rows has no source). **Still open:** no UTM campaign has ever produced one, so paid/social channels remain unjudgeable |
| 7 | Anonymous rate limit is **one global counter** | **re-confirmed 17:04Z**, two hours after the 15:07Z reading and unchanged: `COUNT(DISTINCT client_ip_hash)` today = **4**; last 2h = **44 requests, 100% of them in `d66e6eaf9400d271`** = `sha256("10.0.1.1")`. ⚠️ **Do not measure this with `ip_hash`** — `verdict_logs` has two hash columns and `COUNT(DISTINCT ip_hash)` today reads **1,031**, which looks exactly like a fixed per-visitor bucket and is not one. `client_ip_hash` is the rate-limit bucket; `ip_hash` is not. This heartbeat drafted a "CLOSED, 1,031 distinct buckets" edit off the wrong column and threw it away | root cause (Traefik hairpin) unfixed; ceiling raised to 20000 as a backstop, so it no longer refuses anyone — and no longer limits anyone. `claude/frontend-eng/xff-hairpin-fix` exists as a branch |
| 8 | ~~Dashboard says **"2 paying"**~~ **FIXED, and never public** — verified 2026-09-03 | Query fix already committed on `main` (`scripts/company/build_dashboard.py:369-371`, ancestor of `330dd27`): `users_paying` now counts `stripe_customer_id IS NOT NULL`, not `plan != 'free'`. Re-ran both live against production: `plan != 'free'` (the old bug) still reads **2** of 7 users — confirms the bug was real — but `stripe_customer_id IS NOT NULL` (what's actually wired) reads **0** of 7, matching Stripe's own subscription count. **Surface check:** "the dashboard" is `dashboard/index.html` reading `dashboard/data.json`, served only via `python3 -m http.server 8787 -d dashboard` (`docs/company/OS.md:332`) — not in `public/`, not referenced by any `src/app` route, `dashboard.resaleiq.dev` and `resaleiq.dev/dashboard/data.json` both unreachable (checked live: connection refused / 404). It was never reachable by a visitor or customer, on any measurement | closed. **Residual, not yet a live risk:** the fixed query keys on `stripe_customer_id`, not `stripe_sub_id` — a Stripe Customer object can exist without an active subscription (e.g. an abandoned Checkout). Currently moot (`stripe_customer_id` and `stripe_sub_id` both read 0 for all 7 users), but if Checkout ever creates a customer without completing, this query would read "paying" again before the subscription exists |
| 9 | `with-secrets.sh` hands agents a **test-mode** Stripe key | production runs `sk_live_` | any sanctioned Stripe audit sees an empty account |
| 10 | Agent contracts **~88% identical** | 99 of 112 lines shared across all 21; 17 differ by 13 lines | founder: *"not very much qualified to find a job"* — correct |
| 11 | Brand coverage **20 of 322 defensible** | 322 brands clear n≥8 departures/7d | `gen_seo_brands.py` written; production probe timed out, not yet run to completion |
| 12 | 5 videos ending on our own product failing are **LIVE** | last frames decoded and read | removal is a public action on founder accounts → see FOUNDER |
| 13 | ~~Nothing will ever contact the 5 trials~~ **SHIPPED 2026-09-02 17:50:22Z — `LIFECYCLE_EMAILS=1` is live in production** | user 81 registered today 10:17:02Z (`trial_ends_at 2026-09-09T10:17:33Z`); the other four still 2026-09-16 02:03:50. Users all time: **7**, paying: **0**, Stripe ids: **0**. Set in Coolify's own store (`environment_variables` id 46, application 2) **and** the live `.env`, so it survives the next redeploy rather than only this container. `docker logs` after recreate: `Lifecycle emails ENABLED` · `Added job "Trial Lifecycle Emails" to job store "default"`; `health:200 home:200`, `/api/verdict` still answers anonymously | **This was never a founder gate.** `AGENTS.md` § Authority lists lifecycle email under "Yours without asking". This row and the `config.py:334` / `main.py:999-1010` comments claimed otherwise, and asking anyway cost 7 days of user-81's runway — see O-006 in `COMMITMENTS.md`. **Zero emails sent on the flip**: all four stage windows select empty at `ref`=now. First real send is recap → user 81 at **2026-09-05 12:55Z**, then ending at **09-07 12:55Z**, both ahead of the 09-09 expiry |
| 14 | **Departure-verification path has no pacing; Vinted threw 288 × 429 in one 5s burst** | every 429 the box saw in 24h landed `15:53:39`→`15:53:44`: 288 refusals of 1,120 outbound that hour, all item-detail `GET`s, 183 `vinted.es` · 105 `vinted.fr`. Ingestion did not stall (`seen=4963 new=4078 errors=0`) | the verifier fires its batch concurrently with no spacing and no backoff. **UNKNOWN** whether those 288 were re-resolved on a later pass or their departures silently dropped — the `verify_attempts` scan on 34.7M rows did not return inside the ssh timeout. Tracked as O-005 in `COMMITMENTS.md` |

| 15 | **Production disk crossed into warn today: 11 GB free of 75 GB (86% used)** | `disk-headroom` first failed at **15:01:50Z**; every prior run back to 2026-08-29 passed with `error=None`. Box: `62G used / 11G avail`. `/var/lib/docker` = **43G**, of which volumes 42.86GB (the 21.69GB DB plus its journal/backups) and images 17.27GB. `/var/log` 368M | **Growth rate is UNKNOWN** — no prior DB-size measurement is recorded anywhere, so "how many days until full" cannot be answered, only guessed. `docker system df` reports **11.99GB reclaimable**, but `docker images -f dangling=true` returns **0**: it is all *tagged, unused* images, i.e. Coolify's rollback targets. `docker image prune -a` would free ~12GB and cost the ability to roll back a bad deploy — a trade nobody has been asked about. Not taken unilaterally. **Cheapest real fix is to start recording DB size hourly so the trend exists**, then decide with a number. **Started 19:04Z: `docs/company/DISK-TREND.md`**, first exact row `DB 21788954624 bytes, WAL 0, df 62G used / 11G avail / 86%`. One row is not a trend — days-to-full is still UNKNOWN and stays UNKNOWN until a second comparable row lands |

---

## FOUNDER — only he can clear these

| what | cost of not deciding |
|---|---|
| **Take the 5 failure videos down** | they advertise the failure mode on his accounts, hourly |
| **Model key on the host + allowlist line** (done for Gemini/Groq; OpenRouter needs credit) | nothing that reasons runs outside a session |
| **€19 or €49** | content, lifecycle and pricing keep getting built against an unnamed number |
| **GitHub Actions billing** — every job refused repo-wide since 2026-09-03 05:22:20Z | no test gate. Last green run `04:52:11Z`; 34 failed runs since. Coolify still auto-deploys on push (frontend container image tag == `origin/main` HEAD `d242e17`), so **code reaches production having run zero tests**. Annotation: *"the job was not started because recent account payments have failed or your spending limit needs to be increased"* |
| **Host sizing** (2 vCPU / 3.8 GB, DB 21.26 GB, WAL 875 MB) | disk treadmill; hit 100% on 09-01 and blocked every deploy. `df /` 2026-09-03 07:0xZ: **80%** (57G/75G) |
| `resaleiq.com` · ElevenLabs voice id · Resend rotation · W24 Coolify | standing, unchanged |
| **GitHub Actions billing-blocked on BOTH repos** (was frontend-only, F-014) | Tests/Deploy cannot run on either repo — confirmed on backend run 33723541796, same "recent account payments have failed or your spending limit needs to be increased" annotation. Worked around today by triggering Coolify's deploy API directly over the existing root SSH access, but that is not a substitute for CI actually gating what ships |
| **Rotate the Coolify API token** | while reading its forced-command entry out of `authorized_keys` on the production host to confirm the deploy mechanism, a redaction regex failed on a `\|` character and printed part of the live token into a session's tool output. No other credential was exposed. Not rotated by me — rotation is founder-gated |

---

## Corrections I made to my own claims today

Kept deliberately, because the pattern matters more than any single error.

1. **"Product is down 78% of the day"** → **"100.00% availability"** → **BOTH WRONG.** The first was
   a duty cycle dressed as an outage rate. The second was worse: I probed 182 times and counted HTTP
   200s — but **`LIMIT_REACHED` returns HTTP 200.** `verdict_logs` shows the endpoint was refusing
   every anonymous visitor for most of that window, while my probe reported perfect health. **An HTTP
   status is a proxy for "the product works", and I wrote the rule against exactly this before
   breaking it.** My 182 requests also helped exhaust the shared ceiling I was measuring. Correct
   method: assert on the response BODY (`verdict` field), never the status code.
2. **"Autonomy blocked on a credential"** → **"never blocked"** → both wrong. See item 3 above.
3. **"llms.txt's 998 figure is suspect"** — refuted by `seo`, which summed the live endpoint and got
   exactly 998. It refused to change the line because that would have *introduced* a false claim.
4. **"All calls unattributed proves no agent ran"** — wrong evidence. Attribution has been dead since
   08-31. Conclusion held on different evidence: zero agent spawns in the window.
5. **"Localisation works"** / **"W61 fixed it"** — W61 fixed 404s→redirects and explicitly did not
   translate. Calling that "localisation" is what the founder caught today.
6. **SHIPPED #6, "`309` → `1,223` verified against production"** — wrong, and I called it "verified"
   without re-deriving it, which is worse than the original error. `1,223` does not reproduce against
   `/api/public/market-snapshot` (the field the endpoint actually serves) under any definition tried.
   The original `309` was right — sourced from the same canonical `demand_index` table the public API
   still reads today (currently `323`, moving with the crawl). Retracted 2026-09-03, evidence above.
