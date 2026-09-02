# OPEN ITEMS — one list, honest status

**Updated 2026-09-02 09:4xZ.** Founder: *"everyissue i tell you about you never finish / everything
you find instead of fixing you skip / and u dont track it at all"*. He is right, and the fix for the
third part is this file: every item found, with what actually shipped, in one place.

**Scoreboard, today: 10 shipped · 3 in flight · 13 open · 6 founder.**
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

## ✅ RESOLVED 2026-09-02 17:04Z — the anon refusal is measurably over

Measured on production, not claimed:

```
curl -s "https://resaleiq.dev/api/verdict?q=Adidas%20Samba"
{"verdict":"WATCH","n":58,"buy_below":20.28,...}
curl -s "https://resaleiq.dev/api/verdict?q=Nike%20Air%20Force%201"
{"verdict":"WATCH","n":87,"buy_below":43.8,...}
```

`verdict_logs` today: **1,031 distinct `ip_hash` values** (was 1 shared bucket). Last
`LIMIT_REACHED` row anywhere: **12:24:48Z**. Last 2 hours: 41 `WATCH` · 2 `BRAND_AVERAGE` ·
1 `UNKNOWN` · **0 `LIMIT_REACHED`**. Day total 1,047 verdicts, 676 of them `LIMIT_REACHED` — all
from the morning window, none after 12:24Z.

The per-visitor bucketing works. The section below is kept as the incident record.

---

## Incident record — the product refused every anonymous visitor (09:10Z–12:24Z)

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

**It was still down at the time of writing, because of a fourth link:** the frontend had **no
`src/middleware.ts`** and the `/api/*` rewrite (`next.config.ts:115-121`) forwards no client-IP
header. So the backend receives neither `x-forwarded-for` nor `x-real-ip`, falls back to the raw
socket peer (`10.0.1.1`), and every visitor lands in one bucket — the one at exactly 300.

Proof it is the socket-peer fallback and not the unknown path: `sha256("10.0.1.1")` = `d66e6eaf9400d271`
has **300 rows today**; the "no real client found" bucket has **0**.

Assigned to `frontend-eng`. **Closed** — the 17:04Z measurement above shows 1,031 distinct buckets
and no `LIMIT_REACHED` since 12:24:48Z. What is NOT verified here: which commit carried the
frontend-side fix. The behaviour is confirmed; the attribution is UNKNOWN.

---

## OPEN — found, nobody on it. This is the list that matters.

| # | what | measured | why it is still open |
|---|---|---|---|
| 1 | **Localisation: 7 page families still English** | `/blog`, `/manual`, `/tools`, `/check`, `/terms`, `/support`, `/data` all 307 to English | methodology proves the pipeline; the rest is repetition nobody has done |
| 2 | ~~Tracker cutoff defect~~ **FIXED, PR open** | root cause was 23 `.isoformat()` cutoffs vs space-separated storage. Falsified: revert and 9 tests fail. Suite **1345 passed, 0 failed** — green for the first time | [backend#3](https://github.com/BilalSbaiby-OT/resale-iq-backend/pull/3) awaiting merge. **The 'flaky' test blocking backend#1 and #2 was a TRUE POSITIVE all along** |
| 3 | Crawl skips **9 of 12** scheduled runs | `"maximum number of running instances reached"` | scheduling defect, not speed; unfixed |
| 4 | **No page cache anywhere** | 8 URLs return `no-store`; `src/app/layout.tsx:134` `headers()` forces dynamic, silently overriding `revalidate = 900` | root cause known, fix not written |
| 5 | Health monitoring **stale for 27h52m** while reporting `pass 14/14` | batches 09-01 03:05 → 09-02 06:57 | nothing caps verdict age |
| 6 | ~~Attribution never wired~~ | **1 row**: user 81, `source=perplexity`, `landing_path=/register`, 10:17:02Z — the first attributed signup this company has ever had | n=1. One row is a wired pipe, not a measurable channel |
| 7 | ~~Anonymous rate limit is one global counter~~ | **CLOSED 17:04Z** — 1,031 distinct `ip_hash` today, 0 `LIMIT_REACHED` since 12:24:48Z | see the resolved section above |
| 8 | Dashboard says **"2 paying"**; there are none | counts `plan != 'free'`; neither account has a Stripe id | false number on a live dashboard |
| 9 | `with-secrets.sh` hands agents a **test-mode** Stripe key | production runs `sk_live_` | any sanctioned Stripe audit sees an empty account |
| 10 | Agent contracts **~88% identical** | 99 of 112 lines shared across all 21; 17 differ by 13 lines | founder: *"not very much qualified to find a job"* — correct |
| 11 | Brand coverage **20 of 322 defensible** | 322 brands clear n≥8 departures/7d | `gen_seo_brands.py` written; production probe timed out, not yet run to completion |
| 12 | 5 videos ending on our own product failing are **LIVE** | last frames decoded and read | removal is a public action on founder accounts → see FOUNDER |
| 13 | **5** trials now, and the earliest expires **2026-09-09**, not 09-16 | user 81 `trial_ends_at=2026-09-09T10:17:33Z`; users 68/69/70/79 `2026-09-16 02:03:50`. `LIFECYCLE_EMAILS` unset in production (`env \| grep -c '^LIFECYCLE_EMAILS=.'` → `0`) | **7 days to the first expiry**, and nothing will contact them. AGENTS.md delegates lifecycle email; this OPEN-ITEMS row says founder-gated. The two disagree — needs one answer before 09-09 |

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
