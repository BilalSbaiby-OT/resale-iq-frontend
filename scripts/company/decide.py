#!/usr/bin/env python3
"""The reasoning layer. Runs on the production host, hourly, with no session open.

`observe.py` measures and escalates on fixed thresholds. It cannot notice anything
nobody wrote a rule for. This reads the same state and REASONS about it.

Why this exists at all, and why it took so long: the company's documentation said
autonomy was blocked on a credential the founder had to buy -- "OpenRouter 402,
Groq 403". Measured 2026-09-02:

    openrouter GET  /api/v1/key        200   limit_remaining 29.78   <- a per-key
    openrouter GET  /api/v1/credits    total_credits 20, usage 20.221   SPEND CAP,
    openrouter POST /chat/completions  402 Insufficient credits         not a balance
    groq       POST /chat/completions  200   "INFERENCE PROVEN / 391"
    gemini     POST 3.7-flash          200   "INFERENCE PROVEN / 391"

So the 402 was real (the account is overdrawn by EUR 0.22) and the 403 was not.
Two working layers existed the whole time and nobody tried a completion. Gemini is
primary here because its host was ALREADY on the egress allowlist for image work,
and because 3.7-flash returns real thinking tokens; Groq is the fallback.

DESIGN RULES, each one paid for by a specific past failure:

  - The model sees ONLY measured fields. It is never asked to recall or estimate.
  - A null is UNKNOWN and must never be rendered as zero. A zero reads as a
    measurement; a null reads as a gap. That distinction is the difference between
    a real revenue alarm and the Stripe test-mode one.
  - Every number the model emits is CHECKED against the state before it is sent.
    A number that does not appear in the input is dropped and the escalation is
    marked unverified. The model may reason; it may not manufacture evidence.
  - It DECIDES and ESCALATES. It does not act on production. Unattended writes to
    a live system are a separate decision the founder has not been asked for.
  - Escalation is deduplicated against the last one sent. An alert that fires
    every hour is noise, and noise is how a real alert gets ignored.
  - If both providers fail, it logs UNKNOWN and stays silent rather than inventing
    a judgement. Silence is honest; a fabricated brief is not.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone

STATE = "/app/state/company_state.json"
DECISION = "/app/state/last_decision.json"
TIMEOUT = 90

GEMINI_MODEL = "gemini-3.7-flash"
GROQ_MODEL = "qwen/qwen3.8-27b"
# Zero credit cost -- ":free" models do not bill against the (overdrawn) balance.
OPENROUTER_MODEL = "minimax/minimax-m3:free"


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(msg):
    print(f"{now()} decide: {msg}", flush=True)


# ─────────────────────────────────────────────────────────── providers

# Cloudflare in front of Groq refuses the default "Python-urllib/3.x" agent with a
# flat 403. That single missing header is the entire documented "GROQ_API_KEY 403
# Forbidden" blocker -- recorded in AUTONOMY.md as a dead credential and believed
# for days. Measured 2026-09-02 from the production host, same key, same endpoint:
#   default urllib UA -> 403 Forbidden
#   a real UA         -> 200
# This company already paid for this exact lesson once, when a marketing email got
# a Cloudflare 403 from urllib while the app itself used httpx and worked fine.
UA = "Mozilla/5.0 (compatible; ResaleIQ-decide/1.0; +https://resaleiq.dev)"


def _post(url, payload, headers):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json",
                                          "User-Agent": UA, **headers})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode())


def ask_gemini(prompt):
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        return None, "GEMINI_API_KEY absent"
    try:
        d = _post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
            {"contents": [{"parts": [{"text": prompt}]}],
             "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1400}},
            {"x-goog-api-key": key})
        return d["candidates"][0]["content"]["parts"][0]["text"], None
    except Exception as e:  # noqa: BLE001 - any failure must fall through to Groq
        return None, f"gemini: {type(e).__name__} {str(e)[:120]}"


def ask_groq(prompt):
    key = os.environ.get("GROQ_API_KEY", "")
    if not key:
        return None, "GROQ_API_KEY absent"
    try:
        d = _post("https://api.groq.com/openai/v1/chat/completions",
                  {"model": GROQ_MODEL, "temperature": 0.2, "max_tokens": 1400,
                   "messages": [{"role": "user", "content": prompt}]},
                  {"Authorization": f"Bearer {key}"})
        return d["choices"][0]["message"]["content"], None
    except Exception as e:  # noqa: BLE001
        return None, f"groq: {type(e).__name__} {str(e)[:120]}"


def ask_openrouter(prompt):
    """OpenRouter's FREE tier. The paid account is overdrawn (total_credits 20,
    total_usage 20.221) so ordinary models return 402 -- but 18 models carry a
    ':free' suffix and cost nothing against credits. The founder was right that
    "openrouter have a lot of free tokens"; nobody had looked.
    """
    key = os.environ.get("OPENROUTER_API_KEY", "")
    if not key:
        return None, "OPENROUTER_API_KEY absent"
    try:
        d = _post("https://openrouter.ai/api/v1/chat/completions",
                  {"model": OPENROUTER_MODEL, "temperature": 0.2, "max_tokens": 1400,
                   "messages": [{"role": "user", "content": prompt}]},
                  {"Authorization": f"Bearer {key}"})
        return d["choices"][0]["message"]["content"], None
    except Exception as e:  # noqa: BLE001
        return None, f"openrouter: {type(e).__name__} {str(e)[:120]}"


def reason(prompt):
    """Gemini, then Groq, then OpenRouter's free tier. Returns (text, provider).

    Three independent vendors, none of which bills us: Gemini on the founder's
    existing key, Groq's free tier, and OpenRouter ':free' models. Never raises --
    if all three are unreachable the caller stays silent rather than inventing.
    """
    for name, fn in (("gemini", ask_gemini), ("groq", ask_groq),
                     ("openrouter-free", ask_openrouter)):
        text, err = fn(prompt)
        if text:
            return text, name
        log(f"provider {name} unavailable -- {err}")
    return None, None


# ─────────────────────────────────────────────────────────── prompt

PROMPT = """You are the reasoning layer of Resale IQ, a Vinted resale-pricing SaaS.
Goal: EUR 2,000 MRR by 2026-12-31. Today is {today}. Current MRR is EUR {mrr}.

