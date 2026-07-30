import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const SUBMISSION_READINESS_POLICY_VERSION =
  "homevault-submission-readiness-v2";
export const SUBMISSION_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const SUBMISSION_AUTHORITY_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

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
  "PROVIDER_AND_COST_APPROVALS",
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
export type SubmissionGateStatus = "APPROVED" | "PENDING" | "REJECTED";

type CandidateBound = {
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
};

type FreshEvidence = {
  issuedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
};

export type ReleaseControlEvidence = CandidateBound &
  FreshEvidence & {
    releaseTag: string;
    tagCommit: string;
    mainAncestorVerified: boolean;
    candidateFrozen: boolean;
    sourceDiffClean: boolean;
  };

export type CiLaneEvidence = CandidateBound &
  FreshEvidence & {
    lane: CiLane;
    runId: string;
    jobId: string;
    status: "PASSED" | "FAILED" | "CANCELLED";
    executable: boolean;
    executedStepCount: number;
    artifactDigest: string;
  };

export type ProductionEvidence = CandidateBound &
  FreshEvidence & {
    deploymentId: string;
    canonicalUrl: string;
    healthStatus: number;
    readinessStatus: number;
    migrations: "CURRENT" | "PENDING" | "UNKNOWN";
    databaseTlsMode: "VERIFY_FULL" | "LEGACY" | "UNKNOWN";
    databaseReady: boolean;
    authReady: boolean;
    emailReady: boolean;
    privateStorageReady: boolean;
  };

export type ExactCandidateArtifact = CandidateBound &
  FreshEvidence & {
    policyVersion: string;
    artifactDigest: string;
    status: "PASSED" | "FAILED";
    executable: boolean;
  };

export type NativeReleaseCompletionEvidence = CandidateBound &
  FreshEvidence & {
    policyVersion: "homevault-native-release-candidate-v1";
    status: "SIGNED_CANDIDATE_QA_COMPLETE";
    appVersion: string;
    buildNumber: string;
    signedArtifactDigest: string;
    testFlightUploadId: string;
    requiredDeviceClasses: readonly ("IPHONE" | "IPAD")[];
    completedDeviceClasses: readonly ("IPHONE" | "IPAD")[];
    artifactDigest: string;
  };

export type PublicUrlEvidence = CandidateBound &
  FreshEvidence & {
    kind: PublicUrlKind;
    url: string;
    statusCode: number;
    nonGeofenced: boolean;
    deploymentId: string;
    artifactDigest: string;
  };

export type ReviewerPackageEvidence = CandidateBound &
  FreshEvidence & {
    syntheticAccountVerified: boolean;
    stableWithoutStaffIntervention: boolean;
    credentialsStoredOnlyInStoreConsole: boolean;
    listingDigest: string;
    screenshotsDigest: string;
    reviewerNotesDigest: string;
    screenshotsFromSignedArtifactDigest: string;
    disclosuresMatchCandidate: boolean;
  };

export type OperationalOwnerEvidence = CandidateBound & {
  responsibility: OperationalOwnerKind;
  owner: string;
  acknowledged: boolean;
  authorityId: string;
  authorityRevision: number;
  acknowledgedAt: Date;
  expiresAt: Date;
  serverRecorded: boolean;
};

export type ClientGateEvidence = CandidateBound & {
  gate: SubmissionClientGate;
  status: SubmissionGateStatus;
  decisionId: string | null;
  decisionRevision: number | null;
  authorityId: string | null;
  decidedAt: Date | null;
  expiresAt: Date | null;
  authorityRecorded: boolean;
};

