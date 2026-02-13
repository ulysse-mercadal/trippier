FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package.json bun.lockb* ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1-alpine

WORKDIR /app

# Install openssl and libc6-compat for Prisma engine
RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma db push && bun run start:prod"]
