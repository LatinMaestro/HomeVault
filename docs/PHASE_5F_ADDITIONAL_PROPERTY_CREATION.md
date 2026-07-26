# Phase 5F: Additional Property Creation Policy

Status: staged contract; persistence and UI are not enabled.

## Scope

This slice defines the fail-closed boundary for creating a second or later HomeVault property. It builds on explicit property selection without changing the database schema or production runtime.

## Contract

- The current user and email-verification state are resolved by the server.
- An unverified or missing identity cannot create a property.
- The request carries a bounded retry identifier so the persistence layer can make retries idempotent.
- The creator cannot nominate another owner. The authenticated current user becomes the new property's OWNER.
- The property name is required and normalized.
- Optional address fields are normalized; state/territory and postcode accept only the current Australian field contract.
- Country remains fixed to Australia for this product boundary.
- Property creation and the creator's OWNER membership must be committed in one database transaction.
- A retry identifier must resolve to the already-created property for the same user, or fail closed; it must never create a duplicate property.
- No rooms, assets, documents, files, reminders, providers or other records are copied from another property.
- The new property becomes available through explicit server-controlled property selection. It must not silently replace the user's current selection.

## Deferred Implementation

A later focused slice must add the reviewed persistence model, migration, server action, selection UI, authorization integration and end-to-end tests. Exact-head CI and Vercel evidence are still required before merge.
