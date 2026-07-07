# Prisma Local Setup

Phase 1B adds the Prisma data model foundation for PostgreSQL. It does not connect HomeVault to a production database and does not add production authentication, uploads, OCR, AI, notifications, email ingestion, billing or analytics.

## Environment

Copy `.env.example` to `.env` for local development and set:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homevault?schema=public"
```

Use a local PostgreSQL database or an approved development database. Do not commit real credentials.

## Commands

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:format
npm run db:push
npm run db:seed
npm run prisma:studio
```

`npm run prisma:validate`, `npm run prisma:format` and `npm run prisma:generate` can run without real credentials because Prisma config includes the same non-secret local fallback shown in `.env.example`. Commands that connect to a database, such as `npm run db:push`, `npm run db:seed` and `npm run prisma:studio`, require a reachable PostgreSQL database.

`npm run build` runs `prisma generate` before `next build` so fresh Vercel installs have Prisma Client types available during TypeScript checking. This does not connect to a live database.

## Seed Data

The seed script creates a sample Australian family home in Carindale, Queensland with rooms, asset categories, appliances, outdoor equipment, service providers, warranties, receipts, documents, maintenance tasks, completions and reminders.

## Phase Boundary

The schema stores document metadata only. File storage fields such as `fileName` and `storageKey` are placeholders for a future approved storage approach.
