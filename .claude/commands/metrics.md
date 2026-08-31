---
description: Run every KPI query in sql/metrics/ and report the numbers with their n
allowed-tools: Bash(python3 scripts/company/metrics.py*), Read
---
Run the KPI layer:

```bash
python3 scripts/company/metrics.py
```

That reads the **local** database, which is a stale dev copy missing four migrated columns — so the
North Star and retention will report `no such column`. For the numbers that actually matter, read
production instead:

```bash
.claude/bin/with-secrets.sh python3 scripts/company/build_dashboard.py --prod
```

then report `company` and `quality` from `dashboard/data.json`.

**Never quote a value without its `n`.** Every metric returns one, and `docs/company/METRICS.md`
explains what each population is. Two specific traps that file records:

- `band_coverage` and `insufficient_data_rate` are exact complements on the same window. They are one
  measurement from two sides — never present them as corroborating each other.
- The North Star is an upper bound only if GAPS C5 is unfixed. Check before adding the caveat.

Definitions live in `docs/company/METRICS.md`. Changing one is a founder gate (OS §3).
