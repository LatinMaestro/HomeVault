# Phase 13D: Household-role Source Extraction

## Status

Prepared on `agent/full-system-acceptance-policy` while PR #159 remains blocked by a GitHub Actions startup failure. No source branch was rebased, force-pushed, merged or activated.

## Purpose

The household-role branch is the first implementation slice after the complete App Store plan. Later policy hardening changed its source after downstream branches were stacked, so the safe operation is an exact patch extraction rather than a whole-branch rebase.

## Immutable source snapshot

- Branch: `agent/household-role-policy-foundation`
- Source base: `e809b2a4a4a1845efc849455843687ce8686ca4d`
- Source head: `33fb9ccd3d0a8ed57fb41c9c5440ccb0b3084ef5`
- Manifest digest: `1ea530f49c6a4a0ae29f97bc74db4a1af0a77246ac81b9fe719a95290dae2a96`
- Changed files:
  - `docs/PHASE_5A_HOUSEHOLD_ROLE_POLICY.md`
  - `src/lib/household-access.ts`
  - `tests/household-access.test.ts`

The executable policy also fixes the server-resolved base and head Git blobs plus additions/deletions for every file. Source branch drift, missing or additional paths, reordered substitution, stale observations and synthetic lineage claims fail closed.

## Dependency gate

Before extraction:

1. PR #159 must receive a real positive-step exact-head CI execution.
2. Its one-file source diff must be reviewed and all threads resolved.
3. PR #159 must merge, and the merge commit must be the exact current `main`.

The current zero-job `startup_failure` is neither a source pass nor a source failure. It cannot satisfy this gate.

## Extraction gate

After the plan merges:

1. Transplant only the three locked source changes onto the exact new `main`.
2. Re-resolve source branch, head, manifest and file set from GitHub.
3. Prove source equivalence and review both authorization and account-lifecycle conflict domains.
4. Reject any unrelated file, stale target base or source substitution.
5. Run the complete household-access unit suite, lint, strict TypeScript and build.
6. Require positive-step standard CI, Native CI and a READY Vercel deployment on the exact rebased head.
7. Open and merge a focused PR only after its exact diff and review threads are clear.

## Boundaries

This policy records and verifies evidence only. It cannot update refs, force-push, open or merge a pull request, enable providers, change production, sign a native artifact, upload to TestFlight or submit to App Review.
