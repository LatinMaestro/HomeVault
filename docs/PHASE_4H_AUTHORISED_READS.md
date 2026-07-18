# Phase 4H: Authorised Household Reads

## Status

Implementation complete pending automated PR validation.

## Delivered

- Migrated the central household read layer to the Phase 4G access object.
- Database clients are selected from the resolved access mode.
- Every database query receives the authorised Home ID from the access object.
- Authenticated reads require a verified session and explicit household membership.
- Controlled preview reads remain isolated to the synthetic preview mode.
- Missing access, database failures and incomplete runtime configuration retain curated sample fallback.
- Added a CI source contract preventing the read layer from returning to the temporary earliest-home or preview-switch bypass.

## Covered Read Surfaces

The central layer supplies:

- household profile and members;
- rooms and asset categories;
- assets and their linked records;
- maintenance tasks, completions, providers and reminders;
- warranties;
- receipt and document metadata;
- dashboard, search, archive, calendar, reports and portable exports composed from these reads.

## Security Property

A database connection does not identify a household. The Home ID used by every query comes from either:

1. a verified session user with an explicit membership; or
2. the controlled synthetic preview access object when production auth is absent.

Authenticated requests never select the earliest Home row and never fall back to preview identity.

## Remaining Integration

Server Action mutations and database-enabled form presentation still use the controlled preview gate. They are migrated to writable household access in the next phase before production identity is enabled.
