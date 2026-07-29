import assert from "node:assert/strict";
import test from "node:test";

import type { CandidateIdentity } from "../src/lib/full-system-acceptance-policy";
import {
  PROHIBITED_OUTBOUND_CATEGORIES,
  REQUIRED_AUTHORIZATION_CASES,
  REQUIRED_BROWSER_CONTROLS,
  decideSecurityPrivacyThresholds,
  type AuthorizationThresholdEvidence,
  type BrowserSecurityThresholdEvidence,
  type OutboundPrivacyThresholdEvidence,
  type PrivateFileThresholdEvidence,
  type SecurityPrivacyThresholdEvidence,
  type SupplyChainThresholdEvidence,
} from "../src/lib/release-security-privacy-threshold-policy";

const now = new Date("2026-07-30T02:00:00.000Z");
const issuedAt = new Date("2026-07-30T01:00:00.000Z");
const expiresAt = new Date("2026-07-31T00:00:00.000Z");
const candidate: CandidateIdentity = {
  candidateId: "release-candidate-1",
  revision: 10,
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  deploymentId: "dpl_ReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "103",
};
const binding = {
  evidenceId: "security-evidence",
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
const authorization: AuthorizationThresholdEvidence = {
  ...binding,
  evidenceId: "authorization",
  kind: "AUTHORIZATION",
  cases: REQUIRED_AUTHORIZATION_CASES.map((caseId) => ({
    caseId,
    attempts: 2,
    unauthorizedDisclosures: 0,
    unauthorizedMutations: 0,
    revealedRecordExistence: 0,
    nonRevealingResponseVerified: true,
  })),
};
const privateFiles: PrivateFileThresholdEvidence = {
  ...binding,
  evidenceId: "private-files",
  kind: "PRIVATE_FILES",
  attemptedDownloads: 4,
  attemptedMutations: 4,
  unauthorizedDownloads: 0,
  unauthorizedMutations: 0,
  directProviderUrlExposures: 0,
  cacheablePrivateResponses: 0,
  mimeSniffingFailures: 0,
  quarantineBypasses: 0,
  orphanedPrivateObjects: 0,
};
const browser: BrowserSecurityThresholdEvidence = {
  ...binding,
  evidenceId: "browser",
  kind: "BROWSER_SECURITY",
  controls: REQUIRED_BROWSER_CONTROLS.map((control) => ({
    control,
    routesChecked: 12,
    failures: 0,
    exactValueVerified: true,
  })),
  unexpectedPermissionPrompts: 0,
  unsafeEvalFindings: 0,
  mixedContentFindings: 0,
  indexablePrivateRoutes: 0,
};
const supplyChain: SupplyChainThresholdEvidence = {
  ...binding,
  evidenceId: "supply-chain",
  kind: "SUPPLY_CHAIN",
  criticalVulnerabilities: 0,
  highVulnerabilities: 0,
  committedSecretFindings: 0,
  sensitiveSourceMapFindings: 0,
  unapprovedRuntimeDependencies: 0,
  lockfileDriftFindings: 0,
  workflowPrivilegeEscalations: 0,
  releaseSourceMismatches: 0,
  dependencyInventoryComplete: true,
};
const outboundPrivacy: OutboundPrivacyThresholdEvidence = {
  ...binding,
  evidenceId: "outbound-privacy",
  kind: "OUTBOUND_PRIVACY",
  prohibited: PROHIBITED_OUTBOUND_CATEGORIES.map((category) => ({
    category,
    observedRequests: 0,
  })),
  observedHostCount: 4,
  approvedHostCount: 4,
  unapprovedHosts: 0,
  householdPayloadsToUnapprovedHosts: 0,
  privateIdentifiersInDiagnosticPayloads: 0,
  processorInventoryComplete: true,
};
const evidence: SecurityPrivacyThresholdEvidence[] = [
  authorization,
  privateFiles,
  browser,
  supplyChain,
  outboundPrivacy,
];
const input = { candidate, evidence, now };

test("accepts complete candidate-bound security and privacy evidence", () => {
  assert.deepEqual(decideSecurityPrivacyThresholds(input), {
    status: "ready-for-regression-evidence",
    candidate,
    thresholdsVerified: true,
  });
});

test("requires each evidence kind exactly once", () => {
  assert.deepEqual(
    decideSecurityPrivacyThresholds({ ...input, evidence: evidence.slice(1) }),
    { status: "blocked", reasons: ["security:AUTHORIZATION:missing"] },
  );
  assert.deepEqual(
    decideSecurityPrivacyThresholds({
      ...input,
      evidence: [...evidence, authorization],
    }),
    { status: "unavailable" },
  );
});

test("binds every result to the exact candidate", () => {
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
      decideSecurityPrivacyThresholds({
        ...input,
        evidence: replaceEvidence(0, replacement),
      }).status,
      "blocked",
    );
  }
});

