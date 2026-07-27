import assert from "node:assert/strict";
import test from "node:test";

import {
  CAPTURE_MAX_BYTES,
  decideCaptureCleanup,
  decideCaptureReview,
  decideCaptureStart,
  decideCaptureUpload,
  type NativeCaptureDraft,
} from "../src/lib/native-document-capture-policy";

const draft: NativeCaptureDraft = {
  id: "capture-1",
  userId: "user-1",
  homeId: "home-1",
  installationId: "install-1",
  source: "DOCUMENT_SCANNER",
  localAssetId: "sandbox-asset-1",
  fileName: "warranty.pdf",
  mediaType: "application/pdf",
  sizeBytes: 750_000,
  signatureValid: true,
  metadataSanitized: true,
  orientationNormalized: true,
  status: "PENDING_REVIEW",
  expiresAt: new Date("2026-07-28T00:00:00.000Z"),
};

test("requests camera access only after a user starts capture", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    installationId: "install-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    source: "CAMERA",
    userInitiated: true,
    platformSupportsSource: true,
    permissionState: "NOT_DETERMINED" as const,
  };

  assert.deepEqual(decideCaptureStart(input), {
    status: "permission-required",
    permission: "CAMERA",
    requestOnlyAfterUserAction: true,
  });
  assert.deepEqual(
    decideCaptureStart({ ...input, userInitiated: false }),
    { status: "unavailable" },
  );
});

test("starts camera, scanner and file import in private temporary storage", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    installationId: "install-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT" as const,
    source: "DOCUMENT_SCANNER",
    userInitiated: true,
    platformSupportsSource: true,
    permissionState: "GRANTED" as const,
  };

  assert.deepEqual(decideCaptureStart(input), {
    status: "capture-allowed",
    source: "DOCUMENT_SCANNER",
    requiredPermission: "CAMERA",
    temporaryStorage: "APP_SANDBOX",
  });
  assert.deepEqual(
    decideCaptureStart({
      ...input,
      source: "FILE_IMPORT",
      permissionState: "RESTRICTED",
    }),
    {
      status: "capture-allowed",
      source: "FILE_IMPORT",
      requiredPermission: "NONE",
      temporaryStorage: "APP_SANDBOX",
    },
  );
});

test("keeps read-only members and denied permissions fail closed", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    installationId: "install-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "CHILD" as const,
    source: "CAMERA",
    userInitiated: true,
    platformSupportsSource: true,
    permissionState: "GRANTED" as const,
  };

  assert.deepEqual(decideCaptureStart(input), { status: "read-only" });
  assert.deepEqual(
    decideCaptureStart({
      ...input,
      role: "OWNER",
      permissionState: "DENIED",
    }),
    { status: "permission-denied", settingsRecoveryAvailable: true },
  );
});

test("requires explicit review before a capture can upload", () => {
  assert.deepEqual(
    decideCaptureReview({
      draft,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      installationId: "install-1",
      now: new Date("2026-07-27T12:00:00.000Z"),
      action: "APPROVE",
    }),
    {
      status: "approved",
      draftId: "capture-1",
      localAssetId: "sandbox-asset-1",
    },
  );
});

test("retake and cancel discard the temporary capture", () => {
  const input = {
    draft,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    installationId: "install-1",
    now: new Date("2026-07-27T12:00:00.000Z"),
    action: "RETAKE" as const,
  };

  assert.deepEqual(decideCaptureReview(input), {
    status: "retake",
    draftId: "capture-1",
    deleteLocalAsset: true,
  });
  assert.deepEqual(
    decideCaptureReview({ ...input, action: "CANCEL" }),
    {
      status: "cancelled",
      draftId: "capture-1",
      deleteLocalAsset: true,
    },
  );
});

test("rejects stale, oversized, unsanitized and cross-property drafts", () => {
  const input = {
    draft,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    installationId: "install-1",
    now: new Date("2026-07-27T12:00:00.000Z"),
    action: "APPROVE" as const,
  };

  assert.deepEqual(
    decideCaptureReview({
      ...input,
      draft: { ...draft, sizeBytes: CAPTURE_MAX_BYTES + 1 },
    }),
    {
      status: "invalid-capture",
      message: "Capture exceeds the private attachment limit.",
    },
  );
  assert.deepEqual(
    decideCaptureReview({
      ...input,
      draft: { ...draft, metadataSanitized: false },
    }),
    {
      status: "invalid-capture",
      message: "Capture privacy processing is incomplete.",
    },
  );
  assert.deepEqual(
    decideCaptureReview({ ...input, selectedHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCaptureReview({
      ...input,
      now: new Date("2026-07-28T00:00:00.000Z"),
    }),
    { status: "unavailable" },
  );
});

test("authorizes only exact-property private upload after approval", () => {
  const approved = { ...draft, status: "APPROVED" as const };
  const input = {
    draft: approved,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    recordHomeId: "home-1",
    recordId: "document-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    privateStorageAvailable: true,
    attachmentSlotOccupied: false,
    idempotencyKey: "capture-upload-1",
    duplicateOperation: false,
    now: new Date("2026-07-27T12:00:00.000Z"),
  };

  assert.deepEqual(decideCaptureUpload(input), {
    status: "upload-authorized",
    draftId: "capture-1",
    homeId: "home-1",
    recordId: "document-1",
    idempotencyKey: "capture-upload-1",
    privateOnly: true,
    exposeProviderUrl: false,
    revalidateFileSignature: true,
  });
  assert.deepEqual(
    decideCaptureUpload({ ...input, recordHomeId: "home-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCaptureUpload({ ...input, role: "GUEST" }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideCaptureUpload({ ...input, attachmentSlotOccupied: true }),
    { status: "attachment-slot-occupied" },
  );
  assert.deepEqual(
    decideCaptureUpload({
      ...input,
      now: new Date("2026-07-28T00:00:00.000Z"),
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideCaptureUpload({
      ...input,
      draft: { ...approved, signatureValid: false },
    }),
    { status: "unavailable" },
  );
});

test("locks on background and cleans cancelled or failed capture state", () => {
  assert.deepEqual(decideCaptureCleanup("APP_BACKGROUNDED"), {
    lockInterface: true,
    deleteTemporaryAsset: false,
    abortInFlightUpload: false,
    deletePartialPrivateObject: false,
  });
  assert.deepEqual(decideCaptureCleanup("CANCELLED"), {
    lockInterface: false,
    deleteTemporaryAsset: true,
    abortInFlightUpload: true,
    deletePartialPrivateObject: false,
  });
  assert.deepEqual(decideCaptureCleanup("UPLOAD_FAILED"), {
    lockInterface: false,
    deleteTemporaryAsset: true,
    abortInFlightUpload: true,
    deletePartialPrivateObject: true,
  });
});
