# RELIABILITY — deploy logging, ingestion alerting, restore drill

**Written** 2026-09-01, devops (read-only session). Production was read over `ssh resaleiq` /
`docker exec` only — no write, restart, deploy, or `docker` mutation was performed against
production tonight, and none of the fixes below have been applied to code. This file specifies
them; it does not ship them.

Scope: `demand-intel` = backend, container `ph5clxk9hmghspv65pdkvak9` (currently
`ph5clxk9hmghspv65pdkvak9-210437665794`). `resale-iq` = frontend, deployed separately in Coolify;
its container was not inspected tonight (out of the scope this session was given), so anything
below stated about it is marked as such rather than verified.

---

## 1. The `deploys` table is not being written

### Current state, with evidence

`docs/company/METRICS.md:137` (resale-iq) records the table as having exactly one row,
`commit_sha f685ded`, dated 2026-08-12. Checked live tonight — **it is worse than that now**:

```
$ ssh resaleiq docker exec ph5clxk9hmghspv65pdkvak9-210437665794 python3 -c \
    "import sqlite3; c=sqlite3.connect('/app/data/demand_intel.db'); \
     print(c.execute('SELECT COUNT(*) FROM deploys').fetchone())"
(0,)
```
Checked 2026-09-01T00:18Z. The table exists (`sqlite_master` confirms it), has the right shape —
`db/schema.py:728-739`: `commit_sha, previous_sha, service, verdict, evidence, rolled_back_at, at`
— and currently holds **n = 0** rows. Whatever wrote the 2026-08-12 row is not the running system;
nothing has written to this table across two confirmed production deploys since.

**The two 2026-08-31 deploys, independently confirmed tonight, neither of which wrote a row:**

- **Backend.** `docs/company/SECURITY-LOG.md:56-59` (resale-iq) — `DEPLOY ALLOWED` entries at
  `2026-08-31T21:02:08Z` and `21:02:30Z`, `cd demand-intel && git push origin main`. The commit at
  `HEAD` at that moment was `a8ac5bd` ("merge: tighten email validation and escape the admin
  template", committed `2026-08-31T20:58:44Z`). Confirmed independently, live, tonight: the
  container's own environment carries `SOURCE_COMMIT=a8ac5bd0a1e7a21500ae277d0185ebd01a348065` —
  Coolify stamps the commit it built into every container it runs. Match confirms the backend
  deploy happened and which commit is live; **the `deploys` table has no row for it.**
- **Frontend.** `docs/company/SECURITY-LOG.md:88` — `DEPLOY ALLOWED` at `2026-08-31T21:07:10Z`,
  and `docs/company/SESSION.md` (commit `648e0d3`, 2026-08-31T23:11:34+02:00) states plainly:
  "Both repos deployed to production, both verified live" — with the frontend copy changes
  (`€99` removed, hero claim removed, `/methodology` wording) confirmed against the live site in
  the same commit. **No row for this deploy either.**

`docs/company/METRICS.md:137` already names the consequence and I am not re-deriving it:
`change_failure_rate`, `rollback < 10 min`, and `deploys/week` are uncomputable, and shipping a
`.sql` file against an empty log would silently report a confident 0% change-failure rate — a
measurement of the logging gap, not of deploys. No `.sql` is shipped here either, for the same
reason.

### The exact fix

**Backend — self-recording on boot, no CI or SSH-key changes needed.**

Coolify already injects `SOURCE_COMMIT` into every container it builds (confirmed live above —
this needs no Dockerfile change). `db/agent_store.py:474-508` already has `record_deploy()`,
`set_deploy_verdict()` and `last_deploy()`; nothing calls them. The container starts fresh on
every deploy (Coolify swaps it), so the natural point to detect "a new commit is now live" is
FastAPI's own startup, immediately after `init_db()`:

```python
# main.py — inside lifespan(), right after "Database ready" (main.py:896-899)
source_commit = os.environ.get("SOURCE_COMMIT", "").strip()
if source_commit:
    from db.agent_store import last_deploy, record_deploy
    prev = await last_deploy()
    if prev is None or prev["commit_sha"] != source_commit:
        await record_deploy(
            commit_sha=source_commit,
            previous_sha=(prev["commit_sha"] if prev else None),
            summary=os.environ.get("SOURCE_COMMIT_MESSAGE", "")[:200],
            service="backend",
        )
        logger.info("[deploy] recorded %s (previous %s)",
                     source_commit, prev["commit_sha"] if prev else "none")
```

The `commit_sha != source_commit` guard is load-bearing: the container also restarts on crashes
and manual redeploys of the *same* commit (`gh workflow run deploy.yml` with no new commit), and
those must not be logged as new deploys — only a change in `SOURCE_COMMIT` is one. This is exactly
the `INSERT INTO deploys (commit_sha, previous_sha, summary, service, verdict) VALUES (?,?,?,?,
'WATCHING')` already written in `record_deploy()` (`db/agent_store.py:481-483`); the only missing
piece is the call site above.

**Frontend — same table, different container, so it must call in over the network.**
The frontend cannot write to the backend's SQLite file directly (separate container, separate
volume). `api/agent_routes.py:50-78` already has the pattern for exactly this — an
authenticated, outbound-only push (`POST /api/ops/heartbeat`, gated by `_require_power`, built
specifically because "nothing listens inbound" per that file's own docstring). Add a sibling:

```python
# api/agent_routes.py — same auth pattern as post_heartbeat
class DeployNotice(BaseModel):
    commit_sha: str = Field(min_length=7, max_length=40)
    summary: str = Field(default="", max_length=200)
    service: str = Field(default="frontend", max_length=20)

@agent_router.post("/api/ops/deploy", status_code=201)
async def post_deploy(d: DeployNotice, request: Request):
    from api.routes import _require_power
    await _require_power(request)
    from db.agent_store import last_deploy, record_deploy
    prev = await last_deploy()
    if prev is None or prev["commit_sha"] != d.commit_sha:
        did = await record_deploy(d.commit_sha, prev["commit_sha"] if prev else None,
                                   d.summary, d.service)
        return {"ok": True, "recorded": did}
    return {"ok": True, "recorded": None}
```

Called from `resale-iq/.github/workflows/deploy.yml`, after the existing "Wait for the NEW build
to serve" step (that step already proves the new bundle is live — this call should not fire
before that proof exists):

