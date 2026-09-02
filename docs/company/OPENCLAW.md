# OPENCLAW — local orchestrator

**Status 2026-09-02: steps 1–2 of 7 done. This is NOT the completed migration.**
Read §"What is genuinely not built" before trusting it with anything.

Founder decisions this was built to: OpenClaw runs **locally on the MacBook**, not Hetzner
(*"why everything on hetznet"*); **Gemini now**, OpenRouter once credit is added; **his existing
Telegram bot**, not a new one; SSH-to-production and founder-gated irreversible actions approved.

---

## Why local, and what that costs

| | MacBook | Hetzner |
|---|---|---|
| cores / RAM | **8 / 16 GB** | 2 / 3.8 GB (2.3 GB free) |
| disk free | **198 GB** | 14 GB, 81% used |
| Node | v24 installed | not installed |

The orchestrator does not need to sit next to the database — it reaches production over SSH, the
same way every session has all day.

**The cost, stated plainly: OpenClaw survives the terminal closing, Claude Code exiting, and a
reboot. It does NOT survive the Mac sleeping or shutting down.** That is why the Hetzner cron jobs
stay: `riq-heartbeat` (:17), `riq-disk-guard` (:37), `riq-decide` (:47), daily brief (08:05) are the
always-on layer. Mac does the heavy work; Hetzner keeps watch. Do not delete them.

---

## What is running, verified

| thing | state | evidence |
|---|---|---|
| Gateway | running, `localhost:18789`, loopback-bound, token auth | HTTP 200 |
| Service | LaunchAgent `ai.openclaw.gateway` | PID 67777, `RunAtLoad: true`, `KeepAlive: true` — separate PID from the Claude Code shell, restarts on login |
| Model (primary) | `google/gemini-3.1-pro-preview` | agent turn returned `OPENCLAW LIVE / 391` |
| Fallback chain | `gemini-3.1-flash-lite-preview` → `gemini-2.5-flash` → `openrouter/minimax/minimax-m3:free` | survives gateway restart: `CHAIN OK / 144` |
| Telegram | connected, polling, `@meindingksBot` | `channels status --probe`: "works, audit ok"; test message id 2381 delivered |
| Agent | `main` (Modi), workspace `~/.openclaw/workspace` | `openclaw agents list` |

**Security changes made, both deliberate:**
1. Telegram `botToken` switched to the bot the founder already uses. Safe alongside `riq-decide`,
   which only ever calls `sendMessage`; OpenClaw polls `getUpdates`. Two pollers would conflict —
   a sender and a poller do not.
2. **Allowlist `{"*": {requireMention: true}}` → the founder's chat id only.** The wildcard let ANY
   chat mentioning the bot drive an agent with shell access on this Mac. OpenClaw's measured native
   defence rate is **17%** ([arXiv 2603.10387](https://arxiv.org/abs/2603.10387)), so the allowlist
   is load-bearing, not ceremony.

---

## Operating it

```bash
openclaw gateway status          # is it alive
openclaw gateway restart         # after any config change
openclaw channels status --probe # is Telegram actually connected
openclaw agent --agent main -m "your instruction"   # one turn, from the terminal
openclaw doctor                  # diagnose; add --fix to apply
openclaw config get agents.defaults.model           # current model chain
openclaw dashboard               # Control UI in a browser
```

**Config** `~/.openclaw/openclaw.json` · **workspace** `~/.openclaw/workspace` ·
**state** `~/.openclaw/state` · **logs** `/tmp/openclaw/openclaw-<date>.log`

**Killing the Claude Code session does nothing to it.** Different PID, KeepAlive on.
To stop it deliberately: `openclaw gateway stop`. To start again: `openclaw gateway restart`.

**Restore point** if a config change breaks it:
`/private/tmp/.../scratchpad/openclaw.json.pre-telegram.bak`, and OpenClaw writes its own
`~/.openclaw/openclaw.json.bak` on every overwrite.

---

## What is genuinely NOT built

The founder's migration prompt has 23 sections. **Steps 1–2 of the 7-step plan are done.** These
are not, and claiming otherwise is what §20 of his own prompt forbids:

| § | missing | why it matters |
|---|---|---|
| 7, 8 | **Task manager + persistent task state** | no objectives/tasks/subtasks table; it cannot resume an interrupted mission |
| 6 | **Verification engine** | nothing independently checks "done". The verifier must run on a *different provider* than the executor, and must be able to FAIL a task |
| 5, 19 | **Agent registry** | one agent (`main`) exists. The 21 repo contracts are ~88% identical boilerplate and must not be ported as-is |
| 18 | **Claude Code as a worker** | OpenClaw cannot yet invoke Claude Code with a task + acceptance criteria |
| 9 | Task dependencies | no DAG, so nothing blocks a downstream task when its prerequisite failed |
| 15, 17 | Cost controls, retry/backoff policy | — |
| 21 | **End-to-end test** | the full loop has never been run |

**A gotcha worth recording:** running `onboard --auth-choice openrouter-api-key` silently reset
`agents.defaults.model.primary` to `openrouter/auto`, overriding the founder's explicit "Gemini
now". Adding a provider rewrites the primary model. **Check the model chain after every onboard.**

Groq did not register a profile despite the onboard call reporting nothing — `auth.profiles` has
`anthropic:default`, `google:default`, `openrouter:default` and no groq. Unresolved; Gemini and
OpenRouter cover the chain, so it is not blocking.
