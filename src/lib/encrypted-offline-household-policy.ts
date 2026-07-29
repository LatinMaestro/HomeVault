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

export const OFFLINE_ROLES = ["OWNER", "ADULT", "CHILD", "GUEST"] as const;
export const OFFLINE_PLATFORMS = ["IOS", "ANDROID"] as const;
export const OFFLINE_KEY_STORES = ["KEYCHAIN", "KEYSTORE"] as const;
export const OFFLINE_CACHE_MAX_BYTES = 25_000_000;
export const OFFLINE_CACHE_TTL_MS = 72 * 60 * 60 * 1000;
export const OFFLINE_QUEUE_MAX_ACTIONS = 100;
export const OFFLINE_EVIDENCE_TTL_MS = 15 * 60 * 1000;

const MAX_IDENTIFIER_LENGTH = 128;
const MIN_OPAQUE_LENGTH = 32;
const MAX_OPAQUE_LENGTH = 256;

export type OfflineRecordType = (typeof OFFLINE_RECORD_TYPES)[number];
export type OfflineMutationType = (typeof OFFLINE_MUTATION_TYPES)[number];
export type OfflineRole = (typeof OFFLINE_ROLES)[number];
export type OfflinePlatform = (typeof OFFLINE_PLATFORMS)[number];
export type OfflineKeyStore = (typeof OFFLINE_KEY_STORES)[number];

export type OfflineSessionEvidence = {
  id: string;
  userId: string;
  verified: boolean;
  expiresAt: Date;
};

export type OfflineMembershipEvidence = {
  id: string;
  revision: number;
  userId: string;
  homeId: string;
  role: OfflineRole;
  active: boolean;
};

