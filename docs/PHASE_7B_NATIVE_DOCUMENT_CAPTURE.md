# Phase 7B: Native document capture

Status: policy hardened; provider-neutral native implementation remains disabled.

HomeVault may offer camera, document-scanner and file-import entry points only
after a signed-in user deliberately starts capture for the currently selected
property. The server remains authoritative for the user, property, membership,
record and file relationship. Capture does not grant broader household access.

## Security contract

- Initiation evidence is single-use, expires within 15 minutes and binds the
  exact user, property, installation and capture source.
- Session and active membership evidence is checked at start, review and upload.
  Only `OWNER` and `ADULT` memberships may attach documents.
- Camera permission is requested contextually. File import requires no camera,
  photo-library write or broad media permission.
- Temporary bytes remain in protected app storage and are never copied to the
  photo library. Drafts expire within 60 minutes.
- Draft state is versioned and binds the local asset, sanitized-byte digest,
  original-byte digest, file signature, media type, byte size and dimensions.
- The user must review, approve, retake or cancel. Approval evidence is
  single-use, expires within 15 minutes and binds the exact approved draft
  version and sanitized digest.
- Upload repeats server-side session, membership, property, record, storage,
  attachment-slot and file checks. It uses compare-and-set revisions,
  idempotency, signature and digest revalidation.
- Provider objects stay private. Downloads are server-authorised streams and no
  Blob/provider URL is exposed.
- Cancel, retake, expiry, sign-out, account/property lifecycle changes, failed
  uploads and successful commits have explicit cleanup plans. File bytes,
  filenames, provider paths and capture metadata are excluded from logs.

## Initial limits

- Accepted types: PDF, JPEG and PNG.
- Maximum size: 4 MB.
- A capture may fill one attachment slot. Expanded galleries and HEIC/HEIF are
  governed by the later private-attachments phase.
- PDFs must have at least one page and no active or encrypted content.
- Images must have exactly one page plus valid pixel dimensions.
- Location metadata is removed and orientation is normalised before approval.

## Release gates

This contract is not evidence that a native camera implementation is enabled or
release-ready. Enabling it still requires:

1. an approved native module and reviewed iOS/Android permission strings;
2. exact-head repository standard and native CI;
3. signed-build and physical-device permission, interruption, cleanup and upload
   tests using fictional data;
4. privacy/disclosure matrix reconciliation for every permission and processor;
5. production-private storage and deletion verification;
6. explicit client approval for Apple signing, TestFlight and submission.

No provider, permission, schema migration, native entitlement or production
feature is enabled by this phase.
