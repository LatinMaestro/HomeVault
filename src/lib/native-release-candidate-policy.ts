import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const NATIVE_RELEASE_CANDIDATE_POLICY_VERSION =
  "homevault-native-release-candidate-v1";
export const NATIVE_RELEASE_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const NATIVE_RELEASE_AUTHORITY_MAX_AGE_MS =
  30 * 24 * 60 * 60 * 1000;
export const HOMEVAULT_IOS_BUNDLE_ID = "au.com.homevault.app";

export const NATIVE_RELEASE_CLIENT_GATES = [
  "APPLE_ACCOUNT_AND_AGREEMENTS",
  "SIGNING_IDENTITY_USE",
  "TESTFLIGHT_UPLOAD",
] as const;

export type NativeReleaseClientGate =
  (typeof NATIVE_RELEASE_CLIENT_GATES)[number];
export type NativeReleaseGateStatus = "APPROVED" | "PENDING" | "REJECTED";

export type NativeReleasePrerequisites = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  deploymentId: string;
  standardCiRunId: string;
  standardCiJobId: string;
  standardCiArtifactDigest: string;
  nativeCiRunId: string;
  nativeCiJobId: string;
  nativeCiArtifactDigest: string;
  fullSystemAcceptanceDigest: string;
  disclosureAuditDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  exactHead: boolean;
  standardCiExecutable: boolean;
  standardCiStepsExecuted: number;
  standardCiPassed: boolean;
  nativeCiExecutable: boolean;
  nativeCiStepsExecuted: number;
  nativeCiPassed: boolean;
  productionDeploymentReady: boolean;
  productionReadinessPassed: boolean;
  fullSystemAcceptancePassed: boolean;
  disclosureAuditPassed: boolean;
  serverResolved: boolean;
};

export type NativeReleaseGateEvidence = {
  gate: NativeReleaseClientGate;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  status: NativeReleaseGateStatus;
  decisionId: string | null;
  decisionRevision: number | null;
  authorityId: string | null;
  decidedAt: Date | null;
  expiresAt: Date | null;
  authorityRecorded: boolean;
};

export type AppleSigningIdentityEvidence = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  bundleId: string;
  teamId: string;
  appRecordId: string;
  distributionCertificateFingerprint: string;
  provisioningProfileDigest: string;
  agreementsCurrent: boolean;
  containsSecretMaterial: boolean;
  recordedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
};

export type SignedIpaEvidence = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  workflowRunId: string;
  jobId: string;
  executedSteps: number;
  ipaDigest: string;
  bundleId: string;
  teamId: string;
  appVersion: string;
  buildNumber: string;
  entitlementsInspected: boolean;
  privacyManifestInspected: boolean;
  permissionStringsInspected: boolean;
  appIconsInspected: boolean;
  signingSecretsAbsentFromLogs: boolean;
  temporarySigningMaterialRemoved: boolean;
  artifactRetentionDays: number;
  issuedAt: Date;
  expiresAt: Date;
  executable: boolean;
  serverResolved: boolean;
};

export type TestFlightBuildEvidence = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  uploadId: string;
  ipaDigest: string;
  appVersion: string;
  buildNumber: string;
  status: "PROCESSING" | "ACCEPTED" | "REJECTED";
  uploadedAt: Date;
  acceptedAt: Date | null;
  expiresAt: Date;
  authorityRecorded: boolean;
  serverResolved: boolean;
};

export type IosPhysicalQaEvidence = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  ipaDigest: string;
  testFlightUploadId: string;
  deviceClass: "IPHONE" | "IPAD";
  deviceModel: string;
  operatingSystemVersion: string;
  testerAuthorityId: string;
  result: "PASSED" | "FAILED";
  fictionalDataOnly: boolean;
  coreJourneysPassed: boolean;
  privacyControlsPassed: boolean;
  permissionsPassed: boolean;
  deepLinksPassed: boolean;
  offlineAndBackgroundPassed: boolean;
  accessibilityPassed: boolean;
  negativeControlsPassed: boolean;
  cleanupPassed: boolean;
  authorityRecorded: boolean;
  completedAt: Date;
  expiresAt: Date;
};

