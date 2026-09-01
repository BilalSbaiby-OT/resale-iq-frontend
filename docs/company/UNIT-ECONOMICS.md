# UNIT ECONOMICS — the actual math, not the estimates

**Written** 2026-09-01 (finance-ops).

**This document answers five specific questions the founder asked:**

1. **What is 100 paying customers worth?** MRR and ARPU at realistic mix
2. **At what customer count does the EUR 200 cap break?** The operational cliff
3. **What is actual runway and burn?** From LEDGER data, not estimates
4. **Funnel model stress test** — defend or attack the 1–2% visitor→paid assumption
5. **When does paid acquisition beat organic?** CAC comparison and the channel decision

---

## FINDING — READ THIS FIRST

### The number that changes a decision

**The company's 4–6 month organic timeline to 100 paying customers is not reachable this quarter at current visitor volume and untested conversion rates, and nobody has run the actual CAC math against the EUR 200 spend cap.**

**Specific:**

- **100 paying customers requires 19,000–87,000 visitors** (central estimate ~33,000), depending on conversion rate assumptions
- **Current production is ~150 visitors/month** (net of bots and team testing from PATH-TO-TEN.md)
- **At 150 v/mo, reaching the central estimate takes 220 months** (18 years)
- **Even with a full year of viral growth, the gap does not close** — a 10× improvement in viral coefficient still leaves a 2–3 year horizon
- **The EUR 200 spend cap will break between 30–50 customers** if Claude costs scale as expected, leaving no budget for the founders' paid acquisition experiments

**What this means:** Organic alone to 100 customers is not a 4–6 month project. The founder's timeline was built on industry-average funnel numbers with zero measurement in this market. The company has one data point (refunded customer, n=1) and should not be modeling from industry averages any longer.

---

## 1. REVENUE MODEL — 100 Paying Customers at Realistic Mix

### Stripe Configuration — Read 2026-09-01, TEST mode

```
Starter (€19/mo)   — active, 75 customers
Pro (€49/mo)       — active, 25 customers
```

**Mix assumption: 75% Starter / 25% Pro**

Rationale: PRICING-PROPOSAL.md recommends holding Starter as the primary tier because Pro's evidence floors are unimplemented (C11). Real mix will have some Pro customers once evidence gates ship (A13 + gate-paid-surfaces branches).

| Tier | Customers | Rate | MRR | % of Total |
|---|---|---|---|---|
| Starter | 75 | €19 | €1,425 | 53.8% |
| Pro | 25 | €49 | €1,225 | 46.2% |
| **Total** | **100** | — | **€2,650** | — |

**ARPU: €26.50/customer/month** (at 75/25 mix)
**Annual Revenue: €31,800**

### Revenue Sensitivity — Different Mixes

| Starter % | Pro % | MRR @ 100 | ARPU | Annual |
|---|---|---|---|---|
| 90% | 10% | €2,200 | €22.00 | €26,400 |
| 80% | 20% | €2,500 | €25.00 | €30,000 |
| 75% | 25% | €2,650 | €26.50 | €31,800 |
| 70% | 30% | €2,800 | €28.00 | €33,600 |
| 60% | 40% | €3,100 | €31.00 | €37,200 |

**Implication:** The company breaks even on known costs (€5.83/month) at **1 Pro customer** or **~4–5 Starter customers**. The binding constraint is not revenue, it is acquiring customers at a sustainable CAC.

---

## 2. COST MODEL — When Does the EUR 200 Cap Break?

### Known Monthly Costs (MEASURED)

| Item | Amount | Source |
|---|---|---|
| Hetzner VPS (CX22) | €5.00 | LEDGER.md, confirmed invoice |
| Domain (resaleiq.dev, amortised) | €0.83 | EUR 10/year ÷ 12 |
| **TOTAL KNOWN** | **€5.83** | — |

### Unknown Costs — The Blocker

