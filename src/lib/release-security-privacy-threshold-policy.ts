import type { CandidateIdentity } from "./full-system-acceptance-policy";

export const RELEASE_SECURITY_PRIVACY_POLICY_VERSION =
  "homevault-release-security-privacy-thresholds-v1";

export const SECURITY_PRIVACY_EVIDENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const REQUIRED_AUTHORIZATION_CASES = [
  "SIGNED_OUT_READ",
  "UNVERIFIED_IDENTITY_READ",
  "MISSING_MEMBERSHIP_READ",
  "CHILD_WRITE",
  "GUEST_WRITE",
  "CROSS_HOUSEHOLD_READ",
  "CROSS_HOUSEHOLD_WRITE",
  "CROSS_PROPERTY_READ",
  "CROSS_PROPERTY_WRITE",
  "UNKNOWN_RECORD_EXISTENCE",
  "NON_OWNER_ADMINISTRATION",
  "REPLAYED_OR_SUBSTITUTED_GRANT",
] as const;

export const REQUIRED_BROWSER_CONTROLS = [
  "CONTENT_SECURITY_POLICY",
  "FRAME_ANCESTORS_NONE",
  "HSTS",
  "MIME_NOSNIFF",
  "STRICT_REFERRER",
  "CROSS_ORIGIN_OPENER",
  "CROSS_ORIGIN_RESOURCE",
  "CAMERA_DENIED",
  "MICROPHONE_DENIED",
  "GEOLOCATION_DENIED",
  "PAYMENT_DENIED",
  "USB_DENIED",
] as const;

export const PROHIBITED_OUTBOUND_CATEGORIES = [
  "ADVERTISING",
  "TRACKING",
  "BEHAVIOURAL_ANALYTICS",
  "AUTOMATED_PROVIDER_PAYMENT",
  "UNRESTRICTED_PUBLIC_ATTACHMENT",
  "UNAPPROVED_PROCESSOR",
  "UNCONFIRMED_OCR_OR_AI_PERSISTENCE",
] as const;

export type AuthorizationCase =
  (typeof REQUIRED_AUTHORIZATION_CASES)[number];
export type BrowserControl = (typeof REQUIRED_BROWSER_CONTROLS)[number];
export type ProhibitedOutboundCategory =
  (typeof PROHIBITED_OUTBOUND_CATEGORIES)[number];
export type SecurityPrivacyEvidenceKind =
  | "AUTHORIZATION"
  | "PRIVATE_FILES"
  | "BROWSER_SECURITY"
  | "SUPPLY_CHAIN"
  | "OUTBOUND_PRIVACY";

