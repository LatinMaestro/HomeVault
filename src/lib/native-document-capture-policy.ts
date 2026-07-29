export const NATIVE_CAPTURE_SOURCES = [
  "CAMERA",
  "DOCUMENT_SCANNER",
  "FILE_IMPORT",
] as const;

export const CAPTURE_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const CAPTURE_ROLES = ["OWNER", "ADULT", "CHILD", "GUEST"] as const;
export const CAPTURE_PLATFORMS = ["IOS", "ANDROID"] as const;
export const CAPTURE_RECORD_TYPES = [
  "DOCUMENT",
  "RECEIPT",
  "WARRANTY",
] as const;

export const CAPTURE_MAX_BYTES = 4_000_000;
export const CAPTURE_MAX_DRAFT_TTL_MINUTES = 60;
export const CAPTURE_MAX_EVIDENCE_TTL_MINUTES = 15;

const MAX_IDENTIFIER_LENGTH = 128;
const MAX_FILE_NAME_LENGTH = 128;
const MIN_OPAQUE_KEY_LENGTH = 32;
const MAX_OPAQUE_KEY_LENGTH = 256;

export type NativeCaptureSource = (typeof NATIVE_CAPTURE_SOURCES)[number];
export type CaptureMediaType = (typeof CAPTURE_MEDIA_TYPES)[number];
export type CaptureRole = (typeof CAPTURE_ROLES)[number];
export type CapturePlatform = (typeof CAPTURE_PLATFORMS)[number];
export type CaptureRecordType = (typeof CAPTURE_RECORD_TYPES)[number];

export type CaptureSessionEvidence = {
  id: string;
  userId: string;
  verified: boolean;
  expiresAt: Date;
};

export type CaptureMembershipEvidence = {
  id: string;
  userId: string;
  homeId: string;
  role: CaptureRole;
  active: boolean;
};

