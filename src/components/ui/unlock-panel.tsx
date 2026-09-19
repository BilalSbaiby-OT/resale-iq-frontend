"use client"
import Link from "next/link"
import { Lock, Unlock } from "lucide-react"
import type { VerdictResult } from "@/types"
import { unlockPanelBranch } from "@/lib/unlock-panel-state"

/**
 * The post-verdict upgrade moment.
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
 *  - HARD_PAYWALL=1: there is no free item-check path and no 7-day trial on
 *    the anonymous register branch. Logged-out copy sells Starter (€19).
 */
export function UnlockPanel({
  result, onUnlock, unlocking, isAuthenticated,
}: {
  result: VerdictResult
  onUnlock: () => void
  unlocking: boolean
  isAuthenticated: boolean
}) {
  // WHICH BRANCH — decided in one pure, unit-tested place (unlock-panel-state.ts).
  //
  // History: this used to key "anonymous" off `unlocks_remaining === undefined`.
  // But that field is absent for anonymous callers AND for paid plans, so every
  // PAYING customer looked anonymous and was shown "create a free account" on a
  // provisional verdict (founder-reported 2026-09-11). Anonymity is an AUTH fact,
  // not a data fact — so the branch now takes `isAuthenticated` (a real session
  // token), and a logged-in account with no free-unlock quota is treated as
  // entitled (data maturing), never walled.
  const branch = unlockPanelBranch(result, isAuthenticated)
  if (branch === "hidden") return null

  const limit = result.unlocks_limit
  const remaining = result.unlocks_remaining

  // Anonymous: HARD_PAYWALL — sell Starter, never a free trial that does not exist.
  // H60 CRO: this branch used to promise "a 7-day trial with full access — no card"
  // and route ?plan=free. Live /verdict is public (200) and seeds a locked SKIP, so
  // every logged-out visitor who landed here was told a €0 path exists. CRO #4/#10.
  if (branch === "register") {
    return (
      <Shell tone="neutral" testId="riq-unlock-register">
        <Title icon={<Lock size={15} className="text-amber-400" />}>
          Full numbers need Starter.
        </Title>
        <Body>
          You just saw the verdict on a real item, computed from watched departures.
          Starter (€19/mo) unlocks sell-through, best sizes and the reasons why — cancel anytime.
        </Body>
        <Row>
          <Primary href="/register?plan=operator&src=verdict">Start for €19</Primary>
          <Secondary href="/login">Sign in</Secondary>
        </Row>
      </Shell>
    )
  }

  // Logged in, paid/entitled — the deep numbers are simply still maturing for
  // this exact item. NEVER a wall: the account already has access.
  if (branch === "entitled") {
    return (
      <Shell tone="neutral">
        <Title icon={<Unlock size={15} className="text-emerald-400" />}>
          Full numbers for this item are still maturing
        </Title>
        <Body>
          The call above is live. Sell-through, best sizes and the reasons why
          land as soon as we&apos;ve watched enough departures for this exact
          model — your plan already includes them, nothing to unlock.
        </Body>
      </Shell>
    )
  }

  // Email not verified yet. Not a paywall — a one-click step they already have
  // in their inbox — so it must not read like one.
  if (branch === "verify") {
    return (
      <Shell tone="neutral">
        <Title icon={<Unlock size={15} className="text-emerald-400" />}>
          Confirm your email to use your {limit} free unlocks
        </Title>
        <Body>
          We sent a confirmation link when you signed up. One click and your{" "}
          {limit} unlocks are live — sell-through, best sizes and the reasons why
          on any {limit} items you choose.
        </Body>
        <Row>
          <Secondary href="/account">Resend the link</Secondary>
        </Row>
      </Shell>
    )
  }

  // Budget left: keep it quiet and let the product do the talking.
  if (branch === "unlock") {
    return (
      <Shell tone="neutral">
        <Title icon={<Unlock size={15} className="text-emerald-400" />}>
          Unlock the full numbers
        </Title>
        <Body>
          Sell-through rate, the sizes that move fastest and the reasons behind this
          call, for this exact model.
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
            {remaining} of {limit} unlocks left this month
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
        You&apos;ve used all {limit} unlocks this month
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

function Shell({ tone, children, testId }: { tone: "neutral" | "warm"; children: React.ReactNode; testId?: string }) {
  const border = tone === "warm" ? "border-amber-500/30" : "border-[#1c3327]"
  const bg = tone === "warm" ? "bg-amber-500/[0.06]" : "bg-[#0f1720]"
  return <div data-testid={testId} className={`mt-5 rounded-xl border ${border} ${bg} p-5`}>{children}</div>
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
