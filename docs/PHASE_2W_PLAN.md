# Phase 2W: Privacy And Support Surfaces

## Status

Complete.

## Goal

Make the current preview's privacy boundaries and support guidance easy to find without overstating production readiness.

## Delivered

- Public, static `/privacy` and `/support` routes.
- Persistent privacy and support links in the application shell.
- Clear statements about preview data, metadata-only records and unavailable production controls.
- Database-free smoke coverage for both routes.
- A release sequence separating autonomous engineering from client-controlled store gates.

## Boundaries

This phase does not add production authentication, account deletion, uploads, storage, notifications, analytics, legal terms, a support mailbox, native projects or third-party integrations.

The privacy page is a product transparency surface, not the final legal privacy policy. The support page is preview guidance, not a claim that a staffed public support channel already exists.

## Verification

GitHub Actions validates Prisma, generates the client, runs lint and typecheck, creates a production build, and smoke-tests the application without `DATABASE_URL`.
