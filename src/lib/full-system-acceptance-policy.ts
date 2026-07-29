export const FULL_SYSTEM_ACCEPTANCE_POLICY_VERSION =
  "homevault-full-system-acceptance-v2";

export const ACCEPTANCE_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const CLIENT_DECISION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const ACCEPTANCE_DOMAINS = [
  "AUTH_IDENTITY",
  "HOUSEHOLD_ROLES_INVITATIONS",
  "MULTI_PROPERTY_ISOLATION",
  "CORE_RECORDS_PRIVATE_FILES",
  "NOTIFICATIONS_CALENDAR",
  "BIOMETRICS_CAPTURE_OFFLINE",
  "NATIVE_UTILITIES",
  "ATTACHMENTS_SCANNING",
  "OCR_AI_EMAIL_REVIEW",
  "CONTROLLED_SHARING_PROVIDER_HANDOFF",
  "PRIVACY_SAFE_DIAGNOSTICS",
  "EXPORT_RETENTION_DELETION",
  "SECURITY_PRIVACY",
  "ACCESSIBILITY_PERFORMANCE",
  "STORE_REVIEWER_PACKAGE",
  "COMMERCIAL_ENTITLEMENTS",
] as const;

export const CLIENT_RELEASE_GATES = [
  "LEGAL_PUBLIC_COPY",
  "PROVIDER_AND_COST_APPROVALS",
  "COMMERCIAL_MODEL",
  "APPLE_ENROLMENT_AND_AGREEMENTS",
  "APPLE_SIGNING",
  "PHYSICAL_DEVICE_REGRESSION",
  "TESTFLIGHT_QA",
  "REVIEWER_CREDENTIALS",
] as const;

export const REQUIRED_CLEANUP_SCOPES = [
  "DATABASE",
  "PRIVATE_FILES",
  "DEVICES_AND_OFFLINE_CACHE",
  "PROCESSORS",
  "CALENDARS",
  "NOTIFICATION_TOKENS",
  "SHARES",
  "DIAGNOSTICS",
  "COMMERCIAL_ENTITLEMENTS",
] as const;

export const ACCEPTANCE_BOUNDARIES = [
  "SERVER_AUTHORIZATION",
  "CROSS_PROPERTY_ISOLATION",
  "PRIVATE_FILE_DELIVERY",
  "LEAST_PRIVILEGE_PROVIDERS",
  "SECRETS_AND_LOGS_SCAN",
  "USER_REVIEWED_AUTOMATION",
  "PROHIBITED_PRODUCT_SCOPES_ABSENT",
  "ACCESSIBILITY_REGRESSION",
  "PERFORMANCE_BUDGETS",
] as const;

export type AcceptanceDomain = (typeof ACCEPTANCE_DOMAINS)[number];
export type ClientReleaseGate = (typeof CLIENT_RELEASE_GATES)[number];
export type CleanupScope = (typeof REQUIRED_CLEANUP_SCOPES)[number];
export type AcceptanceBoundary = (typeof ACCEPTANCE_BOUNDARIES)[number];
export type AcceptancePlatform = "WEB" | "IOS" | "ANDROID";
export type CommercialModel = "UNDECIDED" | "FREE" | "SUBSCRIPTION";

export const REQUIRED_PLATFORM_COVERAGE: Record<
  AcceptanceDomain,
  readonly AcceptancePlatform[]
