import assert from "node:assert/strict";
import test from "node:test";

import {
  AI_ASSISTANCE_POLICY_VERSION,
  decideAiApply,
  decideAiCleanup,
  decideAiRequest,
  decideAiResult,
  type AiAssistanceDraft,
  type AiAssistanceJob,
  type AiSafetyAssessment,
  type AiSourceSnapshot,
} from "../src/lib/ai-assistance-policy";

const now = new Date("2026-07-28T05:00:00.000Z");
const snapshotDigest =
  "home-1:ASSET:asset-1:revision-1:digest-asset|home-1:DOCUMENT:document-1:revision-2:digest-document";

const sources: AiSourceSnapshot[] = [
  {
    recordId: "asset-1",
    homeId: "home-1",
    recordType: "ASSET",
    revision: "revision-1",
    contentDigest: "digest-asset",
    characterCount: 300,
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
    revision: "revision-2",
    contentDigest: "digest-document",
    characterCount: 500,
    reviewedTextOnly: true,
    containsProviderUrl: false,
    containsAuthenticationData: false,
    containsPaymentCredentials: false,
    containsUnconfirmedOcr: false,
  },
];

const requestInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  sessionVerified: true,
  hasCurrentMembership: true,
  role: "OWNER" as const,
  capability: "SUMMARY" as const,
  targetRecordId: "asset-1",
  targetRevision: "revision-1",
  sources,
  canonicalSourceSnapshotDigest: snapshotDigest,
  userRequested: true,
  modelProvider: "approved-provider",
  modelName: "approved-model",
  modelVersion: "2026-07",
  providerApproved: true,
  approvedRegionConfigured: true,
  boundedRetentionConfigured: true,
  trainingDisabled: true,
  humanProviderReviewDisabled: true,
  idempotencyKey: "ai-request-1",
  now,
};

const job: AiAssistanceJob = {
  id: "ai-job-1",
  userId: "user-1",
  homeId: "home-1",
  capability: "SUMMARY",
  targetRecordId: "asset-1",
  targetRevision: "revision-1",
  sourceSnapshotDigest: snapshotDigest,
  sourceRecordIds: ["asset-1", "document-1"],
  modelProvider: "approved-provider",
  modelName: "approved-model",
  modelVersion: "2026-07",
  policyVersion: AI_ASSISTANCE_POLICY_VERSION,
  status: "PROCESSING",
  createdAt: new Date("2026-07-28T04:00:00.000Z"),
  expiresAt: new Date("2026-07-29T04:00:00.000Z"),
};

const safe: AiSafetyAssessment = {
  promptInjectionDetected: false,
  prohibitedFinancialOrInsuranceAdvice: false,
  safetyCriticalClaim: false,
  providerContactOrPaymentInstruction: false,
  hiddenOrExecutableInstruction: false,
};

const summaryDraft: AiAssistanceDraft = {
  id: "draft-summary-1",
  jobId: "ai-job-1",
  userId: "user-1",
  homeId: "home-1",
  kind: "SUMMARY",
  targetRecordId: "asset-1",
  targetRevision: "revision-1",
  sourceSnapshotDigest: snapshotDigest,
  sourceRecordIds: ["asset-1", "document-1"],
  modelProvider: "approved-provider",
  modelName: "approved-model",
  modelVersion: "2026-07",
  policyVersion: AI_ASSISTANCE_POLICY_VERSION,
  createdAt: new Date("2026-07-28T04:30:00.000Z"),
  summary: "Fictional heat-pump water heater with its manual attached.",
};

test("authorizes only explicit bounded same-property AI requests", () => {
  const decision = decideAiRequest(requestInput);
  assert.equal(decision.status, "queue-authorized");
  if (decision.status !== "queue-authorized") {
    return;
  }
  assert.equal(decision.treatInputAsUntrustedData, true);
  assert.equal(decision.modelToolAccessAllowed, false);
  assert.equal(decision.providerTrainingAllowed, false);
  assert.equal(decision.humanProviderReviewAllowed, false);
  assert.equal(decision.autoPersistAllowed, false);
  assert.match(decision.dedupeKey, /homevault-ai-assistance-v1/);
});

