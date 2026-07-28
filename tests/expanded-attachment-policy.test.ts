import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPANDED_ATTACHMENT_MAX_COUNT,
  EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES,
  decideAttachmentReorder,
  decideAttachmentScan,
  decideExpandedAttachmentCleanup,
  decideExpandedAttachmentDelete,
  decideExpandedAttachmentRead,
  decideExpandedAttachmentSlot,
  hasExpandedAttachmentSignature,
  type AttachmentScanResult,
  type ExpandedAttachment,
} from "../src/lib/expanded-attachment-policy";

const heicBytes = new Uint8Array([
  0x00, 0x00, 0x00, 0x18,
  0x66, 0x74, 0x79, 0x70,
  0x68, 0x65, 0x69, 0x63,
]);

const attachment: ExpandedAttachment = {
  id: "attachment-1",
  homeId: "home-1",
  documentId: "document-1",
  storageKey: "households/home-1/documents/document-1/file.pdf",
  fileName: "fictional-manual.pdf",
  mediaType: "application/pdf",
  sizeBytes: 500_000,
  digest: "b".repeat(64),
  position: 0,
  status: "QUARANTINED",
  uploadedAt: new Date("2026-07-28T00:00:00.000Z"),
  quarantineExpiresAt: new Date("2026-07-29T00:00:00.000Z"),
  signatureValid: true,
  metadataSanitized: true,
  derivedPreviewKeys: ["preview-1"],
};

test("recognises PDF, JPEG, PNG and HEIC or HEIF signatures", () => {
  assert.equal(
    hasExpandedAttachmentSignature(
      "application/pdf",
      new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    ),
    true,
  );
  assert.equal(
    hasExpandedAttachmentSignature(
      "image/jpeg",
      new Uint8Array([0xff, 0xd8, 0xff]),
    ),
    true,
  );
  assert.equal(
    hasExpandedAttachmentSignature(
      "image/png",
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    true,
  );
  assert.equal(hasExpandedAttachmentSignature("image/heic", heicBytes), true);
  assert.equal(
    hasExpandedAttachmentSignature(
      "image/heif",
      new Uint8Array([...heicBytes.slice(0, 8), 0x6d, 0x69, 0x66, 0x31]),
    ),
    true,
  );
});

test("authorizes only bounded property-scoped private gallery slots", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      documentHomeId: "home-1",
      documentId: "document-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      privateStorageAvailable: true,
      mediaType: "image/heic",
      fileName: "receipt.heic",
      bytes: heicBytes,
      fileSizeBytes: 1_000_000,
      currentCount: 2,
      currentTotalBytes: 2_000_000,
      digest: "a".repeat(64),
      idempotencyKey: "upload-1",
    }),
    {
      status: "slot-authorized",
      homeId: "home-1",
      documentId: "document-1",
      idempotencyKey: "upload-1",
      initialStatus: "QUARANTINED",
      privateOnly: true,
      exposeProviderUrl: false,
      requireServerSignatureValidation: true,
      requireMetadataSanitization: true,
      requireMalwareDecision: true,
    },
  );
});

test("rejects cross-property, read-only, invalid and full gallery uploads", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    documentHomeId: "home-1",
    documentId: "document-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    privateStorageAvailable: true,
    mediaType: "application/pdf",
    fileName: "manual.pdf",
    bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    fileSizeBytes: 500_000,
    currentCount: 1,
    currentTotalBytes: 500_000,
    digest: "a".repeat(64),
    idempotencyKey: "upload-1",
  };

  assert.deepEqual(
    decideExpandedAttachmentSlot({ ...input, documentHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({ ...input, role: "GUEST" }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      ...input,
      fileName: "manual.jpg",
    }),
    { status: "invalid-file", reason: "extension" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      ...input,
      bytes: new Uint8Array([0xff, 0xd8, 0xff]),
    }),
    { status: "invalid-file", reason: "signature" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      ...input,
      currentCount: EXPANDED_ATTACHMENT_MAX_COUNT,
    }),
    { status: "gallery-full" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      ...input,
      currentTotalBytes: EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES,
    }),
    { status: "gallery-full" },
  );
});

test("deduplicates within the authorised document without a second upload", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      documentHomeId: "home-1",
      documentId: "document-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      privateStorageAvailable: true,
      mediaType: "application/pdf",
      fileName: "manual.pdf",
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
      fileSizeBytes: 500_000,
      currentCount: 1,
      currentTotalBytes: 500_000,
      digest: attachment.digest,
      duplicateAttachment: attachment,
      idempotencyKey: "upload-duplicate",
    }),
    { status: "duplicate", attachmentId: "attachment-1" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      documentHomeId: "home-1",
      documentId: "document-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "OWNER",
      privateStorageAvailable: true,
      mediaType: "application/pdf",
      fileName: "manual.pdf",
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
      fileSizeBytes: 500_000,
      currentCount: 1,
      currentTotalBytes: 500_000,
      digest: attachment.digest,
      duplicateAttachment: { ...attachment, homeId: "home-2" },
      idempotencyKey: "upload-cross-property-duplicate",
    }),
    { status: "unavailable" },
  );
});

