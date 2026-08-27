"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const router = useRouter()

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
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Invalid email or password") }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        <h1 className="text-[21px] font-bold mb-1">Welcome back</h1>
        <p className="text-[#8b99b8] text-[13px] mb-5">Sign in to access your dashboard.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" placeholder="••••••••" />
          </div>
          {error && <div className="text-[12px] text-red-400 text-center">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1">
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <div className="text-center mt-5 text-[13px] text-[#8b99b8]">
          New here? <Link href="/register" className="text-emerald-400 hover:underline font-semibold">Get access →</Link>
        </div>
        <div className="text-center mt-2">
          <Link href="/forgot-password" className="text-[11px] text-[#5b6b8c] hover:text-[#eef1f7]">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}
