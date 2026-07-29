import assert from "node:assert/strict";
import test from "node:test";

import {
  OCR_CLEANUP_TARGETS,
  OCR_LOW_CONFIDENCE_THRESHOLD,
  OCR_POLICY_VERSION,
  decideOcrApply,
  decideOcrCleanup,
  decideOcrExport,
  decideOcrRequest,
  decideOcrResult,
  makeOcrSelectionDigest,
  type OcrAttachment,
  type OcrAuthorizationEvidence,
  type OcrConfirmationEvidence,
  type OcrDraft,
  type OcrExtractedField,
  type OcrFieldConfirmation,
  type OcrJob,
  type OcrProviderApproval,
} from "../src/lib/ocr-extraction-policy";

const now = new Date("2026-07-29T10:00:00.000Z");
const digest = "d".repeat(64);

const attachment: OcrAttachment = {
  id: "attachment-1",
  revision: 3,
  homeId: "home-1",
  documentId: "document-1",
  documentRevision: 7,
  mediaType: "application/pdf",
  digest,
  sizeBytes: 200_000,
  pageCount: 2,
  status: "AVAILABLE",
  storageClass: "PRIVATE",
  malwareDecision: "CLEAN",
  malwareScanRevision: 3,
};

const authorization: OcrAuthorizationEvidence = {
  id: "authorization-1",
  purpose: "OCR_REQUEST",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  documentId: "document-1",
  documentRevision: 7,
  attachmentId: "attachment-1",
  attachmentRevision: 3,
  sourceDigest: digest,
  role: "OWNER",
  membershipActive: true,
  verifiedSession: true,
  issuedAt: new Date("2026-07-29T09:55:00.000Z"),
  expiresAt: new Date("2026-07-29T10:05:00.000Z"),
  consumed: false,
};

const providerApproval: OcrProviderApproval = {
  id: "provider-approval-1",
  processor: "approved-ocr",
  processorVersion: "2026-07",
  region: "au-east",
  retentionHours: 0,
  privateProcessing: true,
  noTraining: true,
  noProviderLogging: true,
  deletionSupported: true,
  clientApproved: true,
  privacyApproved: true,
  legalApproved: true,
  costApproved: true,
  issuedAt: new Date("2026-07-20T00:00:00.000Z"),
  expiresAt: new Date("2026-08-10T00:00:00.000Z"),
  revoked: false,
};

const requestInput = {
  requestId: "ocr-request-1",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  documentId: "document-1",
  documentRevision: 7,
  documentKind: "RECEIPT" as const,
  attachment,
  authorization,
  providerApproval,
  idempotencyKey: "idempotency-1",
  now,
};

const job: OcrJob = {
  id: "ocr-job-1",
  requestId: "ocr-request-1",
  idempotencyKey: "idempotency-1",
  userId: "user-1",
  sessionId: "session-1",
  homeId: "home-1",
  documentId: "document-1",
  documentRevision: 7,
  attachmentId: "attachment-1",
  attachmentRevision: 3,
  attachmentDigest: digest,
  documentKind: "RECEIPT",
  processorApprovalId: "provider-approval-1",
  processor: "approved-ocr",
  processorVersion: "2026-07",
  processorRegion: "au-east",
  policyVersion: OCR_POLICY_VERSION,
  status: "PROCESSING",
  createdAt: new Date("2026-07-29T09:30:00.000Z"),
  expiresAt: new Date("2026-07-29T10:30:00.000Z"),
};

const fields: OcrExtractedField[] = [
  {
    id: "field-merchant",
    field: "merchantName",
    rawValue: "FICTIONAL HARDWARE",
    normalizedValue: "Fictional Hardware",
    confidence: 0.98,
    page: 1,
    boundingBox: { x: 0.1, y: 0.1, width: 0.4, height: 0.05 },
    sourceAttachmentId: "attachment-1",
    sourceAttachmentRevision: 3,
    sourceDigest: digest,
    processor: "approved-ocr",
    processorVersion: "2026-07",
    language: "en-AU",
    extractedAt: new Date("2026-07-29T09:45:00.000Z"),
  },
  {
    id: "field-total",
    field: "totalAmount",
    rawValue: "$74.95",
    normalizedValue: "74.95",
    confidence: OCR_LOW_CONFIDENCE_THRESHOLD - 0.01,
    page: 1,
    boundingBox: { x: 0.5, y: 0.8, width: 0.2, height: 0.05 },
    sourceAttachmentId: "attachment-1",
    sourceAttachmentRevision: 3,
    sourceDigest: digest,
    processor: "approved-ocr",
    processorVersion: "2026-07",
    language: "en-AU",
    extractedAt: new Date("2026-07-29T09:45:00.000Z"),
  },
];

