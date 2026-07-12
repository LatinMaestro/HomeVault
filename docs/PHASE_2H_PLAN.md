# Phase 2H: Household Profile Settings

## Status

Complete, subject to pull request checks and merge.

## Objective

Let the current household maintain its name and Australian address metadata without introducing accounts or multi-home behavior.

## Delivered

- Fallback-safe household profile read.
- Guarded household profile Server Action.
- Settings form for name, street, suburb, state and postcode.
- Australian state and four-digit postcode validation.
- Settings privacy/readiness content retained and refreshed.

## Guardrails

- Country remains Australia for the current MVP.
- No production authentication, multi-home switching, members or roles.
- No uploads, OCR, AI, notifications, payments, analytics or deletes.
- No schema migration or build-time database dependency.

## Review

GitHub Actions provides Prisma validation/generation, lint, typecheck and build evidence. Vercel visual review remains deferred.
