"use client"

/**
 * The three shapes every (auth) form is built from: a heading pair, a labelled
 * text input, and a submit button that swaps its label while in flight.
 *
 * Extracted when `npm run check:dupes` flagged an 8-line identical block
 * between login/page.tsx and forgot-password/page.tsx. The duplication was
 * always there — translating both forms simply made it textually identical and
 * therefore detectable. Two copies of a rule means two places to be wrong, and
 * the class strings here (focus ring, placeholder colour, disabled opacity)
 * are exactly the kind that drift silently between pages until one form looks
 * a generation older than the others.
 *
 * Presentation only, on purpose: no locale lookup and no form state. Each page
 * still owns its own copy object and its own submit handler, so this cannot
 * become the place where an unrelated auth behaviour quietly diverges.
 */

const FIELD_CLASS =
  "w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] " +
  "text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]"

export function AuthHeading({ heading, subheading }: { heading: string; subheading: string }) {
  return (
    <>
      <h1 className="text-[21px] font-bold mb-1">{heading}</h1>
      <p className="text-[#8b99b8] text-[13px] mb-5">{subheading}</p>
    </>
  )
}

export function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  minLength,
}: {
  label: string
  type: "email" | "password"
  value: string
  onChange: (v: string) => void
  placeholder: string
  minLength?: number
}) {
  return (
    <div>
      <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className={FIELD_CLASS}
        placeholder={placeholder}
      />
    </div>
  )
}

export function AuthSubmit({
  loading,
  submitting,
  submit,
}: {
  loading: boolean
  submitting: string
  submit: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1"
    >
      {loading ? submitting : submit}
    </button>
  )
}
