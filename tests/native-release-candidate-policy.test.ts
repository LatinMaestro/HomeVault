import assert from "node:assert/strict";
import test from "node:test";

import {
  NATIVE_RELEASE_CLIENT_GATES,
  assessNativeReleaseCandidate,
  type AppleSigningIdentityEvidence,
  type IosPhysicalQaEvidence,
  type NativeReleaseGateEvidence,
  type NativeReleasePrerequisites,
  type SignedIpaEvidence,
  type TestFlightBuildEvidence,
} from "../src/lib/native-release-candidate-policy";
import type { CandidateIdentity } from "../src/lib/full-system-acceptance-policy";

const candidate: CandidateIdentity = {
  candidateId: "homevault-ios-candidate",
  revision: 13,
  releaseCommit: "502547d18b763ad1410875638a03620c9a9235b0",
  deploymentId: "dpl_NativeReleaseCandidate1",
  appVersion: "1.0.0",
  buildNumber: "101",
};
const now = new Date("2026-07-30T00:00:00.000Z");
const issuedAt = new Date("2026-07-29T23:00:00.000Z");
const evidenceExpiresAt = new Date("2026-07-30T23:00:00.000Z");
const authorityExpiresAt = new Date("2026-08-20T23:00:00.000Z");

const prerequisites: NativeReleasePrerequisites = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  deploymentId: candidate.deploymentId,
  standardCiRunId: "ci-100",
  standardCiJobId: "job-100",
  standardCiArtifactDigest: "a".repeat(64),
  nativeCiRunId: "native-100",
  nativeCiJobId: "job-native-100",
  nativeCiArtifactDigest: "b".repeat(64),
  fullSystemAcceptanceDigest: "c".repeat(64),
  disclosureAuditDigest: "d".repeat(64),
  issuedAt,
  expiresAt: evidenceExpiresAt,
  exactHead: true,
  standardCiExecutable: true,
  standardCiStepsExecuted: 12,
  standardCiPassed: true,
  nativeCiExecutable: true,
  nativeCiStepsExecuted: 8,
  nativeCiPassed: true,
  productionDeploymentReady: true,
  productionReadinessPassed: true,
  fullSystemAcceptancePassed: true,
  disclosureAuditPassed: true,
  serverResolved: true,
};

const pendingGates: NativeReleaseGateEvidence[] =
  NATIVE_RELEASE_CLIENT_GATES.map((gate) => ({
    gate,
    candidateId: candidate.candidateId,
    candidateRevision: candidate.revision,
    releaseCommit: candidate.releaseCommit,
    status: "PENDING",
    decisionId: null,
    decisionRevision: null,
    authorityId: null,
    decidedAt: null,
    expiresAt: null,
    authorityRecorded: false,
  }));

function approvedGates() {
  return pendingGates.map((gate) => ({
    ...gate,
    status: "APPROVED" as const,
    decisionId: `decision-${gate.gate}`,
    decisionRevision: 1,
    authorityId: `authority-${gate.gate}`,
    decidedAt: issuedAt,
    expiresAt: authorityExpiresAt,
    authorityRecorded: true,
  }));
}

const signingIdentity: AppleSigningIdentityEvidence = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  bundleId: "au.com.homevault.app",
  teamId: "A1B2C3D4E5",
  appRecordId: "app-store-record-100",
  distributionCertificateFingerprint: "e".repeat(64),
  provisioningProfileDigest: "f".repeat(64),
  agreementsCurrent: true,
  containsSecretMaterial: false,
  recordedAt: issuedAt,
  expiresAt: authorityExpiresAt,
  serverResolved: true,
};

const signedIpa: SignedIpaEvidence = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  workflowRunId: "native-release-run-100",
  jobId: "native-release-job-100",
  executedSteps: 10,
  ipaDigest: "1".repeat(64),
  bundleId: "au.com.homevault.app",
  teamId: signingIdentity.teamId,
  appVersion: candidate.appVersion,
  buildNumber: candidate.buildNumber,
  entitlementsInspected: true,
  privacyManifestInspected: true,
  permissionStringsInspected: true,
  appIconsInspected: true,
  signingSecretsAbsentFromLogs: true,
  temporarySigningMaterialRemoved: true,
  artifactRetentionDays: 7,
  issuedAt,
  expiresAt: evidenceExpiresAt,
  executable: true,
  serverResolved: true,
};