export type CaptureInitiationEvidence = {
  id: string;
  userId: string;
  homeId: string;
  installationId: string;
  source: NativeCaptureSource;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type CaptureCapabilityEvidence = {
  platform: CapturePlatform;
  source: NativeCaptureSource;
  supported: boolean;
  cameraPermissionState:
    | "GRANTED"
    | "NOT_DETERMINED"
    | "DENIED"
    | "RESTRICTED"
    | "NOT_APPLICABLE";
  appSandboxProtected: boolean;
  photoLibraryWriteDisabled: boolean;
  broadMediaPermissionAbsent: boolean;
};

export type CaptureStartDecision =
  | {
      status: "capture-allowed";
      plan: {
        userId: string;
        homeId: string;
        membershipId: string;
        installationId: string;
        platform: CapturePlatform;
        source: NativeCaptureSource;
        requiredPermission: "CAMERA" | "NONE";
        temporaryStorage: "PROTECTED_APP_SANDBOX";
        initiationEvidenceId: string;
        consumeInitiationEvidence: true;
        saveToPhotoLibrary: false;
        expectedDraftAbsent: true;
      };
    }
  | {
      status: "permission-required";
      plan: {
        permission: "CAMERA";
        initiationEvidenceId: string;
        requestOnlyAfterUserAction: true;
        requestNoUnrelatedPermission: true;
      };
    }
  | {
      status: "permission-denied";
      settingsRecoveryAvailable: boolean;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type NativeCaptureDraft = {
  id: string;
  version: number;
  captureSessionId: string;
  userId: string;
  homeId: string;
  installationId: string;
  source: NativeCaptureSource;
  localAssetId: string;
  fileName: string;
  mediaType: CaptureMediaType;
  sizeBytes: number;
  contentDigest: string;
  originalContentDigest: string;
  pageCount: number;
  pixelWidth: number | null;
  pixelHeight: number | null;
  signatureValid: boolean;
  metadataSanitized: boolean;
  locationMetadataRemoved: boolean;
  orientationNormalized: boolean;
  activeContentAbsent: boolean;
  encryptedContentAbsent: boolean;
  status:
    | "PENDING_REVIEW"
    | "APPROVED"
    | "RETAKE_REQUESTED"
    | "CANCELLED"
    | "UPLOADED";
  createdAt: Date;
  expiresAt: Date;
};

export type CaptureReviewAction = "APPROVE" | "RETAKE" | "CANCEL";

export type CaptureReviewDecision =
  | {
      status: "approved";
      plan: {
        draftId: string;
        expectedDraftVersion: number;
        expectedStatus: "PENDING_REVIEW";
        localAssetId: string;
        contentDigest: string;
        originalContentDigest: string;
        approvedMediaType: CaptureMediaType;
        approvedSizeBytes: number;
        deleteOriginalAfterSanitizedReplacement: boolean;
      };
    }
  | {
      status: "retake" | "cancelled";
      plan: {
        draftId: string;
        expectedDraftVersion: number;
        expectedStatus: "PENDING_REVIEW";
        localAssetId: string;
        deleteLocalAsset: true;
      };
    }
  | {
      status: "invalid-capture";
      reason:
        | "EMPTY"
        | "TOO_LARGE"
        | "UNVERIFIED_FORMAT"
        | "PRIVACY_PROCESSING_INCOMPLETE"
        | "UNSAFE_CONTENT"
        | "INVALID_DIMENSIONS";
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type CaptureReviewEvidence = {
  id: string;
  draftId: string;
  draftVersion: number;
  userId: string;
  homeId: string;
  installationId: string;
  contentDigest: string;
  action: "APPROVE";
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type CaptureRecordEvidence = {
  id: string;
  version: number;
  homeId: string;
  type: CaptureRecordType;
  active: boolean;
};

export type CaptureStorageEvidence = {
  privateStorageAvailable: boolean;
  providerObjectsPrivate: boolean;
  serverAuthorisedStreamingOnly: boolean;
  partialObjectCleanupSupported: boolean;
};

export type CaptureAttachmentSlotEvidence = {
  recordId: string;
  recordVersion: number;
  revision: number;
  attachmentCount: number;
  maximumAttachmentCount: 1;
};

export type CaptureDuplicateEvidence = {
  key: string;
  exists: boolean;
};

export type CaptureUploadDecision =
  | {
      status: "upload-authorized";
      plan: {
        draftId: string;
        expectedDraftVersion: number;
        expectedDraftStatus: "APPROVED";
        membershipId: string;
        homeId: string;
        recordId: string;
        recordType: CaptureRecordType;
        expectedRecordVersion: number;
        expectedSlotRevision: number;
        expectedAttachmentCount: 0;
        reviewEvidenceId: string;
        consumeReviewEvidence: true;
        idempotencyKey: string;
        contentDigest: string;
        approvedMediaType: CaptureMediaType;
        approvedSizeBytes: number;
        privateOnly: true;
        exposeProviderUrl: false;
        revalidateFileSignature: true;
        revalidateContentDigest: true;
        deletePartialObjectOnFailure: true;
        deleteTemporaryAssetAfterCommit: true;
      };
    }
  | { status: "duplicate" }
  | { status: "attachment-slot-occupied" }
  | { status: "read-only" }
  | { status: "unavailable" };

export const CAPTURE_CLEANUP_EVENTS = [
  "APP_BACKGROUNDED",
  "MEMORY_PRESSURE",
  "CANCELLED",
  "RETAKE_REQUESTED",
  "ACCOUNT_SWITCHED",
  "SIGNED_OUT",
  "ACCOUNT_DELETED",
  "DRAFT_EXPIRED",
  "UPLOAD_FAILED",
  "UPLOAD_SUCCEEDED",
] as const;

export type CaptureCleanupEvent = (typeof CAPTURE_CLEANUP_EVENTS)[number];

export type CaptureCleanupDecision =
  | {
      status: "cleanup-plan";
      plan: {
        lockInterface: boolean;
        deleteTemporaryAsset: boolean;
        abortInFlightUpload: boolean;
        deletePartialPrivateObject: boolean;
        markDraftTerminal: boolean;
        redactFileDataFromLogs: true;
      };
    }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value)
  );
}

function isOpaqueKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_OPAQUE_KEY_LENGTH &&
    value.length <= MAX_OPAQUE_KEY_LENGTH &&
    /^[A-Za-z0-9_-]+$/u.test(value)
  );
}

