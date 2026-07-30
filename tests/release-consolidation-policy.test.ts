import assert from "node:assert/strict";
import test from "node:test";

import {
  CONSOLIDATION_CONFLICT_DOMAINS,
  CONSOLIDATION_SLICES,
  DELIVERY_PLAN_BRANCH,
  RELEASE_CONSOLIDATION_POLICY_VERSION,
  auditReleaseConsolidation,
  type ConsolidationSliceEvidence,
  type ExactHeadExecutionEvidence,
  type ReleaseConsolidationInput,
} from "../src/lib/release-consolidation-policy";

const now = new Date("2026-07-30T01:00:00.000Z");
const issuedAt = new Date("2026-07-30T00:00:00.000Z");
const expiresAt = new Date("2026-07-30T23:00:00.000Z");
const mainBeforePlan = "8ed478b78c24dc37a43320ea272e5db6ccced4fb";
const planHead = "e809b2a4a4a1845efc849455843687ce8686ca4d";
const planMerge = "1111111111111111111111111111111111111111";
const digest = (value: string) => value.repeat(64);

function execution(
  headCommit: string,
  seed = 1,
): ExactHeadExecutionEvidence {
  return {
    runId: `${3000 + seed}`,
    jobId: `${9000 + seed}`,
    headCommit,
    status: "PASSED",
    executable: true,
    executedStepCount: 12,
    artifactDigest: digest(String(seed % 10)),
    issuedAt,
    expiresAt,
    serverResolved: true,
  };
}

const baseline: ReleaseConsolidationInput = {
  currentMainCommit: mainBeforePlan,
  deliveryPlan: {
    branch: DELIVERY_PLAN_BRANCH,
    headCommit: planHead,
    sourceDiffReviewed: true,
    reviewThreadsResolved: true,
    standardCi: null,
    merged: false,
    mergeCommit: null,
    mergedAt: null,
    mainContainsMerge: false,
  },
  slices: [],
};

function mergedPlan(
  slices: readonly ConsolidationSliceEvidence[] = [],
): ReleaseConsolidationInput {
  const currentMainCommit =
    [...slices].reverse().find((item) => item.merged)?.mergeCommit ?? planMerge;
  return {
    currentMainCommit: currentMainCommit as string,
    deliveryPlan: {
      ...baseline.deliveryPlan,
      standardCi: execution(planHead),
      merged: true,
      mergeCommit: planMerge,
      mergedAt: now,
      mainContainsMerge: true,
    },
    slices,
  };
}

function slice(
  index: number,
  baseCommit: string,
  overrides: Partial<ConsolidationSliceEvidence> = {},
): ConsolidationSliceEvidence {
  const definition = CONSOLIDATION_SLICES[index];
  const headCommit = (index + 2).toString(16).padStart(2, "0").repeat(20);
  return {
    sliceId: definition.id,
    branch: definition.branch,
    headCommit,
    rebasedOntoCommit: baseCommit,
    diffDigest: digest(String((index + 2) % 10)),
    sourceDiffReviewed: true,
    reviewThreadsResolved: true,
    reviewedConflictDomains: definition.domains,
    focusedTestsPassed: true,
    strictTypecheckPassed: true,
    vercelDeploymentId: `dpl_Consolidation${index + 1}`,
    vercelHeadCommit: headCommit,
    vercelReady: true,
    standardCi: execution(headCommit, index + 10),
    nativeCi: execution(headCommit, index + 40),
    merged: false,
    mergeCommit: null,
    mergedAt: null,
    mainContainsMerge: false,
    ...overrides,
  };
}