const testFlight: TestFlightBuildEvidence = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  uploadId: "testflight-upload-100",
  ipaDigest: signedIpa.ipaDigest,
  appVersion: candidate.appVersion,
  buildNumber: candidate.buildNumber,
  status: "ACCEPTED",
  uploadedAt: issuedAt,
  acceptedAt: new Date("2026-07-29T23:30:00.000Z"),
  expiresAt: authorityExpiresAt,
  authorityRecorded: true,
  serverResolved: true,
};

const iphoneQa: IosPhysicalQaEvidence = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit: candidate.releaseCommit,
  ipaDigest: signedIpa.ipaDigest,
  testFlightUploadId: testFlight.uploadId,
  deviceClass: "IPHONE",
  deviceModel: "fictional-iphone-model",
  operatingSystemVersion: "26.0",
  testerAuthorityId: "tester-authority-1",
  result: "PASSED",
  fictionalDataOnly: true,
  coreJourneysPassed: true,
  privacyControlsPassed: true,
  permissionsPassed: true,
  deepLinksPassed: true,
  offlineAndBackgroundPassed: true,
  accessibilityPassed: true,
  negativeControlsPassed: true,
  cleanupPassed: true,
  authorityRecorded: true,
  completedAt: issuedAt,
  expiresAt: authorityExpiresAt,
};

const baseInput = {
  candidate,
  supportsTablet: false,
  prerequisites,
  clientGates: pendingGates,
  signingIdentity: null,
  signedIpa: null,
  testFlight: null,
  physicalQa: [],
  now,
};

test("waits for explicit Apple account and signing authority", () => {
  assert.deepEqual(assessNativeReleaseCandidate(baseInput), {
    status: "awaiting-client-authority",
    candidate,
    pendingClientGates: [
      "APPLE_ACCOUNT_AND_AGREEMENTS",
      "SIGNING_IDENTITY_USE",
    ],
  });
});

test("authorizes no signing until exact recorded gates and identity exist", () => {
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
    }),
    {
      status: "ready-for-authorized-signing",
      candidate,
      authorityRecorded: true,
    },
  );
});

test("separates signed IPA proof from TestFlight upload authority", () => {
  const gates = approvedGates().map((gate) =>
    gate.gate === "TESTFLIGHT_UPLOAD"
      ? {
          ...pendingGates.find((item) => item.gate === gate.gate)!,
        }
      : gate,
  );
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: gates,
      signingIdentity,
      signedIpa,
    }),
    {
      status: "awaiting-client-authority",
      candidate,
      pendingClientGates: ["TESTFLIGHT_UPLOAD"],
    },
  );
});

test("reports an authorized upload awaiting TestFlight processing", () => {
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
    }),
    {
      status: "awaiting-testflight-result",
      candidate,
      uploadId: null,
    },
  );
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight: { ...testFlight, status: "PROCESSING", acceptedAt: null },
    }),
    {
      status: "awaiting-testflight-result",
      candidate,
      uploadId: testFlight.uploadId,
    },
  );
});

test("requires iPhone QA after TestFlight accepts the exact IPA", () => {
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight,
    }),
    {
      status: "ready-for-physical-qa",
      candidate,
      pendingDeviceClasses: ["IPHONE"],
    },
  );
});

test("completes the signed candidate only with exact passing QA", () => {
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight,
      physicalQa: [iphoneQa],
    }),
    {
      status: "signed-candidate-qa-complete",
      candidate,
      signedArtifactDigest: signedIpa.ipaDigest,
      testFlightUploadId: testFlight.uploadId,
    },
  );
});

test("requires separate iPad evidence when the candidate supports tablets", () => {
  assert.deepEqual(
    assessNativeReleaseCandidate({
      ...baseInput,
      supportsTablet: true,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight,
      physicalQa: [iphoneQa],
    }),
    {
      status: "ready-for-physical-qa",
      candidate,
      pendingDeviceClasses: ["IPAD"],
    },
  );
});

test("rejects zero-step CI and zero-step signing runs as non-executions", () => {
  for (const next of [
    {
      ...baseInput,
      prerequisites: { ...prerequisites, standardCiStepsExecuted: 0 },
    },
    {
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa: { ...signedIpa, executedSteps: 0 },
    },
  ]) {
    const decision = assessNativeReleaseCandidate(next);
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.some(
          (reason) =>
            reason === "prerequisites:standard-ci" ||
            reason === "signed-ipa:inspection",
        ),
    );
  }
});

