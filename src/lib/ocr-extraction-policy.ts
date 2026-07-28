export const OCR_POLICY_VERSION = "homevault-ocr-v1";
export const OCR_MAX_PAGES = 20;
export const OCR_MAX_FIELD_VALUE_LENGTH = 500;
export const OCR_MAX_EXTRACTED_FIELDS = 32;
export const OCR_PROCESSING_TTL_MS = 24 * 60 * 60 * 1000;
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

export type OcrRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type OcrDocumentKind = keyof typeof OCR_FIELD_ALLOWLIST;
export type OcrMediaType = (typeof OCR_SUPPORTED_MEDIA_TYPES)[number];
export type OcrFieldName =
  (typeof OCR_FIELD_ALLOWLIST)[OcrDocumentKind][number];

export type OcrAttachment = {
  id: string;
  homeId: string;
  documentId: string;
  mediaType: OcrMediaType;
  digest: string;
  pageCount: number;
  status: "QUARANTINED" | "AVAILABLE" | "REJECTED" | "DELETION_PENDING";
  privateOnly: boolean;
  malwareDecision: "CLEAN" | "MALICIOUS" | "ERROR" | "UNAVAILABLE";
};

export type OcrJob = {
  id: string;
  userId: string;
  homeId: string;
  documentId: string;
  attachmentId: string;
  attachmentDigest: string;
  documentKind: OcrDocumentKind;
  processor: string;
  processorVersion: string;
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

export type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OcrExtractedField = {
  id: string;
  field: OcrFieldName;
  extractedValue: string;
  confidence: number;
  page: number;
  boundingBox?: OcrBoundingBox;
  sourceDigest: string;
  processor: string;
  processorVersion: string;
  extractedAt: Date;
};

export type OcrRequestDecision =
  | {
      status: "queue-authorized";
      homeId: string;
      documentId: string;
      attachmentId: string;
      idempotencyKey: string;
      dedupeKey: string;
      expiresAt: Date;
      temporaryProcessorAccess: true;
      exposeProviderUrl: false;
      providerTrainingAllowed: false;
      autoPersistAllowed: false;
    }
  | { status: "duplicate"; jobId: string }
  | { status: "read-only" }
  | {
      status: "provider-gate";
      reason: "provider" | "region" | "retention";
    }
  | { status: "invalid-source"; reason: "type" | "pages" | "scan" }
  | { status: "unavailable" };

export type OcrResultDecision =
  | {
      status: "draft-authorized";
      jobId: string;
      fields: OcrExtractedField[];
      lowConfidenceFieldIds: string[];
      requireFieldConfirmation: true;
      autoPersistAllowed: false;
    }
  | { status: "failed-closed"; reason: "expired" | "stale" | "invalid-result" }
  | { status: "unavailable" };

export type OcrConfirmation = {
  extractedFieldId: string;
  acceptedValue: string;
  confirmed: boolean;
  userEdited: boolean;
};

export type OcrApplyDecision =
  | {
      status: "apply-authorized";
      homeId: string;
      documentId: string;
      values: Array<{
        field: OcrFieldName;
        acceptedValue: string;
        extractedValue: string;
        confidence: number;
        userEdited: boolean;
        provenance: {
          jobId: string;
          extractedFieldId: string;
          attachmentId: string;
          sourceDigest: string;
          processor: string;
          processorVersion: string;
          extractedAt: Date;
        };
      }>;
      requireAtomicWrite: true;
      preserveImmutableProvenance: true;
    }
  | { status: "confirmation-required" }
  | { status: "stale-source" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type OcrCleanupDecision = {
  cancelQueuedAndProcessingJobs: true;
  revokeTemporaryProcessorAccess: true;
  deleteDraftFields: true;
  deleteProcessorCopies: true;
  deleteRelationalJobMetadata: true;
  preserveConfirmedRecordValues: boolean;
  requireRetryableCleanupLedger: true;
};

function hasWriteRole(role: OcrRole) {
  return role === "OWNER" || role === "ADULT";
}

function isSupportedMediaType(value: string): value is OcrMediaType {
  return OCR_SUPPORTED_MEDIA_TYPES.includes(value as OcrMediaType);
}

function isDocumentKind(value: string): value is OcrDocumentKind {
  return Object.prototype.hasOwnProperty.call(OCR_FIELD_ALLOWLIST, value);
}

function fieldAllowed(kind: OcrDocumentKind, field: string) {
  return (OCR_FIELD_ALLOWLIST[kind] as readonly string[]).includes(field);
}

function validText(value: string, maximum = OCR_MAX_FIELD_VALUE_LENGTH) {
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !normalized.includes("\0") &&
    !normalized.includes("\r") &&
    !normalized.includes("\n")
  );
}

function validDate(value: Date) {
  return Number.isFinite(value.getTime());
}

function validDigest(value: string) {
  return /^[a-f0-9]{64}$/.test(value);
}

function validBoundingBox(box: OcrBoundingBox | undefined) {
  if (!box) {
    return true;
  }

  return [box.x, box.y, box.width, box.height].every(
    (value) => Number.isFinite(value) && value >= 0 && value <= 1,
  ) && box.x + box.width <= 1 && box.y + box.height <= 1;
}

function makeDedupeKey({
  attachment,
  documentKind,
  currentUserId,
  processor,
  processorVersion,
}: {
  attachment: OcrAttachment;
  documentKind: OcrDocumentKind;
  currentUserId: string;
  processor: string;
  processorVersion: string;
}) {
  return JSON.stringify([
    currentUserId,
    attachment.homeId,
    attachment.documentId,
    attachment.digest,
    documentKind,
    processor,
    processorVersion,
    OCR_POLICY_VERSION,
  ]);
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
    validText(field.id, 200) &&
    fieldAllowed(job.documentKind, field.field) &&
    validText(field.extractedValue) &&
    Number.isFinite(field.confidence) &&
    field.confidence >= 0 &&
    field.confidence <= 1 &&
    Number.isInteger(field.page) &&
    field.page >= 1 &&
    field.page <= attachment.pageCount &&
    validBoundingBox(field.boundingBox) &&
    field.sourceDigest === attachment.digest &&
    field.processor === job.processor &&
    field.processorVersion === job.processorVersion &&
    validDate(field.extractedAt) &&
    field.extractedAt >= job.createdAt &&
    field.extractedAt <= now
  );
}

