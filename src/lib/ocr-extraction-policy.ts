import { createHash } from "node:crypto";

export const OCR_POLICY_VERSION = "homevault-ocr-v2";
export const OCR_MAX_PAGES = 20;
export const OCR_MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export const OCR_MAX_FIELD_VALUE_LENGTH = 500;
export const OCR_MAX_EXTRACTED_FIELDS = 32;
export const OCR_JOB_TTL_MS = 60 * 60 * 1000;
export const OCR_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
export const OCR_AUTHORIZATION_TTL_MS = 10 * 60 * 1000;
export const OCR_PROVIDER_APPROVAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const OCR_LOW_CONFIDENCE_THRESHOLD = 0.85;

export const OCR_SUPPORTED_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const OCR_FIELD_ALLOWLIST = {
  RECEIPT: [
    "merchantName",
    "purchaseDate",
    "totalAmount",
    "reference",
  ],
  WARRANTY: [
    "providerName",
    "startDate",
    "expiryDate",
    "policyReference",
  ],
  MANUAL: ["title", "manufacturer", "modelNumber"],
  GENERAL: ["title", "documentDate", "reference"],
} as const;

export const OCR_CLEANUP_TARGETS = [
  "ACTIVE_JOBS",
  "TEMPORARY_PROCESSOR_ACCESS",
  "RAW_PROCESSOR_REQUESTS",
  "RAW_PROCESSOR_RESPONSES",
  "UNCONFIRMED_DRAFTS",
  "FIELD_PROVENANCE",
  "PROCESSOR_COPIES",
  "SERVER_CACHES",
  "DEVICE_OFFLINE_COPIES",
  "QUEUED_ACTIONS",
  "RELATIONAL_METADATA",
  "REDACTED_AUDIT_REFERENCES",
] as const;

export type OcrRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type OcrDocumentKind = keyof typeof OCR_FIELD_ALLOWLIST;
export type OcrMediaType = (typeof OCR_SUPPORTED_MEDIA_TYPES)[number];
export type OcrFieldName =
  (typeof OCR_FIELD_ALLOWLIST)[OcrDocumentKind][number];
export type OcrPurpose = "OCR_REQUEST" | "OCR_APPLY" | "OCR_EXPORT";

export type OcrAttachment = {
  id: string;
  revision: number;
  homeId: string;
  documentId: string;
  documentRevision: number;
  mediaType: OcrMediaType;
  digest: string;
  sizeBytes: number;
  pageCount: number;
  status: "QUARANTINED" | "AVAILABLE" | "REJECTED" | "DELETION_PENDING";
  storageClass: "PRIVATE";
  malwareDecision: "CLEAN" | "MALICIOUS" | "ERROR" | "UNAVAILABLE";
  malwareScanRevision: number;
};

