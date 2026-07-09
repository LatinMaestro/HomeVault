# Phase 1F Plan: First Room Persistence

Phase 1F introduces the first real database-backed mutation workflow in HomeVault. It starts with rooms only so the project can prove the mutation pattern before applying it to assets, maintenance, warranties or documents.

## Status

Phase 1F is planned as the next implementation phase after Phase 1E. The first implementation slice should enable room create and edit persistence when `DATABASE_URL` is configured, while preserving graceful fallback when a database is unavailable.

## Goals

- Enable real create and edit persistence for rooms only.
- Keep delete actions out of scope.
- Keep assets, maintenance, warranties and documents read-only or shell-only until later phases.
- Keep Vercel builds safe without build-time database access.
- Preserve useful fallback behavior when `DATABASE_URL` is missing or a database read/write fails.
- Keep stubbed single-user/current-home assumptions explicit until production auth is approved.
- Keep the UI beginner-friendly and clear about whether a change was saved or could not be saved.

## Approved Work

- Add server-side room create and edit actions using the existing Prisma/PostgreSQL data model.
- Resolve the current sample home through the existing temporary current-home resolver.
- Revalidate room and vault routes after successful room mutations.
- Show clear success, validation and unavailable-database messages.
- Keep form fields aligned with the Phase 1E shared shell field definitions.
- Update copy so room create/edit pages no longer claim to be preview-only when persistence is available.
- Keep fallback/sample rendering for list/detail pages when database access is unavailable.
- Update README, acceptance criteria and decision log where the implementation changes project behavior.

## Out Of Scope

- Room delete actions.
- Asset persistence.
- Maintenance, warranty, receipt or document persistence.
- Production authentication.
- Real file uploads or storage.
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
- Role or permission systems.
- Requiring local client commands, local secrets or local databases.

## Database And Build Safety

- `DATABASE_URL` may be used only at runtime.
- No database queries or Prisma client creation may happen at module import time.
- `next build` and GitHub Actions must pass without a live database.
- When `DATABASE_URL` is missing, room forms should explain that saving needs a configured database rather than crashing.
- When database writes fail, the user should see a non-destructive failure message.

## Review Approach

- Use GitHub PRs for code review.
- Use GitHub Actions for Prisma, lint, typecheck and build evidence.
- Avoid manual Vercel inspection unless a deployment issue needs investigation or a visual checkpoint is explicitly useful.
- Keep PRs small enough to merge safely while Vercel usage is constrained.

## Completion Criteria

Phase 1F is complete when:

- Room create saves to the configured database.
- Room edit updates an existing room in the configured database.
- Missing or unavailable database states are handled with clear messages.
- No delete actions or non-room persistence are added.
- Builds remain database-independent.
- CI evidence passes for Prisma validation/generation, lint, typecheck and build.

## Client Actions

No immediate client action is required to implement the code path. To use real persistence in Vercel Preview or Production, `DATABASE_URL` must be configured to point at the approved Neon Postgres database.

