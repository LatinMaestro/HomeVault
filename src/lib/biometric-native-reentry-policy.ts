export const BIOMETRIC_PLATFORMS = ["IOS", "ANDROID"] as const;
export const SECURE_CREDENTIAL_STORES = [
  "IOS_KEYCHAIN_SECURE_ENCLAVE",
  "IOS_KEYCHAIN",
  "ANDROID_HARDWARE_KEYSTORE",
  "ANDROID_KEYSTORE",
] as const;

export const MAX_BIOMETRIC_EVIDENCE_TTL_MINUTES = 15;
export const MAX_BIOMETRIC_FAILED_ATTEMPTS = 5;

const MAX_IDENTIFIER_LENGTH = 128;
const MIN_OPAQUE_KEY_LENGTH = 32;
const MAX_OPAQUE_KEY_LENGTH = 256;

export type BiometricPlatform = (typeof BIOMETRIC_PLATFORMS)[number];
export type SecureCredentialStore =
  (typeof SECURE_CREDENTIAL_STORES)[number];

export type BiometricSessionEvidence = {
  id: string;
  userId: string;
  verified: boolean;
  expiresAt: Date;
};

export type BiometricCredentialEvidence = {
  id: string;
  userId: string;
  purpose: "biometric-enrollment";
  verifiedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type BiometricDeviceEvidence = {
  userId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  secureStore: SecureCredentialStore;
  secureStorageAvailable: boolean;
  biometricAvailable: boolean;
  devicePasscodeSet: boolean;
  hardwareBackedAvailable: boolean;
  hardwareBacked: boolean;
  biometricSetVersion: string;
  backupExcluded: boolean;
  appAttested: boolean;
};

export type BiometricEnrollmentAuthorization = {
  id: string;
  userId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  secureStore: SecureCredentialStore;
  challengeId: string;
  publicKeyThumbprint: string;
  platformKeyAttested: boolean;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type BiometricEnrollment = {
  id: string;
  version: number;
  userId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  secureStore: SecureCredentialStore;
  credentialHandle: string;
  publicKeyThumbprint: string;
  biometricSetVersion: string;
  status: "ACTIVE" | "REVOKED";
  backupExcluded: boolean;
  failedAttempts: number;
};

export type BiometricEnrollmentDecision =
  | {
      status: "enrollment-allowed";
      plan: {
        userId: string;
        deviceId: string;
        installationId: string;
        platform: BiometricPlatform;
        secureStore: SecureCredentialStore;
        biometricSetVersion: string;
        authorizationId: string;
        challengeId: string;
        publicKeyThumbprint: string;
        credentialEvidenceId: string;
        consumeAuthorization: true;
        consumeCredentialEvidence: true;
        backupExcluded: true;
        expectedEnrollmentAbsent: true;
      };
    }
  | { status: "credential-confirmation-required" }
  | { status: "insecure-device" }
  | { status: "authorization-required" }
  | { status: "already-enrolled" }
  | {
      status: "wipe-required";
      reason: "identity-mismatch" | "installation-mismatch";
    }
  | { status: "unavailable" };

export type BiometricPlatformAuthenticationEvidence = {
  id: string;
  enrollmentId: string;
  userId: string;
  deviceId: string;
  installationId: string;
  platform: BiometricPlatform;
  credentialHandle: string;
  publicKeyThumbprint: string;
  challengeId: string;
  biometricSetVersion: string;
  result: "SUCCESS" | "FAILED" | "CANCELLED" | "LOCKED_OUT";
  signedChallengeVerified: boolean;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type BiometricServerAuthorizationEvidence = {
  id: string;
  sessionId: string;
  enrollmentId: string;
  userId: string;
  deviceId: string;
  installationId: string;
  challengeId: string;
  state: "ACTIVE" | "EXPIRED" | "REVOKED" | "UNAVAILABLE";
  refreshAccepted: boolean;
  issuedAt: Date;
  expiresAt: Date;
  consumed: boolean;
};

export type BiometricReentryDecision =
  | {
      status: "reentry-allowed";
      plan: {
        enrollmentId: string;
        enrollmentVersion: number;
        sessionId: string;
        credentialHandle: string;
        platformEvidenceId: string;
        serverEvidenceId: string;
        challengeId: string;
        consumePlatformEvidence: true;
        consumeServerEvidence: true;
        resetFailedAttempts: true;
        requiresServerAuthorization: true;
      };
    }
  | {
      status: "locked";
      plan: {
        enrollmentId: string;
        expectedEnrollmentVersion: number;
        incrementFailedAttempts: boolean;
        consumePlatformEvidence: true;
      };
    }
  | { status: "fallback-sign-in"; destroyCredential: boolean }
  | {
      status: "wipe-required";
      reason:
        | "identity-mismatch"
        | "installation-mismatch"
        | "device-state-changed";
    }
  | { status: "unavailable" };

export const BIOMETRIC_LIFECYCLE_EVENTS = [
  "APP_BACKGROUNDED",
  "ACCOUNT_SWITCHED",
  "SIGNED_OUT",
  "ACCOUNT_DELETED",
  "SESSION_REVOKED",
  "DEVICE_REPORTED_LOST",
  "APP_REINSTALLED",
] as const;

export type BiometricLifecycleEvent =
  (typeof BIOMETRIC_LIFECYCLE_EVENTS)[number];

export type BiometricLifecycleDecision =
  | {
      status: "lifecycle-plan";
      plan: {
        lockInterface: true;
        scrubMemory: true;
        destroySecureCredential: boolean;
        revokeServerSession: boolean;
        purgeOfflineHouseholdData: boolean;
        cancelQueuedActions: boolean;
      };
    }
  | { status: "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExactBoolean(value: unknown): value is boolean {
  return value === true || value === false;
}

function isCanonicalIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    value === value.trim() &&
    !/[\u0000-\u001f\u007f]/u.test(value) &&
    /^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(value)
  );
}

function isOpaqueKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_OPAQUE_KEY_LENGTH &&
    value.length <= MAX_OPAQUE_KEY_LENGTH &&
    /^[A-Za-z0-9_-]+$/u.test(value)
  );
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isPlatform(value: unknown): value is BiometricPlatform {
  return (
    typeof value === "string" &&
    BIOMETRIC_PLATFORMS.includes(value as BiometricPlatform)
  );
}

