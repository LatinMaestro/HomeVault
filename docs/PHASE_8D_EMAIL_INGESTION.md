# Phase 8D: Secure Email Ingestion

Status: prepared provider-neutral policy contract; inbound email remains disabled.

## Property Routing

- Give each property one high-entropy forwarding alias that cannot be derived from its name, address, owner or internal ID.
- Store only the route-token hash. Never expose the raw token in exports, logs, PRs, analytics or public URLs.
- Compare the presented route token to the stored hash with a server-side constant-time operation; callers never submit or compare pre-hashed tokens.
- OWNER creation/rotation requires credential reconfirmation and atomically revokes the previous route.
- Resolve property scope only from the exact active recipient route. Never trust sender, subject, body, attachment or provider-supplied household metadata to select a property.

## Provider And Webhook Boundary

- Do not enable an inbound provider until cost, region, retention, deletion, subprocessor, incident response and webhook behavior are approved.
- Require the configured webhook secret, valid signature, unique provider event ID and a timestamp no more than five minutes old.
- Accept only bounded provider/message identifiers and a server-verified canonical content digest. Deduplicate by provider event ID or exact same-property Internet Message ID plus that digest.
- Unknown, revoked or cross-property routes fail closed without revealing that a route or property exists.

## Quarantine

- Every accepted message enters private quarantine for at most seven days. Nothing is automatically saved as a household record.
- Limit raw messages to 25 MB, sanitized body text to 100,000 characters, and attachments to the expanded 10-file/4 MB each/20 MB total policy.
- Accept only PDF, JPEG, PNG, HEIC and HEIF leaf filenames with exact extension/type matching.
- Remove active HTML, scripts, forms, remote images, tracking pixels and external resource loads. Never follow links or execute message content.
- Validate attachment signatures, remove image metadata and require the approved malware decision before review.
- Threats, corrupt files and expired quarantine are rejected and deleted. Scanner errors remain fail-closed for bounded retry.
- Runtime-malformed identities, dates, counters, sender-authentication results, booleans, attachment metadata and overlong quarantine windows fail closed.

## Sender Validation

- Record envelope/header sender and DKIM, DMARC and SPF results.
- A sender is trusted only when explicitly allowlisted with aligned DKIM and DMARC passes.
- Unverified or forwarding-altered messages may reach review with a prominent warning, but can never auto-save.
- Sender authentication does not replace property route secrecy, attachment scanning or user review.

## Review Before Save

- OWNER or ADULT must re-authorise into the exact property, inspect the sanitized message and explicitly confirm the sender, target type, title and each selected clean attachment.
- A save must contain at least one confirmed clean attachment or the confirmed sanitized body; an empty record cannot cross the review boundary.
- The result only opens the ordinary Document/Receipt save boundary. A second explicit final save is required.
- Preserve source provenance and deduplicate retry, but never preserve the route secret or provider URL.
- Do not automatically run OCR or AI, create records/tasks/reminders, contact providers or transcribe full payment credentials. Those capabilities retain their separate user-requested contracts.
- CHILD and GUEST remain read-only.

## Export, Retention And Deletion

- Export accepted record provenance only where useful; exclude routes, webhook data, provider storage keys and rejected/quarantined content.
- Route, property and account deletion revoke affected routes. Deleting one email does not revoke an otherwise valid property route.
- Email, route, property and account deletion remove their scoped raw messages, sanitized bodies, quarantine objects, attachments, review sessions and relational metadata.
- Accepted records follow normal record deletion. Provider deletion failures enter a retryable cleanup ledger and block a false complete-deletion claim.

## Verification

Before enablement, run exact-head unit, standard and native CI; approved-provider sandbox tests with fictional mail; route guessing/rotation; webhook signature/replay; duplicate and concurrent delivery; DKIM/DMARC/SPF and forwarding cases; HTML/script/tracking fixtures; archive/executable/polyglot/corrupt/oversized files; scanner timeout/malicious cases; cross-property denial; review/save retries; payment-credential handling; export and complete property/account deletion; accessibility; privacy/store disclosures; and incident-response rehearsal.
