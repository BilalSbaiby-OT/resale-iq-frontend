STATUS: READY
OWNER: none
PUSH: no
UPDATED: 2026-09-21

SEO LANE, 2026-09-21 — WEEK-1 SEED LOCK (same PR #127)
  SHIPPED on branch. URL shapes unchanged:
    /flip/{brand}/model/{slug} · /flip/{brand} · /glossary/{term}
  Week-1 = 32 pages: 10 glossary + 10 hubs + 12 models.
  Free checker ONLY Samba / AF1 / NB 530. Insufficient data = em-dash.
  ASICS / Salomon / Converse / Dr. Martens hubs added as structure
  (warehouse empty locally — no invented sold_7d). Old glossary slugs
  308 to locked terms. Sitemap: 12 model + 11 glossary locs.
  Isolation is the Coolify gate. Do not push main here.
  PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/127
  Branch cursor/seo-programmatic-models-c616.

---

SEO LANE, 2026-09-21 — PROGRAMMATIC MODEL TEMPLATES (week-1 batch, same PR)
  SHIPPED on branch. Same URL shapes. Do not open a competing PR.
  Pattern: /flip/{brand}/model/{slug} — 44 named A13 models (no Samba OG /
  AF1 Low / Dunk / Spezial doorway clones). Free sample only Adidas Samba,
  Nike Air Force 1, New Balance 530. All other models CTA Starter €19.
  Brand hubs: citeable lead + weekly velocity teaser → /data + HubFaq matching
  FAQPage (5 Qs, honest free only when that brand has a teaser model).
  Glossary: /glossary + buy-below / watched-departure / sell-through.
  Sitemap: 44 model URLs + 4 glossary URLs. EN only — no ES/FR/DE/IT/PT clones.
  Local: tsc, next build, isolation, warehouse, tracked, dupes, unit tests;
  curl 200 on samba / campus-00s / gg-marmont / nike hub / gucci hub /
  glossary; sitemap 44+4. Isolation green on PR #127. Playwright e2e-required
  fails are pre-existing (signup-verify / public-result-face), not this lane.
  Merge to main deploys via Coolify after Isolation. Do not push main here.
  PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/127
  Branch cursor/seo-programmatic-models-c616.

---

FRONTEND, 2026-09-21 — homepage hero + brand strip (PR #126)
  SHIPPED on branch. Local PASS: tsc, isolation, homepage-conv /
  pricing-offer / teaser-verdict unit, full e2e/smoke (13). Browser:
  one H1 + subline, no overline/Samba essay/listing count; centered
  checker + Free: + chips; brand strip 9 SVG marks + “+N more” → /data.
  Mock remainder is +17 (26 tracked − 9 shown). Live 28 brands → +19.
  Merge to main deploys via Coolify after Isolation.
  PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/126
  Branch cursor/homepage-hero-strip-d269. Do not push main here.

---

SEO LANE, 2026-09-21 — EX-HOMEPAGE-CONV leftover PR #125
  SHIPPED on branch. Local PASS: tsc, build, isolation, homepage-conv
  unit, smoke (form center x=640, Free: bottom y=602 < 800, 9 SVG tiles).
  Playwright public-result-face 3 fails are pre-existing on main
  (Stripe bar after a real check). Isolation is the deploy gate.
  PR: https://github.com/BilalSbaiby-OT/resale-iq-frontend/pull/125
  Merge to main deploys via Coolify after Isolation. Do not push main
  from this session.

SEO LANE, 2026-09-21 — EX-HOMEPAGE-CONV LIVE (merged #123)
  MERGED | 5ef7491 | leftover shipped as #125
  Free chips Samba + AF1 + NB 530. 501/550 removed. FAQ + table
  + Samba €24. Text wordmarks rejected — replaced in #125.

SEO LANE, 2026-09-14 — EX-ACTIVATION-FIX LIVE (merged #118)
  MERGED | e28c993 | live PASS
  `/deploy-id` SOURCE_COMMIT e28c993f0676e5785dbaeb14192c28d329d809c7
  Cache-busted curl:
    https://resaleiq.dev/pricing — Starter first CTA Get the numbers;
    trust “Cancel anytime · €19/mo · unlocks immediately”;
    Free demoted to “Public data only (not item checks) → /data”;
    no €0 card, no Start free.
    https://resaleiq.dev/es/pricing — Spanish trust + Solo datos públicos.
    https://resaleiq.dev/ H1 =
    “Find profitable Vinted flips before buying them.”
    https://resaleiq.dev/tools — no free BUY/WATCH/SKIP promise;
    “Most item checks unlock with Starter”; Get the numbers; toolname kept.
  Branch cursor/seo-ex-activation-fix-f1f0. PR #118.

---


SEO LANE, 2026-09-13 — EX-PRICING-OFFER LIVE (merged #117)
  MERGED | c35b6ba | live PASS
  `/deploy-id` SOURCE_COMMIT c35b6ba7e97d597ffb3b301cacea60ce884f7e2c
  Cache-busted curl:
  https://resaleiq.dev/pricing H1 =
    "Find profitable Vinted flips before buying them."
    + BUY / WATCH / SKIP + Starter €19/mo. First CTA Get the numbers.
  https://resaleiq.dev/es/pricing H1 =
    "Encuentra flips rentables en Vinted antes de comprarlos."
    + BUY / WATCH / SKIP + 19 €/mes. First CTA Consigue los números.
  Old "Know what to pay. Skip…" absent from both pricing URLs.
  First curl after Coolify can be stale; second matched SOURCE_COMMIT.

SEO LANE, 2026-09-13 — EX-PRICING-OFFER locked Bilal flips offer (this session)
  /pricing EN H1: "Find profitable Vinted flips before buying them."
  Subhead: BUY / WATCH / SKIP + target buy price + expected resale + Starter €19/mo.
  /es/pricing Spanish mirror (flips rentables + 19 €/mes). Title/meta stay
  EX-PRICING-CTR (Starter €19 / Pro €49). Marketing ladder: Starter, Pro, Free.
  Filled CTA is Starter. Stripe __OPERATOR__ / __POWER__ untouched.
  Branch cursor/seo-ex-pricing-offer-c223.

SEO LANE, 2026-09-13 — EX-WEBMCP-TOOLS (PR #116, CI firewall fix + live attrs)
  Production /tools still on 0c0e57e (no toolname). Firewall failed on
  silent catch in registerTool. Fixing swallows + SSR HTML beacon so
  curl sees toolname=/tooldescription= even if React filters client attrs.

SEO LANE, 2026-09-13 — EX-WEBMCP-TOOLS (PR #116, local PASS)
  Declarative WebMCP on FreeChecker (`check_vinted_item`, name=query)
  and PublicProfitCalculator (`calculate_vinted_profit`). Shared checker
  tool for /tools + /tools/vinted-price-checker. No toolautosubmit.
  Optional imperative registerTool, feature-detect only. No checkout
  tools. /llms.txt For agents section + free one-item checker boundary.
  Local: /tools + /llms.txt 200, attrs in HTML, Playwright + browser
  green. Live Coolify verify still owed after merge.
  Branch cursor/seo-ex-webmcp-tools-43e2. Rebased onto main after #115.

SEO LANE, 2026-09-13 — AEO-MANUAL-BUYBELOW-DEF LIVE (merged #115)
  MERGED | 0c0e57e | live PASS
  `/deploy-id` SOURCE_COMMIT 0c0e57e53f29d5fb1dd6255bc966aae5bebf73e1
  Cache-busted curl of /manual/the-buy-below-price:
  H2 “What is a buy-below price?” + lead (leave room after fees;
  avg departure ask × 0.95 × 0.70; watched-listing input; 5% fee;
  ~30% margin; sourcing ceiling, not promised profit). FAQ +
  DefinedTerm match. Title / H1 unchanged. how-to-price reinforced.
  DONE URL: https://resaleiq.dev/manual/the-buy-below-price
  Branch cursor/aeo-manual-buybelow-def-a923. PR #115.

SEO LANE, 2026-09-13 — EX-TOOLS-HOWTO calculator HowTo (merged #107/#114)
  HowTo JSON-LD + visible numbered steps on
  /tools/vinted-profit-calculator and /tools/vinted-price-checker.
  Steps from UI labels + lede/FAQ copy only. FAQPage kept.
  Price-checker title: "Vinted Price Checker — Typical Departure Price".
  Profit title already "Net Profit After Fees". og/twitter already
  match `${i.title} — Resale IQ`. Paid CTAs already on both pages.
  Branch cursor/seo-ex-tools-howto-97af.

SEO LANE, 2026-09-13 — BODY-FLIPS-002 / how-to-find-items-to-flip (this session)
  Body insert only on `/blog/how-to-find-items-to-flip-on-vinted`.
  New H2 after “Start from demand, not from what's cheap”, before
  “Use the buy-below filter”: “Demand is the other half”. Soft cite
  `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_flips_deepen_002_20260913`
  (anchor “Weekly market data”). Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_flips_deepen_002_20260913`.
  Subline: Buy-below + demand before cash sticks. Existing mid-CTA
  `body_flips_20260913` kept. Title / seoTitle / H1 / meta untouched.
  No `/register?src=blog`. HowTo heading lock updated so the new H2
  is a real on-page step. Branch cursor/body-flips-deepen-002-52b7.

SEO LANE, 2026-09-13 — AEO-PRICE-CHECKER-001 (merging)
  Fold Content deepen into /tools/vinted-price-checker.
  Title / H1 / WebApplication schema untouched. FAQ JSON-LD
  matches new visible FAQs. Free one-item check on /tools hub;
  sell-through/sizes on plan. CTA Get the numbers →
  /pricing?utm_source=tools&utm_medium=organic&utm_campaign=aeo_price_checker_001
  Secondary uses PRICE_CHECKER_MONEY_HREF (google_search_test +
  utm_content=price_checker). Branch cursor/aeo-price-checker-001-899c.
  PR #112. Rebased onto #110.

SEO LANE, 2026-09-13 — EX-CATEGORY-AEO LIVE (merged #103)
  MERGED | d27d432 | live PASS
  `/deploy-id` SOURCE_COMMIT d27d432bd616bb72adb782bebcef32db2c5ecaf1
  Cache-busted curl: title + og + twitter =
  "What Sells Best on Vinted by Category — 10 Ranked". FAQPage 4/4
  + visible HubFaq. 3 UTM hrefs category_aeo_20260913. No /register.
  /category/sneakers twitter matches leaf title (not homepage).
  Playwright /data H1 ignored if it is the sole flake.

SEO LANE, 2026-09-13 — EX-CATEGORY-AEO hub metadata + FAQ
  SHIPPED. /category is a real hub (10 live categories). Not a stub.
  Answer-first title: "What Sells Best on Vinted by Category — N Ranked"
  (49 chars @ N=10). twitter title/desc aligned (was homepage leak).
  FAQPage via faqPageJsonLd + visible HubFaq: what sells by category,
  weekly volume, buy-below pairing, markets. New body anchors → /data
  /flip /pricing with utm_campaign=category_aeo_20260913. FAQ answers
  cite absolute /data /flip /pricing with no UTM. No invented inventory.
  /category/[category] keeps EX-FLIP-CATEGORY-META titles + HubFaq +
  buy-below FAQ. Tests: faq-schema.test.ts + hub-social-meta.test.ts.
  Branch cursor/seo-ex-category-aeo-c85e. Rebased onto main after #106/#108.

SEO LANE, 2026-09-13 — EX-PRICING-CTR money-intent titles (merged #108)
  /pricing EN + FR/ES/DE/IT/PT: Starter €19 / Pro €49 + buy-below in
  title+meta. Matching og/twitter (EN was missing twitter / shorter og).
  No Free pitch. H1, FAQ, Conversion CTAs, Stripe paths untouched.
  /methodology EN title AEO: "How Buy-Below and Every Number Are
  Calculated — Resale IQ". Locale methodology titles keep text0 +
  brand suffix. Kill: GSC 14d CTR on /pricing; secondary =
  organic sessions → checkout. Branch cursor/seo-ex-pricing-ctr-b6c4.

SEO LANE, 2026-09-13 — EX-FLIP-CATEGORY-META (merged #106)
  Answer-first titles on /flip/{brand}, /flip/{brand}/{cat},
  /category/{cat}. No live figures in <title>. og/twitter match.
  FAQPage already on category children — left in place.
  H1s and page data rendering untouched. Kill: no GSC impr/CTR
  movement on /flip/* in 30d (assumption flagged).
  Branch cursor/seo-ex-flip-category-meta-d82d.

SEO LANE, 2026-09-13 — homepage FAQ UK word (hotfix) (merged #109)
  e2e/market-coverage.spec.ts failed: FAQ said “does not cover the UK”.
  Rephrased to name ES/FR/DE/IT/PT + “five EU markets” only. No UK/US.
  Branch cursor/fix-homepage-faq-uk-c372.

SEO LANE, 2026-09-13 — EX-HOMEPAGE-AEO title+meta(+FAQ) (merged #105)
  English `/` only. Answer-first title/og/twitter (brand suffix).
  Conservative: keeps “know what to pay” + adds EU Vinted.
  Visible HubFaq (3 Qs) + FAQPage. H1/CTAs/pricing funnel untouched.
  Locale heroTitles unchanged. Org/SoftwareApplication JSON-LD verified.
  Branch cursor/seo-ex-homepage-aeo-c372.

SEO LANE, 2026-09-13 — EX-LOCALE-CTR-ES (merged #104)
  Only ES blog: /blog/como-poner-precio-en-vinted (/es/blog/* 307s here).
  Answer-first title + meta. H1 aligned (old H1 mismatched). EN titles
  untouched. og/twitter now use the document title (same /data bug).
  Locale /es/pricing + /es/methodology twitter/og match document title.
  Bodies/CTAs untouched. No /register?src=blog.
  Branch cursor/seo-ex-locale-ctr-es-dd59.

SEO LANE, 2026-09-13 — EX-TOOLS-AEO LIVE (merged #99)
  MERGED | 7e968e5 | live PASS
  `/deploy-id` SOURCE_COMMIT 7e968e5cd0e1e91e8a30f39fc130ba8e6d194f3d
  Cache-busted curl: /tools title + og + twitter =
  "Vinted Tools: Price Check & Buy-Below — Resale IQ". FAQPage 5/5
  + visible HubFaq. Child price-checker / profit-calculator /
  sourcing-tool social titles match document title. HowTo absent
  (no numbered steps). Soft /data /flip. No /register. First curl
  after Coolify swap was stale; second curl matched. Playwright
  /data H1 ignored per owner.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-4 LIVE on production (merged #100)
  MERGED | 0bcee93 | live PASS on SOURCE_COMMIT 7e968e5 (main after
  #99; includes #100). Cache-busted curl: 6/6 titles + metas match.
  H1s unchanged. Playwright /data H1 flake ignored (Isolation green).

SEO LANE, 2026-09-13 — EX-MANUAL-AEO LIVE (merged #101)
  MERGED | d69e7fa | live PASS
  `/deploy-id` SOURCE_COMMIT 0bcee93 (includes #101; #100 merged after).
  Cache-busted curl: /manual FAQPage 5/5 + visible HubFaq.
  15 chapters 4 FAQPage each. Buy-below DefinedTerm PASS.
  Authenticity title + body_fake + 2 FAQs untouched. Playwright
  /data H1 ignored per owner.

SEO LANE, 2026-09-13 — EX-TOOLS-AEO (this session)
  PR #99 cursor/seo-ex-tools-aeo-fc7b. /tools title is now
  "Vinted Tools: Price Check & Buy-Below — Resale IQ" with matching
  og/twitter. FAQPage + HubFaq (5 Qs). Child tool social titles match
  `${i.title} — Resale IQ`. HowTo skipped (no numbered steps). Soft
  /data /flip. Existing /pricing?src=tools_index kept. Merged latest
  main (#100/#101/#102). Live-verify after Coolify.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-4 remaining answer-first titles
  Title + meta only on 6 remaining soft EN posts. H1s unchanged.
  No mid-CTA / body / schema edits. No /register. No Free pitch.
  Brand suffix " — Resale IQ" on every seoTitle. Titles ≤60, metas ≤155.
  Question/answer-first for AEO + SERP. Branch
  cursor/seo-ex-ctr-batch-4-5b34. Merging now per owner; ignore
  /data H1 Playwright flake (expected "Vinted market data").

SEO LANE, 2026-09-13 — EX-MANUAL-AEO hub + chapter FAQ
  /manual hub now has FAQPage + HubFaq (what it is, who for, free?,
  buy-below/data, markets). Title: "How to Resell on Vinted — The
  Vinted Reselling Manual". 15 chapters expanded 2 → 4 FAQs from
  chapter copy. /manual/the-buy-below-price citeable DefinedTerm
  matches the blog twin. Soft seoTitles keep Manual suffix.
  Authenticity title/meta/H1/body_fake untouched. No /register in
  FAQ. Paid CTAs stay /pricing. Branch cursor/seo-ex-manual-aeo-30fe.

SEO LANE, 2026-09-13 — BODY-VIEWS-002 LIVE (merged #102)
  MERGED | 45e1979 | live PASS
  `/deploy-id` SOURCE_COMMIT 45e197980d252b0e3d0037954117744d6ec7046d
  Cache-busted curl of /blog/how-to-get-more-views-on-vinted:
  heading “Demand is the other half of the views” present.
  Paid href `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_views_deepen_002_20260913`
  Button “Get the numbers”. Zero `/register?src=blog`.
  Title + H1 unchanged: “How to Get More Views on Vinted — 4 Causes and Fixes”.
  Agent Isolation green; Deploy green. Playwright still running —
  ignore /data H1 flake if it is the sole failure.

SEO LANE, 2026-09-13 — BODY-VIEWS-002 / EX-CONTENT-BODY-005 (this session)
  Body insert only on `/blog/how-to-get-more-views-on-vinted`.
  New H2 after “First: is there demand at all?”, before listing tips:
  “Demand is the other half of the views”. Soft cite
  `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_views_deepen_002_20260913`
  (anchor “Vinted market data”). Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_views_deepen_002_20260913`.
  Subline: Buy-below + demand before cash sticks. Existing mid-CTA
  `body_views_20260913` kept. Title / seoTitle / H1 / meta untouched.
  No `/register?src=blog`. HowTo heading lock updated so the new H2
  is a real on-page step. Branch cursor/body-views-deepen-002-2e92.

SEO LANE, 2026-09-13 — EX-AEO-DEFINITIONS LIVE (merged #98)
  /deploy-id 7915b90. Cache-busted curl: 5/5 PASS (buy-below,
  sell-through, what-sells-best, /data, /flip). DefinedTerm + FAQ
  present. No /register. Playwright /data H1 ignored per owner.

SEO LANE, 2026-09-13 — EX-AEO-DEFINITIONS citeable term blocks
  Visible H2 + 1–2 sentence leads (above the fold on the three blogs via
  `definedTerm`). FAQ answers match. DefinedTerm JSON-LD added beside
  existing FAQPage. Titles/metas/H1s untouched. No invented stats.
  No Free /register. Paid CTA stays /pricing.
  1. /blog/buy-below-price-explained — “Buy-below price”
  2. /blog/what-is-a-good-sell-through-rate — “Sell-through rate”
  3. /blog/what-sells-best-on-vinted — “Watched departure” + ilink
     to /data and /flip (moved existing ilink_20260913 anchors into
     the lead; later body links stay untracked /flip /data)
  4. /data — “What is a watched departure?”
  5. /flip — “How we rank what sells best”
  Branch: cursor/seo-ex-aeo-definitions-5496
  Also aligned e2e/smoke /data H1 to "Weekly brand volumes on Vinted"
  (was stale "Vinted market data" — the flake that blocked #94).

SEO LANE, 2026-09-13 — EX-CTR-BATCH-3 LIVE on production (merged #96)
  All 10 EN titles/metas verified live via cache-busted curl after Coolify.
  /deploy-id 8297fd9. Playwright /data H1 flake ignored (expected
  "Vinted market data", live H1 is "Weekly brand volumes"). Agent
  Isolation was the deploy gate.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-3 answer-first titles
  Title + meta only on 10 EN posts. H1s unchanged (already matched).
  No mid-CTA / body / schema edits. No /register. No Free pitch.
  Brand suffix " — Resale IQ" on every seoTitle. Titles ≤60, metas ≤155.
  Question/answer-first for AEO + SERP. Buy-below/demand where natural.
  Branch cursor/seo-ex-ctr-batch-3-b6b6. Merged #96 despite /data H1
  Playwright flake (expected "Vinted market data").

SEO LANE, 2026-09-13 — EX-HOWTO-SCHEMA LIVE (merged #97)
  HowTo + FAQPage both present on all 6 process URLs after Coolify.
  Live SOURCE_COMMIT 8297fd9 (contains merge 3853d29). Cache-busted
  curl. Steps from on-page H2s / 4 numbered checks. No /register, no
  UTM, no invented tools. Mid-CTAs/ilinks untouched.

SEO LANE, 2026-09-13 — EX-ILINK-REST remaining EN blog hubs
  Production gaps: `/blog/common-vinted-scams-sellers` and
  `/blog/vinted-disputes-and-returns-sellers` had no `ilink_20260913`.
  Scan of EN posts in `src/data/blog-posts*.ts`: only those two were
  missing. 1–2 body anchors each → `/data` and `/flip` via `ilinkHref()`,
  same campaign. Titles/metas/H1s and `blog-mid-cta.ts` untouched
  (scams title/meta from EX-CTR-BATCH-2 kept). No /register. No new campaigns.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-2 LIVE on production (merged #94)
  All 8 EN titles/metas verified live via cache-busted curl after Coolify.
  Playwright /data H1 flake ignored (expected "Vinted market data",
  live H1 is "Weekly brand volumes"). Agent Isolation was the deploy gate.

SEO LANE, 2026-09-13 — EX-CTR-BATCH-2 title/meta pack (8 EN posts)
  Title + meta only (H1 on sneaker / thrift / seasonal — old H1 mismatched).
  No mid-CTA / body CTA edits. No /register?src=blog in these posts.
  Brand suffix " — Resale IQ" on every seoTitle. Titles ≤60, metas ≤155.
  Branch cursor/seo-ex-ctr-batch-2-e4dc. Merging despite /data H1 Playwright
  flake (expected "Vinted market data", live H1 is "Weekly brand volumes").

SEO LANE, 2026-09-13 — EX-FAQ-SCHEMA-HUBS (this session)
  FAQPage JSON-LD on /flip (expanded), /data (new, Dataset kept),
  /blog/what-sells-best-on-vinted (aligned; cites
  https://resaleiq.dev/data and https://resaleiq.dev/flip, no UTM).
  Visible HubFaq matches schema. No /register. No invented stats.

SEO LANE, 2026-09-13 — EX-OG-HUBS /data /flip social titles
  /data now sets openGraph + twitter title/description to the page
  title ("Weekly Brand Volumes on Vinted — What Sells Best in 2026").
  /flip already had og:title; twitter:title/description now match.
  Homepage layout strings untouched. No UTMs.

SEO LANE, 2026-09-13 — BODY-SELLSBEST-001 on what-sells-best-on-vinted
  New section after ranking, before FAQ: "Buy-below still decides the flip".
  Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
  Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_sellsbest_20260913`.
  Subline: Buy-below + demand before cash sticks. No `/register?plan=`.
  Existing EX-ILINK flip/data anchors kept.

SEO LANE, 2026-09-13 — EX-ILINK blog → /flip /data /pricing
  Contextual body anchors only. Campaign `ilink_20260913`
  (`utm_source=blog&utm_medium=ilink&utm_content=to_{hub}`).
  Titles/metas/H1s and `blog-mid-cta.ts` untouched. No new /register.
  ES post uses `/es/data` + `/es/flip`. Pricing ilink skipped on
  buy-below — BODY-BUYBELOW-001 already has a mid-CTA. Helper:
  `src/lib/blog-ilink.ts`.

SEO LANE, 2026-09-13 — BODY-BUYBELOW-001 on buy-below-price-explained
  New section after the formula, before FAQ: "Demand is the other half
  of buy-below". Soft cite `/data?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
  Paid CTA Get the numbers →
  `/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_buybelow_20260913`.
  No existing ctr_blog mid-CTA on this post.

FRONTEND, 2026-09-13 — blog signup-wall CTAs → /pricing
  Shared SmartCTA now `/pricing` + `utm_content=legacy_signup_kill`.
  How-to-price campaign `ctr_price_20260913`. Fallback `ctr_blog_20260913`.

SEO LANE, 2026-09-13 — BODY-ES-001 on como-poner-precio-en-vinted
  New section after buy-below: "La demanda es la otra mitad del precio".
  Soft cite `/es/data?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
  Paid CTA + footer: Consigue los números →
  `/es/pricing?utm_source=blog&utm_medium=organic&utm_campaign=body_price_es_20260913`.
  Never English `/pricing` on this post. English BODY-001 left to PR #85.

SEO LANE, 2026-09-13 — BODY-001 exact Content insert on how-to-price
  Section after buy-below: "Demand is the other half of the price" —
  Content's wording (5,746 / Fred Perry 1,027 @ €19 / Stone Island 892
  @ €66 / Gucci 230 @ €197). Cite + CTA campaign `body_price_20260913`
  (`utm_source=blog&utm_medium=organic`). ctr_price mid-CTA kept.
  Footer still `ctr_price_20260913` + `footer_see_plans`. No ES page.

SEO LANE, 2026-09-13 — BODY-001 on how-to-price-items-on-vinted
  New section after buy-below: "Demand is the other half of the price".
  Soft /data cite `body_price_20260913` / `data_cite`. Paid CTA
  `utm_source=blog&utm_medium=organic&utm_campaign=body_price_20260913&utm_content=body_cta`.
  Existing mid-CTA `ctr_price_20260913` kept. Footer See plans still
  `ctr_price_20260913` + `footer_see_plans`.

SEO LANE, 2026-09-13 — blog footer See plans now carries UTMs
  (`utm_content=footer_see_plans`, campaign from the post mid-CTA).
  Copy lock: button "Get the numbers", subline "Buy-below + demand before
  cash sticks." Dest `/pricing?utm_…` only.

SEO LANE, 2026-09-13 — CTR pack merged (#82). Button "Get the numbers",
  subline "Buy-below + demand before cash sticks.", dest `/pricing?utm_…`
  (never /register). Views campaign `body_views_20260913`. Price uses
  `ctr_price_20260913` with the same QC copy.

SEO LANE, 2026-09-13 — EX-CTR-002/003 CTA copy aligned to Content:
  #78 already merged (affa559). Campaigns body_flips_20260913 /
  body_fake_20260913. Soft /data. No register.

SEO LANE, 2026-09-13 — EX-CTR-002 + EX-CTR-003 (title/meta/H1):
  Title + meta + H1 on the two 0-click page-1 posts. Mid-CTAs added after
  Conversion greenlit /pricing. PR #78.

SEO LANE, 2026-08-31 (after the growth release below):
  [x] Sitemap lastmod was LYING and is fixed (94bc5ef). It advertised that 174
      URLs changed several times a day — measured 17:56Z, then 23:55Z, then
      00:51Z within one evening — because data pages used the snapshot's hourly
      TIMESTAMP and static pages used BUILD TIME, which now moves on every
      auto-deploy. Told repeatedly that a page changed, fetching it, and finding
      it identical is how a crawler learns to ignore your lastmod. Now day
      granularity for data pages, a fixed STATIC_CONTENT_DATE for static ones.
  [x] Spanish test page live (4292461): /blog/como-poner-precio-en-vinted, paired
      to how-to-price-items-on-vinted with RECIPROCAL hreflang. It exists to test
      one thing: does EU-language demand exist? Every EU5 impression we get is on
      an ENGLISH query, and the site has no non-English page — so "no Spanish
      impressions" was never evidence, it was a measurement artefact. Read at
      +28 days: any Spanish-language query = demand proven; none = localisation
      is dead on evidence. Criteria fixed in advance, in
      ~/Desktop/resale-iq-seo/briefs/2026-08-31-spanish-test-page.md.
  [x] Corrected the extension block below — it claimed NOT SUBMITTED / published
      1.2.0; the store has served 1.3.0 since 30 Aug.
  THANKS FOR THE HOMEPAGE HUB LINKS — verified live. Crawl depth 2 -> 1.
  YOUR GSC READ IS LOGGED and matches mine independently. Two of your points went
  straight into the SEO plan: the depop cluster is a page-exists-but-won't-rank
  problem (not a missing page), and the description/photo queries are a FREE TOOL
  opportunity rather than a blog post. Full analysis + the market-fit plan:
  ~/Desktop/resale-iq-seo/briefs/2026-08-31-market-fit-plan.md
  ONE THING THE GSC DATA CANNOT SETTLE, flagged for the owner: 78.5% of
  impressions are US/GB/IE/AU/CA and the product covers ES/FR/DE/IT/PT (6.7%).
  At 901 impressions that is too small to justify any market decision — but it is
  the question that matters most once volume grows.

GROWTH LANE RELEASED 2026-08-31. Everything below is committed and pushed; the
working tree is clean. Phase 1 attribution is live and PROVEN — the first tagged
pageviews arrived on 30 Aug (16 from Instagram). Repo is free for the SEO lane.

WHAT THE GROWTH LANE DID SINCE 29 AUG (all live):
  [x] Attribution end-to-end. utm_source/medium/campaign/content/term all stored
      on pageviews; signup_attribution wired to register(). First real tagged
      traffic 30 Aug.
  [x] Search intent capture. Every FAILED search now records its reason
      (model_too_vague / ambiguous / no_data / limit_reached) with user_id.
      All of it was discarded before 30 Aug.
  [x] verdict_outcomes + the dashboard prompt asking customers what actually
      happened after a verdict. /api/admin/calibration returns ready:false until
      20 completed sales, by design.
  [x] SHORT TRACKED LINKS in next.config: /tt /ig /rd /li -> /check with tags.
      NOTE FOR ANYONE ADDING MORE: these MUST live in next.config, not FastAPI.
      Single-segment paths on this domain are served by Next.js — I put them in
      the backend first and they 404'd. /health 404ing the same way is the tell.
  [x] Homepage footer now links /flip and /category (the HUBS, not just leaves) —
      the SEO agent's request, actioned. Both were at crawl depth 2.
  [x] Security: CSRF guard on the local dashboard (a cross-origin text/plain POST
      used to return 200 and could approve or publish content); search-triage
      prompt hardened against injection.

SEARCH CONSOLE, READ 31 AUG — hand this to the SEO lane, it is the freshest
signal available and it changes priorities:
  Property is the URL-PREFIX one (https://resaleiq.dev/), NOT sc-domain — the
  domain property is not accessible to emmanuelbilal33@gmail.com.
  All-time (data starts 10 Aug): 901 impressions, 5 clicks, CTR 0.6%, avg pos 14.
  Impressions climbing hard: ~0/day early Aug -> ~100/day by 28 Aug.

  "Average position 14" is FLATTERING. It is an average pulled up by a few
  long-tails. The commercial clusters are far worse:

  1. DEPOP vs VINTED — the biggest cluster and the worst ranked.
     14 query variants, ~20 impressions, EVERY ONE at position 49-77.
     ("vinted vs depop" 61.5, "depop vs vinted" 62.3, "is depop or vinted better"
     56.5, "vinted vs depop uk" 59, "difference between vinted and depop" 63...)
     The vinted-vs-depop rebuild is live per the last SEO note — so the page
     EXISTS and is not ranking. That is a different problem from a missing page.

  2. PRICING / VALUATION — literally the product, all on page 5+.
     "how to price vintage clothing" 10 impressions at position 48.9 (top query).
     "evaluating vintage clothing value" 56, "vintage fashion valuation" 79,
     "vinted price" 56.

  3. VINTED DESCRIPTIONS / PHOTOS — a free-tool opportunity, not a blog post.
     "vinted photos" 45, "how to write vinted descriptions" 48,
     "vinted description generator" 57, "vinted description" 57.

  WHERE WE ALREADY RANK (and get no clicks — a titles/CTR problem, not a
  position problem): "resale?" pos 2.0 · "how to get more views on my sports
  items on vinted?" pos 10 · "how to start reselling with no money" pos 11 ·
  "vinted arbitrage" pos 17.3.

  Only 29 distinct queries total. The site is young; impressions are the leading
  indicator and they are healthy.
LAST SESSION DID: extension 1.3.0 committed + pushed (ead8449, 0a1950c, ada0d30).
  The 404 uncommitted lines that blocked this repo are now in. Store screenshots
  regenerated: they showed the removed IN RANGE / TOO DEAR labels, and the hardcoded
  asking price had gone stale so the panel claimed EUR140 on a page showing EUR120 —
  price now read live from [data-testid="item-price"].
  [x] Coolify deploy DONE 2026-08-29. /privacy live and verified: "27 August 2026"
      plus all four phrases the store review needs (session token on this device
      only / not in Chrome sync / title, brand and asking price / contacts no
      other host). NOTE: a plain curl served a STALE cached copy showing the old
      date — verify this page with a cache-buster (?v=timestamp) or you will
      mis-read it as un-deployed.
  DASHBOARD PROGRESS 2026-08-29 (done via the Claude Browser pane, which CAN
  script the Web Store even though the Chrome extension cannot):
    [x] Package 1.3.0 uploaded as the draft (published was 1.2.0 at the time;
        1.3.0 is the published version since 30 Aug — see the [x] below).
    [x] Store listing copy, category, language, URLs: already correct.
    [x] Privacy: single purpose, storage + host justifications, remote-code=No,
        the 3 certifications and the policy URL were all already correct.
    [x] FIXED A REAL COMPLIANCE GAP: every "data usage" box was UNCHECKED, while
        the extension does send listing content and does store a session token.
        Ticked "Authentication information" and "Website content" (and nothing
        else), saved, and verified they survive a page reload.
    [x] SUBMITTED AND LIVE. The owner replaced the screenshots and submitted;
        it passed review. Verified against the public listing 2026-08-31:
        **version 1.3.0, updated 30 August 2026, 18.22 KiB, 0 ratings.**
        The two blockers below are RESOLVED and kept only as the record of why
        the release waited — do not re-action them.
        (was: NOT SUBMITTED — the attached screenshots were byte-identical to the
        14 Aug originals, 836100 / 863476 bytes, and visibly said "IN RANGE", a
        label 1.3.0 removed. Owner then uploaded
        extension/store-assets/screenshot-1-in-range.png (BUY) and
        screenshot-2-too-dear.png (SKIP) and submitted.)

  WHY AN AGENT CANNOT DO THE UPLOAD — do not retry it:
    Chrome refuses to let ANY extension script the Web Store ("The extensions
    gallery cannot be scripted"), so Claude-in-Chrome cannot drive the dashboard.
    The Chrome Web Store API v2 is no substitute: it exposes only media.upload
    and publishers.items.publish — there is no resource for screenshots, listing
    copy, permission justifications or data-use declarations, and for 1.3.0 the
    screenshots and declarations are precisely what must change.
    Owner does the dashboard: extension/SUBMIT-CHECKLIST.md has every field in
    order, paste-ready, generated from STORE-LISTING.md.
  Package ready: ~/Desktop/resale-iq-extension-1.3.0.zip (1.3.0, matches the tree).
  Listing copy to paste verbatim: extension/STORE-LISTING.md
DEPLOY IS AUTOMATIC NOW (2026-08-29) — read agent/GUARDRAILS.md before pushing.
  A push to main DEPLOYS. Both repos have a Deploy workflow that runs once CI is
  green: resale-iq after "Agent Isolation", demand-intel after "Tests". No human
  step, nothing to click. A red build does not deploy — CI is the only gate.
  Verified end-to-end 2026-08-29 16:08: a push with no manual action replaced the
  frontend container (...160848952043) and the backend (...160908343246), and all
  production routes returned 200 afterwards.
  Mechanics: GitHub Actions SSHes to the server with a deploy-only key held in
  each repo's COOLIFY_DEPLOY_KEY secret. Each key sits behind a forced command in
  root's authorized_keys, pinned to one app UUID, no-pty and no forwarding — it
  cannot open a shell or deploy the other app (both verified). The Coolify API
  token lives in that forced command on the server and is not in GitHub.
  Re-provision with /root/setup-ci-deploy.sh (idempotent; prompts for the token).
  Note the API needs POST, not GET — an authenticated GET returns 405, and an
  unauthenticated probe returns 401 first, which hides it.
  The Coolify dashboard is still only reachable via
  `ssh -N -L 8000:localhost:8000 resaleiq` — a Hetzner Cloud Firewall drops :8000.
  Deploys no longer need it.
  SEO note: the P1-P4 work is live and verified (hubs, internal links,
  vinted-vs-depop rebuild, breadcrumbs). Detail in ~/Desktop/resale-iq-seo/.
  REQUEST FOR THE OTHER AGENT: src/app/page.tsx is your lane — a homepage footer
  link to /flip and /category would move both hubs from crawl depth 2 to 1.
NEXT TASK: offsite backup OAuth (Drive token) — see CURRENT_STATE. P0–P2 boxes are [x]

Frontend origin: (this commit). Backend: (this commit).
Chrome store: https://chromewebstore.google.com/detail/resale-iq-buy-below-price/fgpajplglnapkebhbcbhlmbbkmnighcm

P0s 0–8, P1s 1–5, and P2 are done. Do not invent numbers.
`src/lib/market-numbers.ts` is the warehouse. Playwright: `npm run test:e2e`.

STR: `sold_observed / (sold_observed + active) × 100`, null if n < 30 OR active ≤ 0.
Median sold always carries sample size n; null is an em-dash, never 0.

---

# REPO MAP (P0-0)

## Two repos. Know which one you are in.
| | path | what | commit here for |
|---|---|---|---|
| **this** | `~/Desktop/resale-iq` | Next.js 16.3 + React 19.2, App Router, TypeScript | all P0/P1 UI, marketing, `extension/` |
| sibling | `~/Desktop/demand-intel` | FastAPI + SQLite (aiosqlite), port 8080 | anything serving the numbers |

The frontend proxies `/api`, `/auth`, `/stripe`, `/admin` to the backend via
`BACKEND_URL` rewrites. Never edit outside these two directories.

## Commands
```
npx tsc --noEmit
npm run build
npm run dev
npm run check:tracked
npm run check:isolation
npm run test:e2e
```
Backend: `cd ~/Desktop/demand-intel && python3 -m pytest tests/ -q`

## WHERE THE COUNTS LIVE
**Source of truth:** `src/lib/market-numbers.ts` → `/api/public/market-snapshot`
via last-good cache. `src/lib/stats.ts` is listings-tracked only.
`seo-brands.json` is STRUCTURE (slugs/routes), never a number fallback.

## Stripe
`src/lib/pricing.ts`. Pro is self-serve (`__POWER__`). Business keeps "Talk to us".
`STRIPE_PRO_PRICE_ID` = Starter/operator. `STRIPE_OPERATOR_PRICE_ID` = Pro/power.

## Extension — `extension/`
Manifest V3. Store URL is the published listing. `STORE-LISTING.md` must keep
`support@resaleiq.dev` and "not affiliated with Vinted" in paragraph 1.

## Landmines
1. `null` renders as `0`. `Math.round(null) === 0`. Score-bar: null → em-dash.
2. `.toLocaleString()` on null throws (ISR 500).
3. Sell-through is an observed share. Show % when n ≥ 30 watched sales; otherwise raw sold_7d + active_listings. Never weekly turns as STR.
4. Do not enable UK, auto-buy, fake hit rates, authenticity marketing.
