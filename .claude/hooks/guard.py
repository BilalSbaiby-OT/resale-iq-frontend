#!/usr/bin/env python3
"""PreToolUse guard — Resale IQ Company OS, Phase 0 rails (docs/company/OS.md §8).

Exit 2 blocks the call and shows stderr to the model. Exit 0 allows.
Every block is appended to docs/company/SECURITY-LOG.md.

This file is protected: editing it requires .claude/UNLOCK_HARNESS (founder gate).
"""
import json
import os
import re
import shlex
import sys
from datetime import datetime, timezone

ROOT = "/Users/bilalsbaiby/work/resale-iq"
UNLOCK = os.path.join(ROOT, ".claude", "UNLOCK_HARNESS")
# COMPANY_OS_LOG_DIR lets proof.sh exercise the rails without writing to the
# live ledger. It changes where we log, never what we block.
LOG = os.path.join(os.environ.get("COMPANY_OS_LOG_DIR") or os.path.join(ROOT, "docs", "company"),
                   "SECURITY-LOG.md")

# Paths only the founder (or an explicitly unlocked session) may change.
PROTECTED = (
    ".claude/settings.json",
    ".claude/settings.local.json",
    ".claude/hooks/",
    ".claude/agents/",
    "docs/company/OS.md",
    "docs/company/METRICS.md",
    "docs/company/SCOREBOARD.md",
    "docs/audit/MATCH-AUDIT.md",
    "docs/audit/CALIBRATION.md",
    # Generated from check output. A hand-written status is precisely the drift
    # these files exist to prevent, so nobody gets to type into them.
    "docs/company/STATUS.md",
    "dashboard/status.json",
    "docs/company/CHECKS.md",
)

# Anything outside these trees is out of scope for every agent.
SCOPE = (
    "/Users/bilalsbaiby/work/resale-iq",
    "/Users/bilalsbaiby/work/demand-intel",
    "/Users/bilalsbaiby/work/resale-iq-growth",
    "/Users/bilalsbaiby/work/resale-iq-seo",
    "/Users/bilalsbaiby/.claude/projects/-Users-bilalsbaiby-Desktop/memory",
    # The session actually roots at ~/work, so memory lives under the -work
    # project key. The Desktop entry above points at an empty directory and
    # silently blocked every memory write. Same stale Desktop-vs-work path as
    # the GSC credential config (APPROVALS A9). Both kept -- removing the
    # Desktop one would be a rule change, and this is a bug fix.
    "/Users/bilalsbaiby/.claude/projects/-Users-bilalsbaiby-work/memory",
    "/private/tmp/claude-501",
    "/tmp/claude-501",
    # Written from what I imagined the work would touch, never checked against what
    # the harness actually needs. ~/Desktop is where the CEO session roots, so Read on
    # the settings file governing that session was blocked; ~/.claude/plans is where
    # plan mode writes, so the rails blocked the plan describing this very fix.
    "/Users/bilalsbaiby/Desktop",
    "/Users/bilalsbaiby/work",
    "/Users/bilalsbaiby/.claude/plans",
)

SECRET = re.compile(
    r"(^|/)\.env(\.local|\.production|\.development)?$|"
    r"(^|/)id_(rsa|ed25519)|\.pem$|(^|/)credentials\.json$|service[-_]account.*\.json$",
    re.I,
)
SECRET_OK = re.compile(r"\.env\.(example|sample|template)$", re.I)

POST_HOSTS_OK = ("localhost", "127.0.0.1", "resaleiq.dev", "62.238.51.83", "0.0.0.0")

RM_SAFE = ("scratchpad", "node_modules", ".next", "test-results", "/private/tmp/", "tsconfig.tsbuildinfo")


