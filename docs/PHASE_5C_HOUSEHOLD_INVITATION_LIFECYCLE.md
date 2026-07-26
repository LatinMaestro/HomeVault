# Household Invitation Lifecycle Contract

## Status

Implementation staged on `agent/household-invitation-lifecycle` above the secure invitation preparation contract.

## Purpose

Define fail-closed invitation acceptance, expiry and revocation decisions before database persistence, email delivery or public routes are introduced.

## Contract

- Stored invitation states are PENDING, ACCEPTED and REVOKED.
- A pending invitation becomes effectively EXPIRED at its exact server-side deadline.
- Only a verified account whose canonical email matches the invitee may accept.
- Expired, accepted and revoked invitations cannot be accepted again.
- Only an OWNER may revoke an unexpired pending invitation.
- Acceptance records a server-supplied timestamp.
- Token verification remains a separate prerequisite at the route boundary.
- Membership creation and invitation acceptance must later occur in one idempotent database transaction.
- Ownership transfer remains a separate authenticated transaction.

## Scope

This slice adds pure lifecycle decisions and unit contracts. It does not add:

- schema models or migrations;
- invitation persistence or email delivery;
- acceptance, revocation or resend routes;
- membership creation;
- member-management UI;
- production configuration.

## Verification

Run `tests/household-invitation-lifecycle.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim verification before the exact branch head executes.