export type OfflineCredentialEvidence = {
  id: string;
  userId: string;
  purpose: "offline-enrollment";
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type OfflineDeviceSecurityEvidence = {
  deviceId: string;
  installationId: string;
  platform: OfflinePlatform;
  keyId: string;
  keyVersion: number;
  keyStore: OfflineKeyStore;
  algorithm: "AES_256_GCM";
  hardwareBackedWhenAvailable: boolean;
  passcodeSet: boolean;
  backupExcluded: boolean;
  appAttested: boolean;
  keyUsable: boolean;
};

export type OfflineSnapshot = {
  id: string;
  version: number;
  userId: string;
  homeId: string;
  membershipId: string;
  membershipRevision: number;
  role: OfflineRole;
  deviceId: string;
  installationId: string;
  platform: OfflinePlatform;
  keyId: string;
  keyVersion: number;
  schemaVersion: number;
  serverRevision: string;
  recordTypes: readonly OfflineRecordType[];
  issuedAt: Date;
  expiresAt: Date;
  sizeBytes: number;
  ciphertextDigest: string;
  aadDigest: string;
  encrypted: boolean;
  backupExcluded: boolean;
};

export type OfflineSnapshotIntegrityEvidence = {
  id: string;
  snapshotId: string;
  snapshotVersion: number;
  keyId: string;
  keyVersion: number;
  ciphertextDigest: string;
  aadDigest: string;
  authenticationTagVerified: boolean;
};

export type OfflineQueuedAction = {
  id: string;
  version: number;
  clientMutationId: string;
  snapshotId: string;
  snapshotVersion: number;
  userId: string;
  homeId: string;
  membershipId: string;
  membershipRevision: number;
  deviceId: string;
  installationId: string;
  mutationType: OfflineMutationType;
  recordType: OfflineRecordType;
  recordId: string;
  baseServerRevision: string;
  payloadDigest: string;
  aadDigest: string;
  payloadEncrypted: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export type OfflineActionIntegrityEvidence = {
  id: string;
  actionId: string;
  actionVersion: number;
  clientMutationId: string;
  payloadDigest: string;
  aadDigest: string;
  authenticationTagVerified: boolean;
};

export type OfflineIdempotencyEvidence = {
  key: string;
  userId: string;
  homeId: string;
  clientMutationId: string;
  alreadyApplied: boolean;
  serverResultId: string | null;
};

export type OfflineServerRecordEvidence = {
  id: string;
  revision: string;
  homeId: string;
  recordType: OfflineRecordType;
  active: boolean;
};

export type OfflineAdditiveReplayEvidence = {
  id: string;
  actionId: string;
  recordId: string;
  serverRevision: string;
  recomputeOnServer: boolean;
  completionNotAlreadyPresent: boolean;
};

export type OfflineEnrollmentDecision =
  | {
      status: "offline-enabled";
      plan: {
        userId: string;
        homeId: string;
        membershipId: string;
        membershipRevision: number;
        role: OfflineRole;
        deviceId: string;
        installationId: string;
        platform: OfflinePlatform;
        keyId: string;
        keyVersion: number;
        keyStore: OfflineKeyStore;
        recordTypes: OfflineRecordType[];
        expiresAt: Date;
        maxBytes: number;
        encryption: "AES_256_GCM";
        credentialEvidenceId: string;
        consumeCredentialEvidence: true;
        backupExcluded: true;
        remoteRevocationRequired: true;
      };
    }
  | { status: "credential-confirmation-required" }
  | { status: "invalid-scope" }
  | { status: "insecure-device" }
  | { status: "unavailable" };

export type OfflineReadDecision =
  | {
      status: "offline-readable";
      snapshotId: string;
      snapshotVersion: number;
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
      plan: {
        actionId: string;
        actionVersion: number;
        clientMutationId: string;
        expectedQueueSize: number;
        snapshotId: string;
        snapshotVersion: number;
        requiresServerReplayAuthorization: true;
      };
    }
  | { status: "queue-full" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type OfflineSyncDecision =
  | {
      status: "apply";
      plan: {
        actionId: string;
        expectedActionVersion: number;
        clientMutationId: string;
        membershipId: string;
        membershipRevision: number;
        expectedServerRevision: string;
        mode: "EXACT_REVISION" | "ADDITIVE_SERVER_RECOMPUTE";
        idempotencyKey: string;
        recordResultBeforeQueueRemoval: true;
      };
    }
  | { status: "duplicate"; actionId: string; serverResultId: string }
  | { status: "conflict-review"; actionId: string }
  | {
      status: "discard";
      actionId: string;
      reason: "expired" | "authorization-revoked";
    }
  | { status: "unavailable" };

export const OFFLINE_CLEANUP_EVENTS = [
  "CACHE_EXPIRED",
  "ACCOUNT_SWITCHED",
  "SIGNED_OUT",
  "ACCOUNT_DELETED",
  "MEMBERSHIP_REVOKED",
  "DEVICE_REPORTED_LOST",
  "APP_REINSTALLED",
  "KEY_INVALIDATED",
] as const;
export type OfflineCleanupEvent = (typeof OFFLINE_CLEANUP_EVENTS)[number];

export type OfflineCleanupDecision =
  | {
      status: "cleanup-plan";
      plan: {
        destroyEncryptionKey: true;
        purgeSnapshot: true;
        purgeQueuedActions: true;
        revokeDeviceRegistration: boolean;
        redactHouseholdDataFromLogs: true;
      };
    }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    value === value.trim() &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value)
  );
}

function isOpaque(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_OPAQUE_LENGTH &&
    value.length <= MAX_OPAQUE_LENGTH &&
    /^[A-Za-z0-9_-]+$/u.test(value)
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

function isRole(value: unknown): value is OfflineRole {
  return (
    typeof value === "string" && OFFLINE_ROLES.includes(value as OfflineRole)
  );
}

function isRecordType(value: unknown): value is OfflineRecordType {
  return (
    typeof value === "string" &&
    OFFLINE_RECORD_TYPES.includes(value as OfflineRecordType)
  );
}

function isMutationType(value: unknown): value is OfflineMutationType {
  return (
    typeof value === "string" &&
    OFFLINE_MUTATION_TYPES.includes(value as OfflineMutationType)
  );
}

function isPlatform(value: unknown): value is OfflinePlatform {
  return (
    typeof value === "string" &&
    OFFLINE_PLATFORMS.includes(value as OfflinePlatform)
  );
}

function isKeyStore(value: unknown): value is OfflineKeyStore {
  return (
    typeof value === "string" &&
    OFFLINE_KEY_STORES.includes(value as OfflineKeyStore)
  );
}

function hasWriteRole(role: OfflineRole) {
  return role === "OWNER" || role === "ADULT";
}

function hasValidRecordScope(
  recordTypes: readonly unknown[],
): recordTypes is readonly OfflineRecordType[] {
  return (
    recordTypes.length > 0 &&
    recordTypes.every(isRecordType) &&
    new Set(recordTypes).size === recordTypes.length
  );
}

function isShortEvidence(issuedAt: Date, expiresAt: Date, now: Date) {
  return (
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <= OFFLINE_EVIDENCE_TTL_MS
  );
}

function parseSession(value: unknown): OfflineSessionEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.id) ||
    !isCanonicalId(value.userId) ||
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

