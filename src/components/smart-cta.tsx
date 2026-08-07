"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getToken, getPlanFromToken } from "@/lib/utils"

/**
 * A call-to-action that knows who is reading it.
 *
 * Every content CTA used to hardcode /register, so a customer paying €49 would
 * finish a guide, click through, and be asked to sign up for the product they
 * already own. Signed-in users are now sent into the app instead.
 *
 * The blog pages are statically rendered, so auth can only be read on the
 * client. Until that read happens we render the anonymous copy — it is the
 * correct default for the vast majority of visitors and avoids a flash of
 * "Open dashboard" for logged-out readers.
 */
export function SmartCTA({
  anonLabel,
  anonHref = "/register",
  authedLabel = "Open dashboard →",
  authedHref = "/dashboard",
  style,
}: {
  anonLabel: string
  anonHref?: string
  authedLabel?: string
  authedHref?: string
  style?: React.CSSProperties
}) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    // A token whose plan cannot be read is treated as anonymous rather than
    // trusted — this only decides which link to show, never what data is served.
    const plan = getPlanFromToken()
    setAuthed(Boolean(plan))
  }, [])

  return (
    <Link href={authed ? authedHref : anonHref} style={style}>
      {authed ? authedLabel : anonLabel}
    </Link>
  )
}
