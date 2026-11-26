# syntax=docker/dockerfile:1
# Single container: the API serves its routes AND the built web app (same origin).
# Deployed to Cloud Run; migrations run on start.

# --- build the web (static) ---
FROM node:22-slim AS web
WORKDIR /web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build            # production build → VITE_API_URL empty → same-origin API

# --- build the api (TypeScript → dist) + generate Prisma client ---
FROM node:22-slim AS api
WORKDIR /app
COPY api/package.json api/package-lock.json ./
RUN npm ci
COPY api/ ./
RUN npx prisma generate && npm run build

# --- runtime ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma query engine needs openssl.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=api /app/node_modules ./node_modules
COPY --from=api /app/dist ./dist
COPY --from=api /app/prisma ./prisma
COPY --from=api /app/package.json ./package.json
COPY --from=web /web/dist ./public
EXPOSE 8080
# Apply committed migrations, then start. Cloud Run provides PORT=8080.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
