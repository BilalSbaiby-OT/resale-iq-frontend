import { getAttribution } from "@/lib/analytics"
import type {
  User, ModelSignal, Deal, KPIs, BrandRanking, TrendsSummary, BrandDetail,
  WatchlistItem, PortfolioItem, PortfolioStats, AuthenticityResult,
  RecentSold, VerdictResult, CalcResult, PlansResponse, LiveDealsResult,
  SearchResult, PriceCompareResult,
} from "@/types"
import { getToken, clearToken } from "./utils"

/**
 * Thrown on HTTP 402 — the caller is authenticated but not entitled.
 * Distinguishable with `isPaymentRequired(err)` so a page can render an
 * upgrade prompt instead of an empty state or a generic error.
 */
export class PaymentRequiredError extends Error {
  readonly status = 402
  constructor(message = "A paid plan is required for this data.") {
    super(message)
    this.name = "PaymentRequiredError"
  }
}

export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "HttpError"
    this.status = status
  }
}

export const isPaymentRequired = (e: unknown): boolean =>
  e instanceof PaymentRequiredError

export const isUnauthorized = (e: unknown): boolean =>
  e instanceof HttpError && e.status === 401

export const isConflict = (e: unknown): boolean =>
  e instanceof HttpError && e.status === 409

/** Credential endpoints. A leftover JWT must not ride along, and a 401 here
 *  is a bad password / duplicate email — never a reason to wipe a new session. */
const PUBLIC_AUTH = new Set([
  "/auth/register",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
])

function pathOnly(path: string): string {
  return path.split("?")[0]
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Only runs client-side — SSR will never reach real API calls
  if (typeof window === "undefined") throw new Error("SSR: API not available")

  const publicAuth = PUBLIC_AUTH.has(pathOnly(path))
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (!headers.Authorization && !publicAuth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(path, { ...options, headers, cache: "no-store" })
  } catch (networkErr) {
    throw new Error("Network error — is the backend running?")
  }

  if (!res.ok) {
    let detail = `Error ${res.status}`
    try {
      const body = await res.json()
      const d = body.detail || body.message
      detail = typeof d === "string" ? d : detail
    } catch { /* ignore JSON parse errors */ }
    if (res.status === 401) {
      // Login/register 401 is "wrong password" / similar — keep any new JWT.
      if (!publicAuth) clearToken()
      throw new HttpError(401, detail)
    }
    if (res.status === 402) throw new PaymentRequiredError(detail)
    if (res.status === 403) {
      const verifyUrl = res.headers.get("X-Verify-Url")
      if (verifyUrl && typeof window !== "undefined" && !window.location.pathname.startsWith("/check-email")) {
        window.location.href = verifyUrl
      }
    }
    throw new HttpError(res.status, detail)
  }

  return res.json() as Promise<T>
}

// Auth
export const getMe = (accessToken?: string) =>
  request<User>("/auth/me", accessToken
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : {})
export const login = (email: string, password: string) =>
  request<{ access_token: string; plan: string }>("/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  })
export const register = (email: string, password: string) => {
  // Carry the first-touch campaign through to the signup, so we can answer
  // "which post produced this user?". Attribution must never be able to break
  // a registration, hence the guard and the optional fields on the server.
  let attribution: Record<string, string> = {}
  try {
    attribution = getAttribution() as Record<string, string>
  } catch {
    attribution = {}
  }
  const landing_path =
    typeof window !== "undefined" ? window.location.pathname.slice(0, 300) : undefined

  return request<{ access_token: string; plan: string; email_sent?: boolean }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, plan: "free", landing_path, ...attribution }),
  })
}
export const forgotPassword = (email: string) =>
  request<{ ok: boolean }>("/auth/forgot-password", {
    method: "POST", body: JSON.stringify({ email }),
  })
export const resetPassword = (token: string, new_password: string) =>
  request<{ ok: boolean; access_token?: string; plan?: string }>("/auth/reset-password", {
    method: "POST", body: JSON.stringify({ token, new_password }),
  })
