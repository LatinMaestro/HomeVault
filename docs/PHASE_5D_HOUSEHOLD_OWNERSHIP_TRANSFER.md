# Household Ownership Transfer Policy

## Status

Implementation staged on `agent/household-ownership-transfer-policy` above the invitation lifecycle contract.

## Purpose

Define ownership handover invariants before exposing member departure, owner deletion or persistent ownership transfer.

## Policy

- Every user ID, household ID, role, active-membership state, owner count and verification state is resolved server-side from current database state.
- Household and user identifiers must be non-empty canonical values without surrounding or embedded whitespace.
- Only the current active and email-verified OWNER may initiate a transfer.
- The household must have exactly one active OWNER before transfer.
- The target must be a distinct active member of the same household.
- The target account must have an exactly verified email state.
- The target must already hold the ADULT role.
- CHILD, GUEST and existing OWNER targets are rejected.
- Role promotion to ADULT remains a separate owner administration action.
- The user must recently confirm the exact acting owner, household and target member. Confirmation IDs and timestamps are server-resolved, expire after at most ten minutes and cannot be substituted across transfers.
- An allowed decision is bound to the exact confirmation, household, previous-owner user ID and next-owner user ID.
- The returned plan includes the expected current roles and both resulting roles so later persistence cannot evaluate one pair and apply another.
- A later persistence implementation must consume the confirmation once and conditionally change the old OWNER to ADULT and the target ADULT to OWNER in one transaction.
- Conditional writes or row locking must reject concurrent, inactive, stale or replayed transfers.
- Account deletion and owner departure remain blocked until the transfer commits.
- Transfer errors presented publicly must not reveal membership in another household.

## Scope

This slice adds pure transfer decisions and unit contracts. It does not add:

- schema models or migrations;
- member administration routes;
- transfer persistence or email;
- owner deletion or departure;
- multi-property selection;
- production configuration.

## Verification

Run `tests/household-ownership-transfer.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim standard/native CI verification before the exact branch head executes.
