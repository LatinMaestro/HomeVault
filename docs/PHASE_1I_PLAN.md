# Phase 1I Plan: Warranty Persistence

Phase 1I introduces warranty create/edit persistence as a separate controlled slice after rooms, assets and maintenance. It makes warranty records useful for household record keeping without adding document uploads, reminder delivery, insurance automation, production auth or delete actions.

## Status

Phase 1I is in progress. The first implementation slice adds metadata-only warranty create/edit persistence when `DATABASE_URL` is configured, while preserving graceful fallback and clear unavailable-database messages when a database is missing or unreachable.

## Implementation Slice

The first Phase 1I code slice includes:

- Runtime-only warranty create and edit Server Actions.
- Warranty create and edit routes at `/warranties/new` and `/warranties/[warrantyId]/edit`.
- A warranty form consistent with the room, asset and maintenance persistence forms.
- Required existing asset association by matching the entered asset name.
- Route revalidation for dashboard, warranty and related asset routes after successful warranty changes.
- Updated warranty list/detail copy so screens describe metadata persistence accurately.
- No delete actions, document uploads, production storage, reminders or insurance automation.

## Goals

- Enable warranty create and edit persistence when `DATABASE_URL` is configured.
- Link warranties to the current sample home and an existing asset.
- Preserve database-independent builds and useful fallback/sample rendering.
- Preserve clear non-destructive messaging when the database is missing or unavailable.
- Reuse the proven Server Action pattern from rooms, assets and maintenance.
- Keep warranty records metadata-only until file storage and document upload approaches are approved.

## Approved Implementation Scope

- Add warranty create and edit routes.
- Add warranty create/edit forms using the existing warranty data model.
- Add runtime-only Server Actions for warranty create and edit.
- Require or clearly validate an asset association for warranty records.
- Support provider, policy number, start date, expiry date and notes metadata.
- Revalidate warranties, dashboard and related asset routes after successful warranty changes.
- Show clear success, validation and unavailable-database messages.
- Keep warranty list/detail pages fallback-safe when the database is missing or unavailable.
- Update README, acceptance criteria and decision log where behavior changes.

## Out Of Scope

- Delete actions.
- Document uploads or production file storage.
- Receipt/document persistence changes.
- Warranty reminders or notification delivery.
- Insurance claim automation.
- OCR.
- AI.
- Email ingestion.
- Payments or subscriptions.
- Analytics.
- Native iOS.
- Production authentication.
- Role or permission systems.
- Advanced household sharing.
- Financial or budgeting features.
- Requiring local client commands, local secrets or local databases.

## Data Behavior

- `DATABASE_URL` may be used only at runtime.
- No database queries or Prisma client creation may happen at module import time.
- Missing `DATABASE_URL` should render the same useful sample/fallback warranty screens and show non-destructive messages on attempted saves.
- Failed writes should never imply that a warranty was saved.
- Warranty records remain metadata-only in this phase.

## UI Behavior

- Warranty create/edit forms should be mobile-first and consistent with existing persistence forms.
- Copy should make it clear that warranty documents cannot be uploaded yet.
- Asset linking should be beginner-friendly and should explain when an entered asset name does not match an existing asset.
- Warranty list/detail screens should not imply reminder notifications or insurance claim workflows are active.

## Review Approach

- Use GitHub PRs for code review.
- Use GitHub Actions for Prisma, lint, typecheck and build evidence.
- Avoid manual Vercel inspection unless diagnosing a deployment issue or doing a deliberate visual checkpoint.
- Keep implementation PRs small enough to review and merge safely.

## Completion Criteria

Phase 1I will be complete when:

- Warranty create persists when `DATABASE_URL` is configured and the database is reachable.
- Warranty edit persists when `DATABASE_URL` is configured and the warranty exists in the database.
- Warranty records are linked to an existing asset.
- Missing or unavailable database states show clear non-destructive messages.
- Warranty list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, document uploads, storage, reminders, production auth, OCR, AI, payments, analytics or native app work is added.

## Client Actions

No immediate client action is required. To use real persistence in Vercel Preview or Production, `DATABASE_URL` must be configured to point at the approved Neon Postgres database.
