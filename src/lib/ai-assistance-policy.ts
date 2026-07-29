import { createHash } from "node:crypto";

export const AI_ASSISTANCE_POLICY_VERSION = "homevault-ai-assistance-v2";
export const AI_MAX_SOURCE_RECORDS = 20;
export const AI_MAX_SOURCE_CHARACTERS = 30_000;
export const AI_MAX_DRAFTS = 5;
export const AI_MAX_SUMMARY_LENGTH = 1_200;
export const AI_MAX_SUGGESTION_TITLE_LENGTH = 120;
export const AI_MAX_SUGGESTION_RATIONALE_LENGTH = 1_000;
export const AI_JOB_TTL_MS = 24 * 60 * 60 * 1000;
export const AI_AUTHORIZATION_TTL_MS = 10 * 60 * 1000;
export const AI_PROVIDER_APPROVAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const AI_CLASSIFICATION_ALLOWLIST = [
  "RECEIPT",
  "WARRANTY",
  "MANUAL",
  "MAINTENANCE_RECORD",
  "PRODUCT_INFORMATION",
  "OTHER",
] as const;

export const AI_CLEANUP_TARGETS = [
  "ACTIVE_JOBS",
  "TEMPORARY_PROCESSOR_ACCESS",
  "RAW_PROCESSOR_REQUESTS",
  "RAW_PROCESSOR_RESPONSES",
  "UNCONFIRMED_DRAFTS",
  "DRAFT_PROVENANCE",
  "PROCESSOR_COPIES",
  "SERVER_CACHES",
  "DEVICE_OFFLINE_COPIES",
  "QUEUED_ACTIONS",
  "RELATIONAL_METADATA",
  "REDACTED_AUDIT_REFERENCES",
] as const;

const CAPABILITIES = [
  "CLASSIFICATION",
  "SUMMARY",
  "MAINTENANCE_SUGGESTION",
] as const;

const RECORD_TYPES = [
  "ASSET",
  "MAINTENANCE",
  "WARRANTY",
  "RECEIPT",
  "DOCUMENT",
] as const;

export type AiRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type AiCapability = (typeof CAPABILITIES)[number];
export type AiClassification =
  (typeof AI_CLASSIFICATION_ALLOWLIST)[number];
export type AiPurpose = "AI_REQUEST" | "AI_APPLY" | "AI_EXPORT";

export type AiSourceSnapshot = {
  recordId: string;
  homeId: string;
  recordType: (typeof RECORD_TYPES)[number];
  revision: number;
  contentDigest: string;
  characterCount: number;
  provenance: "USER_CONFIRMED" | "CONFIRMED_OCR";
  reviewedTextOnly: true;
  containsProviderUrl: false;
  containsAuthenticationData: false;
  containsPaymentCredentials: false;
  containsUnconfirmedOcr: false;
};

