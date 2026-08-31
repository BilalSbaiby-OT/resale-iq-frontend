# Runbook — the local scrape agent (the residential-IP fallback)

**Fixed 2026-08-31.** It had never run once: 131 failures out of 131 attempts since it was
installed on 2026-08-20.

## What it is

`demand-intel/config.py:194` records that Vinted blocks datacenter IP ranges at the edge — from the
production host every request returns 403, including the plain homepage. So this job scrapes from
the founder's residential connection and POSTs the rows to `/api/ingest/listings`. It is the
**fallback** path; production's own `job_vinted` (every 30 min) is the main one. The fallback exists
for the day Vinted blocks Hetzner, which is the day the product stops working.

## It was broken two independent ways

Both had to be fixed. Either alone would have kept it dead — which is why "just grant Full Disk
Access" would not have worked.

**1. macOS TCC.** The script lived in `~/Desktop`, which macOS protects. The `bash` that launchd
spawns has no Desktop grant, so it was refused before the shebang was read:

```
/bin/bash: /Users/bilalsbaiby/Desktop/demand-intel/scripts/run_local_agent.sh: Operation not permitted
```

**Fix — no permission grant needed.** The repo is cloned to `~/resaleiq-agent` (37 MB; the 56 GB
database is gitignored and the agent uses a `tempfile` scratch DB, so it needs nothing from
Desktop at runtime). The LaunchAgent points there instead. Granting `/bin/bash` Full Disk Access
would also have worked, and is strictly worse: it hands every launchd bash script the whole disk
to fix one job.

**2. launchd's PATH.** `run_local_agent.sh` calls `/usr/bin/env python3`. launchd does not read
shell profiles, and its minimal PATH resolves that to `/usr/bin/python3` — **Python 3.9, which
does not have the dependencies**. The deps live in `/usr/local/bin/python3` (3.14).

**Fix.** `EnvironmentVariables.PATH` on the plist:
`/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`. Set on the plist rather than in the wrapper so the
repo is untouched.

## Verified, with the negative control

| | before | after |
|---|---|---|
| `launchd.err` new lines | 131 failures | **0** |
| `~/Library/Logs/resaleiq/scrape-agent.log` | **never created in 11 days** | created, with run output |
| exit status | 126 | 0 |
| interpreter | Python 3.9 (no deps) | Python 3.14 (deps present) |

## What it revealed — Vinted rate-limits the residential IP too

First real run:

```
[vinted_es] 429 — backing off 5 min
[vinted_it] 429 — backing off 5 min
[vinted_pt] 429 — backing off 5 min
[vinted_de] 429 — backing off 5 min
[vinted_fr] 429 — backing off 5 min
```

**429, not 403.** The residential connection is not blocked, it is throttled. The backoff logic is
correct and working. But it means the fallback is degraded, not healthy, and nobody would have
known — because the path had never executed far enough to produce a single line of output.

Do **not** repeatedly `kickstart` this job to test it; that deepens the throttle. It runs every 2
hours on its own.

## Maintenance

`~/resaleiq-agent` is a clone whose `origin` is the Desktop repo, so it does **not** self-update —
and it must not, because a `git pull` from launchd would touch `~/Desktop` and hit TCC again. When
the scraper changes, refresh it from an interactive session:

```bash
git -C ~/resaleiq-agent pull
```

To point it at GitHub instead so it can self-update:
`git -C ~/resaleiq-agent remote set-url origin https://github.com/BilalSbaiby-OT/resale-iq-backend.git`

## Rollback

`~/Library/LaunchAgents/dev.resaleiq.scrape-agent.plist.bak-2026-08-31` is the original.

```bash
P=~/Library/LaunchAgents/dev.resaleiq.scrape-agent.plist
cp "$P.bak-2026-08-31" "$P" && launchctl unload "$P" && launchctl load "$P"
```

## The finding that outlives the fix

131 consecutive failures of a component documented as production's only Vinted source raised **no
alert**. A health check runs every 6 hours and watches the API, not ingestion — and `DATA.md` found
it asserts only that a scrape *ran*, never that a row *landed*, so a fully blocked scraper stays
green forever. Monitoring ingestion outcomes, not liveness, is the real P0 here.
