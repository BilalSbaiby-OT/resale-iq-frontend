"use client"
import Link from "next/link"
import { Lock, Unlock } from "lucide-react"
import type { VerdictResult } from "@/types"

/**
 * The free tier's upgrade moment.
 *
 * Design rules this deliberately follows:
 *  - The numbers are NOT here to be revealed by CSS. The server omits them
 *    entirely until an unlock is claimed, so there is nothing in the DOM to
 *    un-blur. Never "fix" this by rendering real values behind a filter.
 *  - No fake urgency. No countdowns, no "3 people are viewing", no invented
 *    scarcity. The only pressure is the real quota, stated plainly.
 *  - The ask escalates with evidence. Someone who has spent nothing sees a
 *    quiet unlock button; someone who has used all three today has actually
 *    felt the ceiling, and only then do we make the case for paying.
 */
export function UnlockPanel({
  result, onUnlock, unlocking,
}: {
  result: VerdictResult
  onUnlock: () => void
  unlocking: boolean
}) {
  if (!result.locked) return null

  const limit = result.unlocks_limit
  const remaining = result.unlocks_remaining
  const isAnonymous = remaining === undefined
  const exhausted = remaining === 0

  // Anonymous: the job is to get an account, not to sell a plan.
  if (isAnonymous) {
    return (
      <Shell tone="neutral">
        <Title icon={<Lock size={15} className="text-amber-400" />}>
          The call is free. The numbers need an account.
        </Title>
        <Body>
          You just saw the verdict on a real item, computed from live sold listings.
          A free account unlocks the buy-below price, typical sale price, sell-through
          and best sizes on {limit ?? 3} items a day — no card.
        </Body>
        <Row>
          <Primary href="/register">Create a free account</Primary>
          <Secondary href="/login">Sign in</Secondary>
        </Row>
      </Shell>
    )
  }

  // Quota left: keep it quiet and let the product do the talking.
  if (!exhausted) {
    return (
      <Shell tone="neutral">
        <Title icon={<Unlock size={15} className="text-emerald-400" />}>
          Unlock the full numbers
        </Title>
        <Body>
          Buy-below price, typical sale price, sell-through rate and the sizes that move
          fastest for this exact model.
        </Body>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onUnlock}
            disabled={unlocking}
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-[#06090c] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {unlocking ? "Unlocking…" : "Unlock this item"}
          </button>
          <span className="text-[12.5px] text-[#8b99b8]">
            {remaining} of {limit} free unlocks left today
          </span>
        </div>
      </Shell>
    )
  }

  // Exhausted: they have now used the product three times and hit a real wall.
  // This is the honest moment to make the case, with their own usage as the
  // argument rather than a manufactured one.
  return (
    <Shell tone="warm">
      <Title icon={<Lock size={15} className="text-amber-400" />}>
        You&apos;ve used all {limit} free unlocks today
      </Title>
      <Body>
        They reset tomorrow. If you&apos;re checking more than {limit} items a day you&apos;re
        sourcing seriously, and the daily cap is going to keep costing you time on exactly
        the finds worth acting on quickly.
      </Body>
      <div className="mb-4 rounded-lg border border-[#1c2333] bg-[#12151d] px-4 py-3">
        <div className="text-[12.5px] leading-5 text-[#a9b6d0]">
          <span className="font-semibold text-[#eef1f7]">Starter is €19/month.</span>{" "}
          Unlimited verdicts, every one of the 100 product signals unblurred, brand
          rankings, watchlist and portfolio P&amp;L. One item you correctly skip usually
          covers it.
        </div>
      </div>
      <Row>
        <Primary href="/register?plan=operator">See Starter — €19/mo</Primary>
        <Secondary href="/#pricing">Compare plans</Secondary>
      </Row>
      <p className="mt-3 text-[11.5px] text-[#5b6b8c]">
        Cancel anytime. Your free unlocks come back tomorrow either way.
      </p>
    </Shell>
  )
}

/* ── presentational bits ─────────────────────────────────────────────────── */

function Shell({ tone, children }: { tone: "neutral" | "warm"; children: React.ReactNode }) {
  const border = tone === "warm" ? "border-amber-500/30" : "border-[#1c3327]"
  const bg = tone === "warm" ? "bg-amber-500/[0.06]" : "bg-[#0f1720]"
  return <div className={`mt-5 rounded-xl border ${border} ${bg} p-5`}>{children}</div>
}

function Title({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      {icon}
      <span className="text-[15px] font-bold text-[#eef1f7]">{children}</span>
    </div>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[13.5px] leading-6 text-[#8b99b8]">{children}</p>
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3">{children}</div>
}

function Primary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="rounded-lg bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-[#06090c] no-underline transition-opacity hover:opacity-90">
      {children}
    </Link>
  )
}

function Secondary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="rounded-lg border border-[#263147] px-5 py-2.5 text-[13px] font-semibold text-[#c3cde0] no-underline hover:bg-[#161b26]">
      {children}
    </Link>
  )
}
