import assert from "node:assert/strict";
import test from "node:test";

import {
  CAPTURE_MAX_BYTES,
  decideCaptureCleanup,
  decideCaptureReview,
  decideCaptureStart,
  decideCaptureUpload,
  type CaptureAttachmentSlotEvidence,
  type CaptureCapabilityEvidence,
  type CaptureDuplicateEvidence,
  type CaptureInitiationEvidence,
  type CaptureMembershipEvidence,
  type CaptureRecordEvidence,
  type CaptureReviewEvidence,
  type CaptureSessionEvidence,
  type CaptureStorageEvidence,
  type NativeCaptureDraft,
} from "../src/native-document-capture-policy.ts";

const now = new Date("2026-07-29T07:00:00.000Z");
const session: CaptureSessionEvidence = {
  id: "c2Vzc2lvbl9jYXB0dXJlX2V4YWN0XzAwMQ",
  userId: "user1",
  verified: true,
  expiresAt: new Date("2026-07-29T08:00:00.000Z"),
};
const membership: CaptureMembershipEvidence = {
  id: "member1",
  userId: "user1",
  homeId: "home1",
  role: "OWNER",
  active: true,
};
const initiation: CaptureInitiationEvidence = {
  id: "aW5pdGlhdGlvbl9jYXB0dXJlX2V4YWN0XzAwMQ",
  userId: "user1",
  homeId: "home1",
  installationId: "install1",
  source: "DOCUMENT_SCANNER",
  issuedAt: new Date("2026-07-29T06:55:00.000Z"),
  expiresAt: new Date("2026-07-29T07:10:00.000Z"),
  consumed: false,
};
const capability: CaptureCapabilityEvidence = {
  platform: "IOS",
  source: "DOCUMENT_SCANNER",
  supported: true,
  cameraPermissionState: "GRANTED",
  appSandboxProtected: true,
  photoLibraryWriteDisabled: true,
  broadMediaPermissionAbsent: true,
};
const draft: NativeCaptureDraft = {
  id: "capture1",
  version: 2,
  captureSessionId: "Y2FwdHVyZV9zZXNzaW9uX2V4YWN0XzAwMQ",
  userId: "user1",
  homeId: "home1",
  installationId: "install1",
  source: "DOCUMENT_SCANNER",
  localAssetId: "bG9jYWxfYXNzZXRfY2FwdHVyZV9leGFjdF8wMDE",
  fileName: "warranty.pdf",
  mediaType: "application/pdf",
  sizeBytes: 750_000,
  contentDigest: "Y29udGVudF9kaWdlc3RfY2FwdHVyZV8wMDE",
  originalContentDigest: "b3JpZ2luYWxfZGlnZXN0X2NhcHR1cmVfMDAx",
  pageCount: 2,
  pixelWidth: null,
  pixelHeight: null,
  signatureValid: true,
  metadataSanitized: true,
  locationMetadataRemoved: true,
  orientationNormalized: true,
  activeContentAbsent: true,
  encryptedContentAbsent: true,
  status: "PENDING_REVIEW",
  createdAt: new Date("2026-07-29T06:45:00.000Z"),
  expiresAt: new Date("2026-07-29T07:30:00.000Z"),
};
const approvedDraft: NativeCaptureDraft = { ...draft, status: "APPROVED" };
const review: CaptureReviewEvidence = {
  id: "cmV2aWV3X2V2aWRlbmNlX2NhcHR1cmVfMDAx",
  draftId: draft.id,
  draftVersion: draft.version,
  userId: "user1",
  homeId: "home1",
  installationId: "install1",
  contentDigest: draft.contentDigest,
  action: "APPROVE",
  issuedAt: new Date("2026-07-29T06:58:00.000Z"),
  expiresAt: new Date("2026-07-29T07:10:00.000Z"),
  consumed: false,
};
const record: CaptureRecordEvidence = {
  id: "document1",
  version: 4,
  homeId: "home1",
  type: "DOCUMENT",
  active: true,
};
const storage: CaptureStorageEvidence = {
  privateStorageAvailable: true,
  providerObjectsPrivate: true,
  serverAuthorisedStreamingOnly: true,
  partialObjectCleanupSupported: true,
};
const slot: CaptureAttachmentSlotEvidence = {
  recordId: "document1",
  recordVersion: 4,
  revision: 2,
  attachmentCount: 0,
  maximumAttachmentCount: 1,
};
const duplicate: CaptureDuplicateEvidence = {
  key: "aWRlbXBvdGVuY3lfY2FwdHVyZV9rZXlfMDAx",
  exists: false,
};

function start(overrides: Record<string, unknown> = {}) {
  return decideCaptureStart({
    currentUserId: "user1",
    selectedHomeId: "home1",
    installationId: "install1",
    session,
    membership,
    source: "DOCUMENT_SCANNER",
    initiation,
    capability,
    now,
    ...overrides,
  });
}

