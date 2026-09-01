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
 *    quiet unlock button; someone who has spent the whole budget has actually
 *    felt the ceiling, and only then do we make the case for paying.
 *  - The budget is 10 full checks per calendar month after the 7-day trial.
 *    Copy must not imply a lifetime cap.
 */
export function UnlockPanel({
  result, onUnlock, unlocking,
}: {
  result: VerdictResult
  onUnlock: () => void
  unlocking: boolean
}) {
  // GATE ON THE DATA, NOT ON THE FLAG.
  //
  // This used to read `if (!result.locked) return null`. W1's fix (2026-09-01,
  // demand-intel 5019fa0) stopped the backend redacting fields from free
  // logged-in accounts — and to do that it made `_gate()` return
  // `"locked": False` on EVERY branch. It never returns True any more.
  //
  // So this panel returned null every single time, and the 10 monthly unlocks
  // had no entry point on the authenticated /verdict page at all. An
  // entitlement customers are told they have, unreachable, with no error and
  // nothing in any log.
  //
  // Nobody broke it on purpose: one fix made a flag constant, and a second
  // component still depended on that flag varying. That is the shape the
  // 2026-09-01 post-mortem named as our most expensive habit, and it happened
  // WHILE we were writing the post-mortem.
  //
  // `free-checker.tsx` already had it right — it asks whether the deep field is
  // actually there (`res.sell_through_rate == null`). Same question here.
  const deepFieldsMissing = result.sell_through_rate == null
  if (!deepFieldsMissing) return null

  const limit = result.unlocks_limit
  const remaining = result.unlocks_remaining
  const isAnonymous = remaining === undefined
  const exhausted = remaining === 0
  const needsVerification = result.verification_required === true

  // Anonymous: the job is to get an account, not to sell a plan.
  if (isAnonymous) {
    return (
      <Shell tone="neutral">
        <Title icon={<Lock size={15} className="text-amber-400" />}>
          The call is free. The numbers need an account.
        </Title>
        <Body>
          You just saw the verdict on a real item, computed from watched departures.
          A free account unlocks the buy-below price, typical exit price, sell-through
          and best sizes on {limit ?? 10} items a month after a 7-day trial — no card.
        </Body>
        <Row>
          <Primary href="/register?plan=free">Create a free account</Primary>
          <Secondary href="/login">Sign in</Secondary>
        </Row>
      </Shell>
    )
  }

  // Email not verified yet. Not a paywall — a one-click step they already have
  // in their inbox — so it must not read like one.
  if (needsVerification) {
    return (
      <Shell tone="neutral">
        <Title icon={<Unlock size={15} className="text-emerald-400" />}>
          Confirm your email to use your {limit} free unlocks
        </Title>
        <Body>
          We sent a confirmation link when you signed up. One click and your{" "}
          {limit} unlocks are live — buy-below price, sell price, sell-through and
          best sizes on any {limit} items you choose.
        </Body>
        <Row>
          <Secondary href="/account">Resend the link</Secondary>
        </Row>
      </Shell>
    )
  }

  // Budget left: keep it quiet and let the product do the talking.
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
            {remaining} of {limit} free checks left this month
          </span>
        </div>
      </Shell>
    )
  }

  // Exhausted: the budget is gone for good and they have felt it.
  // This is the honest moment to make the case, with their own usage as the
  // argument rather than a manufactured one.
  return (
    <Shell tone="warm">
      <Title icon={<Lock size={15} className="text-amber-400" />}>
        You&apos;ve used all {limit} free checks this month
      </Title>
      <Body>
        That is this month&apos;s free allowance — it refills next calendar month.
        You have now seen the real numbers on {limit} items. If they held up,
        unlimited access is usually cheaper than one item bought wrong.
      </Body>
      <div className="mb-4 rounded-lg border border-[#1c2333] bg-[#12151d] px-4 py-3">
        <div className="text-[12.5px] leading-5 text-[#a9b6d0]">
          <span className="font-semibold text-[#eef1f7]">Starter is €19/month.</span>{" "}
          Unlimited verdicts, every product signal unblurred, brand
          rankings, watchlist and portfolio P&amp;L. One item you correctly skip usually
          covers it.
        </div>
      </div>
      <Row>
        <Primary href="/account">See Starter — €19/mo</Primary>
        <Secondary href="/#pricing">Compare plans</Secondary>
      </Row>
      <p className="mt-3 text-[11.5px] text-[#5b6b8c]">
        Cancel anytime. Your account and the free BUY / WATCH / SKIP verdicts stay either way.
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
