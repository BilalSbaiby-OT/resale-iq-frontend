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
  // Don't advertise the framework/version to attackers picking targets.
  poweredByHeader: false,
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
