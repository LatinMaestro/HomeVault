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

export const CAPTURE_MAX_BYTES = 4_000_000;

export type NativeCaptureSource = (typeof NATIVE_CAPTURE_SOURCES)[number];
export type CaptureMediaType = (typeof CAPTURE_MEDIA_TYPES)[number];
export type CaptureRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type NativeCaptureDraft = {
  id: string;
  userId: string;
  homeId: string;
  installationId: string;
  source: NativeCaptureSource;
  localAssetId: string;
  fileName: string;
  mediaType: CaptureMediaType;
  sizeBytes: number;
  signatureValid: boolean;
  metadataSanitized: boolean;
  orientationNormalized: boolean;
  status: "PENDING_REVIEW" | "APPROVED" | "RETAKE_REQUESTED" | "CANCELLED";
  expiresAt: Date;
};

export type CaptureStartDecision =
  | {
      status: "capture-allowed";
      source: NativeCaptureSource;
      requiredPermission: "CAMERA" | "NONE";
      temporaryStorage: "APP_SANDBOX";
    }
  | {
      status: "permission-required";
      permission: "CAMERA";
      requestOnlyAfterUserAction: true;
    }
  | { status: "permission-denied"; settingsRecoveryAvailable: boolean }
  | { status: "read-only" }
  | { status: "unavailable" };

export type CaptureReviewDecision =
  | {
      status: "approved";
      draftId: string;
      localAssetId: string;
    }
  | {
      status: "retake";
      draftId: string;
      deleteLocalAsset: true;
    }
  | {
      status: "cancelled";
      draftId: string;
      deleteLocalAsset: true;
    }
  | { status: "invalid-capture"; message: string }
  | { status: "unavailable" };

export type CaptureUploadDecision =
  | {
      status: "upload-authorized";
      draftId: string;
      homeId: string;
      recordId: string;
      idempotencyKey: string;
      privateOnly: true;
      exposeProviderUrl: false;
      revalidateFileSignature: true;
    }
  | { status: "duplicate" }
  | { status: "attachment-slot-occupied" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type CaptureCleanupEvent =
  | "APP_BACKGROUNDED"
  | "CANCELLED"
  | "RETAKE_REQUESTED"
  | "ACCOUNT_SWITCHED"
  | "SIGNED_OUT"
  | "ACCOUNT_DELETED"
  | "DRAFT_EXPIRED"
  | "UPLOAD_FAILED";

export type CaptureCleanupDecision = {
  lockInterface: boolean;
  deleteTemporaryAsset: boolean;
  abortInFlightUpload: boolean;
  deletePartialPrivateObject: boolean;
};

function isCaptureSource(value: string): value is NativeCaptureSource {
  return NATIVE_CAPTURE_SOURCES.includes(value as NativeCaptureSource);
}

function hasWriteRole(role: CaptureRole) {
  return role === "OWNER" || role === "ADULT";
}

function requiresCameraPermission(source: NativeCaptureSource) {
  return source === "CAMERA" || source === "DOCUMENT_SCANNER";
}

export function decideCaptureStart({
  currentUserId,
  selectedHomeId,
  installationId,
  sessionVerified,
  hasCurrentMembership,
  role,
  source,
  userInitiated,
  platformSupportsSource,
  permissionState,
}: {
  currentUserId: string;
  selectedHomeId: string;
  installationId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: CaptureRole;
  source: string;
  userInitiated: boolean;
  platformSupportsSource: boolean;
  permissionState: "GRANTED" | "NOT_DETERMINED" | "DENIED" | "RESTRICTED";
}): CaptureStartDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !installationId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !userInitiated ||
    !platformSupportsSource ||
    !isCaptureSource(source)
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (!requiresCameraPermission(source)) {
    return {
      status: "capture-allowed",
      source,
      requiredPermission: "NONE",
      temporaryStorage: "APP_SANDBOX",
    };
  }

  if (permissionState === "NOT_DETERMINED") {
    return {
      status: "permission-required",
      permission: "CAMERA",
      requestOnlyAfterUserAction: true,
    };
  }

  if (permissionState === "DENIED") {
    return {
      status: "permission-denied",
      settingsRecoveryAvailable: true,
    };
  }

  if (permissionState !== "GRANTED") {
    return { status: "unavailable" };
  }

  return {
    status: "capture-allowed",
    source,
    requiredPermission: "CAMERA",
    temporaryStorage: "APP_SANDBOX",
  };
}