export type AiAuthorizationEvidence = {
  id: string;
  purpose: AiPurpose;
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  role: AiRole;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sourceSnapshotDigest: string;
  verifiedSession: true;
  membershipActive: true;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type AiProviderApproval = {
  id: string;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  region: string;
  retentionHours: number;
  privateProcessing: true;
  trainingDisabled: true;
  humanProviderReviewDisabled: true;
  providerLoggingDisabled: true;
  deletionSupported: true;
  toolAccessDisabled: true;
  browsingDisabled: true;
  clientApproved: true;
  privacyApproved: true;
  legalApproved: true;
  costApproved: true;
  issuedAt: Date;
  expiresAt: Date;
  revoked: false;
};

export type AiAssistanceJob = {
  id: string;
  requestId: string;
  idempotencyKey: string;
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sourceSnapshotDigest: string;
  sourceBindings: readonly {
    recordId: string;
    revision: number;
    contentDigest: string;
  }[];
  providerApprovalId: string;
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  policyVersion: string;
  status:
    | "QUEUED"
    | "PROCESSING"
    | "DRAFT_READY"
    | "FAILED"
    | "CANCELLED"
    | "DELETION_PENDING";
  createdAt: Date;
  expiresAt: Date;
};

type AiDraftBase = {
  id: string;
  version: number;
  jobId: string;
  userId: string;
  homeId: string;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sourceSnapshotDigest: string;
  sourceBindings: readonly {
    recordId: string;
    revision: number;
    contentDigest: string;
  }[];
  modelProvider: string;
  modelName: string;
  modelVersion: string;
  policyVersion: string;
  outputDigest: string;
  status: "REVIEW_REQUIRED";
  createdAt: Date;
  expiresAt: Date;
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

type AiDraftWithoutDigest =
  | Omit<AiClassificationDraft, "outputDigest">
  | Omit<AiSummaryDraft, "outputDigest">
  | Omit<AiMaintenanceSuggestionDraft, "outputDigest">;

export type AiSafetyEvidence = {
  id: string;
  jobId: string;
  draftSetDigest: string;
  evaluatorVersion: string;
  promptInjectionDetected: false;
  prohibitedFinancialOrInsuranceAdvice: false;
  safetyCriticalClaim: false;
  providerContactOrPaymentInstruction: false;
  hiddenOrExecutableInstruction: false;
  behaviouralProfiling: false;
  issuedAt: Date;
  expiresAt: Date;
};

export type AiConfirmationEvidence = {
  id: string;
  purpose: "AI_APPLY";
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  targetRecordId: string;
  targetRevision: number;
  jobId: string;
  draftId: string;
  draftVersion: number;
  outputDigest: string;
  acceptedValueDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type AiRequestDecision =
  | {
      status: "queue-authorized";
      requestId: string;
      homeId: string;
      capability: AiCapability;
      targetRecordId: string;
      targetRevision: number;
      sourceSnapshotDigest: string;
      idempotencyKey: string;
      dedupeKey: string;
      expiresAt: Date;
      treatInputAsUntrustedData: true;
      modelToolAccessAllowed: false;
      modelBrowsingAllowed: false;
      providerTrainingAllowed: false;
      humanProviderReviewAllowed: false;
      providerLoggingAllowed: false;
      rawResponsePersistenceAllowed: false;
      autoPersistAllowed: false;
    }
  | { status: "duplicate"; jobId: string }
  | { status: "read-only" }
  | {
      status: "provider-gate";
      reason: "approval" | "region" | "retention" | "privacy";
    }
  | {
      status: "invalid-source";
      reason: "count" | "size" | "content" | "target" | "digest";
    }
  | { status: "unavailable" };

export type AiResultDecision =
  | {
      status: "draft-authorized";
      jobId: string;
      drafts: AiAssistanceDraft[];
      draftSetDigest: string;
      requireUserReview: true;
      autoPersistAllowed: false;
      automatedDecisionAllowed: false;
      modelToolAccessAllowed: false;
    }
  | {
      status: "failed-closed";
      reason: "expired" | "stale" | "unsafe" | "invalid-result";
    }
  | { status: "unavailable" };

export type AiApplyDecision =
  | {
      status: "metadata-apply-authorized";
      homeId: string;
      targetRecordId: string;
      expectedTargetRevision: number;
      expectedDraftVersion: number;
      acceptedValue: string;
      generatedValue: string;
      userEdited: boolean;
      kind: "CLASSIFICATION" | "SUMMARY";
      consumeConfirmationEvidenceId: string;
      requireCompareAndSet: true;
      requireAtomicWrite: true;
      provenance: {
        jobId: string;
        draftId: string;
        draftVersion: number;
        sourceSnapshotDigest: string;
        sourceBindings: AiDraftBase["sourceBindings"];
        modelProvider: string;
        modelName: string;
        modelVersion: string;
        policyVersion: string;
        outputDigest: string;
        generatedAt: Date;
      };
    }
  | {
      status: "maintenance-review-authorized";
      homeId: string;
      targetRecordId: string;
      expectedTargetRevision: number;
      expectedDraftVersion: number;
      consumeConfirmationEvidenceId: string;
      prefill: {
        title: string;
        rationale: string;
        suggestedIntervalDays: number | null;
      };
      createAutomatically: false;
      scheduleAutomatically: false;
      contactProviderAutomatically: false;
      markUrgentOrCompliantAutomatically: false;
      requireManufacturerVerification: true;
    }
  | { status: "confirmation-required" }
  | { status: "stale-source" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AiExportDecision =
  | {
      status: "export-authorized";
      homeId: string;
      targetRecordId: string;
      includeConfirmedValues: true;
      includeGeneratedValuesAndProvenance: true;
      includeModelIdentity: true;
      includeHiddenPrompt: false;
      includeRawProcessorPayload: false;
      includeTemporaryCredentials: false;
    }
  | { status: "unavailable" };

export type AiCleanupDecision =
  | {
      status: "cleanup-authorized";
      scope: "DRAFT" | "RECORD" | "PROPERTY" | "ACCOUNT";
      scopeId: string;
      targets: typeof AI_CLEANUP_TARGETS;
      cancelActiveJobs: true;
      revokeProcessorAccess: true;
      requestProcessorDeletion: true;
      removeDeviceAndServerCopies: true;
      preserveConfirmedValues: boolean;
      requireRetryableCleanupLedger: true;
      blockCompleteClaimUntilProcessorAck: true;
    }
  | { status: "unavailable" };

function canonicalText(value: unknown, maximum = 512): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximum &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value)
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validRevision(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function validDigest(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function exactTrue(value: unknown) {
  return value === true;
}

function exactFalse(value: unknown) {
  return value === false;
}

function validWindow(
  issuedAt: unknown,
  expiresAt: unknown,
  now: Date,
  maximumMs: number,
) {
  return (
    validDate(issuedAt) &&
    validDate(expiresAt) &&
    issuedAt <= now &&
    now < expiresAt &&
    expiresAt > issuedAt &&
    expiresAt.getTime() - issuedAt.getTime() <= maximumMs
  );
}

function isRole(value: unknown): value is AiRole {
  return ["OWNER", "ADULT", "CHILD", "GUEST"].includes(String(value));
}

function hasWriteRole(value: AiRole) {
  return value === "OWNER" || value === "ADULT";
}

function isCapability(value: unknown): value is AiCapability {
  return CAPABILITIES.includes(value as AiCapability);
}

function isClassification(value: unknown): value is AiClassification {
  return AI_CLASSIFICATION_ALLOWLIST.includes(value as AiClassification);
}

function isRecordType(
  value: unknown,
): value is AiSourceSnapshot["recordType"] {
  return RECORD_TYPES.includes(value as AiSourceSnapshot["recordType"]);
}

function sortedSourceBindings(sources: readonly AiSourceSnapshot[]) {
  return [...sources]
    .map((source) => ({
      recordId: source.recordId,
      revision: source.revision,
      contentDigest: source.contentDigest,
    }))
    .sort((left, right) => left.recordId.localeCompare(right.recordId));
}

export function makeAiSourceSnapshotDigest(
  sources: readonly Pick<
    AiSourceSnapshot,
    "recordId" | "homeId" | "recordType" | "revision" | "contentDigest"
  >[],
) {
  const canonical = [...sources]
    .map((source) => ({
      recordId: source.recordId,
      homeId: source.homeId,
      recordType: source.recordType,
      revision: source.revision,
      contentDigest: source.contentDigest,
    }))
    .sort((left, right) => left.recordId.localeCompare(right.recordId));
  return createHash("sha256")
    .update(JSON.stringify([canonical, AI_ASSISTANCE_POLICY_VERSION]))
    .digest("hex");
}

function draftContent(draft: AiAssistanceDraft) {
  if (draft.kind === "CLASSIFICATION") {
    return { classification: draft.classification };
  }
  if (draft.kind === "SUMMARY") {
    return { summary: draft.summary };
  }
  return {
    title: draft.title,
    rationale: draft.rationale,
    suggestedIntervalDays: draft.suggestedIntervalDays,
    requiresManufacturerVerification:
      draft.requiresManufacturerVerification,
  };
}

export function makeAiDraftOutputDigest(
  draft: AiDraftWithoutDigest,
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        draft.id,
        draft.version,
        draft.jobId,
        draft.kind,
        draft.targetRecordId,
        draft.targetRevision,
        draft.sourceSnapshotDigest,
        draftContent(draft as AiAssistanceDraft),
        draft.modelProvider,
        draft.modelName,
        draft.modelVersion,
        AI_ASSISTANCE_POLICY_VERSION,
      ]),
    )
    .digest("hex");
}

export function makeAiDraftSetDigest(
  drafts: readonly AiAssistanceDraft[],
) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        drafts
          .map((draft) => [draft.id, draft.version, draft.outputDigest])
          .sort((left, right) => String(left[0]).localeCompare(String(right[0]))),
      ),
    )
    .digest("hex");
}