function isSecureStore(value: unknown): value is SecureCredentialStore {
  return (
    typeof value === "string" &&
    SECURE_CREDENTIAL_STORES.includes(value as SecureCredentialStore)
  );
}

function storeMatchesPlatform(
  platform: BiometricPlatform,
  secureStore: SecureCredentialStore,
) {
  return platform === "IOS"
    ? secureStore === "IOS_KEYCHAIN_SECURE_ENCLAVE" ||
        secureStore === "IOS_KEYCHAIN"
    : secureStore === "ANDROID_HARDWARE_KEYSTORE" ||
        secureStore === "ANDROID_KEYSTORE";
}

function isHardwareStore(secureStore: SecureCredentialStore) {
  return (
    secureStore === "IOS_KEYCHAIN_SECURE_ENCLAVE" ||
    secureStore === "ANDROID_HARDWARE_KEYSTORE"
  );
}

function isShortLivedEvidence({
  issuedAt,
  expiresAt,
  now,
}: {
  issuedAt: Date;
  expiresAt: Date;
  now: Date;
}) {
  return (
    issuedAt.getTime() <= now.getTime() &&
    expiresAt.getTime() > now.getTime() &&
    expiresAt.getTime() > issuedAt.getTime() &&
    expiresAt.getTime() - issuedAt.getTime() <=
      MAX_BIOMETRIC_EVIDENCE_TTL_MINUTES * 60 * 1000
  );
}

function parseSession(value: unknown): BiometricSessionEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
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