function parseMembership(value: unknown): OfflineMembershipEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    !isPositiveInteger(value.revision) ||
    !isCanonicalId(value.userId) ||
    !isCanonicalId(value.homeId) ||
    !isRole(value.role) ||
    !isExactBoolean(value.active)
  ) {
    return null;
  }
  return {
    id: value.id,
    revision: value.revision,
    userId: value.userId,
    homeId: value.homeId,
    role: value.role,
    active: value.active,
  };
}

function parseCredential(value: unknown): OfflineCredentialEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.id) ||
    !isCanonicalId(value.userId) ||
    value.purpose !== "offline-enrollment" ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }
  return {
    id: value.id,
    userId: value.userId,
    purpose: "offline-enrollment",
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseDevice(value: unknown): OfflineDeviceSecurityEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.deviceId) ||
    !isCanonicalId(value.installationId) ||
    !isPlatform(value.platform) ||
    !isOpaque(value.keyId) ||
    !isPositiveInteger(value.keyVersion) ||
    !isKeyStore(value.keyStore) ||
    value.algorithm !== "AES_256_GCM" ||
    !isExactBoolean(value.hardwareBackedWhenAvailable) ||
    !isExactBoolean(value.passcodeSet) ||
    !isExactBoolean(value.backupExcluded) ||
    !isExactBoolean(value.appAttested) ||
    !isExactBoolean(value.keyUsable)
  ) {
    return null;
  }
  return value as OfflineDeviceSecurityEvidence;
}

function parseSnapshot(value: unknown): OfflineSnapshot | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    !isPositiveInteger(value.version) ||
    !isCanonicalId(value.userId) ||
    !isCanonicalId(value.homeId) ||
    !isCanonicalId(value.membershipId) ||
    !isPositiveInteger(value.membershipRevision) ||
    !isRole(value.role) ||
    !isCanonicalId(value.deviceId) ||
    !isCanonicalId(value.installationId) ||
    !isPlatform(value.platform) ||
    !isOpaque(value.keyId) ||
    !isPositiveInteger(value.keyVersion) ||
    !isPositiveInteger(value.schemaVersion) ||
    !isOpaque(value.serverRevision) ||
    !Array.isArray(value.recordTypes) ||
    !hasValidRecordScope(value.recordTypes) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    value.expiresAt.getTime() <= value.issuedAt.getTime() ||
    value.expiresAt.getTime() - value.issuedAt.getTime() > OFFLINE_CACHE_TTL_MS ||
    !isPositiveInteger(value.sizeBytes) ||
    value.sizeBytes > OFFLINE_CACHE_MAX_BYTES ||
    !isOpaque(value.ciphertextDigest) ||
    !isOpaque(value.aadDigest) ||
    !isExactBoolean(value.encrypted) ||
    !isExactBoolean(value.backupExcluded)
  ) {
    return null;
  }
  return value as OfflineSnapshot;
}

function parseSnapshotIntegrity(
  value: unknown,
): OfflineSnapshotIntegrityEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.id) ||
    !isCanonicalId(value.snapshotId) ||
    !isPositiveInteger(value.snapshotVersion) ||
    !isOpaque(value.keyId) ||
    !isPositiveInteger(value.keyVersion) ||
    !isOpaque(value.ciphertextDigest) ||
    !isOpaque(value.aadDigest) ||
    !isExactBoolean(value.authenticationTagVerified)
  ) {
    return null;
  }
  return value as OfflineSnapshotIntegrityEvidence;
}

