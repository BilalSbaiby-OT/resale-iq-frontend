# SESSION

**Updated** 2026-09-01 (CEO, evening)

## Working on

**BOTH APPS IN SYNC.** Frontend deployed at `6f35b24`, backend `22613ac`. The 11-commit freeze, which
spanned two separate stalls, is over.

**The attribution loop has been dead since the day it was built, and nothing about it is broken.**
`signup_attribution`: **0 rows, ever.** `captureAttribution()` stores first-touch UTMs, `register()`
forwards them, `record_attribution()` writes them — a complete loop with no input, because **not one
published caption ever carried a UTM.** Checked the `content` table directly: rows 124–137, every
platform, every language, all bare `resaleiq.dev`. **The nine posts published today can never be
credited with a signup.** That is permanent and cannot be repaired retroactively.

Fixed where it cannot recur: `resale-iq-growth/src/publish/utm.js` tags links at publish time.
"Remember to add UTMs" is not a fix — the failure is SILENT. An untagged link works perfectly; it
just makes the post invisible forever.

**Funnel, re-measured in production after the €49-default fix (24h):** 26 visitors · 320 views ·
3 reached `/register` · **0 signed up** · last signup 2026-08-29. **Only 1 visitor came from social,
against 9 posts live.** Reach is the bottleneck, not the landing page. Best page after the homepage
was a **blog post** — `/blog/vinted-disputes-and-returns-sellers`, 11 visitors. That is the one thing
organically working and nobody was looking at it. Locale split: en 26 · es 2 · de 2.

**The frontend deploy pipeline is unblocked for the first time today.** Agent Isolation is GREEN and
`Deploy` is RUNNING rather than `skipped`. It had been frozen 11 commits across two separate stalls.

`content-social` is running now, driving each platform to **10 published posts**, weighted toward
**ES/FR/DE/IT/PT**. Most posts so far were English aimed at US/GB traffic that cannot buy anything —
the site now serves all six locales, so posts link to the matching one.

**Published so far: 9, three platforms.** X ×6, Instagram reel ×2 (incl. French), TikTok ×2 (incl.
Spanish). The Spanish X post was shortened 669→213 chars **by hand**; the publisher refuses to
auto-truncate, and cutting a sentence mid-thought publishes something nobody wrote.

**Deployed and live:** GDPR delete/export (the cascade had never run — `PRAGMA foreign_keys=ON` was
never set), registration no longer strips fields, Portfolio + P&L gated, `market_avg_price` leak
closed (A24), `/api/ext/error` (W42), six languages across landing AND signup, locale routing +
hreflang, free-tier quota showing the real number (was underselling 3×), 36 dead SEO pages killed.
**1319 pytest · 35/35 e2e.** All six locales verified 200 live; `/es` really is Spanish.

## Blocked

**W55 — CLOSED.** `ph5cl-retry` is attached and verified on the running post-deploy container. Fixed
where Coolify owns it (the app's `custom_labels`, confirmed against Coolify's own PHP source on the
box) rather than on a container the next deploy would overwrite. Backed up host-side and locally.

**W56 — DEPLOYS TAKE THE SITE DOWN, AND THE CAUSE IS THE HOST RUNNING OUT OF MEMORY.**
The kernel **OOM-killed the backend at 17:18:12Z**, the exact second the outage ended. Not a hang —
a kill, then Docker's `unless-stopped` restart. Bounded outage **4m54s on a deploy that changed
nothing**.

**Why we were misled:** `docker inspect` said `OOMKilled=false` and that flag was ACCURATE — it only
covers cgroup/container-limit kills. This was `constraint=CONSTRAINT_NONE`, a **host-global** OOM.
The flag answered a different question than the one we were asking. **A false flag is not the same
as no kill.**

**Host state, read directly:** 3813 MB RAM · 224 MB free · **ZERO swap** · **7 `python3` OOM kills**
in `dmesg`, not one · one at 16:22:51Z invoked by **`postgres`**, i.e. Coolify's own database — the
whole host is at risk and the killer picks the biggest victim · 42–50% iowait (it thrashes before it
kills) · backend at **1.04 GiB and 88.5% CPU** during the boot scrape.

