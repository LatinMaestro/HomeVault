import type {
  AcceptancePlatform,
  CandidateIdentity,
} from "./full-system-acceptance-policy";

export const RELEASE_REGRESSION_POLICY_VERSION =
  "homevault-release-regression-v1";

export const REGRESSION_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const PHYSICAL_EVIDENCE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const REQUIRED_REGRESSION_CASES = [
  "AUTH_VERIFICATION_RECOVERY_SESSIONS",
  "ROLE_INVITATION_OWNERSHIP_ABUSE",
  "PROPERTY_RECORD_FILE_ISOLATION",
  "CORE_CRUD_RECURRENCE_SEARCH_ARCHIVE",
  "PRIVATE_ATTACHMENT_LIFECYCLE",
  "NOTIFICATION_PERMISSION_QUIET_RETRY_LINK",
  "EXTERNAL_CALENDAR_SCOPE_SYNC_REVOCATION",
  "BIOMETRIC_DEVICE_BINDING_AND_WIPE",
  "CAPTURE_REVIEW_PRIVATE_UPLOAD",
  "OFFLINE_ENCRYPTION_EXPIRY_CONFLICT_WIPE",
  "NATIVE_UTILITY_PROTECTED_HANDOFFS",
  "ATTACHMENT_GALLERY_HEIC_SCAN",
  "OCR_PROVENANCE_CONFIRMATION",
  "AI_DRAFT_REVIEW_NO_SILENT_MUTATION",
  "EMAIL_QUARANTINE_DEDUP_REVIEW",
  "CONTROLLED_SHARE_EXPIRY_REVOCATION",
  "PROVIDER_MINIMUM_DISCLOSURE_NO_PAYMENT",
  "DIAGNOSTIC_CONSENT_REDACTION_CLEANUP",
  "COMMERCIAL_RESTORE_REFUND_LIFECYCLE",
  "EXPORT_ACCURACY_PRIVACY_NO_STORE",
  "ACCOUNT_PROPERTY_COMPLETE_DELETION",
  "WEB_ACCESSIBILITY_LAYOUT",
  "WEB_PERFORMANCE_ERROR_RESILIENCE",
  "STORE_REVIEWER_SYNTHETIC_JOURNEY",
  "IOS_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
  "ANDROID_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
] as const;

export type RegressionCaseId = (typeof REQUIRED_REGRESSION_CASES)[number];
export type RegressionExecutionKind = "HOSTED_AUTOMATED" | "PHYSICAL_DEVICE";

export type RegressionCaseDefinition = {
  id: RegressionCaseId;
  kind: RegressionExecutionKind;
  requiredPlatforms: readonly AcceptancePlatform[];
  requiresNegativeControl: boolean;
  requiresCleanupAssertion: boolean;
};