# ── Is the sanctioned wrapper the program being RUN, or just text in the line? ──
#
# The old check asked "does the wrapper's filename appear anywhere in the command?"
# when it meant "is the wrapper the program being executed". Those are different
# questions, and the gap between them was a CRITICAL bypass: a trailing shell
# comment naming the wrapper satisfied the first without ever satisfying the
# second. So did chaining -- a benign wrapper call, `&&`, then a plain read.
#
# Found by security-eng, 2026-09-01, by reading. Never demonstrated against a
# real credential, and it must not be.
#
# The honest ceiling, recorded rather than pretended away (same spirit as the
# heredoc note further down): no text tokenizer catches a path assembled at
# runtime, because the pre-filter never fires on a string that is never
# contiguous. This closes the demonstrated hole and its structural siblings. It
# is defence-in-depth, NOT a boundary. The boundary is that nothing outside the
# wrapper needs these files at all.
SANCTIONED = os.path.realpath(os.path.join(ROOT, ".claude", "bin", "with-secrets.sh"))
INTERPRETERS = {"bash", "sh", "zsh", "dash", "env"}
CONTROL_OPS = {"&&", "||", "|", ";", "&", "(", ")", "{", "}"}


def _resolve_program(token):
    """A token's real identity on disk, not its spelling."""
    if token == os.path.basename(SANCTIONED):
        return SANCTIONED          # the bare name means OUR script, never $PATH
    p = token if os.path.isabs(token) else os.path.join(ROOT, token)
    return os.path.realpath(p)


def _segments(c):
    """Split a command into top-level segments, or None if we cannot be sure.

    shlex's default `commenters='#'` drops comments during tokenising, so the
    comment bypass stops existing rather than being special-cased.

    Returns None for command substitution and heredocs: shlex SILENTLY
    MIS-SPLITS those rather than raising, and acting on a mangled parse is worse
    than refusing to answer.
    """
    if "$(" in c or "`" in c or "<<" in c:
        return None
    try:
        lex = shlex.shlex(c, posix=True, punctuation_chars=True)
        lex.whitespace_split = True
        tokens = list(lex)
    except ValueError:
        return None
    out, cur = [], []
    for tok in tokens:
        if tok in CONTROL_OPS:
            if cur:
                out.append(cur)
            cur = []
        else:
            cur.append(tok)
    if cur:
        out.append(cur)
    return out


def _runs_sanctioned(seg):
    """Does THIS segment execute the wrapper as its program?"""
    if not seg:
        return False
    i = 0
    if os.path.basename(seg[0]).lower() in INTERPRETERS:
        i = 1
        while i < len(seg) and (re.match(r"^[A-Za-z_]\w*=", seg[i]) or seg[i].startswith("-")):
            i += 1
    return i < len(seg) and _resolve_program(seg[i]) == SANCTIONED


def _touches_secret(seg):
    return any(re.search(r"\.env\b", t) and not re.search(r"\.env\.(example|sample|template)", t)
               for t in seg)


def log(reason, tool, detail, label="BLOCKED"):
    """label distinguishes a refusal from a sanctioned action. An audit trail that
    calls an allowed deploy 'BLOCKED' teaches its reader to distrust it."""
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    if not os.path.exists(LOG):
        with open(LOG, "w") as fh:
            fh.write("# SECURITY-LOG\n\nEvery blocked call and every tripwire hit. "
                     "Written by hooks only.\n\n")
    with open(LOG, "a") as fh:
        fh.write(f"- `{stamp}` **{label}** {tool} — {reason} — `{detail[:300]}`\n")


def block(reason, tool, detail, remedy):
    log(reason, tool, detail)
    sys.stderr.write(
        f"BLOCKED by Company OS rails: {reason}\n"
        f"Logged to docs/company/SECURITY-LOG.md.\n"
        f"{remedy}\n"
    )
    sys.exit(2)


MUTATING = ("Edit", "Write", "NotebookEdit", "MultiEdit")


def check_paths(tool, paths):
    unlocked = os.path.exists(UNLOCK)
    for p in paths:
        if not p:
            continue
        ap = os.path.abspath(os.path.expanduser(p))
        if SECRET.search(ap) and not SECRET_OK.search(ap):
            block("secret file (.env / key / credential)", tool, ap,
                  "Never read or write secrets. Ask the founder to supply what you need.")
        for prot in PROTECTED:
            if ap.replace("\\", "/").endswith(prot.rstrip("/")) or f"/{prot}" in ap.replace("\\", "/"):
                # Read freely, write gated. Blocking reads made the constitution
                # unreadable to the agents told to read it, and pushed them into
                # `cat`, which the Bash path did not check. Found by the Phase 1
                # HARNESS and SECURITY audits, 2026-08-31.
                if tool in MUTATING and not unlocked:
                    block(f"protected harness path ({prot})", tool, ap,
                          "This is a founder gate (OS §0.10). Park the change in "
                          "docs/company/APPROVALS.md. To proceed deliberately, the founder "
                          "creates .claude/UNLOCK_HARNESS with a one-line reason.")
        if not any(ap.startswith(s) for s in SCOPE):
            block("path outside company scope", tool, ap,
                  "Scope is resale-iq, demand-intel, resale-iq-growth, resale-iq-seo, "
                  "the memory dir and the scratchpad. Nothing else.")


