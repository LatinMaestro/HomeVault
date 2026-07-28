import assert from "node:assert/strict";
import test from "node:test";

import {
  NATIVE_IMPORT_MAX_BYTES,
  WIDGET_CACHE_TTL_MS,
  decideNativeImportHandoff,
  decideNativeUtilityCleanup,
  decideShortcutInvocation,
  decideWidgetRead,
  decideWidgetRefresh,
  type NativeImportDraft,
  type WidgetSnapshot,
} from "../src/lib/native-utilities-policy";

const now = new Date("2026-07-27T08:00:00.000Z");

const widgetSnapshot: WidgetSnapshot = {
  id: "widget-1",
  userId: "user-1",
  homeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  summaryTypes: ["ATTENTION_COUNT", "DUE_MAINTENANCE_COUNT"],
  generatedAt: now,
  expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
  integrityTag: "integrity",
  encryptedAtRest: true,
  backupExcluded: true,
  containsRecordTitles: false,
  containsHouseholdName: false,
  containsAttachmentData: false,
};

const importDraft: NativeImportDraft = {
  id: "import-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  localAssetId: "local-asset-1",
  fileName: "fictional-receipt.pdf",
  mediaType: "application/pdf",
  sizeBytes: 100_000,
  signatureValid: true,
  copiedToProtectedContainer: true,
  sourceAccessRevoked: true,
  createdAt: now,
  expiresAt: new Date("2026-07-27T08:30:00.000Z"),
};

test("authorizes only redacted property-bound widget summaries", () => {
  assert.deepEqual(
    decideWidgetRefresh({
      snapshot: widgetSnapshot,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      userOptedIn: true,
      deviceReportedLost: false,
      requestedSummaryTypes: [
        "ATTENTION_COUNT",
        "DUE_MAINTENANCE_COUNT",
      ],
      now,
    }),
    {
      status: "refresh-authorized",
      userId: "user-1",
      homeId: "home-1",
      summaryTypes: ["ATTENTION_COUNT", "DUE_MAINTENANCE_COUNT"],
      expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
      redacted: true,
      serverAuthorizationRequired: true,
    },
  );
});

test("requires widget opt-in and purges changed or sensitive snapshots", () => {
  const input = {
    snapshot: widgetSnapshot,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    userOptedIn: true,
    deviceReportedLost: false,
    requestedSummaryTypes: ["ATTENTION_COUNT"],
    now,
  };

  assert.deepEqual(
    decideWidgetRefresh({ ...input, userOptedIn: false }),
    { status: "opt-in-required" },
  );
  assert.deepEqual(
    decideWidgetRefresh({ ...input, selectedHomeId: "home-2" }),
    { status: "purge-required" },
  );
  assert.deepEqual(
    decideWidgetRefresh({
      ...input,
      snapshot: {
        ...widgetSnapshot,
        containsRecordTitles: true,
      } as WidgetSnapshot,
    }),
    { status: "purge-required" },
  );
});

test("reads only intact redacted widget snapshots and marks offline state stale", () => {
  assert.deepEqual(
    decideWidgetRead({
      snapshot: widgetSnapshot,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      userOptedIn: true,
      membershipState: "UNKNOWN_OFFLINE",
      deviceReportedLost: false,
      integrityValid: true,
      now: new Date("2026-07-27T09:00:00.000Z"),
    }),
    {
      status: "widget-readable",
      snapshotId: "widget-1",
      stale: true,
      countsOnly: true,
      requiresAppUnlockForNavigation: true,
    },
  );
});

test("purges expired, revoked, changed-install and invalid widget snapshots", () => {
  const input = {
    snapshot: widgetSnapshot,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    userOptedIn: true,
    membershipState: "CURRENT" as const,
    deviceReportedLost: false,
    integrityValid: true,
    now: new Date("2026-07-27T09:00:00.000Z"),
  };

  assert.deepEqual(
    decideWidgetRead({
      ...input,
      now: widgetSnapshot.expiresAt,
    }),
    { status: "purge-required", reason: "expired" },
  );
  assert.deepEqual(
    decideWidgetRead({ ...input, membershipState: "REVOKED" }),
    { status: "purge-required", reason: "authorization-revoked" },
  );
  assert.deepEqual(
    decideWidgetRead({ ...input, installationId: "install-2" }),
    { status: "purge-required", reason: "binding-changed" },
  );
  assert.deepEqual(
    decideWidgetRead({ ...input, integrityValid: false }),
    { status: "purge-required", reason: "integrity-failed" },
  );
});

