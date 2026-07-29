# Phase 8A: Expanded Private Attachments

Status: hardened policy contract only. The current one-file PDF/JPEG/PNG production lifecycle remains unchanged.

## Authorisation and evidence

- Every upload, reorder, read and deletion repeats an exact verified session, active property membership and current Document revision.
- Roles come only from the current property membership. OWNER and ADULT may mutate; CHILD and GUEST remain read-only.
- Mutation proofs are signed, single-use, unconsumed, valid for at most 15 minutes and bound to the exact user, property, membership revision, Document revision, request and operation.
- Upload, gallery and attachment revisions use compare-and-set. Replayed, stale, substituted, malformed or truthy evidence fails closed.

## Files, galleries and privacy

- A reviewed additive migration may create at most 10 attachments per Document, 4 MB per file and 20 MB total.
- PDF, JPEG, PNG, HEIC and HEIF require matching filename, media type, exact byte length, SHA-256 digest and server-observed container signature.
- HEIC/HEIF containers must have a bounded `ftyp` box and an approved major or compatible brand. Safe decoding and polyglot/corruption checks remain mandatory before publication.
- Duplicate detection is limited to the exact current Document gallery and never reveals another property’s content.
- Originals, quarantine objects and derivatives stay private. Provider URLs and storage keys never enter client state, exports, logs, extensions, widgets or share payloads.

## Quarantine and malware decision

- Expanded uploads begin in quarantine and are neither visible nor downloadable.
- Metadata sanitisation, safe decode and an exact clean result from a separately approved scanner are all mandatory.
- Scan evidence binds the exact provider, attachment/property/Document, attachment revision, storage key, digest and byte size. It is signed, short-lived and single-use.
- Scanner errors or absence never publish. Malicious and expired files enter exact-object cleanup with a retryable ledger.
- Scanner provider, price, region, retention, contract and incident ownership remain client/privacy gates. This contract enables no provider.

## Read, mutation and deletion

- Reads repeat current session, membership and Document evidence and stream only `AVAILABLE` objects through no-store HomeVault routes.
- Reordering requires the exact complete attachment set, order digest and gallery revision.
- Deletion binds the exact attachment and Document revisions and removes originals and every derived object before claiming completion.
- Document, property, account, aborted-upload and quarantine-expiry cleanup also purges encrypted offline copies, invalidates download grants, revokes guest/public shares and cancels OCR, AI and email jobs.
- Failed provider cleanup remains visible in a retryable ledger; exports and deletion must not claim completion early.

## Enablement gates

No schema, migration, scanner, route, processor, permission or production behaviour is enabled here. Integration requires:

- exact-head standard and native CI;
- reviewed migration rehearsal and rollback;
- corrupt, polyglot, signature, decoder, scanner and concurrency tests;
- cross-property denial and private-URL inspection;
- export, retention and deletion verification across database, Blob, devices, processors and shares;
- iOS/Android physical-device import, capture, gallery and accessibility review;
- approved provider/cost/legal decisions and updated privacy/store disclosures.
