import assert from "node:assert/strict";
import test from "node:test";

import {
  AI_ASSISTANCE_POLICY_VERSION,
  AI_CLEANUP_TARGETS,
  decideAiApply,
  decideAiCleanup,
  decideAiExport,
  decideAiRequest,
  decideAiResult,
  makeAiAcceptedValueDigest,
  makeAiDraftOutputDigest,
  makeAiDraftSetDigest,
  makeAiSourceSnapshotDigest,
  type AiAssistanceDraft,
  type AiAssistanceJob,
  type AiAuthorizationEvidence,
  type AiClassificationDraft,
  type AiConfirmationEvidence,
  type AiMaintenanceSuggestionDraft,
  type AiProviderApproval,
  type AiSafetyEvidence,
  type AiSourceSnapshot,
  type AiSummaryDraft,
} from "../src/lib/ai-assistance-policy";

const now = new Date("2026-07-29T11:00:00.000Z");
const assetDigest = "a".repeat(64);
const documentDigest = "d".repeat(64);

const sources: AiSourceSnapshot[] = [
  {
    recordId: "asset-1",
    homeId: "home-1",
    recordType: "ASSET",
    revision: 3,
    contentDigest: assetDigest,
    characterCount: 300,
    provenance: "USER_CONFIRMED",
    reviewedTextOnly: true,
    containsProviderUrl: false,
    containsAuthenticationData: false,
    containsPaymentCredentials: false,
    containsUnconfirmedOcr: false,
  },
  {
    recordId: "document-1",
    homeId: "home-1",
    recordType: "DOCUMENT",
    revision: 7,
    contentDigest: documentDigest,
    characterCount: 500,
    provenance: "CONFIRMED_OCR",
    reviewedTextOnly: true,
    containsProviderUrl: false,
    containsAuthenticationData: false,
    containsPaymentCredentials: false,
    containsUnconfirmedOcr: false,
  },
];
const sourceSnapshotDigest = makeAiSourceSnapshotDigest(sources);

const authorization: AiAuthorizationEvidence = {
  id: "authorization-request-1",
  purpose: "AI_REQUEST",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  membershipRevision: 4,
  role: "OWNER",
  capability: "SUMMARY",
  targetRecordId: "asset-1",
  targetRevision: 3,
  sourceSnapshotDigest,
  verifiedSession: true,
  membershipActive: true,
  issuedAt: new Date("2026-07-29T10:55:00.000Z"),
  expiresAt: new Date("2026-07-29T11:05:00.000Z"),
  consumed: false,
};

const providerApproval: AiProviderApproval = {
  id: "provider-approval-1",
  modelProvider: "approved-provider",
  modelName: "approved-model",
  modelVersion: "2026-07",
  region: "au-east",
  retentionHours: 0,
  privateProcessing: true,
  trainingDisabled: true,
  humanProviderReviewDisabled: true,
  providerLoggingDisabled: true,
  deletionSupported: true,
  toolAccessDisabled: true,
  browsingDisabled: true,
  clientApproved: true,
  privacyApproved: true,
  legalApproved: true,
  costApproved: true,
  issuedAt: new Date("2026-07-20T00:00:00.000Z"),
  expiresAt: new Date("2026-08-10T00:00:00.000Z"),
  revoked: false,
};

const requestInput = {
  requestId: "request-1",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  membershipRevision: 4,
  capability: "SUMMARY" as const,
  targetRecordId: "asset-1",
  targetRevision: 3,
  sources,
  sourceSnapshotDigest,
  authorization,
  providerApproval,
  idempotencyKey: "idempotency-1",
  now,
};

