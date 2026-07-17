# Phase 3N: Asset Care Context

## Objective

Make an asset record the practical starting point for reviewing its care schedule and follow-ups.

## Delivered

- Added linked maintenance tasks to asset detail.
- Added linked reminders to asset detail.
- Added direct navigation to existing maintenance and reminder workflows.
- Kept database and curated sample relationship data aligned.

## Boundaries

- Existing Prisma relationships only.
- No schema, migration, mutation or delete action.
- No scheduling automation beyond existing maintenance completion behavior.
- No notification delivery, external service, storage, upload, OCR, AI, payment or analytics capability.

## Acceptance Criteria

- Asset detail renders linked maintenance task title, status and due date.
- Asset detail renders linked reminder title, status and due date.
- Each linked record opens its existing detail route.
- Empty relationship states remain clear.
- Sample fallback and controlled preview database records use the same presentation.
- Existing asset editing behavior is unchanged.

## Review Evidence

GitHub CI must pass Prisma validation and generation, lint, typecheck, build, data-boundary contracts and database-free route smoke. Visual review may be batched while Vercel is rate-limited.