function parseAction(value: unknown): OfflineQueuedAction | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    !isPositiveInteger(value.version) ||
    !isOpaque(value.clientMutationId) ||
    !isCanonicalId(value.snapshotId) ||
    !isPositiveInteger(value.snapshotVersion) ||
    !isCanonicalId(value.userId) ||
    !isCanonicalId(value.homeId) ||
    !isCanonicalId(value.membershipId) ||
    !isPositiveInteger(value.membershipRevision) ||
    !isCanonicalId(value.deviceId) ||
    !isCanonicalId(value.installationId) ||
    !isMutationType(value.mutationType) ||
    !isRecordType(value.recordType) ||
    !isCanonicalId(value.recordId) ||
    !isOpaque(value.baseServerRevision) ||
    !isOpaque(value.payloadDigest) ||
    !isOpaque(value.aadDigest) ||
    !isExactBoolean(value.payloadEncrypted) ||
    !isValidDate(value.createdAt) ||
    !isValidDate(value.expiresAt) ||
    value.expiresAt.getTime() <= value.createdAt.getTime()
  ) {
    return null;
  }
  return value as OfflineQueuedAction;
}

function parseActionIntegrity(
  value: unknown,
): OfflineActionIntegrityEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.id) ||
    !isCanonicalId(value.actionId) ||
    !isPositiveInteger(value.actionVersion) ||
    !isOpaque(value.clientMutationId) ||
    !isOpaque(value.payloadDigest) ||
    !isOpaque(value.aadDigest) ||
    !isExactBoolean(value.authenticationTagVerified)
  ) {
    return null;
  }
  return value as OfflineActionIntegrityEvidence;
}

function parseIdempotency(
  value: unknown,
): OfflineIdempotencyEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.key) ||
    !isCanonicalId(value.userId) ||
    !isCanonicalId(value.homeId) ||
    !isOpaque(value.clientMutationId) ||
    !isExactBoolean(value.alreadyApplied) ||
    !(
      value.serverResultId === null ||
      isCanonicalId(value.serverResultId)
    ) ||
    (value.alreadyApplied === true && value.serverResultId === null) ||
    (value.alreadyApplied === false && value.serverResultId !== null)
  ) {
    return null;
  }
  return value as OfflineIdempotencyEvidence;
}

function parseServerRecord(
  value: unknown,
): OfflineServerRecordEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalId(value.id) ||
    !isOpaque(value.revision) ||
    !isCanonicalId(value.homeId) ||
    !isRecordType(value.recordType) ||
    !isExactBoolean(value.active)
  ) {
    return null;
  }
  return value as OfflineServerRecordEvidence;
}

function parseAdditive(
  value: unknown,
): OfflineAdditiveReplayEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaque(value.id) ||
    !isCanonicalId(value.actionId) ||
    !isCanonicalId(value.recordId) ||
    !isOpaque(value.serverRevision) ||
    !isExactBoolean(value.recomputeOnServer) ||
    !isExactBoolean(value.completionNotAlreadyPresent)
  ) {
    return null;
  }
  return value as OfflineAdditiveReplayEvidence;
}

