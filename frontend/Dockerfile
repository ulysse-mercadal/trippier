FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# On déclare les arguments nécessaires au build
ARG API_URL
ARG GOOGLE_MAPS_API_KEY

# On les rend disponibles comme variables d'environnement pendant le build
ENV API_URL=$API_URL
ENV GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
