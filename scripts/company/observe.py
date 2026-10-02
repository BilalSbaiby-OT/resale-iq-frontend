#!/usr/bin/env python3
"""COMPANY HEARTBEAT — runs on the production host, without any session open.

    python3 observe.py            # measure, write state, print
    python3 observe.py --alert    # ...and escalate to the founder if a rule fires

DESIGNED TO RUN FROM CRON ON THE PRODUCTION HOST. That is the only runtime this
company currently has that survives the founder closing his laptop:

  - Claude Code `CronCreate`  : "gone when Claude exits" (its own words)
  - Claude scheduled tasks    : disk-persistent, but only fire while the app runs
  - GitHub Actions            : durable, but has no route to the production DB
  - THIS HOST                 : has the database, the Telegram token, and 24/7 uptime

WHAT IT DELIBERATELY DOES NOT DO
================================
**It does not reason.** There is no LLM in this loop, on purpose and by necessity:

  ANTHROPIC_API_KEY  : absent everywhere (local, host, GitHub secrets)
  OPENROUTER_API_KEY : valid, authenticates, but 402 Payment Required
  GROQ_API_KEY       : 403 Forbidden

So the company cannot yet *think* while the founder is away. It can **observe,
remember, detect and escalate** — which is the skeleton and the nervous system.
Adding a funded key turns this file's output into an agent's input; nothing here
has to change for that.

Pretending otherwise would be the exact failure this company has spent a day
cataloguing: a system that looks autonomous and silently does nothing.

EVERY NUMBER IS READ AT RUN TIME. Nothing is passed in, remembered or typed.
A figure that cannot be read is written as null and reported as UNKNOWN — never
as zero, because a zero reads as a measurement and a null reads as a gap.
"""
import argparse
import json
import os
import sqlite3
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone

DB = "file:/app/data/demand_intel.db?mode=ro"
STATE = "/app/state/company_state.json"      # on the host; git copy is the audit trail

# Rules that wake the founder. Deliberately few: an alert that fires every day is
# noise, and noise is how a real alert gets ignored. Each has a reason.
RULES = [
    ("paying_dropped",   lambda s, p: p and s["paying"] < p.get("paying", 0),
     "A paying customer disappeared. Nothing matters more than this."),
    # "stopped answering" is a claim about NOW, so it is measured on a recent
    # window, never on the 24h average. On 2026-09-02 the anonymous outage ran
    # 07:00-12:24Z; by 22:17 CEST the product had answered cleanly for 8 hours
    # (last 6h: 83.9% actionable) while the trailing-24h figure still read 35.8%
    # and fired this rule hourly. It would have kept firing until ~12:24Z the
    # next day — ~16 more identical alerts for an incident that was over. That
    # is the "an all-time average is not a current rate" trap in AGENTS.md, and
    # it is how a real alert gets ignored.
    ("no_answers",       lambda s, p: s["checks_recent"] >= 20 and s["actionable_recent_pct"] is not None and s["actionable_recent_pct"] < 40,
     "The product stopped answering: under 40% actionable on 20+ recent checks."),
    ("crawl_stalled",    lambda s, p: s["crawl_runs_24h"] is not None and s["crawl_runs_24h"] < 40,
     "The crawl has nearly stopped. The data is the asset."),
    ("disk_critical",    lambda s, p: s["disk_pct"] is not None and s["disk_pct"] >= 92,
     "Disk over 92%. At 100% nothing deploys — that happened on 2026-09-01."),
    ("first_sale",       lambda s, p: p and s["paying"] > p.get("paying", 0),
     "SOMEONE PAID."),
]


def q(con, sql, default=None):
    try:
        return con.execute(sql).fetchone()[0]
    except Exception:
        # why: one unreadable metric must not kill the heartbeat. The caller
        # writes null, which is reported as UNKNOWN rather than as zero.
        return default


