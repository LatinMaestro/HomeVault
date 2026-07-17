# Phase 2Q: Household Attention Queue

## Status

Complete, subject to pull request checks and merge.

## Objective

Make overdue and near-term household dates visible together on the home dashboard.

## Delivered

- A unified dashboard data list for active maintenance tasks, pending reminders and warranties.
- Brisbane-calendar status evaluation using the existing date-status rules.
- A compact Needs attention panel for overdue, due-soon and expiring records.
- Direct navigation to the relevant existing task, reminder or warranty detail.
- Database and curated sample fallback behavior through the existing dashboard data layer.

## Guardrails

- Read-only presentation only.
- No notification delivery, scheduling, background jobs or recurrence changes.
- No schema, migration, mutation, dependency, environment variable or external service.
- No auth, storage, upload, OCR, AI, payment, analytics or native app work.

## Review

GitHub Actions provides Prisma validation/generation, lint, typecheck, production build and database-free route smoke evidence.
