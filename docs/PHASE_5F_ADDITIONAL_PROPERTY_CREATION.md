# Phase 5F: Additional Property Creation Policy

Status: staged contract; persistence and UI are not enabled.

## Scope

This slice defines the fail-closed boundary for creating a second or later HomeVault property. It builds on explicit property selection without changing the database schema or production runtime.

## Contract

- The complete top-level request and draft must be plain runtime records. Malformed values, hostile proxies and throwing field access fail closed without reaching persistence.
- The current user and email-verification state are resolved by the server.
- User identity must be a canonical non-empty identifier without whitespace, control characters or invisible Unicode format characters, and email verification must be the exact boolean value `true`.
- Malformed runtime draft values return a non-revealing invalid result; they must never throw or reach persistence.
- The request carries a bounded string retry identifier so the persistence layer can make retries idempotent.
- The creator cannot nominate another owner. The allowed plan binds the authenticated user and exact `OWNER` role.
- Successful creation plans and their nested property and owner-membership values are immutable.
- The property name is required, normalized, control/format-character free and bounded to 100 characters.
- Optional address and suburb fields are normalized, control/format-character free and bounded to 200 and 100 characters respectively.
- State/territory and postcode accept only the current Australian field contract.
- Country remains fixed to Australia for this product boundary.
- Property creation and the exact creator OWNER membership must be committed in one database transaction.
- A retry identifier must resolve to the already-created property only when the exact acting user and normalized property payload also match. Reuse with a substituted actor or payload must fail closed; a retry must never create a duplicate property.
- No rooms, assets, documents, files, reminders, providers or other records are copied from another property.
- The new property becomes available through explicit server-controlled property selection. It must not silently replace the user's current selection.

## Deferred Implementation

A later focused slice must add the reviewed persistence model, migration, server action, selection UI, authorization integration and end-to-end tests. Exact-head CI and Vercel evidence are still required before merge.

## Verification

The focused pure-policy suite covers exact creator/OWNER binding, immutable persistence plans, canonical identity, exact verified-email booleans, retry-key type and bounds, hostile top-level and draft values, control/format characters, address bounds, Australian state/postcode validation and empty optional fields.

Run `tests/property-creation-policy.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim repository verification before the exact branch head executes.
