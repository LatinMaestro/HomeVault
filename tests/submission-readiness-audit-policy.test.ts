import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_CI_LANES,
  REQUIRED_OPERATIONAL_OWNERS,
  REQUIRED_PUBLIC_URLS,
  SUBMISSION_CLIENT_GATES,
  SUBMISSION_READINESS_POLICY_VERSION,
  auditSubmissionReadiness,
  type CiLaneEvidence,
  type ClientGateEvidence,
  type OperationalOwnerEvidence,
  type PublicUrlEvidence,
  type SubmissionReadinessInput,
} from "../src/lib/submission-readiness-audit-policy";

const now = new Date("2026-07-30T00:00:00.000Z");
const issuedAt = new Date("2026-07-29T23:00:00.000Z");
const expiresAt = new Date("2026-07-30T23:00:00.000Z");
const authorityExpiresAt = new Date("2026-08-15T00:00:00.000Z");
const releaseCommit = "920bdeeab0ef074a60cb4bc8e9312e7f27964030";
const digest = (character: string) => character.repeat(64);
const candidate = {
  candidateId: "candidate-homevault-121",
  revision: 7,
  releaseCommit,
  deploymentId: "dpl_SubmissionCandidate1",
  appVersion: "1.0.0",
  buildNumber: "121",
};

const bound = {
  candidateId: candidate.candidateId,
  candidateRevision: candidate.revision,
  releaseCommit,
};
const fresh = { issuedAt, expiresAt, serverResolved: true };

const ciEvidence: CiLaneEvidence[] = REQUIRED_CI_LANES.map((lane, index) => ({
  ...bound,
  ...fresh,
  lane,
  runId: `${3000 + index}`,
  jobId: `${9000 + index}`,
  status: "PASSED",
  executable: true,
  executedStepCount: 12,
  artifactDigest: digest(String.fromCharCode(97 + index)),
}));

const publicUrls: PublicUrlEvidence[] = REQUIRED_PUBLIC_URLS.map((kind) => ({
  ...bound,
  ...fresh,
  kind,
  url: {
    PRIVACY: "https://homevault.grovekind.com/privacy",
    SUPPORT: "https://homevault.grovekind.com/support",
    ACCOUNT_DELETION: "https://homevault.grovekind.com/account-deletion",
  }[kind],
  statusCode: 200,
  nonGeofenced: true,
  deploymentId: candidate.deploymentId,
  artifactDigest: digest("9"),
}));

const operationalOwners: OperationalOwnerEvidence[] =
  REQUIRED_OPERATIONAL_OWNERS.map((responsibility, index) => ({
    ...bound,
    responsibility,
    owner: `release-owner-${responsibility.toLowerCase()}`,
    acknowledged: true,
    authorityId: `authority-owner-${index}`,
    authorityRevision: 2,
    acknowledgedAt: issuedAt,
    expiresAt: authorityExpiresAt,
    serverRecorded: true,
  }));

const clientGates: ClientGateEvidence[] = SUBMISSION_CLIENT_GATES.map(
  (gate) => ({
    ...bound,
    gate,
    status: "PENDING",
    decisionId: null,
    decisionRevision: null,
    authorityId: null,
    decidedAt: null,
    expiresAt: null,
    authorityRecorded: false,
  }),
);

