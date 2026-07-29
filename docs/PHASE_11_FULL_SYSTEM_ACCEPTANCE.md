# Phase 11: Full-system Security and Acceptance

Status: prepared release-acceptance contract; it is not evidence that any candidate has passed.

## Candidate Identity

- Freeze one versioned candidate identity across the release commit, Vercel deployment, app version and Apple build number.
- A server-resolved candidate proof must bind that identity to real exact-head standard CI, native CI, deployment readiness and both durable CI artifact digests.
- Candidate and engineering evidence expires after 24 hours so a later decision cannot silently reuse a stale execution.
- Source inspection, skipped jobs, jobs without steps/logs/artifacts, stale deployments and results from a stacked predecessor do not count as exact-head execution.

## Required Regression Domains

- Cover identity and recovery, household roles and invitations, ownership transfer, multi-property isolation, core records and private files.
- Cover notifications, calendar sync, biometrics, capture, encrypted offline use, native utilities, expanded attachments and malware scanning.
- Cover OCR, AI and email as review-only workflows, controlled sharing, provider handoff and privacy-safe diagnostics.
- Cover export, retention and deletion across database, files, devices, processors, calendars, notification tokens, shares, diagnostics and commercial entitlements.
- Cover security, privacy, accessibility, performance and the store-reviewer package.
- Exercise each domain on its required web, iOS and Android surfaces using fictional QA data only.

## Fail-closed Release Rules

- No open severity 1 or 2 defect can be waived. A resolved defect requires server-resolved proof bound to its exact defect revision and release candidate.
- An open severity 3 or 4 defect requires recorded authority, a concrete reason and a candidate-bound waiver expiring within 30 days.
- Missing, non-executable, cross-head, non-fictional or incomplete-platform evidence blocks engineering acceptance.
- Malformed runtime evidence and truthy substitutes fail closed without throwing; release build numbers and every mutable evidence revision must be positive integers.
- Server-side property authorization, cross-property isolation, private-file delivery, least-privilege providers, secret/log scanning, user-reviewed automation, prohibited-scope absence, accessibility and performance each require fresh server-resolved evidence bound to the candidate.
- Every cleanup scope requires its own fresh candidate-bound evidence; a caller-provided list of scope names is not proof of cleanup.
- The commercial model must have a recorded, candidate-bound client decision. A free release records subscriptions in the exact non-executable, digest-free, run-free, platform-free not-applicable shape; a subscription release requires exact-head StoreKit and entitlement evidence.

## Client-only Gates

- Engineering acceptance can produce `ready-for-client-gates`; it cannot manufacture legal approval, provider/cost approval, Apple enrolment, agreements, signing, physical-device regression, TestFlight acceptance or reviewer credentials.
- `COMPLETE` and `REJECTED` require recorded client authority bound to the exact gate, decision revision and candidate. `PENDING` must not carry synthetic authority.
- A rejected client gate blocks the release. Pending client gates prevent final go/no-go but do not invalidate exact-head engineering evidence.
- App Review submission and public release remain explicit client actions.

## Operational Hardening

- Record runtime warnings separately from outages and assign severity through the normal defect process.
- Resolve or explicitly waive lower-severity findings before go/no-go. Never waive authentication, authorization, privacy, data-loss, secret-exposure or release-integrity defects down to a lower severity.
- Keep the PostgreSQL TLS mode explicit as `verify-full` before the dependency changes its default semantics.

## Required Evidence Package

- Exact-head standard CI and native CI, signed-artifact identity, deployment identity, migration evidence and fresh production health/readiness.
- Full regression matrix with evidence IDs and revisions, workflow/run/job identity, durable artifact digests, issuance/expiry, platform coverage, fictional fixture declaration and server resolution.
- Candidate-bound defect resolutions or lower-severity waivers, accessibility/performance evidence, lifecycle cleanup evidence and provider/privacy disclosures.
- Final reviewer package and client gate checklist, followed by an explicit go/no-go decision.