Below is the ONLY information you have. It was measured by a script minutes ago.

MEASURED STATE (now):
{now_block}

PREVIOUS READING (for movement):
{prev_block}

THRESHOLD ALERTS THAT FIRED: {alerts}

HARD RULES:
- A field showing null is UNKNOWN. Never describe a null as zero. If something you
  want to reason about is null, say it is unmeasured.
- Do NOT invent numbers. Use only figures that appear above, verbatim.
- Do not recommend lowering a threshold or a quality gate to make a number look
  better. That is manufacturing proof and it is forbidden here.
- "sold" is wrong; these are watched departures.
- Escalating costs the founder's attention. He has asked for ONE update a day.
  Escalate ONLY for something that genuinely cannot wait: money appearing or
  disappearing, the product no longer answering, or the data asset stalling.

Answer with ONLY a JSON object, no markdown fence:
{{"headline": "<one sentence, what matters most right now>",
  "why": "<2-3 sentences, citing figures from above>",
  "next_action": "<the single most valuable next action, concrete>",
  "escalate": <true|false>,
  "escalation_text": "<if escalate, <=300 chars for Telegram; else empty>",
  "unknowns": ["<what you could not judge because it was null or absent>"]}}"""


def build(state):
    n = state.get("now") or {}
    p = state.get("previous") or {}
    keep = ("paying", "users", "mrr_eur", "signups_24h", "visitors_24h",
            "reached_register_24h", "checks_24h", "actionable_pct",
            "brand_average_24h", "deadend_24h", "crawl_runs_24h",
            "crawl_avg_seconds", "listings", "disk_pct")

    def block(d):
        if not d:
            return "  (no reading)"
        return "\n".join(f"  {k}: {json.dumps(d.get(k))}" for k in keep if k in d)

    return PROMPT.format(today=now()[:10], mrr=n.get("mrr_eur", "UNKNOWN"),
                         now_block=block(n), prev_block=block(p),
                         alerts=json.dumps(state.get("alerts") or []) or "none")


# ─────────────────────────────────────────────── anti-fabrication check

NUM = re.compile(r"\d+(?:[.,]\d+)?")


def unsupported_numbers(text, state):
    """Return figures the model used that do not appear in the measured state.

    The model is allowed to reason; it is not allowed to introduce evidence. This
    is the guard against a confident brief built on an invented figure -- the exact
    failure this company has paid for more than once.
    """
    haystack = json.dumps(state)
    present = set(NUM.findall(haystack))
    # Round-trip float forms too: 70.8 may appear as 70.80000000000001 upstream.
    for v in list(present):
        try:
            present.add(str(int(float(v.replace(",", ".")))))
        except ValueError:
            # why: v came from a regex over JSON, so a token like "1.2.3" is not a
            # number at all. It simply contributes no integer form to compare
            # against. Nothing failed and there is nothing to report.
            pass
    bad = []
    for tok in NUM.findall(text):
        t = tok.replace(",", ".")
        if tok in present or t in present:
            continue
        try:
            f = float(t)
        except ValueError:
            # why: an unparseable token cannot be a fabricated FIGURE, which is the
            # only thing this function looks for. Skipping it is the correct answer,
            # not a swallowed failure. Erring here would block honest briefs.
            continue
        # Years, small ordinals and percentages-of-100 are rhetoric, not evidence.
        if f in (0, 1, 2, 3, 100) or 2020 <= f <= 2100:
            continue
        if any(abs(f - float(x.replace(",", "."))) < 0.05
               for x in present if NUM.fullmatch(x)):
            continue
        bad.append(tok)
    return sorted(set(bad))


# ─────────────────────────────────────────────────────────── telegram

def telegram(text):
    tok = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not (tok and chat):
        log("telegram not configured -- escalation NOT delivered")
        return False
    try:
        _post(f"https://api.telegram.org/bot{tok}/sendMessage",
              {"chat_id": chat, "text": text}, {})
        log("telegram delivered: True")
        return True
    except Exception as e:  # noqa: BLE001
        log(f"telegram failed: {type(e).__name__} {str(e)[:120]}")
        return False


def already_sent(headline):
    """True if this same headline was escalated on the last run."""
    try:
        with open(DECISION, encoding="utf-8") as fh:
            prev = json.load(fh)
        return bool(prev.get("escalated")) and prev.get("headline") == headline
    except Exception:  # noqa: BLE001 - no prior decision is not an error
        return False


# ─────────────────────────────────────────────────────────── main

def main():
    brief = "--brief" in sys.argv
    try:
        with open(STATE, encoding="utf-8") as fh:
            state = json.load(fh)
    except Exception as e:  # noqa: BLE001
        log(f"NO STATE -- {type(e).__name__}. Heartbeat has not run. Deciding nothing.")
        return 0

    text, provider = reason(build(state))
    if not text:
        log("UNKNOWN -- no reasoning provider reachable. No decision, no brief. "
            "Staying silent rather than inventing one.")
        return 0

    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\n?|\n?```$", "", raw).strip()
    try:
        d = json.loads(raw)
    except json.JSONDecodeError:
        # why: this IS logged, loudly, with the offending text -- and then the run
        # ends deliberately. A model that returned prose instead of JSON must not
        # be guessed at; inventing structure over it is exactly the fabrication
        # this whole file exists to prevent.
        log(f"provider {provider} returned unparseable output; discarded. "
            f"first 160 chars: {raw[:160]!r}")
        return 0

    bad = unsupported_numbers(json.dumps({k: d.get(k) for k in
                                          ("headline", "why", "next_action", "escalation_text")}), state)
    d["provider"] = provider
    d["at"] = now()
    d["unsupported_numbers"] = bad

    log(f"provider={provider}")
    log(f"headline: {d.get('headline')}")
    log(f"why     : {d.get('why')}")
    log(f"action  : {d.get('next_action')}")
    if d.get("unknowns"):
        log(f"unknowns: {d['unknowns']}")
    if bad:
        log(f"REFUSED TO TRUST -- figures not present in measured state: {bad}")

    want = bool(d.get("escalate")) or brief
    if want and bad:
        log("escalation SUPPRESSED: it cited a figure that is not in the state.")
        want = False
    if want and not brief and already_sent(d.get("headline")):
        log("escalation suppressed: identical headline already sent last run.")
        want = False

    if want:
        body = d.get("escalation_text") or d.get("headline") or ""
        prefix = "Resale IQ daily brief\n\n" if brief else "Resale IQ\n\n"
        d["escalated"] = telegram(f"{prefix}{body}\n\nNext: {d.get('next_action','')}"[:900])
    else:
        d["escalated"] = False

    try:
        os.makedirs(os.path.dirname(DECISION), exist_ok=True)
        with open(DECISION, "w", encoding="utf-8") as fh:
            json.dump(d, fh, indent=1)
    except Exception as e:  # noqa: BLE001
        log(f"could not persist decision: {type(e).__name__}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
