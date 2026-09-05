"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/utils"

/**
 * Sends already-signed-in visitors from the landing page to their dashboard.
 *
 * WHY THIS IS A SEPARATE COMPONENT
 * The landing page used to be one big Client Component that returned null until
 * a useEffect had run. That meant "/" prerendered to an empty shell — no h1, no
 * hero, no pricing — roughly 10KB of chrome with no content. Google renders JS
 * eventually, but robots.ts deliberately invites GPTBot, ClaudeBot and
 * PerplexityBot, and those generally do not execute JavaScript. So the most
 * important URL on the site was blank to exactly the crawlers we asked to come.
 *
 * The token lives in localStorage, so the check genuinely cannot run on the
 * server. Isolating it here keeps the redirect while letting everything else
 * render as static HTML. Renders nothing by design.
 */
export function RedirectIfAuthed() {
  const router = useRouter()

  useEffect(() => {
    if (getToken()) router.replace("/verdict")
  }, [router])

  return null
}
