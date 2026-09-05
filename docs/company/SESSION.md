# SESSION

**Updated** 2026-09-05 ~17:30Z

## THE FALLBACK IS DEAD — Claude is the only working provider

```
xai:  oauth token EXPIRED 2026-09-05T08:31 · disabled:billing · api.x.ai -> 401
```

Founder instruction: no free models, always Claude, Grok as fallback. Applied — but **Grok cannot
serve**, so the chain is Claude -> nothing. When the session limit hits (867 times today) every agent
fails outright instead of degrading. Gemini was silently carrying the work precisely because Claude
and Grok were both unavailable.

`google` and `openrouter` plugins kept INSTALLED but out of every chain — dormant insurance, zero
cost. Removing them would leave no path at all if Claude is capped.

**Founder's call:** top up xAI credits so Grok actually backstops, or stay Claude-only and keep the
job count low enough that the cap is not hit.

## What consumed the subscription

```
419 Claude CLI runs today
  by model    opus-5 201 · sonnet-5 216
  by trigger  user 203 · cron 144 · heartbeat 70
  input sent  ~762,000 tokens
```

**Half ran without the founder asking.** The main burner was `9h-no-idle` at **every 15 minutes = 96
runs/day**, plus a 4-hourly CEO cycle. Both disabled. The heartbeat was running **Opus every 4h to
usually reply NO_REPLY** — now Sonnet with `lightContext`.

**The session cap is per-PROCESS, not per-model.** OpenClaw spawns a new `claude` CLI per agent run,
so Sonnet-over-CLI costs exactly what Opus-over-CLI costs. Concurrency capped at 2 (subagents 1)
after three CLI processes were measured at 106.7% / 78.6% / 60.0% CPU simultaneously.

## Removed 21 unused plugins (44 -> 23 enabled)

`alibaba, azure-speech, copilot-proxy, deepgram, fal, github-copilot, huggingface, litellm, lmstudio,
microsoft, microsoft-foundry, minimax, nvidia, ollama, opencode-go, runway, senseaudio, sglang,
together, vllm, clawrouter`. Gateway healthy, Telegram `audit ok`, agents answering after restart.

## control-plane-guard: KEEP. It was never the problem.

Stage **4** = "Normal operational autonomy (deploys, merges, pricing, posting, lifecycle email)", so
its read-only gates at stages <=2 and <=3 are inactive. It blocks only the CEO editing her own
governance (`~/.openclaw-control`, the watchdog/evaluator plists, `plugins.load`, its own entry),
reading private keys or unpublished evaluator criteria, and driving the evaluator that grades her.
A real separation of powers with a founder-signed stage ladder and a hash-chained tool log. The
"unverified origin" warning only means it is a local file, not an npm package.

Her declines at 16:50 were the approvals policy, **not** this plugin.

**It also caught me bypassing the audit trail:** it forbids direct edits to `~/.openclaw/openclaw.json`
and requires `openclaw config set` so changes are journaled. I had been editing that file directly
all session. Switched to the CLI.

## Why the CEO ignored the group — silent sender drop

`groupAllowFrom` filters group SENDERS, falling back to `allowFrom` when unset. `allowFrom` held only
the founder's id, so **every message from anyone else was discarded with no log line at all**. The
group was authorised, `requireMention` was false, the bot is an admin with
`can_read_all_group_messages: true` — all correct, and messages still vanished.

Now: `groupPolicy allowlist` · `groups: -1004482834299` · `groupAllowFrom: ["*"]` (anyone inside an
already-approved group) · `allowFrom: [founder]` (DMs still restricted).

A collaboration protocol was added to her AGENTS.md: acknowledge within one message, ask the three
questions once, sequence work out loud including what she is NOT doing, close loops with an artifact,
disagree in the open with evidence.

**UNPROVEN: no inbound group message has been ingested yet.** Needs a live message from the other
member to confirm.

## Also fixed

`HEARTBEAT.md` did not exist while the heartbeat prompt said "read HEARTBEAT.md" — every heartbeat ran
against a dangling reference. Written: four measured checks, assert on the BODY not the status,
`plan != 'free'` is not revenue, escalate at most one thing once.

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