test("fails closed on cross-candidate substitution at every boundary", () => {
  const staleCommit = "fa7d24b29eef519caf77559bcb1f0a8685e1a00d";
  const cases = [
    {
      ...baseInput,
      prerequisites: { ...prerequisites, releaseCommit: staleCommit },
    },
    {
      ...baseInput,
      clientGates: approvedGates().map((gate, index) =>
        index === 0 ? { ...gate, releaseCommit: staleCommit } : gate,
      ),
      signingIdentity,
    },
    {
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity: { ...signingIdentity, releaseCommit: staleCommit },
    },
    {
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa: { ...signedIpa, releaseCommit: staleCommit },
    },
  ];
  for (const next of cases) {
    const decision = assessNativeReleaseCandidate(next);
    assert.equal(decision.status, "blocked");
  }
});

test("rejects synthetic pending authority and stale recorded decisions", () => {
  const synthetic = pendingGates.map((gate, index) =>
    index === 0 ? { ...gate, authorityRecorded: true } : gate,
  );
  assert.deepEqual(
    assessNativeReleaseCandidate({ ...baseInput, clientGates: synthetic }),
    { status: "unavailable" },
  );
  const stale = approvedGates().map((gate, index) =>
    index === 0
      ? {
          ...gate,
          decidedAt: new Date("2026-06-01T00:00:00.000Z"),
          expiresAt: new Date("2026-06-20T00:00:00.000Z"),
        }
      : gate,
  );
  const decision = assessNativeReleaseCandidate({
    ...baseInput,
    clientGates: stale,
    signingIdentity,
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes(
        "gate:APPLE_ACCOUNT_AND_AGREEMENTS:freshness",
      ),
  );
});

test("rejects signing identity evidence containing secret material", () => {
  const decision = assessNativeReleaseCandidate({
    ...baseInput,
    clientGates: approvedGates(),
    signingIdentity: { ...signingIdentity, containsSecretMaterial: true },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("signing-identity:invalid"),
  );
});

test("rejects IPA metadata, inspection and retention mismatches", () => {
  for (const ipa of [
    { ...signedIpa, buildNumber: "102" },
    { ...signedIpa, privacyManifestInspected: false },
    { ...signedIpa, artifactRetentionDays: 15 },
  ]) {
    const decision = assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa: ipa,
    });
    assert.equal(decision.status, "blocked");
  }
});

test("rejects TestFlight artifact substitution and rejection", () => {
  for (const evidence of [
    { ...testFlight, ipaDigest: "9".repeat(64) },
    { ...testFlight, status: "REJECTED" as const, acceptedAt: null },
  ]) {
    const decision = assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight: evidence,
    });
    assert.equal(decision.status, "blocked");
  }
});

test("rejects failed, stale, substituted or non-fictional physical QA", () => {
  const cases = [
    { ...iphoneQa, result: "FAILED" as const },
    { ...iphoneQa, fictionalDataOnly: false },
    { ...iphoneQa, ipaDigest: "9".repeat(64) },
    {
      ...iphoneQa,
      completedAt: new Date("2026-06-01T00:00:00.000Z"),
      expiresAt: new Date("2026-06-20T00:00:00.000Z"),
    },
  ];
  for (const qa of cases) {
    const decision = assessNativeReleaseCandidate({
      ...baseInput,
      clientGates: approvedGates(),
      signingIdentity,
      signedIpa,
      testFlight,
      physicalQa: [qa],
    });
    assert.equal(decision.status, "blocked");
  }
});

test("fails closed on malformed runtime values without throwing", () => {
  for (const malformed of [
    { ...baseInput, clientGates: null },
    { ...baseInput, prerequisites: null },
    { ...baseInput, physicalQa: [null] },
    { ...baseInput, now: new Date("invalid") },
  ]) {
    assert.doesNotThrow(() =>
      assert.deepEqual(assessNativeReleaseCandidate(malformed as never), {
        status: "unavailable",
      }),
    );
  }
});

test("does not treat this policy result as signing or upload authority", () => {
  const decision = assessNativeReleaseCandidate(baseInput);
  assert.equal(decision.status, "awaiting-client-authority");
  assert.equal("signedArtifactDigest" in decision, false);
  assert.equal("testFlightUploadId" in decision, false);
});
