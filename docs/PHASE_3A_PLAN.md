# Phase 3A: Preview Lock Unit Contracts

## Status

Complete.

## Goal

Prove the controlled-preview database switch behaves fail-closed for realistic deployment configuration combinations.

## Delivered

- A Node test for `isPreviewDatabaseEnabled()`.
- Coverage for missing, partial, lookalike and fully enabled configuration.
- A `test:unit` package script using the existing `tsx` development tool.
- A GitHub Actions unit-contract step after Prisma generation.
- Updated testing, planning and decision records.

## Scope

The test uses an unreachable example URL and does not connect to a database. No dependency, secret, schema, runtime feature or external service is added.
