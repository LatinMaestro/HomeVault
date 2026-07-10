# Phase 1N: Readable Household Labels

## Status

Complete, subject to GitHub Actions and merge.

## Goal

Keep stored enum values stable while presenting calm, beginner-friendly labels across existing HomeVault list and detail screens.

## Delivered

- Added one shared display-label formatter for asset/task statuses, maintenance frequencies and document types.
- Replaced raw values such as `ACTIVE`, `SIX_MONTHLY` and `SERVICE_RECORD` on existing screens.
- Preserved unknown or user-authored values unchanged.
- Kept form option values and database values unchanged.

## Scope Guardrails

This is a presentation-only usability change. It adds no routes, models, migrations, actions, dependencies, environment variables or integrations. Production authentication, deletes, uploads/storage, OCR, AI, notifications, payments, analytics and native app work remain out of scope.
