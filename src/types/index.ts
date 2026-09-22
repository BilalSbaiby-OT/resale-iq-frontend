import type { ReconstructedSignals } from "@/lib/verdict-intelligence"

export type Plan = "free" | "operator" | "power"
export type Momentum = "HOT" | "RISING" | "STABLE" | "FADING" | "DEAD"
export type PortfolioStatus = "sourced" | "listed" | "sold"

export interface User {
  id: number
  email: string
  plan: Plan
  email_verified?: boolean | number | null
  trial_active?: boolean
  trial_days_left?: number
  /**
   * Raw ISO timestamp from /auth/me. Stays NULL until the user confirms their
   * email (demand-intel api/auth.py:630 _start_trial_if_unset), and that is the
   * only thing separating a LAPSED trial from one that has never started —
   * both are plan=free with trial_active=false. The backend has been sending
   * it for exactly this reason; the type simply never declared it. Read it
   * through src/lib/entitlement.ts; nothing else should branch on it.
   */
  trial_ends_at?: string | null
  telegram_chat_id?: string | null
  is_owner?: boolean
}

export interface SizeVelocity {
  size: string
  sold_30d: number
  pct: number
}

export interface ModelSignal {
  brand: string
  model: string
  category: string
  sold_7d: number
  sold_30d: number
  avg_price_eur: number | null
  max_buy_price: number | null
  /**
   * THE SAMPLE BEHIND `avg_price_eur`, and nothing else. `comparable_n` is
   * `n_fenced` — the IQR-fenced, identity-filtered, de-duplicated set of sold
   * comps the mean and the buy-below are computed from (db/queries.py
   * `summarise_sold_prices`). It is NOT `sold_7d`.
   *
   * Verified against production 2026-09-06 by recomputing the fenced mean from
   * `listings` inside the API container: Balenciaga Track avg €92.22 over
   * n_fenced 98, from 335 watched departures in the window; Balenciaga Runner
   * €147.26 over 46, from 147. Both means reproduce to the cent, and both
   * sample sizes are a third of the departure count.
   *
   * So anything rendering "n" beside a price must pass THIS, not sold_7d —
   * see src/components/ui/median-n.tsx. Where a row has no comparable set at
   * all (the brand leaderboard aggregates across models), pass null and show
   * no n. A departure count in the sample slot is the bug, not a fallback.
   */
  comparable_n?: number | null
  /** LOW = below the n>=8 floor: every money field is null, on purpose. */
  confidence_tier?: "HIGH" | "MEDIUM" | "LOW"
  /** Server-written qualifier for a thin sample. Never invent a substitute. */
  confidence_note?: string | null
  evidence_sufficient?: boolean
  str_pct: number | null
  str_unavailable_reason?: string
  active_listings?: number | null
  opportunity_score: number | null
  momentum_label: Momentum | null
  months_supply: number | null
  speed_score: number | null
  size_velocity: SizeVelocity[]
  top_sizes: string[]
  data_quality_score: number
  updated_at?: string
}

export interface Deal extends ModelSignal {
  est_profit_eur: number | null
  profit_margin_pct: number | null
  sell_speed: "Very Fast" | "Fast" | "Medium" | "Slow"
  risk_level: "Low" | "Medium" | "High"
  sourcing_links?: { market: string; domain: string; url: string }[]
}

export interface LiveDeal {
  title: string
  price_eur: number
  size: string | null
  condition: string | null
  brand: string
  url: string
  photo: string | null
  favourites: number
  market: string
}

export interface LiveDealsResult {
  query: string
  max_price: number | null
  count: number
  markets_hit: string[]
  deals: LiveDeal[]
  error?: string
  reason?: string | null
}

export interface KPIs {
  avg_profit_margin: { value: number | string; unit: string; label?: string; sublabel?: string; delta_30d: string | null; trend: "up" | "down" | null }
  items_analyzed: { value: number; formatted: string; unit: string }
  top_category: { value: string; sublabel: string }
  market_opportunity: { value: number; label: string; sublabel: string; top_signal?: string; top_score?: number | null }
}

