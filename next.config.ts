import type { NextConfig } from "next";

// API target is configurable so the same build runs locally (localhost:8080)
// and in production behind Coolify/Docker (http://backend:8080). Also enables
// the Next standalone output for a tiny production container image.
const API = process.env.BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
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
