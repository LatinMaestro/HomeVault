# Phase 1P: Maintenance And Warranty Date Awareness

## Status

Complete, subject to GitHub Actions and merge.

## Goal

Make existing maintenance due dates and warranty expiry dates understandable at a glance without adding reminders, notifications or scheduling automation.

## Delivered

- Added a shared date-only status helper using the Australia/Brisbane calendar date.
- Maintenance records show overdue, due today, due soon, scheduled or missing-date states.
- Warranty records show expired, expires today, expires soon, current or missing-date states.
- Added consistent status badges to the Home dashboard, maintenance list/detail and warranty list/detail.
- Preserved the recorded date beside its derived status.
- Extended the existing dashboard summary shape with raw date inputs for reliable status calculation.

## Technical Boundaries

- Statuses are derived at runtime from existing ISO date metadata.
- No status is persisted and no record is mutated.
- No cron job, reminder delivery, notification service, queue or calendar integration is introduced.
- The calculation uses Brisbane's calendar date rather than the Vercel server region.
- No schema, migration, dependency or environment-variable change is required.

## Out Of Scope

Reminder delivery, notifications, email, calendar integrations, production authentication, deletes, uploads/storage, OCR, AI, payments, subscriptions, analytics, native iOS, advanced sharing, insurance automation and financial features remain out of scope.