function makeDraft(): OcrDraft {
  return {
    id: "draft-1",
    version: 1,
    jobId: job.id,
    userId: job.userId,
    homeId: job.homeId,
    documentId: job.documentId,
    documentRevision: job.documentRevision,
    attachmentId: job.attachmentId,
    attachmentRevision: job.attachmentRevision,
    attachmentDigest: job.attachmentDigest,
    processor: job.processor,
    processorVersion: job.processorVersion,
    policyVersion: OCR_POLICY_VERSION,
    status: "REVIEW_REQUIRED",
    fields,
    createdAt: new Date("2026-07-29T09:50:00.000Z"),
    expiresAt: new Date("2026-07-29T10:30:00.000Z"),
  };
}

function applyInput(confirmations: readonly OcrFieldConfirmation[]) {
  const draft = makeDraft();
  const applyAuthorization: OcrAuthorizationEvidence = {
    ...authorization,
    id: "authorization-apply-1",
    purpose: "OCR_APPLY",
  };
  const confirmationEvidence: OcrConfirmationEvidence = {
    id: "confirmation-proof-1",
    purpose: "OCR_APPLY",
    userId: "user-1",
    sessionId: "session-1",
    homeId: "home-1",
    documentId: "document-1",
    documentRevision: 7,
    jobId: job.id,
    draftId: draft.id,
    draftVersion: draft.version,
    selectionDigest: makeOcrSelectionDigest(draft, confirmations),
    issuedAt: new Date("2026-07-29T09:55:00.000Z"),
    expiresAt: new Date("2026-07-29T10:05:00.000Z"),
    consumed: false,
  };
  return {
    userId: "user-1",
    sessionId: "session-1",
    homeId: "home-1",
    documentId: "document-1",
    currentDocumentRevision: 7,
    currentDraftVersion: 1,
    attachment,
    job: { ...job, status: "DRAFT_READY" as const },
    draft,
    authorization: applyAuthorization,
    confirmations,
    confirmationEvidence,
    now,
  };
}

test("authorizes one exact private, scanned, user-requested source", () => {
  const decision = decideOcrRequest(requestInput);
  assert.equal(decision.status, "queue-authorized");
  if (decision.status !== "queue-authorized") return;
  assert.equal(decision.documentRevision, 7);
  assert.equal(decision.attachmentRevision, 3);
  assert.equal(decision.exposeBlobUrl, false);
  assert.equal(decision.providerTrainingAllowed, false);
  assert.equal(decision.providerLoggingAllowed, false);
  assert.equal(decision.rawResponsePersistenceAllowed, false);
  assert.equal(decision.autoPersistAllowed, false);
  assert.match(decision.dedupeKey, /provider-approval-1/);
  assert.match(decision.dedupeKey, new RegExp(digest));
});

test("rejects substituted identity, session, property and revision evidence", () => {
  for (const input of [
    { ...requestInput, userId: "user-2" },
    { ...requestInput, sessionId: "session-2" },
    { ...requestInput, homeId: "home-2" },
    { ...requestInput, documentRevision: 8 },
    {
      ...requestInput,
      attachment: { ...attachment, revision: 4, malwareScanRevision: 4 },
    },
  ]) {
    assert.deepEqual(decideOcrRequest(input), { status: "unavailable" });
  }
});

test("requires exact booleans and rejects replayed or expired authorization", () => {
  for (const changed of [
    { membershipActive: 1 },
    { verifiedSession: "true" },
    { consumed: true },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideOcrRequest({
        ...requestInput,
        authorization: { ...authorization, ...changed } as OcrAuthorizationEvidence,
      }),
      { status: "unavailable" },
    );
  }
});

test("keeps child and guest accounts read-only", () => {
  for (const role of ["CHILD", "GUEST"] as const) {
    assert.deepEqual(
      decideOcrRequest({
        ...requestInput,
        authorization: { ...authorization, role },
      }),
      { status: "read-only" },
    );
  }
});

test("requires current private malware evidence for the exact revision", () => {
  for (const changed of [
    { storageClass: "PUBLIC" },
    { status: "QUARANTINED" },
    { malwareDecision: "UNAVAILABLE" },
    { malwareScanRevision: 2 },
    { digest: "e".repeat(64) },
  ]) {
    assert.deepEqual(
      decideOcrRequest({
        ...requestInput,
        attachment: { ...attachment, ...changed } as OcrAttachment,
      }),
      { status: "unavailable" },
    );
  }
});

test("requires explicit current provider, privacy, legal and cost approval", () => {
  for (const changed of [
    { clientApproved: false },
    { privacyApproved: false },
    { legalApproved: false },
    { costApproved: false },
    { noTraining: false },
    { noProviderLogging: false },
    { deletionSupported: false },
    { revoked: true },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideOcrRequest({
        ...requestInput,
        providerApproval: {
          ...providerApproval,
          ...changed,
        } as OcrProviderApproval,
      }),
      { status: "provider-gate", reason: "approval" },
    );
  }
});