export type NativeReleaseCandidateDecision =
  | {
      status: "awaiting-client-authority";
      candidate: CandidateIdentity;
      pendingClientGates: NativeReleaseClientGate[];
    }
  | {
      status: "ready-for-authorized-signing";
      candidate: CandidateIdentity;
      authorityRecorded: true;
    }
  | {
      status: "awaiting-testflight-result";
      candidate: CandidateIdentity;
      uploadId: string | null;
    }
  | {
      status: "ready-for-physical-qa";
      candidate: CandidateIdentity;
      pendingDeviceClasses: ("IPHONE" | "IPAD")[];
    }
  | {
      status: "signed-candidate-qa-complete";
      candidate: CandidateIdentity;
      signedArtifactDigest: string;
      testFlightUploadId: string;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

const GATE_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;
const TESTFLIGHT_STATUSES = ["PROCESSING", "ACCEPTED", "REJECTED"] as const;
const DEVICE_CLASSES = ["IPHONE", "IPAD"] as const;

function validText(value: unknown, maximum = 200) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !/[\0\r\n]/.test(value)
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validDigest(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validCandidate(candidate: CandidateIdentity) {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    validText(candidate.candidateId) &&
    Number.isSafeInteger(candidate.revision) &&
    candidate.revision > 0 &&
    /^[a-f0-9]{40}$/.test(candidate.releaseCommit) &&
    /^dpl_[A-Za-z0-9]+$/.test(candidate.deploymentId) &&
    /^\d+\.\d+\.\d+$/.test(candidate.appVersion) &&
    /^[1-9]\d*$/.test(candidate.buildNumber) &&
    Number.isSafeInteger(Number(candidate.buildNumber))
  );
}

function exactCandidate(
  evidence: {
    candidateId: string;
    candidateRevision: number;
    releaseCommit: string;
  },
  candidate: CandidateIdentity,
) {
  return (
    evidence.candidateId === candidate.candidateId &&
    evidence.candidateRevision === candidate.revision &&
    evidence.releaseCommit === candidate.releaseCommit
  );
}

function validWindow(
  issuedAt: Date,
  expiresAt: Date,
  now: Date,
  maximumAge: number,
) {
  return (
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <= maximumAge
  );
}

function validPrerequisites(value: NativeReleasePrerequisites) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.candidateId) &&
    Number.isSafeInteger(value.candidateRevision) &&
    value.candidateRevision > 0 &&
    typeof value.releaseCommit === "string" &&
    typeof value.deploymentId === "string" &&
    validText(value.standardCiRunId) &&
    validText(value.standardCiJobId) &&
    validDigest(value.standardCiArtifactDigest) &&
    validText(value.nativeCiRunId) &&
    validText(value.nativeCiJobId) &&
    validDigest(value.nativeCiArtifactDigest) &&
    validDigest(value.fullSystemAcceptanceDigest) &&
    validDigest(value.disclosureAuditDigest) &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.exactHead === "boolean" &&
    typeof value.standardCiExecutable === "boolean" &&
    Number.isSafeInteger(value.standardCiStepsExecuted) &&
    value.standardCiStepsExecuted >= 0 &&
    typeof value.standardCiPassed === "boolean" &&
    typeof value.nativeCiExecutable === "boolean" &&
    Number.isSafeInteger(value.nativeCiStepsExecuted) &&
    value.nativeCiStepsExecuted >= 0 &&
    typeof value.nativeCiPassed === "boolean" &&
    typeof value.productionDeploymentReady === "boolean" &&
    typeof value.productionReadinessPassed === "boolean" &&
    typeof value.fullSystemAcceptancePassed === "boolean" &&
    typeof value.disclosureAuditPassed === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validGate(value: NativeReleaseGateEvidence) {
  if (
    typeof value !== "object" ||
    value === null ||
    !NATIVE_RELEASE_CLIENT_GATES.includes(value.gate) ||
    !GATE_STATUSES.includes(value.status) ||
    !validText(value.candidateId) ||
    !Number.isSafeInteger(value.candidateRevision) ||
    value.candidateRevision <= 0 ||
    typeof value.releaseCommit !== "string" ||
    typeof value.authorityRecorded !== "boolean"
  ) {
    return false;
  }
  if (value.status === "PENDING") {
    return (
      value.decisionId === null &&
      value.decisionRevision === null &&
      value.authorityId === null &&
      value.decidedAt === null &&
      value.expiresAt === null &&
      value.authorityRecorded === false
    );
  }
  return (
    validText(value.decisionId) &&
    Number.isSafeInteger(value.decisionRevision) &&
    (value.decisionRevision as number) > 0 &&
    validText(value.authorityId) &&
    validDate(value.decidedAt) &&
    validDate(value.expiresAt) &&
    value.authorityRecorded
  );
}