export type SubmissionReadinessInput = {
  candidate: CandidateIdentity;
  releaseControl: ReleaseControlEvidence;
  ciEvidence: readonly CiLaneEvidence[];
  production: ProductionEvidence;
  fullSystemAcceptance: ExactCandidateArtifact;
  storeDisclosureAudit: ExactCandidateArtifact;
  nativeReleaseCompletion: NativeReleaseCompletionEvidence;
  publicUrls: readonly PublicUrlEvidence[];
  reviewerPackage: ReviewerPackageEvidence;
  operationalOwners: readonly OperationalOwnerEvidence[];
  clientGates: readonly ClientGateEvidence[];
  openSeverityOneOrTwoDefects: number;
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
const GATE_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const;
const DEVICE_CLASSES = ["IPHONE", "IPAD"] as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function text(value: unknown, maximum = 200): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !/[\0\r\n]/.test(value)
  );
}

function date(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function commit(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function digest(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function revision(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function candidate(value: unknown): value is CandidateIdentity {
  if (!record(value)) return false;
  return (
    text(value.candidateId) &&
    revision(value.revision) &&
    commit(value.releaseCommit) &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId) &&
    typeof value.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    typeof value.buildNumber === "string" &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    Number.isSafeInteger(Number(value.buildNumber))
  );
}

function bound(value: Record<string, unknown>) {
  return (
    text(value.candidateId) &&
    revision(value.candidateRevision) &&
    commit(value.releaseCommit)
  );
}

function freshShape(value: Record<string, unknown>) {
  return (
    date(value.issuedAt) &&
    date(value.expiresAt) &&
    typeof value.serverResolved === "boolean"
  );
}

function exactCandidate(value: CandidateBound, valueCandidate: CandidateIdentity) {
  return (
    value.candidateId === valueCandidate.candidateId &&
    value.candidateRevision === valueCandidate.revision &&
    value.releaseCommit === valueCandidate.releaseCommit
  );
}

function fresh(
  value: FreshEvidence,
  now: Date,
  maximumAge = SUBMISSION_EVIDENCE_MAX_AGE_MS,
) {
  const issued = value.issuedAt.getTime();
  const expires = value.expiresAt.getTime();
  const current = now.getTime();
  return (
    value.serverResolved &&
    issued <= current &&
    current - issued <= maximumAge &&
    expires > current &&
    expires > issued
  );
}

function exactSet<T extends string>(
  values: readonly T[],
  required: readonly T[],
) {
  return (
    values.length === required.length &&
    new Set(values).size === required.length &&
    required.every((value) => values.includes(value))
  );
}

function releaseControl(value: unknown): value is ReleaseControlEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    text(value.releaseTag, 120) &&
    /^homevault-ios-v\d+\.\d+\.\d+-[1-9]\d*$/.test(value.releaseTag) &&
    commit(value.tagCommit) &&
    typeof value.mainAncestorVerified === "boolean" &&
    typeof value.candidateFrozen === "boolean" &&
    typeof value.sourceDiffClean === "boolean"
  );
}

function ci(value: unknown): value is CiLaneEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    REQUIRED_CI_LANES.includes(value.lane as CiLane) &&
    typeof value.runId === "string" &&
    /^[1-9]\d*$/.test(value.runId) &&
    typeof value.jobId === "string" &&
    /^[1-9]\d*$/.test(value.jobId) &&
    CI_STATUSES.includes(value.status as (typeof CI_STATUSES)[number]) &&
    typeof value.executable === "boolean" &&
    Number.isSafeInteger(value.executedStepCount) &&
    Number(value.executedStepCount) >= 0 &&
    digest(value.artifactDigest)
  );
}

function production(value: unknown): value is ProductionEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId) &&
    value.canonicalUrl === "https://homevault.grovekind.com" &&
    Number.isInteger(value.healthStatus) &&
    Number.isInteger(value.readinessStatus) &&
    MIGRATION_STATUSES.includes(
      value.migrations as (typeof MIGRATION_STATUSES)[number],
    ) &&
    TLS_MODES.includes(value.databaseTlsMode as (typeof TLS_MODES)[number]) &&
    typeof value.databaseReady === "boolean" &&
    typeof value.authReady === "boolean" &&
    typeof value.emailReady === "boolean" &&
    typeof value.privateStorageReady === "boolean"
  );
}

