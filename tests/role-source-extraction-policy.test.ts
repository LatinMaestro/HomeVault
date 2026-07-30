import assert from "node:assert/strict";
import test from "node:test";

import {
  ROLE_SOURCE_BASE,
  ROLE_SOURCE_BRANCH,
  ROLE_SOURCE_EXTRACTION_POLICY_VERSION,
  ROLE_SOURCE_FILES,
  ROLE_SOURCE_HEAD,
  ROLE_SOURCE_MANIFEST_DIGEST,
  auditRoleSourceExtraction,
  type PositiveExecutionEvidence,
  type RoleSourceExtractionInput,
} from "../src/lib/role-source-extraction-policy";

const now = new Date("2026-07-30T03:30:00.000Z");
const planHead = "e809b2a4a4a1845efc849455843687ce8686ca4d";
const planMerge = "1111111111111111111111111111111111111111";

function execution(
  overrides: Partial<PositiveExecutionEvidence> = {},
): PositiveExecutionEvidence {
  return {
    runId: "30206507509",
    jobId: "99999999999",
    headCommit: planHead,
    status: "PASSED",
    executable: true,
    executedStepCount: 12,
    serverResolved: true,
    issuedAt: new Date("2026-07-30T03:00:00.000Z"),
    expiresAt: new Date("2026-07-31T03:00:00.000Z"),
    ...overrides,
  };
}

function input(
  overrides: Partial<RoleSourceExtractionInput> = {},
): RoleSourceExtractionInput {
  return {
    currentMainCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
    source: {
      branch: ROLE_SOURCE_BRANCH,
      baseCommit: ROLE_SOURCE_BASE,
      headCommit: ROLE_SOURCE_HEAD,
      manifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
      files: ROLE_SOURCE_FILES,
      serverResolved: true,
      capturedAt: new Date("2026-07-30T03:15:00.000Z"),
    },
    plan: {
      headCommit: planHead,
      exactHeadCi: null,
      sourceDiffReviewed: true,
      reviewThreadsResolved: true,
      merged: false,
      mergeCommit: null,
      mergedAt: null,
      mainContainsMerge: false,
    },
    candidate: null,
    ...overrides,
  };
}

function mergedInput(): RoleSourceExtractionInput {
  const value = input();
  return {
    ...value,
    currentMainCommit: planMerge,
    plan: {
      ...value.plan,
      exactHeadCi: execution(),
      merged: true,
      mergeCommit: planMerge,
      mergedAt: now,
      mainContainsMerge: true,
    },
  };
}

test("locks one immutable role-source snapshot", () => {
  assert.equal(
    ROLE_SOURCE_EXTRACTION_POLICY_VERSION,
    "homevault-role-source-extraction-v1",
  );
  assert.equal(ROLE_SOURCE_FILES.length, 3);
  assert.equal(new Set(ROLE_SOURCE_FILES.map((item) => item.path)).size, 3);
  assert.deepEqual(
    ROLE_SOURCE_FILES.map((item) => item.path),
    [...ROLE_SOURCE_FILES.map((item) => item.path)].sort(),
  );
});

test("records exact server-derived source identity and Git blobs", () => {
  assert.equal(ROLE_SOURCE_BRANCH, "agent/household-role-policy-foundation");
  assert.equal(ROLE_SOURCE_BASE, planHead);
  assert.equal(ROLE_SOURCE_HEAD.length, 40);
  assert.equal(ROLE_SOURCE_MANIFEST_DIGEST.length, 64);
  for (const item of ROLE_SOURCE_FILES) {
    assert.match(item.headBlob, /^[a-f0-9]{40}$/);
    if (item.status === "ADDED") assert.equal(item.baseBlob, null);
    else assert.match(item.baseBlob ?? "", /^[a-f0-9]{40}$/);
  }
});