function validSigningIdentity(value: AppleSigningIdentityEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.candidateId) &&
    Number.isSafeInteger(value.candidateRevision) &&
    value.candidateRevision > 0 &&
    typeof value.releaseCommit === "string" &&
    value.bundleId === HOMEVAULT_IOS_BUNDLE_ID &&
    /^[A-Z0-9]{10}$/.test(value.teamId) &&
    validText(value.appRecordId) &&
    validDigest(value.distributionCertificateFingerprint) &&
    validDigest(value.provisioningProfileDigest) &&
    typeof value.agreementsCurrent === "boolean" &&
    typeof value.containsSecretMaterial === "boolean" &&
    validDate(value.recordedAt) &&
    validDate(value.expiresAt) &&
    typeof value.serverResolved === "boolean"
  );
}

function validIpa(value: SignedIpaEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.candidateId) &&
    Number.isSafeInteger(value.candidateRevision) &&
    value.candidateRevision > 0 &&
    typeof value.releaseCommit === "string" &&
    validText(value.workflowRunId) &&
    validText(value.jobId) &&
    Number.isSafeInteger(value.executedSteps) &&
    value.executedSteps >= 0 &&
    validDigest(value.ipaDigest) &&
    value.bundleId === HOMEVAULT_IOS_BUNDLE_ID &&
    /^[A-Z0-9]{10}$/.test(value.teamId) &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    Number.isSafeInteger(Number(value.buildNumber)) &&
    typeof value.entitlementsInspected === "boolean" &&
    typeof value.privacyManifestInspected === "boolean" &&
    typeof value.permissionStringsInspected === "boolean" &&
    typeof value.appIconsInspected === "boolean" &&
    typeof value.signingSecretsAbsentFromLogs === "boolean" &&
    typeof value.temporarySigningMaterialRemoved === "boolean" &&
    Number.isSafeInteger(value.artifactRetentionDays) &&
    value.artifactRetentionDays > 0 &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.executable === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validTestFlight(value: TestFlightBuildEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.candidateId) &&
    Number.isSafeInteger(value.candidateRevision) &&
    value.candidateRevision > 0 &&
    typeof value.releaseCommit === "string" &&
    validText(value.uploadId) &&
    validDigest(value.ipaDigest) &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    TESTFLIGHT_STATUSES.includes(value.status) &&
    validDate(value.uploadedAt) &&
    (value.acceptedAt === null || validDate(value.acceptedAt)) &&
    validDate(value.expiresAt) &&
    typeof value.authorityRecorded === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validQa(value: IosPhysicalQaEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.candidateId) &&
    Number.isSafeInteger(value.candidateRevision) &&
    value.candidateRevision > 0 &&
    typeof value.releaseCommit === "string" &&
    validDigest(value.ipaDigest) &&
    validText(value.testFlightUploadId) &&
    DEVICE_CLASSES.includes(value.deviceClass) &&
    validText(value.deviceModel) &&
    validText(value.operatingSystemVersion) &&
    validText(value.testerAuthorityId) &&
    (value.result === "PASSED" || value.result === "FAILED") &&
    typeof value.fictionalDataOnly === "boolean" &&
    typeof value.coreJourneysPassed === "boolean" &&
    typeof value.privacyControlsPassed === "boolean" &&
    typeof value.permissionsPassed === "boolean" &&
    typeof value.deepLinksPassed === "boolean" &&
    typeof value.offlineAndBackgroundPassed === "boolean" &&
    typeof value.accessibilityPassed === "boolean" &&
    typeof value.negativeControlsPassed === "boolean" &&
    typeof value.cleanupPassed === "boolean" &&
    typeof value.authorityRecorded === "boolean" &&
    validDate(value.completedAt) &&
    validDate(value.expiresAt)
  );
}

