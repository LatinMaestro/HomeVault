export const NATIVE_UTILITY_TYPES = [
  "WIDGET",
  "APP_SHORTCUT",
  "SHARE_IMPORT_EXTENSION",
] as const;

export const WIDGET_SUMMARY_TYPES = [
  "ATTENTION_COUNT",
  "DUE_MAINTENANCE_COUNT",
  "EXPIRING_WARRANTY_COUNT",
  "REMINDER_COUNT",
] as const;

export const APP_SHORTCUT_ACTIONS = [
  "OPEN_MAINTENANCE",
  "QUICK_ADD",
  "CAPTURE_DOCUMENT",
] as const;

export const NATIVE_IMPORT_MEDIA_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const NATIVE_UTILITY_ROLES = [
  "OWNER",
  "ADULT",
  "CHILD",
  "GUEST",
] as const;

export const NATIVE_UTILITY_CLEANUP_EVENTS = [
  "WIDGET_DISABLED",
  "PROPERTY_SWITCHED",
  "ACCOUNT_SWITCHED",
  "SIGNED_OUT",
  "ACCOUNT_DELETED",
  "MEMBERSHIP_REVOKED",
  "DEVICE_REPORTED_LOST",
  "APP_REINSTALLED",
  "IMPORT_EXPIRED",
  "IMPORT_CANCELLED",
  "IMPORT_COMPLETED",
] as const;

export const WIDGET_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const NATIVE_IMPORT_TTL_MS = 30 * 60 * 1000;
export const NATIVE_PROOF_TTL_MS = 15 * 60 * 1000;
export const MEMBERSHIP_EVIDENCE_TTL_MS = 5 * 60 * 1000;
export const NATIVE_IMPORT_MAX_BYTES = 4_000_000;
export const WIDGET_MAX_COUNT = 9_999;

export type WidgetSummaryType = (typeof WIDGET_SUMMARY_TYPES)[number];
export type AppShortcutAction = (typeof APP_SHORTCUT_ACTIONS)[number];
export type NativeImportMediaType =
  (typeof NATIVE_IMPORT_MEDIA_TYPES)[number];
export type NativeUtilityRole = (typeof NATIVE_UTILITY_ROLES)[number];
export type NativeUtilityCleanupEvent =
  (typeof NATIVE_UTILITY_CLEANUP_EVENTS)[number];

export type VerifiedSessionEvidence = {
  sessionId: string;
  userId: string;
  deviceId: string;
  installationId: string;
  issuedAt: Date;
  expiresAt: Date;
  verified: true;
};

export type MembershipEvidence = {
  membershipId: string;
  userId: string;
  homeId: string;
  role: NativeUtilityRole;
  revision: string;
  state: "ACTIVE" | "REVOKED";
  checkedAt: Date;
  verified: true;
};

export type DeviceSecurityEvidence = {
  deviceId: string;
  installationId: string;
  platform: "IOS" | "ANDROID";
  secureStore: "KEYCHAIN" | "KEYSTORE";
  protectedDataAvailable: true;
  deviceUnlocked: true;
  appAttested: true;
  backupExcluded: true;
};

