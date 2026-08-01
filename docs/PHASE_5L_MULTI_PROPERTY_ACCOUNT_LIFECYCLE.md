# Phase 5L: Multi-Property Account Lifecycle

Status: staged contract; production multi-property account deletion and recovery integration remain disabled.

## Account Deletion Boundary

- Resolve one canonical verified user identity on the server.
- Reconfirm that same user's credential for the exact `account-deletion` purpose using single-use, maximum-15-minute evidence.
- Read every membership and current property member/owner count in one transaction; malformed, duplicate, inactive, foreign, oversized or non-canonical evidence fails closed.
- A property must have exactly one current OWNER before any account lifecycle operation proceeds.
- For each property where the deleting user is OWNER and other members remain, ownership transfer is mandatory before account deletion.
- Sole-owned properties are deleted with their complete property-scoped data.
- ADULT, CHILD and GUEST memberships are removed without affecting the property.
- An allowed result binds the exact user, credential evidence, complete expected membership snapshot and every cleanup scope.
- The deletion transaction must recheck those exact memberships, roles, counts and concurrent changes immediately before mutation.
- If any property still requires transfer or evidence differs, the whole account deletion fails. Partial deletion is prohibited.

## Complete Cleanup

Deleting the account or a sole-owned property covers:

- account identity, credential records and optional social links;
- relational records, memberships and invitations;
- private Blob objects and pending uploads;
- device/offline encryption keys, caches and queued mutations;
- notification tokens, scheduled deliveries and deduplication state;
- calendar connections and created event identifiers;
- email-ingestion routes and quarantined items;
- OCR/AI drafts, processor copies and pending jobs;
- guest/public sharing grants and provider integrations.

Recoverable infrastructure backups expire under the approved retention policy; they never restore live access automatically.

## Recovery Boundary

- Recovery proof binds one canonical immutable HomeVault user and the exact `account-recovery` purpose.
- Proof must be verified, unconsumed, timestamp-valid and valid for no more than 30 minutes.
- After proof succeeds, consume it, revoke existing sessions and re-read all memberships from the server.
- One active current membership may be selected automatically.
- Multiple active current memberships require explicit property selection from the exact current set.
- No active memberships starts fresh onboarding; revoked or historical membership never reappears.
- A requested property must be canonical and match exactly one active current-user membership.
- Recovery cannot transfer ownership, revive an invitation, relink a provider or reverse a completed deletion.
- Offline caches remain locked and fresh property-scoped keys replace old material only after the recovered session is authorised.

## Verification

The focused policy suite covers exact evidence binding, invalid/expired/replayed proof, truthy booleans, malformed runtime membership data, duplicates, invalid roles, cross-user evidence, ownership transfer, cleanup scope, revoked access and explicit selection. Production integration additionally requires migration review, concurrent transfer/deletion tests, processor cleanup evidence, recovery replay and enumeration tests, device-loss/offline tests and exact-head standard/native CI.
