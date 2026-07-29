import assert from "node:assert/strict";
import test from "node:test";

import {
  OFFLINE_CACHE_MAX_BYTES,
  OFFLINE_CACHE_TTL_MS,
  OFFLINE_QUEUE_MAX_ACTIONS,
  decideOfflineCleanup,
  decideOfflineEnrollment,
  decideOfflineQueue,
  decideOfflineRead,
  decideOfflineSync,
  type OfflineActionIntegrityEvidence,
  type OfflineAdditiveReplayEvidence,
  type OfflineCredentialEvidence,
  type OfflineDeviceSecurityEvidence,
  type OfflineIdempotencyEvidence,
  type OfflineMembershipEvidence,
  type OfflineQueuedAction,
  type OfflineServerRecordEvidence,
  type OfflineSessionEvidence,
  type OfflineSnapshot,
  type OfflineSnapshotIntegrityEvidence,
} from "../src/encrypted-offline-household-policy.ts";

const now = new Date("2026-07-29T08:00:00.000Z");
const revision = "c2VydmVyX3JldmlzaW9uXzAwMDAwMDAx";
const laterRevision = "c2VydmVyX3JldmlzaW9uXzAwMDAwMDAy";
const session: OfflineSessionEvidence = {
  id: "c2Vzc2lvbl9vZmZsaW5lX2V4YWN0XzAwMQ",
  userId: "user1",
  verified: true,
  expiresAt: new Date("2026-07-29T09:00:00.000Z"),
};
const membership: OfflineMembershipEvidence = {
  id: "member1",
  revision: 4,
  userId: "user1",
  homeId: "home1",
  role: "OWNER",
  active: true,
};
const credential: OfflineCredentialEvidence = {
  id: "Y3JlZGVudGlhbF9vZmZsaW5lX2V4YWN0XzAwMQ",
  userId: "user1",
  purpose: "offline-enrollment",
  issuedAt: new Date("2026-07-29T07:55:00.000Z"),
  expiresAt: new Date("2026-07-29T08:10:00.000Z"),
  consumed: false,
};
const device: OfflineDeviceSecurityEvidence = {
  deviceId: "device1",
  installationId: "install1",
  platform: "IOS",
  keyId: "cGxhdGZvcm1fa2V5X29mZmxpbmVfMDAx",
  keyVersion: 3,
  keyStore: "KEYCHAIN",
  algorithm: "AES_256_GCM",
  hardwareBackedWhenAvailable: true,
  passcodeSet: true,
  backupExcluded: true,
  appAttested: true,
  keyUsable: true,
};
const snapshot: OfflineSnapshot = {
  id: "snapshot1",
  version: 3,
  userId: "user1",
  homeId: "home1",
  membershipId: "member1",
  membershipRevision: 4,
  role: "OWNER",
  deviceId: "device1",
  installationId: "install1",
  platform: "IOS",
  keyId: device.keyId,
  keyVersion: device.keyVersion,
  schemaVersion: 2,
  serverRevision: revision,
  recordTypes: ["ASSETS", "MAINTENANCE", "REMINDERS"],
  issuedAt: new Date("2026-07-29T07:00:00.000Z"),
  expiresAt: new Date("2026-08-01T07:00:00.000Z"),
  sizeBytes: 2_000_000,
  ciphertextDigest: "Y2lwaGVydGV4dF9kaWdlc3Rfb2ZmbGluZV8wMDE",
  aadDigest: "YWFkX2RpZ2VzdF9vZmZsaW5lX2V4YWN0XzAwMQ",
  encrypted: true,
  backupExcluded: true,
};
const snapshotIntegrity: OfflineSnapshotIntegrityEvidence = {
  id: "aW50ZWdyaXR5X3NuYXBzaG90X29mZmxpbmVfMDAx",
  snapshotId: snapshot.id,
  snapshotVersion: snapshot.version,
  keyId: snapshot.keyId,
  keyVersion: snapshot.keyVersion,
  ciphertextDigest: snapshot.ciphertextDigest,
  aadDigest: snapshot.aadDigest,
  authenticationTagVerified: true,
};
const action: OfflineQueuedAction = {
  id: "action1",
  version: 2,
  clientMutationId: "Y2xpZW50X211dGF0aW9uX29mZmxpbmVfMDAx",
  snapshotId: snapshot.id,
  snapshotVersion: snapshot.version,
  userId: "user1",
  homeId: "home1",
  membershipId: "member1",
  membershipRevision: 4,
  deviceId: "device1",
  installationId: "install1",
  mutationType: "UPDATE_RECORD",
  recordType: "ASSETS",
  recordId: "asset1",
  baseServerRevision: revision,
  payloadDigest: "cGF5bG9hZF9kaWdlc3Rfb2ZmbGluZV8wMDE",
  aadDigest: "YWN0aW9uX2FhZF9kaWdlc3Rfb2ZmbGluZV8wMDE",
  payloadEncrypted: true,
  createdAt: new Date("2026-07-29T07:30:00.000Z"),
  expiresAt: new Date("2026-07-30T07:30:00.000Z"),
};
const actionIntegrity: OfflineActionIntegrityEvidence = {
  id: "aW50ZWdyaXR5X2FjdGlvbl9vZmZsaW5lXzAwMQ",
  actionId: action.id,
  actionVersion: action.version,
  clientMutationId: action.clientMutationId,
  payloadDigest: action.payloadDigest,
  aadDigest: action.aadDigest,
  authenticationTagVerified: true,
};
const record: OfflineServerRecordEvidence = {
  id: "asset1",
  revision,
  homeId: "home1",
  recordType: "ASSETS",
  active: true,
};
const idempotency: OfflineIdempotencyEvidence = {
  key: "aWRlbXBvdGVuY3lfb2ZmbGluZV9leGFjdF8wMDE",
  userId: "user1",
  homeId: "home1",
  clientMutationId: action.clientMutationId,
  alreadyApplied: false,
  serverResultId: null,
};