export type WidgetRegistrationEvidence = {
  registrationId: string;
  userId: string;
  homeId: string;
  deviceId: string;
  installationId: string;
  purpose: "widget-refresh";
  optedIn: true;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type WidgetCount = {
  type: WidgetSummaryType;
  count: number;
};

export type WidgetSnapshot = {
  id: string;
  userId: string;
  homeId: string;
  membershipRevision: string;
  deviceId: string;
  installationId: string;
  counts: readonly WidgetCount[];
  generatedAt: Date;
  expiresAt: Date;
  summaryDigest: string;
  aadDigest: string;
  encryptedAtRest: true;
  backupExcluded: true;
  containsRecordTitles: false;
  containsHouseholdName: false;
  containsAttachmentData: false;
};

export type WidgetIntegrityEvidence = {
  snapshotId: string;
  userId: string;
  homeId: string;
  membershipRevision: string;
  deviceId: string;
  installationId: string;
  summaryDigest: string;
  aadDigest: string;
  authenticationTagVerified: true;
};

export type ShortcutInvocationProof = {
  proofId: string;
  userId: string;
  homeId: string;
  deviceId: string;
  installationId: string;
  action: AppShortcutAction;
  userInitiated: true;
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type NativeImportDraft = {
  id: string;
  userId: string;
  deviceId: string;
  installationId: string;
  localAssetId: string;
  fileName: string;
  mediaType: NativeImportMediaType;
  sizeBytes: number;
  contentDigest: string;
  createdAt: Date;
  expiresAt: Date;
};

export type NativeImportTransferEvidence = {
  transferId: string;
  draftId: string;
  localAssetId: string;
  contentDigest: string;
  sourceExtension: "SHARE_IMPORT_EXTENSION";
  copiedToProtectedContainer: true;
  sourceAccessReleased: true;
  backupExcluded: true;
  completeDataProtection: true;
  signatureVerified: true;
  noUploadPerformed: true;
};

export type NativeImportHandoffProof = {
  proofId: string;
  draftId: string;
  userId: string;
  deviceId: string;
  installationId: string;
  purpose: "native-import-review";
  issuedAt: Date;
  expiresAt: Date;
  consumed: false;
};

export type WidgetRefreshDecision =
  | {
      status: "refresh-authorized";
      userId: string;
      homeId: string;
      membershipRevision: string;
      summaryTypes: WidgetSummaryType[];
      expiresAt: Date;
      consumeRegistrationId: string;
      redacted: true;
      serverAuthorizationRequired: true;
    }
  | { status: "opt-in-required" }
  | { status: "purge-required" }
  | { status: "unavailable" };

export type WidgetReadDecision =
  | {
      status: "widget-readable";
      snapshotId: string;
      stale: boolean;
      countsOnly: true;
      requiresAppUnlockForNavigation: true;
    }
  | {
      status: "purge-required";
      reason:
        | "expired"
        | "authorization-revoked"
        | "binding-changed"
        | "integrity-failed";
    }
  | { status: "unavailable" };

export type ShortcutDecision =
  | {
      status: "open-authorized";
      action: AppShortcutAction;
      destination: string;
      consumeProofId: string;
      requiresAppUnlock: true;
      requiresServerAuthorization: true;
      donatesPrivateRecordData: false;
    }
  | { status: "read-only" }
  | { status: "unavailable" };

export type NativeImportDecision =
  | {
      status: "review-required";
      draftId: string;
      localAssetId: string;
      homeId: string;
      contentDigest: string;
      consumeProofId: string;
      openMainApp: true;
      uploadFromExtension: false;
      requiresExplicitConfirmation: true;
      requiresLiveServerAuthorization: true;
    }
  | { status: "invalid-file"; reason: "format" | "size" | "signature" }
  | { status: "expired" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type NativeUtilityCleanupDecision = {
  purgeWidgetSnapshot: boolean;
  purgeImportDrafts: boolean;
  revokeUtilityRegistration: boolean;
  deleteProtectedTemporaryFiles: boolean;
  failClosed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isExactTrue(value: unknown): value is true {
  return value === true;
}

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value === value.trim() &&
    !/\s/.test(value)
  );
}

function isOpaqueValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    value.length <= 256 &&
    value === value.trim() &&
    !/\s/.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isBoundedProofTime(
  issuedAt: unknown,
  expiresAt: unknown,
  now: Date,
  maxTtlMs: number,
) {
  return (
    isValidDate(issuedAt) &&
    isValidDate(expiresAt) &&
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <= maxTtlMs
  );
}

function isRole(value: unknown): value is NativeUtilityRole {
  return NATIVE_UTILITY_ROLES.includes(value as NativeUtilityRole);
}

function hasWriteRole(role: NativeUtilityRole) {
  return role === "OWNER" || role === "ADULT";
}

function isWidgetSummaryType(value: unknown): value is WidgetSummaryType {
  return WIDGET_SUMMARY_TYPES.includes(value as WidgetSummaryType);
}

function hasValidWidgetScope(values: unknown): values is WidgetSummaryType[] {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every(isWidgetSummaryType) &&
    new Set(values).size === values.length
  );
}

function hasValidWidgetCounts(values: unknown): values is WidgetCount[] {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every(
      (value) =>
        isRecord(value) &&
        isWidgetSummaryType(value.type) &&
        Number.isInteger(value.count) &&
        Number(value.count) >= 0 &&
        Number(value.count) <= WIDGET_MAX_COUNT,
    ) &&
    new Set(values.map((value) => value.type)).size === values.length
  );
}

