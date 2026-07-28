# Phase 8C: Review-only AI Assistance

Status: prepared provider-neutral policy contract; AI remains disabled.

## Approved Scope

- AI is optional and starts only after an OWNER or ADULT explicitly requests classification, a concise summary or a maintenance suggestion for selected records in one exact property.
- Send only bounded, reviewed text snapshots. Exclude provider URLs, authentication/session data, payment credentials and unconfirmed OCR.
- Treat every selected record and document as untrusted data, never as model instructions.
- Give the model no tools, browsing, storage access, provider messaging, record mutation or scheduling capability.
- Do not enable a provider until region, retention, deletion, subprocessor, incident, cost, no-training and no-human-review terms are approved.

## Snapshot And Job Integrity

- Bind each job to immutable user, property, capability, target record/revision, a server-canonical cryptographic digest of selected record IDs/revisions/content digests, model/version and policy version.
- Limit a request to 20 records and 30,000 reviewed characters.
- Deduplicate only an exact active job in that scope. Never reuse or reveal another user or property's work.
- Jobs and drafts expire after 24 hours. Changed source or target revisions fail closed.
- Prompt injection, hidden/executable instructions, financial/insurance advice, safety-critical claims and provider contact/payment instructions make the result unsafe and unusable.

## Reviewable Drafts

- Classification is restricted to a small HomeVault document-purpose allowlist.
- Summaries are concise and remain visibly labelled as generated drafts.
- Maintenance suggestions include source-linked rationale and require manufacturer guidance verification.
- Every output records model/provider/version, prompt policy, source snapshot digest, source record IDs and generation time.
- Model output never becomes authoritative household data without fresh server authorisation and explicit user confirmation.
- Reject duplicate/missing source IDs, future generation timestamps and capabilities aimed at incompatible record types.
- Treat malformed runtime enums, identifiers, dates, safety assessments and confirmation values as invalid even when compile-time types would normally prevent them.

## Apply Boundary

- Confirmed classification and summary values may update only the exact target revision through an atomic normal record write.
- Keep the generated value and immutable provenance when the user edits before confirmation.
- A maintenance suggestion may only prefill the existing maintenance review form. It cannot create a task, choose a provider, schedule a reminder, send a message or mark work urgent/compliant.
- CHILD and GUEST remain read-only and cannot trigger paid processing or persist generated content.
- AI must not perform budgeting, valuation, financial advice, insurance claim work, payments, advertising, tracking or behavioural profiling.

## Export, Retention And Deletion

- Export user-confirmed values with provenance but no provider URL, temporary credential, hidden prompt or internal model trace.
- Draft, record, property and account deletion cancel jobs, revoke access and remove generated drafts, processor copies and relational job state.
- Confirmed values follow the owning record's normal deletion scope.
- Processor deletion failure enters a retryable cleanup ledger and blocks a false complete-deletion claim.

## Verification

Before enablement, run exact-head unit, standard and native CI; approved-provider sandbox tests with fictional data; cross-property denial; prompt-injection and hostile-document fixtures; model/schema drift; stale revisions; output and token bounds; duplicate/concurrent jobs; user-edit and confirmation UX; manufacturer-warning presentation; no-tool/no-network inspection; export and complete property/account deletion; accessibility; processor/privacy/store-disclosure review; and physical-device regression.
