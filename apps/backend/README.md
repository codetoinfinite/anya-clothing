# @byshree/backend — Medusa.js v2

## First-run

From `byshree/` root:

```bash
cp .env.example apps/backend/.env
pnpm install
pnpm docker:up
pnpm --filter @byshree/backend db:create
pnpm --filter @byshree/backend migrate
pnpm --filter @byshree/backend user:create   # creates admin@byshree.local
pnpm --filter @byshree/backend seed
pnpm dev:backend
```

- Admin: <http://localhost:9000/app>
- Store API base: <http://localhost:9000/store>
- Health: <http://localhost:9000/health>

After seed, copy the printed publishable key into `apps/storefront/.env.local` as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Layout

- `medusa-config.ts` — modules, providers, CORS, file storage
- `src/api/` — custom REST routes (wishlist, reviews, blog, contact)
- `src/modules/` — custom domain modules
- `src/subscribers/` — event handlers
- `src/workflows/` — multi-step processes
- `src/scripts/seed.ts` — demo data

## Deploy notes

`Dockerfile` builds a slim production image. Use with Railway, Fly.io, Render, ECS, or any Docker host.

Required env in production:
- `DATABASE_URL` (managed Postgres)
- `REDIS_URL` (managed Redis)
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`
- `JWT_SECRET`, `COOKIE_SECRET`
- `S3_*` for media
- `RESEND_API_KEY` for email
- `RAZORPAY_*` / `STRIPE_*` for payments