const input: SubmissionReadinessInput = {
  candidate,
  releaseControl: {
    ...bound,
    ...fresh,
    releaseTag: "homevault-ios-v1.0.0-121",
    tagCommit: releaseCommit,
    mainAncestorVerified: true,
    candidateFrozen: true,
    sourceDiffClean: true,
  },
  ciEvidence,
  production: {
    ...bound,
    ...fresh,
    deploymentId: candidate.deploymentId,
    canonicalUrl: "https://homevault.grovekind.com",
    healthStatus: 200,
    readinessStatus: 200,
    migrations: "CURRENT",
    databaseTlsMode: "VERIFY_FULL",
    databaseReady: true,
    authReady: true,
    emailReady: true,
    privateStorageReady: true,
  },
  fullSystemAcceptance: {
    ...bound,
    ...fresh,
    policyVersion: "homevault-full-system-acceptance-v2",
    artifactDigest: digest("d"),
    status: "PASSED",
    executable: true,
  },
  storeDisclosureAudit: {
    ...bound,
    ...fresh,
    policyVersion: "homevault-store-disclosure-audit-v1",
    artifactDigest: digest("e"),
    status: "PASSED",
    executable: true,
  },
  nativeReleaseCompletion: {
    ...bound,
    ...fresh,
    policyVersion: "homevault-native-release-candidate-v1",
    status: "SIGNED_CANDIDATE_QA_COMPLETE",
    appVersion: candidate.appVersion,
    buildNumber: candidate.buildNumber,
    signedArtifactDigest: digest("f"),
    testFlightUploadId: "testflight-upload-121",
    requiredDeviceClasses: ["IPHONE", "IPAD"],
    completedDeviceClasses: ["IPAD", "IPHONE"],
    artifactDigest: digest("1"),
  },
  publicUrls,
  reviewerPackage: {
    ...bound,
    ...fresh,
    syntheticAccountVerified: true,
    stableWithoutStaffIntervention: true,
    credentialsStoredOnlyInStoreConsole: true,
    listingDigest: digest("2"),
    screenshotsDigest: digest("3"),
    reviewerNotesDigest: digest("4"),
    screenshotsFromSignedArtifactDigest: digest("f"),
    disclosuresMatchCandidate: true,
  },
  operationalOwners,
  clientGates,
  openSeverityOneOrTwoDefects: 0,
};

function approvedGates(): ClientGateEvidence[] {
  return clientGates.map((item, index) => ({
    ...item,
    status: "APPROVED",
    decisionId: `decision-${index}`,
    decisionRevision: 3,
    authorityId: `client-authority-${index}`,
    decidedAt: issuedAt,
    expiresAt: authorityExpiresAt,
    authorityRecorded: true,
  }));
}

test("has an explicit versioned final audit policy", () => {
  assert.equal(
    SUBMISSION_READINESS_POLICY_VERSION,
    "homevault-submission-readiness-v2",
  );
});

test("separates exact engineering evidence from pending client gates", () => {
  assert.deepEqual(auditSubmissionReadiness(input, now), {
    status: "ready-for-client-go-no-go",
    candidate,
    exactCandidateEvidence: true,
    pendingClientGates: SUBMISSION_CLIENT_GATES,
  });
});

test("requires every client gate including explicit submission approval", () => {
  assert.deepEqual(
    auditSubmissionReadiness({ ...input, clientGates: approvedGates() }, now),
    {
      status: "ready-for-submission",
      candidate,
      exactCandidateEvidence: true,
      explicitSubmissionApproval: true,
    },
  );
});

test("fails closed on malformed runtime input without throwing", () => {
  for (const malformed of [
    { ...input, ciEvidence: null },
    { ...input, publicUrls: [null] },
    { ...input, operationalOwners: null },
    { ...input, clientGates: [null] },
    { ...input, openSeverityOneOrTwoDefects: -1 },
  ]) {
    assert.doesNotThrow(() =>
      assert.deepEqual(auditSubmissionReadiness(malformed, now), {
        status: "unavailable",
      }),
    );
  }
});

test("requires one unique record for every required evidence set", () => {
  for (const malformed of [
    { ...input, ciEvidence: ciEvidence.slice(1) },
    { ...input, publicUrls: [...publicUrls, publicUrls[0]] },
    { ...input, operationalOwners: operationalOwners.slice(1) },
    { ...input, clientGates: clientGates.slice(1) },
  ]) {
    assert.deepEqual(auditSubmissionReadiness(malformed, now), {
      status: "unavailable",
    });
  }
});

test("rejects zero-step, non-executable and failed CI as evidence", () => {
  for (const change of [
    { executedStepCount: 0 },
    { executable: false },
    { status: "FAILED" as const },
  ]) {
    const decision = auditSubmissionReadiness(
      {
        ...input,
        ciEvidence: ciEvidence.map((item) =>
          item.lane === "STANDARD" ? { ...item, ...change } : item,
        ),
      },
      now,
    );
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes("ci:STANDARD:execution"),
    );
  }
});

