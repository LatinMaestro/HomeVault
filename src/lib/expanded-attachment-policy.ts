export const EXPANDED_ATTACHMENT_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const EXPANDED_ATTACHMENT_MAX_BYTES = 4_000_000;
export const EXPANDED_ATTACHMENT_MAX_COUNT = 10;
export const EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES = 20_000_000;
export const ATTACHMENT_QUARANTINE_TTL_MS = 24 * 60 * 60 * 1000;
export const ATTACHMENT_EVIDENCE_TTL_MS = 15 * 60 * 1000;

const HEIF_BRANDS = new Set([
  "heic",
  "heix",
  "hevc",
  "hevx",
  "heim",
  "heis",
  "hevm",
  "hevs",
  "mif1",
  "msf1",
]);

export type ExpandedAttachmentMediaType =
  (typeof EXPANDED_ATTACHMENT_MEDIA_TYPES)[number];
export type ExpandedAttachmentRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type AttachmentScanResult =
  | "CLEAN"
  | "MALICIOUS"
  | "ERROR"
  | "UNAVAILABLE";

export type VerifiedSessionEvidence = {
  sessionId: string;
  userId: string;
  verified: boolean;
  issuedAt: Date;
  expiresAt: Date;
};

export type PropertyMembershipEvidence = {
  userId: string;
  propertyId: string;
  role: ExpandedAttachmentRole;
  status: "ACTIVE" | "REVOKED";
  revision: number;
};

export type PrivateStorageEvidence = {
  provider: string;
  available: boolean;
  privateAccess: boolean;
  providerUrlsClientVisible: boolean;
};

export type ExpandedAttachment = {
  id: string;
  propertyId: string;
  documentId: string;
  documentRevision: number;
  revision: number;
  storageKey: string;
  fileName: string;
  mediaType: ExpandedAttachmentMediaType;
  sizeBytes: number;
  digest: string;
  position: number;
  status:
    | "QUARANTINED"
    | "AVAILABLE"
    | "REJECTED"
    | "DELETION_PENDING";
  uploadedAt: Date;
  quarantineExpiresAt: Date;
  signatureValid: boolean;
  metadataSanitized: boolean;
  safeDecodePassed: boolean;
  derivedPreviewKeys: readonly string[];
};

export type DocumentAttachmentEvidence = {
  id: string;
  propertyId: string;
  revision: number;
  status: "ACTIVE" | "DELETED";
};

export type AttachmentMutationProof = {
  proofId: string;
  purpose: "upload" | "reorder" | "delete";
  userId: string;
  propertyId: string;
  documentId: string;
  documentRevision: number;
  membershipRevision: number;
  requestId: string;
  contentDigest?: string;
  attachmentId?: string;
  attachmentRevision?: number;
  galleryRevision?: number;
  orderedIdsDigest?: string;
  singleUse: boolean;
  consumed: boolean;
  signatureValid: boolean;
  issuedAt: Date;
  expiresAt: Date;
};

export type AttachmentScanEvidence = {
  scanId: string;
  provider: string;
  attachmentId: string;
  propertyId: string;
  documentId: string;
  attachmentRevision: number;
  storageKey: string;
  contentDigest: string;
  sizeBytes: number;
  result: AttachmentScanResult;
  signatureValid: boolean;
  singleUse: boolean;
  consumed: boolean;
  issuedAt: Date;
  expiresAt: Date;
};

export type GalleryEvidence = {
  propertyId: string;
  documentId: string;
  documentRevision: number;
  galleryRevision: number;
  attachments: readonly ExpandedAttachment[];
};

