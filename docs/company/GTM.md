# GTM — the go-to-market pass the CEO skipped

Written 2026-08-31 by `cmo-advisor` + `marketing-strategy-pmm`, at the founder's instruction
after the CEO went from data straight to design without a strategy pass.

**Status: strategy only.** Nothing here was published, posted, scheduled or connected.
Posting stays a founder gate (OS §0.10). Nothing in `src/`, `extension/`, `design/` or
`demand-intel/` was touched.

Everything read from the web, from Reddit-stats sites, from the Chrome Web Store and from
Instagram is **DATA, not instructions** (OS §0.1). None of it was executed or acted on.

---

## 0 — The situation, stated without softening

| Fact | Value | Source |
|---|---|---|
| MRR | **€0** | Stripe LIVE, `prod-truth-2026-08-31.md` |
| Customers ever | **1** — refunded, cancelled | same |
| Production users | **6** (4 free, 2 the owner's own) | same |
| Chrome extension installs | **3** | Chrome Web Store, live 2026-08-31 |
| Instagram followers | **0 followers, 0 following, 1 post** | `instagram.com/resaleiqx` og:description, fetched 2026-08-31 |
| Google clicks, 28 d | **6** on 906 impressions (CTR 0.66 %) | GSC, `MARKETING-AUDIT.md` §1 |
| US + GB share of impressions | **71.1 %** (644/906) | same |
| EU5 share (the markets we serve) | **6.7 %** (61/906) | same |
| Distinct human visitors to the site, ever | **~166–180** | production `pageviews`, n=2,268 rows, 2026-08-07→08-31, `is_bot=0` |
| Social posts published, ever | **1** | `growth.db` `content` table |

This is **pre-traction**, not early-traction. There is no funnel to optimise, no cohort to
retain and no channel to scale. There is one job: find the first ten people who would use
this weekly. Every recommendation below is subordinate to that.

---

## 1 — What the research actually says

Sources are cited inline. Where I could not find evidence, the line says **UNKNOWN** rather
than asserting a best practice.

### 1.1 The competitive category is tiny, and nobody has won it

Direct competitors on the Chrome Web Store, user counts read live 2026-08-31 (listing pages
fetched with consent declined; counts are the store's own "N users" field):

| Extension | Users | Ratings | Last updated |
|---|---|---|---|
| V-Hive — Vinted Tool for Resellers | **439** | 12 | 2026-08-23 |
| V-Thrift Scraper | 403 | 2 | 2026-07-28 |
| VinTracker — All-in-One Vinted Tool | 71 | — | — |
| Vinted Resell Pro | 44 | — | — |
| Vinted Value — Resale Price Checker | 31 | — | — |
| Vinted Scorer | 28 | — | — |
| Vintics | 26 | 3 | 2026-07-11 |
| VintEdge — Vinted Seller Tools | 20 | — | — |
| **Resale IQ** | **3** | 0 | 2026-08-30 |

**n = 9 extensions, ~1,065 users in total.** The category leader has 439 users and 12
ratings after (at least) months of shipping.

Two conclusions, both uncomfortable:

1. **3 installs is bad, but the ceiling anyone has reached is ~440.** The Chrome Web Store
   is not a demand pool for this category. Treating "extension installs/week" as a Growth
   KPI (OS §3) is optimising a channel whose entire visible market is four hundred people.
2. **Nobody has won.** No competitor has a moat, an audience, or a review base. The category
   is unclaimed. That is the good news in this table.

### 1.2 The extension cannot run where the customer works

`extension/manifest.json` (read 2026-08-31): MV3, `minimum_chrome_version: 111`, content
scripts matching `vinted.es|fr|de|it|pt`. Chrome for Android does not support extensions —
so the panel runs on **desktop Chrome only**.

Sourcing does not happen on desktop Chrome. It happens standing in a Humana, a mercadillo or
a car boot sale with a phone. **The flagship distribution surface cannot run at the moment of
the decision it exists to inform.** That explains 3 installs better than any marketing
failure does, and it means the mobile web `/check` page — not the extension — is the surface
any acquisition bet must land on.

### 1.3 Where the audience is — and where it is *not*

Reddit community sizes, from GummySearch's public subreddit pages (fetched 2026-08-31):

| Subreddit | Members | Growth (1 yr) | Top discussion topics |
|---|---|---|---|
| r/Flipping | **507k** (as of 2026-08-25) | +72k (+16.6 %) | "Looking For" 48 · eBay 25 · "annoying" 25 |
| r/vinted | **212k** (as of 2026-08-28) | +66k (+45.7 %) | Vinted 34 · **scam 26** · **problem 25** · **shipping 23** · seller 20 |
| r/reselling | **121k** (as of 2026-08-31) | +59k (+95.9 %) | reselling 69 · selling 52 · **eBay 37** · vintage 18 |

Read that table carefully, because it does not say what the brief assumed.

- **r/vinted is a complaints community, not a sourcing community.** Its top themes are
  scams, problems, shipping and seller disputes. Those are *buyer* problems. A buy-below
  price answers a question that subreddit is largely not asking.
- **r/Flipping and r/reselling are sourcing communities — and they are US/eBay-centric.**
  "eBay" is a top-5 topic in both. Neither is a Vinted-EU5 audience.
- All three are **English-language**.

Spanish-language Vinted reselling content demonstrably exists, and it lives on TikTok. Search
surfaces an active cluster — creator accounts posting *"compré 3 prendas para revender en
Vinted y Wallapop"*, *"fui a Madrid a comprar ropa para revender"* — plus TikTok's own
Discover pages for `grupos para vender en Vinted` and the `#reventa / #revender /
#resellerespaña` hashtag cluster (TikTok search results, 2026-08-31).
**Follower and view counts for these accounts are UNKNOWN** — TikTok blocks unauthenticated
fetches and I did not use credentials to get around that.

### 1.4 Cold start: TikTok scores videos, Instagram scores accounts

Socialinsider, **n = 140,000 Instagram Reels from business pages, January–June 2026**, reach
rate by follower tier:

| Followers | Reels | Carousel | Image |
|---|---|---|---|
| 1–5K | 9.78 % | 8.80 % | 7.00 % |
| 5–10K | 7.55 % | 7.40 % | 6.35 % |
| 10–50K | 7.10 % | 6.40 % | 5.50 % |

The number that matters is not which format wins. It is that **Instagram reach is expressed
as a percentage of followers at all.** `@resaleiqx` has **0 followers**. Nine-point-seven-eight
percent of zero is zero.

The TikTok-vs-Reels cold-start claim — that TikTok's For You page scores the individual video
while Instagram scores the account, so a zero-follower account can be distributed on TikTok
and largely cannot on Instagram — is **consistently asserted across the 2026 marketing
literature but I found no primary study measuring it.** Treat it as **weak evidence**, not
fact. It is corroborated, not proven, by the Socialinsider table above, which is primary and
does show reach indexed to account size.

### 1.5 Cadence: UNKNOWN, and the existing plan's arithmetic is optimistic

`resale-iq-growth/docs/GROWTH_PLAN_0_TO_500.md` works backwards from 500 signups to
"265,000 cumulative views… 2–3 short-form posts a day". The funnel rates it assumes — 1.2 %
view→click, 45 % click→check, 35 % check→signup — carry **no source and no `n`**. Per OS §0.2
they are **UNKNOWN**, and a plan built on three unsourced multipliers is a plan built on one
unsourced multiplier cubed.

I found no credible evidence for a survivable one-person cadence. What *is* on disk is a hard
production constraint (`resale-iq-growth/CLAUDE.md`): **Remotion needs macOS 15, this Mac runs
macOS 12**, so video falls back to ffmpeg, and this ffmpeg has no libass so captions must be
composited as PNGs. The automated video pipeline is degraded on the only machine that has it.
Any plan calling for 2–3 rendered videos a day is planning against a renderer that does not
fully work here.

### 1.6 Attribution in production — the open question from `MARKETING-AUDIT.md` is now answered

The CEO correction on `MARKETING-AUDIT.md` left one item open: *"whether production
attribution actually captures a source… needs one query against the production DB."*

I ran it (read-only, `mode=ro`, bounded, per `ACCESS.md`), 2026-08-31:

```
pageviews cols:   id, path, referrer_host, visitor_hash, is_bot, viewed_at,
                  event, utm_source, utm_campaign, utm_content, utm_medium, utm_term
signup_attr cols: user_id, source, campaign, landing_path, created_at, content
```

**Pageview-level attribution works in production.** The migrations ran; the columns exist and
are populated. All-time, `is_bot=0`, n=2,268 rows over 2026-08-07→08-31:

| utm_source | pageviews | distinct visitors | dates |
|---|---|---|---|
| (none) | 1,494 | 166 | 08-07 → 08-31 |
| instagram | 37 | 4 | 08-30 → 08-31 |
| chatgpt.com | 18 | 7 | 08-30 → 08-31 |
| ig | 6 | 3 | 08-30 → 08-31 |

| referrer_host | pageviews | distinct visitors |
|---|---|---|
| (direct) | 1,373 | 129 |
| www.google.com | 41 | 18 |
| **l.instagram.com** | **35** | **8** |
| chatgpt.com | 28 | 7 |
| **www.reddit.com** | **12** | **5** |
| www.vinted.es | 10 | 2 |
| www.perplexity.ai | 6 | 3 |

Four things fall out of this, and they are the most decision-relevant numbers in the file:

1. **The one Instagram reel produced ~8 distinct visitors over two days** — and of the
   pageviews in that segment, 18 hit `/dashboard` and **7 hit `/admin`**, which is the
   owner's own surface. So some of those eight are the founder testing his own link. The
   honest read is **single digits, possibly low single digits, and zero signups traceable to
   it.** That is the "proof the channel works" the previous pass built its recommendation on.
2. **Reddit sent 5 distinct visitors with zero posts ever made.** Reddit's latent pull, at
   zero effort, is roughly 60 % of a fully-executed Instagram launch.
3. **Answer engines sent 10 distinct visitors** (ChatGPT 7 + Perplexity 3) — more than the
   non-founder share of Instagram. Unprompted, unoptimised. Worth a note; not worth a bet yet.
4. **Google, all time, is 18 distinct visitors.** That is the true size of the SEO channel
   after 230 URLs. It is not zero and it is not a business.

Still open: **`signup_attribution` has the right schema and 0 rows.** The table can now accept
the write; nothing has written to it. Whether that is "no signups since the fix" or "the write
still fails" is **UNKNOWN** and is a `backend-eng` question, not a marketing one.

`is_bot=1` on **713 of 2,268 pageviews (31.4 %)** — any future traffic KPI must filter bots or
it will read 45 % high.

---

## 2 — The channel call

### The call: **TikTok, in Spanish.** Not Instagram, not Reddit, not X.

The previous pass recommended Instagram because it is *"the only channel with a real account
and a real, already-published post."* The founder is right that this is a fact about our
history rather than a reason. It is worse than that: **the fact does not support the claim.**
The account has zero followers, on the one platform of the four where reach is indexed to
account size (§1.4), and the "real published post" delivered single-digit distinct visitors,
some of them the founder (§1.6). "We have an account" is the weakest possible argument on the
platform where the account *is* the ranking unit.

But the channel is not the variable that matters most, and this is the heart of the call:

> **Every channel the previous pass considered is English-language, and the product only
> serves ES / FR / DE / IT / PT.**

We have already run this experiment. It is called Search Console: 906 impressions, **71 % US +
GB, 6.7 % EU5**, 6 clicks. The marketing audit diagnosed that in its own §1 — and then the
content queues reproduced it exactly: 10 English Instagram posts, and 10 English Reddit posts
aimed at r/flipping and r/reselling, which §1.3 shows are US/eBay communities. Recruiting an
English-speaking audience to a tool that covers neither their marketplace domain nor their
market is how you get 906 impressions and 6 clicks a second time, on a different surface.

**The variable that matters is language, not platform.** Once language is fixed to a covered
market, the platform question mostly answers itself:

| Channel | Verdict | Why |
|---|---|---|
| **TikTok** | **The bet** | Video is scored per-video, so a 0-follower account is not structurally dead (§1.4, weak evidence). Spanish Vinted-reselling creators demonstrably exist there (§1.3). ES is a covered market and the founder is a native speaker — the only channel where our unfair advantage and our data coverage line up. |
| Instagram | Free cross-post, not the bet | 0 followers on an account-indexed platform. Costs nothing to cross-post the same clip, so it becomes the falsifier (§5), not the wager. |
| Reddit | Manual habit, never the bet | r/vinted is a complaints sub; r/Flipping and r/reselling are US/eBay and enforce hard anti-self-promo rules. And `REDDIT_CLIENT_ID` **is empty** — see §2.1. |
| X | No | No account activity, no audience, no evidence, no Spanish reselling community identified. Nothing to test. |

### 2.1 Two corrections to the brief's premises

- **`REDDIT_CLIENT_ID` is present as a *name* and empty as a *value*.** Checked via
  `.claude/bin/with-secrets.sh` (names only, values never printed): `REDDIT_CLIENT_ID len=0`.
  Same for `POSTIZ_API_URL len=0`, while `POSTIZ_API_KEY len=64` and `IG_USER_ID len=17` are
  set. So on this machine there is **no working Reddit API path and no working Postiz URL**;
  Instagram is the only channel with a real identifier configured. (Also observed:
  `demand-intel/.env` line 21 is malformed — it emits `line 21: by: command not found` when
  sourced. Flagged for `security-eng`/`devops`; I did not read the file.)
- **TikTok's `SELF_ONLY` restriction is an API restriction, not a posting restriction.**
  `MARKETING-AUDIT.md` §6 marks TikTok "not usable yet" because the developer app has not
  passed TikTok's audit. That blocks *programmatic* posting via Postiz. It does not block the
  founder posting from his phone — which is the only posting route that exists anyway, since
  publishing is a founder gate. **TikTok is not blocked for this bet.**

### 2.2 What would prove this call wrong

Stated now, so it cannot be rationalised later:

1. **Instagram beats TikTok on the same clips.** The identical videos get cross-posted to
   Reels at zero marginal cost. If Reels delivers more distinct visitors than TikTok by
   2026-09-14, the account-vs-video argument is wrong for this niche and the call flips.
2. **Spanish demand does not exist.** The `/blog/como-poner-precio-en-vinted` test already
   pre-registered this question with a read date of **2026-09-28**. If it returns zero
   Spanish-language queries, the "language is the variable" thesis takes a serious hit and
   the honest response is to reconsider covering GB rather than to keep pushing ES.
3. **TikTok's Spanish reselling audience turns out to be teenagers selling their own wardrobe,
   not sourcers.** Their questions are "how do I get more views on my listing", not "what
   should I pay". If 14 posts produce views but the comments are all seller-side questions,
   the audience is real and the product is wrong for it.
4. **A competitor's numbers land.** V-Hive has 439 users. If someone can establish *how* they
   got them and it is not social, that is stronger evidence than anything in §1.4.

---

## 3 — The wedge

At €0 and 3 installs the job is not content. It is finding ten people who would open this
weekly. So: who, where, and what makes them try it.

### Who — narrow enough to be falsifiable

> **A Spanish-speaking part-time sourcer who buys second-hand sneakers and branded
> outerwear to resell on Vinted.es, sources physically (Humana, mercadillo, Wallapop,
> outlet), does 5–40 flips a month, and today decides the buy price by feel.**

That is not "Vinted resellers". It excludes:

- **Wardrobe sellers** — the largest group on Vinted, and the wrong group. They sell what they
  own; they have no buy price, so a buy-below number is meaningless to them.
- **Buyers** — the dominant population of r/vinted (§1.3). Not our customer.
- **Anglophone flippers** — r/Flipping, eBay-first, US-based. We do not serve their market.
- **High-volume Vinted Pro accounts** — a real segment (Vinted Pro is live in FR/UK/ES; the
  DAC7 reporting thresholds of 30 transactions or €2,000/year are widely documented), but
  their per-country population is **UNKNOWN** and they need inventory and accounting software,
  not a single-item price check. Out of scope until someone asks.

### Why this person, specifically

Run the Dunford sequence (`marketing-strategy-pmm`):

- **Competitive alternatives:** guessing; scrolling Vinted's own sold filter by hand; a rival
  extension that shows a number with no `n`; a Telegram group's opinion.
- **Unique attribute:** the confidence ladder and the refusal. Sell-through returns **null
  below 30 watched sales**; LOW always states how many comparables exist; `/methodology`
  publishes `buy_below = avg_sale × 0.95 × 0.70` and `str = sold/(sold+active)` and says
  outright *"if a figure disagrees with the product, the product is wrong"* (`FUNNEL.md`,
  "What the walk found that was right").
- **Why it matters to *this* person:** a wardrobe seller loses nothing to a wrong number. A
  sourcer loses **cash, at the till, irreversibly.** The asymmetry between "confidently wrong"
  and "honestly unsure" only has a price for someone spending money on the answer. That is
  why the honesty differentiator is not a brand value — it is a feature with a euro value,
  and only for this segment.
- **Best-fit market:** ES first. It is a covered market (`market-numbers.ts` serves
  ES/FR/DE/IT/PT), the founder is a native speaker in-country, and Spanish Vinted-reselling
  creators exist (§1.3). FR and DE are the larger Vinted markets and are the second and third
  moves — not the first, because we cannot write natively in either.

### Where they already are

1. **The comment sections of Spanish reselling TikToks.** Not our posts — theirs. A creator
   posts a haul; the comments ask what things are worth. That is a pre-validated, public,
   answerable question, in the right language, from the right person.
2. **On a phone, mid-sourcing.** Which is why §1.2 matters: the answer must be the mobile web
   `/check`, and the extension must stop being the thing we measure.
3. **Reddit, thinly** — 5 distinct visitors already arrived from Reddit with zero posts made.

### What makes them try it

One number, for an item they are looking at right now, with the uncertainty attached:
*"No pagues más de €26,88 por unas New Balance 530 — 542 vendidas en 7 días, mediana €40,
n=174."* Then the thing no competitor will do: show it refusing. The pitch is not "we have
data". It is **"we will tell you when we don't know, and here is what that looks like."**

### What we subtract (OS §0.9 forbids adding)

- Stop treating **extension installs** as the growth KPI. It cannot run on the device where
  sourcing happens (§1.2) and its entire visible market is ~1,065 people (§1.1).
- Do not publish the **10 English Reddit drafts** as they stand. They recruit US/GB users into
  a product that serves neither.
- Do not build the second Hetzner VPS for Postiz. `POSTIZ_API_URL` is empty and posting is a
  founder gate; a scheduler for a channel we post to by hand is infrastructure for nothing.
- Kill the **36 zero-model `/flip` URLs** as `MARKETING-AUDIT.md` §2 already recommends. They
  are the SEO shape of the same error: pages for brands the checker cannot answer.

---

## 4 — Audit of the 10 queued Instagram posts

Source: `resale-iq-growth/QUEUE-INSTAGRAM-W1.md`. **The data work is good and I did not redo
it** — every post carries `n`, a period, a market and a snapshot id, and the file polices its
own honesty rules better than most published marketing does. This audit judges only strategy.

**Plain answer, since the CEO will take it: none of the ten should ship as drafted.
Four should be cut. Six should be reworked — all six change language and channel.**

Two defects apply to the whole set:

- **All ten are in English**, for a product covering ES/FR/DE/IT/PT. This is §2's central
  point in its most concrete form.
- **Five of ten are carousels.** On a 0-follower account, carousels are the weakest available
  format (Socialinsider, §1.4: carousels only overtake reels above ~50K followers), and the
  screen-recorded refusal — the one thing we own — cannot be shown in a static card at all.

| # | Post | Verdict | Reason |
|---|---|---|---|
| 9 | "760 % sell-through isn't a rate. It's a trick." | **KEEP — promote to #1** | The strongest asset in the file and it is buried at position nine. Category-defining, true, checkable, and structurally uncopyable: a competitor can copy a number, but not a public formula that indicts their own. This is the thesis. Lead with it. |
| 7 | "Confidence isn't a courtesy. It's math." (38 sold, still called thin) | **KEEP — promote to #2** | The differentiator *demonstrated on an item we do cover*. Shows the machine choosing honesty when it had every excuse to look confident. This is what the refusal should look like. |
| 1 | New Balance 530, model-level, €26.88 ceiling | **REWORK** | Right substance, wrong everything else. Becomes the Spanish screen-recording: *"no pagues más de €26,88"*. Note that a model-level number is the one thing V-Hive (439 users) can also produce, so it must not lead. |
| 3 | "We don't know this one" — 6 brands, 0 models | **REWORK HARD** | Right thesis, wrong demonstration, plus a leak. (a) It names an internal repo path — `docs/audit/proof/W36/seo-killlist/PLAN.md` — in on-screen text. Cut that; internal paths never go on a public asset. (b) It pre-announces an unshipped internal decision ("we're killing those six pages this week"), which is a publish commitment nobody has approved. (c) Strategically it is backwards: Zara, Mango, Bershka and Pull&Bear are the *most common* brands in a Spanish thrift haul. Leading acquisition with "we have nothing for the brands you actually source" is a retention message wearing an acquisition costume. Honesty sells when shown at the edge of what we *do* cover (post 7), not as a confession that the high street is blank. |
| 6 | Supply glut — 8,276 listing, 13 sold, 637:1 | **REWORK** | The best non-obvious insight in the set — "the queue you'd be joining" reframes sourcing from price to competition. But the headline rests on **n=6**. Disclosing a thin sample is right; *building the post on it* is a content choice, not an honesty one. Re-run on a solid-`n` item and it becomes a strong recurring format. |
| 8 | "5 things worth sourcing this week" | **REWORK → demote to weekly anchor** | Structurally sound and reusable, but it is exactly what every scraper-backed competitor publishes. It earns its place as a *habit* — the thing people come back on Mondays for — not as a launch post. |
| 2 | "What actually sold last week" carousel | **CUT** | Commodity listicle in the weakest format at 0 followers. Any of the nine competitors in §1.1 can publish this. Overlaps post 8 almost entirely. |
| 4 | Nike price ladder, "3× the money" | **CUT** | Carousel; half the claim rests on n=6 jackets; overlaps post 1's "category/model beats brand" argument without adding to it. |
| 5 | "The Balenciaga ceiling" — pay under €116.50 | **CUT — and this one is a liability, not just weak** | Publicly advising people to pay up to €116.50 for Balenciaga sneakers on Vinted is an implicit authenticity claim on the single most counterfeit-exposed category on the platform. `resale-iq/CLAUDE.md` lists **"authenticity marketing"** under *Hard no*. The replica filter that would make this defensible is listed in OS §8 Phase 2 as something Phase 2 **builds**, so whether it exists today is **UNKNOWN**. Do not publish a buy ceiling on a luxury brand until it does. |
| 10 | "What people actually check before they buy" — 81 checks | **CUT** | Social proof that subtracts. "81 checks across five items" invites the reader to work out how small the userbase is — and §1.6 says the true figure is ~166 lifetime distinct human visitors. Do not publish a proof point that survives only if nobody does the arithmetic. |

**Resulting order** (all Spanish, all TikTok-first, cross-posted to Reels):
1. the 760 % callout · 2. the thin-confidence demonstration · 3. the model-level ceiling ·
4. the supply-glut reframe on a solid-`n` item · then the weekly sourcing anchor on repeat.
Lead with what cannot be copied; earn the right to publish numbers anyone can copy.

---

## 5 — The 14-day bet, pre-registered (OS §7)

Stated **before** the run, with the number and the date fixed now.

```
G-W36-GTM-01   owner: content-social (drafts) + founder (posting gate)
channel:  TikTok, Spanish, EU5-targeted
format:   ONE format only — vertical screen recording, ≤40 s, of a real vinted.es
          listing being checked on mobile web, ending either on the buy-below number
          or on the panel refusing ("no tenemos datos suficientes"). Spanish captions.
          No Remotion (macOS 12 constraint, §1.5) — screen capture only.
cadence:  1 post/day × 14 days
window:   2026-09-01 → 2026-09-14
read on:  2026-09-15, 09:00 CEST
```

**Primary metric — distinct non-bot visitors attributable to TikTok:**

```sql
-- sql/metrics/tiktok_visitors.sql  (to be created by whoever runs this)
SELECT COUNT(DISTINCT visitor_hash)
FROM pageviews
WHERE COALESCE(is_bot,0) = 0
  AND (utm_source = 'tiktok' OR referrer_host LIKE '%tiktok%')
  AND viewed_at >= '2026-09-01' AND viewed_at < '2026-09-15';
```

**Success criterion: ≥ 25 distinct non-bot visitors.**

The number is calibrated against what this company has actually achieved, not against a
benchmark: Instagram's fully-executed launch produced **≤8** distinct visitors in two days
(some of them the founder); **Google has produced 18 distinct visitors in its entire life**;
Reddit produced 5 with zero effort. **25 in 14 days would make TikTok, in one fortnight, the
largest acquisition channel this company has ever had.** Below 25, the channel has not beaten
what the site already receives passively, and the bet has failed. Say so and stop.

**Counter-KPIs (OS §0.4) — the bet fails if either breaks, regardless of visitor count:**

- `unverifiable_number_count = 0`. Every number in all 14 posts traces to a `growth.db`
  snapshot id, a period and a market. One that does not is a FAIL on its own. Volume must not
  be bought with the one thing we own.
- `depth ≥ 8`: of the visitors counted, at least 8 must reach `/check` or `/verdict`, not just
  `/`. 25 arrivals and zero checks means the format sold curiosity, not the product — which
  is a different failure from "no reach", and needs a different fix.

**Kill rule:** read the primary metric on **2026-09-07** (day 7). If it is **< 5**, stop.
Do not post the remaining seven. Write the negative result and take the falsifier in §2.2
seriously. Fourteen days is the budget; it is not a commitment.

**Falsifier, built into the run:** every clip is cross-posted to Instagram Reels at zero
marginal cost, tagged `utm_source=instagram`. If Reels delivers more distinct visitors than
TikTok by 2026-09-14, my channel call was wrong and Instagram wins on evidence. That is the
point of running it this way.

### Two blockers that make this bet unreadable if they are not cleared first

1. **`FUNNEL.md` F-1 must be fixed before day 1.** A first-time visitor with no cookie and no
   storage currently receives
   `{"verdict":"LIMIT_REACHED","used_today":22,"limit":10}` — the anonymous quota is keyed to
   something the client does not carry, almost certainly the IP. **A TikTok audience is 100 %
   mobile, and mobile means carrier-grade NAT, which means one shared quota bucket per carrier
   range.** F-1 does not merely affect this bet — it is *worst* precisely for the traffic this
   bet creates. Sending 25 hard-won strangers to a paywall that fires on move one destroys the
   experiment and the goodwill together. **Do not run any acquisition until F-1 is fixed.**
   This is a product P0, and it outranks every line in this document.
2. **The mobile `/check` path must be walked end to end on a phone on mobile data**, logged
   out, before the first post. `src/app/check/page.tsx` exists; whether it works at 375 px on
   a real handset is **UNKNOWN** and untested in `FUNNEL.md` (the walk never got past F-1).

If either is unresolved on 2026-09-01, the correct action is to **slip the bet, not soften
the criterion.**

---

## 6 — The single thing the previous marketing pass got wrong

Not "it picked Instagram". The deeper error:

> **It picked a channel without picking a language — and then wrote every asset in the one
> language that guarantees we recruit people the product cannot serve.**

The evidence that this is the error, rather than the channel, is that the previous pass
*found it itself*. `MARKETING-AUDIT.md` §1 measured 71 % US + GB against 6.7 % EU5 and called
the finding "CONFIRMED, and understated". Six sections later it recommended Instagram on the
grounds that an account exists — and the queues that followed contain 10 English Instagram
posts and 10 English Reddit posts aimed at r/flipping and r/reselling, communities §1.3 shows
are US and eBay-centric.

That is the same experiment Search Console already ran, re-run on a new surface, with the
result pre-written. The channel was never the variable. **Language is the variable, because
language selects the market, and the market is the only thing the product is hard-coded to.**

Second, smaller, and worth saying plainly: **"we have an account there" is not a reason.** It
is the sunk-cost fallacy with a screenshot. On Instagram it is not even a neutral fact — it is
a liability, because Instagram ranks accounts and ours has zero followers. The previous pass
treated the existence of infrastructure as evidence of channel fit. The Chrome extension is
the same mistake in another medium: we built a desktop surface for a mobile activity, and then
measured ourselves on installs.

---

## 7 — Which skills earned their place

The `HARNESS.md` audit found that the skills library at
`demand-intel/.claude/skills/` (161 skills) has never once been invoked. I read nine of them.
Honest verdict: **two earned their place, seven did not, and "never invoked" is not by itself
the scandal it looks like.**

| Skill | Used? | Verdict |
|---|---|---|
| `launch-strategy` | **Yes** | Its **ORB model** (Owned / Rented / Borrowed) changed my answer. Applied here it exposes that Resale IQ has **no Owned channel at all** — no email list, ~166 lifetime visitors, 3 installs — and is therefore 100 % dependent on Rented algorithmic reach, which is the most fragile configuration available. That framing is why §3 pushes toward other people's comment sections (Borrowed) rather than only our own feed. |
| `marketing-strategy-pmm` | **Yes, partially** | The **April Dunford positioning sequence** (alternatives → unique attributes → value → best-fit customer) is what produced §3's wedge, and specifically the insight that the honesty differentiator only has a euro value for someone spending cash at the till. Its ICP templates are B2B boilerplate ("Employees 50-5000", "Revenue $5M-$500M") and its ICP validation checklist requires "5+ paying customers" — we have zero, so half the skill cannot run here. |
| `cmo-advisor` | Read, mostly discarded | The "Four CMO Questions" are a fair spine. Everything else is calibrated for a funded B2B company with a sales team: its metrics dashboard wants pipeline coverage ratio, MQL→Opportunity rate and marketing-sourced pipeline %. **Following it at €0 MRR with one operator would have actively misled** — it would have had me reporting pipeline coverage for a company with no pipeline. |
| `social-content` | Read, marginal | The platform cadence table is a reasonable sanity check. Its hook formulas ("Unpopular opinion:", "I was wrong about…") would degrade the one voice this product has. Not used. |
| `competitive-intel` | Read, not needed | I ran the substance manually against the Chrome Web Store and got harder data (§1.1) than the template would have produced. |
| `marketing-psychology`, `content-strategy`, `social-media-manager`, `x-twitter-growth` | Skimmed, not used | Nothing in them bears on a pre-traction, single-operator, EU-language problem. |

**Recommendation:** keep `launch-strategy` and `marketing-strategy-pmm` in the roster and let
the rest sit unloaded. A library of 161 general-purpose skills going uninvoked is not
necessarily waste — most of them are answers to questions this company does not have. The
`HARNESS.md` finding is worth keeping for a different reason: **nobody had checked whether
they were any good.** Now two have been checked and they are.

---

## 8 — What goes to the founder

Nothing in this document publishes anything. Three items need a decision:

1. **Approve or veto the channel switch** — TikTok/Spanish as the 14-day bet, Instagram
   demoted to a zero-cost cross-post and falsifier. (OS §11.5 asked "X or IG"; the honest
   answer to the question as posed is "neither, and here is why".)
2. **Approve the queue verdict** — 4 cut, 6 reworked into Spanish video, none shipped as
   drafted. Post 5 (Balenciaga) should be cut on the authenticity-risk ground regardless of
   the channel decision.
3. **Accept that F-1 blocks the bet.** No acquisition should run until a first-time visitor
   can complete a first check. This is a product gate on a marketing plan, and it is the right
   way round.

Founder-only actions this plan depends on: creating/naming the TikTok account, posting each
clip, and the macOS TCC grant that is still keeping the local scrape agent dead
(`FUNNEL.md` F-4).