export type OcrAuthorizationEvidence = {
  id: string;
  purpose: OcrPurpose;
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  attachmentId: string;
  attachmentRevision: number;
  sourceDigest: string;
  role: OcrRole;
  membershipActive: true;
  verifiedSession: true;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type OcrProviderApproval = {
  id: string;
  processor: string;
  processorVersion: string;
  region: string;
  retentionHours: number;
  privateProcessing: true;
  noTraining: true;
  noProviderLogging: true;
  deletionSupported: true;
  clientApproved: true;
  privacyApproved: true;
  legalApproved: true;
  costApproved: true;
  issuedAt: Date;
  expiresAt: Date;
  revoked: false;
};

export type OcrJob = {
  id: string;
  requestId: string;
  idempotencyKey: string;
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  attachmentId: string;
  attachmentRevision: number;
  attachmentDigest: string;
  documentKind: OcrDocumentKind;
  processorApprovalId: string;
  processor: string;
  processorVersion: string;
  processorRegion: string;
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

export type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OcrExtractedField = {
  id: string;
  field: OcrFieldName;
  rawValue: string;
  normalizedValue: string;
  confidence: number;
  page: number;
  boundingBox: OcrBoundingBox;
  sourceAttachmentId: string;
  sourceAttachmentRevision: number;
  sourceDigest: string;
  processor: string;
  processorVersion: string;
  language: string;
  extractedAt: Date;
};

export type OcrDraft = {
  id: string;
  version: number;
  jobId: string;
  userId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  attachmentId: string;
  attachmentRevision: number;
  attachmentDigest: string;
  processor: string;
  processorVersion: string;
  policyVersion: string;
  status: "REVIEW_REQUIRED";
  fields: readonly OcrExtractedField[];
  createdAt: Date;
  expiresAt: Date;
};

export type OcrFieldConfirmation = {
  extractedFieldId: string;
  acceptedValue: string;
  userEdited: boolean;
};

export type OcrConfirmationEvidence = {
  id: string;
  purpose: "OCR_APPLY";
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  jobId: string;
  draftId: string;
  draftVersion: number;
  selectionDigest: string;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type OcrRequestDecision =
  | {
      status: "queue-authorized";
      requestId: string;
      homeId: string;
      documentId: string;
      documentRevision: number;
      attachmentId: string;
      attachmentRevision: number;
      idempotencyKey: string;
      dedupeKey: string;
      expiresAt: Date;
      temporaryProcessorAccess: true;
      exposeBlobUrl: false;
      providerTrainingAllowed: false;
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
      reason: "type" | "size" | "pages" | "scan";
    }
  | { status: "unavailable" };

export type OcrResultDecision =
  | {
      status: "draft-authorized";
      draft: OcrDraft;
      lowConfidenceFieldIds: string[];
      requireEverySelectedFieldConfirmation: true;
      autoPersistAllowed: false;
      automatedDecisionAllowed: false;
    }
  | {
      status: "failed-closed";
      reason: "expired" | "stale" | "invalid-result";
    }
  | { status: "unavailable" };

export type OcrApplyDecision =
  | {
      status: "apply-authorized";
      homeId: string;
      documentId: string;
      expectedDocumentRevision: number;
      expectedDraftVersion: number;
      consumeConfirmationEvidenceId: string;
      values: Array<{
        field: OcrFieldName;
        acceptedValue: string;
        rawValue: string;
        normalizedValue: string;
        confidence: number;
        userEdited: boolean;
        provenance: {
          draftId: string;
          draftVersion: number;
          jobId: string;
          extractedFieldId: string;
          attachmentId: string;
          attachmentRevision: number;
          sourceDigest: string;
          page: number;
          boundingBox: OcrBoundingBox;
          processor: string;
          processorVersion: string;
          language: string;
          extractedAt: Date;
        };
      }>;
      requireCompareAndSet: true;
      requireAtomicWrite: true;
      preserveImmutableProvenance: true;
      triggerAutomationAllowed: false;
    }
  | { status: "confirmation-required" }
  | { status: "stale-source" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type OcrExportDecision =
  | {
      status: "export-authorized";
      homeId: string;
      documentId: string;
      includeAcceptedValues: true;
      includeFieldConfidenceAndProvenance: true;
      includeProcessorNameAndVersion: true;
      includeRawProcessorPayload: false;
      includeTemporaryCredentials: false;
      includeBlobUrls: false;
    }
  | { status: "unavailable" };

export type OcrCleanupDecision =
  | {
      status: "cleanup-authorized";
      scope: "ATTACHMENT" | "DOCUMENT" | "PROPERTY" | "ACCOUNT";
      scopeId: string;
      targets: typeof OCR_CLEANUP_TARGETS;
      cancelActiveJobs: true;
      revokeTemporaryProcessorAccess: true;
      requestProcessorDeletion: true;
      removeDeviceAndServerCopies: true;
      preserveConfirmedValues: boolean;
      requireRetryableCleanupLedger: true;
      blockCompleteClaimUntilProcessorAck: true;
    }
  | { status: "unavailable" };

function canonicalText(value: unknown, maximum = 200): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximum &&
    value === value.trim() &&
    !value.includes("\0") &&
    !value.includes("\r") &&
    !value.includes("\n")
  );
}

function validValue(value: unknown) {
  return canonicalText(value, OCR_MAX_FIELD_VALUE_LENGTH);
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validPositiveRevision(value: unknown) {
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

function validRole(value: unknown): value is OcrRole {
  return ["OWNER", "ADULT", "CHILD", "GUEST"].includes(String(value));
}

function hasWriteRole(role: OcrRole) {
  return role === "OWNER" || role === "ADULT";
}

function isSupportedMediaType(value: unknown): value is OcrMediaType {
  return (
    typeof value === "string" &&
    OCR_SUPPORTED_MEDIA_TYPES.includes(value as OcrMediaType)
  );
}

function isDocumentKind(value: unknown): value is OcrDocumentKind {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(OCR_FIELD_ALLOWLIST, value)
  );
}

function fieldAllowed(kind: OcrDocumentKind, field: unknown) {
  return (
    typeof field === "string" &&
    (OCR_FIELD_ALLOWLIST[kind] as readonly string[]).includes(field)
  );
}

function validWindow(
  issuedAt: unknown,
  expiresAt: unknown,
  now: Date,
  maximum: number,
) {
  return (
    validDate(issuedAt) &&
    validDate(expiresAt) &&
    issuedAt <= now &&
    now < expiresAt &&
    expiresAt > issuedAt &&
    expiresAt.getTime() - issuedAt.getTime() <= maximum
  );
}

function validBoundingBox(box: unknown): box is OcrBoundingBox {
  if (!box || typeof box !== "object") {
    return false;
  }
  const candidate = box as OcrBoundingBox;
  const values = [
    candidate.x,
    candidate.y,
    candidate.width,
    candidate.height,
  ];
  return (
    values.every(
      (value) => Number.isFinite(value) && value >= 0 && value <= 1,
    ) &&
    candidate.width > 0 &&
    candidate.height > 0 &&
    candidate.x + candidate.width <= 1 &&
    candidate.y + candidate.height <= 1
  );
}

function validAttachment(value: OcrAttachment) {
  return (
    value !== null &&
    typeof value === "object" &&
    canonicalText(value.id) &&
    validPositiveRevision(value.revision) &&
    canonicalText(value.homeId) &&
    canonicalText(value.documentId) &&
    validPositiveRevision(value.documentRevision) &&
    isSupportedMediaType(value.mediaType) &&
    validDigest(value.digest) &&
    Number.isSafeInteger(value.sizeBytes) &&
    value.sizeBytes > 0 &&
    value.sizeBytes <= OCR_MAX_ATTACHMENT_BYTES &&
    Number.isSafeInteger(value.pageCount) &&
    value.pageCount >= 1 &&
    value.pageCount <= OCR_MAX_PAGES &&
    value.status === "AVAILABLE" &&
    value.storageClass === "PRIVATE" &&
    value.malwareDecision === "CLEAN" &&
    value.malwareScanRevision === value.revision
  );
}

function validAuthorization(
  evidence: OcrAuthorizationEvidence,
  purpose: OcrPurpose,
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
    canonicalText(evidence.documentId) &&
    validPositiveRevision(evidence.documentRevision) &&
    canonicalText(evidence.attachmentId) &&
    validPositiveRevision(evidence.attachmentRevision) &&
    validDigest(evidence.sourceDigest) &&
    validRole(evidence.role) &&
    exactTrue(evidence.membershipActive) &&
    exactTrue(evidence.verifiedSession) &&
    exactFalse(evidence.consumed) &&
    validWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      OCR_AUTHORIZATION_TTL_MS,
    )
  );
}

function validProviderApproval(
  evidence: OcrProviderApproval,
  now: Date,
) {
  return (
    evidence !== null &&
    typeof evidence === "object" &&
    canonicalText(evidence.id) &&
    canonicalText(evidence.processor) &&
    canonicalText(evidence.processorVersion) &&
    canonicalText(evidence.region) &&
    Number.isSafeInteger(evidence.retentionHours) &&
    evidence.retentionHours >= 0 &&
    evidence.retentionHours <= 24 &&
    exactTrue(evidence.privateProcessing) &&
    exactTrue(evidence.noTraining) &&
    exactTrue(evidence.noProviderLogging) &&
    exactTrue(evidence.deletionSupported) &&
    exactTrue(evidence.clientApproved) &&
    exactTrue(evidence.privacyApproved) &&
    exactTrue(evidence.legalApproved) &&
    exactTrue(evidence.costApproved) &&
    exactFalse(evidence.revoked) &&
    validWindow(
      evidence.issuedAt,
      evidence.expiresAt,
      now,
      OCR_PROVIDER_APPROVAL_TTL_MS,
    )
  );
}

function exactAuthorizationBinding({
  authorization,
  userId,
  sessionId,
  homeId,
  documentId,
  documentRevision,
  attachment,
}: {
  authorization: OcrAuthorizationEvidence;
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  attachment: OcrAttachment;
}) {
  return (
    authorization.userId === userId &&
    authorization.sessionId === sessionId &&
    authorization.homeId === homeId &&
    authorization.documentId === documentId &&
    authorization.documentRevision === documentRevision &&
    authorization.attachmentId === attachment.id &&
    authorization.attachmentRevision === attachment.revision &&
    authorization.sourceDigest === attachment.digest
  );
}

function validJob(job: OcrJob) {
  return (
    job !== null &&
    typeof job === "object" &&
    canonicalText(job.id) &&
    canonicalText(job.requestId) &&
    canonicalText(job.idempotencyKey) &&
    canonicalText(job.userId) &&
    canonicalText(job.sessionId) &&
    canonicalText(job.homeId) &&
    canonicalText(job.documentId) &&
    validPositiveRevision(job.documentRevision) &&
    canonicalText(job.attachmentId) &&
    validPositiveRevision(job.attachmentRevision) &&
    validDigest(job.attachmentDigest) &&
    isDocumentKind(job.documentKind) &&
    canonicalText(job.processorApprovalId) &&
    canonicalText(job.processor) &&
    canonicalText(job.processorVersion) &&
    canonicalText(job.processorRegion) &&
    job.policyVersion === OCR_POLICY_VERSION &&
    validDate(job.createdAt) &&
    validDate(job.expiresAt) &&
    job.expiresAt > job.createdAt &&
    job.expiresAt.getTime() - job.createdAt.getTime() <= OCR_JOB_TTL_MS &&
    [
      "QUEUED",
      "PROCESSING",
      "DRAFT_READY",
      "FAILED",
      "CANCELLED",
      "DELETION_PENDING",
    ].includes(job.status)
  );
}

function exactJobSource(job: OcrJob, attachment: OcrAttachment) {
  return (
    job.homeId === attachment.homeId &&
    job.documentId === attachment.documentId &&
    job.documentRevision === attachment.documentRevision &&
    job.attachmentId === attachment.id &&
    job.attachmentRevision === attachment.revision &&
    job.attachmentDigest === attachment.digest
  );
}

function validOcrField({
  field,
  job,
  attachment,
  now,
}: {
  field: OcrExtractedField;
  job: OcrJob;
  attachment: OcrAttachment;
  now: Date;
}) {
  return (
    field !== null &&
    typeof field === "object" &&
    canonicalText(field.id) &&
    fieldAllowed(job.documentKind, field.field) &&
    validValue(field.rawValue) &&
    validValue(field.normalizedValue) &&
    Number.isFinite(field.confidence) &&
    field.confidence >= 0 &&
    field.confidence <= 1 &&
    Number.isSafeInteger(field.page) &&
    field.page >= 1 &&
    field.page <= attachment.pageCount &&
    validBoundingBox(field.boundingBox) &&
    field.sourceAttachmentId === attachment.id &&
    field.sourceAttachmentRevision === attachment.revision &&
    field.sourceDigest === attachment.digest &&
    field.processor === job.processor &&
    field.processorVersion === job.processorVersion &&
    canonicalText(field.language, 35) &&
    validDate(field.extractedAt) &&
    field.extractedAt >= job.createdAt &&
    field.extractedAt <= now
  );
}

function makeDedupeKey(
  userId: string,
  documentKind: OcrDocumentKind,
  attachment: OcrAttachment,
  approval: OcrProviderApproval,
) {
  return JSON.stringify([
    userId,
    attachment.homeId,
    attachment.documentId,
    attachment.documentRevision,
    attachment.id,
    attachment.revision,
    attachment.digest,
    documentKind,
    approval.id,
    approval.processor,
    approval.processorVersion,
    OCR_POLICY_VERSION,
  ]);
}

export function makeOcrSelectionDigest(
  draft: Pick<OcrDraft, "id" | "version" | "jobId">,
  confirmations: readonly OcrFieldConfirmation[],
) {
  const canonical = [...confirmations]
    .map((confirmation) => ({
      extractedFieldId: confirmation.extractedFieldId,
      acceptedValue: confirmation.acceptedValue,
      userEdited: confirmation.userEdited,
    }))
    .sort((left, right) =>
      left.extractedFieldId.localeCompare(right.extractedFieldId),
    );
  return createHash("sha256")
    .update(
      JSON.stringify([
        draft.id,
        draft.version,
        draft.jobId,
        canonical,
        OCR_POLICY_VERSION,
      ]),
    )
    .digest("hex");
}

export function decideOcrRequest({
  requestId,
  userId,
  sessionId,
  homeId,
  documentId,
  documentRevision,
  documentKind,
  attachment,
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
  documentId: string;
  documentRevision: number;
  documentKind: OcrDocumentKind;
  attachment: OcrAttachment;
  authorization: OcrAuthorizationEvidence;
  providerApproval: OcrProviderApproval;
  idempotencyKey: string;
  existingJob?: OcrJob;
  now: Date;
}): OcrRequestDecision {
  if (
    !validDate(now) ||
    !canonicalText(requestId) ||
    !canonicalText(userId) ||
    !canonicalText(sessionId) ||
    !canonicalText(homeId) ||
    !canonicalText(documentId) ||
    !validPositiveRevision(documentRevision) ||
    !isDocumentKind(documentKind) ||
    !canonicalText(idempotencyKey) ||
    !validAttachment(attachment) ||
    !validAuthorization(authorization, "OCR_REQUEST", now) ||
    !exactAuthorizationBinding({
      authorization,
      userId,
      sessionId,
      homeId,
      documentId,
      documentRevision,
      attachment,
    }) ||
    attachment.homeId !== homeId ||
    attachment.documentId !== documentId ||
    attachment.documentRevision !== documentRevision
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(authorization.role)) {
    return { status: "read-only" };
  }

  if (!isSupportedMediaType(attachment.mediaType)) {
    return { status: "invalid-source", reason: "type" };
  }
  if (attachment.sizeBytes > OCR_MAX_ATTACHMENT_BYTES) {
    return { status: "invalid-source", reason: "size" };
  }
  if (attachment.pageCount > OCR_MAX_PAGES) {
    return { status: "invalid-source", reason: "pages" };
  }
  if (
    attachment.status !== "AVAILABLE" ||
    attachment.malwareDecision !== "CLEAN" ||
    attachment.malwareScanRevision !== attachment.revision
  ) {
    return { status: "invalid-source", reason: "scan" };
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
    !providerApproval.noTraining ||
    !providerApproval.noProviderLogging ||
    !providerApproval.deletionSupported
  ) {
    return { status: "provider-gate", reason: "privacy" };
  }

  const dedupeKey = makeDedupeKey(
    userId,
    documentKind,
    attachment,
    providerApproval,
  );

  if (existingJob !== undefined) {
    if (!validJob(existingJob) || !exactJobSource(existingJob, attachment)) {
      return { status: "unavailable" };
    }
    if (
      existingJob.userId === userId &&
      existingJob.sessionId === sessionId &&
      existingJob.documentKind === documentKind &&
      existingJob.processorApprovalId === providerApproval.id &&
      existingJob.processor === providerApproval.processor &&
      existingJob.processorVersion === providerApproval.processorVersion &&
      existingJob.idempotencyKey === idempotencyKey &&
      ["QUEUED", "PROCESSING", "DRAFT_READY"].includes(existingJob.status) &&
      now < existingJob.expiresAt
    ) {
      return { status: "duplicate", jobId: existingJob.id };
    }
  }

  const expiresAt = new Date(now.getTime() + OCR_JOB_TTL_MS);
  if (!validDate(expiresAt)) {
    return { status: "unavailable" };
  }

  return {
    status: "queue-authorized",
    requestId,
    homeId,
    documentId,
    documentRevision,
    attachmentId: attachment.id,
    attachmentRevision: attachment.revision,
    idempotencyKey,
    dedupeKey,
    expiresAt,
    temporaryProcessorAccess: true,
    exposeBlobUrl: false,
    providerTrainingAllowed: false,
    providerLoggingAllowed: false,
    rawResponsePersistenceAllowed: false,
    autoPersistAllowed: false,
  };
}

export function decideOcrResult({
  draftId,
  draftVersion,
  job,
  attachment,
  fields,
  now,
}: {
  draftId: string;
  draftVersion: number;
  job: OcrJob;
  attachment: OcrAttachment;
  fields: readonly OcrExtractedField[];
  now: Date;
}): OcrResultDecision {
  if (
    !validDate(now) ||
    !canonicalText(draftId) ||
    !validPositiveRevision(draftVersion) ||
    !validJob(job) ||
    job.status !== "PROCESSING"
  ) {
    return { status: "unavailable" };
  }
  if (now >= job.expiresAt) {
    return { status: "failed-closed", reason: "expired" };
  }
  if (!validAttachment(attachment) || !exactJobSource(job, attachment)) {
    return { status: "failed-closed", reason: "stale" };
  }

  const ids = new Set<string>();
  const fieldNames = new Set<OcrFieldName>();
  const valid =
    Array.isArray(fields) &&
    fields.length > 0 &&
    fields.length <= OCR_MAX_EXTRACTED_FIELDS &&
    fields.every((field) => {
      if (
        ids.has(field.id) ||
        fieldNames.has(field.field) ||
        !validOcrField({ field, job, attachment, now })
      ) {
        return false;
      }
      ids.add(field.id);
      fieldNames.add(field.field);
      return true;
    });

  if (!valid) {
    return { status: "failed-closed", reason: "invalid-result" };
  }

  const expiresAt = new Date(
    Math.min(job.expiresAt.getTime(), now.getTime() + OCR_DRAFT_TTL_MS),
  );
  const draft: OcrDraft = {
    id: draftId,
    version: draftVersion,
    jobId: job.id,
    userId: job.userId,
    homeId: job.homeId,
    documentId: job.documentId,
    documentRevision: job.documentRevision,
    attachmentId: attachment.id,
    attachmentRevision: attachment.revision,
    attachmentDigest: attachment.digest,
    processor: job.processor,
    processorVersion: job.processorVersion,
    policyVersion: OCR_POLICY_VERSION,
    status: "REVIEW_REQUIRED",
    fields: [...fields],
    createdAt: now,
    expiresAt,
  };

  return {
    status: "draft-authorized",
    draft,
    lowConfidenceFieldIds: fields
      .filter((field) => field.confidence < OCR_LOW_CONFIDENCE_THRESHOLD)
      .map((field) => field.id),
    requireEverySelectedFieldConfirmation: true,
    autoPersistAllowed: false,
    automatedDecisionAllowed: false,
  };
}

function validDraft(draft: OcrDraft, now: Date) {
  return (
    draft !== null &&
    typeof draft === "object" &&
    canonicalText(draft.id) &&
    validPositiveRevision(draft.version) &&
    canonicalText(draft.jobId) &&
    canonicalText(draft.userId) &&
    canonicalText(draft.homeId) &&
    canonicalText(draft.documentId) &&
    validPositiveRevision(draft.documentRevision) &&
    canonicalText(draft.attachmentId) &&
    validPositiveRevision(draft.attachmentRevision) &&
    validDigest(draft.attachmentDigest) &&
    canonicalText(draft.processor) &&
    canonicalText(draft.processorVersion) &&
    draft.policyVersion === OCR_POLICY_VERSION &&
    draft.status === "REVIEW_REQUIRED" &&
    validDate(draft.createdAt) &&
    validDate(draft.expiresAt) &&
    draft.createdAt <= now &&
    now < draft.expiresAt &&
    draft.expiresAt > draft.createdAt &&
    draft.expiresAt.getTime() - draft.createdAt.getTime() <= OCR_DRAFT_TTL_MS &&
    Array.isArray(draft.fields) &&
    draft.fields.length > 0 &&
    draft.fields.length <= OCR_MAX_EXTRACTED_FIELDS
  );
}

export function decideOcrApply({
  userId,
  sessionId,
  homeId,
  documentId,
  currentDocumentRevision,
  currentDraftVersion,
  attachment,
  job,
  draft,
  authorization,
  confirmations,
  confirmationEvidence,
  now,
}: {
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  currentDocumentRevision: number;
  currentDraftVersion: number;
  attachment: OcrAttachment;
  job: OcrJob;
  draft: OcrDraft;
  authorization: OcrAuthorizationEvidence;
  confirmations: readonly OcrFieldConfirmation[];
  confirmationEvidence: OcrConfirmationEvidence;
  now: Date;
}): OcrApplyDecision {
  if (
    !validDate(now) ||
    !canonicalText(userId) ||
    !canonicalText(sessionId) ||
    !canonicalText(homeId) ||
    !canonicalText(documentId) ||
    !validPositiveRevision(currentDocumentRevision) ||
    !validPositiveRevision(currentDraftVersion) ||
    !validAttachment(attachment) ||
    !validJob(job) ||
    job.status !== "DRAFT_READY" ||
    !validDraft(draft, now) ||
    !validAuthorization(authorization, "OCR_APPLY", now) ||
    !exactAuthorizationBinding({
      authorization,
      userId,
      sessionId,
      homeId,
      documentId,
      documentRevision: currentDocumentRevision,
      attachment,
    })
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(authorization.role)) {
    return { status: "read-only" };
  }

  if (
    !exactJobSource(job, attachment) ||
    now >= job.expiresAt ||
    draft.jobId !== job.id ||
    draft.userId !== userId ||
    draft.homeId !== homeId ||
    draft.documentId !== documentId ||
    draft.documentRevision !== currentDocumentRevision ||
    draft.version !== currentDraftVersion ||
    draft.attachmentId !== attachment.id ||
    draft.attachmentRevision !== attachment.revision ||
    draft.attachmentDigest !== attachment.digest ||
    draft.processor !== job.processor ||
    draft.processorVersion !== job.processorVersion
  ) {
    return { status: "stale-source" };
  }

  if (
    !Array.isArray(confirmations) ||
    confirmations.length < 1 ||
    confirmations.length > draft.fields.length
  ) {
    return { status: "confirmation-required" };
  }

  const expectedSelectionDigest = makeOcrSelectionDigest(draft, confirmations);
  if (
    confirmationEvidence === null ||
    typeof confirmationEvidence !== "object" ||
    !canonicalText(confirmationEvidence.id) ||
    confirmationEvidence.purpose !== "OCR_APPLY" ||
    confirmationEvidence.userId !== userId ||
    confirmationEvidence.sessionId !== sessionId ||
    confirmationEvidence.homeId !== homeId ||
    confirmationEvidence.documentId !== documentId ||
    confirmationEvidence.documentRevision !== currentDocumentRevision ||
    confirmationEvidence.jobId !== job.id ||
    confirmationEvidence.draftId !== draft.id ||
    confirmationEvidence.draftVersion !== draft.version ||
    confirmationEvidence.selectionDigest !== expectedSelectionDigest ||
    !validDigest(confirmationEvidence.selectionDigest) ||
    !exactFalse(confirmationEvidence.consumed) ||
    !validWindow(
      confirmationEvidence.issuedAt,
      confirmationEvidence.expiresAt,
      now,
      OCR_AUTHORIZATION_TTL_MS,
    )
  ) {
    return { status: "confirmation-required" };
  }

  const fieldById = new Map(draft.fields.map((field) => [field.id, field]));
  const selectedIds = new Set<string>();
  const selectedNames = new Set<OcrFieldName>();
  const values: Extract<
    OcrApplyDecision,
    { status: "apply-authorized" }
  >["values"] = [];

  for (const confirmation of confirmations) {
    const field = fieldById.get(confirmation.extractedFieldId);
    if (
      !field ||
      selectedIds.has(confirmation.extractedFieldId) ||
      selectedNames.has(field.field) ||
      !validValue(confirmation.acceptedValue) ||
      typeof confirmation.userEdited !== "boolean" ||
      confirmation.userEdited !==
        (confirmation.acceptedValue !== field.normalizedValue) ||
      !validOcrField({ field, job, attachment, now })
    ) {
      return { status: "confirmation-required" };
    }

    selectedIds.add(confirmation.extractedFieldId);
    selectedNames.add(field.field);
    values.push({
      field: field.field,
      acceptedValue: confirmation.acceptedValue,
      rawValue: field.rawValue,
      normalizedValue: field.normalizedValue,
      confidence: field.confidence,
      userEdited: confirmation.userEdited,
      provenance: {
        draftId: draft.id,
        draftVersion: draft.version,
        jobId: job.id,
        extractedFieldId: field.id,
        attachmentId: attachment.id,
        attachmentRevision: attachment.revision,
        sourceDigest: attachment.digest,
        page: field.page,
        boundingBox: field.boundingBox,
        processor: field.processor,
        processorVersion: field.processorVersion,
        language: field.language,
        extractedAt: field.extractedAt,
      },
    });
  }

  return {
    status: "apply-authorized",
    homeId,
    documentId,
    expectedDocumentRevision: currentDocumentRevision,
    expectedDraftVersion: draft.version,
    consumeConfirmationEvidenceId: confirmationEvidence.id,
    values,
    requireCompareAndSet: true,
    requireAtomicWrite: true,
    preserveImmutableProvenance: true,
    triggerAutomationAllowed: false,
  };
}

export function decideOcrExport({
  userId,
  sessionId,
  homeId,
  documentId,
  documentRevision,
  attachment,
  authorization,
  now,
}: {
  userId: string;
  sessionId: string;
  homeId: string;
  documentId: string;
  documentRevision: number;
  attachment: OcrAttachment;
  authorization: OcrAuthorizationEvidence;
  now: Date;
}): OcrExportDecision {
  if (
    !validDate(now) ||
    !validAttachment(attachment) ||
    !validAuthorization(authorization, "OCR_EXPORT", now) ||
    !exactAuthorizationBinding({
      authorization,
      userId,
      sessionId,
      homeId,
      documentId,
      documentRevision,
      attachment,
    })
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "export-authorized",
    homeId,
    documentId,
    includeAcceptedValues: true,
    includeFieldConfidenceAndProvenance: true,
    includeProcessorNameAndVersion: true,
    includeRawProcessorPayload: false,
    includeTemporaryCredentials: false,
    includeBlobUrls: false,
  };
}

export function decideOcrCleanup({
  event,
  scope,
  scopeId,
  preserveConfirmedValues,
}: {
  event:
    | "ATTACHMENT_DELETED"
    | "DOCUMENT_DELETED"
    | "PROPERTY_DELETED"
    | "ACCOUNT_DELETED"
    | "MEMBERSHIP_REVOKED"
    | "DEVICE_LOST";
  scope: "ATTACHMENT" | "DOCUMENT" | "PROPERTY" | "ACCOUNT";
  scopeId: string;
  preserveConfirmedValues: boolean;
}): OcrCleanupDecision {
  const expectedScope = {
    ATTACHMENT_DELETED: "ATTACHMENT",
    DOCUMENT_DELETED: "DOCUMENT",
    PROPERTY_DELETED: "PROPERTY",
    ACCOUNT_DELETED: "ACCOUNT",
    MEMBERSHIP_REVOKED: "PROPERTY",
    DEVICE_LOST: "ACCOUNT",
  } as const;

  if (
    !canonicalText(event) ||
    !Object.prototype.hasOwnProperty.call(expectedScope, event) ||
    !canonicalText(scopeId) ||
    expectedScope[event] !== scope ||
    typeof preserveConfirmedValues !== "boolean" ||
    (scope !== "ATTACHMENT" && preserveConfirmedValues)
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "cleanup-authorized",
    scope,
    scopeId,
    targets: OCR_CLEANUP_TARGETS,
    cancelActiveJobs: true,
    revokeTemporaryProcessorAccess: true,
    requestProcessorDeletion: true,
    removeDeviceAndServerCopies: true,
    preserveConfirmedValues,
    requireRetryableCleanupLedger: true,
    blockCompleteClaimUntilProcessorAck: true,
  };
}
