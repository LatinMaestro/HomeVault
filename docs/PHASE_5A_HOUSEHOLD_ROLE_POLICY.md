# Household Role Policy Foundation

## Status

Implementation staged on `agent/household-role-policy-foundation` above the complete App Store delivery plan.

## Purpose

Establish fail-closed, executable role invariants before invitations, member administration or multi-property persistence is exposed.

## Policy

- Only an OWNER can administer another household member.
- Invitations may create ADULT, CHILD or GUEST memberships, never OWNER.
- Generic role changes may move only between ADULT, CHILD and GUEST.
- Ownership cannot be created, removed or downgraded through generic membership actions.
- An OWNER may remove a non-owner.
- A non-owner may leave only when the authenticated actor user ID matches the target membership user ID.
- Self-departure is derived server-side from identities and matching server-resolved actor/target roles; contradictory evidence fails closed and a request-supplied self flag is never trusted.
- A non-owner cannot remove another member.
- Ownership transfer remains a separate, transactional workflow and must preserve at least one owner.

## Scope

This slice adds pure policy helpers and unit contracts only. It does not add:

- invitation persistence or email;
- member-management routes or Server Actions;
- ownership transfer persistence;
- multi-property selection;
- schema or migration changes;
- production configuration or external providers.

## Verification

Run the existing `tests/household-access.test.ts` unit contract plus lint and typecheck when GitHub Actions execution capacity is available. Do not claim this branch is verified until those checks execute on its exact head.
