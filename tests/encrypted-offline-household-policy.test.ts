import assert from "node:assert/strict";
import test from "node:test";

import {
  OFFLINE_CACHE_TTL_MS,
  OFFLINE_QUEUE_MAX_ACTIONS,
  decideOfflineCleanup,
  decideOfflineEnrollment,
  decideOfflineQueue,
  decideOfflineRead,
  decideOfflineSync,
  type OfflineQueuedAction,
  type OfflineSnapshot,
} from "../src/lib/encrypted-offline-household-policy";

const snapshot: OfflineSnapshot = {
  id: "snapshot-1",
  userId: "user-1",
  homeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  keyId: "platform-key-1",
  schemaVersion: 1,
  serverRevision: "revision-10",
  recordTypes: ["ASSETS", "MAINTENANCE", "REMINDERS"],
  issuedAt: new Date("2026-07-27T00:00:00.000Z"),
  expiresAt: new Date("2026-07-30T00:00:00.000Z"),
  sizeBytes: 2_000_000,
  integrityTag: "integrity-tag",
  encrypted: true,
  backupExcluded: true,
};

const action: OfflineQueuedAction = {
  id: "action-1",
  clientMutationId: "client-mutation-1",
  userId: "user-1",
  homeId: "home-1",
  deviceId: "device-1",
  installationId: "install-1",
  mutationType: "UPDATE_RECORD",
  recordId: "asset-1",
  baseServerRevision: "revision-10",
  payloadDigest: "payload-digest",
  payloadEncrypted: true,
  createdAt: new Date("2026-07-27T01:00:00.000Z"),
  expiresAt: new Date("2026-07-30T00:00:00.000Z"),
};

test("enables only explicit bounded encrypted offline scope", () => {
  const now = new Date("2026-07-27T00:00:00.000Z");
  assert.deepEqual(
    decideOfflineEnrollment({
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      sessionVerified: true,
      credentialConfirmed: true,
      hasCurrentMembership: true,
      userOptedIn: true,
      devicePasscodeSet: true,
      platformKeyAvailable: true,
      backupExcluded: true,
      requestedRecordTypes: ["ASSETS", "MAINTENANCE"],
      requestedMaxBytes: 10_000_000,
      now,
    }),
    {
      status: "offline-enabled",
      userId: "user-1",
      homeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      recordTypes: ["ASSETS", "MAINTENANCE"],
      expiresAt: new Date(now.getTime() + OFFLINE_CACHE_TTL_MS),
      maxBytes: 10_000_000,
      encryption: "PLATFORM_WRAPPED_AES_GCM",
      backupExcluded: true,
    },
  );
});