function isSafeFileName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_FILE_NAME_LENGTH &&
    value === value.trim() &&
    !/[\/\\\u0000-\u001f\u007f]/u.test(value) &&
    !value.startsWith(".")
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isSource(value: unknown): value is NativeCaptureSource {
  return (
    typeof value === "string" &&
    NATIVE_CAPTURE_SOURCES.includes(value as NativeCaptureSource)
  );
}

function isMediaType(value: unknown): value is CaptureMediaType {
  return (
    typeof value === "string" &&
    CAPTURE_MEDIA_TYPES.includes(value as CaptureMediaType)
  );
}

function isRole(value: unknown): value is CaptureRole {
  return (
    typeof value === "string" && CAPTURE_ROLES.includes(value as CaptureRole)
  );
}

function isPlatform(value: unknown): value is CapturePlatform {
  return (
    typeof value === "string" &&
    CAPTURE_PLATFORMS.includes(value as CapturePlatform)
  );
}

function isRecordType(value: unknown): value is CaptureRecordType {
  return (
    typeof value === "string" &&
    CAPTURE_RECORD_TYPES.includes(value as CaptureRecordType)
  );
}

function hasWriteRole(role: CaptureRole) {
  return role === "OWNER" || role === "ADULT";
}

function isShortLivedEvidence({
  issuedAt,
  expiresAt,
  now,
}: {
  issuedAt: Date;
  expiresAt: Date;
  now: Date;
}) {
  return (
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <=
      CAPTURE_MAX_EVIDENCE_TTL_MINUTES * 60 * 1000
  );
}

function parseSession(value: unknown): CaptureSessionEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isExactBoolean(value.verified) ||
    !isValidDate(value.expiresAt)
  ) {
    return null;
  }
  return {
    id: value.id,
    userId: value.userId,
    verified: value.verified,
    expiresAt: value.expiresAt,
  };
}

function parseMembership(value: unknown): CaptureMembershipEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isRole(value.role) ||
    !isExactBoolean(value.active)
  ) {
    return null;
  }
  return {
    id: value.id,
    userId: value.userId,
    homeId: value.homeId,
    role: value.role,
    active: value.active,
  };
}

