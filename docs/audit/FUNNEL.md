# FUNNEL — a real walk of resaleiq.dev

**Walked** 2026-08-31 ~16:30–16:45 UTC by the CEO session, in a clean browser profile with no
cookies and no localStorage, from the founder's home IP. Read-only: nothing was signed up for,
nothing was bought.

Evidence dumps: `docs/audit/proof/W36/funnel/`. Screenshots were taken but the browser tool cannot
write image files to disk, so each step is recorded as the **page text plus the raw API response**,
which is reproducible and stronger evidence than a picture.

---

## The steps the OS asked for

| # | Step | Result |
|---|---|---|
| 1 | VISITOR lands on resaleiq.dev | ✅ walked |
| 2 | 10 free checks as an anonymous visitor | ❌ **failed on the first check — see F-1** |
| 3 | SIGNUP | ⛔ not walked — creating an account is the founder's to do, not mine |
| 4 | 7-day Starter trial | ⛔ not walked — starting a trial means entering payment details |
| 5 | FIRST TRUSTED CHECK | ❌ **unreachable**, blocked by F-1 |
| 6 | PAID | ⛔ not walked |
| 7 | Extension on a live Samba / a Zara miss / an untracked brand | ❌ **blocked by F-1** — every verdict call from this IP returns `LIMIT_REACHED`, so the honest states could not be observed |

**Four of the seven steps could not be walked, and two of those are blocked by a defect rather than
by permissions.** That is the headline of this audit file.

---

## F-1 — CRITICAL — the first check a new visitor makes returns nothing

**What I did.** Opened resaleiq.dev in a browser with no cookies and no storage, typed
`Adidas Samba` — the site's *own* example model, the one in the hero mockup — into the hero search
box, and clicked the hero CTA, **Check it free**.

**What I got.** No number. No verdict. No `n`. A lock icon and an upsell.

```
GET https://resaleiq.dev/api/verdict?q=Adidas%20Samba  → 200
{"verdict":"LIMIT_REACHED",
 "message":"Free tier: 10 verdicts/day. Starter or Pro for unlimited.",
 "upgrade_url":"/stripe/plans",
 "used_today":22,"limit":10}
```

**Why it matters.** Three separate things are wrong here, and they compound:

1. **The quota is not keyed to the visitor.** The browser sent no cookie, no `localStorage`, no
   `sessionStorage` — verified in the page, all three empty — and the server still knew about
   22 prior uses. So the anonymous allowance is counted **server-side against something the client
   does not carry, almost certainly the IP address.** That means one bucket is shared by everyone
   behind a NAT: a mobile carrier's CGNAT range, an office, a café, a school, a VPN exit. A genuine
   first-time visitor can arrive at "you have used your 10 checks" having never used the product.
   Resellers browsing Vinted on a phone are exactly the population behind carrier-grade NAT.
2. **`used_today: 22` against `limit: 10`.** The counter is 12 over its own ceiling, so counting and
   enforcing disagree — either enforcement started late, or the counter is incrementing on calls
   that are not verdicts. Both are bugs, and until it is resolved no quota number on this site can
   be trusted, in either direction.
3. **The homepage promises what the API refuses.** The hero says *"10 checks/day without an
   account"*; the free plan card says *"BUY / WATCH / SKIP on every lookup"*. A visitor who takes
   the site at its word gets a paywall on move one.

**The KPI it breaks.** The North Star is `weekly_trusted_checks`, and activation is defined as
"install → first trusted check < 60 s" (OS §3). On this path, first trusted check is **unreachable**
— not slow, unreachable. Every euro of SEO and every Chrome install lands here.

**What I could not determine, and did not try.** Whether the key is strictly the IP, or IP plus a
fingerprint. Finding out means probing the paywall from another network, which is the security
audit's territory, on paper, not mine to run against production.

**Fix direction (not applied — Phase 1 is read-only).** Key the anonymous allowance to a
server-signed cookie issued on first visit, keep an IP ceiling only as a wide abuse backstop, and
make the two counters agree. Any visitor with no cookie yet gets their first check, always.

---

## F-2 — HIGH — "every 30 minutes" is contradicted by the machine that does the scraping

`/methodology` publishes a freshness table, and makes a point of it: *"We publish the cadence rather
than the word 'real-time', which is almost always untrue and unverifiable."*

| The page says | What is actually scheduled |
|---|---|
| Listing collection **every 30 minutes**, all 5 EU domains | `~/Library/LaunchAgents/dev.resaleiq.scrape-agent.plist` → `StartInterval 7200` = **every 2 hours** |

The homepage repeats "Scraped every 30 min", and the Pro tier sells "scans all five EU markets
**every 30 minutes**" as the thing you pay €30 more for.

Worse than a marketing overstatement: the scraper is a **launchd job on the founder's laptop**. It
does not run when the laptop is asleep, closed, or offline. So the real cadence is not "every 2
hours" either — it is "every 2 hours while one particular Mac happens to be awake", and the site
tells a paying customer that a figure is "at most about an hour behind the market".

The DATA audit is measuring the actual distribution of scrape intervals over 14 days. Until that
lands, the honest number is **UNKNOWN**, and UNKNOWN is what the page should say.

---

## F-3 — MEDIUM — the "26-market Price Compare" contradiction looks like a word swapped for a word

OS §1 flagged that the pricing page sells a **"26-market Price Compare"** while the hero says
**five EU markets**. `/methodology` supplies what is probably the answer:

> "1,089 watched sales in 7 days across **18 brands** on the public table (**26 brands** in the
> catalogue)"

**26 is a brand count, not a market count.** The most likely story is that a feature bullet was
written from the catalogue figure and the noun changed on the way. If so, the fix is one word on
the pricing page — but it is one word that currently sells a €49 tier on 26 markets that do not
exist. Handed to the CLAIMS audit to confirm in code before anything is rewritten.

---

## F-4 — CRITICAL — the laptop that feeds production has never once run

Found while checking F-2's scrape cadence. This is an ops incident, not a funnel step, but it is
the most serious thing in this file.

**The architecture.** `demand-intel/config.py:194` states it plainly:

> "Vinted blocks datacenter IP ranges at the edge: from the production host every request returns
> 403 — including the plain homepage, before any API logic — while the identical request from a
> residential connection returns 200."

So `scripts/local_scrape_agent.py` exists, and its docstring says what it is for:

> "Scrape Vinted from THIS machine and push the results to production. … then ships the rows to the
> server's `/api/ingest/listings` endpoint. **The server never has to reach Vinted.**"

**The founder's laptop is a production data-plane component.** It is not a dev convenience.

**The state.** `launchctl list` reports last exit **126** for `dev.resaleiq.scrape-agent`:

```
/bin/bash: /Users/bilalsbaiby/Desktop/demand-intel/scripts/run_local_agent.sh: Operation not permitted
```

- **131 failures, 131 fires, zero successes.**
- First failure **2026-08-20 20:32**, the moment it was installed. Last **2026-08-31 17:25**.
- `~/Library/Logs/resaleiq/scrape-agent.log` **was never created** — the wrapper's own first line
  never executed. The job has not run once in its life.
- `launchd.out` is 0 bytes. Only `launchd.err` has ever been written to.

**The cause is macOS TCC, not the code.** The script is `-rwxr-xr-x` and I can read it fine. It
lives under `~/Desktop`, which macOS protects; the `bash` that launchd spawns has no "Files and
Folders → Desktop" grant, so it is refused before the shebang is reached. **Nothing in the repo can
fix this — it is a click in System Settings, and only the founder can make it.**

**Blast radius — the one thing I could not close.** Production also runs its own scraper
(`main.py:725`, `job_vinted`, `SCRAPE_PEAK_INTERVAL = 30` minutes, which is where the honest "every
30 minutes" claim comes from). Whether that path works depends on `SCRAPER_PROXY`, and
`config.py:203` defaults it to empty. So Vinted ingestion has exactly two paths:

| Path | Cadence | State |
|---|---|---|
| A — server-side `job_vinted` | every 30 min | **UNKNOWN.** Works only if `SCRAPER_PROXY` is set in the production environment. Cannot be checked from here without reading production secrets, which is hook-blocked and correct. |
| B — the founder's laptop | every 2 h | **DEAD. 131/131 failures, 11 days, never ran.** |

If A is also down, production has ingested no new Vinted listings since **2026-08-20**, while the
site sells "at most about an hour behind the market" to paying customers. If A is up, B was
redundant and its death cost nothing — but nobody would have known either way, because **131
consecutive failures produced no alert.** A health-check job exists (`main.py`, every 6 hours) and
did not catch this, because it watches the API, not the ingestion.

**Three questions, in order:**
1. **Founder, now:** is `SCRAPER_PROXY` set in the Coolify production environment? One yes/no
   answer decides whether this is "a dead redundant job" or "the product has been stale for 11 days".
2. If it is not set — how fresh is the newest row in production? The DATA audit is measuring this.
3. Either way: 131 silent failures is the finding that outlives the fix. Nothing watches ingestion.

---

## What the walk found that was *right*

Worth recording, because the CUT list should not touch it:

- **`/methodology` is the best page on the site.** It gives the formulas
  (`buy_below = avg_sale × 0.95 × 0.70`, `str = sold/(sold+active)`), states that it anchors on
  **sold** listings and explains why asking prices are the easy lie, defines HIGH/MEDIUM/LOW by
  comparable count, and says outright that LOW is not SKIP but a refusal to fake precision. It even
  names the failure mode of competitors ("760% sell-through is not a sell-through rate") and invites
  correction: "if a figure disagrees with the product, the product is wrong."
- **The confidence ladder exists in production already**: HIGH ≥ 30 comparable sold items and
  quality ≥ 70 with a snapshot under 48 h; MEDIUM ≥ 10 and quality ≥ 40; LOW below that, always
  paired with "Only N comparable sold items". The OS asks for `n ≥ 8` as the trusted threshold —
  the product already uses **10**, and `METRICS.md` should adopt the product's number rather than
  invent a second one.
- The sell-through definition returns **null, not 0 or 100**, below 30 watched sales. That is the
  product's whole thesis, implemented.

The honesty posture the OS wanted to protect is already here and already load-bearing. The problem
is not that this company lies about its method — it is that the marketing surface has drifted away
from a methodology page that is telling the truth.

---

## Blocked, and who unblocks it

| Blocked | Why | Who |
|---|---|---|
| Signup → trial → paid walk | Creating accounts and entering payment details are not mine to do | **Founder**, or a founder-supplied test account |
| Extension on a live Samba, a Zara miss, an untracked brand | Every verdict call from this IP returns `LIMIT_REACHED` (F-1) | Unblocks itself when F-1 is fixed |
| Whether the quota key is IP or IP+fingerprint | Requires probing the paywall from another network | `SECURITY-AUDIT.md`, on paper |