function reviewDraft(overrides: Record<string, unknown> = {}) {
  return decideCaptureReview({
    draft,
    currentUserId: "user1",
    selectedHomeId: "home1",
    installationId: "install1",
    session,
    membership,
    action: "APPROVE",
    now,
    ...overrides,
  });
}

function upload(overrides: Record<string, unknown> = {}) {
  return decideCaptureUpload({
    draft: approvedDraft,
    currentUserId: "user1",
    selectedHomeId: "home1",
    session,
    membership,
    review,
    record,
    storage,
    slot,
    duplicate,
    now,
    ...overrides,
  });
}

test("starts a user-initiated capture with exact property and device evidence", () => {
  assert.deepEqual(start(), {
    status: "capture-allowed",
    plan: {
      userId: "user1",
      homeId: "home1",
      membershipId: "member1",
      installationId: "install1",
      platform: "IOS",
      source: "DOCUMENT_SCANNER",
      requiredPermission: "CAMERA",
      temporaryStorage: "PROTECTED_APP_SANDBOX",
      initiationEvidenceId: initiation.id,
      consumeInitiationEvidence: true,
      saveToPhotoLibrary: false,
      expectedDraftAbsent: true,
    },
  });
});

test("requests camera permission only after the bound initiation", () => {
  assert.equal(
    start({
      capability: { ...capability, cameraPermissionState: "NOT_DETERMINED" },
    }).status,
    "permission-required",
  );
  assert.equal(
    start({ initiation: { ...initiation, consumed: true } }).status,
    "unavailable",
  );
});

test("file import uses no camera or broad media permission", () => {
  const fileInitiation = {
    ...initiation,
    source: "FILE_IMPORT" as const,
  };
  const fileCapability = {
    ...capability,
    source: "FILE_IMPORT" as const,
    cameraPermissionState: "NOT_APPLICABLE" as const,
  };
  const result = start({
    source: "FILE_IMPORT",
    initiation: fileInitiation,
    capability: fileCapability,
  });
  assert.equal(result.status, "capture-allowed");
  if (result.status === "capture-allowed") {
    assert.equal(result.plan.requiredPermission, "NONE");
    assert.equal(result.plan.saveToPhotoLibrary, false);
  }
});

test("start evidence substitution and truthy booleans fail closed", () => {
  assert.equal(
    start({ membership: { ...membership, homeId: "home2" } }).status,
    "unavailable",
  );
  assert.equal(
    start({ session: { ...session, verified: 1 } }).status,
    "unavailable",
  );
  assert.equal(
    start({ capability: { ...capability, supported: "yes" } }).status,
    "unavailable",
  );
  assert.equal(
    start({ initiation: { ...initiation, expiresAt: new Date("invalid") } })
      .status,
    "unavailable",
  );
});

test("read-only roles and unavailable devices cannot start capture", () => {
  assert.equal(
    start({ membership: { ...membership, role: "CHILD" } }).status,
    "read-only",
  );
  assert.equal(
    start({ capability: { ...capability, supported: false } }).status,
    "unavailable",
  );
});

test("denied and restricted camera permissions have bounded recovery", () => {
  assert.deepEqual(
    start({ capability: { ...capability, cameraPermissionState: "DENIED" } }),
    { status: "permission-denied", settingsRecoveryAvailable: true },
  );
  assert.deepEqual(
    start({
      capability: { ...capability, cameraPermissionState: "RESTRICTED" },
    }),
    { status: "permission-denied", settingsRecoveryAvailable: false },
  );
});

test("approval binds exact version, sanitized bytes and original cleanup", () => {
  const result = reviewDraft();
  assert.equal(result.status, "approved");
  if (result.status === "approved") {
    assert.equal(result.plan.expectedDraftVersion, 2);
    assert.equal(result.plan.contentDigest, draft.contentDigest);
    assert.equal(result.plan.deleteOriginalAfterSanitizedReplacement, true);
  }
});

test("retake and cancel atomically delete the exact temporary asset", () => {
  for (const action of ["RETAKE", "CANCEL"] as const) {
    const result = reviewDraft({ action });
    assert.equal(result.status, action === "RETAKE" ? "retake" : "cancelled");
    if (result.status === "retake" || result.status === "cancelled") {
      assert.equal(result.plan.expectedDraftVersion, draft.version);
      assert.equal(result.plan.localAssetId, draft.localAssetId);
      assert.equal(result.plan.deleteLocalAsset, true);
    }
  }
});

test("malformed drafts and caller-supplied truthy evidence fail closed", () => {
  assert.equal(
    reviewDraft({ draft: { ...draft, metadataSanitized: "yes" } }).status,
    "unavailable",
  );
  assert.equal(
    reviewDraft({ draft: { ...draft, expiresAt: new Date("invalid") } }).status,
    "unavailable",
  );
  assert.equal(reviewDraft({ action: "SAVE" }).status, "unavailable");
});

