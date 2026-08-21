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
      // /pricing 404'd. Nothing internal links to it — every CTA uses the
      // #pricing anchor — but it is the URL people TYPE, what an external
      // link or an ad would point at, and what a "resaleiq pricing" search
      // expects. A 404 there loses a visitor who was already looking for the
      // price. 307 rather than 308: the pricing section lives on the landing
      // page today, and a permanent redirect would be cached by browsers long
      // after a real /pricing page exists.
      { source: "/pricing", destination: "/#pricing", permanent: false },
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
