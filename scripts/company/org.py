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
    rows, seen_ids = [], set()
    for line in open(p, encoding="utf-8"):
        m = re.match(r"^\|\s*\*\*(W\d+)\*\*\s*\|(.*)$", line.strip())
        if not m:
            continue
        cells = [c.strip() for c in m.group(2).split("|")]
        if len(cells) < 4:
            continue
        status = "CLOSED" if "**CLOSED**" in cells[3] else (
            "BLOCKED" if "BLOCKED" in cells[3] else "OPEN")
        # Duplicate ids happened for real: finance-ops added W21-W25 without
        # checking the highest in use and collided with CEO-added rows, so the
        # stale-check reported rows that did not exist as written. Flag rather
        # than silently dedupe -- a board that quietly drops a row is worse than
        # one that says it is confused.
        dup = m.group(1) in seen_ids
        seen_ids.add(m.group(1))
        rows.append({"id": m.group(1), "duplicate_id": dup,
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


ROSTER = {
    "product-manager", "ux-researcher", "designer", "content-social", "seo",
    "lifecycle", "tech-lead", "backend-eng", "frontend-eng", "extension-eng",
    "data-eng", "qa-eng", "data-scientist", "finance-ops", "monetization",
    "devops", "security-eng", "legal-compliance", "customer-success",
    "chief-of-staff", "verifier", "founder",
}


def unassignable(rows):
    """OPEN rows nobody can be spawned for.

    Measured 2026-09-01: 12 of 27 open rows had a `doer` that was prose --
    "CEO", "seo or analytics", "product-manager decides then backend-eng". None
    of those can be handed to anybody, so they wait for a human to interpret
    them, which means they wait for the CEO -- the exact bottleneck the board
    exists to remove.

    A doer must be ONE roster agent, or the literal word `founder`. If a
    decision must precede the work, that is TWO rows, not one row with two
    names.
    """
    out = []
    for r in rows:
        if r["status"] != "OPEN":
            continue
        d = r["doer"].lower()
        named = sorted(a for a in ROSTER if a in d)
        if len(named) != 1:
            out.append({**r, "named_agents": named,
                        "why": "no roster agent named" if not named
                               else f"{len(named)} agents named — neither owns it"})
    return out


def stale_open_rows(rows):
    """Rows still marked OPEN whose work already shipped.

    THE BOARD MUST AUDIT ITSELF. "Remember to close the row" is not a process --
    on 2026-09-01 the CEO listed a deleted Instagram reel as outstanding in three
    consecutive summaries, and left W19 and W41 open after both had shipped and
    deployed. A stale row spends the founder's attention on finished work and
    makes every other row less believable.

    Evidence of shipping = the row id appears in a commit message on main in
    either repo. That is deliberately a loose test: it produces a SUSPECTED
    list, not an automatic close. Closing a row is a judgement about whether the
    finding is actually resolved, and a grep does not get to make it -- but a
    grep is perfectly capable of asking the question.
    """
    out = []
    for r in rows:
        if r["status"] != "OPEN":
            continue
        hits = []
        for repo, label in ((ROOT, "resale-iq"),
                            (os.path.join(os.path.dirname(ROOT), "demand-intel"),
                             "demand-intel")):
            if not os.path.isdir(os.path.join(repo, ".git")):
                continue
            found = sh(f"git log --oneline --grep='\\b{r['id']}\\b' main | head -3", cwd=repo)
            if found:
                hits += [f"{label}: {l}" for l in found.splitlines()]
        if hits:
            out.append({**r, "shipped_evidence": hits})
    return out


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


def stripe_state():
    """Paying customers, from Stripe itself. Read-only, key never printed.

    A MEASURED ZERO IS NOT UNKNOWN, and on 2026-09-01 that distinction turned
    out to be the most important fact in the company: Stripe is in TEST MODE, so
    0 customers does not mean nobody wanted to pay -- it means no real charge
    could succeed. `livemode` is carried through so the dashboard can say which
    kind of zero it is showing.
    """
    key = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    if not key:
        return {"available": False, "why": "STRIPE_SECRET_KEY not in env — "
                "run through .claude/bin/with-secrets.sh"}
    # WHICH ACCOUNT THIS IS READING MATTERS MORE THAN THE NUMBERS.
    #
    # On 2026-09-01 I read this key, saw livemode=false, and told the founder we
    # could not take money. Wrong: the agent credentials file holds a SANDBOX
    # key (acct_1TmFnX, "Demand Intel sandbox"), which is correct hygiene --
    # agents should not hold a live key. PRODUCTION runs sk_live for
    # acct_1TmFnC ("Demand Intel") and has always been able to charge.
    #
    # So a zero from here is a zero IN THE SANDBOX and says nothing about
    # demand. The dashboard must show which account it read, or it will tell the
    # same lie I did.
    sandbox = key.startswith("sk_test")
    import urllib.request, base64, ssl
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    auth = base64.b64encode(f"{key}:".encode()).decode()

    def get(path):
        req = urllib.request.Request(f"https://api.stripe.com/v1/{path}",
                                     headers={"Authorization": f"Basic {auth}"})
        with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
            return json.load(r)

    try:
        subs = get("subscriptions?status=active&limit=100").get("data", [])
        charges = get("charges?limit=100").get("data", [])
        prods = get("products?limit=5").get("data", [])
    except Exception as e:
        return {"available": False, "why": f"{type(e).__name__}: {e}"}

    livemode = prods[0].get("livemode") if prods else None
    return {
        "available": True,
        "livemode": livemode,
        "account": prods[0].get("id", "")[:0] or None,
        "reading": "SANDBOX (agent key) — NOT production" if sandbox
                   else "production (live key)",
        "active_subscriptions": len(subs),
        "charges": len(charges),
        "refunded": sum(1 for c in charges if c.get("refunded")),
        # The whole point: say WHICH zero this is.
        # Say plainly which kind of zero this is. Production is live and CAN
        # charge; the agent key cannot see it.
        "zero_means": None if livemode else
        "this is the SANDBOX account the agent key belongs to. Production runs a "
        "live key and can charge — these figures are not production's.",
    }


def published_posts():
    """Posts actually live, FROM POSTIZ — the only place that knows.

    growth.db is not the source of truth here and reading it produced a WRONG
    zero: the publish script marks a row `scheduled` when Postiz accepts it, and
    Postiz publishes it later on its own cycle. Nothing ever tells our database
    the post went live, so `status='published'` counted 0 while six posts were
    on X, Instagram and TikTok.

    A wrong number is worse than UNKNOWN, so this asks the system that knows.
    """
    key = os.environ.get("POSTIZ_API_KEY", "").strip()
    if not key:
        return None
    import urllib.request, ssl
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        ctx = ssl.create_default_context()
    # POSTIZ_API_URL is empty in the environment -- a known defect -- so the
    # host is named here rather than read from a variable that is not set.
    req = urllib.request.Request(
        "https://api.postiz.com/public/v1/posts"
        "?startDate=2026-08-01T00:00:00Z&endDate=2026-12-31T00:00:00Z",
        headers={"Authorization": key})
    try:
        with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
            d = json.load(r)
    except Exception:
        return None
    posts = d.get("posts", d) if isinstance(d, dict) else d
    if not isinstance(posts, list):
        return None
    return sum(1 for p in posts if p.get("state") == "PUBLISHED")


def main():
    rows = workboard_rows()
    stale = stale_open_rows(rows)
    unassigned = unassignable(rows)
    bus = bus_state()
    posts = published_posts()
    stripe = stripe_state()

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
        note = None
        if k["kpi"] == "posts_published":
            v = posts
        elif k["kpi"] == "defects_reaching_a_customer":
            v = sum(1 for r in rows if r["status"] == "OPEN")
        elif k["kpi"] == "paying_customers" and stripe.get("available"):
            v = stripe["active_subscriptions"]
            note = stripe.get("zero_means")
        kpis.append({**k, "value": v, "note": note,
                     "unknown": v is None,
                     "why_unknown": None if v is not None else
                     f"never measured — source is {k['source']}"})

    data = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "company_kpis": kpis,
        "departments": depts,
        "workboard": rows,
        "stale_open": stale,
        "unassignable": unassigned,
        "bus": bus,
        "stripe": stripe,
        "totals": {
            "rows_total": len(rows),
            "rows_open": sum(1 for r in rows if r["status"] == "OPEN"),
            "rows_closed": sum(1 for r in rows if r["status"] == "CLOSED"),
            "rows_blocked": sum(1 for r in rows if r["status"] == "BLOCKED"),
            "bus_messages": len(bus["messages"]),
            "stale_open": len(stale),
            "unassignable": len(unassigned),
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
    if stale:
        print(f"\n⚠ {len(stale)} OPEN rows look SHIPPED — close or explain:")
        for r in stale:
            print(f"  {r['id']:<5} {r['finding'][:60]}")
            for e in r["shipped_evidence"][:2]:
                print(f"        {e[:96]}")
    if unassigned:
        print(f"\n⚠ {len(unassigned)} OPEN rows have NO SPAWNABLE OWNER:")
        for r in unassigned:
            print(f"  {r['id']:<5} doer={r['doer'][:38]:<38} {r['why']}")
    print(f"\nwrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
