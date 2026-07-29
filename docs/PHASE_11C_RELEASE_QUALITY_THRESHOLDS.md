# Phase 11C: Release Quality Thresholds

## Status

Prepared as a fail-closed hosted-evidence contract. It does not claim that a
release candidate has passed and it does not replace signed physical-device
acceptance.

## Purpose

The release-regression manifest requires accessibility, performance, export
and deletion evidence. This phase makes those hosted results measurable and
binds every result to one exact release candidate, executable workflow job and
artifact.

## Exact hosted thresholds

### Accessibility

- At least one release page must be audited.
- Automated critical and serious accessibility violations: `0`.
- Keyboard-blocked journeys and missing visible-focus cases: `0`.
- Touch-target, contrast, enlarged-text and layout-overflow failures: `0`.

These checks cover deterministic browser automation. VoiceOver, TalkBack,
Dynamic Type, physical-device safe areas and store presentation remain in the
separate signed iOS and Android gates.

### Performance

- Minimum samples: `20`.
- Largest Contentful Paint p75: at most `2,500 ms`.
- Interaction to Next Paint p75: at most `200 ms`.
- Cumulative Layout Shift p75: at most `0.1`.
- Authenticated API p95: at most `750 ms`.
- Server error rate: at most `1%`.
- Critical runtime errors: `0`.

These are HomeVault release budgets, not a claim about production traffic
until evidence is collected from the exact candidate.

### Exports

The household JSON, inventory CSV, maintenance CSV and calendar ICS cases must
each appear exactly once. Every case must prove:

- expected and exported record counts are equal;
- no missing, duplicate or wrong-property records;
- no private file references or secrets;
- no unsafe spreadsheet cells;
- the reviewed schema/format and `no-store` response contract.

### Deletion

The deletion proof must cover exactly these domains:

1. database;
2. private files;
3. devices and encrypted offline cache;
4. processors;
5. external calendars;
6. notification tokens;
7. shares;
8. diagnostics;
9. commercial entitlements.

For every domain, expected and deleted object counts must match with no
retained object, failed operation or pending retry. Zero objects are valid only
when the domain is still explicitly enumerated. Household access, recovery
tokens, notification tokens and share tokens must all be invalidated.

## Evidence boundary

Every evidence item must be:

- versioned and server-resolved;
- bound to the candidate ID, candidate revision and exact release commit;
- backed by non-empty workflow, job and artifact identities;
- executable rather than skipped;
- generated with fictional data only;
- current, with a validity window no longer than 24 hours.

Duplicate evidence kinds, malformed runtime values, truthy substitutes,
candidate substitution and stale proofs make the decision unavailable or
blocked. Passing these thresholds only permits the exact evidence to enter the
broader regression and full-system acceptance gates.

## Exclusions

This phase does not enable providers, analytics, OCR, AI, email ingestion,
notifications, billing, signing, TestFlight, public release or App Review. It
does not waive legal, retention, physical-device, reviewer-account or
client-approval gates.
