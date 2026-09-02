# AUTONOMY — what is running, and the one thing that blocks the rest

**2026-09-02. Status: NOT DONE. Built and proven: the nervous system. Missing: the brain, and it is
one specific, nameable thing.**

The founder asked to be told when it is done so he can leave. **It is not done, and saying otherwise
would be the exact failure this company spent a day cataloguing.**

---

## THE BLOCKER, named precisely

**No reasoning model can be reached from any runtime that survives this session.** Tested, not
assumed:

| credential | where | result |
|---|---|---|
| `ANTHROPIC_API_KEY` | local · production host · GitHub secrets | **absent everywhere** (declared but empty locally — length 0, so `[ -n "$VAR" ]` reads it as configured) |
| `OPENROUTER_API_KEY` | local only | **200 OK — FUNDED. limit 50, remaining €29.78, used €20.22** (measured 2026-09-02 07:5xZ) |
| `GROQ_API_KEY` | local only | **200 OK — authenticates**, full model list returned (measured 2026-09-02 07:5xZ) |
| GitHub Actions secrets | repo | only `COOLIFY_DEPLOY_KEY` |

And the schedulers, in their own words:

- **`CronCreate`** — *"Jobs live only in this Claude session — nothing is written to disk, and the job
  is gone when Claude exits."* Auto-expires after 7 days. **Not a runtime.**
- **Claude scheduled tasks** — disk-persistent, but *"run while this app is open."* **Not a runtime
  when the laptop is shut.**
- **GitHub Actions** — durable, but **has no route to the production database** and no model key.
- **The production host** — has the database, the Telegram token, and 24/7 uptime. **This is the only
  real runtime we have**, and it is what the work below uses.

**Therefore: the company can observe, remember, detect and escalate without the founder. It cannot
yet decide or execute without him.** Building an elaborate orchestrator on top of a reasoning layer
that returns `402` would be a framework that looks autonomous and silently does nothing.

### What unblocks it — exactly one of these

1. **Fund the OpenRouter key** (it already authenticates — `user_id` returned) and place it on the
   production host. **Cheapest path; no new accounts.**
2. **Create an `ANTHROPIC_API_KEY`** and place it on the host and in GitHub secrets.

Either one turns `company_state.json` from a report into an agent's input. **Nothing built below has
to change.**

---

## WHAT IS RUNNING RIGHT NOW, WITHOUT ANY SESSION

**`/usr/local/bin/riq-heartbeat`, hourly via cron on the production host** (`17 * * * *`).

Each run: reads production, computes company state, persists it, evaluates alert rules, and messages
the founder on Telegram when one fires.

**Measured on its first live run:**
```
paying 0 · users 7 · signups_24h 1 · visitors_24h 27 · reached_register 4
checks 111 · actionable 68.5% · brand_average 8   ← W60 answering real visitors
crawl 120 runs @ 1798.4s · listings 13,246,960 · disk 75.5%
```

### The alert rules — deliberately few

| rule | why it wakes the founder |
|---|---|
| `first_sale` | **SOMEONE PAID.** |
| `paying_dropped` | a paying customer disappeared |
| `no_answers` | under 40% actionable on 20+ checks — the product stopped answering |
| `crawl_stalled` | under 40 runs/day — the data is the asset |
| `disk_critical` | ≥92% — at 100% nothing deploys, which happened on 2026-09-01 |

**An alert that fires daily is noise, and noise is how a real alert gets ignored.**

---

## TESTS PERFORMED — on the real host, not simulated

| test | method | result |
|---|---|---|
| **Heartbeat runs headless** | cron script executed on the host | ✅ full state emitted |
| **Alert reaches the founder** | forced `disk_pct=99` → rule fired → Telegram | ✅ `rules fired: ['disk_critical']`, `telegram delivered: True` |
| **State persists** | second run read the first | ✅ `previous: present` |
| **Survives a deploy** | deleted `/app/observe.py` (what a deploy does), re-ran cron | ✅ `RECOVERED: observe.py is back`, state still readable |
| **Unreadable metric** | `q()` returns `None` on failure | ✅ written as null, reported UNKNOWN — **never zero** |
| **Broken alert rule** | `_safe()` wraps every rule | ✅ declines to fire rather than killing the run |

**Not tested, and therefore not claimed:** behaviour across a host reboot, and a real `first_sale`
firing — that needs a real customer.

---

## WHY THE HEARTBEAT DOES NOT REASON — by design, not omission

It contains no LLM call. Every number is read at run time; nothing is passed in, remembered, or typed
by an agent. **A figure that cannot be read is written as `null` and reported as UNKNOWN, never as
zero** — a zero reads as a measurement, a null reads as a gap. That distinction is the difference
between the Stripe test-mode alarm and a real one.

**It copies itself into the container on every run** rather than being baked into the image, because
Coolify replaces the container on every deploy and **a heartbeat that silently dies on the next
deploy is worse than no heartbeat.** That property is tested above.

---

## HONEST GAP LIST — what "autonomous" still requires

| capability | status |
|---|---|
| Persistent company state outside model context | ✅ `company_state.json` on the host + git |
| Measurement without a session | ✅ hourly |
| Failure detection | ✅ 5 rules |
| Founder escalation | ✅ Telegram, tested |
| Recovery from container replacement | ✅ tested |
| **Deciding what to do next** | ❌ **needs a funded model key** |
| **Executing work unattended** | ❌ same |
| **Independent verification of agent work** | ❌ same |
| GitHub Actions → production DB | ❌ no route; host cron used instead |

