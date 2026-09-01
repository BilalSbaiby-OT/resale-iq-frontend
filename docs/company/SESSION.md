# SESSION

**Updated** 2026-09-01 (CEO, evening)

## Working on

**THE REGISTER BOUNCE IS EXPLAINED, and it is the most valuable find of the day.**
`detectLocale()` tested only fr/es/de/it/pt inside its loop and fell through to `"en"` afterwards.
That reads like "default to English" and is not — it walked the visitor's **entire** `Accept-Language`
list and returned the first non-English match anywhere in it. `en-GB,es-ES` — an English speaker who
merely has Spanish configured — resolved to **Spanish**.

`/register` reads the `NEXT_LOCALE` cookie that function seeds, and it lasts a **year**. So an English
reader arriving from the English homepage met a fully Spanish signup form — *"Cree su cuenta"*,
*"Crear cuenta"* — with **no language switcher and no way back.** No error, no console warning,
nothing in any log. **26 of our 28 visitors that day were English. Three reached `/register`. None
signed up.**

**I nearly dismissed the report.** `ux-researcher` saw Spanish in a browser; my `curl` returned
`lang="en"` and looked like a contradiction. It was not — the server sends English and the client
hydrates to Spanish, so **every check that did not run a browser reported healthy.** The
contradiction *was* the evidence. Fixed in `32508b8` with two regression tests asserting **both**
directions: serving English to everyone would pass the first test and destroy the five markets we
sell to. 7/7 cases, clean tsc, clean build.

**Still open, not papered over:** anyone already carrying a wrong `NEXT_LOCALE` keeps it up to a
year, and **there is still no language switcher anywhere on the site.** This stops new visitors being
mislocalised; it cannot reach those already affected.

**Three live blog posts broke the founder's own hard rules** — two on authenticity/counterfeits, one
built on days-to-sell that publicly claimed we surface a metric we deliberately withhold. All three
had **zero visitors in 30 days**, checked before deleting. Removed. The payment-scam post was
deliberately KEPT: it contains the word "fake" but it is fraud advice, not counterfeit detection, and
cutting it would have been a keyword sweep rather than a judgement.

**W58 was my error.** I claimed an orphan container was leaking 833 MiB. `devops` refused to execute
it and disproved it: Coolify reaped it 91s after healthcheck, 21 minutes before anyone looked. I read
the container's **service age** as time-since-replacement. **An age column answers "how long has this
existed", not "how long has this been redundant."** The useful half: **W24's mechanism is now fully
explained** — both containers register the same Traefik router name because the label is keyed to the
app UUID, not the container id, so every deploy's ~60–90s overlap is the precondition. That is
exactly why the retry middleware could never help: there is no router left to retry into.

**W56 IS DEPLOYED AND PROVEN ON THE REAL HOST — not in a mock.** Backend in sync at `0967123`. The
very deploy that shipped the fix exercised it, and the container's own log says:

> `[boot] demand_index 43m old, vinted data 24m old — both within schedule tolerance, skipping
> forced boot pass`

**The boot pass skipped.** No analyzer, no 5-market fan-out. The new container sits at **65.79 MiB
and 0.15% CPU** against the pre-fix **1.04 GiB and 88.5%** — and `/api/health` returned 200 six for
six straight through the deploy. **No new OOM kill:** the most recent is still 17:18:12, the one we
diagnosed. (`dmesg`'s count fell 7→6 only because the ring buffer rotated — that is not an
improvement and must not be read as one.)

This is the host-level confirmation `backend-eng` correctly said it could not provide from its own
machine.

**W58 opened, and it may be W24's real cause.** An hour after being replaced, the OLD backend
container is still running and holding **833 MiB — 22% of the host.** Coolify never reaped it. Two
consequences: a third of our RAM is held by a container serving nothing, and **both containers
publish the same Traefik router labels**, which is exactly the `Router defined multiple times with
different configurations` condition behind W24's 103×404. We assumed that was a deploy-window race.
It may be a container that never left.

