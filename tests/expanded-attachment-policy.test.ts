import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPANDED_ATTACHMENT_MAX_BYTES,
  decideAttachmentReorder,
  decideAttachmentScan,
  decideExpandedAttachmentCleanup,
  decideExpandedAttachmentDelete,
  decideExpandedAttachmentRead,
  decideExpandedAttachmentSlot,
  hasExpandedAttachmentSignature,
  type AttachmentMutationProof,
  type AttachmentScanEvidence,
  type DocumentAttachmentEvidence,
  type ExpandedAttachment,
  type GalleryEvidence,
  type PrivateStorageEvidence,
  type PropertyMembershipEvidence,
  type VerifiedSessionEvidence,
} from "../src/lib/expanded-attachment-policy";

const now = new Date("2026-07-29T10:00:00.000Z");
const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const heicBytes = new Uint8Array([
  0x00, 0x00, 0x00, 0x10,
  0x66, 0x74, 0x79, 0x70,
  0x68, 0x65, 0x69, 0x63,
  0x00, 0x00, 0x00, 0x00,
]);

const session: VerifiedSessionEvidence = {
  sessionId: "session-1",
  userId: "user-1",
  verified: true,
  issuedAt: new Date("2026-07-29T09:00:00.000Z"),
  expiresAt: new Date("2026-07-29T11:00:00.000Z"),
};

const membership: PropertyMembershipEvidence = {
  userId: "user-1",
  propertyId: "property-1",
  role: "OWNER",
  status: "ACTIVE",
  revision: 4,
};

const document: DocumentAttachmentEvidence = {
  id: "document-1",
  propertyId: "property-1",
  revision: 7,
  status: "ACTIVE",
};

const storage: PrivateStorageEvidence = {
  provider: "approved-private-store",
  available: true,
  privateAccess: true,
  providerUrlsClientVisible: false,
};

const attachment: ExpandedAttachment = {
  id: "attachment-1",
  propertyId: "property-1",
  documentId: "document-1",
  documentRevision: 7,
  revision: 3,
  storageKey: "properties/property-1/documents/document-1/file.pdf",
  fileName: "fictional-manual.pdf",
  mediaType: "application/pdf",
  sizeBytes: 5,
  digest: "a".repeat(64),
  position: 0,
  status: "QUARANTINED",
  uploadedAt: new Date("2026-07-29T09:30:00.000Z"),
  quarantineExpiresAt: new Date("2026-07-30T09:30:00.000Z"),
  signatureValid: true,
  metadataSanitized: true,
  safeDecodePassed: true,
  derivedPreviewKeys: ["preview-1"],
};

const gallery: GalleryEvidence = {
  propertyId: "property-1",
  documentId: "document-1",
  documentRevision: 7,
  galleryRevision: 2,
  attachments: [],
};

function proof(
  purpose: AttachmentMutationProof["purpose"],
  overrides: Partial<AttachmentMutationProof> = {},
): AttachmentMutationProof {
  return {
    proofId: `${purpose}-proof`,
    purpose,
    userId: "user-1",
    propertyId: "property-1",
    documentId: "document-1",
    documentRevision: 7,
    membershipRevision: 4,
    requestId: `${purpose}-request`,
    singleUse: true,
    consumed: false,
    signatureValid: true,
    issuedAt: new Date("2026-07-29T09:55:00.000Z"),
    expiresAt: new Date("2026-07-29T10:05:00.000Z"),
    ...overrides,
  };
}

function uploadInput(overrides: Record<string, unknown> = {}) {
  return {
    userId: "user-1",
    propertyId: "property-1",
    session,
    membership,
    document,
    storage,
    proof: proof("upload", {
      requestId: "upload-request",
      contentDigest: "a".repeat(64),
    }),
    requestId: "upload-request",
    gallery,
    mediaType: "application/pdf",
    fileName: "manual.pdf",
    bytes: pdfBytes,
    fileSizeBytes: pdfBytes.length,
    digest: "a".repeat(64),
    now,
    ...overrides,
  };
}

