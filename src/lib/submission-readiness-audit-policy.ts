import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const REQUIRED_CI_LANES = [
  "STANDARD",
  "NATIVE_IOS",
  "NATIVE_ANDROID",
] as const;

export const REQUIRED_PUBLIC_URLS = [
  "PRIVACY",
  "SUPPORT",
  "ACCOUNT_DELETION",
] as const;

export const REQUIRED_OPERATIONAL_OWNERS = [
  "ROLLBACK",
  "INCIDENT_RESPONSE",
  "SUPPORT",
  "DATA_DELETION",
] as const;

export const SUBMISSION_CLIENT_GATES = [
  "LEGAL_PUBLIC_COPY",
  "APPLE_ACCOUNT_AND_AGREEMENTS",
  "SIGNING_IDENTITY",
  "TESTFLIGHT_PHYSICAL_QA",
  "REVIEWER_CREDENTIALS",
  "STORE_METADATA_AND_DECLARATIONS",
  "COMMERCIAL_MODEL",
  "FINAL_SUBMISSION_APPROVAL",
] as const;

export type CiLane = (typeof REQUIRED_CI_LANES)[number];
export type PublicUrlKind = (typeof REQUIRED_PUBLIC_URLS)[number];
export type OperationalOwnerKind =
  (typeof REQUIRED_OPERATIONAL_OWNERS)[number];
export type SubmissionClientGate = (typeof SUBMISSION_CLIENT_GATES)[number];

export type ReleaseControlEvidence = {
  releaseCommit: string;
  releaseTag: string;
  tagCommit: string;
  mainAncestorVerified: boolean;
  candidateFrozen: boolean;
  sourceDiffClean: boolean;
};

export type CiLaneEvidence = {
  lane: CiLane;
  releaseCommit: string;
  runId: string;
  jobId: string;
  status: "PASSED" | "FAILED" | "CANCELLED";
  executable: boolean;
  executedStepCount: number;
  artifactDigest: string;
};

export type ProductionEvidence = {
  releaseCommit: string;
  deploymentId: string;
  canonicalUrl: string;
  healthStatus: number;
  readinessStatus: number;
  migrations: "CURRENT" | "PENDING" | "UNKNOWN";
  databaseTlsMode: "VERIFY_FULL" | "LEGACY" | "UNKNOWN";
};

export type ExactCandidateArtifact = {
  releaseCommit: string;
  artifactDigest: string;
  status: "PASSED" | "FAILED";
  executable: boolean;
};

export type SignedIosEvidence = {
  releaseCommit: string;
  appVersion: string;
  buildNumber: string;
  bundleId: string;
  teamId: string;
  ipaDigest: string;
  entitlementsAudited: boolean;
  privacyReportAudited: boolean;
  testFlightStatus: "ACCEPTED" | "PROCESSING" | "REJECTED";
  testFlightBuildNumber: string;
  physicalDeviceEvidenceDigest: string;
};

export type PublicUrlEvidence = {
  kind: PublicUrlKind;
  url: string;
  statusCode: number;
  nonGeofenced: boolean;
  deploymentId: string;
};

export type ReviewerPackageEvidence = {
  releaseCommit: string;
  syntheticAccountVerified: boolean;
  stableWithoutStaffIntervention: boolean;
  credentialsStoredOnlyInStoreConsole: boolean;
  listingDigest: string;
  screenshotsDigest: string;
  reviewerNotesDigest: string;
};

export type OperationalOwnerEvidence = {
  responsibility: OperationalOwnerKind;
  owner: string;
  acknowledged: boolean;
};

export type ClientGateEvidence = {
  gate: SubmissionClientGate;
  status: "APPROVED" | "PENDING" | "REJECTED";
};

