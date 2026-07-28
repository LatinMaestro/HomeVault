import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_CI_LANES,
  REQUIRED_OPERATIONAL_OWNERS,
  REQUIRED_PUBLIC_URLS,
  SUBMISSION_CLIENT_GATES,
  auditSubmissionReadiness,
  type CiLaneEvidence,
  type ClientGateEvidence,
  type OperationalOwnerEvidence,
  type PublicUrlEvidence,
} from "../src/lib/submission-readiness-audit-policy";

const releaseCommit = "920bdeeab0ef074a60cb4bc8e9312e7f27964030";
const digest = "a".repeat(64);
const candidate = {
  releaseCommit,
  deploymentId: "dpl_SubmissionCandidate1",
  appVersion: "1.0.0",
  buildNumber: "121",
};

const ciEvidence: CiLaneEvidence[] = REQUIRED_CI_LANES.map((lane, index) => ({
  lane,
  releaseCommit,
  runId: `${3000 + index}`,
  jobId: `${9000 + index}`,
  status: "PASSED",
  executable: true,
  executedStepCount: 12,
  artifactDigest: String.fromCharCode(97 + index).repeat(64),
}));

const publicUrls: PublicUrlEvidence[] = REQUIRED_PUBLIC_URLS.map((kind) => ({
  kind,
  url: {
    PRIVACY: "https://homevault.grovekind.com/privacy",
    SUPPORT: "https://homevault.grovekind.com/support",
    ACCOUNT_DELETION: "https://homevault.grovekind.com/account-deletion",
  }[kind],
  statusCode: 200,
  nonGeofenced: true,
  deploymentId: candidate.deploymentId,
}));

const operationalOwners: OperationalOwnerEvidence[] =
  REQUIRED_OPERATIONAL_OWNERS.map((responsibility) => ({
    responsibility,
    owner: `release-owner-${responsibility.toLowerCase()}`,
    acknowledged: true,
  }));

const clientGates: ClientGateEvidence[] = SUBMISSION_CLIENT_GATES.map(
  (gate) => ({ gate, status: "PENDING" }),
);

const input = {
  candidate,
  releaseControl: {
    releaseCommit,
    releaseTag: "homevault-ios-v1.0.0-121",
    tagCommit: releaseCommit,
    mainAncestorVerified: true,
    candidateFrozen: true,
    sourceDiffClean: true,
  },
  ciEvidence,
  production: {
    releaseCommit,
    deploymentId: candidate.deploymentId,
    canonicalUrl: "https://homevault.grovekind.com",
    healthStatus: 200,
    readinessStatus: 200,
    migrations: "CURRENT" as const,
    databaseTlsMode: "VERIFY_FULL" as const,
  },
  fullSystemAcceptance: {
    releaseCommit,
    artifactDigest: digest,
    status: "PASSED" as const,
    executable: true,
  },
  storeDisclosureAudit: {
    releaseCommit,
    artifactDigest: "b".repeat(64),
    status: "PASSED" as const,
    executable: true,
  },
  signedIos: {
    releaseCommit,
    appVersion: "1.0.0",
    buildNumber: "121",
    bundleId: "au.com.homevault.app",
    teamId: "A1B2C3D4E5",
    ipaDigest: "c".repeat(64),
    entitlementsAudited: true,
    privacyReportAudited: true,
    testFlightStatus: "ACCEPTED" as const,
    testFlightBuildNumber: "121",
    physicalDeviceEvidenceDigest: "d".repeat(64),
  },
  publicUrls,
  reviewerPackage: {
    releaseCommit,
    syntheticAccountVerified: true,
    stableWithoutStaffIntervention: true,
    credentialsStoredOnlyInStoreConsole: true,
    listingDigest: "e".repeat(64),
    screenshotsDigest: "f".repeat(64),
    reviewerNotesDigest: "0".repeat(64),
  },
  operationalOwners,
  clientGates,
  openSeverityOneOrTwoDefects: 0,
};

test("separates exact engineering evidence from pending client gates", () => {
  assert.deepEqual(auditSubmissionReadiness(input), {
    status: "ready-for-client-go-no-go",
    candidate,
    exactCandidateEvidence: true,
    pendingClientGates: SUBMISSION_CLIENT_GATES,
  });
});

test("requires every client gate including explicit submission approval", () => {
  assert.deepEqual(
    auditSubmissionReadiness({
      ...input,
      clientGates: clientGates.map((item) => ({
        ...item,
        status: "APPROVED" as const,
      })),
    }),
    {
      status: "ready-for-submission",
      candidate,
      exactCandidateEvidence: true,
      explicitSubmissionApproval: true,
    },
  );
});

