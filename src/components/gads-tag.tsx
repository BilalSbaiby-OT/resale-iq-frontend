"use client"
import { useEffect } from "react"
import { loadGtag } from "@/lib/gads"

/** Loads gtag.js for Google Ads only when configured + consented. Renders nothing. */
export function GadsTag() {
  useEffect(() => { loadGtag() }, [])
  return null
}