```yaml
      - name: Record the deploy
        run: |
          curl -sf -X POST https://resaleiq.dev/api/ops/deploy \
            -H "X-Api-Key: ${{ secrets.RESALEIQ_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{\"commit_sha\":\"${GITHUB_SHA}\",\"summary\":\"$(git log -1 --format=%s)\",\"service\":\"frontend\"}"
```

This was not verified against the frontend's own container tonight (out of scope — see header);
before wiring it, confirm the frontend container also receives `SOURCE_COMMIT` from Coolify (very
likely, same PaaS mechanism) so its build can be cross-checked the same way the backend's was.

**Closing the loop (`verdict`).** `record_deploy()` defaults every row to `WATCHING`
(`db/agent_store.py:483`). `engine/rollback.py` already contains `judge()`, which turns findings +
metric comparisons into `KEEP` / `MODIFY` / `ROLLBACK` — it is not wired to a deploy row yet
either. That wiring is a second, separate piece of work and is out of scope for tonight; noting it
so the `deploys` fix above is not mistaken for the whole rollback-metrics story.

### The check that would prove it

```sql
-- sql/metrics/deploys_per_week.sql (still deliberately unshipped tonight —
-- write this only after the INSERT above has been live for at least one real
-- deploy, or it will report a real number over n=0 again)
SELECT 'deploys_per_week' AS metric,
       ROUND(COUNT(*) * 7.0 / 7, 2)              AS value,
       COUNT(*)                                  AS n,
       datetime('now','-7 days')                 AS window_start,
       datetime('now')                           AS window_end
  FROM deploys
 WHERE at >= datetime('now','-7 days');
```
Proof that the wiring itself works, without waiting a week: trigger `gh workflow run deploy.yml`
in a lower environment (or, in production, the next real deploy) and confirm
`SELECT COUNT(*) FROM deploys` goes from 0 to 1, `commit_sha` matches `SOURCE_COMMIT` inside the
freshly-swapped container, and `previous_sha` matches the row that was `last_deploy()` before it.

---

## 2. Ingestion alerting is still liveness-based (GAPS C7)

### Current state, with evidence

The **measurement** side is already fixed. `sql/metrics/pipeline_lag_min.sql` (resale-iq) anchors
freshness to `items_new > 0`, not to `run_at` or `status='ok'`, and its own header explains why:
"a scraper that starts on time, gets a 403 on every request and exits 0 satisfies liveness
perfectly." `docs/company/METRICS.md:118-120` records it reading **1.5 min over n = 1,344
productive runs**, and the proof harness pins the anchor by seeding a run from 1 hour ago that
landed nothing and one from 2 days ago that landed 7, asserting the answer is 2880 minutes, not
60 — i.e. it fails loud if the fix ever regresses to liveness.

The **alerting** was never touched. It lives in `demand-intel/scripts/health_check.py:234-239`,
inside `run_db_checks()`:

```python
await chk(
    "ingestion-freshness",
    "SELECT CAST((julianday('now') - julianday(MAX(run_at))) * 24 AS INT) "
    "FROM scraper_log WHERE platform LIKE 'vinted%'",
    assertion=lambda v: v is not None and v < 3,
)
```
`MAX(run_at)` with no filter on `items_new` — a run that starts, 403s on every request, logs
`items_new=0, status='ok'` (which the scraper does; confirmed live: `scraper_log` rows carry
`status='ok'` independent of `items_new`) resets this clock exactly as if it had landed data. This
is the literal liveness check the constitution's "known failure modes" line names: *"a health
check that only proves a job ran let 131 dead scrapes pass unnoticed."*

This function is not passive — it pages. `main.py:126-151` (`job_health_check`) runs it every 6
hours (`main.py:781-785`, `IntervalTrigger(hours=6)`) and, on any `status='fail'`, sends a
Telegram alert via `alerts/telegram.send_alert` (`main.py:144-149`). The same `run_db_checks()`
result also backs the human-facing `/api/admin/ops` panel (`api/agent_routes.py:108-113`), so one
fix covers both the page and the dashboard. Checked live tonight, the check is currently green —
`health_checks` rows for `ingestion-freshness` read `pass` at `2026-08-31 19:52:08`,
`12:51:54`, `06:51:54` (n = 3 most recent of many) — and `scraper_log` shows Vinted runs landing
1,845–3,204 new items every ~15-50 minutes through 2026-09-01 00:10:45. The alert not firing right
now is not evidence it works; the code path that would let a 403-and-exit-0 run through undetected
is still there.

### The exact fix

Anchor the same query the same way `pipeline_lag_min.sql` already does — add `items_new > 0` to
the `WHERE` clause, nothing else:

```python
await chk(
    "ingestion-freshness",
    "SELECT CAST((julianday('now') - julianday(MAX(run_at))) * 24 AS INT) "
    "FROM scraper_log WHERE platform LIKE 'vinted%' AND items_new > 0",
    assertion=lambda v: v is not None and v < 3,
)
```

**Threshold: keep 3 hours, and here is why that number and not a round guess.** Vinted scrapes
every `SCRAPE_PEAK_INTERVAL = 30` minutes (`config.py:240`), across 5 TLDs, staggered — the
`scraper_log` sample above shows a new run landing every 15–50 minutes in practice. 3 hours is 6x
that interval, which is the same margin the check's own existing comment already argues for
("Vinted runs every 30 min, so silence for 3 hours means the pipeline is down, not merely quiet",
`scripts/health_check.py:232-233`) — that reasoning does not change, only what it is measuring
does. The measured *normal* value is 1.5 minutes (`pipeline_lag_min`, n=1,344): 3 hours (180 min)
is 120x that, wide enough to absorb a slow TLD or a transient block without paging on noise, while
still catching a silent, fully-productive-looking drought inside one `job_health_check` cycle
(the check itself only runs every 6h, so 3h is the tightest useful threshold — a smaller number
would sometimes fail to fire before the next run overtakes it, since 3h < 6h but not by much;
this is the same 6-hour cadence constraint the current check already lives under, not a new one).

### The check that would prove it

Mirror `pipeline_lag_min`'s own proof pattern directly against `run_db_checks()`: seed
`scraper_log` with one `vinted_de` row from 1 hour ago, `items_new=0, status='ok'` (the dead-scrape
shape), and no other `vinted%` row inside the last 3 hours; assert `run_db_checks()` returns
`ingestion-freshness: fail`. Today that same fixture returns `pass`, because the 1-hour-old empty
run resets `MAX(run_at)` regardless of `items_new` — that is the exact negative control this fix
needs, and it is currently missing from `tests/`.

---

## 3. `security.restore_test` — backup exists, restore has never been proven, and RPO is worse than assumed

### Current state, with evidence

**The backup mechanism is real and runs.** `main.py:788-792` schedules `job_backup`
(`CronTrigger(hour=3, minute=0)` UTC). `job_backup` (`main.py:182-211`) shells out to
`scripts/backup_db.py`, which: WAL-checkpoints (`PRAGMA wal_checkpoint(TRUNCATE)`), takes an
online `sqlite3` backup, runs `PRAGMA integrity_check` on the copy and deletes it if that fails,
rotates by a **disk-share budget** (`MAX_SHARE=0.35` of the volume, not a bare file count —
`scripts/backup_db.py:30-36`, written after the 2026-08-13 incident where a 7-file count policy
still let backups fill the disk), and pushes offsite via `BACKUP_OFFSITE_CMD` if set. A non-zero
exit from `backup_db.py` is treated as a hard failure and pages Telegram
(`main.py:203-209`, `send_alert`).