export type SubmissionReadinessDecision =
  | {
      status: "ready-for-client-go-no-go";
      candidate: CandidateIdentity;
      exactCandidateEvidence: true;
      pendingClientGates: SubmissionClientGate[];
    }
  | {
      status: "ready-for-submission";
      candidate: CandidateIdentity;
      exactCandidateEvidence: true;
      explicitSubmissionApproval: true;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

const CI_STATUSES = ["PASSED", "FAILED", "CANCELLED"] as const;
const MIGRATION_STATUSES = ["CURRENT", "PENDING", "UNKNOWN"] as const;
const TLS_MODES = ["VERIFY_FULL", "LEGACY", "UNKNOWN"] as const;
const ARTIFACT_STATUSES = ["PASSED", "FAILED"] as const;
const TESTFLIGHT_STATUSES = ["ACCEPTED", "PROCESSING", "REJECTED"] as const;
const CLIENT_GATE_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;

function validText(value: unknown, maximum: number) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !value.includes("\0") &&
    !value.includes("\r") &&
    !value.includes("\n")
  );
}

function validCommit(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function validDigest(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validCandidate(candidate: CandidateIdentity) {
  if (typeof candidate !== "object" || candidate === null) return false;
  const buildNumber = Number(candidate.buildNumber);
  return (
    validCommit(candidate.releaseCommit) &&
    typeof candidate.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(candidate.deploymentId) &&
    typeof candidate.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(candidate.appVersion) &&
    typeof candidate.buildNumber === "string" &&
    /^[1-9]\d*$/.test(candidate.buildNumber) &&
    Number.isSafeInteger(buildNumber)
  );
}

function exactEnumSet<T extends string>(
  values: readonly T[],
  required: readonly T[],
) {
  return (
    Array.isArray(values) &&
    values.length === required.length &&
    new Set(values).size === required.length &&
    required.every((value) => values.includes(value))
  );
}

function validReleaseControl(value: ReleaseControlEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validCommit(value.releaseCommit) &&
    validText(value.releaseTag, 120) &&
    /^homevault-ios-v\d+\.\d+\.\d+-[1-9]\d*$/.test(value.releaseTag) &&
    validCommit(value.tagCommit) &&
    typeof value.mainAncestorVerified === "boolean" &&
    typeof value.candidateFrozen === "boolean" &&
    typeof value.sourceDiffClean === "boolean"
  );
}

function validCiEvidence(value: CiLaneEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    REQUIRED_CI_LANES.includes(value.lane) &&
    validCommit(value.releaseCommit) &&
    typeof value.runId === "string" &&
    /^[1-9]\d*$/.test(value.runId) &&
    typeof value.jobId === "string" &&
    /^[1-9]\d*$/.test(value.jobId) &&
    CI_STATUSES.includes(value.status) &&
    typeof value.executable === "boolean" &&
    Number.isSafeInteger(value.executedStepCount) &&
    value.executedStepCount >= 0 &&
    validDigest(value.artifactDigest)
  );
}

function validProduction(value: ProductionEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validCommit(value.releaseCommit) &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId) &&
    value.canonicalUrl === "https://homevault.grovekind.com" &&
    Number.isInteger(value.healthStatus) &&
    Number.isInteger(value.readinessStatus) &&
    MIGRATION_STATUSES.includes(value.migrations) &&
    TLS_MODES.includes(value.databaseTlsMode)
  );
}

function validExactArtifact(value: ExactCandidateArtifact) {
  return (
    typeof value === "object" &&
    value !== null &&
    validCommit(value.releaseCommit) &&
    validDigest(value.artifactDigest) &&
    ARTIFACT_STATUSES.includes(value.status) &&
    typeof value.executable === "boolean"
  );
}

function validSignedIos(value: SignedIosEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validCommit(value.releaseCommit) &&
    typeof value.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    typeof value.buildNumber === "string" &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    value.bundleId === "au.com.homevault.app" &&
    typeof value.teamId === "string" &&
    /^[A-Z0-9]{10}$/.test(value.teamId) &&
    validDigest(value.ipaDigest) &&
    typeof value.entitlementsAudited === "boolean" &&
    typeof value.privacyReportAudited === "boolean" &&
    TESTFLIGHT_STATUSES.includes(value.testFlightStatus) &&
    typeof value.testFlightBuildNumber === "string" &&
    /^[1-9]\d*$/.test(value.testFlightBuildNumber) &&
    validDigest(value.physicalDeviceEvidenceDigest)
  );
}