function parseInitiation(value: unknown): CaptureInitiationEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isSource(value.source) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }
  return {
    id: value.id,
    userId: value.userId,
    homeId: value.homeId,
    installationId: value.installationId,
    source: value.source,
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseCapability(
  value: unknown,
): CaptureCapabilityEvidence | null {
  if (
    !isRecord(value) ||
    !isPlatform(value.platform) ||
    !isSource(value.source) ||
    !isExactBoolean(value.supported) ||
    ![
      "GRANTED",
      "NOT_DETERMINED",
      "DENIED",
      "RESTRICTED",
      "NOT_APPLICABLE",
    ].includes(value.cameraPermissionState as string) ||
    !isExactBoolean(value.appSandboxProtected) ||
    !isExactBoolean(value.photoLibraryWriteDisabled) ||
    !isExactBoolean(value.broadMediaPermissionAbsent)
  ) {
    return null;
  }
  return {
    platform: value.platform,
    source: value.source,
    supported: value.supported,
    cameraPermissionState:
      value.cameraPermissionState as CaptureCapabilityEvidence["cameraPermissionState"],
    appSandboxProtected: value.appSandboxProtected,
    photoLibraryWriteDisabled: value.photoLibraryWriteDisabled,
    broadMediaPermissionAbsent: value.broadMediaPermissionAbsent,
  };
}

export function decideCaptureStart({
  currentUserId,
  selectedHomeId,
  installationId,
  session: rawSession,
  membership: rawMembership,
  source,
  initiation: rawInitiation,
  capability: rawCapability,
  now = new Date(),
}: {
  currentUserId: string;
  selectedHomeId: string;
  installationId: string;
  session: CaptureSessionEvidence;
  membership: CaptureMembershipEvidence;
  source: NativeCaptureSource;
  initiation: CaptureInitiationEvidence;
  capability: CaptureCapabilityEvidence;
  now?: Date;
}): CaptureStartDecision {
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const initiation = parseInitiation(rawInitiation);
  const capability = parseCapability(rawCapability);

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isCanonicalIdentifier(installationId) ||
    !isSource(source) ||
    !isValidDate(now) ||
    !session ||
    !membership ||
    !initiation ||
    !capability ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    membership.active !== true ||
    initiation.userId !== currentUserId ||
    initiation.homeId !== selectedHomeId ||
    initiation.installationId !== installationId ||
    initiation.source !== source ||
    initiation.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: initiation.issuedAt,
      expiresAt: initiation.expiresAt,
      now,
    }) ||
    capability.source !== source ||
    capability.supported !== true ||
    capability.appSandboxProtected !== true ||
    capability.photoLibraryWriteDisabled !== true ||
    capability.broadMediaPermissionAbsent !== true
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(membership.role)) {
    return { status: "read-only" };
  }

  const needsCamera =
    source === "CAMERA" || source === "DOCUMENT_SCANNER";

  if (!needsCamera) {
    if (capability.cameraPermissionState !== "NOT_APPLICABLE") {
      return { status: "unavailable" };
    }
  } else if (capability.cameraPermissionState === "NOT_DETERMINED") {
    return {
      status: "permission-required",
      plan: {
        permission: "CAMERA",
        initiationEvidenceId: initiation.id,
        requestOnlyAfterUserAction: true,
        requestNoUnrelatedPermission: true,
      },
    };
  } else if (
    capability.cameraPermissionState === "DENIED" ||
    capability.cameraPermissionState === "RESTRICTED"
  ) {
    return {
      status: "permission-denied",
      settingsRecoveryAvailable:
        capability.cameraPermissionState === "DENIED",
    };
  } else if (capability.cameraPermissionState !== "GRANTED") {
    return { status: "unavailable" };
  }

  return {
    status: "capture-allowed",
    plan: {
      userId: currentUserId,
      homeId: selectedHomeId,
      membershipId: membership.id,
      installationId,
      platform: capability.platform,
      source,
      requiredPermission: needsCamera ? "CAMERA" : "NONE",
      temporaryStorage: "PROTECTED_APP_SANDBOX",
      initiationEvidenceId: initiation.id,
      consumeInitiationEvidence: true,
      saveToPhotoLibrary: false,
      expectedDraftAbsent: true,
    },
  };
}

function parseDraft(value: unknown): NativeCaptureDraft | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isPositiveInteger(value.version) ||
    !isOpaqueKey(value.captureSessionId) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isSource(value.source) ||
    !isOpaqueKey(value.localAssetId) ||
    !isSafeFileName(value.fileName) ||
    !isMediaType(value.mediaType) ||
    !isNonNegativeInteger(value.sizeBytes) ||
    !isOpaqueKey(value.contentDigest) ||
    !isOpaqueKey(value.originalContentDigest) ||
    !isNonNegativeInteger(value.pageCount) ||
    !(value.pixelWidth === null || isPositiveInteger(value.pixelWidth)) ||
    !(value.pixelHeight === null || isPositiveInteger(value.pixelHeight)) ||
    !isExactBoolean(value.signatureValid) ||
    !isExactBoolean(value.metadataSanitized) ||
    !isExactBoolean(value.locationMetadataRemoved) ||
    !isExactBoolean(value.orientationNormalized) ||
    !isExactBoolean(value.activeContentAbsent) ||
    !isExactBoolean(value.encryptedContentAbsent) ||
    ![
      "PENDING_REVIEW",
      "APPROVED",
      "RETAKE_REQUESTED",
      "CANCELLED",
      "UPLOADED",
    ].includes(value.status as string) ||
    !isValidDate(value.createdAt) ||
    !isValidDate(value.expiresAt) ||
    value.expiresAt.getTime() <= value.createdAt.getTime() ||
    value.expiresAt.getTime() - value.createdAt.getTime() >
      CAPTURE_MAX_DRAFT_TTL_MINUTES * 60 * 1000
  ) {
    return null;
  }
  return {
    id: value.id,
    version: value.version,
    captureSessionId: value.captureSessionId,
    userId: value.userId,
    homeId: value.homeId,
    installationId: value.installationId,
    source: value.source,
    localAssetId: value.localAssetId,
    fileName: value.fileName,
    mediaType: value.mediaType,
    sizeBytes: value.sizeBytes,
    contentDigest: value.contentDigest,
    originalContentDigest: value.originalContentDigest,
    pageCount: value.pageCount,
    pixelWidth: value.pixelWidth,
    pixelHeight: value.pixelHeight,
    signatureValid: value.signatureValid,
    metadataSanitized: value.metadataSanitized,
    locationMetadataRemoved: value.locationMetadataRemoved,
    orientationNormalized: value.orientationNormalized,
    activeContentAbsent: value.activeContentAbsent,
    encryptedContentAbsent: value.encryptedContentAbsent,
    status: value.status as NativeCaptureDraft["status"],
    createdAt: value.createdAt,
    expiresAt: value.expiresAt,
  };
}