const job: AiAssistanceJob = {
  id: "job-1",
  requestId: "request-1",
  idempotencyKey: "idempotency-1",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  membershipRevision: 4,
  capability: "SUMMARY",
  targetRecordId: "asset-1",
  targetRevision: 3,
  sourceSnapshotDigest,
  sourceBindings: [
    { recordId: "asset-1", revision: 3, contentDigest: assetDigest },
    { recordId: "document-1", revision: 7, contentDigest: documentDigest },
  ],
  providerApprovalId: "provider-approval-1",
  modelProvider: "approved-provider",
  modelName: "approved-model",
  modelVersion: "2026-07",
  policyVersion: AI_ASSISTANCE_POLICY_VERSION,
  status: "PROCESSING",
  createdAt: new Date("2026-07-29T10:30:00.000Z"),
  expiresAt: new Date("2026-07-30T10:30:00.000Z"),
};

function summaryDraft(
  changed: Partial<Omit<AiSummaryDraft, "outputDigest">> = {},
): AiSummaryDraft {
  const withoutDigest: Omit<AiSummaryDraft, "outputDigest"> = {
    id: "draft-1",
    version: 1,
    jobId: "job-1",
    userId: "user-1",
    homeId: "home-1",
    capability: "SUMMARY" as const,
    kind: "SUMMARY" as const,
    targetRecordId: "asset-1",
    targetRevision: 3,
    sourceSnapshotDigest,
    sourceBindings: job.sourceBindings,
    modelProvider: "approved-provider",
    modelName: "approved-model",
    modelVersion: "2026-07",
    policyVersion: AI_ASSISTANCE_POLICY_VERSION,
    status: "REVIEW_REQUIRED" as const,
    summary: "Fictional appliance guidance summary.",
    createdAt: new Date("2026-07-29T10:45:00.000Z"),
    expiresAt: new Date("2026-07-30T10:30:00.000Z"),
    ...changed,
  };
  return {
    ...withoutDigest,
    outputDigest: makeAiDraftOutputDigest(withoutDigest),
  };
}

function safetyEvidence(drafts: readonly AiAssistanceDraft[]): AiSafetyEvidence {
  return {
    id: "safety-1",
    jobId: "job-1",
    draftSetDigest: makeAiDraftSetDigest(drafts),
    evaluatorVersion: "safety-v1",
    promptInjectionDetected: false,
    prohibitedFinancialOrInsuranceAdvice: false,
    safetyCriticalClaim: false,
    providerContactOrPaymentInstruction: false,
    hiddenOrExecutableInstruction: false,
    behaviouralProfiling: false,
    issuedAt: new Date("2026-07-29T10:55:00.000Z"),
    expiresAt: new Date("2026-07-29T11:05:00.000Z"),
  };
}

function applyInput(draft: AiAssistanceDraft, acceptedValue: string) {
  const applyAuthorization: AiAuthorizationEvidence = {
    ...authorization,
    id: "authorization-apply-1",
    purpose: "AI_APPLY",
  };
  const confirmationEvidence: AiConfirmationEvidence = {
    id: "confirmation-1",
    purpose: "AI_APPLY",
    userId: "user-1",
    sessionId: "session-1",
    homeId: "home-1",
    membershipRevision: 4,
    targetRecordId: "asset-1",
    targetRevision: 3,
    jobId: "job-1",
    draftId: draft.id,
    draftVersion: draft.version,
    outputDigest: draft.outputDigest,
    acceptedValueDigest: makeAiAcceptedValueDigest({ draft, acceptedValue }),
    issuedAt: new Date("2026-07-29T10:55:00.000Z"),
    expiresAt: new Date("2026-07-29T11:05:00.000Z"),
    consumed: false,
  };
  return {
    userId: "user-1",
    sessionId: "session-1",
    homeId: "home-1",
    membershipRevision: 4,
    currentTargetRevision: 3,
    currentDraftVersion: 1,
    currentSources: sources,
    job: { ...job, status: "DRAFT_READY" as const },
    draft,
    authorization: applyAuthorization,
    acceptedValue,
    confirmationEvidence,
    now,
  };
}