export function decideCaptureReview({
  draft,
  currentUserId,
  selectedHomeId,
  installationId,
  now,
  action,
}: {
  draft: NativeCaptureDraft;
  currentUserId: string;
  selectedHomeId: string;
  installationId: string;
  now: Date;
  action: "APPROVE" | "RETAKE" | "CANCEL";
}): CaptureReviewDecision {
  if (
    !draft.id ||
    !draft.localAssetId ||
    draft.userId !== currentUserId ||
    draft.homeId !== selectedHomeId ||
    draft.installationId !== installationId ||
    draft.status !== "PENDING_REVIEW" ||
    now.getTime() >= draft.expiresAt.getTime()
  ) {
    return { status: "unavailable" };
  }

  if (action === "RETAKE") {
    return {
      status: "retake",
      draftId: draft.id,
      deleteLocalAsset: true,
    };
  }

  if (action === "CANCEL") {
    return {
      status: "cancelled",
      draftId: draft.id,
      deleteLocalAsset: true,
    };
  }

  if (!draft.fileName || draft.sizeBytes <= 0) {
    return { status: "invalid-capture", message: "Capture is empty." };
  }

  if (draft.sizeBytes > CAPTURE_MAX_BYTES) {
    return {
      status: "invalid-capture",
      message: "Capture exceeds the private attachment limit.",
    };
  }

  if (
    !CAPTURE_MEDIA_TYPES.includes(draft.mediaType) ||
    !draft.signatureValid
  ) {
    return {
      status: "invalid-capture",
      message: "Capture format could not be verified.",
    };
  }

  if (!draft.metadataSanitized || !draft.orientationNormalized) {
    return {
      status: "invalid-capture",
      message: "Capture privacy processing is incomplete.",
    };
  }

  return {
    status: "approved",
    draftId: draft.id,
    localAssetId: draft.localAssetId,
  };
}

export function decideCaptureUpload({
  draft,
  currentUserId,
  selectedHomeId,
  recordHomeId,
  recordId,
  sessionVerified,
  hasCurrentMembership,
  role,
  privateStorageAvailable,
  attachmentSlotOccupied,
  idempotencyKey,
  duplicateOperation,
}: {
  draft: NativeCaptureDraft;
  currentUserId: string;
  selectedHomeId: string;
  recordHomeId: string;
  recordId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: CaptureRole;
  privateStorageAvailable: boolean;
  attachmentSlotOccupied: boolean;
  idempotencyKey: string;
  duplicateOperation: boolean;
}): CaptureUploadDecision {
  if (
    !draft.id ||
    !recordId ||
    !idempotencyKey ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !privateStorageAvailable ||
    draft.status !== "APPROVED" ||
    draft.userId !== currentUserId ||
    draft.homeId !== selectedHomeId ||
    recordHomeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (duplicateOperation) {
    return { status: "duplicate" };
  }

  if (attachmentSlotOccupied) {
    return { status: "attachment-slot-occupied" };
  }

  return {
    status: "upload-authorized",
    draftId: draft.id,
    homeId: selectedHomeId,
    recordId,
    idempotencyKey,
    privateOnly: true,
    exposeProviderUrl: false,
    revalidateFileSignature: true,
  };
}

export function decideCaptureCleanup(
  event: CaptureCleanupEvent,
): CaptureCleanupDecision {
  if (event === "APP_BACKGROUNDED") {
    return {
      lockInterface: true,
      deleteTemporaryAsset: false,
      abortInFlightUpload: false,
      deletePartialPrivateObject: false,
    };
  }

  return {
    lockInterface:
      event === "ACCOUNT_SWITCHED" ||
      event === "SIGNED_OUT" ||
      event === "ACCOUNT_DELETED",
    deleteTemporaryAsset: true,
    abortInFlightUpload: true,
    deletePartialPrivateObject: event === "UPLOAD_FAILED",
  };
}
