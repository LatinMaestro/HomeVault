# Phase 1M: Household Dashboard

## Status

Complete, subject to GitHub Actions and merge.

## Goal

Make the Home screen useful as the first household review surface by summarising existing HomeVault records without adding new data models, mutations or integrations.

## Delivered

- Added a server-side dashboard aggregation around the existing fallback-safe data loaders.
- Shows the next active maintenance task and its due date.
- Shows the next warranty record and its coverage date.
- Shows household asset and room counts with a short inventory preview.
- Shows receipt and document metadata counts.
- Links each summary directly to the relevant existing list or detail route.
- Shows the current data source on the dashboard.
- Preserves useful sample data when the database is missing or unavailable.

## Technical Boundaries

- No database calls occur at module import time.
- The dashboard is dynamically rendered and uses runtime reads only.
- Existing loaders remain responsible for database fallback behavior.
- A mixed or failed data load is described as sample data rather than implying that every value came from the database.
- No schema, migration, Server Action, dependency or environment-variable change was required.

## Out Of Scope

Production authentication, deletes, uploads, storage, OCR, AI, email ingestion, notifications, payments, subscriptions, analytics, native iOS, advanced sharing, insurance automation and financial features remain out of scope.
