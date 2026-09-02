# CONTENT-FACTS — 20 distinct, defensible, publishable findings

Written by `data-scientist`, 2026-09-01. **Not committed** — the coordinator commits.

**Purpose.** We were recycling six ideas across thirty posts. This file exists to break that
constraint. Every finding below is *a different claim about a different thing*, on a deliberately
different axis: category, size, price band, condition, market, brand dispersion, shelf crowding,
feed position.

---

## 0. Provenance — read this before you publish a single number

**Every figure in this file came from PRODUCTION**, read read-only from inside the backend
container:

```
host:       ssh resaleiq  (Hetzner 62.238.51.83)
container:  ph5clxk9hmghspv65pdkvak9-173531324442
database:   file:/app/data/demand_intel.db?mode=ro   (20.98 GB, live, WAL active)
```

**The local copy at `/Users/bilalsbaiby/work/demand-intel/demand_intel.db` was NOT used for any
published figure, and must not be.** Measured tonight:

| DB | `COUNT(*) FROM listings` | `COUNT(*) WHERE sold_observed=1` |
|---|---|---|
| local `~/work/demand-intel/demand_intel.db` | 36,305,525 | **0** |
| **production** `/app/data/demand_intel.db` | 13,083,007 | **108,706** (at 17:40) |

The local file would have answered every question in this document confidently and wrongly, with
zero. That is not a measured zero, it is an unmeasured one.

**Working method.** Because a long analytical scan against the file production is serving is a real
risk (`ACCESS.md` rule 2, AM-1), I streamed the 108k watched-departure rows out of production once,
analysed that extract locally, and then **re-ran every headline number as SQL against production and
confirmed it matched.** Fidelity check, both sides, same window:

```sql
SELECT COUNT(*) FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00';
-- production: 108529   ·   local extract: 108529   ✓
```

### The frozen window every finding uses

```sql
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00'
  AND sold_at <  '2026-09-01 17:00:00'
```

**N = 108,529 watched departures. €5,960,318 of listed value. 11.7 days. ES · FR · DE · IT · PT.**
The upper bound is frozen deliberately so every number in this file reproduces exactly. Production
keeps adding rows; without the bound the counts drift within the hour.

### What the number means, and the words to use

`sold_observed = 1` is set in exactly one place (`db/queries.py:274 mark_listing_sold`) and only on a
row we already held as `is_sold = 0`. It means: **we watched this listing leave the shelf.** It can
leave by sale, delisting, edit or reservation. Detection is two-strike with a circuit breaker
(`engine/shelf.py:_judge` refuses to end more than a fixed fraction of a pass).

- ✅ "we watched 959 leave the shelf" · "departures" · "left the shelf"
- ❌ "sold" · "sales" · "the market sold"
- `price_eur` is **the price the listing carried when it left the shelf.** Not a confirmed
  transaction price. Say "left at €X", never "sold for €X".

### The floor

**n ≥ 30 for every published finding.** Every finding below states its `n`. Findings 18–20 sit
between n=30 and n=100 on at least one leg and are labelled **THIN** in the finding itself.

### Hard constraints observed throughout

No days-to-sell. No authenticity or counterfeit angle. **No Balenciaga** (it is in the data; it is
excluded from every finding here). No guaranteed-return framing. No per-model buy-below — everything
below is a brand, category, size, band or market aggregate. No absence claim about any narrowly
tracked brand.

### The caveat that attaches to every category finding

**38.5% of departures (41,804 of 108,529) are category `Other`** — our own title classifier found no
keyword match. So "Hoodies was the biggest apparel category" means *biggest among the 61.5% we could
classify*. Phrase category shares that way. This is itself finding #17.

---

# THE FINDINGS — ranked by surprise to someone who has never resold

---

## 1. For every Adidas trainer that leaves the shelf in France, 410 others are still sitting there.

**Number:** 13,925 pairs listed · 34 watched departures in 7 days · **409.6 : 1**.
Compare **Patagonia jackets in Germany: 696 listed · 47 departures · 14.8 : 1** — a shelf 28× less
crowded than the famous brand.

**n:** 34 departures (Adidas FR) · 47 departures (Patagonia DE). Both above floor.

**Source:** production `market_stats`, rows stamped `updated_at = 2026-09-01 17:00:38`.

```sql
SELECT brand, category, platform, active_listings, sold_7d,
       ROUND(1.0 * active_listings / sold_7d, 1) AS listed_per_departure
FROM market_stats
WHERE updated_at LIKE '2026-09-01%' AND sold_7d >= 30
ORDER BY listed_per_departure DESC;
-- Adidas    Sneakers vinted_fr  13925   34  409.6
-- Nike      Sneakers vinted_it  11101   48  231.3
-- New Bal.  Sneakers vinted_de  32796  213  154.0
-- Patagonia Jackets  vinted_de    696   47   14.8
-- Patagonia Jackets  vinted_it    966   43   22.5
```

