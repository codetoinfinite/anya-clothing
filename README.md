# byshree — e-commerce monorepo

Headless ethnic-wear e-commerce stack. Visual language inspired by byshree.com; code, copy, brand, and theme are original. Built on **Next.js 15** (storefront) + **Medusa.js v2** (backend) + **Postgres / Redis / Meilisearch / S3**.

## Stack at a glance

| Layer | Tech |
|---|---|
| Storefront | Next.js 15 (App Router, RSC, TS) + Tailwind v4 + Framer Motion + Embla |
| Backend | Medusa.js v2 (Node, TS) — products, carts, orders, discounts, regions |
| DB | Postgres 15 |
| Cache / events | Redis 7 |
| Search | Meilisearch 1.11 |
| Media | S3 in prod; MinIO locally |
| Payments | Razorpay (India), Stripe (intl), COD |
| Email | Resend |

## Prereqs

- Node ≥ 20
- pnpm ≥ 9 (`corepack enable` or `~/Library/pnpm/pnpm`)
- Docker Desktop running

## Bootstrap

```bash
cp .env.example .env
cp .env.example apps/storefront/.env.local
cp .env.example apps/backend/.env

pnpm install
pnpm docker:up           # postgres, redis, meilisearch, minio
pnpm --filter @byshree/backend run migrate
pnpm --filter @byshree/backend run seed
pnpm dev                 # storefront :3000  +  medusa :9000
```

- Storefront: <http://localhost:3000>
- Medusa Admin: <http://localhost:9000/app>
- MinIO console: <http://localhost:9101> (user `byshree` / pass `byshree_dev_minio`)
- Meilisearch: <http://localhost:7700>

## Layout

```
byshree/
├── apps/
│   ├── storefront/    Next.js 15
│   └── backend/       Medusa.js v2
├── packages/
│   ├── types/         shared TS types
│   └── ui-tokens/     design tokens
├── infra/
│   └── docker-compose.yml
├── scripts/           ops scripts (seed, image upload)
└── .env.example
```

## Deploy targets

- Storefront → Vercel
- Backend → Railway / Fly.io (Docker)
- DB → Neon / Supabase
- Redis → Upstash
- Media → AWS S3 + CloudFront

See `infra/deploy/` for platform configs.

## What you need to provide (rolling)

Phase-keyed in `/Users/ordisai/.claude/plans/https-byshree-com-i-want-you-stateful-duckling.md`. In short: AWS S3 keys, Razorpay test keys, Resend key, domain. Each will be requested at the moment it's first needed.
