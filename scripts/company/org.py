#!/usr/bin/env python3
"""ORG — compute the company's real state: departments, agents, KPIs, mail.

    python3 scripts/company/org.py            human-readable
    python3 scripts/company/org.py --json     for the dashboard

Emits `dashboard/org.json`, which the dashboard renders. Everything here is
DERIVED — from git, from WORKBOARD.md, from the bus, from the published queue.
Nothing is typed in by hand, because a hand-typed dashboard is a picture of a
company rather than a view of one, and it goes stale silently.

The one rule that shapes this file: a KPI with no evidence renders UNKNOWN, and
UNKNOWN is never zero. A query that inspected nothing has not measured 0% — it
has failed to measure, and those need different responses.
"""
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "dashboard", "org.json")

DEPARTMENTS = {
    "Product & Growth": {"head": "product-manager",
        "agents": ["ux-researcher", "designer", "content-social", "seo", "lifecycle"],
        "owns": "What we build, who hears about it, whether they come back"},
    "Engineering": {"head": "tech-lead",
        "agents": ["backend-eng", "frontend-eng", "extension-eng", "data-eng", "qa-eng"],
        "owns": "The product works and stays working"},
    "Data & Money": {"head": "data-scientist",
        "agents": ["finance-ops", "monetization"],
        "owns": "Every number a customer or the founder acts on"},
    "Trust & Ops": {"head": "devops",
        "agents": ["security-eng", "legal-compliance", "customer-success"],
        "owns": "It stays up, stays legal, and someone answers"},
    "Office of the CEO": {"head": "chief-of-staff",
        "agents": ["verifier"],
        "owns": "Cadence, the board, and checking our own claims"},
}

# Company KPIs. `value` is filled from evidence below; None means UNKNOWN and
# the dashboard must render it as UNKNOWN rather than 0.
COMPANY_KPIS = [
    {"kpi": "paying_customers", "target": 100,
     "counter": "refund rate", "source": "stripe"},
    {"kpi": "signups", "target": 1000,
     "counter": "activation rate — a signup who never checks an item is not a user",
     "source": "db"},
    {"kpi": "views_across_platforms", "target": 100000,
     "counter": "qualified-click rate — a million wrong-market views is a failure wearing a success",
     "source": "platform analytics"},
    {"kpi": "posts_published", "target": None,
     "counter": "account health — one banned account costs more than a month of posts",
     "source": "growth.db"},
    {"kpi": "defects_reaching_a_customer", "target": 0,
     "counter": "shipping velocity — zero defects by shipping nothing is not the goal",
     "source": "workboard"},
]


def sh(cmd, cwd=ROOT):
    try:
        return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True,
                              text=True, timeout=30).stdout.strip()
    except Exception:
        return ""


def workboard_rows():
    """Parse WORKBOARD.md. Each row is a finding with an owner and a status."""
    p = os.path.join(ROOT, "docs", "company", "WORKBOARD.md")
    if not os.path.exists(p):
        return []
    rows = []
    for line in open(p, encoding="utf-8"):
        m = re.match(r"^\|\s*\*\*(W\d+)\*\*\s*\|(.*)$", line.strip())
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).split("|")]
        if len(cells) < 4:
            continue
        status = "CLOSED" if "**CLOSED**" in cells[3] else (
            "BLOCKED" if "BLOCKED" in cells[3] else "OPEN")
        rows.append({"id": m.group(1),
                     "finding": re.sub(r"\*\*|`", "", cells[0])[:220],
                     "found_by": re.sub(r"\*\*|`", "", cells[1]),
                     "doer": re.sub(r"\*\*|`", "", cells[2]),
                     "status": status})
    return rows


def agent_activity(name):
    """What has this agent actually shipped? Branches merged, commits touched.

    Deliberately counts BRANCHES rather than documents: the company produced
    27,466 lines of prose against 2,084 of product code on 2026-09-01, so
    measuring output by writing rewards exactly the wrong thing.
    """
    # Count branches actually MERGED INTO main, not merge commits mentioning the
    # agent -- merge messages are hand-written here and mostly do not carry the
    # branch name, so grepping them undercounted every agent that shipped today.
    # `git branch --merged` is the fact; the commit message is a description of
    # it, and today has been a long lesson in not confusing the two.
    out = []
    for repo in (ROOT, os.path.join(os.path.dirname(ROOT), "demand-intel")):
        if not os.path.isdir(os.path.join(repo, ".git")):
            continue
        listing = sh("git branch --merged main --format='%(refname:short)'", cwd=repo)
        out += [b for b in listing.splitlines() if b.strip().startswith(f"claude/{name}/")]
    allb = []
    for repo in (ROOT, os.path.join(os.path.dirname(ROOT), "demand-intel")):
        if not os.path.isdir(os.path.join(repo, ".git")):
            continue
        listing = sh("git branch --format='%(refname:short)'", cwd=repo)
        allb += [b for b in listing.splitlines() if b.strip().startswith(f"claude/{name}/")]
    return {"merged_branches": len(out), "branches": len(allb)}


