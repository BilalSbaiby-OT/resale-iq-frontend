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
| `ANTHROPIC_API_KEY` | local · production host · GitHub secrets | **absent everywhere** |
| `OPENROUTER_API_KEY` | local only | **valid, authenticates, `402 Payment Required`** |
| `GROQ_API_KEY` | local only | **`403 Forbidden`** |
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