test("enforces Australian region and bounded provider retention", () => {
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      providerApproval: { ...providerApproval, region: "us-east" },
    }),
    { status: "provider-gate", reason: "region" },
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      providerApproval: { ...providerApproval, retentionHours: 25 },
    }),
    { status: "provider-gate", reason: "approval" },
  );
});

test("deduplicates only an exact live job and fails closed on foreign evidence", () => {
  assert.deepEqual(
    decideOcrRequest({ ...requestInput, existingJob: job }),
    { status: "duplicate", jobId: job.id },
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
        status: "FAILED",
      },
    }).status,
    "queue-authorized",
  );
});

test("creates a review-only draft with confidence and complete provenance", () => {
  const decision = decideOcrResult({
    draftId: "draft-1",
    draftVersion: 1,
    job,
    attachment,
    fields,
    now,
  });
  assert.equal(decision.status, "draft-authorized");
  if (decision.status !== "draft-authorized") return;
  assert.equal(decision.draft.status, "REVIEW_REQUIRED");
  assert.equal(decision.draft.attachmentRevision, 3);
  assert.deepEqual(decision.lowConfidenceFieldIds, ["field-total"]);
  assert.equal(decision.requireEverySelectedFieldConfirmation, true);
  assert.equal(decision.autoPersistAllowed, false);
  assert.equal(decision.automatedDecisionAllowed, false);
});

test("rejects expired jobs and stale source revisions or digests", () => {
  assert.deepEqual(
    decideOcrResult({
      draftId: "draft-1",
      draftVersion: 1,
      job: { ...job, expiresAt: now },
      attachment,
      fields,
      now,
    }),
    { status: "failed-closed", reason: "expired" },
  );
  assert.deepEqual(
    decideOcrResult({
      draftId: "draft-1",
      draftVersion: 1,
      job,
      attachment: {
        ...attachment,
        revision: 4,
        malwareScanRevision: 4,
      },
      fields,
      now,
    }),
    { status: "failed-closed", reason: "stale" },
  );
});

test("rejects malformed confidence, page, bounds, language and provenance", () => {
  const invalidFields = [
    { ...fields[0], confidence: Number.NaN },
    { ...fields[0], confidence: 1.1 },
    { ...fields[0], page: 3 },
    {
      ...fields[0],
      boundingBox: { x: 0.8, y: 0.1, width: 0.4, height: 0.1 },
    },
    { ...fields[0], boundingBox: undefined },
    { ...fields[0], sourceAttachmentRevision: 2 },
    { ...fields[0], sourceDigest: "e".repeat(64) },
    { ...fields[0], language: " en-AU " },
    { ...fields[0], extractedAt: new Date(Number.NaN) },
  ];
  for (const invalid of invalidFields) {
    assert.deepEqual(
      decideOcrResult({
        draftId: "draft-1",
        draftVersion: 1,
        job,
        attachment,
        fields: [invalid as OcrExtractedField],
        now,
      }),
      { status: "failed-closed", reason: "invalid-result" },
    );
  }
});

