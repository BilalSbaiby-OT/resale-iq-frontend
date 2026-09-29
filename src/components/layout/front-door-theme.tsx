"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { isFrontDoorPath } from "@/lib/locale-routes"

const LIGHT = "#F5F5F7"
const DARK = "#0B0D10"

/**
 * Root layout does not re-render on client navigations, so the SSR class
 * (set from the proxy header) would stick after login → /dashboard and
 * paint the app light. Sync the class to the URL before paint.
 */
export function FrontDoorTheme() {
  const pathname = usePathname()
  useLayoutEffect(() => {
    if (!pathname) return
    const on = isFrontDoorPath(pathname)
    const root = document.documentElement
    root.classList.toggle("riq-light", on)
    root.classList.toggle("dark", !on)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute("content", on ? LIGHT : DARK)
  }, [pathname])
  return null
}
