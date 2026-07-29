import assert from "node:assert/strict";
import test from "node:test";

import type { CandidateIdentity } from "../src/lib/full-system-acceptance-policy";
import {
  REQUIRED_DELETION_SCOPES,
  REQUIRED_EXPORT_CASES,
  decideReleaseQualityThresholds,
  type AccessibilityThresholdEvidence,
  type DeletionThresholdEvidence,
  type ExportThresholdEvidence,
  type PerformanceThresholdEvidence,
  type QualityThresholdEvidence,
} from "../src/lib/release-quality-threshold-policy";

const now = new Date("2026-07-30T01:00:00.000Z");
const issuedAt = new Date("2026-07-30T00:00:00.000Z");
const expiresAt = new Date("2026-07-30T23:00:00.000Z");
const candidate: CandidateIdentity = {
  candidateId: "release-candidate-1",
  revision: 9,
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  deploymentId: "dpl_ReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "102",
};
const binding = {
  evidenceId: "quality-evidence",
  revision: 1,
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  workflowRunId: "workflow-1",
  jobId: "job-1",
  artifactDigest: "a".repeat(64),
  issuedAt,
  expiresAt,
  executable: true,
  fictionalDataOnly: true,
  serverResolved: true,
};
const accessibility: AccessibilityThresholdEvidence = {
  ...binding,
  evidenceId: "accessibility",
  kind: "ACCESSIBILITY",
  auditedPageCount: 24,
  automatedCriticalViolations: 0,
  automatedSeriousViolations: 0,
  keyboardBlockedJourneys: 0,
  missingVisibleFocusCases: 0,
  touchTargetFailures: 0,
  contrastFailures: 0,
  layoutOverflowFailures: 0,
  textScaleFailures: 0,
};
const performance: PerformanceThresholdEvidence = {
  ...binding,
  evidenceId: "performance",
  kind: "PERFORMANCE",
  sampleSize: 20,
  lcpP75Ms: 2_500,
  inpP75Ms: 200,
  clsP75: 0.1,
  apiP95Ms: 750,
  serverErrorRatePercent: 1,
  criticalRuntimeErrors: 0,
};
const exportEvidence: ExportThresholdEvidence = {
  ...binding,
  evidenceId: "export",
  kind: "EXPORT",
  cases: REQUIRED_EXPORT_CASES.map((caseId) => ({
    caseId,
    rowsExpected: 4,
    rowsExported: 4,
    missingRows: 0,
    duplicateRows: 0,
    wrongPropertyRows: 0,
    privateFileReferences: 0,
    secretFindings: 0,
    unsafeSpreadsheetCells: 0,
    noStoreVerified: true,
    schemaVerified: true,
  })),
};
const deletion: DeletionThresholdEvidence = {
  ...binding,
  evidenceId: "deletion",
  kind: "DELETION",
  requestId: "deletion-request-1",
  userId: "user-1",
  propertyId: "property-1",
  scopes: REQUIRED_DELETION_SCOPES.map((scope) => ({
    scope,
    objectsExpected: 2,
    objectsDeleted: 2,
    objectsRetained: 0,
    failedOperations: 0,
    pendingRetries: 0,
  })),
  accessRevoked: true,
  recoveryTokensInvalidated: true,
  notificationTokensInvalidated: true,
  shareTokensInvalidated: true,
};
const evidence: QualityThresholdEvidence[] = [
  accessibility,
  performance,
  exportEvidence,
  deletion,
];
const input = { candidate, evidence, now };

test("accepts exact boundary values and complete evidence", () => {
  assert.deepEqual(decideReleaseQualityThresholds(input), {
    status: "ready-for-regression-evidence",
    candidate,
    thresholdsVerified: true,
  });
});

test("requires every evidence kind exactly once", () => {
  assert.deepEqual(
    decideReleaseQualityThresholds({ ...input, evidence: evidence.slice(1) }),
    { status: "blocked", reasons: ["quality:ACCESSIBILITY:missing"] },
  );
  assert.deepEqual(
    decideReleaseQualityThresholds({
      ...input,
      evidence: [...evidence, accessibility],
    }),
    { status: "unavailable" },
  );
});

