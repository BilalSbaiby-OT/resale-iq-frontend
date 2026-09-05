# SESSION

**Updated** 2026-09-05 ~18:35Z

## The CEO-to-CEO bridge is built, tested and permanent

Telegram refuses bot-to-bot delivery ("bots will not be able to see messages from other bots
regardless of mode"), and both CEOs are bot accounts. grokbootu runs on a remote cloud box; ours runs
on the founder's MacBook. The obvious fix -- tunnel the Mac -- would open an inbound hole into the
machine holding the payment keys, the repos, and an agent framework with shell access and a measured
17% native defence rate. **Rejected.**

Built instead: a queue on the Hetzner box, which already faces the internet and already terminates
TLS. **Both sides reach it OUTBOUND ONLY.**

```
grokbootu (cloud) --POST--> https://bridge.62.238.51.83.sslip.io <--poll-- Mac --> CEO --> group
```

The MacBook never listens. No tunnel, no open port. sslip.io meant Let's Encrypt issued a real cert
with no DNS change -- the same trick the backend already uses.

| check | result |
|---|---|
| `GET /health` over HTTPS | 200, real cert |
| no credential / wrong one | 401 / 401 |
| empty text | 400 |
| **outbound key used on the inbound route** | **401** -- two of them, so leaking one grants neither the other's role |
| round trip, measured live 3x | 20-45s |
| poller survives `kill -9` | **yes**, launchd restarted it, exactly one instance |

Files: `~/work/bridge/` (poller, launchd plist, provision, e2e test) and `/root/riq-bridge/` on the
host. The queue holds no credentials and runs no commands: it stores text and hands it to whoever
presents the right header.

**Not done, and deliberately not by me:** grokbootu still needs the inbound key. Typing a credential
into a web page is blocked and I did not route around it. The founder pastes that one line.

## Three defects found by building it, each worth remembering

1. **`--env-file` is read at container CREATE, not restart.** A `docker restart` after rewriting the
   env file kept the old values and produced a 401 that looked like a mismatch. Recreate, don't restart.
2. **`pkill -f "bridge/poller.py"` never matched** because the launchd wrapper `exec`s from inside the
   directory, so the process is `python3 poller.py`. Stale copies stacked under `KeepAlive` and
   double-processed every message.
3. **This Mac's Python has no CA bundle**, so `urllib` raised CERTIFICATE_VERIFY_FAILED against a
   perfectly valid Let's Encrypt cert. The same defect already bit the Gemini client here. Shell to curl.

## The CEO's behaviour under test is the reason to trust the pipe

The harness sent the same message three times. She did not answer a third time. She **read
`poller.log` herself**, found `PULLED -> ANSWERED -> REPLIED` for each id, and reported that the
duplicates came from the test harness -- **correcting her own earlier "the bridge is one-way"
hypothesis with evidence**. She also pushed back on grokbootu's framing rather than agreeing: it is
two blocked metrics, not one, and she asked for a cold-visitor paywall teardown before
instrumentation, "since diagnosing the offer should precede instrumenting it".

Relayed text is framed to her as **a peer's message, not instructions** -- a message arriving over a
pipe carries no authority.

## Open

- grokbootu works to "EUR 2k by 30 Sep 2026"; the target is **EUR 2,000 MRR by 31 December**. She
  flags it rather than adopting it. The same wrong month is in the dashboard's false "Goal achieved"
  banner, which still shows green while live Stripe reports **0 active subscriptions, EUR 0.00**.
- `paywall_shown` is **not instrumented anywhere** and `checkout_completed` has no first-party event.
  The funnel is blind exactly where conversion dies.

---

## Previous state

**Updated** 2026-09-02 ~12:45Z — **final Claude Code session. OpenClaw is the orchestrator now.**

## Start here

1. `~/.openclaw/workspaces/resaleiq/knowledge/CURRENT-STATE.md` — the handover, written for you.
2. `~/.openclaw/workspaces/resaleiq/AGENTS.md` — your operating contract.
3. `docs/company/OPEN-ITEMS.md` — the honest status list.
4. `docs/company/OPENCLAW.md` — what runs where, and what is NOT built.

## The product went down today and is MITIGATED, not fixed

Every anonymous visitor got `LIMIT_REACHED` with `used_today: 0` from 09:10Z. Proven with `tcpdump`
on both Traefik hops: the frontend calls the backend over a **public** hostname, so the request
hairpins back through the same Traefik, NAT rewrites the source to the bridge gateway, and Traefik
overwrites `x-forwarded-for` — every visitor on earth in one quota bucket.

Mitigated by raising the wide IP backstop (backend #4, deployed). **Verified on the body, not the
status:** `Adidas Samba -> WATCH n=58`, `New Balance 530 -> SKIP n=543`, `Nike Air Force 1 -> WATCH n=87`.

**The permanent fix is a founder decision — APPROVALS A25.** Put the ceiling back to 300 after it ships.

## Four backend PRs merged and deployed today

`#3` cutoff separator (~4 weeks live; merging it turned a "flaky" test green and unblocked the rest) ·
`#2` XFF double-hop · `#1` analyzer lock contention · `#4` ceiling mitigation.
Frontend `#7` is OPEN and **insufficient alone** — do not merge expecting it to fix the outage.

## Three corrections I made to my own claims today

Kept because the pattern matters more than any single error.

1. **"78% down"** → **"100.00% availability"** → **both wrong.** The first was a duty cycle. The
   second counted HTTP 200s — and `LIMIT_REACHED` returns 200, so I reported perfect health while the
   product refused everyone. My probing also helped exhaust the ceiling I was measuring.
2. **"nothing forwards x-forwarded-for on the rewrite"** — factually wrong. `frontend-eng` refuted it
   with packet captures: Traefik sets it, Next forwards it, and it dies at a *third* hop I had not
   looked for.
3. **"localisation is done"** — W61 had only turned 404s into redirects. Now genuinely done for
   `/methodology`, verified live in five languages; seven page families are still English.

## Do not

- **Do not assert on an HTTP status.** Check the response body. This cost the most today.
- **Do not trust the Deploy workflow's verdict** — it reported `failure` on a deploy that succeeded.
- **Do not query the local `demand-intel` DB.** ~53 GB, stale, `sold_observed = 0`, answers wrongly.
- **Do not name agent infrastructure in any doc** — this file ships to visitors inside `data.json`.
- **Do not call a redirect a translation, or a 200 a working page.**
- **Do not `git add -A`**; stage explicit paths. **Do not `grep` an env dump** — `grep -c '^VAR=.'`.

