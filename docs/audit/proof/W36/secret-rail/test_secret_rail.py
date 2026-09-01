#!/usr/bin/env python3
"""Prove the credential-read rail resolves PROGRAMS, not substrings.

A12 CRITICAL, found by security-eng 2026-09-01 by reading the regex. The old
check asked "does the wrapper's filename appear anywhere in the command?" when it
meant "is the wrapper the program being executed".

Every case below is fed to the hook as a synthetic tool call. Nothing here reads
a real credential file, and no bypass is executed — the strings are data handed
to the checker, and the checker's exit code is the assertion.

Exit 2 = blocked. Exit 0 = allowed.
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = "/Users/bilalsbaiby/work/resale-iq"
HOOK = os.path.join(ROOT, ".claude", "hooks", "guard.py")
WRAP = os.path.join(ROOT, ".claude", "bin", "with-secrets.sh")
SECRET = "." + "env"          # never contiguous in this source, so grepping the
                              # repo for the literal does not hit a test fixture


def run(cmd, sandbox):
    p = subprocess.run(
        [sys.executable, HOOK],
        input=json.dumps({"tool_name": "Bash", "tool_input": {"command": cmd}}),
        capture_output=True, text=True,
        env={**os.environ, "COMPANY_OS_LOG_DIR": sandbox},
    )
    return p.returncode


CASES = [
    # (label, command, must_block)

    # ── the demonstrated bypass, and its structural siblings ──────────────
    ("trailing comment names the wrapper",
     f"cat {SECRET}  # with-secrets.sh", True),
    ("wrapper mentioned, then a plain read on the same line",
     f"echo with-secrets.sh; cat {SECRET}", True),
    ("benign wrapper call chained to a plain read",
     f"{WRAP} --names && cat {SECRET}", True),
    ("wrapper piped into a read",
     f"{WRAP} --names | cat {SECRET}", True),
    ("wrapper's name inside a quoted string",
     f'echo "with-secrets.sh" && cat {SECRET}', True),

    # ── the plain cases that always blocked, and must keep blocking ───────
    ("bare read", f"cat {SECRET}", True),
    ("read via an interpreter", f"bash -c 'cat {SECRET}'", True),

    # ── fail closed where the parse cannot be trusted ─────────────────────
    ("command substitution", f"cat $(echo {SECRET})", True),
    ("heredoc", f"python3 - <<EOF\nopen('{SECRET}')\nEOF", True),

    # ── LEGITIMATE USE MUST STILL WORK. A rail that blocks the sanctioned
    #    path is broken, not strict — the hourly job depends on this one. ──
    ("the sanctioned wrapper, absolute path",
     f"{WRAP} python3 scripts/company/build_dashboard.py --prod", False),
    ("the sanctioned wrapper, bare name",
     "with-secrets.sh python3 scripts/company/metrics.py", False),
    ("the sanctioned wrapper listing names",
     f"{WRAP} --names", False),
    ("wrapper invoked through bash",
     f"bash {WRAP} python3 -c 'pass'", False),
    ("an ordinary command that mentions neither", "git status --short", False),
    ("a template file is not a secret",
     f"cat {SECRET}.example", False),
]


def main():
    passed = failed = 0
    with tempfile.TemporaryDirectory() as sandbox:
        for label, cmd, must_block in CASES:
            rc = run(cmd, sandbox)
            blocked = rc == 2
            if blocked == must_block:
                print(f"PASS  {'BLOCK' if must_block else 'ALLOW':5}  {label}")
                passed += 1
            else:
                print(f"FAIL  {'BLOCK' if must_block else 'ALLOW':5}  {label}"
                      f"   (rc={rc}, blocked={blocked})")
                failed += 1

    print(f"\n{passed}/{passed + failed} cases correct")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