export function makeAiAcceptedValueDigest({
  draft,
  acceptedValue,
}: {
  draft: AiAssistanceDraft;
  acceptedValue: string;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        draft.id,
        draft.version,
        draft.outputDigest,
        acceptedValue,
        AI_ASSISTANCE_POLICY_VERSION,
      ]),
    )
    .digest("hex");
}

function validSource(source: AiSourceSnapshot, homeId: string) {
  return (
    source !== null &&
    typeof source === "object" &&
    canonicalText(source.recordId) &&
    source.homeId === homeId &&
    canonicalText(source.homeId) &&
    isRecordType(source.recordType) &&
    validRevision(source.revision) &&
    validDigest(source.contentDigest) &&
    Number.isSafeInteger(source.characterCount) &&
    source.characterCount > 0 &&
    ["USER_CONFIRMED", "CONFIRMED_OCR"].includes(source.provenance) &&
    exactTrue(source.reviewedTextOnly) &&
    exactFalse(source.containsProviderUrl) &&
    exactFalse(source.containsAuthenticationData) &&
    exactFalse(source.containsPaymentCredentials) &&
    exactFalse(source.containsUnconfirmedOcr)
  );
}

function validAuthorization(
  evidence: AiAuthorizationEvidence,
  purpose: AiPurpose,
  now: Date,
) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    canonicalText(evidence.id) &&
    evidence.purpose === purpose &&
    canonicalText(evidence.userId) &&
    canonicalText(evidence.sessionId) &&
    canonicalText(evidence.homeId) &&
    validRevision(evidence.membershipRevision) &&
    isRole(evidence.role) &&
    isCapability(evidence.capability) &&
    canonicalText(evidence.targetRecordId) &&
    validRevision(evidence.targetRevision) &&
    validDigest(evidence.sourceSnapshotDigest) &&
    exactTrue(evidence.verifiedSession) &&
    exactTrue(evidence.membershipActive) &&
    exactFalse(evidence.consumed) &&
    validWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      AI_AUTHORIZATION_TTL_MS,
    )
  );
}

