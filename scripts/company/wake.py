#!/usr/bin/env python3
"""WAKE — the first thing a CEO session runs, before anything else.

    python3 scripts/company/wake.py

WHY THIS EXISTS

The founder, 2026-09-02: *"reasoning model for the moment use yourself... when we
get 100 users we will get the key"*.

So the company's architecture is now explicit and honest:

  BETWEEN SESSIONS  the heartbeat observes, persists and escalates (host cron)
  DURING A SESSION  a Claude session is the reasoning layer

That only works if a session starting from ZERO context can reconstruct the
company in one command. Otherwise the founder has to explain the company every
time, which is the exact cost he is trying to remove — and which
`FORENSIC-AUDIT.md` measured: every agent starts cold, and everything of
substance arrived through a prompt he typed.

**This file is the handover between the two halves.** It reads what the heartbeat
recorded while nobody was watching, diffs it against the last session, and states
the highest-value thing to do next — with the evidence attached, so the reasoning
layer can disagree with it.

It does NOT decide. It assembles. The deciding is the session's job, and a
session that cannot see the evidence cannot decide well.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HIST = os.path.join(ROOT, "docs", "company", "heartbeat-history.jsonl")


def sh(cmd, timeout=120):
    try:
        return subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True,
                              text=True, timeout=timeout).stdout.strip()
    except Exception as e:
        print(f"wake: command failed: {str(e)[:80]}", file=sys.stderr)
        return ""


def host_state():
    """What the heartbeat recorded while no session was open."""
    raw = sh("ssh -o BatchMode=yes -o ConnectTimeout=20 resaleiq "
             "\"docker exec \\$(docker ps --format '{{.Names}}'|grep ph5cl|head -1) "
             "cat /app/state/company_state.json\"", timeout=180)
    try:
        return json.loads(raw) if raw else None
    except Exception as e:
        print(f"wake: state unreadable: {str(e)[:80]}", file=sys.stderr)
        return None


def append_history(now):
    """Accumulate so trends exist. One line per wake, append-only."""
    try:
        with open(HIST, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(now) + "\n")
    except Exception as e:
        print(f"wake: could not append history: {str(e)[:80]}", file=sys.stderr)


def history(n=5):
    try:
        with open(HIST, encoding="utf-8") as fh:
            return [json.loads(l) for l in fh.read().splitlines()[-n:] if l.strip()]
    except Exception:
        # why: no history on first wake is normal, not an error. Trend lines are
        # simply omitted rather than the whole brief failing.
        return []


def delta(now, prev, key):
    a, b = now.get(key), (prev or {}).get(key)
    if a is None or b is None:
        return ""
    d = a - b
    return f"  ({d:+})" if d else ""


def main():
    st = host_state()
    if not st:
        print("=" * 68)
        print("WAKE — COMPANY STATE UNREADABLE")
        print("=" * 68)
        print("\nCould not read /app/state/company_state.json from the host.")
        print("That is a finding, not a formality: the heartbeat may be dead.")
        print("\n  ssh resaleiq /usr/local/bin/riq-heartbeat")
        print("\nDo NOT proceed on remembered numbers. Verify first.")
        return 1

    now, prev = st.get("now", {}), st.get("previous")
    append_history(now)
    hist = history()

    print("=" * 68)
    print("WAKE — what happened while no session was open")
    print("=" * 68)
    print(f"\nheartbeat last ran: {now.get('at')}")
    if st.get("alerts"):
        print(f"ALERTS FIRED: {', '.join(st['alerts'])}")

    print("\n-- MONEY " + "-" * 57)
    print(f"  paying customers   {now.get('paying')}{delta(now, prev, 'paying')}   target: 80 by 2026-12-31")
    print(f"  users              {now.get('users')}{delta(now, prev, 'users')}")
    print(f"  signups (24h)      {now.get('signups_24h')}")

    print("\n-- DOES THE PRODUCT ANSWER " + "-" * 40)
    c, a = now.get("checks_24h"), now.get("actionable_pct")
    print(f"  checks (24h)       {c}")
    print(f"  actionable         {a}%   dead-end {now.get('deadend_24h')}")
    print(f"  brand-average      {now.get('brand_average_24h')}   (W60 converting dead ends)")

    print("\n-- THE ASSET " + "-" * 54)
    print(f"  crawl runs (24h)   {now.get('crawl_runs_24h')}{delta(now, prev, 'crawl_runs_24h')}")
    print(f"  crawl avg seconds  {now.get('crawl_avg_seconds')}   (decay: rising is bad)")
    print(f"  listings           {now.get('listings'):,}" if now.get("listings") else "  listings UNKNOWN")
    print(f"  disk               {now.get('disk_pct')}%")

    if len(hist) > 1:
        print("\n-- TREND (last %d wakes) " % len(hist) + "-" * 42)
        for h in hist:
            print(f"  {str(h.get('at'))[:16]}  paying {h.get('paying')}  "
                  f"checks {h.get('checks_24h')}  actionable {h.get('actionable_pct')}%  "
                  f"crawl {h.get('crawl_runs_24h')}@{h.get('crawl_avg_seconds')}s")

    print("\n-- THE BOARD " + "-" * 54)
    board = sh("python3 scripts/company/org.py --json", timeout=300)
    try:
        d = json.loads(board)
        t = d.get("totals", {})
        print(f"  {t.get('rows_closed')} closed / {t.get('rows_open')} open")
        for r in d.get("workboard", []):
            if str(r.get("status", "")).upper().startswith("OPEN"):
                print(f"    OPEN {r.get('id')} -> {str(r.get('doer'))[:22]}")
    except Exception:
        print("  board UNREADABLE — run org.py directly")

    print("\n-- DEPLOY " + "-" * 57)
    print(sh("python3 scripts/company/deploy_drift.py", timeout=300) or "  drift check failed")

    print("\n" + "=" * 68)
    print("WHAT TO DO NEXT — assembled, not decided. Disagree if the evidence says so.")
    print("=" * 68)

    # Ordered by what the company has measured, not by what is pleasant.
    if now.get("paying", 0) > (prev or {}).get("paying", 0):
        print("\n  SOMEONE PAID. Everything else waits. Find out who, how they arrived,")
        print("  and what they did before paying. That path is the only one we know works.")
    elif (now.get("crawl_avg_seconds") or 0) > 2200:
        print("\n  THE CRAWL IS DEGRADING PAST 2200s. The data is the asset and it is")
        print("  shrinking. See the tracker ORDER BY finding — this compounds daily.")
    elif a is not None and a < 50:
        print("\n  THE PRODUCT HAS STOPPED ANSWERING (<50% actionable). Nothing")
        print("  downstream matters — traffic sent here is spent and lost.")
    elif (now.get("disk_pct") or 0) >= 90:
        print("\n  DISK >=90%. At 100% NOTHING DEPLOYS. That happened on 2026-09-01.")
    elif now.get("paying") == 0:
        print("\n  STILL ZERO PAYING. The binding constraint is not traffic (28/day is")
        print("  enough for 2.56% -> 80 customers). It is that nobody has been asked to pay")
        print("  by a product that answers. See FIRST-REVENUE.md and MISSION.md.")
    else:
        print("\n  No rule fired. Read the board and pick the highest-value open row.")

    print("\n  Read first: DOCTRINE.md (canonical) · MISSION.md (the number) ·")
    print("              SESSION.md (last session) · AUTONOMY.md (what runs headless)")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
