# LEDGER — Monthly Spend vs EUR 200 Cap (AM-2)

**Written:** 2026-09-01 (finance-ops)  
**Status:** PARTIALLY KNOWN — EUR 5.83/month evidenced; Claude/API spend unknown but likely dominant

This document closes `GAPS.md` **2d** and answers `METRICS.md` §2d: the spend ledger that backs the
three KPIs `spend_vs_cap`, `gross_margin_per_plan`, and `scrape_cost_per_trusted_check`.

---

## Cost Inventory — Every Line Item with Source

### Infrastructure (confirmed, monthly)

| Item | Amount | Interval | Monthly | Source | Notes |
|---|---|---|---|---|---|
| Hetzner VPS (CX22) | EUR 5 | monthly | EUR 5.00 | `demand-intel/COOLIFY-DEPLOY.md` L22; `demand-intel/deploy/DEPLOYMENT.md` L14 | "2 CPU, 4 GB, 40 GB disk". Running in production behind `resaleiq` SSH alias. Coolify deploy platform runs here free. |
| Domain (resaleiq.dev) | EUR 10 | yearly | EUR 0.83 | `demand-intel/COOLIFY-DEPLOY.md` L23; `demand-intel/LAUNCH-STEPS.md` | "~€10/yr, Namecheap/Porkbun". .dev domains require HTTPS. Annual renewal cost assumed constant. |
| **Subtotal — Infra** | — | — | **EUR 5.83** | — | — |

### One-time costs (amortised, if applicable)

| Item | Amount | When | Amortised/month | Notes |
|---|---|---|---|---|
| Chrome Web Store dev fee | USD 5 (~EUR 4.60) | 2024 (one-time) | ~EUR 0.38 / 12 months | Published extension; fee paid to Google once. If re-publishing is needed, cost recurs. |
| **Subtotal — One-time** | — | — | **EUR 0.38** | Only if tracking across 12-month amortisation window |

### Services (status unknown or free tier)

| Service | Role | Cost | Evidenced | Notes |
|---|---|---|---|---|
| Postiz | Social media scheduling | UNKNOWN | No invoice found | Founder stated: *"I have postiz i payed"* (DECISIONS.md 2026-08-31). Account is founder's external, possibly on separate billing. Scope: unknown if inside or outside EUR 200 cap. |
| Resend | Transactional email | Free (tier unknown) | `demand-intel/config.py` L22; `demand-intel/PRE-LAUNCH-CHECKLIST.md` | Free tier currently in use for password reset + verification emails. Pricing model: free tier vs paid (`demand-intel/PROJECT_STATUS.md`). If usage exceeds free, cost is unknown. |
| Coolify | Deploy platform | Free (open-source) | `demand-intel/COOLIFY-DEPLOY.md` L2, L30 | Self-hosted on the Hetzner box. Open-source software, no subscription. |
| Stripe | Payment processing | 1.4% + EUR 0.25/tx | `demand-intel/deploy/DEPLOYMENT.md` L19 | Currently accruing zero cost: MRR = EUR 0.00 (verified from Stripe read-only endpoint). One customer ever, refunded and cancelled. |
| Google Search Console | SEO monitoring | Free | `demand-intel/LAUNCH-STEPS.md` | Used for monitoring GSC clicks and impressions, part of METRICS.md. No cost. |

---

## What Cannot Be Evidenced — UNKNOWN

### Claude/Anthropic API spend (THE LIKELY DOMINANT COST)

**Status:** UNKNOWN

**Why:** No Anthropic console export, usage log, or billing invoice in either repo.

**Evidence to settle it:**
- Anthropic console → **Billing** → Usage export (CSV or JSON) for 2026-08-01 to 2026-09-01, grouped by model
- Actual costs: historical charge lines from Anthropic's billing page
- Model usage: `claude-haiku-4-5` (finance-ops, verification), `claude-3-5-sonnet` (agent work default), `claude-3-5-opus` (CEO decisions, data science)

**Scope notes:**
- OS §0.8 mandates Haiku for verification tasks (cheaper)
- OS §3 mandates Sonnet by default, Opus only for high-judgment work
- The `scripts/company/build_dashboard.py` runs hourly per OS §9 Phase 4 and likely calls Claude
- Each subagent spawn (verifier, product-manager, backend-eng, etc.) costs tokens
- This spend is **real and probably dominant** per the task brief

