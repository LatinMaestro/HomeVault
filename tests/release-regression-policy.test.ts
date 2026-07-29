import assert from "node:assert/strict";
import test from "node:test";

import type { CandidateIdentity } from "../src/lib/full-system-acceptance-policy";
import {
  REGRESSION_CASE_DEFINITIONS,
  decideReleaseRegression,
  type HostedRegressionEvidence,
  type PhysicalRegressionEvidence,
  type RegressionEvidence,
} from "../src/lib/release-regression-policy";

const now = new Date("2026-07-30T00:00:00.000Z");
const startedAt = new Date("2026-07-29T22:00:00.000Z");
const completedAt = new Date("2026-07-29T23:00:00.000Z");
const expiresAt = new Date("2026-07-30T23:00:00.000Z");
const candidate: CandidateIdentity = {
  candidateId: "release-candidate-1",
  revision: 8,
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  deploymentId: "dpl_ReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "101",
};
const hostedEvidence: HostedRegressionEvidence[] =
  REGRESSION_CASE_DEFINITIONS.filter(
    (definition) => definition.kind === "HOSTED_AUTOMATED",
  ).map((definition, index) => ({
    evidenceId: `hosted-evidence-${index}`,
    revision: 1,
    caseId: definition.id,
    kind: "HOSTED_AUTOMATED",
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    workflowRunId: `workflow-${index}`,
    jobId: `job-${index}`,
    artifactDigest: "a".repeat(64),
    platforms: definition.requiredPlatforms,
    startedAt,
    completedAt,
    expiresAt,
    result: "PASSED",
    executable: true,
    fictionalDataOnly: true,
    negativeControlPassed: true,
    cleanupAssertionPassed: true,
    serverResolved: true,
  }));
const input = { candidate, evidence: hostedEvidence, now };

test("separates hosted regression completion from physical-device gates", () => {
  assert.deepEqual(decideReleaseRegression(input), {
    status: "ready-for-physical-device-gates",
    candidate,
    hostedEvidenceComplete: true,
    pendingPhysicalCases: [
      "IOS_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
      "ANDROID_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
    ],
  });
});

test("requires every hosted case exactly once", () => {
  const missing = decideReleaseRegression({
    ...input,
    evidence: hostedEvidence.slice(1),
  });
  assert.ok(
    missing.status === "blocked" &&
      missing.reasons.includes(
        "case:AUTH_VERIFICATION_RECOVERY_SESSIONS:missing",
      ),
  );
  assert.deepEqual(
    decideReleaseRegression({
      ...input,
      evidence: [...hostedEvidence, hostedEvidence[0]],
    }),
    { status: "unavailable" },
  );
});

test("binds hosted evidence to the exact candidate", () => {
  for (const replacement of [
    { candidateId: "substituted" },
    { candidateRevision: candidate.revision + 1 },
    { releaseCommit: "f".repeat(40) },
  ]) {
    assert.equal(
      decideReleaseRegression({
        ...input,
        evidence: replaceHosted(0, replacement),
      }).status,
      "blocked",
    );
  }
});

test("requires real hosted workflow, job and artifact identities", () => {
  const malformed = [
    { workflowRunId: "" },
    { jobId: "" },
    { artifactDigest: "not-a-digest" },
  ];
  for (const replacement of malformed) {
    assert.deepEqual(
      decideReleaseRegression({
        ...input,
        evidence: replaceHosted(0, replacement),
      }),
      { status: "unavailable" },
    );
  }
});

test("rejects skipped, failed and truthy hosted execution claims", () => {
  for (const replacement of [
    { result: "FAILED" as const },
    { executable: false },
    { serverResolved: false },
  ]) {
    assert.equal(
      decideReleaseRegression({
        ...input,
        evidence: replaceHosted(0, replacement),
      }).status,
      "blocked",
    );
  }
  assert.deepEqual(
    decideReleaseRegression({
      ...input,
      evidence: replaceHosted(0, { executable: 1 }) as never,
    }),
    { status: "unavailable" },
  );
});

test("requires fresh completed hosted evidence", () => {
  for (const replacement of [
    { completedAt: new Date("2026-07-30T00:01:00.000Z") },
    { expiresAt: now },
    { startedAt: new Date("2026-07-29T23:01:00.000Z") },
  ]) {
    assert.equal(
      decideReleaseRegression({
        ...input,
        evidence: replaceHosted(0, replacement),
      }).status,
      "blocked",
    );
  }
});

test("requires fictional fixtures and negative controls", () => {
  for (const replacement of [
    { fictionalDataOnly: false },
    { negativeControlPassed: false },
  ]) {
    assert.equal(
      decideReleaseRegression({
        ...input,
        evidence: replaceHosted(0, replacement),
      }).status,
      "blocked",
    );
  }
});

