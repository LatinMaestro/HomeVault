# Phase 5G: Property Deletion Policy

Status: staged contract; production deletion is not enabled.

## Authorization Contract

- The property must be explicitly selected through server-controlled membership resolution.
- The complete input, current user, selected property, current time, full active membership set and credential-confirmation evidence are server-resolved. Malformed records, hostile proxies and throwing field access fail closed.
- Identifiers must be canonical and bounded without whitespace, control characters or invisible Unicode format characters.
- Every active membership carries an exact known OWNER/ADULT/CHILD/GUEST role and positive version. Missing, inactive, malformed, duplicate, cross-property, oversized or multi-owner evidence fails closed.
- Only the property's sole OWNER may proceed. Any remaining ADULT, CHILD or GUEST blocks deletion; the owner must transfer ownership or remove members through the reviewed role lifecycle first.
- Credential reconfirmation is a server-issued, single-use record bound to the exact user, property and `delete-property` operation.
- Confirmation identifiers and timestamps must be valid, the confirmation must already be active, and its lifetime cannot exceed ten minutes. Missing, expired or future-dated confirmation requires a new confirmation; substituted or malformed confirmation fails closed.
- An allowed decision binds the exact property, owner membership ID, expected owner-membership version, confirmation ID and frozen cleanup manifest.
- Deleting the user's final property is allowed; the account remains and returns to property onboarding.

## Required Persistence Boundary

An allowed decision binds the complete cleanup manifest. A later implementation must:

1. Re-read and lock the selected property and complete active membership set inside the deletion transaction.
2. Compare-and-set the exact owner membership version and atomically consume the single-use confirmation ID.
3. Re-run the authorization invariant immediately before deletion.
4. Record the private-object and processor cleanup manifest without exposing storage keys to the client.
5. Delete the selected property's database graph atomically.
6. Clear the deleted property from the user's server-controlled selection.
7. Remove or revoke private files, device/offline data, notification tokens and schedules, calendar connections and events, email-ingestion routes and quarantine, sharing grants, OCR/AI processor copies and provider-integration data.
8. Retry compensating cleanup safely and expose only a generic support-safe failure state.
9. Preserve every other property, membership, file, export and integration unchanged.
10. Emit an auditable operational record containing identifiers and outcomes only, never household content, credentials or secrets.

The UI must provide a precise destructive summary and final confirmation. Production enablement requires exact-head unit, lint, typecheck, build, migration, authorization, cleanup and cross-property regression evidence.
