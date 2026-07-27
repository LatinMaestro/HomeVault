# Phase 5L: Multi-Property Account Lifecycle

Status: staged contract; production multi-property account deletion and recovery integration remain disabled.

## Account Deletion Boundary

- Reconfirm the verified account credential before planning deletion.
- Read every active membership and current property member/owner count in one transaction; never trust client, cached or offline membership summaries.
- A property must have exactly one current OWNER before any account lifecycle operation proceeds.
- For each property where the deleting user is OWNER and other members remain, ownership transfer is mandatory before account deletion.
- Sole-owned properties are deleted with their complete property-scoped data.
- ADULT, CHILD and GUEST memberships are removed without affecting the property.
- The deletion transaction must recheck the complete membership set, ownership counts and concurrent changes immediately before mutation.
- If any property still requires transfer or evidence differs, the whole account deletion fails. Partial deletion is prohibited.

## Complete Cleanup

Deleting the account or a sole-owned property covers:

- relational records, memberships, invitations and identity links;
- private Blob objects and pending uploads;
- device/offline encryption keys, caches and queued mutations;
- notification tokens, scheduled deliveries and deduplication state;
- calendar connections and created event identifiers;
- email-ingestion routes and quarantined items;
- OCR/AI drafts, processor copies and pending jobs;
- guest/public sharing grants and provider integrations.

Recoverable infrastructure backups expire under the approved retention policy; they never restore live access automatically.

## Recovery Boundary

- Recovery restores the immutable HomeVault user identity, not a cached property session.
- After proof succeeds, revoke existing sessions and re-read active memberships from the server.
- One current membership may be selected automatically.
- Multiple current memberships require explicit property selection.
- No memberships starts fresh onboarding; revoked or historical membership never reappears.
- A requested property must match exactly one active current-user membership.
- Recovery cannot transfer ownership, revive an invitation, relink a provider or reverse a completed deletion.
- Offline caches remain locked and are replaced only after the recovered session receives fresh property-scoped keys.

## Verification

Production integration requires migration review, concurrent transfer/deletion tests, processor cleanup evidence, recovery replay and enumeration tests, device-loss/offline tests and exact-head standard/native CI.