function parseCredential(
  value: unknown,
): BiometricCredentialEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    value.purpose !== "biometric-enrollment" ||
    !isValidDate(value.verifiedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    purpose: "biometric-enrollment",
    verifiedAt: value.verifiedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseDevice(value: unknown): BiometricDeviceEvidence | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isPlatform(value.platform) ||
    !isSecureStore(value.secureStore) ||
    !storeMatchesPlatform(value.platform, value.secureStore) ||
    !isExactBoolean(value.secureStorageAvailable) ||
    !isExactBoolean(value.biometricAvailable) ||
    !isExactBoolean(value.devicePasscodeSet) ||
    !isExactBoolean(value.hardwareBackedAvailable) ||
    !isExactBoolean(value.hardwareBacked) ||
    !isCanonicalIdentifier(value.biometricSetVersion) ||
    !isExactBoolean(value.backupExcluded) ||
    !isExactBoolean(value.appAttested)
  ) {
    return null;
  }

  return {
    userId: value.userId,
    deviceId: value.deviceId,
    installationId: value.installationId,
    platform: value.platform,
    secureStore: value.secureStore,
    secureStorageAvailable: value.secureStorageAvailable,
    biometricAvailable: value.biometricAvailable,
    devicePasscodeSet: value.devicePasscodeSet,
    hardwareBackedAvailable: value.hardwareBackedAvailable,
    hardwareBacked: value.hardwareBacked,
    biometricSetVersion: value.biometricSetVersion,
    backupExcluded: value.backupExcluded,
    appAttested: value.appAttested,
  };
}

function parseEnrollmentAuthorization(
  value: unknown,
): BiometricEnrollmentAuthorization | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isPlatform(value.platform) ||
    !isSecureStore(value.secureStore) ||
    !storeMatchesPlatform(value.platform, value.secureStore) ||
    !isOpaqueKey(value.challengeId) ||
    !isOpaqueKey(value.publicKeyThumbprint) ||
    !isExactBoolean(value.platformKeyAttested) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  return {
    id: value.id,
    userId: value.userId,
    deviceId: value.deviceId,
    installationId: value.installationId,
    platform: value.platform,
    secureStore: value.secureStore,
    challengeId: value.challengeId,
    publicKeyThumbprint: value.publicKeyThumbprint,
    platformKeyAttested: value.platformKeyAttested,
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseEnrollment(value: unknown): BiometricEnrollment | null {
  if (
    !isRecord(value) ||
    !isCanonicalIdentifier(value.id) ||
    !isPositiveInteger(value.version) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isPlatform(value.platform) ||
    !isSecureStore(value.secureStore) ||
    !storeMatchesPlatform(value.platform, value.secureStore) ||
    !isOpaqueKey(value.credentialHandle) ||
    !isOpaqueKey(value.publicKeyThumbprint) ||
    !isCanonicalIdentifier(value.biometricSetVersion) ||
    !["ACTIVE", "REVOKED"].includes(value.status as string) ||
    !isExactBoolean(value.backupExcluded) ||
    !isNonNegativeInteger(value.failedAttempts) ||
    (value.failedAttempts as number) > MAX_BIOMETRIC_FAILED_ATTEMPTS
  ) {
    return null;
  }

  return {
    id: value.id,
    version: value.version,
    userId: value.userId,
    deviceId: value.deviceId,
    installationId: value.installationId,
    platform: value.platform,
    secureStore: value.secureStore,
    credentialHandle: value.credentialHandle,
    publicKeyThumbprint: value.publicKeyThumbprint,
    biometricSetVersion: value.biometricSetVersion,
    status: value.status as BiometricEnrollment["status"],
    backupExcluded: value.backupExcluded,
    failedAttempts: value.failedAttempts,
  };
}

export function decideBiometricEnrollment({
  currentUserId,
  session: rawSession,
  credential: rawCredential,
  device: rawDevice,
  authorization: rawAuthorization,
  existingEnrollment: rawExistingEnrollment,
  now = new Date(),
}: {
  currentUserId: string;
  session: BiometricSessionEvidence;
  credential: BiometricCredentialEvidence;
  device: BiometricDeviceEvidence;
  authorization: BiometricEnrollmentAuthorization;
  existingEnrollment?: BiometricEnrollment | null;
  now?: Date;
}): BiometricEnrollmentDecision {
  const session = parseSession(rawSession);
  const credential = parseCredential(rawCredential);
  const device = parseDevice(rawDevice);
  const authorization = parseEnrollmentAuthorization(rawAuthorization);
  const existingEnrollment =
    rawExistingEnrollment === null || rawExistingEnrollment === undefined
      ? null
      : parseEnrollment(rawExistingEnrollment);

  if (
    !isCanonicalIdentifier(currentUserId) ||
    !isValidDate(now) ||
    !session ||
    !credential ||
    !device ||
    !authorization ||
    (rawExistingEnrollment !== null &&
      rawExistingEnrollment !== undefined &&
      !existingEnrollment) ||
    session.userId !== currentUserId ||
    session.verified !== true ||
    session.expiresAt.getTime() <= now.getTime() ||
    device.userId !== currentUserId
  ) {
    return { status: "unavailable" };
  }

  if (
    credential.userId !== currentUserId ||
    credential.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: credential.verifiedAt,
      expiresAt: credential.expiresAt,
      now,
    })
  ) {
    return { status: "credential-confirmation-required" };
  }

  if (
    device.secureStorageAvailable !== true ||
    device.biometricAvailable !== true ||
    device.appAttested !== true
  ) {
    return { status: "unavailable" };
  }

  if (
    device.devicePasscodeSet !== true ||
    device.backupExcluded !== true ||
    (device.hardwareBackedAvailable === true &&
      (device.hardwareBacked !== true ||
        !isHardwareStore(device.secureStore))) ||
    (device.hardwareBacked === true && !isHardwareStore(device.secureStore))
  ) {
    return { status: "insecure-device" };
  }

  if (
    authorization.userId !== currentUserId ||
    authorization.deviceId !== device.deviceId ||
    authorization.installationId !== device.installationId ||
    authorization.platform !== device.platform ||
    authorization.secureStore !== device.secureStore ||
    authorization.platformKeyAttested !== true ||
    authorization.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: authorization.issuedAt,
      expiresAt: authorization.expiresAt,
      now,
    })
  ) {
    return { status: "authorization-required" };
  }

  if (existingEnrollment?.status === "ACTIVE") {
    if (
      existingEnrollment.userId !== currentUserId ||
      existingEnrollment.deviceId !== device.deviceId
    ) {
      return { status: "wipe-required", reason: "identity-mismatch" };
    }

    if (existingEnrollment.installationId !== device.installationId) {
      return { status: "wipe-required", reason: "installation-mismatch" };
    }

    return { status: "already-enrolled" };
  }

  return {
    status: "enrollment-allowed",
    plan: {
      userId: currentUserId,
      deviceId: device.deviceId,
      installationId: device.installationId,
      platform: device.platform,
      secureStore: device.secureStore,
      biometricSetVersion: device.biometricSetVersion,
      authorizationId: authorization.id,
      challengeId: authorization.challengeId,
      publicKeyThumbprint: authorization.publicKeyThumbprint,
      credentialEvidenceId: credential.id,
      consumeAuthorization: true,
      consumeCredentialEvidence: true,
      backupExcluded: true,
      expectedEnrollmentAbsent: true,
    },
  };
}