export function decideOfflineEnrollment({
  currentUserId,
  selectedHomeId,
  session: rawSession,
  membership: rawMembership,
  credential: rawCredential,
  device: rawDevice,
  userOptedIn,
  requestedRecordTypes,
  requestedMaxBytes,
  now = new Date(),
}: {
  currentUserId: string;
  selectedHomeId: string;
  session: OfflineSessionEvidence;
  membership: OfflineMembershipEvidence;
  credential: OfflineCredentialEvidence | null;
  device: OfflineDeviceSecurityEvidence;
  userOptedIn: boolean;
  requestedRecordTypes: readonly string[];
  requestedMaxBytes: number;
  now?: Date;
}): OfflineEnrollmentDecision {
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const credential = rawCredential === null ? null : parseCredential(rawCredential);
  const device = parseDevice(rawDevice);
  if (
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isExactBoolean(userOptedIn) ||
    !isValidDate(now) ||
    !session ||
    !membership ||
    !device ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    membership.active !== true ||
    userOptedIn !== true
  ) {
    return { status: "unavailable" };
  }

  if (!credential) {
    return { status: "credential-confirmation-required" };
  }
  if (
    credential.userId !== currentUserId ||
    credential.consumed !== false ||
    !isShortEvidence(credential.issuedAt, credential.expiresAt, now)
  ) {
    return { status: "unavailable" };
  }
  if (
    device.keyUsable !== true ||
    device.passcodeSet !== true ||
    device.backupExcluded !== true ||
    device.appAttested !== true ||
    device.hardwareBackedWhenAvailable !== true ||
    (device.platform === "IOS" && device.keyStore !== "KEYCHAIN") ||
    (device.platform === "ANDROID" && device.keyStore !== "KEYSTORE")
  ) {
    return { status: "insecure-device" };
  }
  if (
    !Array.isArray(requestedRecordTypes) ||
    !hasValidRecordScope(requestedRecordTypes) ||
    !isPositiveInteger(requestedMaxBytes) ||
    requestedMaxBytes > OFFLINE_CACHE_MAX_BYTES
  ) {
    return { status: "invalid-scope" };
  }

  return {
    status: "offline-enabled",
    plan: {
      userId: currentUserId,
      homeId: selectedHomeId,
      membershipId: membership.id,
      membershipRevision: membership.revision,
      role: membership.role,
      deviceId: device.deviceId,
      installationId: device.installationId,
      platform: device.platform,
      keyId: device.keyId,
      keyVersion: device.keyVersion,
      keyStore: device.keyStore,
      recordTypes: [...requestedRecordTypes],
      expiresAt: new Date(now.getTime() + OFFLINE_CACHE_TTL_MS),
      maxBytes: requestedMaxBytes,
      encryption: "AES_256_GCM",
      credentialEvidenceId: credential.id,
      consumeCredentialEvidence: true,
      backupExcluded: true,
      remoteRevocationRequired: true,
    },
  };
}

export function decideOfflineRead({
  snapshot: rawSnapshot,
  integrity: rawIntegrity,
  device: rawDevice,
  currentUserId,
  selectedHomeId,
  now = new Date(),
  membershipState,
  deviceReportedLost,
}: {
  snapshot: OfflineSnapshot;
  integrity: OfflineSnapshotIntegrityEvidence;
  device: OfflineDeviceSecurityEvidence;
  currentUserId: string;
  selectedHomeId: string;
  now?: Date;
  membershipState: "CURRENT" | "REVOKED" | "UNKNOWN_OFFLINE";
  deviceReportedLost: boolean;
}): OfflineReadDecision {
  const snapshot = parseSnapshot(rawSnapshot);
  const integrity = parseSnapshotIntegrity(rawIntegrity);
  const device = parseDevice(rawDevice);
  if (
    !snapshot ||
    snapshot.encrypted !== true ||
    snapshot.backupExcluded !== true ||
    !integrity ||
    integrity.snapshotId !== snapshot.id ||
    integrity.snapshotVersion !== snapshot.version ||
    integrity.keyId !== snapshot.keyId ||
    integrity.keyVersion !== snapshot.keyVersion ||
    integrity.ciphertextDigest !== snapshot.ciphertextDigest ||
    integrity.aadDigest !== snapshot.aadDigest ||
    integrity.authenticationTagVerified !== true
  ) {
    return { status: "purge-required", reason: "integrity-failed" };
  }
  if (
    !device ||
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isValidDate(now) ||
    !["CURRENT", "REVOKED", "UNKNOWN_OFFLINE"].includes(membershipState) ||
    !isExactBoolean(deviceReportedLost)
  ) {
    return { status: "unavailable" };
  }
  if (
    snapshot.userId !== currentUserId ||
    snapshot.homeId !== selectedHomeId ||
    snapshot.deviceId !== device.deviceId ||
    snapshot.installationId !== device.installationId ||
    snapshot.platform !== device.platform ||
    snapshot.keyId !== device.keyId ||
    snapshot.keyVersion !== device.keyVersion ||
    device.keyUsable !== true ||
    device.passcodeSet !== true ||
    device.backupExcluded !== true ||
    device.appAttested !== true ||
    deviceReportedLost === true
  ) {
    return { status: "purge-required", reason: "device-binding-changed" };
  }
  if (membershipState === "REVOKED") {
    return { status: "purge-required", reason: "authorization-revoked" };
  }
  if (
    snapshot.issuedAt.getTime() > now.getTime() ||
    snapshot.expiresAt.getTime() <= now.getTime()
  ) {
    return { status: "purge-required", reason: "expired" };
  }
  return {
    status: "offline-readable",
    snapshotId: snapshot.id,
    snapshotVersion: snapshot.version,
    stale:
      membershipState === "UNKNOWN_OFFLINE" ||
      now.getTime() - snapshot.issuedAt.getTime() >= 24 * 60 * 60 * 1000,
    serverAuthorizationRequiredForWrites: true,
  };
}

