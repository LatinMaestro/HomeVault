# Phase 8A: Expanded Private Attachments

Status: prepared policy contract; the current one-attachment PDF/JPEG/PNG lifecycle remains unchanged.

## Approved Direction

- Replace the single attachment columns with a normalized, additive `DocumentAttachment` relationship only through a reviewed migration.
- Allow at most 10 attachments per Document, 4 MB per file and 20 MB total.
- Continue PDF, JPEG and PNG and add HEIC/HEIF only after exact container signature validation, metadata removal, safe decoding/preview handling and physical-device interoperability tests.
- Keep every original, quarantine object and derived preview private. Provider URLs and storage keys never reach the browser, native extension, widget, export or public-share payload.
- OWNER and ADULT may add, reorder and delete. CHILD and GUEST remain read-only.

## Upload And Quarantine

- Re-authorise the verified session, selected property, role and target Document before creating any slot.
- Bind every operation to an idempotency key, exact property/Document, digest, size and media type.
- Validate filename, declared type, server-observed signature and size before private upload.
- Store new objects as `QUARANTINED`; they are not downloadable or visible in the gallery.
- Sanitize image metadata and never retain location/EXIF data not required for display.
- A duplicate digest may reuse only an attachment already authorised in the same Document. Do not disclose or deduplicate against another property.

## Malware Decision

- Expanded mode remains fail-closed until the approved scanning/safe-decoding path is configured.
- Clean, signature-valid and metadata-sanitized objects may become `AVAILABLE`.
- Malicious objects, expired quarantine or files that fail validation are rejected and deleted with their derived previews.
- Scanner errors stay quarantined for bounded retry. Scanner absence never silently publishes.
- Provider selection, cost, region, retention, incident response and data-processing terms remain explicit client/privacy gates; this policy chooses no provider.

## Gallery, Read And Delete

- Gallery positions update atomically and must contain the exact complete attachment set for one Document.
- Authorised reads use HomeVault no-store streaming routes and repeat membership checks; direct Blob URLs remain hidden.
- Individual deletion is idempotent and removes original and derived objects before clearing relational metadata.
- Document, property and account deletion cover originals, previews, quarantine objects, metadata, pending cleanup and authorised-download invalidation.
- Failed provider deletion enters a retryable cleanup ledger and blocks a false complete-deletion claim.

## Export And Migration

- Export enumerates every attachment and its portable metadata, with authenticated private retrieval; it never emits provider URLs.
- Migration must preserve the current attachment as position zero, be retry-safe and leave the existing lifecycle usable until cutover is verified.
- Rollback must not orphan new objects or restore deleted provider URLs into application data.

## Verification

Production enablement requires exact-head unit, standard and native CI; additive migration rehearsal and rollback; PDF/JPEG/PNG/HEIC/HEIF fixtures; corrupt/polyglot/container tests; scanner clean/malicious/error/timeout tests; concurrent upload/reorder/delete tests; cross-property denial; private URL inspection; export and account/property deletion; interrupted cleanup recovery; accessibility and gallery layout; iOS/Android physical-device capture/import/view; processor and store-disclosure updates.
