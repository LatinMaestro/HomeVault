import assert from "node:assert/strict";
import test from "node:test";

import {
  NATIVE_IMPORT_MAX_BYTES,
  NATIVE_IMPORT_TTL_MS,
  NATIVE_PROOF_TTL_MS,
  WIDGET_CACHE_TTL_MS,
  decideNativeImportHandoff,
  decideNativeUtilityCleanup,
  decideShortcutInvocation,
  decideWidgetRead,
  decideWidgetRefresh,
  type DeviceSecurityEvidence,
  type MembershipEvidence,
  type NativeImportDraft,
  type NativeImportHandoffProof,
  type NativeImportTransferEvidence,
  type ShortcutInvocationProof,
  type VerifiedSessionEvidence,
  type WidgetIntegrityEvidence,
  type WidgetRegistrationEvidence,
  type WidgetSnapshot,
} from "../src/native-utilities-policy";

const now = new Date("2026-07-29T09:00:00.000Z");

const session: VerifiedSessionEvidence = {
  sessionId: "session-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  issuedAt: new Date(now.getTime() - 60_000),
  expiresAt: new Date(now.getTime() + 60 * 60_000),
  verified: true,
};

const membership: MembershipEvidence = {
  membershipId: "member-1",
  userId: "user-1",
  homeId: "home-1",
  role: "OWNER",
  revision: "membership-revision-1",
  state: "ACTIVE",
  checkedAt: new Date(now.getTime() - 30_000),
  verified: true,
};

const security: DeviceSecurityEvidence = {
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  secureStore: "KEYCHAIN",
  protectedDataAvailable: true,
  deviceUnlocked: true,
  appAttested: true,
  backupExcluded: true,
};

const registration: WidgetRegistrationEvidence = {
  registrationId: "registration-1",
  userId: "user-1",
  homeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  purpose: "widget-refresh",
  optedIn: true,
  issuedAt: new Date(now.getTime() - 30_000),
  expiresAt: new Date(now.getTime() + NATIVE_PROOF_TTL_MS - 30_000),
  consumed: false,
};

const snapshot: WidgetSnapshot = {
  id: "widget-1",
  userId: "user-1",
  homeId: "home-1",
  membershipRevision: "membership-revision-1",
  deviceId: "device-1",
  installationId: "install-1",
  counts: [
    { type: "ATTENTION_COUNT", count: 4 },
    { type: "DUE_MAINTENANCE_COUNT", count: 2 },
  ],
  generatedAt: now,
  expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
  summaryDigest: "summary-digest-1",
  aadDigest: "widget-aad-digest-1",
  encryptedAtRest: true,
  backupExcluded: true,
  containsRecordTitles: false,
  containsHouseholdName: false,
  containsAttachmentData: false,
};

const integrity: WidgetIntegrityEvidence = {
  snapshotId: "widget-1",
  userId: "user-1",
  homeId: "home-1",
  membershipRevision: "membership-revision-1",
  deviceId: "device-1",
  installationId: "install-1",
  summaryDigest: "summary-digest-1",
  aadDigest: "widget-aad-digest-1",
  authenticationTagVerified: true,
};

const shortcutProof: ShortcutInvocationProof = {
  proofId: "shortcut-proof-1",
  userId: "user-1",
  homeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  action: "QUICK_ADD",
  userInitiated: true,
  issuedAt: new Date(now.getTime() - 30_000),
  expiresAt: new Date(now.getTime() + NATIVE_PROOF_TTL_MS - 30_000),
  consumed: false,
};

const draft: NativeImportDraft = {
  id: "import-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  localAssetId: "local-asset-1",
  fileName: "fictional-receipt.pdf",
  mediaType: "application/pdf",
  sizeBytes: 100_000,
  contentDigest: "content-digest-1",
  createdAt: new Date(now.getTime() - 60_000),
  expiresAt: new Date(now.getTime() - 60_000 + NATIVE_IMPORT_TTL_MS),
};

const transfer: NativeImportTransferEvidence = {
  transferId: "transfer-1",
  draftId: "import-1",
  localAssetId: "local-asset-1",
  contentDigest: "content-digest-1",
  sourceExtension: "SHARE_IMPORT_EXTENSION",
  copiedToProtectedContainer: true,
  sourceAccessReleased: true,
  backupExcluded: true,
  completeDataProtection: true,
  signatureVerified: true,
  noUploadPerformed: true,
};

const importProof: NativeImportHandoffProof = {
  proofId: "import-proof-1",
  draftId: "import-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  purpose: "native-import-review",
  issuedAt: new Date(now.getTime() - 30_000),
  expiresAt: new Date(now.getTime() + NATIVE_PROOF_TTL_MS - 30_000),
  consumed: false,
};

const widgetRefreshInput = {
  snapshot,
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  session,
  membership,
  registration,
  deviceSecurity: security,
  requestedSummaryTypes: [
    "ATTENTION_COUNT",
    "DUE_MAINTENANCE_COUNT",
  ],
  now,
};

