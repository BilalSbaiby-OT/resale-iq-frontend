# OPEN ITEMS — one list, honest status

**Updated 2026-09-02 16:2xZ.** Founder: *"everyissue i tell you about you never finish / everything
you find instead of fixing you skip / and u dont track it at all"*. He is right, and the fix for the
third part is this file: every item found, with what actually shipped, in one place.

**Scoreboard, today: 12 shipped · 3 in flight · 13 open · 6 founder.**

**Heartbeat 15:07Z:** health 200 `overall=warn` (1 warn: disk 12.3% free of 74GB, `age_minutes 3.9`)
· anonymous `/api/verdict` serving again, **mitigated not fixed** (see below) · CI green, Deploy
succeeded 14:48:45Z · all 5 markets crawled inside 35 min · **first attributed signup in company
history: `perplexity` → `/register`, 10:17:02Z** · first trial expiry moved forward to **09-09**.
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
| 6 | 17 queued posts carrying a figure wrong by 4× | `309` → `1,223` verified against production; 4 locales, formatting matched per language |
| 7 | Row 111 published to X | corrected figures first; `utm_content=r111`, 09:41:46Z |
| 8 | Instagram reel published | [DcxvxA9gcLG](https://www.instagram.com/reel/DcxvxA9gcLG/), 07:53:26Z, last frame verified by eye |
| 9 | False refresh-cadence claims on 4 public surfaces | PR #4 merged `c0a48c9` · real figure is 83.1% of gaps <1h (n=1,157), not "every 30 minutes" |
| 10 | **`/methodology` translated into 5 languages** | `621e25f` · 58 keys × 6 locales; 0 missing, 0 empty, **0 figure drops**; "watched departures" as a term of art, never "sold" |

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
| 6 | ~~Attribution **never wired**~~ **FIRST ROW EVER, 2026-09-02 10:17:02Z** | `signup_attribution` = `(81, 'perplexity', None, '/register', '2026-09-02 10:17:02', None)`. One row, one user, `campaign`/`content` null — a referrer-derived source, not a UTM campaign | the table records signups now. **Still open:** no UTM campaign has ever produced one, so paid/social channels remain unjudgeable |
| 7 | Anonymous rate limit is **one global counter** | **re-measured 15:07Z:** public probe still lands in `sha256("10.0.1.1")`, bucket 310→311, 4 distinct hashes all day | root cause (Traefik hairpin) unfixed; ceiling raised to 20000 as a backstop, so it no longer refuses anyone — and no longer limits anyone |
| 8 | Dashboard says **"2 paying"**; there are none | counts `plan != 'free'`; neither account has a Stripe id | false number on a live dashboard |
| 9 | `with-secrets.sh` hands agents a **test-mode** Stripe key | production runs `sk_live_` | any sanctioned Stripe audit sees an empty account |
| 10 | Agent contracts **~88% identical** | 99 of 112 lines shared across all 21; 17 differ by 13 lines | founder: *"not very much qualified to find a job"* — correct |
| 11 | Brand coverage **20 of 322 defensible** | 322 brands clear n≥8 departures/7d | `gen_seo_brands.py` written; production probe timed out, not yet run to completion |
| 12 | 5 videos ending on our own product failing are **LIVE** | last frames decoded and read | removal is a public action on founder accounts → see FOUNDER |
| 13 | **5** trials now, and the first expiry moved **forward to 2026-09-09** | user 81 registered today 10:17:02Z (`trial_ends_at 2026-09-09T10:17:33Z`); the other four still 2026-09-16 02:03:50. Users all time: **7**, paying: **0**, Stripe ids: **0** | `LIFECYCLE_EMAILS` unset in production → nothing contacts any of them. Founder gate on sends, and the deadline it has to clear is now **09-09, not 09-16** |
| 14 | **Departure-verification path has no pacing; Vinted threw 288 × 429 in one 5s burst** | every 429 the box saw in 24h landed `15:53:39`→`15:53:44`: 288 refusals of 1,120 outbound that hour, all item-detail `GET`s, 183 `vinted.es` · 105 `vinted.fr`. Ingestion did not stall (`seen=4963 new=4078 errors=0`) | the verifier fires its batch concurrently with no spacing and no backoff. **UNKNOWN** whether those 288 were re-resolved on a later pass or their departures silently dropped — the `verify_attempts` scan on 34.7M rows did not return inside the ssh timeout. Tracked as O-005 in `COMMITMENTS.md` |

---

## FOUNDER — only he can clear these

| what | cost of not deciding |
|---|---|
| **Take the 5 failure videos down** | they advertise the failure mode on his accounts, hourly |
| **Model key on the host + allowlist line** (done for Gemini/Groq; OpenRouter needs credit) | nothing that reasons runs outside a session |
| **€19 or €49** | content, lifecycle and pricing keep getting built against an unnamed number |
| **`LIFECYCLE_EMAILS=1`** | the same 4 users lapse silently a second time |
| **Host sizing** (2 vCPU / 3.8 GB, DB 21.26 GB, WAL 875 MB) | disk treadmill; hit 100% on 09-01 and blocked every deploy |
| `resaleiq.com` · ElevenLabs voice id · Resend rotation · W24 Coolify | standing, unchanged |

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