test("authorizes bounded review-only processing with no tools or persistence", () => {
  const decision = decideAiRequest(requestInput);
  assert.equal(decision.status, "queue-authorized");
  if (decision.status !== "queue-authorized") return;
  assert.equal(decision.sourceSnapshotDigest, sourceSnapshotDigest);
  assert.equal(decision.treatInputAsUntrustedData, true);
  assert.equal(decision.modelToolAccessAllowed, false);
  assert.equal(decision.modelBrowsingAllowed, false);
  assert.equal(decision.providerTrainingAllowed, false);
  assert.equal(decision.humanProviderReviewAllowed, false);
  assert.equal(decision.providerLoggingAllowed, false);
  assert.equal(decision.rawResponsePersistenceAllowed, false);
  assert.equal(decision.autoPersistAllowed, false);
});

test("recomputes the canonical source digest instead of trusting the caller", () => {
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sourceSnapshotDigest: "e".repeat(64),
      authorization: {
        ...authorization,
        sourceSnapshotDigest: "e".repeat(64),
      },
    }),
    { status: "invalid-source", reason: "digest" },
  );
});

test("rejects substituted identity, session, membership and target evidence", () => {
  for (const changed of [
    { userId: "user-2" },
    { sessionId: "session-2" },
    { membershipRevision: 5 },
    { targetRecordId: "asset-2" },
    { targetRevision: 4 },
  ]) {
    assert.deepEqual(decideAiRequest({ ...requestInput, ...changed }), {
      status: "unavailable",
    });
  }
});

test("requires exact short-lived, single-use authorization booleans", () => {
  for (const changed of [
    { verifiedSession: "true" },
    { membershipActive: 1 },
    { consumed: true },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideAiRequest({
        ...requestInput,
        authorization: {
          ...authorization,
          ...changed,
        } as AiAuthorizationEvidence,
      }),
      { status: "unavailable" },
    );
  }
});

test("keeps child and guest identities read-only", () => {
  for (const role of ["CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decideAiRequest({
        ...requestInput,
        authorization: { ...authorization, role },
      }),
      { status: "read-only" },
    );
  }
});

test("accepts only confirmed text and blocks credentials, URLs and raw OCR", () => {
  for (const changed of [
    { reviewedTextOnly: false },
    { containsProviderUrl: true },
    { containsAuthenticationData: true },
    { containsPaymentCredentials: true },
    { containsUnconfirmedOcr: true },
    { provenance: "MODEL_GENERATED" },
    { contentDigest: "not-a-digest" },
  ]) {
    assert.deepEqual(
      decideAiRequest({
        ...requestInput,
        sources: [{ ...sources[0], ...changed } as AiSourceSnapshot],
      }),
      { status: "invalid-source", reason: "content" },
    );
  }
});

test("enforces count, character and capability-target bounds", () => {
  assert.deepEqual(
    decideAiRequest({ ...requestInput, sources: [] }),
    { status: "invalid-source", reason: "count" },
  );
  const oversized = [
    {
      ...sources[0],
      characterCount: 30_001,
    },
  ];
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sources: oversized,
      sourceSnapshotDigest: makeAiSourceSnapshotDigest(oversized),
      authorization: {
        ...authorization,
        sourceSnapshotDigest: makeAiSourceSnapshotDigest(oversized),
      },
    }),
    { status: "invalid-source", reason: "size" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      capability: "CLASSIFICATION",
      authorization: {
        ...authorization,
        capability: "CLASSIFICATION",
      },
    }),
    { status: "invalid-source", reason: "target" },
  );
});

test("requires explicit current provider, privacy, legal and cost evidence", () => {
  for (const changed of [
    { clientApproved: false },
    { privacyApproved: false },
    { legalApproved: false },
    { costApproved: false },
    { trainingDisabled: false },
    { humanProviderReviewDisabled: false },
    { providerLoggingDisabled: false },
    { toolAccessDisabled: false },
    { browsingDisabled: false },
    { deletionSupported: false },
    { revoked: true },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideAiRequest({
        ...requestInput,
        providerApproval: {
          ...providerApproval,
          ...changed,
        } as AiProviderApproval,
      }),
      { status: "provider-gate", reason: "approval" },
    );
  }
});

