# Agent lanes — who owns what

Two Claude agents work on Resale IQ. They share no memory. Whatever is not
written down here does not exist to the other one.

**Read this before touching a file. If the file is not in your lane, stop.**

---

## The lanes

### SEO agent
Owns everything a search engine or an answer engine sees.

| Owns | Paths |
|---|---|
| Content pages | `src/app/blog/**`, `src/app/manual/**`, `src/app/flip/**`, `src/app/category/**`, `src/app/data/**`, `src/app/tools/**` |
| Discovery surfaces | `src/app/sitemap.ts`, `src/app/robots.ts`, `public/llms.txt`, `opengraph-image.tsx` |
| Metadata & schema | `metadata` exports, JSON-LD blocks, canonical tags |
| Content data | `src/lib/content/**`, `src/data/**` (copy and keyword surfaces) |

### Growth agent
Owns the measurement of whether any of it works.

| Owns | Paths |
|---|---|
| Attribution capture | `src/lib/analytics.ts`, `src/components/pageview-tracker.tsx` |
| Backend tracking | `api/routes.py` `/api/track`, the `pageviews` / `signup_attribution` schema |
| Activation | wherever "activated" gets defined and computed |
| Growth reporting | `/api/admin/growth-funnel` and its admin page |
| The engine itself | `~/Desktop/resale-iq-growth/` (uncontested — no other agent goes there) |

### Neither lane — needs an explicit assignment before anyone starts
Auth, billing and Stripe, the paywall and entitlement checks, `market-numbers.ts`
and the numbers warehouse, the Chrome extension, deploys and infrastructure.

These are where a collision is most expensive. Ask, do not assume.

---

## The lock

`agent/HANDOFF.md` is the lock. It carries:

```
STATUS: READY | IN_PROGRESS | BLOCKED | DONE
OWNER:  seo | growth | none
```

- `IN_PROGRESS` with an `OWNER` that is not you → **do not touch this repo.** Work
  in your own lane elsewhere, or stop.
- Claim by setting `STATUS: IN_PROGRESS` and `OWNER: <you>` **before** your first
  edit, not after.
- Release by committing your work and setting `STATUS: READY`, `OWNER: none`.

## Never stop dirty

The protocol has already failed once this way: a session left 404 lines of
finished Chrome-extension work uncommitted with `HANDOFF` still dated 22 Aug.
The next agent cannot tell whether that is work in progress, abandoned, or
broken — so it either gets clobbered or everyone freezes.

**Commit before you stop.** If it is not finished, commit it on a branch and say
so in HANDOFF. An uncommitted working tree is the one state the other agent
cannot reason about.

## Branches

- SEO: `seo/<what>`
- Growth: `growth/<what>`
- Merge to `main` deliberately, one lane at a time.

## Serial beats parallel when it is the same repo

Two agents in one repo at the same time is workable only because these lanes
touch nearly disjoint files. If you are ever unsure whether a change crosses a
lane, run them one at a time instead. A half-migrated production repo costs far
more than the hour of parallelism saved — this site takes real money from real
customers.