function validProviderApproval(
  evidence: AiProviderApproval,
  now: Date,
) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    canonicalText(evidence.id) &&
    canonicalText(evidence.modelProvider) &&
    canonicalText(evidence.modelName) &&
    canonicalText(evidence.modelVersion) &&
    canonicalText(evidence.region) &&
    Number.isSafeInteger(evidence.retentionHours) &&
    evidence.retentionHours >= 0 &&
    evidence.retentionHours <= 24 &&
    exactTrue(evidence.privateProcessing) &&
    exactTrue(evidence.trainingDisabled) &&
    exactTrue(evidence.humanProviderReviewDisabled) &&
    exactTrue(evidence.providerLoggingDisabled) &&
    exactTrue(evidence.deletionSupported) &&
    exactTrue(evidence.toolAccessDisabled) &&
    exactTrue(evidence.browsingDisabled) &&
    exactTrue(evidence.clientApproved) &&
    exactTrue(evidence.privacyApproved) &&
    exactTrue(evidence.legalApproved) &&
    exactTrue(evidence.costApproved) &&
    exactFalse(evidence.revoked) &&
    validWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      AI_PROVIDER_APPROVAL_TTL_MS,
    )
  );
}

function exactAuthorizationBinding({
  evidence,
  purpose,
  userId,
  sessionId,
  homeId,
  membershipRevision,
  capability,
  targetRecordId,
  targetRevision,
  sourceSnapshotDigest,
  now,
}: {
  evidence: AiAuthorizationEvidence;
  purpose: AiPurpose;
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sourceSnapshotDigest: string;
  now: Date;
}) {
  return (
    validAuthorization(evidence, purpose, now) &&
    evidence.userId === userId &&
    evidence.sessionId === sessionId &&
    evidence.homeId === homeId &&
    evidence.membershipRevision === membershipRevision &&
    evidence.capability === capability &&
    evidence.targetRecordId === targetRecordId &&
    evidence.targetRevision === targetRevision &&
    evidence.sourceSnapshotDigest === sourceSnapshotDigest
  );
}

function validJob(job: AiAssistanceJob) {
  return (
    job !== null &&
    typeof job === "object" &&
    canonicalText(job.id) &&
    canonicalText(job.requestId) &&
    canonicalText(job.idempotencyKey) &&
    canonicalText(job.userId) &&
    canonicalText(job.sessionId) &&
    canonicalText(job.homeId) &&
    validRevision(job.membershipRevision) &&
    isCapability(job.capability) &&
    canonicalText(job.targetRecordId) &&
    validRevision(job.targetRevision) &&
    validDigest(job.sourceSnapshotDigest) &&
    Array.isArray(job.sourceBindings) &&
    job.sourceBindings.length > 0 &&
    job.sourceBindings.length <= AI_MAX_SOURCE_RECORDS &&
    new Set(job.sourceBindings.map((source) => source.recordId)).size ===
      job.sourceBindings.length &&
    job.sourceBindings.every(
      (source) =>
        canonicalText(source.recordId) &&
        validRevision(source.revision) &&
        validDigest(source.contentDigest),
    ) &&
    canonicalText(job.providerApprovalId) &&
    canonicalText(job.modelProvider) &&
    canonicalText(job.modelName) &&
    canonicalText(job.modelVersion) &&
    job.policyVersion === AI_ASSISTANCE_POLICY_VERSION &&
    [
      "QUEUED",
      "PROCESSING",
      "DRAFT_READY",
      "FAILED",
      "CANCELLED",
      "DELETION_PENDING",
    ].includes(job.status) &&
    validDate(job.createdAt) &&
    validDate(job.expiresAt) &&
    job.expiresAt > job.createdAt &&
    job.expiresAt.getTime() - job.createdAt.getTime() <= AI_JOB_TTL_MS
  );
}

function sourceBindingsMatch(
  expected: AiAssistanceJob["sourceBindings"],
  actual: AiDraftBase["sourceBindings"],
) {
  const left = [...expected].sort((a, b) =>
    a.recordId.localeCompare(b.recordId),
  );
  const right = [...actual].sort((a, b) =>
    a.recordId.localeCompare(b.recordId),
  );
  return (
    left.length === right.length &&
    left.every(
      (source, index) =>
        source.recordId === right[index]?.recordId &&
        source.revision === right[index]?.revision &&
        source.contentDigest === right[index]?.contentDigest,
    )
  );
}

