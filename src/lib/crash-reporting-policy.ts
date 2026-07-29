import { createHash } from "node:crypto";

export const CRASH_REPORTING_POLICY_VERSION = "homevault-crash-reporting-v1";
export const CRASH_REPORT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const CRASH_PROCESSOR_SUBJECT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const CRASH_EVIDENCE_MAX_AGE_MS = 10 * 60 * 1000;
export const CRASH_REPORT_RETENTION_MAX_DAYS = 14;
export const CRASH_REPORT_MAX_MESSAGE_CHARACTERS = 500;
export const CRASH_REPORT_MAX_STACK_FRAMES = 80;
export const CRASH_REPORT_MAX_BREADCRUMBS = 20;

export const CRASH_CATEGORIES = [
  "FATAL",
  "UNHANDLED_EXCEPTION",
  "NATIVE_CRASH",
  "ANR",
] as const;

export const CRASH_BREADCRUMBS = [
  "APP_STARTED",
  "APP_BACKGROUNDED",
  "APP_FOREGROUNDED",
  "AUTHENTICATION_STATE_CHANGED",
  "CONNECTIVITY_CHANGED",
  "MEMORY_PRESSURE",
] as const;

const CRASH_PLATFORMS = ["IOS", "ANDROID", "WEB"] as const;
const CRASH_CLEANUP_SCOPES = ["OPT_OUT", "INSTALLATION", "ACCOUNT"] as const;

export type CrashCategory = (typeof CRASH_CATEGORIES)[number];
export type CrashBreadcrumb = (typeof CRASH_BREADCRUMBS)[number];
export type CrashPlatform = "IOS" | "ANDROID" | "WEB";

export type CrashConsent = {
  id: string;
  revision: number;
  installationId: string;
  processorSubjectId: string;
  enabled: boolean;
  policyVersion: typeof CRASH_REPORTING_POLICY_VERSION;
  processorSubjectIssuedAt: Date;
  processorSubjectExpiresAt: Date;
  consentedAt: Date;
  updatedAt: Date;
};

export type CrashInstallationEvidence = {
  consentId: string;
  consentRevision: number;
  installationId: string;
  processorSubjectId: string;
  subjectMappingRevision: number;
  uploadTokenId: string;
  issuedAt: Date;
  expiresAt: Date;
  serverResolved: boolean;
};

export type CrashRedactionEvidence = {
  eventId: string;
  processorSubjectId: string;
  releaseCommit: string;
  inputDigest: string;
  canonicalDigest: string;
  policyVersion: typeof CRASH_REPORTING_POLICY_VERSION;
  redactedAt: Date;
  serverRecomputed: boolean;
  containsUserIdentity: boolean;
  containsHouseholdIdentifier: boolean;
  containsRecordContent: boolean;
  containsFileNameOrUrl: boolean;
  containsRequestOrResponseBody: boolean;
  containsCredentialsOrTokens: boolean;
  containsLocationOrContacts: boolean;
};

export type CrashStackFrame = {
  module: string;
  symbol: string;
  line: number | null;
  column: number | null;
  inApplication: boolean;
};

export type CrashReportDraft = {
  id: string;
  processorSubjectId: string;
  category: CrashCategory;
  platform: CrashPlatform;
  appVersion: string;
  buildNumber: string;
  releaseCommit: string;
  occurredAt: Date;
  errorCode: string;
  redactedMessage: string | null;
  stackFrames: readonly CrashStackFrame[];
  breadcrumbs: readonly CrashBreadcrumb[];
  networkAvailable: boolean | null;
  memoryPressure: boolean | null;
  offlineMode: boolean | null;
  canonicalDigest: string;
  containsUserIdentity: boolean;
  containsHouseholdIdentifier: boolean;
  containsRecordContent: boolean;
  containsFileNameOrUrl: boolean;
  containsRequestOrResponseBody: boolean;
  containsCredentialsOrTokens: boolean;
  containsLocationOrContacts: boolean;
};

export type CrashProviderGate = {
  approvalId: string;
  approvalVersion: number;
  providerId: string;
  projectId: string;
  approvedAt: Date;
  expiresAt: Date;
  providerApproved: boolean;
  accountApproved: boolean;
  costApproved: boolean;
  privacyApproved: boolean;
  approvedRegionConfigured: boolean;
  dataProcessingAgreementApproved: boolean;
  subprocessorInventoryApproved: boolean;
  deletionSupported: boolean;
  credentialsServerHeld: boolean;
  retentionDays: number;
  trackingDisabled: boolean;
  advertisingDisabled: boolean;
  behaviouralAnalyticsDisabled: boolean;
  performanceTracingDisabled: boolean;
  sessionReplayDisabled: boolean;
  screenshotCaptureDisabled: boolean;
  requestBodyCaptureDisabled: boolean;
  deviceFingerprintingDisabled: boolean;
  providerTrainingDisabled: boolean;
};

