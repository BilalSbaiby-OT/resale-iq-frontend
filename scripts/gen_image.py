#!/usr/bin/env python3
"""Generate a marketing image with Gemini. Reads GEMINI_API_KEY from the env.

    bash .claude/bin/with-secrets.sh python3 scripts/gen_image.py \
        --prompt "..." --out docs/marketing/assets/thing.png

Written 2026-09-01 after the founder pointed out we had a Gemini key the whole
time and I had told him twice we could not generate images. We can: this key
carries gemini-3-pro-image, gemini-2.5-flash-image and the veo-3.1 video models.

Two rules encoded here rather than left to the caller:

  - THE KEY IS NEVER PRINTED. It is read from the environment, used in a header,
    and never echoed -- not into stdout, not into an error message, not into a
    URL query string. RESEND_API_KEY reached a transcript today through a plain
    `env | grep`; that is not repeating.
  - A FAILED GENERATION IS AN ERROR, NOT AN EMPTY FILE. If the response carries
    no image part, this exits non-zero and says what came back instead. A 0-byte
    PNG that looks like a deliverable is the image equivalent of rendering
    UNKNOWN as 0, which is the defect this whole company exists to avoid.
"""
import argparse
import base64
import json
import os
import sys
import ssl
import urllib.error
import urllib.request

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    # No certifi on this interpreter. Use the system default rather than
    # disabling verification -- an unverified TLS session sending an API key is
    # not a tradeoff worth making for a marketing asset.
    _SSL = ssl.create_default_context()

ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def generate(prompt, model, timeout=180):
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        sys.exit("GEMINI_API_KEY is not set. Run this through .claude/bin/with-secrets.sh")

    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}]}).encode()
    req = urllib.request.Request(
        ENDPOINT.format(model=model),
        data=body,
        headers={
            "Content-Type": "application/json",
            # Header, not a query parameter: a key in a URL lands in logs and
            # proxy history. Never place credentials in a query string.
            "x-goog-api-key": key,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        # Read the body for the real reason, but never echo the request headers.
        detail = e.read().decode("utf-8", "replace")[:400]
        sys.exit(f"HTTP {e.code} from {model}: {detail}")


def extract_image(payload):
    """Return (bytes, mime) for the first inline image part, or (None, reason)."""
    for cand in payload.get("candidates", []):
        for part in (cand.get("content") or {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob and blob.get("data"):
                return base64.b64decode(blob["data"]), blob.get("mimeType", "image/png")
        if cand.get("finishReason") not in (None, "STOP"):
            return None, f"finishReason={cand['finishReason']}"
    if "promptFeedback" in payload:
        return None, f"promptFeedback={json.dumps(payload['promptFeedback'])[:200]}"
    return None, "no inline image part in the response"


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="gemini-3-pro-image")
    args = ap.parse_args()

    data, mime = extract_image(generate(args.prompt, args.model))
    if data is None:
        # mime carries the reason here. Fail loudly rather than writing nothing.
        sys.exit(f"no image returned by {args.model}: {mime}")

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)
    with open(args.out, "wb") as f:
        f.write(data)
    print(f"{args.out}  {len(data):,} bytes  {mime}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
