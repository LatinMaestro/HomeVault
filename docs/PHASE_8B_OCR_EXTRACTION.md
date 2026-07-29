# Phase 8B: User-confirmed OCR Extraction

Status: hardened provider-neutral policy contract; OCR remains disabled.

## Boundary

- OCR begins only after an OWNER or ADULT explicitly requests processing of one exact clean, `AVAILABLE`, private attachment revision.
- Short-lived server evidence binds the verified user, session, active property membership, role, Document revision, attachment revision and source digest. Caller-supplied booleans, stale evidence, replay and substitution fail closed.
- Supported sources are PDF, JPEG, PNG, HEIC and HEIF, with 20-page and 25 MiB bounds. Malware evidence must cover the exact attachment revision.
- The processor receives only bounded server-created access. Blob URLs, storage keys and reusable credentials are never exposed to the client or processor.
- No processor is enabled until client, privacy, legal and cost approval records are current and bind its exact version, Australian region, retention, no-training, no-logging, private-processing and deletion terms.

## Jobs And Deduplication

- Jobs bind the request, idempotency key, user, session, property, Document revision, attachment ID/revision/digest, document kind, policy, processor approval, processor/version and region.
- Deduplication applies only to an exact active job with all of those bindings. Foreign or malformed existing evidence fails closed.
- Processing grants expire within one hour. Membership loss, device loss, source replacement, rescan, quarantine, Document/property/account deletion or policy drift invalidates work.
- Raw processor responses are not retained as household content. Provider access is single-purpose, bounded and revoked after processing.

## Review Drafts And Provenance

- Results are `REVIEW_REQUIRED` drafts, never authoritative values. They cannot silently change a record, schedule maintenance, contact a provider, make a warranty/insurance decision, create a budget/valuation, or trigger any automation.
- Document-kind allowlists bound the fields. Receipt amounts remain archival record fields only and do not enable financial analysis or advice.
- Every field preserves raw and normalized text, confidence, page, normalized non-empty bounding region, language, source attachment ID/revision/digest, processor/version and extraction time.
- Duplicate candidates, unknown fields, invalid confidence, malformed dates or boxes, stale revisions and substituted provenance fail closed.
- Confidence below `0.85` is prominently marked, while every selected field requires the same explicit confirmation regardless of confidence.

## Confirmation And Apply

- Apply requires fresh server authorization plus a short-lived, single-use confirmation proof bound to the exact user/session/property/Document revision, job, draft/version, selected field IDs and accepted values.
- The server recomputes the selection digest. A bare `confirmed` flag, changed value, replayed proof or truthy non-boolean is insufficient.
- Accepted values, source values and immutable field provenance remain separate.
- Apply uses compare-and-set on the exact Document and draft versions, performs one atomic write and consumes the confirmation proof.
- CHILD and GUEST remain read-only and cannot start paid processing or persist output.

## Export, Retention And Deletion

- Export contains accepted values, confidence and field provenance, but excludes raw processor payloads, temporary credentials, storage keys and Blob URLs.
- Attachment, Document, property and account deletion, membership revocation and device loss cover active jobs, temporary access, raw requests/responses, drafts, provenance, processor copies, server caches, device offline copies, queued actions, relational metadata and redacted audit references.
- Attachment-only deletion may preserve an already confirmed record value; broader deletion scopes cannot.
- Processor deletion failures enter a retryable cleanup ledger. HomeVault must not claim complete deletion until the processor acknowledges deletion.

## Verification And Enablement Gates

Before enablement, run exact-head focused, standard and native CI; provider sandbox tests using fictional documents; encrypted/corrupt/polyglot/oversized/page-limit cases; provenance and runtime-shape fuzzing; accessibility and low-confidence review UX; duplicate and replacement races; cross-property denial; processor timeout/deletion; export and full deletion; physical-device capture/import; privacy and subprocessor review; store-disclosure reconciliation; and explicit client approval. This branch adds no provider, schema, migration, route, secret or production enablement.