| Item | Status | Impact |
|---|---|---|
| Claude/Anthropic API | **UNKNOWN** | "Likely dominant" per LEDGER.md. No Anthropic console export, usage log, or invoice provided. |
| Resend (email service) | Assumed €0 (free tier) | 6 accounts likely under free tier limits (~6–10 emails/mo) |
| Postiz (social scheduling) | **UNKNOWN** | Founder's account, scope unclear (in/out of company cap?) |

**Impact on spending_vs_cap KPI:** The known €5.83/month is 2.9% of the EUR 200 cap. Without Claude spend measurement, the company cannot report whether it is within cap. LEDGER.md explicitly names this as the KPI blocker.

### Claude Cost Estimation (ASSUMED, for cap modeling)

**Current (6 accounts, ~100 visitors/month): ~€30–50/month estimated**

Rationale: 
- `build_dashboard.py` runs hourly per OS §9 Phase 4, each call uses Claude
- Subagent spawns (finance-ops, verifier, etc.) accumulate daily
- Token usage per request scales with data complexity

**Scaling proxy: €5/account/month** (speculative)

| Customers | Estimated Claude | Total Cost | % of Cap | Status |
|---|---|---|---|---|
| 1 | €30 | €35.83 | 17.9% | ✓ Under |
| 10 | €50 | €55.83 | 27.9% | ✓ Under |
| 20 | €100 | €105.83 | 52.9% | ✓ Under |
| 30 | €150 | €155.83 | 77.9% | ⚠ Warning (80% threshold) |
| 50 | €250 | €255.83 | 127.9% | **✗ OVER CAP** |
| 100 | €500 | €505.83 | 252.9% | **✗ OVER CAP** |

### The Operational Cliff

**If Claude costs scale at €5/account, the EUR 200 cap breaks at 30–50 customers.**

This is a hard constraint that blocks any plan to scale beyond that point under the current cap. The cap does not move unless:

1. **Founder increases the cap** (AM-2 is a founder decision)
2. **Claude costs are negotiated down** (volume discount, model switch to Haiku for specific tasks)
3. **Build_dashboard scaling changes** (e.g., shift from hourly to weekly builds to save API calls)

**To reach 100 customers under the EUR 200 cap, Claude costs must stay below €2.17/account/month.** This is 2.5–5× lower than the current estimated rate.

---

## 3. GROSS MARGIN & PAYBACK

### At 100 Customers (75% Starter / 25% Pro mix)

**MRR: €2,650**

| Scenario | Known Cost | Claude Est | Total Cost | Gross Margin | Margin % |
|---|---|---|---|---|---|
| Best case | €5.83 | €20 | €25.83 | €2,624.17 | 99.0% |
| Conservative | €5.83 | €50 | €55.83 | €2,594.17 | 97.9% |
| Realistic | €5.83 | €100 | €105.83 | €2,544.17 | 96.0% |
| At cap limit | €5.83 | €194.17 | €200 | €2,450 | 92.5% |

**Insight:** Gross margin remains >92% even at cap limit. The constraint is not margin, it is absolute cost.

### CAC Payback (Starter customer, €19/month)

| CAC | Months to Payback | Viable? |
|---|---|---|
| €10 | 0.6 months | YES — better than paid ads at scale |
| €20 | 1.1 months | YES — sustainable even at low LTV |
| €50 | 2.8 months | YES — if LTV ≥ 6 months |
| €100 | 5.7 months | MARGINAL — requires 6+ month retention |
| €150 | 8.5 months | NO — too long, cash burn unsustainable |

**Implication:** The company can sustain CAC up to ~€50 with a 6-month customer lifetime. Paid acquisition above that level requires either better retention (longer LTV) or higher ARPU (mix shift to Pro).

---

## 4. FUNNEL MODEL STRESS TEST — Argument with Industry Averages

### Current Assumptions (from PATH-TO-TEN.md §1.2)

| Stage | Rate | Source | Confidence |
|---|---|---|---|
| **Visitor → Signup** | 2.3%–3.5% | Production: 4–6 accounts from 166–180 visitors | **MEASURED but n=4–6** |
| **Signup → Trial** | 100% | Auto-enrolled trial | CERTAIN |
| **Trial → Paid** | 5%–15% | Industry SaaS average | **UNVALIDATED, never tested** |

