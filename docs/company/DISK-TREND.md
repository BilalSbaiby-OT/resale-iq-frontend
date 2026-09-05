# DISK-TREND — production disk and DB size, one row per measurement

OPEN-ITEMS #15 says the growth rate of the production DB is **UNKNOWN**, because no prior size
measurement was ever recorded. This file exists so that stops being true. It answers exactly one
question — *how many days until the box is full* — and it can only answer it once there are enough
rows.

**Do not compute a rate from mismatched units.** Record `stat -c %s` bytes for the DB, and the raw
`df -h /` fields. Earlier prose in OPEN-ITEMS quotes "21.69GB" and "21.26 GB" from `docker system df`
and other tooling whose base (GB vs GiB, DB alone vs volume total) is not stated. Those numbers are
**not comparable** to the byte column below and must not be differenced against it.

Append a row; never rewrite one.

## How to take a measurement

```bash
ssh resaleiq "df -h / | tail -1; \
  docker exec \$(docker ps --format '{{.Names}}' | grep ph5cl) \
    sh -c 'ls -la /app/data/demand_intel.db /app/data/demand_intel.db-wal'"
```

## Measurements

| taken (UTC) | df size | df used | df avail | df use% | DB bytes | WAL bytes | by |
|---|---|---|---|---|---|---|---|
| 2026-09-02 19:04 | 75G | 62G | 11G | 86% | 21788954624 | 0 | hourly heartbeat |
| 2026-09-02 21:29 | 75G | 56G | 17G | 78% | 21862096896 | 9925112 | data agent, live |
| 2026-09-03 15:21 | 75G | 55G | 18G | 76% | 22243946496 | 243112 | PRODUCT/OPS, live |
| 2026-09-03 15:32 | 75G | 57G | 16G | 79% | 22243946496 | 276072 | data agent, live |
| 2026-09-03 20:04 | 75G | 56G | 17G | 78% | 22415376384 | 329002632 | main, heartbeat (WAL spike) |
| 2026-09-03 21:34 | 75G | 59G | 13G | 83% | 22453497856 | 24159712 | data agent, live |
| 2026-09-04 11:29 | 75G | 39G | 33G | 54% | 22680285184 | 391432 | data agent, live |

**WAL scheduled checkpoint NEVER fires — bounding is entirely luck/deploy-driven (D-17).** Checked all container logs (`sudo grep -ira "\[wal\] checkpoint" /var/lib/docker/containers/`); the job has never printed its output. Containers are redeploying so frequently (e.g., observed one up for 15 mins, another for 1 min at 11:29Z) that the 3-hour `job_wal_checkpoint` interval trigger never gets to fire before the container is killed. The observed WAL drops are purely SQLite's default last-connection-close behavior during these redeployments. 

**Days-to-full: CANNOT be computed from DB growth, because deploy churn dominates the disk.** `df used` just swung from 59G down to 39G (-20GB) since yesterday, while the DB grew at a slow, stable ~21 MB/h (~0.5 GB/day). The 20GB drop means a massive image/volume prune occurred. Because the DB uses less than 1 GB every two days and image churn swings by 20GB arbitrarily, any days-to-full math based on the DB's ~21 MB/h would be a false precision that ignores the actual residual mover. The disk fills or empties based on Coolify's image retention policy, not the DB.

**WAL question (D-13): NOT a failing checkpoint — correlates with a container restart, not the
scheduled job, and that distinction matters.** WAL went 243,112 (row 3/4) → 329,002,632 (row 5,
+1,354x) → 24,159,712 (row 6, −93%) across two reads 90 minutes apart. `job_wal_checkpoint`
(`main.py:310-324`) runs `PRAGMA wal_checkpoint(TRUNCATE)` every 3 hours (`IntervalTrigger(hours=3)`,
`main.py:911-913`) — its own comment says it exists because *"the audit found a 600MB+ WAL"*, so
329MB sitting mid-cycle is inside the range this job was built to handle, not proof it broke.
Checked the container directly for row 6: `docker ps` shows it was **created 2026-09-03 21:20:39Z**
— 14 minutes before this reading, and after row 5 (20:04Z). SQLite checkpoints WAL back into the
main file when the last connection to a database closes (a default of the WAL mode itself, not this
job) — a clean container shutdown during redeploy plausibly explains the 329MB→24MB drop on its
own, independent of whether the scheduled job ever got to fire. And `IntervalTrigger(hours=3)` with
no explicit first-run counts from scheduler start, so in a container only 14 minutes old,
`job_wal_checkpoint` has not yet had its first chance to run this container's life — **the drop
observed here cannot be credited to the scheduled job; it is much more likely a restart-driven
checkpoint.** Verdict: not "the checkpoint is failing," but "WAL is being kept bounded by deploy
frequency, which happens to be high, rather than confirmed to be bounded by its own dedicated
3-hourly job" — nobody has yet seen `"[wal] checkpoint(TRUNCATE) ->"` actually logged on its own
schedule this session. That is the next thing that would settle it, not asserted here.

**`df` swung the same direction as the WAL-restart correlation, adding a second independent line of
evidence for "container restarts move this file's residual mover," not the `:37` prune alone.**
78%→83% (avail 17G→13G, used 56G→59G) in the same 90-minute window the DB itself grew only
~36MB (row5→row6: 38,121,472 bytes, 20:04→21:34, ≈25.4 MB/h — in the same range as prior segments,
nothing alarming there). A 4-5GB `df` swing against a 36MB DB gain, landing across a **confirmed**
container recreation (21:20:39Z), is the first time this file has a real restart timestamp to
correlate against instead of guessing between the WAL checkpoint and the `:37` prune. Still not
proof — new image layers, log rotation and the prune could all move at redeploy time too — but it
reframes the open question from "which of two mechanisms" to "how much of this file's whole
residual-mover puzzle is just deploy churn," which the next few readings should try to timestamp
against `docker ps --format '{{.CreatedAt}}'` the way this one did, not skip.