function parsePlatformAuthentication(
  value: unknown,
): BiometricPlatformAuthenticationEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isCanonicalIdentifier(value.enrollmentId) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isPlatform(value.platform) ||
    !isOpaqueKey(value.credentialHandle) ||
    !isOpaqueKey(value.publicKeyThumbprint) ||
    !isOpaqueKey(value.challengeId) ||
    !isCanonicalIdentifier(value.biometricSetVersion) ||
    !["SUCCESS", "FAILED", "CANCELLED", "LOCKED_OUT"].includes(
      value.result as string,
    ) ||
    !isExactBoolean(value.signedChallengeVerified) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  return {
    id: value.id,
    enrollmentId: value.enrollmentId,
    userId: value.userId,
    deviceId: value.deviceId,
    installationId: value.installationId,
    platform: value.platform,
    credentialHandle: value.credentialHandle,
    publicKeyThumbprint: value.publicKeyThumbprint,
    challengeId: value.challengeId,
    biometricSetVersion: value.biometricSetVersion,
    result: value.result as BiometricPlatformAuthenticationEvidence["result"],
    signedChallengeVerified: value.signedChallengeVerified,
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

function parseServerAuthorization(
  value: unknown,
): BiometricServerAuthorizationEvidence | null {
  if (
    !isRecord(value) ||
    !isOpaqueKey(value.id) ||
    !isOpaqueKey(value.sessionId) ||
    !isCanonicalIdentifier(value.enrollmentId) ||
    !isCanonicalIdentifier(value.userId) ||
    !isCanonicalIdentifier(value.deviceId) ||
    !isCanonicalIdentifier(value.installationId) ||
    !isOpaqueKey(value.challengeId) ||
    !["ACTIVE", "EXPIRED", "REVOKED", "UNAVAILABLE"].includes(
      value.state as string,
    ) ||
    !isExactBoolean(value.refreshAccepted) ||
    !isValidDate(value.issuedAt) ||
    !isValidDate(value.expiresAt) ||
    !isExactBoolean(value.consumed)
  ) {
    return null;
  }

  return {
    id: value.id,
    sessionId: value.sessionId,
    enrollmentId: value.enrollmentId,
    userId: value.userId,
    deviceId: value.deviceId,
    installationId: value.installationId,
    challengeId: value.challengeId,
    state: value.state as BiometricServerAuthorizationEvidence["state"],
    refreshAccepted: value.refreshAccepted,
    issuedAt: value.issuedAt,
    expiresAt: value.expiresAt,
    consumed: value.consumed,
  };
}

export function decideBiometricReentry({
  enrollment: rawEnrollment,
  currentUserId,
  device: rawDevice,
  platformAuthentication: rawPlatformAuthentication,
  serverAuthorization: rawServerAuthorization,
  now = new Date(),
}: {
  enrollment: BiometricEnrollment;
  currentUserId: string;
  device: BiometricDeviceEvidence;
  platformAuthentication: BiometricPlatformAuthenticationEvidence;
  serverAuthorization: BiometricServerAuthorizationEvidence;
  now?: Date;
}): BiometricReentryDecision {
  const enrollment = parseEnrollment(rawEnrollment);
  const device = parseDevice(rawDevice);
  const platformAuthentication = parsePlatformAuthentication(
    rawPlatformAuthentication,
  );
  const serverAuthorization = parseServerAuthorization(rawServerAuthorization);

  if (
    !enrollment ||
    !device ||
    !platformAuthentication ||
    !serverAuthorization ||
    !isCanonicalIdentifier(currentUserId) ||
    !isValidDate(now) ||
    enrollment.status !== "ACTIVE" ||
    enrollment.backupExcluded !== true
  ) {
    return { status: "unavailable" };
  }

  if (
    enrollment.userId !== currentUserId ||
    device.userId !== currentUserId ||
    enrollment.deviceId !== device.deviceId
  ) {
    return { status: "wipe-required", reason: "identity-mismatch" };
  }

  if (enrollment.installationId !== device.installationId) {
    return { status: "wipe-required", reason: "installation-mismatch" };
  }

  if (
    enrollment.platform !== device.platform ||
    enrollment.secureStore !== device.secureStore ||
    enrollment.biometricSetVersion !== device.biometricSetVersion ||
    device.secureStorageAvailable !== true ||
    device.biometricAvailable !== true ||
    device.devicePasscodeSet !== true ||
    device.backupExcluded !== true ||
    device.appAttested !== true ||
    (device.hardwareBackedAvailable === true &&
      device.hardwareBacked !== true) ||
    (device.hardwareBacked === true && !isHardwareStore(device.secureStore))
  ) {
    return { status: "wipe-required", reason: "device-state-changed" };
  }

  if (
    platformAuthentication.enrollmentId !== enrollment.id ||
    platformAuthentication.userId !== currentUserId ||
    platformAuthentication.deviceId !== device.deviceId ||
    platformAuthentication.installationId !== device.installationId ||
    platformAuthentication.platform !== device.platform ||
    platformAuthentication.credentialHandle !== enrollment.credentialHandle ||
    platformAuthentication.publicKeyThumbprint !==
      enrollment.publicKeyThumbprint ||
    platformAuthentication.biometricSetVersion !==
      enrollment.biometricSetVersion ||
    platformAuthentication.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: platformAuthentication.issuedAt,
      expiresAt: platformAuthentication.expiresAt,
      now,
    })
  ) {
    return { status: "unavailable" };
  }

  if (platformAuthentication.result === "LOCKED_OUT") {
    return { status: "fallback-sign-in", destroyCredential: false };
  }

  if (
    platformAuthentication.result === "FAILED" &&
    enrollment.failedAttempts + 1 >= MAX_BIOMETRIC_FAILED_ATTEMPTS
  ) {
    return { status: "fallback-sign-in", destroyCredential: false };
  }

  if (platformAuthentication.result !== "SUCCESS") {
    return {
      status: "locked",
      plan: {
        enrollmentId: enrollment.id,
        expectedEnrollmentVersion: enrollment.version,
        incrementFailedAttempts: platformAuthentication.result === "FAILED",
        consumePlatformEvidence: true,
      },
    };
  }

  if (platformAuthentication.signedChallengeVerified !== true) {
    return { status: "unavailable" };
  }

  if (
    serverAuthorization.enrollmentId !== enrollment.id ||
    serverAuthorization.userId !== currentUserId ||
    serverAuthorization.deviceId !== device.deviceId ||
    serverAuthorization.installationId !== device.installationId ||
    serverAuthorization.challengeId !== platformAuthentication.challengeId ||
    serverAuthorization.consumed !== false ||
    !isShortLivedEvidence({
      issuedAt: serverAuthorization.issuedAt,
      expiresAt: serverAuthorization.expiresAt,
      now,
    })
  ) {
    return { status: "unavailable" };
  }

  if (
    serverAuthorization.state === "REVOKED" ||
    serverAuthorization.state === "EXPIRED"
  ) {
    return { status: "fallback-sign-in", destroyCredential: true };
  }

  if (
    serverAuthorization.state !== "ACTIVE" ||
    serverAuthorization.refreshAccepted !== true
  ) {
    return { status: "fallback-sign-in", destroyCredential: false };
  }

  return {
    status: "reentry-allowed",
    plan: {
      enrollmentId: enrollment.id,
      enrollmentVersion: enrollment.version,
      sessionId: serverAuthorization.sessionId,
      credentialHandle: enrollment.credentialHandle,
      platformEvidenceId: platformAuthentication.id,
      serverEvidenceId: serverAuthorization.id,
      challengeId: platformAuthentication.challengeId,
      consumePlatformEvidence: true,
      consumeServerEvidence: true,
      resetFailedAttempts: true,
      requiresServerAuthorization: true,
    },
  };
}

