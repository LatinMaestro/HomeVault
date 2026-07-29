# Phase 8C: Review-only AI Assistance

Status: hardened provider-neutral policy contract; AI remains disabled.

## Approved Boundary

- AI starts only after an OWNER or ADULT explicitly requests classification, a concise summary or a maintenance suggestion for selected records in one exact property.
- Short-lived, single-use server evidence binds the verified user/session, active membership revision, role, property, capability, target record/revision and canonical source digest. Caller booleans, replay, expiry and substitution fail closed.
- Only bounded user-confirmed text or confirmed OCR fields may enter a request. Provider URLs, credentials, payment details, unconfirmed OCR and model-generated source material are excluded.
- Every source record is untrusted data, never model instruction. The model receives no tools, browsing, storage access, provider messaging, mutation or scheduling capability.
- No model provider is enabled until current client, privacy, legal and cost approvals bind the exact provider/model/version, Australian region, bounded retention, private processing, deletion, no-training, no-human-review and no-logging terms.

## Snapshot And Job Integrity

- The server recomputes a SHA-256 digest from exact property, record type/ID, integer revision and content digest bindings. Caller-provided snapshot digests are never trusted.
- Requests are capped at 20 records and 30,000 reviewed characters.
- Jobs bind request/idempotency, user/session/property/membership revision, capability, target record/revision, canonical sources, policy and exact provider approval/model/version.
- Deduplication applies only to exact active work. Foreign, malformed or stale evidence fails closed.
- Membership loss, device loss, source/target revision change, record/property/account deletion, provider revocation or policy drift invalidates work.

## Review Drafts And Safety

- All output is `REVIEW_REQUIRED`; it never becomes authoritative automatically.
- Classification is limited to the HomeVault document-purpose allowlist. Summaries are bounded. Maintenance suggestions require manufacturer guidance verification.
- Every draft binds its version, output digest, source revisions/digests, target revision, model identity, policy and expiry.
- Safety evidence is short-lived and bound to the exact job and draft-set digest. Prompt injection, hidden instructions, financial/insurance advice, safety-critical claims, provider/payment instructions or behavioural profiling fail closed.
- AI cannot perform budgeting, valuation, financial advice, insurance claim work, payments, advertising, tracking or behavioural analytics.

## Confirmation And Apply

- Apply requires fresh server authorisation and a short-lived, single-use confirmation proof bound to the exact user/session/property/membership, target revision, job, draft/version, output digest and accepted-value digest.
- The server recomputes the accepted-value digest. A bare confirmation flag or changed value cannot authorise persistence.
- Classification and summary updates use atomic compare-and-set against the exact target and draft versions while preserving generated and accepted values plus immutable provenance.
- Maintenance output may only prefill the ordinary review form. It cannot create or schedule work, contact a provider, mark an item urgent/compliant or bypass manufacturer verification.
- CHILD and GUEST remain read-only.

## Export, Retention And Deletion

- Export contains confirmed/generated values and provenance, including model identity, but excludes hidden prompts, raw processor payloads and temporary credentials.
- Draft, record, property and account deletion, membership revocation and device loss cover active jobs, processor access, raw requests/responses, drafts, provenance, processor copies, caches, device/offline copies, queued actions, relational metadata and redacted audit references.
- Only draft deletion may preserve a user-confirmed record value. Broader scopes cannot.
- Processor deletion failures enter a retryable ledger and block a complete-deletion claim until acknowledgement.

## Verification And Enablement Gates

Before enablement, run exact-head focused, standard and native CI; approved-provider sandbox tests using fictional data; prompt-injection and hostile-document fixtures; schema/model drift; stale revisions; output and token bounds; cross-property denial; duplicate races; edit/confirmation accessibility; manufacturer-warning presentation; no-tool/no-network inspection; export and complete deletion; physical-device regression; privacy/subprocessor/store-disclosure review; and explicit client approval. This branch adds no provider, SDK, schema, migration, route, secret or production enablement.