export type CrashCleanupEvidence = {
  scope: "OPT_OUT" | "INSTALLATION" | "ACCOUNT";
  installationId: string;
  processorSubjectId: string;
  consentId: string;
  consentRevision: number;
  issuedAt: Date;
  expiresAt: Date;
  serverAuthorized: boolean;
};

export type CrashProviderGateReason =
  | "provider"
  | "account"
  | "cost"
  | "privacy"
  | "region"
  | "dpa"
  | "retention"
  | "sdk-configuration";

export type CrashCaptureDecision =
  | {
      status: "upload-authorized";
      eventId: string;
      processorSubjectId: string;
      releaseCommit: string;
      canonicalDigest: string;
      useHomeVaultRedactionProxy: true;
      operationalDiagnosticsOnly: true;
      retentionDays: number;
      trackingAllowed: false;
      advertisingAllowed: false;
      behaviouralAnalyticsAllowed: false;
      performanceTracingAllowed: false;
      sessionReplayAllowed: false;
      screenshotCaptureAllowed: false;
      requestBodyCaptureAllowed: false;
      deviceFingerprintingAllowed: false;
      providerTrainingAllowed: false;
      captureHouseholdContent: false;
    }
  | { status: "disabled" }
  | { status: "duplicate"; eventId: string }
  | {
      status: "provider-gate";
      reason: CrashProviderGateReason;
    }
  | { status: "stale" }
  | { status: "unavailable" };

export type CrashCleanupDecision =
  | {
      status: "cleanup-authorized";
      scope: "OPT_OUT" | "INSTALLATION" | "ACCOUNT";
      revokeInstallationUploadToken: true;
      purgeLocalCrashQueue: true;
      deleteProcessorEventsBySubject: true;
      deleteProviderBackups: true;
      deleteDeliveryQueues: true;
      deleteDeduplicationKeys: true;
      deleteServerCaches: true;
      deleteDeviceOfflineCopies: true;
      deleteSourceMapAccessGrants: true;
      redactSensitiveAuditPayloads: true;
      deleteSubjectMapping: true;
      disableFutureCapture: true;
      deleteOperationalAuditAfter: Date;
      requireRetryableProcessorDeletionLedger: true;
      deleteHouseholdRecords: false;
    }
  | { status: "unavailable" };

function validText(value: unknown, maximum: number) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !normalized.includes("\0") &&
    !normalized.includes("\r") &&
    !normalized.includes("\n")
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function uniqueValues<T>(values: readonly T[]) {
  return new Set(values).size === values.length;
}

function digest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function canonicalReportInput(report: CrashReportDraft) {
  return {
    id: report.id,
    processorSubjectId: report.processorSubjectId,
    category: report.category,
    platform: report.platform,
    appVersion: report.appVersion.trim(),
    buildNumber: report.buildNumber.trim(),
    releaseCommit: report.releaseCommit,
    occurredAt: validDate(report.occurredAt)
      ? report.occurredAt.toISOString()
      : "INVALID",
    errorCode: report.errorCode.trim(),
    redactedMessage: report.redactedMessage?.trim() ?? null,
    stackFrames: report.stackFrames.map((frame) => ({
      module: frame.module.trim(),
      symbol: frame.symbol.trim(),
      line: frame.line,
      column: frame.column,
      inApplication: frame.inApplication,
    })),
    breadcrumbs: [...report.breadcrumbs],
    networkAvailable: report.networkAvailable,
    memoryPressure: report.memoryPressure,
    offlineMode: report.offlineMode,
  };
}

export const crashReportingBindings = {
  reportInput: (report: CrashReportDraft) => digest(canonicalReportInput(report)),
  canonicalReport: (report: CrashReportDraft) =>
    digest({
      ...canonicalReportInput(report),
      policyVersion: CRASH_REPORTING_POLICY_VERSION,
    }),
};