test("denies implicit, read-only, cross-property and unsafe source data", () => {
  assert.deepEqual(decideAiRequest({ ...requestInput, userRequested: false }), {
    status: "unavailable",
  });
  assert.deepEqual(decideAiRequest({ ...requestInput, role: "GUEST" }), {
    status: "read-only",
  });
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sources: [{ ...sources[0], homeId: "home-2" }],
    }),
    { status: "invalid-source", reason: "content" },
  );
  for (const unsafe of [
    { containsProviderUrl: true },
    { containsAuthenticationData: true },
    { containsPaymentCredentials: true },
    { containsUnconfirmedOcr: true },
    { reviewedTextOnly: false },
  ]) {
    assert.deepEqual(
      decideAiRequest({
        ...requestInput,
        sources: [{ ...sources[0], ...unsafe }],
      }),
      { status: "invalid-source", reason: "content" },
    );
  }
});

test("keeps provider terms as explicit enablement gates", () => {
  assert.deepEqual(
    decideAiRequest({ ...requestInput, providerApproved: false }),
    { status: "provider-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, approvedRegionConfigured: false }),
    { status: "provider-gate", reason: "region" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, boundedRetentionConfigured: false }),
    { status: "provider-gate", reason: "retention" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, trainingDisabled: false }),
    { status: "provider-gate", reason: "training" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, humanProviderReviewDisabled: false }),
    { status: "provider-gate", reason: "human-review" },
  );
});

test("validates target, bounds and exact-job deduplication", () => {
  assert.deepEqual(
    decideAiRequest({ ...requestInput, targetRecordId: "other" }),
    { status: "invalid-source", reason: "target" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sources: [{ ...sources[0], characterCount: 30_001 }],
    }),
    { status: "invalid-source", reason: "size" },
  );
  assert.deepEqual(
    decideAiRequest({ ...requestInput, existingJob: job }),
    { status: "duplicate", jobId: "ai-job-1" },
  );
  assert.equal(
    decideAiRequest({
      ...requestInput,
      existingJob: { ...job, expiresAt: now },
    }).status,
    "queue-authorized",
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      capability: "CLASSIFICATION",
      targetRecordId: "asset-1",
      targetRevision: "revision-1",
    }),
    { status: "invalid-source", reason: "target" },
  );
});

test("fails closed for malformed runtime request values", () => {
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      capability: "UNKNOWN" as typeof requestInput.capability,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sources: [
        {
          ...sources[0],
          recordType: "UNKNOWN" as AiSourceSnapshot["recordType"],
        },
      ],
    }),
    { status: "invalid-source", reason: "content" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      now: new Date("invalid"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiRequest({
      ...requestInput,
      sources: undefined as unknown as AiSourceSnapshot[],
    }),
    { status: "unavailable" },
  );
});

test("accepts safe structurally valid output only as a reviewable draft", () => {
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [summaryDraft],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    {
      status: "draft-authorized",
      jobId: "ai-job-1",
      drafts: [summaryDraft],
      requireUserReview: true,
      autoPersistAllowed: false,
      modelToolAccessAllowed: false,
    },
  );
});

test("fails closed for prompt injection and prohibited output domains", () => {
  for (const key of Object.keys(safe) as Array<keyof AiSafetyAssessment>) {
    assert.deepEqual(
      decideAiResult({
        job,
        drafts: [summaryDraft],
        safety: { ...safe, [key]: true },
        currentSourceSnapshotDigest: snapshotDigest,
        now,
      }),
      { status: "failed-closed", reason: "unsafe" },
    );
  }
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [summaryDraft],
      safety: {} as AiSafetyAssessment,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "unsafe" },
  );
});

