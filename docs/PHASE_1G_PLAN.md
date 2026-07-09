# Phase 1G Plan: Asset Persistence

Phase 1G extended the proven Phase 1F mutation pattern from rooms to assets. It enabled asset create/edit persistence only, while keeping deletes, uploads, warranty/receipt/document persistence and production auth out of scope.

## Status

Phase 1G is complete. The implementation adds asset create and edit persistence when `DATABASE_URL` is configured, while preserving graceful fallback and clear unavailable-database messages when a database is missing or unreachable.

## Completed Work

- Runtime-only asset create and edit Server Actions.
- An asset-specific form that shows success, validation and unavailable-database messages.
- Optional room association by matching the entered room name to an existing room.
- Route revalidation for vault, asset and room routes after successful asset saves.
- Updated asset create/edit/detail copy so asset forms no longer describe themselves as preview-only when persistence is available.
- Documentation updates for README, acceptance criteria and the decision log.
- No delete actions, uploads or non-asset persistence.

## Goals

- Enable real create and edit persistence for assets only.
- Keep delete actions out of scope.
- Keep warranty, receipt, document and maintenance persistence out of scope.
- Keep file uploads/storage out of scope.
- Keep Vercel builds safe without build-time database access.
- Preserve useful fallback behavior when `DATABASE_URL` is missing or a database read/write fails.
- Reuse the room persistence pattern where practical.
- Keep the UI beginner-friendly and clear about whether a change was saved or could not be saved.

## Approved Work

- Add server-side asset create and edit actions using the existing Prisma/PostgreSQL data model.
- Resolve the current sample home through the existing temporary current-home resolver.
- Support optional room association by room name where it matches an existing room.
- Revalidate asset, vault and room routes after successful asset mutations.
- Show clear success, validation and unavailable-database messages.
- Keep form fields aligned with the Phase 1E shared asset field definitions.
- Update copy so asset create/edit pages no longer claim to be preview-only when persistence is available.
- Keep fallback/sample rendering for list/detail pages when database access is unavailable.
- Update README, acceptance criteria and decision log where the implementation changes project behavior.

## Out Of Scope

- Asset delete actions.
- Warranty, receipt, document or maintenance persistence.
- File uploads or production storage.
- OCR.
- AI.
- Email ingestion.
- Notifications.
- Payments or subscriptions.
- Analytics.
- Native iOS.
- Advanced household sharing.
- Insurance claim automation.
- Financial or budgeting features.
- Production authentication.
- Role or permission systems.
- Requiring local client commands, local secrets or local databases.

## Database And Build Safety

- `DATABASE_URL` may be used only at runtime.
- No database queries or Prisma client creation may happen at module import time.
- `next build` and GitHub Actions must pass without a live database.
- When `DATABASE_URL` is missing, asset forms explain that saving needs a configured database rather than crashing.
- When database writes fail, the user sees a non-destructive failure message.

## Review Approach

- Use GitHub PRs for code review.
- Use GitHub Actions for Prisma, lint, typecheck and build evidence.
- Avoid manual Vercel inspection unless a deployment issue needs investigation or a visual checkpoint is explicitly useful.
- Keep PRs small enough to merge safely while Vercel usage is constrained.

## Completion Criteria

Phase 1G is complete because:

- Asset create saves to the configured database.
- Asset edit updates an existing asset in the configured database.
- Optional room association is handled safely when a matching room exists.
- Missing or unavailable database states are handled with clear messages.
- No delete actions or non-asset persistence were added.
- Builds remain database-independent.
- CI evidence passed for Prisma validation/generation, lint, typecheck and build.

## Client Actions

No immediate client action is required. To use real persistence in Vercel Preview or Production, `DATABASE_URL` must be configured to point at the approved Neon Postgres database.
