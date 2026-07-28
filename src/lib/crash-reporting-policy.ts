export const CRASH_REPORTING_POLICY_VERSION = "homevault-crash-reporting-v1";
export const CRASH_REPORT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const CRASH_PROCESSOR_SUBJECT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
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
  installationId: string;
  processorSubjectId: string;
  enabled: boolean;
  policyVersion: typeof CRASH_REPORTING_POLICY_VERSION;
  processorSubjectIssuedAt: Date;
  processorSubjectExpiresAt: Date;
  consentedAt: Date;
  updatedAt: Date;
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
  providerApproved: boolean;
  accountApproved: boolean;
  costApproved: boolean;
  privacyApproved: boolean;
  approvedRegionConfigured: boolean;
  dataProcessingAgreementApproved: boolean;
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

function providerGateReason(
  gate: CrashProviderGate,
): CrashProviderGateReason | null {
  if (typeof gate !== "object" || gate === null) return "provider";
  if (gate.providerApproved !== true) return "provider";
  if (gate.accountApproved !== true) return "account";
  if (gate.costApproved !== true) return "cost";
  if (gate.privacyApproved !== true) return "privacy";
  if (gate.approvedRegionConfigured !== true) return "region";
  if (gate.dataProcessingAgreementApproved !== true) return "dpa";
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

export function decideCrashCapture({
  consent,
  report,
  providerGate,
  installationIdServerVerified,
  processorSubjectServerVerified,
  canonicalRedactionServerVerified,
  canonicalDigestServerVerified,
  existingEvent,
  now,
}: {
  consent: CrashConsent;
  report: CrashReportDraft;
  providerGate: CrashProviderGate;
  installationIdServerVerified: boolean;
  processorSubjectServerVerified: boolean;
  canonicalRedactionServerVerified: boolean;
  canonicalDigestServerVerified: boolean;
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
    typeof consent !== "object" ||
    consent === null ||
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
    installationIdServerVerified !== true ||
    processorSubjectServerVerified !== true ||
    report.processorSubjectId !== consent.processorSubjectId
  ) {
    return { status: "unavailable" };
  }
  const gateReason = providerGateReason(providerGate);
  if (gateReason) return { status: "provider-gate", reason: gateReason };
  if (
    canonicalRedactionServerVerified !== true ||
    canonicalDigestServerVerified !== true
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
  scope,
  now,
}: {
  scope: "OPT_OUT" | "INSTALLATION" | "ACCOUNT";
  now: Date;
}): CrashCleanupDecision {
  if (
    !CRASH_CLEANUP_SCOPES.includes(scope) ||
    !validDate(now)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-authorized",
    scope,
    revokeInstallationUploadToken: true,
    purgeLocalCrashQueue: true,
    deleteProcessorEventsBySubject: true,
    deleteSubjectMapping: true,
    disableFutureCapture: true,
    deleteOperationalAuditAfter: new Date(
      now.getTime() + CRASH_REPORT_RETENTION_MAX_DAYS * 24 * 60 * 60 * 1000,
    ),
    requireRetryableProcessorDeletionLedger: true,
    deleteHouseholdRecords: false,
  };
}
