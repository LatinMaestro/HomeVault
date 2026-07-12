# Phase 1U: Maintenance Service Provider Linking

## Status

Complete, subject to GitHub Actions and merge. Vercel visual review is deferred until client access is available.

## Goal

Allow maintenance tasks to reference an existing household service provider using the current model and seed data, without adding provider-management workflows.

## Delivered

- Added a fallback-safe service provider loader.
- Added the two canonical seeded providers to sample data.
- Added an optional controlled service-provider menu to maintenance create/edit.
- Populated choices from the current database home when available and sample providers otherwise.
- Resolved the selected provider within the temporary current home during guarded saving.
- Persisted the existing MaintenanceTask.serviceProviderId relationship.
- Expanded link-warning messages to cover unmatched assets and providers.
- Added provider names to maintenance list display and search.
- Preserved the existing provider display on task detail.

## Technical Boundaries

- Uses the existing ServiceProvider model, seed records and MaintenanceTask.serviceProviderId.
- Adds no schema, migration, route, provider CRUD, dependency or environment variable.
- No database query runs during build.
- Provider selection remains optional.
- Missing database access remains non-destructive.

## Review Status

GitHub Actions is the merge gate for Prisma validation/generation, lint, typecheck and build. Vercel visual review remains deferred until client access returns.

## Out Of Scope

Provider create/edit/delete, contact actions, external integrations, notifications, production authentication, deletes, uploads/storage, OCR, AI, payments, analytics, native iOS and financial features remain out of scope.