test("binds release and CI evidence to the exact candidate", () => {
  const stale = "db8af7dac90f113064ebd8ffcd5db68fbcabd337";
  const decision = auditSubmissionReadiness(
    {
      ...input,
      releaseControl: { ...input.releaseControl, tagCommit: stale },
      ciEvidence: ciEvidence.map((item) =>
        item.lane === "NATIVE_IOS"
          ? { ...item, releaseCommit: stale }
          : item,
      ),
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("release-control:tag") &&
      decision.reasons.includes("ci:NATIVE_IOS:candidate"),
  );
});

test("requires a frozen main-derived clean candidate", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      releaseControl: {
        ...input.releaseControl,
        candidateFrozen: false,
        sourceDiffClean: false,
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("release-control:freeze"),
  );
});

test("blocks unhealthy production, missing providers and weak TLS", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      production: {
        ...input.production,
        readinessStatus: 503,
        migrations: "PENDING",
        databaseTlsMode: "LEGACY",
        emailReady: false,
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("production:runtime") &&
      decision.reasons.includes("production:migrations") &&
      decision.reasons.includes("production:database-tls"),
  );
});

test("requires fresh executable acceptance and disclosure artifacts", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      fullSystemAcceptance: {
        ...input.fullSystemAcceptance,
        expiresAt: new Date("2026-07-29T23:59:00.000Z"),
      },
      storeDisclosureAudit: {
        ...input.storeDisclosureAudit,
        executable: false,
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("full-system-acceptance:freshness") &&
      decision.reasons.includes("store-disclosure-audit:execution"),
  );
});

test("consumes Phase 12B completion instead of synthetic signing booleans", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      nativeReleaseCompletion: {
        ...input.nativeReleaseCompletion,
        buildNumber: "120",
        completedDeviceClasses: ["IPHONE"],
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("native-release:candidate") &&
      decision.reasons.includes("native-release:physical-qa"),
  );
});

test("rejects stale or unresolved native release completion", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      nativeReleaseCompletion: {
        ...input.nativeReleaseCompletion,
        serverResolved: false,
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("native-release:freshness"),
  );
});

test("requires exact public URLs on the candidate deployment", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      publicUrls: publicUrls.map((item) =>
        item.kind === "SUPPORT"
          ? { ...item, statusCode: 404, nonGeofenced: false }
          : item,
      ),
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("public-url:SUPPORT"),
  );
});

test("binds reviewer screenshots to the exact signed artifact", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      reviewerPackage: {
        ...input.reviewerPackage,
        screenshotsFromSignedArtifactDigest: digest("8"),
      },
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("reviewer-package:signed-artifact"),
  );
});

test("requires fresh server-recorded operational authority", () => {
  const decision = auditSubmissionReadiness(
    {
      ...input,
      operationalOwners: operationalOwners.map((item) =>
        item.responsibility === "ROLLBACK"
          ? { ...item, serverRecorded: false }
          : item,
      ),
    },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("operational-owner:ROLLBACK"),
  );
});

test("rejects fabricated authority on a pending client gate", () => {
  const malformed = clientGates.map((item) =>
    item.gate === "COMMERCIAL_MODEL"
      ? { ...item, authorityId: "synthetic-authority" }
      : item,
  );
  assert.deepEqual(
    auditSubmissionReadiness({ ...input, clientGates: malformed }, now),
    { status: "unavailable" },
  );
});

test("blocks rejected and stale approved client authority", () => {
  const gates = approvedGates().map((item) => {
    if (item.gate === "COMMERCIAL_MODEL") {
      return { ...item, status: "REJECTED" as const };
    }
    if (item.gate === "LEGAL_PUBLIC_COPY") {
      return { ...item, expiresAt: new Date("2026-07-29T23:00:00.000Z") };
    }
    return item;
  });
  const decision = auditSubmissionReadiness(
    { ...input, clientGates: gates },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("client-gate:COMMERCIAL_MODEL:rejected") &&
      decision.reasons.includes("client-gate:LEGAL_PUBLIC_COPY:authority"),
  );
});

test("blocks every unresolved severity-one or severity-two defect", () => {
  const decision = auditSubmissionReadiness(
    { ...input, openSeverityOneOrTwoDefects: 1 },
    now,
  );
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("release-defects:severity-one-or-two"),
  );
});

test("does not expose signing secrets, reviewer credentials or submit actions", () => {
  const source = auditSubmissionReadiness.toString();
  for (const prohibited of [
    "privateKey",
    "p12",
    "reviewerPassword",
    "submitToAppReview",
  ]) {
    assert.equal(source.includes(prohibited), false);
  }
});