> = {
  AUTH_IDENTITY: ["WEB", "IOS", "ANDROID"],
  HOUSEHOLD_ROLES_INVITATIONS: ["WEB", "IOS", "ANDROID"],
  MULTI_PROPERTY_ISOLATION: ["WEB", "IOS", "ANDROID"],
  CORE_RECORDS_PRIVATE_FILES: ["WEB", "IOS", "ANDROID"],
  NOTIFICATIONS_CALENDAR: ["IOS", "ANDROID"],
  BIOMETRICS_CAPTURE_OFFLINE: ["IOS", "ANDROID"],
  NATIVE_UTILITIES: ["IOS"],
  ATTACHMENTS_SCANNING: ["WEB", "IOS", "ANDROID"],
  OCR_AI_EMAIL_REVIEW: ["WEB", "IOS", "ANDROID"],
  CONTROLLED_SHARING_PROVIDER_HANDOFF: ["WEB", "IOS", "ANDROID"],
  PRIVACY_SAFE_DIAGNOSTICS: ["IOS", "ANDROID"],
  EXPORT_RETENTION_DELETION: ["WEB", "IOS", "ANDROID"],
  SECURITY_PRIVACY: ["WEB", "IOS", "ANDROID"],
  ACCESSIBILITY_PERFORMANCE: ["WEB", "IOS", "ANDROID"],
  STORE_REVIEWER_PACKAGE: ["IOS"],
  COMMERCIAL_ENTITLEMENTS: ["IOS"],
};

export type CandidateIdentity = {
  candidateId: string;
  revision: number;
  releaseCommit: string;
  deploymentId: string;
  appVersion: string;
  buildNumber: string;
};

export type CandidateEvidence = {
  evidenceId: string;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  deploymentId: string;
  appVersion: string;
  buildNumber: string;
  standardCiRunId: string;
  nativeCiRunId: string;
  standardArtifactDigest: string;
  nativeArtifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  exactHead: boolean;
  standardCiPassed: boolean;
  nativeCiPassed: boolean;
  deploymentReady: boolean;
  serverResolved: boolean;
};

export type AcceptanceEvidence = {
  evidenceId: string;
  revision: number;
  domain: AcceptanceDomain;
  status: "PASSED" | "FAILED" | "NOT_APPLICABLE";
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  workflowRunId: string | null;
  jobId: string | null;
  executable: boolean;
  artifactDigest: string | null;
  platforms: readonly AcceptancePlatform[];
  fictionalDataOnly: boolean;
  issuedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
};

export type BoundaryEvidence = {
  boundary: AcceptanceBoundary;
  evidenceId: string;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  artifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  passed: boolean;
  serverResolved: boolean;
};

export type CleanupEvidence = {
  scope: CleanupScope;
  evidenceId: string;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  artifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  completed: boolean;
  serverResolved: boolean;
};

export type DefectResolutionEvidence = {
  defectId: string;
  defectRevision: number;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  artifactDigest: string;
  verifiedAt: Date;
  resolved: boolean;
  serverResolved: boolean;
};

export type DefectWaiverEvidence = {
  defectId: string;
  defectRevision: number;
  candidateId: string;
  candidateRevision: number;
  authorityId: string;
  reason: string;
  issuedAt: Date;
  expiresAt: Date;
  approved: boolean;
  serverRecorded: boolean;
};

export type AcceptanceDefect = {
  id: string;
  revision: number;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  severity: 1 | 2 | 3 | 4;
  status: "OPEN" | "RESOLVED";
  resolution: DefectResolutionEvidence | null;
  waiver: DefectWaiverEvidence | null;
};

export type ClientGateAuthority = {
  gate: ClientReleaseGate;
  candidateId: string;
  candidateRevision: number;
  authorityId: string;
  decisionRevision: number;
  decision: "COMPLETE" | "REJECTED";
  decidedAt: Date;
  serverRecorded: boolean;
};

export type ClientGateEvidence = {
  gate: ClientReleaseGate;
  status: "COMPLETE" | "PENDING" | "REJECTED";
  authority: ClientGateAuthority | null;
};

export type CommercialSelectionEvidence = {
  decisionId: string;
  decisionRevision: number;
  candidateId: string;
  candidateRevision: number;
  model: Exclude<CommercialModel, "UNDECIDED">;
  authorityId: string;
  decidedAt: Date;
  approved: boolean;
  serverRecorded: boolean;
};

