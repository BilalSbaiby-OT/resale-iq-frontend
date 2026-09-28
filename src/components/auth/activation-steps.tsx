// C(tony)ActivationSteps: shared 3-step progress bar for the signup→verify→verdict
// funnel. Linear/Fathom research: showing users "step N of 3" reduces abandonment
// at every stage — they know they're not stuck, they're progressing toward a goal.
// Step labels are goal-framed, not admin-framed.
//
// Usage:
//   step=1 → on /register (active = "Create your account", third label names their intent)
//   step=2 → on /check-email (active = "Verify your email")
//   step=3 → on /verify-email (steps 1+2 done, third label active — "almost there")
//   intentQuery → personalises the third step label when a brand was typed.

import { CheckCircle2, Circle, ArrowRight } from "lucide-react"

const AUTH_TEXT = "text-[var(--color-text-primary)]"
const AUTH_TEXT_MUTED = "text-[var(--color-text-muted)]"

export function ActivationSteps({
  step,
  intentQuery = "",
}: {
  step: 1 | 2 | 3
  intentQuery?: string
}) {
  const thirdLabel = intentQuery
    ? `See your ${intentQuery} verdict`
    : "Get your first verdict"

  const steps = [
    {
      label: "Create account",
      done: step > 1,
      active: step === 1,
    },
    {
      label: "Verify email",
      done: step > 2,
      active: step === 2,
    },
    {
      label: thirdLabel,
      done: false,
      active: step === 3,
    },
  ]

  return (
    <div className="flex items-center gap-1 mb-5 w-full">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {s.done ? (
              <CheckCircle2 size={14} className="text-[var(--color-buy)] shrink-0" />
            ) : s.active ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-buy)] shrink-0" />
            ) : (
              <Circle size={14} className="text-[var(--color-border-ui)] shrink-0" />
            )}
            <span
              className={`text-[11px] truncate ${
                s.done
                  ? "text-[var(--color-buy)]"
                  : s.active
                    ? AUTH_TEXT
                    : AUTH_TEXT_MUTED
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight
              size={10}
              className="text-[var(--color-border-ui)] ml-1 shrink-0"
            />
          )}
        </div>
      ))}
    </div>
  )
}
