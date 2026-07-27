export const OFFLINE_RECORD_TYPES = [
  "HOME_PROFILE",
  "ROOMS",
  "ASSETS",
  "MAINTENANCE",
  "REMINDERS",
  "WARRANTIES",
  "RECORD_METADATA",
] as const;

export const OFFLINE_MUTATION_TYPES = [
  "CREATE_RECORD",
  "UPDATE_RECORD",
  "COMPLETE_MAINTENANCE",
] as const;

export const OFFLINE_CACHE_MAX_BYTES = 25_000_000;
export const OFFLINE_CACHE_TTL_MS = 72 * 60 * 60 * 1000;
export const OFFLINE_QUEUE_MAX_ACTIONS = 100;

export type OfflineRecordType = (typeof OFFLINE_RECORD_TYPES)[number];
export type OfflineMutationType = (typeof OFFLINE_MUTATION_TYPES)[number];
export type OfflineRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type OfflineSnapshot = {
  id: string;
  userId: string;
  homeId: string;
  deviceId: string;
  installationId: string;
  keyId: string;
  schemaVersion: number;
  serverRevision: string;
  recordTypes: readonly OfflineRecordType[];
  issuedAt: Date;
  expiresAt: Date;
  sizeBytes: number;
  integrityTag: string;
  encrypted: true;
  backupExcluded: true;
};

export type OfflineQueuedAction = {
  id: string;
  clientMutationId: string;
  userId: string;
  homeId: string;
  deviceId: string;
  installationId: string;
  mutationType: OfflineMutationType;
  recordId: string;
  baseServerRevision: string;
  payloadDigest: string;
  payloadEncrypted: true;
  createdAt: Date;
  expiresAt: Date;
};

export type OfflineEnrollmentDecision =
  | {
      status: "offline-enabled";
      userId: string;
      homeId: string;
      deviceId: string;
      installationId: string;
      recordTypes: OfflineRecordType[];
      expiresAt: Date;
      maxBytes: number;
      encryption: "PLATFORM_WRAPPED_AES_GCM";
      backupExcluded: true;
    }
  | { status: "credential-confirmation-required" }
  | { status: "invalid-scope" }
  | { status: "insecure-device" }
  | { status: "unavailable" };

export type OfflineReadDecision =
  | {
      status: "offline-readable";
      snapshotId: string;
      stale: boolean;
      serverAuthorizationRequiredForWrites: true;
    }
  | {
      status: "purge-required";
      reason:
        | "expired"
        | "authorization-revoked"
        | "device-binding-changed"
        | "integrity-failed";
    }
  | { status: "unavailable" };

export type OfflineQueueDecision =
  | {
      status: "queued";
      actionId: string;
      clientMutationId: string;
      requiresServerReplayAuthorization: true;
    }
  | { status: "queue-full" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type OfflineSyncDecision =
  | {
      status: "apply";
      actionId: string;
      mode: "EXACT_REVISION" | "ADDITIVE_SERVER_RECOMPUTE";
    }
  | { status: "duplicate"; actionId: string }
  | { status: "conflict-review"; actionId: string }
  | { status: "discard"; actionId: string; reason: "expired" | "authorization-revoked" }
  | { status: "unavailable" };

export type OfflineCleanupEvent =
  | "CACHE_EXPIRED"
  | "ACCOUNT_SWITCHED"
  | "SIGNED_OUT"
  | "ACCOUNT_DELETED"
  | "MEMBERSHIP_REVOKED"
  | "DEVICE_REPORTED_LOST"
  | "APP_REINSTALLED"
  | "KEY_INVALIDATED";

export type OfflineCleanupDecision = {
  destroyEncryptionKey: true;
  purgeSnapshot: true;
  purgeQueuedActions: true;
  revokeDeviceRegistration: boolean;
};

function hasWriteRole(role: OfflineRole) {
  return role === "OWNER" || role === "ADULT";
}

function hasValidRecordScope(
  recordTypes: readonly string[],
): recordTypes is readonly OfflineRecordType[] {
  return (
    recordTypes.length > 0 &&
    recordTypes.every((type) =>
      OFFLINE_RECORD_TYPES.includes(type as OfflineRecordType),
    ) &&
    new Set(recordTypes).size === recordTypes.length
  );
}

function isAllowedMutation(value: string): value is OfflineMutationType {
  return OFFLINE_MUTATION_TYPES.includes(value as OfflineMutationType);
}

export function decideOfflineEnrollment({
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  sessionVerified,
  credentialConfirmed,
  hasCurrentMembership,
  userOptedIn,
  devicePasscodeSet,
  platformKeyAvailable,
  backupExcluded,
  requestedRecordTypes,
  requestedMaxBytes,
  now,
}: {
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  sessionVerified: boolean;
  credentialConfirmed: boolean;
  hasCurrentMembership: boolean;
  userOptedIn: boolean;
  devicePasscodeSet: boolean;
  platformKeyAvailable: boolean;
  backupExcluded: boolean;
  requestedRecordTypes: readonly string[];
  requestedMaxBytes: number;
  now: Date;
}): OfflineEnrollmentDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !deviceId ||
    !installationId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !userOptedIn ||
    !platformKeyAvailable
  ) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (!devicePasscodeSet || !backupExcluded) {
    return { status: "insecure-device" };
  }

  if (
    !hasValidRecordScope(requestedRecordTypes) ||
    requestedMaxBytes <= 0 ||
    requestedMaxBytes > OFFLINE_CACHE_MAX_BYTES
  ) {
    return { status: "invalid-scope" };
  }

  return {
    status: "offline-enabled",
    userId: currentUserId,
    homeId: selectedHomeId,
    deviceId,
    installationId,
    recordTypes: [...requestedRecordTypes],
    expiresAt: new Date(now.getTime() + OFFLINE_CACHE_TTL_MS),
    maxBytes: requestedMaxBytes,
    encryption: "PLATFORM_WRAPPED_AES_GCM",
    backupExcluded: true,
  };
}