function extensionMatchesMediaType(
  fileName: string,
  mediaType: CaptureMediaType,
) {
  const lower = fileName.toLowerCase();
  return mediaType === "application/pdf"
    ? lower.endsWith(".pdf")
    : mediaType === "image/jpeg"
      ? lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      : lower.endsWith(".png");
}

function invalidCaptureReason(
  draft: NativeCaptureDraft,
): CaptureReviewDecision | null {
  if (draft.sizeBytes === 0 || draft.pageCount === 0) {
    return { status: "invalid-capture", reason: "EMPTY" };
  }
  if (draft.sizeBytes > CAPTURE_MAX_BYTES) {
    return { status: "invalid-capture", reason: "TOO_LARGE" };
  }
  if (
    draft.signatureValid !== true ||
    !extensionMatchesMediaType(draft.fileName, draft.mediaType)
  ) {
    return { status: "invalid-capture", reason: "UNVERIFIED_FORMAT" };
  }
  if (
    draft.metadataSanitized !== true ||
    draft.locationMetadataRemoved !== true ||
    draft.orientationNormalized !== true
  ) {
    return {
      status: "invalid-capture",
      reason: "PRIVACY_PROCESSING_INCOMPLETE",
    };
  }
  if (
    draft.activeContentAbsent !== true ||
    draft.encryptedContentAbsent !== true
  ) {
    return { status: "invalid-capture", reason: "UNSAFE_CONTENT" };
  }
  if (
    draft.mediaType === "application/pdf"
      ? draft.pixelWidth !== null || draft.pixelHeight !== null
      : draft.pageCount !== 1 ||
        draft.pixelWidth === null ||
        draft.pixelHeight === null
  ) {
    return { status: "invalid-capture", reason: "INVALID_DIMENSIONS" };
  }
  return null;
}

export function decideCaptureReview({
  draft: rawDraft,
  currentUserId,
  selectedHomeId,
  installationId,
  session: rawSession,
  membership: rawMembership,
  action,
  now = new Date(),
}: {
  draft: NativeCaptureDraft;
  currentUserId: string;
  selectedHomeId: string;
  installationId: string;
  session: CaptureSessionEvidence;
  membership: CaptureMembershipEvidence;
  action: CaptureReviewAction;
  now?: Date;
}): CaptureReviewDecision {
  const draft = parseDraft(rawDraft);
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  if (
    !draft ||
    !session ||
    !membership ||
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isCanonicalIdentifier(installationId) ||
    !["APPROVE", "RETAKE", "CANCEL"].includes(action as string) ||
    !isValidDate(now) ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    membership.active !== true ||
    draft.userId !== currentUserId ||
    draft.homeId !== selectedHomeId ||
    draft.installationId !== installationId ||
    draft.status !== "PENDING_REVIEW" ||
    draft.createdAt.getTime() > now.getTime() ||
    draft.expiresAt.getTime() <= now.getTime()
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(membership.role)) {
    return { status: "read-only" };
  }

  if (action === "RETAKE" || action === "CANCEL") {
    return {
      status: action === "RETAKE" ? "retake" : "cancelled",
      plan: {
        draftId: draft.id,
        expectedDraftVersion: draft.version,
        expectedStatus: "PENDING_REVIEW",
        localAssetId: draft.localAssetId,
        deleteLocalAsset: true,
      },
    };
  }

  const invalid = invalidCaptureReason(draft);
  if (invalid) {
    return invalid;
  }

  return {
    status: "approved",
    plan: {
      draftId: draft.id,
      expectedDraftVersion: draft.version,
      expectedStatus: "PENDING_REVIEW",
      localAssetId: draft.localAssetId,
      contentDigest: draft.contentDigest,
      originalContentDigest: draft.originalContentDigest,
      approvedMediaType: draft.mediaType,
      approvedSizeBytes: draft.sizeBytes,
      deleteOriginalAfterSanitizedReplacement:
        draft.originalContentDigest !== draft.contentDigest,
    },
  };
}