test("rejects unexpected fields and competing candidates", () => {
  assert.deepEqual(
    decideOcrResult({
      draftId: "draft-1",
      draftVersion: 1,
      job,
      attachment,
      fields: [{ ...fields[0], field: "modelNumber" }],
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
  assert.deepEqual(
    decideOcrResult({
      draftId: "draft-1",
      draftVersion: 1,
      job,
      attachment,
      fields: [
        fields[0],
        { ...fields[0], id: "field-merchant-alternative" },
      ],
      now,
    }),
    { status: "failed-closed", reason: "invalid-result" },
  );
});

test("requires a short-lived single-use proof over exact selected values", () => {
  const confirmations: OcrFieldConfirmation[] = [
    {
      extractedFieldId: "field-merchant",
      acceptedValue: "Fictional Hardware",
      userEdited: false,
    },
  ];
  const input = applyInput(confirmations);
  for (const evidence of [
    { ...input.confirmationEvidence, consumed: true },
    { ...input.confirmationEvidence, expiresAt: now },
    { ...input.confirmationEvidence, selectionDigest: "e".repeat(64) },
    { ...input.confirmationEvidence, draftVersion: 2 },
    { ...input.confirmationEvidence, userId: "user-2" },
  ]) {
    assert.deepEqual(
      decideOcrApply({
        ...input,
        confirmationEvidence: evidence as OcrConfirmationEvidence,
      }),
      { status: "confirmation-required" },
    );
  }
});

test("authorizes exact selected fields with CAS and immutable provenance", () => {
  const confirmations: OcrFieldConfirmation[] = [
    {
      extractedFieldId: "field-merchant",
      acceptedValue: "Fictional Hardware Pty Ltd",
      userEdited: true,
    },
    {
      extractedFieldId: "field-total",
      acceptedValue: "74.95",
      userEdited: false,
    },
  ];
  const decision = decideOcrApply(applyInput(confirmations));
  assert.equal(decision.status, "apply-authorized");
  if (decision.status !== "apply-authorized") return;
  assert.equal(decision.expectedDocumentRevision, 7);
  assert.equal(decision.expectedDraftVersion, 1);
  assert.equal(decision.requireCompareAndSet, true);
  assert.equal(decision.requireAtomicWrite, true);
  assert.equal(decision.preserveImmutableProvenance, true);
  assert.equal(decision.triggerAutomationAllowed, false);
  assert.equal(decision.values[0].provenance.page, 1);
  assert.equal(decision.values[0].provenance.attachmentRevision, 3);
});

test("low confidence still requires the same exact confirmation proof", () => {
  const confirmations: OcrFieldConfirmation[] = [
    {
      extractedFieldId: "field-total",
      acceptedValue: "74.95",
      userEdited: false,
    },
  ];
  assert.equal(decideOcrApply(applyInput(confirmations)).status, "apply-authorized");
  assert.deepEqual(
    decideOcrApply({
      ...applyInput(confirmations),
      confirmations: [],
    }),
    { status: "confirmation-required" },
  );
});

test("rejects stale document, draft and attachment versions at apply", () => {
  const confirmations: OcrFieldConfirmation[] = [
    {
      extractedFieldId: "field-merchant",
      acceptedValue: "Fictional Hardware",
      userEdited: false,
    },
  ];
  const input = applyInput(confirmations);
  assert.deepEqual(
    decideOcrApply({ ...input, currentDocumentRevision: 8 }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrApply({
      ...input,
      currentDraftVersion: 2,
    }),
    { status: "stale-source" },
  );
  assert.deepEqual(
    decideOcrApply({
      ...input,
      attachment: {
        ...attachment,
        revision: 4,
        malwareScanRevision: 4,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects caller claims that do not match normalized-value edits", () => {
  const confirmations: OcrFieldConfirmation[] = [
    {
      extractedFieldId: "field-merchant",
      acceptedValue: "Fictional Hardware Pty Ltd",
      userEdited: false,
    },
  ];
  assert.deepEqual(decideOcrApply(applyInput(confirmations)), {
    status: "confirmation-required",
  });
});

test("exports accepted values and provenance without raw payloads or URLs", () => {
  const exportAuthorization: OcrAuthorizationEvidence = {
    ...authorization,
    id: "authorization-export-1",
    purpose: "OCR_EXPORT",
  };
  assert.deepEqual(
    decideOcrExport({
      userId: "user-1",
      sessionId: "session-1",
      homeId: "home-1",
      documentId: "document-1",
      documentRevision: 7,
      attachment,
      authorization: exportAuthorization,
      now,
    }),
    {
      status: "export-authorized",
      homeId: "home-1",
      documentId: "document-1",
      includeAcceptedValues: true,
      includeFieldConfidenceAndProvenance: true,
      includeProcessorNameAndVersion: true,
      includeRawProcessorPayload: false,
      includeTemporaryCredentials: false,
      includeBlobUrls: false,
    },
  );
});

test("cleanup covers processor, server, device, queue and provenance copies", () => {
  const decision = decideOcrCleanup({
    event: "PROPERTY_DELETED",
    scope: "PROPERTY",
    scopeId: "home-1",
    preserveConfirmedValues: false,
  });
  assert.equal(decision.status, "cleanup-authorized");
  if (decision.status !== "cleanup-authorized") return;
  assert.deepEqual(decision.targets, OCR_CLEANUP_TARGETS);
  assert.equal(decision.removeDeviceAndServerCopies, true);
  assert.equal(decision.blockCompleteClaimUntilProcessorAck, true);
});

test("cleanup rejects mismatched scope and unsafe value preservation", () => {
  assert.deepEqual(
    decideOcrCleanup({
      event: "ACCOUNT_DELETED",
      scope: "PROPERTY",
      scopeId: "home-1",
      preserveConfirmedValues: false,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrCleanup({
      event: "DOCUMENT_DELETED",
      scope: "DOCUMENT",
      scopeId: "document-1",
      preserveConfirmedValues: true,
    }),
    { status: "unavailable" },
  );
});

test("malformed dates, whitespace IDs and truthy runtime values fail closed", () => {
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      requestId: " request ",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      now: new Date(Number.NaN),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOcrRequest({
      ...requestInput,
      authorization: {
        ...authorization,
        membershipActive: "true",
      } as unknown as OcrAuthorizationEvidence,
    }),
    { status: "unavailable" },
  );
});
