"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/utils"

export default function Check() {
  const router = useRouter()
  useEffect(() => { router.replace(getToken() ? "/verdict" : "/register?plan=free") }, [router])
  return null
}
