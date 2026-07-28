# Phase 8B: User-confirmed OCR Extraction

Status: prepared provider-neutral policy contract; OCR remains disabled.

## Boundary

- OCR starts only after an OWNER or ADULT explicitly requests it for one exact property, Document and clean `AVAILABLE` private attachment.
- Re-authorise the verified user, membership, selected property, role and attachment before queueing, reading a result or applying a draft.
- Support only the approved PDF/JPEG/PNG/HEIC/HEIF attachment pipeline, at most 20 pages per request.
- Never send a Blob URL to the client or processor. Use bounded server-created processor access, then revoke it.
- Do not enable a provider until region, retention, deletion, incident response, subprocessor, cost and no-training terms are approved.

## Jobs And Deduplication

- Bind each job to immutable user, property, Document, attachment ID, attachment digest, document kind, policy version, processor and processor version.
- Deduplicate only an exact active job in that scope. Never reveal or reuse work from another user, property or attachment.
- Jobs expire after 24 hours. Expired, replaced, rescanned, quarantined or deleted attachments fail closed.
- Treat malformed identifiers, digests, document kinds, counters and dates as unavailable; never let invalid runtime values bypass expiry or scope checks.
- Processor timeouts and malformed results become failures; they never create or change household records.

## Drafts And Provenance

- Restrict fields by document kind: receipt, warranty, manual or general document.
- Every extracted field carries confidence, page, optional normalized bounding box, source digest, processor/version and extraction time.
- Reject out-of-range confidence/page/box, stale digests, unexpected fields, duplicate IDs, oversized values and mismatched processor provenance.
- Results are drafts only. Mark confidence below 0.85 for prominent review, but require confirmation for every field regardless of confidence.
- Preserve the original extraction and immutable provenance when a user accepts or edits a value.

## Confirmation

- Applying OCR requires a fresh server authorisation and one explicit confirmation per selected field.
- The accepted value and whether the user edited it are stored separately from the extracted value.
- Apply the selected confirmed fields atomically to the exact Document or linked receipt/warranty record.
- OCR must not silently create records, schedule maintenance, contact a provider, make a warranty/insurance decision, classify content with AI or feed budgeting/valuation features.
- CHILD and GUEST remain read-only and cannot start paid processing or persist OCR output.

## Retention, Export And Deletion

- Export includes accepted values and their field-level provenance, but no processor URL, temporary credential or internal storage key.
- Attachment, Document, property and account deletion cancel active jobs, revoke temporary access and remove drafts, processor copies and relational job metadata.
- Confirmed record values follow the normal owning-record deletion scope. Attachment-only deletion may preserve a previously confirmed value with provenance showing that its source attachment was deleted.
- Processor deletion failures enter a retryable cleanup ledger and block a false complete-deletion claim.

## Verification

Before enablement, run exact-head unit, standard and native CI; provider sandbox tests using fictional documents; corrupt/polyglot/encrypted/oversized/page-limit cases; allowlist and provenance fuzzing; low-confidence and user-edit UX; concurrent duplicate requests; replacement/deletion during processing; cross-property denial; processor timeout/retry/deletion; export and full property/account deletion; accessibility; physical-device capture/import flows; and final privacy/processor/store-disclosure review.
