"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import { AuthHeading, AuthField, AuthSubmit } from "@/components/auth/auth-form-parts"

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
        <AuthHeading heading={t.heading} subheading={t.subheading} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <AuthField label={t.passwordLabel} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <div className="text-[12px] text-red-400 text-center">{error}</div>}
          <AuthSubmit loading={loading} submitting={t.submitting} submit={t.submit} />
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
