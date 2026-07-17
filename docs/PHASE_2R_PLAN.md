# Phase 2R: Store Distribution Foundation

## Status

Complete, subject to pull request checks and merge.

## Objective

Treat Apple App Store and Google Play distribution as a durable product requirement while preserving one shared privacy-first application foundation.

## Delivered

- A branded HomeVault install icon.
- A standards-based web app manifest.
- Standalone display, theme, orientation and application metadata.
- iOS web-app metadata and viewport safe-area support.
- Install metadata and icon coverage in database-free route smoke.
- A documented iOS/Android packaging, policy and client-action path.
- An explicit decision against submitting a low-value remote website wrapper.

## Architecture Direction

The shared Next.js app remains the product/server foundation. A Capacitor native shell is planned only after production auth, authorization, deletion and storage gates are resolved, and it must add meaningful platform utility before store submission.

## Guardrails

- No native project, store account, signing key or paid service yet.
- No device permission, camera, upload, notification, biometric, offline cache or deep-link capability.
- No schema, migration, dependency or environment variable.
- No change to the unauthenticated preview data boundary.

## Review

GitHub Actions provides Prisma validation/generation, lint, typecheck, production build and database-free route/install-asset smoke evidence.
