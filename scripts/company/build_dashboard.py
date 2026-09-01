#!/usr/bin/env python3
"""Build dashboard/data.json — the only thing the founder's dashboard reads (OS §9).

Read-only. It never writes anywhere but dashboard/data.json.

    python3 scripts/company/build_dashboard.py            # local sources only
    .claude/bin/with-secrets.sh python3 scripts/company/build_dashboard.py --prod

--prod adds the numbers that only exist in production: Stripe (live key lives in the
backend container, not on this Mac) and the production database. Without it those panels
say UNKNOWN, which is the point — OS §0 rule 2. A panel with no source behind it shows
UNKNOWN, never a placeholder and never a zero.
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scrub  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMPANY = os.path.join(ROOT, "docs", "company")
AUDIT = os.path.join(ROOT, "docs", "audit")
OUT = os.path.join(ROOT, "dashboard", "data.json")
SQL_METRICS = os.path.join(ROOT, "sql", "metrics")
BACKEND = "ph5clxk9hmghspv65pdkvak9"

UNKNOWN = {"value": None, "unknown": True}


def unknown(why, fix=None):
    return {"value": None, "unknown": True, "why": why, "fix": fix}


def read(path, default=""):
    try:
        with open(path) as fh:
            return fh.read()
    except OSError:
        return default


def sh(cmd, cwd=ROOT, timeout=60):
    try:
        p = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True,
                           text=True, timeout=timeout)
        return p.stdout.strip()
    except Exception:
        return ""


def ssh_py(script, timeout=120):
    """Run a python snippet inside the production backend container, read-only."""
    name = sh(f"ssh -o BatchMode=yes resaleiq 'docker ps --format \"{{{{.Names}}}}\" "
              f"| grep {BACKEND} | head -1'", timeout=30)
    if not name:
        return None
    try:
        p = subprocess.run(
            ["ssh", "-o", "BatchMode=yes", "resaleiq",
             f"docker exec -i {name} python3 -"],
            input=script, capture_output=True, text=True, timeout=timeout)
        return p.stdout if p.returncode == 0 else None
    except Exception:
        return None


# ---------- metrics: the ONLY source of KPI numbers (OS §3) ----------
_METRICS_CACHE = {}
# Set by main() when --prod succeeds. Production is the only database where
# every metric can actually compute, so its results win over the local read.
_PROD_METRICS = {}


def metric_values(db=None):
    """Run sql/metrics/*.sql and shape the results for the panels.

    Until now every KPI here was a hardcoded unknown() reading "no sql/metrics
    yet". The files exist, so the panels read them instead of describing their
    own absence.

    Results keep their `n`, and val() in index.html renders it — so OS §0 rule 2
    survives all the way to the screen rather than stopping at the query. The
    `source` field puts the .sql filename under every number, which is the other
    half of the rule: you can see what produced it without leaving the page.

    Never raises. A metrics failure degrades a panel to UNKNOWN; it does not take
    the dashboard down.
    """
    if _PROD_METRICS:
        return _PROD_METRICS
    key = db or "default"
    if key in _METRICS_CACHE:
        return _METRICS_CACHE[key]
    out = {}
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import metrics as _m
        data = _m.collect(db or _m.DEFAULT_DB)
        for r in data.get("results", []):
            name = r.get("metric")
            if not name:
                continue
            if r.get("unknown"):
                out[name] = unknown(r.get("why") or "no result", r.get("fix"))
            else:
                out[name] = {"value": r["value"], "n": r["n"],
                             "source": "sql/metrics/%s.sql" % name}
    except Exception as e:  # noqa: BLE001 — a broken metric must not blank the page
        out = {"_error": unknown("metrics runner failed: %s" % e,
                                 "python3 scripts/company/metrics.py")}
    _METRICS_CACHE[key] = out
    return out


# ---------- panel 1: founder inbox ----------
def founder_inbox():
    txt = read(os.path.join(COMPANY, "APPROVALS.md"))
    open_items = re.findall(r"^- \[ \] (.+)$", txt, re.M)
    return {"open": [i.strip()[:200] for i in open_items], "count": len(open_items)}


# ---------- panel 2: company ----------
def company(prod):
    M = metric_values()
    d = {
        "mrr": unknown("no Stripe read", "run with --prod"),
        "customers": unknown("no Stripe read", "run with --prod"),
        # Upper bound, not an exact count: the n>=8 gate fails open when
        # comparable_n is absent (GAPS C5). METRICS.md says so; so must anyone
        # quoting this number.
        "north_star_weekly_trusted_checks": M.get(
            "weekly_trusted_checks",
            unknown("sql/metrics/weekly_trusted_checks.sql did not run", None)),
        "retention_30d": M.get(
            "retention_30d",
            unknown("sql/metrics/retention_30d.sql did not run", None)),
        "trial_to_paid": M.get(
            "trial_to_paid",
            unknown("sql/metrics/trial_to_paid.sql did not run", None)),
        "spend_vs_cap": unknown("no spend ledger yet",
                                "Phase 2: finance-ops writes docs/company/LEDGER.md"),
        "spend_cap_eur": 200,
    }
    if prod:
        d.update(prod.get("company", {}))
    return d


# ---------- panel 3: quality ----------
def quality(prod):
    M = metric_values()
    d = {
        "canary": unknown("no canary set yet",
                          "Phase 2: 60 frozen labelled listings with auto-revert"),
        "match_precision": unknown("no 30-sample audit run yet", "Phase 2: /precision"),
        # These two are COMPLEMENTS on the same window (band_coverage =
        # 100 - insufficient_data_rate, by construction). They are one
        # measurement from two sides and must never be read as corroborating
        # each other — see METRICS.md.
        "band_coverage_demand": M.get(
            "band_coverage_demand",
            unknown("sql/metrics/band_coverage_demand.sql did not run", None)),
        # The honesty counter (OS §0.4). The previous counter,
        # insufficient_data_rate, is band_coverage's exact arithmetic complement
        # and so could never contradict it.
        "band_evidence_p50": M.get(
            "band_evidence_p50",
            unknown("sql/metrics/band_evidence_p50.sql did not run", None)),
        "insufficient_data_rate": M.get(
            "insufficient_data_rate",
            unknown("sql/metrics/insufficient_data_rate.sql did not run", None)),
        # The SUPPLY side. band_coverage above is demand-side; a product can look
        # well-covered there purely because the few models people search happen
        # to be the deep ones. These two are NOT complements — unlike
        # band_coverage/insufficient_data_rate, they answer different questions
        # over different populations, so they genuinely do corroborate.
        "band_coverage_supply": M.get(
            "band_coverage_supply",
            unknown("sql/metrics/band_coverage_supply.sql did not run", None)),
        "n_predictions_resolved": M.get(
            "n_predictions_resolved",
            unknown("sql/metrics/n_predictions_resolved.sql did not run", None)),
        "pipeline_lag_min": M.get(
            "pipeline_lag_min",
            unknown("sql/metrics/pipeline_lag_min.sql did not run", None)),
    }
    if prod:
        d.update(prod.get("quality", {}))
    return d


# ---------- panel 5: departments, read from the agent roster ----------
def departments():
    """Parse .claude/agents/*.md into the roster panel.

    Source of truth is the agent file itself, so the dashboard can never disagree
    with what the agent is actually told to do — if someone edits a KPI card, this
    moves with it.
    """
    adir = os.path.join(ROOT, ".claude", "agents")
    if not os.path.isdir(adir):
        return unknown("no .claude/agents directory", "OS §8 Phase 3")

    # hours + last activity per agent, from the ledger the hooks write
    seen = {}
    for line in read(os.path.join(AUDIT, "ACTIVITY.jsonl")).splitlines():
        try:
            r = json.loads(line)
        except json.JSONDecodeError:
            continue
        a = r.get("agent") or "ceo"
        d = seen.setdefault(a, {"events": 0, "last": None})
        d["events"] += 1
        d["last"] = r.get("ts") or d["last"]

    out = []
    for fn in sorted(os.listdir(adir)):
        if not fn.endswith(".md"):
            continue
        name = fn[:-3]
        txt = read(os.path.join(adir, fn))

        def field(key, default=""):
            m = re.search(rf"^{key}:\s*(.+)$", txt, re.M)
            return m.group(1).strip() if m else default

        tier_line = field("tier")
        tier = (re.search(r"(T\d)", tier_line).group(1) if re.search(r"(T\d)", tier_line) else "T1")
        standing = "standing" if "standing: standing" in txt else "on-call"

        # Branches this agent actually opened — the honest "did it do anything".
        # The roster spans BOTH repos: backend-eng works in demand-intel, so
        # looking only in resale-iq reported "none yet" for an agent that had
        # already shipped a P0. Check every repo the company owns.
        branches = []
        for repo, label in ((ROOT, ""), (os.path.join(os.path.dirname(ROOT), "demand-intel"), "demand-intel:"),
                            (os.path.join(os.path.dirname(ROOT), "resale-iq-growth"), "growth:")):
            if not os.path.isdir(os.path.join(repo, ".git")):
                continue
            # MERGED branches are marked, not silently listed as if outstanding.
            #
            # This panel enumerated refs and stopped there, so a branch that had
            # already shipped still read as open work — a ref surviving its merge
            # is the normal state of git, not a signal. On 2026-09-01 an agent
            # read this panel, concluded the anon-quota fix was unmerged, and
            # made "merge it" its #1 P0 against code that was already live in
            # production. It had the right instinct (check the machine, not the
            # prose) and this panel was the wrong machine.
            merged = {b.strip().lstrip("* ")
                      for b in sh("git branch --merged main --list 'claude/*'",
                                  cwd=repo).splitlines() if b.strip()}
            for b in sh(f"git branch --list 'claude/{name}/*'", cwd=repo).splitlines():
                b = b.strip().lstrip("* ")
                if b:
                    suffix = "  (merged)" if b in merged else ""
                    branches.append(label + b.split("/")[-1] + suffix)

        act = seen.get(name, {})
        out.append({
            "name": name,
            "model": field("model", "?"),
            "tier": tier,
            "standing": standing,
            "primary": field("primary"),
            "secondary": field("secondary"),
            "counter": field("counter"),
            "branches": branches,
            # Not derivable: main and subagents share one session id, so the
            # ledger cannot attribute an event to an agent. Branches and commits
            # can, and do. Reporting a 0 here would be a made-up number.
            "events": None,
            "last_active": act.get("last"),
            # No verifier run yet, so there is no score. Say so rather than draw a dash.
            "score": None,
        })
    return {"agents": out, "count": len(out),
            "scored": False,
            "note": "No SCOREBOARD.md yet — only `verifier` may write it (OS §7), and it "
                    "has not run. HIT/MISS/FAKE stays UNKNOWN until it does."}


# ---------- panel 6: design deliverables ----------
def design():
    ddir = os.path.join(ROOT, "design")
    if not os.path.isdir(ddir):
        return unknown("no design/ directory", "OS §6")
    files = []
    for base, _, names in os.walk(ddir):
        for n in sorted(names):
            fp = os.path.join(base, n)
            rel = os.path.relpath(fp, ROOT)
            files.append({"path": rel,
                          "href": "design/" + os.path.relpath(fp, ddir),
                          "bytes": os.path.getsize(fp),
                          "viewable": n.endswith((".html", ".json"))})
    return {"files": files, "count": len(files)}


# ---------- panel 7: work ----------
def work():
    branches = [b.strip().lstrip("* ") for b in sh("git branch --list 'claude/*'").splitlines()]
    return {
        "branches": branches,
        "recent_commits": [
            {"sha": l.split(" ", 1)[0], "msg": l.split(" ", 1)[1][:110]}
            for l in sh("git log --oneline -12").splitlines() if " " in l
        ],
        "dirty": bool(sh("git status --porcelain")),
        "lock": read(os.path.join(ROOT, ".claude", "LOCK"), "(free)").strip()[:400],
    }


def audits():
    out = []
    for f in sorted(os.listdir(AUDIT)) if os.path.isdir(AUDIT) else []:
        if f.endswith(".md"):
            path = os.path.join(AUDIT, f)
            out.append({"file": f, "lines": len(read(path).splitlines())})
    return out


# The credential-name scrubber now lives in `scrub.py` and is applied at the
# WRITE BOUNDARY below, so every panel is covered -- including ones nobody has
# written yet. Keeping a private copy here is what let org.json repeat this.
_scrub = scrub.scrub


# ---------- panel 7: activity ----------
def activity():
    rows = []
    for line in read(os.path.join(AUDIT, "ACTIVITY.jsonl")).splitlines()[-50:]:
        try:
            rows.append(_scrub(json.loads(line)))
        except json.JSONDecodeError:
            continue
    return rows[::-1]


# ---------- panel 8: security & ops ----------
def security():
    txt = read(os.path.join(COMPANY, "SECURITY-LOG.md"))
    return {
        "blocked": len(re.findall(r"\*\*BLOCKED\*\*", txt)),
        "tripwire": len(re.findall(r"\*\*TRIPWIRE\*\*", txt)),
        "recent": [l.strip("- ")[:190] for l in txt.splitlines()
                   if "**BLOCKED**" in l or "**TRIPWIRE**" in l][-12:][::-1],
        "restore_test": unknown("no restore drill recorded",
                                "SECURITY-AUDIT.md finding #2"),
    }


# ---------- production reads ----------
PROD_SCRIPT = r'''
import json, sqlite3, subprocess, os
out = {"company": {}, "quality": {}, "funnel": {}}
try:
    con = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=15)
    c = con.cursor()
    def one(sql):
        try:
            c.execute(sql); r = c.fetchone(); return r[0] if r else None
        except Exception: return None
    out["company"]["users_total"] = {"value": one("SELECT count(*) FROM users")}
    out["company"]["users_paying"] = {"value": one(
        "SELECT count(*) FROM users WHERE stripe_customer_id IS NOT NULL "
        "AND stripe_customer_id != ''")}
    out["funnel"]["verdicts_7d"] = {"value": one(
        "SELECT count(*) FROM verdict_logs WHERE created_at >= datetime('now','-7 days')")}
    out["funnel"]["pageviews_7d"] = {"value": one(
        "SELECT count(*) FROM pageviews WHERE viewed_at >= datetime('now','-7 days')")}
    out["funnel"]["signups_7d"] = {"value": one(
        "SELECT count(*) FROM users WHERE created_at >= datetime('now','-7 days')")}
    out["funnel"]["attributed_signups"] = {"value": one(
        "SELECT count(*) FROM signup_attribution")}
    out["quality"]["listings_total"] = {"value": one("SELECT count(*) FROM listings")}
    out["quality"]["newest_sold_at"] = {"value": one("SELECT max(sold_at) FROM listings")}
    out["quality"]["predictions_total"] = {"value": one("SELECT count(*) FROM predictions")}
    con.close()
except Exception as e:
    out["db_error"] = str(e)[:200]

key = os.environ.get("STRIPE_SECRET_KEY", "")
if key:
    def get(p):
        r = subprocess.run(["curl", "-sS", "--max-time", "25", "-H",
                            "Authorization: Bearer " + key,
                            "https://api.stripe.com/v1/" + p],
                           capture_output=True, text=True)
        try: return json.loads(r.stdout)
        except Exception: return {}
    subs = get("subscriptions?limit=100&status=all").get("data", [])
    mrr = 0
    for s in subs:
        if s.get("status") == "active":
            for it in s.get("items", {}).get("data", []):
                mrr += (it.get("price", {}).get("unit_amount") or 0) * it.get("quantity", 1)
    out["company"]["mrr"] = {"value": mrr / 100, "currency": "EUR",
                             "n": len(subs), "source": "stripe live /v1/subscriptions"}
    out["company"]["customers"] = {"value": len(get("customers?limit=100").get("data", []))}
    ch = get("charges?limit=100").get("data", [])
    out["company"]["charges_paid"] = {"value": len([x for x in ch if x.get("paid")
                                                    and not x.get("refunded")])}
print(json.dumps(out))
'''


# Ships sql/metrics/*.sql into the production container and runs them there.
#
# The queries are NOT duplicated here: sql/metrics/ stays the single definition
# and this is transport only. The container has no copy of the repo, so the files
# travel inline with the script — which also means a query edited locally takes
# effect on the next run with no deploy.
#
# Why this exists at all: the local demand_intel.db is a stale dev copy missing
# four migrated columns, so weekly_trusted_checks and retention_30d can NEVER
# compute against it. Reading the North Star from the local db would report
# UNKNOWN forever while production had the answer all along.
PROD_METRICS_SCRIPT = r"""
import json, re, sqlite3
FILES = __FILES__
CONTRACT = ("metric", "value", "n", "window_start", "window_end")
FLOOR_RE = re.compile(r"^--\s*floor:\s*(\d+)\s*$", re.M)
out = []
try:
    con = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=20)
    for name, sql in sorted(FILES.items()):
        try:
            cur = con.execute(sql)
            cols = tuple(d[0] for d in cur.description or ())
            rows = cur.fetchall()
        except Exception as e:
            out.append({"metric": name, "unknown": True, "why": str(e)[:200]})
            continue
        if cols != CONTRACT or len(rows) != 1:
            out.append({"metric": name, "unknown": True,
                        "why": "contract violation: %s / %d rows" % (str(cols), len(rows))})
            continue
        m, v, n, w0, w1 = rows[0]
        n = int(n or 0)
        fm = FLOOR_RE.search(sql)
        if not fm:
            out.append({"metric": name, "unknown": True,
                        "why": "contract violation: no floor declared"})
            continue
        if n < int(fm.group(1)):
            out.append({"metric": m or name, "unknown": True,
                        "why": "population below floor (n = %d, floor = %s)" % (n, fm.group(1))})
            continue
        if n == 0:
            out.append({"metric": m or name, "unknown": True, "why": "inspected nothing (n = 0)"})
        elif v is None:
            out.append({"metric": m or name, "unknown": True,
                        "why": "query returned NULL over a non-empty population"})
        else:
            out.append({"metric": m or name, "value": v, "n": n,
                        "window_start": w0, "window_end": w1})
    con.close()
except Exception as e:
    out.append({"metric": "_all", "unknown": True, "why": "prod db: " + str(e)[:200]})
print(json.dumps(out))
"""


def prod_metric_values():
    """Run the metric queries against production. Returns {} on any failure."""
    files = {}
    try:
        for f in sorted(os.listdir(SQL_METRICS)):
            if f.endswith(".sql"):
                files[f[:-4]] = read(os.path.join(SQL_METRICS, f))
    except OSError:
        return {}
    if not files:
        return {}

    raw = ssh_py(PROD_METRICS_SCRIPT.replace("__FILES__", json.dumps(files)))
    if not raw:
        return {}
    try:
        rows = json.loads(raw.strip().splitlines()[-1])
    except Exception:
        return {}

    out = {}
    for r in rows:
        name = r.get("metric")
        if not name:
            continue
        if r.get("unknown"):
            out[name] = unknown(r.get("why") or "no result", None)
        else:
            out[name] = {"value": r["value"], "n": r["n"],
                         "source": "sql/metrics/%s.sql (production)" % name}
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prod", action="store_true",
                    help="also read production DB + live Stripe (read-only)")
    args = ap.parse_args()

    prod = None
    if args.prod:
        global _PROD_METRICS
        _PROD_METRICS = prod_metric_values()
        if not _PROD_METRICS:
            print("prod metrics read failed — KPI panels fall back to the local db",
                  file=sys.stderr)
        raw = ssh_py(PROD_SCRIPT)
        if raw:
            try:
                prod = json.loads(raw.strip().splitlines()[-1])
            except Exception as e:
                print("prod parse failed:", e, file=sys.stderr)
        else:
            print("prod read failed — panels stay UNKNOWN", file=sys.stderr)

    data = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "prod_included": bool(prod),
        "founder_inbox": founder_inbox(),
        "company": company(prod),
        "quality": quality(prod),
        "funnel": (prod or {}).get("funnel") or {
            "note": unknown("no funnel events table wired yet", "run with --prod")},
        "departments": departments(),
        "design": design(),
        "work": work(),
        "audits": audits(),
        "activity": activity(),
        "security": security(),
        "marketing": {
            "gsc_clicks_28d": {"value": 6, "n": 906, "source": "GSC MCP, 2026-08-03..08-31"},
            "gsc_impressions_28d": {"value": 906, "source": "GSC MCP"},
            "extension_installs": {"value": 3, "source": "Chrome Web Store listing, 2026-08-31"},
            "posts_published_all_time": {"value": 1, "source": "MARKETING-AUDIT.md §6"},
            "zero_model_urls": {"value": 0, "source": "src/data/seo-brands.json, 2026-09-01 — the 6 zero-models_tracked brands (pull-bear, zara, bershka, mango, hugo-boss, calvin-klein; 36 URLs total: 6 brand pages + 30 brand x category pages) were removed on branch claude/seo/w2-zero-model-cleanup. Verified live: brand count 26->20, remaining 9 categories still each served by >=1 real brand. sitemap.ts and generateStaticParams both derive from this same BRANDS list, so the 36 URLs 404 and drop from the sitemap by construction, not by a second edit."},
        },
        "session": read(os.path.join(COMPANY, "SESSION.md"))[:6000],
        "amendments": re.findall(r"^## (AM-\d+ — .+)$",
                                 read(os.path.join(COMPANY, "AMENDMENTS.md")), re.M),
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(scrub.scrub(data), fh, indent=2, ensure_ascii=False)
    print(f"wrote {OUT}  ({os.path.getsize(OUT)} bytes, prod={bool(prod)})")


if __name__ == "__main__":
    main()
