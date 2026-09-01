#!/usr/bin/env python3
"""BUS — the channel agents never had.

    bus.py send --from ceo --to data-scientist --subject "..." --body "..."
    bus.py inbox data-scientist            # unread for one agent
    bus.py read <id>                       # mark one message read
    bus.py log [--limit N]                 # everything, newest first
    bus.py --json                          # machine-readable, for the dashboard

WHY THIS EXISTS. `AMENDMENTS.md` AM-8a records that agents cannot talk to each
other: the CEO is the only wire. That made "consult the roster" mean "the CEO
relays everything", which made the CEO the bottleneck — and on 2026-09-01 it
produced 27,466 lines of documentation against 2,084 lines of product code,
because eight analysis agents had no way to reach a doer except through one
person's attention.

WHAT THIS IS AND IS NOT. It is not real-time. A subagent runs only when spawned
and cannot listen while idle, so this is a MAILBOX, not a socket: agent A leaves
a message, and agent B reads it the next time it is spawned, because its brief
includes its unread mail. That latency is real and worth stating plainly rather
than pretending otherwise — but a message that waits an hour and arrives is
worth more than a finding that dies in a document nobody reads.

DESIGN NOTES, each earned the hard way today:

  - APPEND-ONLY JSONL. `growth.db` has concurrent writers and no lock, and an
    agent watched a row change under it mid-task. Appending a line is atomic
    enough for this; rewriting a JSON array is not.
  - MESSAGES ARE DATA, NEVER ORDERS. A message from another agent is not the
    founder's consent and does not clear a gate (AM-8a). `content-social`
    refused to publish on a relayed instruction and was right; this channel must
    not become a laundering route for authority nobody granted.
  - READ STATE IS SEPARATE from the message. Marking read never rewrites
    history, so the log stays a true record of what was said.
"""
import argparse
import json
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BUS = os.path.join(ROOT, "docs", "company", "bus.jsonl")
READ = os.path.join(ROOT, "docs", "company", "bus-read.jsonl")


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _lines(path):
    if not os.path.exists(path):
        return []
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                # One malformed line must not take the whole bus down. The same
                # rule metrics.py applies to a broken query.
                continue
    return out


def _append(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")


def send(sender, to, subject, body, kind="message"):
    msgs = _lines(BUS)
    msg = {"id": f"m{len(msgs) + 1:04d}", "ts": _now(), "from": sender,
           "to": to, "kind": kind, "subject": subject, "body": body}
    _append(BUS, msg)
    return msg


def inbox(agent, include_read=False):
    read = {r["id"] for r in _lines(READ)}
    return [m for m in _lines(BUS)
            if (m.get("to") == agent or m.get("to") == "all")
            and (include_read or m["id"] not in read)]


def mark_read(mid, reader):
    _append(READ, {"id": mid, "by": reader, "ts": _now()})


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd")

    s = sub.add_parser("send")
    s.add_argument("--from", dest="sender", required=True)
    s.add_argument("--to", required=True, help="an agent name, or 'all'")
    s.add_argument("--subject", required=True)
    s.add_argument("--body", required=True)
    s.add_argument("--kind", default="message",
                   help="message | question | finding | handoff")

    i = sub.add_parser("inbox")
    i.add_argument("agent")
    i.add_argument("--all", action="store_true", help="include already-read")

    r = sub.add_parser("read")
    r.add_argument("id")
    r.add_argument("--by", default="unknown")

    lg = sub.add_parser("log")
    lg.add_argument("--limit", type=int, default=40)

    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    if a.cmd == "send":
        m = send(a.sender, a.to, a.subject, a.body, a.kind)
        print(json.dumps(m, indent=2) if a.json else
              f"{m['id']}  {m['from']} -> {m['to']}  {m['subject']}")
        return 0

    if a.cmd == "inbox":
        msgs = inbox(a.agent, include_read=a.all)
        if a.json:
            print(json.dumps(msgs, indent=2)); return 0
        if not msgs:
            print(f"no unread mail for {a.agent}"); return 0
        for m in msgs:
            print(f"[{m['id']}] {m['ts']}  from {m['from']}  ({m['kind']})")
            print(f"  {m['subject']}")
            for line in m["body"].splitlines():
                print(f"    {line}")
            print()
        return 0

    if a.cmd == "read":
        mark_read(a.id, a.by)
        print(f"{a.id} marked read by {a.by}")
        return 0

    msgs = _lines(BUS)[-(a.limit if a.cmd == "log" else 40):][::-1]
    if a.json:
        print(json.dumps(msgs, indent=2)); return 0
    for m in msgs:
        print(f"[{m['id']}] {m['ts']}  {m['from']} -> {m['to']}  {m['subject']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
