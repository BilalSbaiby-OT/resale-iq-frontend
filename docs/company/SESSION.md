# SESSION

**Updated** 2026-09-01 (CEO, evening)

## Working on

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

**W55 — the backend's Traefik retry middleware is DEFINED BUT NEVER ATTACHED.** `ph5cl-retry` exists;
its router carries `.middlewares=gzip` alone. The frontend is wired correctly. Backend deploys still
drop in-flight requests. Found via `docker inspect` on the running container, not from the plan.
**W24 cannot close before it** — the clean 0/138 probe proved nothing, because no deploy happened in
the probe window.

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

1. Confirm `Deploy` finished and re-run `deploy_drift.py` until the frontend reads in sync.
2. Re-measure the funnel now `/register` no longer defaults to €49.
3. Attach `ph5cl-retry` to the backend router (W55), then close W24 across a real deploy.

## Do not

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
