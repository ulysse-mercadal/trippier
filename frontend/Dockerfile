FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .

ARG API_URL
ENV API_URL=$API_URL
ARG MAPTILER_API_KEY
ENV MAPTILER_API_KEY=$MAPTILER_API_KEY
ARG MAPTILER_MAP_ID
ENV MAPTILER_MAP_ID=$MAPTILER_MAP_ID

RUN bun run build

FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["bun", "run", "start"]