function validPublicUrl(value: PublicUrlEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    REQUIRED_PUBLIC_URLS.includes(value.kind) &&
    typeof value.url === "string" &&
    /^https:\/\/homevault\.grovekind\.com\/[a-z-]+$/.test(value.url) &&
    Number.isInteger(value.statusCode) &&
    typeof value.nonGeofenced === "boolean" &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId)
  );
}

function validReviewerPackage(value: ReviewerPackageEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validCommit(value.releaseCommit) &&
    typeof value.syntheticAccountVerified === "boolean" &&
    typeof value.stableWithoutStaffIntervention === "boolean" &&
    typeof value.credentialsStoredOnlyInStoreConsole === "boolean" &&
    validDigest(value.listingDigest) &&
    validDigest(value.screenshotsDigest) &&
    validDigest(value.reviewerNotesDigest)
  );
}

function validOwner(value: OperationalOwnerEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    REQUIRED_OPERATIONAL_OWNERS.includes(value.responsibility) &&
    validText(value.owner, 160) &&
    typeof value.acknowledged === "boolean"
  );
}

function validClientGate(value: ClientGateEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    SUBMISSION_CLIENT_GATES.includes(value.gate) &&
    CLIENT_GATE_STATUSES.includes(value.status)
  );
}

export function auditSubmissionReadiness(input: {
  candidate: CandidateIdentity;
  releaseControl: ReleaseControlEvidence;
  ciEvidence: CiLaneEvidence[];
  production: ProductionEvidence;
  fullSystemAcceptance: ExactCandidateArtifact;
  storeDisclosureAudit: ExactCandidateArtifact;
  signedIos: SignedIosEvidence;
  publicUrls: PublicUrlEvidence[];
  reviewerPackage: ReviewerPackageEvidence;
  operationalOwners: OperationalOwnerEvidence[];
  clientGates: ClientGateEvidence[];
  openSeverityOneOrTwoDefects: number;
}): SubmissionReadinessDecision {
  try {
    if (
      typeof input !== "object" ||
      input === null ||
      !validCandidate(input.candidate) ||
      !validReleaseControl(input.releaseControl) ||
      !Array.isArray(input.ciEvidence) ||
      !input.ciEvidence.every(validCiEvidence) ||
      !validProduction(input.production) ||
      !validExactArtifact(input.fullSystemAcceptance) ||
      !validExactArtifact(input.storeDisclosureAudit) ||
      !validSignedIos(input.signedIos) ||
      !Array.isArray(input.publicUrls) ||
      !input.publicUrls.every(validPublicUrl) ||
      !validReviewerPackage(input.reviewerPackage) ||
      !Array.isArray(input.operationalOwners) ||
      !input.operationalOwners.every(validOwner) ||
      !Array.isArray(input.clientGates) ||
      !input.clientGates.every(validClientGate) ||
      !Number.isSafeInteger(input.openSeverityOneOrTwoDefects) ||
      input.openSeverityOneOrTwoDefects < 0 ||
      !exactEnumSet(
        input.ciEvidence.map((item) => item.lane),
        REQUIRED_CI_LANES,
      ) ||
      !exactEnumSet(
        input.publicUrls.map((item) => item.kind),
        REQUIRED_PUBLIC_URLS,
      ) ||
      !exactEnumSet(
        input.operationalOwners.map((item) => item.responsibility),
        REQUIRED_OPERATIONAL_OWNERS,
      ) ||
      !exactEnumSet(
        input.clientGates.map((item) => item.gate),
        SUBMISSION_CLIENT_GATES,
      )
    ) {
      return { status: "unavailable" };
    }

    const reasons: string[] = [];
    const { candidate } = input;

    if (
      input.releaseControl.releaseCommit !== candidate.releaseCommit ||
      input.releaseControl.tagCommit !== candidate.releaseCommit
    ) {
      reasons.push("release-control:candidate");
    }
    if (
      !input.releaseControl.mainAncestorVerified ||
      !input.releaseControl.candidateFrozen ||
      !input.releaseControl.sourceDiffClean
    ) {
      reasons.push("release-control:freeze");
    }
    if (
      input.releaseControl.releaseTag !==
      `homevault-ios-v${candidate.appVersion}-${candidate.buildNumber}`
    ) {
      reasons.push("release-control:tag");
    }

    for (const lane of input.ciEvidence) {
      if (lane.releaseCommit !== candidate.releaseCommit) {
        reasons.push(`ci:${lane.lane}:candidate`);
      }
      if (
        lane.status !== "PASSED" ||
        !lane.executable ||
        lane.executedStepCount === 0
      ) {
        reasons.push(`ci:${lane.lane}:execution`);
      }
    }

    if (
      input.production.releaseCommit !== candidate.releaseCommit ||
      input.production.deploymentId !== candidate.deploymentId
    ) {
      reasons.push("production:candidate");
    }
    if (
      input.production.healthStatus !== 200 ||
      input.production.readinessStatus !== 200
    ) {
      reasons.push("production:runtime");
    }
    if (input.production.migrations !== "CURRENT") {
      reasons.push("production:migrations");
    }
    if (input.production.databaseTlsMode !== "VERIFY_FULL") {
      reasons.push("production:database-tls");
    }

    for (const [name, artifact] of [
      ["full-system-acceptance", input.fullSystemAcceptance],
      ["store-disclosure-audit", input.storeDisclosureAudit],
    ] as const) {
      if (artifact.releaseCommit !== candidate.releaseCommit) {
        reasons.push(`${name}:candidate`);
      }
      if (artifact.status !== "PASSED" || !artifact.executable) {
        reasons.push(`${name}:execution`);
      }
    }

    if (
      input.signedIos.releaseCommit !== candidate.releaseCommit ||
      input.signedIos.appVersion !== candidate.appVersion ||
      input.signedIos.buildNumber !== candidate.buildNumber ||
      input.signedIos.testFlightBuildNumber !== candidate.buildNumber
    ) {
      reasons.push("signed-ios:candidate");
    }
    if (
      !input.signedIos.entitlementsAudited ||
      !input.signedIos.privacyReportAudited
    ) {
      reasons.push("signed-ios:inspection");
    }
    if (input.signedIos.testFlightStatus !== "ACCEPTED") {
      reasons.push("signed-ios:testflight");
    }

    const expectedUrl: Record<PublicUrlKind, string> = {
      PRIVACY: "https://homevault.grovekind.com/privacy",
      SUPPORT: "https://homevault.grovekind.com/support",
      ACCOUNT_DELETION:
        "https://homevault.grovekind.com/account-deletion",
    };
    for (const publicUrl of input.publicUrls) {
      if (
        publicUrl.url !== expectedUrl[publicUrl.kind] ||
        publicUrl.statusCode !== 200 ||
        !publicUrl.nonGeofenced ||
        publicUrl.deploymentId !== candidate.deploymentId
      ) {
        reasons.push(`public-url:${publicUrl.kind}`);
      }
    }

    if (input.reviewerPackage.releaseCommit !== candidate.releaseCommit) {
      reasons.push("reviewer-package:candidate");
    }
    if (
      !input.reviewerPackage.syntheticAccountVerified ||
      !input.reviewerPackage.stableWithoutStaffIntervention ||
      !input.reviewerPackage.credentialsStoredOnlyInStoreConsole
    ) {
      reasons.push("reviewer-package:access");
    }

    for (const owner of input.operationalOwners) {
      if (!owner.acknowledged) reasons.push(`owner:${owner.responsibility}`);
    }

    if (input.openSeverityOneOrTwoDefects > 0) {
      reasons.push("defects:severity-one-or-two");
    }

    for (const gate of input.clientGates.filter(
      (item) => item.status === "REJECTED",
    )) {
      reasons.push(`client-gate:${gate.gate}`);
    }

    if (reasons.length > 0) {
      return { status: "blocked", reasons: [...new Set(reasons)].sort() };
    }

    const pendingClientGates = input.clientGates
      .filter((item) => item.status === "PENDING")
      .map((item) => item.gate);
    if (pendingClientGates.length > 0) {
      return {
        status: "ready-for-client-go-no-go",
        candidate,
        exactCandidateEvidence: true,
        pendingClientGates,
      };
    }

    return {
      status: "ready-for-submission",
      candidate,
      exactCandidateEvidence: true,
      explicitSubmissionApproval: true,
    };
  } catch {
    return { status: "unavailable" };
  }
}
