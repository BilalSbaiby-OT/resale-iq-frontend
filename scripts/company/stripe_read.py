#!/usr/bin/env python3
"""Read-only Stripe summary for the Company OS (OS §3 Revenue/Finance KPIs).

Run it through the secrets gateway so the key is never printed:
    .claude/bin/with-secrets.sh python3 scripts/company/stripe_read.py

Read-only by construction: GET only. Writes are blocked by the guard hook anyway.
Deliberately aggregate — it reports counts, statuses and amounts, never a customer's
name or email. PII is a founder gate (OS §0.10) and finance does not need it.
"""
import collections
import json
import os
import subprocess
import sys
import urllib.parse

KEY = os.environ.get("STRIPE_SECRET_KEY", "").strip()
if not KEY:
    sys.exit("STRIPE_SECRET_KEY not in environment — run via .claude/bin/with-secrets.sh")

LIVE = KEY.startswith("sk_live_") or KEY.startswith("rk_live_")


def get(path, **params):
    """GET via curl, not urllib.

    This Mac's Python 3.14 has no root certificates installed, so urllib fails every
    HTTPS call with CERTIFICATE_VERIFY_FAILED while curl — which uses the system trust
    store — works fine. Worth remembering: the backend carries an SSL_CERT_FILE knob for
    what looks like the same problem.
    """
    url = "https://api.stripe.com/v1/" + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    p = subprocess.run(
        ["curl", "-sS", "--max-time", "30", "-H", "Authorization: Bearer " + KEY, url],
        capture_output=True, text=True)
    if p.returncode != 0:
        return {"_error": "curl exit " + str(p.returncode), "_body": p.stderr[:300]}
    try:
        body = json.loads(p.stdout)
    except json.JSONDecodeError:
        return {"_error": "non-JSON response", "_body": p.stdout[:300]}
    if "error" in body:
        return {"_error": body["error"].get("type", "stripe_error"),
                "_body": body["error"].get("message", "")[:300]}
    return body


print("mode:", "LIVE" if LIVE else "TEST")
print()

subs = get("subscriptions", limit=100, status="all")
if "_error" in subs:
    print("subscriptions:", subs["_error"], subs.get("_body", "")[:200])
else:
    data = subs.get("data", [])
    print(f"subscriptions: n={len(data)}  (has_more={subs.get('has_more')})")
    by_status = collections.Counter(s["status"] for s in data)
    print("  by status:", dict(by_status) or "(none)")
    mrr = collections.Counter()
    for s in data:
        if s["status"] not in ("active", "trialing"):
            continue
        for it in s.get("items", {}).get("data", []):
            p = it.get("price") or {}
            amt = (p.get("unit_amount") or 0) * it.get("quantity", 1)
            cur = (p.get("currency") or "?").upper()
            interval = (p.get("recurring") or {}).get("interval", "?")
            print(f"    {s['status']:9s} {p.get('id','?'):32s} "
                  f"{amt/100:>8.2f} {cur}/{interval}")
            if s["status"] == "active":
                mrr[cur] += amt
    print("  active MRR:", {c: v / 100 for c, v in mrr.items()} or "0")

for what in ("customers", "prices", "products"):
    r = get(what, limit=100)
    if "_error" in r:
        print(f"{what}: {r['_error']}")
        continue
    d = r.get("data", [])
    print(f"{what}: n={len(d)} (has_more={r.get('has_more')})")
    if what == "prices":
        for p in d:
            rec = p.get("recurring") or {}
            print(f"    {p['id']:32s} {(p.get('unit_amount') or 0)/100:>8.2f} "
                  f"{(p.get('currency') or '?').upper()}/{rec.get('interval','one-time')} "
                  f"active={p.get('active')} nickname={p.get('nickname')}")

ch = get("charges", limit=100)
if "_error" not in ch:
    d = ch.get("data", [])
    paid = [c for c in d if c.get("paid") and not c.get("refunded")]
    refunded = [c for c in d if c.get("refunded")]
    total = collections.Counter()
    for c in paid:
        total[(c.get("currency") or "?").upper()] += c.get("amount", 0)
    print(f"charges: n={len(d)}  paid={len(paid)}  refunded={len(refunded)}")
    print("  gross collected (all time, up to 100 charges):",
          {k: v / 100 for k, v in total.items()} or "0")
else:
    print("charges:", ch["_error"])