const widgetReadInput = {
  snapshot,
  integrity,
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  deviceSecurity: security,
  membership,
  now: new Date(now.getTime() + 60_000),
};

const shortcutInput = {
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  session,
  membership,
  deviceSecurity: security,
  proof: shortcutProof,
  action: "QUICK_ADD",
  now,
};

const importInput = {
  draft,
  transfer,
  proof: importProof,
  currentUserId: "user-1",
  selectedHomeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  session,
  membership,
  deviceSecurity: security,
  now,
};

test("authorizes a redacted property-bound widget refresh", () => {
  assert.deepEqual(decideWidgetRefresh(widgetRefreshInput), {
    status: "refresh-authorized",
    userId: "user-1",
    homeId: "home-1",
    membershipRevision: "membership-revision-1",
    summaryTypes: [
      "ATTENTION_COUNT",
      "DUE_MAINTENANCE_COUNT",
    ],
    expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
    consumeRegistrationId: "registration-1",
    redacted: true,
    serverAuthorizationRequired: true,
  });
});

test("rejects substituted widget session and membership evidence", () => {
  assert.deepEqual(
    decideWidgetRefresh({
      ...widgetRefreshInput,
      session: { ...session, userId: "user-2" },
    }),
    { status: "purge-required" },
  );
  assert.deepEqual(
    decideWidgetRefresh({
      ...widgetRefreshInput,
      membership: { ...membership, homeId: "home-2" },
    }),
    { status: "purge-required" },
  );
});

test("requires exact booleans and a single-use widget registration", () => {
  assert.deepEqual(
    decideWidgetRefresh({
      ...widgetRefreshInput,
      registration: {
        ...registration,
        optedIn: 1,
      } as unknown as WidgetRegistrationEvidence,
    }),
    { status: "opt-in-required" },
  );
  assert.deepEqual(
    decideWidgetRefresh({
      ...widgetRefreshInput,
      registration: { ...registration, consumed: true },
    }),
    { status: "purge-required" },
  );
  assert.deepEqual(
    decideWidgetRefresh({
      ...widgetRefreshInput,
      session: {
        ...session,
        verified: "true",
      } as unknown as VerifiedSessionEvidence,
    }),
    { status: "purge-required" },
  );
});

test("rejects malformed, duplicate and unsupported widget scopes", () => {
  for (const requestedSummaryTypes of [
    [],
    ["ATTENTION_COUNT", "ATTENTION_COUNT"],
    ["HOUSEHOLD_NAME"],
  ]) {
    assert.deepEqual(
      decideWidgetRefresh({
        ...widgetRefreshInput,
        requestedSummaryTypes,
      }),
      { status: "purge-required" },
    );
  }
});

test("reads only exact digest-bound redacted widget counts", () => {
  assert.deepEqual(decideWidgetRead(widgetReadInput), {
    status: "widget-readable",
    snapshotId: "widget-1",
    stale: false,
    countsOnly: true,
    requiresAppUnlockForNavigation: true,
  });
  assert.deepEqual(
    decideWidgetRead({ ...widgetReadInput, membership: undefined }),
    {
      status: "widget-readable",
      snapshotId: "widget-1",
      stale: true,
      countsOnly: true,
      requiresAppUnlockForNavigation: true,
    },
  );
});

test("purges widget snapshots after digest or membership revision substitution", () => {
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      integrity: { ...integrity, summaryDigest: "substitute-digest" },
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      membership: {
        ...membership,
        revision: "membership-revision-2",
        checkedAt: widgetReadInput.now,
      },
    }),
    { status: "purge-required", reason: "authorization-revoked" },
  );
});

test("rejects negative, duplicate and truthy widget count evidence", () => {
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      snapshot: {
        ...snapshot,
        counts: [{ type: "ATTENTION_COUNT", count: -1 }],
      },
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      snapshot: {
        ...snapshot,
        counts: [
          { type: "ATTENTION_COUNT", count: 1 },
          { type: "ATTENTION_COUNT", count: 2 },
        ],
      },
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      integrity: {
        ...integrity,
        authenticationTagVerified: 1,
      } as unknown as WidgetIntegrityEvidence,
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
});

test("purges expired and cross-install widget snapshots", () => {
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      now: snapshot.expiresAt,
      membership: { ...membership, checkedAt: snapshot.expiresAt },
    }),
    { status: "purge-required", reason: "expired" },
  );
  assert.deepEqual(
    decideWidgetRead({
      ...widgetReadInput,
      installationId: "install-2",
    }),
    { status: "purge-required", reason: "binding-changed" },
  );
});

test("authorizes only a short-lived exact shortcut proof", () => {
  assert.deepEqual(decideShortcutInvocation(shortcutInput), {
    status: "open-authorized",
    action: "QUICK_ADD",
    destination: "/add",
    consumeProofId: "shortcut-proof-1",
    requiresAppUnlock: true,
    requiresServerAuthorization: true,
    donatesPrivateRecordData: false,
  });
});