export function decideOfflineQueue({
  snapshot: rawSnapshot,
  integrity: rawIntegrity,
  action: rawAction,
  actionIntegrity: rawActionIntegrity,
  currentUserId,
  selectedHomeId,
  now = new Date(),
  queueSize,
}: {
  snapshot: OfflineSnapshot;
  integrity: OfflineSnapshotIntegrityEvidence;
  action: OfflineQueuedAction;
  actionIntegrity: OfflineActionIntegrityEvidence;
  currentUserId: string;
  selectedHomeId: string;
  now?: Date;
  queueSize: number;
}): OfflineQueueDecision {
  const snapshot = parseSnapshot(rawSnapshot);
  const integrity = parseSnapshotIntegrity(rawIntegrity);
  const action = parseAction(rawAction);
  const actionIntegrity = parseActionIntegrity(rawActionIntegrity);
  if (
    !snapshot ||
    snapshot.encrypted !== true ||
    snapshot.backupExcluded !== true ||
    !integrity ||
    integrity.snapshotId !== snapshot.id ||
    integrity.snapshotVersion !== snapshot.version ||
    integrity.keyId !== snapshot.keyId ||
    integrity.keyVersion !== snapshot.keyVersion ||
    integrity.ciphertextDigest !== snapshot.ciphertextDigest ||
    integrity.aadDigest !== snapshot.aadDigest ||
    integrity.authenticationTagVerified !== true ||
    !action ||
    action.payloadEncrypted !== true ||
    !actionIntegrity ||
    actionIntegrity.actionId !== action.id ||
    actionIntegrity.actionVersion !== action.version ||
    actionIntegrity.clientMutationId !== action.clientMutationId ||
    actionIntegrity.payloadDigest !== action.payloadDigest ||
    actionIntegrity.aadDigest !== action.aadDigest ||
    actionIntegrity.authenticationTagVerified !== true ||
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isValidDate(now) ||
    !isNonNegativeInteger(queueSize) ||
    snapshot.userId !== currentUserId ||
    snapshot.homeId !== selectedHomeId ||
    action.userId !== currentUserId ||
    action.homeId !== selectedHomeId ||
    action.snapshotId !== snapshot.id ||
    action.snapshotVersion !== snapshot.version ||
    action.membershipId !== snapshot.membershipId ||
    action.membershipRevision !== snapshot.membershipRevision ||
    action.deviceId !== snapshot.deviceId ||
    action.installationId !== snapshot.installationId ||
    action.baseServerRevision !== snapshot.serverRevision ||
    action.createdAt.getTime() > now.getTime() ||
    action.expiresAt.getTime() <= now.getTime() ||
    action.expiresAt.getTime() > snapshot.expiresAt.getTime() ||
    snapshot.expiresAt.getTime() <= now.getTime() ||
    (action.mutationType === "COMPLETE_MAINTENANCE" &&
      action.recordType !== "MAINTENANCE")
  ) {
    return { status: "unavailable" };
  }
  if (!hasWriteRole(snapshot.role)) {
    return { status: "read-only" };
  }
  if (queueSize >= OFFLINE_QUEUE_MAX_ACTIONS) {
    return { status: "queue-full" };
  }
  return {
    status: "queued",
    plan: {
      actionId: action.id,
      actionVersion: action.version,
      clientMutationId: action.clientMutationId,
      expectedQueueSize: queueSize,
      snapshotId: snapshot.id,
      snapshotVersion: snapshot.version,
      requiresServerReplayAuthorization: true,
    },
  };
}

