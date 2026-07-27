export const BIOMETRIC_PLATFORMS = ["IOS", "ANDROID"] as const;
export const SECURE_CREDENTIAL_STORES = [
  "IOS_KEYCHAIN_SECURE_ENCLAVE",
  "IOS_KEYCHAIN",
  "ANDROID_HARDWARE_KEYSTORE",
  "ANDROID_KEYSTORE",
] as const;

export type BiometricPlatform = (typeof BIOMETRIC_PLATFORMS)[number];
export type SecureCredentialStore =
  (typeof SECURE_CREDENTIAL_STORES)[number];

export type BiometricEnrollment = {
  id: string;
  userId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  secureStore: SecureCredentialStore;
  credentialHandle: string;
  biometricSetVersion: string;
  status: "ACTIVE" | "REVOKED";
  backupExcluded: true;
};

export type BiometricEnrollmentDecision =
  | {
      status: "enrollment-allowed";
      userId: string;
      deviceId: string;
      installationId: string;
      platform: BiometricPlatform;
      secureStore: SecureCredentialStore;
      biometricSetVersion: string;
      backupExcluded: true;
    }
  | { status: "unavailable" }
  | { status: "credential-confirmation-required" }
  | { status: "insecure-device" }
  | { status: "already-enrolled" };

export type BiometricReentryDecision =
  | {
      status: "reentry-allowed";
      credentialHandle: string;
      requiresServerAuthorization: true;
    }
  | { status: "locked" }
  | { status: "fallback-sign-in"; destroyCredential: boolean }
  | { status: "wipe-required"; reason: "identity-mismatch" | "device-state-changed" }
  | { status: "unavailable" };

export type BiometricLifecycleEvent =
  | "APP_BACKGROUNDED"
  | "ACCOUNT_SWITCHED"
  | "SIGNED_OUT"
  | "ACCOUNT_DELETED"
  | "SESSION_REVOKED"
  | "DEVICE_REPORTED_LOST"
  | "APP_REINSTALLED";

export type BiometricLifecycleDecision = {
  lockInterface: true;
  scrubMemory: true;
  destroySecureCredential: boolean;
  revokeServerSession: boolean;
};

function isBiometricPlatform(value: string): value is BiometricPlatform {
  return BIOMETRIC_PLATFORMS.includes(value as BiometricPlatform);
}

function isApprovedSecureStore(
  platform: BiometricPlatform,
  secureStore: string,
): secureStore is SecureCredentialStore {
  if (platform === "IOS") {
    return (
      secureStore === "IOS_KEYCHAIN_SECURE_ENCLAVE" ||
      secureStore === "IOS_KEYCHAIN"
    );
  }

  return (
    secureStore === "ANDROID_HARDWARE_KEYSTORE" ||
    secureStore === "ANDROID_KEYSTORE"
  );
}

export function decideBiometricEnrollment({
  currentUserId,
  deviceId,
  installationId,
  sessionVerified,
  credentialConfirmed,
  platform,
  secureStore,
  secureStorageAvailable,
  biometricAvailable,
  devicePasscodeSet,
  biometricSetVersion,
  existingEnrollment,
}: {
  currentUserId: string;
  deviceId: string;
  installationId: string;
  sessionVerified: boolean;
  credentialConfirmed: boolean;
  platform: string;
  secureStore: string;
  secureStorageAvailable: boolean;
  biometricAvailable: boolean;
  devicePasscodeSet: boolean;
  biometricSetVersion: string;
  existingEnrollment?: BiometricEnrollment | null;
}): BiometricEnrollmentDecision {
  if (
    !currentUserId ||
    !deviceId ||
    !installationId ||
    !sessionVerified ||
    !biometricSetVersion ||
    !isBiometricPlatform(platform) ||
    !isApprovedSecureStore(platform, secureStore) ||
    !secureStorageAvailable ||
    !biometricAvailable
  ) {
    return { status: "unavailable" };
  }

  if (!credentialConfirmed) {
    return { status: "credential-confirmation-required" };
  }

  if (!devicePasscodeSet) {
    return { status: "insecure-device" };
  }

  if (existingEnrollment?.status === "ACTIVE") {
    return { status: "already-enrolled" };
  }

  return {
    status: "enrollment-allowed",
    userId: currentUserId,
    deviceId,
    installationId,
    platform,
    secureStore,
    biometricSetVersion,
    backupExcluded: true,
  };
}

