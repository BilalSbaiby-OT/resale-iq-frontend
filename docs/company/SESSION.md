# SESSION

**Updated** 2026-09-05 ~17:00Z

## Why OpenClaw kept reverting to Grok

Not a config problem. **Two cron jobs had `xai/grok-4.6` PINNED as their model** — `CEO cycle
(decision loop)` every 4h and `Founder daily brief`. Every run rewrote the chain back. Cleared both
with `openclaw cron edit <id> --clear-model` so they inherit the agent chain. **Held on retest** —
first time the setting has stuck.

```
ceo-cand-sonnet-a   anthropic/claude-opus-5    -> xai/grok-4.6 -> gemini
departments         anthropic/claude-sonnet-5  -> xai/grok-4.6 -> gemini
```

## Why everything lagged

Three OpenClaw-spawned `claude` CLI processes at **106.7%, 78.6% and 60.0% CPU simultaneously**, plus
Claude Code itself. Gateway reported `event loop degraded for 12s, max 1113ms, cpuCoreRatio 0.77`.

Set `agents.defaults.maxConcurrent = 2` and `subagents.maxConcurrent = 1`. No Claude process in the
top three afterwards. **Same root cause as the session limit** — the Claude subscription caps
CONCURRENT sessions and OpenClaw spawns one CLI process per agent run, so unbounded concurrency
produced both the lag and the 867 session-limit failures.

## Why the CEO was not collaborating in the group

Two separate faults, both now fixed:

1. **The group was upgraded to a supergroup.** Telegram migrated `-5458162328` -> `-1004482834299`,
   and the dead id was still configured. Every group message was refused `reason: not-allowed`.
   Confirmed by Telegram itself: sending to the old id returns *"group chat was upgraded to a
   supergroup chat"*. Removed it. **0 refusals since; `audit ok`.**

2. **Her actions were being SILENTLY DENIED.** Her own words at 16:50: *"I've stopped — three of my
   last actions were declined (posting in the group, reading the Growth audit, moving the board
   cards)."* The approvals store is empty (`Defaults none, Agents 0, Allowlist 0`) and the effective
   policy for every agent is **`ask: off` with `askFallback: deny`** — so approvals never reach the
   founder and are refused by default. `openclaw approvals pending` is empty because nothing was ever
   queued. **NOT FIXED — changing a security policy this broad is the founder's call.**

## Founder instruction, applied

"Stop all what it's doing until she speaks with the other member and orders it to move."
Disabled `9h-no-idle` (every 15m) and `CEO cycle` (every 4h). The heartbeat is
declaration-managed and refused `cron disable`. Daily brief left running.

CEO instructed to post in the group, pause all other work, ask the other member what they are on,
what blocks them and what they need, then sequence the work. She confirmed SENT.

## Correction to my own earlier work

The CEO's daily brief retracted my `309 -> 1,223` correction, and **it is right and I was wrong.**
`/api/public/market-snapshot` — what a customer or fact-checker actually sees — served **309** on
09-02, **333** on 09-03, **424** today. My 1,223 came from a raw `listings` query and reproduces
under no public definition. **9 published posts and 5 blocked rows still carry it.** I replaced a
reproducible number with an unreproducible one while writing the rule against doing that.

## Still open

- 9 published posts carry the bad figure. Correcting them needs the founder (they are live on his
  accounts) and must be re-verified against `/api/public/market-snapshot`, not the raw table.
- `control-plane-guard` plugin: OpenClaw "can't verify where this plugin came from", and it runs with
  shell access.
- The dashboard still shows **"Goal achieved — hit EUR 2000 MRR"** while live Stripe reports
  **0 active subscriptions, EUR 0.00**.

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

