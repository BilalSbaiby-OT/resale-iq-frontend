#!/usr/bin/env python3
"""Generate voiceover with ElevenLabs. Reads ELEVENLABS_API_KEY from the env.

    bash .claude/bin/with-secrets.sh python3 scripts/gen_voice.py \
        --text "Most people overpay for this by eleven euros." \
        --out docs/marketing/assets/vo/hook.mp3

WHY THE VOICE IS NOT READ FROM ELEVENLABS_VOICE_ID:

That variable points at a voice that does not exist on this account -- the
account has NO saved voices at all ("My Voices" is empty), which is what the
404 was. It was never an auth problem; `text_to_speech` has been enabled the
whole time.

Public library voice ids work without being added to an account, so the default
below is a real, verified id rather than an env lookup that fails silently. A
config value that 404s is worse than a hardcoded one that works, because the
failure looks like a permissions problem and sends you to the wrong place --
which is exactly where it sent me.

Override with --voice. When the founder saves a voice to the account, pass its
id and the env var can be retired rather than repaired.

Same two rules as gen_image.py and gen_video.py:
  - THE KEY IS NEVER PRINTED. Header only, never a query string.
  - A FAILED GENERATION IS AN ERROR, NOT AN EMPTY FILE. A 0-byte mp3 in a
    listing looks exactly like a real deliverable.
"""
import argparse
import json
import os
import ssl
import sys
import urllib.error
import urllib.request

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _SSL = ssl.create_default_context()

# Verified working on this account, 2026-09-01: returned 200 and 44KB of MP3.
DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"
# Multilingual, because the content ships in EN, ES and FR and the markets are
# ES/FR/DE/IT/PT. A monolingual model mispronounces the half that matters.
DEFAULT_MODEL = "eleven_multilingual_v2"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    a = ap.parse_args()

    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        sys.exit("ELEVENLABS_API_KEY not set — run through .claude/bin/with-secrets.sh")

    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{a.voice}",
        data=json.dumps({"text": a.text, "model_id": a.model}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(req, timeout=180, context=_SSL) as r:
            audio = r.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:300]
        # 404 here means the VOICE, not the key. Say so, because the generic
        # message sends people to the permissions page for no reason.
        hint = ("\n  404 = that voice id does not exist on this account. "
                "Pass --voice with a valid id.") if e.code == 404 else ""
        sys.exit(f"HTTP {e.code}: {body}{hint}")

    if len(audio) < 1024:
        sys.exit(f"only {len(audio)} bytes returned — refusing to write a stub")

    os.makedirs(os.path.dirname(os.path.abspath(a.out)) or ".", exist_ok=True)
    with open(a.out, "wb") as f:
        f.write(audio)
    print(f"{a.out}  {len(audio):,} bytes  voice={a.voice}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
