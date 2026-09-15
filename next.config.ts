import type { NextConfig } from "next";

// API target is configurable so the same build runs locally (localhost:8080)
// and in production behind Coolify/Docker (http://backend:8080). Also enables
// the Next standalone output for a tiny production container image.
const API = process.env.BACKEND_URL || "http://localhost:8080";

// Security headers. The FastAPI backend already sets these, but that only ever
// covered /api/* — the pages a user actually browses are served by Next and had
// NO headers at all, so the site could be framed (clickjacking) and had no CSP.
//
// CSP notes: 'unsafe-inline' is required for style-src because the UI uses inline
// style objects throughout, and for script-src because Next injects inline
// bootstrap/JSON-LD. It is still worth setting — frame-ancestors, base-uri,
// form-action and object-src are the parts that actually stop framing, base-tag
// injection and data exfiltration via forms.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // Stripe Checkout is a redirect (not embedded), so connect-src only needs self.
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=()" },
  // .dev is HSTS-preloaded, but send it explicitly so the policy travels with
  // the app rather than depending on the TLD.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright and some local setups hit 127.0.0.1 while the dev server
  // binds localhost — Next 16 blocks that as a cross-origin /_next request.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Don't advertise the framework/version to attackers picking targets.
  poweredByHeader: false,
  // www serves a byte-identical copy of the site instead of redirecting, which
  // splits any links people build to it and forces Google to guess which host
  // is canonical. Canonical tags now cover the pages; this removes the
  // duplicate at source so there is nothing to guess about.
  //
  // Cannot loop: the destination host is the apex, which does not satisfy the
  // `has` condition, so the redirect fires at most once.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.resaleiq.dev" }],
        destination: "https://resaleiq.dev/:path*",
        permanent: true,
      },
      // "/pricing" used to 307 to "/#pricing" — a stopgap for the 404, with the
      // note "a permanent redirect would be cached long after a real /pricing
      // page exists". That page exists now (src/app/pricing/page.tsx, plus
      // src/app/[locale]/pricing/page.tsx for the five translated markets), so
      // the redirect is deleted rather than pointed somewhere new.
      //
      // Why a route and not an anchor: an anchor cannot be measured. Landing on
      // "/#pricing" fires pricing_view only if the browser kept the fragment,
      // and it shares its pageview with landing_view, so the funnel step
      // between landing and checkout was never independently countable. A path
      // is countable, linkable from an ad, and shareable without dragging the
      // whole homepage along.
      { source: "/sign-in", destination: "/login", permanent: false },
      { source: "/signup", destination: "/register", permanent: false },
      { source: "/panel", destination: "/dashboard", permanent: false },
      // /checkout 404'd for 3+ cycles — no standalone route exists yet.
      // Redirect to /pricing so any inbound link (blog CTAs, LLM citations,
      // social) lands somewhere with a real purchase button rather than a 404.
      // 307 not 308: once a real Stripe checkout route ships, we want to swap
      // the destination without fighting cached redirects.
      { source: "/checkout", destination: "/pricing", permanent: false },

      // SHORT TRACKED LINKS. TikTok gives this account no clickable bio link,
      // and Instagram allows exactly one — so a lot of people arrive by TYPING
      // the address, and typed traffic carries no campaign tag at all. The
      // channel then gets credit for nothing.
      //
      // resaleiq.dev/tt is short enough to read off a phone screen, and because
      // we own the redirect we attach the tags ourselves: what the visitor types
      // is not what gets recorded, the destination is.
      //
      // These live HERE and not in the FastAPI backend. Single-segment paths on
      // this domain are served by Next.js — I put them in the backend first and
      // they 404'd, because /tt never reaches FastAPI at all.
      //
      // permanent:false (307) on purpose — a 308 is cached by browsers forever
      // and a slug may need retargeting at a later campaign.
      {
        source: "/tt",
        destination: "/check?utm_source=tiktok&utm_medium=bio&utm_campaign=growth-0-500&utm_content=tt-bio",
        permanent: false,
      },
      {
        source: "/ig",
        destination: "/check?utm_source=instagram&utm_medium=bio&utm_campaign=growth-0-500&utm_content=ig-bio",
        permanent: false,
      },
      {
        source: "/rd",
        destination: "/check?utm_source=reddit&utm_medium=bio&utm_campaign=growth-0-500&utm_content=rd-bio",
        permanent: false,
      },
      {
        source: "/li",
        destination: "/check?utm_source=linkedin&utm_medium=bio&utm_campaign=growth-0-500&utm_content=li-bio",
        permanent: false,
      },

      // DEAD LINKS GOOGLE IS STILL SENDING TRAFFIC TO. Read-only Search Console
      // data pulled today (resale-iq-seo/data/gsc/2026-09-08-35d-page.json, page
      // dimension, 2026-08-02..2026-09-05, siteOwner access the company already
      // holds) shows 74 pages Google tracked impressions for; I curl-verified
      // every one of them live and 8 return 404. Those 8 carry 89 of the
      // window's 1,147 tracked impressions and 0 clicks each. The largest is
      // /blog/how-to-spot-fake-items-vinted: position 9.85 (page 1), 74
      // impressions in 35 days for real buyer-intent queries, currently a dead
      // end on every click. The other four dead URLs are brand pages for
      // brands no longer on the /flip roster (calvin-klein, bershka, mango,
      // pull-bear) — redirected to the /flip hub rather than re-created, since
      // the brand itself isn't supported today. Permanent (301/308): none of
      // this content is coming back, and a soft-404 leaves Google no reason to
      // keep crawling a ranking the company already earned.
      {
        source: "/blog/how-to-spot-fake-items-vinted",
        destination: "/manual/condition-and-authenticity",
        permanent: true,
      },
      {
        source: "/blog/days-to-sell-vs-profit-margin",
        destination: "/blog/what-is-a-good-sell-through-rate",
        permanent: true,
      },
      { source: "/flip/calvin-klein", destination: "/flip", permanent: true },
      { source: "/flip/calvin-klein/:path*", destination: "/flip", permanent: true },
      { source: "/flip/bershka", destination: "/flip", permanent: true },
      { source: "/flip/mango", destination: "/flip", permanent: true },
      { source: "/flip/pull-bear", destination: "/flip", permanent: true },
    ]
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API}/api/:path*` },
      { source: "/auth/:path*", destination: `${API}/auth/:path*` },
      { source: "/stripe/:path*", destination: `${API}/stripe/:path*` },
      { source: "/admin/:path*", destination: `${API}/admin/:path*` },
    ];
  },
};

export default nextConfig;
