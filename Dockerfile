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
# so it MUST be present during `npm run build`. Pass it explicitly.
#
# This is the docker-internal address, and it has to stay that way. The public
# sslip.io hostname used until 2026-09-03 sent every /api/* rewrite out of the
# box and back in through Traefik, which NATs it: the backend then saw source
# 10.0.1.1 (the coolify bridge gateway) on every request and overwrote the
# forwarded-for header, so all anonymous traffic on the internet shared ONE
# rate-limit bucket — sha256('10.0.1.1')[:16] = d66e6eaf9400d271, 95% of rows.
# That is what took the product down for everyone on 2026-09-02.
#
# `resale-iq-backend` is a Coolify *custom network alias* on the backend app,
# not a container name. The container name carries a per-deployment suffix
# (ph5clxk9hmghspv65pdkvak9-104657053096) that changes on EVERY redeploy, and
# the unsuffixed name does not resolve. Coolify re-applies the custom alias from
# its own database on each deploy (ApplicationDeploymentJob: the compose service
# gets `aliases: [container_name, ...custom_network_aliases]`), so this name
# survives backend redeploys. Do not replace it with an IP or a suffixed name.
ARG BACKEND_URL=http://resale-iq-backend:8080
ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Google Ads purchase conversion: public IDs (visible in page source), tracking only.
# The tag loads only after cookie consent; the conversion fires from /billing/success.
ARG NEXT_PUBLIC_GADS_ID=AW-18487791247
ARG NEXT_PUBLIC_GADS_CONV_LABEL=5rY3CLConI8dEI-d1e9E
ENV NEXT_PUBLIC_GADS_ID=$NEXT_PUBLIC_GADS_ID NEXT_PUBLIC_GADS_CONV_LABEL=$NEXT_PUBLIC_GADS_CONV_LABEL
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
# Same internal alias as the build stage — see the note there before changing it.
ARG BACKEND_URL=http://resale-iq-backend:8080
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 BACKEND_URL=$BACKEND_URL
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
# Without this the backend reported running:healthy while the frontend sat at
# running:unknown — Docker had no way to tell whether Next was actually serving,
# so a wedged container that stayed up looked identical to a working one.
# Uses node's global fetch rather than curl, which node:22-slim does not ship.
# Health must not depend on homepage SSR or the backend. "/" awaits backend
# fetches; a stuck analyzer made this check fail and Traefik 503'd the whole
# site. /healthz is a static 200 with no fetch and no DB. Do not point this at
# "/" or at /api/* (those paths rewrite to the backend).
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