**The trigger is our own code.** `main.py:1055` fires `job_analyzer()` and `job_vinted()`
concurrently on EVERY boot, fanning out across 5 markets at once — so it runs on every deploy.

**W24 — the earlier hypothesis was half right and it did not matter.** An unchanged-label redeploy
produced **no** `Router defined multiple times` error, so the 57s/103×404 block really was caused by
the `gzip` → `gzip,ph5cl-retry` label change we were shipping. But that glitch was **hiding a
five-minute outage underneath it.** Fixing the router would have fixed nothing.

`devops` is adding swap, bounding container memory so the host never has to choose a victim, and
taking the boot-scrape throttle to `backend-eng` (infra lane does not edit app logic). Also asked for
its honest read on whether 3.8 GB is simply undersized — AM-9 lifted the spend cap.

**Founder:** `LIFECYCLE_EMAILS=1` (trial→paid machine built + tested, one variable) · ElevenLabs
`voices_read` or a voice id (the account has ZERO saved voices — that was the 404) · rotate Coolify +
Resend tokens (this evening, his call) · `resaleiq.com` (someone else owns it) · rename the Stripe
products off "Demand Intel".

## Proof

`deploy_drift.py` compares each container's `SOURCE_COMMIT` to `origin/main`. **UNKNOWN counts as
drift.** Backend in sync at `22613ac`. Frontend was 3 behind; the blocking check is now green.
**Stripe is LIVE** (`acct_1TmFnC1Mvj7CL8HQ`, `charges_enabled: true`). 1 charge ever, paid+refunded:
the founder's own €19 test. **Funnel, measured:** 28 visitors · 4 social · 3 reached `/register` ·
**0 signed up** — and that measurement PREDATES the €49-default fix, so re-measure before concluding.

## Corrections I owe the record

**W54 was wrong, and it was mine.** I reported the deploy key still issued a GET. `devops` read the
actual `authorized_keys`: **both forced commands have been POST since 2026-08-29**, and the backup
taken just before that change still contains the GET, proving the fix already landed. I had inferred
it from Coolify's generic 405, which any bare GET returns from any client. **An inference from a
symptom is not a reading of the artifact.**

**The Stripe "TEST MODE" alarm was also false** — I read an agent sandbox key. Retracted.

## Next 3

1. Wire `utm.js` into the publisher once `content-social` is out of that file — do not edit it
   underneath a running agent. Until then the tagging depends on the agent remembering.
2. **Lean into the blog.** One post out-pulled every marketing surface we built. 9 posts produced
   1 social visitor; one blog post produced 11.
3. Attach `ph5cl-retry` to the backend router (W55), then close W24 across a real deploy.

## Do not

- **Do not publish a link without `utm_content`.** Nine posts are permanently unattributable because
  of this. `utm_source=social` answers nothing — every reel we make is social.
- **Do not trust a checker that passes by finding nothing.** My first UTM regex required `https://`
  while captions write a bare `resaleiq.dev/es`: it matched nothing, tagged nothing, and reported
  clean. Testing caught it; reading it would not have.

- **Do not fix a shared defect inside one writer.** The credential scrubber lived in
  `build_dashboard.py`; `org.py` writes a second dashboard file and never saw it, so the bus messages
  *describing the first freeze* caused a second one. It now lives in `scrub.py`, applied at the write
  boundary. **A fix in one caller is a coincidence, not a fix.**
- **Do not trust a green CI, a successful push, or a 200 as evidence of a deploy.** Run
  `deploy_drift.py`.
- **Do not read a proxy when the artifact is available.** Every wrong call today came from that.
- **Do not `git add -A` in this repo**, and do not let agents work in it — 5 incidents.
- **Do not `grep` an env dump** — use `grep -c '^VAR=.'`. Two credentials reached transcripts today.
- **Do not assume a compound command ran** — a blocked one runs none of its parts.
- **Do not say "sold"** — it is "watched departures". Any `sold`/`sale` scan matches `resaleiq.dev`,
  our own domain; I nearly rewrote two correct posts on that false positive.
- **Do not publish a per-model buy-below.** Aggregates are public; per-model is the paid product.
- **Do not publish Balenciaga or anything authenticity-adjacent** — no counterfeit filter exists.
- **Do not state a guaranteed return** in marketing — permanent platform bans, EU enforcement.
