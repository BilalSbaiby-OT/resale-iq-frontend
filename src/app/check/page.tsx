"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getToken } from "@/lib/utils"

export default function Check() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    const q = params.get("q")
    const qs = q ? `?q=${encodeURIComponent(q)}` : ""
    router.replace(getToken() ? `/verdict${qs}` : `/tools${qs}`)
  }, [router, params])
  return null
}
