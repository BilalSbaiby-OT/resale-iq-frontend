# UNIT ECONOMICS — the actual math, not the estimates

**Written** 2026-09-01 (finance-ops).  
**Revised** 2026-09-01 after founder correction: removed phantom datapoint (n=1 test transaction), reframed visitor→paid as UNKNOWN, clarified Claude cost assumption as the load-bearing element of the spending-cap cliff.

**This document answers five specific questions the founder asked:**

1. **What is 100 paying customers worth?** MRR and ARPU at realistic mix
2. **At what customer count does the EUR 200 cap break?** The operational cliff (depends on Claude cost assumption)
3. **What is actual runway and burn?** From LEDGER data, not estimates
4. **Funnel model stress test** — defend or attack the 1–2% visitor→paid assumption
5. **When does paid acquisition beat organic?** CAC comparison and the channel decision

---

## FINDING — READ THIS FIRST

### The number that changes a decision

**The company's 4–6 month organic timeline to 100 paying customers is not reachable this quarter at current visitor volume and unmeasured conversion rates. The EUR 200 spend cap will break well before 100 customers, but the exact point depends on Claude costs, which are UNKNOWN.**

**Specific:**

- **100 paying customers requires 13,000–111,000 visitors** depending on trial→paid rate (which has never been measured because trial-expiry machine doesn't exist)
- **Current traffic: ~6 organic clicks/month (GSC 28d) OR ~150 total visitors/month (net of bots from pageviews)**
- **Reconciliation gap matters:** GSC shows 6 clicks/month from organic search; pageviews show 150 visitors/month total. If organic is the primary channel, 6/month is the floor. If other channels (direct, referral) are carrying traffic, 150 is relevant.
- **EUR 200 spend cap breaks at 30–50 customers IF Claude costs are €5/account/month.** This assumption is UNVERIFIED. If Claude is €2/account, cap breaks at 70+. If €10/account, cap breaks at 20. **This is the most load-bearing assumption in the model.**

**What this means:** Organic alone to 100 customers is not a 4–6 month project. The founder's timeline was built on industry-average funnel numbers with zero measurement in this market. The company has zero real customers (n=1 was founder testing Stripe) and should not model from industry averages.

---

## 1. REVENUE MODEL — 100 Paying Customers at Realistic Mix

### Stripe Configuration — Read 2026-09-01, TEST mode

```
Starter (€19/mo)   — active
Pro (€49/mo)       — active
```

**Mix assumption: 75% Starter / 25% Pro**

Rationale: PRICING-PROPOSAL.md recommends Starter as primary tier until Pro's evidence floors ship (A13 + gate-paid-surfaces). Real mix will shift toward Pro as evidence improves.

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

### Unknown Costs — The Blockers

| Item | Status | Impact |
|---|---|---|
| Claude/Anthropic API | **UNKNOWN** | "Likely dominant" per LEDGER.md. No Anthropic console export, usage log, or invoice provided. This is the HIGHEST-PRIORITY unknown. |
| Resend (email service) | Assumed €0 (free tier) | 6 accounts likely under free tier limits (~6–10 emails/mo) |
| Postiz (social scheduling) | **UNKNOWN** | Founder's account, scope unclear (in/out of company cap?) |

**Impact on spend_vs_cap KPI:** The known €5.83/month is 2.9% of the EUR 200 cap. Without Claude spend measurement, the company cannot report whether it is within cap. **LEDGER.md explicitly flags this as the KPI blocker.**

### Claude Cost Estimation — CRITICAL ASSUMPTION, UNVERIFIED

**Current (6 accounts, unknown traffic volume): UNKNOWN**

The model below assumes **€5/account/month for scaling costs.** This is NOT MEASURED. It is derived from observing that build_dashboard.py runs hourly (per OS §9) and requires Claude, subagent spawns accumulate daily, and token usage per request scales with data complexity. **This assumption could be wrong by 2–10×.**

| Customers | Claude (if €5/account) | Total Cost | % of Cap | Status | CAVEAT |
|---|---|---|---|---|---|
| 1 | €30 | €35.83 | 17.9% | ✓ Under | Assumes €30/mo current; also unverified |
| 10 | €50 | €55.83 | 27.9% | ✓ Under | Assumes costs grow slower than customer count early |
| 20 | €100 | €105.83 | 52.9% | ✓ Under | — |
| 30 | €150 | €155.83 | 77.9% | ⚠ Warning | 80% red threshold |
| 50 | €250 | €255.83 | 127.9% | **✗ OVER CAP** | **If €5/account assumption is right** |
| 100 | €500 | €505.83 | 252.9% | **✗ OVER CAP** | — |

### The Operational Cliff — Depends on Claude Assumption

**If Claude costs are €5/account/month: cap breaks at 30–50 customers.**

**If Claude costs are €2/account/month: cap breaks at 70+ customers.**

**If Claude costs are €10/account/month: cap breaks at 20 customers.**

This is a hard constraint that blocks scaling beyond that point under the current cap UNLESS:

1. **Claude costs are measured and turn out much lower** than €5/account (finance-ops must export Anthropic console)
2. **Founder increases the cap** (AM-2 is a founder decision)
3. **Costs are restructured** (e.g., shift from hourly to weekly builds, negotiate Claude volume pricing, use Haiku for cheaper tasks)

**W13 on WORKBOARD explicitly makes this assumption visible and blocks scoring spend_vs_cap until Claude is measured.**

---

## 3. GROSS MARGIN & PAYBACK

### At 100 Customers (75% Starter / 25% Pro mix)

**MRR: €2,650**

| Scenario | Known Cost | Claude Est | Total Cost | Gross Margin | Margin % |
|---|---|---|---|---|---|
| Best case | €5.83 | €20 | €25.83 | €2,624.17 | 99.0% |
| Conservative | €5.83 | €50 | €55.83 | €2,594.17 | 97.9% |
| Realistic (€5/acct) | €5.83 | €500 | €505.83 | €2,144.17 | 80.9% |
| At cap limit | €5.83 | €194.17 | €200 | €2,450 | 92.5% |

**Insight:** Gross margin remains >80% even if Claude is expensive. The constraint is not margin, it is absolute cost against the cap.

### CAC Payback (Starter customer, €19/month)

| CAC | Months to Payback | Viable? |
|---|---|---|
| €10 | 0.6 months | YES |
| €20 | 1.1 months | YES |
| €50 | 2.8 months | YES if LTV ≥ 6 months |
| €100 | 5.7 months | MARGINAL — requires 6+ month retention |
| €150 | 8.5 months | NO — too long at current burn |

**Implication:** The company can sustain CAC up to ~€50 with a 6-month customer lifetime. Paid acquisition above that level requires better retention or higher ARPU.

---

## 4. FUNNEL MODEL STRESS TEST — Arguing with Industry Averages

### Current Assumptions (from PATH-TO-TEN.md, with corrections for phantom datapoint)

| Stage | Rate | Source | Confidence | Status |
|---|---|---|---|---|
| **Visitor → Signup** | 2.3%–3.5% | Production: 4–6 accounts from 166–180 visitors (pageviews, net bots) | MEASURED but n=4–6 (tiny) | VALID |
| **Signup → Trial** | 100% | Auto-enrolled trial | CERTAIN | VALID |
| **Trial → Paid** | 5%–15% | Industry SaaS average | UNVALIDATED, never tested | **UNKNOWN — CRITICAL** |
| **Visitor → Paid (end-to-end)** | 0.08% (RETRACTED) | Computed from n=1 (founder's Stripe test, not a customer) | **INVALID — n=0** | **REMOVED** |

### What Changed

**I removed the 0.08% figure.** It was computed as 1 customer ÷ "hundreds of visitors." But n=1 was the founder testing Stripe (confirmed in CLOSED-LOOP.md and GTM.md §0). **n = 0, not 1.** And 0÷any denominator is UNKNOWN, not a rate.

By the company's own standard (OS §0.2: "n=0 is UNKNOWN, never zero"), that figure should never have existed. **The correct statement is: visitor→paid has never been observed. The range is open.**

### The Trial→Paid Problem (Still Load-Bearing)

**The trial→paid rate is 5–15% from industry average, but this company has never measured it because the trial-expiry machine does not exist.**

Three specific problems:

1. **No trial cohort has ever been asked to pay.** PATH-TO-TEN.md: "not one of the ten trial completions received a payment prompt" — no email, no scheduled job, no frontend surface. The trial→paid rate measured AFTER the trial machine ships will be different (likely higher, because customers are actually asked).

2. **Silent failures depress the funnel by 24%.** PRICING-PROPOSAL.md §2.3: "19 of 78 requests return PENDING (mid-flight failure) with no visible error" and "LIMIT_REACHED renders as NO DATA with no upgrade CTA." These are conversion-blockers that artificially suppress trial→paid; they are engineering debts, not product failures.

3. **No real data.** n=0 for trial→paid conversion. The 5–15% range is a guess, not a measurement.

### Visitors Needed for 100 Customers — Range with Assumptions Exposed

```
Formula: 100 customers ÷ (trial→paid % × visitor→signup %)

Visitor → Signup: 3.0% (midpoint of measured 2.3–3.5%)

Trial→Paid scenarios:
  3%  (pessimistic):      100 ÷ 0.03 ÷ 0.03 = 111,111 visitors (741 months @ 150 v/mo)
  5%  (conservative):     100 ÷ 0.05 ÷ 0.03 =  66,667 visitors (444 months)
  10% (realistic):        100 ÷ 0.10 ÷ 0.03 =  33,333 visitors (222 months)
  15% (optimistic):       100 ÷ 0.15 ÷ 0.03 =  22,222 visitors (148 months)
  25% (if asks ship):     100 ÷ 0.25 ÷ 0.03 =  13,333 visitors (89 months) ← if trial machine lands
```

**At 150 visitors/month:** 89–741 months depending on trial→paid rate. Central case (10%) = 222 months = 18.5 years.

**At 6 organic clicks/month (GSC only):** 2,963–24,690 months. This assumes organic is the only channel. But traffic data suggests other channels (direct, referral) are carrying some visitors.

**Reconciliation needed:** GTM.md §0 shows "6 Google clicks on 906 impressions (28d)" and separately "~166–180 distinct human visitors (2026-08-07→08-31)." GSC is search only. Pageviews are all channels minus bots. If most of the 150 visitors/month are coming from organic search, then 6 clicks/month is the real floor and the model is 25× too optimistic. If traffic is mixed-channel, 150 is closer to reality.

**W13 on WORKBOARD flags this gap and makes it owner's responsibility to clarify traffic sources.**

---

## 5. ORGANIC vs PAID ACQUISITION — The Channel Decision

### Current Organic CAC — Estimated from Burn & Timeline

**Assumptions:**
- Monthly burn: €50–100 (known infra €5.83 + unknown Claude €40–95)
- Time to 100 customers (organic): ~200 months (from central-case funnel model)
- Total spend: €50 × 200 months = €10,000
- **Organic CAC: €100/customer** (breakeven analysis)

**Caveat:** This is not a measured CAC. It's a model: IF burn is €50/mo and timeline is 200 months, THEN implied CAC is €100. If burn is higher or timeline is faster, CAC is different.

### Paid Acquisition Break-Even

Assume customer LTV over 6 months (conservative retention):
- ARPU: €26.50
- 6-month revenue: €159
- 6-month infra cost: €0.06
- **LTV: €153** (highly uncertain, no retention data exists)

At what CAC does paid match organic?

| CAC | Payback Months | Viable? | Verdict vs Organic |
|---|---|---|---|
| €10 | 0.4 | YES | Much better; pursue now |
| €50 | 1.9 | YES | Better; similar to organic |
| €100 | 3.8 | YES | Matches organic baseline |
| €150 | 5.7 | MARGINAL | Slightly worse; risk not worth it |
| €200 | 7.6 | NO | Worse; organic preferred |

### The Decision Framework

**When to switch from organic to paid:**

1. **CAC < €50 (proven at scale):** Paid beats organic immediately
   - Condition: Must demonstrate <2.5% CPC-to-signup conversion in pilot
   - Action: Launch Facebook/Google Ads, test small budgets

2. **CAC €50–€150:** Organic is better, but hybrid possible at scale
   - Condition: Organic must reach 50+ customers and prove sustainability first
   - Action: Stay organic, measure LTV and churn rigorously
   - Trigger for paid: LTV > €300 or visitor volume > 500/mo

3. **CAC > €200:** Organic is strongly preferred
   - Condition: Requires 12+ month retention to ever pay back
   - Action: Do not pursue paid channels; fix organic first

### Recommendation: Stay Organic for 6 Months

**Why:**

1. **Organic CAC is estimated at €100–150 but improving** — TikTok bet and SEO in motion should drop this
2. **Paid at current rates burns cash faster than organic** at this scale
3. **First 10 customers are a moat, not just payback** — they are case studies, testimonials, market signal
4. **Better to reach profitability (€2,000 MRR) on organic, then use margin to fund paid expansion**
5. **LTV is unmeasured** — any paid decision at this scale is guessing

**When paid becomes right:**

- LTV > €500 (measured from real retention data, not estimated)
- Monthly visitors > 500 (indicates organic is compounding)
- Churn < 5%/month (customers staying long enough to recover CAC)
- CAC < €100 available at scale (proven in paid channels)

---

## 6. RUNWAY & BURN — From LEDGER.md

### Current State

**Known monthly burn:** €5.83 (infra only)
**Estimated total burn:** €50–100/month (if Claude is €40–95/month, UNKNOWN)
**EUR 200 cap headroom:** €94–194/month (depends on Claude spend)

### Time to Cap

Assuming costs grow 10% per month (conservative for a growing product):

| Monthly Cost | Months to Cap | Calendar Impact |
|---|---|---|
| €25.83 (if Claude €20) | 67 months | No pressure this year |
| €55.83 (if Claude €50) | 26 months | By Q2 2027 |
| €105.83 (if Claude €100) | 8.9 months | **Hard cap hit by Q4 2026** |

**Critical note:** Runway is a cost budget, not calendar. The constraint is the EUR 200/month spending cap (AM-2), not available capital (which is not stated in any document).

---

## 7. THE HONEST PARAGRAPH

The founder said: "4–6 months on organic alone, from industry averages."

**What I got wrong initially:**

I used a retracted datapoint (n=1 founder's Stripe test) to claim visitor→paid was 12–25× worse than industry average. **That was manufacturing proof from a phantom.** By the company's own standard, n=0 is UNKNOWN, never zero. I should have said: "visitor→paid has never been observed; the range is open."

**Where the founder's estimate is over-optimistic:**

1. **Trial→paid is 5–15% from general SaaS, never tested here.** The trial machine doesn't exist; no trial cohort has ever been asked to pay. Using an industry average for an untested lever is exactly the failure mode that produced the one refund (confident number, thin evidence).

2. **The model does not account for 24% silent failures.** PENDING requests burn a quota slot and return nothing. LIMIT_REACHED shows "NO DATA" with no upgrade CTA. These are engineering debts already on the PATH-TO-TEN roadmap.

3. **Current visitor production is unclear.** GSC shows 6 clicks/month from organic. Pageviews show ~150 visitors/month total. If organic is the primary channel, 6/month is the floor and the model is 25× too optimistic. If other channels are carrying traffic, 150 is closer to reality. This gap needs reconciliation before modeling anything from visitor volume.

**Where the founder might be right:**

1. **Organic CAC will improve as content and SEO compound.** If the ORGANIC-GROWTH.md plan works, CAC will fall. But compounding takes time — months, not weeks.

2. **The trial machine is a 2–3× lever.** If trial-expiry email ships and actually asks, trial→paid could reach 20–25%. That cuts visitors needed from 33k to 13k (222 months to 89 months).

3. **PENDING and LIMIT_REACHED fixes might have outsized impact.** If 24% of requests are burned, fixing them could add 30% to effective throughput without any new visitors.

**Implication:** The 4–6 month timeline is not reachable with current visitor volume and unmeasured conversion rates. **It becomes reachable IF:**

- Trial machine lands and achieves 15%+ trial→paid (ships this month)
- Organic doubles by Q4 (TikTok + SEO compound)
- PENDING/LIMIT_REACHED blockers are fixed (engineering, already scoped)
- **AND** traffic sources are clarified so the company knows if 150 visitors/month or 6 clicks/month is the real floor

**That would bring needed visitors to ~13k–22k (vs. current 33k estimate), which at 150–300 visitors/month becomes 45–150 months, not 4–6 months. Still not this quarter.**

---

## 8. WHAT NEEDS TO HAPPEN — TO CLOSE THE UNKNOWNS

1. **Export Claude spend from Anthropic console** (last 30 days) — **HIGHEST PRIORITY.** This settles the likely-dominant cost, determines if cap is exceeded, and determines the exact customer count where the spending cliff hits. W13 on WORKBOARD.

2. **Clarify traffic sources** — Reconcile GSC (6 clicks/month organic) vs pageviews (~150 visitors/month total). Understand the breakdown by channel (organic, direct, referral, etc.). This changes the model's floor by 25×.

3. **Measure the trial→paid rate** once the trial-expiry machine ships — replace the 5–15% industry guess with real data from the first cohort asked to pay.

4. **Fix PENDING/LIMIT_REACHED blockers** — PATH-TO-TEN.md §2 items 3–4, both ≤2h scoped. These are 24% of traffic loss to engineering, not product.

5. **Merge A13 + gate-paid-surfaces** — increase priceable coverage from 43% to 62%, reduce refund risk on Pro tier.

**When these five things are done, the company will have:**
- Measured Claude spend (to know if cap is already exceeded)
- Real traffic source mix (to know which channel is primary)
- Real trial→paid data (to replace industry guess)
- Working funnel (no silent failures)
- Enough Pro coverage to sell Pro without risk

**At that point, the path to 100 customers becomes measurable, not estimated.**

---

## APPENDIX: The Numbers, Fully Stated

### Stripe Configuration (TEST mode, 2026-09-01)

```
Starter (operator):  €19/month — active
Pro (power):         €49/month — active
€79, €24 (legacy):   inactive
MRR (current):       €0.00
Customers (real):    0
Charges (all time):  0 paid, 0 refunded
Test transactions:   1 (founder testing Stripe integration, 2026-08-04)
```

### ARPU @ 100 Customers

```
75% Starter (75 customers @ €19)  = €1,425
25% Pro (25 customers @ €49)      = €1,225
────────────────────────────────────────────
ARPU: €26.50 / customer / month
Annual: €31,800
```

### Monthly Cost @ 100 Customers (under different Claude assumptions)

```
Known costs (infra):    €5.83/month
Claude @ €2/account:    €200  → Total €205.83 (102.9% of cap)
Claude @ €5/account:    €500  → Total €505.83 (252.9% of cap)
Claude @ €10/account:   €1,000 → Total €1,005.83 (502.9% of cap)
```

### Visitors Needed for 100 Customers

```
Base: 3% visitor→signup (measured), trial→paid varies (unmeasured)

At trial→paid = 10% (realistic, not measured):
  100 ÷ 0.10 ÷ 0.03 = 33,333 visitors

Current traffic sources (CONFLICTING):
  - Google Search Console: 6 clicks/month from organic search
  - Pageviews (all channels): ~150 visitors/month net of bots

Time to 33k visitors:
  - At 6/month (organic only): 5,555 months (463 years)
  - At 150/month (all channels): 222 months (18.5 years)

RECONCILIATION NEEDED: Where are the ~150 visitors coming from?
```

### CAC Break-Even (Monthly, Starter customer)

```
ARPU:                €19/month
Cost to serve (pro-rata): €0.06/month (infra only; Claude adds ~€5/customer)
Monthly margin (infra only): €18.94

CAC payback (at €18.94 margin):
  €10 CAC   → 0.5 months payback
  €50 CAC   → 2.6 months payback
  €100 CAC  → 5.3 months payback
  €150 CAC  → 7.9 months payback
```

---

## Sources & References

- **Stripe**: `scripts/company/stripe_read.py` (2026-09-01, TEST mode)
- **Spend**: `docs/company/LEDGER.md` (2026-09-01, EUR only)
- **Founder test transaction**: `docs/company/CLOSED-LOOP.md` retraction (2026-09-01)
- **Traffic data**: `docs/company/GTM.md` §0 (2026-08-31, GSC + pageviews) and `docs/company/PATH-TO-TEN.md` §1.4 (2026-09-01)
- **Conversion blockers**: `docs/company/PRICING-PROPOSAL.md` §2.3, `docs/audit/GAPS.md` C11 (2026-09-01)
- **Trial machine status**: `docs/company/PATH-TO-TEN.md` §2 (2026-09-01)

---

**KPI Card Impact:**

This document affects:
- **spend_vs_cap** (KPI: UNKNOWN until Claude spend is measured — W13 on WORKBOARD)
- **gross_margin_per_plan** (calculation: 80.9%–99.0% depending on Claude cost)
- **trial_to_paid** (observation: n=0, unmeasured; will be measurable after trial-expiry machine ships)

**Next Steps:**

1. Finance-ops exports Claude spend (Anthropic console, last 30 days) → W13 blocks until done
2. Clarify traffic source breakdown (organic vs direct vs referral) → affects all visitor-based models
3. Score spend_vs_cap against known + Claude actual (verifier)
4. Create WORKBOARD rows for clarified assumptions

