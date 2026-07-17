# Phase 3U: Read-only Household Access Summary

## Status

Complete.

## Purpose

Make the existing household membership model visible without implying that production accounts, invitations or role administration are ready.

## Delivered

- Added a fallback-safe server read for members of the temporary current household.
- Added a read-only Household members card to Settings.
- Displayed member name, optional nickname and household role only.
- Added the same privacy-safe member summary to the portable household JSON export.
- Kept canonical sample data useful when controlled preview database access is unavailable.

## Privacy And Security Boundary

- Member email addresses are not selected, rendered or exported.
- No invitation, role-change, removal or other household membership mutation is available.
- No production authentication or authorisation assumption is introduced.
- Existing fail-closed preview database access and temporary current-home resolution remain unchanged.
- Real household sharing still requires signed-in identity and server-side household authorisation.

## Data And Deployment

The feature uses the existing `HouseholdMember`, `User` and `Home` relationships. It adds no schema, migration, dependency, environment variable or build-time database access. Settings remains useful with curated sample data when `DATABASE_URL` is absent or preview access is disabled.

## Review Evidence

GitHub Actions remains the automated gate for Prisma validation/generation, lint, type checking, production build and database-free route smoke coverage. Vercel visual review can follow when deployment usage is available.