function isShortcutAction(value: unknown): value is AppShortcutAction {
  return APP_SHORTCUT_ACTIONS.includes(value as AppShortcutAction);
}

function isImportMediaType(value: unknown): value is NativeImportMediaType {
  return NATIVE_IMPORT_MEDIA_TYPES.includes(value as NativeImportMediaType);
}

function destinationForShortcut(action: AppShortcutAction) {
  switch (action) {
    case "OPEN_MAINTENANCE":
      return "/maintenance";
    case "QUICK_ADD":
      return "/add";
    case "CAPTURE_DOCUMENT":
      return "/receipts/new/document?source=native-shortcut";
  }
}

function hasValidSession(
  value: unknown,
  userId: string,
  deviceId: string,
  installationId: string,
  now: Date,
): value is VerifiedSessionEvidence {
  if (!isRecord(value)) return false;
  return (
    isCanonicalId(value.sessionId) &&
    value.userId === userId &&
    value.deviceId === deviceId &&
    value.installationId === installationId &&
    isExactTrue(value.verified) &&
    isValidDate(value.issuedAt) &&
    isValidDate(value.expiresAt) &&
    value.issuedAt.getTime() <= now.getTime() &&
    value.expiresAt.getTime() > now.getTime()
  );
}

function hasValidMembership(
  value: unknown,
  userId: string,
  homeId: string,
  now: Date,
): value is MembershipEvidence {
  if (!isRecord(value)) return false;
  return (
    isCanonicalId(value.membershipId) &&
    value.userId === userId &&
    value.homeId === homeId &&
    isRole(value.role) &&
    isOpaqueValue(value.revision) &&
    (value.state === "ACTIVE" || value.state === "REVOKED") &&
    isExactTrue(value.verified) &&
    isValidDate(value.checkedAt) &&
    value.checkedAt.getTime() <= now.getTime() &&
    now.getTime() - value.checkedAt.getTime() <=
      MEMBERSHIP_EVIDENCE_TTL_MS
  );
}

function hasValidDeviceSecurity(
  value: unknown,
  deviceId: string,
  installationId: string,
) {
  if (!isRecord(value)) return false;
  const platformStoreValid =
    (value.platform === "IOS" && value.secureStore === "KEYCHAIN") ||
    (value.platform === "ANDROID" && value.secureStore === "KEYSTORE");
  return (
    value.deviceId === deviceId &&
    value.installationId === installationId &&
    platformStoreValid &&
    isExactTrue(value.protectedDataAvailable) &&
    isExactTrue(value.deviceUnlocked) &&
    isExactTrue(value.appAttested) &&
    isExactTrue(value.backupExcluded)
  );
}

export function decideWidgetRefresh(input: {
  snapshot?: WidgetSnapshot;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  session: VerifiedSessionEvidence;
  membership: MembershipEvidence;
  registration: WidgetRegistrationEvidence;
  deviceSecurity: DeviceSecurityEvidence;
  requestedSummaryTypes: readonly string[];
  now: Date;
}): WidgetRefreshDecision {
  if (!isRecord(input) || !isValidDate(input.now)) {
    return { status: "unavailable" };
  }
  const {
    snapshot,
    currentUserId,
    selectedHomeId,
    deviceId,
    installationId,
    session,
    membership,
    registration,
    deviceSecurity,
    requestedSummaryTypes,
    now,
  } = input;

  if (!isRecord(registration) || registration.optedIn !== true) {
    return { status: "opt-in-required" };
  }

  const identityValid =
    isCanonicalId(currentUserId) &&
    isCanonicalId(selectedHomeId) &&
    isCanonicalId(deviceId) &&
    isCanonicalId(installationId);
  const membershipValid =
    hasValidMembership(membership, currentUserId, selectedHomeId, now) &&
    membership.state === "ACTIVE";
  const registrationValid =
    registration.userId === currentUserId &&
    registration.homeId === selectedHomeId &&
    registration.deviceId === deviceId &&
    registration.installationId === installationId &&
    registration.purpose === "widget-refresh" &&
    registration.optedIn === true &&
    registration.consumed === false &&
    isCanonicalId(registration.registrationId) &&
    isBoundedProofTime(
      registration.issuedAt,
      registration.expiresAt,
      now,
      NATIVE_PROOF_TTL_MS,
    );

  if (
    !identityValid ||
    !hasValidSession(
      session,
      currentUserId,
      deviceId,
      installationId,
      now,
    ) ||
    !membershipValid ||
    !registrationValid ||
    !hasValidDeviceSecurity(deviceSecurity, deviceId, installationId) ||
    !hasValidWidgetScope(requestedSummaryTypes)
  ) {
    return snapshot ? { status: "purge-required" } : { status: "unavailable" };
  }

  if (
    snapshot &&
    (!isRecord(snapshot) ||
      snapshot.userId !== currentUserId ||
      snapshot.homeId !== selectedHomeId ||
      snapshot.membershipRevision !== membership.revision ||
      snapshot.deviceId !== deviceId ||
      snapshot.installationId !== installationId ||
      snapshot.encryptedAtRest !== true ||
      snapshot.backupExcluded !== true ||
      snapshot.containsRecordTitles !== false ||
      snapshot.containsHouseholdName !== false ||
      snapshot.containsAttachmentData !== false)
  ) {
    return { status: "purge-required" };
  }

  return {
    status: "refresh-authorized",
    userId: currentUserId,
    homeId: selectedHomeId,
    membershipRevision: membership.revision,
    summaryTypes: [...requestedSummaryTypes],
    expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
    consumeRegistrationId: registration.registrationId,
    redacted: true,
    serverAuthorizationRequired: true,
  };
}