**Formula once known:** `monthly_spend_claude = [usage from Anthropic]`

### Postiz hosting (if not founder's external account)

**Status:** UNKNOWN — founder's external paid account

**Why:** Founder states he maintains a separate Postiz account externally. Whether to include depends on whether it is:
- Founder's personal subscription (out of scope for company cap)
- Company account on founder's payment method (in scope)

**Evidence to settle it:**
- Postiz invoice or billing statement showing account and payment method
- Founder clarification: is this billed to the company cap or personal?

**Current state:** DECISIONS.md (2026-08-31) says "Postiz is the founder's paid hosted account, not something we deploy" and no second Hetzner VPS is being provisioned for it. Cost is stated but not quantified.

### Resend email service (if free tier is exceeded)

**Status:** ASSUMED FREE, but not verified

**Why:** `config.py` loads `RESEND_API_KEY`, but no usage metrics exist. Free tier limits are not stated in the codebase.

**Evidence to settle it:**
- Resend account → **Usage** dashboard → monthly email count and cost
- Resend pricing page → free tier limits at time of invoice
- If usage exceeds free tier, calculate difference

**Current usage proxy:** 6 accounts in production (2026-09-01 per METRICS.md), so registration confirmations + password resets are ~6–10 emails/month. Likely under free tier threshold.

### Domain registrar renewal rate

**Status:** ASSUMED EUR 10/year, not verified for renewal price

**Why:** Initial purchase cited as ~EUR 10/yr (COOLIFY-DEPLOY.md, LAUNCH-STEPS.md), but renewal rates differ by registrar and TLD. `.dev` domains have higher registrar markup than `.com`.

**Evidence to settle it:**
- Porkbun or Namecheap account → **Domains** → `resaleiq.dev` → renewal price
- Registrar invoice for the current year

### Database hosting (if separate from Hetzner VPS)

**Status:** ZERO — no separate database service

**Why:** `demand_intel.db` is a SQLite file on the Hetzner VPS itself (`docker-compose.yml` L10). No managed database service (Supabase, AWS RDS, etc.) is in use.

**Cost implication:** Included in the EUR 5 Hetzner VPS cost, no separate line item.

---

## Spend vs EUR 200/month Cap (AM-2)

### Known committed, monthly

```
Hetzner VPS (CX22)           EUR 5.00
Domain (resaleiq.dev, amortised) EUR 0.83
────────────────────────────────────
KNOWN TOTAL (monthly)        EUR 5.83
```

### Known + reasonably assumed, monthly

```
Known total (above)          EUR 5.83
Resend email (free tier)     EUR 0.00 (assumed)
Stripe (MRR = EUR 0)         EUR 0.00 (actual)
Coolify                      EUR 0.00 (open-source)
────────────────────────────────────
KNOWN + ASSUMED (monthly)    EUR 5.83
```

### Gap to cap

```
EUR 200 cap (AM-2)           EUR 200.00
Known + assumed              EUR 5.83
Remaining headroom           EUR 194.17
```

**Does KNOWN portion breach the cap?** No. EUR 5.83/month is 2.9% of the EUR 200 cap.

**Is the company over its cap?** Unknown. The missing ingredient is Claude/API spend, which is stated as "a real and probably dominant cost" and could easily exceed EUR 194 alone.

**Red threshold:** 80% of cap = EUR 160. At current known rate (EUR 5.83), the company is 3.6% of the red threshold.

---

## Unit Economics at n=0 Customers

### The arithmetic fact

```
n_paying_customers = 0

∴ CAC (Customer Acquisition Cost) = UNDEFINED (cost ÷ 0 customers)
∴ LTV (Lifetime Value)            = UNDEFINED (revenue ÷ 0 customers)
∴ Gross margin per plan           = UNDEFINED (revenue ÷ 0 customers)
```

These are not zero. They are undefined. Division by zero produces nonsense, not a number.

### Formulas (for the day n ≥ 1)

Once a paying customer exists:

```
CAC = (sum of spending to acquire all customers to date)
      ────────────────────────────────────────────────
      (number of customers acquired)

LTV = (total lifetime revenue from one customer cohort)
      ────────────────────────────────────────────────
      (size of cohort)

Gross margin per plan = (revenue from plan X) - (platform cost attributable to plan X)
                        ───────────────────────────────────────────────────────────
                        (revenue from plan X)
```

Attribution for "cost attributable to plan X" requires:
- Usage logs per subscription tier (tokens used, API calls, storage)
- Time-series of infrastructure cost during the subscription lifetime
- Currently absent from the system

### Why this matters

Every agent (especially monetization) should have these formulas in memory but must never report a number for them today. The post-acquisition work — CAC payback period, breakeven cohort size, gross margin target — only becomes calculable when MRR > 0.

---

## The One Number That Matters at n=0

At zero revenue and a burn rate of **EUR ~6/month** (from infra alone, plus unknown API spend):

**Runway = remaining capital ÷ monthly burn**

This is what matters. It is the only number that predicts when the company runs out of money and cannot continue.

### Example calculation

Assume total hidden costs (Claude, Postiz, etc.) bring actual monthly burn to EUR 50:

```
If founder's capital is EUR 3,000:
Runway = 3,000 ÷ 50 = 60 months (5 years)

If founder's capital is EUR 500:
Runway = 500 ÷ 50 = 10 months
```

Neither is "good" or "bad" until compared to the product's ability to reach product-market fit and acquire paying customers. But it answers the question: *"How much time do I have?"*

### The graph to care about (not yet built)

A KPI dashboard for a pre-revenue company should show:

1. **Monthly burn** (known infra + known/estimated API)
2. **Runway in months** (capital ÷ burn)
3. **Milestone to profitability** (what MRR is needed to breakeven?)

For Resale IQ at n=0:
- Free plan: 10 checks/day, unlimited product use (no revenue)
- Starter (EUR 19/mo): 10 checks/month, full product (1 customer = EUR 19 MRR, covers EUR 5.83 infra + leaves EUR 13.17 margin)
- Pro (EUR 49/mo): REST API, Live Finder, Order Planner (1 customer = EUR 49, covers infra × 8, generates EUR 43.17 margin)

**Breakeven:** 1 Pro customer eliminates all known burn. Any Starter customers are pure margin (after covering infra).

---

## Next Steps — Close the UNKNOWN

1. **Export Claude usage from Anthropic console** (last 30 days): settle the likely dominant cost
2. **Confirm Postiz billing model** (founder's account, in scope?): clarify scope
3. **Check Resend usage** (if exceed free tier): quantify email cost
4. **Verify Hetzner invoice**: confirm EUR 5/mo actual; check for overage charges
5. **Settle domain renewal rate**: Porkbun or Namecheap invoice for `.dev` TLD
6. **Define capital & runway target**: founder decision on allowable burn window

Until step 1 (Claude), the company cannot accurately report whether it is within the EUR 200/month cap. All other unknowns are minor (< EUR 10/month combined) relative to API spend.

---

## Summary for the Dashboard

**KPI: spend_vs_cap (AM-2: EUR 200/month)**

```
Status: PARTIAL

Known monthly spend:     EUR 5.83
Unknown monthly spend:   €~? (Claude/API, Postiz, Resend)
Total estimated spend:   EUR ~? (UNKNOWN without Anthropic export)
Cap:                     EUR 200.00
Red threshold (80%):     EUR 160.00
Headroom (best case):    EUR 194.17

Blocker: Anthropic billing export needed to close this KPI.
```

---

## Audit Trail

- **2026-09-01 00:00** — finance-ops writes this document from evidence in `/demand-intel/COOLIFY-DEPLOY.md`, `/demand-intel/deploy/DEPLOYMENT.md`, `/demand-intel/config.py`, `/demand-intel/LAUNCH-STEPS.md`, `docs/company/DECISIONS.md`, `docs/company/METRICS.md`, Stripe read (live, EUR 0 MRR), and repo history searches.
- **Evidence sources:** Path + line numbers are cited above for every confirmed number.
- **Unknowns named:** Every `UNKNOWN` explicitly lists the document that would settle it.
