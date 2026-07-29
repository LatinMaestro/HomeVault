# Phase 12B: Native Release Candidate Evidence

Status: engineering evidence contract prepared. It does not approve Apple
agreements, use signing identities, upload a build, distribute through
TestFlight, perform physical-device QA or submit to App Review.

## Purpose

This gate binds the first signed iOS candidate, TestFlight processing and
physical-device QA to one exact HomeVault release candidate. It prevents a
successful web deployment, a zero-step workflow, an older IPA or a client
decision for another build from being reused as release evidence.

## Prerequisites

Before any native release state advances, retain server-resolved evidence for:

- exact-head standard and native CI runs with real job identities, at least one
  executed step and immutable artifact digests;
- the exact production deployment and readiness result;
- the candidate-bound full-system acceptance artifact;
- the candidate-bound disclosure and client-gate audit artifact.

Prerequisite evidence expires within 24 hours. A startup failure with zero jobs,
steps or artifacts is neither a source pass nor a source failure.

## Client Authority

The Apple account and current agreements, use of the selected signing identity,
and TestFlight upload are separate versioned client gates. Pending gates contain
no synthetic authority or decision metadata. Approved and rejected decisions
bind the exact candidate, are server-recorded and expire within 30 days.

`ready-for-authorized-signing` means that required authority evidence was
validated. It is not itself authority to sign, upload or distribute anything.

## Signing Identity And IPA

Signing evidence records only non-secret identifiers:

- bundle ID `au.com.homevault.app`;
- Apple Team ID and App Store record ID;
- distribution-certificate fingerprint;
- provisioning-profile digest.

Certificates, profiles, private keys and passwords are never stored in this
contract, source, logs or retained artifacts.

The signed IPA proof must bind the exact release commit, version, build number,
bundle ID and Team ID. The workflow must execute real steps. The retained report
confirms inspection of entitlements, privacy manifest, permission strings and
icons; absence of signing secrets from logs; removal of temporary signing
material; and artifact retention of no more than 14 days.

## TestFlight And Physical QA

TestFlight evidence binds the exact IPA digest, release version and build
number. Processing is not acceptance, and rejection blocks the candidate.
Upload authority remains a client-owned gate.

An accepted TestFlight build still requires passing evidence from a physical
iPhone. A separate iPad result is mandatory if the candidate supports tablets.
Each result binds the exact upload and IPA, uses fictional data, records tester
authority, exercises core journeys, privacy controls, permissions, deep links,
offline/background behavior and accessibility, includes negative controls, and
confirms cleanup. Physical evidence expires within 30 days.

## Release Use

Run this policy again after any release commit, deployment, version, build,
signing identity, entitlement, privacy manifest, permission, App Store record,
TestFlight result or device-QA change.

Only `signed-candidate-qa-complete` can feed the later final go/no-go audit. It
still does not authorize App Review submission or public release.