function parseReviewEvidence(
  value: unknown,
): CaptureReviewEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.draftId) ||
    !isPositiveInteger(value.draftVersion) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isOpaqueKey(value.contentDigest) ||
    value.action !== "APPROVE" ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }
  return {
    id: value.id,
    draftId: value.draftId,
    draftVersion: value.draftVersion,
    userId: value.userId,
    homeId: value.homeId,
    installationId: value.installationId,
    contentDigest: value.contentDigest,
    action: "APPROVE",
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseRecordEvidence(
  value: unknown,
): CaptureRecordEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isPositiveInteger(value.version) ||
    !isCanonicalIdentifier(value.homeId) ||
    !isRecordType(value.type) ||
    !isExactBoolean(value.active)
  ) {
    return null;
  }
  return {
    id: value.id,
    version: value.version,
    homeId: value.homeId,
    type: value.type,
    active: value.active,
  };
}

function parseStorage(
  value: unknown,
): CaptureStorageEvidence | null {
  if (
    !isRecord(value) ||
    !isExactBoolean(value.privateStorageAvailable) ||
    !isExactBoolean(value.providerObjectsPrivate) ||
    !isExactBoolean(value.serverAuthorisedStreamingOnly) ||
    !isExactBoolean(value.partialObjectCleanupSupported)
  ) {
    return null;
  }
  return {
    privateStorageAvailable: value.privateStorageAvailable,
    providerObjectsPrivate: value.providerObjectsPrivate,
    serverAuthorisedStreamingOnly: value.serverAuthorisedStreamingOnly,
    partialObjectCleanupSupported: value.partialObjectCleanupSupported,
  };
}

function parseSlot(
  value: unknown,
): CaptureAttachmentSlotEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.recordId) ||
    !isPositiveInteger(value.recordVersion) ||
    !isPositiveInteger(value.revision) ||
    !isNonNegativeInteger(value.attachmentCount) ||
    value.maximumAttachmentCount !== 1
  ) {
    return null;
  }
  return {
    recordId: value.recordId,
    recordVersion: value.recordVersion,
    revision: value.revision,
    attachmentCount: value.attachmentCount,
    maximumAttachmentCount: 1,
  };
}

function parseDuplicate(
  value: unknown,
): CaptureDuplicateEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.key) ||
    !isExactBoolean(value.exists)
  ) {
    return null;
  }
  return { key: value.key, exists: value.exists };
}

