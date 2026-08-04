"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/utils"

// No free tier: the verdict tool is a paid feature. Route visitors to sign up,
// existing users to their dashboard.
export default function Check() {
  const router = useRouter()
  useEffect(() => { router.replace(getToken() ? "/dashboard" : "/register") }, [router])
  return null
}