test("rejects truthy booleans and malformed artifact identities", () => {
  for (const replacement of [
    { executable: 1 },
    { workflowRunId: "" },
    { artifactDigest: "not-a-digest" },
  ]) {
    assert.deepEqual(
      decideSecurityPrivacyThresholds({
        ...input,
        evidence: replaceEvidence(0, replacement) as never,
      }),
      { status: "unavailable" },
    );
  }
});

test("requires a fresh positive evidence window no longer than 24 hours", () => {
  assertBlocked(replaceEvidence(0, { expiresAt: now }), "stale");
  assertBlocked(
    replaceEvidence(0, { issuedAt: new Date("2026-07-30T02:01:00.000Z") }),
    "stale",
  );
  assertBlocked(
    replaceEvidence(0, {
      expiresAt: new Date("2026-07-31T01:01:00.000Z"),
    }),
    "stale",
  );
});

test("requires every authorization case exactly once", () => {
  assertBlocked(
    replaceEvidence(0, {
      ...authorization,
      cases: authorization.cases.slice(1),
    }),
    `${REQUIRED_AUTHORIZATION_CASES[0]}:missing`,
  );
  assertBlocked(
    replaceEvidence(0, {
      ...authorization,
      cases: [...authorization.cases, authorization.cases[0]],
    }),
    "duplicate-case",
  );
});

test("requires authorization negative controls to execute", () => {
  assertAuthorizationBlocked({ attempts: 0 }, "not-executed");
});

test("blocks every authorization disclosure or mutation", () => {
  for (const replacement of [
    { unauthorizedDisclosures: 1 },
    { unauthorizedMutations: 1 },
    { revealedRecordExistence: 1 },
    { nonRevealingResponseVerified: false },
  ]) {
    assertAuthorizationBlocked(replacement, "boundary-failed");
  }
});

test("rejects negative authorization counters", () => {
  assert.deepEqual(
    decideSecurityPrivacyThresholds({
      ...input,
      evidence: replaceAuthorizationCase({ unauthorizedDisclosures: -1 }),
    }),
    { status: "unavailable" },
  );
});

test("requires private-file download and mutation negative controls", () => {
  for (const replacement of [
    { attemptedDownloads: 0 },
    { attemptedMutations: 0 },
  ]) {
    assertBlocked(
      replaceEvidence(1, replacement),
      "negative-controls-not-executed",
    );
  }
});

test("blocks every private-file boundary failure", () => {
  for (const field of [
    "unauthorizedDownloads",
    "unauthorizedMutations",
    "directProviderUrlExposures",
    "cacheablePrivateResponses",
    "mimeSniffingFailures",
    "quarantineBypasses",
    "orphanedPrivateObjects",
  ] as const) {
    assertBlocked(replaceEvidence(1, { [field]: 1 }), "boundary-failed");
  }
});

test("requires every browser security control exactly once", () => {
  assertBlocked(
    replaceEvidence(2, { ...browser, controls: browser.controls.slice(1) }),
    `${REQUIRED_BROWSER_CONTROLS[0]}:missing`,
  );
  assertBlocked(
    replaceEvidence(2, {
      ...browser,
      controls: [...browser.controls, browser.controls[0]],
    }),
    "duplicate-control",
  );
});

test("requires browser controls to execute with exact values", () => {
  for (const replacement of [
    { routesChecked: 0 },
    { failures: 1 },
    { exactValueVerified: false },
  ]) {
    assertBrowserBlocked(replacement, "failed");
  }
});