function scanEvidence(
  overrides: Partial<AttachmentScanEvidence> = {},
): AttachmentScanEvidence {
  return {
    scanId: "scan-1",
    provider: "approved-scanner",
    attachmentId: "attachment-1",
    propertyId: "property-1",
    documentId: "document-1",
    attachmentRevision: 3,
    storageKey: attachment.storageKey,
    contentDigest: attachment.digest,
    sizeBytes: attachment.sizeBytes,
    result: "CLEAN",
    signatureValid: true,
    singleUse: true,
    consumed: false,
    issuedAt: new Date("2026-07-29T09:55:00.000Z"),
    expiresAt: new Date("2026-07-29T10:05:00.000Z"),
    ...overrides,
  };
}

test("recognises bounded PDF, JPEG, PNG and HEIF family signatures", () => {
  assert.equal(hasExpandedAttachmentSignature("application/pdf", pdfBytes), true);
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
});

test("rejects truncated and malformed HEIF containers", () => {
  assert.equal(
    hasExpandedAttachmentSignature("image/heic", heicBytes.slice(0, 12)),
    false,
  );
  assert.equal(
    hasExpandedAttachmentSignature(
      "image/heic",
      new Uint8Array([0, 0, 0, 24, ...heicBytes.slice(4)]),
    ),
    false,
  );
});

test("authorizes a bound private upload with compare-and-set revisions", () => {
  assert.deepEqual(decideExpandedAttachmentSlot(uploadInput()), {
    status: "slot-authorized",
    propertyId: "property-1",
    documentId: "document-1",
    requestId: "upload-request",
    documentRevision: 7,
    galleryRevision: 2,
    initialStatus: "QUARANTINED",
    privateOnly: true,
    exposeProviderUrl: false,
    requireCompareAndSet: true,
    requireMalwareDecision: true,
  });
});

test("truthy substitutes never satisfy session, storage or proof evidence", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ session: { ...session, verified: 1 } }),
    ),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ storage: { ...storage, privateAccess: "yes" } }),
    ),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({
        proof: {
          ...proof("upload", {
            requestId: "upload-request",
            contentDigest: "a".repeat(64),
          }),
          signatureValid: 1,
        },
      }),
    ),
    { status: "unavailable" },
  );
});

test("proof replay, expiry and identity or property substitution fail closed", () => {
  const base = proof("upload", {
    requestId: "upload-request",
    contentDigest: "a".repeat(64),
  });
  for (const changed of [
    { consumed: true },
    { userId: "user-2" },
    { propertyId: "property-2" },
    { membershipRevision: 3 },
    { expiresAt: now },
  ]) {
    assert.deepEqual(
      decideExpandedAttachmentSlot(
        uploadInput({ proof: { ...base, ...changed } }),
      ),
      { status: "unavailable" },
    );
  }
});

test("role is derived from exact membership and read-only roles cannot upload", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ membership: { ...membership, role: "GUEST" } }),
    ),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ membership: { ...membership, propertyId: "property-2" } }),
    ),
    { status: "unavailable" },
  );
});

test("filename, byte count, digest and observed signature all bind the file", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot(uploadInput({ fileName: "manual.jpg" })),
    { status: "invalid-file", reason: "extension" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(uploadInput({ fileSizeBytes: 6 })),
    { status: "invalid-file", reason: "size" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({
        digest: "b".repeat(64),
      }),
    ),
    { status: "invalid-file", reason: "digest" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ bytes: new Uint8Array([0, 0, 0, 0, 0]) }),
    ),
    { status: "invalid-file", reason: "signature" },
  );
});