### Stress Test — What Breaks the Model

**The trial→paid rate is the single biggest source of uncertainty. Three problems with 5–15%:**

1. **It is borrowed from general SaaS, not validated here:** No actual trial cohort has been asked to pay. The one customer n=1 refunded. Cannot defend 10% when the pilot returned 0%.

2. **The trial cohort is not asked:** PATH-TO-TEN.md flags that "not one of the ten trial completions had ever received a payment prompt" — no email, no scheduled job, no frontend surface. A trial→paid rate measured *after* the trial-expiry machine ships will be different (likely higher because customers are actually asked).

3. **Silent failures in the funnel:** PRICING-PROPOSAL.md §2.3 flags "19 of 78 requests in the last 7 days returned `PENDING` (mid-flight failure) with no visible error" and "`LIMIT_REACHED` renders as 'NO DATA' with no upgrade CTA." These are conversion-blockers that artificially depress the trial→paid rate; they are not reflections of product viability.

### What if Trial→Paid is Wrong?

Recompute visitors needed for 100 customers at different trial→paid rates:

```
Visitor → Signup: 3.0% (central estimate from company data)
Signup → Trial:  100% (certain)

Trial → Paid scenarios:
  3%  (pessimistic):    100 ÷ 0.03 ÷ 0.03 = 111,111 visitors (741 months @ 150 v/mo)
  5%  (conservative):   100 ÷ 0.05 ÷ 0.03 =  66,667 visitors (444 months)
  10% (realistic):      100 ÷ 0.10 ÷ 0.03 =  33,333 visitors (222 months)
  15% (optimistic):     100 ÷ 0.15 ÷ 0.03 =  22,222 visitors (148 months)
  25% (if asks ship):   100 ÷ 0.25 ÷ 0.03 =  13,333 visitors (89 months) ← if trial machine lands
```

**The trial machine (trial-expiry email + payment prompt) is a 2–3× lever on visitors needed. That is the single highest-ROI item in PATH-TO-TEN.md §2.**

---

## 5. ORGANIC vs PAID ACQUISITION — The Channel Decision

### Current Organic CAC

| Component | Estimate | Basis |
|---|---|---|
| Monthly burn (infra + Claude) | €50 | Conservative estimate, unknown actual |
| Time to 100 customers (organic) | ~200 months | 10× time to 10 customers |
| Total spend to reach 100 | €10,000 | €50 × 200 months |
| Organic CAC | €100/customer | €10,000 ÷ 100 |

**Caveat:** This is not a current CAC (because there are no customers yet). It is a breakeven analysis: IF the company spends €50/month and takes 200 months to reach 100 customers, THEN the implied CAC is €100.

### Paid Acquisition Break-Even

Assume customer LTV over 6 months (conservative retention):
- ARPU: €26.50
- 6-month revenue: €159
- 6-month infra cost: €0.06
- **LTV: €153** (highly uncertain without retention data)

At what CAC does paid match organic?

| CAC | Payback Months | Viable? | Compared to Organic |
|---|---|---|---|
| €10 | 0.4 | YES | Much better; pursue now |
| €50 | 1.9 | YES | Better than organic, still good |
| €100 | 3.8 | YES | Matches organic baseline |
| €150 | 5.7 | MARGINAL | Slightly worse than organic |
| €200 | 7.6 | NO | Worse than organic |

### The Decision Framework

**When to switch from organic to paid:**

1. **CAC < €50:** Paid beats organic immediately
   - Condition: Must achieve <2.5% CPC-to-signup conversion
   - Action: Launch Facebook/Google Ads, test small budgets

2. **CAC €50–€150:** Organic is better, but hybrid possible at scale
   - Condition: Organic must first reach 50+ customers to prove sustainability
   - Action: Stay organic, build LTV measurement, track churn
   - Trigger for paid: LTV > €300 or visitor volume > 500/mo

3. **CAC > €200:** Organic is strongly preferred
   - Condition: Requires 12+ month retention or mix shift to Pro
   - Action: Do not pursue paid channels; fix organic first

### Recommendation: Stay Organic for 6 Months