function enroll(overrides: Record<string, unknown> = {}) {
  return decideOfflineEnrollment({
    currentUserId: "user1",
    selectedHomeId: "home1",
    session,
    membership,
    credential,
    device,
    userOptedIn: true,
    requestedRecordTypes: ["ASSETS", "MAINTENANCE"],
    requestedMaxBytes: 10_000_000,
    now,
    ...overrides,
  });
}

function read(overrides: Record<string, unknown> = {}) {
  return decideOfflineRead({
    snapshot,
    integrity: snapshotIntegrity,
    device,
    currentUserId: "user1",
    selectedHomeId: "home1",
    now,
    membershipState: "CURRENT",
    deviceReportedLost: false,
    ...overrides,
  });
}

function queue(overrides: Record<string, unknown> = {}) {
  return decideOfflineQueue({
    snapshot,
    integrity: snapshotIntegrity,
    action,
    actionIntegrity,
    currentUserId: "user1",
    selectedHomeId: "home1",
    now,
    queueSize: 3,
    ...overrides,
  });
}

function sync(overrides: Record<string, unknown> = {}) {
  return decideOfflineSync({
    action,
    integrity: actionIntegrity,
    currentUserId: "user1",
    selectedHomeId: "home1",
    session,
    membership,
    record,
    idempotency,
    additive: null,
    now,
    ...overrides,
  });
}

test("enrollment binds exact account, membership, device, key and scope", () => {
  const result = enroll();
  assert.equal(result.status, "offline-enabled");
  if (result.status === "offline-enabled") {
    assert.equal(result.plan.membershipRevision, 4);
    assert.equal(result.plan.keyId, device.keyId);
    assert.equal(result.plan.consumeCredentialEvidence, true);
    assert.equal(
      result.plan.expiresAt.getTime(),
      now.getTime() + OFFLINE_CACHE_TTL_MS,
    );
  }
});

test("credential confirmation is purpose-bound, short-lived and single-use", () => {
  assert.equal(enroll({ credential: null }).status, "credential-confirmation-required");
  assert.equal(
    enroll({ credential: { ...credential, consumed: true } }).status,
    "unavailable",
  );
  assert.equal(
    enroll({
      credential: {
        ...credential,
        expiresAt: new Date("2026-07-29T09:00:00.000Z"),
      },
    }).status,
    "unavailable",
  );
});

test("truthy and cross-property enrollment evidence fails closed", () => {
  assert.equal(
    enroll({ session: { ...session, verified: 1 } }).status,
    "unavailable",
  );
  assert.equal(
    enroll({ membership: { ...membership, homeId: "home2" } }).status,
    "unavailable",
  );
  assert.equal(enroll({ userOptedIn: "yes" }).status, "unavailable");
});

