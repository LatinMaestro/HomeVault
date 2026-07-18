# Phase 4G: Household Access Boundary

## Status

Implementation complete pending automated PR validation.

## Delivered

- Added a server-only household access resolver.
- Resolves verified Better Auth sessions through immutable User IDs.
- Requires an existing HouseholdMember relationship before returning a Home ID.
- Keeps the synthetic preview resolver available only when production auth is not configured.
- Fails closed when authentication is configured but the request has no verified session or membership.
- Added explicit write and household-administration role rules.
- Added a generic cross-household scope guard that does not reveal record existence.
- Routed the existing current-home helper through the new access boundary.
- Added unit contracts for role and home-scope decisions.

## Access Modes

### Authenticated

When the Better Auth runtime is complete, HomeVault validates the request session and resolves the first household membership for the immutable session user ID. It never falls back to preview access for an unauthenticated request.

### Controlled Preview

When production auth is not configured, the existing synthetic preview remains available only when the explicit preview database switch is enabled. This path is for non-sensitive review data and is not authentication.

### Sample

Without either complete authentication or controlled preview access, pages continue to use curated sample data and mutations remain unavailable.

## Role Rules

- OWNER: household writes and household administration.
- ADULT: household record writes, no household administration.
- CHILD: read-only foundation.
- GUEST: read-only foundation.

Every record operation must still scope its query by the resolved Home ID. UI visibility is not an authorisation control.

## Next Integration

The next phase migrates database reads and Server Actions from preview-only gating to this access object. Until that migration is complete, live production household access remains disabled.
