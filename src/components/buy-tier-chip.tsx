import { buyTierColors, buyTierLabel, type BuyTier } from "@/lib/buy-tiers"

/** Pace tier chip for /buy rows and cards: "Moving fast" / "Steady" / "Slow". Never a number. */
export function BuyTierChip({ tier }: { tier: BuyTier | null | undefined }) {
  if (!tier) return null
  const c = buyTierColors(tier)
  return (
    <div
      data-buy-tier={tier}
      style={{
        fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6,
        background: c.bgColor, color: c.color, whiteSpace: "nowrap",
      }}
    >
      {buyTierLabel(tier)}
    </div>
  )
}
