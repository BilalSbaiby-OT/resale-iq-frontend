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
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
