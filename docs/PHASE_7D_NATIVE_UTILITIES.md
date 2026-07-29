# Phase 7D: Low-Permission Native Utilities

Status: hardened policy contract; widgets, App Shortcuts and import extensions remain disabled.

## Approved Direction

- Native utilities are opt-in conveniences and never become an authentication or household-authorisation boundary.
- The initial utility set is a redacted count widget, three fixed App Shortcuts and a share/import extension for PDF, JPEG and PNG.
- Utilities request no location, contacts, microphone, broad photo-library, payment, advertising or tracking permission.
- Record titles, household names, addresses, provider details, attachment bytes and private object URLs never enter widget storage, shortcut donations or logs.

## Exact Evidence Boundary

- Every live action binds canonical user, property, membership revision, device and installation identifiers.
- Server session and membership evidence must match those identifiers exactly. Truthy substitutes, malformed identities, expired evidence and cross-property evidence fail closed.
- Widget registration, shortcut invocation and import handoff proofs are single-use, purpose-bound and valid for at most 15 minutes.
- Device evidence must bind the exact installation, an unlocked protected-data state, app attestation, backup exclusion and the platform-correct Keychain or Keystore.
- Native utilities never infer a role from caller input. Write access derives only from the verified property membership.

## Widgets

- A widget may store only allowlisted integer counts for attention items, due maintenance, expiring warranties and reminders.
- Refresh requires live verified session and membership evidence plus a single-use opt-in registration.
- Snapshot ciphertext is bound to user, property, membership revision, device, installation, summary digest and AAD digest.
- The authentication-tag proof must match every snapshot binding exactly. Invalid, duplicate, negative or oversized counts purge the snapshot.
- Snapshot lifetime is capped at 24 hours. Offline reads are visibly stale; known membership revocation or revision change purges immediately.
- Property/account change, opt-out, sign-out, membership removal, account deletion, device loss or reinstall purges widget state.
- Widget navigation opens only an allowlisted HomeVault route, requires app unlock and repeats server authorisation before showing household content.

## App Shortcuts

- The first App Intents release stays narrow: open Maintenance, start Quick Add or start user-initiated document capture.
- Each invocation requires an exact single-use proof, current session, current property membership, unlocked protected data and app attestation.
- Quick Add and capture require OWNER or ADULT membership. CHILD and GUEST may only open the read-only Maintenance destination.
- Shortcut donations contain only generic action labels. No shortcut deletes data, changes identity or roles, creates invitations, publishes shares or contacts/pays providers.

## Share And Import Extension

- The extension accepts only PDF, JPEG and PNG within the 4 MB attachment limit. HEIC/HEIF and galleries remain in the separately reviewed attachment-expansion phase.
- The draft binds the exact user, device, installation, protected local asset, media type, byte size and content digest.
- Transfer evidence must prove the same asset and digest were copied into a complete-data-protection, backup-excluded container, source access was released, the file signature was verified and no upload occurred in the extension.
- The main app must open within 30 minutes, unlock, re-establish live session and property membership, consume a single-use handoff proof and present explicit review before invoking private upload.
- Cross-property, read-only, replayed, expired, malformed, substituted or unsupported imports fail closed.
- Cancellation, expiry, completion, sign-out, account/property change, membership removal, account deletion, device loss and reinstall delete protected temporary files.
- Unknown lifecycle events purge all utility state and revoke registration.

## Verification

Production enablement requires exact-head standard and native CI, generated-project drift checks, widget and extension entitlement review, App Group data-protection inspection, lock-screen redaction tests, shortcut role/replay tests, extension timeout/interruption tests, account/property residue tests, accessibility review, physical-device testing, final privacy-manifest and store-disclosure updates.

This policy update adds no native target, entitlement, permission, provider, schema, migration, route or production enablement.