export interface BrandRanking {
  rank: number
  brand: string
  avg_price_eur: number | null
  sold_7d: number
  speed_label: string
  speed_score: number
  profit_label: string
  demand_score: number
  investment_score: number
  categories: string[]
}

export interface TrendsSummary {
  categories: Array<{ category: string; sold_7d: number; avg_price: number | null; speed: number }>
  trending_models: ModelSignal[]
  price_history: Array<{ category: string; avg_price: number; snapshot_date: string }>
  /** True when the momentum board cannot yet rank models — show the warm-up notice. */
  momentum_warming_up?: boolean
  /** True for a free/expired-trial account — trending_models' per-model paid
   * fields (max_buy_price, str_pct, opportunity_score, top_sizes) are redacted. */
  locked: boolean
  locked_fields: string[]
}

export interface BrandDetail {
  brand: string
  top_models: ModelSignal[]
  category_breakdown: Array<{ category: string; sold: number; score: number | null }>
  momentum_warming_up?: boolean
  locked: boolean
  locked_fields: string[]
}

export interface WatchlistItem {
  id: number
  brand: string
  model: string
  category: string
  notes: string
  alert_below_price: number | null
  created_at: string
  opportunity_score: number | null
  momentum_label: Momentum | null
  avg_price_eur: number | null
  max_buy_price: number | null
  sold_7d: number | null
  /** Sample behind avg_price_eur — ms.comparable_n, never sold_7d. */
  comparable_n?: number | null
  str_pct: number | null
  str_unavailable_reason?: string
  top_sizes: string[]
}

export interface PortfolioItem {
  id: number
  brand: string
  model: string
  category: string
  size: string
  condition: string
  cost_eur: number
  list_price_eur: number | null
  sold_price_eur: number | null
  platform: string
  status: PortfolioStatus
  days_held: number | null
  realized_profit: number | null
  notes: string
  sourced_at: string
  listed_at: string | null
  sold_at: string | null
}

export interface PortfolioStats {
  total_items: number
  sold_count: number
  listed_count: number
  sourced_count: number
  total_invested: number | null
  realized_profit: number | null
  avg_roi_pct: number | null
  avg_days_held: number | null
}

export interface AuthenticityResult {
  fetched_listing?: { brand: string; title: string; price_eur: number; size: string | null; condition: string | null; exact_match: boolean }
  confidence_score: number
  confidence_label: string
  flags: string[]
  breakdown: Record<string, number>
  disclaimer: string
  market_avg_price: number | null
  listed_price: number
}

export interface RecentSold {
  brand: string
  model: string | null
  title: string | null
  category: string
  size: string | null
  price_eur: number | null
  platform: string
  condition: string | null
  sold_at: string
}