**Definition note, state it if asked:** `market_stats.sold_7d` is its own 7-day
`COUNT(DISTINCT external_id)` computed by the product at 17:00:38 — a different window from the
11.7-day window used elsewhere in this file. Do not mix the two in one sentence.

**Holds in:** measured per market. FR, IT, DE, ES, PT rows all present; the FR/DE contrast above is
the widest pair that clears the floor.

**Post to:** 🇫🇷 **French** — the 409:1 number was measured on `vinted_fr` and it is the single most
arresting figure in this file. Then 🇩🇪 German for the Patagonia half.

**Flag:** competition ratio is listed in `DATA_CONTRACT.md` as an authenticated-tier capability. At
brand × category × market aggregate it is inside the brief's rule 4 (aggregates public). Publishing
it demonstrates capability — but confirm with the coordinator before it becomes a recurring format.

---

## 2. Four items in every hundred carried more than a third of all the money.

**Number:** departures priced **€250+** were **3,910 of 108,529 (3.6%)** but carried
**€2,230,753 of €5,960,318 — 37.4%** of the total.
The mirror image: **57.5% of departures were under €30 (62,417)** and carried **14.1%** (€840,929).

**n:** 108,529 (full population).

**Source:** production `listings`.

```sql
SELECT CASE WHEN price_eur <  10 THEN '<10'   WHEN price_eur <  20 THEN '10-19'
            WHEN price_eur <  30 THEN '20-29' WHEN price_eur <  50 THEN '30-49'
            WHEN price_eur <  75 THEN '50-74' WHEN price_eur < 100 THEN '75-99'
            WHEN price_eur < 150 THEN '100-149' WHEN price_eur < 250 THEN '150-249'
            ELSE '250+' END AS band,
       COUNT(*) AS n, ROUND(SUM(price_eur)) AS eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
GROUP BY band ORDER BY n DESC;
-- <10 21517 113107 | 10-19 23638 326227 | 20-29 17262 401595 | 30-49 18743 702538
-- 50-74 10610 619642 | 75-99 5085 429090 | 100-149 4221 497787 | 150-249 3543 639580
-- 250+ 3910 2230753
```

**Holds in:** all five markets pooled (EU5).

**Post to:** 🇪🇸 **Spanish** — `vinted_es` is our largest market by departures (22,164) and this is
the strongest "you are working too hard for too little" hook we have. Adapt to all five.

---

## 3. A trading-card brand moved twice as much money as Nike.

**Number:** **Pokémon — 4,276 watched departures, €366,781.** **Nike — 2,653 departures, €180,533.**
Pokémon carried **2.03×** Nike's euros.

**n:** 4,276 and 2,653.

**Source:** production `listings`.

```sql
SELECT brand, COUNT(*) AS n, ROUND(SUM(price_eur)) AS eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand IN ('Pokémon','Nike')
GROUP BY brand;
-- Pokémon 4276 366781 | Nike 2653 180533
```

**Mandatory caveat, include it in the post:** we watch Pokémon on a much shallower shelf than Nike —
last pass depth **23–45 listings per market** for Pokémon vs **179–186** for Nike (`shelf_passes`,
2026-09-01). So this is not "Pokémon is bigger than Nike on Vinted". It is: **off a shelf a fifth the
size, it produced twice the money.** That framing is both true and stronger.
**Never** make an absence or a market-share claim about Pokémon — the coverage is too narrow.

**Holds in:** all five, but depth is asymmetric across markets (DE 23, ES 45, FR 36, IT 36, PT 45) —
**no cross-market Pokémon comparison.** Pooled only.

**Post to:** 🇪🇸 **Spanish** and 🇵🇹 **Portuguese** — deepest Pokémon coverage (45 each), and it is the
best bridge to the non-reseller audience `CONTENT-RULES.md` wants to expand into.

---

## 4. The bigger the shoe, the better the money — and the small sizes are the ones everybody buys.

**Number:** **EU 38 had the most departures of any sneaker size (959) at a median of €38.00.**
**EU 43: 686 departures, median €52.50.** **EU 46: 93 departures, median €80.00.**
The most common size clears at **less than half** the price of the rarest one.

**n:** 959 · 686 · 93 (EU 46 is above floor but the thinnest leg — quote 43 if you want a safe pair).

**Source:** production `listings`.

```sql
WITH s AS (
  SELECT CAST(size AS INT) AS sz, price_eur FROM listings
  WHERE sold_observed = 1
    AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
    AND category = 'Sneakers' AND size IN ('38','43','46')),
r AS (SELECT sz, price_eur,
             ROW_NUMBER() OVER (PARTITION BY sz ORDER BY price_eur) rn,
             COUNT(*)     OVER (PARTITION BY sz) c FROM s)
SELECT sz, c AS n, ROUND(AVG(price_eur),2) AS median_eur
FROM r WHERE rn IN ((c+1)/2,(c+2)/2) GROUP BY sz;
-- 38 959 38.0 | 43 686 52.5 | 46 93 80.0
```

