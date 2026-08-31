---
description: Rebuild the founder dashboard from production (Stripe + prod DB, read-only)
allowed-tools: Bash(.claude/bin/with-secrets.sh*), Bash(python3 scripts/company/build_dashboard.py*), Read
---
```bash
.claude/bin/with-secrets.sh python3 scripts/company/build_dashboard.py --prod
```

`--prod` is required, not optional. Without it the build writes `prod_included: false`, which trips
`production/dashboard-data-fresh` and turns the board RED — a local-only rebuild is strictly worse
than not rebuilding. It is also the only database where the KPIs can compute at all.

Everything it reads is read-only: the production DB opens `mode=ro` and the Stripe key is read from
inside the container and never leaves it.

Then summarise what CHANGED since the previous build, not the whole board. If a panel moved from a
number to UNKNOWN, that is the headline — it means we lost a measurement, which is worse than the
number having moved.
