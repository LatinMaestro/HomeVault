import assert from "node:assert/strict";
import test from "node:test";

import {
  decideBiometricEnrollment,
  decideBiometricLifecycle,
  decideBiometricReentry,
  isBiometricCredentialEnvelopeSafe,
  type BiometricCredentialEvidence,
  type BiometricDeviceEvidence,
  type BiometricEnrollment,
  type BiometricEnrollmentAuthorization,
  type BiometricPlatformAuthenticationEvidence,
  type BiometricServerAuthorizationEvidence,
  type BiometricSessionEvidence,
} from "../src/biometric-native-reentry-policy";

const now = new Date("2026-07-29T06:00:00.000Z");
const sessionId = "c2Vzc2lvbl9iaW9tZXRyaWNfZXhhY3RfMDAx";
const credentialEvidenceId = "Y3JlZGVudGlhbF9iaW9tZXRyaWNfMDAx";
const authorizationId = "YXV0aF9iaW9tZXRyaWNfZXhhY3RfMDAx";
const enrollmentChallenge = "Y2hhbGxlbmdlX2Vucm9sbG1lbnRfMDAx";
const reentryChallenge = "Y2hhbGxlbmdlX3JlZW50cnlfZXhhY3RfMDAx";
const credentialHandle = "Y3JlZGVudGlhbF9oYW5kbGVfZXhhY3RfMDAx";
const publicKeyThumbprint = "cHVibGljX2tleV90aHVtYnByaW50XzAwMQ";
const platformEvidenceId = "cGxhdGZvcm1fYXV0aF9ldmlkZW5jZV8wMDE";
const serverEvidenceId = "c2VydmVyX2F1dGhfZXZpZGVuY2VfMDAx";
const serverSessionId = "c2VydmVyX3Nlc3Npb25fZXhhY3RfMDAx";

const session: BiometricSessionEvidence = {
  id: sessionId,
  userId: "user-1",
  verified: true,
  expiresAt: new Date("2026-07-29T07:00:00.000Z"),
};

const credential: BiometricCredentialEvidence = {
  id: credentialEvidenceId,
  userId: "user-1",
  purpose: "biometric-enrollment",
  verifiedAt: new Date("2026-07-29T05:55:00.000Z"),
  expiresAt: new Date("2026-07-29T06:10:00.000Z"),
  consumed: false,
};

const device: BiometricDeviceEvidence = {
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
  secureStorageAvailable: true,
  biometricAvailable: true,
  devicePasscodeSet: true,
  hardwareBackedAvailable: true,
  hardwareBacked: true,
  biometricSetVersion: "set-1",
  backupExcluded: true,
  appAttested: true,
};

const authorization: BiometricEnrollmentAuthorization = {
  id: authorizationId,
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
  challengeId: enrollmentChallenge,
  publicKeyThumbprint,
  platformKeyAttested: true,
  issuedAt: new Date("2026-07-29T05:55:00.000Z"),
  expiresAt: new Date("2026-07-29T06:10:00.000Z"),
  consumed: false,
};

function enroll(overrides: Record<string, unknown> = {}) {
  return decideBiometricEnrollment({
    currentUserId: "user-1",
    session,
    credential,
    device,
    authorization,
    now,
    ...overrides,
  } as Parameters<typeof decideBiometricEnrollment>[0]);
}

test("allows exact device-bound enrollment and consumes both proofs", () => {
  assert.deepEqual(enroll(), {
    status: "enrollment-allowed",
    plan: {
      userId: "user-1",
      deviceId: "device-1",
      installationId: "install-1",
      platform: "IOS",
      secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
      biometricSetVersion: "set-1",
      authorizationId,
      challengeId: enrollmentChallenge,
      publicKeyThumbprint,
      credentialEvidenceId,
      consumeAuthorization: true,
      consumeCredentialEvidence: true,
      backupExcluded: true,
      expectedEnrollmentAbsent: true,
    },
  });
});

