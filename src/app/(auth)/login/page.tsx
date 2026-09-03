"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()
  const t = copy[useLocale()].auth.login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      await login(email, password)
      const u = useAuthStore.getState().user
      if (u && u.email_verified === false) {
        router.push("/check-email")
        return
      }
      router.push("/dashboard")
    }
    catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorInvalid) }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        <h1 className="text-[21px] font-bold mb-1">{t.heading}</h1>
        <p className="text-[#8b99b8] text-[13px] mb-5">{t.subheading}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{t.emailLabel}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{t.passwordLabel}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" placeholder="••••••••" />
          </div>
          {error && <div className="text-[12px] text-red-400 text-center">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1">
            {loading ? t.submitting : t.submit}
          </button>
        </form>
        <div className="text-center mt-5 text-[13px] text-[#8b99b8]">
          {t.newHere} <Link href="/register" className="text-emerald-400 hover:underline font-semibold">{t.getAccess}</Link>
        </div>
        <div className="text-center mt-2">
          <Link href="/forgot-password" className="text-[11px] text-[#5b6b8c] hover:text-[#eef1f7]">{t.forgotLink}</Link>
        </div>
      </div>
    </div>
  )
}