test("opens allowlisted shortcuts only after unlock and live authorization", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "ADULT" as const,
    action: "QUICK_ADD",
    userInitiated: true,
    deviceUnlocked: true,
  };

  assert.deepEqual(decideShortcutInvocation(input), {
    status: "open-authorized",
    action: "QUICK_ADD",
    destination: "/add",
    requiresAppUnlock: true,
    requiresServerAuthorization: true,
    donatesPrivateRecordData: false,
  });
  assert.deepEqual(
    decideShortcutInvocation({ ...input, deviceUnlocked: false }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideShortcutInvocation({ ...input, action: "DELETE_ACCOUNT" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideShortcutInvocation({ ...input, action: "OPEN_REMINDERS" }),
    { status: "unavailable" },
  );
});

test("keeps mutating shortcuts unavailable to read-only roles", () => {
  assert.deepEqual(
    decideShortcutInvocation({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      sessionVerified: true,
      hasCurrentMembership: true,
      role: "GUEST",
      action: "CAPTURE_DOCUMENT",
      userInitiated: true,
      deviceUnlocked: true,
    }),
    { status: "read-only" },
  );
});

test("imports only into protected review-before-save handoff", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      draft: importDraft,
      currentUserId: "user-1",
      deviceId: "device-1",
      installationId: "install-1",
      sessionVerified: true,
      role: "OWNER",
      now: new Date("2026-07-27T08:10:00.000Z"),
    }),
    {
      status: "review-required",
      draftId: "import-1",
      localAssetId: "local-asset-1",
      openMainApp: true,
      uploadFromExtension: false,
      requiresPropertySelection: true,
      requiresLiveServerAuthorization: true,
    },
  );
});

test("rejects expired, oversized, invalid and cross-install imports", () => {
  const input = {
    draft: importDraft,
    currentUserId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    role: "OWNER" as const,
    now: new Date("2026-07-27T08:10:00.000Z"),
  };

  assert.deepEqual(
    decideNativeImportHandoff({
      ...input,
      now: new Date("2026-07-27T08:30:00.000Z"),
    }),
    { status: "expired" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...input,
      draft: {
        ...importDraft,
        sizeBytes: NATIVE_IMPORT_MAX_BYTES + 1,
      },
    }),
    { status: "invalid-file", reason: "size" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...input,
      draft: { ...importDraft, signatureValid: false },
    }),
    { status: "invalid-file", reason: "signature" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...input,
      installationId: "install-2",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...input,
      draft: {
        ...importDraft,
        expiresAt: new Date("2026-07-27T09:00:00.000Z"),
      },
    }),
    { status: "unavailable" },
  );
});

test("purges utility state at account, device and import boundaries", () => {
  assert.deepEqual(decideNativeUtilityCleanup("ACCOUNT_SWITCHED"), {
    purgeWidgetSnapshot: true,
    purgeImportDrafts: true,
    revokeUtilityRegistration: false,
    deleteProtectedTemporaryFiles: true,
  });
  assert.deepEqual(decideNativeUtilityCleanup("DEVICE_REPORTED_LOST"), {
    purgeWidgetSnapshot: true,
    purgeImportDrafts: true,
    revokeUtilityRegistration: true,
    deleteProtectedTemporaryFiles: true,
  });
  assert.deepEqual(decideNativeUtilityCleanup("IMPORT_COMPLETED"), {
    purgeWidgetSnapshot: false,
    purgeImportDrafts: true,
    revokeUtilityRegistration: false,
    deleteProtectedTemporaryFiles: true,
  });
});
