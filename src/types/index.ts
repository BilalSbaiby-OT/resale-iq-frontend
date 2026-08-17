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
  telegram_chat_id?: string | null
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

export interface VerdictResult {
  verdict: "BUY" | "WATCH" | "SKIP" | "UNKNOWN" | "LIMIT_REACHED"
  product?: string
  category?: string
  opportunity_score?: number
  sell_through_rate?: string
  momentum?: string
  buy_below?: number
  sell_avg?: number
  top_sizes?: string[]
  size_velocity?: SizeVelocity[]
  reasons?: string[]
  data_quality?: number
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
