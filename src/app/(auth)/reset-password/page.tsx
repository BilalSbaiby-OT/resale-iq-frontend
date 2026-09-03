"use client"
import { useState, useEffect } from "react"
import { resetPassword, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { copy } from "@/lib/i18n"
import { useLocale } from "@/components/i18n/locale-provider"

export default function ResetPasswordPage() {
  // Read the token from the URL on the client rather than via useSearchParams:
  // this route is prerendered, and useSearchParams would require a Suspense
  // boundary to avoid a build-time bailout. The token is only ever needed
  // client-side, so window.location is both simpler and safe here.
  // undefined = haven't looked yet, null = looked and it's missing. Without the
  // third state every visitor sees a flash of "invalid link" before the effect runs.
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const tr = copy[useLocale()].auth.resetPassword

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError(tr.errorMismatch); return }
    if (password.length < 8) { setError(tr.errorLength); return }
    if (!token) { setError(tr.errorNoToken); return }
    setLoading(true)
    try {
      const res = await resetPassword(token, password)
      if (res.access_token) {
        setToken(res.access_token)
        try {
          const user = await getMe(res.access_token)
          useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
        } catch {
          useAuthStore.setState({ isAuthenticated: true, isLoading: false })
        }
        router.replace("/dashboard")
        return
      }
      setDone(true)
    } catch (err) {
      // Surface the backend's own message (expired / already used / too common).
      setError(err instanceof Error ? err.message : tr.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        {done ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">{tr.doneHeading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{tr.doneBody}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              {tr.signIn}
            </Link>
          </div>
        ) : token === undefined ? (
          <div className="text-center py-6">
            <p className="text-[#8b99b8] text-[13px]">{tr.checking}</p>
          </div>
        ) : token === null ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-amber-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">{tr.invalidHeading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">
              {tr.invalidBody}
            </p>
            <Link href="/forgot-password" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              {tr.requestNew}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[21px] font-bold mb-1">{tr.heading}</h1>
            <p className="text-[#8b99b8] text-[13px] mb-5">{tr.subheading}</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{tr.newLabel}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]"
                  placeholder={tr.newPlaceholder} />
              </div>
              <div>
                <label className="text-[11px] text-[#5b6b8c] block mb-1.5">{tr.confirmLabel}</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8}
                  className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]"
                  placeholder={tr.confirmPlaceholder} />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-[12.5px] text-red-300">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1">
                {loading ? tr.submitting : tr.submit}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link href="/login" className="text-[12px] text-[#5b6b8c] hover:text-[#eef1f7]">{tr.backToSignIn}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