test("requires Australian region and bounded retention", () => {
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      providerApproval: { ...providerApproval, region: "us-east" },
    }),
    { status: "provider-gate", reason: "region" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      providerApproval: { ...providerApproval, retentionHours: 25 },
    }),
    { status: "provider-gate", reason: "approval" },
  );
});

test("deduplicates only exact live jobs", () => {
  assert.deepEqual(
    decideAiRequest({ ...requestInput, existingJob: job }),
    { status: "duplicate", jobId: "job-1" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      existingJob: { ...job, membershipRevision: 5 },
    }),
    { status: "unavailable" },
  );
  assert.equal(
    decideAiRequest({
      ...requestInput,
      existingJob: { ...job, status: "FAILED" },
    }).status,
    "queue-authorized",
  );
});

test("accepts a digest-bound safe output only as review-required draft", () => {
  const drafts = [summaryDraft()];
  const decision = decideAiResult({
    job,
    currentSources: sources,
    drafts,
    safetyEvidence: safetyEvidence(drafts),
    now,
  });
  assert.equal(decision.status, "draft-authorized");
  if (decision.status !== "draft-authorized") return;
  assert.equal(decision.draftSetDigest, makeAiDraftSetDigest(drafts));
  assert.equal(decision.requireUserReview, true);
  assert.equal(decision.autoPersistAllowed, false);
  assert.equal(decision.automatedDecisionAllowed, false);
});

test("rejects stale source content and revisions at result time", () => {
  const changed = [
    { ...sources[0], revision: 4 },
    sources[1],
  ];
  assert.deepEqual(
    decideAiResult({
      job,
      currentSources: changed,
      drafts: [summaryDraft()],
      safetyEvidence: safetyEvidence([summaryDraft()]),
      now,
    }),
    { status: "failed-closed", reason: "stale" },
  );
});