export function decideOcrRequest({
  currentUserId,
  selectedHomeId,
  documentHomeId,
  documentId,
  sessionVerified,
  hasCurrentMembership,
  role,
  attachment,
  documentKind,
  userRequested,
  processor,
  processorVersion,
  providerApproved,
  approvedRegionConfigured,
  boundedRetentionConfigured,
  idempotencyKey,
  existingJob,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  documentHomeId: string;
  documentId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: OcrRole;
  attachment: OcrAttachment;
  documentKind: OcrDocumentKind;
  userRequested: boolean;
  processor: string;
  processorVersion: string;
  providerApproved: boolean;
  approvedRegionConfigured: boolean;
  boundedRetentionConfigured: boolean;
  idempotencyKey: string;
  existingJob?: OcrJob;
  now: Date;
}): OcrRequestDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validText(documentId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !userRequested ||
    !validText(processor, 200) ||
    !validText(processorVersion, 200) ||
    !validText(idempotencyKey, 200) ||
    !isDocumentKind(documentKind) ||
    !validDate(now) ||
    documentHomeId !== selectedHomeId ||
    !validText(attachment.id, 200) ||
    attachment.homeId !== selectedHomeId ||
    attachment.documentId !== documentId ||
    !validDigest(attachment.digest) ||
    !attachment.privateOnly
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (!isSupportedMediaType(attachment.mediaType)) {
    return { status: "invalid-source", reason: "type" };
  }

  if (
    !Number.isInteger(attachment.pageCount) ||
    attachment.pageCount < 1 ||
    attachment.pageCount > OCR_MAX_PAGES
  ) {
    return { status: "invalid-source", reason: "pages" };
  }

  if (
    attachment.status !== "AVAILABLE" ||
    attachment.malwareDecision !== "CLEAN"
  ) {
    return { status: "invalid-source", reason: "scan" };
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

  const dedupeKey = makeDedupeKey({
    attachment,
    documentKind,
    currentUserId,
    processor,
    processorVersion,
  });

  if (existingJob) {
    if (
      !validText(existingJob.id, 200) ||
      !validDate(existingJob.createdAt) ||
      !validDate(existingJob.expiresAt) ||
      existingJob.createdAt > now ||
      existingJob.expiresAt <= existingJob.createdAt ||
      existingJob.expiresAt.getTime() - existingJob.createdAt.getTime() >
        OCR_PROCESSING_TTL_MS ||
      existingJob.homeId !== selectedHomeId ||
      existingJob.documentId !== documentId ||
      existingJob.attachmentId !== attachment.id ||
      existingJob.attachmentDigest !== attachment.digest
    ) {
      return { status: "unavailable" };
    }

    if (
      existingJob.userId === currentUserId &&
      existingJob.documentKind === documentKind &&
      existingJob.processor === processor &&
      existingJob.processorVersion === processorVersion &&
      existingJob.policyVersion === OCR_POLICY_VERSION &&
      ["QUEUED", "PROCESSING", "DRAFT_READY"].includes(existingJob.status) &&
      now < existingJob.expiresAt
    ) {
      return { status: "duplicate", jobId: existingJob.id };
    }
  }

  const expiresAt = new Date(now.getTime() + OCR_PROCESSING_TTL_MS);
  if (!validDate(expiresAt)) {
    return { status: "unavailable" };
  }

  return {
    status: "queue-authorized",
    homeId: selectedHomeId,
    documentId,
    attachmentId: attachment.id,
    idempotencyKey,
    dedupeKey,
    expiresAt,
    temporaryProcessorAccess: true,
    exposeProviderUrl: false,
    providerTrainingAllowed: false,
    autoPersistAllowed: false,
  };
}

export function decideOcrResult({
  job,
  attachment,
  fields,
  now,
}: {
  job: OcrJob;
  attachment: OcrAttachment;
  fields: readonly OcrExtractedField[];
  now: Date;
}): OcrResultDecision {
  if (
    !validText(job.id, 200) ||
    !validText(job.userId, 200) ||
    !validText(job.homeId, 200) ||
    !validText(job.documentId, 200) ||
    !validText(job.processor, 200) ||
    !validText(job.processorVersion, 200) ||
    !validDigest(job.attachmentDigest) ||
    !isDocumentKind(job.documentKind) ||
    !validDate(job.createdAt) ||
    !validDate(job.expiresAt) ||
    !validDate(now) ||
    job.createdAt > now ||
    job.expiresAt <= job.createdAt ||
    job.expiresAt.getTime() - job.createdAt.getTime() >
      OCR_PROCESSING_TTL_MS ||
    job.status !== "PROCESSING" ||
    job.policyVersion !== OCR_POLICY_VERSION ||
    job.attachmentId !== attachment.id ||
    job.homeId !== attachment.homeId ||
    job.documentId !== attachment.documentId
  ) {
    return { status: "unavailable" };
  }

  if (now >= job.expiresAt) {
    return { status: "failed-closed", reason: "expired" };
  }

  if (
    attachment.status !== "AVAILABLE" ||
    attachment.malwareDecision !== "CLEAN" ||
    !attachment.privateOnly ||
    !validText(attachment.id, 200) ||
    !validDigest(attachment.digest) ||
    !isSupportedMediaType(attachment.mediaType) ||
    !Number.isInteger(attachment.pageCount) ||
    attachment.pageCount < 1 ||
    attachment.pageCount > OCR_MAX_PAGES ||
    job.attachmentDigest !== attachment.digest
  ) {
    return { status: "failed-closed", reason: "stale" };
  }

  const seen = new Set<string>();
  const valid =
    fields.length > 0 &&
    fields.length <= OCR_MAX_EXTRACTED_FIELDS &&
    fields.every((field) => {
      if (
        seen.has(field.id) ||
        !validOcrField({ field, job, attachment, now })
      ) {
        return false;
      }
      seen.add(field.id);
      return true;
    });

  if (!valid) {
    return { status: "failed-closed", reason: "invalid-result" };
  }

  return {
    status: "draft-authorized",
    jobId: job.id,
    fields: [...fields],
    lowConfidenceFieldIds: fields
      .filter((field) => field.confidence < OCR_LOW_CONFIDENCE_THRESHOLD)
      .map((field) => field.id),
    requireFieldConfirmation: true,
    autoPersistAllowed: false,
  };
}

export function decideOcrApply({
  currentUserId,
  selectedHomeId,
  documentHomeId,
  documentId,
  sessionVerified,
  hasCurrentMembership,
  role,
  job,
  attachment,
  fields,
  confirmations,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  documentHomeId: string;
  documentId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: OcrRole;
  job: OcrJob;
  attachment: OcrAttachment;
  fields: readonly OcrExtractedField[];
  confirmations: readonly OcrConfirmation[];
  now: Date;
}): OcrApplyDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validText(documentId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !validDate(now) ||
    !validDate(job.createdAt) ||
    !validDate(job.expiresAt) ||
    job.createdAt > now ||
    job.expiresAt <= job.createdAt ||
    job.expiresAt.getTime() - job.createdAt.getTime() >
      OCR_PROCESSING_TTL_MS ||
    !isDocumentKind(job.documentKind) ||
    !validText(job.id, 200) ||
    !validText(job.processor, 200) ||
    !validText(job.processorVersion, 200) ||
    !validDigest(job.attachmentDigest) ||
    documentHomeId !== selectedHomeId ||
    job.userId !== currentUserId ||
    job.homeId !== selectedHomeId ||
    job.documentId !== documentId ||
    job.attachmentId !== attachment.id ||
    attachment.homeId !== selectedHomeId ||
    attachment.documentId !== documentId ||
    !attachment.privateOnly ||
    !validText(attachment.id, 200) ||
    !validDigest(attachment.digest) ||
    !isSupportedMediaType(attachment.mediaType) ||
    !Number.isInteger(attachment.pageCount) ||
    attachment.pageCount < 1 ||
    attachment.pageCount > OCR_MAX_PAGES ||
    job.status !== "DRAFT_READY" ||
    job.policyVersion !== OCR_POLICY_VERSION
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (
    now >= job.expiresAt ||
    attachment.status !== "AVAILABLE" ||
    attachment.malwareDecision !== "CLEAN" ||
    job.attachmentDigest !== attachment.digest
  ) {
    return { status: "stale-source" };
  }

  if (!confirmations.length) {
    return { status: "confirmation-required" };
  }

  if (
    fields.length < 1 ||
    fields.length > OCR_MAX_EXTRACTED_FIELDS ||
    new Set(fields.map((field) => field.id)).size !== fields.length ||
    fields.some((field) => !validOcrField({ field, job, attachment, now }))
  ) {
    return { status: "unavailable" };
  }

  const fieldById = new Map(fields.map((field) => [field.id, field]));
  const seen = new Set<string>();
  const seenFieldNames = new Set<OcrFieldName>();
  const values: Extract<OcrApplyDecision, { status: "apply-authorized" }>["values"] =
    [];

  for (const confirmation of confirmations) {
    const field = fieldById.get(confirmation.extractedFieldId);
    if (
      !field ||
      seen.has(confirmation.extractedFieldId) ||
      seenFieldNames.has(field.field) ||
      !confirmation.confirmed ||
      !validText(confirmation.acceptedValue) ||
      !fieldAllowed(job.documentKind, field.field) ||
      !Number.isFinite(field.confidence) ||
      field.confidence < 0 ||
      field.confidence > 1 ||
      field.sourceDigest !== attachment.digest ||
      field.processor !== job.processor ||
      field.processorVersion !== job.processorVersion ||
      field.extractedAt < job.createdAt ||
      field.extractedAt > now ||
      confirmation.userEdited !==
        (confirmation.acceptedValue.trim() !== field.extractedValue)
    ) {
      return { status: "confirmation-required" };
    }

    seen.add(confirmation.extractedFieldId);
    seenFieldNames.add(field.field);
    values.push({
      field: field.field,
      acceptedValue: confirmation.acceptedValue.trim(),
      extractedValue: field.extractedValue,
      confidence: field.confidence,
      userEdited: confirmation.userEdited,
      provenance: {
        jobId: job.id,
        extractedFieldId: field.id,
        attachmentId: attachment.id,
        sourceDigest: field.sourceDigest,
        processor: field.processor,
        processorVersion: field.processorVersion,
        extractedAt: field.extractedAt,
      },
    });
  }

  return {
    status: "apply-authorized",
    homeId: selectedHomeId,
    documentId,
    values,
    requireAtomicWrite: true,
    preserveImmutableProvenance: true,
  };
}

export function decideOcrCleanup({
  scope,
  includeConfirmedRecordValues,
}: {
  scope: "ATTACHMENT" | "DOCUMENT" | "PROPERTY" | "ACCOUNT";
  includeConfirmedRecordValues: boolean;
}): OcrCleanupDecision {
  return {
    cancelQueuedAndProcessingJobs: true,
    revokeTemporaryProcessorAccess: true,
    deleteDraftFields: true,
    deleteProcessorCopies: true,
    deleteRelationalJobMetadata: true,
    preserveConfirmedRecordValues:
      scope === "ATTACHMENT" && !includeConfirmedRecordValues,
    requireRetryableCleanupLedger: true,
  };
}
