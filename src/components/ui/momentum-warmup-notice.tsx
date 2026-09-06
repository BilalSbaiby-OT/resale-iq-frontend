/**
 * Tells a paying customer when the momentum signal cannot yet rank models.
 *
 * The backend's data-quality guardian has always been able to detect this — a
 * board collapsed onto STABLE means there is not enough history to rank models
 * against each other — but that finding only ever reached the OWNER's health
 * check. Customers saw confident-looking labels the system privately knew were
 * unrankable. This is the customer-facing half.
 *
 * Renders nothing when momentum is healthy, so it can be dropped into any page
 * that shows momentum without a conditional at the call site.
 */
export function MomentumWarmupNotice({ warmingUp }: { warmingUp?: boolean }) {
  if (!warmingUp) return null

  return (
    <div
      role="status"
      className="mb-4 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3"
    >
      <span aria-hidden className="text-[13px] leading-5 text-amber-400">◔</span>
      <div className="text-[12.5px] leading-5 text-[#c3cde0]">
        <span className="font-semibold text-amber-400">Momentum is still warming up.</span>{" "}
        There isn&apos;t enough history yet to rank models against each other, so most are
        showing <span className="font-mono">Mid 40%</span>. Judge these on sell-through and
        volume until roughly 30 days of history has built up.
      </div>
    </div>
  )
}
