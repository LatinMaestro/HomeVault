# Phase 3M: Room Detail

## Objective

Give each room a useful read-only home that connects the space to its assigned assets and maintenance context.

## Delivered

- Added `/vault/rooms/[roomId]`.
- Added fallback-safe room detail composition over existing room, asset and maintenance reads.
- Linked room cards directly to their detail pages.
- Kept database and curated sample behavior aligned.
- Added the canonical sample room route to the online production smoke gate.

## Boundaries

- No schema or migration.
- No new mutation or delete action.
- No production authentication, storage, upload, OCR, AI, notification, payment, analytics or external integration.
- Maintenance is shown only when linked through an asset assigned to the room.

## Acceptance Criteria

- A known room renders its floor, notes and asset count.
- Assigned assets link to their existing detail pages.
- Maintenance linked through assigned assets links to existing task detail pages.
- Empty room and unknown room states are clear.
- The route renders without `DATABASE_URL`.
- Existing create and edit behavior is unchanged.

## Review Evidence

GitHub CI must pass Prisma validation and generation, lint, typecheck, build, boundary contracts and database-free route smoke. Vercel visual review may be batched with later UI work to conserve deployment usage.
