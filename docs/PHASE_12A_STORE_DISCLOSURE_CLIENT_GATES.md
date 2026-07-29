# Phase 12A: Store Disclosure And Client Gates

Status: engineering contract prepared for the expanded optional programme. It does not approve legal copy, providers, pricing, signing or submission.

## Purpose

The pre-expansion privacy matrix, reviewer notes and listing drafts accurately describe the older core candidate but intentionally say that notifications, advanced roles, multi-property, biometrics, capture, offline data, OCR, AI, email ingestion, controlled sharing, diagnostics and commercial entitlements are absent.

Those statements must not be copied into a store package after any of those capabilities ships. This audit binds every disclosure surface to one exact release commit and compares it with the complete capability and provider inventory.

## Required Surfaces

- Public privacy policy.
- Apple App Privacy declaration.
- Google Play Data safety declaration.
- Store listing.
- Reviewer notes.
- Support and incident runbook.

Every retained snapshot identifies the exact candidate ID, candidate revision,
release commit and immutable artifact digest. It must be server-resolved and
expire within 24 hours. Draft text, screenshots or forms from another
candidate do not count.

## Capability Truth

- Record every approved optional capability whether shipped, enabled or disabled.
- An enabled capability must also be shipped.
- Every surface must carry the same shipped/enabled state for every capability.
- Disabled provider-neutral contracts are not presented as available product features.
- Store listings and reviewer notes must not promise unavailable provider-backed behavior.

## Privacy And Permission Truth

Reconcile the exact union of:

- account, household, purchase, file, notification, calendar, device, diagnostic and commercial data classes;
- camera, notification, calendar and biometric platform permissions declared by every shipped capability, even if its runtime service is disabled;
- external processors;
- database, file, device, processor, calendar, token, share and diagnostic deletion scopes.

Data classes, processors and deletion scopes follow enabled runtime paths. Any missing or additional item blocks the package until the source inventory or disclosure is corrected.

## Provider Gate

An enabled processor-backed capability requires:

- an approved provider assigned to that exact capability;
- completed privacy review;
- recorded processing region;
- recorded retention;
- supported lifecycle deletion.

Pending or disabled providers cannot support enabled features. An approved provider cannot remain attached to a disabled capability without an explicit product-state correction.

Provider approval records bind the exact candidate and require versioned,
recorded authority with a positive decision window no longer than 30 days.
Pending or disabled providers cannot carry synthetic approval evidence.

## Client Authority

Engineering alignment can reach `ready-for-client-approval`. It cannot approve:

- legal developer identity;
- final privacy policy;
- retention schedule;
- Apple or Google declarations;
- reviewer package;
- commercial model.

A rejected client gate blocks the package. Approved or rejected decisions must
bind the exact candidate, carry versioned recorded authority and expire within
30 days. Pending gates must carry no synthetic decision identity, timestamp or
authority. Only explicit approval of every gate permits
`ready-for-store-package`; App Review submission remains a separate client
action.

## Release Use

Run this contract after the exact candidate passes full-system acceptance and again after any dependency, SDK, provider, permission, processor, retention, deletion or capability-state change.

The current repository drafts remain historical engineering inputs until they are reconciled against the final signed build. This policy does not itself claim that any optional capability is integrated, provider-enabled, signed or store-ready.