function validDraftContent(draft: AiAssistanceDraft) {
  if (draft.kind === "CLASSIFICATION") {
    return isClassification(draft.classification);
  }
  if (draft.kind === "SUMMARY") {
    return canonicalText(draft.summary, AI_MAX_SUMMARY_LENGTH);
  }
  return (
    draft.kind === "MAINTENANCE_SUGGESTION" &&
    canonicalText(draft.title, AI_MAX_SUGGESTION_TITLE_LENGTH) &&
    canonicalText(draft.rationale, AI_MAX_SUGGESTION_RATIONALE_LENGTH) &&
    exactTrue(draft.requiresManufacturerVerification) &&
    (draft.suggestedIntervalDays === null ||
      (Number.isSafeInteger(draft.suggestedIntervalDays) &&
        Number(draft.suggestedIntervalDays) >= 1 &&
        Number(draft.suggestedIntervalDays) <= 3650))
  );
}

function validDraft(
  draft: AiAssistanceDraft,
  job: AiAssistanceJob,
  now: Date,
) {
  if (
    draft === null ||
    typeof draft !== "object" ||
    !canonicalText(draft.id) ||
    !validRevision(draft.version) ||
    draft.jobId !== job.id ||
    draft.userId !== job.userId ||
    draft.homeId !== job.homeId ||
    draft.capability !== job.capability ||
    draft.kind !== job.capability ||
    draft.targetRecordId !== job.targetRecordId ||
    draft.targetRevision !== job.targetRevision ||
    draft.sourceSnapshotDigest !== job.sourceSnapshotDigest ||
    !sourceBindingsMatch(job.sourceBindings, draft.sourceBindings) ||
    draft.modelProvider !== job.modelProvider ||
    draft.modelName !== job.modelName ||
    draft.modelVersion !== job.modelVersion ||
    draft.policyVersion !== AI_ASSISTANCE_POLICY_VERSION ||
    !validDigest(draft.outputDigest) ||
    draft.status !== "REVIEW_REQUIRED" ||
    !validWindow(draft.createdAt, draft.expiresAt, now, AI_JOB_TTL_MS) ||
    !validDraftContent(draft)
  ) {
    return false;
  }
  const { outputDigest: ignoredOutputDigest, ...withoutDigest } = draft;
  void ignoredOutputDigest;
  return (
    draft.outputDigest ===
    makeAiDraftOutputDigest(withoutDigest as AiDraftWithoutDigest)
  );
}

