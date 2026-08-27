"use client"
import { useState, useEffect } from "react"
import { resetPassword, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"

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

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")
    setToken(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (!token) { setError("This link is missing its token. Request a new one."); return }
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
      setError(err instanceof Error ? err.message : "Could not reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>

      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        {done ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">Password updated</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">You can now sign in with your new password.</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Sign in →
            </Link>
          </div>
        ) : token === undefined ? (
          <div className="text-center py-6">
            <p className="text-[#8b99b8] text-[13px]">Checking your link…</p>
          </div>
        ) : token === null ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-amber-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">Invalid reset link</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">
              This link is missing its token. Reset links expire after 1 hour and can only be used once.
            </p>
            <Link href="/forgot-password" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Request a new link →
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[21px] font-bold mb-1">Set a new password</h1>
            <p className="text-[#8b99b8] text-[13px] mb-5">Choose a password you haven&apos;t used before.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-[#5b6b8c] block mb-1.5">New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]"
                  placeholder="At least 8 characters" />
              </div>
              <div>
                <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Confirm new password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required minLength={8}
                  className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]"
                  placeholder="Repeat it" />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-[12.5px] text-red-300">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1">
                {loading ? "Updating…" : "Update password →"}
              </button>
            </form>

            <div className="text-center mt-5">
              <Link href="/login" className="text-[12px] text-[#5b6b8c] hover:text-[#eef1f7]">← Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
