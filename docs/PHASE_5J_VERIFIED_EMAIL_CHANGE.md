# Phase 5J: Verified Email Change Lifecycle

Status: staged contract; production email change remains disabled.

## Request Boundary

- The current verified session supplies the immutable, canonical user ID and current email.
- Email verification, credential reconfirmation and uniqueness results must be exact server booleans; truthy runtime values fail closed.
- Both addresses are normalized and validated without allowing malformed runtime values to throw.
- The current email remains authoritative until one atomic transaction succeeds.
- Starting a new request supersedes every older pending request for that user.

## Purpose-bound Proofs

- Generate independent high-entropy tokens for old-address approval and new-address verification.
- Store hashes only and compare presented proofs in constant time.
- Token evidence is bound to one token ID, request ID, user ID, target address, approved proof purpose and expiry.
- Unknown proof purposes, consumed tokens, invalid dates, tokens that outlive the request and any mismatched binding fail closed.
- Recorded proof timestamps must precede request expiry; token IDs must be canonical and distinct.
- Invalid, expired, cancelled, superseded, applied and replayed requests remain unavailable without revealing unrelated account state.

## Atomic Application

Immediately before application, the server re-reads the verified current session, unchanged current email, pending request, exact expiry, two coherent proofs and new-address availability.

One transaction:

- updates the immutable user's email and marks it verified;
- marks the request applied and supersedes sibling requests;
- preserves only the reconfirmed current session and revokes all other sessions; and
- schedules a security notification to the old address.

The allow result binds that complete plan. No automatic email reversal occurs without verified account recovery.

## Privacy And Operations

- Messages contain no household names, properties, records or attachments.
- Rate limits apply per account, address, IP risk signal and provider without behavioural profiling.
- Logs retain request IDs, token IDs, proof purpose, timestamps and generic outcomes only.
- Account export/deletion covers pending requests, token hashes, logs and processor copies.
- Store disclosures and reviewer steps update only if production enablement is approved.

Production integration still requires a migration, delivery provider configuration, transactional concurrency tests, session revocation, recovery, exact-head standard/native CI and client approval.