export type FullSystemAcceptanceDecision =
  | {
      status: "ready-for-go-no-go";
      candidate: CandidateIdentity;
      exactHeadEvidence: true;
      clientGatesComplete: true;
    }
  | {
      status: "ready-for-client-gates";
      candidate: CandidateIdentity;
      exactHeadEvidence: true;
      pendingClientGates: ClientReleaseGate[];
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

const ACCEPTANCE_PLATFORMS = ["WEB", "IOS", "ANDROID"] as const;
const COMMERCIAL_MODELS = ["UNDECIDED", "FREE", "SUBSCRIPTION"] as const;
const EVIDENCE_STATUSES = ["PASSED", "FAILED", "NOT_APPLICABLE"] as const;
const CLIENT_GATE_STATUSES = ["COMPLETE", "PENDING", "REJECTED"] as const;
const DEFECT_STATUSES = ["OPEN", "RESOLVED"] as const;

function validText(value: unknown, maximum = 200) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !/[\0\r\n]/.test(normalized)
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

function freshWindow(
  issuedAt: Date,
  expiresAt: Date,
  now: Date,
  maximumAge = ACCEPTANCE_EVIDENCE_MAX_AGE_MS,
) {
  return (
    validDate(issuedAt) &&
    validDate(expiresAt) &&
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <= maximumAge
  );
}

function validCandidate(candidate: CandidateIdentity) {
  if (typeof candidate !== "object" || candidate === null) return false;
  const buildNumber = Number(candidate.buildNumber);
  return (
    validText(candidate.candidateId) &&
    validRevision(candidate.revision) &&
    /^[a-f0-9]{40}$/.test(candidate.releaseCommit) &&
    /^dpl_[A-Za-z0-9]+$/.test(candidate.deploymentId) &&
    /^\d+\.\d+\.\d+$/.test(candidate.appVersion) &&
    /^[1-9]\d*$/.test(candidate.buildNumber) &&
    Number.isSafeInteger(buildNumber)
  );
}

function completeUniqueSet<T extends string>(
  actual: readonly T[],
  required: readonly T[],
) {
  return (
    new Set(actual).size === actual.length &&
    actual.length === required.length &&
    required.every((value) => actual.includes(value))
  );
}

function exactCandidate(
  value: {
    candidateId: string;
    candidateRevision: number;
    releaseCommit?: string;
  },
  candidate: CandidateIdentity,
) {
  return (
    value.candidateId === candidate.candidateId &&
    value.candidateRevision === candidate.revision &&
    (value.releaseCommit === undefined ||
      value.releaseCommit === candidate.releaseCommit)
  );
}

function validCandidateEvidenceShape(value: CandidateEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.evidenceId) &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    typeof value.deploymentId === "string" &&
    typeof value.appVersion === "string" &&
    typeof value.buildNumber === "string" &&
    validText(value.standardCiRunId) &&
    validText(value.nativeCiRunId) &&
    validDigest(value.standardArtifactDigest) &&
    validDigest(value.nativeArtifactDigest) &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.exactHead === "boolean" &&
    typeof value.standardCiPassed === "boolean" &&
    typeof value.nativeCiPassed === "boolean" &&
    typeof value.deploymentReady === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validAcceptanceEvidenceShape(value: AcceptanceEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.evidenceId) &&
    validRevision(value.revision) &&
    ACCEPTANCE_DOMAINS.includes(value.domain) &&
    EVIDENCE_STATUSES.includes(value.status) &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    (value.workflowRunId === null || validText(value.workflowRunId)) &&
    (value.jobId === null || validText(value.jobId)) &&
    typeof value.executable === "boolean" &&
    (value.artifactDigest === null || validDigest(value.artifactDigest)) &&
    Array.isArray(value.platforms) &&
    new Set(value.platforms).size === value.platforms.length &&
    value.platforms.every((platform) =>
      ACCEPTANCE_PLATFORMS.includes(platform),
    ) &&
    typeof value.fictionalDataOnly === "boolean" &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.serverResolved === "boolean"
  );
}

function validBoundaryShape(value: BoundaryEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    ACCEPTANCE_BOUNDARIES.includes(value.boundary) &&
    validText(value.evidenceId) &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    validDigest(value.artifactDigest) &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.passed === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validCleanupShape(value: CleanupEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    REQUIRED_CLEANUP_SCOPES.includes(value.scope) &&
    validText(value.evidenceId) &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    validDigest(value.artifactDigest) &&
    validDate(value.issuedAt) &&
    validDate(value.expiresAt) &&
    typeof value.completed === "boolean" &&
    typeof value.serverResolved === "boolean"
  );
}