export interface VerdictResult extends ReconstructedSignals {
  // INSUFFICIENT_DATA was missing here while the backend had been returning it
  // for months — so every render path that switched on `verdict` type-checked
  // without ever handling it. It is the answer whenever the sufficiency gate or
  // the shelf-observability gate withholds the numbers.
  // BRAND_CATEGORIES: a bare-brand query ("Nike") — no garment named yet.
  // BRAND_AVERAGE: brand + category named but no specific model — a real
  // priced aggregate (api/routes.py _brand_categories_next_step /
  // _brand_average_verdict), never a per-model buy-below.
  // OVERSUPPLIED: heavy live supply with ~zero watched departures — a real
  // "do not stock this" answer (api/routes.py _oversupplied_next_step), not a
  // refusal. Same lesson as INSUFFICIENT_DATA above: a verdict the backend
  // returns but the union omits type-checks everywhere and silently falls
  // through to the UNKNOWN branch, which rendered "NO DATA" on a query we can
  // in fact answer.
  verdict: "BUY" | "WATCH" | "SKIP" | "UNKNOWN" | "INSUFFICIENT_DATA" | "LIMIT_REACHED" | "BRAND_CATEGORIES" | "BRAND_AVERAGE" | "PAYWALL" | "OVERSUPPLIED"
  /** OVERSUPPLIED only — per-category evidence behind the verdict. */
  oversupply_categories?: {
    category: string
    live_listings: number
    avg_price_eur: number | null
    departures_7d: number
  }[]
  live_listings_total?: number
  product?: string
  category?: string
  /** BRAND_CATEGORIES only: the brand named, categories we hold data for. */
  brand?: string
  categories?: string[]
  /** BRAND_CATEGORIES only: per-category aggregate, most departures first. */
  category_aggregates?: { category: string; sold_7d: number; avg_price_eur: number | null }[]
  /** Suggested next query that will resolve to a priced result. */
  next_step?: string
  /** BRAND_AVERAGE only: the honesty sentence explaining this is an aggregate. */
  limitation?: string
  /** True on BRAND_CATEGORIES/BRAND_AVERAGE — a public aggregate, not a per-model verdict. */
  is_aggregate?: boolean
  opportunity_score?: number
  sell_through_rate?: string | null
  sold_7d?: number | null
  /** 30-day aggregate sales count — present when the model was admitted on
   *  30-day evidence (sold_30d>=8) but weekly shelf departures are not yet
   *  observable (shelf_blind coverage class). This is NOT weekly departures;
   *  the frontend must label it "N sold in 30 days", never "left shelf". */
  sold_30d_evidence?: number | null
  /** Human-readable explanation of the 30-day evidence window, e.g.
   *  "88 sold in 30 days (based on 30-day sales, not this week's shelf)".
   *  Present when sold_30d_evidence is set; always describes its window. */
  demand_note?: string | null
  n?: number | null
  active_listings?: number | null
  momentum?: string
  buy_below?: number | null
  sell_avg?: number | null
  sell_median?: number | null
  top_sizes?: string[]
  size_velocity?: SizeVelocity[]
  reasons?: string[]
  data_quality?: number
  /** HIGH | MEDIUM | LOW — data-quality band, never invented precision. */
  confidence?: string
  /** e.g. "Only 4 comparable sold items" when the sample is thin. */
  confidence_note?: string
  /** True when the call rests on momentum/price because STR is withheld. */
  provisional?: boolean
  message?: string
  upgrade_url?: string
  used_today?: number
  limit?: number
  /** Server-side redaction flag. When true the paid fields are ABSENT, not blurred. */
  locked?: boolean
  locked_fields?: string[]
  /** Free-tier daily unlock quota. Absent for anonymous callers and paid plans. */
  unlocks_used?: number
  unlocks_limit?: number
  unlocks_remaining?: number
  unlock_denied?: boolean
  /** True when the account must verify its email before it can spend the budget. */
  verification_required?: boolean
  unlocked_with_quota?: boolean
}

export interface CalcPlatform {
  platform: string
  sell_price: number
  platform_fee: number
  net_profit: number
  roi_pct: number
  fee_note: string
}

export interface CalcResult {
  product: string
  buy_price: number
  best_platform: string
  best_net_profit: number
  best_roi_pct: number
  platforms: CalcPlatform[]
  tip: string
}

export interface PlanInfo {
  id: string
  name: string
  price_eur: number
  price_id?: string
  verdicts_per_day: number
  features: string[]
}

export interface PlansResponse {
  publishable_key: string | null
  stripe_enabled: boolean
  plans: PlanInfo[]
}

export interface SearchSeller {
  id: number
  login: string
  rating: number | null
  feedback_count: number
  item_count: number
  photo?: string
}

export interface SearchItem {
  id: number
  title: string
  price: number
  price_eur: number
  currency: string
  size: string | null
  brand: string
  url: string
  photo: string | null
  country: string
  seller: SearchSeller | null
  favourite_count: number
  view_count: number
}

export interface SearchResult {
  query: string
  market: string
  country: string
  count: number
  items: SearchItem[]
}

export interface CountryPriceStats {
  country: string
  avg_price: number
  min_price: number
  max_price: number
  median_price: number
  count: number
  items: SearchItem[]
}

export interface PriceCompareResult {
  query: string
  markets_searched: number
  markets_with_results: number
  cheapest_market: { country: string; tld: string; avg_price: number } | null
  most_expensive_market: { country: string; tld: string; avg_price: number } | null
  by_country: Record<string, CountryPriceStats>
}