def measure():
    con = sqlite3.connect(DB, uri=True, timeout=60)
    W = "viewed_at > datetime('now','-24 hours') AND COALESCE(is_bot,0)=0"
    V = "created_at > datetime('now','-24 hours')"
    # Availability window. 3h, not 1h: at current volume one hour carries ~8
    # checks, far under the 20-check floor, so an hourly window would silence
    # the rule entirely rather than sharpen it.
    R = "created_at > datetime('now','-3 hours')"
    s = {
        "at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "paying": q(con, "SELECT COUNT(*) FROM users WHERE stripe_sub_id IS NOT NULL AND stripe_sub_id<>''", 0),
        "users": q(con, "SELECT COUNT(*) FROM users", 0),
        "signups_24h": q(con, f"SELECT COUNT(*) FROM users WHERE {V}", 0),
        "visitors_24h": q(con, f"SELECT COUNT(DISTINCT visitor_hash) FROM pageviews WHERE {W}"),
        "reached_register_24h": q(con, f"SELECT COUNT(DISTINCT visitor_hash) FROM pageviews WHERE {W} AND path LIKE '%register%'"),
        "checks_24h": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {V}", 0),
        "actionable_24h": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {V} AND verdict IN ('BUY','WATCH','SKIP','BRAND_AVERAGE')", 0),
        "deadend_24h": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {V} AND verdict IN ('UNKNOWN','INSUFFICIENT_DATA','PENDING')", 0),
        "checks_recent": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {R}", 0),
        "actionable_recent": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {R} AND verdict IN ('BUY','WATCH','SKIP','BRAND_AVERAGE')", 0),
        "brand_average_24h": q(con, f"SELECT COUNT(*) FROM verdict_logs WHERE {V} AND verdict='BRAND_AVERAGE'", 0),
        "crawl_runs_24h": q(con, "SELECT COUNT(*) FROM scraper_log WHERE platform LIKE 'vinted%' AND run_at > datetime('now','-24 hours')"),
        "crawl_avg_seconds": q(con, "SELECT ROUND(AVG(duration_seconds),1) FROM scraper_log WHERE platform LIKE 'vinted%' AND run_at > datetime('now','-24 hours')"),
        "listings": q(con, "SELECT COUNT(*) FROM listings"),
    }
    con.close()

    c, a = s["checks_24h"], s["actionable_24h"]
    s["actionable_pct"] = round(100.0 * a / c, 1) if c else None

    cr, ar = s["checks_recent"], s["actionable_recent"]
    s["actionable_recent_pct"] = round(100.0 * ar / cr, 1) if cr else None

    try:
        st = os.statvfs("/")
        s["disk_pct"] = round(100.0 * (st.f_blocks - st.f_bfree) / st.f_blocks, 1)
    except Exception:
        # why: disk is a host signal, not a company metric. If it cannot be read
        # the heartbeat still reports the business numbers.
        s["disk_pct"] = None

    # MRR is derived, never invented: no subscription rows means no MRR.
    s["mrr_eur"] = 0 if s["paying"] == 0 else None   # None = we must go to Stripe
    s["target_mrr_eur"] = 2000
    return s


def previous():
    try:
        with open(STATE, encoding="utf-8") as fh:
            return json.load(fh).get("now")
    except Exception:
        # why: first run has no history. An absent baseline is not an error, and
        # the delta rules simply do not fire.
        return None


def persist(s, prev, fired):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    with open(STATE, "w", encoding="utf-8") as fh:
        json.dump({"now": s, "previous": prev, "alerts": fired}, fh, indent=1)


def telegram(text):
    tok = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not tok or not chat:
        return False
    body = json.dumps({"chat_id": chat, "text": text, "parse_mode": "Markdown"}).encode()
    req = urllib.request.Request(f"https://api.telegram.org/bot{tok}/sendMessage",
                                 data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status == 200
    except Exception as e:
        print(f"telegram failed: {str(e)[:120]}", file=sys.stderr)
        return False


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--alert", action="store_true", help="escalate to the founder if a rule fires")
    a = ap.parse_args()

    s = measure()
    prev = previous()
    fired = [(n, why) for n, test, why in RULES if _safe(test, s, prev)]
    persist(s, prev, [n for n, _ in fired])

    print(json.dumps(s, indent=1))
    if fired:
        print("\nALERTS: " + ", ".join(n for n, _ in fired))

    if a.alert and fired:
        lines = ["*Resale IQ — the company needs you*", ""]
        for _, why in fired:
            lines.append(f"• {why}")
        lines += ["",
                  f"paying *{s['paying']}* · users {s['users']} · visitors {s['visitors_24h']}",
                  f"checks 3h {s['checks_recent']} · answered {s['actionable_recent_pct']}%",
                  f"checks 24h {s['checks_24h']} · answered {s['actionable_pct']}%",
                  f"crawl {s['crawl_runs_24h']} runs @ {s['crawl_avg_seconds']}s · disk {s['disk_pct']}%",
                  "", "_Measured on the host. No session was open._"]
        print("telegram sent:", telegram("\n".join(lines)))
    return 0


def _safe(test, s, prev):
    try:
        return bool(test(s, prev))
    except Exception:
        # why: a broken rule must not silence the whole heartbeat. It declines to
        # fire rather than crashing the run that would have caught a real one.
        return False


if __name__ == "__main__":
    sys.exit(main())