export function decideWidgetRead(input: {
  snapshot?: WidgetSnapshot;
  integrity: WidgetIntegrityEvidence;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  deviceSecurity: DeviceSecurityEvidence;
  membership?: MembershipEvidence;
  now: Date;
}): WidgetReadDecision {
  if (!isRecord(input) || !isValidDate(input.now) || !input.snapshot) {
    return { status: "unavailable" };
  }
  const {
    snapshot,
    integrity,
    currentUserId,
    selectedHomeId,
    deviceId,
    installationId,
    deviceSecurity,
    membership,
    now,
  } = input;

  if (
    !isRecord(snapshot) ||
    !isCanonicalId(snapshot.id) ||
    !isOpaqueValue(snapshot.membershipRevision) ||
    !hasValidWidgetCounts(snapshot.counts) ||
    !isValidDate(snapshot.generatedAt) ||
    !isValidDate(snapshot.expiresAt) ||
    snapshot.generatedAt.getTime() > now.getTime() ||
    snapshot.expiresAt.getTime() <= snapshot.generatedAt.getTime() ||
    snapshot.expiresAt.getTime() - snapshot.generatedAt.getTime() >
      WIDGET_CACHE_TTL_MS ||
    !isOpaqueValue(snapshot.summaryDigest) ||
    !isOpaqueValue(snapshot.aadDigest) ||
    snapshot.encryptedAtRest !== true ||
    snapshot.backupExcluded !== true ||
    snapshot.containsRecordTitles !== false ||
    snapshot.containsHouseholdName !== false ||
    snapshot.containsAttachmentData !== false ||
    !isRecord(integrity) ||
    integrity.snapshotId !== snapshot.id ||
    integrity.userId !== snapshot.userId ||
    integrity.homeId !== snapshot.homeId ||
    integrity.membershipRevision !== snapshot.membershipRevision ||
    integrity.deviceId !== snapshot.deviceId ||
    integrity.installationId !== snapshot.installationId ||
    integrity.summaryDigest !== snapshot.summaryDigest ||
    integrity.aadDigest !== snapshot.aadDigest ||
    integrity.authenticationTagVerified !== true
  ) {
    return { status: "purge-required", reason: "integrity-failed" };
  }

  if (
    snapshot.userId !== currentUserId ||
    snapshot.homeId !== selectedHomeId ||
    snapshot.deviceId !== deviceId ||
    snapshot.installationId !== installationId ||
    !hasValidDeviceSecurity(deviceSecurity, deviceId, installationId)
  ) {
    return { status: "purge-required", reason: "binding-changed" };
  }

  if (membership !== undefined) {
    if (
      !hasValidMembership(membership, currentUserId, selectedHomeId, now) ||
      membership.state === "REVOKED" ||
      membership.revision !== snapshot.membershipRevision
    ) {
      return { status: "purge-required", reason: "authorization-revoked" };
    }
  }

  if (now.getTime() >= snapshot.expiresAt.getTime()) {
    return { status: "purge-required", reason: "expired" };
  }

  return {
    status: "widget-readable",
    snapshotId: snapshot.id,
    stale: membership === undefined,
    countsOnly: true,
    requiresAppUnlockForNavigation: true,
  };
}

