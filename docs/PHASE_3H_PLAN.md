# Phase 3H: Archive And Recovery Centre

## Status

Complete.

## Goal

Make inactive household records easy to find and recover before destructive deletion is considered.

## Delivered

- A fallback-safe `/archive` route.
- Retired and disposed asset records.
- Completed and archived maintenance tasks.
- Done and cancelled reminders.
- Readable lifecycle labels.
- Direct links to existing edit workflows for status recovery.
- Unit status contracts and database-free route smoke coverage.
- Settings access and privacy-aware explanatory copy.

## Behaviour

The archive is a derived read-only view over existing lifecycle values. It does not move, duplicate or delete data. Recovery uses the existing guarded edit forms and status controls.

## Scope

No delete action, undo log, schema, migration, dependency, auth service, notification, upload, storage, AI, OCR, financial feature or native project is added.
