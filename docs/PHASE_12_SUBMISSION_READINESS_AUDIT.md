# Phase 13: Final Submission-Readiness Audit

Status: prepared as a dependency-safe policy slice; not integrated, merged,
signed or submitted.

## Purpose

This phase implements the final fail-closed audit in the approved delivery
programme. It can report that one immutable candidate is ready for the
client's go/no-go only after fresh, server-resolved evidence proves every
engineering, production, native-release, reviewer and operational gate belongs
to that exact candidate.

The contract cannot sign a build, upload to TestFlight, promote production,
change a provider, publish legal copy, store reviewer credentials or submit to
App Review.

## Exact Candidate Boundary

Every record binds the same:

- candidate ID and positive candidate revision;
- 40-character release commit;
- immutable release tag and exact Vercel deployment;
- semantic app version and positive build number.

Release controls must show a frozen, clean, main-derived source state. Evidence
from another candidate revision, commit, build or deployment fails closed.

## Executable CI And Production Boundary

Standard, native iOS and native Android CI each require an exact-head run and
job, at least one executed step, a passing result and a SHA-256 artifact digest.
A zero-step startup failure, absent artifact or successful preview deployment
is not CI evidence.

The exact production deployment must return HTTP 200 for health and fail-closed
readiness, report current migrations, use PostgreSQL `verify-full`, and resolve
database, authentication, email and private storage readiness.

## Acceptance, Disclosure And Native Boundary

Fresh executable full-system acceptance and store-disclosure artifacts must
pass on the candidate.

The final audit consumes the Phase 12B
`SIGNED_CANDIDATE_QA_COMPLETE` result. It does not recreate Apple authority with
caller-supplied booleans. That result must identify the same candidate,
version, build, signed IPA digest and TestFlight upload, and prove all required
iPhone and, where applicable, iPad physical-device classes completed QA.

## Public, Reviewer And Operational Boundary

Privacy, support and account-deletion URLs must be non-geofenced HTTP 200 pages
served by the candidate deployment.

The reviewer package requires candidate-bound listing, screenshot and notes
digests, a stable verified fictional household, and confirmation that
credentials exist only in App Store Connect. Screenshots must come from the
same signed IPA digest proven by Phase 12B. No credential value enters source,
logs, PRs or artifacts.

Rollback, incident response, support and complete data deletion require fresh,
versioned, server-recorded ownership acknowledgements.

## Client Authority Boundary

Legal/public copy, provider/cost approvals, reviewer credentials, store
metadata/declarations, commercial model and final submission approval remain
explicit client gates. Pending gates contain no synthetic authority. Approved
or rejected gates require a fresh, versioned, server-recorded decision.

Outcomes:

- `blocked`: exact evidence is stale, mismatched, failed, rejected or a
  severity-one/two defect remains;
- `ready-for-client-go-no-go`: engineering and release-package evidence passes,
  but client gates remain pending;
- `ready-for-submission`: every check and client gate, including explicit final
  approval, passes;
- `unavailable`: runtime input is malformed or incomplete.

`ready-for-submission` is an audit result, never permission for automation to
submit. App Review submission remains a separate human action after explicit
approval.

## Verification Scope

The focused suite covers malformed and duplicate evidence, zero-step CI,
cross-candidate substitution, frozen release controls, production providers,
acceptance/disclosure freshness, Phase 12B completion, signed-artifact
screenshot provenance, public URLs, operational owners, client authority and
release-blocking defects.

Standard/native CI, a signed release candidate, TestFlight, physical-device QA,
production acceptance and client approvals remain outstanding until they
execute against the final release candidate.