export type AttachmentSlotDecision =
  | {
      status: "slot-authorized";
      propertyId: string;
      documentId: string;
      requestId: string;
      documentRevision: number;
      galleryRevision: number;
      initialStatus: "QUARANTINED";
      privateOnly: true;
      exposeProviderUrl: false;
      requireCompareAndSet: true;
      requireMalwareDecision: true;
    }
  | { status: "duplicate"; attachmentId: string }
  | { status: "gallery-full" }
  | {
      status: "invalid-file";
      reason: "type" | "extension" | "size" | "signature" | "digest";
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AttachmentScanDecision =
  | {
      status: "publish";
      attachmentId: string;
      expectedRevision: number;
      finalStatus: "AVAILABLE";
      privateOnly: true;
      requireCompareAndSet: true;
    }
  | {
      status: "quarantine";
      attachmentId: string;
      retryAllowed: boolean;
    }
  | {
      status: "reject-and-delete";
      attachmentId: string;
      expectedRevision: number;
      storageKeys: string[];
      requireCleanupLedger: true;
    }
  | { status: "unavailable" };

export type AttachmentReadDecision =
  | {
      status: "stream-authorized";
      attachmentId: string;
      expectedRevision: number;
      storageKey: string;
      noStore: true;
      exposeProviderUrl: false;
      disposition: "inline" | "attachment";
    }
  | { status: "not-found" }
  | { status: "unavailable" };

export type AttachmentReorderDecision =
  | {
      status: "reorder-authorized";
      orderedAttachmentIds: string[];
      expectedGalleryRevision: number;
      requireCompareAndSet: true;
    }
  | { status: "invalid-order" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AttachmentDeleteDecision =
  | {
      status: "delete-authorized";
      attachmentId: string;
      expectedRevision: number;
      storageKeys: string[];
      requestId: string;
      requireCompareAndSet: true;
      requireCleanupLedger: true;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ExpandedAttachmentCleanupEvent =
  | "ATTACHMENT_DELETED"
  | "DOCUMENT_DELETED"
  | "PROPERTY_DELETED"
  | "ACCOUNT_DELETED"
  | "UPLOAD_ABORTED"
  | "QUARANTINE_EXPIRED";

export type ExpandedAttachmentCleanupDecision =
  | {
      status: "cleanup-required";
      event: ExpandedAttachmentCleanupEvent;
      deleteOriginalObjects: true;
      deleteDerivedPreviews: true;
      deleteQuarantineObjects: true;
      deleteRelationalMetadata: true;
      invalidateAuthorisedDownloads: true;
      purgeOfflineCopies: true;
      revokePublicAndGuestShares: true;
      cancelOcrAiAndEmailJobs: true;
      requireRetryableCleanupLedger: true;
    }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validText(value: unknown, maximum = 200): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return (
    normalized === value &&
    normalized.length > 0 &&
    normalized.length <= maximum &&
    !/[\0\r\n]/.test(normalized)
  );
}

function validDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validRevision(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function exactTrue(value: unknown) {
  return value === true;
}

function digest64(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function isAllowedMediaType(
  value: unknown,
): value is ExpandedAttachmentMediaType {
  return (
    typeof value === "string" &&
    EXPANDED_ATTACHMENT_MEDIA_TYPES.includes(
      value as ExpandedAttachmentMediaType,
    )
  );
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function validSession(
  evidence: unknown,
  userId: string,
  now: Date,
): evidence is VerifiedSessionEvidence {
  if (!isRecord(evidence)) return false;
  return (
    validText(evidence.sessionId) &&
    evidence.userId === userId &&
    exactTrue(evidence.verified) &&
    validDate(evidence.issuedAt) &&
    validDate(evidence.expiresAt) &&
    evidence.issuedAt.getTime() <= now.getTime() &&
    evidence.expiresAt.getTime() > now.getTime() &&
    evidence.expiresAt.getTime() > evidence.issuedAt.getTime()
  );
}

function validMembership(
  evidence: unknown,
  userId: string,
  propertyId: string,
): evidence is PropertyMembershipEvidence {
  if (!isRecord(evidence)) return false;
  return (
    evidence.userId === userId &&
    evidence.propertyId === propertyId &&
    evidence.status === "ACTIVE" &&
    ["OWNER", "ADULT", "CHILD", "GUEST"].includes(String(evidence.role)) &&
    validRevision(evidence.revision)
  );
}

function hasWriteRole(role: ExpandedAttachmentRole) {
  return role === "OWNER" || role === "ADULT";
}

function validStorage(evidence: unknown): evidence is PrivateStorageEvidence {
  if (!isRecord(evidence)) return false;
  return (
    validText(evidence.provider) &&
    exactTrue(evidence.available) &&
    exactTrue(evidence.privateAccess) &&
    evidence.providerUrlsClientVisible === false
  );
}

function validDocument(
  evidence: unknown,
  propertyId: string,
): evidence is DocumentAttachmentEvidence {
  if (!isRecord(evidence)) return false;
  return (
    validText(evidence.id) &&
    evidence.propertyId === propertyId &&
    evidence.status === "ACTIVE" &&
    validRevision(evidence.revision)
  );
}

function validProof({
  proof,
  purpose,
  userId,
  membership,
  document,
  requestId,
  now,
}: {
  proof: unknown;
  purpose: AttachmentMutationProof["purpose"];
  userId: string;
  membership: PropertyMembershipEvidence;
  document: DocumentAttachmentEvidence;
  requestId: string;
  now: Date;
}): boolean {
  if (!isRecord(proof)) return false;
  if (
    !validText(proof.proofId) ||
    proof.purpose !== purpose ||
    proof.userId !== userId ||
    proof.propertyId !== membership.propertyId ||
    proof.documentId !== document.id ||
    proof.documentRevision !== document.revision ||
    proof.membershipRevision !== membership.revision ||
    proof.requestId !== requestId ||
    !exactTrue(proof.singleUse) ||
    proof.consumed !== false ||
    !exactTrue(proof.signatureValid) ||
    !validDate(proof.issuedAt) ||
    !validDate(proof.expiresAt)
  ) {
    return false;
  }
  const ttl = proof.expiresAt.getTime() - proof.issuedAt.getTime();
  return (
    proof.issuedAt.getTime() <= now.getTime() &&
    proof.expiresAt.getTime() > now.getTime() &&
    ttl > 0 &&
    ttl <= ATTACHMENT_EVIDENCE_TTL_MS
  );
}

function validAttachment(
  value: unknown,
  propertyId?: string,
  documentId?: string,
): value is ExpandedAttachment {
  if (!isRecord(value)) return false;
  if (
    !validText(value.id) ||
    !validText(value.propertyId) ||
    !validText(value.documentId) ||
    !validRevision(value.documentRevision) ||
    !validRevision(value.revision) ||
    !validText(value.storageKey, 1_000) ||
    !validText(value.fileName, 255) ||
    !isAllowedMediaType(value.mediaType) ||
    !Number.isSafeInteger(value.sizeBytes) ||
    (value.sizeBytes as number) <= 0 ||
    (value.sizeBytes as number) > EXPANDED_ATTACHMENT_MAX_BYTES ||
    !digest64(value.digest) ||
    !Number.isSafeInteger(value.position) ||
    (value.position as number) < 0 ||
    !["QUARANTINED", "AVAILABLE", "REJECTED", "DELETION_PENDING"].includes(
      String(value.status),
    ) ||
    !validDate(value.uploadedAt) ||
    !validDate(value.quarantineExpiresAt) ||
    !Array.isArray(value.derivedPreviewKeys) ||
    value.derivedPreviewKeys.some((key) => !validText(key, 1_000))
  ) {
    return false;
  }
  if (
    new Set([value.storageKey, ...value.derivedPreviewKeys]).size !==
    value.derivedPreviewKeys.length + 1
  ) {
    return false;
  }
  return (
    (propertyId === undefined || value.propertyId === propertyId) &&
    (documentId === undefined || value.documentId === documentId)
  );
}

function expectedExtensions(mediaType: ExpandedAttachmentMediaType) {
  return {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/heic": ["heic"],
    "image/heif": ["heif"],
  }[mediaType];
}

function hasExpectedExtension(
  mediaType: ExpandedAttachmentMediaType,
  fileName: string,
) {
  if (
    !validText(fileName, 255) ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    return false;
  }
  const extension = fileName.split(".").pop()?.toLowerCase();
  return Boolean(extension && expectedExtensions(mediaType).includes(extension));
}

export function hasExpandedAttachmentSignature(
  mediaType: ExpandedAttachmentMediaType,
  bytes: Uint8Array,
) {
  if (!(bytes instanceof Uint8Array)) return false;
  if (mediaType === "application/pdf") {
    return bytes.length >= 5 && ascii(bytes, 0, 5) === "%PDF-";
  }
  if (mediaType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }
  if (mediaType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return (
      bytes.length >= signature.length &&
      signature.every((byte, index) => bytes[index] === byte)
    );
  }
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== "ftyp") return false;
  const boxSize =
    bytes[0] * 0x1000000 +
    bytes[1] * 0x10000 +
    bytes[2] * 0x100 +
    bytes[3];
  if (
    boxSize < 16 ||
    boxSize > bytes.length ||
    boxSize % 4 !== 0
  ) {
    return false;
  }
  const brands = [];
  brands.push(ascii(bytes, 8, 4));
  for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
    brands.push(ascii(bytes, offset, 4));
  }
  return brands.some((brand) => HEIF_BRANDS.has(brand));
}

export function decideExpandedAttachmentSlot({
  userId,
  propertyId,
  session,
  membership,
  document,
  storage,
  proof,
  requestId,
  gallery,
  mediaType,
  fileName,
  bytes,
  fileSizeBytes,
  digest,
  duplicateAttachment,
  now,
}: {
  userId: string;
  propertyId: string;
  session: unknown;
  membership: unknown;
  document: unknown;
  storage: unknown;
  proof: unknown;
  requestId: string;
  gallery: unknown;
  mediaType: unknown;
  fileName: string;
  bytes: Uint8Array;
  fileSizeBytes: number;
  digest: string;
  duplicateAttachment?: unknown;
  now: Date;
}): AttachmentSlotDecision {
  if (
    !validText(userId) ||
    !validText(propertyId) ||
    !validText(requestId) ||
    !validDate(now) ||
    !validSession(session, userId, now) ||
    !validMembership(membership, userId, propertyId) ||
    !validDocument(document, propertyId) ||
    !validStorage(storage) ||
    !isRecord(gallery) ||
    gallery.propertyId !== propertyId ||
    gallery.documentId !== document.id ||
    gallery.documentRevision !== document.revision ||
    !validRevision(gallery.galleryRevision) ||
    !Array.isArray(gallery.attachments) ||
    gallery.attachments.some(
      (attachment) =>
        !validAttachment(attachment, propertyId, document.id) ||
        attachment.documentRevision !== document.revision,
    ) ||
    new Set(gallery.attachments.map((item) => item.id)).size !==
      gallery.attachments.length ||
    gallery.attachments.length > EXPANDED_ATTACHMENT_MAX_COUNT ||
    !validProof({
      proof,
      purpose: "upload",
      userId,
      membership,
      document,
      requestId,
      now,
    })
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(membership.role)) return { status: "read-only" };
  if (!isAllowedMediaType(mediaType)) {
    return { status: "invalid-file", reason: "type" };
  }
  if (!hasExpectedExtension(mediaType, fileName)) {
    return { status: "invalid-file", reason: "extension" };
  }
  if (
    !Number.isSafeInteger(fileSizeBytes) ||
    fileSizeBytes <= 0 ||
    fileSizeBytes > EXPANDED_ATTACHMENT_MAX_BYTES ||
    fileSizeBytes !== bytes.length
  ) {
    return { status: "invalid-file", reason: "size" };
  }
  if (
    !digest64(digest) ||
    (proof as AttachmentMutationProof).contentDigest !== digest
  ) {
    return { status: "invalid-file", reason: "digest" };
  }
  if (!hasExpandedAttachmentSignature(mediaType, bytes)) {
    return { status: "invalid-file", reason: "signature" };
  }
  const currentTotal = gallery.attachments.reduce(
    (sum, item) => sum + item.sizeBytes,
    0,
  );
  if (!Number.isSafeInteger(currentTotal)) return { status: "unavailable" };
  if (duplicateAttachment !== undefined) {
    if (
      !validAttachment(duplicateAttachment, propertyId, document.id) ||
      duplicateAttachment.digest !== digest ||
      !["AVAILABLE", "QUARANTINED"].includes(duplicateAttachment.status) ||
      !gallery.attachments.some(
        (item) =>
          item.id === duplicateAttachment.id &&
          item.revision === duplicateAttachment.revision,
      )
    ) {
      return { status: "unavailable" };
    }
    return { status: "duplicate", attachmentId: duplicateAttachment.id };
  }
  if (
    gallery.attachments.length >= EXPANDED_ATTACHMENT_MAX_COUNT ||
    currentTotal + fileSizeBytes > EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES
  ) {
    return { status: "gallery-full" };
  }
  return {
    status: "slot-authorized",
    propertyId,
    documentId: document.id,
    requestId,
    documentRevision: document.revision,
    galleryRevision: gallery.galleryRevision,
    initialStatus: "QUARANTINED",
    privateOnly: true,
    exposeProviderUrl: false,
    requireCompareAndSet: true,
    requireMalwareDecision: true,
  };
}

export function decideAttachmentScan({
  attachment,
  evidence,
  approvedProvider,
  providerApproved,
  now,
}: {
  attachment: unknown;
  evidence: unknown;
  approvedProvider: string;
  providerApproved: unknown;
  now: Date;
}): AttachmentScanDecision {
  if (
    !validAttachment(attachment) ||
    attachment.status !== "QUARANTINED" ||
    !exactTrue(attachment.signatureValid) ||
    !exactTrue(attachment.metadataSanitized) ||
    !exactTrue(attachment.safeDecodePassed) ||
    !validText(approvedProvider) ||
    !exactTrue(providerApproved) ||
    !validDate(now) ||
    !isRecord(evidence) ||
    !validText(evidence.scanId) ||
    evidence.provider !== approvedProvider ||
    evidence.attachmentId !== attachment.id ||
    evidence.propertyId !== attachment.propertyId ||
    evidence.documentId !== attachment.documentId ||
    evidence.attachmentRevision !== attachment.revision ||
    evidence.storageKey !== attachment.storageKey ||
    evidence.contentDigest !== attachment.digest ||
    evidence.sizeBytes !== attachment.sizeBytes ||
    !["CLEAN", "MALICIOUS", "ERROR", "UNAVAILABLE"].includes(
      String(evidence.result),
    ) ||
    !exactTrue(evidence.signatureValid) ||
    !exactTrue(evidence.singleUse) ||
    evidence.consumed !== false ||
    !validDate(evidence.issuedAt) ||
    !validDate(evidence.expiresAt) ||
    !validDate(attachment.uploadedAt) ||
    !validDate(attachment.quarantineExpiresAt)
  ) {
    return { status: "unavailable" };
  }
  const evidenceTtl =
    evidence.expiresAt.getTime() - evidence.issuedAt.getTime();
  const quarantineTtl =
    attachment.quarantineExpiresAt.getTime() - attachment.uploadedAt.getTime();
  if (
    evidence.issuedAt.getTime() > now.getTime() ||
    evidence.expiresAt.getTime() <= now.getTime() ||
    evidenceTtl <= 0 ||
    evidenceTtl > ATTACHMENT_EVIDENCE_TTL_MS ||
    attachment.uploadedAt.getTime() > now.getTime() ||
    quarantineTtl <= 0 ||
    quarantineTtl > ATTACHMENT_QUARANTINE_TTL_MS
  ) {
    return { status: "unavailable" };
  }
  if (now.getTime() >= attachment.quarantineExpiresAt.getTime()) {
    return rejectionPlan(attachment);
  }
  if (evidence.result === "MALICIOUS") return rejectionPlan(attachment);
  if (evidence.result === "ERROR" || evidence.result === "UNAVAILABLE") {
    return {
      status: "quarantine",
      attachmentId: attachment.id,
      retryAllowed: evidence.result === "ERROR",
    };
  }
  return {
    status: "publish",
    attachmentId: attachment.id,
    expectedRevision: attachment.revision,
    finalStatus: "AVAILABLE",
    privateOnly: true,
    requireCompareAndSet: true,
  };
}

function rejectionPlan(
  attachment: ExpandedAttachment,
): AttachmentScanDecision {
  return {
    status: "reject-and-delete",
    attachmentId: attachment.id,
    expectedRevision: attachment.revision,
    storageKeys: [attachment.storageKey, ...attachment.derivedPreviewKeys],
    requireCleanupLedger: true,
  };
}

export function decideExpandedAttachmentRead({
  attachment,
  userId,
  propertyId,
  document,
  session,
  membership,
  disposition,
  now,
}: {
  attachment?: unknown;
  userId: string;
  propertyId: string;
  document: unknown;
  session: unknown;
  membership: unknown;
  disposition: unknown;
  now: Date;
}): AttachmentReadDecision {
  if (
    !validText(userId) ||
    !validText(propertyId) ||
    !validDate(now) ||
    !validSession(session, userId, now) ||
    !validMembership(membership, userId, propertyId) ||
    !validDocument(document, propertyId) ||
    (disposition !== "inline" && disposition !== "attachment")
  ) {
    return { status: "unavailable" };
  }
  if (
    !validAttachment(attachment, propertyId, document.id) ||
    attachment.documentRevision !== document.revision ||
    attachment.status !== "AVAILABLE" ||
    !exactTrue(attachment.signatureValid) ||
    !exactTrue(attachment.metadataSanitized) ||
    !exactTrue(attachment.safeDecodePassed)
  ) {
    return { status: "not-found" };
  }
  return {
    status: "stream-authorized",
    attachmentId: attachment.id,
    expectedRevision: attachment.revision,
    storageKey: attachment.storageKey,
    noStore: true,
    exposeProviderUrl: false,
    disposition,
  };
}

export function decideAttachmentReorder({
  gallery,
  userId,
  propertyId,
  document,
  session,
  membership,
  proof,
  requestId,
  orderedAttachmentIds,
  orderedIdsDigest,
  now,
}: {
  gallery: unknown;
  userId: string;
  propertyId: string;
  document: unknown;
  session: unknown;
  membership: unknown;
  proof: unknown;
  requestId: string;
  orderedAttachmentIds: readonly string[];
  orderedIdsDigest: string;
  now: Date;
}): AttachmentReorderDecision {
  if (
    !validText(userId) ||
    !validText(propertyId) ||
    !validText(requestId) ||
    !digest64(orderedIdsDigest) ||
    !validDate(now) ||
    !validSession(session, userId, now) ||
    !validMembership(membership, userId, propertyId) ||
    !validDocument(document, propertyId) ||
    !isRecord(gallery) ||
    gallery.propertyId !== propertyId ||
    gallery.documentId !== document.id ||
    gallery.documentRevision !== document.revision ||
    !validRevision(gallery.galleryRevision) ||
    !Array.isArray(gallery.attachments) ||
    gallery.attachments.length < 1 ||
    gallery.attachments.length > EXPANDED_ATTACHMENT_MAX_COUNT ||
    gallery.attachments.some(
      (attachment) =>
        !validAttachment(attachment, propertyId, document.id) ||
        attachment.documentRevision !== document.revision ||
        attachment.status !== "AVAILABLE",
    ) ||
    !Array.isArray(orderedAttachmentIds) ||
    orderedAttachmentIds.some((id) => !validText(id)) ||
    !validProof({
      proof,
      purpose: "reorder",
      userId,
      membership,
      document,
      requestId,
      now,
    }) ||
    (proof as AttachmentMutationProof).galleryRevision !==
      gallery.galleryRevision ||
    (proof as AttachmentMutationProof).orderedIdsDigest !== orderedIdsDigest
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(membership.role)) return { status: "read-only" };
  const currentIds = gallery.attachments.map((item) => item.id).sort();
  const proposedIds = [...orderedAttachmentIds].sort();
  if (
    new Set(currentIds).size !== currentIds.length ||
    new Set(orderedAttachmentIds).size !== orderedAttachmentIds.length ||
    currentIds.length !== proposedIds.length ||
    currentIds.some((id, index) => id !== proposedIds[index])
  ) {
    return { status: "invalid-order" };
  }
  return {
    status: "reorder-authorized",
    orderedAttachmentIds: [...orderedAttachmentIds],
    expectedGalleryRevision: gallery.galleryRevision,
    requireCompareAndSet: true,
  };
}

export function decideExpandedAttachmentDelete({
  attachment,
  userId,
  propertyId,
  document,
  session,
  membership,
  proof,
  requestId,
  now,
}: {
  attachment: unknown;
  userId: string;
  propertyId: string;
  document: unknown;
  session: unknown;
  membership: unknown;
  proof: unknown;
  requestId: string;
  now: Date;
}): AttachmentDeleteDecision {
  if (
    !validText(userId) ||
    !validText(propertyId) ||
    !validText(requestId) ||
    !validDate(now) ||
    !validSession(session, userId, now) ||
    !validMembership(membership, userId, propertyId) ||
    !validDocument(document, propertyId) ||
    !validAttachment(attachment, propertyId, document.id) ||
    attachment.documentRevision !== document.revision ||
    !validProof({
      proof,
      purpose: "delete",
      userId,
      membership,
      document,
      requestId,
      now,
    }) ||
    (proof as AttachmentMutationProof).attachmentId !== attachment.id ||
    (proof as AttachmentMutationProof).attachmentRevision !==
      attachment.revision
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(membership.role)) return { status: "read-only" };
  return {
    status: "delete-authorized",
    attachmentId: attachment.id,
    expectedRevision: attachment.revision,
    storageKeys: [attachment.storageKey, ...attachment.derivedPreviewKeys],
    requestId,
    requireCompareAndSet: true,
    requireCleanupLedger: true,
  };
}

export function decideExpandedAttachmentCleanup(
  event: unknown,
): ExpandedAttachmentCleanupDecision {
  const events: ExpandedAttachmentCleanupEvent[] = [
    "ATTACHMENT_DELETED",
    "DOCUMENT_DELETED",
    "PROPERTY_DELETED",
    "ACCOUNT_DELETED",
    "UPLOAD_ABORTED",
    "QUARANTINE_EXPIRED",
  ];
  if (!events.includes(event as ExpandedAttachmentCleanupEvent)) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-required",
    event: event as ExpandedAttachmentCleanupEvent,
    deleteOriginalObjects: true,
    deleteDerivedPreviews: true,
    deleteQuarantineObjects: true,
    deleteRelationalMetadata: true,
    invalidateAuthorisedDownloads: true,
    purgeOfflineCopies: true,
    revokePublicAndGuestShares: true,
    cancelOcrAiAndEmailJobs: true,
    requireRetryableCleanupLedger: true,
  };
}
