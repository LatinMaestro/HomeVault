# Phase 7C: Encrypted bounded offline household access

Status: policy hardened; household caching and offline mutations remain disabled.

## Approved boundary

- Offline access is explicit opt-in for one verified user, active property
  membership, device and installation.
- Cached scope is allowlisted household metadata only: home profile, rooms,
  assets, maintenance, reminders, warranties and record metadata.
- Attachment bytes, credentials, provider tokens, OCR/AI material, sharing
  grants and identity/role administration are never cached.
- A snapshot is limited to 25 MB and expires no later than 72 hours after its
  server-issued time. Clients cannot extend that authority while offline.

## Encryption and device binding

- Every snapshot uses AES-256-GCM with authenticated additional data.
- The per-installation key is held by iOS Keychain or Android Keystore, requires
  a device passcode, is excluded from backup and is bound to app attestation.
- Enrollment consumes short-lived, single-use credential evidence and binds the
  exact session, user, property, membership revision, device, installation,
  platform, key identifier/version and selected record types.
- Before decryption, runtime-safe policy checks bind the snapshot version,
  ciphertext digest, AAD digest, authentication tag and platform-key version.
- Invalid data, tag failure, identity/account switching, installation/key
  changes, known revocation, device loss or expiry destroys the key and purges
  cached state.
- Unknown membership while disconnected is visibly stale and never supplies
  server authority. Remote wipe cannot be guaranteed until the device reconnects.

## Queued actions and conflicts

- The role and membership revision used for queue admission come from the
  authenticated snapshot, not caller input.
- Only bounded create, update and additive maintenance-completion actions may be
  queued. Destruction, identity, role, invitation, attachment and provider work
  remains online-only.
- Each queued action is versioned, encrypted and bound to the snapshot, exact
  membership, user, property, device, installation, record type/ID, base server
  revision, payload/AAD digests, client mutation ID and expiry.
- Reconnection repeats verified-session, active write-membership, property,
  record, integrity and idempotency checks.
- Exact revision matches may apply. Maintenance completion on a changed record
  requires exact server evidence that it can be recomputed and is not already
  present. Every other mismatch becomes user-reviewed conflict state.
- A server result is durably recorded before removing its queued copy.

## Lifecycle

- Sign-out, account/property switching, deletion, membership revocation, device
  loss, reinstall, key invalidation and expiry have explicit purge plans.
- Device registrations are revoked for account deletion, membership revocation
  and reported loss.
- Offline-enabled devices and pending/conflict counts belong in export and
  deletion evidence, but encryption keys and encrypted payloads do not.
- Logs exclude household content, keys, ciphertext, digests and queued payloads.

## Release gates

This contract does not enable offline household data. Release requires approved
native secure-storage and encrypted-database components, cryptographic review,
schema/corruption migration tests, low-storage/interrupted-sync tests,
device-loss and backup inspection, account-residue tests, queue idempotency and
conflict tests, accessibility, current disclosures, exact-head standard/native
CI and signed physical-device acceptance.

No native component, database, migration, permission, provider or production
feature is enabled by this phase.
