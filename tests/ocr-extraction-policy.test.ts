import assert from "node:assert/strict";
import test from "node:test";

import {
  OCR_LOW_CONFIDENCE_THRESHOLD,
  OCR_POLICY_VERSION,
  decideOcrApply,
  decideOcrCleanup,
  decideOcrRequest,
  decideOcrResult,
  type OcrAttachment,
  type OcrExtractedField,
  type OcrJob,
} from "../src/lib/ocr-extraction-policy";

const now = new Date("2026-07-28T04:00:00.000Z");

const attachment: OcrAttachment = {
  id: "attachment-1",
  homeId: "home-1",
  documentId: "document-1",
  mediaType: "application/pdf",
  digest: "d".repeat(64),
  pageCount: 2,
  status: "AVAILABLE",
  privateOnly: true,
  malwareDecision: "CLEAN",
};

const job: OcrJob = {
  id: "ocr-job-1",
  userId: "user-1",
  homeId: "home-1",
  documentId: "document-1",
  attachmentId: "attachment-1",
  attachmentDigest: attachment.digest,
  documentKind: "RECEIPT",
  processor: "approved-ocr",
  processorVersion: "2026-07",
  policyVersion: OCR_POLICY_VERSION,
  status: "PROCESSING",
  createdAt: new Date("2026-07-28T03:00:00.000Z"),
  expiresAt: new Date("2026-07-29T03:00:00.000Z"),
};

const fields: OcrExtractedField[] = [
  {
    id: "field-merchant",
    field: "merchantName",
    extractedValue: "Fictional Hardware",
    confidence: 0.98,
    page: 1,
    boundingBox: { x: 0.1, y: 0.1, width: 0.4, height: 0.05 },
    sourceDigest: attachment.digest,
    processor: job.processor,
    processorVersion: job.processorVersion,
    extractedAt: new Date("2026-07-28T03:30:00.000Z"),
  },
  {
    id: "field-total",
    field: "totalAmount",
    extractedValue: "74.95",
    confidence: OCR_LOW_CONFIDENCE_THRESHOLD - 0.01,
    page: 1,
    sourceDigest: attachment.digest,
    processor: job.processor,
    processorVersion: job.processorVersion,
    extractedAt: new Date("2026-07-28T03:30:00.000Z"),
  },
];

const requestInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  documentHomeId: "home-1",
  documentId: "document-1",
  sessionVerified: true,
  hasCurrentMembership: true,
  role: "OWNER" as const,
  attachment,
  documentKind: "RECEIPT" as const,
  userRequested: true,
  processor: "approved-ocr",
  processorVersion: "2026-07",
  providerApproved: true,
  approvedRegionConfigured: true,
  boundedRetentionConfigured: true,
  idempotencyKey: "ocr-request-1",
  now,
};

test("authorizes only an explicit clean private same-property OCR request", () => {
  const decision = decideOcrRequest(requestInput);
  assert.equal(decision.status, "queue-authorized");
  if (decision.status !== "queue-authorized") {
    return;
  }
  assert.equal(decision.homeId, "home-1");
  assert.equal(decision.attachmentId, "attachment-1");
  assert.equal(decision.temporaryProcessorAccess, true);
  assert.equal(decision.exposeProviderUrl, false);
  assert.equal(decision.providerTrainingAllowed, false);
  assert.equal(decision.autoPersistAllowed, false);
  assert.match(decision.dedupeKey, new RegExp(attachment.digest));
  assert.match(decision.dedupeKey, new RegExp(OCR_POLICY_VERSION));
});

test("denies implicit, read-only, cross-property and unscanned requests", () => {
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, userRequested: false }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, role: "GUEST" }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, documentHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      attachment: {
        ...attachment,
        status: "QUARANTINED",
        malwareDecision: "UNAVAILABLE",
      },
    }),
    { status: "invalid-source", reason: "scan" },
  );
});

test("keeps provider, region and retention choices as explicit gates", () => {
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, providerApproved: false }),
    { status: "provider-gate", reason: "provider" },
  );
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, approvedRegionConfigured: false }),
    { status: "provider-gate", reason: "region" },
  );
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, boundedRetentionConfigured: false }),
    { status: "provider-gate", reason: "retention" },
  );
});

test("rejects unsupported page bounds and deduplicates exact active work", () => {
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      attachment: { ...attachment, pageCount: 21 },
    }),
    { status: "invalid-source", reason: "pages" },
  );
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, existingJob: job }),
    { status: "duplicate", jobId: "ocr-job-1" },
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      existingJob: { ...job, homeId: "home-2" },
    }),
    { status: "unavailable" },
  );
  assert.equal(
    decideOcrRequest({
      ...requestInput,
      existingJob: {
        ...job,
        expiresAt: new Date("2026-07-28T03:59:59.999Z"),
      },
    }).status,
    "queue-authorized",
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      now: new Date(Number.NaN),
    }),
    { status: "unavailable" },
  );
});

test("accepts valid results as drafts and marks low confidence fields", () => {
  assert.deepEqual(
    decideOcrResult({ job, attachment, fields, now }),
    {
      status: "draft-authorized",
      jobId: "ocr-job-1",
      fields,
      lowConfidenceFieldIds: ["field-total"],
      requireFieldConfirmation: true,
      autoPersistAllowed: false,
    },
  );
});

