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

export const WIDGET_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const NATIVE_IMPORT_TTL_MS = 30 * 60 * 1000;
export const NATIVE_IMPORT_MAX_BYTES = 4_000_000;

export type NativeUtilityType = (typeof NATIVE_UTILITY_TYPES)[number];
export type WidgetSummaryType = (typeof WIDGET_SUMMARY_TYPES)[number];
export type AppShortcutAction = (typeof APP_SHORTCUT_ACTIONS)[number];
export type NativeImportMediaType =
  (typeof NATIVE_IMPORT_MEDIA_TYPES)[number];
export type NativeUtilityRole = "OWNER" | "ADULT" | "CHILD" | "GUEST";

export type WidgetSnapshot = {
  id: string;
  userId: string;
  homeId: string;
  deviceId: string;
  installationId: string;
  summaryTypes: readonly WidgetSummaryType[];
  generatedAt: Date;
  expiresAt: Date;
  integrityTag: string;
  encryptedAtRest: true;
  backupExcluded: true;
  containsRecordTitles: false;
  containsHouseholdName: false;
  containsAttachmentData: false;
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
  signatureValid: boolean;
  copiedToProtectedContainer: boolean;
  sourceAccessRevoked: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export type WidgetRefreshDecision =
  | {
      status: "refresh-authorized";
      userId: string;
      homeId: string;
      summaryTypes: WidgetSummaryType[];
      expiresAt: Date;
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
      openMainApp: true;
      uploadFromExtension: false;
      requiresPropertySelection: true;
      requiresLiveServerAuthorization: true;
    }
  | { status: "invalid-file"; reason: "format" | "size" | "signature" }
  | { status: "expired" }
  | { status: "read-only" }
  | { status: "unavailable" };

export type NativeUtilityCleanupEvent =
  | "WIDGET_DISABLED"
  | "PROPERTY_SWITCHED"
  | "ACCOUNT_SWITCHED"
  | "SIGNED_OUT"
  | "ACCOUNT_DELETED"
  | "MEMBERSHIP_REVOKED"
  | "DEVICE_REPORTED_LOST"
  | "APP_REINSTALLED"
  | "IMPORT_EXPIRED"
  | "IMPORT_CANCELLED"
  | "IMPORT_COMPLETED";

export type NativeUtilityCleanupDecision = {
  purgeWidgetSnapshot: boolean;
  purgeImportDrafts: boolean;
  revokeUtilityRegistration: boolean;
  deleteProtectedTemporaryFiles: boolean;
};

function hasWriteRole(role: NativeUtilityRole) {
  return role === "OWNER" || role === "ADULT";
}

function hasValidWidgetScope(
  values: readonly string[],
): values is readonly WidgetSummaryType[] {
  return (
    values.length > 0 &&
    values.every((value) =>
      WIDGET_SUMMARY_TYPES.includes(value as WidgetSummaryType),
    ) &&
    new Set(values).size === values.length
  );
}

function isShortcutAction(value: string): value is AppShortcutAction {
  return APP_SHORTCUT_ACTIONS.includes(value as AppShortcutAction);
}

function isImportMediaType(value: string): value is NativeImportMediaType {
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

export function decideWidgetRefresh({
  snapshot,
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  sessionVerified,
  hasCurrentMembership,
  userOptedIn,
  deviceReportedLost,
  requestedSummaryTypes,
  now,
}: {
  snapshot?: WidgetSnapshot;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  userOptedIn: boolean;
  deviceReportedLost: boolean;
  requestedSummaryTypes: readonly string[];
  now: Date;
}): WidgetRefreshDecision {
  if (!userOptedIn) {
    return { status: "opt-in-required" };
  }

  if (
    !currentUserId ||
    !selectedHomeId ||
    !deviceId ||
    !installationId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    deviceReportedLost ||
    !hasValidWidgetScope(requestedSummaryTypes)
  ) {
    return snapshot ? { status: "purge-required" } : { status: "unavailable" };
  }

  if (
    snapshot &&
    (snapshot.userId !== currentUserId ||
      snapshot.homeId !== selectedHomeId ||
      snapshot.deviceId !== deviceId ||
      snapshot.installationId !== installationId ||
      !snapshot.integrityTag ||
      !snapshot.encryptedAtRest ||
      !snapshot.backupExcluded ||
      snapshot.containsRecordTitles ||
      snapshot.containsHouseholdName ||
      snapshot.containsAttachmentData)
  ) {
    return { status: "purge-required" };
  }

  return {
    status: "refresh-authorized",
    userId: currentUserId,
    homeId: selectedHomeId,
    summaryTypes: [...requestedSummaryTypes],
    expiresAt: new Date(now.getTime() + WIDGET_CACHE_TTL_MS),
    redacted: true,
    serverAuthorizationRequired: true,
  };
}

export function decideWidgetRead({
  snapshot,
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  userOptedIn,
  membershipState,
  deviceReportedLost,
  integrityValid,
  now,
}: {
  snapshot?: WidgetSnapshot;
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  userOptedIn: boolean;
  membershipState: "CURRENT" | "REVOKED" | "UNKNOWN_OFFLINE";
  deviceReportedLost: boolean;
  integrityValid: boolean;
  now: Date;
}): WidgetReadDecision {
  if (!snapshot || !userOptedIn) {
    return { status: "unavailable" };
  }

  if (
    !snapshot.id ||
    !snapshot.integrityTag ||
    !snapshot.encryptedAtRest ||
    !snapshot.backupExcluded ||
    snapshot.containsRecordTitles ||
    snapshot.containsHouseholdName ||
    snapshot.containsAttachmentData ||
    !hasValidWidgetScope(snapshot.summaryTypes) ||
    snapshot.generatedAt.getTime() > now.getTime() ||
    snapshot.expiresAt.getTime() <= snapshot.generatedAt.getTime() ||
    snapshot.expiresAt.getTime() - snapshot.generatedAt.getTime() >
      WIDGET_CACHE_TTL_MS ||
    !integrityValid
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
    return { status: "purge-required", reason: "binding-changed" };
  }

  if (membershipState === "REVOKED") {
    return {
      status: "purge-required",
      reason: "authorization-revoked",
    };
  }

  if (now.getTime() >= snapshot.expiresAt.getTime()) {
    return { status: "purge-required", reason: "expired" };
  }

  return {
    status: "widget-readable",
    snapshotId: snapshot.id,
    stale: membershipState === "UNKNOWN_OFFLINE",
    countsOnly: true,
    requiresAppUnlockForNavigation: true,
  };
}

export function decideShortcutInvocation({
  currentUserId,
  selectedHomeId,
  deviceId,
  installationId,
  sessionVerified,
  hasCurrentMembership,
  role,
  action,
  userInitiated,
  deviceUnlocked,
}: {
  currentUserId: string;
  selectedHomeId: string;
  deviceId: string;
  installationId: string;
  sessionVerified: boolean;
  hasCurrentMembership: boolean;
  role: NativeUtilityRole;
  action: string;
  userInitiated: boolean;
  deviceUnlocked: boolean;
}): ShortcutDecision {
  if (
    !currentUserId ||
    !selectedHomeId ||
    !deviceId ||
    !installationId ||
    !sessionVerified ||
    !hasCurrentMembership ||
    !userInitiated ||
    !deviceUnlocked ||
    !isShortcutAction(action)
  ) {
    return { status: "unavailable" };
  }

  if (
    (action === "QUICK_ADD" || action === "CAPTURE_DOCUMENT") &&
    !hasWriteRole(role)
  ) {
    return { status: "read-only" };
  }

  return {
    status: "open-authorized",
    action,
    destination: destinationForShortcut(action),
    requiresAppUnlock: true,
    requiresServerAuthorization: true,
    donatesPrivateRecordData: false,
  };
}

export function decideNativeImportHandoff({
  draft,
  currentUserId,
  deviceId,
  installationId,
  sessionVerified,
  role,
  now,
}: {
  draft: NativeImportDraft;
  currentUserId: string;
  deviceId: string;
  installationId: string;
  sessionVerified: boolean;
  role: NativeUtilityRole;
  now: Date;
}): NativeImportDecision {
  if (
    !draft.id ||
    !draft.localAssetId ||
    !draft.fileName ||
    !currentUserId ||
    !deviceId ||
    !installationId ||
    draft.userId !== currentUserId ||
    draft.deviceId !== deviceId ||
    draft.installationId !== installationId ||
    !sessionVerified ||
    !draft.copiedToProtectedContainer ||
    !draft.sourceAccessRevoked ||
    draft.createdAt.getTime() > now.getTime() ||
    draft.expiresAt.getTime() <= draft.createdAt.getTime() ||
    draft.expiresAt.getTime() - draft.createdAt.getTime() >
      NATIVE_IMPORT_TTL_MS
  ) {
    return { status: "unavailable" };
  }

  if (!hasWriteRole(role)) {
    return { status: "read-only" };
  }

  if (now.getTime() >= draft.expiresAt.getTime()) {
    return { status: "expired" };
  }

  if (!isImportMediaType(draft.mediaType)) {
    return { status: "invalid-file", reason: "format" };
  }

  if (
    draft.sizeBytes <= 0 ||
    draft.sizeBytes > NATIVE_IMPORT_MAX_BYTES
  ) {
    return { status: "invalid-file", reason: "size" };
  }

  if (!draft.signatureValid) {
    return { status: "invalid-file", reason: "signature" };
  }

  return {
    status: "review-required",
    draftId: draft.id,
    localAssetId: draft.localAssetId,
    openMainApp: true,
    uploadFromExtension: false,
    requiresPropertySelection: true,
    requiresLiveServerAuthorization: true,
  };
}

export function decideNativeUtilityCleanup(
  event: NativeUtilityCleanupEvent,
): NativeUtilityCleanupDecision {
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
  };
}
