# Deploy verification — 2026-09-01 (devops, read-only, ssh + docker on `resaleiq` / Hetzner box)

**Method note:** every fact below came from the running container (`docker exec`, `docker inspect`,
`docker images`, container boot logs, and a read-only `sqlite3`-URI query against the live DB file
via `python3 -c` inside the container — no `sqlite3` CLI is installed in the image). Nothing was
restarted, redeployed, rebuilt, or reconfigured. No `.env` file was opened.

---

## Headline: production is NOT sending trial email right now.

`LIFECYCLE_EMAILS` is **absent** from the running container's environment (confirmed by `env` dump —
grep for `lifecycle` on the full env, case-insensitive, returns nothing, exit 1). Since
`config.py:298` reads `os.getenv("LIFECYCLE_EMAILS", "").strip()`, an absent variable and an unset
one are the same thing here — the gate is closed. This is confirmed **behaviourally, not just by
reading the code**: the container's own boot log (2026-09-01 09:15:09, the same second the container
started) prints

```
[INFO] main: Lifecycle emails OFF (set LIFECYCLE_EMAILS=1 to enable — founder gate, see docs/product/LIFECYCLE.md)
[INFO] main: Scheduler started with 18 jobs
```

`schedule_jobs()` in `main.py` only calls `scheduler.add_job(_job_lifecycle_emails, ...)` inside
`if LIFECYCLE_EMAILS_ENABLED:` (main.py:903-910); the else branch is the log line above. **The job is
not registered on the running scheduler** — this is a fact about the live process, not an inference
from source.

**Second gate — one caveat you need to know, stated plainly because you asked for it stated
plainly:** `RESEND_API_KEY` **is present and non-empty** in the running container. That gate is
open. The only thing standing between production and real sends right now is the `LIFECYCLE_EMAILS`
flag, which is unset. If someone sets `LIFECYCLE_EMAILS=1` on this container without also checking
`RESEND_API_KEY`, sends start immediately — the second gate is not a backstop against the first, they
are independent and only one is currently closed.

**Process note, not a finding I'm hiding:** while confirming `RESEND_API_KEY` was non-empty, my first
`env | grep` used a pattern that matched the whole `KEY=value` line, so the live key value appeared
in this session's tool-call transcript before I caught it. I did not intend to and should have
grepped for the key name with `-c` / `-o ^NAME=` from the first call, which is what I used for every
check after. **I am not printing the value again anywhere, including here.** Because it appeared in
a transcript outside your own systems, my recommendation is to treat it as exposed and rotate it as
a precaution — that is a judgement call for you, not something I've acted on.

---

## 1. `LIFECYCLE_EMAILS` in production — direct answers

| Question | Answer | Evidence |
|---|---|---|
| Is `LIFECYCLE_EMAILS` set? | **No — absent, not "set to empty."** | `docker exec ph5clxk9hmghspv65pdkvak9-091340676788 env \| grep -i lifecycle` → no output, exit 1 |
| Is `RESEND_API_KEY` set and non-empty? | **Yes, present and non-empty.** | `env \| grep -c ^RESEND_API_KEY=.` → `1` (a non-empty match) |
| Is `job_lifecycle_emails` registered on the running scheduler? | **No.** | Boot log: `Lifecycle emails OFF...`, `Scheduler started with 18 jobs`; source shows the job is added only under `if LIFECYCLE_EMAILS_ENABLED` (`main.py:903-910`) |

`qa-eng`'s read of the two gates was correct as a description of the code. `verifier`'s "safely
defaults OFF" was a claim about a default, and the machine had not been asked whether anyone
overrode it — this check asked the machine, and the answer is: nobody did. **Nothing is being sent.**

Container checked: `ph5clxk9hmghspv65pdkvak9-091340676788`, the sole running `demand-intel` backend
container (see §2), started `2026-09-01 09:15:07 UTC`, running commit `7a8696625f8356ce0075ca9a08b6c3921f7fdf74`.

---

## 2. What commit is the container actually serving

### Backend (`demand-intel`, Coolify app id 2, `ph5clxk9hmghspv65pdkvak9`)

- **One container running:** `ph5clxk9hmghspv65pdkvak9-091340676788`, up since 09:15:07 UTC, `(healthy)`.
- `SOURCE_COMMIT=7a8696625f8356ce0075ca9a08b6c3921f7fdf74` — **matches your claim of `7a86966`
  exactly** (prefix). Local checkout at `/Users/bilalsbaiby/work/demand-intel` is also at
  `HEAD=7a8696625f8356ce0075ca9a08b6c3921f7fdf74`.