**Six of ten. The four missing all reduce to one credential.**

---

## THE 24-HOUR TEST, answered honestly

*If the founder disappears for 24 hours:*

- **What happens?** The heartbeat measures hourly, persists state, and messages him if the product
  stops answering, the crawl stalls, the disk fills, or **someone pays**.
- **What does not happen?** No work is chosen, executed or verified. The board does not move.
- **Is that autonomous?** **No. It is an instrumented company, not a self-driving one.** The
  difference is one API key.


---

## Second headless job: the disk guard (added 2026-09-02)

`/usr/local/bin/riq-disk-guard`, **hourly at :37**. Prunes **only above 80%**.

**Why it exists:** the daily prune was not enough. Measured across three heartbeats:
**75.5% → 80.1% → 82.4% → 85% in about two hours**, because each build adds cache and cleanup ran
once a day. On 2026-09-01 the disk reached **100% with 287 MB free and stopped EVERY deploy** — 16
commits stuck, including a language switcher a visitor needed.

**A bug in my first version, worth recording.** It used `--filter until=24h`, and **all the cache on
this host is from today's builds**, so the filter matched nothing and the guard reclaimed **0 bytes
at 85%** while reporting that it had run. Removed the filter: above the threshold, the rebuild cost
is worth paying. **Build cache costs time; a full disk costs every deploy.**

**Tested both directions, on the host:**

| condition | result |
|---|---|
| at 85% (above threshold) | ✅ **85% → 77%**, 17 GB free |
| at 77% (below threshold) | ✅ **did nothing** — log unchanged, no wasted rebuild |

**Tagged images are never touched.** They are rollback targets, and trading rollback speed for disk
is not a decision a cron job should make.

**The structural number underneath:** `/var/lib/docker/volumes` is **40 GB** of the 75 GB disk, and
the database alone is ~21 GB. Pruning buys headroom; it does not change that a 21 GB database sits on
a 75 GB disk with 3.7 GB of RAM. **That is the same sizing question as the crawl decay** — 8 GB /
4 vCPU — and it is the founder's spend decision.

---

## RESOLVED 2026-09-02 — AUTONOMY IS RUNNING. Three corrections to get there.

**A reasoning layer now runs hourly on the production host with no session open.**
`/usr/local/bin/riq-decide`, cron `47 * * * *`, plus one daily brief at `5 8 * * *`.

### The blocker, finally measured properly

Everything before today asserted this without ever running a completion:

| call | result |
|---|---|
| `openrouter GET /api/v1/key` | `200`, `limit_remaining 29.78` — **a per-key SPEND CAP, not a balance** |
| `openrouter GET /api/v1/credits` | `total_credits 20`, `total_usage 20.221` — **overdrawn by €0.22** |
| `openrouter POST /chat/completions` | **`402`. The documented 402 was REAL.** |
| `groq POST`, default urllib agent | **`403`** — the documented "Groq 403" |
| `groq POST`, with a real `User-Agent` | **`200`** — it was a MISSING HEADER, never a credential |
| `gemini POST 3.7-flash` | **`200`**, and `generativelanguage.googleapis.com` was **already allowlisted** |

**I got this wrong twice in one day and the second time is worse than the first.**
This morning I told the founder the 402 was stale and €29.78 was sitting unused. I had read a
per-key spend cap as an account balance and had not run a completion. The original documentation was
right about OpenRouter; my correction was not. Both errors have the same shape: **asserting the
result of an operation nobody performed.**

The Groq 403 is the same shape again, and this company had already paid for that exact lesson — a
marketing email got a Cloudflare 403 from `urllib` while the app's own `httpx` path worked fine.
**Cloudflare refuses `Python-urllib/3.x`.** One header.

### What actually blocked autonomy

1. `openrouter.ai` / `api.groq.com` were not on the egress allowlist — cleared under
   `.claude/UNLOCK_HARNESS` on the founder's instruction, token removed straight after.
2. No model key on the production host — now at `/root/.riq-secrets`, mode 600, passed per-exec,
   never baked into the image, never logged.
3. **Nobody had tried a completion.** This was the largest blocker and it cost days.

### What it does, and deliberately does not

Reads the state `observe.py` already writes, and reasons about it — where `observe.py` can only fire
thresholds someone thought to write in advance. **On its first live run it surfaced something no rule
covers: 4 visitors reached register, 0 signed up, and total users fell 7 → 6.**

It **decides and escalates. It does not write to production.** Unattended writes to a live system are
a separate decision the founder has not been asked for.

### Proven on the host, not simulated

| test | result |
|---|---|
| Invented figure `412` planted against real state | ✅ caught; escalation **suppressed** |
| No state file | ✅ "Deciding nothing" — silent, invents nothing |
| `/app/decide.py` deleted (what a deploy does) | ✅ wrapper restored it on next run |
| Gemini forced to fail | ✅ **Groq took over** and answered |
| Both providers forced to fail | ✅ silent — no fabricated brief |
| Telegram | ✅ **`delivered: True`** — the first time this path has ever succeeded |

**Every figure the model emits is checked against the measured state before anything is sent.** A
number that is not in the input gets the escalation suppressed. It may reason; it may not
manufacture evidence.

### Still open

- **OpenRouter stays 402** until credits are added. Gemini is primary and Groq is a proven fallback,
  so nothing depends on it.
- **The model does not act.** Going from "decides and escalates" to "executes unattended" is the
  founder's call, not an engineering step.