function providerGateReason(
  gate: CrashProviderGate,
  expectedProviderId: string,
  expectedProjectId: string,
  now: Date,
): CrashProviderGateReason | null {
  if (typeof gate !== "object" || gate === null) return "provider";
  if (
    !validText(gate.approvalId, 200) ||
    !Number.isInteger(gate.approvalVersion) ||
    gate.approvalVersion < 1 ||
    !validText(gate.providerId, 200) ||
    !validText(gate.projectId, 200) ||
    gate.providerId !== expectedProviderId ||
    gate.projectId !== expectedProjectId ||
    !validDate(gate.approvedAt) ||
    !validDate(gate.expiresAt) ||
    gate.approvedAt > now ||
    gate.expiresAt <= now ||
    gate.expiresAt.getTime() - gate.approvedAt.getTime() >
      30 * 24 * 60 * 60 * 1000
  ) {
    return "provider";
  }
  if (gate.providerApproved !== true) return "provider";
  if (gate.accountApproved !== true) return "account";
  if (gate.costApproved !== true) return "cost";
  if (gate.privacyApproved !== true) return "privacy";
  if (gate.approvedRegionConfigured !== true) return "region";
  if (gate.dataProcessingAgreementApproved !== true) return "dpa";
  if (
    gate.subprocessorInventoryApproved !== true ||
    gate.deletionSupported !== true ||
    gate.credentialsServerHeld !== true
  ) {
    return "privacy";
  }
  if (
    !Number.isInteger(gate.retentionDays) ||
    gate.retentionDays < 1 ||
    gate.retentionDays > CRASH_REPORT_RETENTION_MAX_DAYS
  ) {
    return "retention";
  }
  if (
    gate.trackingDisabled !== true ||
    gate.advertisingDisabled !== true ||
    gate.behaviouralAnalyticsDisabled !== true ||
    gate.performanceTracingDisabled !== true ||
    gate.sessionReplayDisabled !== true ||
    gate.screenshotCaptureDisabled !== true ||
    gate.requestBodyCaptureDisabled !== true ||
    gate.deviceFingerprintingDisabled !== true ||
    gate.providerTrainingDisabled !== true
  ) {
    return "sdk-configuration";
  }
  return null;
}

function validStackFrame(frame: CrashStackFrame) {
  return (
    typeof frame === "object" &&
    frame !== null &&
    validText(frame.module, 200) &&
    validText(frame.symbol, 300) &&
    (frame.line === null ||
      (Number.isSafeInteger(frame.line) && frame.line >= 0)) &&
    (frame.column === null ||
      (Number.isSafeInteger(frame.column) && frame.column >= 0)) &&
    typeof frame.inApplication === "boolean"
  );
}

function validReport(report: CrashReportDraft) {
  if (
    typeof report !== "object" ||
    report === null ||
    !Array.isArray(report.stackFrames) ||
    !Array.isArray(report.breadcrumbs)
  ) {
    return false;
  }
  return (
    validText(report.id, 200) &&
    validText(report.processorSubjectId, 256) &&
    CRASH_CATEGORIES.includes(report.category) &&
    CRASH_PLATFORMS.includes(report.platform) &&
    validText(report.appVersion, 50) &&
    validText(report.buildNumber, 50) &&
    /^[a-f0-9]{40}$/.test(report.releaseCommit) &&
    validDate(report.occurredAt) &&
    validText(report.errorCode, 160) &&
    (report.redactedMessage === null ||
      validText(
        report.redactedMessage,
        CRASH_REPORT_MAX_MESSAGE_CHARACTERS,
      )) &&
    report.stackFrames.length <= CRASH_REPORT_MAX_STACK_FRAMES &&
    report.stackFrames.every(validStackFrame) &&
    report.breadcrumbs.length <= CRASH_REPORT_MAX_BREADCRUMBS &&
    uniqueValues(report.breadcrumbs) &&
    report.breadcrumbs.every((breadcrumb) =>
      CRASH_BREADCRUMBS.includes(breadcrumb),
    ) &&
    validText(report.canonicalDigest, 256) &&
    (report.networkAvailable === null ||
      typeof report.networkAvailable === "boolean") &&
    (report.memoryPressure === null ||
      typeof report.memoryPressure === "boolean") &&
    (report.offlineMode === null || typeof report.offlineMode === "boolean") &&
    report.containsUserIdentity === false &&
    report.containsHouseholdIdentifier === false &&
    report.containsRecordContent === false &&
    report.containsFileNameOrUrl === false &&
    report.containsRequestOrResponseBody === false &&
    report.containsCredentialsOrTokens === false &&
    report.containsLocationOrContacts === false
  );
}

