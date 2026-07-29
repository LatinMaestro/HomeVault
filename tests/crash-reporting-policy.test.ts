import assert from "node:assert/strict";
import test from "node:test";

import {
  CRASH_REPORTING_POLICY_VERSION,
  crashReportingBindings,
  decideCrashCapture,
  decideCrashCleanup,
  type CrashCleanupEvidence,
  type CrashConsent,
  type CrashInstallationEvidence,
  type CrashProviderGate,
  type CrashRedactionEvidence,
  type CrashReportDraft,
} from "../src/lib/crash-reporting-policy";

const now = new Date("2026-07-28T09:00:00.000Z");

const consent: CrashConsent = {
  id: "crash-consent-1",
  revision: 3,
  installationId: "install-1",
  processorSubjectId: "subject-pseudonym-1",
  enabled: true,
  policyVersion: CRASH_REPORTING_POLICY_VERSION,
  processorSubjectIssuedAt: new Date("2026-07-28T08:00:00.000Z"),
  processorSubjectExpiresAt: new Date("2026-08-27T08:00:00.000Z"),
  consentedAt: new Date("2026-07-28T08:00:00.000Z"),
  updatedAt: new Date("2026-07-28T08:00:00.000Z"),
};

const providerGate: CrashProviderGate = {
  approvalId: "crash-provider-approval-1",
  approvalVersion: 2,
  providerId: "approved-crash-provider",
  projectId: "homevault-production",
  approvedAt: new Date("2026-07-28T08:00:00.000Z"),
  expiresAt: new Date("2026-08-27T08:00:00.000Z"),
  providerApproved: true,
  accountApproved: true,
  costApproved: true,
  privacyApproved: true,
  approvedRegionConfigured: true,
  dataProcessingAgreementApproved: true,
  subprocessorInventoryApproved: true,
  deletionSupported: true,
  credentialsServerHeld: true,
  retentionDays: 14,
  trackingDisabled: true,
  advertisingDisabled: true,
  behaviouralAnalyticsDisabled: true,
  performanceTracingDisabled: true,
  sessionReplayDisabled: true,
  screenshotCaptureDisabled: true,
  requestBodyCaptureDisabled: true,
  deviceFingerprintingDisabled: true,
  providerTrainingDisabled: true,
};

const report: CrashReportDraft = {
  id: "crash-event-1",
  processorSubjectId: "subject-pseudonym-1",
  category: "UNHANDLED_EXCEPTION",
  platform: "IOS",
  appVersion: "1.0.0",
  buildNumber: "100",
  releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
  occurredAt: new Date("2026-07-28T08:59:00.000Z"),
  errorCode: "RENDER_BOUNDARY_FAILURE",
  redactedMessage: "A fictional render boundary failed.",
  stackFrames: [
    {
      module: "HomeVault",
      symbol: "renderProtectedShell",
      line: 42,
      column: 7,
      inApplication: true,
    },
  ],
  breadcrumbs: ["APP_STARTED", "APP_FOREGROUNDED"],
  networkAvailable: true,
  memoryPressure: false,
  offlineMode: false,
  canonicalDigest: "",
  containsUserIdentity: false,
  containsHouseholdIdentifier: false,
  containsRecordContent: false,
  containsFileNameOrUrl: false,
  containsRequestOrResponseBody: false,
  containsCredentialsOrTokens: false,
  containsLocationOrContacts: false,
};
report.canonicalDigest = crashReportingBindings.canonicalReport(report);

const installationEvidence: CrashInstallationEvidence = {
  consentId: consent.id,
  consentRevision: consent.revision,
  installationId: consent.installationId,
  processorSubjectId: consent.processorSubjectId,
  subjectMappingRevision: 4,
  uploadTokenId: "crash-upload-token-1",
  issuedAt: new Date("2026-07-28T08:55:00.000Z"),
  expiresAt: new Date("2026-07-28T09:05:00.000Z"),
  serverResolved: true,
};

const redactionEvidence: CrashRedactionEvidence = {
  eventId: report.id,
  processorSubjectId: report.processorSubjectId,
  releaseCommit: report.releaseCommit,
  inputDigest: crashReportingBindings.reportInput(report),
  canonicalDigest: report.canonicalDigest,
  policyVersion: CRASH_REPORTING_POLICY_VERSION,
  redactedAt: new Date("2026-07-28T08:59:30.000Z"),
  serverRecomputed: true,
  containsUserIdentity: false,
  containsHouseholdIdentifier: false,
  containsRecordContent: false,
  containsFileNameOrUrl: false,
  containsRequestOrResponseBody: false,
  containsCredentialsOrTokens: false,
  containsLocationOrContacts: false,
};