export const resendVerification = () =>
  request<{ ok: boolean; already_verified: boolean; message: string }>(
    "/auth/resend-verification", { method: "POST" })
export const issueApiKey = () =>
  request<{ api_key: string; note?: string }>("/auth/api-key", { method: "POST" })
export const verifyEmail = (token: string) =>
  request<{ ok: boolean; message?: string; access_token?: string; plan?: string; already_verified?: boolean }>("/auth/verify-email", {
    method: "POST", body: JSON.stringify({ token }),
  })
export const changePassword = (new_password: string) =>
  request<{ ok: boolean }>("/auth/change-password", {
    method: "POST", body: JSON.stringify({ new_password }),
  })
export const deleteAccount = () =>
  request<{ ok: boolean }>("/auth/delete-account", { method: "DELETE" })
export const getActivity = () =>
  request<{ logs: Array<{ action: string; details: string; created_at: string }> }>("/auth/activity")
export const exportData = () => request<unknown>("/auth/export-data")

// Market data
export const getKPIs = () => request<KPIs>("/api/kpis")
export const getModelSignals = (limit = 100, brand?: string) =>
  request<{ data: ModelSignal[]; count: number; gated: boolean; plan: string; message?: string }>(
    `/api/model-signals?limit=${limit}${brand ? `&brand=${encodeURIComponent(brand)}` : ""}`
  )
export const getDeals = (params?: { category?: string; brand?: string; momentum?: string; min_str?: number; limit?: number }) => {
  const q = new URLSearchParams()
  if (params?.category) q.set("category", params.category)
  if (params?.brand) q.set("brand", params.brand)
  if (params?.momentum) q.set("momentum", params.momentum)
  if (params?.min_str) q.set("min_str", String(params.min_str))
  q.set("limit", String(params?.limit ?? 100))
  // locked:true means max_buy_price/est_profit_eur/profit_margin_pct/str_pct/
  // top_sizes/opportunity_score are redacted server-side on every deal — free
  // or expired-trial account. Never trust the frontend to hide these instead.
  return request<{ deals: Deal[]; count: number; momentum_warming_up?: boolean; locked: boolean; locked_fields: string[] }>(`/api/deals?${q}`)
}
export const getVerdict = (q: string, unlock = false) =>
  request<VerdictResult>(`/api/verdict?q=${encodeURIComponent(q)}${unlock ? "&unlock=true" : ""}`)
export const getCalc = (brand: string, model: string, buy_price: number) =>
  request<CalcResult>(`/api/calc?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&buy_price=${buy_price}`)
export const getBrandRankings = (limit = 20) => request<{ brands: BrandRanking[] }>(`/api/brands/rankings?limit=${limit}`)
export const getBrandDetail = (slug: string) => request<BrandDetail>(`/api/brands/${slug}`)
export const getTrendsSummary = () => request<TrendsSummary>("/api/trends/summary")
export const getRecentSold = (limit = 20) => request<{ data: RecentSold[] }>(`/api/recent-sold?limit=${limit}`)
export const getPlans = () => request<PlansResponse>("/stripe/plans")
export const createCheckout = (price_id: string) =>
  request<{ checkout_url: string }>("/stripe/checkout", {
    method: "POST",
    body: JSON.stringify({
      price_id,
      // Land on our success page, which verifies the session server-side and
      // applies the upgrade without depending on webhook delivery.
      success_url: `${window.location.origin}/billing/success?`,
      // Flag the abandoned-checkout return so /account can acknowledge it.
      // Bouncing the user back to a page that looks exactly as they left it
      // gives no signal whether the cancel registered or the payment silently
      // failed.
      cancel_url: `${window.location.origin}/account?checkout=cancelled`,
    }),
  })
