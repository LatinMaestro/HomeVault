# Phase 2Z: Data Boundary Contract

## Status

Complete.

## Goal

Make the temporary fail-closed database architecture an executable pull-request requirement.

## Delivered

- Dependency-free `scripts/check-data-boundary.mjs`.
- A `check:data-boundary` package script.
- A GitHub Actions step before Prisma, lint, typecheck and build.
- Checks for direct runtime credentials, Prisma construction and client-side database imports.
- Verification that the explicit preview enablement contract remains in the shared database module.
- Testing, planning and decision documentation.

## Scope

No runtime capability, dependency, environment variable, schema, migration, authentication service or external project is added.

## Limit

This is structural defence in depth. It does not authenticate users or prove household membership. Production identity work must add request-level authorisation and cross-household denial tests.
