# Household Invitation Contract

## Status

Implementation staged on `agent/household-invitation-contract` above the role-policy foundation.

## Purpose

Define the security-sensitive invitation input and token contract before adding persistence, email delivery or acceptance routes.

## Contract

- Only an OWNER may prepare an invitation.
- Invitations may grant ADULT, CHILD or GUEST, never OWNER.
- Invitee email addresses are trimmed and canonicalised to lowercase.
- Invalid, oversized and self-invite email addresses are rejected.
- Tokens contain 32 bytes of cryptographic randomness.
- Persistence must store only the SHA-256 token hash.
- Raw tokens are returned only to the later delivery boundary.
- Invitations expire seven days after creation.
- Ownership transfer remains a separate authenticated transaction.

## Scope

This slice adds pure server-side preparation helpers and unit contracts. It does not add:

- database models or migrations;
- invitation email delivery;
- acceptance, revocation or resend routes;
- member-management UI;
- production configuration;
- public token logging.

## Verification

Run `tests/household-invitation.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim verification before the exact branch head executes.