test("blocks unsafe browser runtime observations", () => {
  for (const replacement of [
    { unexpectedPermissionPrompts: 1 },
    { unsafeEvalFindings: 1 },
    { mixedContentFindings: 1 },
    { indexablePrivateRoutes: 1 },
  ]) {
    assertBlocked(replaceEvidence(2, replacement), "runtime-failed");
  }
});

test("blocks supply-chain, secret and source-integrity findings", () => {
  for (const field of [
    "criticalVulnerabilities",
    "highVulnerabilities",
    "committedSecretFindings",
    "sensitiveSourceMapFindings",
    "unapprovedRuntimeDependencies",
    "lockfileDriftFindings",
    "workflowPrivilegeEscalations",
    "releaseSourceMismatches",
  ] as const) {
    assertBlocked(replaceEvidence(3, { [field]: 1 }), "threshold-failed");
  }
  assertBlocked(
    replaceEvidence(3, { dependencyInventoryComplete: false }),
    "threshold-failed",
  );
});

test("requires every prohibited outbound category exactly once", () => {
  assertBlocked(
    replaceEvidence(4, {
      ...outboundPrivacy,
      prohibited: outboundPrivacy.prohibited.slice(1),
    }),
    `${PROHIBITED_OUTBOUND_CATEGORIES[0]}:missing`,
  );
  assertBlocked(
    replaceEvidence(4, {
      ...outboundPrivacy,
      prohibited: [
        ...outboundPrivacy.prohibited,
        outboundPrivacy.prohibited[0],
      ],
    }),
    "duplicate-category",
  );
});

test("blocks any prohibited outbound request", () => {
  const prohibited = outboundPrivacy.prohibited.map((result, index) =>
    index === 0 ? { ...result, observedRequests: 1 } : result,
  );
  assertBlocked(
    replaceEvidence(4, { ...outboundPrivacy, prohibited }),
    "observed",
  );
});

test("blocks unapproved hosts, payloads and incomplete processor evidence", () => {
  for (const replacement of [
    { approvedHostCount: 3 },
    { unapprovedHosts: 1 },
    { householdPayloadsToUnapprovedHosts: 1 },
    { privateIdentifiersInDiagnosticPayloads: 1 },
    { processorInventoryComplete: false },
  ]) {
    assertBlocked(replaceEvidence(4, replacement), "processor-boundary-failed");
  }
});

test("rejects malformed dates and unsafe candidate build identities", () => {
  assert.deepEqual(
    decideSecurityPrivacyThresholds({ ...input, now: new Date("invalid") }),
    { status: "unavailable" },
  );
  for (const buildNumber of [
    103,
    "0",
    "999999999999999999999999999999999999",
  ]) {
    assert.deepEqual(
      decideSecurityPrivacyThresholds({
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
): SecurityPrivacyThresholdEvidence[] {
  return evidence.map((item, itemIndex) =>
    itemIndex === index ? ({ ...item, ...replacement } as never) : item,
  );
}

function replaceAuthorizationCase(
  replacement: Record<string, unknown>,
): SecurityPrivacyThresholdEvidence[] {
  const cases = authorization.cases.map((result, index) =>
    index === 0 ? ({ ...result, ...replacement } as never) : result,
  );
  return replaceEvidence(0, { ...authorization, cases });
}

function assertBlocked(
  replacementEvidence: SecurityPrivacyThresholdEvidence[],
  fragment: string,
) {
  const decision = decideSecurityPrivacyThresholds({
    ...input,
    evidence: replacementEvidence,
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.some((reason) => reason.includes(fragment)),
  );
}

function assertAuthorizationBlocked(
  replacement: Record<string, unknown>,
  fragment: string,
) {
  assertBlocked(replaceAuthorizationCase(replacement), fragment);
}

function assertBrowserBlocked(
  replacement: Record<string, unknown>,
  fragment: string,
) {
  const controls = browser.controls.map((result, index) =>
    index === 0 ? ({ ...result, ...replacement } as never) : result,
  );
  assertBlocked(replaceEvidence(2, { ...browser, controls }), fragment);
}
