# Multi-stage build pro Next.js aplikaci

ARG NODE_IMAGE=node:24.19.0-alpine

# Stage 1: Dependencies
FROM ${NODE_IMAGE} AS deps
WORKDIR /app

# Kopírování package files
COPY package.json package-lock.json ./

# Instalace dependencies
RUN npm ci

# Stage 2: Builder
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Kopírování dependencies z předchozího stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build aplikace
RUN npm run build

# Stage 3: Runner (production)
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Vytvoření non-root uživatele
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

# Kopírování potřebných souborů
# Standalone server zapisuje do .next/cache, proto musí soubory vlastnit nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
