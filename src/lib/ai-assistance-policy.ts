export const AI_ASSISTANCE_POLICY_VERSION = "homevault-ai-assistance-v1";
export const AI_MAX_SOURCE_RECORDS = 20;
export const AI_MAX_SOURCE_CHARACTERS = 30_000;
export const AI_MAX_DRAFTS = 5;
export const AI_MAX_SUMMARY_LENGTH = 1_200;
export const AI_MAX_SUGGESTION_TITLE_LENGTH = 120;
export const AI_MAX_SUGGESTION_RATIONALE_LENGTH = 1_000;
export const AI_JOB_TTL_MS = 24 * 60 * 60 * 1000;

export const AI_CLASSIFICATION_ALLOWLIST = [
  "RECEIPT",
  "WARRANTY",
  "MANUAL",
  "MAINTENANCE_RECORD",
  "PRODUCT_INFORMATION",
  "OTHER",
] as const;

const AI_CAPABILITIES = [
  "CLASSIFICATION",
  "SUMMARY",
  "MAINTENANCE_SUGGESTION",
] as const;

const AI_SOURCE_RECORD_TYPES = [
  "ASSET",
  "MAINTENANCE",
  "WARRANTY",
  "RECEIPT",
  "DOCUMENT",
] as const;

const AI_ACTIVE_JOB_STATUSES = [
  "QUEUED",
  "PROCESSING",
  "DRAFT_READY",
] as const;

export type AiRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type AiCapability =
  | "CLASSIFICATION"
  | "SUMMARY"
  | "MAINTENANCE_SUGGESTION";
export type AiClassification =
  (typeof AI_CLASSIFICATION_ALLOWLIST)[number];

export type AiSourceSnapshot = {
  recordId: string;
  homeId: string;
  recordType:
    | "ASSET"
    | "MAINTENANCE"
    | "WARRANTY"
    | "RECEIPT"
    | "DOCUMENT";
  revision: string;
  contentDigest: string;
  characterCount: number;
  reviewedTextOnly: boolean;
  containsProviderUrl: boolean;
  containsAuthenticationData: boolean;
  containsPaymentCredentials: boolean;
  containsUnconfirmedOcr: boolean;
};

export type AiAssistanceJob = {
  id: string;
  userId: string;
  homeId: string;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: string;
  sourceSnapshotDigest: string;
  sourceRecordIds: readonly string[];
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  policyVersion: string;
  status:
    | "QUEUED"
    | "PROCESSING"
    | "DRAFT_READY"
    | "FAILED"
    | "DELETION_PENDING";
  createdAt: Date;
  expiresAt: Date;
};

type AiDraftBase = {
  id: string;
  jobId: string;
  userId: string;
  homeId: string;
  targetRecordId: string;
  targetRevision: string;
  sourceSnapshotDigest: string;
  sourceRecordIds: readonly string[];
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  policyVersion: string;
  createdAt: Date;
};

export type AiClassificationDraft = AiDraftBase & {
  kind: "CLASSIFICATION";
  classification: AiClassification;
};

export type AiSummaryDraft = AiDraftBase & {
  kind: "SUMMARY";
  summary: string;
};

export type AiMaintenanceSuggestionDraft = AiDraftBase & {
  kind: "MAINTENANCE_SUGGESTION";
  title: string;
  rationale: string;
  suggestedIntervalDays: number | null;
  requiresManufacturerVerification: true;
};

export type AiAssistanceDraft =
  | AiClassificationDraft
  | AiSummaryDraft
  | AiMaintenanceSuggestionDraft;

export type AiSafetyAssessment = {
  promptInjectionDetected: boolean;
  prohibitedFinancialOrInsuranceAdvice: boolean;
  safetyCriticalClaim: boolean;
  providerContactOrPaymentInstruction: boolean;
  hiddenOrExecutableInstruction: boolean;
};