export function decideOfflineRead({
  snapshot,
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  now,
  membershipState,
  deviceReportedLost,
  platformKeyAvailable,
  integrityValid,
  schemaSupported,
}: {
  snapshot: OfflineSnapshot;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  now: Date;
  membershipState: "CURRENT" | "REVOKED" | "UNKNOWN_OFFLINE";
  deviceReportedLost: boolean;
  platformKeyAvailable: boolean;
  integrityValid: boolean;
  schemaSupported: boolean;
}): OfflineReadDecision {
  if (
    !snapshot.id ||
    !snapshot.keyId ||
    !snapshot.integrityTag ||
    !snapshot.encrypted ||
    !snapshot.backupExcluded ||
    snapshot.sizeBytes <= 0 ||
    snapshot.sizeBytes > OFFLINE_CACHE_MAX_BYTES ||
    !hasValidRecordScope(snapshot.recordTypes)
  ) {
    return { status: "purge-required", reason: "integrity-failed" };
  }

  if (
    snapshot.userId !== currentUserId ||
    snapshot.homeId !== selectedHomeId ||
    snapshot.deviceId !== deviceId ||
    snapshot.installationId !== installationId ||
    deviceReportedLost
  ) {
    return { status: "purge-required", reason: "device-binding-changed" };
  }

  if (membershipState === "REVOKED") {
    return { status: "purge-required", reason: "authorization-revoked" };
  }

  if (now.getTime() >= snapshot.expiresAt.getTime()) {
    return { status: "purge-required", reason: "expired" };
  }

  if (!platformKeyAvailable || !integrityValid || !schemaSupported) {
    return { status: "purge-required", reason: "integrity-failed" };
  }

  return {
    status: "offline-readable",
    snapshotId: snapshot.id,
    stale:
      membershipState === "UNKNOWN_OFFLINE" ||
      now.getTime() - snapshot.issuedAt.getTime() >= 24 * 60 * 60 * 1000,
    serverAuthorizationRequiredForWrites: true,
  };
}

export function decideOfflineQueue({
  snapshot,
  action,
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  role,
  now,
  queueSize,
}: {
  snapshot: OfflineSnapshot;
  action: OfflineQueuedAction;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  role: OfflineRole;
  now: Date;
  queueSize: number;
}): OfflineQueueDecision {
  if (
    !snapshot.id ||
    !action.id ||
    !action.clientMutationId ||
    !action.recordId ||
    !action.payloadDigest ||
    !action.payloadEncrypted ||
    !isAllowedMutation(action.mutationType) ||
    now.getTime() >= snapshot.expiresAt.getTime() ||
    now.getTime() >= action.expiresAt.getTime() ||
    snapshot.userId !== currentUserId ||
    snapshot.homeId !== selectedHomeId ||
    snapshot.deviceId !== deviceId ||
    snapshot.installationId !== installationId ||
    action.userId !== currentUserId ||
    action.homeId !== selectedHomeId ||
    action.deviceId !== deviceId ||
    action.installationId !== installationId ||
    action.baseServerRevision !== snapshot.serverRevision
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (queueSize < 0 || queueSize >= OFFLINE_QUEUE_MAX_ACTIONS) {
    return { status: "queue-full" };
  }

  return {
    status: "queued",
    actionId: action.id,
    clientMutationId: action.clientMutationId,
    requiresServerReplayAuthorization: true,
  };
}

export function decideOfflineSync({
  action,
  currentUserId,
  selectedHomeId,
  now,
  sessionVerified,
  hasCurrentMembership,
  role,
  serverRevision,
  duplicateApplied,
  additiveReplaySafe,
}: {
  action: OfflineQueuedAction;
  currentUserId: string;
  selectedHomeId: string;
  now: Date;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: OfflineRole;
  serverRevision: string;
  duplicateApplied: boolean;
  additiveReplaySafe: boolean;
}): OfflineSyncDecision {
  if (
    !action.id ||
    !action.clientMutationId ||
    !action.payloadDigest ||
    !action.payloadEncrypted ||
    action.userId !== currentUserId ||
    action.homeId !== selectedHomeId
  ) {
    return { status: "unavailable" };
  }

  if (!sessionVerified || !hasCurrentMembership || !hasWriteRole(role)) {
    return {
      status: "discard",
      actionId: action.id,
      reason: "authorization-revoked",
    };
  }

  if (duplicateApplied) {
    return { status: "duplicate", actionId: action.id };
  }

  if (now.getTime() >= action.expiresAt.getTime()) {
    return { status: "discard", actionId: action.id, reason: "expired" };
  }

  if (action.baseServerRevision === serverRevision) {
    return {
      status: "apply",
      actionId: action.id,
      mode: "EXACT_REVISION",
    };
  }

  if (
    action.mutationType === "COMPLETE_MAINTENANCE" &&
    additiveReplaySafe
  ) {
    return {
      status: "apply",
      actionId: action.id,
      mode: "ADDITIVE_SERVER_RECOMPUTE",
    };
  }

  return { status: "conflict-review", actionId: action.id };
}

export function decideOfflineCleanup(
  event: OfflineCleanupEvent,
): OfflineCleanupDecision {
  return {
    destroyEncryptionKey: true,
    purgeSnapshot: true,
    purgeQueuedActions: true,
    revokeDeviceRegistration:
      event === "DEVICE_REPORTED_LOST" ||
      event === "ACCOUNT_DELETED" ||
      event === "MEMBERSHIP_REVOKED",
  };
}