test("binds evidence to the exact candidate", () => {
  for (const replacement of [
    { candidateId: "substituted" },
    { candidateRevision: candidate.revision + 1 },
    { releaseCommit: "f".repeat(40) },
  ]) {
    assertBlocked(replaceEvidence(0, replacement), "candidate-mismatch");
  }
});

test("requires executable server-resolved fictional evidence", () => {
  for (const replacement of [
    { executable: false },
    { serverResolved: false },
    { fictionalDataOnly: false },
  ]) {
    assert.equal(
      decideReleaseQualityThresholds({
        ...input,
        evidence: replaceEvidence(0, replacement),
      }).status,
      "blocked",
    );
  }
});

test("rejects truthy claims and malformed identities", () => {
  for (const replacement of [
    { executable: 1 },
    { workflowRunId: "" },
    { artifactDigest: "not-a-digest" },
  ]) {
    assert.deepEqual(
      decideReleaseQualityThresholds({
        ...input,
        evidence: replaceEvidence(0, replacement) as never,
      }),
      { status: "unavailable" },
    );
  }
});

test("requires fresh evidence with a bounded validity window", () => {
  assertBlocked(
    replaceEvidence(0, { issuedAt: new Date("2026-07-30T01:01:00.000Z") }),
    "stale",
  );
  assertBlocked(replaceEvidence(0, { expiresAt: now }), "stale");
  assertBlocked(
    replaceEvidence(0, {
      expiresAt: new Date("2026-07-31T00:01:00.000Z"),
    }),
    "stale",
  );
});

test("requires at least one audited accessibility page", () => {
  assertBlocked(replaceEvidence(0, { auditedPageCount: 0 }), "no-pages");
});

test("blocks every accessibility failure counter", () => {
  for (const field of [
    "automatedCriticalViolations",
    "automatedSeriousViolations",
    "keyboardBlockedJourneys",
    "missingVisibleFocusCases",
    "touchTargetFailures",
    "contrastFailures",
    "layoutOverflowFailures",
    "textScaleFailures",
  ] as const) {
    assertBlocked(replaceEvidence(0, { [field]: 1 }), "threshold-failed");
  }
});

test("rejects negative and fractional accessibility counters", () => {
  for (const value of [-1, 0.5]) {
    assert.deepEqual(
      decideReleaseQualityThresholds({
        ...input,
        evidence: replaceEvidence(0, { touchTargetFailures: value }),
      }),
      { status: "unavailable" },
    );
  }
});

test("requires the minimum performance sample size", () => {
  assertBlocked(replaceEvidence(1, { sampleSize: 19 }), "insufficient-samples");
});

test("blocks each exceeded performance budget", () => {
  for (const replacement of [
    { lcpP75Ms: 2_501 },
    { inpP75Ms: 201 },
    { clsP75: 0.101 },
    { apiP95Ms: 751 },
    { serverErrorRatePercent: 1.01 },
    { criticalRuntimeErrors: 1 },
  ]) {
    assertBlocked(replaceEvidence(1, replacement), "budget-exceeded");
  }
});

test("rejects non-finite and negative performance metrics", () => {
  for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(
      decideReleaseQualityThresholds({
        ...input,
        evidence: replaceEvidence(1, { lcpP75Ms: value }),
      }),
      { status: "unavailable" },
    );
  }
});

test("requires each export case exactly once", () => {
  const missing = {
    ...exportEvidence,
    cases: exportEvidence.cases.slice(1),
  };
  assertBlocked(
    replaceEvidence(2, missing),
    "quality:EXPORT:HOUSEHOLD_JSON:missing",
  );
  assertBlocked(
    replaceEvidence(2, {
      ...exportEvidence,
      cases: [...exportEvidence.cases, exportEvidence.cases[0]],
    }),
    "duplicate-case",
  );
});

