# Phase 3W: Maintenance Work Queue Filters

## Status

Complete.

## Purpose

Make the maintenance list practical as a recurring household work queue by helping users focus on task lifecycle, urgency and linked equipment.

## Delivered

- Added combined free-text, task status, due-state and linked-asset filters.
- Reused the existing Australia/Brisbane date-status rules for overdue, near-term, later and missing-date groups.
- Added an explicit No linked asset choice.
- Preserved clear counts, filter-aware empty states and one-action clearing.
- Derived status and asset choices from the already-loaded task records.

## Technical Boundary

Filtering is server-rendered from URL query parameters over the existing fallback-safe task data. It creates no additional database query, persisted preference, search history or analytics event. Recurrence, completion and mutation behavior are unchanged.

## Scope Guardrails

- No schema, migration, dependency or environment variable.
- No notification delivery, background scheduling or new mutation.
- No production authentication, upload, OCR, AI, payment, analytics or external integration.
- No Vercel build-time database access.

## Review Evidence

GitHub Actions is the automated gate for Prisma validation/generation, lint, type checking, production build and database-free route smoke coverage. The Maintenance route remains part of the existing smoke suite.
