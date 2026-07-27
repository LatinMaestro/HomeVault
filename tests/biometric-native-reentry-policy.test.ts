import assert from "node:assert/strict";
import test from "node:test";

import {
  decideBiometricEnrollment,
  decideBiometricLifecycle,
  decideBiometricReentry,
  isBiometricCredentialEnvelopeSafe,
  type BiometricEnrollment,
} from "../src/lib/biometric-native-reentry-policy";

const enrollment: BiometricEnrollment = {
  id: "biometric-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
  credentialHandle: "opaque-credential-handle",
  biometricSetVersion: "set-1",
  status: "ACTIVE",
  backupExcluded: true,
};

test("enrolls only after verified session and credential reconfirmation", () => {
  const input = {
    currentUserId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    credentialConfirmed: true,
    platform: "IOS",
    secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
    secureStorageAvailable: true,
    biometricAvailable: true,
    devicePasscodeSet: true,
    biometricSetVersion: "set-1",
  };

  assert.deepEqual(decideBiometricEnrollment(input), {
    status: "enrollment-allowed",
    userId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    platform: "IOS",
    secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
    biometricSetVersion: "set-1",
    backupExcluded: true,
  });
  assert.deepEqual(
    decideBiometricEnrollment({ ...input, credentialConfirmed: false }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    decideBiometricEnrollment({ ...input, devicePasscodeSet: false }),
    { status: "insecure-device" },
  );
});

test("rejects mismatched platform stores and duplicate enrollment", () => {
  const input = {
    currentUserId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    sessionVerified: true,
    credentialConfirmed: true,
    platform: "ANDROID",
    secureStore: "IOS_KEYCHAIN",
    secureStorageAvailable: true,
    biometricAvailable: true,
    devicePasscodeSet: true,
    biometricSetVersion: "set-1",
  };

  assert.deepEqual(decideBiometricEnrollment(input), {
    status: "unavailable",
  });
  assert.deepEqual(
    decideBiometricEnrollment({
      ...input,
      platform: "IOS",
      existingEnrollment: enrollment,
    }),
    { status: "already-enrolled" },
  );
});

test("allows biometric re-entry only with current server authorization", () => {
  assert.deepEqual(
    decideBiometricReentry({
      enrollment,
      currentUserId: "user-1",
      deviceId: "device-1",
      installationId: "install-1",
      platform: "IOS",
      secureStorageAvailable: true,
      devicePasscodeSet: true,
      biometricSetVersion: "set-1",
      biometricResult: "SUCCESS",
      serverSessionState: "ACTIVE",
      refreshAccepted: true,
    }),
    {
      status: "reentry-allowed",
      credentialHandle: "opaque-credential-handle",
      requiresServerAuthorization: true,
    },
  );
});

test("fails closed for identity, device-state and revoked-session changes", () => {
  const input = {
    enrollment,
    currentUserId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    platform: "IOS" as const,
    secureStorageAvailable: true,
    devicePasscodeSet: true,
    biometricSetVersion: "set-1",
    biometricResult: "SUCCESS" as const,
    serverSessionState: "ACTIVE" as const,
    refreshAccepted: true,
  };

  assert.deepEqual(
    decideBiometricReentry({ ...input, currentUserId: "user-2" }),
    { status: "wipe-required", reason: "identity-mismatch" },
  );
  assert.deepEqual(
    decideBiometricReentry({ ...input, biometricSetVersion: "set-2" }),
    { status: "wipe-required", reason: "device-state-changed" },
  );
  assert.deepEqual(
    decideBiometricReentry({
      ...input,
      serverSessionState: "REVOKED",
    }),
    { status: "fallback-sign-in", destroyCredential: true },
  );
});

test("keeps fallback sign-in available after lockout or service failure", () => {
  const input = {
    enrollment,
    currentUserId: "user-1",
    deviceId: "device-1",
    installationId: "install-1",
    platform: "IOS" as const,
    secureStorageAvailable: true,
    devicePasscodeSet: true,
    biometricSetVersion: "set-1",
    biometricResult: "LOCKED_OUT" as const,
    serverSessionState: "ACTIVE" as const,
    refreshAccepted: true,
  };

  assert.deepEqual(decideBiometricReentry(input), {
    status: "fallback-sign-in",
    destroyCredential: false,
  });
  assert.deepEqual(
    decideBiometricReentry({
      ...input,
      biometricResult: "SUCCESS",
      serverSessionState: "UNAVAILABLE",
    }),
    { status: "fallback-sign-in", destroyCredential: false },
  );
});

test("locks on background and destroys credentials for account lifecycle events", () => {
  assert.deepEqual(decideBiometricLifecycle("APP_BACKGROUNDED"), {
    lockInterface: true,
    scrubMemory: true,
    destroySecureCredential: false,
    revokeServerSession: false,
  });
  assert.deepEqual(decideBiometricLifecycle("ACCOUNT_SWITCHED"), {
    lockInterface: true,
    scrubMemory: true,
    destroySecureCredential: true,
    revokeServerSession: false,
  });
  assert.deepEqual(decideBiometricLifecycle("DEVICE_REPORTED_LOST"), {
    lockInterface: true,
    scrubMemory: true,
    destroySecureCredential: true,
    revokeServerSession: true,
  });
});

test("permits only platform-sealed, device-bound, non-secret envelopes", () => {
  const safe = {
    sealedByPlatformStore: true,
    boundUserId: "user-1",
    boundDeviceId: "device-1",
    boundInstallationId: "install-1",
    backupExcluded: true,
    containsPassword: false,
    containsRawBiometric: false,
    containsBearerToken: false,
  };

  assert.equal(isBiometricCredentialEnvelopeSafe(safe), true);
  assert.equal(
    isBiometricCredentialEnvelopeSafe({
      ...safe,
      containsBearerToken: true,
    }),
    false,
  );
  assert.equal(
    isBiometricCredentialEnvelopeSafe({
      ...safe,
      containsRawBiometric: true,
    }),
    false,
  );
});
