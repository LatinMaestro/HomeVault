# Phase 2K: Household-wide Search

## Status

Complete, subject to pull request checks and merge.

## Objective

Help a homeowner find an existing household record quickly without knowing which HomeVault section contains it.

## Delivered

- A dedicated `/search` route available from the app header.
- One query across rooms, asset categories, assets, maintenance tasks, warranties, reminders, service providers, receipts and documents.
- Grouped, mobile-friendly results with direct links to the most useful existing route.
- Search over practical metadata such as names, brands, rooms, providers, statuses, dates and notes.
- Prisma runtime reads with curated sample fallback.

## Data Behaviour

- Search reuses the existing lazy server-side data layer.
- No search query runs at module import or build time.
- A configured database returns current-home records.
- Missing or unavailable database access returns useful sample results.
- Search does not persist queries or introduce analytics.

## Guardrails

- No schema change, migration, dependency or environment variable.
- No mutations, deletes, production auth, uploads, storage, OCR, AI, notification delivery, payments, analytics or native app work.
- Search remains scoped to the temporary current home and existing fallback data.

## Review

GitHub Actions provides Prisma validation/generation, lint, typecheck and build evidence. Vercel visual review is not manually triggered for this bounded slice.
