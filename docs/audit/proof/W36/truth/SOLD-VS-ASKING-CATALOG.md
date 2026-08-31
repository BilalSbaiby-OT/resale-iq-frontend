# "Sold, not asking" framing — full catalog for the CEO's rewrite

Per `docs/audit/DATA.md` §2: there is no sold-price column in the schema. `price_eur` is the
asking price at last scrape. A "sale" is inferred from a listing leaving a Vinted search shelf
(`engine/shelf.py:detect_ended`), an inference method that has produced two prior mass
false-positive incidents (1.6M fabricated sales, then a second cohort of 168,852). None of the
strings below were edited by this pass — cataloguing only, per instruction. Grouped by page,
highest customer-visibility first.

## In-product, every check (extension)

- `extension/content.js:28` — the panel's own field label: `median: "avg sold"`. Rendered on
  every Vinted listing page a user opens with the extension active. Highest exposure of any
  instance on this list.

## The trust page (`/methodology`)

- `src/app/methodology/page.tsx:122-123` — `"We anchor on **sold** listings, not active ones.
  Active listings tell you what sellers hope to get. Sold listings tell you what buyers agreed to
  pay."` — the single sentence DATA.md is most directly about.
- `src/app/methodology/page.tsx:52` (FAQ) — `"Only transitions we observed (sold_observed)."`
- `src/app/methodology/page.tsx:148` (freshness table) — `["Sold-item verification", "every 60
  minutes", "confirms items actually sold"]`
- `src/app/methodology/page.tsx:166,169` — the sell-through formula and its definition:
  `str = sold_observed / (sold_observed + active_listings) × 100`, `"...sold_observed=1 — never a
  discovery-stamped sold_at."`
- `src/app/methodology/page.tsx:240` — `"Sale timestamps are when our tracker first saw an item
  marked sold, not the moment money changed hands."` (this one is already partially hedged, but
  still asserts the item *was* marked sold, which DATA.md says is an inference, not an
  observation)

## Dashboard (paid product)

- `src/app/(dashboard)/verdict/page.tsx:92` — page subtitle: `"BUY / WATCH / SKIP from watched
  sold listings"`
- `src/app/(dashboard)/verdict/page.tsx:156,216` — `"...computed from watched sold listings
  across 5 EU markets."`, `"...from watched sold listings, not a model guessing."`
- `src/app/(dashboard)/dashboard/page.tsx:207` — section label: `"Recently sold"` / sub
  `"Watched sold evidence — not asking prices"`
- `src/app/(dashboard)/deals/page.tsx:145` — `"Buy-below is 70% of the fee-adjusted sold price."`
- `src/app/data/page.tsx:177` — `'"Sold / 7 days" counts units we watched sell in the trailing
  week (sold_observed)... Average sale price is the mean of those observed sales.'`

## Homepage / landing

- `src/lib/i18n.ts:32` — feature line: `"BUY, WATCH or SKIP from watched sold listings — not a
  model guessing."`
- `src/components/landing/live-market-proof.tsx:89` — `"Watched sold counts across 5 EU markets
  — {n} items in the last 7 days."`

## `llms.txt` (AI-facing, cited by language models)

- `src/app/llms.txt/route.ts:55` — `"Method: watched sold transitions (sold_observed), not
  asking prices and not every sold listing we ever indexed."`

## API docs (public, unauthenticated)

- `src/app/api-docs/page.tsx:6,14,51` — `"...average sold prices..."`, `"...average sold
  price..."` ×2 more, describing `/api/model-signals` and the page intro.

## SEO / manual / blog (long tail, ~180 templated pages + manual chapters + blog posts)

- `src/data/search-intents.ts:28,33` — `"Real sold prices, not asking prices"` / `"...look at
  recently SOLD listings, not active ones — active listings show asking prices, not real sale
  prices."`
- `src/data/manual.ts:122,129,149,155` — the core "how to price" chapter: `"Start from the price
  the item realistically sells for..."`, callout `"Active listings show what sellers hope to
  get. Sold listings show what buyers agreed to pay."`, takeaway `"Use sold prices, never asking
  prices, as the input."`
- `src/data/manual-2.ts:23,381` — `"Anchor the number to sold prices for the same model..."`,
  portfolio chapter field list `"...sold date, sold price."`
- `src/data/blog-posts.ts:92,105,111,113` — four instances of the same "sold vs. asking" pricing
  advice across one post's body and FAQ.
- `src/data/blog-posts-2.ts:231` — `"...check the typical sold price first..."`
- `src/data/blog-posts-3.ts:166,172` — `"...anchor on the closest sold examples..."`,
  `"...recently-sold comparable items rather than asking prices..."`
- `src/app/flip/[brand]/[category]/page.tsx:97` — templated line across every brand/category
  combination: `"Check recently sold listings rather than active ones, since active listings show
  asking prices, not real sale prices."`

## Not on this list, and why

- `src/components/ui/median-n.tsx:6` — a code comment (`"Sold price + sample size..."`), not
  rendered copy.
- `src/data/manual.ts:461-462` (condition chapter's Nike/Adidas/Levi's price points) — already
  flagged separately in `CHANGES.md` §5/Top-10-#3 as unsourced static prose; listed here too
  because it says "median sold price," but the CEO may want to fold it into the same rewrite.
