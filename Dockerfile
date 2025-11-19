# Multi-stage build pro Next.js aplikaci

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Kopírování package files
COPY package.json package-lock.json ./

# Instalace dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Kopírování dependencies z předchozího stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build aplikace
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Vytvoření non-root uživatele
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopírování potřebných souborů
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