export function decideBiometricReentry({
  enrollment,
  currentUserId,
  deviceId,
  installationId,
  platform,
  secureStorageAvailable,
  devicePasscodeSet,
  biometricSetVersion,
  biometricResult,
  serverSessionState,
  refreshAccepted,
}: {
  enrollment: BiometricEnrollment;
  currentUserId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  secureStorageAvailable: boolean;
  devicePasscodeSet: boolean;
  biometricSetVersion: string;
  biometricResult: "SUCCESS" | "FAILED" | "CANCELLED" | "LOCKED_OUT";
  serverSessionState: "ACTIVE" | "EXPIRED" | "REVOKED" | "UNAVAILABLE";
  refreshAccepted: boolean;
}): BiometricReentryDecision {
  if (
    !enrollment.id ||
    !enrollment.credentialHandle ||
    enrollment.status !== "ACTIVE" ||
    !enrollment.backupExcluded ||
    !secureStorageAvailable
  ) {
    return { status: "unavailable" };
  }

  if (
    enrollment.userId !== currentUserId ||
    enrollment.deviceId !== deviceId ||
    enrollment.installationId !== installationId ||
    enrollment.platform !== platform
  ) {
    return { status: "wipe-required", reason: "identity-mismatch" };
  }

  if (
    !devicePasscodeSet ||
    !biometricSetVersion ||
    enrollment.biometricSetVersion !== biometricSetVersion
  ) {
    return { status: "wipe-required", reason: "device-state-changed" };
  }

  if (biometricResult === "LOCKED_OUT") {
    return { status: "fallback-sign-in", destroyCredential: false };
  }

  if (biometricResult !== "SUCCESS") {
    return { status: "locked" };
  }

  if (
    serverSessionState === "REVOKED" ||
    serverSessionState === "EXPIRED"
  ) {
    return { status: "fallback-sign-in", destroyCredential: true };
  }

  if (serverSessionState !== "ACTIVE" || !refreshAccepted) {
    return { status: "fallback-sign-in", destroyCredential: false };
  }

  return {
    status: "reentry-allowed",
    credentialHandle: enrollment.credentialHandle,
    requiresServerAuthorization: true,
  };
}

export function decideBiometricLifecycle(
  event: BiometricLifecycleEvent,
): BiometricLifecycleDecision {
  if (event === "APP_BACKGROUNDED") {
    return {
      lockInterface: true,
      scrubMemory: true,
      destroySecureCredential: false,
      revokeServerSession: false,
    };
  }

  return {
    lockInterface: true,
    scrubMemory: true,
    destroySecureCredential: true,
    revokeServerSession:
      event === "DEVICE_REPORTED_LOST" ||
      event === "ACCOUNT_DELETED" ||
      event === "SESSION_REVOKED",
  };
}

export function isBiometricCredentialEnvelopeSafe({
  sealedByPlatformStore,
  boundUserId,
  boundDeviceId,
  boundInstallationId,
  backupExcluded,
  containsPassword,
  containsRawBiometric,
  containsBearerToken,
}: {
  sealedByPlatformStore: boolean;
  boundUserId: string;
  boundDeviceId: string;
  boundInstallationId: string;
  backupExcluded: boolean;
  containsPassword: boolean;
  containsRawBiometric: boolean;
  containsBearerToken: boolean;
}): boolean {
  return (
    sealedByPlatformStore &&
    Boolean(boundUserId && boundDeviceId && boundInstallationId) &&
    backupExcluded &&
    !containsPassword &&
    !containsRawBiometric &&
    !containsBearerToken
  );
}