test("keeps extraction blocked while plan CI has no executable job", () => {
  assert.deepEqual(auditRoleSourceExtraction(input(), now), {
    status: "blocked-baseline-ci",
    sourceSnapshotVerified: true,
    planHeadCommit: planHead,
  });
});

test("rejects zero-step startup failure as positive CI", () => {
  const value = input();
  value.plan.exactHeadCi = execution({
    status: "FAILED",
    executable: false,
    executedStepCount: 0,
  });
  assert.equal(
    auditRoleSourceExtraction(value, now).status,
    "blocked-baseline-ci",
  );
});

test("rejects stale, expired, wrong-head and synthetic CI", () => {
  for (const exactHeadCi of [
    execution({
      issuedAt: new Date("2026-07-28T03:00:00.000Z"),
    }),
    execution({
      expiresAt: new Date("2026-07-30T03:20:00.000Z"),
    }),
    execution({ headCommit: "2".repeat(40) }),
    execution({ serverResolved: false }),
  ]) {
    const value = input();
    value.plan.exactHeadCi = exactHeadCi;
    assert.equal(
      auditRoleSourceExtraction(value, now).status,
      "blocked-baseline-ci",
    );
  }
});

test("fails closed on source branch, base, head or manifest drift", () => {
  for (const source of [
    { ...input().source, branch: "agent/other" },
    { ...input().source, baseCommit: "2".repeat(40) },
    { ...input().source, headCommit: "3".repeat(40) },
    { ...input().source, manifestDigest: "4".repeat(64) },
  ]) {
    const decision = auditRoleSourceExtraction(input({ source }), now);
    assert.deepEqual(decision, {
      status: "blocked",
      reasons: ["role-source:snapshot-drift"],
    });
  }
});

test("fails closed on any source file blob or statistic drift", () => {
  const files = ROLE_SOURCE_FILES.map((item) => ({ ...item }));
  files[1].headBlob = "5".repeat(40);
  assert.deepEqual(
    auditRoleSourceExtraction(input({ source: { ...input().source, files } }), now),
    { status: "blocked", reasons: ["role-source:snapshot-drift"] },
  );
  files[1] = { ...ROLE_SOURCE_FILES[1], additions: 31 };
  assert.deepEqual(
    auditRoleSourceExtraction(input({ source: { ...input().source, files } }), now),
    { status: "blocked", reasons: ["role-source:snapshot-drift"] },
  );
});

test("rejects stale or non-server source observations", () => {
  for (const source of [
    { ...input().source, serverResolved: false },
    {
      ...input().source,
      capturedAt: new Date("2026-07-28T03:15:00.000Z"),
    },
  ]) {
    assert.equal(
      auditRoleSourceExtraction(input({ source }), now).status,
      "blocked",
    );
  }
});

test("requires plan review after real execution", () => {
  const value = input();
  value.plan.exactHeadCi = execution();
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "ready-for-plan-review",
    sourceSnapshotVerified: true,
    planHeadCommit: planHead,
  });
});

test("does not proceed when plan review remains unresolved", () => {
  const value = input();
  value.plan.exactHeadCi = execution();
  value.plan.reviewThreadsResolved = false;
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "blocked",
    reasons: ["delivery-plan:review"],
  });
});

test("binds extraction to the exact post-plan main", () => {
  const value = mergedInput();
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "ready-for-extraction",
    sourceSnapshotVerified: true,
    sourceHeadCommit: ROLE_SOURCE_HEAD,
    sourceManifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
    targetBaseCommit: planMerge,
    changedFiles: ROLE_SOURCE_FILES.map((item) => item.path),
  });
});

test("fails closed on inconsistent plan merge evidence", () => {
  for (const value of [
    { ...mergedInput(), currentMainCommit: "7".repeat(40) },
    {
      ...mergedInput(),
      plan: { ...mergedInput().plan, mainContainsMerge: false },
    },
    {
      ...mergedInput(),
      plan: { ...mergedInput().plan, mergeCommit: null },
    },
  ]) {
    assert.equal(auditRoleSourceExtraction(value, now).status, "unavailable");
  }
});