export function decideShortcutInvocation(input: {
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  session: VerifiedSessionEvidence;
  membership: MembershipEvidence;
  deviceSecurity: DeviceSecurityEvidence;
  proof: ShortcutInvocationProof;
  action: string;
  now: Date;
}): ShortcutDecision {
  if (!isRecord(input) || !isValidDate(input.now)) {
    return { status: "unavailable" };
  }
  const {
    currentUserId,
    selectedHomeId,
    deviceId,
    installationId,
    session,
    membership,
    deviceSecurity,
    proof,
    action,
    now,
  } = input;
  if (
    !isCanonicalId(currentUserId) ||
    !isCanonicalId(selectedHomeId) ||
    !isCanonicalId(deviceId) ||
    !isCanonicalId(installationId) ||
    !isShortcutAction(action) ||
    !hasValidSession(
      session,
      currentUserId,
      deviceId,
      installationId,
      now,
    ) ||
    !hasValidMembership(membership, currentUserId, selectedHomeId, now) ||
    membership.state !== "ACTIVE" ||
    !hasValidDeviceSecurity(deviceSecurity, deviceId, installationId) ||
    !isRecord(proof) ||
    !isCanonicalId(proof.proofId) ||
    proof.userId !== currentUserId ||
    proof.homeId !== selectedHomeId ||
    proof.deviceId !== deviceId ||
    proof.installationId !== installationId ||
    proof.action !== action ||
    proof.userInitiated !== true ||
    proof.consumed !== false ||
    !isBoundedProofTime(
      proof.issuedAt,
      proof.expiresAt,
      now,
      NATIVE_PROOF_TTL_MS,
    )
  ) {
    return { status: "unavailable" };
  }

  if (
    (action === "QUICK_ADD" || action === "CAPTURE_DOCUMENT") &&
    !hasWriteRole(membership.role)
  ) {
    return { status: "read-only" };
  }

  return {
    status: "open-authorized",
    action,
    destination: destinationForShortcut(action),
    consumeProofId: proof.proofId,
    requiresAppUnlock: true,
    requiresServerAuthorization: true,
    donatesPrivateRecordData: false,
  };
}

