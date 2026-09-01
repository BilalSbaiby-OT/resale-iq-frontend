#!/usr/bin/env python3
"""Embed the dashboard payloads into the page so it works when double-clicked.

    python3 scripts/company/embed_dashboard.py

WHY THIS EXISTS

`dashboard/index.html` fetched `data.json` relatively. Over `file://` that call
throws `Failed to parse URL from data.json` before any request is made, so both
payloads failed, every panel rendered empty, and the page's own error told the
reader to re-run the build — pointing at data that was never the problem.

**The founder opened that dashboard repeatedly and saw a blank page telling him
to regenerate files that already existed.** Nobody caught it because every agent
that "verified the dashboard" checked whether `data.json` contained the right
numbers, which it always did. The bug was one layer up, in getting them into the
page at all.

The loader prefers the embedded copy and falls back to fetch, so the same single
file works double-clicked and served. Deliberately not a second "standalone"
build: two copies of the same page is the duplication that caused three separate
bugs on 2026-09-01.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGE = os.path.join(ROOT, "dashboard", "index.html")


def embed(html: str, slot_id: str, payload_path: str) -> str:
    """Replace one <script id=...> slot's contents with the JSON on disk."""
    if not os.path.exists(payload_path):
        print(f"  {os.path.basename(payload_path)}: missing — slot left null")
        return html
    with open(payload_path, encoding="utf-8") as fh:
        data = json.load(fh)

    # </script> inside embedded JSON would close the tag early and break the
    # page. Escaping the slash is the standard, and it survives JSON.parse.
    text = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")

    pattern = re.compile(
        rf'(<script id="{slot_id}" type="application/json">).*?(</script>)', re.S)
    if not pattern.search(html):
        print(f"  slot {slot_id} not found in the page — run the patch first")
        return html
    print(f"  {os.path.basename(payload_path)}: embedded {len(text):,} bytes")
    return pattern.sub(lambda m: m.group(1) + text + m.group(2), html, count=1)


def main() -> int:
    if not os.path.exists(PAGE):
        sys.exit(f"{PAGE} not found")
    html = open(PAGE, encoding="utf-8").read()
    html = embed(html, "riq-data", os.path.join(ROOT, "dashboard", "data.json"))
    html = embed(html, "riq-org", os.path.join(ROOT, "dashboard", "org.json"))
    with open(PAGE, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"  wrote {os.path.relpath(PAGE, ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