test("rejects unconfirmed, insecure and invalid offline enrollment", () => {
  const input = {
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    credentialConfirmed: true,
    hasCurrentMembership: true,
    userOptedIn: true,
    devicePasscodeSet: true,
    platformKeyAvailable: true,
    backupExcluded: true,
    requestedRecordTypes: ["ASSETS"],
    requestedMaxBytes: 10_000_000,
    now: new Date("2026-07-27T00:00:00.000Z"),
  };

  assert.deepEqual(
    decideOfflineEnrollment({ ...input, credentialConfirmed: false }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideOfflineEnrollment({ ...input, devicePasscodeSet: false }),
    { status: "insecure-device" },
  );
  assert.deepEqual(
    decideOfflineEnrollment({
      ...input,
      requestedRecordTypes: ["ATTACHMENT_BYTES"],
    }),
    { status: "invalid-scope" },
  );
});

test("reads a valid bound snapshot but marks unknown authorization stale", () => {
  assert.deepEqual(
    decideOfflineRead({
      snapshot,
      currentUserId: "user-1",
      selectedHomeId: "home-1",
      deviceId: "device-1",
      installationId: "install-1",
      now: new Date("2026-07-27T12:00:00.000Z"),
      membershipState: "UNKNOWN_OFFLINE",
      deviceReportedLost: false,
      platformKeyAvailable: true,
      integrityValid: true,
      schemaSupported: true,
    }),
    {
      status: "offline-readable",
      snapshotId: "snapshot-1",
      stale: true,
      serverAuthorizationRequiredForWrites: true,
    },
  );
});

test("purges expired, revoked, changed-device and invalid snapshots", () => {
  const input = {
    snapshot,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    now: new Date("2026-07-27T12:00:00.000Z"),
    membershipState: "CURRENT" as const,
    deviceReportedLost: false,
    platformKeyAvailable: true,
    integrityValid: true,
    schemaSupported: true,
  };

  assert.deepEqual(
    decideOfflineRead({ ...input, membershipState: "REVOKED" }),
    { status: "purge-required", reason: "authorization-revoked" },
  );
  assert.deepEqual(
    decideOfflineRead({ ...input, deviceId: "device-2" }),
    { status: "purge-required", reason: "device-binding-changed" },
  );
  assert.deepEqual(
    decideOfflineRead({
      ...input,
      now: new Date("2026-07-30T00:00:00.000Z"),
    }),
    { status: "purge-required", reason: "expired" },
  );
  assert.deepEqual(
    decideOfflineRead({ ...input, integrityValid: false }),
    { status: "purge-required", reason: "integrity-failed" },
  );
});

test("queues only encrypted, non-destructive, property-bound actions", () => {
  const input = {
    snapshot,
    action,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    role: "ADULT" as const,
    now: new Date("2026-07-27T12:00:00.000Z"),
    queueSize: 3,
    platformKeyAvailable: true,
    integrityValid: true,
  };

  assert.deepEqual(decideOfflineQueue(input), {
    status: "queued",
    actionId: "action-1",
    clientMutationId: "client-mutation-1",
    requiresServerReplayAuthorization: true,
  });
  assert.deepEqual(
    decideOfflineQueue({ ...input, role: "GUEST" }),
    { status: "read-only" },
  );
  assert.deepEqual(
    decideOfflineQueue({
      ...input,
      queueSize: OFFLINE_QUEUE_MAX_ACTIONS,
    }),
    { status: "queue-full" },
  );
  assert.deepEqual(
    decideOfflineQueue({
      ...input,
      action: { ...action, homeId: "home-2" },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOfflineQueue({ ...input, integrityValid: false }),
    { status: "unavailable" },
  );
});

test("reauthorizes queued actions and surfaces deterministic conflicts", () => {
  const input = {
    action,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    now: new Date("2026-07-27T12:00:00.000Z"),
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    serverRevision: "revision-10",
    duplicateApplied: false,
    additiveReplaySafe: false,
  };

  assert.deepEqual(decideOfflineSync(input), {
    status: "apply",
    actionId: "action-1",
    mode: "EXACT_REVISION",
  });
  assert.deepEqual(
    decideOfflineSync({ ...input, serverRevision: "revision-11" }),
    { status: "conflict-review", actionId: "action-1" },
  );
  assert.deepEqual(
    decideOfflineSync({ ...input, deviceId: "device-2" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOfflineSync({
      ...input,
      action: { ...action, mutationType: "COMPLETE_MAINTENANCE" },
      serverRevision: "revision-11",
      additiveReplaySafe: true,
    }),
    {
      status: "apply",
      actionId: "action-1",
      mode: "ADDITIVE_SERVER_RECOMPUTE",
    },
  );
});

test("discards revoked or expired actions and wipes lifecycle state", () => {
  const sync = {
    action,
    currentUserId: "user-1",
    selectedHomeId: "home-1",
    deviceId: "device-1",
    installationId: "install-1",
    now: new Date("2026-07-27T12:00:00.000Z"),
    sessionVerified: true,
    hasCurrentMembership: true,
    role: "OWNER" as const,
    serverRevision: "revision-10",
    duplicateApplied: false,
    additiveReplaySafe: false,
  };

  assert.deepEqual(
    decideOfflineSync({ ...sync, sessionVerified: false }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    decideOfflineSync({ ...sync, hasCurrentMembership: false }),
    {
      status: "discard",
      actionId: "action-1",
      reason: "authorization-revoked",
    },
  );
  assert.deepEqual(
    decideOfflineSync({
      ...sync,
      now: new Date("2026-07-30T00:00:00.000Z"),
    }),
    { status: "discard", actionId: "action-1", reason: "expired" },
  );
  assert.deepEqual(decideOfflineCleanup("DEVICE_REPORTED_LOST"), {
    destroyEncryptionKey: true,
    purgeSnapshot: true,
    purgeQueuedActions: true,
    revokeDeviceRegistration: true,
  });
});
