FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++ libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.medusa/server ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 9000
CMD ["node", "index.js"]
