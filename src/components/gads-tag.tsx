"use client"
import { useEffect } from "react"
import { loadGtag } from "@/lib/gads"
import { CONSENT_EVENT } from "@/lib/consent"

/** Loads gtag.js for Google Ads only when configured + consented. Renders nothing. */
export function GadsTag() {
  useEffect(() => {
    loadGtag()
    // Accept in the banner loads the tag without a reload.
    const on = () => { loadGtag() }
    window.addEventListener(CONSENT_EVENT, on)
    return () => window.removeEventListener(CONSENT_EVENT, on)
  }, [])
  return null
}
