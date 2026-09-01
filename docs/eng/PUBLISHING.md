# Publishing — the Postiz channel we already pay for

**Status: WORKING, wired, and idle.** The pipe exists end to end. Nobody has ever pressed send.
Written 2026-09-01 by `devops`, read-only investigation, **no post was made or drafted**.

## 1. The key is live

`POSTIZ_API_KEY` is present in the agent secret store (`~/.resaleiq-agent.env` /
`resale-iq-growth/.env`, loaded through `.claude/bin/with-secrets.sh`). Confirmed with presence
checks only — the value itself was never printed to a transcript:

```
$ bash .claude/bin/with-secrets.sh sh -c 'env | grep -c "^POSTIZ_API_KEY=."'
1
$ bash .claude/bin/with-secrets.sh sh -c 'echo "${#POSTIZ_API_KEY}"'
64
```

`POSTIZ_API_URL` is **unset (0 chars)**. `src/config.js:104-106` (resale-iq-growth) treats that as
"use the hosted service": `BASE` defaults to `https://api.postiz.com/public/v1`. Confirmed this is
not shadowed by a self-hosted instance: `ssh resaleiq "docker ps -a"` lists Coolify's own containers
and two app containers, **no `postiz` container anywhere on the box**. GAPS.md D3's wasted run
(trying to deploy a *second* Postiz) would have been a second hosted-vs-self-hosted instance with no
accounts on it — this one already has accounts (§2).

A live, authenticated GET against the real API confirms the key works:

```
$ bash .claude/bin/with-secrets.sh sh -c '
BASE="${POSTIZ_API_URL:-https://api.postiz.com/public/v1}"
curl -sS -m 20 -H "Authorization: $POSTIZ_API_KEY" -H "Accept: application/json" "$BASE/integrations"'
→ HTTP 200, 4 integrations returned (see §2)
```

Auth shape: the raw key goes in the `Authorization` header, **not** `Authorization: Bearer <key>` —
the hosted API returns a bare 401 with no explanation if you send it the normal way
(`src/publish/postiz.js:43-56`, documented the hard way by whoever wrote the adapter).

## 2. What's actually connected — this is the number that matters

Confirmed live via `GET /integrations` (read-only, changes nothing):

| Platform | Postiz identifier | Account name / handle | Status |
|---|---|---|---|
| X (Twitter) | `x` | ResaleIq · @ResaleIQdev | connected, enabled |
| Instagram | `instagram-standalone` | ResaleIQ · @resaleiqx | connected, enabled |
| TikTok | `tiktok-business` | ResaleIQ · @resaleiq | connected, enabled |
| Reddit | `reddit` | (redacted by `with-secrets.sh`'s own output scrubber — the connected Reddit account's name matches a `REDDIT_*` value already in the env, which is itself confirmation it's the founder's real, already-known account) | connected, enabled |

**Not connected:** LinkedIn. `resale-iq-growth` generates LinkedIn content
(`src/agents/prompts/linkedin.md`) that has nowhere to go — confirmed live: a dry-run against the
real approval queue skips every LinkedIn piece with `no linkedin channel connected`.

**Markets / language:** all four connected accounts are the single `ResaleIQ` brand identity, no
per-market or per-language accounts exist. Content itself is **English only** — no locale field in
`config.js`, no language switch in any of the seven agent prompts (`src/agents/prompts/*.md`). The
product covers 5 EU markets (ES/FR/DE/IT/PT) in its *data*; none of that is reflected in the
*channel* — there is one audience, in English, regardless of which market a finding is about.

**This means:** an API key with zero connected accounts would not be a channel. This is not that —
it is a channel with 4 live, enabled destinations and a content queue already built against it.

## 3. The API surface (public API v1, hosted)

Base: `https://api.postiz.com/public/v1` (used when `POSTIZ_API_URL` is unset).
Three documented endpoints, confirmed by the adapter (`resale-iq-growth/src/publish/postiz.js`)
and matching what actually responds:

| Endpoint | Method | Purpose |
|---|---|---|
| `/integrations` | GET | list connected channels + auth check (no separate `/auth` endpoint — a successful read of this **is** the auth check) |
| `/upload` | POST (multipart) | upload one media file, returns `{ id, path }` — a post needs **both** fields, sending only `id` fails with a 400 |
| `/posts` | POST (JSON) | create a post: `{ type: "draft" \| "schedule", date, posts: [{ integration: {id}, value: [{content, image?}], settings? }] }` |

Auth header on every call: `Authorization: <raw key>` (not Bearer). Content-Type `application/json`
except the upload, which is `multipart/form-data`.

**Scheduling vs immediate send:** the API supports `type: "draft"` (lands in the Postiz UI for a
human to press send) and `type: "schedule"` (goes out at `date`). **There is no `type: "now"` /
immediate-send path wired anywhere in this codebase** — `schedulePiece()` in `postiz.js` never sets
one, on purpose, per its own comment: "Publishing is the founder's gate, so nothing here ever sets
type 'now' on its own."

**Rate limit:** hosted API throttles creates to ~100/hour. The adapter surfaces 429s as errors with
the response body rather than retrying blind.

**No analytics endpoint.** Only the three above exist. `syncAnalytics()` in the same file
deliberately throws rather than returning fabricated zeros — reach has to come from the platform
itself or the Postiz UI.

## 4. The exact command to publish one post

**This already exists and is already wired — nobody has run it un-dry.**
`resale-iq-growth/scripts/publish.js`, invoked as `npm run publish`, reading credentials only
through `with-secrets.sh`.

**Read-only, changes nothing — confirms the channel and shows what's queued:**
```
cd /Users/bilalsbaiby/work/resale-iq && \
bash .claude/bin/with-secrets.sh sh -c \
  'cd /Users/bilalsbaiby/work/resale-iq-growth && npm run publish -- --check'
```
Confirmed output this session: `Postiz (hosted) — authenticated`, 4 channels listed enabled,
**10 approved pieces** waiting, unscheduled.

**Dry run — shows exactly what would go out and to which account, sends nothing:**
```
cd /Users/bilalsbaiby/work/resale-iq && \
bash .claude/bin/with-secrets.sh sh -c \
  'cd /Users/bilalsbaiby/work/resale-iq-growth && npm run publish -- --dry-run --limit=10'
```
Confirmed this session: 7 of 10 approved pieces would send (reddit×3, instagram story/carousel/reel,
x_thread); 3 LinkedIn pieces would skip (no channel connected).

**The command that actually sends one post (NOT RUN — this is the founder-gated line):**
```
cd /Users/bilalsbaiby/work/resale-iq && \
bash .claude/bin/with-secrets.sh sh -c \
  'cd /Users/bilalsbaiby/work/resale-iq-growth && npm run publish -- --draft --limit=1'
```
`--draft` creates it in Postiz as a draft for a human to release there — still a real write against
a real connected account (X, Instagram, TikTok or Reddit), so under AM-8 this is a founder-gate
action, not a `content-social` or `devops` one, exactly as AM-8's publish exclusion says. Dropping
`--draft` and adding `--at="<ISO time>"` schedules it directly instead of drafting it; that is
strictly further into the gate, not less.

## 5. What only the founder can click

- **Connect LinkedIn** in the Postiz UI (`https://app.postiz.com` or wherever the founder's hosted
  instance login lives — this session did not locate a login URL beyond the API host, and did not
  look for one since that would mean touching the account, not just its API).
- **Press send** on anything — `npm run publish` without `--dry-run`/`--check` is a founder action
  under AM-8's "publishing anything publicly" exclusion, full stop, regardless of who runs the
  command.
- **Decide which of the 10 approved pieces go out first** and in what order/spacing across 4
  accounts with one shared audience.

## 6. Bottom line

**Working channel, not a subscription.** Key live, 4 accounts connected and enabled (X, Instagram,
TikTok, Reddit — all English, no per-market split), 10 pieces already approved and queued, the exact
publish command already built (`npm run publish`, wired through `with-secrets.sh`). The only missing
piece is a human pressing send — `npm run publish -- --check` and `--dry-run` are safe to run any
time; nothing beyond that until the founder clears it.