function validInstallationEvidence({
  evidence,
  consent,
  now,
}: {
  evidence: CrashInstallationEvidence;
  consent: CrashConsent;
  now: Date;
}) {
  return (
    typeof evidence === "object" &&
    evidence !== null &&
    evidence.consentId === consent.id &&
    evidence.consentRevision === consent.revision &&
    evidence.installationId === consent.installationId &&
    evidence.processorSubjectId === consent.processorSubjectId &&
    Number.isInteger(evidence.subjectMappingRevision) &&
    evidence.subjectMappingRevision >= 1 &&
    validText(evidence.uploadTokenId, 200) &&
    validDate(evidence.issuedAt) &&
    validDate(evidence.expiresAt) &&
    evidence.issuedAt <= now &&
    evidence.expiresAt > now &&
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() <=
      CRASH_EVIDENCE_MAX_AGE_MS &&
    evidence.serverResolved === true
  );
}

function validRedactionEvidence({
  evidence,
  report,
  now,
}: {
  evidence: CrashRedactionEvidence;
  report: CrashReportDraft;
  now: Date;
}) {
  return (
    typeof evidence === "object" &&
    evidence !== null &&
    evidence.eventId === report.id &&
    evidence.processorSubjectId === report.processorSubjectId &&
    evidence.releaseCommit === report.releaseCommit &&
    evidence.inputDigest === crashReportingBindings.reportInput(report) &&
    evidence.canonicalDigest ===
      crashReportingBindings.canonicalReport(report) &&
    evidence.canonicalDigest === report.canonicalDigest &&
    evidence.policyVersion === CRASH_REPORTING_POLICY_VERSION &&
    validDate(evidence.redactedAt) &&
    evidence.redactedAt >= report.occurredAt &&
    evidence.redactedAt <= now &&
    now.getTime() - evidence.redactedAt.getTime() <=
      CRASH_EVIDENCE_MAX_AGE_MS &&
    evidence.serverRecomputed === true &&
    evidence.containsUserIdentity === false &&
    evidence.containsHouseholdIdentifier === false &&
    evidence.containsRecordContent === false &&
    evidence.containsFileNameOrUrl === false &&
    evidence.containsRequestOrResponseBody === false &&
    evidence.containsCredentialsOrTokens === false &&
    evidence.containsLocationOrContacts === false
  );
}

export function decideCrashCapture({
  consent,
  report,
  providerGate,
  expectedProviderId,
  expectedProjectId,
  installationEvidence,
  redactionEvidence,
  existingEvent,
  now,
}: {
  consent: CrashConsent;
  report: CrashReportDraft;
  providerGate: CrashProviderGate;
  expectedProviderId: string;
  expectedProjectId: string;
  installationEvidence: CrashInstallationEvidence;
  redactionEvidence: CrashRedactionEvidence;
  existingEvent?: {
    id: string;
    processorSubjectId: string;
    releaseCommit: string;
    canonicalDigest: string;
  };
  now: Date;
}): CrashCaptureDecision {
  if (
    !validDate(now) ||
    !validText(expectedProviderId, 200) ||
    !validText(expectedProjectId, 200) ||
    typeof consent !== "object" ||
    consent === null ||
    !validText(consent.id, 200) ||
    !Number.isInteger(consent.revision) ||
    consent.revision < 1 ||
    !validText(consent.installationId, 200) ||
    !validText(consent.processorSubjectId, 256) ||
    !validDate(consent.processorSubjectIssuedAt) ||
    !validDate(consent.processorSubjectExpiresAt) ||
    !validDate(consent.consentedAt) ||
    !validDate(consent.updatedAt) ||
    consent.processorSubjectIssuedAt > consent.consentedAt ||
    consent.consentedAt > consent.updatedAt ||
    consent.updatedAt > now ||
    consent.processorSubjectIssuedAt > consent.updatedAt ||
    consent.processorSubjectExpiresAt <= now ||
    consent.processorSubjectExpiresAt <= consent.processorSubjectIssuedAt ||
    consent.processorSubjectExpiresAt.getTime() -
        consent.processorSubjectIssuedAt.getTime() >
      CRASH_PROCESSOR_SUBJECT_MAX_AGE_MS ||
    consent.policyVersion !== CRASH_REPORTING_POLICY_VERSION
  ) {
    return { status: "unavailable" };
  }
  if (consent.enabled === false) return { status: "disabled" };
  if (consent.enabled !== true) return { status: "unavailable" };
  if (
    !validReport(report) ||
    !validInstallationEvidence({ evidence: installationEvidence, consent, now }) ||
    report.processorSubjectId !== consent.processorSubjectId
  ) {
    return { status: "unavailable" };
  }
  const gateReason = providerGateReason(
    providerGate,
    expectedProviderId,
    expectedProjectId,
    now,
  );
  if (gateReason) return { status: "provider-gate", reason: gateReason };
  if (
    !validRedactionEvidence({ evidence: redactionEvidence, report, now })
  ) {
    return { status: "unavailable" };
  }
  const age = now.getTime() - report.occurredAt.getTime();
  if (age < 0 || age > CRASH_REPORT_MAX_AGE_MS) {
    return { status: "stale" };
  }
  if (existingEvent) {
    if (
      !validText(existingEvent.id, 200) ||
      !validText(existingEvent.canonicalDigest, 256) ||
      existingEvent.processorSubjectId !== report.processorSubjectId ||
      !/^[a-f0-9]{40}$/.test(existingEvent.releaseCommit) ||
      (existingEvent.id === report.id &&
        (existingEvent.releaseCommit !== report.releaseCommit ||
          existingEvent.canonicalDigest !== report.canonicalDigest)) ||
      (existingEvent.canonicalDigest === report.canonicalDigest &&
        existingEvent.releaseCommit !== report.releaseCommit)
    ) {
      return { status: "unavailable" };
    }
    if (
      existingEvent.releaseCommit === report.releaseCommit &&
      existingEvent.canonicalDigest === report.canonicalDigest
    ) {
      return { status: "duplicate", eventId: existingEvent.id };
    }
  }
  return {
    status: "upload-authorized",
    eventId: report.id,
    processorSubjectId: report.processorSubjectId,
    releaseCommit: report.releaseCommit,
    canonicalDigest: report.canonicalDigest,
    useHomeVaultRedactionProxy: true,
    operationalDiagnosticsOnly: true,
    retentionDays: providerGate.retentionDays,
    trackingAllowed: false,
    advertisingAllowed: false,
    behaviouralAnalyticsAllowed: false,
    performanceTracingAllowed: false,
    sessionReplayAllowed: false,
    screenshotCaptureAllowed: false,
    requestBodyCaptureAllowed: false,
    deviceFingerprintingAllowed: false,
    providerTrainingAllowed: false,
    captureHouseholdContent: false,
  };
}

