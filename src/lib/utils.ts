import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const eur = (v: number | null | undefined): string =>
  v != null ? `€${v.toFixed(0)}` : "—"

export const eurDecimal = (v: number | null | undefined): string =>
  v != null ? `€${v.toFixed(2)}` : "—"

export const pct = (v: number | null | undefined): string =>
  v != null ? `${v.toFixed(1)}%` : "—"

export const num = (v: number | null | undefined): string =>
  v != null ? v.toLocaleString() : "—"

export function ago(ts: string | null | undefined): string {
  if (!ts) return "—"
  const s = (Date.now() - new Date(ts.endsWith("Z") ? ts : ts + "Z").getTime()) / 1000
  if (s < 60) return `${Math.round(s)}s ago`
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("di_jwt")
}

export function setToken(token: string): void {
  localStorage.setItem("di_jwt", token)
}

export function clearToken(): void {
  localStorage.removeItem("di_jwt")
}

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function getPlanFromToken(): string {
  const token = getToken()
  if (!token) return "free"
  const payload = decodeToken(token)
  return (payload?.plan as string) || "free"
}

export function getEmailFromToken(): string {
  const token = getToken()
  if (!token) return ""
  const payload = decodeToken(token)
  return (payload?.email as string) || ""
}

export const MOMENTUM_ICONS: Record<string, string> = {
  HOT: "▲", RISING: "↑", STABLE: "→", FADING: "↓", DEAD: "×",
}

export const MOMENTUM_COLORS: Record<string, string> = {
  HOT: "text-red-400 bg-red-500/15 border-red-500/40",
  RISING: "text-amber-400 bg-amber-500/12 border-amber-500/40",
  STABLE: "text-blue-400 bg-blue-500/12 border-blue-500/35",
  FADING: "text-slate-400 bg-slate-500/12 border-slate-500/35",
  DEAD: "text-zinc-500 bg-zinc-800/20 border-zinc-700/40",
}

export function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400"
  if (score >= 50) return "text-cyan-400"
  if (score >= 30) return "text-amber-400"
  return "text-red-400"
}

export function scoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-400"
  if (score >= 50) return "bg-cyan-400"
  if (score >= 30) return "bg-amber-400"
  return "bg-red-400"
}