**W56's code half is CLOSED and merged** — `demand-intel@0967123`. Board is **16 closed / 2 open**,
zero unassignable. Every deploy used to run the two heaviest jobs in the app concurrently and
unconditionally: the **~90-minute** analyzer alongside a bare 5-way `gather` across every Vinted
market. Three changes — a **staleness gate** (a redeploy minutes after a real pass now does nothing
at all), **sequencing** instead of concurrency, and **market concurrency 5→2** applied to every
scrape rather than just boot, because `dmesg` showed host-wide risk.

**1329 pytest, up from 1319, zero regressions — I ran them myself before merging.** The concurrency
bound is **measured, not asserted**: mocked inside the real `scrape_all_vinted`, the old path hit
**5 in flight**, the new one caps at **2**, wall time 0.10s→0.30s exactly as a 5/2 factor predicts.

**What is NOT proven, and `backend-eng` said so rather than claiming it:** that this brings the
3813 MB host under its ceiling. The mechanism is proven in isolation; host-level confirmation needs
the live-deploy probe that produced the original 1.04 GiB figure. That is the remaining half.

**Production verified by me, not from a report.** All six locales 200 · `/api/health` 200 · and a
real search returns real numbers: `Nike Air Force 1` → buy_below **37.15** from sell_avg 55.86,
n=103, and 55.86 × 0.95 × 0.70 = 37.15 exactly. `Carhartt jacket` correctly returns **UNKNOWN**
rather than guessing below the comparables gate. The product is honest when it does not know.

**FIRST REAL ATTRIBUTION DATA — see `FUNNEL-BASELINE.md`.** Tagging shipped today and tagged visits
now arrive: **~9, every single one Instagram** (`r122`, `r123`, `r126`, `r128`). Until today every
number in our funnel model was an industry average; these are ours.

**The finding that should change what we do: TikTok returned ZERO tagged visits from 10 posts.
X returned ZERO from 10.** Instagram is the only channel returning anybody. Three explanations are
still live and they have different fixes — the posts may not exist (only **1 of 8** TikTok records
has a real `/video/` id), TikTok may suppress caption links by design, or W57's silent duplicates
killed reach. **Not calling it yet.**

**I held publishing this cycle, deliberately.** Six posts went out 20 minutes ago and Postiz shows
39 today across three accounts. Publishing again now risks a spam heuristic, and a suspended account
costs more than a week of posts. The stronger reason is the measurement: **two of three channels
return nothing we can see**, so more posts there is effort spent blind. The next batch goes
Instagram-weighted, and the next TikTok post gets checked for a real `/video/` id before anything
else is built on that channel.

**Localisation is working:** non-English visitors roughly doubled after the localised posts —
`en 26 · de 4 · es 3 · it 2 · fr 2`, from `en 26 · es 2 · de 2` this morning.

**W56's code half is with `backend-eng`** — the boot scrape still fans across 5 markets on every
boot, which is what turns a deploy into an outage. Swap and the 2 GB cap mitigate it; they do not
remove it.

## Blocked

**W57 — EVERY VIDEO WE PUBLISHED TODAY IS SILENT.** Verified with `ffprobe`, not from the publish log.
The files are all real and playable — uploads worked, nothing is a stub — but not one has an audio
stream. The founder asked hours ago whether we were "posting with no voice"; I said the voice was
fixed **without checking the videos themselves**. `gen_voice.py` works and speaks all our languages;
it was simply never muxed in.

**And one file went out 11 times** — `samba-demo-9x16.mp4`, across ES/FR/DE/IT/PT on both platforms.
Platforms fingerprint identical uploads, and the numbers match: **4 TikTok ERRORs**, and only **1 of
8** TikTok "published" posts carries a real `/video/` id — the rest resolve to the bare profile,
which proves nothing. Silent + duplicate is a plausible explanation for 9 posts producing **1**
measured social visitor.

Live counts: Instagram 10 · TikTok 8 (1 verifiable) · X 5. But **2 Instagram posts are STORIES**
(24h lifespan) and one is a feed post, not a reel — a story should not count toward the 10.

**Working:** UTMs are landing (`utm_content=r128` visible on live records).


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