test("requires cleanup assertions for stateful cases", () => {
  assert.equal(
    decideReleaseRegression({
      ...input,
      evidence: replaceHosted(0, { cleanupAssertionPassed: false }),
    }).status,
    "blocked",
  );
  const accessibilityIndex = hostedEvidence.findIndex(
    (item) => item.caseId === "WEB_ACCESSIBILITY_LAYOUT",
  );
  assert.equal(
    decideReleaseRegression({
      ...input,
      evidence: replaceHosted(accessibilityIndex, {
        cleanupAssertionPassed: false,
      }),
    }).status,
    "ready-for-physical-device-gates",
  );
});

test("requires all assigned platforms for cross-platform cases", () => {
  const index = hostedEvidence.findIndex(
    (item) => item.caseId === "PROPERTY_RECORD_FILE_ISOLATION",
  );
  const decision = decideReleaseRegression({
    ...input,
    evidence: replaceHosted(index, { platforms: ["WEB"] }),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes(
        "case:PROPERTY_RECORD_FILE_ISOLATION:platform-coverage",
      ),
  );
});

test("does not allow hosted evidence to impersonate a physical result", () => {
  const forged = {
    ...hostedEvidence[0],
    evidenceId: "forged-physical",
    caseId: "IOS_SIGNED_PHYSICAL_PRIVACY_AND_LINKS" as const,
  };
  const decision = decideReleaseRegression({
    ...input,
    evidence: [...hostedEvidence, forged],
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes(
        "case:IOS_SIGNED_PHYSICAL_PRIVACY_AND_LINKS:execution-kind",
      ),
  );
});

test("accepts physical completion only with signed artifact and authority", () => {
  const physical = physicalEvidence();
  assert.deepEqual(
    decideReleaseRegression({
      ...input,
      evidence: [...hostedEvidence, ...physical],
    }),
    {
      status: "ready-for-full-system-acceptance",
      candidate,
      hostedEvidenceComplete: true,
      physicalEvidenceComplete: true,
    },
  );
});

test("binds physical evidence to exact device candidate and signed artifact", () => {
  const physical = physicalEvidence();
  for (const replacement of [
    { candidateRevision: candidate.revision + 1 },
    { signedArtifactDigest: "b".repeat(63) },
    { deviceModel: "" },
    { testerAuthorityId: "" },
  ]) {
    const next = [{ ...physical[0], ...replacement }, physical[1]];
    const decision = decideReleaseRegression({
      ...input,
      evidence: [...hostedEvidence, ...next] as RegressionEvidence[],
    });
    if (
      replacement.signedArtifactDigest ||
      replacement.deviceModel === "" ||
      replacement.testerAuthorityId === ""
    ) {
      assert.deepEqual(decision, { status: "unavailable" });
    } else {
      assert.equal(decision.status, "blocked");
    }
  }
});

test("rejects fabricated, failed or stale physical authority", () => {
  const physical = physicalEvidence();
  for (const replacement of [
    { authorityRecorded: false },
    { result: "FAILED" as const },
    { expiresAt: now },
    { fictionalDataOnly: false },
    { negativeControlPassed: false },
    { cleanupAssertionPassed: false },
  ]) {
    const decision = decideReleaseRegression({
      ...input,
      evidence: [
        ...hostedEvidence,
        { ...physical[0], ...replacement },
        physical[1],
      ],
    });
    assert.equal(decision.status, "blocked");
  }
});

test("fails closed on malformed top-level runtime values", () => {
  for (const malformed of [
    { ...input, evidence: null },
    { ...input, now: now.toISOString() },
    { ...input, candidate: { ...candidate, buildNumber: "0" } },
    { ...input, evidence: [null] },
  ]) {
    assert.doesNotThrow(() =>
      assert.deepEqual(decideReleaseRegression(malformed as never), {
        status: "unavailable",
      }),
    );
  }
});

test("rejects unsafe release build numbers", () => {
  assert.deepEqual(
    decideReleaseRegression({
      ...input,
      candidate: {
        ...candidate,
        buildNumber: "999999999999999999999999999999",
      },
    }),
    { status: "unavailable" },
  );
});

function replaceHosted(index: number, replacement: object) {
  return hostedEvidence.map((item, itemIndex) =>
    itemIndex === index ? { ...item, ...replacement } : item,
  ) as HostedRegressionEvidence[];
}

function physicalEvidence(): PhysicalRegressionEvidence[] {
  return REGRESSION_CASE_DEFINITIONS.filter(
    (definition) => definition.kind === "PHYSICAL_DEVICE",
  ).map((definition, index) => ({
    evidenceId: `physical-evidence-${index}`,
    revision: 1,
    caseId: definition.id,
    kind: "PHYSICAL_DEVICE",
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    signedArtifactDigest: "b".repeat(64),
    deviceModel: index === 0 ? "iPhone release fixture" : "Android release fixture",
    operatingSystemVersion: index === 0 ? "iOS current" : "Android current",
    testerAuthorityId: `tester-${index}`,
    startedAt,
    completedAt,
    expiresAt: new Date("2026-08-05T23:00:00.000Z"),
    result: "PASSED",
    fictionalDataOnly: true,
    negativeControlPassed: true,
    cleanupAssertionPassed: true,
    authorityRecorded: true,
  }));
}