- **Container count: one.** No stale/older backend container is running alongside it.

### Frontend (`resale-iq` Next.js, Coolify app id 3, `p6t87shftvl2455pd3gdgee1`) — related, not what you asked, worth flagging

While I was checking, this service was mid rolling-deploy: for roughly a minute two containers of
**this different app** were up together — one on image `6e146b2a...` (started 09:14:25) and one on
`ea88bd22...` (started 09:18:06) — before Coolify tore down the old one. This is the same *shape* of
risk that bit you last night (two containers, two commits, only one true), it's just a different
service and it resolved itself normally: `docker ps` now shows exactly one `p6t87...` container, on
`ea88bd22...`. I'm not treating this as an incident — a brief overlap during a health-checked rolling
deploy is expected — but it's why "how many containers" needs to be answered by `docker ps` at the
moment you ask, not assumed, and it's worth watching if you want deploys to have any rollback
guarantee under 10 minutes: **right now nothing stops a health check passing on a broken new frontend
image before this old-container GC**.

### ECC harness deletion — took effect, confirmed on the running container

- `Dockerfile:16` is `COPY . .`; `.dockerignore` (checked on disk, `/Users/bilalsbaiby/work/demand-intel/.dockerignore`)
  still does **not** exclude `.claude/` — your description of the risk is accurate and still true as a
  structural fact.
- **`.claude/skills` is genuinely absent from the running container.** `docker exec ... ls /app/.claude`
  shows only `agents/`, `hooks/`, `rules/`, `settings.json`, `launch.json` — no `skills/`, no
  `commands/`, no `scripts/`. `git ls-files .claude` locally is 43 files (was 1,156 per the deletion
  commit `85f77fc`); `.claude` on the container is 436K (commit message claimed 11M → 408K — close
  enough to be the same change, small drift is expected from file overhead).