test("rejects output tampering, duplicate drafts and invalid capability output", () => {
  const valid = summaryDraft();
  assert.deepEqual(
    decideAiResult({
      job,
      currentSources: sources,
      drafts: [{ ...valid, summary: "Changed after digest" }],
      safetyEvidence: safetyEvidence([{ ...valid, summary: "Changed after digest" }]),
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      currentSources: sources,
      drafts: [valid, valid],
      safetyEvidence: safetyEvidence([valid, valid]),
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
});

test("requires exact job- and output-bound safety evidence", () => {
  const drafts = [summaryDraft()];
  const base = safetyEvidence(drafts);
  for (const changed of [
    { jobId: "job-2" },
    { draftSetDigest: "e".repeat(64) },
    { promptInjectionDetected: true },
    { prohibitedFinancialOrInsuranceAdvice: true },
    { safetyCriticalClaim: true },
    { providerContactOrPaymentInstruction: true },
    { hiddenOrExecutableInstruction: true },
    { behaviouralProfiling: true },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideAiResult({
        job,
        currentSources: sources,
        drafts,
        safetyEvidence: { ...base, ...changed } as AiSafetyEvidence,
        now,
      }),
      { status: "failed-closed", reason: "unsafe" },
    );
  }
});

test("requires a value-bound, short-lived, single-use confirmation proof", () => {
  const draft = summaryDraft();
  const input = applyInput(draft, draft.summary);
  for (const changed of [
    { consumed: true },
    { expiresAt: now },
    { acceptedValueDigest: "e".repeat(64) },
    { outputDigest: "e".repeat(64) },
    { draftVersion: 2 },
    { userId: "user-2" },
  ]) {
    assert.deepEqual(
      decideAiApply({
        ...input,
        confirmationEvidence: {
          ...input.confirmationEvidence,
          ...changed,
        } as AiConfirmationEvidence,
      }),
      { status: "confirmation-required" },
    );
  }
});

test("applies a confirmed summary with CAS and immutable provenance", () => {
  const draft = summaryDraft();
  const acceptedValue = "User-edited fictional appliance summary.";
  const decision = decideAiApply(applyInput(draft, acceptedValue));
  assert.equal(decision.status, "metadata-apply-authorized");
  if (decision.status !== "metadata-apply-authorized") return;
  assert.equal(decision.expectedTargetRevision, 3);
  assert.equal(decision.expectedDraftVersion, 1);
  assert.equal(decision.acceptedValue, acceptedValue);
  assert.equal(decision.generatedValue, draft.summary);
  assert.equal(decision.userEdited, true);
  assert.equal(decision.requireCompareAndSet, true);
  assert.equal(decision.requireAtomicWrite, true);
  assert.equal(decision.provenance.outputDigest, draft.outputDigest);
});

test("rejects stale target, draft, source and membership versions at apply", () => {
  const draft = summaryDraft();
  const input = applyInput(draft, draft.summary);
  assert.deepEqual(
    decideAiApply({ ...input, currentTargetRevision: 4 }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiApply({ ...input, currentDraftVersion: 2 }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideAiApply({
      ...input,
      currentSources: [{ ...sources[0], revision: 4 }, sources[1]],
    }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideAiApply({ ...input, membershipRevision: 5 }),
    { status: "unavailable" },
  );
});

test("maintenance output can only prefill review and cannot automate work", () => {
  const summary = summaryDraft();
  const {
    outputDigest: ignoredOutputDigest,
    summary: ignoredSummary,
    ...common
  } = summary;
  void ignoredOutputDigest;
  void ignoredSummary;
  const withoutDigest: Omit<
    AiMaintenanceSuggestionDraft,
    "outputDigest"
  > = {
    ...common,
    id: "draft-maintenance",
    capability: "MAINTENANCE_SUGGESTION",
    kind: "MAINTENANCE_SUGGESTION",
    title: "Inspect fictional appliance",
    rationale: "Review the manufacturer guide before scheduling.",
    suggestedIntervalDays: 365,
    requiresManufacturerVerification: true,
  };
  const draft: AiMaintenanceSuggestionDraft = {
    ...withoutDigest,
    outputDigest: makeAiDraftOutputDigest(withoutDigest),
  };
  const maintenanceJob: AiAssistanceJob = {
    ...job,
    capability: "MAINTENANCE_SUGGESTION",
    status: "DRAFT_READY",
  };
  const maintenanceAuthorization: AiAuthorizationEvidence = {
    ...authorization,
    id: "authorization-maintenance",
    purpose: "AI_APPLY",
    capability: "MAINTENANCE_SUGGESTION",
  };
  const acceptedValue = "Inspect fictional appliance";
  const confirmation = {
    ...applyInput(draft, acceptedValue).confirmationEvidence,
  };
  const decision = decideAiApply({
    ...applyInput(draft, acceptedValue),
    job: maintenanceJob,
    authorization: maintenanceAuthorization,
    confirmationEvidence: confirmation,
  });
  assert.equal(decision.status, "maintenance-review-authorized");
  if (decision.status !== "maintenance-review-authorized") return;
  assert.equal(decision.createAutomatically, false);
  assert.equal(decision.scheduleAutomatically, false);
  assert.equal(decision.contactProviderAutomatically, false);
  assert.equal(decision.markUrgentOrCompliantAutomatically, false);
  assert.equal(decision.requireManufacturerVerification, true);
});

test("classification remains restricted to the approved allowlist", () => {
  const summary = summaryDraft();
  const {
    outputDigest: ignoredOutputDigest,
    summary: ignoredSummary,
    ...common
  } = summary;
  void ignoredOutputDigest;
  void ignoredSummary;
  const withoutDigest: Omit<AiClassificationDraft, "outputDigest"> = {
    ...common,
    id: "draft-classification",
    capability: "CLASSIFICATION",
    kind: "CLASSIFICATION",
    targetRecordId: "document-1",
    targetRevision: 7,
    classification: "MANUAL",
  };
  const draft: AiClassificationDraft = {
    ...withoutDigest,
    outputDigest: makeAiDraftOutputDigest(withoutDigest),
  };
  const classJob = {
    ...job,
    capability: "CLASSIFICATION" as const,
    targetRecordId: "document-1",
    targetRevision: 7,
    status: "DRAFT_READY" as const,
  };
  const classAuthorization: AiAuthorizationEvidence = {
    ...authorization,
    purpose: "AI_APPLY",
    capability: "CLASSIFICATION",
    targetRecordId: "document-1",
    targetRevision: 7,
  };
  const acceptedValue = "TAX_ADVICE";
  const confirmation: AiConfirmationEvidence = {
    id: "confirmation-classification",
    purpose: "AI_APPLY",
    userId: "user-1",
    sessionId: "session-1",
    homeId: "home-1",
    membershipRevision: 4,
    targetRecordId: "document-1",
    targetRevision: 7,
    jobId: "job-1",
    draftId: draft.id,
    draftVersion: draft.version,
    outputDigest: draft.outputDigest,
    acceptedValueDigest: makeAiAcceptedValueDigest({
      draft,
      acceptedValue,
    }),
    issuedAt: new Date("2026-07-29T10:55:00.000Z"),
    expiresAt: new Date("2026-07-29T11:05:00.000Z"),
    consumed: false,
  };
  assert.deepEqual(
    decideAiApply({
      userId: "user-1",
      sessionId: "session-1",
      homeId: "home-1",
      membershipRevision: 4,
      currentTargetRevision: 7,
      currentDraftVersion: 1,
      currentSources: sources,
      job: classJob,
      draft,
      authorization: classAuthorization,
      acceptedValue,
      confirmationEvidence: confirmation,
      now,
    }),
    { status: "confirmation-required" },
  );
});

test("exports confirmed values and provenance without hidden prompts or payloads", () => {
  const exportAuthorization: AiAuthorizationEvidence = {
    ...authorization,
    id: "authorization-export",
    purpose: "AI_EXPORT",
  };
  assert.deepEqual(
    decideAiExport({
      userId: "user-1",
      sessionId: "session-1",
      homeId: "home-1",
      membershipRevision: 4,
      capability: "SUMMARY",
      targetRecordId: "asset-1",
      targetRevision: 3,
      sources,
      authorization: exportAuthorization,
      now,
    }),
    {
      status: "export-authorized",
      homeId: "home-1",
      targetRecordId: "asset-1",
      includeConfirmedValues: true,
      includeGeneratedValuesAndProvenance: true,
      includeModelIdentity: true,
      includeHiddenPrompt: false,
      includeRawProcessorPayload: false,
      includeTemporaryCredentials: false,
    },
  );
});

test("cleanup covers processor, server, device, queue and draft copies", () => {
  const decision = decideAiCleanup({
    event: "PROPERTY_DELETED",
    scope: "PROPERTY",
    scopeId: "home-1",
    preserveConfirmedValues: false,
  });
  assert.equal(decision.status, "cleanup-authorized");
  if (decision.status !== "cleanup-authorized") return;
  assert.deepEqual(decision.targets, AI_CLEANUP_TARGETS);
  assert.equal(decision.removeDeviceAndServerCopies, true);
  assert.equal(decision.blockCompleteClaimUntilProcessorAck, true);
});

test("cleanup rejects mismatched scope and unsafe preservation", () => {
  assert.deepEqual(
    decideAiCleanup({
      event: "ACCOUNT_DELETED",
      scope: "PROPERTY",
      scopeId: "home-1",
      preserveConfirmedValues: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiCleanup({
      event: "RECORD_DELETED",
      scope: "RECORD",
      scopeId: "asset-1",
      preserveConfirmedValues: true,
    }),
    { status: "unavailable" },
  );
});

test("malformed dates, whitespace IDs and truthy values fail closed", () => {
  assert.deepEqual(
    decideAiRequest({ ...requestInput, requestId: " request " }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, now: new Date(Number.NaN) }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      authorization: {
        ...authorization,
        membershipActive: "true",
      } as unknown as AiAuthorizationEvidence,
    }),
    { status: "unavailable" },
  );
});
