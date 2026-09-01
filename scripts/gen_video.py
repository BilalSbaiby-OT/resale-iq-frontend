#!/usr/bin/env python3
"""Generate a marketing video with Veo. Reads GEMINI_API_KEY from the env.

    bash .claude/bin/with-secrets.sh python3 scripts/gen_video.py \
        --prompt "..." --out docs/marketing/assets/hook.mp4

Veo is a LONG-RUNNING operation: predictLongRunning returns an operation name,
you poll it, then download the file. Generation takes minutes, so --timeout
defaults high and the poll prints progress rather than sitting silent.

Same two rules as scripts/gen_image.py, for the same reasons:

  - THE KEY IS NEVER PRINTED. Header, never a query string -- a key in a URL
    lands in logs and proxy history. One already reached a transcript here.
  - A FAILED GENERATION IS AN ERROR, NOT AN EMPTY FILE. Exits non-zero with what
    actually came back. A 0-byte mp4 that looks like a deliverable is the same
    defect as rendering UNKNOWN as 0.
"""
import argparse
import json
import os
import ssl
import sys
import time
import urllib.error
import urllib.request

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _SSL = ssl.create_default_context()

BASE = "https://generativelanguage.googleapis.com/v1beta"


def _key():
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if not k:
        sys.exit("GEMINI_API_KEY is not set. Run through .claude/bin/with-secrets.sh")
    return k


def _call(url, body=None, method=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Content-Type": "application/json", "x-goog-api-key": _key()},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=120, context=_SSL) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode('utf-8','replace')[:500]}")


def _download(uri, out):
    req = urllib.request.Request(uri, headers={"x-goog-api-key": _key()})
    with urllib.request.urlopen(req, timeout=300, context=_SSL) as r:
        data = r.read()
    if len(data) < 1024:
        sys.exit(f"download returned {len(data)} bytes — refusing to write a stub file")
    os.makedirs(os.path.dirname(os.path.abspath(out)) or ".", exist_ok=True)
    with open(out, "wb") as f:
        f.write(data)
    return len(data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="veo-3.1-fast-generate-preview")
    ap.add_argument("--aspect", default="9:16", help="9:16 for TikTok/Reels/Shorts, 16:9 for X")
    ap.add_argument("--timeout", type=int, default=900)
    args = ap.parse_args()

    op = _call(f"{BASE}/models/{args.model}:predictLongRunning",
               {"instances": [{"prompt": args.prompt}],
                "parameters": {"aspectRatio": args.aspect}})
    name = op.get("name")
    if not name:
        sys.exit(f"no operation returned: {json.dumps(op)[:400]}")
    print(f"operation started: {name.split('/')[-1]}", flush=True)

    deadline = time.time() + args.timeout
    while time.time() < deadline:
        time.sleep(15)
        st = _call(f"{BASE}/{name}")
        if st.get("done"):
            if "error" in st:
                sys.exit(f"generation failed: {json.dumps(st['error'])[:400]}")
            resp = st.get("response", {})
            vids = (resp.get("generateVideoResponse", {}).get("generatedSamples")
                    or resp.get("generatedSamples") or resp.get("predictions") or [])
            if not vids:
                sys.exit(f"done but no video in response: {json.dumps(resp)[:500]}")
            v = vids[0]
            uri = ((v.get("video") or {}).get("uri") or v.get("uri")
                   or (v.get("video") or {}).get("videoUri"))
            if not uri:
                sys.exit(f"no uri on sample: {json.dumps(v)[:400]}")
            n = _download(uri, args.out)
            print(f"{args.out}  {n:,} bytes  {args.aspect}")
            return 0
        print("  …generating", flush=True)

    sys.exit(f"timed out after {args.timeout}s — operation {name.split('/')[-1]} may still finish")


if __name__ == "__main__":
    sys.exit(main())