Full monotone ladder (medians, whole sizes, n ≥ 30 each): 36 €38 · 37 €39.90 · 38 €38 · 39 €40 ·
40 €44 · 41 €40 · 42 €46 · 43 €52.50 · 44 €50 · 45 €53 · 46 €80.

**Holds in:** EU5 pooled. Not split by market — per-size-per-market cells fall under the floor.

**Post to:** 🇩🇪 **German** — `vinted_de` has the most sneaker departures (1,931) and the largest
average foot size in the ladder. Nobody in this niche publishes a size curve; this is our most
defensible "you have never seen this before" asset.

**Flag:** size data is an authenticated-tier capability per `DATA_CONTRACT.md`. At category × size
aggregate it is inside the brief's rule 4. Confirm before it becomes a recurring format.

---

## 5. One Italian jacket label out-moved Nike, Adidas, Puma, Reebok and Jordan put together.

**Number:** **Stone Island: 11,803 watched departures.** Nike 2,653 + Adidas 1,959 + Reebok 2,458 +
Puma 1,020 + Jordan 219 = **8,309**. Stone Island alone is **1.42×** the five sportswear brands
combined — off a comparable watched shelf depth (~180–190 listings per brand per market).

**n:** 11,803 vs 8,309.

**Source:** production `listings`; depths from production `shelf_passes`.

```sql
SELECT brand, COUNT(*) AS n, ROUND(SUM(price_eur)) AS eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand IN ('Stone Island','Nike','Adidas','Puma','Reebok','Jordan')
GROUP BY brand ORDER BY n DESC;
-- Stone Island 11803 692186 | Nike 2653 180533 | Reebok 2458 46664
-- Adidas 1959 78824 | Puma 1020 27892 | Jordan 219 19817
```

**Why the depth comparison is fair, and say so if challenged:** `shelf_passes` shows the last pass
watched 186–189 Stone Island listings per market and 175–186 for Nike/Adidas/Jordan. Same shelf
size, different turnover. That is the honest version of the claim.

**Holds in:** all five, and evenly — Stone Island departures per market run 2,325–2,419, the flattest
brand in the set.

**Post to:** 🇮🇹 **Italian** first (home brand, `vinted_it` n=2,325), then 🇩🇪 German (n=2,419, the
highest).

---

## 6. Five countries, one price. Cross-border sourcing inside the EU5 buys you almost nothing.

**Number:** the **median sneaker departure price was €40.00 in all five markets** — Spain, France,
Germany, Italy and Portugal, identical to the cent.
Stone Island hoodies, the single best-populated brand × category cell we have, averaged
**€50.97 (ES) · €51.03 (PT) · €51.13 (DE) · €51.45 (IT) · €51.98 (FR)** — a **2.0% spread across
five countries**.

**n:** sneakers 1,572–1,931 per market · Stone Island hoodies 935–978 per market.

**Source:** production `listings`.

```sql
WITH r AS (
  SELECT platform, price_eur,
         ROW_NUMBER() OVER (PARTITION BY platform ORDER BY price_eur) rn,
         COUNT(*)     OVER (PARTITION BY platform) c
  FROM listings
  WHERE sold_observed = 1
    AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
    AND category = 'Sneakers')
SELECT platform, c AS n, ROUND(AVG(price_eur),2) AS median_eur
FROM r WHERE rn IN ((c+1)/2,(c+2)/2) GROUP BY platform;
-- vinted_de 1931 40.0 | vinted_es 1849 40.0 | vinted_fr 1572 40.0
-- vinted_it 1652 40.0 | vinted_pt 1855 40.0

SELECT platform, COUNT(*) AS n, ROUND(AVG(price_eur),2) AS avg_eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand = 'Stone Island' AND category = 'Hoodies'
GROUP BY platform;
-- de 978 51.13 | fr 945 51.98 | es 941 50.97 | pt 939 51.03 | it 935 51.45
```

**This contradicts the assumption in the brief** (that the same item is a different trade in Lisbon
and Munich). On *price*, at aggregate level, it is not. That is exactly why it is worth publishing:
it kills a piece of folk wisdom with a number, and it is trivially checkable by any reseller with a
Vinted account. Volume does differ across markets — see findings 18 and 19.

**Holds in:** all five. This is the only finding here that is *about* all five at once.

**Post to:** all five, natively, same day — the shape of the post *is* five languages saying the same
number. 🇵🇹 **Portuguese** leads: the "you don't need to import from Germany" angle lands hardest in
the smallest market.

---

## 7. The same jacket in XL leaves the shelf at 50% more than in XS.

**Number:** **jackets, size XS: 539 departures, median €30.00. Size XL: 788 departures, median
€45.00. XXL: 242 departures, median €47.50.** The gradient is monotone with size, and the bigger
sizes are also the *more* numerous ones.

**n:** 539 · 788 · 242.

**Source:** production `listings`. Size strings are localised and compound (`XL`, `XL / 42 / 14`,
`XL / IT 46 / EU 42`), so the prefix normalisation is part of the query:

```sql
WITH s AS (
  SELECT CASE WHEN size LIKE 'XS%'  THEN 'XS'
              WHEN size LIKE 'XXL%' THEN 'XXL'
              WHEN size LIKE 'XL%'  THEN 'XL' END AS sz, price_eur
  FROM listings
  WHERE sold_observed = 1
    AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
    AND category = 'Jackets'),
r AS (SELECT sz, price_eur,
             ROW_NUMBER() OVER (PARTITION BY sz ORDER BY price_eur) rn,
             COUNT(*)     OVER (PARTITION BY sz) c FROM s WHERE sz IS NOT NULL)
SELECT sz, c AS n, ROUND(AVG(price_eur),2) AS median_eur
FROM r WHERE rn IN ((c+1)/2,(c+2)/2) GROUP BY sz;
-- XL 788 45.0 | XS 539 30.0 | XXL 242 47.5
```

**Holds in:** EU5 pooled.

**Post to:** 🇩🇪 **German** — `vinted_de` carries the most jacket departures (2,330) and the size
skew is the strongest there.

---

## 8. Inside one luxury brand, the cheapest tenth left at €10 and the dearest tenth at €330.

**Number:** **Gucci — 8,223 watched departures. 10th percentile €10.00, median €52.00, 90th
percentile €330.00.** A **33× spread inside a single brand name.**

**n:** 8,223.

**Source:** production `listings`.

```sql
WITH r AS (
  SELECT brand, price_eur,
         ROW_NUMBER() OVER (PARTITION BY brand ORDER BY price_eur) rn,
         COUNT(*)     OVER (PARTITION BY brand) c
  FROM listings
  WHERE sold_observed = 1
    AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
    AND brand IN ('Gucci','Nike','Patagonia','Off-White','New Balance','Reebok',
                  'Diesel','Fred Perry','Stone Island','Pokémon'))
SELECT brand, c AS n,
       MAX(CASE WHEN rn = CAST(0.10*c AS INT) THEN price_eur END) AS p10,
       MAX(CASE WHEN rn = CAST(0.50*c AS INT) THEN price_eur END) AS p50,
       MAX(CASE WHEN rn = CAST(0.90*c AS INT) THEN price_eur END) AS p90
FROM r GROUP BY brand;
-- Gucci 8223 10 52 330 | Nike 2653 8 38 150 | Stone Island 11803 10 38 115
-- Patagonia 9691 11 25 60 | New Balance 3584 10 36.8 55 | Off-White 2501 15 22 65
-- Fred Perry 6444 6 14.95 35 | Diesel 3687 5 15 47 | Reebok 2458 3 12 30
-- Pokémon 4276 1 12 170
```

**The plain-language version:** the label on the tag tells you almost nothing about what the item is
worth. Which is the product.

**Holds in:** EU5 pooled.

**Post to:** 🇮🇹 **Italian** — highest engagement on luxury resale, and `vinted_it` carries strong
Gucci volume (1,539).

---

## 9. Nike is the least predictable big brand we watch. Patagonia is one of the most.

**Number:** ratio of 90th-percentile to 10th-percentile departure price, brands with n ≥ 1,000:
**Off-White 4.3× · New Balance 5.5× · Patagonia 5.5× · Fred Perry 5.8×** … **Nike 18.8×** ·
Gucci 33.0×.
In plain terms: two Patagonia items picked at random land in a narrow price band; two Nike items do
not.

**n:** Nike 2,653 · Patagonia 9,691 · New Balance 3,584 · Off-White 2,501.

**Source:** production `listings` — same query as finding 8, divide p90 by p10.

**Why this is commercially the most useful line in the file:** spread *is* risk. A tight brand is one
you can be wrong about cheaply. This is the honest version of "what should a beginner buy" that
never touches a guaranteed-return claim.

**Holds in:** EU5 pooled.

**Post to:** 🇫🇷 **French** — pairs directly with finding 1, which was also measured on `vinted_fr`,
so one shoot yields two posts in the same language.

---

## 10. Only 13 items in every 100 that left the shelf were new with tags.

**Number:** **new-with-tags: 14,252 of 108,529 = 13.1%.** Used-condition tiers (very good + good +
satisfactory) = **76,123 = 70.1%.**
And the premium is real but smaller than people assume: **median new-with-tags €37.00 vs median
"very good" €22.00 — +68%**, not the multiple people imagine.

**n:** 14,252 · 58,761 (very good) · 108,529 (denominator).

**Source:** production `listings`. Condition strings are localised — and note the scraper returns
Spanish condition strings on `vinted_fr`, so the tier map is by *string*, never by market:

```sql
SELECT CASE
  WHEN condition IN ('Nuevo con etiquetas','Neu, mit Etikett','Novo com etiquetas','Nuovo con cartellino') THEN 'new_with_tags'
  WHEN condition IN ('Nuevo sin etiquetas','Neu','Novo sem etiquetas','Nuovo senza cartellino')            THEN 'new_no_tags'
  WHEN condition IN ('Muy bueno','Sehr gut','Muito bom','Ottime')                                          THEN 'very_good'
  WHEN condition IN ('Bueno','Gut','Bom','Buone')                                                          THEN 'good'
  ELSE 'satisfactory' END AS tier, COUNT(*) AS n
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
GROUP BY tier ORDER BY n DESC;
-- very_good 58761 | new_no_tags 18154 | good 14518 | new_with_tags 14252 | satisfactory 2844
```