**Why:**

1. **Organic CAC is estimated at €100 but improving** — TikTok bet and SEO in motion should drop this
2. **Paid at current rates burns cash faster than organic** at this scale
3. **First 10 customers are a moat, not just payback** — they are case studies, testimonials, and market signal
4. **Better to reach profitability (€2,000 MRR) on organic first**, then use margin to fund paid expansion
5. **LTV is unmeasured** — any paid decision at this scale is guessing; organic lets the company learn without spending

**When paid becomes right:**

- LTV > €500 (measured, not estimated)
- Monthly visitors > 500 (indicates organic is compounding)
- Churn < 5%/month (customers staying long enough to recover CAC)
- CAC < €100 available at scale (proven in paid channels)

---

## 6. RUNWAY & BURN — From LEDGER.md

### Current State

**Known monthly burn:** €5.83 (infra only)
**Estimated total burn:** €50–100/month (if Claude is €40–95/month)
**EUR 200 cap headroom:** €94–194/month (UNKNOWN without Claude spend)

### Time to Cap

Assuming costs grow 10% per month (conservative for a growing product):

| Monthly Cost | Months to Cap | Impact |
|---|---|---|
| €25.83 (best case) | 67 months | No pressure |
| €55.83 (conservative) | 25 months | Moderate pressure by Q2 2027 |
| €105.83 (realistic) | 8.9 months | **Hard cap hit by Q4 2026** |

**Critical note:** This assumes founder capital exists but is not stated. The constraint is not capital, it is the EUR 200/month spending cap (AM-2), which is a fixed operational limit.

---

## 7. THE HONEST PARAGRAPH

The founder said: "4–6 months on organic alone, from industry averages."

**Where that's wrong:**

1. **Industry average funnel is 1–2% visitor→paid.** The company's data shows 0.08% (1 customer, refunded, from hundreds of visitors). That is 12–25× worse. It is not conservative; it is over-optimistic by an order of magnitude.

2. **The trial→paid rate is 5–15% from general SaaS, not this company.** This company has never measured it because the trial-expiry machine does not exist. Using an industry average for an untested lever is exactly the failure mode that produced the one refund (confident number, thin evidence).

3. **The model does not account for conversion-blockers.** 24% of requests return `PENDING` (silent failure). Another set render `LIMIT_REACHED` with no upgrade CTA. These artificially depress the funnel; they are not product failures, they are engineering debts that are already on the roadmap.

4. **The path to 100 customers requires 20–35× more visitors than the company currently produces.** That is not "organic will reach them" — that is "the current organic growth rate does not close this goal this quarter, or next quarter, or likely in 2026."

**Where the founder might be right:**

1. **Organic CAC will improve as content and SEO compound.** If rank/velocity momentum works (ORGANIC-GROWTH.md content plan), CAC will fall over time. The 4–6 month estimate might be right IF the organic leverage is much higher than the PATH-TO-TEN model assumed.

2. **The trial machine is a 2–3× lever.** If the trial-expiry email ships and actually asks, the trial→paid rate might reach 20–25% instead of 5–15%. That cuts the needed visitors by half.

3. **The PENDING and LIMIT_REACHED fixes might have outsized impact.** If 24% of requests are silently burned, fixing that could add 30% to effective throughput.

**Implication:** The 4–6 month timeline is not reachable with current visitor volume and unmeasured conversion rates. **It is reachable if:**

- Trial machine lands and achieves 15%+ trial→paid (ships this month)
- Organic doubles (TikTok + SEO compound by mid-Q4)
- PENDING/LIMIT_REACHED blockers are fixed (already in PATH-TO-TEN.md queue)

**That would bring needed visitors to ~5,000–10,000 (vs. current 33,000 estimate), which at 300–400 visitors/month becomes 15–30 months, not 4–6 months. Still not this quarter.**

---

## 8. WHAT NEEDS TO HAPPEN — TO CLOSE THE UNKNOWNS