export function assessNativeReleaseCandidate(input: {
  candidate: CandidateIdentity;
  supportsTablet: boolean;
  prerequisites: NativeReleasePrerequisites;
  clientGates: NativeReleaseGateEvidence[];
  signingIdentity: AppleSigningIdentityEvidence | null;
  signedIpa: SignedIpaEvidence | null;
  testFlight: TestFlightBuildEvidence | null;
  physicalQa: IosPhysicalQaEvidence[];
  now: Date;
}): NativeReleaseCandidateDecision {
  if (
    typeof input !== "object" ||
    input === null ||
    !validCandidate(input.candidate) ||
    typeof input.supportsTablet !== "boolean" ||
    !validPrerequisites(input.prerequisites) ||
    !Array.isArray(input.clientGates) ||
    input.clientGates.some((value) => !validGate(value)) ||
    (input.signingIdentity !== null &&
      !validSigningIdentity(input.signingIdentity)) ||
    (input.signedIpa !== null && !validIpa(input.signedIpa)) ||
    (input.testFlight !== null && !validTestFlight(input.testFlight)) ||
    !Array.isArray(input.physicalQa) ||
    input.physicalQa.some((value) => !validQa(value)) ||
    !validDate(input.now)
  ) {
    return { status: "unavailable" };
  }

  const { candidate, prerequisites, now } = input;
  const gates = new Map(input.clientGates.map((gate) => [gate.gate, gate]));
  if (
    gates.size !== NATIVE_RELEASE_CLIENT_GATES.length ||
    !NATIVE_RELEASE_CLIENT_GATES.every((gate) => gates.has(gate))
  ) {
    return { status: "unavailable" };
  }

  const reasons: string[] = [];
  if (
    !exactCandidate(prerequisites, candidate) ||
    prerequisites.deploymentId !== candidate.deploymentId
  ) {
    reasons.push("prerequisites:candidate");
  }
  if (
    !validWindow(
      prerequisites.issuedAt,
      prerequisites.expiresAt,
      now,
      NATIVE_RELEASE_EVIDENCE_MAX_AGE_MS,
    )
  ) {
    reasons.push("prerequisites:freshness");
  }
  if (!prerequisites.exactHead) reasons.push("prerequisites:exact-head");
  if (
    !prerequisites.standardCiExecutable ||
    prerequisites.standardCiStepsExecuted <= 0 ||
    !prerequisites.standardCiPassed
  ) {
    reasons.push("prerequisites:standard-ci");
  }
  if (
    !prerequisites.nativeCiExecutable ||
    prerequisites.nativeCiStepsExecuted <= 0 ||
    !prerequisites.nativeCiPassed
  ) {
    reasons.push("prerequisites:native-ci");
  }
  if (
    !prerequisites.productionDeploymentReady ||
    !prerequisites.productionReadinessPassed
  ) {
    reasons.push("prerequisites:production");
  }
  if (!prerequisites.fullSystemAcceptancePassed) {
    reasons.push("prerequisites:full-system-acceptance");
  }
  if (!prerequisites.disclosureAuditPassed) {
    reasons.push("prerequisites:disclosure-audit");
  }
  if (!prerequisites.serverResolved) reasons.push("prerequisites:resolution");

  for (const gate of input.clientGates) {
    if (!exactCandidate(gate, candidate)) {
      reasons.push(`gate:${gate.gate}:candidate`);
    }
    if (
      gate.status !== "PENDING" &&
      !validWindow(
        gate.decidedAt as Date,
        gate.expiresAt as Date,
        now,
        NATIVE_RELEASE_AUTHORITY_MAX_AGE_MS,
      )
    ) {
      reasons.push(`gate:${gate.gate}:freshness`);
    }
    if (gate.status === "REJECTED") {
      reasons.push(`gate:${gate.gate}:rejected`);
    }
  }
  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }

  const accountGate = gates.get("APPLE_ACCOUNT_AND_AGREEMENTS")!;
  const signingGate = gates.get("SIGNING_IDENTITY_USE")!;
  const uploadGate = gates.get("TESTFLIGHT_UPLOAD")!;
  const signingPending = [accountGate, signingGate].filter(
    (gate) => gate.status === "PENDING",
  );
  if (signingPending.length > 0 && input.signedIpa === null) {
    return {
      status: "awaiting-client-authority",
      candidate,
      pendingClientGates: signingPending.map((gate) => gate.gate),
    };
  }
  if (input.signingIdentity === null) {
    return { status: "blocked", reasons: ["signing-identity:missing"] };
  }
  const identity = input.signingIdentity;
  if (!exactCandidate(identity, candidate)) {
    reasons.push("signing-identity:candidate");
  }
  if (
    !validWindow(
      identity.recordedAt,
      identity.expiresAt,
      now,
      NATIVE_RELEASE_AUTHORITY_MAX_AGE_MS,
    )
  ) {
    reasons.push("signing-identity:freshness");
  }
  if (
    identity.teamId.length !== 10 ||
    !identity.agreementsCurrent ||
    identity.containsSecretMaterial ||
    !identity.serverResolved
  ) {
    reasons.push("signing-identity:invalid");
  }
  if (signingPending.length > 0) reasons.push("signed-artifact:authority");
  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }
  if (input.signedIpa === null) {
    return {
      status: "ready-for-authorized-signing",
      candidate,
      authorityRecorded: true,
    };
  }

  const ipa = input.signedIpa;
  if (!exactCandidate(ipa, candidate)) reasons.push("signed-ipa:candidate");
  if (
    ipa.teamId !== identity.teamId ||
    ipa.appVersion !== candidate.appVersion ||
    ipa.buildNumber !== candidate.buildNumber
  ) {
    reasons.push("signed-ipa:identity");
  }
  if (
    !validWindow(
      ipa.issuedAt,
      ipa.expiresAt,
      now,
      NATIVE_RELEASE_EVIDENCE_MAX_AGE_MS,
    )
  ) {
    reasons.push("signed-ipa:freshness");
  }
  if (
    !ipa.executable ||
    ipa.executedSteps <= 0 ||
    !ipa.entitlementsInspected ||
    !ipa.privacyManifestInspected ||
    !ipa.permissionStringsInspected ||
    !ipa.appIconsInspected ||
    !ipa.signingSecretsAbsentFromLogs ||
    !ipa.temporarySigningMaterialRemoved ||
    ipa.artifactRetentionDays > 14 ||
    !ipa.serverResolved
  ) {
    reasons.push("signed-ipa:inspection");
  }
  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }

  if (uploadGate.status === "PENDING" && input.testFlight === null) {
    return {
      status: "awaiting-client-authority",
      candidate,
      pendingClientGates: ["TESTFLIGHT_UPLOAD"],
    };
  }
  if (uploadGate.status !== "APPROVED") {
    return { status: "blocked", reasons: ["testflight:authority"] };
  }
  if (input.testFlight === null) {
    return {
      status: "awaiting-testflight-result",
      candidate,
      uploadId: null,
    };
  }

  const testFlight = input.testFlight;
  if (!exactCandidate(testFlight, candidate)) {
    reasons.push("testflight:candidate");
  }
  if (
    testFlight.ipaDigest !== ipa.ipaDigest ||
    testFlight.appVersion !== candidate.appVersion ||
    testFlight.buildNumber !== candidate.buildNumber
  ) {
    reasons.push("testflight:artifact");
  }
  if (
    !validWindow(
      testFlight.uploadedAt,
      testFlight.expiresAt,
      now,
      NATIVE_RELEASE_AUTHORITY_MAX_AGE_MS,
    ) ||
    !testFlight.authorityRecorded ||
    !testFlight.serverResolved
  ) {
    reasons.push("testflight:evidence");
  }
  if (
    testFlight.status === "ACCEPTED" &&
    (testFlight.acceptedAt === null ||
      testFlight.acceptedAt.getTime() < testFlight.uploadedAt.getTime() ||
      testFlight.acceptedAt.getTime() > now.getTime())
  ) {
    reasons.push("testflight:acceptance");
  }
  if (testFlight.status !== "ACCEPTED" && testFlight.acceptedAt !== null) {
    reasons.push("testflight:acceptance");
  }
  if (testFlight.status === "REJECTED") reasons.push("testflight:rejected");
  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }
  if (testFlight.status === "PROCESSING") {
    return {
      status: "awaiting-testflight-result",
      candidate,
      uploadId: testFlight.uploadId,
    };
  }

  const requiredClasses: ("IPHONE" | "IPAD")[] = input.supportsTablet
    ? ["IPHONE", "IPAD"]
    : ["IPHONE"];
  const qaByClass = new Map(
    input.physicalQa.map((evidence) => [evidence.deviceClass, evidence]),
  );
  if (qaByClass.size !== input.physicalQa.length) {
    return { status: "unavailable" };
  }
  for (const qa of input.physicalQa) {
    if (!requiredClasses.includes(qa.deviceClass)) {
      reasons.push(`physical-qa:${qa.deviceClass}:unexpected`);
    }
    if (!exactCandidate(qa, candidate)) {
      reasons.push(`physical-qa:${qa.deviceClass}:candidate`);
    }
    if (
      qa.ipaDigest !== ipa.ipaDigest ||
      qa.testFlightUploadId !== testFlight.uploadId
    ) {
      reasons.push(`physical-qa:${qa.deviceClass}:artifact`);
    }
    if (
      !validWindow(
        qa.completedAt,
        qa.expiresAt,
        now,
        NATIVE_RELEASE_AUTHORITY_MAX_AGE_MS,
      )
    ) {
      reasons.push(`physical-qa:${qa.deviceClass}:freshness`);
    }
    if (
      qa.result !== "PASSED" ||
      !qa.fictionalDataOnly ||
      !qa.coreJourneysPassed ||
      !qa.privacyControlsPassed ||
      !qa.permissionsPassed ||
      !qa.deepLinksPassed ||
      !qa.offlineAndBackgroundPassed ||
      !qa.accessibilityPassed ||
      !qa.negativeControlsPassed ||
      !qa.cleanupPassed ||
      !qa.authorityRecorded
    ) {
      reasons.push(`physical-qa:${qa.deviceClass}:result`);
    }
  }
  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }
  const pendingDeviceClasses = requiredClasses.filter(
    (deviceClass) => !qaByClass.has(deviceClass),
  );
  if (pendingDeviceClasses.length > 0) {
    return {
      status: "ready-for-physical-qa",
      candidate,
      pendingDeviceClasses,
    };
  }
  return {
    status: "signed-candidate-qa-complete",
    candidate,
    signedArtifactDigest: ipa.ipaDigest,
    testFlightUploadId: testFlight.uploadId,
  };
}
