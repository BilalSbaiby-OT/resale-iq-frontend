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

**First real rate (2 rows, thin — do not treat as confirmed):** DB grew 73,142,272 bytes in 145
minutes → ≈30.3 MB/h ≈ 0.73 GB/day on the DB file alone. That is in the same range as the ~0.65
GB/day corpus-growth figure `config.py` records from 2026-08-18, so it is plausible, not yet
trusted — two points cannot show whether growth is linear.

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