export type AiRequestDecision =
  | {
      status: "queue-authorized";
      homeId: string;
      capability: AiCapability;
      targetRecordId: string;
      idempotencyKey: string;
      dedupeKey: string;
      expiresAt: Date;
      treatInputAsUntrustedData: true;
      modelToolAccessAllowed: false;
      providerTrainingAllowed: false;
      humanProviderReviewAllowed: false;
      autoPersistAllowed: false;
    }
  | { status: "duplicate"; jobId: string }
  | { status: "read-only" }
  | {
      status: "provider-gate";
      reason:
        | "provider"
        | "region"
        | "retention"
        | "training"
        | "human-review";
    }
  | {
      status: "invalid-source";
      reason: "count" | "size" | "content" | "target";
    }
  | { status: "unavailable" };

export type AiResultDecision =
  | {
      status: "draft-authorized";
      jobId: string;
      drafts: AiAssistanceDraft[];
      requireUserReview: true;
      autoPersistAllowed: false;
      modelToolAccessAllowed: false;
    }
  | {
      status: "failed-closed";
      reason: "expired" | "stale" | "unsafe" | "invalid-result";
    }
  | { status: "unavailable" };

export type AiDraftConfirmation = {
  draftId: string;
  confirmed: boolean;
  acceptedValue: string;
};

export type AiApplyDecision =
  | {
      status: "metadata-apply-authorized";
      homeId: string;
      targetRecordId: string;
      targetRevision: string;
      kind: "CLASSIFICATION" | "SUMMARY";
      acceptedValue: string;
      userEdited: boolean;
      requireAtomicRevisionCheck: true;
      provenance: {
        jobId: string;
        draftId: string;
        sourceSnapshotDigest: string;
        sourceRecordIds: readonly string[];
        modelProvider: string;
        modelName: string;
        modelVersion: string;
        policyVersion: string;
        generatedAt: Date;
      };
    }
  | {
      status: "maintenance-review-authorized";
      homeId: string;
      targetRecordId: string;
      prefill: {
        title: string;
        rationale: string;
        suggestedIntervalDays: number | null;
      };
      createAutomatically: false;
      scheduleAutomatically: false;
      contactProviderAutomatically: false;
      requireManufacturerVerification: true;
    }
  | { status: "confirmation-required" }
  | { status: "stale-source" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AiCleanupDecision = {
  cancelQueuedAndProcessingJobs: true;
  deleteDraftOutputs: true;
  deleteProcessorCopies: true;
  deleteRelationalJobMetadata: true;
  revokeProcessorAccess: true;
  preserveUserConfirmedRecordValues: boolean;
  requireRetryableCleanupLedger: true;
};

function hasWriteRole(role: AiRole) {
  return role === "OWNER" || role === "ADULT";
}

function validText(value: unknown, maximum: number) {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(normalized)
  );
}

