# ---- Builder: install all deps, generate Prisma client, compile TypeScript ----
FROM node:20-alpine AS builder

# Optional build-time tuning (no secrets).
ENV NODE_ENV=production

WORKDIR /app

# Install dependencies first to leverage layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Generate the Prisma client (needs the prisma CLI, a dev dependency).
COPY prisma ./prisma
RUN npx prisma generate

# Compile the app.
COPY tsconfig.json tsconfig.scripts.json ./
COPY src ./src
RUN npm run build

# ---- Runtime: production dependencies only, no dev tooling ----
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

# Install PRODUCTION dependencies only (no eslint, vitest, prisma CLI, typescript).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bring in the Prisma client that was generated in the builder stage (the engine
# binaries live under node_modules/.prisma and are NOT part of the published
# @prisma/client package).
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Compiled application + Prisma schema (needed for `prisma migrate deploy`).
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

EXPOSE 3001

# Liveness probe. /health does not touch the database, so the container is
# considered alive even if Postgres is briefly unavailable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Run migrations on container start ONLY if explicitly requested, so a normal
# `docker compose up` never surprises operators. Default command just starts.
CMD ["node", "dist/server.js"]