export function decideNativeImportHandoff(input: {
  draft: NativeImportDraft;
  transfer: NativeImportTransferEvidence;
  proof: NativeImportHandoffProof;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  session: VerifiedSessionEvidence;
  membership: MembershipEvidence;
  deviceSecurity: DeviceSecurityEvidence;
  now: Date;
}): NativeImportDecision {
  if (!isRecord(input) || !isValidDate(input.now)) {
    return { status: "unavailable" };
  }
  const {
    draft,
    transfer,
    proof,
    currentUserId,
    selectedHomeId,
    deviceId,
    installationId,
    session,
    membership,
    deviceSecurity,
    now,
  } = input;

  if (
    !isRecord(draft) ||
    !isCanonicalId(draft.id) ||
    !isCanonicalId(draft.userId) ||
    !isCanonicalId(draft.deviceId) ||
    !isCanonicalId(draft.installationId) ||
    !isCanonicalId(draft.localAssetId) ||
    typeof draft.fileName !== "string" ||
    draft.fileName.length === 0 ||
    draft.fileName.length > 200 ||
    draft.fileName !== draft.fileName.trim() ||
    !isOpaqueValue(draft.contentDigest) ||
    !isValidDate(draft.createdAt) ||
    !isValidDate(draft.expiresAt) ||
    draft.createdAt.getTime() > now.getTime() ||
    draft.expiresAt.getTime() <= draft.createdAt.getTime() ||
    draft.expiresAt.getTime() - draft.createdAt.getTime() >
      NATIVE_IMPORT_TTL_MS ||
    draft.userId !== currentUserId ||
    draft.deviceId !== deviceId ||
    draft.installationId !== installationId ||
    !isCanonicalId(selectedHomeId) ||
    !hasValidSession(
      session,
      currentUserId,
      deviceId,
      installationId,
      now,
    ) ||
    !hasValidMembership(membership, currentUserId, selectedHomeId, now) ||
    membership.state !== "ACTIVE" ||
    !hasValidDeviceSecurity(deviceSecurity, deviceId, installationId)
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(membership.role)) {
    return { status: "read-only" };
  }

  if (now.getTime() >= draft.expiresAt.getTime()) {
    return { status: "expired" };
  }

  if (!isImportMediaType(draft.mediaType)) {
    return { status: "invalid-file", reason: "format" };
  }
  if (
    !Number.isInteger(draft.sizeBytes) ||
    draft.sizeBytes <= 0 ||
    draft.sizeBytes > NATIVE_IMPORT_MAX_BYTES
  ) {
    return { status: "invalid-file", reason: "size" };
  }

  if (
    !isRecord(transfer) ||
    !isCanonicalId(transfer.transferId) ||
    transfer.draftId !== draft.id ||
    transfer.localAssetId !== draft.localAssetId ||
    transfer.contentDigest !== draft.contentDigest ||
    transfer.sourceExtension !== "SHARE_IMPORT_EXTENSION" ||
    transfer.copiedToProtectedContainer !== true ||
    transfer.sourceAccessReleased !== true ||
    transfer.backupExcluded !== true ||
    transfer.completeDataProtection !== true ||
    transfer.noUploadPerformed !== true
  ) {
    return { status: "unavailable" };
  }
  if (transfer.signatureVerified !== true) {
    return { status: "invalid-file", reason: "signature" };
  }

  if (
    !isRecord(proof) ||
    !isCanonicalId(proof.proofId) ||
    proof.draftId !== draft.id ||
    proof.userId !== currentUserId ||
    proof.deviceId !== deviceId ||
    proof.installationId !== installationId ||
    proof.purpose !== "native-import-review" ||
    proof.consumed !== false ||
    !isBoundedProofTime(
      proof.issuedAt,
      proof.expiresAt,
      now,
      NATIVE_PROOF_TTL_MS,
    )
  ) {
    return { status: "unavailable" };
  }

  return {
    status: "review-required",
    draftId: draft.id,
    localAssetId: draft.localAssetId,
    homeId: selectedHomeId,
    contentDigest: draft.contentDigest,
    consumeProofId: proof.proofId,
    openMainApp: true,
    uploadFromExtension: false,
    requiresExplicitConfirmation: true,
    requiresLiveServerAuthorization: true,
  };
}

export function decideNativeUtilityCleanup(
  event: unknown,
): NativeUtilityCleanupDecision {
  const valid = NATIVE_UTILITY_CLEANUP_EVENTS.includes(
    event as NativeUtilityCleanupEvent,
  );
  if (!valid) {
    return {
      purgeWidgetSnapshot: true,
      purgeImportDrafts: true,
      revokeUtilityRegistration: true,
      deleteProtectedTemporaryFiles: true,
      failClosed: true,
    };
  }

  const accountOrDeviceBoundary =
    event === "ACCOUNT_SWITCHED" ||
    event === "SIGNED_OUT" ||
    event === "ACCOUNT_DELETED" ||
    event === "MEMBERSHIP_REVOKED" ||
    event === "DEVICE_REPORTED_LOST" ||
    event === "APP_REINSTALLED";

  return {
    purgeWidgetSnapshot:
      accountOrDeviceBoundary ||
      event === "WIDGET_DISABLED" ||
      event === "PROPERTY_SWITCHED",
    purgeImportDrafts:
      accountOrDeviceBoundary ||
      event === "IMPORT_EXPIRED" ||
      event === "IMPORT_CANCELLED" ||
      event === "IMPORT_COMPLETED",
    revokeUtilityRegistration:
      event === "ACCOUNT_DELETED" ||
      event === "MEMBERSHIP_REVOKED" ||
      event === "DEVICE_REPORTED_LOST" ||
      event === "APP_REINSTALLED",
    deleteProtectedTemporaryFiles:
      accountOrDeviceBoundary ||
      event === "IMPORT_EXPIRED" ||
      event === "IMPORT_CANCELLED" ||
      event === "IMPORT_COMPLETED",
    failClosed: false,
  };
}
