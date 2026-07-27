# Phase 7A: Biometric Native Re-entry

Status: staged policy contract; native biometric plugins and production enrollment remain disabled.

## Approved Direction

- Biometric re-entry is optional convenience after a verified HomeVault sign-in.
- Biometrics only unlock an opaque platform-secure credential binding. They never replace Better Auth, the current server session or server-side property authorization.
- iOS uses Keychain and Secure Enclave where available. Android uses hardware-backed Keystore where available.
- Passwords, raw biometric material and reusable bearer tokens must never be stored in JavaScript storage, logs, backups or application files.
- Standard sign-in remains available after cancellation, lockout, device-state change or provider outage.

## Enrollment Boundary

- Enrollment requires a verified current session and credential reconfirmation.
- A device passcode, available biometrics and an approved platform credential store are mandatory.
- The credential is bound to the immutable HomeVault user, physical device identity and current app installation.
- Platform backup/restore must not copy the credential to another device or installation.
- Account switching cannot reuse another account's enrollment.
- HomeVault stores only non-secret enrollment metadata needed for revocation and device management.

## Re-entry Boundary

- A successful platform biometric result unlocks only the opaque local credential handle.
- HomeVault must refresh or validate the current server session before revealing household content.
- Every subsequent read and write still rechecks current property membership and role on the server.
- Expired or revoked sessions return to standard sign-in. Revoked credentials are destroyed.
- Biometric set changes, passcode removal, reinstall and device-binding mismatches invalidate the local credential.
- Repeated failure and operating-system lockout never bypass the platform fallback policy.

## Locking And Cleanup

- Backgrounding locks the interface and scrubs decrypted in-memory material while preserving the sealed platform credential.
- Sign-out, account switch, account deletion, session revocation, reinstall and confirmed device loss destroy the local credential.
- Device-loss, account-deletion and session-revocation workflows also revoke applicable server sessions.
- Offline caches and queued actions must use separate reviewed encryption keys and must not inherit biometric availability automatically.

## Verification

Production enablement requires approved native modules, entitlement/manifest and permission-string review, Keychain/Keystore accessibility tests, passcode and biometric-set change tests, lockout/fallback tests, remote device/session revocation, account-switch/reinstall cleanup, backup exclusion evidence, physical-device testing, disclosure review and exact-head standard/native CI.
