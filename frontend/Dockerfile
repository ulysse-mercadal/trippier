# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .

# Baked into the client bundle at build time (see next.config.ts).
ARG API_URL
ARG MAPTILER_API_KEY
ARG MAPTILER_MAP_ID
ENV API_URL=$API_URL \
    MAPTILER_API_KEY=$MAPTILER_API_KEY \
    MAPTILER_MAP_ID=$MAPTILER_MAP_ID

RUN bun run build


FROM oven/bun:1-alpine AS release
WORKDIR /app
ENV NODE_ENV=production

# curl for the HEALTHCHECK.
RUN apk add --no-cache curl

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/.next ./.next
COPY --from=builder /app/public ./public

USER bun
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
    CMD curl -fsS http://localhost:3000/ || exit 1

CMD ["bun", "run", "start"]
