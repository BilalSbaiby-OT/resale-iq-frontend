"use client"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { captureAttribution, captureLandingPath, trackEvent, trackPageview, type FunnelEvent } from "@/lib/analytics"
import { captureReferral } from "@/lib/referral"
import { stripLocalePrefix } from "@/lib/locale-routes"

/** Keyed on the LOCALE-STRIPPED path — see the lookup below for why. */
const PATH_EVENTS: Record<string, FunnelEvent> = {
  "/": "landing_view",
  "/register": "signup_started",
}

/** "/pricing" and its five locale siblings ("/es/pricing", ...). The whole
 *  reason /pricing stopped being a "/#pricing" redirect is that a fragment is
 *  not countable — it only reached this file when the browser preserved the
 *  hash, and it shared its pageview with landing_view. A path fires once per
 *  visit, from an ad or a shared link, with nothing to preserve. */
const PRICING_PATH = /^\/(?:[a-z]{2}\/)?pricing\/?$/

/**
 * Suffix marking the SECOND way a person can meet the price: not by visiting
 * the /pricing route, but by scrolling the embedded strip on the page they
 * already landed on. Measured 2026-09-08 against production: `pricing_view`
 * had 3 distinct non-bot visitors for the product's entire lifetime, all on
 * the route — while `/`, which server-renders the whole pricing section
 * (id="pricing", EUR 19 / EUR 49, live checkout buttons), had 157 distinct
 * non-bot visitors in 30 days. The gap is not visitor behaviour; it is that
 * this file never looked.
 *
 * Encoded into the path because /api/track stores no extra body fields
 * (api/routes.py:3686). Query the route-only series — the one every prior
 * decision used — with `path NOT LIKE '%#seen'`; it is unchanged.
 */
const PRICE_SEEN_SUFFIX = "#seen"

/** How long to keep looking for the strip before giving up. The section is
 *  rendered by a client component, so it is not in the DOM on the first tick
 *  of this effect. 20 tries x 500ms; if it never appears, the page simply has
 *  no pricing strip (blog, tools, dashboard) and nothing should fire. */
const ATTACH_TRIES = 20

export function PageviewTracker() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)
  const priceSeenFor = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    // usePathname() returns the path WITHOUT the query string, so every
    // ?utm_content=... we put on a tracked link used to be dropped before it
    // ever left the browser. Read the real URL instead.
    const search = typeof window !== "undefined" ? window.location.search : ""
    const full = pathname + search
    if (lastSent.current === full) return
    lastSent.current = full

    // Store the campaign that brought them here before anything else runs, so
    // it survives even if this is the only page they ever load.
    captureReferral()
    captureAttribution()
    captureLandingPath()

    trackPageview(full)

    // "/es/register" IS a register page view and has to count as one. This
    // lookup was against the raw pathname, so signup_started only ever fired
    // for English: every /es, /fr, /de, /it, /pt register visit landed in
    // production's `pageviews` with a NULL event and was invisible to the
    // funnel. 7 such rows exist for /es/register alone (read 2026-09-06), and
    // "/es" had the same hole against landing_view. PRICING_PATH below already
    // handled its own prefix; these two never did.
    const ev = PATH_EVENTS[stripLocalePrefix(pathname)]
    // Sent WITH the query string. "?plan=power" and "?plan=free" are two
    // different offers arriving at one route, and this event threw that away —
    // all 123 signup_started rows on production read a bare "/register" with
    // no way to tell which offer the visitor was shown. Consequence for
    // analysis: historical rows are bare, so query this event with
    // LIKE '/register%', never equality.
    if (ev) trackEvent(ev, full)
    // The anchor still counts — the landing page keeps its embedded pricing
    // strip and people still reach it by clicking a "#pricing" CTA — but the
    // route is now the primary, reliable witness.
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    if (PRICING_PATH.test(pathname) || hash === "#pricing") {
      trackEvent("pricing_view", full)
    }
  }, [pathname])

  // The embedded strip, watched. Separate effect so a throw here can never
  // cost us the pageview above, and so the cleanup is scoped to just this.
  useEffect(() => {
    if (!pathname) return
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return
    // The route already counts itself, once, in the effect above.
    if (PRICING_PATH.test(pathname)) return
    if (priceSeenFor.current === pathname) return

    let timer = 0
    let observer: IntersectionObserver | null = null
    let tries = 0

    const fire = () => {
      if (priceSeenFor.current === pathname) return
      priceSeenFor.current = pathname
      trackEvent("pricing_view", pathname + PRICE_SEEN_SUFFIX)
    }

    const attach = () => {
      const el = document.getElementById("pricing")
      if (!el) {
        if (tries++ < ATTACH_TRIES) timer = window.setTimeout(attach, 500)
        return
      }
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          // 0.4, not 0.01: a strip that clips the top of the viewport for a
          // moment during a fast scroll to the footer is not someone reading
          // a price. Deliberately conservative — this number is meant to be
          // an under-count we can trust, not the biggest number available.
          if (entry.isIntersecting) {
            fire()
            if (observer) { observer.disconnect(); observer = null }
            break
          }
        }
      }, { threshold: 0.4 })
      observer.observe(el)
    }

    timer = window.setTimeout(attach, 0)
    return () => {
      window.clearTimeout(timer)
      if (observer) observer.disconnect()
    }
  }, [pathname])

  // Deploy witness. This component used to `return null`, which made a
  // client-only change to it unprovable from outside the browser: the JS
  // chunks referenced by `/` were checked live on 2026-09-08 and contain no
  // event-name strings, so grepping the bundle proves nothing. A
  // server-rendered attribute unique to this version does — `curl -s
  // https://resaleiq.dev/ | grep data-riq-price-observer` is now a one-line
  // answer to "is the instrumentation that browsers execute this file?".
  // Hidden, no layout box, no text, first child of <body>.
  return <span data-riq-price-observer="v1" hidden />
}
