# SESSION

**Updated** 2026-09-02 08:1xZ (CEO) — after a 15-agent audit of the window since the founder left

## The four corrections that matter most

**1. AUTONOMY WAS NEVER BLOCKED ON A CREDENTIAL.** Every doc said "OpenRouter 402 · Groq 403".
Measured 2026-09-02: **OpenRouter 200, limit 50, remaining €29.78, used €20.22. Groq 200.** The key
is bought and funded and has been sitting unused while every session was told the company was
waiting on the founder's money. Corrected in `ffb551f`. **The real blocker is two approvals:**
(a) `openrouter.ai` is absent from `POST_HOSTS_OK` (`guard.py:86-93`) — founder-gated protected
path, do NOT route around it; (b) no model key on the production host or in the container.
**Still UNKNOWN: whether the key can complete an inference.** Only `GET` was tested — the `POST` is
refused by (a), and the rail blocked it during this very session (see SECURITY-LOG 07:25:17Z).

**2. A PUBLISH CLAIM PRECEDED THE PUBLISH BY 52 MINUTES.** SESSION.md said "IS PUBLISHED" and commit
`c79f1d5` was titled "row 154 published" at 07:01Z, while Postiz had `QUEUE` / `releaseURL: null`.
It went live 07:53:26Z — https://www.instagram.com/reel/DcxvxA9gcLG/ . **Never write the claim and
let the event catch up.**

**3. "ALL CALLS UNATTRIBUTED" PROVES NOTHING.** Agent attribution has been dead since
2026-08-31T21:44Z; the ledger's `agent` field has only ever held two values all-time. The conclusion
(0 of 21 agents ran) is still true, on different evidence: **zero Agent spawns in the window** (last
one 69 min before it opened) and zero inter-agent mail.

**4. THE DISK DID NOT SELF-HEAL.** The 85%→77% reclaim was a MANUAL run at 02:50Z, not the guard.
The hourly guard reclaimed 2–3 points four times and the disk reads **82% again**. Treadmill, not fix.

## Live customer-facing harm — highest priority

**FIVE VIDEOS ENDING ON OUR OWN PRODUCT FAILING ARE PUBLISHED ON THE FOUNDER'S ACCOUNTS.**
Verified by decoding final frames and LOOKING at them: `carhartt-demo-9x16` ends on *"'Carhartt
jacket' is not a product in the catalog"*; `batch6-it-final` ends on *"No data found for 'Nike Air
Max'"* while captioned in Italian about Stone Island — wrong product AND a refusal. Content ids
139, 140, 141, 152, 153. **12 of 45 mp4s in `docs/marketing/assets` are broken.** Commit `3f1685c`
claims it blocked this; it only caught the two assets that had never been scheduled and could not
have published. **The control was applied to the safe cases and missed every live one.**
**Taking them down is a public action on the founder's accounts — HIS call, not ours.**

## Broken, verified, not yet fixed

- **Tracker cutoff defect, ~4 weeks live.** `db/queries.py:406-417` builds cutoffs with
  `.isoformat()` (`T` separator); production stores a space. Space < `T`, so every row seen on the
  cutoff's own date reads as stale. Measured: **300 of 300 queue rows last seen ~2 minutes earlier.**
  Active 21 of 24 hours. Also defeats the 2h re-check cooldown. Test suite is **1 failed / 1344
  passed** — the "1345 passed, no regressions" claim only holds inside the 3-hour dead zone.
- **Crawl schedule is arithmetically impossible.** 30-min trigger, concurrency 2, ~100 min critical
  path → **3 of 12 runs ran; 9 skipped.** Restoring speed does not fix it. And `observe.py:88`
  reports a 24h rolling average (1,712s, falling) while the window's real mean was 2,007s — **the
  dashboard says recovering while it degrades.**
- **MRR €0.00 and always was.** 1 subscription ever (canceled), 1 charge ever (€19, refunded),
  51 of 52 checkouts expired unpaid. **Dashboard "2 paying" is false** — counts `plan != 'free'`;
  neither account has a Stripe ID. **`with-secrets.sh` hands agents a TEST-MODE Stripe key** while
  production runs `sk_live_`, so a sanctioned audit sees an empty account.
- **Health monitoring dead 27h52m** while `/api/health` returned `pass 14/14` off a stale row.
- **Localisation is homepage-only.** Locale homepages + the checker work in all six; but
  `/{locale}/methodology|blog|check|manual|tools|data` all redirect to un-prefixed English, and the
  Spanish nav links carry no prefix. `/en/*` is a hard 404. Zero `hreflang`.
- **Attribution was never wired.** `signup_attribution` and `acquisition_channels` are EMPTY. Zero
  UTM visitors have ever reached `/register`. growth.db says 49 scheduled / 0 published while Postiz
  says 43 published — nothing reconciles them. The "65 Instagram visits" figure is operator browsing.
- **Anonymous rate limit is one GLOBAL counter** — `client_ip_hash` is constant (Docker bridge gw)
  because `next.config.ts:117` rewrites `/api/*` server-side. The 300/day ceiling is shared by the
  whole internet.
- **Four emailed users: delivered, 0 checks ever, 0 unsubscribes.** Opens/clicks structurally
  unmeasurable (tracking off, no pixel, no UTM). **Do NOT read `email_unsubscribes` as a signal** —
  its 4 rows are sender-minted tokens; a dashboard counting it reports 100% unsubscribe on a 0% rate.

## The rails work, and they were tested hard

During a READ-ONLY audit the agents attempted, and the guard blocked: **two `DELETE FROM` without
`WHERE`**, two direct `.env` reads, a secret print into the transcript, a `git push --force`, and a
`POST` to `openrouter.ai`. Six destructive or secret-exposing actions from agents explicitly told to
read only. **The guard is the reason none of them landed.** Note the openrouter block is also the
proof for correction 1 above.

## Founder decisions (each with the cost of not deciding)

1. **Key on the host + one allowlist line** → until then nothing that reasons runs outside a session.
2. **Do the five failure videos come down?** → they advertise the failure mode hourly.
3. **Real scheduler vs one open laptop** → the timer is session-only and never fires at its :23.
4. **€19 or €49?** → the only unprompted real intent ever shown was at €49.
5. **`LIFECYCLE_EMAILS=1`?** → four trials lapse 2026-09-16 with nothing scheduled.
6. **Marketing binaries in git** (26 files, 4.5 MB) → history grows on a disk already at 82%.

## Do not

- **Do not repeat a blocker without re-testing it.** "402/403" survived a full day and shaped
  every session that read it. Re-measure before you re-assert.
- **Do not trust `ffprobe`.** Decode the last frame and LOOK at it.
- **Do not treat `with-secrets.sh` Stripe output as production.** It is test mode.
- **Do not read a proxy when the artifact is available.** Green CI ≠ deploy. Source text ≠ behaviour.
  All-time average ≠ current rate. Job runtime ≠ what the job verified.
- **Do not ship a check without falsifying it.** A check that cannot go red is decoration.
- **Do not lower the BUY threshold** until someone can say what 65 meant.
- **Do not `git add -A`** here; stage explicit paths. **Do not `grep` an env dump** — `grep -c '^VAR=.'`.
- **Do not send marketing email without `List-Unsubscribe`** (RFC 8058, EU) — and note the ad-hoc
  sender's own output claims a footer link the delivered body does not contain.
- **Do not say "sold"** — watched departures. **Do not publish per-model buy-below**, Balenciaga/
  Gucci, days-to-sell, or guaranteed returns.