test("rejects expired, stale, oversized and mismatched results", () => {
  assert.deepEqual(
    decideAiResult({
      job: { ...job, expiresAt: now },
      drafts: [summaryDraft],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "expired" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [summaryDraft],
      safety: safe,
      currentSourceSnapshotDigest: "changed",
      now,
    }),
    { status: "failed-closed", reason: "stale" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [{ ...summaryDraft, summary: "x".repeat(1_201) }],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [{ ...summaryDraft, homeId: "home-2" }],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [
        {
          ...summaryDraft,
          sourceRecordIds: ["asset-1", "asset-1"],
        },
      ],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideAiResult({
      job,
      drafts: [
        {
          ...summaryDraft,
          createdAt: new Date("2026-07-28T06:00:00.000Z"),
        },
      ],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideAiResult({
      job: { ...job, createdAt: new Date("invalid") },
      drafts: [summaryDraft],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAiResult({
      job: { ...job, sourceRecordIds: [] },
      drafts: [summaryDraft],
      safety: safe,
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    { status: "unavailable" },
  );
});

test("applies classification or summary only after current-scope confirmation", () => {
  const readyJob = { ...job, status: "DRAFT_READY" as const };
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT" as const,
    job: readyJob,
    draft: summaryDraft,
    confirmation: {
      draftId: "draft-summary-1",
      confirmed: true,
      acceptedValue:
        "Fictional heat-pump water heater with its reviewed manual attached.",
    },
    currentTargetRevision: "revision-1",
    currentSourceSnapshotDigest: snapshotDigest,
    now,
  };
  const decision = decideAiApply(input);
  assert.equal(decision.status, "metadata-apply-authorized");
  if (decision.status !== "metadata-apply-authorized") {
    return;
  }
  assert.equal(decision.userEdited, true);
  assert.equal(decision.requireAtomicRevisionCheck, true);
  assert.equal(decision.provenance.sourceSnapshotDigest, snapshotDigest);

  assert.deepEqual(
    decideAiApply({
      ...input,
      confirmation: { ...input.confirmation, confirmed: false },
    }),
    { status: "confirmation-required" },
  );
  assert.deepEqual(
    decideAiApply({
      ...input,
      confirmation: {
        ...input.confirmation,
        acceptedValue: null as unknown as string,
      },
    }),
    { status: "confirmation-required" },
  );
});

test("re-authorizes apply and rejects stale revisions or source snapshots", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    job: { ...job, status: "DRAFT_READY" as const },
    draft: summaryDraft,
    confirmation: {
      draftId: "draft-summary-1",
      confirmed: true,
      acceptedValue: summaryDraft.kind === "SUMMARY" ? summaryDraft.summary : "",
    },
    currentTargetRevision: "revision-1",
    currentSourceSnapshotDigest: snapshotDigest,
    now,
  };
  assert.deepEqual(decideAiApply({ ...input, role: "CHILD" }), {
    status: "read-only",
  });
  assert.deepEqual(
    decideAiApply({ ...input, currentTargetRevision: "revision-2" }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideAiApply({ ...input, currentSourceSnapshotDigest: "changed" }),
    { status: "stale-source" },
  );
});

test("maintenance suggestions can only prefill the ordinary review form", () => {
  const suggestionJob: AiAssistanceJob = {
    ...job,
    id: "ai-job-suggestion",
    capability: "MAINTENANCE_SUGGESTION",
    status: "DRAFT_READY",
  };
  const suggestion: AiAssistanceDraft = {
    ...summaryDraft,
    id: "draft-suggestion",
    jobId: "ai-job-suggestion",
    kind: "MAINTENANCE_SUGGESTION",
    title: "Review the water-heater anode",
    rationale: "The fictional manual mentions periodic anode inspection.",
    suggestedIntervalDays: 730,
    requiresManufacturerVerification: true,
  };
  assert.deepEqual(
    decideAiApply({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      job: suggestionJob,
      draft: suggestion,
      confirmation: {
        draftId: "draft-suggestion",
        confirmed: true,
        acceptedValue: suggestion.title,
      },
      currentTargetRevision: "revision-1",
      currentSourceSnapshotDigest: snapshotDigest,
      now,
    }),
    {
      status: "maintenance-review-authorized",
      homeId: "home-1",
      targetRecordId: "asset-1",
      prefill: {
        title: "Review the water-heater anode",
        rationale: "The fictional manual mentions periodic anode inspection.",
        suggestedIntervalDays: 730,
      },
      createAutomatically: false,
      scheduleAutomatically: false,
      contactProviderAutomatically: false,
      requireManufacturerVerification: true,
    },
  );
});

test("cleanup removes processor and draft state without false completion", () => {
  assert.deepEqual(decideAiCleanup({ scope: "DRAFT" }), {
    cancelQueuedAndProcessingJobs: true,
    deleteDraftOutputs: true,
    deleteProcessorCopies: true,
    deleteRelationalJobMetadata: true,
    revokeProcessorAccess: true,
    preserveUserConfirmedRecordValues: true,
    requireRetryableCleanupLedger: true,
  });
  assert.equal(
    decideAiCleanup({ scope: "ACCOUNT" }).preserveUserConfirmedRecordValues,
    false,
  );
});
