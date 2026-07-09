# Phase 1H Plan: Maintenance Persistence

Phase 1H introduces the next controlled persistence slice after rooms and assets: maintenance tasks. The phase should make maintenance records more useful without adding reminders, notifications, recurrence automation, deletes, production auth or warranty persistence.

## Status

Phase 1H is planned. Implementation should begin only after this planning PR is merged.

## Goals

- Enable maintenance task create and edit persistence when `DATABASE_URL` is configured.
- Enable a simple non-destructive completion workflow that records a maintenance completion against an existing task.
- Keep database-independent builds and useful fallback/sample rendering.
- Preserve beginner-friendly messaging when the database is missing or unavailable.
- Reuse the proven Server Action pattern from rooms and assets where practical.
- Keep the maintenance experience focused on practical home upkeep rather than reminders, automation or advanced scheduling.

## Approved Implementation Scope

- Add maintenance task create and edit forms using the existing maintenance task data model.
- Add runtime-only Server Actions for maintenance task create and edit.
- Add a runtime-only Server Action for marking a task complete by creating a maintenance completion record.
- Link maintenance tasks to the current sample home and optionally to an existing asset where the form provides an asset reference.
- Revalidate maintenance, dashboard and related asset routes after successful maintenance changes.
- Show clear success, validation and unavailable-database messages.
- Keep maintenance list and detail pages fallback-safe when the database is missing or unavailable.
- Update README, acceptance criteria and decision log where behavior changes.

## Out Of Scope

- Delete actions.
- Recurring task generation or schedule automation.
- Email, push or SMS notifications.
- Calendar integration.
- Warranty, receipt or document persistence.
- File uploads or production storage.
- OCR.
- AI.
- Payments or subscriptions.
- Analytics.
- Native iOS.
- Production authentication.
- Role or permission systems.
- Advanced household sharing.
- Insurance claim automation.
- Financial or budgeting features.
- Requiring local client commands, local secrets or local databases.

## Data Behavior

- `DATABASE_URL` may be used only at runtime.
- No database queries or Prisma client creation may happen at module import time.
- Missing `DATABASE_URL` should render the same useful sample/fallback maintenance screens and show non-destructive messages on attempted saves.
- Failed writes should never imply that a task was saved or completed.
- Completion records should be additive only; Phase 1H should not delete or rewrite historical completion records.

## UI Behavior

- Maintenance create/edit forms should be mobile-first and consistent with room and asset persistence forms.
- Task completion should be explicit and non-destructive.
- Copy should avoid implying notifications, automated reminders or recurring schedule generation are active.
- The maintenance detail page may show completion history if available, but should remain clear when using fallback data.

## Review Approach

- Use GitHub PRs for code review.
- Use GitHub Actions for Prisma, lint, typecheck and build evidence.
- Avoid manual Vercel inspection unless diagnosing a deployment issue or doing a deliberate visual checkpoint.
- Keep implementation PRs small enough to review and merge safely.

## Completion Criteria

Phase 1H will be complete when:

- Maintenance task create persists when `DATABASE_URL` is configured and the database is reachable.
- Maintenance task edit persists when `DATABASE_URL` is configured and the task exists in the database.
- A simple completion action creates a maintenance completion record for an existing task.
- Missing or unavailable database states show clear non-destructive messages.
- Maintenance list/detail pages continue rendering useful sample/fallback data when database access is unavailable.
- Vercel builds do not require live database access.
- No delete actions, notifications, recurrence automation, warranty persistence, production auth, uploads, OCR, AI, payments, analytics or native app work is added.

## Client Actions

No immediate client action is required. To use real persistence in Vercel Preview or Production, `DATABASE_URL` must be configured to point at the approved Neon Postgres database.
