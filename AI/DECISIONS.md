# Decisions (frontend)

- One warehouse for published counts (`market-numbers.ts`). Static JSON is structure.
- STR % is the observed share; show it when n ≥ 30 watched sales, else raw counts (null, not 0).
- Do not label weekly turns >100% as sell-through.
- avg_days_to_sell withheld on every customer surface until listed_at is a real list time (current mean ~0.25d is scrape cadence).
- Hero is the extension panel + Add to Chrome (published store listing).
- Customer price label is **Avg sold** (the warehouse mean). Do not label it median.
- Starter sells Deal Scanner; Pro sells Live Deal Finder. Do not conflate them.
- Pro is self-serve; Business is talk-to-us.
- Free: 7-day trial, then 10 checks/month. Logged-out first 10 views show numbers.
