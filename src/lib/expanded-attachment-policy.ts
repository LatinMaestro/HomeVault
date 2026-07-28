export const EXPANDED_ATTACHMENT_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const HEIF_BRANDS = [
  "heic",
  "heix",
  "hevc",
  "hevx",
  "mif1",
  "msf1",
] as const;

export const ATTACHMENT_SCAN_RESULTS = [
  "CLEAN",
  "MALICIOUS",
  "ERROR",
  "UNAVAILABLE",
] as const;

export const EXPANDED_ATTACHMENT_MAX_BYTES = 4_000_000;
export const EXPANDED_ATTACHMENT_MAX_COUNT = 10;
export const EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES = 20_000_000;
export const ATTACHMENT_QUARANTINE_TTL_MS = 24 * 60 * 60 * 1000;

export type ExpandedAttachmentMediaType =
  (typeof EXPANDED_ATTACHMENT_MEDIA_TYPES)[number];
export type ExpandedAttachmentRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";
export type AttachmentScanResult = (typeof ATTACHMENT_SCAN_RESULTS)[number];

export type ExpandedAttachment = {
  id: string;
  homeId: string;
  documentId: string;
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
  derivedPreviewKeys: readonly string[];
};

export type AttachmentSlotDecision =
  | {
      status: "slot-authorized";
      homeId: string;
      documentId: string;
      idempotencyKey: string;
      initialStatus: "QUARANTINED";
      privateOnly: true;
      exposeProviderUrl: false;
      requireServerSignatureValidation: true;
      requireMetadataSanitization: true;
      requireMalwareDecision: true;
    }
  | { status: "duplicate"; attachmentId: string }
  | { status: "gallery-full" }
  | {
      status: "invalid-file";
      reason: "type" | "extension" | "size" | "signature";
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AttachmentScanDecision =
  | {
      status: "publish";
      attachmentId: string;
      finalStatus: "AVAILABLE";
      privateOnly: true;
    }
  | {
      status: "quarantine";
      attachmentId: string;
      retryAllowed: boolean;
    }
  | {
      status: "reject-and-delete";
      attachmentId: string;
      deleteOriginal: true;
      deleteDerivedPreviews: true;
    }
  | { status: "unavailable" };

export type AttachmentReadDecision =
  | {
      status: "stream-authorized";
      attachmentId: string;
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
      requireAtomicUpdate: true;
    }
  | { status: "invalid-order" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type AttachmentDeleteDecision =
  | {
      status: "delete-authorized";
      attachmentId: string;
      storageKeys: string[];
      clearMetadataAfterObjectDeletion: true;
      idempotencyKey: string;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type ExpandedAttachmentCleanupScope =
  | "ATTACHMENT"
  | "DOCUMENT"
  | "PROPERTY"
  | "ACCOUNT";

export type ExpandedAttachmentCleanupDecision = {
  deleteOriginalObjects: true;
  deleteDerivedPreviews: true;
  deleteQuarantineObjects: true;
  deleteRelationalMetadata: true;
  invalidateAuthorisedDownloads: true;
  requireRetryableCleanupLedger: true;
};

function hasWriteRole(role: ExpandedAttachmentRole) {
  return role === "OWNER" || role === "ADULT";
}

function validText(value: string, maximum: number) {
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

function isAllowedMediaType(
  value: string,
): value is ExpandedAttachmentMediaType {
  return EXPANDED_ATTACHMENT_MEDIA_TYPES.includes(
    value as ExpandedAttachmentMediaType,
  );
}

function hasExpectedExtension(
  mediaType: ExpandedAttachmentMediaType,
  fileName: string,
) {
  if (
    !fileName ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName.includes("\0")
  ) {
    return false;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const accepted: Record<ExpandedAttachmentMediaType, readonly string[]> = {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/heic": ["heic"],
    "image/heif": ["heif"],
  };
  return Boolean(extension && accepted[mediaType].includes(extension));
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function hasExpandedAttachmentSignature(
  mediaType: ExpandedAttachmentMediaType,
  bytes: Uint8Array,
) {
  if (mediaType === "application/pdf") {
    return ascii(bytes, 0, 5) === "%PDF-";
  }

  if (mediaType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mediaType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (bytes.length < 12 || ascii(bytes, 4, 4) !== "ftyp") {
    return false;
  }

  const brand = ascii(bytes, 8, 4);
  return HEIF_BRANDS.includes(brand as (typeof HEIF_BRANDS)[number]);
}

export function decideExpandedAttachmentSlot({
  currentUserId,
  selectedHomeId,
  documentHomeId,
  documentId,
  sessionVerified,
  hasCurrentMembership,
  role,
  privateStorageAvailable,
  mediaType,
  fileName,
  bytes,
  fileSizeBytes,
  currentCount,
  currentTotalBytes,
  digest,
  duplicateAttachment,
  idempotencyKey,
}: {
  currentUserId: string;
  selectedHomeId: string;
  documentHomeId: string;
  documentId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ExpandedAttachmentRole;
  privateStorageAvailable: boolean;
  mediaType: string;
  fileName: string;
  bytes: Uint8Array;
  fileSizeBytes: number;
  currentCount: number;
  currentTotalBytes: number;
  digest: string;
  duplicateAttachment?: Pick<
    ExpandedAttachment,
    "id" | "homeId" | "documentId" | "digest" | "status"
  >;
  idempotencyKey: string;
}): AttachmentSlotDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validText(documentId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !privateStorageAvailable ||
    !/^[a-f0-9]{64}$/.test(digest) ||
    !validText(idempotencyKey, 200) ||
    documentHomeId !== selectedHomeId ||
    !Number.isSafeInteger(fileSizeBytes) ||
    !Number.isSafeInteger(currentCount) ||
    !Number.isSafeInteger(currentTotalBytes) ||
    currentCount < 0 ||
    currentTotalBytes < 0 ||
    !Number.isSafeInteger(currentTotalBytes + fileSizeBytes)
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (!isAllowedMediaType(mediaType)) {
    return { status: "invalid-file", reason: "type" };
  }

  if (!hasExpectedExtension(mediaType, fileName)) {
    return { status: "invalid-file", reason: "extension" };
  }

  if (
    fileSizeBytes <= 0 ||
    fileSizeBytes > EXPANDED_ATTACHMENT_MAX_BYTES
  ) {
    return { status: "invalid-file", reason: "size" };
  }

  if (!hasExpandedAttachmentSignature(mediaType, bytes)) {
    return { status: "invalid-file", reason: "signature" };
  }

  if (duplicateAttachment) {
    if (
      !validText(duplicateAttachment.id, 200) ||
      duplicateAttachment.homeId !== selectedHomeId ||
      duplicateAttachment.documentId !== documentId ||
      duplicateAttachment.digest !== digest ||
      (duplicateAttachment.status !== "AVAILABLE" &&
        duplicateAttachment.status !== "QUARANTINED")
    ) {
      return { status: "unavailable" };
    }
    return { status: "duplicate", attachmentId: duplicateAttachment.id };
  }

  if (
    currentCount >= EXPANDED_ATTACHMENT_MAX_COUNT ||
    currentTotalBytes + fileSizeBytes >
      EXPANDED_ATTACHMENT_MAX_TOTAL_BYTES
  ) {
    return { status: "gallery-full" };
  }

  return {
    status: "slot-authorized",
    homeId: selectedHomeId,
    documentId,
    idempotencyKey,
    initialStatus: "QUARANTINED",
    privateOnly: true,
    exposeProviderUrl: false,
    requireServerSignatureValidation: true,
    requireMetadataSanitization: true,
    requireMalwareDecision: true,
  };
}

export function decideAttachmentScan({
  attachment,
  result,
  scannerConfigured,
  now,
}: {
  attachment: ExpandedAttachment;
  result: AttachmentScanResult;
  scannerConfigured: boolean;
  now: Date;
}): AttachmentScanDecision {
  if (
    !validText(attachment.id, 200) ||
    !validText(attachment.storageKey, 1_000) ||
    attachment.status !== "QUARANTINED" ||
    !attachment.signatureValid ||
    !attachment.metadataSanitized ||
    !validDate(now) ||
    !validDate(attachment.uploadedAt) ||
    !validDate(attachment.quarantineExpiresAt) ||
    !ATTACHMENT_SCAN_RESULTS.includes(result) ||
    attachment.derivedPreviewKeys.some(
      (key) => !validText(key, 1_000),
    ) ||
    new Set(attachment.derivedPreviewKeys).size !==
      attachment.derivedPreviewKeys.length ||
    attachment.quarantineExpiresAt.getTime() <=
      attachment.uploadedAt.getTime() ||
    now.getTime() < attachment.uploadedAt.getTime() ||
    attachment.quarantineExpiresAt.getTime() -
      attachment.uploadedAt.getTime() >
      ATTACHMENT_QUARANTINE_TTL_MS
  ) {
    return { status: "unavailable" };
  }

  if (now.getTime() >= attachment.quarantineExpiresAt.getTime()) {
    return {
      status: "reject-and-delete",
      attachmentId: attachment.id,
      deleteOriginal: true,
      deleteDerivedPreviews: true,
    };
  }

  if (!scannerConfigured || result === "UNAVAILABLE" || result === "ERROR") {
    return {
      status: "quarantine",
      attachmentId: attachment.id,
      retryAllowed: scannerConfigured && result === "ERROR",
    };
  }

  if (result === "MALICIOUS") {
    return {
      status: "reject-and-delete",
      attachmentId: attachment.id,
      deleteOriginal: true,
      deleteDerivedPreviews: true,
    };
  }

  return {
    status: "publish",
    attachmentId: attachment.id,
    finalStatus: "AVAILABLE",
    privateOnly: true,
  };
}

export function decideExpandedAttachmentRead({
  attachment,
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  disposition,
}: {
  attachment?: ExpandedAttachment;
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  disposition: "inline" | "attachment";
}): AttachmentReadDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !["inline", "attachment"].includes(disposition)
  ) {
    return { status: "unavailable" };
  }

  if (
    !attachment ||
    attachment.homeId !== selectedHomeId ||
    attachment.status !== "AVAILABLE" ||
    !validText(attachment.id, 200) ||
    !validText(attachment.storageKey, 1_000) ||
    !attachment.signatureValid ||
    !attachment.metadataSanitized
  ) {
    return { status: "not-found" };
  }

  return {
    status: "stream-authorized",
    attachmentId: attachment.id,
    storageKey: attachment.storageKey,
    noStore: true,
    exposeProviderUrl: false,
    disposition,
  };
}

export function decideAttachmentReorder({
  attachments,
  currentUserId,
  selectedHomeId,
  documentId,
  sessionVerified,
  hasCurrentMembership,
  role,
  orderedAttachmentIds,
}: {
  attachments: readonly ExpandedAttachment[];
  currentUserId: string;
  selectedHomeId: string;
  documentId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ExpandedAttachmentRole;
  orderedAttachmentIds: readonly string[];
}): AttachmentReorderDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !validText(documentId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    attachments.length < 1 ||
    attachments.length > EXPANDED_ATTACHMENT_MAX_COUNT ||
    new Set(attachments.map((attachment) => attachment.id)).size !==
      attachments.length ||
    attachments.some(
      (attachment) =>
        !validText(attachment.id, 200) ||
        attachment.homeId !== selectedHomeId ||
        attachment.documentId !== documentId ||
        attachment.status !== "AVAILABLE",
    )
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  const currentIds = attachments.map((attachment) => attachment.id).sort();
  const proposedIds = [...orderedAttachmentIds].sort();
  if (
    currentIds.length !== proposedIds.length ||
    new Set(orderedAttachmentIds).size !== orderedAttachmentIds.length ||
    currentIds.some((id, index) => id !== proposedIds[index])
  ) {
    return { status: "invalid-order" };
  }

  return {
    status: "reorder-authorized",
    orderedAttachmentIds: [...orderedAttachmentIds],
    requireAtomicUpdate: true,
  };
}

export function decideExpandedAttachmentDelete({
  attachment,
  currentUserId,
  selectedHomeId,
  sessionVerified,
  hasCurrentMembership,
  role,
  idempotencyKey,
}: {
  attachment: ExpandedAttachment;
  currentUserId: string;
  selectedHomeId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: ExpandedAttachmentRole;
  idempotencyKey: string;
}): AttachmentDeleteDecision {
  if (
    !validText(currentUserId, 200) ||
    !validText(selectedHomeId, 200) ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !validText(idempotencyKey, 200) ||
    attachment.homeId !== selectedHomeId ||
    !validText(attachment.id, 200) ||
    !validText(attachment.storageKey, 1_000) ||
    attachment.derivedPreviewKeys.some(
      (key) => !validText(key, 1_000),
    ) ||
    new Set([
      attachment.storageKey,
      ...attachment.derivedPreviewKeys,
    ]).size !==
      attachment.derivedPreviewKeys.length + 1
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  return {
    status: "delete-authorized",
    attachmentId: attachment.id,
    storageKeys: [
      attachment.storageKey,
      ...attachment.derivedPreviewKeys,
    ],
    clearMetadataAfterObjectDeletion: true,
    idempotencyKey,
  };
}

export function decideExpandedAttachmentCleanup(
  _scope: ExpandedAttachmentCleanupScope,
): ExpandedAttachmentCleanupDecision {
  return {
    deleteOriginalObjects: true,
    deleteDerivedPreviews: true,
    deleteQuarantineObjects: true,
    deleteRelationalMetadata: true,
    invalidateAuthorisedDownloads: true,
    requireRetryableCleanupLedger: true,
  };
}
