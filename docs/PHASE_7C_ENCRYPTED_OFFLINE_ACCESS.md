# Phase 7C: Encrypted Bounded Offline Household Access

Status: staged policy contract; household record caching and offline mutations remain disabled.

## Approved Direction

- Offline access is explicit opt-in for one verified user, device, installation and selected property.
- Initial scope is bounded household metadata: home profile, rooms, assets, maintenance, reminders, warranties and record metadata.
- Attachment bytes, authentication secrets, provider tokens, OCR/AI data and public sharing grants remain outside the offline cache.
- Each snapshot is encrypted with an authenticated cipher using a per-installation key wrapped by iOS Keychain or Android Keystore.
- Cache and keys are excluded from platform backup and require a device passcode.
- A snapshot is limited to 25 MB and expires after 72 hours without server refresh.

## Offline Read Boundary

- Cached data is bound to immutable user, property, device and installation identifiers.
- Integrity, supported schema, platform key and expiry are checked before decryption.
- Unknown current membership while disconnected is shown as stale; it never grants server authority.
- Known membership revocation, device loss, account switch, reinstall, key invalidation or expiry destroys the key and purges the cache.
- Remote wipe cannot be guaranteed while a lost device has no network. Platform key protection and short expiry are therefore mandatory, with revocation applied at the next connection.

## Queued Actions And Conflicts

- OWNER and ADULT may queue only create, update and additive maintenance-completion actions.
- Destructive deletion, ownership/role changes, invitations, attachment writes, identity changes and external-provider actions require an online connection.
- Every queued payload is encrypted and bound to a client mutation ID, record, property, device, base server revision and expiry.
- Reconnection requires a live verified session and current writable property membership before replay.
- Exact revision matches may apply idempotently. Safe additive maintenance completion is recomputed on the server.
- All other revision mismatches become explicit user-reviewed conflicts; the client never silently overwrites server data.
- Duplicate client mutation IDs acknowledge the existing server result and remove the queued copy.

## Lifecycle And Deletion

- Account switch, sign-out, account deletion, membership removal, reported device loss, reinstall, key invalidation and expiry purge snapshots and queued actions.
- Property and account export identify offline-enabled devices and pending action counts without exporting encryption keys.
- Account/property deletion revokes device registrations and requires processor/device cleanup evidence.
- Offline status, last refresh, expiry and pending/conflict counts remain visible to the user.

## Verification

Production enablement requires approved native secure-storage and encrypted-database components, cryptographic design review, migration and corruption tests, offline expiry tests, device-loss/revocation tests, account-switch residue tests, queue idempotency and conflict tests, low-storage and interrupted-sync recovery, accessibility, physical-device backup inspection, store-disclosure updates and exact-head standard/native CI.
