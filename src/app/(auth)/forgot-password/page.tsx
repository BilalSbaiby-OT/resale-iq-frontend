"use client"
import { useState } from "react"
import { forgotPassword } from "@/lib/api"
import Link from "next/link"
import { Mail } from "lucide-react"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"
import { AuthHeading, AuthField, AuthSubmit } from "@/components/auth/auth-form-parts"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = copy[useLocale()].auth.forgotPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await forgotPassword(email); setSent(true) } catch { setSent(true) }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        {sent ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><Mail size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">{t.sentHeading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-3">{t.sentBody}</p>
            <p className="text-[#8b99b8] text-[13px] mb-6">
              <b className="text-[#eef1f7]">{t.spamBold}</b>{t.spamRest}
              <b className="text-[#eef1f7]">noreply@resaleiq.dev</b>.
            </p>
            <Link href="/login" className="text-emerald-400 hover:underline text-[13px]">{t.backToSignIn}</Link>
          </div>
        ) : (
          <>
            <AuthHeading heading={t.heading} subheading={t.subheading} />
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AuthField label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
              <AuthSubmit loading={loading} submitting={t.submitting} submit={t.submit} />
            </form>
            <div className="text-center mt-5"><Link href="/login" className="text-[12px] text-[#5b6b8c] hover:text-[#eef1f7]">{t.backToSignIn}</Link></div>
          </>
        )}
      </div>
    </div>
  )
}