export const REGRESSION_CASE_DEFINITIONS: readonly RegressionCaseDefinition[] =
  [
    caseDefinition("AUTH_VERIFICATION_RECOVERY_SESSIONS", ["WEB"], true, true),
    caseDefinition(
      "ROLE_INVITATION_OWNERSHIP_ABUSE",
      ["WEB"],
      true,
      true,
    ),
    caseDefinition(
      "PROPERTY_RECORD_FILE_ISOLATION",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "CORE_CRUD_RECURRENCE_SEARCH_ARCHIVE",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "PRIVATE_ATTACHMENT_LIFECYCLE",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "NOTIFICATION_PERMISSION_QUIET_RETRY_LINK",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "EXTERNAL_CALENDAR_SCOPE_SYNC_REVOCATION",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "BIOMETRIC_DEVICE_BINDING_AND_WIPE",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "CAPTURE_REVIEW_PRIVATE_UPLOAD",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "OFFLINE_ENCRYPTION_EXPIRY_CONFLICT_WIPE",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition("NATIVE_UTILITY_PROTECTED_HANDOFFS", ["IOS"], true, true),
    caseDefinition(
      "ATTACHMENT_GALLERY_HEIC_SCAN",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "OCR_PROVENANCE_CONFIRMATION",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "AI_DRAFT_REVIEW_NO_SILENT_MUTATION",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "EMAIL_QUARANTINE_DEDUP_REVIEW",
      ["WEB"],
      true,
      true,
    ),
    caseDefinition(
      "CONTROLLED_SHARE_EXPIRY_REVOCATION",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "PROVIDER_MINIMUM_DISCLOSURE_NO_PAYMENT",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "DIAGNOSTIC_CONSENT_REDACTION_CLEANUP",
      ["IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "COMMERCIAL_RESTORE_REFUND_LIFECYCLE",
      ["IOS"],
      true,
      true,
    ),
    caseDefinition(
      "EXPORT_ACCURACY_PRIVACY_NO_STORE",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition(
      "ACCOUNT_PROPERTY_COMPLETE_DELETION",
      ["WEB", "IOS", "ANDROID"],
      true,
      true,
    ),
    caseDefinition("WEB_ACCESSIBILITY_LAYOUT", ["WEB"], true, false),
    caseDefinition("WEB_PERFORMANCE_ERROR_RESILIENCE", ["WEB"], true, false),
    caseDefinition(
      "STORE_REVIEWER_SYNTHETIC_JOURNEY",
      ["WEB"],
      true,
      true,
    ),
    caseDefinition(
      "IOS_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
      ["IOS"],
      true,
      true,
      "PHYSICAL_DEVICE",
    ),
    caseDefinition(
      "ANDROID_SIGNED_PHYSICAL_PRIVACY_AND_LINKS",
      ["ANDROID"],
      true,
      true,
      "PHYSICAL_DEVICE",
    ),
  ];

export type HostedRegressionEvidence = {
  evidenceId: string;
  revision: number;
  caseId: RegressionCaseId;
  kind: "HOSTED_AUTOMATED";
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  workflowRunId: string;
  jobId: string;
  artifactDigest: string;
  platforms: readonly AcceptancePlatform[];
  startedAt: Date;
  completedAt: Date;
  expiresAt: Date;
  result: "PASSED" | "FAILED";
  executable: boolean;
  fictionalDataOnly: boolean;
  negativeControlPassed: boolean;
  cleanupAssertionPassed: boolean;
  serverResolved: boolean;
};

export type PhysicalRegressionEvidence = {
  evidenceId: string;
  revision: number;
  caseId: RegressionCaseId;
  kind: "PHYSICAL_DEVICE";
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  signedArtifactDigest: string;
  deviceModel: string;
  operatingSystemVersion: string;
  testerAuthorityId: string;
  startedAt: Date;
  completedAt: Date;
  expiresAt: Date;
  result: "PASSED" | "FAILED";
  fictionalDataOnly: boolean;
  negativeControlPassed: boolean;
  cleanupAssertionPassed: boolean;
  authorityRecorded: boolean;
};

export type RegressionEvidence =
  | HostedRegressionEvidence
  | PhysicalRegressionEvidence;

export type ReleaseRegressionDecision =
  | {
      status: "ready-for-physical-device-gates";
      candidate: CandidateIdentity;
      hostedEvidenceComplete: true;
      pendingPhysicalCases: RegressionCaseId[];
    }
  | {
      status: "ready-for-full-system-acceptance";
      candidate: CandidateIdentity;
      hostedEvidenceComplete: true;
      physicalEvidenceComplete: true;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

const ACCEPTANCE_PLATFORMS = ["WEB", "IOS", "ANDROID"] as const;

function caseDefinition(
  id: RegressionCaseId,
  requiredPlatforms: readonly AcceptancePlatform[],
  requiresNegativeControl: boolean,
  requiresCleanupAssertion: boolean,
  kind: RegressionExecutionKind = "HOSTED_AUTOMATED",
): RegressionCaseDefinition {
  return {
    id,
    kind,
    requiredPlatforms,
    requiresNegativeControl,
    requiresCleanupAssertion,
  };
}

function validText(value: unknown, maximum = 200) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximum &&
    !/[\0\r\n]/.test(value)
  );
}

function validRevision(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function validDigest(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function validDate(value: unknown) {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validCandidate(candidate: CandidateIdentity) {
  const buildNumber = Number(candidate.buildNumber);
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    validText(candidate.candidateId) &&
    validRevision(candidate.revision) &&
    /^[a-f0-9]{40}$/.test(candidate.releaseCommit) &&
    /^dpl_[A-Za-z0-9]+$/.test(candidate.deploymentId) &&
    /^\d+\.\d+\.\d+$/.test(candidate.appVersion) &&
    /^[1-9]\d*$/.test(candidate.buildNumber) &&
    Number.isSafeInteger(buildNumber)
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

function completeUniqueCaseSet(evidence: readonly RegressionEvidence[]) {
  const ids = evidence.map((item) => item.caseId);
  return (
    new Set(ids).size === ids.length &&
    ids.every((id) => REQUIRED_REGRESSION_CASES.includes(id))
  );
}

function validWindow(
  startedAt: Date,
  completedAt: Date,
  expiresAt: Date,
  now: Date,
  maximumAge: number,
) {
  return (
    validDate(startedAt) &&
    validDate(completedAt) &&
    validDate(expiresAt) &&
    startedAt.getTime() <= completedAt.getTime() &&
    completedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > completedAt.getTime() &&
    expiresAt.getTime() - completedAt.getTime() <= maximumAge
  );
}

function validHostedShape(value: HostedRegressionEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.evidenceId) &&
    validRevision(value.revision) &&
    REQUIRED_REGRESSION_CASES.includes(value.caseId) &&
    value.kind === "HOSTED_AUTOMATED" &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    validText(value.workflowRunId) &&
    validText(value.jobId) &&
    validDigest(value.artifactDigest) &&
    Array.isArray(value.platforms) &&
    new Set(value.platforms).size === value.platforms.length &&
    value.platforms.every((platform) =>
      ACCEPTANCE_PLATFORMS.includes(platform),
    ) &&
    validDate(value.startedAt) &&
    validDate(value.completedAt) &&
    validDate(value.expiresAt) &&
    ["PASSED", "FAILED"].includes(value.result) &&
    typeof value.executable === "boolean" &&
    typeof value.fictionalDataOnly === "boolean" &&
    typeof value.negativeControlPassed === "boolean" &&
    typeof value.cleanupAssertionPassed === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validPhysicalShape(value: PhysicalRegressionEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.evidenceId) &&
    validRevision(value.revision) &&
    REQUIRED_REGRESSION_CASES.includes(value.caseId) &&
    value.kind === "PHYSICAL_DEVICE" &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    validDigest(value.signedArtifactDigest) &&
    validText(value.deviceModel) &&
    validText(value.operatingSystemVersion) &&
    validText(value.testerAuthorityId) &&
    validDate(value.startedAt) &&
    validDate(value.completedAt) &&
    validDate(value.expiresAt) &&
    ["PASSED", "FAILED"].includes(value.result) &&
    typeof value.fictionalDataOnly === "boolean" &&
    typeof value.negativeControlPassed === "boolean" &&
    typeof value.cleanupAssertionPassed === "boolean" &&
    typeof value.authorityRecorded === "boolean"
  );
}

export function decideReleaseRegression({
  candidate,
  evidence,
  now,
}: {
  candidate: CandidateIdentity;
  evidence: readonly RegressionEvidence[];
  now: Date;
}): ReleaseRegressionDecision {
  if (
    !validCandidate(candidate) ||
    !validDate(now) ||
    !Array.isArray(evidence) ||
    !evidence.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        (item.kind === "HOSTED_AUTOMATED"
          ? validHostedShape(item)
          : item.kind === "PHYSICAL_DEVICE"
            ? validPhysicalShape(item)
            : false),
    ) ||
    !completeUniqueCaseSet(evidence)
  ) {
    return { status: "unavailable" };
  }

  const reasons: string[] = [];
  for (const definition of REGRESSION_CASE_DEFINITIONS) {
    const item = evidence.find((candidateItem) => candidateItem.caseId === definition.id);
    if (!item) {
      if (definition.kind === "HOSTED_AUTOMATED") {
        reasons.push(`case:${definition.id}:missing`);
      }
      continue;
    }
    if (item.kind !== definition.kind) {
      reasons.push(`case:${definition.id}:execution-kind`);
      continue;
    }
    if (!exactCandidate(item, candidate)) {
      reasons.push(`case:${definition.id}:candidate`);
    }
    if (item.result !== "PASSED") reasons.push(`case:${definition.id}:result`);
    if (item.fictionalDataOnly !== true) {
      reasons.push(`case:${definition.id}:fixture-safety`);
    }
    if (
      definition.requiresNegativeControl &&
      item.negativeControlPassed !== true
    ) {
      reasons.push(`case:${definition.id}:negative-control`);
    }
    if (
      definition.requiresCleanupAssertion &&
      item.cleanupAssertionPassed !== true
    ) {
      reasons.push(`case:${definition.id}:cleanup`);
    }
    if (item.kind === "HOSTED_AUTOMATED") {
      if (
        item.executable !== true ||
        item.serverResolved !== true ||
        !validWindow(
          item.startedAt,
          item.completedAt,
          item.expiresAt,
          now,
          REGRESSION_EVIDENCE_MAX_AGE_MS,
        )
      ) {
        reasons.push(`case:${definition.id}:hosted-authority`);
      }
      if (
        !definition.requiredPlatforms.every((platform) =>
          item.platforms.includes(platform),
        )
      ) {
        reasons.push(`case:${definition.id}:platform-coverage`);
      }
    } else if (
      item.authorityRecorded !== true ||
      !validWindow(
        item.startedAt,
        item.completedAt,
        item.expiresAt,
        now,
        PHYSICAL_EVIDENCE_MAX_AGE_MS,
      )
    ) {
      reasons.push(`case:${definition.id}:physical-authority`);
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  if (uniqueReasons.length > 0) {
    return { status: "blocked", reasons: uniqueReasons };
  }

  const pendingPhysicalCases = REGRESSION_CASE_DEFINITIONS.filter(
    (definition) =>
      definition.kind === "PHYSICAL_DEVICE" &&
      !evidence.some((item) => item.caseId === definition.id),
  ).map((definition) => definition.id);
  if (pendingPhysicalCases.length > 0) {
    return {
      status: "ready-for-physical-device-gates",
      candidate,
      hostedEvidenceComplete: true,
      pendingPhysicalCases,
    };
  }

  return {
    status: "ready-for-full-system-acceptance",
    candidate,
    hostedEvidenceComplete: true,
    physicalEvidenceComplete: true,
  };
}