test("session and runtime booleans fail closed", () => {
  assert.deepEqual(
    enroll({ session: { ...session, verified: "true" as unknown as boolean } }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    enroll({ currentUserId: " user-1" }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    enroll({ device: { ...device, appAttested: 1 as unknown as boolean } }),
    { status: "unavailable" },
  );
});

test("credential confirmation is user-bound, short-lived and single-use", () => {
  assert.deepEqual(
    enroll({ credential: { ...credential, userId: "user-2" } }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    enroll({ credential: { ...credential, consumed: true } }),
    { status: "credential-confirmation-required" },
  );
  assert.deepEqual(
    enroll({
      credential: {
        ...credential,
        expiresAt: new Date("2026-07-29T06:11:00.000Z"),
      },
    }),
    { status: "credential-confirmation-required" },
  );
});

test("device security requires passcode, backup exclusion and hardware when available", () => {
  assert.deepEqual(
    enroll({ device: { ...device, devicePasscodeSet: false } }),
    { status: "insecure-device" },
  );
  assert.deepEqual(
    enroll({ device: { ...device, backupExcluded: false } }),
    { status: "insecure-device" },
  );
  assert.deepEqual(
    enroll({
      device: {
        ...device,
        secureStore: "IOS_KEYCHAIN",
        hardwareBacked: false,
      },
    }),
    { status: "insecure-device" },
  );
});

test("approved non-hardware fallback works only when hardware is unavailable", () => {
  const fallbackDevice: BiometricDeviceEvidence = {
    ...device,
    secureStore: "IOS_KEYCHAIN",
    hardwareBackedAvailable: false,
    hardwareBacked: false,
  };
  const fallbackAuthorization: BiometricEnrollmentAuthorization = {
    ...authorization,
    secureStore: "IOS_KEYCHAIN",
  };
  assert.equal(
    enroll({
      device: fallbackDevice,
      authorization: fallbackAuthorization,
    }).status,
    "enrollment-allowed",
  );
});

test("platform-key authorization binds identity, installation, store and challenge", () => {
  for (const changed of [
    { userId: "user-2" },
    { deviceId: "device-2" },
    { installationId: "install-2" },
    { secureStore: "IOS_KEYCHAIN" },
    { consumed: true },
    { platformKeyAttested: false },
  ]) {
    assert.deepEqual(
      enroll({ authorization: { ...authorization, ...changed } }),
      { status: "authorization-required" },
    );
  }
});

test("active enrollment cannot cross identity or installation", () => {
  assert.deepEqual(enroll({ existingEnrollment: enrollment }), {
    status: "already-enrolled",
  });
  assert.deepEqual(
    enroll({
      existingEnrollment: { ...enrollment, userId: "user-2" },
    }),
    { status: "wipe-required", reason: "identity-mismatch" },
  );
  assert.deepEqual(
    enroll({
      existingEnrollment: { ...enrollment, installationId: "install-2" },
    }),
    { status: "wipe-required", reason: "installation-mismatch" },
  );
});

const enrollment: BiometricEnrollment = {
  id: "biometric-1",
  version: 3,
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
  credentialHandle,
  publicKeyThumbprint,
  biometricSetVersion: "set-1",
  status: "ACTIVE",
  backupExcluded: true,
  failedAttempts: 1,
};

const platformAuthentication: BiometricPlatformAuthenticationEvidence = {
  id: platformEvidenceId,
  enrollmentId: "biometric-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  platform: "IOS",
  credentialHandle,
  publicKeyThumbprint,
  challengeId: reentryChallenge,
  biometricSetVersion: "set-1",
  result: "SUCCESS",
  signedChallengeVerified: true,
  issuedAt: new Date("2026-07-29T05:58:00.000Z"),
  expiresAt: new Date("2026-07-29T06:10:00.000Z"),
  consumed: false,
};

const serverAuthorization: BiometricServerAuthorizationEvidence = {
  id: serverEvidenceId,
  sessionId: serverSessionId,
  enrollmentId: "biometric-1",
  userId: "user-1",
  deviceId: "device-1",
  installationId: "install-1",
  challengeId: reentryChallenge,
  state: "ACTIVE",
  refreshAccepted: true,
  issuedAt: new Date("2026-07-29T05:59:00.000Z"),
  expiresAt: new Date("2026-07-29T06:10:00.000Z"),
  consumed: false,
};

function reenter(overrides: Record<string, unknown> = {}) {
  return decideBiometricReentry({
    enrollment,
    currentUserId: "user-1",
    device,
    platformAuthentication,
    serverAuthorization,
    now,
    ...overrides,
  } as Parameters<typeof decideBiometricReentry>[0]);
}

test("re-entry consumes exact platform and server evidence", () => {
  assert.deepEqual(reenter(), {
    status: "reentry-allowed",
    plan: {
      enrollmentId: "biometric-1",
      enrollmentVersion: 3,
      sessionId: serverSessionId,
      credentialHandle,
      platformEvidenceId,
      serverEvidenceId,
      challengeId: reentryChallenge,
      consumePlatformEvidence: true,
      consumeServerEvidence: true,
      resetFailedAttempts: true,
      requiresServerAuthorization: true,
    },
  });
});

test("identity and installation substitutions require secure wipe", () => {
  assert.deepEqual(reenter({ currentUserId: "user-2" }), {
    status: "wipe-required",
    reason: "identity-mismatch",
  });
  assert.deepEqual(
    reenter({ device: { ...device, installationId: "install-2" } }),
    { status: "wipe-required", reason: "installation-mismatch" },
  );
});

test("passcode, biometric set, store and backup changes require secure wipe", () => {
  for (const changed of [
    { devicePasscodeSet: false },
    { biometricSetVersion: "set-2" },
    { backupExcluded: false },
    { secureStore: "IOS_KEYCHAIN", hardwareBacked: false },
  ]) {
    assert.deepEqual(
      reenter({ device: { ...device, ...changed } }),
      { status: "wipe-required", reason: "device-state-changed" },
    );
  }
});

test("platform proof is exact, short-lived, single-use and signed", () => {
  for (const changed of [
    { credentialHandle: `${credentialHandle}_foreign` },
    { publicKeyThumbprint: `${publicKeyThumbprint}_foreign` },
    { consumed: true },
    { signedChallengeVerified: false },
    { expiresAt: new Date("2026-07-29T06:14:00.000Z") },
  ]) {
    assert.deepEqual(
      reenter({
        platformAuthentication: { ...platformAuthentication, ...changed },
      }),
      { status: "unavailable" },
    );
  }
});

test("failed, cancelled and operating-system lockout never unlock content", () => {
  assert.deepEqual(
    reenter({
      platformAuthentication: {
        ...platformAuthentication,
        result: "FAILED",
      },
    }),
    {
      status: "locked",
      plan: {
        enrollmentId: "biometric-1",
        expectedEnrollmentVersion: 3,
        incrementFailedAttempts: true,
        consumePlatformEvidence: true,
      },
    },
  );
  assert.equal(
    reenter({
      platformAuthentication: {
        ...platformAuthentication,
        result: "CANCELLED",
      },
    }).status,
    "locked",
  );
  assert.deepEqual(
    reenter({
      platformAuthentication: {
        ...platformAuthentication,
        result: "LOCKED_OUT",
      },
    }),
    { status: "fallback-sign-in", destroyCredential: false },
  );
});

test("failure cap returns to standard sign-in", () => {
  assert.deepEqual(
    reenter({
      enrollment: { ...enrollment, failedAttempts: 4 },
      platformAuthentication: {
        ...platformAuthentication,
        result: "FAILED",
      },
    }),
    { status: "fallback-sign-in", destroyCredential: false },
  );
});

test("server evidence binds the same challenge, enrollment and installation", () => {
  for (const changed of [
    { challengeId: `${reentryChallenge}_other` },
    { enrollmentId: "biometric-2" },
    { installationId: "install-2" },
    { consumed: true },
    { refreshAccepted: "true" as unknown as boolean },
  ]) {
    assert.deepEqual(
      reenter({
        serverAuthorization: { ...serverAuthorization, ...changed },
      }),
      { status: "unavailable" },
    );
  }
});

test("revoked sessions destroy credentials while outages preserve fallback", () => {
  assert.deepEqual(
    reenter({
      serverAuthorization: {
        ...serverAuthorization,
        state: "REVOKED",
        refreshAccepted: false,
      },
    }),
    { status: "fallback-sign-in", destroyCredential: true },
  );
  assert.deepEqual(
    reenter({
      serverAuthorization: {
        ...serverAuthorization,
        state: "UNAVAILABLE",
        refreshAccepted: false,
      },
    }),
    { status: "fallback-sign-in", destroyCredential: false },
  );
});

test("malformed enrollment and evidence fail closed at runtime", () => {
  assert.deepEqual(
    reenter({
      enrollment: {
        ...enrollment,
        backupExcluded: "true" as unknown as boolean,
      },
    }),
    { status: "unavailable" },
  );
  assert.deepEqual(
    reenter({
      platformAuthentication: "trusted" as unknown,
    }),
    { status: "unavailable" },
  );
});

test("lifecycle cleanup is explicit and unknown events fail closed", () => {
  assert.deepEqual(decideBiometricLifecycle("APP_BACKGROUNDED"), {
    status: "lifecycle-plan",
    plan: {
      lockInterface: true,
      scrubMemory: true,
      destroySecureCredential: false,
      revokeServerSession: false,
      purgeOfflineHouseholdData: false,
      cancelQueuedActions: false,
    },
  });
  assert.equal(
    decideBiometricLifecycle("DEVICE_REPORTED_LOST").status,
    "lifecycle-plan",
  );
  assert.deepEqual(decideBiometricLifecycle("UNKNOWN"), {
    status: "unavailable",
  });
});

test("credential envelopes contain only exact platform-bound non-secrets", () => {
  const safeEnvelope = {
    platform: "IOS",
    secureStore: "IOS_KEYCHAIN_SECURE_ENCLAVE",
    boundUserId: "user-1",
    boundDeviceId: "device-1",
    boundInstallationId: "install-1",
    credentialHandle,
    publicKeyThumbprint,
    sealedByPlatformStore: true,
    hardwareBacked: true,
    backupExcluded: true,
    containsPassword: false,
    containsRawBiometric: false,
    containsBearerToken: false,
    containsRefreshToken: false,
  };
  assert.equal(isBiometricCredentialEnvelopeSafe(safeEnvelope), true);
  assert.equal(
    isBiometricCredentialEnvelopeSafe({
      ...safeEnvelope,
      containsRefreshToken: true,
    }),
    false,
  );
  assert.equal(
    isBiometricCredentialEnvelopeSafe({
      ...safeEnvelope,
      backupExcluded: "true",
    }),
    false,
  );
});
