"""Shared, read-only production access for the drift canary.

Same pattern as scripts/company/build_dashboard.py:ssh_py — ssh into the
production host, `docker exec` a python one-liner inside the backend
container, open the database `mode=ro` by URI. This module never opens a
writable handle to anything, and never runs on `main` or writes to prod.

Kept tiny and dependency-free (stdlib only) so it can be imported by both
freeze_drift_canary.py and run_drift_canary.py without pulling in the rest
of scripts/company/.
"""
import json
import sqlite3
import subprocess

BACKEND = "ph5clxk9hmghspv65pdkvak9"
PROD_DB_PATH = "/app/data/demand_intel.db"

FIELDS = [
    "id", "brand", "model", "category", "comparable_n", "sold_7d", "sold_30d",
    "avg_price_eur", "median_price_eur", "price_iqr_eur", "max_buy_price",
    "active_listings", "str_pct", "data_quality_score", "zone", "updated_at",
]


def _container_name(timeout=30):
    p = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "resaleiq", "docker", "ps",
         "--format", "{{.Names}}"],
        capture_output=True, text=True, timeout=timeout)
    for line in p.stdout.splitlines():
        if BACKEND in line:
            return line.strip()
    return None


def fetch_model_signals_prod(ids=None, timeout=60):
    """Read-only fetch of model_signals rows from production, by id.

    ids=None fetches every row (used by the freezer). A list of ids fetches
    only those (used by the drift runner, so a re-run never touches more of
    production than the frozen set already named).

    Returns (rows: list[dict], meta: dict) or raises on transport failure —
    callers decide whether that becomes UNKNOWN or a hard error.
    """
    name = _container_name()
    if not name:
        raise RuntimeError("could not find backend container on resaleiq host")

    where = ""
    if ids is not None:
        where = "WHERE id IN (%s)" % ",".join(str(int(i)) for i in ids)

    script = f'''
import sqlite3, json
con = sqlite3.connect("file:{PROD_DB_PATH}?mode=ro", uri=True, timeout=20)
c = con.cursor()
c.execute("SELECT {", ".join(FIELDS)} FROM model_signals {where}")
cols = [d[0] for d in c.description]
rows = [dict(zip(cols, r)) for r in c.fetchall()]
c.execute("SELECT count(*) FROM listings")
listings_total = c.fetchone()[0]
c.execute("SELECT count(*) FROM listings WHERE sold_observed=1")
sold_observed_total = c.fetchone()[0]
c.execute("SELECT count(*) FROM model_signals")
model_signals_total = c.fetchone()[0]
c.execute("SELECT max(updated_at) FROM model_signals")
max_updated = c.fetchone()[0]
c.execute("SELECT datetime('now')")
now = c.fetchone()[0]
con.close()
print(json.dumps({{
    "rows": rows,
    "meta": {{
        "listings_total": listings_total,
        "sold_observed_total": sold_observed_total,
        "model_signals_total_rows": model_signals_total,
        "model_signals_max_updated_at": max_updated,
        "db_server_time_utc": now,
    }},
}}))
'''
    p = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "resaleiq",
         f"docker exec -i {name} python3 -"],
        input=script, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError(f"prod read failed: {p.stderr[:300]}")
    out = json.loads(p.stdout.strip().splitlines()[-1])
    return out["rows"], out["meta"]


def fetch_model_signals_local(db_path, ids=None):
    """Same query, against a local sqlite file, opened read-only.

    This is what proof.sh uses (a fixture built with db/schema.py's shape),
    and what anyone without ssh access to resaleiq can use to exercise the
    diff logic without ever touching production.
    """
    con = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=15)
    c = con.cursor()
    where = ""
    params = ()
    if ids is not None:
        where = "WHERE id IN (%s)" % ",".join("?" * len(ids))
        params = tuple(int(i) for i in ids)
    c.execute(f"SELECT {', '.join(FIELDS)} FROM model_signals {where}", params)
    cols = [d[0] for d in c.description]
    rows = [dict(zip(cols, r)) for r in c.fetchall()]

    def one(sql):
        try:
            c.execute(sql)
            r = c.fetchone()
            return r[0] if r else None
        except Exception:
            return None

    meta = {
        "listings_total": one("SELECT count(*) FROM listings"),
        "sold_observed_total": one(
            "SELECT count(*) FROM listings WHERE sold_observed=1"),
        "model_signals_total_rows": one("SELECT count(*) FROM model_signals"),
        "model_signals_max_updated_at": one(
            "SELECT max(updated_at) FROM model_signals"),
        "db_server_time_utc": one("SELECT datetime('now')"),
    }
    con.close()
    return rows, meta
