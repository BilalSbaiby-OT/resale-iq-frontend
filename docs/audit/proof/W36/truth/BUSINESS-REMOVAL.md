# Business €99 tier — removal proof (AM-3)

Pre-condition verified before touching anything, per AM-3 and `docs/audit/proof/W36/production/prod-truth-2026-08-31.md`:
zero active subscriptions, zero customers ever on `business`, and **no €99 Stripe price object
has ever existed** ("No €99 price exists at all... Business €99 was never purchasable" —
prod-truth, Stripe LIVE catalogue read). `MONEY.md` §7 independently confirms `users.plan` has
never held the value `business` in this DB, and no code path can write it. Safe to remove per
AM-3's own blocking pre-condition.

## Surface removed, file by file

| Surface | File | What changed |
|---|---|---|
| Pricing data | `src/lib/pricing.ts` | Deleted the entire `{id: "business", ...}` tier object from `TIERS` (name, €99 price, "Talk to us" CTA, "Everything in Pro" / "Custom scope" / "Priority support" / "Volume & multi-seat pricing" feature list). Removed the now-dead `anchor?: boolean` field from the `Tier` interface (it existed only to style the Business card). Rewrote the top-of-file comment from "Free -> Starter -> Pro -> Business" to "Free -> Starter -> Pro", and the "Business €99 is an enquiry-only anchor..." design-rationale comment to a removal note citing AM-3. |
| Pricing page render | `src/components/landing/pricing-section.tsx` | Removed the mailto enquiry branch from `choose()` (`if (!placeholder) { window.location.href = "mailto:...Business%20plan%20enquiry" }` → `if (!placeholder) return`) — that branch existed only to catch Business, the one tier with no Stripe price. Removed the dead `t.anchor` styling ternary (`background: t.highlight ? "#22c55e" : t.anchor ? "transparent" : "#1a2030"` → drops the `t.anchor` branch, since no tier sets it anymore). |
| Paywall component | `src/components/layout/paywall.tsx` | Same mailto-fallback removal in `subscribe()`, same `t.anchor` styling cleanup. Also rewrote the Pro upsell copy that referenced "26 markets" as if Business/Pro made Vinted's whole EU footprint one arbitrage play (see `CHANGES.md` §2c/2d — folded into the same edit since it touched the same lines). |
| Backend plan metadata | `demand-intel/api/stripe_routes.py` | **Out of scope for this repo/lane** — `MONEY.md` confirmed Business was never added to `get_plans()` in the first place, so there is nothing to remove there. Not touched. |
| `llms.txt` | `src/app/llms.txt/route.ts:111` | Deleted the line `"- Business EUR 99/month: enquiry only, scoped case by case."` from the Pricing section. |
| JSON-LD structured data | `src/app/layout.tsx:87-108` | Confirmed no Business-specific entry exists (`applicationCategory: "BusinessApplication"` is an unrelated schema.org taxonomy value, not a plan). `offers` array has exactly 3 entries (Free/Starter/Pro) before and after — nothing to remove, verified by reading the array. |
| Sitemap | `src/app/sitemap.ts` | Confirmed no business/pricing-specific route exists (pricing lives on a single page section, not its own URL). Not touched. |
| Generic "business" as an English word | `src/data/manual*.ts`, `src/data/blog-posts*.ts`, `tools/[slug]/page.tsx`, `methodology/page.tsx`, `support/page.tsx`, `legal/page.tsx` | Read-through per `MONEY.md`'s flag — every hit is the generic word ("reselling business," "your business," `applicationCategory: BusinessApplication`), none reference the €99 tier. Not touched. |

## Verification

```
$ grep -rniI "€99|business.*plan.*enquiry|business.*99|talk to us|business tier" src/ extension/ public/
docs/audit/proof/... only  (no hits in src/extension/public — see CHANGES.md commit diff)

$ grep -rn '"business"' src/ extension/ public/
(no output)

$ grep -rn "\.anchor\b" src/
(no output — dead field fully removed, not just orphaned)
```

`npx tsc --noEmit`, `npm run build`, and all four `check:*` scripts pass on this branch with the
tier removed (see `CHANGES.md` header).

## What was explicitly NOT done

- Did not touch Stripe (no live object existed for this tier; nothing to delete there).
- Did not touch `demand-intel/` (out of this repo's lane — `MONEY.md` already confirmed nothing
  needs removing there).
- Did not publish anything — this commit sits on `claude/frontend-eng/truth-pass-and-cut-business`,
  unmerged and unpushed to `main`, per OS §0.10 (publish is a founder gate) and the task's own
  instruction never to push `main`.