test("fails closed on malformed runtime input without throwing", () => {
  const cases = [
    { ...input, ciEvidence: null },
    { ...input, publicUrls: [null] },
    { ...input, operationalOwners: null },
    { ...input, clientGates: [null] },
    { ...input, openSeverityOneOrTwoDefects: -1 },
  ];
  for (const malformed of cases) {
    assert.doesNotThrow(() =>
      assert.deepEqual(auditSubmissionReadiness(malformed as never), {
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
    assert.deepEqual(auditSubmissionReadiness(malformed), {
      status: "unavailable",
    });
  }
});

test("rejects zero-step, non-executable and failed CI as real evidence", () => {
  for (const change of [
    { executedStepCount: 0 },
    { executable: false },
    { status: "FAILED" as const },
  ]) {
    const decision = auditSubmissionReadiness({
      ...input,
      ciEvidence: ciEvidence.map((item) =>
        item.lane === "STANDARD" ? { ...item, ...change } : item,
      ),
    });
    assert.ok(
      decision.status === "blocked" &&
        decision.reasons.includes("ci:STANDARD:execution"),
    );
  }
});

test("binds CI and release controls to the exact candidate", () => {
  const stale = "db8af7dac90f113064ebd8ffcd5db68fbcabd337";
  const decision = auditSubmissionReadiness({
    ...input,
    releaseControl: { ...input.releaseControl, tagCommit: stale },
    ciEvidence: ciEvidence.map((item) =>
      item.lane === "NATIVE_IOS"
        ? { ...item, releaseCommit: stale }
        : item,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("release-control:candidate") &&
      decision.reasons.includes("ci:NATIVE_IOS:candidate"),
  );
});

test("requires a frozen main-derived candidate and exact release tag", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    releaseControl: {
      ...input.releaseControl,
      candidateFrozen: false,
      releaseTag: "homevault-ios-v1.0.0-999",
    },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("release-control:freeze") &&
      decision.reasons.includes("release-control:tag"),
  );
});

test("blocks stale or unhealthy production and incomplete migrations", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    production: {
      ...input.production,
      deploymentId: "dpl_StaleProduction1",
      readinessStatus: 503,
      migrations: "PENDING" as const,
      databaseTlsMode: "LEGACY" as const,
    },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("production:candidate") &&
      decision.reasons.includes("production:runtime") &&
      decision.reasons.includes("production:migrations") &&
      decision.reasons.includes("production:database-tls"),
  );
});

test("requires executable full-system and disclosure artifacts", () => {
  const stale = "db8af7dac90f113064ebd8ffcd5db68fbcabd337";
  const decision = auditSubmissionReadiness({
    ...input,
    fullSystemAcceptance: {
      ...input.fullSystemAcceptance,
      releaseCommit: stale,
    },
    storeDisclosureAudit: {
      ...input.storeDisclosureAudit,
      executable: false,
    },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("full-system-acceptance:candidate") &&
      decision.reasons.includes("store-disclosure-audit:execution"),
  );
});

test("binds the inspected signed IPA and accepted TestFlight build", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    signedIos: {
      ...input.signedIos,
      buildNumber: "120",
      privacyReportAudited: false,
      testFlightStatus: "PROCESSING" as const,
    },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("signed-ios:candidate") &&
      decision.reasons.includes("signed-ios:inspection") &&
      decision.reasons.includes("signed-ios:testflight"),
  );
});

test("requires exact public URLs on the candidate production deployment", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    publicUrls: publicUrls.map((item) =>
      item.kind === "SUPPORT"
        ? { ...item, statusCode: 404, nonGeofenced: false }
        : item,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("public-url:SUPPORT"),
  );
});

test("keeps reviewer credentials out of source and requires stable synthetic access", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    reviewerPackage: {
      ...input.reviewerPackage,
      syntheticAccountVerified: false,
      stableWithoutStaffIntervention: false,
      credentialsStoredOnlyInStoreConsole: false,
    },
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("reviewer-package:access"),
  );
});

test("requires acknowledged rollback, incident, support and deletion owners", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    operationalOwners: operationalOwners.map((item) =>
      item.responsibility === "DATA_DELETION"
        ? { ...item, acknowledged: false }
        : item,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("owner:DATA_DELETION"),
  );
});

test("blocks unresolved severity-one or severity-two defects", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    openSeverityOneOrTwoDefects: 1,
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes("defects:severity-one-or-two"),
  );
});

test("treats a rejected client decision as a blocker, not an approval", () => {
  const decision = auditSubmissionReadiness({
    ...input,
    clientGates: clientGates.map((item) =>
      item.gate === "FINAL_SUBMISSION_APPROVAL"
        ? { ...item, status: "REJECTED" as const }
        : item,
    ),
  });
  assert.ok(
    decision.status === "blocked" &&
      decision.reasons.includes(
        "client-gate:FINAL_SUBMISSION_APPROVAL",
      ),
  );
});
