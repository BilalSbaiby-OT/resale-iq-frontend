"""Scrub credential NAMES from anything written into `dashboard/`.

WHY THIS IS A SHARED MODULE AND NOT A HELPER IN ONE SCRIPT

`scripts/check-agent-isolation.mjs` refuses ANY occurrence of a credential name
anywhere in this repo, because the repo is served to every visitor and a checker
that tries to judge "that's only the variable name, not the value" is one bad
heuristic away from shipping a key. The check is right. The generated files are
what has to change.

It has now bitten twice, in two different writers:

  - `dashboard/data.json` (build_dashboard.py) — the activity ledger records the
    COMMAND an agent ran, verbatim, so a legitimate `$COOLIFY_TOKEN` argument
    landed in build output. **Froze the frontend for 9 commits**: Deploy only
    runs after Agent Isolation passes, and Agent Isolation failed every build.
  - `dashboard/org.json` (org.py) — agent bus messages quote the same names when
    explaining a deploy failure. **Froze it again for 2 more commits**, hours
    after the first fix, because that fix lived inside the other script.

A fix that lives in one writer is not a fix, it is a coincidence that held until
someone added a second writer. So: one regex, one function, applied at the WRITE
BOUNDARY in both — the single place that cannot be forgotten by whoever adds
panel eight.

This scrubs NAMES only. Values must never reach these scripts at all; that is
`.claude/bin/with-secrets.sh`'s job, not this file's.
"""
import json
import os
import re

_CRED_NAMES = re.compile(
    r"\b(COOLIFY_TOKEN|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|RESEND_API_KEY|"
    r"GEMINI_API_KEY|ELEVENLABS_API_KEY|POSTIZ_API_KEY|OPENROUTER_API_KEY|"
    r"GROQ_API_KEY|REDDIT_CLIENT_SECRET|REDDIT_PASSWORD|JWT_SECRET|"
    r"TELEGRAM_BOT_TOKEN|HERMES_TELEGRAM_BOT_TOKEN|ANTHROPIC_API_KEY|"
    r"RIQ_API_KEY|RESALEIQ_API_KEY)\b")

# Agent INFRASTRUCTURE, not credentials. `check-agent-isolation.mjs` refuses these
# anywhere in the repo because everything here is served to visitors, and the
# dashboard payloads embed doc excerpts and agent messages verbatim.
#
# This list MIRRORS INFRA_PATTERNS in scripts/check-agent-isolation.mjs.
# IF YOU ADD ONE THERE, ADD IT HERE. Names were covered and endpoints were not,
# which froze the deploy pipeline for every commit on 2026-09-02 after an
# "openrouter.ai" mention landed in an embedded SESSION.md excerpt.
_INFRA = re.compile(
    r"openrouter\.ai|62\.238\.51\.83:8000|(?<![\w.])/opt/data\b|(?<![\w])\.hermes\b")


def scrub(obj):
    """Replace credential names and agent-infrastructure endpoints anywhere in a
    JSON-shaped structure."""
    if isinstance(obj, str):
        return _INFRA.sub("<AGENT-INFRA>", _CRED_NAMES.sub("<CREDENTIAL>", obj))
    if isinstance(obj, list):
        return [scrub(x) for x in obj]
    if isinstance(obj, dict):
        return {k: scrub(v) for k, v in obj.items()}
    return obj


def write_json(path, data, **kw):
    """The ONLY sanctioned way to write into `dashboard/`.

    Scrubbing at the write boundary rather than per-panel is the whole point: a
    new panel gets this for free, and forgetting to call a helper is exactly how
    org.json repeated data.json's failure.
    """
    kw.setdefault("indent", 2)
    kw.setdefault("ensure_ascii", False)
    os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(scrub(data), fh, **kw)
