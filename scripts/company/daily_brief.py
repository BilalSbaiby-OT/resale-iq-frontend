#!/usr/bin/env python3
"""The founder's one message a day.

    python3 scripts/company/daily_brief.py            # print, do not send
    python3 scripts/company/daily_brief.py --send     # send to Telegram

WHY THIS EXISTS

The founder, 2026-09-02: *"i dont need to be speaking for a whole month and come
back to a good company"* and *"only update me one time per day then trough
telegram"*.

So this is not a status page he has to visit. It goes to him.

**Every number here is READ FROM PRODUCTION AT SEND TIME.** Nothing is passed in,
nothing is remembered, nothing is typed by an agent. That is deliberate: the most
expensive errors of 2026-09-01 were all a real number attached to a wrong claim —
a sandbox Stripe key reported as production, an all-time PENDING average
presented as a current rate. A brief assembled by hand would reintroduce exactly
that. If a figure cannot be read, it prints UNKNOWN and says why.

It is also deliberately SHORT. One message a day that gets read beats a
dashboard that does not.
"""
import argparse
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "scripts", "company"))

PROD_QUERY = r'''
import sqlite3, json
c = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=40)
def one(sql):
    try:
        return c.execute(sql).fetchone()[0]
    except Exception:
        # why: one unreadable metric must not kill the brief; the caller prints UNKNOWN.
        return None
W = "viewed_at > datetime('now','-24 hours') AND COALESCE(is_bot,0)=0"
V = "created_at > datetime('now','-24 hours')"
out = {
 "visitors":   one("SELECT COUNT(DISTINCT visitor_hash) FROM pageviews WHERE %s" % W),
 "register":   one("SELECT COUNT(DISTINCT visitor_hash) FROM pageviews WHERE %s AND path LIKE '%%register%%'" % W),
 "signups":    one("SELECT COUNT(*) FROM users WHERE %s" % V),
 "users":      one("SELECT COUNT(*) FROM users"),
 "paying":     one("SELECT COUNT(*) FROM users WHERE stripe_sub_id IS NOT NULL AND stripe_sub_id<>''"),
 "checks":     one("SELECT COUNT(*) FROM verdict_logs WHERE %s" % V),
 "actionable": one("SELECT COUNT(*) FROM verdict_logs WHERE %s AND verdict IN ('BUY','WATCH','SKIP','BRAND_AVERAGE')" % V),
 "deadend":    one("SELECT COUNT(*) FROM verdict_logs WHERE %s AND verdict IN ('UNKNOWN','INSUFFICIENT_DATA','PENDING')" % V),
 "buys":       one("SELECT COUNT(*) FROM verdict_logs WHERE %s AND verdict='BUY'" % V),
 "brandavg":   one("SELECT COUNT(*) FROM verdict_logs WHERE %s AND verdict='BRAND_AVERAGE'" % V),
}
print(json.dumps(out))
'''


def prod():
    """Live numbers, or None. Never a cached or remembered figure."""
    try:
        import build_dashboard as bd
        raw = bd.ssh_py(PROD_QUERY, timeout=180)
        return json.loads(raw) if raw else None
    except Exception:
        # why: if production is unreachable the brief still sends, with the UNKNOWN banner,
        # rather than silently reporting zeros as if they were measurements.
        return None


def board():
    try:
        out = subprocess.run(
            ["python3", os.path.join(ROOT, "scripts", "company", "org.py"), "--json"],
            capture_output=True, text=True, timeout=300, cwd=ROOT).stdout
        d = json.loads(out)
        t = d.get("totals", {})
        rows = [r for r in d.get("workboard", [])
                if str(r.get("status", "")).upper().startswith("OPEN")]
        return t, rows
    except Exception:
        # why: the board is secondary to the money numbers; a broken board omits a section
        # rather than stopping the founder's daily message.
        return None, []


def shipped_today():
    try:
        n = subprocess.run(["git", "log", "--since=24 hours ago", "--oneline"],
                           capture_output=True, text=True, timeout=120, cwd=ROOT).stdout
        return len([l for l in n.splitlines() if l.strip()])
    except Exception:
        # why: commit count is decoration. None omits the line; a zero would read as
        # 'we shipped nothing today', which is a different claim.
        return None


def pct(a, b):
    return f"{100.0 * a / b:.0f}%" if (a is not None and b) else "—"


def build():
    p = prod()
    totals, open_rows = board()
    commits = shipped_today()

    L = ["*Resale IQ — daily*", ""]

    if p is None:
        L += ["⚠️ *Production numbers UNKNOWN* — could not read the database.",
              "Not guessing. Treat today's figures as unavailable, not as zero.", ""]
    else:
        L += [f"💶 *Paying: {p['paying']}*  ·  users {p['users']}",
              f"👤 {p['visitors']} visitors → {p['register']} reached signup → {p['signups']} signed up",
              ""]
        if p["checks"]:
            bits = [f"{p['checks']} checks", f"{pct(p['actionable'], p['checks'])} answered"]
            if p["brandavg"]:
                bits.append(f"{p['brandavg']} brand-average")
            if not p["buys"]:
                bits.append("*0 BUY*")
            L += ["🔎 " + " · ".join(bits), ""]

    if totals:
        L.append(f"📋 board {totals.get('rows_closed', '?')} closed / {totals.get('rows_open', '?')} open")
    if commits is not None:
        L.append(f"🛠 {commits} commits in 24h")

    if open_rows:
        L += ["", "*Open:*"]
        for r in open_rows[:5]:
            L.append(f"• {r.get('id')} — {str(r.get('doer'))[:22]}")

    L += ["", "_One message a day. Numbers read live from production at send time —"
              " none of them typed by an agent._"]
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--send", action="store_true", help="send to Telegram (otherwise print)")
    a = ap.parse_args()

    text = build()
    if not a.send:
        print(text)
        return 0

    import build_dashboard as bd
    script = (
        "import asyncio, sys\n"
        "sys.path.insert(0, '/app')\n"
        "from alerts.telegram import send_alert\n"
        f"print('sent:', asyncio.run(send_alert({text!r})))\n")
    res = bd.ssh_py(script, timeout=180)
    print(res or "send failed — no response from the container")
    return 0 if (res and "sent: True" in res) else 1


if __name__ == "__main__":
    sys.exit(main())
