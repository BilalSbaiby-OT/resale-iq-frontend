#!/usr/bin/env python3
"""DEPLOY DRIFT — is what is RUNNING what was MERGED?

    python3 scripts/company/deploy_drift.py            human-readable
    python3 scripts/company/deploy_drift.py --json     for the dashboard

Exit 0 when every app serves its repo's `origin/main`. Exit 1 on drift.

WHY THIS EXISTS

On 2026-09-01 two different deploy failures hid behind green CI, in two repos,
in the same day:

  - `resale-iq`: nine commits unshipped. `Deploy` reported **skipped** because
    `Agent Isolation` was failing, and "skipped" reads like *nothing needed
    doing* rather than *blocked*. The CEO read past it nine times.
  - `demand-intel`: four commits unshipped, including a LIVE paid-field leak.
    `Deploy` reported **success** — Coolify had changed its endpoint to require
    POST, the deploy key still issued a GET, every trigger 405'd and queued
    nothing, and CI's only question was "does the API answer?" The old container
    answered happily for two hours.

Both are the same defect: **every check was a PROXY.** Is CI green. Did the push
succeed. Is the API up. None of them asked the only question that matters --
*is the commit that is running the commit we merged?*

A proxy can be green while the thing it stands for is false. This asks directly,
and it is the one check that cannot be satisfied by a no-op.

HOW: Coolify stamps `SOURCE_COMMIT` into each container's environment. That is
the build's own account of itself, read from the running process rather than
from a workflow's opinion of what it did.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

APPS = [
    {"name": "frontend", "repo": ROOT, "match": "p6t87"},
    {"name": "backend", "repo": os.path.join(os.path.dirname(ROOT), "demand-intel"),
     "match": "ph5clxk9"},
]


def sh(cmd, cwd=None, timeout=90):
    try:
        return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True,
                              text=True, timeout=timeout).stdout.strip()
    except Exception:
        return ""


def deployed_commit(match):
    """SOURCE_COMMIT from the RUNNING container. Ground truth, not a claim."""
    name = sh(f"ssh -o ConnectTimeout=15 -o BatchMode=yes resaleiq "
              f"'docker ps --format \"{{{{.Names}}}}\" | grep {match} | head -1'")
    if not name:
        return None, "no running container matched"
    env = sh(f"ssh -o ConnectTimeout=15 -o BatchMode=yes resaleiq "
             f"'docker inspect {name} --format \"{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}\"'")
    for line in env.splitlines():
        if line.startswith("SOURCE_COMMIT="):
            return line.split("=", 1)[1].strip(), name
    return None, f"{name} exposes no SOURCE_COMMIT"


def main():
    out, drifted = [], False
    for app in APPS:
        repo = app["repo"]
        if not os.path.isdir(os.path.join(repo, ".git")):
            out.append({"app": app["name"], "status": "UNKNOWN",
                        "why": f"{repo} is not a git repo"})
            continue

        sh("git fetch -q origin", cwd=repo)
        head = sh("git rev-parse origin/main", cwd=repo)
        live, detail = deployed_commit(app["match"])

        if not live:
            # UNKNOWN, never "fine". An unverifiable deploy must not look like a
            # verified one -- that equivalence is what let this hide for hours.
            out.append({"app": app["name"], "status": "UNKNOWN", "why": detail,
                        "merged": head[:12]})
            drifted = True
            continue

        if live == head:
            out.append({"app": app["name"], "status": "IN SYNC",
                        "commit": live[:12], "container": detail})
            continue

        behind = sh(f"git log --oneline {live}..origin/main", cwd=repo).splitlines()
        out.append({"app": app["name"], "status": "DRIFTED",
                    "running": live[:12], "merged": head[:12],
                    "commits_unshipped": len(behind),
                    "unshipped": [l[:88] for l in behind[:10]],
                    "container": detail})
        drifted = True

    if "--json" in sys.argv:
        print(json.dumps({"drifted": drifted, "apps": out}, indent=2))
        return 1 if drifted else 0

    for a in out:
        if a["status"] == "IN SYNC":
            print(f"  ✓ {a['app']:<9} {a['commit']}  in sync")
        elif a["status"] == "DRIFTED":
            print(f"  ✗ {a['app']:<9} running {a['running']}, merged {a['merged']} "
                  f"— {a['commits_unshipped']} COMMITS NOT DEPLOYED")
            for l in a["unshipped"]:
                print(f"        {l}")
        else:
            print(f"  ? {a['app']:<9} UNKNOWN — {a['why']}")
    if drifted:
        print("\n  Deploy drift. A green CI run is not evidence a deploy happened;")
        print("  this is. See W53/W54 for the two ways it hid today.")
    return 1 if drifted else 0


if __name__ == "__main__":
    sys.exit(main())