function redactionFor(draft: CrashReportDraft): CrashRedactionEvidence {
  return {
    ...redactionEvidence,
    eventId: draft.id,
    processorSubjectId: draft.processorSubjectId,
    releaseCommit: draft.releaseCommit,
    inputDigest: crashReportingBindings.reportInput(draft),
    canonicalDigest: crashReportingBindings.canonicalReport(draft),
  };
}

const cleanupEvidence: CrashCleanupEvidence = {
  scope: "ACCOUNT",
  installationId: consent.installationId,
  processorSubjectId: consent.processorSubjectId,
  consentId: consent.id,
  consentRevision: consent.revision,
  issuedAt: new Date("2026-07-28T08:55:00.000Z"),
  expiresAt: new Date("2026-07-28T09:05:00.000Z"),
  serverAuthorized: true,
};

const input = {
  consent,
  report,
  providerGate,
  expectedProviderId: providerGate.providerId,
  expectedProjectId: providerGate.projectId,
  installationEvidence,
  redactionEvidence,
  now,
};

test("authorizes only consented operational crash uploads through redaction", () => {
  assert.deepEqual(decideCrashCapture(input), {
    status: "upload-authorized",
    eventId: "crash-event-1",
    processorSubjectId: "subject-pseudonym-1",
    releaseCommit: "8ed478b78c24dc37a43320ea272e5db6ccced4fb",
    canonicalDigest: report.canonicalDigest,
    useHomeVaultRedactionProxy: true,
    operationalDiagnosticsOnly: true,
    retentionDays: 14,
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
  });
});

test("disables capture when the user has opted out", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      consent: { ...consent, enabled: false },
    }),
    { status: "disabled" },
  );
});

test("keeps every provider and cost decision as a fail-closed gate", () => {
  const cases = [
    ["providerApproved", "provider"],
    ["accountApproved", "account"],
    ["costApproved", "cost"],
    ["privacyApproved", "privacy"],
    ["approvedRegionConfigured", "region"],
    ["dataProcessingAgreementApproved", "dpa"],
  ] as const;
  for (const [field, reason] of cases) {
    assert.deepEqual(
      decideCrashCapture({
        ...input,
        providerGate: { ...providerGate, [field]: false },
      }),
      { status: "provider-gate", reason },
    );
  }
});

test("rejects long retention and unsafe SDK capabilities", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      providerGate: { ...providerGate, retentionDays: 15 },
    }),
    { status: "provider-gate", reason: "retention" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      providerGate: { ...providerGate, sessionReplayDisabled: false },
    }),
    { status: "provider-gate", reason: "sdk-configuration" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      providerGate: { ...providerGate, performanceTracingDisabled: false },
    }),
    { status: "provider-gate", reason: "sdk-configuration" },
  );
});

test("binds provider approval to the exact configured project", () => {
  assert.deepEqual(
    decideCrashCapture({ ...input, expectedProviderId: "another-provider" }),
    { status: "provider-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideCrashCapture({ ...input, expectedProjectId: "another-project" }),
    { status: "provider-gate", reason: "provider" },
  );
  for (const patch of [
    { subprocessorInventoryApproved: false },
    { deletionSupported: false },
    { credentialsServerHeld: false },
  ]) {
    assert.deepEqual(
      decideCrashCapture({
        ...input,
        providerGate: { ...providerGate, ...patch },
      }),
      { status: "provider-gate", reason: "privacy" },
    );
  }
});

test("rejects identity, household content and request bodies", () => {
  for (const patch of [
    { containsUserIdentity: true },
    { containsHouseholdIdentifier: true },
    { containsRecordContent: true },
    { containsFileNameOrUrl: true },
    { containsRequestOrResponseBody: true },
    { containsCredentialsOrTokens: true },
    { containsLocationOrContacts: true },
  ]) {
    assert.deepEqual(
      decideCrashCapture({
        ...input,
        report: { ...report, ...patch },
      }),
      { status: "unavailable" },
    );
  }
});

test("binds installation and subject evidence to the exact consent", () => {
  for (const installationPatch of [
    { consentId: "another-consent" },
    { consentRevision: consent.revision + 1 },
    { installationId: "another-installation" },
    { processorSubjectId: "another-subject" },
    { subjectMappingRevision: 0 },
    { uploadTokenId: " " },
    { serverResolved: false },
    { serverResolved: 1 as never },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideCrashCapture({
        ...input,
        installationEvidence: {
          ...installationEvidence,
          ...installationPatch,
        },
      }),
      { status: "unavailable" },
    );
  }
});

test("binds redaction to the exact event, release and server digest", () => {
  for (const redactionPatch of [
    { eventId: "another-event" },
    { processorSubjectId: "another-subject" },
    { releaseCommit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    { inputDigest: "substituted-input" },
    { canonicalDigest: "substituted-output" },
    { serverRecomputed: false },
    { containsRecordContent: true },
    { containsCredentialsOrTokens: true },
    { redactedAt: new Date("2026-07-28T08:49:59.999Z") },
  ]) {
    assert.deepEqual(
      decideCrashCapture({
        ...input,
        redactionEvidence: { ...redactionEvidence, ...redactionPatch },
      }),
      { status: "unavailable" },
    );
  }
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: { ...report, errorCode: "SUBSTITUTED_ERROR_CODE" },
    }),
    { status: "unavailable" },
  );
});

