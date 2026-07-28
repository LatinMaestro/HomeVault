# Phase 12: Submission-Readiness Audit Contract

Status: prepared as a dependency-safe policy slice; not integrated, merged or release-green.

## Purpose

This phase implements the final fail-closed evidence contract from Phase N of the approved delivery programme. It can report that one immutable candidate is ready for the client's final go/no-go only when all engineering, production, signing, TestFlight, physical-device, reviewer and operational evidence identifies that exact candidate.

The contract cannot sign a build, create a TestFlight upload, promote production, change a provider, publish legal copy, store reviewer credentials or submit to App Review.

## Exact Candidate Boundary

One candidate is identified by:

- a 40-character Git release commit;
- an immutable release tag bound to that commit;
- the exact Vercel production deployment;
- semantic app version and positive build number;
- a frozen, clean, main-derived source state.

Evidence from another commit, build, deployment or TestFlight number fails closed.

## Executable CI Boundary

Standard, native iOS and native Android lanes must each:

- run against the release commit;
- execute at least one real step;
- pass;
- identify a concrete run and job;
- retain a SHA-256 artifact digest.

A job that fails before executing, has zero steps, has no artifact, or merely has a successful preview deployment is not CI evidence.

## Production Boundary

The exact candidate deployment must:

- serve the canonical HomeVault origin;
- return HTTP 200 for liveness and fail-closed readiness;
- report production migrations current;
- use explicit PostgreSQL certificate verification (`verify-full`).

Preview builds cannot satisfy this production gate.

## Acceptance And Disclosure Boundary

Executable full-system acceptance and store-disclosure audit artifacts must both pass on the candidate commit. They cover the complete core-plus-optional scope, fictional QA data, platform coverage, security/privacy boundaries, deletion lifecycle and store claims. Policy source or unit tests alone do not satisfy this gate.

## Signed iOS And Physical-Device Boundary

The inspected IPA must match the candidate version, build and commit and use the approved HomeVault bundle ID. The Apple Team ID is recorded without exposing signing material. Entitlements and the Xcode privacy report must be audited. The same build number must be accepted in TestFlight and have retained physical-device evidence.

## Public And Reviewer Boundary

Privacy, support and account-deletion URLs must be public, non-geofenced, HTTP 200 and served by the candidate production deployment.

The reviewer package must contain exact-candidate listing, screenshot and notes digests plus a stable verified synthetic household. Credentials are confirmed only by presence in the private store-console field; credentials never enter source, logs, PRs, artifacts or this contract.

## Operational And Client Boundary

Rollback, incident response, support and complete data deletion each require a named, acknowledged owner.

Legal/public copy, Apple account and agreements, signing identity, TestFlight physical QA, reviewer credentials, store metadata/declarations, commercial model and final submission approval remain explicit client gates.

Outcomes:

- `blocked`: evidence is malformed, incomplete, stale, failed, rejected or has an unresolved severity-one/two defect;
- `ready-for-client-go-no-go`: exact engineering and release-package evidence passes, but one or more client gates remain pending;
- `ready-for-submission`: every exact-candidate check and every client gate, including explicit final submission approval, passes;
- `unavailable`: runtime input is malformed or incomplete.

`ready-for-submission` is an audit result, not permission for automation to submit. App Review submission remains a separate human action after explicit approval.

## Verification Scope

The focused unit suite covers:

- malformed and duplicate evidence;
- zero-step, failed and non-executable CI;
- cross-commit and stale-deployment evidence;
- release freeze and tag identity;
- health, readiness, migrations and database TLS;
- acceptance/disclosure artifact execution;
- signed IPA, privacy, TestFlight and physical-device binding;
- public URL and reviewer-account controls;
- operational ownership and release-blocking defects;
- pending, approved and rejected client gates.

Standard CI, native CI, signed artifacts, TestFlight, production acceptance and client approvals remain outstanding until they execute against the final release candidate.