export function decideCrashCleanup({
  evidence,
  consent,
  expectedInstallationId,
  expectedProcessorSubjectId,
  now,
}: {
  evidence: CrashCleanupEvidence;
  consent: CrashConsent;
  expectedInstallationId: string;
  expectedProcessorSubjectId: string;
  now: Date;
}): CrashCleanupDecision {
  if (
    typeof evidence !== "object" ||
    evidence === null ||
    typeof consent !== "object" ||
    consent === null ||
    !validText(consent.id, 200) ||
    !Number.isInteger(consent.revision) ||
    consent.revision < 1 ||
    !validText(expectedInstallationId, 200) ||
    !validText(expectedProcessorSubjectId, 256) ||
    !CRASH_CLEANUP_SCOPES.includes(evidence.scope) ||
    evidence.installationId !== expectedInstallationId ||
    evidence.installationId !== consent.installationId ||
    evidence.processorSubjectId !== expectedProcessorSubjectId ||
    evidence.processorSubjectId !== consent.processorSubjectId ||
    evidence.consentId !== consent.id ||
    evidence.consentRevision !== consent.revision ||
    !validDate(evidence.issuedAt) ||
    !validDate(evidence.expiresAt) ||
    evidence.issuedAt > now ||
    evidence.expiresAt <= now ||
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime() >
      CRASH_EVIDENCE_MAX_AGE_MS ||
    evidence.serverAuthorized !== true ||
    !validDate(now)
  ) {
    return { status: "unavailable" };
  }
  const scope = evidence.scope;
  return {
    status: "cleanup-authorized",
    scope,
    revokeInstallationUploadToken: true,
    purgeLocalCrashQueue: true,
    deleteProcessorEventsBySubject: true,
    deleteProviderBackups: true,
    deleteDeliveryQueues: true,
    deleteDeduplicationKeys: true,
    deleteServerCaches: true,
    deleteDeviceOfflineCopies: true,
    deleteSourceMapAccessGrants: true,
    redactSensitiveAuditPayloads: true,
    deleteSubjectMapping: true,
    disableFutureCapture: true,
    deleteOperationalAuditAfter: new Date(
      now.getTime() + CRASH_REPORT_RETENTION_MAX_DAYS * 24 * 60 * 60 * 1000,
    ),
    requireRetryableProcessorDeletionLedger: true,
    deleteHouseholdRecords: false,
  };
}
