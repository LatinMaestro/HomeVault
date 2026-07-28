# Phase 5G: Property Deletion Policy

Status: staged contract; production deletion is not enabled.

## Authorization Contract

- The property must be explicitly selected through server-controlled membership resolution.
- The current user, selected property, membership set and credential-confirmation result are server-resolved.
- Identifiers must be canonical, bounded, non-whitespace values; malformed membership containers and invalid roles fail closed.
- Credential reconfirmation must be the exact boolean result `true`; truthy or otherwise malformed values do not authorize deletion.
- Only the property's sole OWNER may proceed.
- A property with another member cannot be deleted. The owner must transfer ownership or remove members through the reviewed role lifecycle first.
- Missing, malformed, duplicate, cross-property, oversized or multi-owner membership evidence fails closed.
- Deleting the user's final property is allowed; the account remains and returns to property onboarding.

## Required Persistence Boundary

An allowed decision binds the complete cleanup manifest. A later implementation must:

1. Re-read and lock the selected property and memberships inside the deletion transaction.
2. Re-run the authorization invariant immediately before deletion.
3. Record the private-object and processor cleanup manifest without exposing storage keys to the client.
4. Delete the selected property's database graph atomically.
5. Clear the deleted property from the user's server-controlled selection.
6. Remove or revoke private files, device/offline data, notification tokens and schedules, calendar connections and events, email-ingestion routes and quarantine, sharing grants, OCR/AI processor copies and provider-integration data.
7. Retry compensating cleanup safely and expose only a generic support-safe failure state.
8. Preserve every other property, membership, file, export and integration unchanged.
9. Emit an auditable operational record containing identifiers and outcomes only, never household content or secrets.

The UI must provide a precise destructive summary and final confirmation. Production enablement requires exact-head unit, lint, typecheck, build, migration, authorization, cleanup and cross-property regression evidence.
