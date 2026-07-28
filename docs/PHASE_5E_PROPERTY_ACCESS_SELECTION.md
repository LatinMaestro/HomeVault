# Property Access Selection Policy

## Status

Implementation staged on `agent/property-access-selection-policy` above the household ownership-transfer policy.

## Purpose

Define the fail-closed membership selection boundary required before HomeVault can expose multiple properties.

## Policy

- Membership candidates are resolved server-side for the current immutable user ID.
- User, membership, property and requested-property identifiers must be non-empty canonical strings without surrounding whitespace.
- Every candidate must belong to the exact current user and use one of the approved household roles.
- A user with one valid property membership may select it implicitly.
- A user with multiple distinct valid property memberships must make an explicit selection.
- HomeVault must never fall back to the first or earliest property when multiple memberships exist.
- A requested property is selected only when exactly one current-user membership matches it.
- Missing, malformed, cross-user, unknown or duplicate membership records fail the complete candidate set closed; corrupt rows are never silently ignored.
- Duplicate membership IDs or multiple memberships for the same user and property fail closed.
- The selected property identifier must be stored in signed, server-controlled state.
- Every request must revalidate the stored selection against current membership.
- Reads, mutations, search, files, exports, reminders, notifications and deletion must all use the same selected property scope.
- Unknown and cross-property selections must produce the same non-revealing unavailable response.

## Scope

This slice adds pure property-selection decisions and unit contracts. It does not add:

- new Home or membership schema;
- property creation or switching UI;
- signed selection storage;
- changes to the current runtime resolver;
- migrations, routes or production configuration.

## Verification

The focused pure-policy suite covers exact selection, explicit multi-property choice, cross-user contamination, duplicate identifiers, duplicate property membership, invalid runtime roles and whitespace/malformed identifiers.

Run `tests/property-access-selection.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim repository verification before the exact branch head executes.
