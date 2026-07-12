# Phase 1T: Maintenance Lifecycle Control

## Status

Complete, subject to GitHub Actions and merge. Vercel visual review is deferred until client access is available.

## Goal

Allow homeowners to manage an existing maintenance task's lifecycle without deleting history or introducing reminder automation.

## Delivered

- Added a controlled task status menu to maintenance create/edit.
- Supports the existing Active, Paused, Completed and Archived Prisma values.
- Defaults new tasks to Active.
- Preserves existing task status during edit.
- Added server-side status validation.
- Persists lifecycle status through the existing guarded maintenance Server Actions.
- Keeps task completion records additive and independent from lifecycle status.

## Technical Boundaries

- Uses the existing MaintenanceStatus enum and MaintenanceTask.status field.
- Adds no schema, migration, route, dependency or environment variable.
- Status changes require the configured runtime database.
- Missing database access remains non-destructive.
- Recording a completion does not automatically change status or calculate a new due date.
- Reminders, recurrence automation and notifications remain out of scope.

## Review Status

GitHub Actions is the merge gate for Prisma validation/generation, lint, typecheck and build. Vercel visual review is deferred until client access returns and will be completed in a later review pass.

## Out Of Scope

Reminder delivery, recurrence automation, notifications, deletes, production authentication, uploads/storage, OCR, AI, payments, subscriptions, analytics, native iOS, advanced sharing and financial features remain out of scope.