test("blocks missing, duplicate and cross-property export rows", () => {
  for (const replacement of [
    { rowsExported: 3 },
    { missingRows: 1 },
    { duplicateRows: 1 },
    { wrongPropertyRows: 1 },
  ]) {
    assertExportBlocked(replacement, "record-mismatch");
  }
});

test("blocks private references, secrets and unsafe export formatting", () => {
  for (const replacement of [
    { privateFileReferences: 1 },
    { secretFindings: 1 },
    { unsafeSpreadsheetCells: 1 },
    { noStoreVerified: false },
    { schemaVerified: false },
  ]) {
    assertExportBlocked(replacement, "privacy-or-format-failed");
  }
});

test("requires every deletion scope exactly once", () => {
  assertBlocked(
    replaceEvidence(3, { ...deletion, scopes: deletion.scopes.slice(1) }),
    `quality:DELETION:${REQUIRED_DELETION_SCOPES[0]}:missing`,
  );
  assertBlocked(
    replaceEvidence(3, {
      ...deletion,
      scopes: [...deletion.scopes, deletion.scopes[0]],
    }),
    "duplicate-scope",
  );
});

test("blocks retained, failed and pending deletion work", () => {
  for (const replacement of [
    { objectsDeleted: 1 },
    { objectsRetained: 1 },
    { failedOperations: 1 },
    { pendingRetries: 1 },
  ]) {
    assertDeletionBlocked(replacement, "incomplete");
  }
});

test("allows an exact zero-object cleanup scope", () => {
  const scopes = deletion.scopes.map((scope, index) =>
    index === 0
      ? { ...scope, objectsExpected: 0, objectsDeleted: 0 }
      : scope,
  );
  assert.equal(
    decideReleaseQualityThresholds({
      ...input,
      evidence: replaceEvidence(3, { ...deletion, scopes }),
    }).status,
    "ready-for-regression-evidence",
  );
});

test("requires deletion access and every token class invalidated", () => {
  for (const replacement of [
    { accessRevoked: false },
    { recoveryTokensInvalidated: false },
    { notificationTokensInvalidated: false },
    { shareTokensInvalidated: false },
  ]) {
    assertBlocked(
      replaceEvidence(3, replacement),
      "credentials-or-access-active",
    );
  }
});

test("rejects malformed dates and unsafe build numbers without throwing", () => {
  assert.deepEqual(
    decideReleaseQualityThresholds({
      ...input,
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideReleaseQualityThresholds({
      ...input,
      candidate: { ...candidate, buildNumber: "0" },
    }),
    { status: "unavailable" },
  );
  for (const buildNumber of [
    102,
    "999999999999999999999999999999999999",
  ]) {
    assert.deepEqual(
      decideReleaseQualityThresholds({
        ...input,
        candidate: { ...candidate, buildNumber } as never,
      }),
      { status: "unavailable" },
    );
  }
});

function replaceEvidence(
  index: number,
  replacement: Record<string, unknown>,
): QualityThresholdEvidence[] {
  return evidence.map((item, itemIndex) =>
    itemIndex === index ? ({ ...item, ...replacement } as never) : item,
  );
}

function assertBlocked(
  replacementEvidence: QualityThresholdEvidence[],
  reasonFragment: string,
) {
  const decision = decideReleaseQualityThresholds({
    ...input,
    evidence: replacementEvidence,
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.some((reason) => reason.includes(reasonFragment)),
  );
}

function assertExportBlocked(
  replacement: Partial<ExportThresholdEvidence["cases"][number]>,
  reasonFragment: string,
) {
  const cases = exportEvidence.cases.map((result, index) =>
    index === 0 ? { ...result, ...replacement } : result,
  );
  assertBlocked(
    replaceEvidence(2, { ...exportEvidence, cases }),
    reasonFragment,
  );
}

function assertDeletionBlocked(
  replacement: Partial<DeletionThresholdEvidence["scopes"][number]>,
  reasonFragment: string,
) {
  const scopes = deletion.scopes.map((result, index) =>
    index === 0 ? { ...result, ...replacement } : result,
  );
  assertBlocked(
    replaceEvidence(3, { ...deletion, scopes }),
    reasonFragment,
  );
}