export function decideCaptureUpload({
  draft: rawDraft,
  currentUserId,
  selectedHomeId,
  session: rawSession,
  membership: rawMembership,
  review: rawReview,
  record: rawRecord,
  storage: rawStorage,
  slot: rawSlot,
  duplicate: rawDuplicate,
  now = new Date(),
}: {
  draft: NativeCaptureDraft;
  currentUserId: string;
  selectedHomeId: string;
  session: CaptureSessionEvidence;
  membership: CaptureMembershipEvidence;
  review: CaptureReviewEvidence;
  record: CaptureRecordEvidence;
  storage: CaptureStorageEvidence;
  slot: CaptureAttachmentSlotEvidence;
  duplicate: CaptureDuplicateEvidence;
  now?: Date;
}): CaptureUploadDecision {
  const draft = parseDraft(rawDraft);
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const review = parseReviewEvidence(rawReview);
  const record = parseRecordEvidence(rawRecord);
  const storage = parseStorage(rawStorage);
  const slot = parseSlot(rawSlot);
  const duplicate = parseDuplicate(rawDuplicate);

  if (
    !draft ||
    !session ||
    !membership ||
    !review ||
    !record ||
    !storage ||
    !slot ||
    !duplicate ||
    !isCanonicalIdentifier(currentUserId) ||
    !isCanonicalIdentifier(selectedHomeId) ||
    !isValidDate(now) ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    membership.active !== true ||
    draft.userId !== currentUserId ||
    draft.homeId !== selectedHomeId ||
    draft.status !== "APPROVED" ||
    draft.createdAt.getTime() > now.getTime() ||
    draft.expiresAt.getTime() <= now.getTime() ||
    review.draftId !== draft.id ||
    review.draftVersion !== draft.version ||
    review.userId !== currentUserId ||
    review.homeId !== selectedHomeId ||
    review.installationId !== draft.installationId ||
    review.contentDigest !== draft.contentDigest ||
    review.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: review.issuedAt,
      expiresAt: review.expiresAt,
      now,
    }) ||
    record.homeId !== selectedHomeId ||
    record.active !== true ||
    slot.recordId !== record.id ||
    slot.recordVersion !== record.version ||
    invalidCaptureReason(draft) !== null ||
    storage.privateStorageAvailable !== true ||
    storage.providerObjectsPrivate !== true ||
    storage.serverAuthorisedStreamingOnly !== true ||
    storage.partialObjectCleanupSupported !== true
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(membership.role)) {
    return { status: "read-only" };
  }

  if (duplicate.exists) {
    return { status: "duplicate" };
  }

  if (slot.attachmentCount >= slot.maximumAttachmentCount) {
    return { status: "attachment-slot-occupied" };
  }

  return {
    status: "upload-authorized",
    plan: {
      draftId: draft.id,
      expectedDraftVersion: draft.version,
      expectedDraftStatus: "APPROVED",
      membershipId: membership.id,
      homeId: selectedHomeId,
      recordId: record.id,
      recordType: record.type,
      expectedRecordVersion: record.version,
      expectedSlotRevision: slot.revision,
      expectedAttachmentCount: 0,
      reviewEvidenceId: review.id,
      consumeReviewEvidence: true,
      idempotencyKey: duplicate.key,
      contentDigest: draft.contentDigest,
      approvedMediaType: draft.mediaType,
      approvedSizeBytes: draft.sizeBytes,
      privateOnly: true,
      exposeProviderUrl: false,
      revalidateFileSignature: true,
      revalidateContentDigest: true,
      deletePartialObjectOnFailure: true,
      deleteTemporaryAssetAfterCommit: true,
    },
  };
}

export function decideCaptureCleanup(
  event: unknown,
): CaptureCleanupDecision {
  if (
    typeof event !== "string" ||
    !CAPTURE_CLEANUP_EVENTS.includes(event as CaptureCleanupEvent)
  ) {
    return { status: "unavailable" };
  }

  if (event === "APP_BACKGROUNDED") {
    return {
      status: "cleanup-plan",
      plan: {
        lockInterface: true,
        deleteTemporaryAsset: false,
        abortInFlightUpload: false,
        deletePartialPrivateObject: false,
        markDraftTerminal: false,
        redactFileDataFromLogs: true,
      },
    };
  }

  const successful = event === "UPLOAD_SUCCEEDED";
  return {
    status: "cleanup-plan",
    plan: {
      lockInterface:
        event === "MEMORY_PRESSURE" ||
        event === "ACCOUNT_SWITCHED" ||
        event === "SIGNED_OUT" ||
        event === "ACCOUNT_DELETED",
      deleteTemporaryAsset: true,
      abortInFlightUpload: !successful,
      deletePartialPrivateObject: event === "UPLOAD_FAILED",
      markDraftTerminal: true,
      redactFileDataFromLogs: true,
    },
  };
}