test("fails closed for expired, stale and out-of-allowlist results", () => {
  assert.deepEqual(
    decideOcrResult({ job: { ...job, expiresAt: now }, attachment, fields, now }),
    { status: "failed-closed", reason: "expired" },
  );
  assert.deepEqual(
    decideOcrResult({
      job,
      attachment: { ...attachment, digest: "changed" },
      fields,
      now,
    }),
    { status: "failed-closed", reason: "stale" },
  );
  assert.deepEqual(
    decideOcrResult({
      job,
      attachment,
      fields: [{ ...fields[0], field: "modelNumber" }],
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
});

test("rejects malformed confidence, page, box and provenance", () => {
  for (const invalid of [
    { ...fields[0], confidence: 1.1 },
    { ...fields[0], page: 3 },
    {
      ...fields[0],
      boundingBox: { x: 0.8, y: 0.1, width: 0.4, height: 0.1 },
    },
    { ...fields[0], sourceDigest: "other" },
    { ...fields[0], extractedAt: new Date(Number.NaN) },
  ]) {
    assert.deepEqual(
      decideOcrResult({ job, attachment, fields: [invalid], now }),
      { status: "failed-closed", reason: "invalid-result" },
    );
  }
});

test("requires explicit field-by-field confirmation before atomic apply", () => {
  const readyJob = { ...job, status: "DRAFT_READY" as const };
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    documentHomeId: "home-1",
    documentId: "document-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT" as const,
    job: readyJob,
    attachment,
    fields,
    now,
  };

  assert.deepEqual(decideOcrApply({ ...input, confirmations: [] }), {
    status: "confirmation-required",
  });
  assert.deepEqual(
    decideOcrApply({
      ...input,
      confirmations: [
        {
          extractedFieldId: "field-merchant",
          acceptedValue: "Fictional Hardware",
          confirmed: false,
          userEdited: false,
        },
      ],
    }),
    { status: "confirmation-required" },
  );

  const decision = decideOcrApply({
    ...input,
    confirmations: [
      {
        extractedFieldId: "field-merchant",
        acceptedValue: "Fictional Hardware Pty Ltd",
        confirmed: true,
        userEdited: true,
      },
    ],
  });
  assert.equal(decision.status, "apply-authorized");
  if (decision.status !== "apply-authorized") {
    return;
  }
  assert.equal(decision.requireAtomicWrite, true);
  assert.equal(decision.preserveImmutableProvenance, true);
  assert.equal(decision.values[0].acceptedValue, "Fictional Hardware Pty Ltd");
  assert.equal(decision.values[0].extractedValue, "Fictional Hardware");
  assert.equal(decision.values[0].userEdited, true);
  assert.equal(decision.values[0].provenance.sourceDigest, attachment.digest);
});

test("re-authorizes writes and rejects stale sources", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    documentHomeId: "home-1",
    documentId: "document-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    job: { ...job, status: "DRAFT_READY" as const },
    attachment,
    fields,
    now,
    confirmations: [
      {
        extractedFieldId: "field-merchant",
        acceptedValue: "Fictional Hardware",
        confirmed: true,
        userEdited: false,
      },
    ],
  };
  assert.deepEqual(decideOcrApply({ ...input, role: "CHILD" }), {
    status: "read-only",
  });
  assert.deepEqual(
    decideOcrApply({
      ...input,
      attachment: { ...attachment, digest: "e".repeat(64) },
    }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideOcrApply({ ...input, selectedHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrApply({
      ...input,
      now: new Date("2026-07-29T03:00:00.000Z"),
    }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideOcrApply({
      ...input,
      attachment: { ...attachment, privateOnly: false },
    }),
    { status: "unavailable" },
  );
});

test("rejects policy drift and competing candidates for one field", () => {
  assert.deepEqual(
    decideOcrResult({
      job: { ...job, policyVersion: "obsolete-policy" },
      attachment,
      fields,
      now,
    }),
    { status: "unavailable" },
  );

  const duplicateCandidate = {
    ...fields[0],
    id: "field-merchant-alternative",
    extractedValue: "Fictional Hardware Pty Ltd",
  };
  assert.deepEqual(
    decideOcrApply({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      documentHomeId: "home-1",
      documentId: "document-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      job: { ...job, status: "DRAFT_READY" },
      attachment,
      fields: [fields[0], duplicateCandidate],
      confirmations: [
        {
          extractedFieldId: "field-merchant",
          acceptedValue: "Fictional Hardware",
          confirmed: true,
          userEdited: false,
        },
        {
          extractedFieldId: "field-merchant-alternative",
          acceptedValue: "Fictional Hardware Pty Ltd",
          confirmed: true,
          userEdited: false,
        },
      ],
      now,
    }),
    { status: "confirmation-required" },
  );
});

test("cleanup covers processors, drafts and retryable deletion ledgers", () => {
  assert.deepEqual(
    decideOcrCleanup({
      scope: "ATTACHMENT",
      includeConfirmedRecordValues: false,
    }),
    {
      cancelQueuedAndProcessingJobs: true,
      revokeTemporaryProcessorAccess: true,
      deleteDraftFields: true,
      deleteProcessorCopies: true,
      deleteRelationalJobMetadata: true,
      preserveConfirmedRecordValues: true,
      requireRetryableCleanupLedger: true,
    },
  );
  assert.equal(
    decideOcrCleanup({
      scope: "ACCOUNT",
      includeConfirmedRecordValues: true,
    }).preserveConfirmedRecordValues,
    false,
  );
});