type EvidenceBinding = {
  evidenceId: string;
  revision: number;
  kind: SecurityPrivacyEvidenceKind;
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

export type AuthorizationCaseResult = {
  caseId: AuthorizationCase;
  attempts: number;
  unauthorizedDisclosures: number;
  unauthorizedMutations: number;
  revealedRecordExistence: number;
  nonRevealingResponseVerified: boolean;
};

export type AuthorizationThresholdEvidence = EvidenceBinding & {
  kind: "AUTHORIZATION";
  cases: readonly AuthorizationCaseResult[];
};

export type PrivateFileThresholdEvidence = EvidenceBinding & {
  kind: "PRIVATE_FILES";
  attemptedDownloads: number;
  attemptedMutations: number;
  unauthorizedDownloads: number;
  unauthorizedMutations: number;
  directProviderUrlExposures: number;
  cacheablePrivateResponses: number;
  mimeSniffingFailures: number;
  quarantineBypasses: number;
  orphanedPrivateObjects: number;
};

export type BrowserControlResult = {
  control: BrowserControl;
  routesChecked: number;
  failures: number;
  exactValueVerified: boolean;
};

export type BrowserSecurityThresholdEvidence = EvidenceBinding & {
  kind: "BROWSER_SECURITY";
  controls: readonly BrowserControlResult[];
  unexpectedPermissionPrompts: number;
  unsafeEvalFindings: number;
  mixedContentFindings: number;
  indexablePrivateRoutes: number;
};

export type SupplyChainThresholdEvidence = EvidenceBinding & {
  kind: "SUPPLY_CHAIN";
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  committedSecretFindings: number;
  sensitiveSourceMapFindings: number;
  unapprovedRuntimeDependencies: number;
  lockfileDriftFindings: number;
  workflowPrivilegeEscalations: number;
  releaseSourceMismatches: number;
  dependencyInventoryComplete: boolean;
};

export type ProhibitedOutboundResult = {
  category: ProhibitedOutboundCategory;
  observedRequests: number;
};

export type OutboundPrivacyThresholdEvidence = EvidenceBinding & {
  kind: "OUTBOUND_PRIVACY";
  prohibited: readonly ProhibitedOutboundResult[];
  observedHostCount: number;
  approvedHostCount: number;
  unapprovedHosts: number;
  householdPayloadsToUnapprovedHosts: number;
  privateIdentifiersInDiagnosticPayloads: number;
  processorInventoryComplete: boolean;
};

export type SecurityPrivacyThresholdEvidence =
  | AuthorizationThresholdEvidence
  | PrivateFileThresholdEvidence
  | BrowserSecurityThresholdEvidence
  | SupplyChainThresholdEvidence
  | OutboundPrivacyThresholdEvidence;

export type SecurityPrivacyThresholdDecision =
  | {
      status: "ready-for-regression-evidence";
      candidate: CandidateIdentity;
      thresholdsVerified: true;
    }
  | { status: "blocked"; reasons: string[] }
  | { status: "unavailable" };

export function decideSecurityPrivacyThresholds(input: {
  candidate: CandidateIdentity;
  evidence: readonly SecurityPrivacyThresholdEvidence[];
  now: Date;
}): SecurityPrivacyThresholdDecision {
  if (!isCandidate(input.candidate) || !isDate(input.now)) {
    return { status: "unavailable" };
  }
  if (!Array.isArray(input.evidence)) {
    return { status: "unavailable" };
  }

  const byKind = new Map<
    SecurityPrivacyEvidenceKind,
    SecurityPrivacyThresholdEvidence
  >();
  for (const evidence of input.evidence) {
    if (!isEvidence(evidence) || byKind.has(evidence.kind)) {
      return { status: "unavailable" };
    }
    byKind.set(evidence.kind, evidence);
  }

  const reasons: string[] = [];
  for (const kind of [
    "AUTHORIZATION",
    "PRIVATE_FILES",
    "BROWSER_SECURITY",
    "SUPPLY_CHAIN",
    "OUTBOUND_PRIVACY",
  ] as const) {
    const evidence = byKind.get(kind);
    if (!evidence) {
      reasons.push(`security:${kind}:missing`);
      continue;
    }
    validateBinding(evidence, input.candidate, input.now, reasons);
    if (evidence.kind === "AUTHORIZATION") {
      validateAuthorization(evidence, reasons);
    } else if (evidence.kind === "PRIVATE_FILES") {
      validatePrivateFiles(evidence, reasons);
    } else if (evidence.kind === "BROWSER_SECURITY") {
      validateBrowserSecurity(evidence, reasons);
    } else if (evidence.kind === "SUPPLY_CHAIN") {
      validateSupplyChain(evidence, reasons);
    } else {
      validateOutboundPrivacy(evidence, reasons);
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
  evidence: SecurityPrivacyThresholdEvidence,
  candidate: CandidateIdentity,
  now: Date,
  reasons: string[],
) {
  const prefix = `security:${evidence.kind}`;
  if (
    evidence.candidateId !== candidate.candidateId ||
    evidence.candidateRevision !== candidate.revision ||
    evidence.releaseCommit !== candidate.releaseCommit
  ) {
    reasons.push(`${prefix}:candidate-mismatch`);
  }
  if (!evidence.executable) reasons.push(`${prefix}:not-executable`);
  if (!evidence.fictionalDataOnly) reasons.push(`${prefix}:non-fictional-data`);
  if (!evidence.serverResolved) reasons.push(`${prefix}:not-server-resolved`);
  if (
    evidence.issuedAt.getTime() > now.getTime() ||
    evidence.expiresAt.getTime() <= now.getTime() ||
    evidence.expiresAt.getTime() <= evidence.issuedAt.getTime() ||
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() >
      SECURITY_PRIVACY_EVIDENCE_MAX_AGE_MS
  ) {
    reasons.push(`${prefix}:stale`);
  }
}

function validateAuthorization(
  evidence: AuthorizationThresholdEvidence,
  reasons: string[],
) {
  const prefix = "security:AUTHORIZATION";
  const cases = new Map<AuthorizationCase, AuthorizationCaseResult>();
  for (const result of evidence.cases) {
    if (cases.has(result.caseId)) {
      reasons.push(`${prefix}:duplicate-case`);
      continue;
    }
    cases.set(result.caseId, result);
  }
  for (const caseId of REQUIRED_AUTHORIZATION_CASES) {
    const result = cases.get(caseId);
    if (!result) {
      reasons.push(`${prefix}:${caseId}:missing`);
      continue;
    }
    if (result.attempts < 1) reasons.push(`${prefix}:${caseId}:not-executed`);
    if (
      result.unauthorizedDisclosures !== 0 ||
      result.unauthorizedMutations !== 0 ||
      result.revealedRecordExistence !== 0 ||
      !result.nonRevealingResponseVerified
    ) {
      reasons.push(`${prefix}:${caseId}:boundary-failed`);
    }
  }
}

function validatePrivateFiles(
  evidence: PrivateFileThresholdEvidence,
  reasons: string[],
) {
  const prefix = "security:PRIVATE_FILES";
  if (evidence.attemptedDownloads < 1 || evidence.attemptedMutations < 1) {
    reasons.push(`${prefix}:negative-controls-not-executed`);
  }
  if (
    evidence.unauthorizedDownloads !== 0 ||
    evidence.unauthorizedMutations !== 0 ||
    evidence.directProviderUrlExposures !== 0 ||
    evidence.cacheablePrivateResponses !== 0 ||
    evidence.mimeSniffingFailures !== 0 ||
    evidence.quarantineBypasses !== 0 ||
    evidence.orphanedPrivateObjects !== 0
  ) {
    reasons.push(`${prefix}:boundary-failed`);
  }
}

function validateBrowserSecurity(
  evidence: BrowserSecurityThresholdEvidence,
  reasons: string[],
) {
  const prefix = "security:BROWSER_SECURITY";
  const controls = new Map<BrowserControl, BrowserControlResult>();
  for (const result of evidence.controls) {
    if (controls.has(result.control)) {
      reasons.push(`${prefix}:duplicate-control`);
      continue;
    }
    controls.set(result.control, result);
  }
  for (const control of REQUIRED_BROWSER_CONTROLS) {
    const result = controls.get(control);
    if (!result) {
      reasons.push(`${prefix}:${control}:missing`);
      continue;
    }
    if (
      result.routesChecked < 1 ||
      result.failures !== 0 ||
      !result.exactValueVerified
    ) {
      reasons.push(`${prefix}:${control}:failed`);
    }
  }
  if (
    evidence.unexpectedPermissionPrompts !== 0 ||
    evidence.unsafeEvalFindings !== 0 ||
    evidence.mixedContentFindings !== 0 ||
    evidence.indexablePrivateRoutes !== 0
  ) {
    reasons.push(`${prefix}:runtime-failed`);
  }
}

function validateSupplyChain(
  evidence: SupplyChainThresholdEvidence,
  reasons: string[],
) {
  const prefix = "security:SUPPLY_CHAIN";
  if (
    evidence.criticalVulnerabilities !== 0 ||
    evidence.highVulnerabilities !== 0 ||
    evidence.committedSecretFindings !== 0 ||
    evidence.sensitiveSourceMapFindings !== 0 ||
    evidence.unapprovedRuntimeDependencies !== 0 ||
    evidence.lockfileDriftFindings !== 0 ||
    evidence.workflowPrivilegeEscalations !== 0 ||
    evidence.releaseSourceMismatches !== 0 ||
    !evidence.dependencyInventoryComplete
  ) {
    reasons.push(`${prefix}:threshold-failed`);
  }
}

function validateOutboundPrivacy(
  evidence: OutboundPrivacyThresholdEvidence,
  reasons: string[],
) {
  const prefix = "security:OUTBOUND_PRIVACY";
  const prohibited = new Map<
    ProhibitedOutboundCategory,
    ProhibitedOutboundResult
  >();
  for (const result of evidence.prohibited) {
    if (prohibited.has(result.category)) {
      reasons.push(`${prefix}:duplicate-category`);
      continue;
    }
    prohibited.set(result.category, result);
  }
  for (const category of PROHIBITED_OUTBOUND_CATEGORIES) {
    const result = prohibited.get(category);
    if (!result) {
      reasons.push(`${prefix}:${category}:missing`);
    } else if (result.observedRequests !== 0) {
      reasons.push(`${prefix}:${category}:observed`);
    }
  }
  if (
    evidence.observedHostCount !== evidence.approvedHostCount ||
    evidence.unapprovedHosts !== 0 ||
    evidence.householdPayloadsToUnapprovedHosts !== 0 ||
    evidence.privateIdentifiersInDiagnosticPayloads !== 0 ||
    !evidence.processorInventoryComplete
  ) {
    reasons.push(`${prefix}:processor-boundary-failed`);
  }
}

function isEvidence(value: unknown): value is SecurityPrivacyThresholdEvidence {
  if (!isRecord(value) || !isBinding(value)) return false;
  if (value.kind === "AUTHORIZATION") {
    return (
      Array.isArray(value.cases) &&
      value.cases.every((result) => isAuthorizationCaseResult(result))
    );
  }
  if (value.kind === "PRIVATE_FILES") {
    return [
      value.attemptedDownloads,
      value.attemptedMutations,
      value.unauthorizedDownloads,
      value.unauthorizedMutations,
      value.directProviderUrlExposures,
      value.cacheablePrivateResponses,
      value.mimeSniffingFailures,
      value.quarantineBypasses,
      value.orphanedPrivateObjects,
    ].every(isNonNegativeInteger);
  }
  if (value.kind === "BROWSER_SECURITY") {
    return (
      Array.isArray(value.controls) &&
      value.controls.every((result) => isBrowserControlResult(result)) &&
      [
        value.unexpectedPermissionPrompts,
        value.unsafeEvalFindings,
        value.mixedContentFindings,
        value.indexablePrivateRoutes,
      ].every(isNonNegativeInteger)
    );
  }
  if (value.kind === "SUPPLY_CHAIN") {
    return (
      [
        value.criticalVulnerabilities,
        value.highVulnerabilities,
        value.committedSecretFindings,
        value.sensitiveSourceMapFindings,
        value.unapprovedRuntimeDependencies,
        value.lockfileDriftFindings,
        value.workflowPrivilegeEscalations,
        value.releaseSourceMismatches,
      ].every(isNonNegativeInteger) &&
      isBoolean(value.dependencyInventoryComplete)
    );
  }
  if (value.kind === "OUTBOUND_PRIVACY") {
    return (
      Array.isArray(value.prohibited) &&
      value.prohibited.every((result) => isProhibitedOutboundResult(result)) &&
      [
        value.observedHostCount,
        value.approvedHostCount,
        value.unapprovedHosts,
        value.householdPayloadsToUnapprovedHosts,
        value.privateIdentifiersInDiagnosticPayloads,
      ].every(isNonNegativeInteger) &&
      isBoolean(value.processorInventoryComplete)
    );
  }
  return false;
}

function isBinding(value: Record<string, unknown>) {
  return (
    isKind(value.kind) &&
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

function isAuthorizationCaseResult(
  value: unknown,
): value is AuthorizationCaseResult {
  return (
    isRecord(value) &&
    isAuthorizationCase(value.caseId) &&
    isNonNegativeInteger(value.attempts) &&
    isNonNegativeInteger(value.unauthorizedDisclosures) &&
    isNonNegativeInteger(value.unauthorizedMutations) &&
    isNonNegativeInteger(value.revealedRecordExistence) &&
    isBoolean(value.nonRevealingResponseVerified)
  );
}

function isBrowserControlResult(value: unknown): value is BrowserControlResult {
  return (
    isRecord(value) &&
    isBrowserControl(value.control) &&
    isNonNegativeInteger(value.routesChecked) &&
    isNonNegativeInteger(value.failures) &&
    isBoolean(value.exactValueVerified)
  );
}

function isProhibitedOutboundResult(
  value: unknown,
): value is ProhibitedOutboundResult {
  return (
    isRecord(value) &&
    isProhibitedCategory(value.category) &&
    isNonNegativeInteger(value.observedRequests)
  );
}

function isCandidate(value: unknown): value is CandidateIdentity {
  if (!isRecord(value)) return false;
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

function isKind(value: unknown): value is SecurityPrivacyEvidenceKind {
  return (
    value === "AUTHORIZATION" ||
    value === "PRIVATE_FILES" ||
    value === "BROWSER_SECURITY" ||
    value === "SUPPLY_CHAIN" ||
    value === "OUTBOUND_PRIVACY"
  );
}

function isAuthorizationCase(value: unknown): value is AuthorizationCase {
  return (REQUIRED_AUTHORIZATION_CASES as readonly unknown[]).includes(value);
}

function isBrowserControl(value: unknown): value is BrowserControl {
  return (REQUIRED_BROWSER_CONTROLS as readonly unknown[]).includes(value);
}

function isProhibitedCategory(
  value: unknown,
): value is ProhibitedOutboundCategory {
  return (PROHIBITED_OUTBOUND_CATEGORIES as readonly unknown[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 200 &&
    !/[\0\r\n]/.test(value)
  );
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
