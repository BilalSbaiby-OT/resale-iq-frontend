# SESSION

**Updated** 2026-09-02 ~16:10Z — health check after the founder rebuilt OpenClaw.

## The Claude subscription is wired and doing nothing

Measured across the gateway logs:

```
claude-cli attempts        385
        failures           265   (69%)
   of which session limit  215

actually served (HTTP 200)   google/gemini  298
                             anthropic        0
```

**Zero requests have ever been served by Claude.** Four departments plus a CEO candidate run
concurrently against one subscription; Claude's session limit refuses them and Gemini silently
carries the company while the config reads `anthropic/claude-sonnet-5`.

`setup-token` auth would persist better than `claude-cli` (which the docs say OpenClaw "does not
persist or refresh") but draws on the SAME subscription limits — it converts 69% failures into 69%
failures. **The fix is concurrency, not credentials:** one Claude lane for the hardest work, the rest
explicitly on Gemini. Or an Anthropic API key, which does not exist.

This is the third time this pattern has been recorded. See the memory note
`subagent-concurrency-session-limit`.

## Working, verified on the artifact

| | |
|---|---|
| product (BODY-checked, never status) | `Adidas Samba WATCH n=20` · `New Balance 530 WATCH n=153` |
| locale pages | en/es/fr/de/it/pt all 200 |
| OpenClaw gateway | 200, healthy |
| departments | `engineering` and `data` both answer |

## Changed by the rebuild, worth knowing

- **Telegram routes to `ceo-cand-sonnet-a`**, not a department. Founder messages reach a candidate
  whose workspace is `~/work/candidates/`.
- **The `resaleiq` workspace was deleted**, taking the 221 KB fact-checked knowledge pack with it.
  **Recoverable** — the source is the workflow output at
  `/private/tmp/claude-501/-Users-bilalsbaiby-work/fb348ebc-.../tasks/weh18808l.output` (280 KB).
- **`guard.py` now lets `DEPLOY_APPROVED` lift Stripe writes and `gh secret set`**, not only deploys.
  That token is permanent, so those paths are permanently open. Founder-authorised; stated once.
- **`data/prod.db` is untracked and NOT gitignored.** 0 bytes today. If it ever fills and gets
  committed, a production database ships to every visitor. Now ignored.

## UNKNOWN

Comparable counts fell (`n=58 → 20`, `543 → 153`). Consistent with the cutoff fix correctly
excluding stale rows, but **not proven** — do not repeat it as the cause without measuring.

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

