# FUNNEL BASELINE — our own numbers, not industry averages

**Measured 2026-09-01 ~19:45 UTC, production `pageviews` / `users`, 24h window, bots excluded.**

Every number in our funnel model until now was an industry average. These are ours.

---

## The funnel, end to end

| stage | n |
|---|---|
| visitors (distinct, non-bot) | **28** |
| page views | 335 |
| reached `/register` | **3** |
| **signed up** | **0** |
| users, all time | 6 |
| `signup_attribution` rows | 0 |

**No signup since 2026-08-29.** The €49-default fix went live after the earlier 28-visitor
measurement, so the 3-of-3 bounce is no longer explained by it. **Reaching `/register` and not
finishing is now the sharpest unexplained loss in the funnel** and the next thing worth a session.

---

## Attribution works. This is the first day it has ever produced data.

`signup_attribution` has held zero rows since it was built — not broken, starved: no published link
carried a UTM. Tagging shipped today, and tagged visits now arrive:

| utm_source | utm_content | visitors |
|---|---|---|
| instagram | `r122` | 2 |
| instagram | `r123` | 2 |
| instagram | `r128` | 2 |
| instagram | `2026-08-28-patagonia-…-repurpose` | 2 |
| instagram | `r126` | 1 |

**~9 tagged visits, every one of them Instagram.**

## The finding that should change what we do

**TikTok produced ZERO tagged visits from 10 published posts. X produced ZERO from 10.**

Instagram is the only channel returning anyone at all. That is not a small difference in
performance, it is the difference between a channel and a hobby.

**Do not read it as "TikTok does not work" yet** — three candidate explanations are still live and
they have different fixes:
1. **The posts may not exist.** Only **1 of 8** TikTok "published" records carried a real `/video/`
   id; the rest resolve to the bare profile. 6 records sit in `ERROR`.
2. **TikTok suppresses link-in-caption traffic** by design, and our link is in the caption. That is
   a platform behaviour, not a defect — it would mean TikTok needs link-in-bio and a different CTA.
3. **The posts were silent and duplicated** (W57) — 7 of 9 reused one file with no audio.

**The next TikTok post must be checked for a real `/video/` id before anything else is built on
that channel.** Until then every hour spent rendering for TikTok is unmeasured.

## Localisation is working

| locale | visitors |
|---|---|
| en | 26 |
| de | 4 |
| es | 3 |
| it | 2 |
| fr | 2 |

Earlier today this was `en 26 · es 2 · de 2`. **Non-English traffic roughly doubled** after the
localised posts went out. Small numbers, but moving in the direction the market data says they
should: we serve ES/FR/DE/IT/PT and the English audience largely cannot buy from us.

## Also worth noting

A visit arrived referred from **`chatgpt.com`**. One visitor, so it proves nothing — but it is the
first sign of an acquisition channel nobody planned, and it costs nothing to keep watching.

---

## What this baseline is for

Three ratios we can now compute from our own data instead of assuming:

- **visitor → `/register`: 3/28 ≈ 11%**
- **`/register` → signup: 0/3.** Not "0%" — n=3 is too small to call a rate. It is
  **unknown and worth measuring**, and saying 0% would be manufacturing a number.
- **post → visit: ~9 visits from ~26 published posts**, concentrated entirely in one channel.

**Do not quote any of these publicly.** They are ours to steer with, not to publish, and n is small
enough that a real number today could be embarrassing next week.


---

# ADDENDUM — the channel nobody is working (7-day view)

Measured 2026-09-01, production `pageviews`, 7 days, distinct visitors, bots excluded.

| page | visitors |
|---|---|
| `/` | 61 |
| **`/blog/vinted-disputes-and-returns-sellers`** | **11** |
| `/tools/vinted-price-checker` | 10 |
| `/blog/what-sells-best-on-vinted` | 7 |
| `/blog/vinted-vs-depop-for-sellers` | 4 |

**~36 blog visitors across 10 posts in 7 days.** 16 visitors came from search engines
(Google 9 · Bing 6 · DuckDuckGo 1).

**The comparison that should shape next week.** Social: **26 published posts → ~9 tagged visits**,
all Instagram. Blog: **10 posts nobody has touched in a while → ~36 visitors**, continuously.

Per-day the two are closer than that sounds, and the honest version matters: today's social push was
a burst, the blog figure is a steady week. **The real difference is not volume, it is decay.** Social
stops the moment we stop posting. The blog earned all week with zero effort from anyone.

## Two things inside that data

1. **The top post is a PROBLEM post, not a product post.** "Vinted disputes and returns" beats "what
   sells best". We are winning the intent of someone stuck or burned — and that is *not* the intent
   we have been writing for.
2. **`?utm_source=chatgpt.com` appears twice.** AI assistants are citing us. Two visitors proves
   nothing on its own, but it is a channel nobody planned and it costs nothing to watch.

## Known broken — do not re-diagnose this

**The GSC MCP is dead in this session.** The running server was started with a stale credentials path
under `~/Desktop/`, from before the repos moved to `~/work/`. **The config on disk is already
correct** — `.claude.json` under `mcpServers.gsc.env` points at the current location. The *process*
is stale and needs a restart nobody in this session can perform. Nothing to fix in code; it resolves
on the next session that starts the server fresh. Until then keyword and impression data is
**UNKNOWN**, not estimated.