export function decideOfflineSync({
  action: rawAction,
  integrity: rawIntegrity,
  currentUserId,
  selectedHomeId,
  session: rawSession,
  membership: rawMembership,
  record: rawRecord,
  idempotency: rawIdempotency,
  additive: rawAdditive,
  now = new Date(),
}: {
  action: OfflineQueuedAction;
  integrity: OfflineActionIntegrityEvidence;
  currentUserId: string;
  selectedHomeId: string;
  session: OfflineSessionEvidence;
  membership: OfflineMembershipEvidence;
  record: OfflineServerRecordEvidence;
  idempotency: OfflineIdempotencyEvidence;
  additive: OfflineAdditiveReplayEvidence | null;
  now?: Date;
}): OfflineSyncDecision {
  const action = parseAction(rawAction);
  const integrity = parseActionIntegrity(rawIntegrity);
  const session = parseSession(rawSession);
  const membership = parseMembership(rawMembership);
  const record = parseServerRecord(rawRecord);
  const idempotency = parseIdempotency(rawIdempotency);
  const additive = rawAdditive === null ? null : parseAdditive(rawAdditive);
  if (
    !action ||
    action.payloadEncrypted !== true ||
    !integrity ||
    integrity.actionId !== action.id ||
    integrity.actionVersion !== action.version ||
    integrity.clientMutationId !== action.clientMutationId ||
    integrity.payloadDigest !== action.payloadDigest ||
    integrity.aadDigest !== action.aadDigest ||
    integrity.authenticationTagVerified !== true ||
    !session ||
    !membership ||
    !record ||
    !idempotency ||
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isValidDate(now) ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    action.userId !== currentUserId ||
    action.homeId !== selectedHomeId ||
    membership.userId !== currentUserId ||
    membership.homeId !== selectedHomeId ||
    record.id !== action.recordId ||
    record.homeId !== selectedHomeId ||
    record.recordType !== action.recordType ||
    record.active !== true ||
    idempotency.userId !== currentUserId ||
    idempotency.homeId !== selectedHomeId ||
    idempotency.clientMutationId !== action.clientMutationId
  ) {
    return { status: "unavailable" };
  }
  if (
    membership.active !== true ||
    !hasWriteRole(membership.role) ||
    membership.id !== action.membershipId
  ) {
    return {
      status: "discard",
      actionId: action.id,
      reason: "authorization-revoked",
    };
  }
  if (idempotency.alreadyApplied === true) {
    return {
      status: "duplicate",
      actionId: action.id,
      serverResultId: idempotency.serverResultId as string,
    };
  }
  if (
    action.createdAt.getTime() > now.getTime() ||
    action.expiresAt.getTime() <= now.getTime()
  ) {
    return { status: "discard", actionId: action.id, reason: "expired" };
  }

  let mode: "EXACT_REVISION" | "ADDITIVE_SERVER_RECOMPUTE";
  if (action.baseServerRevision === record.revision) {
    mode = "EXACT_REVISION";
  } else if (
    action.mutationType === "COMPLETE_MAINTENANCE" &&
    action.recordType === "MAINTENANCE" &&
    additive &&
    additive.actionId === action.id &&
    additive.recordId === action.recordId &&
    additive.serverRevision === record.revision &&
    additive.recomputeOnServer === true &&
    additive.completionNotAlreadyPresent === true
  ) {
    mode = "ADDITIVE_SERVER_RECOMPUTE";
  } else {
    return { status: "conflict-review", actionId: action.id };
  }

  return {
    status: "apply",
    plan: {
      actionId: action.id,
      expectedActionVersion: action.version,
      clientMutationId: action.clientMutationId,
      membershipId: membership.id,
      membershipRevision: membership.revision,
      expectedServerRevision: record.revision,
      mode,
      idempotencyKey: idempotency.key,
      recordResultBeforeQueueRemoval: true,
    },
  };
}

export function decideOfflineCleanup(event: unknown): OfflineCleanupDecision {
  if (
    typeof event !== "string" ||
    !OFFLINE_CLEANUP_EVENTS.includes(event as OfflineCleanupEvent)
  ) {
    return { status: "unavailable" };
  }
  return {
    status: "cleanup-plan",
    plan: {
      destroyEncryptionKey: true,
      purgeSnapshot: true,
      purgeQueuedActions: true,
      revokeDeviceRegistration:
        event === "DEVICE_REPORTED_LOST" ||
        event === "ACCOUNT_DELETED" ||
        event === "MEMBERSHIP_REVOKED",
      redactHouseholdDataFromLogs: true,
    },
  };
}