function artifact(value: unknown): value is ExactCandidateArtifact {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    text(value.policyVersion) &&
    digest(value.artifactDigest) &&
    ARTIFACT_STATUSES.includes(
      value.status as (typeof ARTIFACT_STATUSES)[number],
    ) &&
    typeof value.executable === "boolean"
  );
}

function nativeCompletion(
  value: unknown,
): value is NativeReleaseCompletionEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    value.policyVersion === "homevault-native-release-candidate-v1" &&
    value.status === "SIGNED_CANDIDATE_QA_COMPLETE" &&
    typeof value.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    typeof value.buildNumber === "string" &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    digest(value.signedArtifactDigest) &&
    text(value.testFlightUploadId) &&
    Array.isArray(value.requiredDeviceClasses) &&
    value.requiredDeviceClasses.every((item) =>
      DEVICE_CLASSES.includes(item as (typeof DEVICE_CLASSES)[number]),
    ) &&
    Array.isArray(value.completedDeviceClasses) &&
    value.completedDeviceClasses.every((item) =>
      DEVICE_CLASSES.includes(item as (typeof DEVICE_CLASSES)[number]),
    ) &&
    digest(value.artifactDigest)
  );
}

function publicUrl(value: unknown): value is PublicUrlEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    REQUIRED_PUBLIC_URLS.includes(value.kind as PublicUrlKind) &&
    text(value.url) &&
    Number.isInteger(value.statusCode) &&
    typeof value.nonGeofenced === "boolean" &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId) &&
    digest(value.artifactDigest)
  );
}

function reviewer(value: unknown): value is ReviewerPackageEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    freshShape(value) &&
    typeof value.syntheticAccountVerified === "boolean" &&
    typeof value.stableWithoutStaffIntervention === "boolean" &&
    typeof value.credentialsStoredOnlyInStoreConsole === "boolean" &&
    digest(value.listingDigest) &&
    digest(value.screenshotsDigest) &&
    digest(value.reviewerNotesDigest) &&
    digest(value.screenshotsFromSignedArtifactDigest) &&
    typeof value.disclosuresMatchCandidate === "boolean"
  );
}

function owner(value: unknown): value is OperationalOwnerEvidence {
  if (!record(value)) return false;
  return (
    bound(value) &&
    REQUIRED_OPERATIONAL_OWNERS.includes(
      value.responsibility as OperationalOwnerKind,
    ) &&
    text(value.owner) &&
    typeof value.acknowledged === "boolean" &&
    text(value.authorityId) &&
    revision(value.authorityRevision) &&
    date(value.acknowledgedAt) &&
    date(value.expiresAt) &&
    typeof value.serverRecorded === "boolean"
  );
}

function clientGate(value: unknown): value is ClientGateEvidence {
  if (!record(value)) return false;
  if (
    !bound(value) ||
    !SUBMISSION_CLIENT_GATES.includes(value.gate as SubmissionClientGate) ||
    !GATE_STATUSES.includes(value.status as SubmissionGateStatus) ||
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
    text(value.decisionId) &&
    revision(value.decisionRevision) &&
    text(value.authorityId) &&
    date(value.decidedAt) &&
    date(value.expiresAt)
  );
}

function authorityFresh(
  issuedAt: Date,
  expiresAt: Date,
  recorded: boolean,
  now: Date,
) {
  return fresh(
    { issuedAt, expiresAt, serverResolved: recorded },
    now,
    SUBMISSION_AUTHORITY_MAX_AGE_MS,
  );
}

function blocked(reasons: string[]): SubmissionReadinessDecision {
  return { status: "blocked", reasons: [...new Set(reasons)].sort() };
}

