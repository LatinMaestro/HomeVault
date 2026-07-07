# Phase 1C Implementation

Phase 1C adds core screen shells for HomeVault without full CRUD persistence.

## Approved Behaviour

- List/detail screens may read from Prisma when `DATABASE_URL` is configured.
- If `DATABASE_URL` is missing or unavailable, screens render curated sample data.
- Create/edit pages are UI shells only.
- Save buttons show: "Saving will be enabled in a later phase."
- No create, edit or delete mutation is performed.

## Routes

- `/vault/rooms`
- `/vault/rooms/new`
- `/vault/rooms/[roomId]/edit`
- `/vault/assets`
- `/vault/assets/new`
- `/vault/assets/[assetId]`
- `/vault/assets/[assetId]/edit`
- `/maintenance`
- `/maintenance/[taskId]`
- `/warranties`
- `/warranties/[warrantyId]`
- `/receipts`
- `/receipts/[recordId]`

## Data Source

`src/lib/home-data.ts` wraps Prisma reads and falls back to `src/lib/sample-data.ts` when database access is unavailable. Database access uses lazy `getDb()` calls only inside server functions.

## Vercel

Vercel builds must pass without a database. Runtime previews should show sample data unless `DATABASE_URL` is configured.
