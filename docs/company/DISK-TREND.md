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