test("empty, oversized and signature-mismatched captures are rejected", () => {
  assert.deepEqual(
    reviewDraft({ draft: { ...draft, sizeBytes: 0 } }),
    { status: "invalid-capture", reason: "EMPTY" },
  );
  assert.deepEqual(
    reviewDraft({ draft: { ...draft, sizeBytes: CAPTURE_MAX_BYTES + 1 } }),
    { status: "invalid-capture", reason: "TOO_LARGE" },
  );
  assert.deepEqual(
    reviewDraft({ draft: { ...draft, fileName: "warranty.png" } }),
    { status: "invalid-capture", reason: "UNVERIFIED_FORMAT" },
  );
});

test("privacy, unsafe-content and dimensional failures remain review-blocking", () => {
  assert.equal(
    reviewDraft({ draft: { ...draft, locationMetadataRemoved: false } })
      .status,
    "invalid-capture",
  );
  assert.equal(
    reviewDraft({ draft: { ...draft, activeContentAbsent: false } }).status,
    "invalid-capture",
  );
  assert.equal(
    reviewDraft({ draft: { ...draft, pixelWidth: 400 } }).status,
    "invalid-capture",
  );
});

test("review requires exact user, property, device and active write membership", () => {
  assert.equal(
    reviewDraft({ currentUserId: "user2" }).status,
    "unavailable",
  );
  assert.equal(
    reviewDraft({ selectedHomeId: "home2" }).status,
    "unavailable",
  );
  assert.equal(
    reviewDraft({ installationId: "install2" }).status,
    "unavailable",
  );
  assert.equal(
    reviewDraft({ membership: { ...membership, role: "GUEST" } }).status,
    "read-only",
  );
});

test("upload authorisation consumes exact review evidence and never exposes provider URLs", () => {
  const result = upload();
  assert.equal(result.status, "upload-authorized");
  if (result.status === "upload-authorized") {
    assert.equal(result.plan.expectedDraftVersion, draft.version);
    assert.equal(result.plan.expectedRecordVersion, record.version);
    assert.equal(result.plan.consumeReviewEvidence, true);
    assert.equal(result.plan.exposeProviderUrl, false);
    assert.equal(result.plan.revalidateContentDigest, true);
  }
});

test("review replay, expiry and evidence substitution fail upload closed", () => {
  assert.equal(
    upload({ review: { ...review, consumed: true } }).status,
    "unavailable",
  );
  assert.equal(
    upload({
      review: {
        ...review,
        issuedAt: new Date("2026-07-29T06:30:00.000Z"),
      },
    }).status,
    "unavailable",
  );
  assert.equal(
    upload({ review: { ...review, homeId: "home2" } }).status,
    "unavailable",
  );
  assert.equal(
    upload({ review: { ...review, contentDigest: review.id } }).status,
    "unavailable",
  );
});

test("record, storage, slot and byte substitutions fail upload closed", () => {
  assert.equal(
    upload({ record: { ...record, homeId: "home2" } }).status,
    "unavailable",
  );
  assert.equal(
    upload({ storage: { ...storage, providerObjectsPrivate: 1 } }).status,
    "unavailable",
  );
  assert.equal(
    upload({ slot: { ...slot, recordVersion: 5 } }).status,
    "unavailable",
  );
  assert.equal(
    upload({
      draft: { ...approvedDraft, contentDigest: approvedDraft.localAssetId },
    }).status,
    "unavailable",
  );
});

test("duplicate delivery and occupied attachment slots are idempotent", () => {
  assert.equal(
    upload({ duplicate: { ...duplicate, exists: true } }).status,
    "duplicate",
  );
  assert.equal(
    upload({ slot: { ...slot, attachmentCount: 1 } }).status,
    "attachment-slot-occupied",
  );
});

test("approved bytes are revalidated before upload", () => {
  assert.equal(
    upload({ draft: { ...approvedDraft, signatureValid: false } }).status,
    "unavailable",
  );
  assert.equal(
    upload({ draft: { ...approvedDraft, activeContentAbsent: false } }).status,
    "unavailable",
  );
});

test("cleanup is explicit for lifecycle events and unknown events fail closed", () => {
  assert.deepEqual(decideCaptureCleanup("APP_BACKGROUNDED"), {
    status: "cleanup-plan",
    plan: {
      lockInterface: true,
      deleteTemporaryAsset: false,
      abortInFlightUpload: false,
      deletePartialPrivateObject: false,
      markDraftTerminal: false,
      redactFileDataFromLogs: true,
    },
  });
  assert.equal(
    decideCaptureCleanup("UPLOAD_FAILED").status,
    "cleanup-plan",
  );
  assert.equal(decideCaptureCleanup("UNKNOWN").status, "unavailable");
});