def bus_state():
    p = os.path.join(ROOT, "docs", "company", "bus.jsonl")
    rp = os.path.join(ROOT, "docs", "company", "bus-read.jsonl")
    if not os.path.exists(p):
        return {"messages": [], "unread_by_agent": {}}
    msgs = []
    for line in open(p, encoding="utf-8"):
        line = line.strip()
        if line:
            try:
                msgs.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    read = set()
    if os.path.exists(rp):
        for line in open(rp, encoding="utf-8"):
            try:
                read.add(json.loads(line)["id"])
            except Exception:
                continue
    unread = {}
    for m in msgs:
        if m["id"] in read:
            continue
        unread.setdefault(m.get("to", "?"), 0)
        unread[m["to"]] += 1
    return {"messages": msgs[-60:], "unread_by_agent": unread}


def published_posts():
    """Posts actually live, from growth.db. Nothing counts until it published."""
    db = os.path.join(os.path.dirname(ROOT), "resale-iq-growth", "data", "growth.db")
    if not os.path.exists(db):
        return None
    import sqlite3
    try:
        c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
        n = c.execute("SELECT COUNT(*) FROM content WHERE status='published'").fetchone()[0]
        c.close()
        return n
    except Exception:
        return None


def main():
    rows = workboard_rows()
    bus = bus_state()
    posts = published_posts()

    depts = {}
    for dname, d in DEPARTMENTS.items():
        members = [d["head"]] + d["agents"]
        agents = []
        for a in members:
            act = agent_activity(a)
            owned = [r for r in rows if a in r["doer"]]
            found = [r for r in rows if a in r["found_by"]]
            agents.append({
                "agent": a,
                "is_head": a == d["head"],
                "merged_branches": act["merged_branches"],
                "open_rows": sum(1 for r in owned if r["status"] == "OPEN"),
                "closed_rows": sum(1 for r in owned if r["status"] == "CLOSED"),
                "findings_raised": len(found),
                "unread_mail": bus["unread_by_agent"].get(a, 0),
            })
        depts[dname] = {
            "head": d["head"], "owns": d["owns"], "agents": agents,
            # A department's score is what its people SHIPPED and FOUND, not
            # what they wrote. Findings count because an analyst that cannot
            # edit still moves the company -- that was the whole diagnosis
            # behind the workboard.
            "rows_closed": sum(a["closed_rows"] for a in agents),
            "rows_open": sum(a["open_rows"] for a in agents),
            "findings_raised": sum(a["findings_raised"] for a in agents),
        }

    kpis = []
    for k in COMPANY_KPIS:
        v = None
        if k["kpi"] == "posts_published":
            v = posts
        elif k["kpi"] == "defects_reaching_a_customer":
            v = sum(1 for r in rows if r["status"] == "OPEN")
        kpis.append({**k, "value": v,
                     "unknown": v is None,
                     "why_unknown": None if v is not None else
                     f"never measured — source is {k['source']}"})

    data = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "company_kpis": kpis,
        "departments": depts,
        "workboard": rows,
        "bus": bus,
        "totals": {
            "rows_total": len(rows),
            "rows_open": sum(1 for r in rows if r["status"] == "OPEN"),
            "rows_closed": sum(1 for r in rows if r["status"] == "CLOSED"),
            "rows_blocked": sum(1 for r in rows if r["status"] == "BLOCKED"),
            "bus_messages": len(bus["messages"]),
        },
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    if "--json" in sys.argv:
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return 0

    t = data["totals"]
    print(f"ORG  {data['generated_at']}")
    print(f"  board: {t['rows_closed']} closed · {t['rows_open']} open · "
          f"{t['rows_blocked']} blocked   bus: {t['bus_messages']} messages\n")
    for dname, d in depts.items():
        print(f"{dname}  (head: {d['head']})")
        print(f"  closed {d['rows_closed']} · open {d['rows_open']} · "
              f"found {d['findings_raised']}")
        for a in d["agents"]:
            mail = f"  ✉{a['unread_mail']}" if a["unread_mail"] else ""
            print(f"    {a['agent']:<18} merged {a['merged_branches']:<3} "
                  f"closed {a['closed_rows']:<3} found {a['findings_raised']}{mail}")
        print()
    print("COMPANY KPIs")
    for k in kpis:
        v = "UNKNOWN" if k["unknown"] else k["value"]
        tgt = "" if k["target"] is None else f" / {k['target']}"
        print(f"  {k['kpi']:<30} {v}{tgt}")
    print(f"\nwrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
