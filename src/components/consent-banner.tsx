"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "@/components/i18n/locale-provider"
import { isFrontDoorPath } from "@/lib/locale-routes"
import { loadGtag } from "@/lib/gads"
import {
  CONSENT_COPY, CONSENT_EVENT, CONSENT_REOPEN_EVENT,
  readConsent, writeConsent, type ConsentChoice,
} from "@/lib/consent"
import { useT } from "@/components/i18n/locale-provider"

/** Compact bottom bar. Accept and Reject are identical in size, weight and colour. */
export function ConsentBanner() {
  const tx = useT()
  const locale = useLocale()
  const pathname = usePathname()
  const light = isFrontDoorPath(pathname || "/")
  const c = CONSENT_COPY[locale] ?? CONSENT_COPY.en
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (readConsent(window.localStorage) === null) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen)
  }, [])

  if (!open) return null

  const choose = (choice: ConsentChoice) => {
    writeConsent(window.localStorage, choice)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }))
    if (choice === "granted") loadGtag()
    setOpen(false)
  }

  const fg = light ? "#1D1D1F" : "#E8ECF4"
  const btn = {
    flex: "1 1 0", minHeight: 40, minWidth: 84, padding: "0 14px", borderRadius: 9,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    background: "transparent", color: fg,
    border: `1.5px solid ${light ? "#1D1D1F" : "#E8ECF4"}`,
  } as const

  return (
    <div
      role="region"
      aria-label={tx("Cookie consent")}
      data-testid="riq-consent"
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
        background: light ? "#FFFFFF" : "#14171C", color: fg,
        borderTop: `1px solid ${light ? "#D2D2D7" : "#2C2F36"}`,
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10,
        fontSize: 12.5, lineHeight: 1.4,
        boxShadow: "0 -4px 16px rgba(0,0,0,.08)",
      }}
    >
      <p style={{ margin: 0, flex: "1 1 260px", maxWidth: 560 }}>
        {c.text}{" "}
        <Link href="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>{c.link}</Link>
      </p>
      <div style={{ display: "flex", gap: 8, flex: "0 1 220px", width: "100%", maxWidth: 260 }}>
        <button type="button" data-testid="riq-consent-reject" onClick={() => choose("denied")} style={btn}>{c.reject}</button>
        <button type="button" data-testid="riq-consent-accept" onClick={() => choose("granted")} style={btn}>{c.accept}</button>
      </div>
    </div>
  )
}

/** Footer link that reopens the banner. */
export function CookieSettingsLink({ style }: { style?: React.CSSProperties }) {
  const locale = useLocale()
  const c = CONSENT_COPY[locale] ?? CONSENT_COPY.en
  return (
    <button
      type="button"
      data-testid="riq-cookie-settings"
      onClick={() => window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))}
      style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer", ...style }}
    >
      {c.settings}
    </button>
  )
}
