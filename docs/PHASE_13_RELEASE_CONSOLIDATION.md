# Phase 13B: Dependency-Safe Release Consolidation

Status: prepared as a dependency-safe policy slice; not rebased, opened,
merged, activated, signed or submitted.

## Purpose

The optional programme now exists across focused remote branches while GitHub
Actions cannot execute. This manifest fixes the consolidation order before any
rebasing begins. It prevents later policy work from bypassing foundations,
requires an exact review of shared security domains and refuses to treat local
tests or a successful Vercel preview as standard/native CI.

## Baseline Gate

PR #159 remains first. Its unchanged source must receive one executable,
positive-step, exact-head standard CI run and artifact. The diff and all review
threads must then be reviewed before merge.

A zero-job `startup_failure` has no source result. It neither passes nor fails
this gate and must not be worked around with a no-op commit.

## Consolidation Order

After PR #159 merges, each slice is rebased onto the new exact `main` and
processed one at a time:

1. household roles, invitations and ownership transfer;
2. property selection, creation, isolation, export, deletion and account
   lifecycle;
3. verified email change and optional social identity linking;
4. notification preferences/delivery and external calendar connections;
5. biometric re-entry, native capture, encrypted offline access and native
   utilities;
6. expanded attachments, OCR drafts, AI drafts and email ingestion;
7. controlled sharing and provider handoff;
8. privacy-safe diagnostics and the commercial/IAP decision boundary;
9. full-system acceptance, disclosure, native-release and final-audit gates.

The machine-readable manifest contains 28 exact branch names in that order.

## Per-Slice Gate

Every focused slice must prove:

- its branch was rebased onto the current merged `main`;
- the exact diff was reviewed and all review threads resolved;
- every declared conflict domain was reviewed;
- its focused tests and strict TypeScript passed;
- Vercel built the exact branch head;
- standard and native CI each ran a real job with at least one step, passed the
  exact head and retained an immutable artifact digest;
- any merge commit is contained in the new current `main`.

Merged slices must form a contiguous prefix. A later slice cannot be marked
merged while an earlier dependency remains open.

## Conflict Domains

The manifest makes shared review boundaries explicit:

- server authorization and account lifecycle;
- data model and property isolation;
- background delivery and native security;
- private files and external processors;
- store disclosures and final release gates.

This is especially important where separately prepared branches touch the same
identity, file, deletion, provider or release evidence contracts.

## Activation Gates

Merge evidence does not activate providers, native entitlements, paid services
or store products. The manifest retains separate activation gates for:

- transactional invitation/email delivery;
- social identity, notification, calendar, OCR, AI, ingestion, scanning,
  provider, diagnostics and commercial services;
- signed capture, biometric, offline, extension and physical-device QA;
- final Apple, Google, legal, reviewer and submission authority.

Pending gates cannot be represented as implementation or release completion.

## Outcomes

- `blocked-baseline-ci`: PR #159 still lacks executable exact-head CI;
- `ready-for-plan-review`: the planning source has real CI and can be reviewed;
- `ready-for-rebase`: identifies the one next branch and exact base;
- `ready-for-exact-head-verification`: local review is complete but hosted gates
  are not;
- `ready-for-focused-pr`: the one rebased slice is eligible for a focused PR;
- `complete`: all 28 slices merged in order, with activation gates still
  external;
- `blocked` or `unavailable`: evidence is mismatched, incomplete or malformed.

The policy cannot update refs, force-push, merge, sign, upload or submit.

## Current Result

PR #159 remains `blocked-baseline-ci` because run `30206507509` continues to
return `startup_failure` with zero jobs and zero artifacts. The prepared role
policy remains the first consolidation slice after that external blocker
clears.