export function decideAiRequest({
  requestId,
  userId,
  sessionId,
  homeId,
  membershipRevision,
  capability,
  targetRecordId,
  targetRevision,
  sources,
  sourceSnapshotDigest,
  authorization,
  providerApproval,
  idempotencyKey,
  existingJob,
  now,
}: {
  requestId: string;
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sources: readonly AiSourceSnapshot[];
  sourceSnapshotDigest: string;
  authorization: AiAuthorizationEvidence;
  providerApproval: AiProviderApproval;
  idempotencyKey: string;
  existingJob?: AiAssistanceJob;
  now: Date;
}): AiRequestDecision {
  if (
    !validDate(now) ||
    !canonicalText(requestId) ||
    !canonicalText(userId) ||
    !canonicalText(sessionId) ||
    !canonicalText(homeId) ||
    !validRevision(membershipRevision) ||
    !isCapability(capability) ||
    !canonicalText(targetRecordId) ||
    !validRevision(targetRevision) ||
    !validDigest(sourceSnapshotDigest) ||
    !canonicalText(idempotencyKey) ||
    !Array.isArray(sources)
  ) {
    return { status: "unavailable" };
  }

  if (
    !exactAuthorizationBinding({
      evidence: authorization,
      purpose: "AI_REQUEST",
      userId,
      sessionId,
      homeId,
      membershipRevision,
      capability,
      targetRecordId,
      targetRevision,
      sourceSnapshotDigest,
      now,
    })
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(authorization.role)) {
    return { status: "read-only" };
  }

  if (sources.length < 1 || sources.length > AI_MAX_SOURCE_RECORDS) {
    return { status: "invalid-source", reason: "count" };
  }
  if (new Set(sources.map((source) => source.recordId)).size !== sources.length) {
    return { status: "invalid-source", reason: "content" };
  }
  if (sources.some((source) => !validSource(source, homeId))) {
    return { status: "invalid-source", reason: "content" };
  }

  const characterCount = sources.reduce(
    (total, source) => total + source.characterCount,
    0,
  );
  if (
    !Number.isSafeInteger(characterCount) ||
    characterCount > AI_MAX_SOURCE_CHARACTERS
  ) {
    return { status: "invalid-source", reason: "size" };
  }

  const recomputedDigest = makeAiSourceSnapshotDigest(sources);
  if (recomputedDigest !== sourceSnapshotDigest) {
    return { status: "invalid-source", reason: "digest" };
  }

  const target = sources.find((source) => source.recordId === targetRecordId);
  if (!target || target.revision !== targetRevision) {
    return { status: "invalid-source", reason: "target" };
  }
  if (
    (capability === "CLASSIFICATION" &&
      !["DOCUMENT", "RECEIPT"].includes(target.recordType)) ||
    (capability === "MAINTENANCE_SUGGESTION" &&
      !["ASSET", "MAINTENANCE"].includes(target.recordType))
  ) {
    return { status: "invalid-source", reason: "target" };
  }

  if (!validProviderApproval(providerApproval, now)) {
    return { status: "provider-gate", reason: "approval" };
  }
  if (!providerApproval.region.startsWith("au-")) {
    return { status: "provider-gate", reason: "region" };
  }
  if (providerApproval.retentionHours > 24) {
    return { status: "provider-gate", reason: "retention" };
  }
  if (
    !providerApproval.privateProcessing ||
    !providerApproval.trainingDisabled ||
    !providerApproval.humanProviderReviewDisabled ||
    !providerApproval.providerLoggingDisabled ||
    !providerApproval.deletionSupported ||
    !providerApproval.toolAccessDisabled ||
    !providerApproval.browsingDisabled
  ) {
    return { status: "provider-gate", reason: "privacy" };
  }

  const dedupeKey = JSON.stringify([
    userId,
    sessionId,
    homeId,
    membershipRevision,
    capability,
    targetRecordId,
    targetRevision,
    sourceSnapshotDigest,
    providerApproval.id,
    providerApproval.modelProvider,
    providerApproval.modelName,
    providerApproval.modelVersion,
    AI_ASSISTANCE_POLICY_VERSION,
  ]);

  if (existingJob !== undefined) {
    if (
      !validJob(existingJob) ||
      existingJob.userId !== userId ||
      existingJob.sessionId !== sessionId ||
      existingJob.homeId !== homeId ||
      existingJob.membershipRevision !== membershipRevision ||
      existingJob.targetRecordId !== targetRecordId ||
      existingJob.targetRevision !== targetRevision ||
      existingJob.sourceSnapshotDigest !== sourceSnapshotDigest ||
      !sourceBindingsMatch(
        existingJob.sourceBindings,
        sortedSourceBindings(sources),
      )
    ) {
      return { status: "unavailable" };
    }
    if (
      existingJob.capability === capability &&
      existingJob.providerApprovalId === providerApproval.id &&
      existingJob.modelProvider === providerApproval.modelProvider &&
      existingJob.modelName === providerApproval.modelName &&
      existingJob.modelVersion === providerApproval.modelVersion &&
      existingJob.idempotencyKey === idempotencyKey &&
      ["QUEUED", "PROCESSING", "DRAFT_READY"].includes(existingJob.status) &&
      now < existingJob.expiresAt
    ) {
      return { status: "duplicate", jobId: existingJob.id };
    }
  }

  const expiresAt = new Date(now.getTime() + AI_JOB_TTL_MS);
  if (!validDate(expiresAt)) {
    return { status: "unavailable" };
  }

  return {
    status: "queue-authorized",
    requestId,
    homeId,
    capability,
    targetRecordId,
    targetRevision,
    sourceSnapshotDigest,
    idempotencyKey,
    dedupeKey,
    expiresAt,
    treatInputAsUntrustedData: true,
    modelToolAccessAllowed: false,
    modelBrowsingAllowed: false,
    providerTrainingAllowed: false,
    humanProviderReviewAllowed: false,
    providerLoggingAllowed: false,
    rawResponsePersistenceAllowed: false,
    autoPersistAllowed: false,
  };
}

export function decideAiResult({
  job,
  currentSources,
  drafts,
  safetyEvidence,
  now,
}: {
  job: AiAssistanceJob;
  currentSources: readonly AiSourceSnapshot[];
  drafts: readonly AiAssistanceDraft[];
  safetyEvidence: AiSafetyEvidence;
  now: Date;
}): AiResultDecision {
  if (
    !validDate(now) ||
    !validJob(job) ||
    job.status !== "PROCESSING" ||
    !Array.isArray(currentSources) ||
    !Array.isArray(drafts)
  ) {
    return { status: "unavailable" };
  }
  if (now >= job.expiresAt) {
    return { status: "failed-closed", reason: "expired" };
  }
  if (
    makeAiSourceSnapshotDigest(currentSources) !== job.sourceSnapshotDigest ||
    !sourceBindingsMatch(job.sourceBindings, sortedSourceBindings(currentSources))
  ) {
    return { status: "failed-closed", reason: "stale" };
  }
  if (
    drafts.length < 1 ||
    drafts.length > AI_MAX_DRAFTS ||
    new Set(drafts.map((draft) => draft.id)).size !== drafts.length ||
    drafts.some((draft) => !validDraft(draft, job, now))
  ) {
    return { status: "failed-closed", reason: "invalid-result" };
  }

  const draftSetDigest = makeAiDraftSetDigest(drafts);
  if (
    safetyEvidence === null ||
    typeof safetyEvidence !== "object" ||
    !canonicalText(safetyEvidence.id) ||
    safetyEvidence.jobId !== job.id ||
    safetyEvidence.draftSetDigest !== draftSetDigest ||
    !canonicalText(safetyEvidence.evaluatorVersion) ||
    !exactFalse(safetyEvidence.promptInjectionDetected) ||
    !exactFalse(safetyEvidence.prohibitedFinancialOrInsuranceAdvice) ||
    !exactFalse(safetyEvidence.safetyCriticalClaim) ||
    !exactFalse(safetyEvidence.providerContactOrPaymentInstruction) ||
    !exactFalse(safetyEvidence.hiddenOrExecutableInstruction) ||
    !exactFalse(safetyEvidence.behaviouralProfiling) ||
    !validWindow(
      safetyEvidence.issuedAt,
      safetyEvidence.expiresAt,
      now,
      AI_AUTHORIZATION_TTL_MS,
    )
  ) {
    return { status: "failed-closed", reason: "unsafe" };
  }

  return {
    status: "draft-authorized",
    jobId: job.id,
    drafts: [...drafts],
    draftSetDigest,
    requireUserReview: true,
    autoPersistAllowed: false,
    automatedDecisionAllowed: false,
    modelToolAccessAllowed: false,
  };
}

