#!/usr/bin/env python3
"""STATUS — the founder's report, generated from check output, never composed.

The founder asked to "always finish with a structured text to know wtf is going
on". The important word is *generated*. A report I write by hand is a report that
can drift from the system it describes — which is the whole failure this project
exists to fix. So this reads the verifiers' JSON and renders. It cannot say a
thing is green unless a check said so.

    python3 scripts/company/status_report.py              write STATUS.md + status.json
    python3 scripts/company/status_report.py --session    print the ~20-line chat block
    python3 scripts/company/status_report.py --no-run     render from the last run

Design rules, each inherited from something that went wrong:
  - UNKNOWN is its own section and never renders as a zero. From build_dashboard.py.
  - A check that inspected nothing (n=0) is a failure, not a pass. From verify.mjs.
  - Every blocking row carries the fix command. From doctor.js's `→ fix` field.
  - No percentage score. A score invites optimising the score, which is how
    "41 of 63 DONE" came to be asserted about a harness that was largely inert.
"""
import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMPANY = os.path.join(ROOT, "docs", "company")
STATUS_MD = os.path.join(COMPANY, "STATUS.md")
STATUS_JSON = os.path.join(ROOT, "dashboard", "status.json")
PREV_JSON = os.path.join(ROOT, "dashboard", ".status.prev.json")


def run_verifier():
    """Harness layer. Offline, no secrets, fast enough for SessionStart."""
    try:
        p = subprocess.run(["node", os.path.join(ROOT, "scripts/company/os_verify.mjs"), "--json"],
                           capture_output=True, text=True, timeout=60)
        return json.loads(p.stdout) if p.stdout.strip() else None
    except Exception as e:
        return {"layer": "harness", "results": [
            {"id": "harness/verifier-runs", "ok": False, "n": 0,
             "detail": f"the verifier itself failed: {e}",
             "fix": "node scripts/company/os_verify.mjs"}],
            "passed": 0, "failed": 0, "empty": 1}


def unknowns():
    """Things asked and unanswered. Read from the dashboard's own UNKNOWN objects so
    there is one definition of 'we do not know this', not two."""
    out = []
    try:
        d = json.load(open(os.path.join(ROOT, "dashboard", "data.json")))
    except Exception:
        return out

    def walk(node, path):
        if isinstance(node, dict):
            if node.get("unknown"):
                out.append({"what": path, "why": node.get("why") or "no source",
                            "fix": node.get("fix")})
                return
            for k, v in node.items():
                walk(v, f"{path}.{k}" if path else k)

    walk(d, "")
    return out[:6]


def load(path):
    try:
        return json.load(open(path))
    except Exception:
        return None


def diff(cur, prev):
    """What changed since the last run. You should never have to re-read a stable wall."""
    if not prev:
        return []
    was = {r["id"]: r for r in prev.get("results", [])}
    out = []
    for r in cur.get("results", []):
        p = was.get(r["id"])
        if not p:
            out.append((r["id"], "new", sym(r)))
        elif sym(p) != sym(r):
            out.append((r["id"], sym(p), sym(r)))
    for rid in was:
        if rid not in {r["id"] for r in cur.get("results", [])}:
            out.append((rid, sym(was[rid]), "gone"))
    return out


def sym(r):
    if r.get("n", 0) == 0:
        return "∅"
    return "✓" if r.get("ok") else "✗"


def render(data, prev, session=False):
    res = data.get("results", [])
    failed = [r for r in res if not r.get("ok") and r.get("n", 0) > 0]
    empty = [r for r in res if r.get("n", 0) == 0]
    blocking = failed + empty
    verdict = "GREEN" if not blocking else ("RED" if failed else "AMBER")
    stamp = data.get("generated_at", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"))

    # Age matters more than the timestamp. health_check.py:230 is the authority:
    # a check that cannot tell "correct" from "current" reports all-clear through
    # an outage. A cached green from yesterday is not a green.
    age = ""
    try:
        t = datetime.strptime(stamp[:19], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
        mins = (datetime.now(timezone.utc) - t).total_seconds() / 60
        age = f"checked {int(mins)}m ago" if mins < 90 else f"STALE — last checked {int(mins/60)}h ago"
    except Exception:
        age = "age unknown"

    L = []
    L.append(f"OS STATUS{' ' * 34}{age}")
    L.append("")
    L.append(f"  {verdict}" + (f" — {len(blocking)} blocking" if blocking else " — nothing blocking"))
    L.append("")

    changes = diff(data, prev)
    if changes:
        L.append("WHAT CHANGED")
        for cid, a, b in changes[:6]:
            L.append(f"  {cid:44s} {a} -> {b}")
        L.append("")

    if blocking:
        L.append("BLOCKING")
        for r in blocking:
            L.append(f"  {sym(r)} {r['id']:44s} n={r.get('n', 0)}")
            L.append(f"      {r.get('detail', '')[:96]}")
            if r.get("fix"):
                L.append(f"      -> {r['fix'][:92]}")
        L.append("")

    unk = unknowns()
    if unk and not session:
        L.append("UNKNOWN — asked, no answer (never rendered as zero)")
        for u in unk:
            L.append(f"  {u['what']:34s} {u['why'][:44]}")
            if u.get("fix"):
                L.append(f"      -> {u['fix'][:88]}")
        L.append("")

    p = len([r for r in res if r.get("ok") and r.get("n", 0) > 0])
    L.append(f"  {len(res)} checks · {len(failed)} failed · {len(empty)} inspected nothing")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--session", action="store_true", help="print the chat block")
    ap.add_argument("--no-run", action="store_true", help="render the last run")
    args = ap.parse_args()

    prev = load(STATUS_JSON)
    data = load(STATUS_JSON) if args.no_run else run_verifier()
    if not data:
        print("no verifier output and no cached run", file=sys.stderr)
        return 1

    text = render(data, prev, session=args.session)

    if not args.no_run:
        if prev:
            os.makedirs(os.path.dirname(PREV_JSON), exist_ok=True)
            json.dump(prev, open(PREV_JSON, "w"), indent=2)
        json.dump(data, open(STATUS_JSON, "w"), indent=2)
        os.makedirs(COMPANY, exist_ok=True)
        with open(STATUS_MD, "w") as fh:
            fh.write("<!-- GENERATED by scripts/company/status_report.py. Do not edit:\n"
                     "     it is regenerated from check output, and a hand-written status\n"
                     "     is exactly the drift this file exists to prevent. -->\n\n```\n")
            fh.write(render(data, prev))
            fh.write("\n```\n")

    print(text)
    blocking = [r for r in data.get("results", []) if not r.get("ok") or r.get("n", 0) == 0]
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