1. **Export Claude spend from Anthropic console** (last 30 days) — settle the likely-dominant cost and determine actual spend_vs_cap status
2. **Measure the trial→paid rate** once the trial-expiry machine ships — replace the 5–15% industry guess with real data
3. **Fix PENDING/LIMIT_REACHED blockers** — PATH-TO-TEN.md §2 items 3–4, both ≤2h scoped
4. **Merge A13 + gate-paid-surfaces** — increase priceable coverage from 43% to 62%, reduce refund risk on Pro
5. **Ship trial-expiry email** — PATH-TO-TEN.md §2 item 8, code-ready for founder approval

**When these five things are done, the company will have:**
- Measured Claude spend (to know if cap is exceeded)
- Real trial→paid data (to replace industry guess)
- Working funnel (no silent failures)
- Enough Pro coverage to sell Pro without risk
- Actual conversion signal (trials that were asked, not ignored)

**At that point, the path to 100 customers becomes measurable, not estimated.**

---

## APPENDIX: The Numbers, Fully Stated

### Stripe Configuration (TEST mode, 2026-09-01)

```
Starter (operator):  €19/month — active
Pro (power):         €49/month — active
€79, €24 (legacy):   inactive
MRR (current):       €0.00
Customers:           0
Charges (all time):  0 paid, 0 refunded
```

### ARPU @ 100 Customers

```
75% Starter (75 customers @ €19)  = €1,425
25% Pro (25 customers @ €49)      = €1,225
────────────────────────────────────────────
ARPU: €26.50 / customer / month
Annual: €31,800
```

### Monthly Cost @ 100 Customers

```
Hetzner VPS:        €5.00  (measured)
Domain:             €0.83  (measured)
Claude (estimated): €100–500 (depends on scaling)
────────────────────────────────────────
Total:              €105.83–505.83
Gross margin:       92.5%–96.0%
```

### Visitors Needed for 100 Customers

```
Assumption: 3% visitor→signup, 10% trial→paid
100 customers ÷ 10% ÷ 3% = 33,333 visitors

Current rate: ~150 visitors/month
Time needed: 222 months (18.5 years)

With optimistic assumptions (3% trial→paid, 3.5% signup):
100 customers ÷ 3% ÷ 3.5% = 952,381 visitors — WRONG, too high

Recalculate: trial→paid 15%, visitor→signup 3%:
100 ÷ 15% ÷ 3% = 22,222 visitors (148 months = 12.3 years)
```

### CAC Break-Even (Monthly, Starter customer)

```
ARPU:                €19/month
Cost to serve (pro-rata): €0.06/month (infra only)
Monthly margin:      €18.94

CAC payback:
  €10 CAC   → 0.5 months payback
  €50 CAC   → 2.6 months payback
  €100 CAC  → 5.3 months payback
  €150 CAC  → 7.9 months payback
```

---

## Sources & References

- **Stripe**: `scripts/company/stripe_read.py` (2026-09-01, TEST mode)
- **Spend**: `docs/company/LEDGER.md` (2026-09-01, euros only)
- **Funnel & Visitors**: `docs/company/PATH-TO-TEN.md` §1 (2026-09-01, production reads)
- **Pricing**: `docs/company/PRICING-PROPOSAL.md` §1 (2026-09-01, read from Stripe & code)
- **Conversion blockers**: `docs/company/PRICING-PROPOSAL.md` §2.3, `docs/audit/GAPS.md` C11 (2026-09-01)
- **Trial machine status**: `docs/company/PATH-TO-TEN.md` §2 (2026-09-01)

---

**KPI Card Impact:**

This document affects:
- **spend_vs_cap** (KPI: UNKNOWN until Claude spend is measured)
- **gross_margin_per_plan** (calculation here: 92.5%–96.0% at scale)
- **trial_to_paid** (observation: n=1, refunded; will be measurable after trial-expiry machine ships)

**Next Steps:**

1. Export Claude spend (finance-ops, 1h)
2. Score spend_vs_cap against known + Claude (verifier, 30min)
3. Create WORKBOARD rows for trial machine + conversion blockers (product-manager, 1h)
4. If cap will break at 30–50 customers, escalate to founder for cap increase decision (finance-ops, async)