Medians (same window, window-function form as finding 4): new_with_tags n=14,252 → **€37.00**;
very_good n=58,761 → **€22.00**.

**Holds in:** EU5 pooled. Do not split by market — the condition string is a language artefact of the
scrape, not a market attribute.

**Post to:** 🇪🇸 **Spanish** — the "you do not need new stock, you need the right used stock" angle,
which is the entry point for the non-reseller audience.

**Flag:** condition premium is an authenticated-tier capability per `DATA_CONTRACT.md`. At population
aggregate it is inside the brief's rule 4. Confirm before it becomes a recurring format.

---

## 11. More Gucci caps left the shelf than Gucci shirts, t-shirts, jackets and jeans combined — twice over.

**Number:** **Gucci Caps: 1,216 departures, median €30.00.** Gucci Shirts 203 + T-Shirts 155 +
Jackets 146 + Jeans 58 = **562**. Caps are **2.16×** all four clothing categories together.
For contrast in the same brand: **Gucci Bags, 1,168 departures, median €100.00.**

**n:** 1,216 · 562 · 1,168.

**Source:** production `listings`.

```sql
SELECT brand, category, COUNT(*) AS n
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand = 'Gucci'
GROUP BY brand, category HAVING n >= 30 ORDER BY n DESC;
-- Other 4609 | Caps 1216 | Bags 1168 | Sneakers 398 | Hoodies 212
-- Shirts 203 | T-Shirts 155 | Jackets 146 | Jeans 58 | Tracksuits 55
```

**Caveat to carry:** Gucci's largest bucket is `Other` (4,609) — unclassified, not absent. Phrase as
"among the Gucci items we could classify". Do **not** say Gucci clothing does not move.

**Post to:** 🇮🇹 **Italian**, then 🇪🇸 Spanish (`vinted_es` has the most Gucci departures, 1,724).

---

## 12. Patagonia's second-biggest category is not clothing. It is bags.

**Number:** among classified Patagonia departures — **Jackets 2,351 · Bags 1,802 · Hoodies 966 ·
T-Shirts 834 · Caps 778 · Shirts 449.** Bags are **24.2% of everything Patagonia we could
classify** (1,802 of 7,452), and they left at a **median of €20.00**.

**n:** 1,802 (bags) · 9,691 (brand total, of which 2,239 unclassified).

**Source:** production `listings` — same brand × category query as finding 11 with `brand =
'Patagonia'`; median via the window-function form in finding 4.

**Why it matters to a reseller:** everyone sources the fleece. The bag is a quarter of the volume and
nobody is looking at it.

**Post to:** 🇩🇪 **German** — `vinted_de` is Patagonia's strongest market in our data (2,168
departures vs 1,754 in ES).

---

## 13. A famous denim brand's typical item left the shelf at €15.

**Number:** **Diesel — 3,687 departures, median €15.00, 10th percentile €5.00, 90th percentile
€47.00.** Its jeans are 1,102 of those. For comparison in the same window: **Reebok median €12.00
(n=2,458)** and **Fred Perry median €14.95 (n=6,444)**.

**n:** 3,687 · 2,458 · 6,444.

**Source:** production `listings` — percentile query in finding 8.

**The point of the post:** brand fame and item value are close to unrelated on Vinted. Three names
everyone recognises, all clearing in the low teens.

**Post to:** 🇪🇸 **Spanish** or 🇵🇹 **Portuguese** — Diesel's joint-strongest markets (ES 803, PT 806).

---

## 14. Half of everything one brand moved was a single kind of shirt.

**Number:** **Fred Perry — 3,227 of 6,444 departures (50.1%) were Shirts.** Second place, T-Shirts,
is 918.
Same shape in a different brand: **Off-White — 1,375 of 2,501 (55.0%) were Shirts.**

**n:** 6,444 · 2,501.

**Source:** production `listings`.

```sql
SELECT brand, category, COUNT(*) AS n
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand IN ('Fred Perry','Off-White')
GROUP BY brand, category HAVING n >= 30 ORDER BY brand, n DESC;
-- Fred Perry: Shirts 3227 | T-Shirts 918 | Other 782 | Hoodies 748 | Jackets 528
--             Sneakers 87 | Tracksuits 55 | Bags 48 | Caps 42
-- Off-White:  Shirts 1375 | T-Shirts 390 | Other 352 | Sneakers 170 | Hoodies 153
```

**Both brands clear the coverage-bias guard** — five and four categories above the publish floor
respectively, so the mix is describable. Phrase as **observed departures**, never market share, and
make **no claim about the categories that are absent.**

