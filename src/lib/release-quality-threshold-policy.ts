import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const RELEASE_QUALITY_THRESHOLD_POLICY_VERSION =
  "homevault-release-quality-thresholds-v1";

export const QUALITY_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const WEB_PERFORMANCE_THRESHOLDS = {
  minimumSampleSize: 20,
  lcpP75Ms: 2_500,
  inpP75Ms: 200,
  clsP75: 0.1,
  apiP95Ms: 750,
  serverErrorRatePercent: 1,
} as const;

export const REQUIRED_EXPORT_CASES = [
  "HOUSEHOLD_JSON",
  "INVENTORY_CSV",
  "MAINTENANCE_CSV",
  "CALENDAR_ICS",
] as const;

export const REQUIRED_DELETION_SCOPES = [
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

export type ExportCaseId = (typeof REQUIRED_EXPORT_CASES)[number];
export type DeletionScope = (typeof REQUIRED_DELETION_SCOPES)[number];
export type QualityEvidenceKind =
  | "ACCESSIBILITY"
  | "PERFORMANCE"
  | "EXPORT"
  | "DELETION";

type EvidenceBinding = {
  evidenceId: string;
  revision: number;
  kind: QualityEvidenceKind;
  candidateId: string;
  candidateRevision: number;
  releaseCommit: string;
  workflowRunId: string;
  jobId: string;
  artifactDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  executable: boolean;
  fictionalDataOnly: boolean;
  serverResolved: boolean;
};

export type AccessibilityThresholdEvidence = EvidenceBinding & {
  kind: "ACCESSIBILITY";
  auditedPageCount: number;
  automatedCriticalViolations: number;
  automatedSeriousViolations: number;
  keyboardBlockedJourneys: number;
  missingVisibleFocusCases: number;
  touchTargetFailures: number;
  contrastFailures: number;
  layoutOverflowFailures: number;
  textScaleFailures: number;
};

export type PerformanceThresholdEvidence = EvidenceBinding & {
  kind: "PERFORMANCE";
  sampleSize: number;
  lcpP75Ms: number;
  inpP75Ms: number;
  clsP75: number;
  apiP95Ms: number;
  serverErrorRatePercent: number;
  criticalRuntimeErrors: number;
};

export type ExportCaseResult = {
  caseId: ExportCaseId;
  rowsExpected: number;
  rowsExported: number;
  missingRows: number;
  duplicateRows: number;
  wrongPropertyRows: number;
  privateFileReferences: number;
  secretFindings: number;
  unsafeSpreadsheetCells: number;
  noStoreVerified: boolean;
  schemaVerified: boolean;
};

export type ExportThresholdEvidence = EvidenceBinding & {
  kind: "EXPORT";
  cases: readonly ExportCaseResult[];
};

export type DeletionScopeResult = {
  scope: DeletionScope;
  objectsExpected: number;
  objectsDeleted: number;
  objectsRetained: number;
  failedOperations: number;
  pendingRetries: number;
};

export type DeletionThresholdEvidence = EvidenceBinding & {
  kind: "DELETION";
  requestId: string;
  userId: string;
  propertyId: string | null;
  scopes: readonly DeletionScopeResult[];
  accessRevoked: boolean;
  recoveryTokensInvalidated: boolean;
  notificationTokensInvalidated: boolean;
  shareTokensInvalidated: boolean;
};

export type QualityThresholdEvidence =
  | AccessibilityThresholdEvidence
  | PerformanceThresholdEvidence
  | ExportThresholdEvidence
  | DeletionThresholdEvidence;

export type ReleaseQualityThresholdDecision =
  | {
      status: "ready-for-regression-evidence";
      candidate: CandidateIdentity;
      thresholdsVerified: true;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

export function decideReleaseQualityThresholds(input: {
  candidate: CandidateIdentity;
  evidence: readonly QualityThresholdEvidence[];
  now: Date;
}): ReleaseQualityThresholdDecision {
  if (!isCandidate(input.candidate) || !isDate(input.now)) {
    return { status: "unavailable" };
  }
  if (!Array.isArray(input.evidence)) {
    return { status: "unavailable" };
  }

  const byKind = new Map<QualityEvidenceKind, QualityThresholdEvidence>();
  for (const evidence of input.evidence) {
    if (!isQualityEvidence(evidence)) {
      return { status: "unavailable" };
    }
    if (byKind.has(evidence.kind)) {
      return { status: "unavailable" };
    }
    byKind.set(evidence.kind, evidence);
  }

  const reasons: string[] = [];
  for (const kind of [
    "ACCESSIBILITY",
    "PERFORMANCE",
    "EXPORT",
    "DELETION",
  ] as const) {
    const evidence = byKind.get(kind);
    if (!evidence) {
      reasons.push(`quality:${kind}:missing`);
      continue;
    }
    validateBinding(evidence, input.candidate, input.now, reasons);
    if (evidence.kind === "ACCESSIBILITY") {
      validateAccessibility(evidence, reasons);
    } else if (evidence.kind === "PERFORMANCE") {
      validatePerformance(evidence, reasons);
    } else if (evidence.kind === "EXPORT") {
      validateExport(evidence, reasons);
    } else {
      validateDeletion(evidence, reasons);
    }
  }

  if (reasons.length > 0) {
    return { status: "blocked", reasons: [...new Set(reasons)].sort() };
  }

  return {
    status: "ready-for-regression-evidence",
    candidate: input.candidate,
    thresholdsVerified: true,
  };
}

function validateBinding(
  evidence: QualityThresholdEvidence,
  candidate: CandidateIdentity,
  now: Date,
  reasons: string[],
) {
  const prefix = `quality:${evidence.kind}`;
  if (
    evidence.candidateId !== candidate.candidateId ||
    evidence.candidateRevision !== candidate.revision ||
    evidence.releaseCommit !== candidate.releaseCommit
  ) {
    reasons.push(`${prefix}:candidate-mismatch`);
  }
  if (!evidence.executable) {
    reasons.push(`${prefix}:not-executable`);
  }
  if (!evidence.fictionalDataOnly) {
    reasons.push(`${prefix}:non-fictional-data`);
  }
  if (!evidence.serverResolved) {
    reasons.push(`${prefix}:not-server-resolved`);
  }
  if (
    evidence.issuedAt.getTime() > now.getTime() ||
    evidence.expiresAt.getTime() <= now.getTime() ||
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() >
      QUALITY_EVIDENCE_MAX_AGE_MS
  ) {
    reasons.push(`${prefix}:stale`);
  }
}

function validateAccessibility(
  evidence: AccessibilityThresholdEvidence,
  reasons: string[],
) {
  const prefix = "quality:ACCESSIBILITY";
  if (evidence.auditedPageCount < 1) {
    reasons.push(`${prefix}:no-pages`);
  }
  const zeroFailureMetrics = [
    evidence.automatedCriticalViolations,
    evidence.automatedSeriousViolations,
    evidence.keyboardBlockedJourneys,
    evidence.missingVisibleFocusCases,
    evidence.touchTargetFailures,
    evidence.contrastFailures,
    evidence.layoutOverflowFailures,
    evidence.textScaleFailures,
  ];
  if (zeroFailureMetrics.some((value) => value !== 0)) {
    reasons.push(`${prefix}:threshold-failed`);
  }
}

function validatePerformance(
  evidence: PerformanceThresholdEvidence,
  reasons: string[],
) {
  const prefix = "quality:PERFORMANCE";
  if (evidence.sampleSize < WEB_PERFORMANCE_THRESHOLDS.minimumSampleSize) {
    reasons.push(`${prefix}:insufficient-samples`);
  }
  if (
    evidence.lcpP75Ms > WEB_PERFORMANCE_THRESHOLDS.lcpP75Ms ||
    evidence.inpP75Ms > WEB_PERFORMANCE_THRESHOLDS.inpP75Ms ||
    evidence.clsP75 > WEB_PERFORMANCE_THRESHOLDS.clsP75 ||
    evidence.apiP95Ms > WEB_PERFORMANCE_THRESHOLDS.apiP95Ms ||
    evidence.serverErrorRatePercent >
      WEB_PERFORMANCE_THRESHOLDS.serverErrorRatePercent ||
    evidence.criticalRuntimeErrors !== 0
  ) {
    reasons.push(`${prefix}:budget-exceeded`);
  }
}

function validateExport(
  evidence: ExportThresholdEvidence,
  reasons: string[],
) {
  const prefix = "quality:EXPORT";
  const cases = new Map<ExportCaseId, ExportCaseResult>();
  for (const result of evidence.cases) {
    if (cases.has(result.caseId)) {
      reasons.push(`${prefix}:duplicate-case`);
      continue;
    }
    cases.set(result.caseId, result);
  }
  for (const caseId of REQUIRED_EXPORT_CASES) {
    const result = cases.get(caseId);
    if (!result) {
      reasons.push(`${prefix}:${caseId}:missing`);
      continue;
    }
    if (
      result.rowsExpected !== result.rowsExported ||
      result.missingRows !== 0 ||
      result.duplicateRows !== 0 ||
      result.wrongPropertyRows !== 0
    ) {
      reasons.push(`${prefix}:${caseId}:record-mismatch`);
    }
    if (
      result.privateFileReferences !== 0 ||
      result.secretFindings !== 0 ||
      result.unsafeSpreadsheetCells !== 0 ||
      !result.noStoreVerified ||
      !result.schemaVerified
    ) {
      reasons.push(`${prefix}:${caseId}:privacy-or-format-failed`);
    }
  }
}

function validateDeletion(
  evidence: DeletionThresholdEvidence,
  reasons: string[],
) {
  const prefix = "quality:DELETION";
  const scopes = new Map<DeletionScope, DeletionScopeResult>();
  for (const result of evidence.scopes) {
    if (scopes.has(result.scope)) {
      reasons.push(`${prefix}:duplicate-scope`);
      continue;
    }
    scopes.set(result.scope, result);
  }
  for (const scope of REQUIRED_DELETION_SCOPES) {
    const result = scopes.get(scope);
    if (!result) {
      reasons.push(`${prefix}:${scope}:missing`);
      continue;
    }
    if (
      result.objectsExpected !== result.objectsDeleted ||
      result.objectsRetained !== 0 ||
      result.failedOperations !== 0 ||
      result.pendingRetries !== 0
    ) {
      reasons.push(`${prefix}:${scope}:incomplete`);
    }
  }
  if (
    !evidence.accessRevoked ||
    !evidence.recoveryTokensInvalidated ||
    !evidence.notificationTokensInvalidated ||
    !evidence.shareTokensInvalidated
  ) {
    reasons.push(`${prefix}:credentials-or-access-active`);
  }
}

function isQualityEvidence(value: unknown): value is QualityThresholdEvidence {
  if (!isRecord(value) || !isBinding(value)) {
    return false;
  }
  if (value.kind === "ACCESSIBILITY") {
    return [
      value.auditedPageCount,
      value.automatedCriticalViolations,
      value.automatedSeriousViolations,
      value.keyboardBlockedJourneys,
      value.missingVisibleFocusCases,
      value.touchTargetFailures,
      value.contrastFailures,
      value.layoutOverflowFailures,
      value.textScaleFailures,
    ].every(isNonNegativeInteger);
  }
  if (value.kind === "PERFORMANCE") {
    return (
      isNonNegativeInteger(value.sampleSize) &&
      isNonNegativeNumber(value.lcpP75Ms) &&
      isNonNegativeNumber(value.inpP75Ms) &&
      isNonNegativeNumber(value.clsP75) &&
      isNonNegativeNumber(value.apiP95Ms) &&
      isNonNegativeNumber(value.serverErrorRatePercent) &&
      isNonNegativeInteger(value.criticalRuntimeErrors)
    );
  }
  if (value.kind === "EXPORT") {
    return (
      Array.isArray(value.cases) &&
      value.cases.every((result) => isExportCaseResult(result))
    );
  }
  if (value.kind === "DELETION") {
    return (
      isIdentifier(value.requestId) &&
      isIdentifier(value.userId) &&
      (value.propertyId === null || isIdentifier(value.propertyId)) &&
      Array.isArray(value.scopes) &&
      value.scopes.every((result) => isDeletionScopeResult(result)) &&
      isBoolean(value.accessRevoked) &&
      isBoolean(value.recoveryTokensInvalidated) &&
      isBoolean(value.notificationTokensInvalidated) &&
      isBoolean(value.shareTokensInvalidated)
    );
  }
  return false;
}

function isBinding(value: Record<string, unknown>) {
  return (
    isQualityEvidenceKind(value.kind) &&
    isIdentifier(value.evidenceId) &&
    isPositiveInteger(value.revision) &&
    isIdentifier(value.candidateId) &&
    isPositiveInteger(value.candidateRevision) &&
    isCommit(value.releaseCommit) &&
    isIdentifier(value.workflowRunId) &&
    isIdentifier(value.jobId) &&
    isDigest(value.artifactDigest) &&
    isDate(value.issuedAt) &&
    isDate(value.expiresAt) &&
    isBoolean(value.executable) &&
    isBoolean(value.fictionalDataOnly) &&
    isBoolean(value.serverResolved)
  );
}

function isExportCaseResult(value: unknown): value is ExportCaseResult {
  if (!isRecord(value) || !isExportCaseId(value.caseId)) {
    return false;
  }
  return (
    [
      value.rowsExpected,
      value.rowsExported,
      value.missingRows,
      value.duplicateRows,
      value.wrongPropertyRows,
      value.privateFileReferences,
      value.secretFindings,
      value.unsafeSpreadsheetCells,
    ].every(isNonNegativeInteger) &&
    isBoolean(value.noStoreVerified) &&
    isBoolean(value.schemaVerified)
  );
}

function isDeletionScopeResult(
  value: unknown,
): value is DeletionScopeResult {
  if (!isRecord(value) || !isDeletionScope(value.scope)) {
    return false;
  }
  return [
    value.objectsExpected,
    value.objectsDeleted,
    value.objectsRetained,
    value.failedOperations,
    value.pendingRetries,
  ].every(isNonNegativeInteger);
}

function isCandidate(value: unknown): value is CandidateIdentity {
  if (!isRecord(value)) {
    return false;
  }
  const buildNumber =
    typeof value.buildNumber === "string" ? Number(value.buildNumber) : NaN;
  return (
    isIdentifier(value.candidateId) &&
    isPositiveInteger(value.revision) &&
    isCommit(value.releaseCommit) &&
    typeof value.deploymentId === "string" &&
    /^dpl_[A-Za-z0-9]+$/.test(value.deploymentId) &&
    typeof value.appVersion === "string" &&
    /^\d+\.\d+\.\d+$/.test(value.appVersion) &&
    typeof value.buildNumber === "string" &&
    /^[1-9]\d*$/.test(value.buildNumber) &&
    Number.isSafeInteger(buildNumber)
  );
}

function isQualityEvidenceKind(value: unknown): value is QualityEvidenceKind {
  return (
    value === "ACCESSIBILITY" ||
    value === "PERFORMANCE" ||
    value === "EXPORT" ||
    value === "DELETION"
  );
}

function isExportCaseId(value: unknown): value is ExportCaseId {
  return (REQUIRED_EXPORT_CASES as readonly unknown[]).includes(value);
}

function isDeletionScope(value: unknown): value is DeletionScope {
  return (REQUIRED_DELETION_SCOPES as readonly unknown[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isCommit(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{40}$/.test(value);
}

function isDigest(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isPositiveInteger(value: unknown) {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function isNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