**Days-to-full: still not published.** Segment rates now span 21–37 MB/h across four segments —
the spread has not narrowed with a fourth point, if anything it's wider. Row 3's 5+-point bar and
the ~2h-apart schedule proposed in row 4's note both still stand.

**Fourth point (2026-09-03 15:32, 11 min after the third) — not used for a rate, and that is itself
informative.** `DB bytes` is byte-for-byte identical to the previous row (22243946496); only `WAL`
grew (243,112→276,072). The DB file itself is written in bursts (checkpoint-driven), not
continuously — an 11-minute gap can land entirely inside one burst-free interval, so computing a
segment rate from this pair would produce a false ≈0 MB/h, not a true one. Recorded as evidence of
that burstiness, not as a trend point. `df use%` moved a third direction this time (76%→79%, avail
18G→16G, used 55G→57G) with the DB unchanged — confirms the residual mover (still unidentified) can
push `df` in either direction independent of DB writes; this table cannot explain it without reading
the `riq-disk-guard`/checkpoint logs directly, which no reading here has done yet.

**Still no days-to-full — restating row 3's bar with a concrete target.** Need 5+ points spread
across several `:37` prune cycles, not clustered like this one. At roughly hourly-to-multi-hourly
cadence, spacing future reads at least ~2h apart (next targets: ~18:00Z, ~21:00Z today, ~00:00Z and
~04:00Z 2026-09-04) would give 5 well-spaced points by tomorrow morning — enough to test whether the
DB-bytes rate is actually linear instead of computing one across the confound.

**First real rate (2 rows, thin — do not treat as confirmed):** DB grew 73,142,272 bytes in 145
minutes → ≈30.3 MB/h ≈ 0.73 GB/day on the DB file alone. That is in the same range as the ~0.65
GB/day corpus-growth figure `config.py` records from 2026-08-18, so it is plausible, not yet
trusted — two points cannot show whether growth is linear.

**Third point added (2026-09-03 15:21) — the rate is NOT constant, so still no days-to-full.**
Segment rates: A→B (09-02 19:04→21:29, 145 min) ≈30.27 MB/h; B→C (09-02 21:29→09-03 15:21, ~17h53m)
≈21.35 MB/h; A→C (full ~20h17m span) ≈22.41 MB/h ≈0.54 GB/day. The three points disagree by ~40%
(30.3 vs 21.4 MB/h) — not proof of nonlinearity, but three points is not enough to call the DB's
growth linear either, so **no days-to-full estimate is published here.** `df use%` again moved
*opposite* the DB (78%→76%, avail 17G→18G, used 56G→55G) while the DB file grew ~365MB — the same
confound as A→B: something else on the disk (WAL checkpoint, the `riq-disk-guard` :37 prune) is
moving faster and in the other direction than the metric this file is trying to trend. WAL itself
shrank 9,925,112→243,112 bytes between B and C, consistent with a checkpoint, but that alone doesn't
explain df's ~1-2GB net swing against a ~365MB DB gain — the residual mover is still UNKNOWN, same
as it was at row 2. **Next honest milestone: enough same-direction points (ideally 5+, spanning
several :37 prune cycles) that a rate can be trusted against the confound instead of merely computed
across it.**

**df use% moved the OTHER direction from the DB (86%→78%, used 62G→56G) while the DB file grew.**
Do not read this as the corpus shrinking: `df` measures the whole disk, and something else on it
fell by more than the DB gained in the same window. The two known movers named in O-003
(`~/work/COMMITMENTS.md`) are a WAL checkpoint and the `riq-disk-guard` prune that fires at :37 —
between 19:04 and 21:29 two such :37 windows (19:37, 20:37) would have run. WAL itself moved from 0
to 9,925,112 bytes here, i.e. *up*, not down, so the checkpoint explanation alone does not account
for all of it — which mover(s) actually fired and by how much is UNKNOWN from this reading alone;
neither was checked directly (no guard log was read this pass). Days-to-full is still not
computable from this: two points, a rate confounded by an unrelated prune process, and a use% that
moved opposite the metric the rate is based on.

## Readings recorded before this file existed — context only, NOT comparable

| taken (UTC) | what was recorded | where | why it cannot be differenced |
|---|---|---|---|
| 2026-09-02 15:01:50 | `disk-headroom` first `warn`: 12.3% free of 74GB | `/api/health` | health check reports free %, not DB bytes |
| 2026-09-02 15:07 | volumes 42.86GB, "the 21.69GB DB" | `docker system df` | volume total includes journal + backups; base unstated |
| 2026-09-02 17:58:35 | `disk-headroom` warn: 14.0% free of 74GB | `/api/health` | free % went **up** vs 15:01 — WAL checkpointed, not disk reclaimed |

## What is still true and still undecided

`docker system df` reports ~11.99GB reclaimable, and `docker images -f dangling=true` returns **0** —
it is all tagged, unused images, i.e. Coolify's rollback targets. `docker image prune -a` would free
roughly 12GB and cost the ability to roll back a bad deploy. That trade is the founder's, it has not
been put to him, and no agent should take it unilaterally.
