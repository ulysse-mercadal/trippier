# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS builder
WORKDIR /app

# openssl is required by the Prisma query engine.
RUN apk add --no-cache openssl

COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate && bun run build


FROM oven/bun:1-alpine AS release
WORKDIR /app
ENV NODE_ENV=production

# openssl + libc6-compat for the Prisma engine; curl for the HEALTHCHECK.
RUN apk add --no-cache openssl libc6-compat curl

COPY --from=builder --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

USER bun
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
    CMD curl -fsS http://localhost:3000/ || exit 1

# db push keeps the schema in sync at startup (the project uses `db push`, not migrations).
CMD ["sh", "-c", "bunx prisma db push && bun run start:prod"]