test("insecure, unattested and mismatched platform key stores are rejected", () => {
  assert.equal(
    enroll({ device: { ...device, passcodeSet: false } }).status,
    "insecure-device",
  );
  assert.equal(
    enroll({ device: { ...device, appAttested: 1 } }).status,
    "unavailable",
  );
  assert.equal(
    enroll({ device: { ...device, keyStore: "KEYSTORE" } }).status,
    "insecure-device",
  );
});

test("offline scope remains allowlisted, duplicate-free and size bounded", () => {
  assert.equal(
    enroll({ requestedRecordTypes: ["ATTACHMENT_BYTES"] }).status,
    "invalid-scope",
  );
  assert.equal(
    enroll({ requestedRecordTypes: ["ASSETS", "ASSETS"] }).status,
    "invalid-scope",
  );
  assert.equal(
    enroll({ requestedMaxBytes: OFFLINE_CACHE_MAX_BYTES + 1 }).status,
    "invalid-scope",
  );
});

test("valid authenticated ciphertext is readable with server writes still required", () => {
  assert.deepEqual(read(), {
    status: "offline-readable",
    snapshotId: "snapshot1",
    snapshotVersion: 3,
    stale: false,
    serverAuthorizationRequiredForWrites: true,
  });
  assert.equal(read({ membershipState: "UNKNOWN_OFFLINE" }).status, "offline-readable");
  assert.equal(
    (read({ membershipState: "UNKNOWN_OFFLINE" }) as { stale: boolean }).stale,
    true,
  );
});

