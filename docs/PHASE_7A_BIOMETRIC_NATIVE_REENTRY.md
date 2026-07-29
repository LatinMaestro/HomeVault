# Phase 7A: Biometric Native Re-entry

Status: hardened provider-neutral policy contract; native modules, platform enrollment and production re-entry remain disabled.

## Approved Direction

- Biometric re-entry is optional convenience after verified HomeVault sign-in. It never replaces Better Auth, a current server session, server-side property membership or role authorization.
- iOS uses Keychain and Secure Enclave where available. Android uses hardware-backed Keystore where available. A non-hardware Keychain/Keystore fallback is allowed only when the platform reports that hardware backing is unavailable.
- Passwords, raw biometric material, bearer tokens and refresh tokens must never be stored in JavaScript storage, logs, backups, application files or the biometric envelope.
- Standard sign-in remains available after cancellation, failure, operating-system lockout or service outage.

## Enrollment Boundary

- Enrollment requires an exact verified session and single-use `biometric-enrollment` credential reconfirmation valid for no more than 15 minutes.
- Device evidence binds the immutable HomeVault user, device, current app installation, platform, secure store, biometric-set version, passcode state, backup exclusion and app attestation.
- A server-issued enrollment challenge binds the same identity, device, installation, platform and secure store to an attested public-key thumbprint. Authorization expires within 15 minutes and is consumed once.
- Hardware-backed storage is mandatory when the device reports it available. Platform/store mismatches and truthy or malformed evidence fail closed.
- An active enrollment from another user, device or installation is never reused. It requires secure wipe or is treated as already enrolled only when every identity binding matches.
- The allowed persistence plan contains only non-secret enrollment metadata, consumes both proofs and uses an `expectedEnrollmentAbsent` compare-and-set boundary.

## Re-entry Boundary

- The operating system signs a fresh server challenge after a local biometric result. Evidence binds the exact enrollment, user, device, installation, platform, credential handle, public-key thumbprint and biometric-set version.
- Platform evidence expires within 15 minutes and is single-use. Failed or cancelled authentication never unlocks content; repeated failures return to standard sign-in.
- A successful platform assertion must be paired with separate single-use server authorization evidence bound to the same challenge, enrollment, user, device and installation.
- Server evidence must confirm an active accepted session refresh before household content is revealed. Expired or revoked sessions destroy the local credential. Provider outages preserve the sealed credential but require standard sign-in.
- Every subsequent read and write still rechecks the selected property membership and role on the server.
- Passcode removal, biometric-set change, secure-store change, backup-state change, app-attestation failure, account mismatch or reinstall invalidates the local credential.

## Locking And Cleanup

- Backgrounding locks the interface and scrubs decrypted in-memory material while preserving the sealed platform credential.
- Sign-out, account switch, account deletion, session revocation, reinstall and confirmed device loss destroy the local credential, clear offline household data and cancel queued actions.
- Device loss, account deletion and session revocation also revoke applicable server sessions.
- Offline caches and queued actions use separate reviewed encryption keys and never inherit biometric availability automatically.
- Unknown lifecycle events fail closed instead of selecting a default cleanup action.

## Verification And Enablement Gates

Production enablement requires:

- approved native modules and a reviewed bridge that cannot expose secret material to web content;
- iOS Keychain accessibility/access-control and Android Keystore authentication-validity configuration;
- entitlement, manifest, permission-string and backup-exclusion review;
- platform challenge-signing, replay, expiry and device/app attestation tests;
- passcode removal, biometric-set change, failure-cap, lockout and fallback tests;
- account switch, reinstall, remote device loss, session revocation and deletion cleanup;
- physical-device coverage on representative supported iPhone and Android hardware;
- updated privacy/security disclosures and incident/runbook ownership;
- exact-head standard and native CI, signed-artifact inspection and final physical-device acceptance.

No provider, biometric prompt, credential, schema, migration, route or production feature is enabled by this policy branch.
