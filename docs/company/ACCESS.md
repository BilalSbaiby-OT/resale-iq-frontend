# ACCESS — what the company can reach, and the rules for using it

Established 2026-08-31 on the founder's instruction: *"get access to Coolify and Hetzner
yourself and Stripe and Search Console and all that — I have a lot of APIs put on env to use
etc. Why checking with me when you can do it yourself."*

Taken as standing authority to **read** every production system without asking each time.
It is **not** authority to write, deploy, publish, or spend. Those stay founder gates (OS §0.10).

---

## The rule that makes this safe

**Use a secret; never see one.** `.claude/bin/with-secrets.sh` is the only sanctioned route to a
credential. It sources the env files into a child process, runs your command there, and scrubs
every value ≥8 chars out of stdout and stderr before it can reach a transcript. So you write
`$STRIPE_SECRET_KEY` and get Stripe data back; the key itself never appears anywhere.

```bash
.claude/bin/with-secrets.sh --names                    # what credentials exist (names only)
.claude/bin/with-secrets.sh python3 scripts/company/stripe_read.py
```

`guard.py` enforces it: a direct read of any `.env` is blocked, and so is handing a secret
variable straight to `echo`/`printf`/`printenv`. Proof: `docs/audit/proof/W36/phase0/proof.sh`.

---

## What is reachable

| System | How | State |
|---|---|---|
| **Production host** (Hetzner, `62.238.51.83`) | `ssh resaleiq` — host alias, key-based, lands as **root** | ✅ working |
| **Backend container** | `docker exec ph5clxk9hmghspv65pdkvak9-<id>` | ✅ image tag tracks `demand-intel` HEAD |
| **Frontend container** | `docker exec p6t87shftvl2455pd3gdgee1-<id>` | ✅ image tag tracks `resale-iq` HEAD |
| **Production database** | inside the backend container at `/app/data/demand_intel.db` | ✅ 19.8 GB, live |
| **Coolify** | port 8000 is **firewalled from the internet** (Hetzner Cloud Firewall). Reach it from the host itself, or `ssh -N -L 8000:localhost:8000 resaleiq` | ✅ via SSH only |
| **Stripe** | live key is in the **production container's** env, not on this Mac. Run the reader inside the container. | ✅ read-only |
| **Search Console** | `mcp__gsc__*`, property `https://resaleiq.dev/` | ✅ authenticated |
| **GitHub** | `GITHUB_PAT` via the gateway, plus `gh` | ✅ |

Container names carry a deploy-specific suffix — always resolve them with
`ssh resaleiq 'docker ps --format "{{.Names}}"'` rather than pasting an old one.

**The local `.env` holds a Stripe TEST key.** Anything asked of Stripe from this Mac answers
about an empty test account. Real revenue questions must be asked from inside production.

---

## Rules for production access

1. **Read-only.** `mode=ro` on every database connection, GET-only on every API.
2. **Bound every query.** `LIMIT` always; no `COUNT(DISTINCT …)` over a 12M-row table.
   AM-1 says a long analytical scan on the file production is serving is a real risk —
   and it is, because this was violated once on 2026-08-31 and a follow-up probe ran for
   minutes against the live database. Do not repeat it. Sample, or copy a snapshot first.
3. **Never print an env value.** Print `SET` / `EMPTY`, or a classification
   (`sk_live_…` → `LIVE`), never the string.
4. **No writes, no restarts, no deploys, no `docker` mutations.** Reading is standing
   authority; changing production is not.
5. **PII stays out.** Counts, statuses and aggregates. Never a customer's name or email —
   that is still a founder gate.

---

## What still needs the founder, and why

Not stubbornness — these are the things no credential in `.env` can do:

| Thing | Why only the founder |
|---|---|
| **Grant Desktop access to launchd's `bash`** | a macOS TCC click in System Settings; it is what has kept the local scrape agent dead for 11 days (`FUNNEL.md` F-4) |
| Chrome Web Store listing | the dashboard blocks scripting and the API carries no listing metadata |
| Stripe **writes** — prices, products, refunds | read-only by charter (OS §2) |
| Deploying / pushing `main` | a push is a production deploy |
| Sending email, posting publicly, DNS | outward-facing, irreversible |
| Anything that changes a price or a paying customer's plan | founder gate (OS §0.10) |

---

## 2026-09-01 — the company moved out of `~/Desktop`

**Repos now live in `~/work/`**: `resale-iq`, `demand-intel`, `resale-iq-growth`, `resale-iq-seo`.

**Why.** macOS TCC lets a launchd job *read* a file under `~/Desktop` but not list a directory or
execute a script there. Measured, not assumed — `~/Library/Logs/resaleiq/tcc-probe.log`. That wall
killed the scrape agent for 11 days and then killed the hourly verifier the same way. Moving out
needs no permission grant and cannot be revoked by a future OS update.

**What it unblocked, immediately:** `dev.resaleiq.os-verify` now runs hourly with **exit 0 and an
empty stderr**, producing a GREEN report with no session open. That had never once worked.

`~/work/.claude/` is now the company root (settings + the agent roster symlink). `~/Desktop/.claude`
still exists only because this session started there; a session opened in `~/work` needs nothing
from Desktop. The verifier treats an unreadable config root as a **third state** — reported and
skipped, never silently fine — because it used to die with `EPERM` trying to read Desktop from
launchd.