function validDefectShape(value: AcceptanceDefect) {
  return (
    typeof value === "object" &&
    value !== null &&
    validText(value.id) &&
    validRevision(value.revision) &&
    validText(value.candidateId) &&
    validRevision(value.candidateRevision) &&
    typeof value.releaseCommit === "string" &&
    [1, 2, 3, 4].includes(value.severity) &&
    DEFECT_STATUSES.includes(value.status) &&
    (value.resolution === null ||
      (typeof value.resolution === "object" &&
        value.resolution !== null &&
        validText(value.resolution.defectId) &&
        validRevision(value.resolution.defectRevision) &&
        validText(value.resolution.candidateId) &&
        validRevision(value.resolution.candidateRevision) &&
        typeof value.resolution.releaseCommit === "string" &&
        validDigest(value.resolution.artifactDigest) &&
        validDate(value.resolution.verifiedAt) &&
        typeof value.resolution.resolved === "boolean" &&
        typeof value.resolution.serverResolved === "boolean")) &&
    (value.waiver === null ||
      (typeof value.waiver === "object" &&
        value.waiver !== null &&
        validText(value.waiver.defectId) &&
        validRevision(value.waiver.defectRevision) &&
        validText(value.waiver.candidateId) &&
        validRevision(value.waiver.candidateRevision) &&
        validText(value.waiver.authorityId) &&
        validText(value.waiver.reason, 500) &&
        validDate(value.waiver.issuedAt) &&
        validDate(value.waiver.expiresAt) &&
        typeof value.waiver.approved === "boolean" &&
        typeof value.waiver.serverRecorded === "boolean"))
  );
}

function validClientGateShape(value: ClientGateEvidence) {
  return (
    typeof value === "object" &&
    value !== null &&
    CLIENT_RELEASE_GATES.includes(value.gate) &&
    CLIENT_GATE_STATUSES.includes(value.status) &&
    (value.authority === null ||
      (typeof value.authority === "object" &&
        value.authority !== null &&
        CLIENT_RELEASE_GATES.includes(value.authority.gate) &&
        validText(value.authority.candidateId) &&
        validRevision(value.authority.candidateRevision) &&
        validText(value.authority.authorityId) &&
        validRevision(value.authority.decisionRevision) &&
        ["COMPLETE", "REJECTED"].includes(value.authority.decision) &&
        validDate(value.authority.decidedAt) &&
        typeof value.authority.serverRecorded === "boolean"))
  );
}

function validCommercialShape(value: CommercialSelectionEvidence | null) {
  return (
    value === null ||
    (typeof value === "object" &&
      validText(value.decisionId) &&
      validRevision(value.decisionRevision) &&
      validText(value.candidateId) &&
      validRevision(value.candidateRevision) &&
      ["FREE", "SUBSCRIPTION"].includes(value.model) &&
      validText(value.authorityId) &&
      validDate(value.decidedAt) &&
      typeof value.approved === "boolean" &&
      typeof value.serverRecorded === "boolean")
  );
}