function validOpaqueValue(value: unknown, maximum = 512): value is string {
  return validText(value, maximum);
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isCapability(value: unknown): value is AiCapability {
  return AI_CAPABILITIES.includes(value as AiCapability);
}

function isSourceRecordType(
  value: unknown,
): value is AiSourceSnapshot["recordType"] {
  return AI_SOURCE_RECORD_TYPES.includes(
    value as AiSourceSnapshot["recordType"],
  );
}

function isClassification(value: unknown): value is AiClassification {
  return AI_CLASSIFICATION_ALLOWLIST.includes(value as AiClassification);
}

function isActiveJobStatus(
  value: unknown,
): value is (typeof AI_ACTIVE_JOB_STATUSES)[number] {
  return AI_ACTIVE_JOB_STATUSES.includes(
    value as (typeof AI_ACTIVE_JOB_STATUSES)[number],
  );
}

function sourceSetMatches(
  expected: readonly string[],
  actual: readonly string[],
) {
  if (expected.length !== actual.length) {
    return false;
  }
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  return expectedSet.size === expected.length &&
    actualSet.size === actual.length &&
    actual.every((recordId) => expectedSet.has(recordId));
}

function draftMatchesJob(
  draft: AiAssistanceDraft,
  job: AiAssistanceJob,
  now: Date,
) {
  return (
    validOpaqueValue(draft.id) &&
    validOpaqueValue(draft.jobId) &&
    validOpaqueValue(draft.userId) &&
    validOpaqueValue(draft.homeId) &&
    validOpaqueValue(draft.targetRecordId) &&
    validOpaqueValue(draft.targetRevision) &&
    validOpaqueValue(draft.sourceSnapshotDigest, 4_096) &&
    validOpaqueValue(draft.modelProvider) &&
    validOpaqueValue(draft.modelName) &&
    validOpaqueValue(draft.modelVersion) &&
    validDate(draft.createdAt) &&
    validDate(now) &&
    draft.jobId === job.id &&
    draft.userId === job.userId &&
    draft.homeId === job.homeId &&
    draft.kind === job.capability &&
    draft.targetRecordId === job.targetRecordId &&
    draft.targetRevision === job.targetRevision &&
    draft.sourceSnapshotDigest === job.sourceSnapshotDigest &&
    sourceSetMatches(job.sourceRecordIds, draft.sourceRecordIds) &&
    draft.modelProvider === job.modelProvider &&
    draft.modelName === job.modelName &&
    draft.modelVersion === job.modelVersion &&
    draft.policyVersion === AI_ASSISTANCE_POLICY_VERSION &&
    draft.createdAt >= job.createdAt &&
    draft.createdAt <= now &&
    draft.createdAt < job.expiresAt
  );
}

function validDraftContent(draft: AiAssistanceDraft) {
  if (draft.kind === "CLASSIFICATION") {
    return isClassification(draft.classification);
  }
  if (draft.kind === "SUMMARY") {
    return validText(draft.summary, AI_MAX_SUMMARY_LENGTH);
  }
  if (draft.kind !== "MAINTENANCE_SUGGESTION") {
    return false;
  }
  return (
    validText(draft.title, AI_MAX_SUGGESTION_TITLE_LENGTH) &&
    validText(draft.rationale, AI_MAX_SUGGESTION_RATIONALE_LENGTH) &&
    draft.requiresManufacturerVerification === true &&
    (draft.suggestedIntervalDays === null ||
      (Number.isInteger(draft.suggestedIntervalDays) &&
        draft.suggestedIntervalDays >= 1 &&
        draft.suggestedIntervalDays <= 3650))
  );
}

export function decideAiRequest({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  capability,
  targetRecordId,
  targetRevision,
  sources,
  canonicalSourceSnapshotDigest,
  userRequested,
  modelProvider,
  modelName,
  modelVersion,
  providerApproved,
  approvedRegionConfigured,
  boundedRetentionConfigured,
  trainingDisabled,
  humanProviderReviewDisabled,
  idempotencyKey,
  existingJob,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: AiRole;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: string;
  sources: readonly AiSourceSnapshot[];
  canonicalSourceSnapshotDigest: string;
  userRequested: boolean;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  providerApproved: boolean;
  approvedRegionConfigured: boolean;
  boundedRetentionConfigured: boolean;
  trainingDisabled: boolean;
  humanProviderReviewDisabled: boolean;
  idempotencyKey: string;
  existingJob?: AiAssistanceJob;
  now: Date;
}): AiRequestDecision {
  if (
    !validOpaqueValue(currentUserId) ||
    !validOpaqueValue(selectedHomeId) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !userRequested ||
    !isCapability(capability) ||
    !validOpaqueValue(targetRecordId) ||
    !validOpaqueValue(targetRevision) ||
    !validOpaqueValue(canonicalSourceSnapshotDigest, 4_096) ||
    !validOpaqueValue(modelProvider) ||
    !validOpaqueValue(modelName) ||
    !validOpaqueValue(modelVersion) ||
    !validOpaqueValue(idempotencyKey) ||
    !validDate(now) ||
    !Array.isArray(sources)
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (sources.length < 1 || sources.length > AI_MAX_SOURCE_RECORDS) {
    return { status: "invalid-source", reason: "count" };
  }

  const seen = new Set<string>();
  let characterCount = 0;
  for (const source of sources) {
    if (
      !source.recordId ||
      seen.has(source.recordId) ||
      source.homeId !== selectedHomeId ||
      !validOpaqueValue(source.recordId) ||
      !validOpaqueValue(source.homeId) ||
      !isSourceRecordType(source.recordType) ||
      !validOpaqueValue(source.revision) ||
      !validOpaqueValue(source.contentDigest, 4_096) ||
      !Number.isInteger(source.characterCount) ||
      !Number.isSafeInteger(source.characterCount) ||
      source.characterCount < 1 ||
      typeof source.reviewedTextOnly !== "boolean" ||
      typeof source.containsProviderUrl !== "boolean" ||
      typeof source.containsAuthenticationData !== "boolean" ||
      typeof source.containsPaymentCredentials !== "boolean" ||
      typeof source.containsUnconfirmedOcr !== "boolean"
    ) {
      return { status: "invalid-source", reason: "content" };
    }
    seen.add(source.recordId);
    characterCount += source.characterCount;
    if (!Number.isSafeInteger(characterCount)) {
      return { status: "invalid-source", reason: "size" };
    }
    if (
      !source.reviewedTextOnly ||
      source.containsProviderUrl ||
      source.containsAuthenticationData ||
      source.containsPaymentCredentials ||
      source.containsUnconfirmedOcr
    ) {
      return { status: "invalid-source", reason: "content" };
    }
  }

  if (characterCount > AI_MAX_SOURCE_CHARACTERS) {
    return { status: "invalid-source", reason: "size" };
  }

  const target = sources.find((source) => source.recordId === targetRecordId);
  if (!target || target.revision !== targetRevision) {
    return { status: "invalid-source", reason: "target" };
  }
  if (
    (capability === "CLASSIFICATION" &&
      target.recordType !== "DOCUMENT" &&
      target.recordType !== "RECEIPT") ||
    (capability === "MAINTENANCE_SUGGESTION" &&
      target.recordType !== "ASSET" &&
      target.recordType !== "MAINTENANCE")
  ) {
    return { status: "invalid-source", reason: "target" };
  }

  if (!providerApproved) {
    return { status: "provider-gate", reason: "provider" };
  }
  if (!approvedRegionConfigured) {
    return { status: "provider-gate", reason: "region" };
  }
  if (!boundedRetentionConfigured) {
    return { status: "provider-gate", reason: "retention" };
  }
  if (!trainingDisabled) {
    return { status: "provider-gate", reason: "training" };
  }
  if (!humanProviderReviewDisabled) {
    return { status: "provider-gate", reason: "human-review" };
  }

  const snapshotDigest = canonicalSourceSnapshotDigest;
  const dedupeKey = [
    currentUserId,
    selectedHomeId,
    capability,
    targetRecordId,
    targetRevision,
    snapshotDigest,
    modelProvider,
    modelName,
    modelVersion,
    AI_ASSISTANCE_POLICY_VERSION,
  ];

  if (existingJob) {
    if (
      !validOpaqueValue(existingJob.id) ||
      !validDate(existingJob.createdAt) ||
      !validDate(existingJob.expiresAt) ||
      existingJob.expiresAt <= existingJob.createdAt ||
      existingJob.expiresAt.getTime() - existingJob.createdAt.getTime() >
        AI_JOB_TTL_MS ||
      existingJob.userId !== currentUserId ||
      existingJob.homeId !== selectedHomeId ||
      existingJob.targetRecordId !== targetRecordId ||
      existingJob.targetRevision !== targetRevision ||
      existingJob.sourceSnapshotDigest !== snapshotDigest
    ) {
      return { status: "unavailable" };
    }
    if (
      existingJob.capability === capability &&
      existingJob.modelProvider === modelProvider &&
      existingJob.modelName === modelName &&
      existingJob.modelVersion === modelVersion &&
      existingJob.policyVersion === AI_ASSISTANCE_POLICY_VERSION &&
      isActiveJobStatus(existingJob.status) &&
      now < existingJob.expiresAt
    ) {
      return { status: "duplicate", jobId: existingJob.id };
    }
  }

  return {
    status: "queue-authorized",
    homeId: selectedHomeId,
    capability,
    targetRecordId,
    idempotencyKey,
    dedupeKey: JSON.stringify(dedupeKey),
    expiresAt: new Date(now.getTime() + AI_JOB_TTL_MS),
    treatInputAsUntrustedData: true,
    modelToolAccessAllowed: false,
    providerTrainingAllowed: false,
    humanProviderReviewAllowed: false,
    autoPersistAllowed: false,
  };
}

export function decideAiResult({
  job,
  drafts,
  safety,
  currentSourceSnapshotDigest,
  now,
}: {
  job: AiAssistanceJob;
  drafts: readonly AiAssistanceDraft[];
  safety: AiSafetyAssessment;
  currentSourceSnapshotDigest: string;
  now: Date;
}): AiResultDecision {
  if (
    !job ||
    !validOpaqueValue(job.id) ||
    !validOpaqueValue(job.userId) ||
    !validOpaqueValue(job.homeId) ||
    !isCapability(job.capability) ||
    !validOpaqueValue(job.targetRecordId) ||
    !validOpaqueValue(job.targetRevision) ||
    !validOpaqueValue(job.sourceSnapshotDigest, 4_096) ||
    !validOpaqueValue(job.modelProvider) ||
    !validOpaqueValue(job.modelName) ||
    !validOpaqueValue(job.modelVersion) ||
    !validDate(job.createdAt) ||
    !validDate(job.expiresAt) ||
    job.expiresAt <= job.createdAt ||
    job.expiresAt.getTime() - job.createdAt.getTime() > AI_JOB_TTL_MS ||
    !validDate(now) ||
    !Array.isArray(job.sourceRecordIds) ||
    job.sourceRecordIds.length < 1 ||
    job.sourceRecordIds.length > AI_MAX_SOURCE_RECORDS ||
    new Set(job.sourceRecordIds).size !== job.sourceRecordIds.length ||
    job.sourceRecordIds.some((recordId) => !validOpaqueValue(recordId)) ||
    job.status !== "PROCESSING" ||
    job.policyVersion !== AI_ASSISTANCE_POLICY_VERSION
  ) {
    return { status: "unavailable" };
  }
  if (now >= job.expiresAt) {
    return { status: "failed-closed", reason: "expired" };
  }
  if (currentSourceSnapshotDigest !== job.sourceSnapshotDigest) {
    return { status: "failed-closed", reason: "stale" };
  }
  if (
    !safety ||
    safety.promptInjectionDetected !== false ||
    safety.prohibitedFinancialOrInsuranceAdvice !== false ||
    safety.safetyCriticalClaim !== false ||
    safety.providerContactOrPaymentInstruction !== false ||
    safety.hiddenOrExecutableInstruction !== false
  ) {
    return { status: "failed-closed", reason: "unsafe" };
  }
  if (
    !Array.isArray(drafts) ||
    drafts.length < 1 ||
    drafts.length > AI_MAX_DRAFTS ||
    new Set(drafts.map((draft) => draft.id)).size !== drafts.length ||
    drafts.some(
      (draft) =>
        !draft.id ||
        !draftMatchesJob(draft, job, now) ||
        !validDraftContent(draft),
    )
  ) {
    return { status: "failed-closed", reason: "invalid-result" };
  }
  return {
    status: "draft-authorized",
    jobId: job.id,
    drafts: [...drafts],
    requireUserReview: true,
    autoPersistAllowed: false,
    modelToolAccessAllowed: false,
  };
}

export function decideAiApply({
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  job,
  draft,
  confirmation,
  currentTargetRevision,
  currentSourceSnapshotDigest,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: AiRole;
  job: AiAssistanceJob;
  draft: AiAssistanceDraft;
  confirmation: AiDraftConfirmation;
  currentTargetRevision: string;
  currentSourceSnapshotDigest: string;
  now: Date;
}): AiApplyDecision {
  if (
    !job ||
    !draft ||
    !confirmation ||
    !validOpaqueValue(currentUserId) ||
    !validOpaqueValue(selectedHomeId) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !validOpaqueValue(currentTargetRevision) ||
    !validOpaqueValue(currentSourceSnapshotDigest, 4_096) ||
    !validDate(now) ||
    !validDate(job.createdAt) ||
    !validDate(job.expiresAt) ||
    job.expiresAt <= job.createdAt ||
    job.expiresAt.getTime() - job.createdAt.getTime() > AI_JOB_TTL_MS ||
    !Array.isArray(job.sourceRecordIds) ||
    job.sourceRecordIds.length < 1 ||
    job.sourceRecordIds.length > AI_MAX_SOURCE_RECORDS ||
    new Set(job.sourceRecordIds).size !== job.sourceRecordIds.length ||
    job.sourceRecordIds.some((recordId) => !validOpaqueValue(recordId)) ||
    !isCapability(job.capability) ||
    job.userId !== currentUserId ||
    job.homeId !== selectedHomeId ||
    job.status !== "DRAFT_READY" ||
    job.policyVersion !== AI_ASSISTANCE_POLICY_VERSION ||
    !draftMatchesJob(draft, job, now)
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }
  if (
    now >= job.expiresAt ||
    currentTargetRevision !== job.targetRevision ||
    currentSourceSnapshotDigest !== job.sourceSnapshotDigest
  ) {
    return { status: "stale-source" };
  }
  if (
    !validOpaqueValue(confirmation.draftId) ||
    confirmation.draftId !== draft.id ||
    confirmation.confirmed !== true ||
    !validDraftContent(draft)
  ) {
    return { status: "confirmation-required" };
  }

  if (draft.kind === "MAINTENANCE_SUGGESTION") {
    if (typeof confirmation.acceptedValue !== "string") {
      return { status: "confirmation-required" };
    }
    const acceptedTitle = confirmation.acceptedValue.trim();
    if (
      !validText(acceptedTitle, AI_MAX_SUGGESTION_TITLE_LENGTH) ||
      acceptedTitle !== draft.title
    ) {
      return { status: "confirmation-required" };
    }
    return {
      status: "maintenance-review-authorized",
      homeId: selectedHomeId,
      targetRecordId: job.targetRecordId,
      prefill: {
        title: draft.title,
        rationale: draft.rationale,
        suggestedIntervalDays: draft.suggestedIntervalDays,
      },
      createAutomatically: false,
      scheduleAutomatically: false,
      contactProviderAutomatically: false,
      requireManufacturerVerification: true,
    };
  }

  const generatedValue =
    draft.kind === "CLASSIFICATION" ? draft.classification : draft.summary;
  if (typeof confirmation.acceptedValue !== "string") {
    return { status: "confirmation-required" };
  }
  const acceptedValue = confirmation.acceptedValue.trim();
  const validAccepted =
    draft.kind === "CLASSIFICATION"
      ? isClassification(acceptedValue)
      : validText(acceptedValue, AI_MAX_SUMMARY_LENGTH);
  if (!validAccepted) {
    return { status: "confirmation-required" };
  }

  return {
    status: "metadata-apply-authorized",
    homeId: selectedHomeId,
    targetRecordId: job.targetRecordId,
    targetRevision: job.targetRevision,
    kind: draft.kind,
    acceptedValue,
    userEdited: acceptedValue !== generatedValue,
    requireAtomicRevisionCheck: true,
    provenance: {
      jobId: job.id,
      draftId: draft.id,
      sourceSnapshotDigest: draft.sourceSnapshotDigest,
      sourceRecordIds: draft.sourceRecordIds,
      modelProvider: draft.modelProvider,
      modelName: draft.modelName,
      modelVersion: draft.modelVersion,
      policyVersion: draft.policyVersion,
      generatedAt: draft.createdAt,
    },
  };
}

export function decideAiCleanup({
  scope,
}: {
  scope: "DRAFT" | "RECORD" | "PROPERTY" | "ACCOUNT";
}): AiCleanupDecision {
  return {
    cancelQueuedAndProcessingJobs: true,
    deleteDraftOutputs: true,
    deleteProcessorCopies: true,
    deleteRelationalJobMetadata: true,
    revokeProcessorAccess: true,
    preserveUserConfirmedRecordValues: scope === "DRAFT",
    requireRetryableCleanupLedger: true,
  };
}
