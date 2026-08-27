"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { verifyEmail, getMe } from "@/lib/api"
import { setToken } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"
import { CheckCircle2, AlertCircle } from "lucide-react"

type State = "checking" | "signed-in" | "already" | "bad"

export default function VerifyEmailPage() {
  const [state, setState] = useState<State>("checking")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) {
      setState("bad")
      setMessage("This link is missing its token.")
      return
    }
    // POST on load (not GET) so mail scanners that prefetch do not burn the token.
    verifyEmail(token)
      .then(async res => {
        if (res.access_token) {
          setToken(res.access_token)
          try {
            const user = await getMe(res.access_token)
            useAuthStore.setState({ user, isAuthenticated: true, isLoading: false })
          } catch {
            useAuthStore.setState({ isAuthenticated: true, isLoading: false })
          }
          setState("signed-in")
          router.replace("/dashboard")
          return
        }
        setState("already")
        setMessage(res.message || "This email is already confirmed.")
      })
      .catch(err => {
        setState("bad")
        setMessage(err instanceof Error ? err.message : "This link is invalid or has expired.")
      })
  }, [router])

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[#0B0D10] font-bold text-[14px]">R</div>
        <span className="text-[15px] font-bold text-[#eef1f7]">Resale IQ</span>
      </div>

      <div className="bg-[#12151d] border border-[#1c2333] rounded-2xl p-8 text-center">
        {state === "checking" && (
          <p className="text-[#8b99b8] text-[13px] py-6">Confirming your email…</p>
        )}

        {state === "signed-in" && (
          <p className="text-[#8b99b8] text-[13px] py-6">You’re in — opening your dashboard…</p>
        )}

        {state === "already" && (
          <>
            <div className="flex justify-center mb-4"><CheckCircle2 size={34} className="text-emerald-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">You’re confirmed</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Sign in →
            </Link>
          </>
        )}

        {state === "bad" && (
          <>
            <div className="flex justify-center mb-4"><AlertCircle size={34} className="text-amber-400" /></div>
            <h1 className="text-[18px] font-bold mb-2">This link can’t be used</h1>
            <p className="text-[#8b99b8] text-[13px] mb-6">{message}</p>
            <Link href="/login" className="inline-block w-full bg-emerald-400 text-[#0B0D10] font-bold text-[13.5px] py-3 rounded-lg hover:bg-emerald-300 transition-colors">
              Sign in →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
