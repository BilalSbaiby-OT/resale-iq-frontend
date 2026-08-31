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

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMPANY = os.path.join(ROOT, "docs", "company")
AUDIT = os.path.join(ROOT, "docs", "audit")
OUT = os.path.join(ROOT, "dashboard", "data.json")
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


# ---------- panel 1: founder inbox ----------
def founder_inbox():
    txt = read(os.path.join(COMPANY, "APPROVALS.md"))
    open_items = re.findall(r"^- \[ \] (.+)$", txt, re.M)
    return {"open": [i.strip()[:200] for i in open_items], "count": len(open_items)}


# ---------- panel 2: company ----------
def company(prod):
    d = {
        "mrr": unknown("no Stripe read", "run with --prod"),
        "customers": unknown("no Stripe read", "run with --prod"),
        "north_star_weekly_trusted_checks": unknown(
            "no sql/metrics/weekly_trusted_checks.sql yet",
            "Phase 2: write the metric and its counter"),
        "retention_30d": unknown("no sql/metrics/retention.sql yet", "Phase 2"),
        "spend_vs_cap": unknown("no spend ledger yet",
                                "Phase 2: finance-ops writes docs/company/LEDGER.md"),
        "spend_cap_eur": 200,
    }
    if prod:
        d.update(prod.get("company", {}))
    return d


# ---------- panel 3: quality ----------
def quality(prod):
    d = {
        "canary": unknown("no canary set yet",
                          "Phase 2: 60 frozen labelled listings with auto-revert"),
        "match_precision": unknown("no 30-sample audit run yet", "Phase 2: /precision"),
        "band_coverage": unknown("no sql/metrics yet", "Phase 2"),
        "insufficient_data_rate": unknown("no sql/metrics yet", "Phase 2"),
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
            for b in sh(f"git branch --list 'claude/{name}/*'", cwd=repo).splitlines():
                b = b.strip().lstrip("* ")
                if b:
                    branches.append(label + b.split("/")[-1])

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


# ---------- panel 7: activity ----------
def activity():
    rows = []
    for line in read(os.path.join(AUDIT, "ACTIVITY.jsonl")).splitlines()[-50:]:
        try:
            rows.append(json.loads(line))
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prod", action="store_true",
                    help="also read production DB + live Stripe (read-only)")
    args = ap.parse_args()

    prod = None
    if args.prod:
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
            "zero_model_urls": {"value": 36, "source": "MARKETING-AUDIT.md §2"},
        },
        "session": read(os.path.join(COMPANY, "SESSION.md"))[:6000],
        "amendments": re.findall(r"^## (AM-\d+ — .+)$",
                                 read(os.path.join(COMPANY, "AMENDMENTS.md")), re.M),
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    print(f"wrote {OUT}  ({os.path.getsize(OUT)} bytes, prod={bool(prod)})")


if __name__ == "__main__":
    main()
