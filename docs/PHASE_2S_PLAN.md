# Phase 2S: Privacy-safe Offline Shell

## Status

Complete, subject to pull request checks and merge.

## Objective

Give installed mobile users a clear offline state without caching household records on the device.

## Delivered

- A small same-origin service worker.
- A calm safe-area-aware offline screen.
- Network-first navigation with offline fallback.
- Cache-first handling only for versioned application shell assets and the brand icon.
- No-store refresh headers for the service worker script.
- Offline route and worker coverage in database-free smoke checks.

## Privacy Boundary

The worker does not cache household pages, API responses, React Server Component responses, form submissions or mutations. Reconnecting is required to review or change household records.

## Guardrails

- No background sync, push notification, local household-data store or offline mutation queue.
- No dependency, schema, migration, environment variable or external service.
- No native project, auth, upload, OCR, AI, payment or analytics capability.

## Review

GitHub Actions provides Prisma validation/generation, lint, typecheck, production build and database-free route/offline-asset smoke evidence.