test("snapshot authentication is bound to exact version, key and ciphertext", () => {
  assert.deepEqual(
    read({
      integrity: { ...snapshotIntegrity, snapshotVersion: 2 },
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
  assert.deepEqual(
    read({
      integrity: {
        ...snapshotIntegrity,
        authenticationTagVerified: "yes",
      },
    }),
    { status: "purge-required", reason: "integrity-failed" },
  );
});

test("malformed snapshot timestamps and encryption flags purge safely", () => {
  assert.equal(
    read({ snapshot: { ...snapshot, expiresAt: new Date("invalid") } }).status,
    "purge-required",
  );
  assert.equal(
    read({ snapshot: { ...snapshot, encrypted: 1 } }).status,
    "purge-required",
  );
});

test("identity, installation, key and device-loss changes purge the cache", () => {
  assert.deepEqual(read({ currentUserId: "user2" }), {
    status: "purge-required",
    reason: "device-binding-changed",
  });
  assert.deepEqual(
    read({ device: { ...device, installationId: "install2" } }),
    { status: "purge-required", reason: "device-binding-changed" },
  );
  assert.deepEqual(read({ deviceReportedLost: true }), {
    status: "purge-required",
    reason: "device-binding-changed",
  });
});

test("revocation and expiry purge instead of extending offline authority", () => {
  assert.deepEqual(read({ membershipState: "REVOKED" }), {
    status: "purge-required",
    reason: "authorization-revoked",
  });
  assert.deepEqual(
    read({ now: new Date("2026-08-01T07:00:00.000Z") }),
    { status: "purge-required", reason: "expired" },
  );
});

test("queue admission binds exact snapshot, membership and encrypted payload", () => {
  const result = queue();
  assert.equal(result.status, "queued");
  if (result.status === "queued") {
    assert.equal(result.plan.expectedQueueSize, 3);
    assert.equal(result.plan.snapshotVersion, 3);
    assert.equal(result.plan.requiresServerReplayAuthorization, true);
  }
});

test("role comes from the authenticated snapshot and read-only roles cannot queue", () => {
  assert.deepEqual(
    queue({ snapshot: { ...snapshot, role: "GUEST" } }),
    { status: "read-only" },
  );
});

test("queue rejects substituted, malformed and unsafe action evidence", () => {
  assert.equal(
    queue({ action: { ...action, membershipRevision: 5 } }).status,
    "unavailable",
  );
  assert.equal(
    queue({ action: { ...action, payloadEncrypted: "yes" } }).status,
    "unavailable",
  );
  assert.equal(
    queue({
      actionIntegrity: {
        ...actionIntegrity,
        payloadDigest: snapshot.ciphertextDigest,
      },
    }).status,
    "unavailable",
  );
  assert.equal(
    queue({
      action: {
        ...action,
        mutationType: "COMPLETE_MAINTENANCE",
        recordType: "ASSETS",
      },
    }).status,
    "unavailable",
  );
});

test("queue size is integer bounded and compare-and-set", () => {
  assert.deepEqual(queue({ queueSize: OFFLINE_QUEUE_MAX_ACTIONS }), {
    status: "queue-full",
  });
  assert.equal(queue({ queueSize: -1 }).status, "unavailable");
  assert.equal(queue({ queueSize: 1.5 }).status, "unavailable");
});

test("sync repeats exact session, membership, record and payload authorization", () => {
  const result = sync();
  assert.equal(result.status, "apply");
  if (result.status === "apply") {
    assert.equal(result.plan.mode, "EXACT_REVISION");
    assert.equal(result.plan.membershipRevision, membership.revision);
    assert.equal(result.plan.recordResultBeforeQueueRemoval, true);
  }
  assert.equal(
    sync({ session: { ...session, verified: "yes" } }).status,
    "unavailable",
  );
  assert.equal(
    sync({ record: { ...record, homeId: "home2" } }).status,
    "unavailable",
  );
});

test("idempotency is bound to the mutation and returns the stored result", () => {
  assert.deepEqual(
    sync({
      idempotency: {
        ...idempotency,
        alreadyApplied: true,
        serverResultId: "result1",
      },
    }),
    { status: "duplicate", actionId: "action1", serverResultId: "result1" },
  );
  assert.equal(
    sync({
      idempotency: {
        ...idempotency,
        clientMutationId: snapshot.ciphertextDigest,
      },
    }).status,
    "unavailable",
  );
});

test("revoked roles and expired actions are discarded deterministically", () => {
  assert.deepEqual(
    sync({ membership: { ...membership, active: false } }),
    {
      status: "discard",
      actionId: "action1",
      reason: "authorization-revoked",
    },
  );
  assert.deepEqual(
    sync({
      now: new Date("2026-07-30T07:30:00.000Z"),
      session: {
        ...session,
        expiresAt: new Date("2026-07-30T08:00:00.000Z"),
      },
    }),
    { status: "discard", actionId: "action1", reason: "expired" },
  );
});

test("revision mismatches require review unless exact additive evidence is supplied", () => {
  assert.deepEqual(sync({ record: { ...record, revision: laterRevision } }), {
    status: "conflict-review",
    actionId: "action1",
  });
  const completionAction: OfflineQueuedAction = {
    ...action,
    mutationType: "COMPLETE_MAINTENANCE",
    recordType: "MAINTENANCE",
    recordId: "maintenance1",
  };
  const completionIntegrity: OfflineActionIntegrityEvidence = {
    ...actionIntegrity,
    actionId: completionAction.id,
  };
  const completionRecord: OfflineServerRecordEvidence = {
    id: "maintenance1",
    revision: laterRevision,
    homeId: "home1",
    recordType: "MAINTENANCE",
    active: true,
  };
  const additive: OfflineAdditiveReplayEvidence = {
    id: "YWRkaXRpdmVfcmVwbGF5X29mZmxpbmVfMDAx",
    actionId: completionAction.id,
    recordId: completionAction.recordId,
    serverRevision: laterRevision,
    recomputeOnServer: true,
    completionNotAlreadyPresent: true,
  };
  const result = sync({
    action: completionAction,
    integrity: completionIntegrity,
    record: completionRecord,
    additive,
  });
  assert.equal(result.status, "apply");
  if (result.status === "apply") {
    assert.equal(result.plan.mode, "ADDITIVE_SERVER_RECOMPUTE");
  }
  assert.equal(
    sync({
      action: completionAction,
      integrity: completionIntegrity,
      record: completionRecord,
      additive: { ...additive, recomputeOnServer: 1 },
    }).status,
    "conflict-review",
  );
});

test("cleanup is explicit, complete and unknown events fail closed", () => {
  assert.deepEqual(decideOfflineCleanup("DEVICE_REPORTED_LOST"), {
    status: "cleanup-plan",
    plan: {
      destroyEncryptionKey: true,
      purgeSnapshot: true,
      purgeQueuedActions: true,
      revokeDeviceRegistration: true,
      redactHouseholdDataFromLogs: true,
    },
  });
  assert.equal(decideOfflineCleanup("SIGNED_OUT").status, "cleanup-plan");
  assert.deepEqual(decideOfflineCleanup("UNKNOWN"), { status: "unavailable" });
});