def check_bash(cmd):
    c = " ".join(cmd.split())
    low = c.lower()

    # Secrets: USE them, never SEE them. `.claude/bin/with-secrets.sh` sources the env
    # files into a child process and scrubs every value out of stdout/stderr, so an agent
    # can write $STRIPE_SECRET_KEY and get Stripe data back without the key ever reaching
    # a transcript. Any other route to a .env file stays blocked.
    # Founder instruction 2026-08-31: "get access yourself, the APIs are in env."
    if re.search(r"\.env\b", c) and not re.search(r"\.env\.(example|sample|template)", c):
        segs = _segments(c)
        if segs is None:
            block("secret reference in a command this hook cannot parse safely", "Bash", c,
                  "Command substitution and heredocs cannot be checked reliably. "
                  "Rewrite it as a plain command, or route it through "
                  ".claude/bin/with-secrets.sh.")
        # PER SEGMENT: the wrapper appearing earlier in the line does not sanction
        # a later plain read.
        if any(_touches_secret(seg) and not _runs_sanctioned(seg) for seg in segs):
            block("direct read of a .env file", "Bash", c,
                  "Do not read secrets — use them. Route the call through "
                  ".claude/bin/with-secrets.sh, which puts the values in the child "
                  "process and scrubs them out of the output. "
                  "`with-secrets.sh --names` lists what is available.")

    # Defence-in-depth only, and deliberately narrow. The real protection is the
    # scrubber inside with-secrets.sh; outside it these variables are not even set.
    # So fire on exactly one shape: a secret handed straight to echo/printf/printenv.
    # (An earlier, wider version matched any echo sharing a line with a secret var,
    # which blocked ordinary work — a deny rule that also blocks the benign case is
    # broken, not strict.)
    if re.search(r"\b(echo|printf|printenv)\s+[\"']?\$\{?[A-Za-z_]*"
                 r"(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL)", c):
        block("would print a secret value into the transcript", "Bash", c,
              "Pass the variable to the command that needs it; never echo it.")

    if re.search(r"\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s", c) and not any(s in c for s in RM_SAFE):
        block("recursive/forced delete outside safe dirs", "Bash", c,
              "Delete deliberately, one path at a time, inside the repo.")

    if re.search(r"\bgit\s+push\b.*(--force|--force-with-lease|\s-f\b)", c):
        block("git push --force", "Bash", c, "Force-push is never sanctioned. Open a branch instead.")

    # A push to main deploys production. Blocked by default; lifted ONLY by an
    # explicit, deliberately-written token carrying the founder's approval, which is
    # deleted straight after the deploy. Never lift this on your own judgement.
    if re.search(r"\bgit\s+push\b", c) and re.search(r"\b(main|master|HEAD:main)\b", c) \
            and not os.path.exists(os.path.join(ROOT, ".claude", "DEPLOY_APPROVED")):
        block("push to main = PRODUCTION DEPLOY", "Bash", c,
              "agent/GUARDRAILS.md: a push to main deploys resaleiq.dev. Founder gate. "
              "Push a branch instead, and park the deploy in docs/company/APPROVALS.md.")

    if re.search(r"\bgit\s+push\s*$", c) or re.search(r"\bgit\s+push\s+origin\s*$", c):
        block("bare git push may deploy main", "Bash", c,
              "Name the branch explicitly: git push origin <branch>.")

    if re.search(r"(curl|wget)[^|]*\|\s*(sudo\s+)?(ba)?sh", low):
        block("pipe-to-shell from the network", "Bash", c, "Download, read, then run deliberately.")

    if re.search(r"\b(drop\s+table|drop\s+database|truncate\s+table)", low):
        block("destructive SQL (DROP/TRUNCATE)", "Bash", c,
              "Destructive SQL is a founder gate (OS §0.10).")

    for verb in ("delete from", "update "):
        for m in re.finditer(verb, low):
            tail = low[m.start():m.start() + 400]
            if verb == "update " and " set " not in tail:
                continue
            if " where " not in tail:
                block(f"{verb.strip().upper()} without WHERE", "Bash", c,
                      "Add a WHERE clause. Unbounded writes are a founder gate.")

    if re.search(r"api\.stripe\.com", low) and re.search(r"-x\s*(post|delete|put)|--data|-d\s", low):
        block("Stripe write", "Bash", c, "Agents hold a read-only Stripe key. Founder does writes.")

    if re.search(r"\bgh\s+(repo\s+edit|release\s+create|workflow\s+run|secret\s+set)", low):
        block("publish/deploy via gh", "Bash", c,
              "Deploys and releases are founder gates. Park it in APPROVALS.md.")

    # The Bash path never checked PROTECTED, so a shell redirect walked straight
    # around the Edit/Write gate. Catch shell writes: redirects, in-place sed, tee,
    # and cp/mv/rm onto a protected path. Reads (cat/sed -n/grep) still pass.
    # KNOWN LIMIT: a heredoc'd interpreter (python3 - <<EOF) that opens a protected
    # path for writing is NOT caught. Recorded rather than pretended away.
    if not os.path.exists(UNLOCK):
        for prot in PROTECTED:
            stem = prot.rstrip("/")
            if stem not in c:
                continue
            esc = re.escape(stem)
            if (re.search(r">>?\s*\S*" + esc, c)
                    or re.search(r"\b(tee|sed\s+-i|cp|mv|install|ln)\b[^|;&]*" + esc, c)
                    or re.search(r"\brm\b[^|;&]*" + esc, c)):
                block("shell write to a protected harness path (" + stem + ")", "Bash", c,
                      "Read it freely; changing it is a founder gate (OS 0.10). Park the "
                      "change in docs/company/APPROVALS.md, or the founder creates "
                      ".claude/UNLOCK_HARNESS with a one-line reason.")

    if "chmod 777" in low:
        block("chmod 777", "Bash", c, "Use the narrowest mode that works.")

    if re.search(r"(curl|wget|http)", low) and re.search(r"-x\s*(post|put|delete)|--data|-d\s+['\"]", low):
        hosts = re.findall(r"https?://([A-Za-z0-9\.\-:]+)", c)
        for h in hosts:
            host = h.split(":")[0]
            if not any(host == a or host.endswith("." + a) for a in POST_HOSTS_OK):
                block(f"POST/PUT/DELETE to a non-allowlisted host ({host})", "Bash", c,
                      "Egress allowlist: localhost, resaleiq.dev, the Hetzner IP. Nothing else.")


def main():
    try:
        ev = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    tool = ev.get("tool_name", "")
    ti = ev.get("tool_input", {}) or {}

    if tool == "Bash":
        cmd = ti.get("command", "") or ""
        approved = os.path.join(ROOT, ".claude", "DEPLOY_APPROVED")
        if re.search(r"\bgit\s+push\b", cmd) and re.search(r"\bmain\b", cmd) \
                and os.path.exists(approved):
            # An allowed deploy is as worth recording as a blocked one.
            try:
                reason = open(approved).read().strip().splitlines()[0][:160]
            except OSError:
                reason = "(token unreadable)"
            log("authorised by .claude/DEPLOY_APPROVED — " + reason, "Bash", cmd,
                label="DEPLOY ALLOWED")
        check_bash(cmd)
    elif tool in ("Read", "Edit", "Write", "NotebookEdit", "MultiEdit"):
        paths = [ti.get("file_path") or ti.get("notebook_path") or ""]
        for e in ti.get("edits", []) or []:
            if isinstance(e, dict) and e.get("file_path"):
                paths.append(e["file_path"])
        check_paths(tool, paths)
    sys.exit(0)


if __name__ == "__main__":
    main()
