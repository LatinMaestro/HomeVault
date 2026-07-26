# Phase 5J: Verified Email Change Lifecycle

Status: staged contract; production email change remains disabled.

## Request Boundary

- The current verified session supplies the immutable user ID and current email.
- The user reconfirms the current password before requesting a change.
- The new address is normalized, validated, different from the current address and checked against current account identities.
- The current email remains authoritative until the complete lifecycle succeeds.
- Starting a new request supersedes every older pending request for that user.

## Dual-proof Lifecycle

- Generate two independent, high-entropy, purpose-bound tokens internally.
- Store token hashes only and compare presented proofs in constant time.
- Send approval to the current verified address and verification to the requested new address.
- Both proofs must belong to the same pending request and user.
- Exact expiry is enforced before recording either proof and again before application.
- Invalid, expired, cancelled, superseded, applied and replayed proofs fail closed.
- Token links never reveal whether an unrelated account or address exists.

## Atomic Application

Immediately before applying the change, the server must re-read:

- the verified current session;
- the unchanged current account email;
- both recorded proofs;
- pending state and expiry;
- uniqueness/availability of the requested address.

One transaction updates the account email as verified, marks the request applied and supersedes sibling requests. Other sessions are revoked while the reconfirmed current session is preserved, matching HomeVault's password-change posture. The old address receives a security notification and recovery/support instructions. No automatic email reversal occurs without verified recovery because a reversible link would create another takeover token.

## Privacy And Operations

- Email messages contain no household names, properties, records or attachments.
- Rate limits apply per account, address, IP risk signal and delivery provider without behavioural profiling.
- Logs retain request identifiers, proof purpose, timestamps and generic outcomes only.
- Account export/deletion includes pending email-change records and their processor copies.
- Store privacy disclosures and the reviewer journey must be updated when production enablement occurs.

Production integration requires migration, delivery, concurrent-request, expiry, replay, session-revocation, recovery and exact-head CI/native evidence.
