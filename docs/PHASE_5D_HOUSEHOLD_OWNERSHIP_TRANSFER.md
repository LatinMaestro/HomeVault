# Household Ownership Transfer Policy

## Status

Implementation staged on `agent/household-ownership-transfer-policy` above the invitation lifecycle contract.

## Purpose

Define ownership handover invariants before exposing member departure, owner deletion or persistent ownership transfer.

## Policy

- Only the current OWNER may initiate a transfer.
- The target must be a distinct member of the same household.
- The target account must have a verified email.
- The target must already hold the ADULT role.
- CHILD, GUEST and existing OWNER targets are rejected.
- Role promotion to ADULT remains a separate owner administration action.
- A later persistence implementation must change the old OWNER to ADULT and the target ADULT to OWNER atomically.
- Conditional writes or row locking must reject concurrent or stale transfers.
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

Run `tests/household-ownership-transfer.test.ts`, the full unit suite, lint, typecheck and build when execution capacity is available. Do not claim verification before the exact branch head executes.