test("rejects stale target bases and source substitutions", () => {
  const value = mergedInput();
  value.candidate = {
    targetBaseCommit: "8".repeat(40),
    headCommit: "9".repeat(40),
    sourceBranch: "agent/other",
    sourceHeadCommit: "a".repeat(40),
    sourceManifestDigest: "b".repeat(64),
    changedFiles: ["src/lib/other.ts"],
    sourceEquivalenceServerResolved: false,
    sourceDiffReviewed: true,
    authorizationConflictReviewed: true,
    accountLifecycleConflictReviewed: true,
  };
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "blocked",
    reasons: [
      "role-candidate:source-equivalence",
      "role-candidate:target-base",
    ],
  });
});

test("requires exact file set without duplicates or additions", () => {
  const value = mergedInput();
  value.candidate = {
    targetBaseCommit: planMerge,
    headCommit: "9".repeat(40),
    sourceBranch: ROLE_SOURCE_BRANCH,
    sourceHeadCommit: ROLE_SOURCE_HEAD,
    sourceManifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
    changedFiles: [
      ...ROLE_SOURCE_FILES.map((item) => item.path),
      "src/lib/unrelated.ts",
    ],
    sourceEquivalenceServerResolved: true,
    sourceDiffReviewed: true,
    authorizationConflictReviewed: true,
    accountLifecycleConflictReviewed: true,
  };
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "blocked",
    reasons: ["role-candidate:source-equivalence"],
  });
});

test("requires diff and both conflict-domain reviews", () => {
  const value = mergedInput();
  value.candidate = {
    targetBaseCommit: planMerge,
    headCommit: "9".repeat(40),
    sourceBranch: ROLE_SOURCE_BRANCH,
    sourceHeadCommit: ROLE_SOURCE_HEAD,
    sourceManifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
    changedFiles: ROLE_SOURCE_FILES.map((item) => item.path),
    sourceEquivalenceServerResolved: true,
    sourceDiffReviewed: false,
    authorizationConflictReviewed: false,
    accountLifecycleConflictReviewed: false,
  };
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "blocked",
    reasons: [
      "role-candidate:conflict-review",
      "role-candidate:diff-review",
    ],
  });
});

test("hands an equivalent extraction to full exact-head verification", () => {
  const value = mergedInput();
  value.candidate = {
    targetBaseCommit: planMerge,
    headCommit: "9".repeat(40),
    sourceBranch: ROLE_SOURCE_BRANCH,
    sourceHeadCommit: ROLE_SOURCE_HEAD,
    sourceManifestDigest: ROLE_SOURCE_MANIFEST_DIGEST,
    changedFiles: ROLE_SOURCE_FILES.map((item) => item.path),
    sourceEquivalenceServerResolved: true,
    sourceDiffReviewed: true,
    authorizationConflictReviewed: true,
    accountLifecycleConflictReviewed: true,
  };
  assert.deepEqual(auditRoleSourceExtraction(value, now), {
    status: "ready-for-exact-head-verification",
    headCommit: "9".repeat(40),
    requiredChecks: [
      "HOUSEHOLD_ACCESS_UNIT",
      "LINT",
      "TYPECHECK",
      "BUILD",
      "STANDARD_CI",
      "NATIVE_CI",
      "VERCEL",
    ],
  });
});

test("malformed evidence is unavailable rather than throwing", () => {
  for (const value of [
    null,
    {},
    { ...input(), currentMainCommit: "not-a-commit" },
    {
      ...input(),
      source: { ...input().source, files: [{ path: "../unsafe" }] },
    },
    { ...input(), candidate: {} },
  ]) {
    assert.deepEqual(auditRoleSourceExtraction(value, now), {
      status: "unavailable",
    });
  }
});