**Checked live tonight** (`ssh resaleiq`, read-only, 2026-09-01T00:15-00:18Z):

- `BACKUP_OFFSITE_CMD=/app/scripts/backup_offsite.sh {path}` **is set** in production — this
  answers `SECURITY-AUDIT.md` MED-1's open question ("whether it's actually configured in
  production could not be confirmed without opening `.env`"). `BACKUP_OFFSITE_REMOTE=gdrive:
  resaleiq-backups`, `BACKUP_OFFSITE_STREAM=1`.
- `/app/data` is a 75G volume, 67% used, 25G free at check time.
- The live DB is **20,254,703,616 bytes** (~18.9 GiB).
- `/app/data/backups/` holds exactly **one** dated local copy:
  `demand_intel-20260829-0300.db` (17.3 GiB), dated 2026-08-29 03:52 — **stale by roughly 68
  hours** as of the check. `MAX_SHARE=0.35` of 75G is a 26.25 GB budget; two 17.3 GB copies
  (34.6 GB) do not fit, so retention degrades to n=1 regardless of the configured `KEEP=7`
  (`scripts/backup_db.py:28`). This is expected behavior given the DB's current size, not a bug —
  but it means **the local backup's age is not bounded by the nightly schedule**, only by whatever
  the newest successful write happens to be.
- `rclone lsl gdrive:resaleiq-backups` (read-only listing) shows two dated backup objects:
  `demand_intel-20260829-0300.db.gz` (2026-08-29 04:06) and `demand_intel.db.gz` (2026-08-31
  03:42) — **n = 2 objects spanning 2026-08-29 to 2026-08-31, no object for 2026-08-30.**

  The second object's name is the tell: `backup_db.py`'s disk-full fallback path
  (`scripts/backup_db.py:115-137`) streams the **live** DB straight offsite when there isn't room
  for a local copy, and names that upload from the live path (`demand_intel.db`), not a
  timestamped one. Every night that fallback fires, the object is named identically —
  `demand_intel.db.gz` — and `rclone copyto`/`rcat` **overwrites the previous night's copy under
  the same name** (`scripts/backup_offsite.sh` pushes to `"$REMOTE/$base"` where `$base` is a
  fixed string in this fallback case). If the fallback fired on both 2026-08-30 and 2026-08-31,
  the 30th's copy is gone with no record it ever existed and no alert, because the *upload itself*
  still succeeds (exit 0) — `backup_db.py` only pages on a failed push, not on an overwritten one.
  **This is a previously-undocumented gap**, not the one `SECURITY-AUDIT.md` MED-1 named; it is a
  plausible mechanism for the Aug 30 hole observed above, but not proven — the alternative is a
  genuine skipped/failed run that night with no surviving evidence either way, which is itself
  the same underlying problem: **there is no persisted, queryable log of individual offsite
  pushes** (only ephemeral container stdout, lost on the 2026-08-31 21:02 redeploy, and one
  unrelated manual-retry log dated 2026-08-22 — `/app/data/backups/.offsite-retry.log`).
- The **restore tool is real and untouched.** `scripts/restore_db.py` lists backups, and by
  default does a **dry-run**: copies the chosen backup to `<file>.restore-test`, runs
  `PRAGMA integrity_check`, prints row counts for `users, listings, model_signals,
  portfolio_items, watchlist_items`, then deletes the scratch copy — it never touches the live DB
  unless called with both `--into` and `--force`. `SECURITY-AUDIT.md` MED-1 (resale-iq) found no
  evidence this has ever been run; nothing found tonight changes that — no dated log entry, no
  `PROJECT_STATUS.md`-style record exists anywhere in either repo.

### RPO and RTO the current setup actually gives

**RPO (local): effectively unbounded, not the intended ~24h.** The nightly cadence exists, but
the disk-share budget silently collapses retention to a single file once the DB outgrows
`MAX_SHARE × volume` for 2 copies (measured: it already has, at 17.3 GiB/copy vs a 26.25 GB
budget). Tonight's single surviving local copy is 68 hours old, not the ~24h the "nightly" label
implies. **State this as measured, not assumed: local RPO right now is bounded only by "however
old the last file that happened to survive pruning is," which the design does not guarantee is
recent.**

**RPO (offsite): best case ~24h, unverified beyond two data points, and the naming bug above means
it can silently be much worse.** Two offsite objects were found 48 hours apart (2026-08-29,
2026-08-31) where nightly pushes would produce them ~24h apart — n = 2 is too small to call this a
reliable cadence, and the fixed-filename overwrite behavior on the disk-full fallback path means
a "successful" push some nights can erase evidence of a prior night's push without alerting. UNKNOWN
what the real worst-case gap is; **what would measure it:** a persisted `backup_log` table
(same shape as `scraper_log`: `run_at, kind ('local'|'offsite'), object_name, bytes, status`),
written by `backup_db.py` and `backup_offsite.sh` on every attempt regardless of outcome, queried
the same way `pipeline_lag_min.sql` queries `scraper_log` — this is a small, direct fix and not
part of tonight's scope, but it is the specific gap a restore drill alone will not close.

**RTO: UNKNOWN — not measured tonight, on instruction, and there is no prior timed run to cite.**
The mechanism (`restore_db.py --into <path> --force`, a `shutil.copy2` plus WAL/SHM cleanup plus
`integrity_check`) is fast in principle for a local-disk copy, but "in principle" is exactly what
`SECURITY-AUDIT.md` MED-1 flagged as unproven, and this session was explicitly told not to close
that gap by running it against production. **What would measure it:** the timed dry run in the
runbook below, executed by a human (not an agent, and not tonight), in a maintenance window,
against the current local backup file — that produces a real RTO number for the local-copy path.
The offsite path additionally needs the download+decompress step timed separately (see step 4
below); nothing in the repo does that today even as a dry run.

### RESTORE DRILL RUNBOOK

**Purpose:** answer, with a clock and a row count, "if the box died right now, what would we get
back and how long would it take" — without touching the live database. Every step below is
read-only with respect to the live DB except step 6, which is explicitly marked and gated.

**Do not run this against production tonight.** This is the script for the next person (or the
next session, explicitly authorized) to execute and time.

1. **List what actually exists, both places.**
   ```bash
   ssh resaleiq docker exec <container> python3 scripts/restore_db.py --list
   ssh resaleiq docker exec <container> rclone lsl gdrive:resaleiq-backups
   ```
   Record: file names, sizes, and ages for both. This is exactly what produced the evidence above
   — re-run it fresh at drill time, numbers will have moved.

2. **Time the local dry-run verify** (safe — scratch copy only, deletes itself):
   ```bash
   time ssh resaleiq docker exec <container> python3 scripts/restore_db.py
   ```
   Record: elapsed time, `integrity_check` result, and the printed row counts for
   `users, listings, model_signals, portfolio_items, watchlist_items`. Compare `listings` and
   `model_signals` counts against a live `SELECT COUNT(*)` at drill time — a backup whose row
   counts look plausible but stale by days is a different failure than a corrupt one, and this
   step is what would catch it.

3. **Verify a specific older backup, if more than one exists at drill time**, to confirm the
   *rotation* — not just the newest file — actually holds recoverable data:
   ```bash
   ssh resaleiq docker exec <container> python3 scripts/restore_db.py --file <older-backup>
   ```

4. **Time the offsite path**, which nothing in the repo currently exercises even as a dry run:
   ```bash
   time ssh resaleiq docker exec <container> \
     rclone copyto gdrive:resaleiq-backups/<object>.gz /app/data/backups/drill-<object>.gz
   time gunzip -k /app/data/backups/drill-<object>.gz
   time ssh resaleiq docker exec <container> \
     python3 scripts/restore_db.py --file /app/data/backups/drill-<object>
   rm /app/data/backups/drill-<object> /app/data/backups/drill-<object>.gz
   ```
   Record: download time, decompress time, verify time, and total. This is the number that is
   actually missing — restore_db.py's own dry run only covers the local-disk case.

5. **Sum the timings from steps 2 and 4 against the live DB's current size** (measured tonight:
   18.9 GiB and growing) to produce the RTO estimate this file currently cannot give.

6. **Only with explicit, dated, founder sign-off, in a maintenance window, against a
   disposable/staging target — never `/app/data/demand_intel.db` on the live container:**
   ```bash
   python3 scripts/restore_db.py --file <backup> --into <scratch-target-path> --force
   ```
   Confirms the write path itself (not just read-and-verify) actually completes and the app can
   boot against the result. This is the step that has *never* been run, per `SECURITY-AUDIT.md`
   MED-1, and it is the one this runbook is careful not to run tonight either.

7. **Record the result somewhere durable** — the exact gap `SECURITY-AUDIT.md` MED-1 named
   ("nothing in the repo — no log, no dated runbook entry — shows this drill has ever actually
   been executed"). A `docs/eng/runbook/restore-drills.md` log, one dated entry per run (date,
   who, which backup, elapsed time per step, row counts, pass/fail), is enough — it does not need
   to be a database table to stop being UNKNOWN.