export function decideFullSystemAcceptance({
  candidate,
  candidateEvidence,
  evidence,
  commercialModel,
  commercialSelection,
  defects,
  boundaries,
  cleanupEvidence,
  clientGates,
  now,
}: {
  candidate: CandidateIdentity;
  candidateEvidence: CandidateEvidence;
  evidence: readonly AcceptanceEvidence[];
  commercialModel: CommercialModel;
  commercialSelection: CommercialSelectionEvidence | null;
  defects: readonly AcceptanceDefect[];
  boundaries: readonly BoundaryEvidence[];
  cleanupEvidence: readonly CleanupEvidence[];
  clientGates: readonly ClientGateEvidence[];
  now: Date;
}): FullSystemAcceptanceDecision {
  if (
    !validCandidate(candidate) ||
    !validDate(now) ||
    !COMMERCIAL_MODELS.includes(commercialModel) ||
    !validCandidateEvidenceShape(candidateEvidence) ||
    !validCommercialShape(commercialSelection) ||
    !Array.isArray(evidence) ||
    !evidence.every(validAcceptanceEvidenceShape) ||
    !Array.isArray(defects) ||
    !defects.every(validDefectShape) ||
    !Array.isArray(boundaries) ||
    !boundaries.every(validBoundaryShape) ||
    !Array.isArray(cleanupEvidence) ||
    !cleanupEvidence.every(validCleanupShape) ||
    !Array.isArray(clientGates) ||
    !clientGates.every(validClientGateShape) ||
    !completeUniqueSet(
      clientGates.map((gate) => gate.gate),
      CLIENT_RELEASE_GATES,
    )
  ) {
    return { status: "unavailable" };
  }

  const reasons: string[] = [];
  const candidateProofMatches =
    exactCandidate(candidateEvidence, candidate) &&
    candidateEvidence.releaseCommit === candidate.releaseCommit &&
    candidateEvidence.deploymentId === candidate.deploymentId &&
    candidateEvidence.appVersion === candidate.appVersion &&
    candidateEvidence.buildNumber === candidate.buildNumber;
  if (
    !candidateProofMatches ||
    !freshWindow(candidateEvidence.issuedAt, candidateEvidence.expiresAt, now) ||
    candidateEvidence.exactHead !== true ||
    candidateEvidence.standardCiPassed !== true ||
    candidateEvidence.nativeCiPassed !== true ||
    candidateEvidence.deploymentReady !== true ||
    candidateEvidence.serverResolved !== true
  ) {
    reasons.push("candidate-evidence");
  }

  if (
    !completeUniqueSet(
      evidence.map((item) => item.domain),
      ACCEPTANCE_DOMAINS,
    )
  ) {
    reasons.push("acceptance-domain-coverage");
  }
  for (const item of evidence) {
    const domain = item.domain as AcceptanceDomain;
    const notApplicable =
      commercialModel === "FREE" &&
      domain === "COMMERCIAL_ENTITLEMENTS" &&
      item.status === "NOT_APPLICABLE";
    if (!exactCandidate(item, candidate)) {
      reasons.push(`domain:${domain}:candidate`);
    }
    if (
      !freshWindow(item.issuedAt, item.expiresAt, now) ||
      item.serverResolved !== true
    ) {
      reasons.push(`domain:${domain}:authority`);
    }
    if (notApplicable) {
      if (
        item.executable !== false ||
        item.artifactDigest !== null ||
        item.workflowRunId !== null ||
        item.jobId !== null ||
        item.platforms.length !== 0 ||
        item.fictionalDataOnly !== false
      ) {
        reasons.push(`domain:${domain}:not-applicable-shape`);
      }
      continue;
    }
    if (item.status !== "PASSED") reasons.push(`domain:${domain}:status`);
    if (
      item.executable !== true ||
      !validText(item.workflowRunId) ||
      !validText(item.jobId) ||
      !validDigest(item.artifactDigest)
    ) {
      reasons.push(`domain:${domain}:executable-evidence`);
    }
    if (
      !REQUIRED_PLATFORM_COVERAGE[domain].every((platform) =>
        item.platforms.includes(platform),
      )
    ) {
      reasons.push(`domain:${domain}:platform-coverage`);
    }
    if (item.fictionalDataOnly !== true) {
      reasons.push(`domain:${domain}:fixture-safety`);
    }
  }

  if (
    !completeUniqueSet(
      boundaries.map((item) => item.boundary),
      ACCEPTANCE_BOUNDARIES,
    )
  ) {
    reasons.push("acceptance-boundary-coverage");
  }
  for (const item of boundaries) {
    if (
      !exactCandidate(item, candidate) ||
      !freshWindow(item.issuedAt, item.expiresAt, now) ||
      item.passed !== true ||
      item.serverResolved !== true
    ) {
      reasons.push(`boundary:${item.boundary}`);
    }
  }

  if (
    !completeUniqueSet(
      cleanupEvidence.map((item) => item.scope),
      REQUIRED_CLEANUP_SCOPES,
    )
  ) {
    reasons.push("lifecycle-cleanup");
  }
  for (const item of cleanupEvidence) {
    if (
      !exactCandidate(item, candidate) ||
      !freshWindow(item.issuedAt, item.expiresAt, now) ||
      item.completed !== true ||
      item.serverResolved !== true
    ) {
      reasons.push(`cleanup:${item.scope}`);
    }
  }

  for (const defect of defects) {
    if (!exactCandidate(defect, candidate)) {
      reasons.push(`defect:${defect.id}:candidate`);
      continue;
    }
    if (defect.status === "RESOLVED") {
      const proof = defect.resolution;
      if (
        defect.waiver !== null ||
        !proof ||
        proof.defectId !== defect.id ||
        proof.defectRevision !== defect.revision ||
        !exactCandidate(proof, candidate) ||
        proof.resolved !== true ||
        proof.serverResolved !== true ||
        !validDate(proof.verifiedAt) ||
        proof.verifiedAt.getTime() > now.getTime()
      ) {
        reasons.push(`defect:${defect.id}:resolution`);
      }
      continue;
    }
    if (defect.resolution !== null || defect.severity <= 2) {
      reasons.push(`defect:${defect.id}:severity-${defect.severity}`);
      continue;
    }
    const waiver = defect.waiver;
    if (
      !waiver ||
      waiver.defectId !== defect.id ||
      waiver.defectRevision !== defect.revision ||
      !exactCandidate(waiver, candidate) ||
      !freshWindow(
        waiver.issuedAt,
        waiver.expiresAt,
        now,
        CLIENT_DECISION_MAX_AGE_MS,
      ) ||
      waiver.approved !== true ||
      waiver.serverRecorded !== true
    ) {
      reasons.push(`defect:${defect.id}:waiver`);
    }
  }

  if (commercialModel === "UNDECIDED") {
    reasons.push("commercial-model");
    if (commercialSelection !== null) reasons.push("commercial-selection");
  } else if (
    !commercialSelection ||
    commercialSelection.model !== commercialModel ||
    !exactCandidate(commercialSelection, candidate) ||
    !validDate(commercialSelection.decidedAt) ||
    commercialSelection.decidedAt.getTime() > now.getTime() ||
    now.getTime() - commercialSelection.decidedAt.getTime() >
      CLIENT_DECISION_MAX_AGE_MS ||
    commercialSelection.approved !== true ||
    commercialSelection.serverRecorded !== true
  ) {
    reasons.push("commercial-selection");
  }

  for (const gate of clientGates) {
    if (gate.status === "PENDING") {
      if (gate.authority !== null) {
        reasons.push(`client-gate:${gate.gate}:authority`);
      }
      continue;
    }
    const authority = gate.authority;
    if (
      !authority ||
      authority.gate !== gate.gate ||
      authority.decision !== gate.status ||
      !exactCandidate(authority, candidate) ||
      !validDate(authority.decidedAt) ||
      authority.decidedAt.getTime() > now.getTime() ||
      now.getTime() - authority.decidedAt.getTime() >
        CLIENT_DECISION_MAX_AGE_MS ||
      authority.serverRecorded !== true
    ) {
      reasons.push(`client-gate:${gate.gate}:authority`);
    }
    if (gate.status === "REJECTED") {
      reasons.push(`client-gate:${gate.gate}:rejected`);
    }
  }

  const uniqueReasons = [...new Set(reasons)].sort();
  if (uniqueReasons.length > 0) {
    return { status: "blocked", reasons: uniqueReasons };
  }

  const pendingClientGates = clientGates
    .filter((gate) => gate.status === "PENDING")
    .map((gate) => gate.gate);
  if (pendingClientGates.length > 0) {
    return {
      status: "ready-for-client-gates",
      candidate,
      exactHeadEvidence: true,
      pendingClientGates,
    };
  }

  return {
    status: "ready-for-go-no-go",
    candidate,
    exactHeadEvidence: true,
    clientGatesComplete: true,
  };
}
