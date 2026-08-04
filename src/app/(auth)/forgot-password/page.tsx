"use client"
import { useState } from "react"
import { forgotPassword } from "@/lib/api"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try { await forgotPassword(email); setSent(true) } catch { setSent(true) }
    finally { setLoading(false) }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>
      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8">
        {sent ? (
          <div className="text-center">
            <div className="flex justify-center mb-4"><Mail size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">Check your inbox</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">If that email exists, a reset link has been sent.</p>
            <Link href="/login" className="text-emerald-400 hover:underline text-[13px]">← Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-[21px] font-bold mb-1">Forgot password</h1>
            <p className="text-[#8b99b8] text-[13px] mb-5">Enter your email and we&apos;ll send a reset link.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] text-[#5b6b8c] block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full bg-[#1a2030] border border-[#232c42] rounded-lg px-3 py-2.5 text-[13.5px] text-[#eef1f7] outline-none focus:border-emerald-500/60 placeholder:text-[#4d5a75]" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors disabled:opacity-50 mt-1">
                {loading ? "Sending…" : "Send reset link →"}
              </button>
            </form>
            <div className="text-center mt-5"><Link href="/login" className="text-[12px] text-[#5b6b8c] hover:text-[#eef1f7]">← Back to sign in</Link></div>
          </>
        )}
      </div>
    </div>
  )
}