export function decideAiApply({
  userId,
  sessionId,
  homeId,
  membershipRevision,
  currentTargetRevision,
  currentDraftVersion,
  currentSources,
  job,
  draft,
  authorization,
  acceptedValue,
  confirmationEvidence,
  now,
}: {
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  currentTargetRevision: number;
  currentDraftVersion: number;
  currentSources: readonly AiSourceSnapshot[];
  job: AiAssistanceJob;
  draft: AiAssistanceDraft;
  authorization: AiAuthorizationEvidence;
  acceptedValue: string;
  confirmationEvidence: AiConfirmationEvidence;
  now: Date;
}): AiApplyDecision {
  if (
    !validDate(now) ||
    !canonicalText(userId) ||
    !canonicalText(sessionId) ||
    !canonicalText(homeId) ||
    !validRevision(membershipRevision) ||
    !validRevision(currentTargetRevision) ||
    !validRevision(currentDraftVersion) ||
    !validJob(job) ||
    job.status !== "DRAFT_READY" ||
    !validDraft(draft, job, now) ||
    !canonicalText(acceptedValue, AI_MAX_SUGGESTION_RATIONALE_LENGTH)
  ) {
    return { status: "unavailable" };
  }
  if (
    !exactAuthorizationBinding({
      evidence: authorization,
      purpose: "AI_APPLY",
      userId,
      sessionId,
      homeId,
      membershipRevision,
      capability: job.capability,
      targetRecordId: job.targetRecordId,
      targetRevision: currentTargetRevision,
      sourceSnapshotDigest: job.sourceSnapshotDigest,
      now,
    })
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(authorization.role)) {
    return { status: "read-only" };
  }
  if (
    now >= job.expiresAt ||
    job.userId !== userId ||
    job.sessionId !== sessionId ||
    job.homeId !== homeId ||
    job.membershipRevision !== membershipRevision ||
    job.targetRevision !== currentTargetRevision ||
    draft.version !== currentDraftVersion ||
    makeAiSourceSnapshotDigest(currentSources) !== job.sourceSnapshotDigest ||
    !sourceBindingsMatch(job.sourceBindings, sortedSourceBindings(currentSources))
  ) {
    return { status: "stale-source" };
  }

  const acceptedValueDigest = makeAiAcceptedValueDigest({
    draft,
    acceptedValue,
  });
  if (
    confirmationEvidence === null ||
    typeof confirmationEvidence !== "object" ||
    !canonicalText(confirmationEvidence.id) ||
    confirmationEvidence.purpose !== "AI_APPLY" ||
    confirmationEvidence.userId !== userId ||
    confirmationEvidence.sessionId !== sessionId ||
    confirmationEvidence.homeId !== homeId ||
    confirmationEvidence.membershipRevision !== membershipRevision ||
    confirmationEvidence.targetRecordId !== job.targetRecordId ||
    confirmationEvidence.targetRevision !== currentTargetRevision ||
    confirmationEvidence.jobId !== job.id ||
    confirmationEvidence.draftId !== draft.id ||
    confirmationEvidence.draftVersion !== draft.version ||
    confirmationEvidence.outputDigest !== draft.outputDigest ||
    confirmationEvidence.acceptedValueDigest !== acceptedValueDigest ||
    !validDigest(confirmationEvidence.acceptedValueDigest) ||
    !exactFalse(confirmationEvidence.consumed) ||
    !validWindow(
      confirmationEvidence.issuedAt,
      confirmationEvidence.expiresAt,
      now,
      AI_AUTHORIZATION_TTL_MS,
    )
  ) {
    return { status: "confirmation-required" };
  }

  if (draft.kind === "MAINTENANCE_SUGGESTION") {
    if (acceptedValue !== draft.title) {
      return { status: "confirmation-required" };
    }
    return {
      status: "maintenance-review-authorized",
      homeId,
      targetRecordId: job.targetRecordId,
      expectedTargetRevision: currentTargetRevision,
      expectedDraftVersion: draft.version,
      consumeConfirmationEvidenceId: confirmationEvidence.id,
      prefill: {
        title: draft.title,
        rationale: draft.rationale,
        suggestedIntervalDays: draft.suggestedIntervalDays,
      },
      createAutomatically: false,
      scheduleAutomatically: false,
      contactProviderAutomatically: false,
      markUrgentOrCompliantAutomatically: false,
      requireManufacturerVerification: true,
    };
  }

  const generatedValue =
    draft.kind === "CLASSIFICATION" ? draft.classification : draft.summary;
  const validAccepted =
    draft.kind === "CLASSIFICATION"
      ? isClassification(acceptedValue)
      : canonicalText(acceptedValue, AI_MAX_SUMMARY_LENGTH);
  if (!validAccepted) {
    return { status: "confirmation-required" };
  }

  return {
    status: "metadata-apply-authorized",
    homeId,
    targetRecordId: job.targetRecordId,
    expectedTargetRevision: currentTargetRevision,
    expectedDraftVersion: draft.version,
    acceptedValue,
    generatedValue,
    userEdited: acceptedValue !== generatedValue,
    kind: draft.kind,
    consumeConfirmationEvidenceId: confirmationEvidence.id,
    requireCompareAndSet: true,
    requireAtomicWrite: true,
    provenance: {
      jobId: job.id,
      draftId: draft.id,
      draftVersion: draft.version,
      sourceSnapshotDigest: draft.sourceSnapshotDigest,
      sourceBindings: draft.sourceBindings,
      modelProvider: draft.modelProvider,
      modelName: draft.modelName,
      modelVersion: draft.modelVersion,
      policyVersion: draft.policyVersion,
      outputDigest: draft.outputDigest,
      generatedAt: draft.createdAt,
    },
  };
}