test("publishes only clean scanned and sanitised quarantine objects", () => {
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "CLEAN",
      scannerConfigured: true,
      now: new Date("2026-07-28T01:00:00.000Z"),
    }),
    {
      status: "publish",
      attachmentId: "attachment-1",
      finalStatus: "AVAILABLE",
      privateOnly: true,
    },
  );
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "MALICIOUS",
      scannerConfigured: true,
      now: new Date("2026-07-28T01:00:00.000Z"),
    }),
    {
      status: "reject-and-delete",
      attachmentId: "attachment-1",
      deleteOriginal: true,
      deleteDerivedPreviews: true,
    },
  );
});

test("keeps unavailable scanners fail-closed and expires quarantine", () => {
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "UNAVAILABLE",
      scannerConfigured: false,
      now: new Date("2026-07-28T01:00:00.000Z"),
    }),
    {
      status: "quarantine",
      attachmentId: "attachment-1",
      retryAllowed: false,
    },
  );
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "UNKNOWN" as AttachmentScanResult,
      scannerConfigured: true,
      now: new Date("2026-07-28T01:00:00.000Z"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "CLEAN",
      scannerConfigured: true,
      now: new Date(Number.NaN),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "CLEAN",
      scannerConfigured: true,
      now: new Date("2026-07-27T23:59:59.999Z"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      result: "ERROR",
      scannerConfigured: true,
      now: attachment.quarantineExpiresAt,
    }),
    {
      status: "reject-and-delete",
      attachmentId: "attachment-1",
      deleteOriginal: true,
      deleteDerivedPreviews: true,
    },
  );
});

test("streams only available same-property attachments without provider URLs", () => {
  assert.deepEqual(
    decideExpandedAttachmentRead({
      attachment: { ...attachment, status: "AVAILABLE" },
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      disposition: "inline",
    }),
    {
      status: "stream-authorized",
      attachmentId: "attachment-1",
      storageKey: attachment.storageKey,
      noStore: true,
      exposeProviderUrl: false,
      disposition: "inline",
    },
  );
  assert.deepEqual(
    decideExpandedAttachmentRead({
      attachment: { ...attachment, status: "AVAILABLE" },
      currentUserId: "user-1",
      selectedHomeId: "home-2",
      sessionVerified: true,
      hasCurrentMembership: true,
      disposition: "attachment",
    }),
    { status: "not-found" },
  );
  assert.deepEqual(
    decideExpandedAttachmentRead({
      attachment: {
        ...attachment,
        status: "AVAILABLE",
        metadataSanitized: false,
      },
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      disposition: "inline",
    }),
    { status: "not-found" },
  );
});

test("reorders only the complete exact document gallery", () => {
  const second = {
    ...attachment,
    id: "attachment-2",
    storageKey: "file-2",
    digest: "c".repeat(64),
    position: 1,
  };
  const input = {
    attachments: [
      { ...attachment, status: "AVAILABLE" as const },
      { ...second, status: "AVAILABLE" as const },
    ],
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    documentId: "document-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    orderedAttachmentIds: ["attachment-2", "attachment-1"],
  };

  assert.deepEqual(decideAttachmentReorder(input), {
    status: "reorder-authorized",
    orderedAttachmentIds: ["attachment-2", "attachment-1"],
    requireAtomicUpdate: true,
  });
  assert.deepEqual(
    decideAttachmentReorder({
      ...input,
      orderedAttachmentIds: ["attachment-2"],
    }),
    { status: "invalid-order" },
  );
  assert.deepEqual(
    decideAttachmentReorder({
      ...input,
      attachments: [],
      orderedAttachmentIds: [],
    }),
    { status: "unavailable" },
  );
});

test("deletes original and derived keys through an idempotent private workflow", () => {
  assert.deepEqual(
    decideExpandedAttachmentDelete({
      attachment,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      idempotencyKey: "delete-1",
    }),
    {
      status: "delete-authorized",
      attachmentId: "attachment-1",
      storageKeys: [attachment.storageKey, "preview-1"],
      clearMetadataAfterObjectDeletion: true,
      idempotencyKey: "delete-1",
    },
  );
  assert.deepEqual(
    decideExpandedAttachmentDelete({
      attachment: {
        ...attachment,
        derivedPreviewKeys: [attachment.storageKey],
      },
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "ADULT",
      idempotencyKey: "delete-duplicate-key",
    }),
    { status: "unavailable" },
  );
});

test("property and account cleanup cover every object and ledger", () => {
  assert.deepEqual(decideExpandedAttachmentCleanup("PROPERTY"), {
    deleteOriginalObjects: true,
    deleteDerivedPreviews: true,
    deleteQuarantineObjects: true,
    deleteRelationalMetadata: true,
    invalidateAuthorisedDownloads: true,
    requireRetryableCleanupLedger: true,
  });
});