- **Image is measurably smaller, but modestly, not dramatically.** Backend image sizes by build time,
  matched to commit via image tag:
  - `e771ea7` (last commit **before** the harness deletion, built 08:22:57): **939MB**
  - `8d48176` (first commit **after** the harness deletion merged, built 09:06:12): **920MB**
  - `7a86966` (current, built 09:14:37): **920MB**, no further change (expected — the lifecycle-email
    commits on top don't touch `.claude`)
  - **−19MB / −2.0%.** That is real and directly attributable to the deletion (nothing else in that
    diff range plausibly moves image size by that much), but it is not the order-of-magnitude
    reduction "323,760 deleted lines" might suggest — most of that image is Python deps and the 20GB+
    SQLite volume mount doesn't count toward image size at all, so the harness was always a small
    fraction of the image even before deletion.

### `pending-failsafe` — confirmed live, and the DB itself shows the effect

Code for the failsafe (`api/routes.py`, `db/queries.py`) is present in the running container.
I queried the live SQLite file **read-only** (`file:...?mode=ro`, per AM-1) via `python3 -c
"import sqlite3"` since the container has no `sqlite3` CLI:

| Window | anon `verdict_logs` rows (`user_id IS NULL`) | of which `PENDING` |
|---|---|---|
| before 2026-08-31 | 315 | 165 (52%) |
| 2026-08-31 00:00 → 2026-09-01 09:14 (deploy of `7a86966`) | 32 | **0** |
| since `7a86966` deploy (09:14 → now) | 0 | — (too new, no traffic yet) |

The zero-PENDING window (32 rows, 0 stuck) starts *before* today's `7a86966` deploy because the
backend was already redeployed once this morning at 09:06 on commit `8d48176`, which is the commit
that actually contains the failsafe (`7a86966` is a descendant of it, so today's deploy carries it
forward, it didn't newly introduce it). I can't yet measure the fix under the current deploy
specifically — there hasn't been enough anon traffic since 09:14 to say anything — but the failsafe
has demonstrably been live and effective since 09:06 this morning. The 24% figure you cited was a
different, narrower one-week sample; my 52%-in-the-older-bucket number is a longer, coarser window
and shouldn't be read as contradicting it — different `n`, different range, same direction (real
problem, now at zero since the fix).

---

## 3. `api.resaleiq.dev` — diagnosed, not touched

**`api.resaleiq.dev` was never pointed at your infrastructure. This is not a missing certificate —
it's an absent DNS record**, and Porkbun's wildcard catch-all is what makes it look like *something*
answers.

```
$ dig api.resaleiq.dev +noall +answer
api.resaleiq.dev.      570  IN  CNAME  pixie.porkbun.com.
pixie.porkbun.com.      30  IN  A      207.207.210.107
pixie.porkbun.com.      30  IN  A      207.207.210.229

$ dig nonexistent-subdomain-xyz123.resaleiq.dev A     # control: a subdomain that has never existed
nonexistent-subdomain-xyz123.resaleiq.dev.  IN  A     pixie.porkbun.com.  →  207.207.210.107 / .229
```

`api.resaleiq.dev` and a made-up random subdomain resolve **identically** — both hit Porkbun's
`*.resaleiq.dev → pixie.porkbun.com` wildcard, which is Porkbun's default parking behaviour for any
subdomain nobody explicitly created. `resaleiq.dev` and `www.resaleiq.dev`, by contrast, have their
own explicit A records pointing at `62.238.51.83`, which is your Hetzner box — that's why they work
and `api.` doesn't. The TLS handshake failure (curl exit 35 you saw, reproduced here too) is Porkbun's
parking endpoint not having — and having no reason to have — a certificate for `api.resaleiq.dev`.

**Which hostname is real:** `resaleiq.dev` (+ `www`). `resaleiq.dev/api/*` (Traefik → the same
`p6t87...` frontend container on port 3000, which proxies to the backend) returns `200` and is
healthy — confirmed again just now.

**Does anything of ours point at the dead one?** No production code does.
`grep -rl api.resaleiq.dev` across `resale-iq` and `demand-intel` (`*.md .py .ts .tsx .js .json`,
excluding `node_modules`/`.git`) hits only company process files that are *about* this exact
question — `docs/company/SESSION.md`, `docs/company/SECURITY-LOG.md` (a founder-approved deploy
health-check curl from 09:04:19 that also got the TLS error), and `demand-intel/SCOREBOARD.md`
(`verifier`'s prior note reaching the same "not referenced in code" conclusion by a code audit, before
today's DNS-level check existed). Nobody's docs or code send a customer to `api.resaleiq.dev`.

**What would fix it, if you want it fixed (not done — diagnosis only, per instruction):** either
delete the illusion by not worrying about it (nothing points at it, it's dead-and-harmless), or if
`api.resaleiq.dev` is meant to be a real public API host eventually, someone needs to add an explicit
A/CNAME record for `api` in Porkbun pointing at `62.238.51.83`, wire a Traefik router + cert resolver
for that host (same pattern as the `p6t87...` labels I read for `resaleiq.dev`/`www`), and only then
would a `letsencrypt` cert be issuable for it. That's a DNS + deploy-config change, not a cert-renewal
problem, and it's a founder/infra call, not something to do silently.

---

## Where this leaves your four claims

1. **"LIFECYCLE_EMAILS safely defaults OFF" / your deploy an hour ago** — **holds.** Gate closed on
   the machine, not just in the source; job not registered; nobody is receiving email from this
   feature. One thing to fix regardless: `RESEND_API_KEY` being live in this env means the *only*
   thing preventing sends is one flag flip — that's a thinner margin than "two independent gates"
   suggested, worth knowing even though nothing is wrong right now.
2. **Deployed at `7a86966`** — **holds**, one backend container, exact commit match, confirmed by
   `SOURCE_COMMIT` env var and local `git rev-parse HEAD`.
3. **"Two containers served different commits last night"** — **did not recur for the backend**
   (one container throughout my check). It very nearly recurred for the *frontend* during a routine
   rolling deploy I happened to catch mid-flight — resolved itself, but the mechanism that could
   produce last night's failure is still present in how deploys roll over.
4. **ECC harness deletion** — **took effect**: `.claude/skills` genuinely gone from the running
   container. **Image size claim needs calibrating**: real (−19MB) but small relative to image size
   (939MB→920MB, 2%), not the dramatic shrink the line-count (323,760 lines) might imply — most of
   the image is Python dependencies plus base OS, not the harness.
5. **`pending-failsafe`** — **holds**, live in code and live in observed DB behaviour: 0 PENDING
   anon rows in the ~19h window before today's deploy (32 rows), vs. 52% PENDING in the older
   historical baseline (165/315). Not yet measurable under today's specific commit due to lack of
   traffic since 09:14 — say so as the honest state, not a number.
6. **`api.resaleiq.dev`** — new information: it's not a broken cert on a real host, it's Porkbun's
   wildcard parking answering for a subdomain that was never created. `resaleiq.dev` is the one and
   only real host, and it's healthy.

Nothing above contradicts a claim you made today. The one thing I'd escalate past this report is the
`RESEND_API_KEY` transcript exposure noted at the top — your call on rotation, not mine to act on.