export function decideBiometricLifecycle(
  event: unknown,
): BiometricLifecycleDecision {
  if (
    typeof event !== "string" ||
    !BIOMETRIC_LIFECYCLE_EVENTS.includes(event as BiometricLifecycleEvent)
  ) {
    return { status: "unavailable" };
  }

  if (event === "APP_BACKGROUNDED") {
    return {
      status: "lifecycle-plan",
      plan: {
        lockInterface: true,
        scrubMemory: true,
        destroySecureCredential: false,
        revokeServerSession: false,
        purgeOfflineHouseholdData: false,
        cancelQueuedActions: false,
      },
    };
  }

  return {
    status: "lifecycle-plan",
    plan: {
      lockInterface: true,
      scrubMemory: true,
      destroySecureCredential: true,
      revokeServerSession:
        event === "DEVICE_REPORTED_LOST" ||
        event === "ACCOUNT_DELETED" ||
        event === "SESSION_REVOKED",
      purgeOfflineHouseholdData: true,
      cancelQueuedActions: true,
    },
  };
}

export function isBiometricCredentialEnvelopeSafe(
  value: unknown,
): boolean {
  if (
    !isRecord(value) ||
    !isPlatform(value.platform) ||
    !isSecureStore(value.secureStore) ||
    !storeMatchesPlatform(value.platform, value.secureStore) ||
    !isCanonicalIdentifier(value.boundUserId) ||
    !isCanonicalIdentifier(value.boundDeviceId) ||
    !isCanonicalIdentifier(value.boundInstallationId) ||
    !isOpaqueKey(value.credentialHandle) ||
    !isOpaqueKey(value.publicKeyThumbprint) ||
    !isExactBoolean(value.sealedByPlatformStore) ||
    !isExactBoolean(value.hardwareBacked) ||
    !isExactBoolean(value.backupExcluded) ||
    !isExactBoolean(value.containsPassword) ||
    !isExactBoolean(value.containsRawBiometric) ||
    !isExactBoolean(value.containsBearerToken) ||
    !isExactBoolean(value.containsRefreshToken)
  ) {
    return false;
  }

  return (
    value.sealedByPlatformStore === true &&
    value.backupExcluded === true &&
    value.containsPassword === false &&
    value.containsRawBiometric === false &&
    value.containsBearerToken === false &&
    value.containsRefreshToken === false &&
    (value.hardwareBacked === false || isHardwareStore(value.secureStore))
  );
}