test("publishes a unique, complete and ordered consolidation manifest", () => {
  assert.equal(
    RELEASE_CONSOLIDATION_POLICY_VERSION,
    "homevault-release-consolidation-v1",
  );
  assert.equal(CONSOLIDATION_SLICES.length, 28);
  assert.equal(
    new Set(CONSOLIDATION_SLICES.map((item) => item.id)).size,
    CONSOLIDATION_SLICES.length,
  );
  assert.equal(
    new Set(CONSOLIDATION_SLICES.map((item) => item.branch)).size,
    CONSOLIDATION_SLICES.length,
  );
  for (const item of CONSOLIDATION_SLICES) {
    assert.ok(item.domains.length > 0);
    assert.ok(
      item.domains.every((domain) =>
        CONSOLIDATION_CONFLICT_DOMAINS.includes(domain),
      ),
    );
  }
});

test("keeps the planning PR blocked without executable exact-head CI", () => {
  assert.deepEqual(auditReleaseConsolidation(baseline, now), {
    status: "blocked-baseline-ci",
    branch: DELIVERY_PLAN_BRANCH,
    reason: "EXECUTABLE_EXACT_HEAD_CI_REQUIRED",
  });
});

test("does not accept a zero-step startup failure as baseline CI", () => {
  const input = {
    ...baseline,
    deliveryPlan: {
      ...baseline.deliveryPlan,
      standardCi: {
        ...execution(planHead),
        executable: false,
        executedStepCount: 0,
        status: "FAILED" as const,
      },
    },
  };
  assert.equal(auditReleaseConsolidation(input, now).status, "blocked-baseline-ci");
});

test("returns plan review only after real exact-head execution", () => {
  const decision = auditReleaseConsolidation(
    {
      ...baseline,
      deliveryPlan: {
        ...baseline.deliveryPlan,
        standardCi: execution(planHead),
      },
    },
    now,
  );
  assert.deepEqual(decision, {
    status: "ready-for-plan-review",
    branch: DELIVERY_PLAN_BRANCH,
    headCommit: planHead,
  });
});

test("selects the role-policy slice first after the plan merge", () => {
  const decision = auditReleaseConsolidation(mergedPlan(), now);
  assert.deepEqual(decision, {
    status: "ready-for-rebase",
    sliceId: "HOUSEHOLD_ROLE_POLICY",
    branch: "agent/household-role-policy-foundation",
    expectedBaseCommit: planMerge,
    activationGate: null,
  });
});

test("requires rebase onto the exact current main commit", () => {
  const staleBase = "9999999999999999999999999999999999999999";
  const decision = auditReleaseConsolidation(
    mergedPlan([slice(0, staleBase)]),
    now,
  );
  assert.equal(decision.status, "ready-for-rebase");
  assert.ok(
    decision.status === "ready-for-rebase" &&
      decision.expectedBaseCommit === planMerge,
  );
});

test("requires every conflict domain to be reviewed", () => {
  const evidence = slice(0, planMerge, {
    reviewedConflictDomains: ["AUTHORIZATION"],
  });
  const decision = auditReleaseConsolidation(mergedPlan([evidence]), now);
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("slice:HOUSEHOLD_ROLE_POLICY:conflict-domains"),
  );
});

test("requires focused checks before exact-head CI", () => {
  const evidence = slice(0, planMerge, {
    focusedTestsPassed: false,
    strictTypecheckPassed: false,
  });
  const decision = auditReleaseConsolidation(mergedPlan([evidence]), now);
  assert.equal(decision.status, "ready-for-exact-head-verification");
});

test("requires Vercel to identify the exact head", () => {
  const evidence = slice(0, planMerge, {
    vercelHeadCommit: "8888888888888888888888888888888888888888",
  });
  assert.equal(
    auditReleaseConsolidation(mergedPlan([evidence]), now).status,
    "ready-for-exact-head-verification",
  );
});

test("requires real standard and native jobs on the exact head", () => {
  for (const overrides of [
    { standardCi: null },
    { nativeCi: null },
    {
      standardCi: {
        ...execution(String(2).repeat(40)),
        executedStepCount: 0,
      },
    },
  ]) {
    const evidence = slice(0, planMerge, overrides);
    assert.equal(
      auditReleaseConsolidation(mergedPlan([evidence]), now).status,
      "ready-for-exact-head-verification",
    );
  }
});

