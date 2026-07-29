# Phase 11D: Release Security And Privacy Thresholds

## Status

Prepared as a fail-closed hosted-evidence contract. It records no real
candidate pass, client authority, signed-device result or production change.

## Purpose

Phase 11D turns HomeVault's security and privacy acceptance boundaries into
measurable, candidate-bound results. It complements the release-regression
manifest and Phase 11C quality thresholds without replacing standard CI,
native CI, physical-device testing, legal review or store declarations.

## Authorization threshold

The hosted suite must execute every negative case at least once:

- signed-out and unverified access;
- missing membership;
- CHILD and GUEST writes;
- cross-household and cross-property reads and writes;
- unknown-record probing;
- non-owner administration;
- replayed or substituted grants.

Every case permits zero unauthorised disclosure, mutation or record-existence
signal. The response must remain non-revealing.

## Private-file threshold

Authorisation-negative download and mutation controls must execute. The
candidate permits zero:

- unauthorised download or mutation;
- direct provider-URL exposure;
- cacheable private response;
- MIME-sniffing failure;
- quarantine bypass;
- orphaned private object after lifecycle cleanup.

## Browser threshold

At least one route must verify each exact control: Content Security Policy,
frame blocking, HSTS, MIME nosniff, strict referrer handling, cross-origin
opener/resource isolation, and denial of camera, microphone, geolocation,
payment and USB browser permissions.

The candidate also permits no unexpected permission prompt, unsafe-eval,
mixed-content finding or indexable private route.

## Supply-chain threshold

The candidate permits zero critical/high known vulnerability, committed
secret, sensitive source-map exposure, unapproved runtime dependency,
lockfile drift, workflow privilege escalation or release-source mismatch. The
dependency inventory must be complete for the exact candidate.

## Outbound privacy threshold

The observed host count must exactly match the reviewed approved-host count.
No unapproved host, household payload to an unapproved host, or private
identifier in a diagnostics payload is permitted. The processor inventory
must be complete.

The trace must explicitly record zero requests for advertising, tracking,
behavioural analytics, automated provider payment, unrestricted public
attachments, unapproved processing, or unconfirmed OCR/AI persistence.

## Evidence boundary

Each evidence kind appears exactly once and binds:

- candidate ID, revision and exact release commit;
- executable workflow and job identities;
- a durable artifact digest;
- server-resolved authority;
- fictional fixtures only;
- a positive evidence window no longer than 24 hours.

Missing, duplicate, malformed, stale, truthy or cross-candidate evidence fails
closed. Passing this policy permits the evidence to enter the broader release
regression gate only.

## Exclusions

This phase enables no provider, SDK, permission, schema, migration, telemetry,
OCR, AI, email ingestion, notification delivery, billing, signing, TestFlight,
public release or App Review action.