export function decideAiExport({
  userId,
  sessionId,
  homeId,
  membershipRevision,
  capability,
  targetRecordId,
  targetRevision,
  sources,
  authorization,
  now,
}: {
  userId: string;
  sessionId: string;
  homeId: string;
  membershipRevision: number;
  capability: AiCapability;
  targetRecordId: string;
  targetRevision: number;
  sources: readonly AiSourceSnapshot[];
  authorization: AiAuthorizationEvidence;
  now: Date;
}): AiExportDecision {
  const sourceSnapshotDigest = makeAiSourceSnapshotDigest(sources);
  if (
    !validDate(now) ||
    !exactAuthorizationBinding({
      evidence: authorization,
      purpose: "AI_EXPORT",
      userId,
      sessionId,
      homeId,
      membershipRevision,
      capability,
      targetRecordId,
      targetRevision,
      sourceSnapshotDigest,
      now,
    })
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "export-authorized",
    homeId,
    targetRecordId,
    includeConfirmedValues: true,
    includeGeneratedValuesAndProvenance: true,
    includeModelIdentity: true,
    includeHiddenPrompt: false,
    includeRawProcessorPayload: false,
    includeTemporaryCredentials: false,
  };
}

export function decideAiCleanup({
  event,
  scope,
  scopeId,
  preserveConfirmedValues,
}: {
  event:
    | "DRAFT_DELETED"
    | "RECORD_DELETED"
    | "PROPERTY_DELETED"
    | "ACCOUNT_DELETED"
    | "MEMBERSHIP_REVOKED"
    | "DEVICE_LOST";
  scope: "DRAFT" | "RECORD" | "PROPERTY" | "ACCOUNT";
  scopeId: string;
  preserveConfirmedValues: boolean;
}): AiCleanupDecision {
  const expectedScope = {
    DRAFT_DELETED: "DRAFT",
    RECORD_DELETED: "RECORD",
    PROPERTY_DELETED: "PROPERTY",
    ACCOUNT_DELETED: "ACCOUNT",
    MEMBERSHIP_REVOKED: "PROPERTY",
    DEVICE_LOST: "ACCOUNT",
  } as const;
  if (
    !canonicalText(event) ||
    !Object.prototype.hasOwnProperty.call(expectedScope, event) ||
    expectedScope[event] !== scope ||
    !canonicalText(scopeId) ||
    typeof preserveConfirmedValues !== "boolean" ||
    (scope !== "DRAFT" && preserveConfirmedValues)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-authorized",
    scope,
    scopeId,
    targets: AI_CLEANUP_TARGETS,
    cancelActiveJobs: true,
    revokeProcessorAccess: true,
    requestProcessorDeletion: true,
    removeDeviceAndServerCopies: true,
    preserveConfirmedValues,
    requireRetryableCleanupLedger: true,
    blockCompleteClaimUntilProcessorAck: true,
  };
}