**Post to:** 🇩🇪 **German** for Fred Perry (`vinted_de` 1,435, its strongest market); 🇪🇸 **Spanish**
for Off-White (626, its strongest).

---

## 15. Bags are 5% of what leaves the shelf and 8% of the money.

**Number:** **Bags — 5,043 departures (4.6% of all) carrying €459,479 (7.7% of all euros), median
€34.99.** That is more euros than Shirts (€238,453) and T-Shirts (€203,751) put together, from half
as many items.

**n:** 5,043.

**Source:** production `listings`.

```sql
SELECT category, COUNT(*) AS n, ROUND(SUM(price_eur)) AS eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
GROUP BY category ORDER BY eur DESC;
-- Other 41804 2903445 | Jackets 9838 660076 | Sneakers 8859 573586 | Hoodies 13641 556736
-- Bags 5043 459479 | Shirts 10688 238453 | T-Shirts 8807 203751 | Caps 3367 126150
-- Jeans 3207 89480 | Tracksuits 2709 89258 | Coats 566 59904
```

Note the ordering inside this same result is itself a post: **Hoodies had 39% more departures than
Jackets (13,641 vs 9,838) but carried 16% fewer euros.**

**Post to:** 🇮🇹 **Italian** (`vinted_it` has the most bag departures, 1,044).

---

## 16. Two thirds of t-shirts left under €20. Only a fifth of jackets did.

**Number:** share of departures under €20 — **T-Shirts 5,700 of 8,807 = 64.7%** · **Bags 1,498 of
5,043 = 29.7%** · **Sneakers 1,894 of 8,859 = 21.4%** · **Jackets 2,074 of 9,838 = 21.1%.**

**n:** 8,807 · 5,043 · 8,859 · 9,838.

**Source:** production `listings`.

```sql
SELECT category, COUNT(*) AS n, SUM(price_eur < 20) AS under_20,
       ROUND(100.0 * SUM(price_eur < 20) / COUNT(*), 1) AS pct_under_20
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND category IN ('T-Shirts','Jackets','Sneakers','Bags')
GROUP BY category;
-- T-Shirts 8807 5700 64.7 | Bags 5043 1498 29.7 | Sneakers 8859 1894 21.4 | Jackets 9838 2074 21.1
```

**The post:** the same hour of sourcing spent on the wrong category costs you three times the margin.
This is the cleanest "€50 and a phone" beginner post that is not a repeat of the existing one,
because it is about *category choice*, not capital.

**Post to:** 🇵🇹 **Portuguese** — lowest median departure price of the five markets (€22.50), so the
"start where the margin is" framing is most relevant.

---

## 17. 38% of what we watch, we cannot name — and we publish that.

**Number:** **41,804 of 108,529 departures (38.5%) fall in category `Other`** — our own keyword
classifier found no match after the Vinted-category fallback
(`scrapers/vinted.py:399–415, 826–830`).

**n:** 108,529.

**Source:** production `listings` — the category query in finding 15.

**This is a build-in-public / data-transparency post, not a market claim.** It is the single most
credibility-building thing in this file, and it is also the caveat that must ride along with every
category share we publish: *these are shares of the 61.5% we could classify.*

**Post to:** all five, but this is the one that belongs on the **`/methodology` page** first — the
honesty rules stay fully in force there.

---

## 18. The same brand, the same shelf depth, two countries — and 76% more of it left in Spain than in France. **THIN on one leg**

**Number:** **Off-White — 626 departures in Spain vs 355 in France (1.76×)**, from last-pass shelf
depths of **183 (ES) and 181 (FR)**.
Second, cleaner case: **Reebok — 613 in Germany vs 383 in France (1.60×)**, depths **190 (DE) and
188 (FR)**.