export function auditSubmissionReadiness(
  value: unknown,
  now = new Date(),
): SubmissionReadinessDecision {
  if (!record(value) || !date(now) || !candidate(value.candidate)) {
    return { status: "unavailable" };
  }
  if (
    !releaseControl(value.releaseControl) ||
    !Array.isArray(value.ciEvidence) ||
    value.ciEvidence.length !== REQUIRED_CI_LANES.length ||
    !value.ciEvidence.every(ci) ||
    !production(value.production) ||
    !artifact(value.fullSystemAcceptance) ||
    !artifact(value.storeDisclosureAudit) ||
    !nativeCompletion(value.nativeReleaseCompletion) ||
    !Array.isArray(value.publicUrls) ||
    value.publicUrls.length !== REQUIRED_PUBLIC_URLS.length ||
    !value.publicUrls.every(publicUrl) ||
    !reviewer(value.reviewerPackage) ||
    !Array.isArray(value.operationalOwners) ||
    value.operationalOwners.length !== REQUIRED_OPERATIONAL_OWNERS.length ||
    !value.operationalOwners.every(owner) ||
    !Array.isArray(value.clientGates) ||
    value.clientGates.length !== SUBMISSION_CLIENT_GATES.length ||
    !value.clientGates.every(clientGate) ||
    !Number.isSafeInteger(value.openSeverityOneOrTwoDefects) ||
    Number(value.openSeverityOneOrTwoDefects) < 0
  ) {
    return { status: "unavailable" };
  }

  const input = value as unknown as SubmissionReadinessInput;
  const reasons: string[] = [];
  const exact = (evidence: CandidateBound) =>
    exactCandidate(evidence, input.candidate);

  if (!exact(input.releaseControl)) reasons.push("release-control:candidate");
  if (
    input.releaseControl.tagCommit !== input.candidate.releaseCommit ||
    input.releaseControl.releaseTag !==
      `homevault-ios-v${input.candidate.appVersion}-${input.candidate.buildNumber}`
  ) {
    reasons.push("release-control:tag");
  }
  if (
    !input.releaseControl.mainAncestorVerified ||
    !input.releaseControl.candidateFrozen ||
    !input.releaseControl.sourceDiffClean
  ) {
    reasons.push("release-control:freeze");
  }
  if (!fresh(input.releaseControl, now)) reasons.push("release-control:freshness");

  const lanes = input.ciEvidence.map((item) => item.lane);
  if (!exactSet(lanes, REQUIRED_CI_LANES)) return { status: "unavailable" };
  for (const item of input.ciEvidence) {
    if (!exact(item)) reasons.push(`ci:${item.lane}:candidate`);
    if (!fresh(item, now)) reasons.push(`ci:${item.lane}:freshness`);
    if (
      item.status !== "PASSED" ||
      !item.executable ||
      item.executedStepCount < 1
    ) {
      reasons.push(`ci:${item.lane}:execution`);
    }
  }

  if (
    !exact(input.production) ||
    input.production.deploymentId !== input.candidate.deploymentId
  ) {
    reasons.push("production:candidate");
  }
  if (
    input.production.healthStatus !== 200 ||
    input.production.readinessStatus !== 200 ||
    !input.production.databaseReady ||
    !input.production.authReady ||
    !input.production.emailReady ||
    !input.production.privateStorageReady
  ) {
    reasons.push("production:runtime");
  }
  if (input.production.migrations !== "CURRENT") {
    reasons.push("production:migrations");
  }
  if (input.production.databaseTlsMode !== "VERIFY_FULL") {
    reasons.push("production:database-tls");
  }
  if (!fresh(input.production, now)) reasons.push("production:freshness");

  for (const [label, item] of [
    ["full-system-acceptance", input.fullSystemAcceptance],
    ["store-disclosure-audit", input.storeDisclosureAudit],
  ] as const) {
    if (!exact(item)) reasons.push(`${label}:candidate`);
    if (!fresh(item, now)) reasons.push(`${label}:freshness`);
    if (item.status !== "PASSED" || !item.executable) {
      reasons.push(`${label}:execution`);
    }
  }

  const native = input.nativeReleaseCompletion;
  if (
    !exact(native) ||
    native.appVersion !== input.candidate.appVersion ||
    native.buildNumber !== input.candidate.buildNumber
  ) {
    reasons.push("native-release:candidate");
  }
  if (!fresh(native, now)) reasons.push("native-release:freshness");
  if (
    !exactSet(native.requiredDeviceClasses, native.completedDeviceClasses) ||
    !native.requiredDeviceClasses.includes("IPHONE")
  ) {
    reasons.push("native-release:physical-qa");
  }

  const urlKinds = input.publicUrls.map((item) => item.kind);
  if (!exactSet(urlKinds, REQUIRED_PUBLIC_URLS)) return { status: "unavailable" };
  const expectedUrls: Record<PublicUrlKind, string> = {
    PRIVACY: "https://homevault.grovekind.com/privacy",
    SUPPORT: "https://homevault.grovekind.com/support",
    ACCOUNT_DELETION: "https://homevault.grovekind.com/account-deletion",
  };
  for (const item of input.publicUrls) {
    if (
      !exact(item) ||
      item.deploymentId !== input.candidate.deploymentId ||
      item.url !== expectedUrls[item.kind] ||
      item.statusCode !== 200 ||
      !item.nonGeofenced ||
      !fresh(item, now)
    ) {
      reasons.push(`public-url:${item.kind}`);
    }
  }

  const reviewerEvidence = input.reviewerPackage;
  if (!exact(reviewerEvidence)) reasons.push("reviewer-package:candidate");
  if (
    !reviewerEvidence.syntheticAccountVerified ||
    !reviewerEvidence.stableWithoutStaffIntervention ||
    !reviewerEvidence.credentialsStoredOnlyInStoreConsole ||
    !reviewerEvidence.disclosuresMatchCandidate ||
    !fresh(reviewerEvidence, now)
  ) {
    reasons.push("reviewer-package:controls");
  }
  if (
    reviewerEvidence.screenshotsFromSignedArtifactDigest !==
    native.signedArtifactDigest
  ) {
    reasons.push("reviewer-package:signed-artifact");
  }

  const ownerKinds = input.operationalOwners.map((item) => item.responsibility);
  if (!exactSet(ownerKinds, REQUIRED_OPERATIONAL_OWNERS)) {
    return { status: "unavailable" };
  }
  for (const item of input.operationalOwners) {
    if (
      !exact(item) ||
      !item.acknowledged ||
      !authorityFresh(
        item.acknowledgedAt,
        item.expiresAt,
        item.serverRecorded,
        now,
      )
    ) {
      reasons.push(`operational-owner:${item.responsibility}`);
    }
  }

  const gateKinds = input.clientGates.map((item) => item.gate);
  if (!exactSet(gateKinds, SUBMISSION_CLIENT_GATES)) {
    return { status: "unavailable" };
  }
  for (const item of input.clientGates) {
    if (!exact(item)) reasons.push(`client-gate:${item.gate}:candidate`);
    if (item.status === "REJECTED") {
      reasons.push(`client-gate:${item.gate}:rejected`);
    }
    if (
      item.status !== "PENDING" &&
      !authorityFresh(
        item.decidedAt as Date,
        item.expiresAt as Date,
        item.authorityRecorded,
        now,
      )
    ) {
      reasons.push(`client-gate:${item.gate}:authority`);
    }
  }

  if (input.openSeverityOneOrTwoDefects > 0) {
    reasons.push("release-defects:severity-one-or-two");
  }
  if (reasons.length > 0) return blocked(reasons);

  const pendingClientGates = input.clientGates
    .filter((item) => item.status === "PENDING")
    .map((item) => item.gate);
  if (pendingClientGates.length > 0) {
    return {
      status: "ready-for-client-go-no-go",
      candidate: input.candidate,
      exactCandidateEvidence: true,
      pendingClientGates,
    };
  }

  return {
    status: "ready-for-submission",
    candidate: input.candidate,
    exactCandidateEvidence: true,
    explicitSubmissionApproval: true,
  };
}