export const verifyCheckoutSession = (sessionId: string) =>
  request<{ paid: boolean; plan: string; access_token?: string; plan_unchanged?: boolean }>(
    `/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
  )
export const getBillingPortal = () => request<{ portal_url: string }>("/stripe/portal")

// Watchlist
// locked:true means max_buy_price/avg_price_eur/str_pct/opportunity_score are
// redacted server-side on every item for a free or expired-trial account.
export const getWatchlist = () => request<{ items: WatchlistItem[]; momentum_warming_up?: boolean; locked: boolean; locked_fields: string[] }>("/api/watchlist")
export const addToWatchlist = (brand: string, model: string, category = "", notes = "") =>
  request<{ id: number; ok: boolean }>("/api/watchlist", {
    method: "POST", body: JSON.stringify({ brand, model, category, notes }),
  })
export const removeFromWatchlist = (id: number) =>
  request<{ ok: boolean }>(`/api/watchlist/${id}`, { method: "DELETE" })

// Portfolio
export const getPortfolio = (status?: string) =>
  request<{ items: PortfolioItem[] }>(`/api/portfolio${status ? `?status=${status}` : ""}`)
export const getPortfolioStats = () => request<PortfolioStats>("/api/portfolio/stats")
export const addPortfolioItem = (data: {
  brand: string; model: string; category: string; size: string; condition: string;
  cost_eur: number; platform: string; notes: string;
}) => request<{ id: number; ok: boolean }>("/api/portfolio", { method: "POST", body: JSON.stringify(data) })
export const updatePortfolioItem = (id: number, data: {
  status?: string; list_price_eur?: number; sold_price_eur?: number; notes?: string;
}) => request<{ ok: boolean }>(`/api/portfolio/${id}`, { method: "PUT", body: JSON.stringify(data) })
export const deletePortfolioItem = (id: number) =>
  request<{ ok: boolean }>(`/api/portfolio/${id}`, { method: "DELETE" })

// Authenticity
export const scoreAuthenticity = (data: {
  url?: string; listed_price?: number; brand?: string; model?: string; category?: string; title?: string;
  seller_days_on_platform?: number; seller_rating?: number; seller_total_sales?: number;
}) => request<AuthenticityResult>("/api/authenticity/score", { method: "POST", body: JSON.stringify(data) })

// Live deal finder — real-time Vinted listings you can buy right now
export const getLiveDeals = (params: {
  brand: string; model: string; max_price?: number | null; sizes?: string[]; markets?: string[];
  category?: string; limit?: number;
}) => {
  const q = new URLSearchParams()
  q.set("brand", params.brand)
  q.set("model", params.model)
  if (params.max_price) q.set("max_price", String(params.max_price))
  if (params.sizes?.length) q.set("sizes", params.sizes.join(","))
  if (params.markets?.length) q.set("markets", params.markets.join(","))
  if (params.category) q.set("category", params.category)
  q.set("limit", String(params.limit ?? 24))
  return request<LiveDealsResult>(`/api/live-deals?${q}`)
}

// Admin (power plan only)
export interface TrafficStats {
  days: number; views: number; visitors: number; bot_views: number
  top_pages: Array<{ path: string; views: number; visitors: number }>
  sources: Array<{ source: string; views: number }>
  daily: Array<{ day: string; views: number; visitors: number }>
}
export const getTraffic = (days = 30) => request<TrafficStats>(`/api/admin/traffic?days=${days}`)

/** Operations view: agent heartbeats, scraper freshness, health checks. */
export interface OpsStatus {
  agents: { agent: string; job: string | null; status: string; detail: string | null; reported_at: string }[]
  scrapers: { platform: string; run_at: string; items_new: number; errors: number; hours_ago: number }[]
  backup?: { hours_ago: number | null; file: string | null; stale: boolean }
  health: { overall: string; checks: { name: string; status: string; detail: string }[] }
}
export const getOps = () => request<OpsStatus>("/api/admin/ops")

export interface AdminUser {
  id: number; email: string; plan: string; is_active: boolean; created_at: string;
  stripe_customer_id: string | null; stripe_sub_id: string | null;
  verdict_count_today: number; verdict_date: string | null;
  email_verified?: boolean; is_owner?: boolean; protected?: boolean;
  billing?: "stripe" | "comped" | "none";
}
export const adminListUsers = () =>
  request<{
    users: AdminUser[]; total: number;
    metrics?: { paying_total: number; mrr_eur: number; verified_users: number; total_users: number };
  }>("/admin/users")
export const adminChangePlan = (userId: number, plan: string) =>
  request<{ ok: boolean; new_plan: string }>(`/admin/users/${userId}/plan`, {
    method: "PUT", body: JSON.stringify({ plan }),
  })
export const adminToggleUser = (userId: number, isActive: boolean) =>
  request<{ ok: boolean; is_active: boolean }>(`/admin/users/${userId}/toggle`, {
    method: "PUT", body: JSON.stringify({ is_active: isActive }),
  })
export const adminDeleteUser = (userId: number) =>
  request<{ ok: boolean; email: string }>(`/admin/users/${userId}`, { method: "DELETE" })
export const adminPurgeDisabledJunk = (confirm = false) =>
  request<{ dry_run: boolean; would_delete?: number; deleted?: number; emails: string[] }>(
    `/admin/users/disabled-junk?confirm=${confirm ? "true" : "false"}`,
    { method: "DELETE" },
  )

// Telegram alerts
export const connectTelegram = (chat_id: string) =>
  request<{ ok: boolean }>("/api/alerts/telegram/connect", {
    method: "POST", body: JSON.stringify({ chat_id }),
  })
export const disconnectTelegram = () =>
  request<{ ok: boolean }>("/api/alerts/telegram/disconnect", { method: "DELETE" })
export const testTelegramAlert = () =>
  request<{ ok: boolean }>("/api/alerts/telegram/test", { method: "POST" })

// On-demand Vinted search (26 markets)
export const searchVinted = (params: {
  q: string; market?: string; limit?: number; sort?: string;
}) => {
  const qs = new URLSearchParams()
  qs.set("q", params.q)
  if (params.market) qs.set("market", params.market)
  if (params.limit) qs.set("limit", String(params.limit))
  if (params.sort) qs.set("sort", params.sort)
  return request<SearchResult>(`/api/search/vinted?${qs}`)
}

// Cross-country price comparison
export const comparePrices = (params: {
  q: string; markets?: string[]; limit?: number;
}) => {
  const qs = new URLSearchParams()
  qs.set("q", params.q)
  if (params.markets?.length) qs.set("markets", params.markets.join(","))
  if (params.limit) qs.set("limit", String(params.limit))
  return request<PriceCompareResult>(`/api/compare/prices?${qs}`)
}

// Price history sparklines
export interface PricePoint { day: string; avg_price: number; sold_count?: number }
export const getModelPriceHistory = (brand: string, model: string, days = 30) =>
  request<{ data: PricePoint[] }>(`/api/price-history/model?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&days=${days}`)
export const getBatchPriceHistory = (pairs: string[], days = 30) =>
  request<{ data: Record<string, PricePoint[]> }>(`/api/price-history/batch?models=${pairs.map(encodeURIComponent).join(",")}&days=${days}`)

// Trial-expiry value recap — "in your trial we flagged N BUYs worth ~€X"
export interface TrialRecap {
  days: number
  verdicts: number
  buys: number
  watches: number
  est_margin_eur: number
  headline: string
}
export const getTrialRecap = () => request<TrialRecap>("/api/account/trial-recap")

// Market Signals — brand×category demand board (demand_index). Paid feature.
export interface MarketSignal {
  brand: string
  category: string
  signal: string
  investment_score: number
  confidence: number
  units_sold_all_7d: number
  overall_demand_score: number
  overall_speed_score: number
  recommended_list_price: number | null
  avg_days_to_sell_overall: number | null
  trend_direction: string | null
}
export interface MarketSignalsResponse {
  strong_buy: MarketSignal[]
  buy: MarketSignal[]
  total_strong_buy: number
  total_buy: number
}
export const getMarketSignals = () => request<MarketSignalsResponse>("/api/signals")