test("oversized files and inconsistent gallery totals fail closed", () => {
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({ fileSizeBytes: EXPANDED_ATTACHMENT_MAX_BYTES + 1 }),
    ),
    { status: "invalid-file", reason: "size" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({
        gallery: {
          ...gallery,
          attachments: [{ ...attachment, sizeBytes: Number.MAX_SAFE_INTEGER }],
        },
      }),
    ),
    { status: "unavailable" },
  );
});

test("deduplication is limited to the exact current document gallery", () => {
  const duplicateGallery = { ...gallery, attachments: [attachment] };
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({
        gallery: duplicateGallery,
        duplicateAttachment: attachment,
      }),
    ),
    { status: "duplicate", attachmentId: "attachment-1" },
  );
  assert.deepEqual(
    decideExpandedAttachmentSlot(
      uploadInput({
        gallery: duplicateGallery,
        duplicateAttachment: { ...attachment, propertyId: "property-2" },
      }),
    ),
    { status: "unavailable" },
  );
});

test("publishes only exact clean approved-provider scan evidence", () => {
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      evidence: scanEvidence(),
      approvedProvider: "approved-scanner",
      providerApproved: true,
      now,
    }),
    {
      status: "publish",
      attachmentId: "attachment-1",
      expectedRevision: 3,
      finalStatus: "AVAILABLE",
      privateOnly: true,
      requireCompareAndSet: true,
    },
  );
});

test("scan evidence substitution, replay and unapproved providers fail closed", () => {
  for (const evidence of [
    scanEvidence({ contentDigest: "b".repeat(64) }),
    scanEvidence({ attachmentRevision: 2 }),
    scanEvidence({ consumed: true }),
    scanEvidence({ signatureValid: false }),
  ]) {
    assert.deepEqual(
      decideAttachmentScan({
        attachment,
        evidence,
        approvedProvider: "approved-scanner",
        providerApproved: true,
        now,
      }),
      { status: "unavailable" },
    );
  }
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      evidence: scanEvidence(),
      approvedProvider: "approved-scanner",
      providerApproved: "yes",
      now,
    }),
    { status: "unavailable" },
  );
});

test("safe decode and metadata sanitization are mandatory", () => {
  for (const changed of [
    { safeDecodePassed: false },
    { metadataSanitized: false },
    { signatureValid: false },
  ]) {
    assert.deepEqual(
      decideAttachmentScan({
        attachment: { ...attachment, ...changed },
        evidence: scanEvidence(),
        approvedProvider: "approved-scanner",
        providerApproved: true,
        now,
      }),
      { status: "unavailable" },
    );
  }
});

test("malicious scans delete all exact private derivatives through a ledger", () => {
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      evidence: scanEvidence({ result: "MALICIOUS" }),
      approvedProvider: "approved-scanner",
      providerApproved: true,
      now,
    }),
    {
      status: "reject-and-delete",
      attachmentId: "attachment-1",
      expectedRevision: 3,
      storageKeys: [attachment.storageKey, "preview-1"],
      requireCleanupLedger: true,
    },
  );
});

test("scanner errors stay quarantined and never become available", () => {
  assert.deepEqual(
    decideAttachmentScan({
      attachment,
      evidence: scanEvidence({ result: "ERROR" }),
      approvedProvider: "approved-scanner",
      providerApproved: true,
      now,
    }),
    {
      status: "quarantine",
      attachmentId: "attachment-1",
      retryAllowed: true,
    },
  );
});

test("reads repeat exact current session, membership and document evidence", () => {
  assert.deepEqual(
    decideExpandedAttachmentRead({
      attachment: { ...attachment, status: "AVAILABLE" },
      userId: "user-1",
      propertyId: "property-1",
      document,
      session,
      membership,
      disposition: "inline",
      now,
    }),
    {
      status: "stream-authorized",
      attachmentId: "attachment-1",
      expectedRevision: 3,
      storageKey: attachment.storageKey,
      noStore: true,
      exposeProviderUrl: false,
      disposition: "inline",
    },
  );
  assert.deepEqual(
    decideExpandedAttachmentRead({
      attachment: { ...attachment, status: "AVAILABLE" },
      userId: "user-1",
      propertyId: "property-1",
      document: { ...document, revision: 8 },
      session,
      membership,
      disposition: "inline",
      now,
    }),
    { status: "not-found" },
  );
});

