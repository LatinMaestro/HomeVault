# Phase 2X: Preview Database Safety Lock

## Status

Complete.

## Goal

Prevent an automatically attached database credential from enabling unauthenticated household access.

## Delivered

- A shared `isPreviewDatabaseEnabled()` gate.
- Defence-in-depth enforcement inside `getDb()`.
- Consistent read fallback and mutation rejection when the gate is closed.
- Form availability based on the shared gate rather than credential presence.
- A database-free smoke run that supplies an unreachable database URL without the enablement switch, proving the app remains useful and does not connect.
- Updated environment and privacy documentation.

## Configuration

Controlled non-sensitive preview database access requires both:

- `DATABASE_URL`
- `HOMEVAULT_PREVIEW_DATABASE_ACCESS=enabled`

Any other state renders curated sample data and disables saving.

## Security Boundary

This switch is not authentication, authorisation or tenant isolation. It must never protect real household data and must be replaced by signed-in, server-authorised home resolution before production release.
