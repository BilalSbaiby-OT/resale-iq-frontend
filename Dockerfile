# ---- deps ----
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BACKEND_URL is baked into the Next rewrites at build time (required-server-files.json),
# so it MUST be present during `npm run build`. Overridable via Coolify build arg.
ARG BACKEND_URL=http://ph5clxk9hmghspv65pdkvak9.62.238.51.83.sslip.io
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- run (standalone, minimal) ----
FROM node:22-slim AS run
WORKDIR /app
# HOSTNAME=0.0.0.0 overrides Docker's default (container id) so the standalone
# server binds to all interfaces and Traefik can reach it (else: bad gateway).
# BACKEND_URL must be present at runtime too — stats.ts fetches the listing
# count from the backend during SSR. Without it, the SSR falls back to
# http://localhost:8080, which doesn't resolve inside the container, and the
# landing page shows the stale "900,000+" fallback instead of the live count.
ARG BACKEND_URL=http://ph5clxk9hmghspv65pdkvak9.62.238.51.83.sslip.io
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 BACKEND_URL=$BACKEND_URL
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
# Without this the backend reported running:healthy while the frontend sat at
# running:unknown — Docker had no way to tell whether Next was actually serving,
# so a wedged container that stayed up looked identical to a working one.
# Uses node's global fetch rather than curl, which node:22-slim does not ship.
# Targets "/" and not "/api/ping": the api path is a rewrite to the backend, so
# using it would make the frontend report unhealthy whenever the BACKEND is down.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