test("quarantined, rejected and malformed attachments are non-revealing", () => {
  for (const candidate of [
    attachment,
    { ...attachment, status: "REJECTED" },
    { ...attachment, derivedPreviewKeys: [attachment.storageKey] },
  ]) {
    assert.deepEqual(
      decideExpandedAttachmentRead({
        attachment: candidate,
        userId: "user-1",
        propertyId: "property-1",
        document,
        session,
        membership,
        disposition: "attachment",
        now,
      }),
      { status: "not-found" },
    );
  }
});

test("reordering binds the exact complete set, digest and gallery revision", () => {
  const second = {
    ...attachment,
    id: "attachment-2",
    revision: 1,
    storageKey: "attachment-2",
    digest: "b".repeat(64),
    position: 1,
    status: "AVAILABLE" as const,
  };
  const reorderGallery = {
    ...gallery,
    attachments: [
      { ...attachment, status: "AVAILABLE" as const },
      second,
    ],
  };
  const reorderProof = proof("reorder", {
    requestId: "reorder-request",
    galleryRevision: 2,
    orderedIdsDigest: "c".repeat(64),
  });
  const input = {
    gallery: reorderGallery,
    userId: "user-1",
    propertyId: "property-1",
    document,
    session,
    membership,
    proof: reorderProof,
    requestId: "reorder-request",
    orderedAttachmentIds: ["attachment-2", "attachment-1"],
    orderedIdsDigest: "c".repeat(64),
    now,
  };
  assert.deepEqual(decideAttachmentReorder(input), {
    status: "reorder-authorized",
    orderedAttachmentIds: ["attachment-2", "attachment-1"],
    expectedGalleryRevision: 2,
    requireCompareAndSet: true,
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
      proof: { ...reorderProof, galleryRevision: 1 },
    }),
    { status: "unavailable" },
  );
});

test("deletion binds exact attachment and document revisions", () => {
  const deletionProof = proof("delete", {
    requestId: "delete-request",
    attachmentId: "attachment-1",
    attachmentRevision: 3,
  });
  const input = {
    attachment,
    userId: "user-1",
    propertyId: "property-1",
    document,
    session,
    membership,
    proof: deletionProof,
    requestId: "delete-request",
    now,
  };
  assert.deepEqual(decideExpandedAttachmentDelete(input), {
    status: "delete-authorized",
    attachmentId: "attachment-1",
    expectedRevision: 3,
    storageKeys: [attachment.storageKey, "preview-1"],
    requestId: "delete-request",
    requireCompareAndSet: true,
    requireCleanupLedger: true,
  });
  assert.deepEqual(
    decideExpandedAttachmentDelete({
      ...input,
      proof: { ...deletionProof, attachmentRevision: 2 },
    }),
    { status: "unavailable" },
  );
});

test("cleanup covers processors, shares and encrypted device copies", () => {
  assert.deepEqual(decideExpandedAttachmentCleanup("PROPERTY_DELETED"), {
    status: "cleanup-required",
    event: "PROPERTY_DELETED",
    deleteOriginalObjects: true,
    deleteDerivedPreviews: true,
    deleteQuarantineObjects: true,
    deleteRelationalMetadata: true,
    invalidateAuthorisedDownloads: true,
    purgeOfflineCopies: true,
    revokePublicAndGuestShares: true,
    cancelOcrAiAndEmailJobs: true,
    requireRetryableCleanupLedger: true,
  });
});

test("unknown cleanup events fail closed", () => {
  assert.deepEqual(decideExpandedAttachmentCleanup("UNKNOWN"), {
    status: "unavailable",
  });
});