test("rejects replayed, substituted and unsupported shortcut invocations", () => {
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      proof: { ...shortcutProof, consumed: true },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      proof: { ...shortcutProof, homeId: "home-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      action: "DELETE_ACCOUNT",
    }),
    { status: "unavailable" },
  );
});

test("derives shortcut write access from verified membership", () => {
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      membership: { ...membership, role: "GUEST" },
    }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      membership: {
        ...membership,
        role: "GUEST",
      },
      action: "OPEN_MAINTENANCE",
      proof: {
        ...shortcutProof,
        action: "OPEN_MAINTENANCE",
      },
    }),
    {
      status: "open-authorized",
      action: "OPEN_MAINTENANCE",
      destination: "/maintenance",
      consumeProofId: "shortcut-proof-1",
      requiresAppUnlock: true,
      requiresServerAuthorization: true,
      donatesPrivateRecordData: false,
    },
  );
});

test("rejects unlock, attestation and secure-store substitutions", () => {
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      deviceSecurity: {
        ...security,
        deviceUnlocked: "true",
      } as unknown as DeviceSecurityEvidence,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideShortcutInvocation({
      ...shortcutInput,
      deviceSecurity: {
        ...security,
        secureStore: "KEYSTORE",
      } as unknown as DeviceSecurityEvidence,
    }),
    { status: "unavailable" },
  );
});

test("hands an exact protected import to main-app review", () => {
  assert.deepEqual(decideNativeImportHandoff(importInput), {
    status: "review-required",
    draftId: "import-1",
    localAssetId: "local-asset-1",
    homeId: "home-1",
    contentDigest: "content-digest-1",
    consumeProofId: "import-proof-1",
    openMainApp: true,
    uploadFromExtension: false,
    requiresExplicitConfirmation: true,
    requiresLiveServerAuthorization: true,
  });
});

test("rejects cross-property and read-only import handoffs", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      selectedHomeId: "home-2",
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      membership: { ...membership, role: "CHILD" },
    }),
    { status: "read-only" },
  );
});

test("rejects import digest, asset and proof substitution", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      transfer: { ...transfer, contentDigest: "substitute-digest" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      transfer: { ...transfer, localAssetId: "local-asset-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      proof: { ...importProof, draftId: "import-2" },
    }),
    { status: "unavailable" },
  );
});

test("rejects truthy transfer evidence and extension-side upload", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      transfer: {
        ...transfer,
        copiedToProtectedContainer: 1,
      } as unknown as NativeImportTransferEvidence,
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      transfer: {
        ...transfer,
        noUploadPerformed: false,
      },
    }),
    { status: "unavailable" },
  );
});

test("rejects expired, oversized, unsupported and invalid-signature imports", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      now: draft.expiresAt,
      session: {
        ...session,
        expiresAt: new Date(draft.expiresAt.getTime() + 60_000),
      },
      membership: { ...membership, checkedAt: draft.expiresAt },
      proof: {
        ...importProof,
        issuedAt: new Date(draft.expiresAt.getTime() - 60_000),
        expiresAt: new Date(draft.expiresAt.getTime() + 60_000),
      },
    }),
    { status: "expired" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      draft: { ...draft, sizeBytes: NATIVE_IMPORT_MAX_BYTES + 1 },
    }),
    { status: "invalid-file", reason: "size" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      draft: {
        ...draft,
        mediaType: "image/heic",
      } as unknown as NativeImportDraft,
    }),
    { status: "invalid-file", reason: "format" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      transfer: { ...transfer, signatureVerified: false },
    }),
    { status: "invalid-file", reason: "signature" },
  );
});

test("rejects invalid import dates without throwing", () => {
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      draft: {
        ...draft,
        expiresAt: new Date("invalid"),
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideNativeImportHandoff({
      ...importInput,
      draft: {
        ...draft,
        expiresAt: new Date(
          draft.createdAt.getTime() + NATIVE_IMPORT_TTL_MS + 1,
        ),
      },
    }),
    { status: "unavailable" },
  );
});

test("purges known lifecycle boundaries and fails unknown events closed", () => {
  assert.deepEqual(decideNativeUtilityCleanup("DEVICE_REPORTED_LOST"), {
    purgeWidgetSnapshot: true,
    purgeImportDrafts: true,
    revokeUtilityRegistration: true,
    deleteProtectedTemporaryFiles: true,
    failClosed: false,
  });
  assert.deepEqual(decideNativeUtilityCleanup("IMPORT_COMPLETED"), {
    purgeWidgetSnapshot: false,
    purgeImportDrafts: true,
    revokeUtilityRegistration: false,
    deleteProtectedTemporaryFiles: true,
    failClosed: false,
  });
  assert.deepEqual(decideNativeUtilityCleanup("UNKNOWN_EVENT"), {
    purgeWidgetSnapshot: true,
    purgeImportDrafts: true,
    revokeUtilityRegistration: true,
    deleteProtectedTemporaryFiles: true,
    failClosed: true,
  });
});
