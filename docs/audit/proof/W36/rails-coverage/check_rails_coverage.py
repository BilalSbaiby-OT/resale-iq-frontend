#!/usr/bin/env python3
"""Do the rails actually fire in every repo the company owns?

`verifier`'s requirement, 2026-09-01, arrived at by auditing its own scope:

    "The proof passed while testing one quarter of its subject.
     That is exactly the failure mode I exist to catch."

`docs/audit/proof/W36/phase0/proof.sh` certifies the deny rules at 40/40 — and
every one of those 40 runs `guard.py` directly, which proves the LOGIC is right
and proves nothing about whether a session in `demand-intel` ever reaches it.
`OS-COMPLIANCE.md` read "Phase 0 rails DONE" on the strength of that.

This file asks the other half of the question: for each repo, is the hook WIRED?

THIS PROOF IS EXPECTED TO FAIL until APPROVALS A12's rollout lands. That is the
intended state. A proof that goes green by not asking is what produced the wrong
headline in the first place; the useful outcome here is either colour, and the
one thing that is not useful is not asking.

It reads configuration and runs the hook against synthetic input. It touches no
credential, no production system, and no network.
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = "/Users/bilalsbaiby/work/resale-iq"
HOOK = os.path.join(ROOT, ".claude", "hooks", "guard.py")
REPOS = [
    ("resale-iq", os.path.join(os.path.dirname(ROOT), "resale-iq")),
    ("demand-intel", os.path.join(os.path.dirname(ROOT), "demand-intel")),
    ("resale-iq-growth", os.path.join(os.path.dirname(ROOT), "resale-iq-growth")),
    ("resale-iq-seo", os.path.join(os.path.dirname(ROOT), "resale-iq-seo")),
]

# Deploy risk is not evenly spread, and the report should say so rather than
# treating four repos as four equal rows.
DEPLOYS_PRODUCTION = {"demand-intel", "resale-iq"}


def settings_wires_guard(repo_path):
    """Does this repo's settings.json route PreToolUse through guard.py?"""
    p = os.path.join(repo_path, ".claude", "settings.json")
    if not os.path.exists(p):
        return False, "no .claude/settings.json"
    try:
        cfg = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        return False, f"settings.json unreadable: {e}"
    hooks = (cfg.get("hooks") or {}).get("PreToolUse") or []
    blob = json.dumps(hooks)
    if "guard.py" in blob:
        return True, "PreToolUse routes through guard.py"
    if hooks:
        return False, f"has {len(hooks)} PreToolUse entr(y/ies), none referencing guard.py"
    return False, "no PreToolUse hooks at all"


def permissions_allow_broad_reads(repo_path):
    """A blanket read allowance next to an unwired hook is worse than unguarded."""
    p = os.path.join(repo_path, ".claude", "settings.json")
    if not os.path.exists(p):
        return False, ""
    try:
        cfg = json.load(open(p, encoding="utf-8"))
    except Exception:
        return False, ""
    allow = json.dumps((cfg.get("permissions") or {}).get("allow") or [])
    deny = (cfg.get("permissions") or {}).get("deny") or []
    broad = [t for t in ("Bash(cat*)", "Bash(curl*)") if t in allow]
    if broad and not deny:
        return True, f"allows {', '.join(broad)} with NO deny list"
    return False, ""


def hook_blocks_a_known_bad_command(sandbox):
    """Sanity: the hook itself still refuses something it must refuse.

    Not a per-repo fact — guard.py hardcodes its own ROOT, so it behaves the same
    however it is invoked. Included so a broken hook cannot make every repo look
    'unwired' for the wrong reason.
    """
    payload = {"tool_name": "Bash",
               "tool_input": {"command": "git push --force origin main"}}
    p = subprocess.run([sys.executable, HOOK], input=json.dumps(payload),
                       capture_output=True, text=True,
                       env={**os.environ, "COMPANY_OS_LOG_DIR": sandbox})
    return p.returncode == 2


def main():
    print("proof: rails-coverage (APPROVALS A12)")
    print("  asks: is guard.py WIRED in each repo — not merely correct where it runs\n")

    with tempfile.TemporaryDirectory() as sandbox:
        if not hook_blocks_a_known_bad_command(sandbox):
            print("FAIL  guard.py did not block a force-push — the hook itself is broken")
            return 1
        print("PASS  guard.py itself still blocks a known-bad command\n")

    wired = unwired = 0
    for name, path in REPOS:
        if not os.path.isdir(path):
            print(f"SKIP  {name:<18} not present on this machine")
            continue
        ok, why = settings_wires_guard(path)
        risk = "  ← main DEPLOYS PRODUCTION" if name in DEPLOYS_PRODUCTION else ""
        if ok:
            print(f"PASS  {name:<18} {why}")
            wired += 1
        else:
            print(f"FAIL  {name:<18} {why}{risk}")
            unwired += 1
        broad, detail = permissions_allow_broad_reads(path)
        if broad and not ok:
            print(f"      {'':<18} and worse: {detail} — an allowance with no hook "
                  f"behind it is weaker than no configuration at all")

    total = wired + unwired
    print(f"\n{wired}/{total} repos have the rails wired")
    if unwired:
        print("\nEXPECTED FAILURE until APPROVALS A12's rollout lands.")
        print("OS-COMPLIANCE.md was corrected DONE -> PARTIAL on 2026-09-01 to match this.")
        print("Do not make this pass by deleting the assertion.")
    return 0 if unwired == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