test("rejects stale and future crash envelopes", () => {
  const staleReport = {
    ...report,
    occurredAt: new Date("2026-07-27T08:59:59.999Z"),
  };
  staleReport.canonicalDigest =
    crashReportingBindings.canonicalReport(staleReport);
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: staleReport,
      redactionEvidence: redactionFor(staleReport),
    }),
    { status: "stale" },
  );
  const futureReport = {
    ...report,
    occurredAt: new Date("2026-07-28T09:00:00.001Z"),
  };
  futureReport.canonicalDigest =
    crashReportingBindings.canonicalReport(futureReport);
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: futureReport,
      redactionEvidence: redactionFor(futureReport),
    }),
    { status: "unavailable" },
  );
});

test("bounds stack frames, breadcrumbs and release identity", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: {
        ...report,
        breadcrumbs: Array.from(
          { length: 21 },
          () => "APP_STARTED" as const,
        ),
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: { ...report, releaseCommit: "not-a-commit" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: {
        ...report,
        stackFrames: [
          { ...report.stackFrames[0], inApplication: "yes" as never },
        ],
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: { ...report, networkAvailable: 1 as never },
    }),
    { status: "unavailable" },
  );
});

test("fails closed for malformed runtime dates, arrays and gate booleans", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      now: "2026-07-28T09:00:00.000Z" as never,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      providerGate: {
        ...providerGate,
        expiresAt: "2026-08-27T08:00:00.000Z" as never,
      },
    }),
    { status: "provider-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: { ...report, stackFrames: null as never },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      providerGate: {
        ...providerGate,
        trackingDisabled: 1 as never,
      },
    }),
    { status: "provider-gate", reason: "sdk-configuration" },
  );
});

test("deduplicates only inside the exact pseudonymous subject", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      existingEvent: {
        id: "crash-event-existing",
        processorSubjectId: report.processorSubjectId,
        releaseCommit: report.releaseCommit,
        canonicalDigest: report.canonicalDigest,
      },
    }),
    { status: "duplicate", eventId: "crash-event-existing" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      existingEvent: {
        id: "crash-event-existing",
        processorSubjectId: "another-subject",
        releaseCommit: report.releaseCommit,
        canonicalDigest: report.canonicalDigest,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects policy drift and mismatched processor subjects", () => {
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      consent: {
        ...consent,
        policyVersion: "old-policy" as typeof CRASH_REPORTING_POLICY_VERSION,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      report: { ...report, processorSubjectId: "wrong-subject" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCrashCapture({
      ...input,
      consent: {
        ...consent,
        processorSubjectExpiresAt: now,
      },
    }),
    { status: "unavailable" },
  );
});

test("opt-out and lifecycle cleanup delete device and processor state", () => {
  const cleanupInput = {
    evidence: cleanupEvidence,
    consent,
    expectedInstallationId: consent.installationId,
    expectedProcessorSubjectId: consent.processorSubjectId,
    now,
  };
  assert.deepEqual(decideCrashCleanup(cleanupInput), {
    status: "cleanup-authorized",
    scope: "ACCOUNT",
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
    deleteOperationalAuditAfter: new Date("2026-08-11T09:00:00.000Z"),
    requireRetryableProcessorDeletionLedger: true,
    deleteHouseholdRecords: false,
  });
  for (const patch of [
    { scope: "EVERYTHING" as never },
    { installationId: "another-installation" },
    { processorSubjectId: "another-subject" },
    { consentId: "another-consent" },
    { consentRevision: consent.revision + 1 },
    { serverAuthorized: false },
    { serverAuthorized: 1 as never },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideCrashCleanup({
        ...cleanupInput,
        evidence: { ...cleanupEvidence, ...patch },
      }),
      { status: "unavailable" },
    );
  }
  assert.deepEqual(
    decideCrashCleanup({ ...cleanupInput, now: new Date("invalid") }),
    { status: "unavailable" },
  );
});
