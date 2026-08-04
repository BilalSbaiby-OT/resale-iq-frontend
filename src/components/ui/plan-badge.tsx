"use client"
import { cn } from "@/lib/utils"
import type { Plan } from "@/types"

const styles: Record<Plan, string> = {
  free: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  operator: "bg-emerald-500/12 border-emerald-500/30 text-emerald-400",
  power: "bg-amber-500/12 border-amber-500/30 text-amber-400",
}

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border", styles[plan])}>
      {plan.toUpperCase()}
    </span>
  )
}
