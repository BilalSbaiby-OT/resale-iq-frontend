"use client"
import { useState, useEffect } from "react"
import { verifyEmail } from "@/lib/api"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"

type State = "checking" | "ok" | "bad"

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      setState("bad")
      setMessage("This link is missing its token.")
      return
    }
    // Verification is a one-shot action, so run it on mount rather than making
    // the user click a second button after already clicking the email link.
    verifyEmail(token)
      .then(res => {
        setState("ok")
        setMessage(res?.message || "Your email is verified.")
      })
      .catch(err => {
        setState("bad")
        setMessage(err instanceof Error ? err.message : "Could not verify this link.")
      })
  }, [])

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>

      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8 text-center">
        {state === "checking" && (
          <p className="text-[#8b99b8] text-[13px] py-6">Verifying your email…</p>
        )}

        {state === "ok" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">Email verified</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/dashboard" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Go to dashboard →
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-amber-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">Verification failed</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Back to sign in →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
