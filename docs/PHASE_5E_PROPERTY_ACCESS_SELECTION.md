# Property Access Selection Policy

## Status

Implementation staged on `agent/property-access-selection-policy` above the
household ownership-transfer policy.

## Purpose

Define the fail-closed membership selection boundary required before HomeVault
can expose multiple properties.

## Policy

- Membership candidates are resolved server-side for one canonical immutable
  user ID.
- The complete runtime container and every candidate must be valid; malformed,
  foreign, inactive, duplicate or oversized evidence fails closed without
  throwing or silently dropping rows.
- User, membership, property and requested-property identifiers are bounded
  canonical strings without whitespace.
- Membership roles, active state and positive integer versions are exact
  runtime evidence.
- One valid property may be selected implicitly. Multiple distinct properties
  require an explicit exact property selection.
- A successful result contains immutable scalar evidence bound to the exact
  user, property, membership, role, membership version and selection mode.
- Persistence must compare-and-set the expected membership version, and every
  request must revalidate the signed selection against current server state.
- Reads, mutations, search, files, exports, reminders, notifications and
  deletion must all use the same selected property scope.
- Unknown and cross-property selections produce the same non-revealing
  unavailable response.

## Scope

This slice adds pure property-selection decisions and unit contracts. It does
not add schema, property creation, switching UI, signed selection storage,
routes, migrations or production configuration.

## Verification

The focused suite covers implicit and explicit binding, multi-property
selection, cross-user contamination, duplicate identifiers, malformed and sparse runtime
containers, bounded canonical identifiers, invalid roles, stale/inactive
memberships, invalid versions and bounded candidate sets. Full exact-head
standard/native CI remains required after dependency-ordered extraction.