test("allows a focused PR only after every exact-head gate passes", () => {
  const evidence = slice(0, planMerge);
  assert.deepEqual(auditReleaseConsolidation(mergedPlan([evidence]), now), {
    status: "ready-for-focused-pr",
    sliceId: "HOUSEHOLD_ROLE_POLICY",
    branch: "agent/household-role-policy-foundation",
    headCommit: evidence.headCommit,
    activationGate: null,
  });
});

test("rejects an out-of-order merged slice", () => {
  const second = slice(1, planMerge, {
    merged: true,
    mergeCommit: "7777777777777777777777777777777777777777",
    mergedAt: now,
    mainContainsMerge: true,
  });
  assert.deepEqual(auditReleaseConsolidation(mergedPlan([second]), now), {
    status: "unavailable",
  });
});

test("advances current main through each verified merge", () => {
  const firstMerge = "6666666666666666666666666666666666666666";
  const first = slice(0, planMerge, {
    merged: true,
    mergeCommit: firstMerge,
    mergedAt: now,
    mainContainsMerge: true,
  });
  const decision = auditReleaseConsolidation(mergedPlan([first]), now);
  assert.deepEqual(decision, {
    status: "ready-for-rebase",
    sliceId: "HOUSEHOLD_INVITATION_CONTRACT",
    branch: "agent/household-invitation-contract",
    expectedBaseCommit: firstMerge,
    activationGate: null,
  });
});

test("rejects a current main that does not contain the last verified merge", () => {
  const input = mergedPlan();
  input.currentMainCommit = "5555555555555555555555555555555555555555";
  const decision = auditReleaseConsolidation(input, now);
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("main:unexpected-head"),
  );
});

test("preserves external activation gates without treating them as merge proof", () => {
  const slices: ConsolidationSliceEvidence[] = [];
  let base = planMerge;
  for (let index = 0; index < 13; index += 1) {
    const mergeCommit = (index + 30).toString(16).padStart(2, "0").repeat(20);
    slices.push(
      slice(index, base, {
        merged: true,
        mergeCommit,
        mergedAt: now,
        mainContainsMerge: true,
      }),
    );
    base = mergeCommit;
  }
  const decision = auditReleaseConsolidation(mergedPlan(slices), now);
  assert.ok(
    decision.status === "ready-for-rebase" &&
      decision.sliceId === "NOTIFICATION_DELIVERY" &&
      decision.activationGate === "PUSH_PROVIDER_AND_APP_ENTITLEMENTS",
  );
});

test("reports completion only after all slices merge in order", () => {
  const slices: ConsolidationSliceEvidence[] = [];
  let base = planMerge;
  for (let index = 0; index < CONSOLIDATION_SLICES.length; index += 1) {
    const mergeCommit = (index + 10).toString(16).padStart(2, "0").repeat(20);
    slices.push(
      slice(index, base, {
        merged: true,
        mergeCommit,
        mergedAt: now,
        mainContainsMerge: true,
      }),
    );
    base = mergeCommit;
  }
  assert.deepEqual(auditReleaseConsolidation(mergedPlan(slices), now), {
    status: "complete",
    mainCommit: base,
    mergedSlices: CONSOLIDATION_SLICES.length,
    activationGatesRemainExternal: true,
  });
});

test("fails closed on malformed or duplicate evidence", () => {
  for (const malformed of [
    null,
    { ...baseline, slices: [null] },
    {
      ...mergedPlan(),
      slices: [slice(0, planMerge), slice(0, planMerge)],
    },
  ]) {
    assert.deepEqual(auditReleaseConsolidation(malformed, now), {
      status: "unavailable",
    });
  }
});

test("contains no force-update, auto-merge or store-submission operation", () => {
  const source = auditReleaseConsolidation.toString();
  for (const prohibited of [
    "forcePush",
    "updateRef",
    "mergePullRequest",
    "submitToAppReview",
    "uploadToTestFlight",
  ]) {
    assert.equal(source.includes(prohibited), false);
  }
});