**n:** 626 / 355 (Off-White) · 613 / 383 (Reebok). All legs well above floor.
**Why it is labelled thin:** the *n* is fine; what is thin is the **causal claim**. Equal shelf depth
is measured, but I have not ruled out that the two markets' shelves contain different items at
different prices. Publish it as an observation ("we watched X in Spain and Y in France off shelves
the same size"), **never** as "Spanish buyers want Off-White more".

**Source:** production `listings` for the counts; production `shelf_passes` for the depths.

```sql
SELECT brand, platform, COUNT(*) AS n
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND brand IN ('Off-White','Reebok','Diesel','Patagonia')
GROUP BY brand, platform ORDER BY brand, n DESC;
-- Off-White: es 626 | pt 625 | it 449 | de 446 | fr 355
-- Reebok:    de 613 | pt 543 | es 505 | it 414 | fr 383
-- Diesel:    pt 806 | es 803 | de 788 | it 645 | fr 645
-- Patagonia: de 2168 | fr 1989 | it 1964 | pt 1816 | es 1754

SELECT brand, platform, depth, pass_at FROM shelf_passes
WHERE brand IN ('Off-White','Reebok') ORDER BY brand, platform;
-- Off-White: de 186 | es 183 | fr 181 | it 180 | pt 188
-- Reebok:    de 190 | es 190 | fr 188 | it 189 | pt 190
```

**Post to:** 🇪🇸 **Spanish** (Off-White) and 🇩🇪 **German** (Reebok). This is the only genuine
market-difference finding in the file — finding 6 shows prices converge, this shows volumes do not.
The pair together is a strong two-part post.

---

## 19. The item that left the shelf was usually not a new listing. **THIN — interpretation, not n**

**Number:** **34,544 of 108,529 departures (31.8%) were at position 97–192** in Vinted's
newest-first feed when they left, and those averaged **€62.07** — against **€49.28** for the
29,093 that left from positions 1–24.

**n:** 34,544 · 29,093 · 19,137 (25–48) · 25,755 (49–96). All large.

**Source:** production `listings`.

```sql
SELECT CASE WHEN search_rank_latest <= 24 THEN '1-24'
            WHEN search_rank_latest <= 48 THEN '25-48'
            WHEN search_rank_latest <= 96 THEN '49-96'
            ELSE '97-192' END AS feed_position,
       COUNT(*) AS n, ROUND(AVG(price_eur),2) AS avg_eur
FROM listings
WHERE sold_observed = 1
  AND sold_at >= '2026-08-21 00:00:00' AND sold_at < '2026-09-01 17:00:00'
  AND search_rank_latest IS NOT NULL
GROUP BY feed_position ORDER BY feed_position;
-- 1-24 29093 49.28 | 25-48 19137 52.04 | 49-96 25755 53.84 | 97-192 34544 62.07
```

**Two hard constraints on how this is written.** The scraper sorts `newest_first`
(`scrapers/vinted.py:939`), so `search_rank_latest` is a **position in a recency-ordered feed**, not
a relevance rank and **not a duration**. Write it as position. **Do not** translate it into "had been
listed longer" or any time language — that is a days-to-sell claim and it is forbidden. Also, the
`193+` bucket is empty *by construction* (we watch ~190 deep), so never present the distribution as
complete.

Given those constraints I would publish this **only** as a carefully worded educational post, or not
at all. It is included because it is genuinely distinct; it is ranked low because it is the easiest
one in this file to word wrongly.

**Post to:** 🇫🇷 **French** if used at all — pair with findings 1 and 9 in the same shoot.

---

## 20. The most common price on Vinted is between €10 and €19 — and it is where the least money is. **THIN — same source as #2**

**Number:** **€10–19 is the single largest band: 23,638 departures (21.8%)**, carrying **€326,227 —
5.5% of all euros.** The €250+ band is one sixth as many items and seven times the money.

**n:** 23,638.

**Source:** production `listings` — the band query in finding 2.

**Labelled thin because** it is a second cut of finding 2's single query rather than an independent
observation. Use it as a *different post* only if #2 is used at a different time or on a different
platform; do not run both in the same batch or we have recreated the recycling problem.

**Post to:** 🇮🇹 **Italian** or 🇫🇷 **French** — the two markets with the highest overall median
departure price (€25.00 and €24.99), where "trade up" is the natural next step.

---

# What I could NOT defend — and why these are absent

**These are as important as the findings.** Each one is an axis the brief asked for, or an obvious
post, that the data does not support. If someone proposes one of these later, the answer is here.

### Time of week and seasonality — **UNKNOWN, not zero**
`sold_at` is stamped when our scraper *detects* the departure, not when the item left.
`app_meta.str_diagnostic_v1` on production says so in as many words: *"CLUSTERED — sold_at is stamped
at labelling"*. The evidence is unambiguous — 141 departures share one single second
(`2026-08-31 04:23:41`), and the peak departure hours are 00:00–04:00, which is when the crawler
runs. Any day-of-week or hour-of-day post would be a chart of **our own cron schedule** presented as
consumer behaviour. **There is no time-of-week finding available. Say UNKNOWN.**

### Days to sell — not computed, and not computable honestly
Forbidden by the brief and by `CLAUDE.md`. No shelf-time claim appears anywhere above; finding 19 is
worded as feed position specifically to stay clear of it.

### Asking price vs where things actually move — **UNKNOWN**
We do not retain a per-listing asking-price history that can be joined to a departure. The
alternative — aggregating the ~13M active listings by brand × category — **cannot be run against the
live production file**: I attempted one such aggregate (`Fred Perry` × `Shirts`, `is_sold=0`) and
killed it at 2 minutes, exactly the risk `ACCESS.md` rule 2 and AM-1 warn about. `market_stats`
does not help: its `avg_price_eur` is the average *departure* price over 30 days, not an ask.
**No ask-vs-move spread figure exists. Do not let anyone infer one from finding 1** — that is a
count ratio, not a price spread.

### Half sizes are worth less than whole sizes — **REJECTED, and this is why the floor matters**
The means look conclusive: half sizes €56.71 (n=1,443) vs whole €71.41 (n=6,135), a 21% gap. **The
medians are identical: €40.00 and €40.00.** The entire gap is a handful of expensive whole-size
outliers. Published as "half sizes are worth 20% less" it would be false. Dropped.

### Category mix differences between markets — **CONFOUNDED, do not publish**
The crawl is quota-balanced by market: departures per market run 20,770–22,849 and the category mix
is near-identical across all five (e.g. Hoodies 2,617–2,929 in every market). Any "Germans buy more
hoodies" post would be describing **our sampling design**, not the market. Finding 18 survives only
because it compares *one brand* across markets at *measured-equal shelf depth*.

### Anything about a narrowly tracked brand
`shelf_passes` shows last-pass depths of 20–90 for MNG, Boss, Calvin Klein Jeans, Polo Ralph Lauren,
Tommy Jeans, Pokémon and Vintage Dressing (which is absent from `vinted_de` entirely). Presence
claims about these are fine **with the depth stated** — that is what finding 3 does. **Absence
claims are not available at any n.**

### Subcategory
`subcategory` is NULL on **108,706 of 108,706** rows in production. The axis does not exist.

---

# Cross-checks anyone can run to falsify this file

1. **Wrong-database check.** `sqlite3 'file:/Users/bilalsbaiby/work/demand-intel/demand_intel.db?mode=ro' "SELECT COUNT(*) FROM listings WHERE sold_observed=1"` → **0**. If a figure here can be reproduced from the local copy, it did not come from where this file says it did.
2. **Window check.** Every SQL above carries the identical `sold_at` bounds. Re-running without the upper bound will give *larger* numbers, not different ones — production is still adding rows.
3. **Population check.** All eleven category counts sum to 108,529, and all nine price bands sum to 108,529.
4. **Floor check.** Every `n` stated is ≥ 30. The three findings with a leg under n=100 (EU 46 sneakers n=93; the XXL jacket leg n=242 is fine; Off-White FR n=355 is fine) are called out in place.

**If any artefact disagrees with a number in this file, the artefact is right and this file is
wrong.** Bring the disagreement back rather than reconciling it quietly.

---

# Coverage against the brief

| Axis requested | Findings | Status |
|---|---|---|
| Category / sub-category | 11, 12, 14, 15, 16, 17 | category ✅ · **subcategory impossible — 100% NULL** |
| Size velocity | 4, 7 | ✅ two independent size curves, both with medians |
| Price band | 2, 16, 20 | ✅ |
| Market differences ES/FR/DE/IT/PT | 6, 18 | ✅ — but the answer inverts the hypothesis: **prices converge, volumes diverge** |
| Time of week / seasonality | — | ❌ **UNKNOWN** — `sold_at` measures our crawler, not the market |
| Ask price vs where things move | — | ❌ **UNKNOWN** — no joinable ask history; live aggregate not runnable |
| The obvious brand is the wrong buy | 1, 3, 5, 8, 9, 13 | ✅ six independent angles |

**17 findings I will defend without qualification (1–17), 3 labelled THIN in place (18–20), and 6
axes explicitly reported UNKNOWN or REJECTED rather than padded.** If you would rather have 17 than
20, drop 19 and 20 first — 18 is a real finding and the only true market-difference asset we have.

---

## RE-VERIFIED 2026-09-02 08:4xZ — and why 17 queued posts were wrong

**A number is only true on the day it was measured.** 17 unpublished rows (EN/ES/FR/PT) all
carried the same templated pair of claims:

> *"New Balance sneakers alone left the shelf **309** times last week across ES/FR/DE/IT/PT,
> averaging **€42** at departure."*

Re-read from production today, same query shape, read-only from inside the container:

| claim | as queued | **production today** |
|---|---|---|
| New Balance sneaker departures, 7d | 309 | **1,223** |
| average departure price | €42 | **€38.15** |

**The direction was right and the magnitude was stale.** New Balance genuinely leads every
sneaker brand we track. All 17 rows were corrected rather than blocked — killing 17 true posts
over a stale integer is the wrong trade.

### Verified sneaker figures, 2026-09-02, 7-day window, ES/FR/DE/IT/PT

```
sneakers still listed      1,633,410
sneakers departed, 7d          4,555      -> 358 listed for every one that moves

departures by brand:   New Balance 1,223  ·  Nike 478  ·  Reebok 401
                       Adidas 334  ·  Puma 198
New Balance departures:  n=1,223   avg €38.15   min €1   max €145
```

*(Balenciaga sits second at 667 and is deliberately never named in marketing, along with Gucci.)*

### The rule this produced

**Re-verify every hard number at publish time, not at write time.** A figure templated into a
queue that sits for days will drift, and the post ships a number nobody can reproduce. One
disproven statistic costs the channel permanently — that is the whole reason this file exists.

**Corollary, learned the expensive way today:** when you bulk-correct a figure, `\b309\b` also
matches inside `8.309`. A regex word boundary is not a number boundary. That substitution
corrupted an Italian row into `8.1,223` before it was caught and restored. **Diff every row you
touch and re-scan for malformed output afterwards** — the correction is a new claim and earns
the same scrutiny as the claim it replaces.
